CREATE TABLE IF NOT EXISTS knowledge_jobs (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  paper_id TEXT NOT NULL,
  review_revision TEXT NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'validated', 'published', 'awaiting_configuration', 'failed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  finished_at TEXT,
  selected_concept_ids TEXT NOT NULL DEFAULT '[]',
  terms_seen INTEGER NOT NULL DEFAULT 0,
  concepts_created INTEGER NOT NULL DEFAULT 0,
  model_calls INTEGER NOT NULL DEFAULT 0,
  estimated_input_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_output_tokens INTEGER NOT NULL DEFAULT 0,
  actual_input_tokens INTEGER,
  actual_output_tokens INTEGER,
  cached_input_tokens INTEGER,
  model_id TEXT,
  estimated_cost_usd REAL,
  actual_cost_usd REAL,
  public_message TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_knowledge_jobs_created_at ON knowledge_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_jobs_status ON knowledge_jobs(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_concepts (
  canonical_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL,
  article_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_concepts_status ON knowledge_concepts(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS paper_concepts (
  paper_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  evidence TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (paper_id, concept_id),
  FOREIGN KEY (concept_id) REFERENCES knowledge_concepts(canonical_id)
);

CREATE INDEX IF NOT EXISTS idx_paper_concepts_concept_id ON paper_concepts(concept_id);

-- Every reviewed term is indexed and linked before any optional AI generation.
CREATE TABLE IF NOT EXISTS knowledge_term_index (
  canonical_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  canonical_name_en TEXT NOT NULL,
  canonical_name_ko TEXT NOT NULL,
  aliases_json TEXT NOT NULL DEFAULT '[]',
  definition_en TEXT NOT NULL,
  definition_ko TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  paper_count INTEGER NOT NULL DEFAULT 1,
  priority_score REAL NOT NULL DEFAULT 0,
  brief_status TEXT NOT NULL DEFAULT 'indexed' CHECK (brief_status IN ('indexed', 'queued', 'processing', 'published', 'awaiting_configuration', 'failed'))
);

CREATE TABLE IF NOT EXISTS paper_term_index (
  paper_id TEXT NOT NULL,
  term_id TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  definition_ko TEXT NOT NULL,
  context_en TEXT NOT NULL,
  context_ko TEXT NOT NULL,
  priority_score REAL NOT NULL DEFAULT 0,
  source_urls_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  PRIMARY KEY (paper_id, term_id),
  FOREIGN KEY (term_id) REFERENCES knowledge_term_index(canonical_id)
);

CREATE INDEX IF NOT EXISTS idx_paper_term_index_term_id ON paper_term_index(term_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_term_priority ON knowledge_term_index(brief_status, priority_score DESC, paper_count DESC);

CREATE TABLE IF NOT EXISTS knowledge_paper_events (
  paper_id TEXT NOT NULL,
  review_revision TEXT NOT NULL,
  event_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (paper_id, review_revision)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_paper_events_latest ON knowledge_paper_events(paper_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_weekly_budget (
  week_start TEXT PRIMARY KEY,
  reserved_briefs INTEGER NOT NULL DEFAULT 0,
  used_briefs INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS knowledge_monthly_budget (
  month_key TEXT PRIMARY KEY,
  reserved_usd REAL NOT NULL DEFAULT 0,
  used_usd REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS knowledge_token_ledger (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  model_id TEXT NOT NULL,
  estimated_input_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_output_tokens INTEGER NOT NULL DEFAULT 0,
  actual_input_tokens INTEGER,
  actual_output_tokens INTEGER,
  cached_input_tokens INTEGER,
  reserved_cost_usd REAL NOT NULL,
  estimated_cost_usd REAL,
  actual_cost_usd REAL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'succeeded', 'failed', 'blocked')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_knowledge_token_ledger_month ON knowledge_token_ledger(created_at DESC);
