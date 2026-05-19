# Bible cognitive — Caméléon Engine

**Date de création :** 2026-05-19
**Statut :** architecture documentaire — en construction progressive
**Périmètre :** connaissance comportementale et structurelle uniquement

---

## 1. Pourquoi ce chantier existe

Caméléon Engine produit des lectures comportementales. Ces lectures s'appuient sur
des concepts — postures, états, patterns, régimes — qui ne sont jamais définis de
façon rigoureuse dans un endroit unique.

Le risque sans ce chantier : chaque session de développement réinvente le vocabulaire,
réinterprète les concepts différemment, ou glisse vers du conseil déguisé. La dérive
sémantique est lente et invisible. Elle produit des contradictions que personne ne
remarque jusqu'à ce qu'elles soient dans le produit.

Ce dossier est la base de référence interne. Il fixe ce que les concepts veulent dire
dans le contexte de Caméléon. Pas dans le contexte du trading en général.

---

## 2. Ce que ce chantier doit produire

- Un **vocabulaire stable** : les mots autorisés, leurs nuances, leurs opposés interdits
- Une **taxonomie** : les grandes familles de concepts, leurs frontières, leurs relations
- Des **squelettes conceptuels** : les patterns comportementaux, les structures de marché,
  les transitions d'état — décrits sobrement, sans agenda prescriptif
- Une **grammaire de lecture** : comment Caméléon nomme les choses, pas comment il les juge
- Un **référentiel de non-dérive** : pour chaque domaine, ce que ce chantier ne doit jamais devenir

Ce que ce chantier produit est de la **connaissance structurée**, pas de la **connaissance
actionnée**. La différence est fondamentale.

---

## 3. Ce que ce chantier ne doit jamais devenir

- Un moteur de signaux — il ne dit pas quand entrer ni quand sortir
- Une encyclopédie trading générique — il ne documente pas le trading, il documente les
  comportements humains *face* au trading
- Un wiki infini — chaque concept doit gagner sa place par son utilité réelle dans le cockpit
- Un système de prédiction — les patterns décrivent, ils ne prédisent pas
- Un assistant prescriptif — aucun concept de ce dossier ne se termine par une recommandation
- Un cours de trading déguisé — le lecteur qui cherche "comment trader" doit repartir déçu

La règle de test : si un concept de ce dossier pouvait apparaître dans un blog trading
générique sans modification, c'est qu'il n'a pas été correctement reformulé dans le
langage Caméléon.

---

## 4. Comment ce dossier sera utilisé par Caméléon Engine

**Aujourd'hui (Phase 0/1) :** référentiel interne. Stabilise le vocabulaire avant que
le moteur ne soit exposé à des utilisateurs. Évite la dérive sémantique lors des itérations.

**Phase 1/2 :** source de vérité pour les libellés du cockpit, les messages de coaching,
les descriptions d'état. Quand le moteur nomme un état, ce dossier dit comment ce nom
doit être compris.

**Phase 2/3 :** base pour les lectures comportementales enrichies. Quand le module
comportemental produit un profil, ce dossier contextualise ce profil sans le surcharger.

**Phase 3+ :** support possible d'un espace pédagogique minimal dans le produit — si et
seulement si la doctrine transmission valide qu'un tel espace renforce la lecture sans
créer de dépendance pédagogique.

Ce dossier ne génère pas de features. Il ancre les features existantes.

---

## 5. Pourquoi la connaissance doit rester comportementale, structurelle et non prescriptive

Caméléon Engine est un cockpit cognitif. Son rôle n'est pas d'agir à la place du trader —
c'est de rendre la situation lisible pour que le trader puisse agir de façon consciente.

Une connaissance prescriptive — "en range instable, faire X" — transfert la décision au
système. C'est l'opposé de ce que Caméléon construit.

Une connaissance comportementale — "en range instable, le trader tend à sur-estimer sa
capacité à lire les fausses cassures" — donne un miroir. Le trader reste l'autorité finale.

La différence n'est pas cosmétique. Elle est architecturale. Toute connaissance de ce
dossier qui glisse vers le prescriptif doit être reformulée ou supprimée.

---

## Structure du dossier

```
docs/cognitive/
├── README.md                        ← ce fichier
├── taxonomy/
│   └── index.md                     ← familles conceptuelles et leurs frontières
├── grammar/
│   └── vocabulaire-cameleon.md      ← mots autorisés, interdits, nuances officielles
├── behavior/
│   └── index.md                     ← psychologie du trader et patterns comportementaux
├── market-structures/
│   └── index.md                     ← structures de marché comme contexte de lecture
├── transitions/
│   └── index.md                     ← changements d'état et moments de rupture
├── anti-patterns/
│   └── index.md                     ← dérives comportementales documentées
├── temporality/
│   └── index.md                     ← temps, cycles, rythmes décisionnels
├── macro-climates/
│   └── index.md                     ← macro comme contexte émotionnel du marché
└── patterns/
    └── index.md                     ← patterns positifs et neutres, lectures structurelles
```

---

*Ce dossier est une architecture. Son contenu se construit progressivement,
par concept validé, jamais par remplissage massif.*
