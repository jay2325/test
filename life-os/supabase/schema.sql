-- ============================================================
-- Life OS — Supabase Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE 1: user_profiles (extends auth.users)
-- ============================================================
CREATE TABLE user_profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name              TEXT,
  avatar_url             TEXT,
  tier                   TEXT NOT NULL DEFAULT 'free'
                           CHECK (tier IN ('free', 'pro', 'power')),
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  north_star             TEXT,                 -- 1-sentence life vision
  freedom_number         NUMERIC DEFAULT 0,   -- monthly passive income goal ($)
  current_passive_income NUMERIC DEFAULT 0,
  onboarding_complete    BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE 2: projects
-- (defined before tasks so tasks can FK to it)
-- ============================================================
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  area        TEXT,                    -- e.g. "Business", "Health", "Learning"
  color       TEXT DEFAULT '#7c3aed', -- hex accent for UI
  due_date    DATE,
  goal_id     UUID,                    -- FK to goals (added after goals table)
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- TABLE 3: goals
-- ============================================================
CREATE TABLE goals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  horizon          TEXT NOT NULL DEFAULT '1_year'
                     CHECK (horizon IN ('5_year', '1_year', 'quarterly', 'monthly', 'weekly')),
  status           TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'paused', 'completed', 'dropped')),
  area             TEXT,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  target_date      DATE,
  parent_goal_id   UUID REFERENCES goals(id) ON DELETE SET NULL,
  emoji            TEXT DEFAULT '🎯',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add FK from projects → goals (now that goals exists)
ALTER TABLE projects ADD CONSTRAINT fk_projects_goal
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE 4: tasks
-- ============================================================
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'todo'
                 CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority     TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  energy       TEXT CHECK (energy IN ('low', 'medium', 'high')),
  due_date     DATE,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  tags         TEXT[] DEFAULT '{}',
  is_today     BOOLEAN DEFAULT FALSE,   -- pinned to today's focus
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due    ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_project     ON tasks(project_id);
CREATE INDEX idx_tasks_goal        ON tasks(goal_id);

-- ============================================================
-- TABLE 5: habits
-- ============================================================
CREATE TABLE habits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  frequency      TEXT NOT NULL DEFAULT 'daily'
                   CHECK (frequency IN ('daily', 'weekdays', 'weekly', 'custom')),
  target_days    INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon … 7=Sun
  color          TEXT DEFAULT '#7c3aed',
  icon           TEXT DEFAULT '⭐',
  is_active      BOOLEAN DEFAULT TRUE,
  streak_current INTEGER DEFAULT 0,
  streak_best    INTEGER DEFAULT 0,
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- TABLE 6: habit_logs (daily completions)
-- ============================================================
CREATE TABLE habit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, habit_id, date)
);
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, date);

-- ============================================================
-- TABLE 7: health_logs
-- ============================================================
CREATE TABLE health_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  type       TEXT NOT NULL
               CHECK (type IN ('workout','sleep','mood','weight','nutrition','water','custom')),
  value      NUMERIC,
  unit       TEXT,          -- 'hrs', 'kg', 'lbs', 'ml', 'min', '1-10', etc.
  notes      TEXT,
  metrics    JSONB DEFAULT '{}',   -- flexible extra fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_health_logs_updated_at
  BEFORE UPDATE ON health_logs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_health_logs_user_date ON health_logs(user_id, date);

-- ============================================================
-- TABLE 8: finance_entries
-- ============================================================
CREATE TABLE finance_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  amount       NUMERIC NOT NULL CHECK (amount > 0),
  type         TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category     TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence   TEXT CHECK (recurrence IN ('daily','weekly','monthly','yearly')),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_finance_updated_at
  BEFORE UPDATE ON finance_entries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_finance_user_date ON finance_entries(user_id, date);
CREATE INDEX idx_finance_user_type ON finance_entries(user_id, type);

-- ============================================================
-- TABLE 9: books
-- ============================================================
CREATE TABLE books (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  author       TEXT,
  status       TEXT NOT NULL DEFAULT 'want_to_read'
                 CHECK (status IN ('want_to_read','reading','completed','abandoned')),
  genre        TEXT,
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  total_pages  INTEGER,
  pages_read   INTEGER DEFAULT 0,
  notes        TEXT,
  key_ideas    TEXT,
  cover_url    TEXT,
  started_at   DATE,
  finished_at  DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- TABLE 10: knowledge_items
-- ============================================================
CREATE TABLE knowledge_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  type         TEXT NOT NULL DEFAULT 'note'
                 CHECK (type IN ('note','article','idea','resource','quote','reference')),
  tags         TEXT[] DEFAULT '{}',
  source_url   TEXT,
  is_processed BOOLEAN DEFAULT FALSE,  -- unprocessed = "inbox"
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_knowledge_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_knowledge_user_processed ON knowledge_items(user_id, is_processed);

-- ============================================================
-- TABLE 11: bucket_list
-- ============================================================
CREATE TABLE bucket_list (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  status         TEXT NOT NULL DEFAULT 'dream'
                   CHECK (status IN ('dream','planned','in_progress','completed')),
  target_date    DATE,
  location       TEXT,
  cost_estimate  NUMERIC,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_bucket_updated_at
  BEFORE UPDATE ON bucket_list
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- TABLE 12: recipes
-- ============================================================
CREATE TABLE recipes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT,
  prep_time    INTEGER,  -- minutes
  cook_time    INTEGER,  -- minutes
  servings     INTEGER,
  ingredients  JSONB DEFAULT '[]',
  instructions TEXT,
  tags         TEXT[] DEFAULT '{}',
  is_favorite  BOOLEAN DEFAULT FALSE,
  is_quick     BOOLEAN DEFAULT FALSE,   -- "quick meal" flag
  image_url    TEXT,
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- All tables: users can only read/write their own rows
-- ============================================================

ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits          ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books           ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list     ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes         ENABLE ROW LEVEL SECURITY;

-- Macro to generate standard "own row" policies
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'projects','goals','tasks','habits','habit_logs',
    'health_logs','finance_entries','books',
    'knowledge_items','bucket_list','recipes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('
      CREATE POLICY "Users manage own %1$s"
        ON %1$s FOR ALL
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    ', tbl);
  END LOOP;
END $$;

-- user_profiles uses id = auth.uid() (not user_id)
CREATE POLICY "Users manage own profile"
  ON user_profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Today's habit completion summary per user
CREATE OR REPLACE VIEW v_habits_today AS
SELECT
  h.user_id,
  h.id AS habit_id,
  h.name,
  h.icon,
  h.color,
  COALESCE(hl.completed, FALSE) AS completed
FROM habits h
LEFT JOIN habit_logs hl
  ON hl.habit_id = h.id
  AND hl.date = CURRENT_DATE
  AND hl.user_id = h.user_id
WHERE h.is_active = TRUE;

-- Monthly finance summary
CREATE OR REPLACE VIEW v_finance_monthly AS
SELECT
  user_id,
  DATE_TRUNC('month', date) AS month,
  type,
  SUM(amount) AS total
FROM finance_entries
GROUP BY user_id, DATE_TRUNC('month', date), type;

-- Task counts by status
CREATE OR REPLACE VIEW v_task_status_counts AS
SELECT
  user_id,
  status,
  COUNT(*) AS count
FROM tasks
GROUP BY user_id, status;
