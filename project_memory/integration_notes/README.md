# integration_notes — Notes d'intégration entre modules

**Statut :** Actif

## Rôle

Documente les points de connexion, de tension ou de coordination entre les différents modules de Caméléon Engine. Utile quand une modification dans un module affecte un autre.

## Ce qu'on y met

- Interfaces entre modules (ce que A attend de B)
- Effets de bord observés entre modules
- Contrats d'isolation à respecter (ex : module comportemental)
- Notes sur les dépendances implicites
- Observations lors de refactorings qui touchent plusieurs fichiers
- Comportements croisés non documentés dans le code

## Ce qu'on n'y met pas

- Documentation interne d'un seul module (→ dans le module lui-même)
- Bugs isolés à un module (→ `bugs_console/`)
- Décisions d'architecture globales (→ `architecture_decisions/`)

## Règles de nommage

```
INT_NNN_moduleA_moduleB_sujet.md
```
Exemples : `INT_001_render_engine_payload.md`, `INT_002_behavior_isolation_contrat.md`

## Exemple de fiche

```markdown
# INT-001 — render.js ↔ engine.js : contrat buildPayload()

## Modules concernés
`engine.js` (producteur) → `render.js` (consommateur)

## Interface
`buildPayload()` retourne un objet structuré.
`render.js` l'attend avec : `posture`, `allowed`, `forbidden`, `riskLevel`, `score`.

## Tension observée
Si `posture` est undefined (init partiel), render.js crashe ligne 312.

## Correctif
Guard ajouté dans renderDecision() — voir BUG_002.

## Statut
Stable
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté lors de modifications touchant plusieurs modules simultanément.
