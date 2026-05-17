# responsive — Comportement multi-device

**Statut :** Actif

## Rôle

Documente les comportements de l'interface sur différents appareils et tailles d'écran. Conserve les ajustements CSS réalisés et les points de tension observés.

## Ce qu'on y met

- Comportements spécifiques mobile / tablette / desktop
- Problèmes de layout sur certaines résolutions
- Ajustements CSS réalisés et leur effet
- Breakpoints utilisés et leur logique
- Zones de l'UI sensibles au responsive (header, sidebar, panneau décision)
- Cas d'overflow ou de collision de blocs

## Ce qu'on n'y met pas

- Décisions UI générales (→ `ui_layout/`)
- Bugs JS liés au responsive (→ `bugs_console/`)
- Performance sur mobile (→ `performance/`)

## Règles de nommage

```
RESP_NNN_device_sujet.md
```
Exemples : `RESP_001_mobile_header_overflow.md`, `RESP_002_ipad_sidebar_collapse.md`

## Exemple de fiche

```markdown
# RESP-001 — Mobile : overflow du titre hero

## Appareil / Résolution
iPhone 14 Pro — 390px largeur

## Problème observé
Le titre "Caméléon Engine" dépasse le conteneur header sur mobile.
Overflow horizontal visible, scroll non désiré.

## Correctif appliqué
`font-size: clamp(1rem, 4vw, 1.4rem)` sur `.hero-title` dans style.css.

## Statut
Résolu
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté lors de tests sur des appareils ou résolutions non standard.
