# OVH-STATIC-DEPLOYMENT-V1 — Déploiement Caméléon Engine sur OVH

> Document opérationnel · 2026-06-08
> Référence : DEC-FOUNDATIONS-01 (D1) · PROTOCOLE-BETA-V1
> Statut : PLAN VALIDÉ — en attente d'exécution

---

## 1. Contexte

Caméléon Engine est une application **100% statique** (HTML/CSS/JS, ES modules, aucun backend, aucun build step). Elle persiste ses données via `localStorage` uniquement. Aucune donnée ne transite par un serveur.

Le domaine `cameleonengine.app` est enregistré chez OVH. Il affiche actuellement la page OVH "Site en construction". Le repo GitHub est **privé** — GitHub Pages n'est donc pas utilisable sans plan payant. Décision retenue : déploiement direct sur l'hébergement mutualisé OVH.

Ce document couvre le déploiement initial (bêta fermée). Il n'implique aucune modification du code source.

---

## 2. État actuel du domaine

| Élément | État |
|---|---|
| Domaine | `cameleonengine.app` — enregistré chez OVH |
| DNS | Résolution active |
| HTTPS | Actif (certificat SSL OVH) |
| Page actuelle | Page OVH "Site en construction" |
| Gate D1 (DEC-FOUNDATIONS-01) | ✅ Validé — domaine enregistré + HTTPS actif |

---

## 3. Architecture statique de l'application

### Point d'entrée

`src/index.html` — fichier HTML unique, SPA.

### Dépendances chargées par l'HTML

```
./css/style.css
./css/behavior.css
./js/onboarding-init.js
./js/render.js                   (type="module")
./js/behavior/behavior-main.js   (type="module")
```

Toutes locales. Aucun CDN, aucune ressource externe.

### Chemins d'assets dans le code

| Source | Chemin écrit | Résolution sur serveur |
|---|---|---|
| `src/css/style.css` | `../../assets/images/cameleon-logo.png` | `/assets/images/cameleon-logo.png` |
| `src/js/render.js` | `../assets/images/cameleon-logo.png` | `/assets/images/cameleon-logo.png` |
| `src/js/data.js` | `../assets/images/cameleon-logo.png` | `/assets/images/cameleon-logo.png` |
| `src/js/behavior/behavior-matrix.js` | `../assets/images/[dossier]/[fichier].png` | `/assets/images/[dossier]/[fichier].png` |

**Note chemin CSS :** `../../assets/` depuis `/css/style.css` → la résolution URL RFC 3986 ne peut dépasser la racine, donc `../../` depuis `/css/` = `/`. Résultat : `/assets/`. Ce chemin fonctionne correctement une fois `style.css` servi à `/css/style.css`.

### Vendor files critiques

```
src/js/vendor/xlsx.full.min.js     → parser XLSX
src/js/vendor/pdf.min.mjs          → PDF.js moteur
src/js/vendor/pdf.worker.min.mjs   → PDF.js worker (blob: URL)
```

**Point de risque :** OVH mutualisé ne sert pas les fichiers `.mjs` avec le MIME type `application/javascript` par défaut. Le module ES et le worker PDF.js ne chargeront pas. Un `.htaccess` est requis (voir §6).

### Vidéos

Aucun chemin vidéo dans le code. Le slot logo `<video>` est vide (dette MD-01). Les dossiers vidéo **ne font pas partie du déploiement**.

---

## 4. Fichiers à publier

Structure cible après déploiement sur OVH (`www/` = racine web) :

