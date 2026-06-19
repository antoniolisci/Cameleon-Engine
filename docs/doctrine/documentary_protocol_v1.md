# Protocole documentaire V1 — Caméléon Engine

**Statut :** Doctrine permanente · N2 · Validé 2026-06-19  
**Remplace :** aucun document antérieur — premier protocole explicite  
**Niveau de contrainte :** obligatoire à chaque clôture de chantier

---

## 1. Source canonique par type d'information

| Type d'information | Source canonique | Lecture par Claude | Lecture humaine sans terminal |
|---|---|---|---|
| Code, logique métier | **Git (`main`)** | ✅ direct | GitHub |
| Architecture, décisions figées | **`docs/`** | ✅ direct | GitHub / éditeur |
| État courant, chantiers ouverts/clos, feedback | **`MEMORY.md` + `project_*.md`** | ✅ chargé automatiquement | `.claude/projects/` |
| Tableau de bord produit, ADRs navigables | **Notion** | via MCP (non automatique) | ✅ direct |

**Règle de résolution de conflit :**  
Si Git/docs/ et Notion divergent → Git/docs/ fait foi.  
Si MEMORY.md et Notion divergent → MEMORY.md fait foi (plus récent par construction).  
Notion n'est jamais source de vérité technique.

---

## 2. Ce que Notion doit contenir — et rien d'autre

Notion est une **vitrine de synthèse**. Il doit refléter :

1. **L'état du projet à la granularité des chantiers** — pas des commits, pas des sessions.
2. **Les ADRs structurantes** (Journal de décisions) — décisions qui durent au-delà d'un chantier.
3. **L'architecture produit officielle** — mise à jour quand une couche change de statut.

Notion ne doit pas contenir :
- Le détail des commits
- Les diagnostics de session (valeurs runtime, résultats de debug)
- Les éléments déjà dans `docs/` ou `MEMORY.md` qui n'ont pas de valeur de navigation

---

## 3. Déclencheurs de mise à jour Notion

Une mise à jour Notion est **obligatoire** dans les cas suivants :

| Déclencheur | Page(s) à mettre à jour |
|---|---|
| Clôture d'un chantier V1 (feature ou fix majeur validé terrain) | 🦎 Caméléon Engine — section "Mise à jour YYYY-MM-DD" |
| Ouverture formelle d'un chantier futur (V2, nouveau module) | 🦎 Caméléon Engine — section "Mise à jour YYYY-MM-DD" |
| ADR structurante (décision qui dure au-delà du chantier) | 📋 Journal de décisions — nouvelle entrée ADR-NNN |
| Validation terrain significative (nouveau format, nouveau dataset) | 🦎 Caméléon Engine — section "Mise à jour YYYY-MM-DD" |
| Changement de statut d'une couche architecturale | 🏗️ Architecture Produit Officielle |

Une mise à jour Notion n'est **pas requise** pour :
- Commits de fix dans un chantier déjà ouvert (couverts par la clôture)
- Mises à jour MEMORY.md / project_*.md intrasession
- Cleanup, refactor, debug interne sans impact architecture

---

## 4. Workflow officiel de clôture de chantier

```
1. VALIDATION TERRAIN
   └─ Confirmer que le chantier est fonctionnel en conditions réelles
      (iPad, vrai fichier, résultat attendu vérifié)

2. COMMITS GIT
   └─ Tous les commits dans main
   └─ ovh-deploy synchronisé si code prod

3. DOCUMENTATION LOCALE
   └─ docs/ : document de clôture ou mise à jour architecture si nécessaire
   └─ MEMORY.md : project_*.md mis à jour / créé (état CLOS, commits, limits)

4. SYNCHRONISATION NOTION (obligatoire)
   └─ 🦎 Caméléon Engine : section "Mise à jour YYYY-MM-DD"
      Contenu minimal :
        - Nom du chantier + statut CLOS / OUVERT
        - Ce qui a été livré (3-5 lignes max)
        - Commits clés (1-3 max)
        - Limite connue ou condition de réouverture si applicable
   └─ Journal de décisions : nouvelle ADR si décision structurante

5. DÉCLARATION DE CLÔTURE
   └─ Confirmation explicite : "Chantier X clos. Git ✅ Mémoire ✅ Notion ✅"
```

---

## 5. Format standard d'entrée Notion (🦎 Caméléon Engine)

```markdown
## Mise à jour — YYYY-MM-DD — [Nom du chantier]
**Statut :** CLOS / OUVERT / EN ATTENTE

[Description courte — ce qui a été livré ou décidé]

Commits clés : `abc1234` · `def5678`
Limite connue / condition de réouverture : [ou "aucune"]
```

---

## 6. Règle de non-dérive

Si une session se termine sans mise à jour Notion alors qu'un déclencheur §3 a été atteint :
- La session suivante commence par la synchronisation Notion manquante **avant** d'ouvrir un nouveau chantier.
- Aucun nouveau chantier ne démarre avec Notion en retard de plus d'un chantier.

---

*Ce document est la référence permanente pour tout conflit sur la synchronisation documentaire.*  
*Il peut être révisé uniquement par décision explicite de l'opérateur.*
