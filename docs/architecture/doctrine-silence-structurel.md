# Doctrine du silence structurel — Caméléon Engine

**Statut** : Document doctrinal · Aucune implémentation immédiate · Base architecture V2
**Version** : 1.0 — 2026-05-24

---

## Préambule

Ce document formalise une contrainte architecturale fondamentale pour V2 :
le moteur Caméléon détecte plus qu'il n'expose.

Cette asymétrie est intentionnelle.

Un moteur qui expose toute sa vie interne ne produit pas plus d'information utile —
il produit du bruit. La surface calme du cockpit n'est pas un défaut de profondeur.
C'est le résultat d'un traitement actif.

Le silence n'est pas une absence de calcul.
Le silence est une décision architecturale du moteur.

La distinction entre profondeur invisible et cockpit bruyant est centrale :
- **Profondeur invisible** : le moteur détecte, calcule, arbitre, absorbe. Le résultat
  de ce travail est la décision finale. L'opérateur voit la décision, pas le travail.
- **Cockpit bruyant** : le moteur expose chaque tension intermédiaire, chaque
  recalcul, chaque ambiguïté non résolue. L'opérateur doit gérer l'état interne
  du moteur en plus de son propre contexte.

Le cockpit bruyant ne rend pas service à l'opérateur. Il transfère la charge
cognitive du moteur vers l'opérateur. C'est une régression, pas une transparence.

---

## Principe central

Une tension détectée par le moteur n'a pas vocation à être exposée.
Elle a vocation à être absorbée.

L'absorption est l'état par défaut.
L'exposition est l'exception.

L'exception doit satisfaire des critères explicites (voir § Règles de routage).
En l'absence de critère satisfait, la tension reste interne.

Ce principe s'applique à toutes les couches du moteur :
- recalculs de score intermédiaires,
- ajustements de filtre adaptatif,
- tensions entre modules indépendants,
- contradictions structurelles transitoires,
- non-alignements entre profil historique et session courante.

Le moteur ne doit jamais exposer une tension parce qu'elle est détectée.
Il doit l'exposer uniquement parce que son exposition modifie utilement l'action
de l'opérateur.

---

## Typologie des tensions

### Tension absorbée

**Définition** : Tension résolue en interne par la pipeline avant production de
l'output final. Elle modifie le résultat mais n'est jamais visible.

**Visibilité opérateur** : Nulle.

**Effet possible** : Modulation de score, ajustement de posture, filtrage d'action.

**Ne pas faire** : Ne jamais exposer une tension absorbée sous prétexte de
transparence. La pipeline a déjà traité l'information. L'exposer en plus crée
de la redondance.

---

### Tension silencieuse

**Définition** : Tension détectée mais non résolue, dont l'impact sur l'output
est nul ou marginal. Le moteur l'enregistre sans agir dessus.

**Visibilité opérateur** : Nulle.

**Effet possible** : Aucun sur la décision courante. Potentiellement utile pour
un historique de traçage interne en V2.

**Ne pas faire** : Ne pas exposer une tension silencieuse. Elle n'est pas
actionnable. Son exposition serait du bruit pur.

---

### Tension contextuelle

**Définition** : Tension dont l'impact dépend du contexte de session. Significative
dans certaines conditions de marché ou de profil, négligeable dans d'autres.

**Visibilité opérateur** : Conditionnelle — uniquement si les critères de routage
sont satisfaits pour ce contexte précis.

**Effet possible** : Ralentissement, contextualisation, modulation de l'engagement
recommandé.

**Ne pas faire** : Ne pas exposer par défaut. Ne pas empiler avec d'autres tensions
contextuelles. Une seule tension contextuelle visible à la fois.

---

### Tension structurelle

**Définition** : Non-alignement entre deux modules calculés indépendamment,
dont la combinaison modifie la lecture globale du système. Exemples : synthèse
freeware favorable / qualificateur premium contradictoire ; posture moteur ACTIVE /
profil comportemental Impulsif.

**Visibilité opérateur** : Possible si actionnable et si l'opérateur peut agir
sur le contexte qui crée la tension.

**Effet possible** : Contextualisation de la décision, ralentissement volontaire,
signal d'attention sobre.

**Ne pas faire** : Ne pas formuler comme un jugement sur l'opérateur. Ne pas
empiler avec d'autres tensions. Ne pas transformer en recommandation comportementale.

---

### Tension critique

