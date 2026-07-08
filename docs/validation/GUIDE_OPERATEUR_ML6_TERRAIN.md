# Guide opérateur — Validation terrain ML-6
## LOT-P1-2.5 · CV3 · CV5 · CV7 · CV8 · Roadmap V1 Critère 3

---

## Pré-requis

| Élément | Valeur requise |
|---|---|
| Environnement | cameleonengine.fr · PC Chrome |
| Données | Données opérateur présentes (sessions comportementales, journal, portefeuille, etc.) |
| Compte | Connecté avec le compte opérateur habituel |
| Chargement | Page chargée au moins une fois après le déploiement du commit `b46ab70` |

**Ouvrir la console Chrome :** touche F12 → onglet **Console**.

---

## BLOC 0 — Initialisation (coller une seule fois en début de session)

> Coller ce bloc entier dans la console et valider avec Entrée.
> Toutes les commandes suivantes dépendent des variables définies ici.

```javascript
// BLOC 0 — À exécuter en premier · une seule fois par session console
const _id  = JSON.parse(localStorage.getItem('CE_identity_v1') || 'null');
const _uuid = _id?.data?.uuid ?? null;
const _hasUUID = localStorage.getItem('CE_migration_uuid_v1_done') === '1';
const _sfx = (_hasUUID && _uuid) ? `__${_uuid}` : '';
const _k   = (base) => `${base}${_sfx}`;
const _ls  = (key) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };

console.log('━━━ BLOC 0 — Initialisation ━━━');
console.log('UUID             :', _uuid  ?? '⚠ absent');
console.log('Namespacing UUID :', _hasUUID ? 'actif (suffixe __uuid)' : 'inactif (clés brutes)');
console.log('Clé corpus       :', _k('CE_canonical_corpus_v1'));
console.log('Clé index        :', _k('CE_canonical_index_v1'));
console.log('Clé drapeau      :', _k('CE_canonical_migration_v1_done'));
```

**Résultat attendu :** UUID affiché · Namespacing UUID = actif · trois clés avec suffixe visible.
**Si UUID absent :** ne pas continuer — la migration ne peut pas avoir eu lieu. Recharger la page et recommencer.

---

## Étape 1 — Vérifier le drapeau de migration (prérequis pour CV3 et CV5)

```javascript
// C1 — Drapeau de migration canonique
const _flagMig = localStorage.getItem(_k('CE_canonical_migration_v1_done'));
console.log('Drapeau migration :', _flagMig);
// Attendu : "1"
```

**Interprétation :**
- `"1"` → migration exécutée. Continuer.
- `null` → migration non exécutée.
  - Cause probable : la page n'a pas été rechargée depuis le déploiement de `b46ab70`.
  - Action : recharger la page (F5), rouvrir la console, re-coller BLOC 0, re-coller C1.
  - Si toujours null après rechargement : noter **NON VÉRIFIABLE** sur CV3 et CV5 et passer à CV7.

---

## Étape 2 — CV3 et Roadmap V1 Critère 3 — Indexation opérationnelle

> Ces deux critères vérifient la même chose. Un seul jeu de commandes suffit.

### C2 — Présence et structure de l'index

```javascript
// C2 — Index canonique : structure générale
const _index = _ls(_k('CE_canonical_index_v1'));
console.log('━━━ CV3 / Roadmap 3 — Index ━━━');
console.log('Index présent :', _index !== null ? '✓ oui' : '✗ absent');
if (_index) {
  console.log('Axes présents :', Object.keys(_index));
  console.log('byDate — nb entrées  :', Object.keys(_index.byDate ?? {}).length);
  console.log('bySession — nb entrées:', Object.keys(_index.bySession ?? {}).length);
} else {
  console.warn('Index absent — vérifier le drapeau C1 avant de continuer');
}
```

**Attendu :** index présent · axes `byFamille`, `byDate`, `bySession` présents.

### C3 — Familles actives Phase A indexées

```javascript
// C3 — byFamille : 4 familles actives Phase A
if (_index) {
  console.log('━━━ byFamille — familles Phase A ━━━');
  ['SY1', 'SY3', 'S1', 'S2'].forEach(f => {
    const ids = _index.byFamille?.[f];
    const n   = Array.isArray(ids) ? ids.length : 0;
    console.log(`  ${f} :`, n > 0 ? `${n} trace(s) ✓` : '0 trace — aucune donnée source pour cette famille');
  });
  console.log('Toutes les familles indexées :',
    Object.entries(_index.byFamille ?? {})
      .filter(([, ids]) => ids.length > 0)
      .map(([f, ids]) => `${f}(${ids.length})`)
  );
}
```

**Attendu :** au moins SY1 avec ≥ 1 trace (SY1 = comportemental — toujours présent si des sessions existent).
**Si 0 partout :** les données source étaient absentes lors de la migration — noter l'observation, verdict à décider.

