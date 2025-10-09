/**
 * Vitest setup file
 * Runs before all tests to initialize test database schema
 */

import { env } from 'cloudflare:test';

// Create database schema before running tests
// Execute statements individually using batch
const statements = [
  // Subscribers table
  `CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'unsub')),
    created_at DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email)`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status)`,

  // OPS documents table
  `CREATE TABLE IF NOT EXISTS ops_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    incident_date TEXT NOT NULL,
    location TEXT NOT NULL,
    agent_object TEXT NOT NULL,
    hazard_object TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    incident_cause TEXT NOT NULL,
    ops_json TEXT NOT NULL,
    created_by TEXT,
    created_at DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_ops_created_at ON ops_documents(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_ops_incident_type ON ops_documents(incident_type)`,

  // Deliveries table
  `CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    ops_id TEXT NOT NULL,
    to_email TEXT NOT NULL,
    provider_msg_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('queued', 'sent', 'failed')),
    sent_at DATETIME,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (ops_id) REFERENCES ops_documents(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_deliveries_ops_id ON deliveries(ops_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status)`,
  `CREATE INDEX IF NOT EXISTS idx_deliveries_sent_at ON deliveries(sent_at DESC)`,

  // Law rules table
  `CREATE TABLE IF NOT EXISTS law_rules (
    id TEXT PRIMARY KEY,
    keyword TEXT NOT NULL,
    law_title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_law_keyword ON law_rules(keyword)`,
];

// Execute all statements
await env.DB.batch(statements.map(sql => env.DB.prepare(sql)));

console.log('✅ Test database schema initialized');
