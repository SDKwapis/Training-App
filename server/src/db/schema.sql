CREATE TABLE IF NOT EXISTS muscle_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  muscle_group_id INTEGER REFERENCES muscle_groups(id),
  seat_config JSONB DEFAULT '{}',
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_id NULL = global template visible to all users
ALTER TABLE routines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS routine_slots (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER REFERENCES routines(id) ON DELETE CASCADE,
  muscle_group_id INTEGER REFERENCES muscle_groups(id),
  slot_order INTEGER NOT NULL,
  sets_target INTEGER DEFAULT 1,
  rep_range_min INTEGER DEFAULT 8,
  rep_range_max INTEGER DEFAULT 12,
  tut_target_seconds INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER REFERENCES routines(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS session_sets (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  routine_slot_id INTEGER REFERENCES routine_slots(id),
  machine_id INTEGER REFERENCES machines(id),
  set_order INTEGER DEFAULT 1,
  weight NUMERIC(6,2),
  reps INTEGER,
  tut_seconds INTEGER,
  seat_settings JSONB DEFAULT '{}',
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  reached_failure BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_sets_machine ON session_sets(machine_id);
CREATE INDEX IF NOT EXISTS idx_session_sets_session ON session_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_routine ON sessions(routine_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_machines_muscle_group ON machines(muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_routine_slots_routine ON routine_slots(routine_id);
CREATE INDEX IF NOT EXISTS idx_routines_user ON routines(user_id);
