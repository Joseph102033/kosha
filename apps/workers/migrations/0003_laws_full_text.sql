-- Laws Full-Text Search System
-- Created: 2025-01-15
-- Purpose: Store Korean occupational safety law articles with FTS5 indexing

-- Main laws table
CREATE TABLE IF NOT EXISTS laws (
  id TEXT PRIMARY KEY,
  law_code TEXT NOT NULL,           -- 법령 코드 (예: KOSHA-2024-001)
  law_title TEXT NOT NULL,          -- 법령명 (예: 산업안전보건법)
  article_no TEXT NOT NULL,         -- 조항 번호 (예: 제38조)
  clause_no TEXT,                   -- 항 번호 (예: 제1항, nullable)
  text TEXT NOT NULL,               -- 조문 내용
  effective_date TEXT NOT NULL,     -- 시행일 (YYYY-MM-DD)
  keywords TEXT NOT NULL,           -- 검색 키워드 (comma-separated)
  source_url TEXT NOT NULL,         -- 법령 원문 URL
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for regular queries
CREATE INDEX IF NOT EXISTS idx_laws_law_code ON laws(law_code);
CREATE INDEX IF NOT EXISTS idx_laws_article_no ON laws(article_no);
CREATE INDEX IF NOT EXISTS idx_laws_effective_date ON laws(effective_date);
CREATE INDEX IF NOT EXISTS idx_laws_created_at ON laws(created_at);

-- FTS5 virtual table for full-text search
-- Using unicode61 tokenizer for Korean text support
CREATE VIRTUAL TABLE IF NOT EXISTS laws_fts USING fts5(
  law_title,
  article_no,
  text,
  keywords,
  content='laws',
  content_rowid='rowid',
  tokenize='unicode61'
);

-- Triggers to keep FTS5 table in sync with main table
CREATE TRIGGER IF NOT EXISTS laws_fts_insert AFTER INSERT ON laws BEGIN
  INSERT INTO laws_fts(rowid, law_title, article_no, text, keywords)
  VALUES (new.rowid, new.law_title, new.article_no, new.text, new.keywords);
END;

CREATE TRIGGER IF NOT EXISTS laws_fts_delete AFTER DELETE ON laws BEGIN
  INSERT INTO laws_fts(laws_fts, rowid, law_title, article_no, text, keywords)
  VALUES('delete', old.rowid, old.law_title, old.article_no, old.text, old.keywords);
END;

CREATE TRIGGER IF NOT EXISTS laws_fts_update AFTER UPDATE ON laws BEGIN
  INSERT INTO laws_fts(laws_fts, rowid, law_title, article_no, text, keywords)
  VALUES('delete', old.rowid, old.law_title, old.article_no, old.text, old.keywords);
  INSERT INTO laws_fts(rowid, law_title, article_no, text, keywords)
  VALUES (new.rowid, new.law_title, new.article_no, new.text, new.keywords);
END;

-- View for easier querying with FTS5 ranking
CREATE VIEW IF NOT EXISTS laws_search AS
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
ORDER BY l.created_at DESC;
