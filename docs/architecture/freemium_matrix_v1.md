# Matrice Gratuit / Premium V1 — Audit Produit

**Caméléon Engine · Document d'architecture produit**
**Date : 2026-06-10 · Statut : DÉCISION**

> Ce document répond à une seule question :
> "Quelle est la frontière Gratuit / Premium la plus cohérente avec la philosophie de Caméléon Engine ?"
>
> Aucun marketing. Aucun pricing. Aucun calcul financier.

---

## 1. Mission

La frontière Gratuit / Premium est l'une des cinq décisions ouvertes qui bloquent l'ouverture du chantier Compte Utilisateur V1. Elle ne peut pas être tranchée après la construction — une fonctionnalité construite sans porte premium devient gratuite par précédent, difficile à basculer ensuite.

Ce document identifie la frontière la plus cohérente avec les doctrines gelées, analyse cinq options, et propose une décision ferme.

**Contrainte fondamentale :** la frontière ne peut jamais dégrader le moteur. Le score, la posture, les actions permises et interdites, le coaching adaptatif — ces éléments sont identiques pour un utilisateur gratuit et un utilisateur premium. Le moteur souverain ne sait pas qu'un abonnement existe.

---

## 2. Ce qui est hors débat

Certains éléments ne peuvent pas être mis derrière un paywall. Ce ne sont pas des contraintes de générosité — ce sont des contraintes doctrinales.

### Gratuit à vie — non négociable

| Élément | Raison |
|---------|--------|
| Moteur principal (score, posture, actions, validation) | MACRO-RULE-01 + moteur souverain. Tout paywall sur le moteur est une violation doctrine. |
| Coaching adaptatif | Produit direct du moteur. Même règle. |
| Module comportemental (import CSV/Excel, scoring comportemental) | Couche d'observation. Dégradée = outil tronqué. |
| Historique local (localStorage, ~50 sessions) | Déjà actif sans compte. Ne peut pas régresser avec un compte. |
| Export JSON local (ARCH-N4) | Portabilité minimale garantie par doctrine. |
| Debug Brain | Outil interne de lisibilité. Aucune valeur premium. |

### Interdit en premium — permanent

| Interdit | Raison |
|----------|--------|
| Signaux premium | Contraire au Manifeste. Caméléon Engine ne donne pas de signaux. |
| Prédictions premium | Contraire à la doctrine Intelligence. |
| Score utilisateur premium | Contraire à la doctrine Compte. |
| Classement premium | Contraire au Manifeste. |
| Coaching "meilleur" en premium | Dégradation artificielle du gratuit déguisée. |
| Accès anticipé à des fonctionnalités non encore ouvertes | Viole la séquence doctrinale. |

---

## 3. Options étudiées

### Option A — Moteur gratuit + mémoire limitée artificiellement

Gratuit : moteur + comportemental + import + localStorage (50 sessions).
Premium : mémoire serveur illimitée + multi-device.

La limite est posée artificiellement à 50 sessions côté gratuit — même si la mémoire serveur pourrait théoriquement être partielle.

### Option B — Moteur gratuit + mémoire longue intégralement premium

Gratuit : moteur + comportemental + import + localStorage (50 sessions).
Premium : tout ce qui est serveur — mémoire longue, synchronisation multi-device, persistance au-delà du localStorage.

La frontière correspond exactement à la frontière infrastructure : local = gratuit, serveur = premium.

### Option C — Moteur gratuit + Intelligence premium (future)

Gratuit : moteur + comportemental + import + mémoire longue.
Premium : accès aux lectures de la couche Intelligence quand elle existera.

La frontière est posée sur la couche la plus avancée — la valeur de la mémoire longue est offerte, l'interprétation de cette mémoire est premium.

### Option D — Moteur gratuit + stockage premium (volume)

Gratuit : moteur + comportemental + import + X sessions serveur (ex : 6 mois).
Premium : sessions illimitées, rétention longue durée.

La frontière est un seuil de volume, pas une frontière fonctionnelle.

### Option E — Moteur gratuit + tout gratuit, premium = support et priorité

Gratuit : tout sauf le support.
Premium : accès anticipé aux fonctionnalités stables, priorité de support, accès beta.

Aucune frontière fonctionnelle. Modèle de soutien.

---

## 4. Analyse comparative

