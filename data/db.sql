CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    pem TEXT NOT NULL,
    type TEXT CHECK(type IN ('pub','priv')) NOT NULL,
    cn TEXT,
    issuer TEXT,
    san TEXT,
    validity TEXT,
    sha256 TEXT,
    description TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cert_sha ON certificates(sha256);
CREATE INDEX IF NOT EXISTS idx_cert_type ON certificates(type);
CREATE INDEX IF NOT EXISTS idx_cert_created ON certificates(created_at);
