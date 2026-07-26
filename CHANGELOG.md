CREATE TABLE IF NOT EXISTS records (
  record_key TEXT PRIMARY KEY,
  value_json TEXT,
  updated_at TEXT NOT NULL,
  device_id TEXT,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_records_updated_at ON records(updated_at);
CREATE TABLE IF NOT EXISTS photos (
  photo_key TEXT PRIMARY KEY,
  object_key TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  target_key TEXT,
  device_id TEXT,
  created_at TEXT NOT NULL
);
