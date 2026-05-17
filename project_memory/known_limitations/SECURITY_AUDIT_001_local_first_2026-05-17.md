# SECURITY_AUDIT_001 — Audit sécurité local-first

**Statut :** À traiter
**Date :** 2026-05-17
**Périmètre :** Mode local-first · Version courante

---

# AUDIT SÉCURITÉ — CAMÉLÉON ENGINE
### Phase Local-First · Version 2026-05-17

---

## 1. Niveau de risque global

**MOYEN** — en mode local-first actuel.
**ÉLEVÉ** — avant toute mise en ligne publique sans correctifs.

---

## 2. Résumé exécutif

Le projet est sain dans sa conception : pas de backend, pas d'API keys, pas de dépendances npm en production, localStorage bien structuré, usage majoritaire de `textContent`. La posture de sécurité de base est correcte.

Deux problèmes significatifs sont identifiés :

1. **Des données financières réelles et un User ID Binance sont publiquement exposés sur GitHub** via les fichiers `excel_tests/`.
2. **SheetJS est chargé depuis un CDN externe sans contrôle d'intégrité (SRI).**

Le reste des observations relève de risques faibles ou de points à traiter avant déploiement public.

---

## 3. Fichiers concernés

| Fichier | Sujet |
|---|---|
| `excel_tests/*.csv` (6 fichiers) | User ID Binance + données de trading réelles |
| `excel_tests/anciens_fichiers_excel/*.csv` | Idem |
| `src/js/behavior/import/uploader.js:166` | CDN SheetJS sans SRI |
| `src/.claude/settings.local.json` | Fichier Claude Code committé |
| `src/js/render.js:420` | `setHtml()` innerHTML sans sanitisation (dead code) |
| `src/js/render.js:2947` | innerHTML avec données venant de localStorage |
| `src/index.html:26,55,255` | Références vidéo vers fichiers supprimés (BUG_001) |
| `.gitignore` | Incomplet — `excel_tests/` non ignoré |

---

## 4. Risques confirmés

### CRITIQUE — Données personnelles et financières sur GitHub public

**Fichiers :** 6 CSV dans `excel_tests/` + `anciens_fichiers_excel/`

```
User_ID trouvé : 478192933 (Binance)
Fichiers concernés :
- excel_tests/1fe5f83a-*.csv
- excel_tests/32d12074-*.csv
- excel_tests/4e2a0526-*.csv
- excel_tests/53445a5e-*.csv
- excel_tests/9e3b171e-*.csv
- anciens_fichiers_excel/binance_wallet_spot_earn_1month.csv
```

Ces fichiers contiennent :
- Un identifiant Binance réel (`User_ID: 478192933`)
- Des montants de trades réels (paires, prix, quantités, frais)
- Des historiques de dépôts, retraits, earn sur plusieurs mois

Ils sont **committés et publiquement accessibles sur `https://github.com/antoniolisci/Cameleon-Engine`**.

Git conserve l'historique complet — même si ces fichiers sont supprimés dans un nouveau commit, ils resteront accessibles via `git log` sur le repo public tant qu'un `git filter-repo` ou une réécriture d'historique n'est pas effectuée.

---

### IMPORTANT — SheetJS chargé depuis CDN sans SRI

**Fichier :** `src/js/behavior/import/uploader.js:166`

```javascript
script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
```

- Script externe chargé dynamiquement à chaque import XLSX
- Aucun attribut `integrity` (Subresource Integrity)
- Si `cdn.sheetjs.com` est compromis ou si le fichier est modifié à la source, le code malveillant s'exécute avec accès complet au DOM et au localStorage de l'application
- La version est bien fixée (`0.20.3`) — ce n'est pas un `@latest` — mais sans SRI, la version peut être remplacée côté CDN sans alerte
- En mode local-first uniquement (pas de HTTPS), le risque est limité à une attaque réseau locale (MITM). En déploiement web : risque élevé.

---

### IMPORTANT — `src/.claude/settings.local.json` committé

**Fichier :** `src/.claude/settings.local.json`

Ce fichier contient des permissions Claude Code spécifiques à la session locale. Il est publiquement visible sur GitHub. Le contenu actuel n'est pas sensible, mais :
- Les fichiers `settings.local.json` sont typiquement gitignorés
- Ce fichier ne devrait pas être en repository public
- Il révèle l'usage de Claude Code dans le projet (information structurelle)

---

## 5. Risques potentiels

### innerHTML avec `repairMojibake()` — function `setHtml()` (dead code)

**Fichier :** `src/js/render.js:418–420`

```javascript
function setHtml(id, value) {
  if (element) element.innerHTML = repairMojibake(value ?? "");
}
```

`repairMojibake()` n'est pas un sanitiseur HTML — il corrige uniquement l'encodage mojibake. Si cette fonction est appelée avec une valeur provenant de données utilisateur non validées (CSV, localStorage corrompu), elle représente un vecteur XSS.

**État actuel :** la fonction est définie mais jamais appelée — dead code confirmé. Risque nul en l'état. À supprimer ou à sécuriser avant réutilisation.

---

### innerHTML avec données venant de localStorage

**Fichier :** `src/js/render.js:2947–2962`

Le template `card.innerHTML` injecte des valeurs comme `cockpit.market.label`, `cockpit.market.verdict`, `cockpit.validation`, etc. Ces valeurs proviennent du moteur (enums prédéfinis) après parsing de localStorage.

