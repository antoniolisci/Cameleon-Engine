# V0-A — Lecture comportementale UI réelle — 1 an

**Date :** 2026-05-25  
**Auteur :** Antonio Lisci  
**Phase :** Phase 3 — Validation terrain  
**Type :** Diagnostic UI + analyse opératoire post-import

---

## 1. Contexte du test

**Fichier importé :** `spot_binance_historique_des_transactions_1_an.csv`  
**Trades importés :** 1 435  
**Lignes ignorées :** 0  
**Période couverte :** 2025-05-23 → 2026-05-24 (366 jours)  
**Statut import :** succès complet — aucune erreur bloquante

**Logs console significatifs :**
```
[bhv:ui] handleImport appelé spot_binance_historique_des_transactions_1_an.csv
[bhv:grid] 1435 trades → 1000 (groups: 107, absorbés: 542)
```

Le grid-grouper a absorbé 542 trades dans 107 groupes, réduisant le flux de 1 435 à 1 000 unités d'analyse. C'est la contextualisation carnet/grid attendue — elle est active et fonctionnelle.

**Erreurs hors périmètre :** 404 sur fichiers vidéo manquants dans `assets/video/`. Sans lien avec le pipeline comportemental. À traiter séparément si nécessaire.

---

## 2. Résultats observés

| Dimension | Valeur |
|-----------|--------|
| Score comportemental | **25 / 100** |
| État | **Agressif** |
| Risque dominant | Escalade de position |
| Cause dominante | Overtrading |
| Patterns détectés | 5 |
| Trades analysés | 1 000 (après grouper) |
| Achats | 497 |
| Ventes | 503 |
| Taille moyenne | 105,25 $ |
| Moyenne achat | 113,31 $ |
| Moyenne vente | 97,29 $ |
| Hors norme | 77 |
| Délai moyen | 528 min |
| Délai après achat | 683 min |
| Délai après vente | 374 min |
| Heures distinctes | 24h (toutes heures actives sur la période) |
| Style détecté | Range / Carnet d'ordres |
| Transitions | 66 détectées |
| Cohérence | Moyenne — style identifiable, dérives ponctuelles |
| Posture recommandée | Ralentir légèrement et revenir au cadre habituel |

---

## 3. Ce qui fonctionne bien

- **Import stable :** 1 435 trades chargés, 0 rejet, 0 crash.
- **Parsing complet :** tous les formats de date, quantité, frais correctement interprétés.
- **Journal affiché correctement :** la liste des trades est lisible et cohérente.
- **Grid-grouper actif :** 542 trades absorbés dans 107 groupes — la contextualisation carnet est en place et réduit le bruit de lecture.
- **Style Range / Carnet d'ordres détecté :** le moteur reconnaît une structure opératoire réelle, pas un chaos brut.
- **Synthèse comportementale produite :** ratios achat/vente, taille moyenne, délais — données exploitables.
- **Coaching généré :** posture recommandée cohérente avec le style identifié.
- **UI globalement stable :** aucun artefact visuel, aucun bug d'affichage, rendu complet.
- **19 symboles traités sans erreur :** le multi-actifs n'a pas cassé le pipeline.

---

## 4. Ce qui pose problème

### 4.1 Hiérarchie cognitive inversée

L'interface attire l'œil dans cet ordre :
1. Score rouge (25 / 100)
2. État : Agressif
3. STOP IMMÉDIAT
4. Risque dominant / Cause dominante
5. Patterns (×5)
6. Coaching
7. **Style détecté : Range / Carnet d'ordres** ← trop bas, trop tard

Le style opératoire — qui est la clé de lecture de toute l'analyse — apparaît en dernier. L'utilisateur est déjà en posture défensive avant de comprendre que le moteur reconnaît sa méthode.

### 4.2 Style détecté trop peu visible

Information la plus structurante de la lecture : "Range / Carnet d'ordres". Positionnée trop bas dans l'interface. Dans le test, il a fallu environ 40 secondes pour la repérer, après avoir déjà été exposé au score, à l'état Agressif et aux warnings.

### 4.3 STOP IMMÉDIAT trop dominant

Le signal STOP écrase visuellement la nuance. Sur un fichier 1_an multi-actifs, la plupart des patterns détectés sont liés à une activité structurée sur longue période — pas à une urgence immédiate. L'affichage d'un STOP IMMÉDIAT peut être disproportionné par rapport à la situation réelle.