| Critère | Option A | Option B | Option C | Option D | Option E |
|---------|----------|----------|----------|----------|----------|
| Cohérence Manifeste | ✅ | ✅✅ | ⚠️ | ✅ | ✅ |
| Cohérence doctrine Mémoire | ⚠️ | ✅✅ | ✅ | ✅ | — |
| Valeur gratuit réelle | ✅ | ✅ | ✅✅ | ✅ | ✅✅ |
| Valeur premium claire | ✅ | ✅✅ | ⚠️ | ✅ | ❌ |
| Simplicité produit | ✅ | ✅✅ | ❌ | ⚠️ | ✅ |
| Viabilité économique | ✅ | ✅✅ | ⚠️ | ✅ | ❌ |
| Risque de dérive | ⚠️ | Faible | Élevé | ⚠️ | — |

**Option A — analyse détaillée**
La limite à 50 sessions côté gratuit est *arbitraire* : 50 sessions est déjà la limite localStorage existante. Option A ne dégrade pas le gratuit — elle ne l'étend pas non plus. La question est : pourquoi un utilisateur premium paierait-il pour une mémoire serveur s'il peut fonctionner avec localStorage ? La réponse est la continuité multi-device et la pérennité au-delà du navigateur. Option A est honnête mais sa communication est complexe : "vous avez déjà 50 sessions gratuitement, le premium conserve l'historique indéfiniment sur nos serveurs."

**Option B — analyse détaillée**
La frontière est architecturalement naturelle : local = gratuit, serveur = premium. Elle n'est pas une dégradation — elle est une extension. L'utilisateur gratuit a un outil complet sur son appareil. L'utilisateur premium a le même outil avec une mémoire qui traverse les appareils et le temps. Cette frontière correspond exactement à ce que la doctrine décrit comme la valeur de la mémoire longue : non pas un meilleur moteur, mais une mémoire plus longue. Elle est aussi la plus simple à expliquer : "l'outil est gratuit. La mémoire longue est premium."

**Option C — analyse détaillée**
Séduisante en théorie : offrir la mémoire et monétiser l'Intelligence. Mais trois problèmes structurels. Premier : l'Intelligence n'existe pas encore. Vendre l'accès à quelque chose qui n'existe pas est une promesse non garantissable. Deuxième : par doctrine, l'Intelligence ne peut s'exprimer qu'après 6+ mois de corpus — ce qui signifie que seuls les utilisateurs premium (avec mémoire serveur longue durée) y auraient accès de toute façon. La monétisation de l'Intelligence est donc redondante avec la monétisation de la mémoire. Troisième : séparer "mémoire gratuite + Intelligence premium" crée un incitant pervers à offrir une mémoire incomplète pour forcer l'accès à l'Intelligence.

**Option D — analyse détaillée**
Un seuil de volume (ex : 6 mois de sessions gratuites) est une frontière floue. Elle demande à l'utilisateur de comprendre une quantité, pas une qualité. "Votre mémoire des 6 derniers mois est gratuite" est moins lisible que "votre mémoire locale est gratuite." De plus, un seuil de volume doit être calibré et risque de créer de la frustration à la frontière exacte.

**Option E — analyse détaillée**
Modèle de soutien sans frontière fonctionnelle. Viable comme complément, pas comme modèle principal. La valeur premium est invisible ("je soutiens le projet") — difficile à justifier commercialement sur le long terme. Ne résout pas la question architecturale : quelle est la frontière des fonctionnalités ?

---

## 5. Risques

### Risque 1 — Frustration utilisateur à la frontière

Tout modèle freemium crée une frustration potentielle au moment où l'utilisateur atteint la limite gratuite. Pour Caméléon Engine, ce moment survient entre J+45 et J+60 — quand localStorage commence à perdre les premières sessions. La frustration est d'autant plus faible que la limite était annoncée dès le début et que l'outil continuait à fonctionner normalement jusqu'à ce moment.

**Protection :** communiquer la limite dès J0 ("votre historique local conserve vos 50 dernières sessions"), pas au moment où la limite est atteinte.

### Risque 2 — Incohérence avec le Manifeste

Le risque principal est de construire un premium qui donne l'impression que les utilisateurs payants ont "un meilleur Caméléon Engine." C'est faux et contraire au Manifeste. Les deux tiers utilisent exactement le même moteur, les mêmes scores, le même coaching.

**Protection :** communication permanente — "premium = même outil, mémoire plus longue."

### Risque 3 — Dérive vers un modèle SaaS classique

La tentation est d'ajouter progressivement des fonctionnalités premium au-delà de la mémoire : un tableau de bord agrégé premium, des exports enrichis premium, un historique comparatif premium. Individuellement justifiables. Collectivement, ils créent un produit à deux vitesses.