- En contexte local-first (un seul utilisateur), le risque est **auto-exploitation uniquement**
- Si localStorage est corrompu ou manipulé manuellement par un attaquant ayant accès à la machine, injection possible
- En contexte multi-utilisateurs ou hébergé : risque réel si les valeurs storées ne sont pas filtrées avant injection

**Mitigant actuel :** les valeurs passent par `asCleanText()` et/ou des lookups de tables (`SNAP_MARKET_MAP`, etc.) qui retournent `"—"` si la valeur est inconnue. Robustesse partielle.

---

### Absence de Content Security Policy

**Fichier :** `src/index.html`

Aucun header CSP ni meta `Content-Security-Policy`. En mode local-first via `file:///` ou serveur local : non applicable. En déploiement web public : absence de CSP = surface XSS non contrôlée, pas de blocage sur scripts inline non autorisés.

---

## 6. Faux positifs

| Point | Évaluation |
|---|---|
| `target="_blank"` dans render.js:2875 | Sécurisé — `rel="noopener noreferrer"` présent ligne 2876 |
| Liens Notion et Paragraph dans index.html | Sécurisés — `rel="noopener noreferrer"` présent |
| `node_modules/` dans `.gitignore` | Normal — répertoire inexistant, l'entrée est préventive |
| Lecture de fichiers locaux (File API) | Usage légitime et attendu — import CSV utilisateur |
| Drag & drop (uploader.js) | Flux standard navigateur, pas de surface d'attaque additionnelle |

---

## 7. Priorité des problèmes

| # | Problème | Priorité |
|---|---|---|
| 1 | User ID Binance + données financières sur GitHub public | **Critique** |
| 2 | `src/.claude/settings.local.json` committé | **Important** |
| 3 | SheetJS CDN sans SRI | **Important** |
| 4 | `setHtml()` innerHTML sans sanitisation (dead code) | Amélioration future |
| 5 | innerHTML avec données localStorage non sanitisées | Amélioration future |
| 6 | Absence de CSP | Amélioration future (avant déploiement public) |
| 7 | `.gitignore` incomplet | Important (opérationnel) |

---

## 8. Recommandations

### Immédiates

**1. Purger les données financières du repo public**

Le simple `git rm` ne suffit pas — les commits précédents restent dans l'historique Git.

Options :
- `git filter-repo --path excel_tests/ --invert-paths` pour réécrire l'historique et forcer push
- Ou déplacer le repo en privé le temps de nettoyer
- Ajouter `excel_tests/` au `.gitignore` après purge

**2. Retirer `src/.claude/settings.local.json` du repo**

```bash
git rm src/.claude/settings.local.json
echo "src/.claude/" >> .gitignore
```

---

### Moyen terme

**3. SRI sur le script SheetJS**

Calculer le hash du fichier actuel et ajouter l'attribut `integrity` :

```javascript
script.integrity = 'sha384-<hash>';
script.crossOrigin = 'anonymous';
```

Ou mieux : bundler SheetJS localement dans `src/js/vendor/xlsx.min.js` pour éliminer la dépendance CDN entièrement.

**4. Supprimer `setHtml()` ou la sécuriser**

La fonction est dead code. La supprimer proprement évite qu'elle soit réactivée par erreur sans sanitisation adéquate.

**5. Compléter le `.gitignore`**

```
excel_tests/
src/.claude/
*.DS_Store
Thumbs.db
```

---

### Avant mise en ligne publique

**6. Mettre en place une Content Security Policy**

Exemple minimal pour l'application actuelle :

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' https://cdn.sheetjs.com;
           style-src 'self';
           media-src 'self' ../assets/;
           connect-src 'none';">
```

**7. Sanitiser les injections innerHTML avec données moteur**

Avant déploiement public, remplacer les template literals innerHTML qui injectent des valeurs venant de localStorage par des constructions `createElement` + `textContent`, ou ajouter un sanitiseur (DOMPurify) pour les rares cas légitimes.

**8. Hébergement : aucun appel réseau involontaire**

Vérifier via les DevTools Network que l'application ne fait aucun appel réseau non consenti. Actuellement, seule la requête CDN SheetJS (sur import XLSX) sort du périmètre local.

---

## 9. Points déjà bien sécurisés

| Point | Détail |
|---|---|
| `escHtml()` dans behavior-view.js | Toutes les données CSV utilisateur (noms de colonnes, messages d'erreur, noms de sessions) passent par un sanitiseur HTML correct avant injection innerHTML |
| `textContent` majoritaire | La quasi-totalité des mises à jour DOM utilisent `textContent` — vecteur XSS éliminé |
| Liens externes sécurisés | `rel="noopener noreferrer"` présent sur tous les `target="_blank"` (HTML + JS) |
| Pas de credentials dans le code | Aucune API key, token ou secret trouvé dans `src/` |
| Pas d'`eval()` ni `document.write()` | Vérifiés sur l'ensemble du code source |
| Zéro dépendance npm en production | Pas de `package.json`, pas de `node_modules` actif — surface supply chain nulle côté npm |
| localStorage sans données sensibles | Uniquement payload moteur, snapshots d'état, sessions comportementales — pas d'identifiants |
| Cap localStorage à 50 entrées | Prévient la saturation de quota (anti-flood) |
| Validation type MIME à l'import | Extensions `.zip` rejetées explicitement avec message clair |
| Guard ZIP dans uploader | Binance exporte parfois des ZIP — cas traité proprement sans crash |
| Articles/URLs publications hardcodés | `article.url` vient de `data.js`, pas de l'utilisateur — pas de risque open redirect |
