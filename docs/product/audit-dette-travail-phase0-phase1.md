# Audit de dette — Phase 0 → Phase 1
## Caméléon Engine

**Date :** 2026-05-19
**Statut :** document d'audit de travail — non prescriptif sur l'ordre d'exécution.
*Ce document recense ce qui existe réellement, ce qui manque réellement, et ce qui ne doit
pas être lancé. Il ne motive pas. Il ne propose pas de features. Il réduit la dispersion.*

**Périmètre :** repo `antoniolisci/Cameleon-Engine`, docs doctrine, roadmap Phase 0→5,
audits sécurité, résultats Phase 4 tests terrain.

---

## État réel au moment de l'audit

### Ce qui est terminé

**Doctrine et identité**
- Manifeste produit (`docs/manifesto-cameleon-engine.md`) — stable
- Doctrine profondeur-viabilité (`docs/product/doctrine-cameleon-profondeur-viabilite.md`) — stable
- Roadmap V1 (`docs/product/orientation-roadmap-cameleon-engine-v1.md`) — dernier document stratégique justifié
- Audit cohérence doctrinale (`docs/product/audit-coherence-doctrinale-2026-05-19.md`) — contradictions documentées
- Doctrine transmission V0 (`docs/product/doctrine-cameleon-transmission-test-reel-v0.md`) — provisoire, prêt

**Moteur décisionnel**
- Pipeline complet opérationnel : `engine.js` → `decision.js` → `trading-policy.js` → `buildPayload()`
- Score confiance marché (`confidence-score.js`, 4 facteurs pondérés)
- Confiance d'exécution (`execution-confidence.js`, gradient 0–100, 6 états × engagement × comportement)
- Friction graduelle (`friction.js`, 0/1500/3000/5000ms, stateless, toujours bypassable)
- 6 états décisionnels : BLOCKED / PROTECT / WAIT / READY / TENSION / ALIGNED
- Structure payload ~40 clés, source de vérité unique

**Module comportemental**
- Pipeline complet : import CSV/XLSX → parser → canonical → metrics → patterns → scoring → coaching → rendu
- 5 patterns comportementaux identifiables
- 4 profils : Discipliné / Réactif / Impulsif / Agressif
- Phase 4 validée : 4157 trades réels, 0 crash, 0 NaN, 0 freeze
- Stress tests SYN-001→SYN-006 validés
- CASE_001, CASE_002, CASE_003 documentés et soldés
- Isolation stricte respectée : 0 lecture moteur, 0 événement global, 0 persistance

**Import pipeline**
- Format-detector, grid-grouper, binance_order, order-analyzer opérationnels
- SheetJS vendorisé (v0.20.3), CDN supprimé
- 5 Mo guard en place sur le pipeline
- `escHtml()` validé sur toutes les données utilisateur dans le DOM

**Sécurité — hardening partiel appliqué**
- git-filter-repo : données Binance purgées, 167 commits nettoyés
- innerHTML : 31 occurrences auditées, 0 risque élevé
- `setHtml()` supprimé (helper non sécurisé, 0 call site)
- `.gitignore` durci : `excel_tests/`, `src/.claude/` exclus
- Debug surface réduite : 84 lignes supprimées
- localStorage : 15 clés auditées, 0 données sensibles, cap 50 FIFO appliqué

**Identité visuelle**
- Réduction V1 : 13 patches appliqués
- Audit visuel canonique V1 (`docs/visual/audit-visuel-canonique-v1.md`)
- Grammaire visuelle définie (palette, mouvement, typographie)

---

## 1. Dette critique immédiate

*Ces éléments bloquent l'entrée en Phase 1 ou créent des contradictions actives
dans le contrat de développement. Ils sont peu nombreux, ciblés, et résolubles
sans refactoring majeur.*

---

### D-C1 — CLAUDE.md contient une affirmation techniquement fausse

**Énoncé :** `CLAUDE.md` déclare *"The behavioral analysis module is explicitly ephemeral
— no persistence by design."*

**Réalité depuis V4.2 :** `behaviorRepo` persiste `orderStrategyProfile` avec TTL 7 jours.
`guardLevel` et `guardLevelUpdatedAt` persistent dans `localStorage`. `BHV_DELTA` dans
`execution-confidence.js` modifie le score de confiance sur la base de l'état comportemental
passé. Ce n'est pas de l'éphémère.

**Impact :** Tout développeur qui lit `CLAUDE.md` repart avec une compréhension incorrecte
de l'architecture. La contradiction existe dans le contrat de développement officiel.

**Ce qui doit être fait :** Mettre à jour la ligne correspondante dans `CLAUDE.md` pour
documenter que le module comportemental inclut une persistance TTL défensive depuis V4.2.
Travail : 3 lignes de texte.

