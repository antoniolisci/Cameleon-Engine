# SECURITY ROADMAP — PRE PUBLIC RELEASE
## Caméléon Engine — Local-First Security Consolidation

**Statut :** Document de référence — travail en cours  
**Date de création :** 2026-05-17  
**Portée :** Préparation au déploiement public éventuel depuis une base local-first

---

## 1. État actuel du projet

### Architecture

Caméléon Engine est une application client-side intégrale :

- HTML / CSS / JavaScript natif — aucun framework
- Modules ES6 (`type="module"`) — pas de bundler, pas de compilation
- Serveur de développement local uniquement (`serve-local.ps1` ou équivalent)
- Zéro backend — aucun serveur applicatif, aucune API propriétaire
- Zéro analytics — aucun script tiers de mesure ou de tracking
- Zéro WebSocket — pas de connexion persistante
- Zéro CDN runtime — toutes les dépendances sont vendorisées localement
- Données utilisateur : `localStorage` uniquement, mono-navigateur, mono-machine

L'application est conçue pour fonctionner hors-ligne après chargement initial. Elle ne fait aucun appel réseau pendant l'exécution normale.

### Audits et hardening déjà effectués

| Référence | Description | Statut |
|-----------|-------------|--------|
| SECURITY_AUDIT_001 | Audit global local-first : secrets, XSS, CDN, localStorage, CSP | Documenté |
| SECURITY_AUDIT_002 | Audit exhaustif innerHTML / insertAdjacentHTML / outerHTML (31 occurrences) | Documenté — 0 risque élevé |
| IMPORT_002 | Vendorisation SheetJS : CDN supprimé, `xlsx.full.min.js` v0.20.3 intégré localement | Appliqué |
| GIT_PURGE_001 | Purge historique git-filter-repo : données Binance + `src/.claude/` retirés de 167 commits | Appliqué |
| DEAD_CODE_001 | Suppression `setHtml()` : helper innerHTML sans sanitisation, 0 call site | Appliqué |
| GITIGNORE_001 | Durcissement `.gitignore` : `excel_tests/**`, `src/.claude/` exclus | Appliqué |

### Niveau de risque actuel

**Usage local actuel : FAIBLE**

- Aucune exposition réseau pendant l'exécution
- Aucune donnée transmise à l'extérieur
- Données sensibles confinées à `localStorage` du navigateur de l'utilisateur
- Dépendances tierces : une seule (SheetJS), vendorisée, version figée

**Usage public éventuel : MOYEN → nécessite les actions de cette roadmap**

Les risques actuels ne sont pas actifs — ils deviendraient actifs uniquement si l'application était déployée sur un domaine public sans les ajustements décrits ci-dessous.

---

## 2. Surface d'attaque réelle

### Distinction usage local / usage public

