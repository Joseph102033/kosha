/**
 * Analytics module for OPS generation statistics
 */

import type { Env } from '../index';

export interface AnalyticsData {
  total_ops: number;
  total_subscribers: number;
  ops_by_type: Array<{
    incident_type: string;
    count: number;
  }>;
  recent_ops: Array<{
    id: string;
    title: string;
    incident_type: string;
    created_at: string;
  }>;
  law_ruleset_version: string;
}

/**
 * Get analytics statistics
 */
export async function getAnalytics(env: Env): Promise<AnalyticsData> {
  const db = env.DB;

  // Query total OPS documents
  const totalOpsResult = await db
    .prepare('SELECT COUNT(*) as count FROM ops_documents')
    .first<{ count: number }>();

  // Query total subscribers
  const totalSubscribersResult = await db
    .prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'")
    .first<{ count: number }>();

  // Query OPS by type
  const opsByTypeResult = await db
    .prepare(
      `SELECT incident_type, COUNT(*) as count
       FROM ops_documents
       GROUP BY incident_type
       ORDER BY count DESC`
    )
    .all<{ incident_type: string; count: number }>();

  // Query recent OPS (last 10)
  const recentOpsResult = await db
    .prepare(
      `SELECT id, title, incident_type, created_at
       FROM ops_documents
       ORDER BY created_at DESC
       LIMIT 10`
    )
    .all<{ id: string; title: string; incident_type: string; created_at: string }>();

  // Query law ruleset version (from first record created_at)
  const lawVersionResult = await db
    .prepare('SELECT MIN(created_at) as version FROM law_rules')
    .first<{ version: string | null }>();

  return {
    total_ops: totalOpsResult?.count || 0,
    total_subscribers: totalSubscribersResult?.count || 0,
    ops_by_type: opsByTypeResult.results || [],
    recent_ops: recentOpsResult.results || [],
    law_ruleset_version: lawVersionResult?.version
      ? new Date(lawVersionResult.version).toISOString().split('T')[0]
      : '2025-01-10',
  };
}