---

### D-C2 — "VALIDATION BLOCK" dans le payload contredit le manifeste

**Énoncé :** Le manifeste (section VIII) interdit explicitement les termes : interdit,
bloqué, suspendu, verrouillé, refusé. "BLOCK" figure dans cette liste.

**Réalité :** `tradingStatus` peut valoir `VALIDATION BLOCK` dans le payload.

**Impact :** Le terme n'est pas visible dans l'UI finale telle qu'elle est rendue
aujourd'hui. Mais il existe dans la structure de données. Tout futur développeur qui lit
le payload lit une valeur qui contredit directement le document fondateur. C'est une
bombe à retardement dans la transmission technique du projet.

**Ce qui doit être fait :** Soit renommer la valeur dans le payload vers un terme compatible
(ex. `VALIDATION_PENDING`, `GATE_PENDING`), soit documenter l'intention explicite de
garder ce terme en interne avec une note dans `CLAUDE.md`. L'arbitrage est à trancher —
pas à reporter.

---

### D-C3 — CSP absente : 2 blocants triviaux non corrigés

**Énoncé :** La CSP est identifiée comme l'unique mesure de sécurité structurante
manquante avant déploiement (`SECURITY_ROADMAP_PRE_PUBLIC_RELEASE.md`, H1).

**Réalité :** La CSP Phase 2 — qui protège contre toute injection de script externe —
est activable avec deux corrections triviales identifiées dans `CSP_AUDIT_001` :

- **BLOCKER-001** : un inline `<script>` dans `index.html:10` (onboarding localStorage check).
  Résolution : externaliser dans `onboarding-init.js` (fichier déjà existant). Effort : 5 minutes.
- **BLOCKER-002** : un `onclick=` inline dans `index.html:542` (navigation vers
  `constellium.html`). Résolution : attacher via `addEventListener`. Effort : 2 minutes.

Après ces deux corrections, la balise `<meta http-equiv="Content-Security-Policy">`
documentée dans `CSP_AUDIT_001` est applicable sans casse.

**Ce qui bloque :** Rien de technique. L'audit est fait, les corrections sont documentées,
le niveau d'effort est minimal. Ces corrections ne sont pas faites.

---

### D-C4 — Debug panel non conditionné

**Énoncé :** Le Debug Brain expose en temps réel : posture moteur, score confiance, règles
autorisées/interdites, état interne complet. Acceptable en développement solo. Problématique
dès que le produit est ouvert à un tiers, même en accès direct sans déploiement public.

**Ce qui doit être fait :** Conditionner l'affichage du Debug Brain à un flag explicite
(paramètre URL `?debug=1` ou variable de configuration). La fonctionnalité n'est pas à
supprimer — elle est à conditionner. Travail ciblé dans `render.js`.

---

### D-C5 — H2/H3 uploader.js : validation taille et MIME absentes

**Énoncé :** Aucune limite de taille imposée sur les fichiers importés avant parsing SheetJS.
Aucune validation double extension/MIME.

**Impact :** Un fichier très volumineux peut freezer le navigateur. Identifié comme PRIORITÉ
HAUTE dans la roadmap sécurité. Résolution documentée, non implémentée.

**Ce qui doit être fait :** Ajouter dans `uploader.js` : rejet si `file.size > 10Mo`,
vérification `file.type` + extension. Quelques lignes. Non bloquant aujourd'hui en usage
solo — bloquant dès que le produit est partagé.

---

## 2. Dette secondaire

*Problèmes réels, non bloquants pour Phase 1. À traiter pendant Phase 1 ou en entrée de
Phase 2. Ne pas les confondre avec des priorités immédiates.*

---

### D-S1 — C2 : labels comportementaux portent une valence morale

Le manifeste dit "miroir, pas tribunal." Les profils "Impulsif" et "Agressif" contiennent
un jugement implicite. Ce n'est pas un bug — c'est une tension sémantique non résolue.
Elle ne casse rien aujourd'hui. Elle deviendra visible dès que des utilisateurs réels liront
leur profil. Arbitrage à faire avant Phase 3, pas avant Phase 1.

### D-S2 — M1 : validation JSON localStorage à la lecture

La désérialisation depuis localStorage est partiellement couverte par try/catch. Le cas
"JSON corrompu → crash silencieux" n'est pas géré de façon systématique dans `state.js`.
Impact : un utilisateur dont le localStorage est corrompu peut rencontrer un état indéfini.
Non critique en usage local solo. À formaliser avant tout partage du cockpit.

### D-S3 — M3 : logs console de diagnostic non conditionnés

`uploader.js` et d'autres modules émettent des `console.log` de diagnostic actifs en
production. Pas de risque de sécurité — de la pollution de console visible pour tout tiers
qui ouvre DevTools. À conditionner à un flag debug.