### 4.4 Lecture nuancée noyée sous les alertes

Le coaching dit "Ralentir légèrement" — ce qui est une recommandation modérée. Mais le contexte visuel global (rouge, Agressif, STOP) dit "danger immédiat". L'écart entre le ton du coaching et la mise en scène visuelle crée une dissonance.

### 4.5 Risque que l'utilisateur se sente jugé avant d'être compris

Premier message reçu : "Tu es Agressif, score 25, STOP IMMÉDIAT."  
Ce que le moteur sait aussi : "Tu opères en style Range/Carnet, identifiable, avec dérives ponctuelles."  
Le second message est plus juste, mais il arrive trop tard dans la lecture.

### 4.6 Confusion possible entre cause et risque dominants

- **Cause dominante :** Overtrading
- **Risque dominant :** Escalade de position

Ces deux signaux ne désignent pas le même pattern. L'Overtrading (46 fenêtres à 5+ trades en 60 min) est partiel sur un style carnet/range. L'Escalade de position (16 séquences de 3 achats successifs avec +180 % en 120 min) est probablement le signal le plus opérationnellement pertinent. Le fait que la "cause dominante" soit Overtrading et le "risque dominant" soit Escalade de position sans explication du lien entre les deux peut désorienter.

---

## 5. Analyse des patterns

### 5.1 Overtrading — 46 fenêtres (5+ trades / 60 min / même symbole)

**Pertinent ?** Partiellement. Un trader Range/Carnet peut légitimement placer plusieurs ordres sur le même symbole en 60 minutes — c'est la structure même de son style. Le grid-grouper absorbe déjà 542 trades, mais l'overtrading est calculé sur les 1 000 trades post-grouper. Des faux positifs restent possibles.

**Surpondéré ?** Probablement oui — c'est le pattern qui tire le score le plus bas (poids 25 %). Sur un style carnet sur 1 an, une présence forte de ce pattern est attendue et ne signifie pas un dysfonctionnement comportemental.

**Faux positif possible ?** Oui — les séquences carnet/grid génèrent naturellement des regroupements temporels. Malgré la contextualisation grid-grouper déjà active, le taux de 46 fenêtres sur 1 000 trades (~4,6 %) peut inclure des séquences légitimes.

**Dépend du style Range/Carnet ?** Directement. C'est le pattern le moins transférable hors de son contexte de style.

**Avant correction :** observer les autres périodes (1_semaine, 1_mois) pour vérifier si le taux d'overtrading est proportionnel à l'activité ou structurellement fixé.

---

### 5.2 Revenge trading — 7 entrées (achat après vente, taille > 1,5× moyenne)

**Pertinent ?** Avec prudence. Sans P&L réel (le moteur n'a pas accès aux prix d'entrée/sortie des positions complètes), la notion de "revenge" est construite sur un proxy comportemental : taille supérieure à la moyenne après une vente. Ce proxy peut capter du revenge trading réel mais aussi des rachats volontaires à meilleure entrée.

**Surpondéré ?** Non — 7 occurrences sur 1 000 trades est un taux faible (0,7 %). Ce n'est pas ce qui pèse le plus sur le score.

**Faux positif possible ?** Oui — sans P&L, on ne distingue pas "j'essaie de récupérer une perte" de "je renforce une position dans ma stratégie normale". Le signal reste fragile sur ce point.

**Dépend du style Range/Carnet ?** Partiellement — les rachats rapides après vente sont courants en style range. La distinction avec du revenge dépend du contexte P&L non disponible.

**Avant correction :** ne pas toucher au poids. Observer si le signal apparaît aussi sur les périodes courtes (1_semaine, 1_mois) ou uniquement sur le long terme.

---

### 5.3 Réentrée rapide — 7 fois (achat → vente < 20 min → nouvel achat < 45 min)

**Pertinent ?** Partiellement. La réentrée rapide est un comportement réel à surveiller, mais dans un style Range/Carnet, les cycles d'achat-vente-rachat courts sont une signature opératoire, pas une dérive.

**Surpondéré ?** Non — 7 occurrences sur 1 an est très faible. Le signal n'est pas dominant dans le score.

