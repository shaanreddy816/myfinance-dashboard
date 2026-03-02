-- ============================================================================
-- BANK CONNECTIVITY MIGRATION
-- Setu Account Aggregator (India) + Plaid (USA)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ─── 1. LINKED ACCOUNTS (unified table for both AA and Plaid) ───────────────

CREATE TABLE IF NOT EXISTS linked_accounts (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       TEXT NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('setu_aa', 'plaid', 'manual')),
  account_ref   TEXT NOT NULL,
  account_data  JSONB DEFAULT '{}',
  balance       NUMERIC(15,2) DEFAULT 0,
  currency      TEXT DEFAULT 'INR',
  institution_name TEXT,
  last_refreshed TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source, account_ref)
);

ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own linked accounts"
  ON linked_accounts FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Service role full access on linked_accounts"
  ON linked_accounts FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_linked_accounts_user ON linked_accounts(user_id);
CREATE INDEX idx_linked_accounts_source ON linked_accounts(source);


-- ─── 2. AA CONSENTS (may already exist — use IF NOT EXISTS) ─────────────────

CREATE TABLE IF NOT EXISTS aa_consents (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         TEXT NOT NULL,
  consent_id      TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'PENDING',
  consent_detail  JSONB DEFAULT '{}',
  consent_artefact JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE aa_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AA consents"
  ON aa_consents FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Service role full access on aa_consents"
  ON aa_consents FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_aa_consents_user ON aa_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_aa_consents_status ON aa_consents(status);


-- ─── 3. PLAID ITEMS (stores access tokens per connected bank) ───────────────

CREATE TABLE IF NOT EXISTS plaid_items (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           TEXT NOT NULL,
  item_id           TEXT NOT NULL UNIQUE,
  access_token      TEXT NOT NULL,
  institution_id    TEXT,
  institution_name  TEXT,
  status            TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOGIN_REQUIRED', 'ERROR', 'REMOVED')),
  error             JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;

-- Only service role should access plaid_items (contains access tokens)
CREATE POLICY "Service role full access on plaid_items"
  ON plaid_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_plaid_items_user ON plaid_items(user_id);
CREATE INDEX idx_plaid_items_status ON plaid_items(status);


-- ─── 4. PLAID WEBHOOKS (audit log for Plaid events) ────────────────────────

CREATE TABLE IF NOT EXISTS plaid_webhooks (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id       TEXT,
  webhook_type  TEXT,
  webhook_code  TEXT,
  payload       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plaid_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on plaid_webhooks"
  ON plaid_webhooks FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_plaid_webhooks_item ON plaid_webhooks(item_id);


-- ============================================================================
-- VERIFICATION: Run after migration to confirm
-- ============================================================================
-- SELECT table_name, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND table_name IN ('linked_accounts', 'aa_consents', 'plaid_items', 'plaid_webhooks');
