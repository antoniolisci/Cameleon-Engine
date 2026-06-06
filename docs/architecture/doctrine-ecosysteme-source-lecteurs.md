# Doctrine écosystème — Une source de vérité, plusieurs lecteurs

> Statut : doctrine long terme figée. Aucune implémentation prévue.
> Portée : vision 5–10 ans. Solo founder. Contrainte navigateur.
> Ne pas transformer en chantier actif.

---

## Loi fondatrice

Il n'y a pas quatre applications. Il y a une source de vérité et des lecteurs.

Caméléon Engine observe la réalité. Les modules futurs (Mémoire, Scribe,
Constellium) ne produisent aucune réalité primaire : ils relisent, racontent
ou orientent à partir de ce que Caméléon a observé.

C'est l'extension directe du principe déjà en place dans le moteur :
`payload → cockpit`. Le payload est la vérité ; le cockpit est une vue dérivée.
À l'échelle de l'écosystème : le journal observable est la vérité ; les modules
futurs sont des cockpits supplémentaires.

---

## Rôles distincts

**Caméléon Engine — source**
Question : "Que se passe-t-il ?"
Rôle : observer la réalité (imports, trades, états, comportements, contexte marché).

**Mémoire du Caméléon — lecteur futur**
Question : "Qu'ai-je déjà vécu de comparable ?"
Rôle : relire le passé à partir du journal. Projection, pas source.

**Scribe du Caméléon — lecteur futur**
Question : "Comment le raconter ?"
Rôle : transformer les faits en journal, récit ou synthèse. Projection narrative.

**Constellium — lecteur futur**
Question : "Où suis-je, où vais-je ?"
Rôle : lire les équilibres stratégiques. Projection d'orientation.

---

## Vision technique — journal observable

La vision cible est un journal d'événements append-only : un seul store,
propriété de Caméléon Engine, qui enregistre des faits horodatés et immuables.

Chaque module futur construirait sa propre projection locale (index, cache,
vue matérialisée) depuis ce journal — jetable et reconstructible.
Les modules ne se parleraient jamais entre eux. Tout passerait par le journal.

Cette vision est cohérente avec la philosophie du projet :
le système automatise le contexte, l'humain reste responsable de l'action.
Un journal observable est précisément ce dont un outil de lucidité a besoin.

Cette vision n'est pas implémentée.

---

## Règle absolue

Ne pas construire Mémoire du Caméléon, Scribe du Caméléon ou Constellium
avant que chacun ait un signal terrain réel justifiant son existence.

Nommer un module n'est pas l'autoriser. La tentation de "brancher un lecteur"
sur un journal existant est prévisible — c'est précisément le piège à éviter.
Un lecteur n'existe que s'il répond à un besoin réel d'un utilisateur réel,
démontré par l'usage, pas par la vision.

Le danger principal n'est pas de ne pas construire ces modules.
Le danger est de construire l'écosystème avant que Caméléon Engine ait prouvé
sa valeur sur le terrain.

---

## Limites identifiées

Ces limites ont été révélées par la critique architecturale du document fondateur.
Elles ne bloquent pas la roadmap actuelle. Elles devront être résolues avant
toute implémentation du journal.

**Immuabilité navigateur**
`localStorage` et `IndexedDB` n'offrent aucune garantie d'immuabilité réelle.
Un effacement utilisateur, une pression mémoire ou un bug détruit le journal.
Sans persistance garantie, l'immuabilité est une convention, pas une propriété.

**Multi-device non trivial**
L'union d'événements par identifiant unique résout la déduplication technique,
pas la déduplication sémantique. Deux imports du même CSV sur deux appareils
produisent des événements distincts couvrant la même réalité.
Ce problème n'est pas résolu par une structure d'enveloppe.

**Observation vs interprétation**
La frontière entre un fait observé (Layer 1) et un état calculé par le moteur
est instable dans ce domaine. Un score, une posture, un état comportemental
sont des interprétations, pas des observations. Cette ligne doit être tracée
de façon opérationnelle avant toute implémentation — pas philosophiquement.

**Évolution de schéma**
Un journal append-only versionné suppose une stratégie de migration explicite
lorsqu'un type d'événement évolue. Cette stratégie n'est pas définie.

**Identité utilisateur absente**
L'introduction d'un compte utilisateur (dans la roadmap officielle) rend
la rétroattribution d'événements anonymes à un utilisateur coûteuse.
L'enveloppe devra intégrer ce champ avant que le journal ne grossisse.

**Charge solo**
Quatre codebases, même conçues comme modules d'un seul journal, représentent
quatre contextes de maintenance pour une seule personne.
L'event sourcing a fait échouer des équipes entières. La faisabilité en solo
sur 10 ans est une déclaration, pas une démonstration.

---

## Questions ouvertes

Ces questions ne bloquent pas la roadmap actuelle.
Elles devront recevoir une réponse opérationnelle avant toute implémentation
du journal d'événements.

1. Quand le journal quitte-t-il le navigateur ? Sur quel signal terrain ?
2. Quelle stratégie de sauvegarde et d'export pour l'utilisateur ?
3. Quelle frontière opérationnelle entre Layer 1 (observation pure) et les
   couches dérivées (inférence, interprétation, coaching) ?
4. Comment gérer la migration de schéma lorsqu'un type d'événement évolue ?
5. Comment intégrer l'identité utilisateur dans l'enveloppe sans casser
   la structure actuelle lors de l'introduction du compte utilisateur ?
6. Comment éviter que la nomination des modules futurs ne crée une gravité
   mentale conduisant à les construire prématurément ?

---

## Décision actuelle

Aucune implémentation immédiate n'est prévue.

Le journal observable reste une vision architecturale. Il n'existe pas dans
le code. Aucune structure de store, aucune enveloppe d'événement, aucune
table de projection, aucun module ne doit être créé en dehors de la roadmap
officielle.

La roadmap officielle en vigueur est :

1. Portefeuille utilisateur interne
2. Mémoire opérateur
3. PDF Import V1
4. Compte utilisateur
5. Paiement
6. Mise en ligne
7. Validation terrain

Ce document est une boussole, pas un plan d'exécution.
Il protège la vision sans la transformer en dette prématurée.

---

## Statut

Doctrine validée. Aucun chantier ouvert. Aucune implémentation prévue.

À relire uniquement après validation terrain de Caméléon Engine.

Toute proposition de développement liée à Mémoire du Caméléon, Scribe du
Caméléon ou Constellium doit démontrer un besoin utilisateur réel avant
d'être acceptée. La vision ne suffit pas. Le terrain décide.
