// account-ui.js — Interface Compte Utilisateur V1
// Caméléon Engine · LOT 2 / LOT 3
//
// Règles d'isolation :
//   - Zéro logique moteur — ignore engine.js, decision.js, trading-policy.js
//   - Zéro import render.js — render.js n'importe pas ce module
//   - Zéro import account-cloud.js — toutes les actions sync passent par account-sync.js
//   - Événements sur document uniquement (account-events.js)
//
// États UI : 'disconnected' | 'pending' | 'connected'
// États sync (LOT 3) : voir _syncState + _isSyncBtnDisabled()

import { sendMagicLink, getAccount, signOut } from './account-service.js';
import { on, ACCOUNT_EVENTS }                 from './account-events.js';
import { upload, resolveLocal, resolveCloud } from './account-sync.js';
import { getServerUUID }                      from './account-storage.js';

// ── État UI ──────────────────────────────────────────────────────────────────

let _uiState      = 'disconnected'; // 'disconnected' | 'pending' | 'connected'
let _pendingEmail = null;
let _errorMsg     = null;

// ── État sync LOT 3 ──────────────────────────────────────────────────────────
// Actif uniquement quand _uiState === 'connected'.
// Réinitialisé à 'IDLE' à chaque déconnexion.

let _syncState        = 'IDLE';
let _conflictPayloads = null; // { localPayload, cloudPayload } — conservé pendant CONFLICT_PENDING

// ── Écouteurs d'événements LOT 2 ─────────────────────────────────────────────

on(ACCOUNT_EVENTS.CONNECTED, () => {
  _uiState   = 'connected';
  _syncState = 'DETECTING'; // LOT 3 — FLUX B démarre immédiatement
  _errorMsg  = null;
  render();
  _syncSidebar();
  _syncHeader();
});

on(ACCOUNT_EVENTS.DISCONNECTED, () => {
  _uiState          = 'disconnected';
  _syncState        = 'IDLE';   // reset état sync
  _conflictPayloads = null;
  render();
  _syncSidebar();
  _syncHeader();
});

on(ACCOUNT_EVENTS.ERROR, (e) => {
  const reason = e.detail?.reason;
  _errorMsg = reason === 'local_uuid_missing'
    ? 'Identité locale introuvable. Rechargez la page.'
    : 'Erreur de connexion. Veuillez réessayer.';
  _uiState = 'disconnected';
  render();
});

// ── Écouteurs d'événements LOT 3 ─────────────────────────────────────────────

on(ACCOUNT_EVENTS.SYNC_COMPLETE, (e) => {
  if (_uiState !== 'connected') return; // ignorer si déconnecté entre-temps
  const { state, localEmpty } = e.detail;
  // OFFLINE_LOCAL (vide) → état dégradé bouton désactivé
  _syncState = (state === 'OFFLINE_LOCAL' && localEmpty) ? 'OFFLINE_LOCAL_EMPTY' : state;
  if (state === 'CONFLICT_RESOLVED') _conflictPayloads = null;
  render();
});

on(ACCOUNT_EVENTS.SYNC_ERROR, (e) => {
  if (_uiState !== 'connected') return;
  _syncState = e.detail.step === 'restore' ? 'AUTO_RESTORE_ERROR' : 'DETECT_ERROR';
  render();
});

on(ACCOUNT_EVENTS.CONFLICT_DETECTED, (e) => {
  if (_uiState !== 'connected') return;
  _syncState        = 'CONFLICT_PENDING';
  _conflictPayloads = {
    localPayload: e.detail.localPayload,
    cloudPayload: e.detail.cloudPayload,
  };
  render();
});

// ── Rendu principal ───────────────────────────────────────────────────────────