```
www/
├── .htaccess                          ← à créer (MIME .mjs + sécurité)
├── index.html                         ← depuis src/index.html
├── css/
│   ├── style.css
│   └── behavior.css
├── js/
│   ├── render.js
│   ├── data.js
│   ├── state.js
│   ├── storage.js
│   ├── engine.js
│   ├── decision.js
│   ├── market-state.js
│   ├── trading-policy.js
│   ├── moteur.js
│   ├── confidence-score.js
│   ├── execution-confidence.js
│   ├── friction.js
│   ├── macro-context.js
│   ├── ux-state.js
│   ├── dictionary.js
│   ├── overtrading-dictionary.js
│   ├── tone.js
│   ├── onboarding-init.js
│   ├── behavior.js
│   ├── vendor/
│   │   ├── xlsx.full.min.js
│   │   ├── pdf.min.mjs
│   │   └── pdf.worker.min.mjs
│   ├── v2/
│   │   ├── flags.js
│   │   ├── types.js
│   │   ├── coherence.js
│   │   ├── hierarchy.js
│   │   ├── attention.js
│   │   ├── exposition.js
│   │   ├── calibration.js
│   │   └── pipeline-v2.js
│   └── behavior/
│       ├── behavior-main.js
│       ├── behavior-bridge.js
│       ├── behavior-matrix.js
│       ├── analytics/
│       │   ├── behavior-analyzer.js
│       │   ├── coaching.js
│       │   ├── grid-grouper.js
│       │   ├── metrics.js
│       │   ├── order-analyzer.js
│       │   ├── patterns.js
│       │   ├── scoring.js
│       │   ├── style.js
│       │   └── wallet_analyzer.js  [sic — nom actuel]
│       ├── anonymize/
│       │   └── anonymizer.js
│       ├── import/
│       │   ├── format-detector.js
│       │   ├── parser.js
│       │   ├── pdf-family-detector.js
│       │   ├── pdf-loader.js
│       │   ├── pdf-normalizer.js
│       │   ├── pdf-table-extractor.js
│       │   └── uploader.js
│       ├── normalize/
│       │   ├── canonical.js
│       │   ├── trade-validator.js
│       │   ├── validator.js
│       │   └── mappers/
│       │       ├── binance_spot.js
│       │       └── binance_order.js
│       ├── storage/
│       │   ├── behavior-repo.js
│       │   ├── portfolio-repo.js
│       │   └── session-repo.js
│       ├── ui/
│       │   └── behavior-view.js
│       └── wallet/
│           ├── portfolio-extractor.js
│           └── wallet_analyzer.js
└── assets/
    └── images/
        ├── cameleon-logo.png
        ├── discipline/
        │   ├── discipline_lvl1_calm.png
        │   ├── discipline_lvl2_observe.png
        │   ├── discipline_lvl3_align.png
        │   ├── discipline_lvl4_master.png
        │   └── discipline_lvl5_detach.png
        ├── fomo/
        │   ├── fomo_lvl1_curiosity.png
        │   ├── fomo_lvl2_attraction.png
        │   ├── fomo_lvl3_tension.png
        │   ├── fomo_lvl4_impulse.png
        │   └── fomo_lvl5_trap.png
        ├── overtrading/
        │   ├── overtrading_lvl1_mild.png
        │   ├── overtrading_lvl2_active.png
        │   ├── overtrading_lvl3_reactive.png
        │   ├── overtrading_lvl4_emotional.png
        │   └── overtrading_lvl5_chaos.png
        ├── revenge/
        │   ├── revenge_lvl1_frustration.png
        │   ├── revenge_lvl2_recover.png
        │   ├── revenge_lvl3_forced.png
        │   ├── revenge_lvl4_spiral.png
        │   └── revenge_lvl5_collapse.png
        └── logo/
            ├── logo_haut.jpeg
            └── logo_bas.jpeg
```

---

## 5. Fichiers à exclure

Ces fichiers ne doivent **jamais** être publiés sur le serveur OVH.

| Chemin repo | Raison |
|---|---|
| `docs/` | Documentation interne projet |
| `project_memory/` | Mémoire projet interne |
| `prototype/` | Prototypes de laboratoire |
| `src/constellium.html` | Page Constellium — couche dormante (D3) |
| `src/tests/` | Page de test développeur |
| `src/js/behavior/README.md` | Documentation interne |
| `src/css/constellium.css` | CSS Constellium — couche dormante |
| `assets/excel_tests/` | Données de test réelles |
| `assets/video/` (tout) | Aucune vidéo référencée dans le code |
| `assets/images/images_supprimees/` | Assets supprimés |
| `assets/images/CONSTELLIUM_VISUALS_Images/` | Constellium dormant |
| `assets/images/constellium-main.png` | Constellium dormant |
| `assets/images/constellium-guide.png` | Constellium dormant |
| `serve-local.ps1`, `serve-local.cmd` | Outils de développement local |
| `CLAUDE.md` | Configuration IA interne |
| `UX_NOTES.md` | Notes de design internes |
| `.gitignore` | Configuration Git |
| `.git/` | Internals Git |
| `docs/source-v*.html` | Archives de versions précédentes |

---

## 6. Méthode de déploiement OVH recommandée

### Outil : FileZilla (SFTP)

OVH mutualisé expose un accès SFTP. C'est la méthode la plus fiable pour un transfert initial.

**Identifiants SFTP :** disponibles dans OVH Manager → Hébergements → `cameleonengine.app` → FTP - SSH.