**Faux positif possible ?** Oui si la taille est normale. Non si la taille est supérieure à la moyenne — dans ce cas, la réentrée devient une forme d'escalade déguisée.

**Dépend du style Range/Carnet ?** Oui directement. Ce pattern doit être interprété différemment selon le style détecté.

**Avant correction :** vérifier si les 7 occurrences correspondent à des tailles > moyenne. Si oui, le signal est pertinent. Si non, c'est du bruit.

---

### 5.4 Tailles incohérentes — CV global 277 %

**Pertinent ?** Oui — un coefficient de variation de 277 % sur les tailles de position est objectivement élevé. Même en style Range/Carnet, les variations de taille doivent rester dans un cadre.

**Surpondéré ?** Potentiellement, car le CV est calculé globalement sur 19 symboles. Un CV de 277 % peut résulter d'une stratégie intentionnelle de dimensionnement différencié par symbole (ex : petites positions sur BTC, plus grandes sur TAOUSDC) plutôt que d'une incohérence comportementale.

**Faux positif possible ?** Oui — c'est la dette PS-01 documentée. `detectSizeInconsistency` utilise le CV global, pas le CV par symbole. Sur un corpus multi-actifs (19 symboles), le CV global est structurellement plus élevé que le CV par symbole. Ce pattern est probablement partiellement faux positif sur le corpus 1_an.

**Dépend du style Range/Carnet ?** Indirectement. Un style carnet concentré sur 1-2 symboles aurait un CV bien inférieur. La diversification sur 19 symboles gonfle mécaniquement le CV global.

**Avant correction :** prioritaire — c'est la correction PS-01 (CV global → CV par symbole) déjà documentée en Priorité A roadmap. À tester sur 1_semaine (1 symbole) pour comparer.

---

### 5.5 Escalade de position — 16 séquences (3 achats consécutifs, +180 % en 120 min)

**Pertinent ?** Oui — c'est probablement le signal le plus actionnable et le plus fiable de l'analyse. 16 séquences d'escalade significative (+180 %) en 120 minutes représente une dérive réelle, indépendante du style.

**Surpondéré ?** Non — l'escalade de position est un comportement à risque objectif, quel que soit le style opératoire. Elle indique une augmentation non planifiée du risque en cours de session.

**Faux positif possible ?** Faible. Les 3 achats consécutifs avec +180 % en 120 min sont une définition stricte. Ce n'est pas du pyramiding standard — c'est une accélération rapide.

**Dépend du style Range/Carnet ?** Partiellement — le range trader place plusieurs ordres, mais les séquences d'escalade à 180 % sortent du cadre habituel du style.

**Avant correction :** aucune. Ce signal est le plus solide. C'est lui qui devrait être en tête de la lecture, pas en cinquième position.

---

## 6. Diagnostic UX central

**Le moteur reconnaît une structure opératoire, mais l'interface met d'abord en scène la sanction.**

Le moteur sait que l'opérateur a un style Range/Carnet identifiable, une cohérence moyenne, et des dérives ponctuelles concentrées principalement sur l'escalade de position. C'est une lecture nuancée et utile.

L'interface dit : Agressif. 25/100. STOP IMMÉDIAT. Overtrading. Revenge. Réentrée. Incohérence. Escalade.

L'utilisateur reçoit la sanction avant la reconnaissance. Il se sent jugé avant d'être compris.

Cette inversion est le problème central. Elle n'est pas un bug — c'est une question d'ordre et de hiérarchie. Le moteur a toutes les informations pour une lecture juste. L'interface les présente dans le mauvais ordre.

---

## 7. Proposition de future amélioration UX

*Sans coder maintenant. Proposition pour une itération future.*

### Bloc "Identité opératoire" — à positionner en tête

Avant ou à côté du score, afficher un bloc synthétique qui répond d'abord à la question : "Qui est cet opérateur ?"

**Contenu proposé du bloc :**

```
┌─────────────────────────────────────────────────────┐
│  Identité opératoire                                │
│                                                     │
│  Style détecté    Range / Carnet d'ordres           │
│  Cohérence        Moyenne                           │
│  Cadre            Identifiable                      │
│  ─────────────────────────────────────────────────  │
│  Risque actif     Escalade de position              │
│  Posture          Ralentir légèrement               │
│  Confiance        [à calibrer post-V0]              │
└─────────────────────────────────────────────────────┘
```

