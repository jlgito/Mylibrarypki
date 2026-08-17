CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pub','priv')),
  pem TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  description TEXT,
  tags TEXT,
  is_encrypted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
