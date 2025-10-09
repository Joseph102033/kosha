-- Initial Schema for Safe OPS Studio
-- Created: 2025-10-08

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'unsub')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);

-- OPS Documents table
CREATE TABLE IF NOT EXISTS ops_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  incident_date TEXT NOT NULL,
  location TEXT NOT NULL,
  agent_object TEXT,
  hazard_object TEXT,
  incident_type TEXT NOT NULL,
  incident_cause TEXT NOT NULL,
  ops_json TEXT NOT NULL, -- Stored as JSON string
  created_by TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ops_documents_created_at ON ops_documents(created_at);
CREATE INDEX idx_ops_documents_incident_type ON ops_documents(incident_type);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  ops_id TEXT NOT NULL,
  to_email TEXT NOT NULL,
  provider_msg_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'sent', 'failed')),
  sent_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ops_id) REFERENCES ops_documents(id)
);

CREATE INDEX idx_deliveries_ops_id ON deliveries(ops_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_sent_at ON deliveries(sent_at);

-- Law Rules table
CREATE TABLE IF NOT EXISTS law_rules (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  law_title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_law_rules_keyword ON law_rules(keyword);
