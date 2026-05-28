# Protocole expérimental — Laboratoire du Silence V1

Caméléon Engine · Laboratoires Cognitifs UX  
Date : 2026-05-28  
Statut : expérimental — non implémenté

---

## I. Isolation des variables cognitives

Le Laboratoire du Silence opère par isolation stricte. Chaque prototype teste une variable unique. Le reste du système est maintenu constant.

### Variables structurelles

Variables qui agissent par la forme, l'espace, la hiérarchie — indépendamment du sens du contenu.

| Variable | Description | Déjà testée |
|---|---|---|
| S-1 | Densité informationnelle — nombre d'éléments visibles simultanément | Partielle (V0 vs V1) |
| S-2 | Hiérarchie verticale séquentielle vs grille parallèle | Oui (V0 grille / V1 flux) |
| S-3 | Taille et poids typographique de l'ancrage primaire | Oui (etat-mot 38px 200) |
| S-4 | Espace respiratoire autour de l'ancrage primaire (margin-bottom) | Oui (84px V0 / 72px V1) |
| S-5 | Présence ou absence de bandes fixes (haut/bas) | Oui (les deux versions) |
| S-6 | Longueur et rythme des lignes de lecture | Partielle (max-width 800–880px) |

### Variables sémantiques

Variables qui agissent par le sens, le vocabulaire, la formulation — indépendamment de la structure visuelle.

| Variable | Description | Déjà testée |
|---|---|---|
| M-1 | Mot d'état (ATTENTE vs ANALYSE vs autre) | Oui (V0/V1) |
| M-2 | Formulation de la description sous le mot d'état | Oui (2 lignes V0/V1) |
| M-3 | Titres de sections (descriptifs vs opérationnels) | Partielle |
| M-4 | Vocabulaire des valeurs (Définie / Latérale / Neutre…) | Non |
| M-5 | Présence ou absence de valeurs numériques (durée, sessions) | Non |
| M-6 | Ton des signaux actifs (observationnel vs directif) | Non |

### Variables hybrides

Variables qui combinent structure et sens — impossibles à isoler complètement, à tester en dernier.

