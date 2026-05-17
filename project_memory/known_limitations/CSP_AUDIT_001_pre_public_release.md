# CSP_AUDIT_001 — Audit Content Security Policy pré-déploiement public

**Date :** 2026-05-17  
**Périmètre :** `src/index.html`, `src/constellium.html`, `src/js/**`, `src/css/**`, `assets/`  
**Statut :** Audit documentaire uniquement — aucune modification appliquée

---

## 1. Résumé exécutif

Caméléon Engine est une application local-first sans backend, sans réseau, sans CDN actif. La surface CSP est donc **très réduite** comparée à une SPA classique. L'audit révèle **3 blocants réels** qui nécessiteront un ajustement avant d'activer une CSP stricte, et **0 dépendance réseau externe** dans le code d'exécution.

| Catégorie | État |
|-----------|------|
| Scripts réseau externes | ✅ Aucun — SheetJS vendorisé |
| Fetch / XHR / WebSocket | ✅ Absent — zéro appel réseau |
| Fonts externes | ✅ Absent — system fonts uniquement |
| CDN actif | ✅ Supprimé (IMPORT_002) |
| Inline `<script>` | ⚠️ 1 occurrence dans `index.html` — **blocant** |
| Inline event handler | ⚠️ 1 `onclick=` dans `index.html` — **blocant** |
| Inline `<style>` | ⚠️ Tout `constellium.html` — **blocant** |
| Inline `style=""` attrs | ⚠️ 16 occurrences dans `index.html` — **blocant** |
| Dynamic script injection | ⚠️ 1 occurrence (SheetJS local) — couvert par `'self'` |
| iframe / object / embed | ✅ Absent |
| `eval()` / `new Function()` | ✅ Absent |

---

## 2. Surface actuelle compatible CSP

### 2.1 Scripts — compatible 'self'

- **ES modules principaux** (`index.html:1177-1178`) :
  ```html
  <script type="module" src="./js/render.js"></script>
  <script type="module" src="./js/behavior/behavior-main.js"></script>
  ```
  → Couverts par `script-src 'self'`. Pas de problème.

- **Injection dynamique SheetJS** (`uploader.js:161`) :
  ```javascript
  const script = document.createElement('script');
  script.src   = new URL('../../vendor/xlsx.full.min.js', import.meta.url).href;
  ```
  → Charge `src/js/vendor/xlsx.full.min.js` — chemin local résolu via `import.meta.url`. Couvert par `script-src 'self'`. Pas de problème.

- **`eval()`, `new Function()`, `document.write()`** : absents. Zéro occurrence dans tout `src/js/`.

### 2.2 Styles — partiellement compatible

- **CSS externes** (`./css/style.css`, `./css/behavior.css`) : locaux, couverts par `style-src 'self'`.
- **CSS `url()`** (`style.css:4262`) : `url("../../assets/images/cameleon-logo.png")` — image locale, couverte par `img-src 'self'`.
- **`element.style.foo = value`** (53 occurrences dans `render.js`) : **non bloqué par CSP** — c'est une manipulation DOM JavaScript, pas une source de style au sens CSP. Aucun impact.
- **`@import` dans les CSS** : absent. Confirmé.
- **Fonts Google / CDN** : absent. Les fonts déclarées sont `'Inter', 'Segoe UI', system-ui, sans-serif` — système uniquement.

### 2.3 Médias / Assets

- **Vidéos** (`index.html:26, 55, 254`) : 3 éléments `<video><source src="../assets/video/...">` — locaux.
- **Image CSS** : `cameleon-logo.png` via `url()` dans `style.css` — locale.
- **`<img>` dynamique** (`#overtrading-img` dans `render.js`) : src assigné dynamiquement en JS depuis `assets/images/` — local.

### 2.4 Réseau