function render() {
  const root = document.getElementById('account-root');
  if (!root) return;

  root.innerHTML = '';

  // Frontière freemium — toujours visible (D-PRE-01 : isPremium ≠ fonctionnalités moteur)
  const freemium = document.createElement('p');
  freemium.className = 'ac-freemium-banner';
  freemium.textContent =
    'Vos 50 dernières sessions sont conservées sur cet appareil. '
    + 'La mémoire longue au-delà de cet appareil est premium.';
  root.appendChild(freemium);

  if (_errorMsg) {
    const errEl = document.createElement('p');
    errEl.className = 'ac-error';
    errEl.textContent = _errorMsg;
    root.appendChild(errEl);
  }

  if (_uiState === 'connected') {
    root.appendChild(_renderConnected());
  } else if (_uiState === 'pending') {
    root.appendChild(_renderPending());
  } else {
    root.appendChild(_renderForm());
  }
}

// ── État : formulaire de connexion ────────────────────────────────────────────

function _renderForm() {
  const card = document.createElement('div');
  card.className = 'ac-card';

  card.innerHTML = `
    <div class="ac-card-title">Connexion</div>
    <p class="ac-card-desc">
      Entrez votre email pour recevoir un lien de connexion valide
      <strong style="color:#d4d4d4">15 minutes</strong>.
    </p>
    <div class="ac-form">
      <input
        type="email"
        id="ac-email"
        class="ac-input"
        placeholder="votre@email.com"
        autocomplete="email"
        spellcheck="false"
      >
      <label class="ac-checkbox-label">
        <input type="checkbox" id="ac-rgpd" class="ac-checkbox">
        <span>
          J'accepte les
          <a href="./cgu/" class="ac-link">CGU</a>
          et la
          <a href="./politique-confidentialite/" class="ac-link">Politique de confidentialité</a>.
        </span>
      </label>
      <button id="ac-submit" class="ac-btn" disabled>
        Recevoir mon lien de connexion
      </button>
    </div>
  `;

  setTimeout(() => {
    const emailInput = document.getElementById('ac-email');
    const checkbox   = document.getElementById('ac-rgpd');
    const submitBtn  = document.getElementById('ac-submit');
    if (!emailInput || !checkbox || !submitBtn) return;

    const _updateState = () => {
      const validEmail = emailInput.value.trim().includes('@') &&
                         emailInput.value.trim().includes('.');
      submitBtn.disabled = !(checkbox.checked && validEmail);
    };

    emailInput.addEventListener('input', _updateState);
    checkbox.addEventListener('change', _updateState);

    submitBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';

      const result = await sendMagicLink(email);

      if (result.success) {
        _pendingEmail = email;
        _uiState      = 'pending';
        _errorMsg     = null;
        render();
      } else if (result.error === 'rate_limited') {
        _errorMsg = 'Limite atteinte (3 envois / 15 min). Attendez avant de réessayer.';
        render();
      } else {
        _errorMsg = `Erreur d'envoi : ${result.error}`;
        render();
      }
    });
  }, 0);

  return card;
}

// ── État : lien envoyé, en attente de clic ────────────────────────────────────

function _renderPending() {
  const card = document.createElement('div');
  card.className = 'ac-card';

  card.innerHTML = `
    <div class="ac-card-title">Lien envoyé ✓</div>
    <p class="ac-card-desc">
      Vérifiez votre boîte mail.
      Le lien est valide <strong style="color:#d4d4d4">15 minutes</strong>.
    </p>
    ${_pendingEmail
      ? `<div class="ac-email-sent">→ ${_esc(_pendingEmail)}</div>`
      : ''}
    <p class="ac-hint">
      Cliquez sur le lien dans l'email pour vous connecter.<br>
      Vérifiez vos spams si nécessaire.
    </p>
    <button id="ac-back" class="ac-btn-secondary">← Modifier l'adresse</button>
  `;

  setTimeout(() => {
    document.getElementById('ac-back')?.addEventListener('click', () => {
      _uiState      = 'disconnected';
      _pendingEmail = null;
      _errorMsg     = null;
      render();
    });
  }, 0);

  return card;
}