| Variable | Description | Déjà testée |
|---|---|---|
| H-1 | Nombre de niveaux de lecture (sous-blocs) | Oui (V1 : 3 sous-niveaux H4/H1/M15) |
| H-2 | Couleur signal (#7d9fb5) — quantité et position dans la hiérarchie | Partielle |
| H-3 | Étiquette de section Système — poids cognitif réel | Non |
| H-4 | Cohérence inter-niveaux comme section explicite vs implicite | Non (V1 teste l'explicite) |
| H-5 | Bande bas — informatif vs redondant | Non |

---

## II. Matrice d'expérimentation

Chaque ligne représente un prototype potentiel. Un prototype = une variable testée. Les autres sont figées à leur valeur V1.

| Prototype | Variable isolée | Hypothèse cognitive | Priorité |
|---|---|---|---|
| V2-A | M-4 — vocabulaire des valeurs | Des valeurs plus vagues (Incertaine / Probable) augmentent le temps de traitement sans augmenter la précision de lecture | Haute |
| V2-B | S-1 — densité (retrait d'une section complète) | La suppression de "Cohérence inter-niveaux" réduit la charge sans perte de lecture | Haute |
| V2-C | M-6 — ton des signaux (directif vs observationnel) | Un ton directif ("Attendre cassure H1") crée une friction de décision non souhaitée | Haute |
| V2-D | M-5 — valeurs numériques ("3 à 5 sessions") | Les durées numériques ancrent cognitivement et réduisent la présence passive | Moyenne |
| V2-E | H-2 — quantité de signal coloré | Augmenter les éléments --signal crée une hiérarchie parasitaire | Moyenne |
| V2-F | H-3 — poids section Système | Élever le contraste de la section Système (text-2 → text) active la relecture inutile | Basse |

---

## III. Métriques cognitives observables

Sans eye-tracking, sans instrumentation. Observation comportementale directe.

| Métrique | Ce qu'on observe | Signe positif | Signe négatif |
|---|---|---|---|
| M-OBS-1 | Temps avant première action post-lecture | > 8s = ancrage profond | < 3s = survol |
| M-OBS-2 | Direction du regard à la sortie du prototype | Vers le marché = lecture active | Vers l'écran = rumination |
| M-OBS-3 | Verbalisations spontanées | Opérationnelles ("je vois que…") | Esthétiques ("c'est épuré") |
| M-OBS-4 | Retour en arrière dans la lecture | Absent = hiérarchie claire | Présent > 2x = surcharge |
| M-OBS-5 | Durée d'exposition avant saturation | > 90s = gravité cognitive soutenue | < 30s = interface trop légère |
| M-OBS-6 | Comportement sur les signaux actifs | Lu, intégré, pas mémorisé | Recopié, photographié, suranalysé |

---

## IV. Faux signaux

Patterns qui imitent un résultat cognitif positif sans en être.

| Faux signal | Nom | Exemple | Distinction réelle |
|---|---|---|---|
| FS-1 | Appréciation esthétique | "C'est beau / sobre / propre" | Pas opérationnel. Un prototype peut plaire et ralentir cognitivement pour les mauvaises raisons. |
| FS-2 | Familiarité terminale | Impression que "tout est clair" après 5 secondes | Indique une lecture superficielle, pas une intégration. |
| FS-3 | Silence perçu comme confort | Prototype jugé "reposant" | Le silence cognitif n'est pas du confort. Il est de la présence sans friction. |
| FS-4 | Validation par comparaison | "C'est mieux que X" | La comparaison ne valide pas la fonction. Elle valide la différence. |
| FS-5 | Rappel de contenu | Capacité à réciter les valeurs affichées | La mémorisation n'est pas la lecture du marché. |
| FS-6 | Réduction du nombre de clics | Moins d'interactions = moins de friction | L'absence d'action peut indiquer une interface ignorée, pas absorbée. |

---

## V. Limites du prototype statique

Ce que le prototype HTML/CSS ne peut pas tester — et ne doit pas essayer de tester.

| Limite | Nom | Description | Seuil de franchissement |
|---|---|---|---|
| L-1 | Données dynamiques | Le prototype affiche des valeurs fixes. L'effet cognitif peut changer quand les valeurs varient en temps réel. | Prototype interactif JS — hors scope laboratoire statique |
| L-2 | Contexte de décision réel | L'opérateur observe le prototype hors session de trading. Le poids cognitif réel = sous pression de marché. | Test en conditions terrain — hors scope prototype |
| L-3 | Durée d'exposition prolongée | Un prototype est observé 2–5 minutes. Une interface de trading est active 4–8 heures. | Session de trading complète avec interface déployée |
| L-4 | États combinés | Chaque prototype teste un état unique. Les états cognitifs réels se combinent (analytique + défensif). | Architecture multi-états — Phase V2+ |
| L-5 | Variations individuelles | La gravité cognitive est calibrée sur une réponse moyenne. Les profils individuels divergent. | Test multi-opérateurs avec calibration par profil |
| L-6 | Transition entre états | Le prototype est statique. La transition d'un état à l'autre (Attente → Analyse) a son propre coût cognitif. | Interface de transition — hors scope laboratoire |

---

## Décision

Le Laboratoire du Silence opère dans les limites du prototype statique.

Les limites L-1 à L-6 ne sont pas des défauts à corriger — elles délimitent le périmètre opérationnel du laboratoire. Franchir ces limites nécessite un outil différent, pas un prototype amélioré.

**Périmètre valide :** isolation de variables structurelles, sémantiques et hybrides · observation comportementale directe · calibration des hypothèses cognitives avant implémentation.

**Hors périmètre :** validation en conditions terrain · test multi-opérateurs · architecture d'états combinés.
