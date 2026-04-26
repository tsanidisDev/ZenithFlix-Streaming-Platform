-- THIS IS THE FIXES FOR THE ORIGINAL MIGRATION SCRIPT GIVEN IN THE ASSIGNMENT. IT WON'T BE USED IN THE APP.
-- Bug 1 fix: 'cast' is a reserved keyword in PostgreSQL, renamed to cast_members
-- Bug 2 fix: added content_type column so the index below has a valid column to reference
-- Bug 3 fix: added users table before watch_history so the foreign key can resolve
-- Bug 4 fix: cascading failure from bug 1 - once the table was created correctly the trigger worked fine

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE streaming_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR,
  video_url VARCHAR,
  content_type VARCHAR CHECK (content_type IN ('movie', 'series')),
  year SMALLINT CHECK (year > 1800 AND year < 2100),
  genre TEXT[],
  rating DECIMAL(3,1) CHECK (rating BETWEEN 0 AND 10),
  duration INTEGER,
  cast_members TEXT[],
  watch_progress DECIMAL(5,2) DEFAULT 0 CHECK (watch_progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_type ON streaming_content(content_type);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON streaming_content
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE watch_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER REFERENCES streaming_content(id) ON DELETE CASCADE,
  progress DECIMAL(5,2),
  watched_at TIMESTAMPTZ DEFAULT NOW()
);
