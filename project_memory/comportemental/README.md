# comportemental — Module comportemental

**Statut :** Actif

## Rôle

Mémoire du système d'analyse comportementale de Caméléon Engine. Documente la logique de détection des profils, les patterns observés, les ajustements de scoring et les décisions liées au comportement opérateur.

## Rappel d'architecture

Le module comportemental (`src/js/behavior/`) est strictement isolé :
- Il ne lit rien du moteur principal
- Il ne persiste rien (mémoire en session uniquement)
- Il produit un label : **Discipliné / Réactif / Impulsif / Agressif**

Pipeline : `CSV → parser → canonical → metrics → patterns → scoring → coaching → view`

## Ce qu'on y met

- Logique des profils comportementaux et leurs seuils
- Cas de détection : overtrading, FOMO, rapid re-entry, sur-exposition
- Observations terrain sur les patterns réels
- Ajustements de scoring comportemental
- Notes sur le coaching adaptatif
- Cas limites et comportements ambigus

## Ce qu'on n'y met pas

- Code source du module (→ `src/js/behavior/`)
- Bugs console liés au module (→ `bugs_console/`)
- Données CSV utilisateur (→ `excel_tests/`)
- Décisions moteur principal (→ `moteur_decision/`)

## Règles de nommage

```
BHV_NNN_description_courte.md
```
Exemples : `BHV_001_seuil_overtrading_calibration.md`, `BHV_002_profil_impulsif_cas_reels.md`

## Exemple de fiche

```markdown
# BHV-001 — Calibration du seuil overtrading

## Observation
Profil Impulsif déclenché sur 4 trades en 30 min — cohérent avec données terrain.

## Seuil actuel
> 5 trades / heure OU > 3 trades consécutifs sans pause > 2 min

## Cas limite
Scalper légitime avec stratégie rapide → faux positif possible.

## Recommandation
Ajouter un flag "mode scalping" pour neutraliser le seuil overtrading.

## Statut
En observation
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté lors des sessions d'analyse comportementale et de calibration des profils.