**Protection :** la checklist gouvernance (A1–B3 de `doctrine_to_product_transition_audit.md`) s'applique à chaque ajout premium. Un ajout qui améliore le moteur pour les utilisateurs premium viole MACRO-RULE-01.

### Risque 4 — Dérive vers un modèle de signaux

"Premium = vous voyez des patterns que les autres ne voient pas." Cette dérive est la plus dangereuse car elle semble valorisante. En réalité, elle transforme la mémoire en signal, et le produit en système d'alerte.

**Protection :** règle permanente — aucun contenu informatif n'est réservé aux utilisateurs premium. La mémoire longue contient plus de données personnelles, pas des données "meilleures" ou "exclusives."

### Risque 5 — Intelligence premium comme fausse promesse

Vendre l'accès à l'Intelligence avant qu'elle existe crée une dette de promesse. Si l'Intelligence met 18 mois à arriver, les utilisateurs premium ont payé 18 mois pour une fonctionnalité absente.

**Protection :** ne pas vendre l'Intelligence séparément. Elle sera accessible naturellement aux utilisateurs premium (parce qu'ils ont la mémoire longue requise) sans qu'il soit nécessaire de la nommer comme fonctionnalité premium distincte.

---

## 6. Recommandation

**Option recommandée : Option B — Moteur gratuit + mémoire longue intégralement premium.**

**Option à rejeter définitivement : Option C — Intelligence premium standalone.**

### Pourquoi Option B est la plus cohérente

La frontière local / serveur est la seule frontière qui respecte simultanément toutes les contraintes doctrinales :

1. **Elle ne dégrade pas le gratuit.** L'utilisateur gratuit a un outil complet sur son appareil. Le moteur fonctionne, le comportemental fonctionne, l'import fonctionne, les 50 dernières sessions sont conservées. Rien n'est retiré.

2. **Elle correspond à la valeur réelle.** La valeur différenciante de Caméléon Engine sur douze mois est la mémoire longue (cf. `user_real_journey_v1.md` — J+180 = premier moment de valeur vraiment différenciante). Le premium monétise exactement cette valeur — pas une promesse, pas un signal, pas un accès privilégié au moteur.

3. **Elle est architecturalement propre.** Pas de seuils flous, pas de volumes à calibrer. Gratuit = localStorage. Premium = serveur. La frontière est technique, lisible, et non négociable.

4. **Elle prépare l'Intelligence sans la promettre.** Un utilisateur premium accumule la mémoire longue requise par la doctrine Intelligence. Quand l'Intelligence existera, elle sera naturellement accessible aux utilisateurs premium parce qu'ils ont le corpus requis — sans qu'il soit nécessaire de créer une troisième tier ou une fonctionnalité premium distincte.

5. **Elle est honnête à communiquer.** "L'outil est gratuit. La mémoire qui traverse vos appareils et le temps est premium." Une phrase. Pas d'astérisque.

### Pourquoi Option C est à rejeter définitivement

Option C (Intelligence premium) est redondante avec Option B : par doctrine, l'Intelligence requiert 6+ mois de corpus, ce qui implique déjà la mémoire longue premium. Séparer les deux crée une complexité sans valeur supplémentaire, et risque d'inciter à offrir une mémoire longue gratuite dégradée pour forcer l'accès à l'Intelligence. Ce piège est exactement le risque de dérive vers un modèle de signaux.

### Dettes futures créées par Option B

| Dette | Nature | Moment |
|-------|--------|--------|
| Définir "mémoire longue" visuellement | Comment l'utilisateur voit-il que sa mémoire est sauvegardée côté serveur ? | À l'implémentation du compte |
| Communiquer la limite localStorage honnêtement | Message visible avant J+45, pas après | UX compte J0 |
| Décider de la portée de "multi-device" en V1 | Est-ce inclus dans premium V1 ou différé ? | Avant premier commit compte |
| Intelligence future = pas une promesse premium | Ne pas figurer l'Intelligence dans le marketing premium avant qu'elle existe | Communication produit |

---

## 7. Décision proposée

### Périmètre gratuit V1 — définitif

| Élément | Statut |
|---------|--------|
| Moteur principal (score, posture, actions, validation humaine) | ✅ Gratuit permanent |
| Coaching adaptatif | ✅ Gratuit permanent |
| Module comportemental complet (import CSV/Excel + scoring) | ✅ Gratuit permanent |
| Historique local (localStorage, 50 sessions FIFO) | ✅ Gratuit permanent |
| Export JSON local (ARCH-N4) | ✅ Gratuit permanent |
| Compte utilisateur (création, magic link, identité) | ✅ Gratuit permanent |
| Sessions comportementales miroir serveur (logging actif) | ✅ Gratuit permanent — le logging est toujours actif |

