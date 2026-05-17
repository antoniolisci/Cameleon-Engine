# test_protocols — Protocoles de test

**Statut :** Actif

## Rôle

Documente les protocoles de test reproductibles pour les fonctionnalités clés de Caméléon Engine. Ces protocoles permettent de vérifier qu'une fonctionnalité fonctionne correctement après une modification.

## Rappel

Caméléon Engine n'a pas de suite de tests automatisés. Les tests sont manuels et reposent sur des protocoles définis ici. Un protocole = une séquence d'actions précise avec un résultat attendu.

## Ce qu'on y met

- Protocoles de test pour le moteur de décision
- Protocoles pour l'import CSV/XLSX (fichiers de référence identifiés)
- Protocoles pour le module comportemental
- Protocoles de régression après modification
- Cas de test couvrant les valeurs limites et les états extrêmes

## Ce qu'on n'y met pas

- Résultats de tests (sauf si documentés comme snapshot → `state_snapshots/`)
- Bugs trouvés lors des tests (→ `bugs_console/`)
- Scripts de test automatisés (inexistants dans ce projet)

## Règles de nommage

```
TEST_NNN_module_fonctionnalite.md
```
Exemples : `TEST_001_moteur_scoring_valeurs_extremes.md`, `TEST_002_import_binance_order_history.md`

## Exemple de fiche

```markdown
# TEST-001 — Moteur : scoring sur valeurs extrêmes

## Objectif
Vérifier que le moteur produit des résultats cohérents aux deux extrêmes du formulaire.

## Pré-requis
Serveur local actif sur http://localhost:8000/src/index.html

## Séquence

### Cas 1 — Tout favorable
1. Mettre tous les champs au maximum positif
2. Profil : ACTIVE
3. Cliquer "Analyser"
4. **Attendu** : score ≥ 85, posture ENGAGEMENT, riskLevel bas

### Cas 2 — Tout défavorable
1. Mettre tous les champs au minimum ou en opposition
2. Profil : PASSIVE
3. Cliquer "Analyser"
4. **Attendu** : score ≤ 20, posture OBSERVATION, riskLevel élevé

## Fichier de référence
`state_snapshots/SNAP_001_...`

## Statut
À créer
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté avant toute modification touchant le moteur, l'import ou le module comportemental.
