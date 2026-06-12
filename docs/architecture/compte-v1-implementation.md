# Compte Utilisateur V1 — Documentation d'implémentation

**Statut : TERMINÉ — 2026-06-12**
**Commits :** `963e630` → `df21375` → `67ad37b` → `6f1ced3`

---

## 1. Architecture retenue

Le système Compte V1 est implémenté en 4 modules ES isolés :

| Fichier | Rôle |
|---------|------|
| `account-config.js` | Instance Supabase (singleton) |
| `account-storage.js` | Lecture/écriture `CE_account_v1` + `getLocalUUID()` |
| `account-events.js` | Bus d'événements (`emit` / `on`) sur `document` |
| `account-service.js` | Logique métier : Magic Link, sync, signOut |
| `account-ui.js` | Rendu DOM, gestion onglet, coordination panels |
| `account-init.js` | Point d'entrée — appelle `verifyMagicLink()` avant render.js |

**Règle d'isolation absolue :** zéro import depuis `render.js`, `engine.js`, `decision.js`. Le moteur ne sait pas que le compte existe.

---

## 2. Flux Magic Link

```
1. Utilisateur saisit email + coche CGU → sendMagicLink(email)
2. Rate limit client : 3 envois / 15 min (CE_magic_link_rl_v1)
3. supabase.auth.signInWithOtp({ email, emailRedirectTo: window.location.href })
4. Email reçu → clic lien → redirection avec #access_token dans l'URL
5. Supabase SDK détecte le token → échange → session active
6. onAuthStateChange('SIGNED_IN') → _syncAccount(session)
7. Fallback : getSession() au chargement si INITIAL_SESSION émis sans SIGNED_IN
8. _syncAccount() : UPSERT accounts (ON CONFLICT DO NOTHING) + SELECT fallback
9. setAccountState() → CE_account_v1 écrit
10. emit(account:connected) → account-ui.js affiche état connecté
```

**emailRedirectTo** doit être passé explicitement. Sans lui, Supabase utilise l'URL de production configurée dans le dashboard — le magic link redirige hors du localhost.

---

## 3. Règles de session

| Clé | Contenu | Durée |
|-----|---------|-------|
| `CE_account_v1` | `{ serverUUID, localUUID, email, status, rgpdConsent, connectedAt }` | Jusqu'à signOut |
| `sb-*-auth-token` | Token Supabase (géré par le SDK) | TTL Supabase (~1h refresh) |

**P1-A** : au chargement, si `getSession()` retourne null et `CE_account_v1` est présent → `clearAccountState()` + émission `account:disconnected` (nettoyage état périmé).

**P1-B** : listener `visibilitychange` — au retour de focus, si `CE_account_v1` présent mais session Supabase absente → déconnexion propre.

---

## 4. Comportement à la déconnexion

**Séquence locale-first :**
```js
export async function signOut() {
  clearAccountState();                    // immédiat
  emit(ACCOUNT_EVENTS.DISCONNECTED, {}); // immédiat → UI → formulaire
  try { await supabase.auth.signOut(); } catch {} // réseau, défensif
}
```

Raison : `supabase.auth.signOut()` fait un appel réseau qui peut bloquer. L'UI ne doit pas attendre le réseau pour refléter la déconnexion.

**V1 bêta — règle ferme :** Magic Link obligatoire après déconnexion. Aucun mode "rester connecté", aucun login email/password, aucun OAuth prévu en V1.

---

## 5. Coordination panels (Comportement ↔ Compte)

**Problème découvert en validation terrain :**

`body.bhv-panel-open .main-shell { display: none }` (behavior.css) cachait `.account-screen` qui vit à l'intérieur de `.main-shell`. Naviguer Comportement → Compte affichait un panneau invisible.

**Solution :** `_showComptePanel()` désactive le panel Comportement avant d'afficher le panel Compte :
```js
document.body.classList.remove('bhv-panel-open');
document.getElementById('behavior-root').hidden = true;
document.getElementById('behaviorTabBtn')?.classList.remove('bhv-active');
```

`_initTab()` ferme le panel Compte quand Comportement est cliqué :
```js
document.getElementById('behaviorTabBtn')?.addEventListener('click', _hideComptePanel);
```

---

## 6. Leçons apprises

### Conflit de panels non coordonnés
Deux modules indépendants (`behavior-main.js` et `account-ui.js`) gèrent chacun leur panel sans se connaître. Quand l'un ouvre, l'autre ne se ferme pas. La détection s'est faite uniquement par test de navigation croisée — invisible dans les tests unitaires par module.

**Règle :** tout nouveau panel doit lister les panels mutuellement exclusifs et gérer la fermeture de chacun à l'ouverture.

### Synchronisation UI / session
`supabase.auth.signOut()` fait un appel réseau. Un pattern "await réseau, puis UI" bloque l'interface. La logique locale-first (état local mis à jour d'abord, réseau en arrière-plan) est obligatoire pour toute action de déconnexion/suppression.

### Importance des tests de navigation croisée
Les bugs d'isolation entre modules n'apparaissent qu'à la navigation croisée (Comportement → Compte, Compte → Comportement). Un module testé seul peut sembler fonctionnel. Les tests d'intégration doivent couvrir toutes les transitions de panel, pas seulement le flux interne de chaque module.

### `setTimeout + getElementById` est fragile
Le pattern `setTimeout(0, () => document.getElementById(...))` est vulnérable aux re-renders concurrents. Si un deuxième `render()` s'exécute avant que le setTimeout fire, le listener est attaché à un élément orphelin ou absent. Remplacer par `element.querySelector()` directement sur l'élément créé.

---

## 7. Dette technique résiduelle

| Dette | Criticité | Décision |
|-------|-----------|----------|
| `estimateTotalSize()` sous-compte les clés namespacées | Faible | Différée (debug panel uniquement) |
| Admin V1 non implémentée | Bloquante pour production | Pré-condition §10 non satisfaite |
| Export serveur garanti (RGPD) | Bloquante pour production | Pré-condition §10 non satisfaite |
| Migration local → serveur (UUID bridge) | Conditionnelle | Option C consentie, implémentation différée |
| Mémoire longue serveur | Hors périmètre V1 | Post-lancement |