**Définition** : Contradiction entre deux modules dont la non-résolution rendrait
la décision finale non fiable ou structurellement incohérente.

**Visibilité opérateur** : Oui — mais exposée avec une intention unique et claire.

**Effet possible** : Blocage conditionnel, ajustement de posture forcé, signal
d'attention prioritaire.

**Ne pas faire** : Ne pas empiler plusieurs tensions critiques simultanées. Ne pas
sur-expliquer. Ne pas transformer en alerte permanente.

---

### Contradiction bloquante

**Définition** : Cas extrême où les inputs ou les modules produisent une
contradiction irréductible qui empêche le moteur de produire une décision fiable.

**Visibilité opérateur** : Oui — impérativement.

**Effet possible** : Suspension de la décision, demande de révision des inputs,
état d'attente explicite.

**Ne pas faire** : Ne pas simuler une décision malgré la contradiction. Ne pas
masquer une contradiction bloquante par absorption silencieuse.

---

## Règles de routage

Une tension reste interne sauf si elle satisfait **l'ensemble** des critères
suivants :

**1. Réversibilité de l'action**
L'opérateur peut encore modifier son engagement ou son contexte. Si l'action est
déjà engagée, exposer la tension n'a aucun effet utile.

**2. Capacité d'action sur la tension**
L'opérateur dispose d'un levier réel sur ce qui crée la tension. Une tension
structurelle sur la maturité du marché n'est pas actionnable. Une tension entre
engagement déclaré et posture recommandée l'est.

**3. Coût d'interruption acceptable**
L'exposition interrompt le flux de lecture de l'opérateur. Ce coût doit être
inférieur à la valeur de l'information exposée. Pour une tension marginale,
le coût est systématiquement supérieur à la valeur.

**4. Bruit ambiant du cockpit**
Si d'autres informations importantes sont déjà exposées dans la session courante,
une tension supplémentaire aggrave la charge sans proportionner la valeur.
Une seule information remarquable visible à la fois.

**5. Régime de marché**
En régime de volatilité élevée ou de structure dégradée, la tolérance au bruit
est réduite. Le seuil d'exposition doit être relevé, pas abaissé.

**6. Profil comportemental**
Un profil Impulsif est plus sensible au bruit cognitif. L'exposition d'une tension
contextuelle peut aggraver la réactivité au lieu de la réduire. Ce critère ne juge
pas l'opérateur — il ajuste le seuil de routage.

---

## Règles d'exposition

Quand une tension est exposée, les contraintes suivantes s'appliquent :

**Une intention unique par tension exposée.**
Exposer pour expliquer, ou pour ralentir, ou pour contextualiser, ou pour bloquer.
Jamais plusieurs intentions simultanées.

**Pas d'empilement de tensions visibles.**
Si deux tensions satisfont les critères de routage, exposer la plus critique.
L'autre reste silencieuse pour cette session.

**Pas de discours.**
Une tension visible est une information structurelle sobre. Elle n'est pas
une explication, une analyse, ni un commentaire. La forme est la plus courte
possible.

**Pas de tension non actionnable.**
Une tension qui informe sans permettre d'action est du bruit. Elle doit être
absorbée même si elle est structurellement réelle.

**La tension expose un fait, pas un verdict.**
"Distance posture/engagement : +2 crans" est un fait structurel.
"Votre engagement est trop élevé pour ce marché" est un verdict.
Le moteur produit des faits, pas des verdicts.

---

## Règles d'absorption

Les tensions suivantes sont absorbées sans exception :

- **Mécanique interne de pipeline** : recalculs de score intermédiaires,
  pondérations, ajustements de filtre. Ces opérations sont le travail du moteur,
  pas une information pour l'opérateur.

- **Incertitudes non décisives** : ambiguïtés sur un paramètre dont la résolution
  dans un sens ou dans l'autre ne modifie pas la décision finale.

- **Tensions transitoires** : contradictions qui se résolvent en moins d'un cycle
  de calcul ou qui disparaissent avec la mise à jour des inputs.

- **Détails techniques** : valeurs numériques intermédiaires, scores de sous-modules,
  poids de pondération. Ces éléments appartiennent au panel Debug, pas au cockpit.

- **Redondances** : une tension déjà exprimée implicitement dans la décision finale
  n'a pas à être exposée en supplément.

- **Non-alignements sans conséquence** : deux modules peuvent produire des lectures
  légèrement différentes sans que leur combinaison crée un problème réel pour
  l'opérateur.

