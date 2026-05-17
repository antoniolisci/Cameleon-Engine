# state_snapshots — Captures d'état système

**Statut :** Actif

## Rôle

Conserve des instantanés de l'état du système à des moments clés : avant une refonte, après un bug critique, lors d'un comportement inattendu. Permet de comparer un état antérieur avec l'état courant.

## Ce qu'on y met

- Snapshots de `localStorage` à un instant T
- État du moteur lors d'un comportement anormal documenté
- Valeurs des 16 champs d'entrée ayant produit un résultat surprenant
- Payload `buildPayload()` de référence pour des cas tests
- Captures avant/après une modification majeure du moteur

## Ce qu'on n'y met pas

- Données sensibles ou identifiantes
- Snapshots de routine sans valeur documentaire
- Fichiers JSON bruts sans contexte (toujours accompagner d'une fiche)

## Règles de nommage

```
SNAP_NNN_contexte_date.md
```
Exemples : `SNAP_001_avant_refonte_scoring_2025-05.md`, `SNAP_002_bug_posture_undefined.md`

## Exemple de fiche

```markdown
# SNAP-001 — État moteur avant refonte du filtre adaptatif

## Contexte
Snapshot pris avant modification de applyAdaptiveFilter() — mai 2025.

## Entrées (16 champs)
tendance: haussière, structure: propre, volatilité: modérée, ...

## Payload buildPayload()
```json
{
  "posture": "ENGAGEMENT",
  "score": 72,
  "riskLevel": "modéré",
  "allowed": ["entry_long", "scale_in"],
  "forbidden": ["short", "revenge_trade"]
}
```

## Statut
Référence archivée
## Date
2025-05-XX
```

## Statut du dossier

Actif — alimenté avant toute modification significative du moteur ou lors d'un état anormal documenté.
