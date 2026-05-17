# Caméléon Engine — Memory Index

Index de référence rapide des décisions structurantes, audits et hardening.
Chaque entrée pointe vers la fiche détaillée correspondante.

---

## Sécurité / Hardening / Architecture

- [SECURITY_AUDIT_001 — Audit local-first global](known_limitations/SECURITY_AUDIT_001_local_first_2026-05-17.md) — audit complet src/ : secrets, XSS, CDN, localStorage, CSP ; risque MEDIUM local / HIGH avant déploiement public
- [SECURITY_AUDIT_002 — Audit innerHTML exhaustif](known_limitations/SECURITY_AUDIT_002_innerHTML_2026-05-17.md) — 31 occurrences : 19 risques nuls, 12 faibles, 0 moyens, 0 élevés ; escHtml() validé dans behavior-view.js ; aucune correction urgente ; architecture jugée saine local-first
- [IMPORT_002 — Vendorisation SheetJS CDN → local](imports_excel_csv/IMPORT_002_sheetjs_vendorisation.md) — SheetJS 0.20.3 vendorisé dans src/js/vendor/ ; plus aucun appel CDN externe ; fonctionne hors-ligne ; lazy loading conservé
- **setHtml() supprimé** — helper innerHTML mort (`render.js`) retiré (commit `chore(security): remove unused innerHTML helper`) ; utilisait `repairMojibake()` sans sanitisation ; 0 call site confirmé avant suppression

---

## Imports CSV / Excel

- [IMPORT_002 — SheetJS vendorisé](imports_excel_csv/IMPORT_002_sheetjs_vendorisation.md) — voir section Sécurité ci-dessus

---

## Règles d'utilisation

- Ne pas dupliquer le contenu ici — pointer vers les fiches détaillées
- Mettre à jour l'entrée quand le statut d'une fiche change
- Une ligne par décision structurante