### Périmètre premium V1 — définitif

| Élément | Statut |
|---------|--------|
| Mémoire longue serveur (au-delà du localStorage, illimitée) | 🔒 Premium |
| Synchronisation multi-device | 🔒 Premium |
| Export serveur complet (portabilité données serveur) | 🔒 Premium |

### Règle de la frontière — permanente

> **La frontière est : local = gratuit · serveur = premium.**
>
> Aucune fonctionnalité du moteur n'est derrière la frontière.
> Aucune fonctionnalité comportementale n'est derrière la frontière.
> La frontière porte uniquement sur la persistance des données au-delà du localStorage.

### Ce que le premium ne débloque jamais

- Un meilleur score
- Un coaching différent
- Des signaux supplémentaires
- Des prédictions
- Un accès anticipé à des fonctionnalités non encore ouvertes
- Un statut visible par d'autres utilisateurs
- Un classement

---

## 8. Conditions bloquantes résiduelles

La décision Gratuit / Premium V1 est fermée. Les quatre autres décisions préalables sont désormais également fermées.

**5 décisions préalables — TOUTES FERMÉES (2026-06-10) :**

| Décision | Statut | Référence |
|----------|--------|-----------|
| Fournisseur serveur | ✅ Supabase | `server_provider_v1.md` · `ee16310` |
| Fournisseur SMTP | ✅ Postmark | `smtp_provider_v1.md` · `2b86678` |
| TTL magic link | ✅ 15 minutes | `magic_link_ttl_v1.md` · `dbb7578` |
| Périmètre migration UUID | ✅ Option C progressive | `uuid_migration_scope_v1.md` · `6c5cffd` |
| Gratuit / Premium V1 | ✅ Option B (ce document) | `freemium_matrix_v1.md` · `2bad403` |

**Une question secondaire à clarifier avant implémentation :**

Multi-device est-il inclus dans premium V1 ou différé à V1.1 ? Cette question ne bloque pas la décision Gratuit/Premium principale — elle porte sur le périmètre exact du premium V1, pas sur sa nature. Elle doit être tranchée avant le premier commit du compte, pas avant la validation de la matrice.

---

## 9. Verdict final

**Décision la plus importante**
La frontière est : local = gratuit, serveur = premium. Cette frontière est architecturale, pas fonctionnelle. Elle ne dégrade jamais le moteur. Elle n'améliore jamais le moteur pour les utilisateurs premium. Elle étend uniquement la mémoire.

**Découverte la plus importante**
Option C (Intelligence premium standalone) est un piège élégant : elle semble valoriser la mémoire longue tout en monétisant l'Intelligence séparément. En réalité, elle crée un incitant structurel à offrir une mémoire gratuite insuffisante pour forcer l'accès à l'Intelligence — ce qui est exactement la définition d'une dégradation artificielle déguisée. Option C doit être rejetée définitivement.

**Option recommandée**
**Option B — Moteur gratuit + mémoire longue intégralement premium.**

**Option rejetée définitivement**
**Option C — Intelligence premium standalone.** L'Intelligence est une conséquence naturelle de la mémoire longue premium — pas une fonctionnalité distincte à monétiser.

**Risque principal**
La dérive progressive : ajouter un tableau de bord premium, puis un export enrichi premium, puis une vue historique premium. Chaque ajout passe la doctrine isolément. Ensemble, ils créent un produit à deux vitesses. Protection = checklist gouvernance appliquée à chaque extension du périmètre premium.

**Règle de gouvernance premium — permanente**
> Avant tout ajout au périmètre premium : la fonctionnalité est-elle de la mémoire longue ou du stockage serveur ? Si non — elle n'appartient pas au premium. Si oui — elle peut y appartenir, sous réserve de la checklist gouvernance A1–A4.

**Verdict final**

Classification : **A — Document fondateur.**

Cette décision ferme l'une des cinq conditions bloquantes de la Checklist Pré-Implémentation (Bloc A2 — Frontière Gratuit / Premium documentée). Elle est une condition nécessaire mais non suffisante à l'ouverture du chantier Compte Utilisateur V1. Les quatre décisions restantes (fournisseur serveur, SMTP, TTL magic link, périmètre migration) doivent être tranchées avant le premier commit.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `user_memory_long_term_audit.md` · `user_real_journey_v1.md` · `intelligence_layer_position_audit.md`*