| Surface | Usage local | Usage public |
|---------|-------------|--------------|
| XSS via innerHTML | Risque théorique (données internes) | Risque réel si données utilisateur mal contrôlées |
| localStorage corruption | Improbable (utilisateur seul) | Possible si URL partagée avec paramètres |
| Import CSV/XLSX malveillant | Risque bas (fichier propre de l'utilisateur) | Risque réel si upload public |
| CSP absente | Sans conséquence (pas de réseau) | Nécessaire pour bloquer injections |
| Debug panel exposé | Acceptable (développeur) | À masquer ou conditionner |
| Dépendance vendor compromise | Protégé (version figée, local) | Vérification checksum recommandée |
| Logs console | Acceptable | À réduire |

### Détail par surface

#### localStorage

- Contient : historique décisions (snapshots), état formulaire, paramètres comportementaux
- Format : JSON sérialisé, clés préfixées `CE_*_v1`
- Lecture : sans validation de type à la désérialisation pour certains champs
- Risque : corruption JSON silencieuse, valeurs inattendues si localStorage manipulé manuellement
- Pas de données financières réelles (montants, soldes, clés API) — données d'analyse uniquement

#### Imports CSV / XLSX

- Surface d'entrée principale pour données externes
- Parsing via SheetJS (vendorisé) — bibliothèque éprouvée
- Pipeline : `uploader.js → parser.js → canonical.js → metrics.js`
- `escHtml()` protège toutes les injections DOM depuis les données CSV
- Risque résiduel : fichier XLSX malformé ou très volumineux pouvant provoquer un freeze navigateur
- Aucune validation de taille maximale à ce jour

#### DOM rendering

- `render.js` : 31 usages innerHTML audités — 19 nuls, 12 faibles, 0 élevés
- `behavior-view.js` : `escHtml()` validé sur toutes les données utilisateur
- Risque : nul en état actuel — à maintenir lors de futures évolutions

#### Dépendances vendorisées

- SheetJS v0.20.3 — unique dépendance runtime
- Stockée dans `src/js/vendor/xlsx.full.min.js`
- Version figée dans le repo — pas de mise à jour automatique
- Pas de vérification d'intégrité (checksum) à ce jour
- Risque : modification manuelle non détectée du fichier vendor (attaque locale hypothétique)

#### Historique snapshots

- Plafonné à 50 entrées (rotation FIFO)
- Pas de données sensibles identifiantes
- Pas d'export automatique — toujours local
- Risque : accumulation de données d'analyse sur longue durée (non critique)

#### Console / debug panel

- Debug Brain sidebar : affiche état moteur, posture, confidence breakdown, règles autorisées/interdites
- Logs de diagnostic actifs dans `uploader.js` pour les imports
- Acceptable en développement local — à conditionner avant déploiement public

#### Risques navigateur

- Application servie depuis `localhost` en développement
- Modules ES6 : nécessitent un contexte HTTP (pas `file:///`) — déjà géré
- Pas de `eval()`, pas de `Function()` dynamique identifié dans l'audit
- Service Worker : absent — pas de cache hors-ligne actif (charge complète à chaque session)

---

## 3. Priorités avant déploiement public

### PRIORITÉ HAUTE — Bloquante avant mise en ligne

Ces éléments doivent être traités avant toute exposition publique. Leur absence crée des vecteurs d'attaque ou des fuites réelles.

---

**H1 — Implémenter une Content Security Policy (CSP)**

- Absence actuelle = surface d'attaque ouverte si XSS introductible
- Voir section 4 pour la proposition complète adaptée au modèle local-first
- Applicable via balise `<meta http-equiv="Content-Security-Policy">` dans `src/index.html`
- Ne nécessite pas de serveur

**H2 — Validation taille maximale des fichiers importés**

- Aucune limite de taille imposée à ce jour sur les imports CSV/XLSX
- Un fichier très volumineux peut freezer le navigateur ou saturer la mémoire
- Limite recommandée : 10 Mo (couvre tous les cas d'usage Binance réels)
- Implémenter dans `uploader.js` avant parsing SheetJS

**H3 — Validation type MIME et extension à l'import**

- Vérification que le fichier est bien `.csv`, `.xlsx`, ou `.xls` avant traitement
- Refus explicite avec message d'erreur si extension non reconnue
- Double vérification : extension ET `file.type` (MIME navigateur)

**H4 — Désactivation ou conditionnement du debug panel**

- Le Debug Brain expose l'état interne du moteur (posture, scores, règles)
- Acceptable en développement — à masquer ou conditionner à un flag explicite en production
- Ne pas supprimer : conserver la fonctionnalité pour usage développeur
- Option : variable de build ou paramètre URL `?debug=1` réservé

**H5 — Audit fetch/XMLHttpRequest résiduels**

- Vérifier l'absence de tout appel réseau résiduel (fetch, XHR, import() dynamique externe)
- SheetJS vendorisé couvre la principale dépendance
- Grep exhaustif sur `fetch(`, `XMLHttpRequest`, `import(`, `navigator.sendBeacon`

---

### PRIORITÉ MOYENNE — Important mais non bloquant

Ces éléments améliorent la robustesse et réduisent la surface d'attaque sans être critiques au lancement.

---

**M1 — Validation et assainissement localStorage à la lecture**

- Ajouter validation de type lors de la désérialisation des snapshots
- Gérer explicitement le cas JSON corrompu (try/catch + reset gracieux)
- Voir section 5 pour la checklist complète

**M2 — Checksum du fichier vendor SheetJS**

- Générer un SHA-256 de référence pour `src/js/vendor/xlsx.full.min.js`
- Le documenter dans `IMPORT_002` ou un fichier dédié `vendor.lock.md`
- Vérification manuelle possible — pas besoin d'automatisation

**M3 — Réduction des logs console en production**

- Les logs de diagnostic (`console.log`, `console.warn`) dans l'import pipeline sont utiles en développement
- En production : les supprimer ou les conditionner à un flag debug
- Ne pas toucher aux `console.error` — conserver pour les erreurs réelles

**M4 — Gestion explicite XLSX corrompu ou vide**

- SheetJS peut lancer des exceptions sur des fichiers malformés
- Vérifier que le try/catch dans `uploader.js` couvre tous les cas d'échec SheetJS
- Messages d'erreur utilisateur clairs et non techniques

**M5 — Audit des attributs `data-*` et URL injectées**

- Vérifier qu'aucun attribut HTML injecté ne contient de valeur non contrôlée
- Notamment les liens `href` ou `src` construits dynamiquement

---

### PRIORITÉ FAIBLE — Polish et bonnes pratiques

Ces éléments sont souhaitables à terme mais non urgents.

---

**F1 — Minification et obfuscation légère**

- Pas nécessaire pour la sécurité d'une application open-source
- Peut réduire la lisibilité du code en cas de déploiement public
- Uniquement si la propriété intellectuelle doit être protégée

**F2 — Subresource Integrity (SRI) pour ressources CSS externes éventuelles**

- Actuellement aucune ressource externe — SRI sans objet
- À implémenter si une police, une icône ou une ressource CDN était un jour réintroduite

**F3 — Headers de sécurité HTTP côté serveur**

- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Applicables uniquement si un serveur HTTP est introduit
- Sans objet pour le modèle actuel de fichiers statiques

**F4 — Politique de mise à jour SheetJS**

- Définir une cadence de vérification des nouvelles versions (1× par trimestre suffit)
- Vérifier les CVE publiés sur SheetJS avant mise à jour
- Tester l'import sur fichiers Binance réels après chaque mise à jour vendor

**F5 — Documentation utilisateur sécurité**

- Note visible pour l'utilisateur : aucune donnée envoyée, tout reste local
- Rassure sans complexifier
- Une ligne dans l'interface suffit

---

## 4. CSP recommandée

### Contexte

La Content Security Policy est la mesure de sécurité la plus impactante manquante.
Elle permet au navigateur de bloquer toute exécution de scripts, styles ou ressources
non autorisés — même si du HTML malveillant était injecté via un bug XSS.

Pour Caméléon Engine, la CSP doit être compatible avec :
- Modules ES6 natifs (`type="module"`)
- Chargement du vendor SheetJS via `<script>` dynamique injecté par `uploader.js`
- Fonctionnement offline (pas de ressources réseau)
- Absence de `eval()` ou de code dynamique

### Proposition

À insérer dans `<head>` de `src/index.html` :

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'none';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'none';
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
">
```

### Explication directive par directive

| Directive | Valeur | Raison |
|-----------|--------|--------|
| `default-src 'none'` | Tout bloqué par défaut | Posture sécurité maximale — on autorise explicitement ce qui est nécessaire |
| `script-src 'self'` | Scripts depuis la même origine uniquement | Autorise les modules ES et le vendor local — bloque tout script externe |
| `style-src 'self' 'unsafe-inline'` | Styles locaux + inline | `'unsafe-inline'` nécessaire pour les styles dynamiques appliqués via JS (animations, debug panel) |
| `img-src 'self' data: blob:` | Images locales, data URIs, blobs | Couvre les assets locaux et les éventuels aperçus générés en mémoire |
| `connect-src 'none'` | Aucune connexion réseau | L'application ne fait aucun appel réseau — cette directive le formalise |
| `object-src 'none'` | Aucun plugin (Flash, PDF embed) | Supprime une surface d'attaque historique sans impact fonctionnel |
| `frame-ancestors 'none'` | L'application ne peut pas être iframée | Bloque le clickjacking |
| `base-uri 'self'` | Empêche l'injection de `<base href>` | Protège la résolution des URLs relatives |
| `form-action 'none'` | Aucune soumission de formulaire | L'application n'utilise pas de formulaires POST |

### Point de vigilance : SheetJS via `<script>` dynamique

`uploader.js` charge SheetJS en injectant un `<script>` dynamique :

```javascript
const script = document.createElement('script');
script.src = new URL('../../vendor/xlsx.full.min.js', import.meta.url).href;
document.head.appendChild(script);
```

Ce script provient de `'self'` (fichier local). La directive `script-src 'self'` couvre ce cas.

**À tester impérativement** après ajout de la CSP : importer un fichier XLSX et vérifier
qu'aucune violation CSP n'est reportée dans la console.

### Point de vigilance : `'unsafe-inline'` pour les styles

`style-src 'unsafe-inline'` est une concession. Elle est acceptable ici car :
- L'application ne reçoit pas de styles depuis des sources externes
- Le risque d'injection CSS via XSS existe théoriquement mais est couvert par la rigueur des usages innerHTML (SECURITY_AUDIT_002)
- Supprimer `'unsafe-inline'` nécessiterait de migrer tous les styles dynamiques en classes CSS — travail non négligeable, reportable après lancement

---

## 5. Audit localStorage futur

### Checklist de validation

| Item | Description | État actuel |
|------|-------------|-------------|
| **Corruption JSON** | Chaque lecture depuis localStorage doit être encadrée par try/catch avec fallback propre | Partiel — à vérifier dans `state.js` |
| **Taille snapshots** | Cap à 50 entrées en place (rotation FIFO) | Implémenté |
| **Quota navigateur** | ~5 Mo selon navigateur — vérifier que 50 snapshots restent bien sous ce seuil | Non mesuré — à valider |
| **Migrations de schéma** | Si la structure d'un snapshot change, les anciens formats doivent être gérés gracieusement | Non formalisé |
| **Versioning des clés** | Clés préfixées `CE_*_v1` — le suffixe de version permet des migrations futures | Présent |
| **TTL / expiration** | Pas d'expiration automatique des snapshots — acceptable (50 max) | Absent — non requis |
| **Reset sécurité** | Moyen pour l'utilisateur d'effacer toutes les données locales | Interface à prévoir |
| **Fallback storage indisponible** | Si localStorage est désactivé (navigation privée stricte), l'application doit se dégrader proprement sans crash | Non testé |
| **Lecture valeurs non attendues** | Validation des types à la désérialisation (ex: snapshot.score attendu numérique) | Partiel |
| **Pas de données financières réelles** | Vérifier que les snapshots ne contiennent jamais de soldes, montants réels, clés API | Confirmé par conception |

### Priorités dans cette checklist

1. **Corruption JSON + fallback** : prioritaire — un localStorage corrompu ne doit pas bloquer l'application
2. **Migrations de schéma** : à documenter avant d'évoluer la structure des snapshots
3. **Reset utilisateur** : à exposer dans l'interface (onglet Mémoire ou préférences)
4. **Fallback storage indisponible** : à tester en navigation privée

---

## 6. Sécurité import pipeline

### Checklist validation fichiers

| Item | Description | État actuel |
|------|-------------|-------------|
| **Taille maximale** | Refus des fichiers > 10 Mo avant parsing | Absent — à implémenter (PRIORITÉ HAUTE H2) |
| **Validation extension** | Vérification `.csv`, `.xlsx`, `.xls` uniquement | Partiel |
| **Validation MIME** | `file.type` vérifié en plus de l'extension | Absent — à implémenter (PRIORITÉ HAUTE H3) |
| **Fichier vide** | Rejet explicite si le fichier est vide (0 octet ou 0 lignes parsées) | À vérifier |
| **XLSX corrompu** | try/catch autour du parsing SheetJS avec message d'erreur utilisateur | Présent — à valider exhaustivement |
| **Freeze parsing** | Pas de traitement synchrone bloquant sur fichiers volumineux | SheetJS est synchrone — acceptable sous 10 Mo |
| **Fichier non-tabulaire** | Rejet si aucune colonne reconnue après normalisation | Implémenté (détection en-tête) |
| **Encodage non-UTF8** | Gestion des encodages Windows-1252, Latin-1 (exports Binance anciens) | Partiellement géré |
| **Injections via noms de colonnes** | Les noms de colonnes du CSV ne doivent pas être injectés dans le DOM sans `escHtml()` | À vérifier dans `canonical.js` |
| **Messages d'erreur non-techniques** | Les erreurs SheetJS ne doivent pas remonter telles quelles dans l'interface | À vérifier |

### Note sur SheetJS

SheetJS est une bibliothèque de parsing éprouvée. Les vulnérabilités connues sur cette bibliothèque
concernent essentiellement des versions très anciennes ou des configurations non standard.
La version 0.20.3 vendorisée est stable. Consulter les CVE SheetJS avant toute mise à jour.

---

## 7. Politique vendor / dépendances

### Dépendances actuelles

| Bibliothèque | Version | Source d'origine | Emplacement | Usage |
|-------------|---------|-----------------|-------------|-------|
| SheetJS (xlsx) | 0.20.3 | cdn.sheetjs.com (téléchargé une fois) | `src/js/vendor/xlsx.full.min.js` | Parsing XLSX/XLS à l'import |

### Règles de la politique vendor

**1. Aucun CDN à l'exécution**
Toute dépendance utilisée pendant l'exécution doit être vendorisée localement.
Le chargement depuis un CDN externe est interdit dans le code de production.

**2. Version figée**
La version d'une dépendance vendorisée est fixe et explicitement documentée.
Aucune mise à jour automatique n'est possible ou souhaitée.

**3. Source officielle**
Toute vendorisation doit être effectuée depuis la source officielle de la bibliothèque
(site officiel, npm registry officiel, ou release GitHub officielle).
Documenter l'URL d'origine dans la fiche correspondante.

**4. Version tracking**
Documenter dans `project_memory/imports_excel_csv/` ou dossier dédié :
- Nom de la bibliothèque
- Version exacte
- Date de vendorisation
- URL source d'origine
- Hash SHA-256 du fichier (futur — voir item suivant)

**5. Checksum futur**
Générer et documenter un SHA-256 pour chaque fichier vendor :
```
SHA-256(src/js/vendor/xlsx.full.min.js) = [à calculer]
```
Permet de détecter toute modification non intentionnelle du fichier vendor.
Pas d'automatisation requise — vérification manuelle avant chaque déploiement suffit.

**6. Procédure de mise à jour**
Avant de mettre à jour une dépendance vendorisée :
1. Vérifier les CVE publiés sur la version cible
2. Télécharger depuis la source officielle
3. Tester l'import sur des fichiers Binance réels
4. Mettre à jour la documentation (fiche + version dans le code)
5. Mettre à jour le checksum documenté
6. Committer uniquement le fichier vendor mis à jour + documentation

---

## 8. Politique Git / secrets

### Règles absolues

**Jamais dans le repo Git :**

- Fichiers d'export Binance réels (CSV, XLSX contenant des User_ID, des soldes, des transactions)
- Tout fichier contenant un `User_ID` Binance ou identifiant de compte
- Exports wallet, relevés de portefeuille, historiques de trading réels
- Clés API, tokens, credentials de toute nature
- Fichiers `src/.claude/settings.local.json` ou équivalents d'outils de développement
- Fichiers `.env` ou de configuration locale

**En cas d'incident (données sensibles commises par erreur) :**

1. Rendre le repo GitHub privé immédiatement
2. Identifier les commits incriminés via `git log --all -- <fichier>`
3. Purger via `git-filter-repo --path <fichier> --invert-paths`
4. Rétablir le remote et force-pusher
5. Documenter l'incident dans `project_memory/known_limitations/`
6. Évaluer si les données exposées nécessitent une action côté Binance (révocation de clés éventuelles)

**Séparation des fichiers de test :**

- `excel_tests/` : exclure via `.gitignore` (`excel_tests/**`)
- Seuls les README non sensibles sont trackés
- Les fichiers de test réels restent sur la machine locale uniquement
- Référencer les cas problématiques dans `project_memory/imports_excel_csv/` sans inclure les fichiers

**Mémoire Claude locale :**

- Le dossier `src/.claude/` ou `.claude/` contient des configurations d'outils locaux
- Ces fichiers sont dans `.gitignore` — ne jamais forcer leur commit
- Ils peuvent contenir des chemins locaux, des préférences, des informations de session

---

## 9. Philosophie sécurité Caméléon Engine

### Doctrine

Caméléon Engine applique une **sécurité défensive calme**.

Ce n'est pas une application bancaire. Ce n'est pas un service cloud.
C'est un outil de décision local, pour un utilisateur averti, fonctionnant sur sa propre machine.

La sécurité de Caméléon Engine repose sur trois principes :

**1. Réduction de la surface d'attaque**
La meilleure défense est l'absence de vecteur. Pas de backend = pas de failles serveur.
Pas de CDN = pas de supply chain. Pas de réseau = pas d'interception.
Chaque dépendance supprimée est une surface d'attaque de moins.

**2. Lisibilité et auditabilité**
Le code doit être lisible par un humain. Une sécurité opaque n'est pas une sécurité —
c'est une illusion. Tout mécanisme de sécurité doit être compréhensible, documenté,
et vérifiable sans outillage spécialisé.

**3. Proportionnalité**
Les mesures de sécurité doivent être proportionnées au risque réel.
Une application locale-first pour un utilisateur solo n'a pas les mêmes exigences
qu'une plateforme multi-utilisateurs exposée à Internet.
Sur-sécuriser une telle application est une forme de bruit cognitif —
ça ne protège rien, ça complique tout.

### Ce que Caméléon Engine ne fait pas — et pourquoi c'est une décision

| Ce qui est absent | Pourquoi c'est voulu |
|-------------------|---------------------|
| Authentification | Mono-utilisateur local — l'auth serait du théâtre sans valeur |
| Chiffrement localStorage | Les données ne contiennent pas d'informations identifiantes ou financières réelles |
| Rate limiting | Aucun service exposé — sans objet |
| Logs d'audit serveur | Pas de serveur |
| Sandbox strict d'import | SheetJS est éprouvé ; l'isolation complète alourdirait sans bénéfice réel |
| SRI sur ressources externes | Aucune ressource externe à l'exécution — SheetJS est vendorisé |

### Ce que Caméléon Engine fait — et doit maintenir

| Ce qui est présent | Valeur |
|-------------------|--------|
| `escHtml()` sur toutes les données utilisateur | Bloque les injections XSS depuis le CSV |
| SheetJS vendorisé | Élimine la dépendance CDN et le risque supply chain |
| `.gitignore` durci | Empêche la fuite de données réelles dans l'historique |
| Cap localStorage 50 entrées | Évite la saturation et limite l'accumulation de données |
| Modules ES6 natifs | Pas de bundler = pas de complexité de build = surface réduite |
| Zéro dépendance runtime | Architecture auditables intégralement à la lecture du code source |

### Ce qui doit être ajouté avant déploiement public

Un seul ajout est véritablement structurant : la **CSP**.

Tout le reste (validation taille import, réduction logs, reset localStorage)
est de la robustesse opérationnelle, pas de la sécurité au sens strict.

La CSP est la seule mesure qui modifie le modèle de menace de l'application
de façon significative lors du passage au public.

### Sécurité théâtrale — ce qu'on évite

Sont considérés comme de la sécurité théâtrale dans ce contexte :

- Obfuscation du code source (protection inexistante, coût en lisibilité réel)
- Double hachage de données non sensibles
- Rate limiting côté client (contournable trivialement)
- Watermarking invisible des sorties
- Alertes de sécurité génériques sans action associée
- Dashboards de monitoring sans incident à monitorer

Ces pratiques créent une apparence de sécurité sans en fournir les bénéfices réels.
Elles consomment du temps d'ingénierie, ajoutent de la complexité, et peuvent
masquer les vrais vecteurs en déplaçant l'attention.

### Posture à maintenir

> Simple. Lisible. Local. Proportionné.
>
> Chaque mesure de sécurité doit pouvoir être expliquée en une phrase.
> Si elle ne peut pas l'être, elle n't appartient probablement pas ici.

---

## Récapitulatif des actions

| Priorité | Item | Effort estimé | Bloquant |
|----------|------|---------------|---------|
| HAUTE | H1 — Implémenter CSP | Faible (1 balise meta + tests) | Oui |
| HAUTE | H2 — Limite taille import (10 Mo) | Faible (quelques lignes dans uploader.js) | Oui |
| HAUTE | H3 — Validation MIME + extension | Faible | Oui |
| HAUTE | H4 — Conditionner debug panel | Moyen | Oui |
| HAUTE | H5 — Audit fetch/XHR résiduels | Faible (grep) | Oui |
| MOYENNE | M1 — Validation localStorage à la lecture | Moyen | Non |
| MOYENNE | M2 — Checksum vendor SheetJS | Très faible (documentation) | Non |
| MOYENNE | M3 — Réduction logs console | Faible | Non |
| MOYENNE | M4 — Gestion XLSX corrompu | Faible | Non |
| MOYENNE | M5 — Audit attributs data-* et href dynamiques | Faible (grep + review) | Non |
| FAIBLE | F1–F5 | Variable | Non |

---

*Ce document est une référence vivante. Il doit être mis à jour à chaque évolution
significative de l'architecture ou des audits de sécurité.*
