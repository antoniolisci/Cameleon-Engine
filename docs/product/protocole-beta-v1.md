# PROTOCOLE-BETA-V1 — Conduite de la bêta fermée Caméléon Engine

> Document opérationnel · 2026-06-08
> Référence : DEC-FOUNDATIONS-01 · Guide Opérateur V1 · Portefeuille V1
> Statut : RÉFÉRENCE BÊTA — à lire avant toute invitation

---

## Bloc 1 — Objectif de la bêta

### Ce que la bêta valide

| Dimension | Question centrale | Signal attendu |
|---|---|---|
| Moteur principal | L'opérateur comprend-il la décision produite et sait-il quoi en faire ? | Utilisation autonome après 2 semaines |
| Analyse comportementale | Le score et le profil (Discipliné/Réactif/Impulsif/Agressif) correspondent-ils à ce que l'opérateur sait de lui-même ? | Reconnaissance ou surprise justifiée |
| Portefeuille V1 | Le snapshot wallet persiste-t-il correctement et apporte-t-il une lecture utile ? | Import réussi + relecture entre sessions |
| Compréhension utilisateur | L'opérateur peut-il expliquer ce que l'outil fait et ne fait pas sans aide ? | Test J+14 et call final |

### Ce que la bêta n'évalue pas — exclusions strictes

- Performance financière des testeurs
- Prédictions de marché ou de prix
- Rentabilité ou gains générés par l'usage de l'outil
- Comparaison avec d'autres outils
- Adoption à grande échelle

---

## Bloc 2 — Profil des testeurs

### Définition des profils

| Profil | Critères |
|---|---|
| **Débutant** | Moins d'un an de trading actif · peu ou pas d'historique CSV exportable · familier avec les concepts de base |
| **Intermédiaire** | 1 à 3 ans de trading · exports Binance disponibles (Trade / Order / Wallet History) · trading régulier mais non professionnel |
| **Avancé** | 3 ans ou plus · volume d'historique significatif · conviction forte sur son propre style · capable d'évaluer la précision analytique |

### Nombre de testeurs

| Seuil | Nombre | Conditions |
|---|---|---|
| **Minimum viable** | 6 | En dessous : signal insuffisant pour calibration |
| **Cible idéale** | 12 | Répartition : 3 débutants · 5 intermédiaires · 4 avancés |
| **Maximum gérable** | 20 | Au-delà : coordination manuelle (D4) ingérable à 1 personne |

### Critère de sélection

Le testeur doit : (1) trader activement, (2) être frustré par un aspect de son comportement, (3) être disponible pour 15 minutes par semaine. Exclure les testeurs qui cherchent des signaux d'entrée/sortie de marché.

---

## Bloc 3 — Parcours d'un testeur

### J0 — Onboarding

- Réception de la lettre d'invitation (inclut communication modèle économique — DEC-FOUNDATIONS-01 D2)
- Lecture du Guide Opérateur V1
- Première ouverture de l'outil sur l'URL fournie
- Première session moteur (16 champs, lecture de la décision produite)
- Si exports disponibles : premier import comportemental (Trade History ou Order History)
- Envoi du formulaire de feedback J0 (5 questions — Bloc 5)

### J+7 — Premier bilan

- Minimum 3 sessions moteur réalisées
- 1 import comportemental si pas encore fait
- Formulaire de feedback J+7 (10 questions — Bloc 5)
- Signalement de tout bug via GitHub Issues

### J+14 — Point intermédiaire

- Call de 15 minutes (audio ou visio)
- Export JSON envoyé par email avant le call
- Vérification : l'opérateur sait-il expliquer ce que l'outil fait sans relire le guide ?
- Minimum 5 sessions moteur atteint
- Si Wallet History disponible : premier import portefeuille tenté

### J+30 — Point approfondi

- Minimum 8 sessions moteur au total
- Import Wallet History réalisé si disponible
- Export JSON envoyé
- Formulaire de feedback J+30 (10 questions — Bloc 5)
- Identification des frictions récurrentes