**Position :** avant le score ou en colonne à sa gauche dans l'onglet Comportement.

**Effet attendu :** l'utilisateur comprend d'abord "le moteur me reconnaît" avant de voir "le moteur me critique". La même information est présentée dans un ordre qui respecte la posture opératoire.

### Hiérarchie cible

| Rang actuel | Rang cible |
|-------------|------------|
| 1. Score | 1. Style détecté + cohérence |
| 2. État (Agressif) | 2. État comportemental |
| 3. STOP IMMÉDIAT | 3. Risque actif principal |
| 4. Risque / Cause | 4. Patterns (triés par pertinence) |
| 5. Patterns | 5. Coaching / posture |
| 6. Coaching | 6. Score (comme mesure, pas comme verdict) |
| 7. Style détecté | — |

### Règle de conception proposée

> Le moteur reconnaît le style avant de signaler les dérives.  
> La critique arrive après la reconnaissance — pas avant.

---

## 8. Questions ouvertes

**Sur le score :**
- Le score 25 est-il cohérent avec un style Range/Carnet sur 1 an ? Ou trop punitif pour ce style spécifique ?
- Le score doit-il être relatif au style (25/100 pour un Agressif, mais "correct" pour un Range trader ?) ou absolu ?

**Sur la cause et le risque dominants :**
- La cause dominante devrait-elle être l'Overtrading (poids le plus élevé) ou le pattern le plus fiable (Escalade) ?
- L'affichage "Cause : Overtrading / Risque : Escalade" crée une confusion. Faut-il n'afficher qu'un seul signal dominant ?

**Sur le style détecté :**
- Le style détecté doit-il influencer l'affichage du STOP ? Un style cohérent identifié devrait-il atténuer visuellement le signal d'urgence ?
- Faut-il afficher le style dans la vue rapide (avant import complet) ?
- Le niveau de confiance du style détecté est-il mesurable et affichable ?

**Sur la segmentation :**
- Faut-il séparer visuellement "danger comportemental" et "cohérence opératoire" dans deux zones distinctes ?
- Faut-il réduire la surface du STOP quand un style cohérent est identifié ?

---

## 9. Décisions recommandées

**Ne pas corriger immédiatement.**

La lecture issue d'un seul fichier 1_an (multi-actifs, longue période) n'est pas suffisante pour tirer des conclusions définitives. Plusieurs biais de corpus sont actifs :
- 19 symboles → CV global artificiellement élevé (PS-01)
- Longue période → accumulation mécanique de patterns même sur un style sain
- Le fichier 1_an est un stress test, pas un test représentatif de l'usage quotidien

**Séquence recommandée :**

1. Importer et observer les 4 autres fichiers : `1_semaine`, `1_mois`, `3_mois`, `6_mois`
2. Comparer les scores obtenus par période
3. Identifier si le score est stable (plancher structurel) ou progressif (proportionnel à l'activité réelle)
4. Documenter les patterns qui apparaissent systématiquement vs ponctuellement
5. Seulement après cette comparaison, identifier les corrections prioritaires

**Ce qui peut être noté dès maintenant comme priorité confirmée :**
- Correction PS-01 (CV global → CV par symbole) — signal terrain validé
- Futur bloc "Identité opératoire" — besoin UX confirmé par l'observation réelle

---

## 10. Conclusion

**Le test est techniquement réussi.**

Le moteur a importé 1 435 trades sans erreur, appliqué le grid-grouper sur 542 trades, détecté un style opératoire réel (Range/Carnet d'ordres), produit une synthèse comportementale exploitable et généré un coaching cohérent avec le style identifié.

**Ce n'est pas un moteur qui lit le chaos. C'est un moteur qui lit une trajectoire.**

La limite identifiée n'est pas dans la logique — elle est dans la présentation. L'interface met en avant la sanction avant la reconnaissance. Elle produit une lecture utile mais dans le mauvais ordre.

**Le prochain chantier n'est pas "corriger les scores".**  
C'est comprendre comment présenter la lecture comportementale de manière plus juste, plus calme et plus Caméléon Engine.

Observer d'abord.  
Documenter ensuite.  
Corriger seulement après comparaison des 5 périodes.

---

*Document vivant — partie de la série V0-A Phase 3.*  
*Prochain document : comparaison des scores sur les 5 périodes après import complet.*
