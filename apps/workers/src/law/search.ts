/**
 * Law Full-Text Search Module
 * Uses FTS5 for Korean keyword search across law articles
 */

import type { D1Database } from '@cloudflare/workers-types';

export interface LawArticle {
  id: string;
  law_code: string;
  law_title: string;
  article_no: string;
  clause_no: string | null;
  text: string;
  effective_date: string;
  keywords: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

export interface LawSearchParams {
  query?: string;        // Search query (optional, returns all if empty)
  page?: number;         // Page number (1-indexed)
  limit?: number;        // Items per page (default: 20, max: 100)
  law_title?: string;    // Filter by law title
  article_no?: string;   // Filter by article number
}

export interface LawSearchResult {
  laws: LawArticle[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Search laws using FTS5 or regular queries
 */
export async function searchLaws(
  db: D1Database,
  params: LawSearchParams
): Promise<LawSearchResult> {
  const {
    query = '',
    page = 1,
    limit = 20,
    law_title,
    article_no,
  } = params;

  // Validate and sanitize params
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100);
  const offset = (validPage - 1) * validLimit;

  // Build query based on search type
  let sql: string;
  let countSql: string;
  let bindings: any[] = [];

  if (query && query.trim()) {
    // FTS5 search
    const searchQuery = query.trim();

    sql = `
      SELECT
        l.id,
        l.law_code,
        l.law_title,
        l.article_no,
        l.clause_no,
        l.text,
        l.effective_date,
        l.keywords,
        l.source_url,
        l.created_at,
        l.updated_at
      FROM laws l
      INNER JOIN laws_fts ON laws_fts.rowid = l.rowid
      WHERE laws_fts MATCH ?
    `;

    countSql = `
      SELECT COUNT(*) as total
      FROM laws l
      INNER JOIN laws_fts ON laws_fts.rowid = l.rowid
      WHERE laws_fts MATCH ?
    `;

    bindings.push(searchQuery);

    // Add additional filters if provided
    if (law_title) {
      sql += ` AND l.law_title = ?`;
      countSql += ` AND l.law_title = ?`;
      bindings.push(law_title);
    }

    if (article_no) {
      sql += ` AND l.article_no = ?`;
      countSql += ` AND l.article_no = ?`;
      bindings.push(article_no);
    }

    // Order by relevance (FTS5 rank)
    sql += ` ORDER BY rank LIMIT ? OFFSET ?`;

  } else {
    // Regular query (no search term)
    sql = `
      SELECT
        id,
        law_code,
        law_title,
        article_no,
        clause_no,
        text,
        effective_date,
        keywords,
        source_url,
        created_at,
        updated_at
      FROM laws
      WHERE 1=1
    `;

    countSql = `SELECT COUNT(*) as total FROM laws WHERE 1=1`;

    if (law_title) {
      sql += ` AND law_title = ?`;
      countSql += ` AND law_title = ?`;
      bindings.push(law_title);
    }

    if (article_no) {
      sql += ` AND article_no = ?`;
      countSql += ` AND article_no = ?`;
      bindings.push(article_no);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  }

  // Add pagination params
  const queryBindings = [...bindings, validLimit, offset];
  const countBindings = [...bindings];

  try {
    // Execute queries in parallel
    const [resultSet, countResult] = await Promise.all([
      db.prepare(sql).bind(...queryBindings).all(),
      db.prepare(countSql).bind(...countBindings).first<{ total: number }>()
    ]);

    const total = countResult?.total || 0;
    const total_pages = Math.ceil(total / validLimit);

    return {
      laws: (resultSet.results as LawArticle[]) || [],
      total,
      page: validPage,
      limit: validLimit,
      total_pages,
      has_next: validPage < total_pages,
      has_prev: validPage > 1,
    };
  } catch (error) {
    console.error('Law search error:', error);
    throw new Error('Failed to search laws');
  }
}

/**
 * Get a single law article by ID
 */
export async function getLawById(
  db: D1Database,
  id: string
): Promise<LawArticle | null> {
  try {
    const result = await db
      .prepare('SELECT * FROM laws WHERE id = ?')
      .bind(id)
      .first<LawArticle>();

    return result || null;
  } catch (error) {
    console.error('Get law by ID error:', error);
    throw new Error('Failed to get law article');
  }
}

/**
 * Get all unique law titles
 */
export async function getLawTitles(db: D1Database): Promise<string[]> {
  try {
    const result = await db
      .prepare('SELECT DISTINCT law_title FROM laws ORDER BY law_title')
      .all<{ law_title: string }>();

    return result.results?.map(r => r.law_title) || [];
  } catch (error) {
    console.error('Get law titles error:', error);
    throw new Error('Failed to get law titles');
  }
}

/**
 * Get law statistics
 */
export async function getLawStats(db: D1Database): Promise<{
  total_laws: number;
  total_titles: number;
  latest_effective_date: string;
}> {
  try {
    const [totalResult, titlesResult, dateResult] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM laws').first<{ count: number }>(),
      db.prepare('SELECT COUNT(DISTINCT law_title) as count FROM laws').first<{ count: number }>(),
      db.prepare('SELECT MAX(effective_date) as date FROM laws').first<{ date: string }>()
    ]);

    return {
      total_laws: totalResult?.count || 0,
      total_titles: titlesResult?.count || 0,
      latest_effective_date: dateResult?.date || '',
    };
  } catch (error) {
    console.error('Get law stats error:', error);
    throw new Error('Failed to get law statistics');
  }
}