// ── État : connecté ───────────────────────────────────────────────────────────

function _renderConnected() {
  const account   = getAccount();
  const isPremium = account?.status === 'premium';
  const label     = isPremium ? 'Premium' : 'Gratuit';
  const cls       = isPremium ? 'ac-status-premium' : 'ac-status-free';

  const card = document.createElement('div');
  card.className = 'ac-card';

  card.innerHTML = `
    <div class="ac-card-title">Connecté</div>
    <div class="ac-account-info">
      <span class="ac-account-email">${_esc(account?.email ?? '—')}</span>
      <span class="ac-status-badge ${cls}">${label}</span>
    </div>
    ${!isPremium ? `
      <p class="ac-upgrade-hint">
        Passez premium pour activer la mémoire longue multi-appareils.
      </p>
    ` : ''}
    <button id="ac-signout" class="ac-btn-secondary">Déconnexion</button>
  `;

  card.querySelector('#ac-signout').addEventListener('click', async () => {
    await signOut();
  });

  // LOT 3 — section sync
  if (_syncState === 'CONFLICT_PENDING') {
    card.appendChild(_renderConflictModal());
  } else {
    card.appendChild(_renderSyncSection());
  }

  return card;
}

// ── Section sync — bouton "Sauvegarder" ──────────────────────────────────────
// D-LOT3-UPLOAD-GUARD-01 : bouton désactivé selon l'état courant de _syncState.
// D-LOT3-SYNC-TRIGGER-01 : seul clic explicite déclenche upload() — pas de timer ni retry.

function _renderSyncSection() {
  const disabled    = _isSyncBtnDisabled();
  const statusText  = _syncStatusText();

  const section = document.createElement('div');
  section.className = 'ac-sync-section';
  section.innerHTML = `
    <div class="ac-sync-status">${_esc(statusText)}</div>
    <button id="ac-save-btn" class="ac-btn ac-sync-btn"${disabled ? ' disabled' : ''}>
      Sauvegarder
    </button>
  `;

  if (!disabled) {
    section.querySelector('#ac-save-btn').addEventListener('click', async () => {
      // Verrou en vol immédiat — le bouton passe à désactivé avant l'await
      _syncState = 'UPLOADING';
      render();
      // upload() dans account-sync.js émet SYNC_COMPLETE ou SYNC_ERROR
      // → le listener SYNC_COMPLETE met à jour _syncState + render()
      await upload(getServerUUID());
    });
  }

  return section;
}

// D-LOT3-UPLOAD-GUARD-01 — états où le bouton "Sauvegarder" est désactivé
function _isSyncBtnDisabled() {
  return [
    'IDLE',
    'DETECTING',
    'CONFLICT_PENDING',
    'CONFLICT_DEFERRED',
    'CONFLICT_RESOLVING',
    'UPLOADING',
    'INIT_EMPTY',
    'OFFLINE_LOCAL_EMPTY',
    'AUTO_RESTORE_IN_PROGRESS',
    'S2_LOCAL_ERROR',
    'S2_CLOUD_ERROR',
    'DETECT_ERROR',
    'AUTO_RESTORE_ERROR',
  ].includes(_syncState);
}