### C4 — byDate : dates formalisées présentes

```javascript
// C4 — byDate : états formalisés R1/R3/R4
if (_index) {
  const _dates = Object.keys(_index.byDate ?? {});
  const _r1r3  = _dates.filter(d => d === 'Non disponible');
  const _r4    = _dates.filter(d => d === 'Non exploitable au format canonique');
  const _iso   = _dates.filter(d => d !== 'Non disponible' && d !== 'Non exploitable au format canonique');
  console.log('━━━ byDate — états de date ━━━');
  console.log('R1/R3 "Non disponible"              :', _r1r3.length > 0 ? '✓ présent' : '— absent');
  console.log('R4 "Non exploitable au format can." :', _r4.length > 0  ? '✓ présent' : '— absent');
  console.log('ISO 8601 (datables)                 :', _iso.length, 'entrée(s)');
}
```

### Verdict CV3 + Roadmap V1 Critère 3

| Observation | Verdict |
|---|---|
| Index présent · axes byFamille/byDate/bySession présents · ≥ 1 famille avec traces | PASS |
| Index absent après rechargement | NON VÉRIFIABLE |
| Index présent mais toutes les familles à 0 | À consigner — décision opérateur |

---

## Étape 3 — CV5 — Aucune perte de données

### C5 — Corpus : présence et nombre de traces

```javascript
// C5 — Corpus canonique : présence
const _corpus = _ls(_k('CE_canonical_corpus_v1'));
console.log('━━━ CV5 — Corpus ━━━');
console.log('Corpus présent :', _corpus !== null ? '✓ oui' : '✗ absent');
console.log('Nombre de traces :', _corpus ? _corpus.length : 0);
// Attendu : entre 1 et 10 selon les données opérateur présentes au moment de la migration
```

### C6 — Corpus : détail de chaque trace

```javascript
// C6 — Contenu de chaque trace migrée
if (_corpus && _corpus.length > 0) {
  console.log('━━━ CV5 — Détail traces ━━━');
  _corpus.forEach((t, i) => {
    console.log(`\n  [${i + 1}]`,
      '| famille:', t.famille,
      '| source:', t.source,
      '| date:', t.date,
      '| valeur:', (t.valeur !== null && t.valeur !== undefined) ? '✓' : '⚠ absente',
      '| migratedAt:', t.migratedAt ?? '(hors migration)'
    );
  });
} else if (_corpus && _corpus.length === 0) {
  console.warn('Corpus vide — aucune donnée source présente lors de la migration');
} else {
  console.warn('Corpus absent — vérifier drapeau de migration (C1)');
}
```

### C7 — Intégrité des champs obligatoires (RV1-RV4)

```javascript
// C7 — Vérification RV1-RV4 sur toutes les traces
if (_corpus && _corpus.length > 0) {
  console.log('━━━ CV5 — Intégrité RV1-RV4 ━━━');
  let _ok = 0, _ko = 0;
  _corpus.forEach((t, i) => {
    const _miss = [];
    if (!t.famille)                                             _miss.push('famille');
    if (!t.source || typeof t.source !== 'string' || !t.source.trim()) _miss.push('source');
    if (!t.date)                                               _miss.push('date');
    if (t.valeur === null || t.valeur === undefined || t.valeur === '') _miss.push('valeur');
    if (_miss.length === 0) { _ok++; console.log(`  [${i + 1}] PASS`); }
    else { _ko++; console.warn(`  [${i + 1}] FAIL — manquants : ${_miss.join(', ')}`); }
  });
  console.log(`\n  Résultat : ${_ok} PASS · ${_ko} FAIL`);
}
```

### C8 — États de date formalisés dans le corpus

```javascript
// C8 — Dates R1/R3/R4 dans le corpus
if (_corpus && _corpus.length > 0) {
  const _r1r3c = _corpus.filter(t => t.date === 'Non disponible');
  const _r4c   = _corpus.filter(t => t.date === 'Non exploitable au format canonique');
  const _isoc  = _corpus.filter(t => t.date !== 'Non disponible' && t.date !== 'Non exploitable au format canonique');
  console.log('━━━ CV5 — États de date ━━━');
  console.log('R1/R3 (Non disponible)              :', _r1r3c.length, 'trace(s)');
  console.log('R4 (Non exploitable au format can.) :', _r4c.length,   'trace(s)');
  console.log('ISO 8601                            :', _isoc.length,  'trace(s)');
  console.log('Attendu : R4 ≥ 1 si données "Paramètres d\'ordres récents" présentes');
}
```

### C9 — Données d'origine toujours présentes (D9 — aucune suppression)

