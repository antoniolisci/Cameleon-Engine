# moteur_decision — Mémoire du moteur principal

**Statut :** Actif

## Rôle

Conserve les observations, décisions et évolutions liées au moteur de décision de Caméléon Engine. Documente la logique de scoring, les règles de validation et les protections critiques.

## Rappel du pipeline moteur

```
Form Input (16 champs)
  → mapLegacyMarketState()
  → baseEngine()            ← score brut 0–100
  → profileMatrix()         ← filtre PASSIVE / BALANCED / ACTIVE
  → applyAdaptiveFilter()   ← needAction × coreOrders
  → applyValidation()       ← verrou humain
  → computeTradingPolicy()  ← posture + actions
  → buildPayload()          ← objet décision final
```

## Ce qu'on y met

- Observations sur le comportement du scoring en conditions réelles
- Règles de décision : leur logique, leurs seuils, leurs effets
- Évolutions des filtres et leurs raisons
- Protections critiques et verrous (ex : human lock)
- Cas où le moteur produit un résultat inattendu
- Notes sur la cohérence décisionnelle entre états

## Ce qu'on n'y met pas

- Code source du moteur (→ `src/js/engine.js`, `decision.js`, `trading-policy.js`)
- Bugs JS du moteur (→ `bugs_console/`)
- Décisions d'architecture structurelles (→ `architecture_decisions/`)
- Cas d'import (→ `imports_excel_csv/`)

## Règles de nommage

```
MOTEUR_NNN_description_courte.md
```
Exemples : `MOTEUR_001_filtre_adaptive_comportement.md`, `MOTEUR_002_score_brut_seuils.md`

## Exemple de fiche

```markdown
# MOTEUR-001 — Comportement du filtre adaptatif sur needAction bas

## Observation
Quand needAction = 1 et coreOrders = 0, le score final est réduit de ~30%.
Résultat : posture OBSERVATION même avec un score brut de 65.

## Cause
applyAdaptiveFilter() multiplie le score par (needAction × 0.4 + coreOrders × 0.6).

## Évaluation
Comportement correct pour l'usage visé — évite les faux positifs en marché plat.

## Statut
Documenté — validé
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté lors de chaque observation significative sur le comportement du moteur.
