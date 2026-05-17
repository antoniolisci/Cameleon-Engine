# architecture_decisions — Décisions d'architecture

**Statut :** Actif

## Rôle

Conserve l'historique des décisions structurelles du projet : ce qui a été choisi, ce qui a été abandonné, et pourquoi. Évite de reparcourir des chemins déjà explorés.

## Ce qu'on y met

- Décisions d'architecture validées (avec justification)
- Systèmes envisagés puis abandonnés (avec raison)
- Contraintes techniques ayant orienté un choix
- Orientations structurelles durables
- Ruptures de paradigme (ex : passage à ES modules, suppression d'une dépendance)

## Ce qu'on n'y met pas

- Décisions UI mineures (→ `ui_layout/`)
- Bugs et correctifs (→ `bugs_console/`)
- Notes d'intégration entre modules (→ `integration_notes/`)
- Code source ou extraits de code bruts sans contexte décisionnel

## Règles de nommage

```
ADR_NNN_sujet_court.md
```
Exemples : `ADR_001_zero_dependances_npm.md`, `ADR_002_module_comportemental_isole.md`

## Exemple de fiche

```markdown
# ADR-001 — Zéro dépendance npm

## Décision
Aucun npm, aucun bundler, aucun framework. ES modules natifs uniquement.

## Raison
Simplicité de déploiement. Pas de build. Rechargement immédiat en développement.

## Alternatives écartées
- Vite : trop lourd pour un outil mono-page sans CI
- React : sur-ingénierie pour un formulaire à 16 champs

## Statut
Validé — permanent
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté à chaque décision structurelle significative.
