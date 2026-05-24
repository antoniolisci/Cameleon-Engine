# Couche de cohérence inter-modules — Caméléon Engine

**Statut** : Document d'architecture V2 · Chantier ouvert · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Doctrine de référence** : `docs/architecture/doctrine-silence-structurel.md`

---

## Point de départ

La doctrine du silence structurel a défini cette couche comme premier composant V2.
L'audit de viabilité conceptuelle a identifié 3–4 tensions structurellement solides.
Ce document descend d'un cran : concevoir l'architecture réelle de la couche, pas son principe.

La couche de cohérence inter-modules n'est pas un nouveau corpus d'indicateurs.
Elle observe les outputs des modules existants et détecte leurs non-alignements.
Elle n'expose ces non-alignements que si les règles de routage de la doctrine sont satisfaites.

---

## Inventaire des modules et de leurs outputs

| Module | Output utilisable | Nature | Stabilité dans la session |
|---|---|---|---|
| Confidence score (freeware) | Score 0–100 + breakdown par axe | Numérique continu | Recalculé à chaque soumission |
| Base engine | Score brut 0–100 + signaux attack/sniper | Numérique continu | Recalculé |
| Profile matrix | Posture : PASSIVE / BALANCED / ACTIVE | Catégoriel 3 valeurs | Recalculé |
| Adaptive filter | Output modulé (needAction × coreOrders) | Numérique continu | Recalculé |
| Trading policy | Actions autorisées / interdites | Liste binaire | Recalculé |
| Premium indicators v1 | DMU / MdS / QdR / RD — chacun sur une échelle propre | Catégoriel ordinal | Recalculé |
| Behavioral module | Profil : Discipliné / Réactif / Impulsif / Agressif + score | Catégoriel 4 valeurs | **Stable** — calculé une fois depuis CSV |
| Form inputs | 16 champs dont engagement déclaré | Mixte | Par soumission |

**Observation structurelle** : deux régimes de stabilité coexistent. Le profil comportemental
est stable dans la session (calculé depuis CSV historique). Tous les autres outputs sont
recalculés à chaque soumission. La couche doit gérer cette asymétrie temporelle — une tension
profil/posture peut apparaître, disparaître, et réapparaître dans la même session selon les inputs.

---

## Catalogue formel des tensions détectables

### T1 — Synthèse freeware ↔ Qualificateurs premium

**Modules** : confidence score ↔ DMU + MdS

**Objet** : Le score de lisibilité freeware est élevé, mais les qualificateurs premium révèlent
une structure immature (MdS précoce) ou une divergence multi-unité active (DMU). Deux instruments
mesurant le même marché à des profondeurs différentes produisent des lectures contradictoires.

**Delta calculable** : `confidence_score > seuil_haut AND (MdS ≤ seuil_bas OR DMU = actif)`

**Type de tension** : structurelle — deux modules indépendants, contradiction sur la lecture globale.

**Actionabilité** : oui — l'opérateur peut réviser le timing d'entrée, baisser son engagement,
ou reconsidérer le premium avant d'agir sur la lisibilité freeware.

**Risque de formulation** : faible — la tension est entre instruments, pas sur l'opérateur.

---

### T2 — Profil comportemental ↔ Posture moteur

**Modules** : behavioral module ↔ profile matrix

**Objet** : Le moteur recommande une posture ACTIVE (conditions favorables). Le profil
comportemental historique est Impulsif ou Agressif. La combinaison "marché favorable +
opérateur historiquement impulsif" est structurellement identifiable.

**Delta calculable** : `posture = ACTIVE AND profil ∈ {Impulsif, Agressif}`

**Type de tension** : structurelle — observable, non normative dans sa forme brute.

**Actionabilité** : conditionnelle — l'opérateur peut moduler son engagement même si
la posture recommandée est haute.

**Risque de formulation** : modéré. Règle d'or : "tension détectée : posture ACTIVE /
profil Impulsif" — jamais "votre profil est inadapté."

**Contrainte d'isolation** : le behavioral module n'émet aucun événement global. La couche
de cohérence lit son output en lecture seule. Dépendance unidirectionnelle — conforme au
contrat d'isolation.

---

### T3 — Engagement déclaré ↔ Posture recommandée

**Modules** : form inputs (engagement) ↔ profile matrix (posture)

**Objet** : L'opérateur a déclaré un engagement élevé dans le formulaire. Le moteur recommande
PASSIVE. Le delta entre intention déclarée et recommandation structurelle est direct et
mesurable en nombre de crans.