- **Aucun `fetch()`** dans le code source.
- **Aucun `XMLHttpRequest`**.
- **Aucun `WebSocket`**.
- **Aucun `navigator.sendBeacon`**.
- **Liens externes** (`index.html:87, 966`) : liens Notion et paragraph.com dans des `<a target="_blank">`. Ce sont des navigations utilisateur, **pas des ressources chargées** — sans impact sur `connect-src`.

### 2.5 DOM / navigateur

- **Aucun `<iframe>`**, **`<object>`**, **`<embed>`** dans les deux pages HTML.
- **Aucun `<form>`** → directive `form-action` non critique.
- **Aucun `<base>`** → `base-uri 'self'` applicable sans risque.
- **`frame-ancestors`** : non défini — à positionner sur `'none'` ou `'self'` avant déploiement public.

---

## 3. Points blocants potentiels

### BLOCKER-001 — Inline `<script>` dans `index.html:10`

```html
<script>try{if(localStorage.getItem("CE_onboarding_v1"))document.documentElement.classList.add("onboarding-seen");}catch(e){}</script>
```

**Pourquoi c'est un blocant :** Tout script inline est interdit par `script-src 'self'` sans `'unsafe-inline'`. Ce script s'exécute avant le chargement des modules ES — il est volontairement placé dans le `<head>` pour éviter le flash de l'overlay onboarding.

**Options de résolution :**
1. **Nonce** : `<script nonce="{{NONCE}}">` + `script-src 'nonce-{{NONCE}}'` — nécessite un serveur pour générer le nonce à chaque requête. Impossible en pure static/local-first.
2. **Hash** : calculer le SHA-256 du contenu exact du script → `script-src 'sha256-abc...'`. Fonctionne en static.
3. **Externaliser** : déplacer ce script dans un fichier `src/js/onboarding-init.js` chargé en premier module. Perd l'avantage de l'exécution early mais reste fonctionnel.

**Recommandation :** Hash SHA-256 pour Phase 2/3.

---

### BLOCKER-002 — Inline `onclick` handler dans `index.html:542`

```html
<button ... onclick="window.location.href='constellium.html'">
```

**Pourquoi c'est un blocant :** Les event handlers inline (`onclick=`, `onload=`, etc.) sont équivalents à `'unsafe-inline'` pour `script-src`. Bloqués dès que `'unsafe-inline'` est absent.

**Options de résolution :**
1. **Supprimer le handler inline** → attacher l'événement via `addEventListener` dans `render.js` ou un script dédié.
2. **`'unsafe-hashes'`** → permet les hashes d'event handlers inline, mais est une directive plus récente (Chrome 70+, Firefox 87+).

**Recommandation :** Supprimer l'inline handler, attacher via JS. Modification triviale (1 ligne).

---

### BLOCKER-003 — Inline `<style>` dans `constellium.html`

`constellium.html` contient un bloc `<style>` complet dans le `<head>` (toute la feuille de style de la page est inline).

**Pourquoi c'est un blocant :** `style-src 'self'` sans `'unsafe-inline'` bloque tous les blocs `<style>` inline.

**Options de résolution :**
1. **Hash SHA-256** du contenu complet du bloc `<style>` → `style-src 'sha256-xyz...'`. Fonctionne en static, mais fragile à toute modification de la feuille.
2. **Externaliser** : créer `src/css/constellium.css` et le linker. Solution propre et durable.
3. **`'unsafe-inline'`** pour les styles uniquement → acceptable si le reste de la CSP est strict sur les scripts.

**Recommandation :** Externaliser dans `src/css/constellium.css` lors de la Phase 3.

---

### BLOCKER-004 — Attributs `style=""` inline dans `index.html`

16 attributs `style="..."` sur des éléments HTML (exemples) :

```html
style="display:none;"               <!-- guidanceCard, bhvInfluencePanel, etc. -->
style="width:0%"                    <!-- barres de progression -->
style="margin-top: 0.5rem;"         <!-- panels confidence -->
style="font-size:13px;opacity:0.88;"
```