### J+45 — Clôture testeur

- Call final de 30 minutes
- Export JSON final envoyé avant le call
- Questionnaire de sortie complet (15 questions — Bloc 5)
- Verdict : transformation comportementale observable ou non (déclaratif + export)

---

## Bloc 4 — Exports et remontées

### Calendrier des exports

| Moment | Obligatoire | Déclencheur |
|---|---|---|
| J+14 | **Oui** | Avant le call intermédiaire |
| J+45 | **Oui** | Avant le call de clôture |
| J+7 | Non | Si import comportemental réalisé |
| J+30 | Non | Recommandé si usage intensif |

### Procédure d'export

1. Ouvrir l'outil
2. Aller dans l'onglet **Mémoire**
3. Cliquer sur **Exporter mes données**
4. Le fichier `cameleon-data-YYYY-MM-DD.json` se télécharge automatiquement
5. Envoyer ce fichier par email à l'adresse fournie dans la lettre d'invitation

### Format attendu

Fichier JSON natif de l'outil. Ne pas modifier, ne pas renommer, ne pas compresser. Le nom du fichier contient la date — conserver tel quel.

### Ce qui ne doit pas être envoyé

- Fichiers CSV ou XLSX source (données brutes Binance)
- Captures d'écran de positions ou de PnL
- Tout document contenant des montants absolus

---

## Bloc 5 — Feedback structuré

### Questions J0 — État initial (avant usage)

1. En une phrase, comment décrivez-vous votre style de trading actuel ?
2. Quelle est la principale erreur que vous faites le plus souvent ?
3. Qu'espérez-vous comprendre mieux sur vous-même après cette bêta ?
4. Avez-vous déjà utilisé un outil d'analyse comportementale ? Si oui, lequel et avec quel résultat ?
5. Sur une échelle de 1 à 5, à quel point avez-vous confiance dans votre propre analyse de votre comportement de trading ?

### Questions J+7 et J+30 — Feedback en cours d'usage

1. L'outil a-t-il produit une décision qui vous a surpris ? Laquelle ? Étiez-vous d'accord ?
2. Avez-vous modifié un comportement de trading suite à une analyse ? Décrivez précisément.
3. Y a-t-il un résultat que vous avez trouvé inexact ou trompeur ? Lequel et pourquoi ?
4. Qu'est-ce que vous n'avez pas compris dans l'interface ou dans les résultats ?
5. L'analyse comportementale (score, profil) correspond-elle à ce que vous savez de vous-même ? Oui/Non — expliquez.
6. Avez-vous utilisé le Portefeuille (import Wallet History) ? Si oui, la vue snapshot est-elle lisible ?
7. Qu'est-ce que l'outil vous a appris sur vous-même que vous ne saviez pas ou ne vouliez pas voir ?
8. Y a-t-il une situation de trading où vous avez pensé à l'outil pendant la session ? Laquelle ?
9. Qu'est-ce qui vous manque le plus dans l'outil actuellement ?
10. Sur une échelle de 1 à 5, dans quelle mesure l'outil vous aide-t-il à mieux vous comprendre en tant que trader ?

### Questions J+45 — Clôture

Questions J+7/J+30 reprises, plus :

11. En une phrase, comment décrivez-vous votre style de trading maintenant ?
12. Cette description a-t-elle changé depuis J0 ? En quoi ?
13. Citez un comportement concret que vous avez changé ou envisagez de changer grâce à la bêta.
14. Recommanderiez-vous cet outil à un autre trader ? Pour quel profil spécifiquement ? Pourquoi ?
15. Qu'est-ce que vous auriez voulu savoir avant de commencer la bêta ?

### Règle absolue

Aucune question sur les gains, les pertes, les performances financières, les signaux d'entrée/sortie ou la rentabilité. Si un testeur aborde ces sujets : noter sans répondre, repositionner sur le comportement.

---

## Bloc 6 — Critères de succès

### Métriques et seuils