**Delta calculable** : `engagement_déclaré - posture_recommandée` en unités normalisées.
Exemple : engagement = 3/3, posture = PASSIVE (1/3) → delta = +2.

**Type de tension** : contextuelle à critique selon l'amplitude du delta.

**Actionabilité** : maximale — c'est la tension la plus directement réductible par l'opérateur.

**Risque de formulation** : faible — le fait est numérique et neutre.

---

### T4 — QdR ↔ MdS (tension interne premium)

**Modules** : QdR ↔ MdS (deux qualificateurs premium)

**Objet** : QdR indique un retracement de qualité (correction propre). MdS indique une
structure immature (phase précoce non confirmée). La combinaison "correction propre dans
structure précoce" est ambiguë : le retracement est de qualité formelle mais la structure
globale ne le valide pas encore.

**Delta calculable** : `QdR ≥ seuil_haut AND MdS ≤ seuil_bas`

**Type de tension** : structurelle — interne au corpus premium.

**Actionabilité** : conditionnelle — utile pour contextualiser la lecture premium,
pas directement réductible.

**Note** : tension entièrement interne à une famille de modules. Sous-catégorie distincte :
tension intra-premium vs tensions inter-couches.

---

### T5 — DMU ↔ Posture moteur (candidate secondaire)

**Modules** : DMU ↔ profile matrix

**Objet** : DMU indique une divergence active entre unités de temps. Le moteur recommande
ACTIVE. Divergence multi-unité + engagement actif = lecture structurelle qui s'auto-contredit
sur la direction.

**Delta calculable** : `DMU = actif AND posture = ACTIVE`

**Type de tension** : structurelle — mais proche de T1 (DMU est dans le périmètre
freeware ↔ premium). Risque de redondance.

**Verdict** : candidate à fusionner avec T1 ou à traiter comme variante. Pas une
tension indépendante dans l'état actuel.

---

### Tensions rejetées

**Profil comportemental ↔ Confidence score** : lisibilité élevée + profil Agressif.
Trop proche du jugement comportemental. Sans levier structurel clair pour l'opérateur.

**Profil comportemental ↔ Premium indicators (combinaison triple)** : opérateur Impulsif
+ RD élevé + MdS mature. Explosion combinatoire difficile à typer sans ambiguïté.

---

## Architecture de la couche

### Position dans la pipeline

La couche s'insère après l'exécution complète des modules, avant la construction
du payload final :

```
baseEngine()
  → profileMatrix()
  → applyAdaptiveFilter()
  → applyValidation()
  → [COUCHE COHÉRENCE INTER-MODULES]  ← insertion ici
  → computeTradingPolicy()
  → buildPayload()
```

Elle lit les outputs de tous les modules. Elle ne modifie pas ces outputs directement.
Elle produit un objet `tensionMap` annexé au payload.

### Structure de données

```
TensionMap {
  computed_at: timestamp,
  tensions: [
    {
      id: "T1" | "T2" | "T3" | "T4",
      modules: [string, string],
      delta: number | string,
      type: "absorbed" | "silent" | "contextual" | "structural" | "critical" | "blocking",
      routing_score: 0..6,
      exposed: boolean,
      message: string | null
    }
  ],
  active_exposed: number,
  noise_level: "low" | "medium" | "high"
}
```

### Algorithme de routage

Pour chaque tension détectée :

1. Calculer le delta → est-il au-dessus du seuil de déclenchement ?
2. Si non → type = `silent`, exposed = false, stop.
3. Si oui → évaluer les 6 critères de routage de la doctrine :
   - réversibilité de l'action ?
   - levier disponible pour l'opérateur ?
   - coût d'interruption acceptable ?
   - bruit ambiant acceptable (active_exposed = 0) ?
   - régime de marché non dégradé ?
   - profil comportemental non Impulsif/Agressif si tension contextuelle ?
4. Si tous satisfaits → type selon amplitude, exposed = true.
5. Si un seul non satisfait → type = `absorbed`, exposed = false.

**Contrainte absolue** : `active_exposed ≤ 1` à tout moment. Si deux tensions passent
le routage, exposer uniquement la plus critique. L'autre est absorbée pour cette session.

---

## Problème de l'isolation comportementale

Le contrat d'isolation du module comportemental est explicite :
- lit aucune donnée du moteur principal,
- émet aucun événement global,
- set aucune propriété `window.*`.

La couche de cohérence a besoin de lire le profil comportemental. Ce n'est pas
une écriture vers le module, ni un événement émis. C'est une lecture passive.

### Option A — Lecture directe via getter explicite

La couche de cohérence lit l'état interne du module via une fonction getter publique
exposée explicitement : `getBehavioralProfile()`. Le module ne sait pas qui le lit.
Pas de couplage fonctionnel.