**Pourquoi c'est un blocant :** `style-src 'self'` sans `'unsafe-inline'` bloque tous les attributs `style=""` des éléments HTML.

**Options de résolution :**
1. **`style-src 'unsafe-inline'`** → accepter l'inline pour les styles uniquement. Le risque XSS via `style-src` est très bas (pas d'exécution de code, juste CSS). Acceptable pour la Phase 2.
2. **Remplacer par des classes CSS** → `class="hidden"`, `class="bar-empty"`, etc. gérées dans le CSS. Refactoring non trivial (impact sur `render.js`).
3. **`'unsafe-inline'` uniquement pour style-src** → compromis raisonnable : scripts stricts, styles permissifs.

**Recommandation :** Accepter `style-src 'unsafe-inline'` en Phase 2. Planifier la migration vers classes CSS pour Phase 3.

---

## 4. Directives CSP recommandées

Basé sur l'audit complet — ce que la CSP finale devrait contenir :

```
Content-Security-Policy:
  default-src 'none';
  script-src  'self';
  style-src   'self' 'unsafe-inline';
  img-src     'self' data:;
  media-src   'self';
  font-src    'self';
  connect-src 'none';
  frame-src   'none';
  object-src  'none';
  base-uri    'self';
  form-action 'self';
  frame-ancestors 'none';
```

**Justifications ligne par ligne :**

| Directive | Valeur | Raison |
|-----------|--------|--------|
| `default-src` | `'none'` | Base restrictive — tout ce qui n'est pas explicitement listé est interdit |
| `script-src` | `'self'` | Modules ES locaux + SheetJS vendor dynamique |
| `style-src` | `'self' 'unsafe-inline'` | CSS locaux + inline style="..." (16 attrs) |
| `img-src` | `'self' data:` | Images locales + `data:,` du favicon |
| `media-src` | `'self'` | 3 vidéos locales (.mp4) |
| `font-src` | `'self'` | System fonts — aucune font externe chargée |
| `connect-src` | `'none'` | Zéro réseau (fetch/XHR/WS absents) |
| `frame-src` | `'none'` | Aucune iframe |
| `object-src` | `'none'` | Aucun plugin |
| `base-uri` | `'self'` | Interdit l'injection de `<base href="...">` externe |
| `form-action` | `'self'` | Aucun formulaire — valeur défensive |
| `frame-ancestors` | `'none'` | Interdit l'embedding dans un iframe externe |

---

## 5. Directives à éviter

| Directive | À éviter | Pourquoi |
|-----------|----------|---------|
| `script-src 'unsafe-inline'` | Absolument | Annule toute protection XSS sur les scripts |
| `script-src 'unsafe-eval'` | Absolument | Ouvre `eval()` — non nécessaire ici |
| `script-src *` ou `default-src *` | Absolument | Wildcard = CSP inutile |
| `style-src *` | Absolument | Ouvre l'exfiltration CSS |
| `connect-src *` | Absolument | Ouvrirait tous les endpoints réseau |
| `upgrade-insecure-requests` | En local-first | Sans HTTPS, casse les ressources locales |

---

## 6. Proposition CSP progressive

### Phase 1 — Report-Only (observation)

**Objectif :** Observer sans bloquer. Mesurer ce qui serait cassé.

```http
Content-Security-Policy-Report-Only:
  default-src 'none';
  script-src  'self' 'unsafe-inline';
  style-src   'self' 'unsafe-inline';
  img-src     'self' data:;
  media-src   'self';
  connect-src 'none';
  frame-ancestors 'none';
  report-uri  /csp-report
```

**Contraintes :** Nécessite un serveur HTTP (même minimal) pour recevoir les rapports `report-uri`. En local file:// pur, les violations ne sont pas envoyées. En mode `serve-local.ps1` (serveur HTTP local), utiliser un endpoint minimal ou les logs de la console DevTools.