function _syncStatusText() {
  const map = {
    'IDLE':                  '',
    'DETECTING':             'Vérification en cours…',
    'NO_OP':                 'Données synchronisées.',
    'KEEP_LOCAL':            'Aucune sauvegarde cloud existante.',
    'OFFLINE_LOCAL':         'Connexion au cloud indisponible. Vos données locales sont préservées.',
    'OFFLINE_LOCAL_EMPTY':   'Connexion au cloud indisponible. Aucune donnée locale à synchroniser.',
    'INIT_EMPTY':            'Aucune donnée locale à synchroniser.',
    'AUTO_RESTORE_DONE':     'Données restaurées depuis votre compte.',
    'UPLOADING':             'Sauvegarde en cours…',
    'UPLOAD_SUCCESS':        'Sauvegarde réussie.',
    'UPLOAD_ERROR':          'Erreur lors de la sauvegarde. Réessayez.',
    'CONFLICT_PENDING':      'Un écart a été détecté entre vos données locales et votre compte.',
    'CONFLICT_RESOLVING':    'Synchronisation en cours…',
    'CONFLICT_DEFERRED':     'Décision en attente. Rechargez la page pour reprendre.',
    'CONFLICT_RESOLVED':     'Données synchronisées.',
    'S2_LOCAL_ERROR':        'Erreur lors de la synchronisation. Rechargez la page.',
    'S2_CLOUD_ERROR':        'Erreur lors de la restauration. Rechargez la page.',
    'DETECT_ERROR':          'Erreur de vérification. Rechargez la page.',
    'AUTO_RESTORE_ERROR':    'Erreur de restauration. Rechargez la page.',
  };
  return map[_syncState] ?? '';
}

// ── Modale de conflit ─────────────────────────────────────────────────────────
// D-LOT3-CONFLICT-02 : vocabulaire neutre — aucune promotion cloud implicite.
// D-LOT3-CONFLICT-03 : aucune décision silencieuse.
// D-LOT3-RESOLUTION-GUARD-01 : verrou TERMINAL — boutons désactivés immédiatement
//   au premier clic, jamais réactivés pour ce conflit.

function _renderConflictModal() {
  const modal = document.createElement('div');
  modal.className = 'ac-conflict-modal';

  modal.innerHTML = `
    <div class="ac-conflict-title">Données différentes détectées</div>
    <p class="ac-conflict-body">
      Vos données locales et les données de votre compte ne correspondent pas.
      Choisissez quelle version conserver.
    </p>
    <div class="ac-conflict-meta">
      Vos données locales sont préservées jusqu'à votre décision.
    </div>
    <div class="ac-conflict-actions">
      <button id="ac-s2-local" class="ac-btn ac-conflict-btn">
        Conserver mes données locales
      </button>
      <button id="ac-s2-cloud" class="ac-btn-secondary ac-conflict-btn">
        Conserver les données du compte
      </button>
    </div>
    <button id="ac-conflict-defer" class="ac-conflict-defer-btn">
      Décider plus tard
    </button>
  `;

  const btnLocal = modal.querySelector('#ac-s2-local');
  const btnCloud = modal.querySelector('#ac-s2-cloud');
  const btnDefer = modal.querySelector('#ac-conflict-defer');

  // D-LOT3-RESOLUTION-GUARD-01 — verrou TERMINAL immédiat
  const _lock = () => {
    btnLocal.disabled = true;
    btnCloud.disabled = true;
  };

  // S2-LOCAL — "Conserver mes données locales"
  // Invariant X = 2 — chemin n°2 : resolveLocal() → executeUpload() → UPSERT
  btnLocal.addEventListener('click', async () => {
    _lock();                          // verrou terminal avant tout await
    _syncState = 'CONFLICT_RESOLVING';
    render();
    await resolveLocal(getServerUUID());
    // SYNC_COMPLETE émis par account-sync.js → listener met à jour _syncState + render()
  });

  // S2-CLOUD — "Conserver les données du compte"
  // Écriture localStorage uniquement — pas d'UPSERT (X = 2 préservé)
  btnCloud.addEventListener('click', () => {
    _lock();                          // verrou terminal immédiat
    _syncState = 'CONFLICT_RESOLVING';
    render();
    resolveCloud(_conflictPayloads?.cloudPayload);
    // SYNC_COMPLETE émis par account-sync.js → listener met à jour _syncState + render()
  });

  // "Décider plus tard" — fermeture sans résolution
  btnDefer.addEventListener('click', () => {
    _syncState        = 'CONFLICT_DEFERRED';
    _conflictPayloads = null;
    render();
  });

  return modal;
}