```javascript
// C9 — Données d'origine : vérifier qu'elles n'ont pas été supprimées
const _origChecks = [
  ['Sessions comportementales', _k('CE_behavior_sessions_v1')],
  ['Mémoire comportementale',   _k('cameleon_behavior_memory_v1')],
  ['Journal des décisions',     _k('CE_journal_entries_v1')],
  ['Sauvegardes moteur',        _k('CE_backups_v1')],
  ['Registre des importations', _k('CE_import_registry_v1')],
  ['Portefeuille',              _k('CE_portfolio_v1')],
  ['Mémoire opérateur',         _k('CE_operator_memory_v1')],
  ['Historique OI V1',          _k('CE_oi_history_v1')],
];
console.log('━━━ CV5 — Données d\'origine (D9) ━━━');
_origChecks.forEach(([label, key]) => {
  const v = localStorage.getItem(key);
  console.log(`  ${label} :`, v !== null ? '✓ présente' : '— absente (normal si jamais saisie)');
});
```

**Note :** une donnée absente n'est pas un FAIL — elle peut simplement n'avoir jamais existé. L'important est qu'aucune donnée qui existait avant le déploiement n'ait disparu.

### Verdict CV5

| Observation | Verdict |
|---|---|
| Corpus présent · ≥ 1 trace · toutes les traces PASS RV1-RV4 · données d'origine présentes | PASS |
| Corpus absent ou vide après rechargement | NON VÉRIFIABLE |
| Au moins une trace avec champ manquant | FAIL |
| Données d'origine manquantes pour une clé qui existait avant | FAIL |

---

## Étape 4 — CV7 — Diagnostic mémoriel non régressé

> Vérification UI — aucune commande console.
> Naviguer dans l'application et observer chaque point.

### 4.1 — Accéder au diagnostic mémoriel

1. Cliquer sur l'onglet **Mémoire** dans la barre de navigation de l'application.
2. Observer que la page se charge sans erreur visible.
3. Vérifier dans la console Chrome qu'aucune erreur JavaScript n'est affichée (onglet Console · filtrer "Errors").

### 4.2 — Introduction (V12)

**Texte attendu exact, en tête du diagnostic :**

> "Le diagnostic mémoriel lit l'état actuel des données enregistrées sur cet appareil. Il ne modifie aucune donnée, ne produit aucune recommandation et ne déclenche aucune action. Une famille absente ou vide est un état normal."

- Texte visible sans interaction.
- Positionné avant les données.
- Mot pour mot — aucune variation acceptable.

### 4.3 — Total et occupation (V11)

- Espace total affiché en Ko avec une décimale.
- Pourcentage d'occupation affiché.
- Niveau d'occupation : "Nominal", "Élevé" ou "Saturé" — aucun autre terme.
- Total positionné avant les familles F1→F5.

### 4.4 — Sections F1→F5 présentes (V1–V3)

Vérifier que les cinq sections sont visibles :

| Section | Nom affiché |
|---|---|
| F1 | Mémoire comportementale |
| F2 | Mémoire opérateur |
| F3 | Mémoire décisionnelle |
| F4 | Données opérateur |
| F5 | Système local |

### 4.5 — États des entrées (V4, V5, V6)

Pour au moins une entrée de chaque état :

**État Présente** : nom · espace en Ko · date "Mis à jour le JJ/MM/AAAA" · étiquette de provenance · aucun message d'état parasite.

**État Vide** : nom · "Aucune donnée enregistrée" · espace en Ko de l'enveloppe · date si disponible.

**État Absente** : nom · "Non enregistrée" · espace "—" · aucune date.

### 4.6 — Datation non disponible R1 et R3 (V7, V8)

- **Mémoire comportementale (R1)** : affiche "— datation non disponible". Aucune date JJ/MM/AAAA.
- **Niveau de garde comportemental (R3)** : affiche "— datation non disponible". Aucune date JJ/MM/AAAA.

### 4.7 — Datation standard (V9)

Pour une entrée datable avec données présentes (ex. Journal des décisions, Sauvegardes moteur) :
- Date au format "Mis à jour le JJ/MM/AAAA".
- Date sans l'heure.
- Date cohérente avec une écriture récente.

### 4.8 — Hiérarchie F1→F4 / F5 (V14)

- F1, F2, F3, F4 affichées avant F5.
- F5 visuellement distinct (zone secondaire).

### 4.9 — Repliabilité de F5 (V15)

1. Réduire la zone F5 (clic sur le contrôle de repli).
2. Vérifier que F1→F4 ne sont pas affectées.
3. Restaurer F5.
4. Vérifier que les données F5 sont identiques avant et après.
5. Vérifier qu'aucune famille F1→F4 n'est repliable.

### Verdict CV7