**Alternative sans serveur :** Activer la CSP directement en mode restrictif dans DevTools (onglet Network → filtrer les violations CSP) et observer les erreurs console.

**Durée recommandée :** 2–3 sessions de test complètes.

---

### Phase 2 — CSP permissive locale

**Objectif :** Activer la CSP sans casse. Corriger BLOCKER-001 et BLOCKER-002. Tolérer `'unsafe-inline'` sur les styles.

**Pré-requis :**
1. Corriger BLOCKER-001 : hash SHA-256 du inline script onboarding OU externaliser dans `onboarding-init.js`
2. Corriger BLOCKER-002 : supprimer `onclick=` inline, attacher via `addEventListener`

**CSP Phase 2 (dans `<meta>` ou header HTTP) :**

```
Content-Security-Policy:
  default-src 'none';
  script-src  'self' 'sha256-<HASH_ONBOARDING>';
  style-src   'self' 'unsafe-inline';
  img-src     'self' data:;
  media-src   'self';
  font-src    'self';
  connect-src 'none';
  frame-src   'none';
  object-src  'none';
  base-uri    'self';
  frame-ancestors 'none';
```

**Remarque :** Si BLOCKER-001 est résolu en externalisant le script (option 3), `'sha256-...'` n'est pas nécessaire et `script-src 'self'` suffit.

**Comment calculer le hash :**
```bash
echo -n "try{if(localStorage.getItem(\"CE_onboarding_v1\"))document.documentElement.classList.add(\"onboarding-seen\");}catch(e){}" | openssl dgst -sha256 -binary | base64
```
(Le hash doit correspondre exactement au contenu entre les balises `<script>`, sans les balises elles-mêmes.)

