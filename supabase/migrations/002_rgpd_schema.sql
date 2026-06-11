-- ============================================================
-- 002_rgpd_schema.sql
-- Caméléon Engine · Compte Utilisateur V1 · LOT 1B
-- Schéma RGPD — Version 2.1 · 2026-06-11
-- Réf : user_account_v1_implementation_plan.md
-- Dépend de : 001_core_schema.sql (FK vers accounts)
-- ============================================================

BEGIN;

-- ============================================================
-- TABLE rgpd_requests
-- ============================================================
-- account_id : ON DELETE SET NULL intentionnel (correction R-04).
--   La demande RGPD persiste comme trace d'audit après suppression du compte.
--   account_id = NULL dans la ligne = compte supprimé, demande conservée.
-- type 'delete' : déclenche delete_user_data() côté admin.
-- type 'export' : déclenche export_user_data() côté admin ou client.
-- processed_at : renseigné par l'admin lors du traitement.
-- ============================================================

CREATE TABLE IF NOT EXISTS rgpd_requests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID        REFERENCES accounts(id) ON DELETE SET NULL,
  type         TEXT        NOT NULL CHECK (type IN ('export', 'delete')),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'processed')),
  created_at   TIMESTAMPTZ          DEFAULT now(),
  processed_at TIMESTAMPTZ
);

COMMENT ON COLUMN rgpd_requests.account_id IS
  'SET NULL à la suppression du compte. La demande est conservée comme trace d''audit.';
-- ============================================================
-- TABLE admin_log
-- ============================================================
-- account_id : pas de FK intentionnel.
--   La ligne d'audit survit à toute suppression de compte.
--   account_id référence l'UUID du compte au moment de l'action,
--   même si ce compte n'existe plus.
-- operator : current_user PostgreSQL — traçabilité de l'opérateur admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  action     TEXT        NOT NULL,
  operator   TEXT        NOT NULL,
  created_at TIMESTAMPTZ          DEFAULT now()
);

COMMENT ON COLUMN admin_log.account_id IS
  'Pas de FK intentionnel : la ligne d''audit survit à la suppression du compte.';
COMMENT ON COLUMN admin_log.operator IS
  'current_user PostgreSQL au moment de l''action admin.';
-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- rgpd_requests : policies pour authenticated (INSERT + SELECT propre ligne).
-- admin_log : RLS activée mais AUCUNE policy pour authenticated.
--   → zéro accès client. service_role (BYPASSRLS) accède librement.
-- ============================================================

ALTER TABLE rgpd_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_log     ENABLE ROW LEVEL SECURITY;
-- ============================================================
-- POLICIES — rgpd_requests
-- ============================================================
-- SELECT : l'utilisateur lit ses propres demandes (suivi du statut).
-- INSERT : l'utilisateur crée ses propres demandes (LOT 6, requestRGPDDeletion).
-- Pas de policy UPDATE ni DELETE pour authenticated :
--   le traitement (processed_at, status) est réservé à service_role.
-- ============================================================

DROP POLICY IF EXISTS "rgpd_requests_select_own" ON rgpd_requests;
CREATE POLICY "rgpd_requests_select_own" ON rgpd_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = account_id);

DROP POLICY IF EXISTS "rgpd_requests_insert_own" ON rgpd_requests;
CREATE POLICY "rgpd_requests_insert_own" ON rgpd_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = account_id);
-- ============================================================
-- POLICIES — admin_log
-- ============================================================
-- Aucune policy pour authenticated.
-- RLS activée + zéro policy = zéro accès pour tout rôle non BYPASSRLS.
-- service_role (BYPASSRLS) accède librement en lecture et écriture.
-- ============================================================
-- (aucune CREATE POLICY ici — intentionnel)
-- ============================================================
-- FUNCTION export_user_data()
-- ============================================================
-- SECURITY INVOKER : s'exécute avec les droits de l'appelant.
--   → RLS s'applique normalement → l'utilisateur ne voit que ses données.
--   → service_role (BYPASSRLS) peut appeler depuis le dashboard SQL.
-- Pas de paramètre p_account_id : auth.uid() est la source d'identité.
--   → impossible d'exporter les données d'un autre utilisateur depuis le client.
-- Retourne JSONB : account + sessions_moteur + sessions_comportementales.
-- COALESCE(..., '[]') : retourne tableau vide si aucune session (jamais null).
-- ============================================================

CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();

  RETURN jsonb_build_object(
    'account', (
      SELECT to_jsonb(a)
      FROM accounts a
      WHERE a.id = v_uid
    ),
    'sessions_moteur', COALESCE(
      (SELECT jsonb_agg(to_jsonb(sm))
       FROM sessions_moteur sm
       WHERE sm.account_id = v_uid),
      '[]'::jsonb
    ),
    'sessions_comportementales', COALESCE(
      (SELECT jsonb_agg(to_jsonb(sc))
       FROM sessions_comportementales sc
       WHERE sc.account_id = v_uid),
      '[]'::jsonb
    ),
    'exported_at', to_jsonb(now())
  );
END;
$$;
-- ============================================================
-- FUNCTION delete_user_data()
-- ============================================================
-- Paramètre p_account_id : UUID du compte à supprimer.
--   Fourni par l'admin (service_role) depuis le dashboard SQL.
-- SECURITY INVOKER : s'exécute avec les droits de l'appelant.
--   → service_role (BYPASSRLS) : contourne RLS sur toutes les tables.
--   → authenticated sans policy DELETE sur accounts : ne peut pas appeler
--     cette fonction de façon efficace (DELETE bloqué par RLS).
-- Séquence :
--   1. INSERT admin_log AVANT la suppression (trace audit, account_id encore valide).
--   2. DELETE accounts — déclenche automatiquement :
--        · ON DELETE CASCADE  → sessions_moteur + sessions_comportementales supprimées.
--        · ON DELETE SET NULL → rgpd_requests.account_id = NULL (trace RGPD conservée).
-- Idempotence : DELETE sur un compte inexistant ne lève pas d'erreur.
-- operator : current_user PostgreSQL — traçabilité de l'opérateur admin.
-- ============================================================

CREATE OR REPLACE FUNCTION delete_user_data(p_account_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Trace audit avant suppression (l'UUID reste valide à cet instant)
  INSERT INTO admin_log (account_id, action, operator)
  VALUES (p_account_id, 'delete_user_data', current_user);

  -- Suppression du compte (cascades FK automatiques)
  DELETE FROM accounts WHERE id = p_account_id;

  -- Pas de RAISE si le compte n'existe pas : idempotent par construction.
END;
$$;

COMMIT;