| Observation | Verdict |
|---|---|
| Tous les points 4.2 → 4.9 conformes · aucune erreur console | PASS |
| Au moins un point non conforme par rapport à l'état pré-LOT-P1-2 | FAIL |
| Onglet Mémoire inaccessible ou erreur bloquante | FAIL |

---

## Étape 5 — CV8 — Compatibilité export/import

### 5.1 — Export : déclencher et inspecter

**Via l'interface :**
1. Onglet **Mémoire** → section **Gestion des données** → bouton **Exporter**.
2. Télécharger le fichier JSON.
3. Ouvrir le fichier dans un éditeur de texte ou le navigateur de fichiers.
4. Vérifier la présence des clés canoniques : rechercher `canonicalCorpus` dans le fichier.

**Via la console (alternative) :**

```javascript
// C10 — Simuler la lecture de l'export depuis localStorage
// (lecture seule — aucune modification)
const _expCorpus = _ls(_k('CE_canonical_corpus_v1'));
const _expIndex  = _ls(_k('CE_canonical_index_v1'));
console.log('━━━ CV8 — Export : clés canoniques ━━━');
console.log('canonicalCorpus dans export :', _expCorpus !== null ? `✓ présent (${_expCorpus.length} traces)` : '— absent (non inclus si corpus vide)');
console.log('canonicalIndex dans export  :', _expIndex  !== null ? '✓ présent' : '— absent');
```

### 5.2 — Import : tester la compatibilité ascendante

**Test avec export actuel (nouveau format) :**
1. Réaliser l'export (étape 5.1).
2. Onglet **Mémoire** → **Importer** → sélectionner le fichier exporté.
3. Confirmer l'import.
4. Après rechargement, vérifier que les données sont restaurées.

**Commande de vérification post-import :**

```javascript
// C11 — Vérifier l'état après import
const _flagPostImport = localStorage.getItem(_k('CE_canonical_migration_v1_done'));
const _corpusPostImport = _ls(_k('CE_canonical_corpus_v1'));
console.log('━━━ CV8 — Post-import ━━━');
console.log('Drapeau migration :', _flagPostImport ?? 'absent');
console.log('Corpus après import :', _corpusPostImport ? `${_corpusPostImport.length} traces` : 'absent');
console.log('Attendu si nouveau format : drapeau = "1" · corpus présent');
```

### 5.3 — Test optionnel : ancien export sans clés canoniques

Si un fichier export antérieur à LOT-P1-2 est disponible (sans `canonicalCorpus`) :

1. Importer ce fichier.
2. Après rechargement, vérifier dans la console :

```javascript
// C12 — Vérifier la re-migration après import ancien format
const _flagReplay = localStorage.getItem(_k('CE_canonical_migration_v1_done'));
console.log('━━━ CV8 — Import ancien format ━━━');
console.log('Drapeau migration :', _flagReplay ?? 'absent');
console.log('Attendu si ancien format : drapeau absent (re-migration au prochain chargement)');
// Recharger la page puis re-coller BLOC 0 + C1 pour confirmer la re-migration
```

### Verdict CV8

| Observation | Verdict |
|---|---|
| Export contient `canonicalCorpus` · import restaure les données · drapeau positionné | PASS |
| Export réussi · `canonicalCorpus` absent car corpus vide (aucune donnée migrée) | NON VÉRIFIABLE — corpus vide |
| Import provoque une erreur · données perdues après import | FAIL |

---

## Grille de verdicts à reporter

Consigner les verdicts observés, puis les reporter dans `docs/validation/LOT-P1-2_5_VALIDATION_TERRAIN_V1.md` (§4 et §5).

| Critère | Observation console / UI | Verdict |
|---|---|---|
| CV3 — Indexation | | |
| CV5 — Aucune perte | | |
| CV7 — Diagnostic mémoriel | | |
| CV8 — Export/import | | |
| Roadmap V1 Critère 3 — Retrouvabilité | | |

**Règle :** inscrire PASS uniquement si l'observation confirme sans ambiguïté le critère. Inscrire NON VÉRIFIABLE si une donnée manque ou si une condition préalable n'est pas remplie. Ne pas supprimer les données d'origine.

---

## En cas de problème

| Symptôme | Action |
|---|---|
| UUID absent (BLOC 0) | Recharger la page · vérifier la connexion au compte |
| Drapeau migration null (C1) | Recharger la page · re-exécuter BLOC 0 + C1 |
| Corpus absent malgré drapeau = "1" | Les données source étaient absentes lors de la migration — noter l'observation |
| Erreur JavaScript dans la console | Copier le message d'erreur complet · consigner dans le rapport |
| Import échoue | Vérifier le format du fichier · taille < 5 Mo |

---

*Guide opérateur ML-6 — LOT-P1-2.5 · Programme P1 · Phase A · Caméléon Engine · 2026-07-08.*
