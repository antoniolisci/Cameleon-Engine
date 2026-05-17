# Caméléon Engine — Memory Index

Index de référence rapide des décisions structurantes, audits et hardening.
Chaque entrée pointe vers la fiche détaillée correspondante.

---

## Sécurité / Hardening / Architecture

- [SECURITY_AUDIT_001 — Audit local-first global](known_limitations/SECURITY_AUDIT_001_local_first_2026-05-17.md) — audit complet src/ : secrets, XSS, CDN, localStorage, CSP ; risque MEDIUM local / HIGH avant déploiement public
- [SECURITY_AUDIT_002 — Audit innerHTML exhaustif](known_limitations/SECURITY_AUDIT_002_innerHTML_2026-05-17.md) — 31 occurrences : 19 risques nuls, 12 faibles, 0 moyens, 0 élevés ; escHtml() validé dans behavior-view.js ; aucune correction urgente ; architecture jugée saine local-first
- [IMPORT_002 — Vendorisation SheetJS CDN → local](imports_excel_csv/IMPORT_002_sheetjs_vendorisation.md) — SheetJS 0.20.3 vendorisé dans src/js/vendor/ ; plus aucun appel CDN externe ; fonctionne hors-ligne ; lazy loading conservé
- **setHtml() supprimé** — helper innerHTML mort (`render.js`) retiré (commit `chore(security): remove unused innerHTML helper`) ; utilisait `repairMojibake()` sans sanitisation ; 0 call site confirmé avant suppression
- [SECURITY_ROADMAP — Pre-public release](known_limitations/SECURITY_ROADMAP_PRE_PUBLIC_RELEASE.md) — roadmap complète : CSP, validation imports, debug panel, localStorage, vendor policy, Git secrets, philosophie sécurité

---

## Debug / Qualité code

- [DEBUG_SURFACE_AUDIT_001 — Audit traces dev](known_limitations/DEBUG_SURFACE_AUDIT_001.md) — 49 occurrences auditées : 18 supprimées, 13 NEED REVIEW, 18 KEEP ; commit `91ef7e6`
- **Suppressions effectuées (commit `91ef7e6`)** — 74 lignes retirées dans 5 fichiers : hash commit exposé (uploader.js), blocs console.group IMPORT DEBUG, dumps financiers bruts (binance_order/spot), DecisionState/ConfidenceScore dumps (render.js), logs `[DEBUG TEMPORAIRE]` (behavior-view.js)
- **NEED REVIEW restants** — console.warn de validation rejection (NR-001 à NR-005) + 3 console.debug sans flag dans uploader/format-detector (NR-011 à NR-013) + warn score<50 intempestif (NR-007) ; voir fiche pour détail

---

## Imports CSV / Excel

- [IMPORT_002 — SheetJS vendorisé](imports_excel_csv/IMPORT_002_sheetjs_vendorisation.md) — voir section Sécurité ci-dessus

---

## Règles d'utilisation

- Ne pas dupliquer le contenu ici — pointer vers les fiches détaillées
- Mettre à jour l'entrée quand le statut d'une fiche change
- Une ligne par décision structurante