**Hôte :** fourni par OVH (format `ftp.cluster0XX.hosting.ovh.net`)
**Port :** 22 (SFTP) ou 21 (FTP — moins sécurisé)
**Dossier cible OVH :** `www/` (racine web de l'hébergement)

### Contenu du `.htaccess` à créer

Créer un fichier `.htaccess` à la racine (`www/`) **avant** d'uploader les autres fichiers :

```apache
# MIME type pour ES modules (.mjs) — requis pour PDF.js worker
AddType application/javascript .mjs

# Désactiver le listage des répertoires
Options -Indexes

# Sécurité headers de base
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "no-referrer"
</IfModule>
```

**Le `.htaccess` est critique.** Sans la ligne `AddType`, les fichiers `.mjs` seront servis avec un MIME type incorrect et le navigateur refusera de les charger.

---

## 7. Procédure pas à pas

### Étape 1 — Préparer le `.htaccess`

Créer localement un fichier `.htaccess` avec le contenu de la section §6.

### Étape 2 — Vider la page "Site en construction" OVH

Dans le dossier `www/` sur OVH, supprimer le fichier `index.html` (ou `index.php`) OVH d'origine.

### Étape 3 — Uploader le `.htaccess` en premier

Via FileZilla : uploader `.htaccess` à la racine `www/`. Vérifier qu'il est visible côté serveur.

### Étape 4 — Uploader les fichiers de l'application

Via FileZilla, uploader dans `www/` :
1. `index.html` (copie de `src/index.html`)
2. Dossier `css/` (copie de `src/css/`)
3. Dossier `js/` (copie de `src/js/`, en excluant `src/js/behavior/README.md`, `src/css/constellium.css`)
4. Dossier `assets/images/` (uniquement les sous-dossiers listés en §4)

**Ne pas uploader** les dossiers exclus listés en §5.

### Étape 5 — Vérification immédiate

Ouvrir `https://cameleonengine.app/` dans un navigateur. Consulter la Console (F12) pour s'assurer qu'aucune erreur 404 ou MIME error n'apparaît.

---

## 8. Vérifications post-déploiement

| Test | Méthode | Attendu |
|---|---|---|
| Page chargée | Navigateur → `https://cameleonengine.app/` | Interface Caméléon Engine visible |
| Console propre | F12 → Console | 0 erreur, 0 warning réseau |
| HTTPS actif | Cadenas navigateur | Certificat valide |
| ES modules | F12 → Network → JS | Status 200, Type `application/javascript` |
| `.mjs` chargés | F12 → Network → filtrer `.mjs` | Status 200, MIME `application/javascript` |
| localStorage disponible | Debug Brain → Stockage | "Disponible" |
| Session moteur | Remplir les 16 champs → Analyser | Décision produite, snapshot persisté |
| Export JSON | Onglet Mémoire → Exporter | Fichier `.json` téléchargé |
| Import CSV | Comportement → importer un fichier | Pipeline complet sans erreur |
| Images comportementales | Lancer une analyse comportementale | Images profil visibles |
| Reload persistance | Fermer/rouvrir → onglet Mémoire | Historique présent |

---

## 9. Rollback

Le rollback est simple : OVH conserve la page "Site en construction" d'origine.

**Procédure :**
1. Supprimer `index.html` et les dossiers déployés via FileZilla
2. Re-uploader le fichier `index.html` OVH d'origine (ou un placeholder minimaliste)
3. Le domaine est de nouveau vierge en quelques secondes

Aucune donnée utilisateur n'est stockée sur le serveur — le rollback ne détruit rien côté opérateur.

---

## 10. Risques connus

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| `.mjs` MIME type incorrect | **Élevée** | Critique — PDF.js ne charge pas | `.htaccess` avec `AddType` obligatoire |
| Fichier interne publié par erreur | Faible | Sensible (docs internes) | Vérifier §5 avant upload, pas d'upload en masse |
| Cache navigateur ancienne version | Faible | UX dégradée | Ctrl+Shift+R pour forcer reload |
| OVH désactive `mod_headers` | Faible | Security headers absents | Non critique pour la bêta |
| `crypto.randomUUID()` sans HTTPS | N/A | Critique | HTTPS déjà actif sur OVH ✓ |
| Changement de domaine post-J0 | Aucun | Perte données certaine | Domaine figé — ne jamais changer |

---

## 11. Décision finale

| Critère | État |
|---|---|
| Application déployable sans build | ✅ |
| Paths assets compatibles avec racine OVH | ✅ (vérifié — résolution URL) |
| HTTPS actif | ✅ |
| Domaine enregistré | ✅ |
| localStorage origin correcte | ✅ (`https://cameleonengine.app`) |
| Aucune donnée envoyée à un serveur | ✅ (CSP `default-src 'self'`) |
| Aucun fichier privé dans le périmètre | ✅ (liste §5 vérifiée) |
| Risque `.mjs` MIME identifié + mitigation | ✅ (`.htaccess` requis) |

**Verdict : PRÊT pour déploiement.**

Seul prérequis avant exécution : créer le `.htaccess` localement (§6) et suivre la procédure §7 dans l'ordre.

---

*Ce document est opérationnel — aucune modification du code source n'est requise.*
*Le déploiement n'a pas encore eu lieu à la date de rédaction de ce document.*
