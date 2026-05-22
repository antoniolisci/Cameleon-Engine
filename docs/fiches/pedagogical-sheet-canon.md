# Caméléon Engine — Pedagogical Sheet Canon

*Version 1.0 — Mai 2026*

---

## 1. Rôle des fiches pédagogiques

Les fiches pédagogiques existent pour un seul motif : expliquer pourquoi un indicateur est dans Caméléon, ce qu'il fait réellement, et pourquoi il ne suffit pas.

Elles ne sont pas une documentation technique. Elles ne sont pas une formation trading. Elles ne sont pas un argumentaire produit.

Ce qu'elles doivent produire chez l'utilisateur : une compréhension structurelle de la lecture de marché comme synthèse, et non comme accumulation de signaux indépendants.

Ce qu'elles ne doivent jamais devenir :
- un guide d'utilisation du cockpit,
- une explication des paramètres internes du moteur,
- une prescription de comportement trading,
- une justification de la valeur du produit.

---

## 2. Structure obligatoire d'une fiche

Chaque fiche suit exactement cinq sections, dans cet ordre, avec ces intitulés.

**1. Ce qu'il mesure**
Définit l'objet de l'indicateur : ce qu'il capte, ce qu'il ne capte pas, et pourquoi cette distinction est non triviale. Aucune comparaison avec d'autres outils. Aucune hiérarchie implicite. Précision technique sans terminologie inutile.

**2. Pourquoi il est présent dans Caméléon**
Justifie la présence de l'indicateur dans la logique du produit. La réponse doit être structurelle — liée à une lacune de lecture ou à un biais de marché identifié — et non fonctionnelle ou marketing. Pas de "parce qu'il est utile". Parce qu'il corrige quelque chose de précis.

**3. Ce qu'il peut faire croire à tort**
La section la plus importante. Documente le ou les biais d'interprétation les plus fréquents de l'indicateur. Le registre est factuel, sans condescendance. L'objectif est de neutraliser une confiance excessive avant qu'elle ne s'installe.

**4. Comment Caméléon l'utilise**
Décrit le rôle de l'indicateur dans le moteur : modulateur, pondérateur, signal primaire, condition de cohérence. Pas de détail algorithmique. Le niveau de description est fonctionnel — ce que l'indicateur modifie dans la lecture globale.

**5. Pourquoi il n'est jamais lu seul**
Clôt la fiche. Nomme explicitement les dépendances structurelles avec d'autres indicateurs. Montre que la lecture isolée produit une illusion d'information. Cette section ancre la fiche dans la philosophie du produit : la lecture de marché est une synthèse, pas une addition.

---

## 3. Ton éditorial

**Registre** : technique et neutre. Ni populaire, ni académique. L'équivalent écrit d'un professionnel qui explique quelque chose à un pair sans chercher à l'impressionner.

**Posture** : l'auteur sait. Le lecteur peut comprendre. Il n'y a pas de rapport de supériorité, mais pas non plus de mise en scène de la proximité. Le produit ne cherche pas à plaire.

**Niveau de langage** : précis et accessible. Un terme technique est acceptable s'il est juste. Un terme simple inexact ne l'est pas. Aucun terme n'est simplifié au point d'être faux.

**Relation implicite au lecteur** : le lecteur est supposé intelligent et capable de lire une pensée complète. Les phrases ne sont pas raccourcies pour paraître dynamiques. Les nuances ne sont pas supprimées pour paraître claires.

Le produit ne conseille pas. Il ne motive pas. Il ne cherche pas à impressionner. Il ne simplifie pas pour rassurer.

---

## 4. Interdits éditoriaux

**Ton et posture**
- Ton vendeur ou promotionnel
- Ton scolaire ou condescendant
- Ton coach ou motivationnel
- Ton startup ou enthousiaste
- Écriture LinkedIn : emphase, listes à effets, fausse profondeur

**Formulations**
- Injonctions directes : "il faut", "vous devez", "pensez à"
- Injonctions déguisées : "n'oubliez pas que", "gardez en tête que"
- Promesses implicites : "permet de mieux trader", "améliore vos décisions"
- Dramatisation : "piège", "erreur fatale", "danger"
- Sensationnalisme : "révèle", "dévoile", "secret", "edge", "hack"
- Psychologisation : "votre biais", "votre comportement", "votre confiance"
- Vocabulaire signal provider : "signal d'entrée", "confirmation", "setup", "valide"
- Vocabulaire prescriptif : "à utiliser quand", "idéal pour", "parfait si"

**Structure et contenu**
- Comparaisons avec des concurrents ou d'autres produits
- Exemples chiffrés présentés comme typiques
- Généralités non étayées présentées comme des règles
- Conclusions implicites sur ce que le lecteur devrait faire

---

## 5. Règles de densité

**Longueur cible par fiche** : 400 à 600 mots. En dessous, la fiche est superficielle. Au-dessus, elle dérive vers l'explication exhaustive.

**Paragraphes** : courts, de 2 à 4 phrases. Un paragraphe = une idée. Pas de blocs massifs. Pas de listes à la place de phrases construites, sauf dans les sections 3 et 5 où deux ou trois éléments distincts peuvent justifier une structure en points.

**Compression informationnelle** : chaque phrase doit porter de l'information. Les phrases de transition, les formules d'introduction ("dans cette section, nous allons voir...") et les redondances rhétoriques sont supprimées.

**Rapport lisibilité / précision** : la lisibilité ne prime pas sur la précision. Une phrase dense mais juste est préférable à une phrase fluide mais approximative. La relecture doit être possible à vitesse lente sans perte de sens.

---

## 6. Règles de cohérence produit

**Cohérence avec le manifeste** : chaque fiche doit être compatible avec les principes de présence calme, silence intelligent et sobriété cognitive. Une fiche qui "excite" ou qui "rassure" a échoué.

**Cohérence avec le cockpit** : les fiches expliquent les indicateurs tels qu'ils existent dans Caméléon. Elles ne les idéalisent pas, ne les simplifient pas, ne promettent pas une expérience que le cockpit ne produit pas.

**Séparation cockpit / pédagogie** : une fiche n'est pas un manuel d'utilisation. Elle n'indique pas où cliquer, comment interpréter un affichage, ou quelle valeur choisir. Elle explique pourquoi l'indicateur existe, pas comment le manipuler.

**Séparation lecture / action** : une fiche se termine sur la compréhension, jamais sur une action. Elle ne conclut pas par ce que le lecteur devrait faire avec l'information reçue.

**Séparation moteur / explication** : le fonctionnement algorithmique du moteur n'est pas exposé dans les fiches. La section "Comment Caméléon l'utilise" décrit le rôle fonctionnel de l'indicateur, pas son implémentation.

---

## 7. Statut canonique

Ce document est la référence éditoriale officielle des fiches pédagogiques freeware de Caméléon Engine à partir de la version 1.0.

La fiche "Activité de flux" (mai 2026) constitue la référence de ton, de densité et de structure. Toute fiche produite avant validation de ce canon doit être relue à l'aune de ce document.

Toute évolution de ce format — ajout de section, modification des interdits, révision de la densité cible — est tracée avec version et date. La stabilité éditoriale n'est pas une contrainte de production : elle fait partie du produit.
