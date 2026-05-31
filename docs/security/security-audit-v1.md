# Audit Sécurité V1 — Caméléon Engine

**Date :** 2026-05-31
**Commit de référence :** `66b7aff`
**Méthode :** lecture seule, grep ciblé, inspection fichiers — aucune modification pendant l'audit
**Verdict global :** Sain avec réserves → **Sain** après application CSP

---

## Surface d'attaque réelle

Caméléon Engine est une application **local-first, client-side uniquement**, sans backend, sans authentification, sans base de données distante.

| Vecteur | Réalité |
|---|---|
| Injection de code | Absent — zéro `eval()`, `new Function()`, `document.write()` |
| XSS via localStorage | Absent — données passées par mappers/canonique, jamais brutes |
| XSS via DOM | Absent — `innerHTML` limité à templates statiques ou `escHtml()` |
| CSV injection | Absent — pas d'affichage direct de cellules brutes |
| Exfiltration réseau | Absent — zéro `fetch`/`WebSocket`/`XHR`, SheetJS vendorisé |
| Exposition de secrets | Absent — `.gitignore` couvre `imports/`, `Binance_*`, `*_export.csv` |
| RCE via fichier importé | Absent — FileReader API + parsing texte, pas de déserialisation unsafe |

---

## Risques identifiés

### Critique — résolu

| ID | Risque | Fichier | Résolution |
|---|---|---|---|
| C1 | Absence de CSP | `src/index.html` | ✅ CSP minimale appliquée et validée terrain (2026-05-31) |

### Points moyens — non bloquants, ouverts

| ID | Aspect | Fichier | Recommandation |
|---|---|---|---|
| M1 | SheetJS version non identifiable | `vendor/xlsx.full.min.js` | Ajouter `VENDOR_VERSIONS.md` |
| M2 | Pas de détection CSV injection formulas | `parser.js` | Hypothétique — surveiller si affichage brut de cellules |
| M3 | Quota localStorage sans pre-write check | `storage.js:204-207` | Vérifier avant `setItem()` si near 5 MB |
| M4 | Code migration legacy | `storage.js:217-270` | Non-risque actif — retirable après 3 releases |

### `innerHTML` — état documenté

37+ appels dans `render.js` et `behavior-view.js`. Tous avec templates statiques ou `escHtml()`. Aucune injection de données utilisateur brutes. Risque actuel : nul. À surveiller à chaque PR touchant ces zones.

---

## Points déjà protégés

- **Local-first réel** — FileReader API + parsing JS in-memory, aucun blob persisté
- **Zéro réseau** — fetch/xhr/ws = 0 dans tout le code applicatif
- **Zéro telemetry** — pas de GA, Mixpanel, Sentry, aucun tiers
- **`.gitignore` exhaustif** — patterns `imports/*`, `Binance_*`, `*_export.csv` couverts
- **PII supprimées** — `orderId → null` avant toute persistance (`anonymizer.js:37-38`), `User_ID` jamais importé
- **Stockage isolé** — namespaces `CE_` et `cameleon.behavior.v1.*` distincts, caps durs
- **Aucune clé hardcodée** — zéro API key, token, credential dans le code
- **`target="_blank"` sécurisé** — `rel="noopener noreferrer"` sur tous les liens externes (`index.html:87,966`)

---

## Conformité privacy-local-first-imports.md

**Verdict : CONFORME**

| Règle | Implémentation | Preuve |
|---|---|---|
| Aucun fichier brut ne survit | FileReader synchrone, aucun Blob persisté | `uploader.js:210-276` |
| Suppression PII avant normalisation | `orderId → null` | `anonymizer.js:37-38` |
| Aucune donnée ne quitte le navigateur | Grep fetch/XHR/ws = 0, SheetJS local | `src/js/vendor/` |
| Stockage minimal structuré | Cap sessions 20, backups 50, journal 50 | `session-repo.js:7`, `storage.js:154` |
| RGPD by design | `clearAll()` via UI, aucune copie distante | `render.js:2259-2279` |

---

## CSP appliquée

**Placement :** `src/index.html` ligne 6 — après `<meta name="viewport">`, avant `<title>`.

### Analyse d'impact (conduite avant application)

| Directive | Compatibilité | Base de vérification |
|---|---|---|
| `script-src 'self'` | ✅ Tous scripts depuis 'self' — SheetJS chargé dynamiquement via `uploader.js:161-162`, URL résolue = 'self' | Grep + lecture uploader.js |
| `style-src 'self' 'unsafe-inline'` | ✅ CSS externes + 16 attributs `style=` HTML + 56 `element.style.*` JS couverts | Grep + lecture index.html |
| `img-src 'self' data:` | ✅ Toutes images depuis `assets/images/` + favicon `data:,` | Grep render.js + behavior-matrix.js |
| `media-src 'self'` | ✅ Sources vidéo actuellement vides (MD-01) — couvert quand ajoutées | Lecture index.html |
| `font-src 'self' data:` | ✅ Aucune font externe — CSS local uniquement | Grep |
| `object-src 'none'` | ✅ Zéro `<object>`, `<embed>`, `<applet>` | Lecture index.html |

**Angle mort documenté (futur) :** PDF.js utilise des workers `blob:`. Lors du branchement effectif, ajouter `worker-src blob: 'self'` et `img-src ... blob:` à la CSP.

---

## Validation terrain

**Date :** 2026-05-31 · **Testeur :** Antonio Lisci

| Test | Résultat |
|---|---|
| Chargement interface | ✅ Normal |
| Console DevTools — erreurs CSP | ✅ Aucune |
| Images / logo | ✅ Chargés |
| Import CSV | ✅ Fonctionnel |
| Import wallet (XLSX) | ✅ Fonctionnel |
| Module comportemental | ✅ Fonctionnel |
| Assets bloqués | ✅ Aucun |
| Modules ES bloqués | ✅ Aucun |

---

## Décision finale

**Caméléon Engine est sûr pour continuer le développement.**

La seule réserve bloquante (absence de CSP) est résolue. Les points moyens M1→M4 sont documentés et non urgents. L'architecture local-first, l'anonymisation systématique et la conformité privacy garantissent une posture défensive solide pour un outil à usage local.

### Prochaines actions (non urgentes, à ouvrir sur signal)

| Action | Condition d'ouverture |
|---|---|
| `VENDOR_VERSIONS.md` — documenter SheetJS | Prochain chantier vendor |
| Pre-write check quota localStorage | Signal terrain : usage intensif multi-sessions |
| `worker-src blob: 'self'` dans CSP | Branchement effectif de PDF.js |
| Linter `eslint-plugin-no-unsanitized` | Si adoption outillage JS formel |

---

*Audit conduit en lecture seule. Seule modification issue de cet audit : ajout CSP `src/index.html`.*