**Avantage** : simple, conforme au contrat (le contrat interdit l'émission et la
réception d'événements, pas la lecture passive).

**Risque** : si le module comportemental n'a pas été chargé (pas de CSV), le getter
retourne null → la couche doit gérer l'absence de profil comme cas dégradé.

### Option B — Injection via état de session

Le profil comportemental est injecté dans le contexte de session par le code appelant
(`moteur.js` ou `render.js`), disponible dans l'état global de session. La couche de
cohérence le lit depuis l'état, pas depuis le module lui-même.

**Avantage** : découplage total entre la couche de cohérence et le module comportemental.

**Risque** : l'état de session devient le point de couplage.

### Recommandation provisoire

Option A avec getter explicite. La doctrine d'isolation interdit la communication
bidirectionnelle, pas la lecture passive. Un getter nommé `getBehavioralSummary()`
exposant uniquement `{profile, score, dataQuality}` maintient le contrat.

---

## Seuils de déclenchement — question ouverte

La couche nécessite des seuils pour chaque tension. Sans seuils, tout est tension,
tout s'expose, la doctrine est violée dès la première exécution.

**T1 (freeware ↔ premium)** : à partir de quel score freeware + quelle combinaison premium
la tension est-elle réelle ? `confidence > 65 AND MdS < 2` ? Les seuils ne peuvent pas
être arbitraires — ils doivent provenir de l'observation des données terrain (REAL_001 à
REAL_004).

**T2 (profil ↔ posture)** : la tension ne s'applique-t-elle qu'à Impulsif, ou aussi à
Réactif ? Un opérateur Réactif dans un marché ACTIVE est-il une tension ou une combinaison
normale ?

**T3 (engagement ↔ posture)** : à partir de combien de crans d'écart la tension devient-elle
contextuelle (1 cran) vs critique (2+ crans) ?

**T4 (QdR ↔ MdS)** : quelles valeurs ordinales sur chaque échelle constituent un conflit
réel vs une simple différence de profondeur d'analyse ?

Ces seuils ne peuvent pas être définis sans données. Ils constituent une dette de calibration
— architecturalement identifiée, non bloquante pour la conception de la couche.

---

## Ce que la couche ne fait pas

- Elle ne modifie pas la décision finale. Elle l'annote.
- Elle ne produit pas de signal de trading.
- Elle ne remplace pas le filtre adaptatif ou la validation.
- Elle ne communique pas avec le module comportemental (lecture seulement).
- Elle n'expose jamais plus d'une tension à la fois.
- Elle ne stocke rien en localStorage.
- Elle ne juge pas l'opérateur — elle observe des écarts entre modules.
- Elle ne produit pas d'alerte permanente ou récurrente.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-COH-01 | Seuils de déclenchement T1/T2/T3/T4 — nécessitent calibration terrain | Non |
| D-COH-02 | Décision finale Option A vs Option B pour lecture profil comportemental | Non |
| D-COH-03 | T5 (DMU ↔ posture) — fusion avec T1 ou tension indépendante | Non |
| D-COH-04 | Comportement si module comportemental absent (pas de CSV chargé) | Non |

Toutes les dettes sont non bloquantes pour la conception. Elles le deviennent
au moment de l'implémentation.

---

## Ce que ce chantier produit

- Le **catalogue formel des 4 tensions viables** (T1–T4) avec delta calculable,
  type, actionabilité, risque de formulation.
- La **position dans la pipeline** : post-modules, pré-payload.
- La **structure de données `tensionMap`**.
- L'**algorithme de routage** conforme à la doctrine du silence structurel.
- La **résolution du problème d'isolation comportementale** via getter explicite (Option A).
- L'**inventaire des dettes de calibration** (D-COH-01 à 04).

Ce qui n'est pas encore produit : les seuils de déclenchement, le code,
l'intégration UI, la couche de rendering de la tension exposée.

---

## Statut

**Type** : Document d'architecture V2.
**Périmètre** : Couche de cohérence inter-modules — conception uniquement.
**Aucune implémentation immédiate.**
**Aucune modification moteur à partir de ce document.**
**Aucun nouveau corpus d'indicateurs.**

Prochaines étapes possibles :
- Calibration des seuils T1/T2/T3 depuis les datasets REAL_001–004.
- Décision D-COH-02 (Option A vs B) avant toute implémentation.
- Résolution D-COH-03 (T5 fusion ou indépendance).

Révision : ce document est révisable si l'observation terrain révèle des tensions
non cataloguées ou invalide des tensions existantes.