### D-S4 — M4 : gestion XLSX corrompu non testée exhaustivement

Le try/catch autour du parsing SheetJS couvre les cas courants mais n'a pas été validé sur
des fichiers intentionnellement malformés. Identifié, non testé. Acceptable pour Phase 1
usage contrôlé — à valider avant Phase 3.

### D-S5 — C5 : "un seul point de vérité visuel" vs zones permanentes

L'audit de cohérence identifie une tension : la règle "jamais deux verdicts forts simultanés"
coexiste avec "Zone Conscience — présence permanente mais discrète." "Discrète" n'a pas de
seuil défini. Tension sémantique ouverte, non résolue. Ne casse rien. À trancher avant de
concevoir de nouvelles zones visuelles.

---

## 3. Dette reportée volontairement

*Ces éléments sont documentés, connus, et intentionnellement hors périmètre Phase 1.
Les ouvrir maintenant serait de la dispersion.*

---

### D-R1 — C4 : cap FIFO 50 sessions vs mémoire comportementale V2

Le cap à 50 sessions détruit l'historique dont V2 aura besoin. C'est une collision
structurelle documentée. Elle ne peut pas être résolue sans backend (Phase 2). Toute
tentative de "corriger" le cap côté localStorage est du faux travail — le problème
n'est pas le cap, c'est l'absence de persistance distante.

**Décision :** Reporter à Phase 2. Ne pas toucher au cap.

### D-R2 — T3 : plancher analytique LS-1→LS-4 non corrigé

Sur profils multi-actifs longue période, le score comportemental plancher est ~15 de façon
déterministe. Les limitations LS-1 à LS-4 sont des propriétés structurelles du moteur V1.
La segmentation temporelle V2 construite sur ce plancher produira des segments scorant
tous ~15-25 — pas plus de profondeur, la même profondeur plafonnée en tranches.

**Décision :** Corriger les LS avant de construire V2 segmentation. Reporter à Phase 2/3.
Ne pas lancer V2 avant cette correction.

### D-R3 — T1 : rétention 12 mois immesurable sans backend

La doctrine définit le taux de rétention à 12 mois comme indicateur de santé. L'architecture
actuelle ne peut pas mesurer cet indicateur. C'est une contradiction de structure qui ne peut
être résolue qu'en Phase 2 avec télémétrie minimale.

**Décision :** Accepter l'angle mort. Reporter à Phase 2. Ne pas inventer de proxy local.

### D-R4 — BLOCKER-003/004 : CSP Phase 3 stricte

Externaliser le CSS de `constellium.html` et migrer les 16 attributs `style=""` inline vers
des classes CSS sont des prérequis à la CSP Phase 3 (sans `'unsafe-inline'`). Ce travail
est non trivial sur `render.js`. Non bloquant pour Phase 1 — la CSP Phase 2 avec
`style-src 'self' 'unsafe-inline'` est suffisante.

**Décision :** Reporter à Phase 3 (avant déploiement public). Phase 1 s'arrête à CSP Phase 2.

### D-R5 — A3 : hiérarchie manifeste vs doctrine non formalisée

Les deux documents revendiquent l'autorité finale. Aucun mécanisme de résolution en cas de
conflit. Cette ambiguïté est réelle. Elle ne causera pas de problème en Phase 1 si aucune
décision ne les met en contradiction directe.

**Décision :** Documenter la hiérarchie (une ligne dans la doctrine suffit) lors d'un
prochain arbitrage doctrinal. Ce n'est pas une priorité isolée.

---

## 4. Faux problèmes et distractions

*Ces éléments ont l'apparence de problèmes. Ce ne sont pas des priorités de travail en
Phase 0/1. Les traiter maintenant serait de la dispersion déguisée en rigueur.*

---

### F-1 — render.js "fait 5106 lignes"

render.js est un monolithe fonctionnel, stable, dont toutes les couvertures de test terrain
ont passé sans crash. Sa taille est un indicateur de complexité, pas un défaut actif. Le
refactoring d'un module qui fonctionne et ne pose pas de problème pratique est du faux
travail. Il n'y a pas de bug à résoudre, pas de comportement incorrect, pas de risque
identifié lié à la taille.

**Ce que ce n'est pas :** une priorité Phase 1.

### F-2 — behavior-view.js "fait 1264 lignes"

Même logique. Le module comportemental est isolé, testé sur données réelles, stable.
Sa taille n'est pas un problème opérationnel.

**Ce que ce n'est pas :** une priorité Phase 1.

### F-3 — La doc est éparpillée

