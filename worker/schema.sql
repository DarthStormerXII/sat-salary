CREATE TABLE IF NOT EXISTS profiles (
  address TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  org_name TEXT,
  person_name TEXT,
  company_size TEXT,
  industry TEXT,
  job_title TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
