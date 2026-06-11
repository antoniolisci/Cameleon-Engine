-- ============================================================
-- 001_core_schema.sql
-- Caméléon Engine · Compte Utilisateur V1 · LOT 1A
-- Schéma minimal opérationnel — Version 2.1 · 2026-06-11
-- Réf : user_account_v1_implementation_plan.md
-- ============================================================

BEGIN;

-- ============================================================
-- TABLE accounts
-- ============================================================
-- accounts.id est fourni à l'INSERT depuis auth.uid().
-- Pas de DEFAULT gen_random_uuid() : l'id doit être identique à l'UID Supabase Auth.
-- Cela permet à la RLS (auth.uid() = id) de fonctionner.
-- local_uuid : identifiant de l'appareil (CE_identity_v1), intentionnellement NOT UNIQUE.
--   Deux comptes créés depuis le même navigateur partagent le même local_uuid.
--   Le bridge compte ↔ local repose sur accounts.id = auth.uid(), pas sur local_uuid.
-- status : modifiable uniquement via service_role (admin). Jamais depuis le client.
-- ============================================================

CREATE TABLE IF NOT EXISTS accounts (
  id           UUID        PRIMARY KEY,
  email        TEXT        NOT NULL UNIQUE,
  local_uuid   TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'free'
                           CHECK (status IN ('free', 'premium', 'disabled')),
  rgpd_consent BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ          DEFAULT now()
);

COMMENT ON COLUMN accounts.id IS
  'Valeur fournie à l''INSERT depuis auth.uid(). Jamais auto-généré.';
COMMENT ON COLUMN accounts.local_uuid IS
  'UUID local de l''appareil (CE_identity_v1). NOT UNIQUE intentionnel : plusieurs comptes peuvent partager le même appareil.';
COMMENT ON COLUMN accounts.status IS
  'Modifié uniquement via service_role (admin). Jamais depuis le client authentifié.';

-- ============================================================
-- TABLE sessions_moteur
-- ============================================================
-- local_session_id : identifiant local de la session (généré côté client).
--   Pour CE_backups_v1 : crypto.randomUUID() généré au moment du logging.
-- UNIQUE(local_session_id, account_id) : contrainte d'idempotence obligatoire.
--   Permet ON CONFLICT DO NOTHING lors du logging et de la migration.
-- schema_version : valeur injectée à l'INSERT (DEFAULT 1 = schéma storage V1).
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions_moteur (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID        NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  local_session_id TEXT        NOT NULL,
  payload          JSONB       NOT NULL,
  schema_version   INTEGER     NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ          DEFAULT now(),
  CONSTRAINT sessions_moteur_idempotence UNIQUE (local_session_id, account_id)
);

-- ============================================================
-- TABLE sessions_comportementales
-- ============================================================
-- Structure identique à sessions_moteur.
-- local_session_id source : session.id depuis CE_behavior_sessions_v1
--   (format bhv_${createdAt}_${random} — stable, utilisable comme garde idempotent).
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions_comportementales (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID        NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  local_session_id TEXT        NOT NULL,
  payload          JSONB       NOT NULL,
  schema_version   INTEGER     NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ          DEFAULT now(),
  CONSTRAINT sessions_comportementales_idempotence UNIQUE (local_session_id, account_id)
);

-- ============================================================
-- INDEX DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_sessions_moteur_account
  ON sessions_moteur (account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_comportementales_account
  ON sessions_comportementales (account_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY est idempotent.
-- service_role dispose du privilège BYPASSRLS dans Supabase :
--   toutes les opérations admin passent sans être bloquées par les policies.
-- ============================================================

ALTER TABLE accounts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_moteur           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_comportementales ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES — accounts
-- ============================================================
-- SELECT : lecture de sa propre ligne (getAccount / _syncAccount SELECT fallback).
-- INSERT : création de sa propre ligne (_syncAccount step 3).
-- Pas de policy UPDATE pour authenticated :
--   status ne doit être modifié que via service_role.
--   ON CONFLICT DO NOTHING dans _syncAccount n'exige pas UPDATE.
-- DROP IF EXISTS avant CREATE : idempotence du script.
-- ============================================================

DROP POLICY IF EXISTS "accounts_select_own" ON accounts;
CREATE POLICY "accounts_select_own" ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "accounts_insert_own" ON accounts;
CREATE POLICY "accounts_insert_own" ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- POLICIES — sessions_moteur
-- ============================================================
-- SELECT : lecture de ses propres sessions (export LOT 6, mémoire longue).
-- INSERT : écriture des sessions (LOT 4B logging, LOT 5 migration).
-- Pas de policy UPDATE ni DELETE pour authenticated :
--   suppressions via cascade accounts (service_role).
-- ============================================================

DROP POLICY IF EXISTS "sessions_moteur_select_own" ON sessions_moteur;
CREATE POLICY "sessions_moteur_select_own" ON sessions_moteur
  FOR SELECT
  TO authenticated
  USING (auth.uid() = account_id);

DROP POLICY IF EXISTS "sessions_moteur_insert_own" ON sessions_moteur;
CREATE POLICY "sessions_moteur_insert_own" ON sessions_moteur
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = account_id);

-- ============================================================
-- POLICIES — sessions_comportementales
-- ============================================================

DROP POLICY IF EXISTS "sessions_comportementales_select_own" ON sessions_comportementales;
CREATE POLICY "sessions_comportementales_select_own" ON sessions_comportementales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = account_id);

DROP POLICY IF EXISTS "sessions_comportementales_insert_own" ON sessions_comportementales;
CREATE POLICY "sessions_comportementales_insert_own" ON sessions_comportementales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = account_id);

COMMIT;