// ── Gestion onglet Compte ─────────────────────────────────────────────────────
// render.js ne connaît pas "compte" → on gère l'activation manuellement.
// Le bouton porte id="sideTabCompte" (sans data-tab-target) pour que
// render.js ne l'intercepte pas et n'appelle pas activateTab("compte").
//
// .account-screen vit dans <main> en dehors de .main-grid.
// Quand Compte est actif : hero + .main-grid masqués, .account-screen seul visible.
// Quand Compte est désactivé : hero + .main-grid restaurés, .account-screen masqué.

const _MAIN_ELEMENTS = [
  '.hero-promesse',
  '.signature-cameleon',
  '#hero-section',
  '#guidanceCard',
  '.main-grid',
];

function _showComptePanel() {
  document.body.classList.remove('bhv-panel-open');
  const bRoot = document.getElementById('behavior-root');
  if (bRoot) bRoot.hidden = true;
  document.getElementById('behaviorTabBtn')?.classList.remove('bhv-active');

  _MAIN_ELEMENTS.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.hidden = true;
  });
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.style.scrollBehavior = '';
  });
  document.querySelectorAll('[data-tab-target]').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  const panel = document.querySelector('.account-screen');
  if (panel) {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
  }
  const btn = document.getElementById('sideTabCompte');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
  render();
}

function _hideComptePanel() {
  const panel = document.querySelector('.account-screen');
  if (panel) {
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
  }
  _MAIN_ELEMENTS.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.hidden = false;
  });
  const btn = document.getElementById('sideTabCompte');
  if (btn) {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  }
}

function _initTab() {
  const compteBtn = document.getElementById('sideTabCompte');
  if (compteBtn) {
    compteBtn.addEventListener('click', _showComptePanel);
  }
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', _hideComptePanel);
  });
  document.getElementById('behaviorTabBtn')?.addEventListener('click', _hideComptePanel);
}

// ── Sidebar + Header ──────────────────────────────────────────────────────────

function _syncSidebar() {
  const stateEl = document.getElementById('sideStateCompte');
  if (!stateEl) return;
  if (_uiState === 'connected') {
    const acc = getAccount();
    stateEl.textContent = acc?.status === 'premium' ? 'Premium' : 'Connecté';
  } else {
    stateEl.textContent = 'Non connecté';
  }
}

function _syncHeader() {
  const chip  = document.getElementById('header-account-chip');
  const label = document.getElementById('headerAccountStatus');
  if (!chip || !label) return;
  if (_uiState === 'connected') {
    const acc = getAccount();
    label.textContent = acc?.status === 'premium' ? 'Premium' : 'Gratuit';
    chip.hidden = false;
  } else {
    chip.hidden = true;
  }
}

// ── Utilitaire ─────────────────────────────────────────────────────────────────

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Initialisation synchrone ───────────────────────────────────────────────────
// Exécutée à la fin du module (DOM disponible — script type="module" est déféré).
// Vérifie CE_account_v1 pour l'état initial (rechargement de page).
//
// LOT 3 — rechargement avec session existante :
//   account:connected n'est pas ré-émis par LOT 2 si CE_account_v1 est présent.
//   account-sync.js déclenche _runDetection() via setTimeout(0) dans ce cas.
//   On initialise _syncState à 'DETECTING' ici pour que l'UI soit cohérente
//   dès le premier rendu (avant que le résultat du check async soit disponible).

(function _init() {
  const existing = getAccount();
  if (existing) {
    _uiState = 'connected';
    // Dead-state guard : si serverUUID absent (état localStorage corrompu),
    // _runDetection() ne sera jamais appelé par account-sync.js → DETECT_ERROR
    // plutôt que DETECTING permanent.
    _syncState = getServerUUID() !== null ? 'DETECTING' : 'DETECT_ERROR';
  }
  render();
  _syncSidebar();
  _syncHeader();
  _initTab();
}());
