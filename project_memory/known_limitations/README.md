# known_limitations — Limitations connues

**Statut :** Actif

## Rôle

Répertorie les limitations connues et acceptées du système. Ces limites ne sont pas des bugs — elles sont documentées, comprises, et non bloquantes dans l'usage courant.

## Ce qu'on y met

- Limites fonctionnelles connues et volontaires
- Cas non couverts par le moteur ou l'import
- Contraintes techniques acceptées (navigateur, localStorage, ES modules)
- Comportements attendus qui peuvent surprendre un utilisateur non averti
- Limites de précision ou de couverture des algorithmes

## Ce qu'on n'y met pas

- Bugs actifs à corriger (→ `bugs_console/`)
- Limitations temporaires en cours de résolution
- Limitations liées à une régression (→ traiter comme bug)

## Règles de nommage

```
LIMIT_NNN_description_courte.md
```
Exemples : `LIMIT_001_localStorage_cap_50_snapshots.md`, `LIMIT_002_csv_binance_format_unique.md`

## Exemple de fiche

```markdown
# LIMIT-001 — localStorage limité à 50 snapshots

## Description
L'historique des décisions est plafonné à 50 entrées dans localStorage.
Au-delà, le plus ancien snapshot est supprimé (rotation FIFO).

## Raison
Prévenir le dépassement de quota localStorage (~5 Mo selon navigateur).

## Impact
Historique tronqué sur des sessions longues. Pas de perte de données en cours de session.

## Contournement
Export manuel de l'historique avant dépassement (non implémenté à ce jour).

## Statut
Documenté — accepté
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté dès qu'une limite est identifiée et jugée non bloquante.