71 fichiers Markdown dans `docs/` et `project_memory/`. Certains sont des archives,
des notes de session, des cas de test. La fragmentation documentaire ne casse pas le
produit. Un index ou un nettoyage seraient du cosmétique, pas du travail critique.

**Ce que ce n'est pas :** une priorité Phase 1.

### F-4 — Les satellites (TAO Atlas, Macro Engine)

Ils n'existent pas. La doctrine les mentionne comme possibles à terme. Y penser maintenant
est de la sur-conceptualisation. Le manifeste dit qu'ils "suivent la même doctrine" —
ce qui implique que la doctrine doit d'abord être prouvée sur le produit principal.

**Ce que ce n'est pas :** un chantier à ouvrir avant Phase 3.

### F-5 — Les nouvelles vidéos et assets visuels

L'audit visuel canonique V1 existe. Les classifications sont provisoires et en attente de
confirmation par lecture visuelle directe. La prochaine étape visuelle documentée est :
regarder les assets existants, classer, décider. Ce n'est pas de produire de nouveaux
assets.

**Ce que ce n'est pas :** un chantier à ouvrir avant d'avoir regardé ce qui existe.

### F-6 — M2 : checksum SHA-256 du vendor SheetJS

SheetJS est vendorisé, version figée, source officielle. Le risque d'une modification
non intentionnelle du fichier vendor en usage local solo est théorique. Calculer et
documenter un checksum est un bon pratique — à faire lors d'une mise à jour vendor,
pas comme travail autonome.

**Ce que ce n'est pas :** une priorité isolée.

### F-7 — A1 : "profondeur" non définie opérationnellement

La doctrine n'a jamais défini "profondeur" avec des critères objectifs. L'audit identifie
le risque : n'importe quelle feature peut être argumentée "profondeur." Ce risque se
matérialisera lors du design du premium. Il ne se matérialise pas en Phase 0/1 où aucune
feature premium n'est conçue.

**Ce que ce n'est pas :** une urgence. Adresser lors de la conception du premium (Phase 4).

---

## 5. Critères minimaux d'entrée réelle en Phase 1

*Ces cinq critères sont nécessaires et suffisants. Phase 1 ne commence pas sans eux.
Phase 1 ne nécessite rien de plus.*

---

**CR-1 — CLAUDE.md reflète l'architecture réelle**

La persistance TTL du module comportemental (V4.2) est documentée dans `CLAUDE.md`.
Un développeur qui lit le fichier ne repart pas avec une compréhension incorrecte.

**CR-2 — La contradiction C3 est arbitrée**

`VALIDATION BLOCK` dans le payload est soit renommé en terme compatible doctrine, soit
documenté comme intentionnel avec justification dans `CLAUDE.md`. La contradiction entre
le payload et le manifeste n'est plus ouverte.

**CR-3 — CSP Phase 2 activée**

BLOCKER-001 (inline script onboarding) et BLOCKER-002 (inline onclick) sont corrigés.
La balise `<meta http-equiv="Content-Security-Policy">` est présente dans `src/index.html`
avec la configuration documentée dans `CSP_AUDIT_001`. Validée sur 8 tests fonctionnels
minimum (import CSV, import XLSX, engine complet, debug panel, onboarding).

**CR-4 — Debug panel conditionné**

L'accès au Debug Brain nécessite un signal explicite (paramètre URL ou flag de configuration).
Le panel n'est pas visible par défaut pour un utilisateur qui n'est pas le développeur.

**CR-5 — Validation taille et MIME à l'import**

`uploader.js` rejette les fichiers au-dessus de 10 Mo avant tout parsing SheetJS.
La validation extension + MIME est en place. Un fichier volumineux ou d'un format non
reconnu produit un message d'erreur utilisateur clair, non technique.

---

## Note finale

Ces cinq critères représentent environ 2 heures de travail technique effectif.
Le seul qui nécessite une décision préalable est CR-2 — qui n'est pas du code,
c'est un arbitrage : renommer ou documenter.

Tout le reste est de l'exécution sur des spécifications déjà produites.

La Phase 1 n'est pas bloquée par un manque de compréhension.
Elle est bloquée par l'absence de cinq actes de finition documentés depuis des semaines.

---

*Créé le 2026-05-19. Audit ponctuel — non prescriptif sur l'ordre d'exécution.
Ne remplace pas la doctrine. Ne génère pas de nouvelles features.*
*Fichier source : `docs/product/audit-dette-travail-phase0-phase1.md`*
*Références : `docs/product/orientation-roadmap-cameleon-engine-v1.md` ·
`docs/product/audit-coherence-doctrinale-2026-05-19.md` ·
`project_memory/known_limitations/SECURITY_ROADMAP_PRE_PUBLIC_RELEASE.md` ·
`project_memory/known_limitations/CSP_AUDIT_001_pre_public_release.md`*