**Couverture Phase 2 :**
- Tous les scripts locaux protégés (pas d'injection externe possible)
- SheetJS vendor dynamique couvert
- Styles : `'unsafe-inline'` toléré (risque bas — CSS ne peut pas exfiltrer des données sans JS)
- Vidéos, images locales : couvertes

---

### Phase 3 — CSP stricte pré-public

**Objectif :** Éliminer tous les `'unsafe-inline'`. CSP pleinement stricte.

**Pré-requis supplémentaires (par rapport à Phase 2) :**
1. Corriger BLOCKER-003 : externaliser le CSS de `constellium.html` → `src/css/constellium.css`
2. Corriger BLOCKER-004 : remplacer les 16 attributs `style=""` inline par des classes CSS dans `src/css/style.css`

**CSP Phase 3 :**

```
Content-Security-Policy:
  default-src 'none';
  script-src  'self';
  style-src   'self';
  img-src     'self' data:;
  media-src   'self';
  font-src    'self';
  connect-src 'none';
  frame-src   'none';
  object-src  'none';
  base-uri    'self';
  form-action 'self';
  frame-ancestors 'none';
```

**Couverture Phase 3 :** CSP maximale pour une application static local-first. Zéro `'unsafe-inline'`, zéro wildcard, zéro source externe.

---

## 7. Risques de casse potentiels

| Scénario | Impact | Gravité | Mitigation |
|----------|--------|---------|-----------|
| Hash SHA-256 du inline script onboarding incorrect ou décalé | Flash de l'overlay onboarding à chaque visite | Moyen | Calculer le hash correctement + tester |
| `onclick=` non retiré avant Phase 2 | Bouton "Lire le Constellium" silencieusement cassé | Moyen | Corriger en amont (trivial) |
| `style=""` bloqués en Phase 3 sans migration CSS | Éléments initialement visibles (panels, barres) cassés visuellement | Élevé | Migration CSS complète avant Phase 3 |
| `constellium.html` sans externalisation CSS (Phase 3) | Page entièrement sans style | Élevé | Externaliser CSS avant Phase 3 |
| Dynamic SheetJS non couvert | Import XLSX silencieusement cassé | Élevé | Non : couvert par `script-src 'self'` |
| Nouvelles dépendances CDN ajoutées après activation | Bloquées sans avertissement visible | Moyen | Audit réseau périodique, test systématique après ajout dépendance |
| `data:,` favicon bloqué | Erreur console mineure (aucun impact UI) | Faible | Inclure `data:` dans `img-src` |

---

## 8. Tests à faire avant activation

### Tests fonctionnels minimum (Phase 2)

- [ ] Chargement initial sans flash onboarding (inline script onboarding)
- [ ] Bouton "Lire le Constellium" → navigation vers `constellium.html`
- [ ] Import CSV → parsing complet sans erreur console
- [ ] Import XLSX → chargement SheetJS dynamique sans erreur CSP
- [ ] Lecture engine : remplir les 16 champs → payload complet affiché
- [ ] Animation des barres de score (`width: X%` via JS) → visuellement OK
- [ ] Debug Brain → toggle et affichage correct
- [ ] Onboarding overlay → affiché au premier visit, absent après validation

### Tests supplémentaires Phase 3

- [ ] Tous les `style="display:none"` → remplacés par classe `.hidden` et cachés correctement
- [ ] `constellium.html` → rendu correct avec CSS externalisé
- [ ] Barres de progression (`exec-confidence-fill`, `score-bar-fill`, `cs-bar`) → animation correcte via JS sans `style=""` inline
- [ ] Vidéos logo → chargées et animées
- [ ] Favicon → pas d'erreur 404 ou CSP sur `data:,`

### Vérification DevTools

Ouvrir DevTools → Console → filtrer `Content Security Policy` → confirmer 0 violation après chaque phase.

---

## 9. Recommandation finale

**Séquence recommandée :**

```
Aujourd'hui (pré-requis simples)
  1. Supprimer l'inline onclick= (BLOCKER-002) — 2 minutes de code
  2. Externaliser le inline script onboarding (BLOCKER-001) — 5 minutes de code
     OU calculer son hash SHA-256

→ Phase 2 activable immédiatement après ces deux corrections.
   Gain : protection complète des scripts. Risque casse : quasi nul.

Avant déploiement public
  3. Externaliser le CSS de constellium.html (BLOCKER-003) — 10 minutes
  4. Migrer les 16 style="" inline vers classes CSS (BLOCKER-004) — 30-60 minutes
     (principalement render.js : remplacer element.style.display par classList)

→ Phase 3 activable. CSP sans aucun unsafe-inline.
```

**Priorité absolue :** BLOCKER-001 et BLOCKER-002 sont triviaux à corriger. La Phase 2 peut être activée **sans refactoring majeur** et protège déjà contre les vecteurs les plus critiques (injection de scripts externes).

**Ce qui n'est pas nécessaire pour ce projet :**
- Nonces (nécessitent un serveur dynamique)
- `'strict-dynamic'` (surcomplexité inutile pour une SPA static)
- `upgrade-insecure-requests` (pas de HTTPS en local)
- `report-uri` cloud tiers (local-first, les violations console suffisent)

**Vecteur de risque résiduel unique post-Phase 3 :** `style-src 'self'` sans `'unsafe-inline'`. Si `render.js` utilise `setAttribute('style', ...)` quelque part (à vérifier lors de la migration), ces appels seraient bloqués. Les `element.style.foo = value` (forme dominante dans render.js) restent autorisés.

---

## Références

- `project_memory/known_limitations/SECURITY_AUDIT_001_local_first_2026-05-17.md` — audit initial, CSP identifié comme manquant
- `project_memory/known_limitations/SECURITY_ROADMAP_PRE_PUBLIC_RELEASE.md` — roadmap globale (H1 = CSP)
- `project_memory/imports_excel_csv/IMPORT_002_sheetjs_vendorisation.md` — SheetJS CDN supprimé
- `project_memory/known_limitations/SECURITY_AUDIT_002_innerHTML_2026-05-17.md` — innerHTML audité, escHtml() validé