| Dimension | Métrique | Seuil minimum | Seuil cible |
|---|---|---|---|
| **Rétention** | Testeurs encore actifs à J+30 | 50% (6/12) | 70% (8/12) |
| **Utilisation** | Sessions moteur par testeur sur 45 jours | ≥ 5 | ≥ 10 |
| **Import comportemental** | Testeurs ayant réalisé ≥1 import CSV/XLSX | ≥ 60% | ≥ 80% |
| **Export reçu** | Exports JSON reçus à J+14 ou J+45 | ≥ 70% (8/12) | 100% |
| **Compréhension** | Testeurs pouvant expliquer l'outil sans aide (call J+14) | ≥ 60% | ≥ 80% |
| **Transformation comportementale** | Testeurs citant un changement concret à J+45 | ≥ 4/12 | ≥ 6/12 |

### Critères d'arrêt anticipé

La bêta est suspendue et révisée si l'une de ces conditions est atteinte :

- Rétention J+14 inférieure à 40% (moins de 5 testeurs sur 12 encore actifs)
- Zéro transformation comportementale déclarée à J+30
- Plus de 2 bugs critiques ouverts non résolus simultanément
- Plus de 50% des testeurs incapables d'expliquer l'outil à J+14

---

## Bloc 7 — Gestion des bugs

### Classification

| Niveau | Définition | Exemples | Délai de traitement |
|---|---|---|---|
| **Critique** | Perte de données · résultat systématiquement incorrect · outil inutilisable | localStorage corrompu · import qui échoue sans message · score toujours 0 | Immédiat — bêta suspendue si non résolu sous 48h |
| **Majeur** | Fonctionnalité principale cassée · contournement possible mais effort significatif | Section Portefeuille vide après import réussi · export JSON vide | Résolution dans la semaine |
| **Mineur** | Cosmétique · texte incorrect · comportement inattendu non bloquant | Label incorrect · date mal formatée · couleur de statut inversée | Liste groupée · résolution au prochain cycle |

### Canal officiel

**GitHub Issues** — template obligatoire :

```
Titre : [CRITIQUE / MAJEUR / MINEUR] Description courte du problème
Corps :
- Ce que j'ai fait
- Ce que j'attendais
- Ce qui s'est passé
- Navigateur + OS
- Export JSON joint si pertinent
```

Les bugs signalés par email sont acceptés mais doivent être transcrits en GitHub Issue par l'opérateur du projet.

---

## Bloc 8 — Conditions de sortie

### Quand la bêta est considérée terminée

La bêta est terminée quand **l'une** de ces conditions est atteinte :

1. **Succès :** 45 jours d'usage actif écoulés ET seuils minimum Bloc 6 tous atteints
2. **Succès anticipé :** tous les seuils cibles Bloc 6 atteints avant J+45
3. **Arrêt :** critères d'arrêt anticipé Bloc 6 déclenchés → révision protocole → nouvelle cohorte si justifié

### Quand F2 Compte utilisateur peut s'ouvrir

Toutes les conditions suivantes doivent être réunies simultanément :

- Bêta terminée avec succès (condition 1 ou 2 ci-dessus)
- Domaine de production enregistré et HTTPS actif (gate D1 — DEC-FOUNDATIONS-01)
- Minimum 6 exports JSON exploitables reçus
- Zéro bug critique ouvert
- Signal de transformation comportementale positif (≥4 testeurs sur 12)

### Quand la roadmap peut avancer

F3 Mémoire opérateur et mise en ligne publique :

- F2 Compte utilisateur livré et stable
- Validation terrain confirmée (seuils minimum Bloc 6 atteints)
- Domaine de production opérationnel
- DEC-FOUNDATIONS-01 gates respectés

### Ce qui ne débloque pas la roadmap

- La fin du temps (45 jours écoulés sans atteindre les seuils)
- Le ressenti positif non mesuré ("les testeurs semblaient contents")
- Un seul témoignage de transformation comportementale

---

*Ce document est opérationnel — il remplace toute organisation informelle de la bêta.*
*Toute déviation du protocole doit être documentée avec justification.*