---

## Silence actif

Le silence du moteur n'est pas une absence.

Chaque silence est le résultat d'une décision architecturale :
la tension a été détectée, évaluée, et son absorption a été choisie.

Silence ≠ absence de traitement.
Silence ≠ opacité.
Silence = traitement complet + décision de non-exposition.

Cette distinction est fondamentale pour l'architecture V2.
Elle implique que le moteur doit être capable de distinguer :
- une tension non détectée (lacune du système),
- une tension détectée et absorbée (décision architecturale),
- une tension détectée et exposée (décision d'exposition).

**Traçage interne (architecture future)**

Une extension possible de cette doctrine est la traçabilité interne des silences
significatifs : enregistrer, sans les exposer, les tensions qui ont été détectées,
évaluées, et absorbées. Ce journal interne permettrait :
- l'audit post-session (panel Debug uniquement),
- la détection de patterns de tensions récurrentes,
- la calibration future des seuils de routage.

Cette extension n'est pas une implémentation immédiate. Elle est documentée ici
comme direction architecturale.

---

## Risques à éviter

**Cockpit anxieux** : multiplication des signaux visibles qui transforme la surface
de décision en surface d'alerte. L'opérateur passe à la gestion du moteur plutôt
qu'à l'analyse du marché.

**Mur d'informations** : exposition simultanée de plusieurs tensions, même légères.
L'effet cumulatif dépasse la somme des parties.

**Alertes capricieuses** : tensions exposées sans critère stable, créant une
imprévisibilité dans le comportement du moteur. L'opérateur ne peut plus distinguer
ce qui compte de ce qui ne compte pas.

**Signal déguisé** : une tension exposée qui, dans sa formulation ou son moment
d'apparition, fonctionne comme une recommandation de trading implicite.
Le moteur ne produit pas de signaux de trading.

**Sur-explication** : l'exposition d'une tension suivie d'une explication de la
tension, suivie d'un contexte sur l'explication. La tension s'exprime en une
phrase structurelle. Pas davantage.

**Perte de surface calme** : la valeur du moteur repose en partie sur la clarté
de sa surface décisionnelle. Chaque tension exposée réduit cette clarté.
Le seuil d'exposition doit protéger la surface calme, pas la sacrifier.

---

## Positionnement V2

Cette doctrine ne crée pas un nouveau corpus d'indicateurs.
Elle ne modifie aucune logique moteur existante.
Elle ne définit pas de nouveaux qualificateurs premium ou freeware.

Elle prépare une future architecture en quatre composants :

**1. Couche de cohérence inter-modules**
Détection des tensions entre les outputs de modules calculés indépendamment :
synthèse freeware, qualificateurs premium, profil comportemental, posture moteur,
engagement déclaré. Cette couche opère en interne. Elle ne produit pas d'output
visible sauf si les règles de routage sont satisfaites.

**2. Hiérarchie des tensions**
Classification automatique des tensions détectées selon la typologie définie
dans ce document. La hiérarchie détermine le routage (absorption vs exposition)
sans intervention manuelle.

**3. Couche d'explicabilité sobre**
Si une tension passe le routage, elle est exposée selon les règles d'exposition :
une intention, une formulation structurelle courte, aucun empilement.
Cette couche est une interface entre le moteur et le cockpit, pas un module
d'analyse supplémentaire.

**4. Gestion de l'attention**
Mécanisme de contrôle du bruit ambiant total : comptabilisation des tensions
visibles actives, élévation automatique du seuil de routage si le bruit dépasse
un niveau acceptable, protection de la surface calme du cockpit.

Ces quatre composants forment une architecture cohérente avec la doctrine de ce
document. Ils ne sont pas implémentés dans V1.

---

## Statut et usage

**Type** : Document doctrinal d'architecture.
**Périmètre** : Moteur Caméléon — toutes couches.
**Aucune implémentation immédiate.**
**Aucune modification moteur à partir de ce document.**
**Aucun nouveau corpus d'indicateurs.**

Usage attendu :
- Base de référence pour les décisions d'architecture V2,
- Critère de validation pour toute future tension candidate à l'exposition,
- Garde-fou contre la dérive vers un cockpit bruyant,
- Document de référence pour la couche de cohérence inter-modules.

Révision : ce document est révisable si les conditions d'usage réel révèlent
des cas non couverts par la typologie ou les règles de routage.
