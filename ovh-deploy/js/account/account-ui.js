// account-ui.js — Interface Compte Utilisateur V1
// Caméléon Engine · LOT 3
//
// Règles d'isolation (plan V2.1) :
//   - Zéro logique moteur — ce module ignore engine.js, decision.js, trading-policy.js
//   - Zéro import render.js
//   - render.js n'importe pas ce module
//   - Événements sur document uniquement (account-events.js)
//
// États UI : 'disconnected' | 'pending' | 'connected'
// Initialisation top-level (module ES) : lit CE_account_v1 → état initial synchrone.

import { sendMagicLink, getAccount, signOut } from './account-service.js';
import { on, ACCOUNT_EVENTS }                 from './account-events.js';

// ── État ──────────────────────────────────────────────────────

let _uiState    = 'disconnected'; // 'disconnected' | 'pending' | 'connected'
let _pendingEmail = null;
let _errorMsg   = null;

// ── Écouteurs d'événements (top-level — enregistrés avant init) ─

on(ACCOUNT_EVENTS.CONNECTED, () => {
  _uiState  = 'connected';
  _errorMsg = null;
  render();
  _syncSidebar();
  _syncHeader();
});

on(ACCOUNT_EVENTS.DISCONNECTED, () => {
  _uiState = 'disconnected';
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

// ── Rendu principal ───────────────────────────────────────────

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

  // Erreur éventuelle
  if (_errorMsg) {
    const errEl = document.createElement('p');
    errEl.className = 'ac-error';
    errEl.textContent = _errorMsg;
    root.appendChild(errEl);
  }

  // Contenu selon l'état
  if (_uiState === 'connected') {
    root.appendChild(_renderConnected());
  } else if (_uiState === 'pending') {
    root.appendChild(_renderPending());
  } else {
    root.appendChild(_renderForm());
  }
}

// ── État : formulaire de connexion ────────────────────────────

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
          <a href="#" class="ac-link">CGU</a>
          et la
          <a href="#" class="ac-link">Politique de confidentialité</a>.
        </span>
      </label>
      <button id="ac-submit" class="ac-btn" disabled>
        Recevoir mon lien de connexion
      </button>
    </div>
  `;

  // Bind events — setTimeout(0) : les éléments sont dans le DOM après insertion
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

// ── État : lien envoyé, en attente de clic ────────────────────

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

// ── État : connecté ───────────────────────────────────────────

function _renderConnected() {
  const account = getAccount();
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

  return card;
}

// ── Gestion onglet Compte (indépendant de render.js VALID_TABS) ──────────────
// render.js ne connaît pas "compte" → on gère l'activation manuellement.
// Le bouton porte id="sideTabCompte" (sans data-tab-target) pour que
// render.js ne l'intercepte pas et n'appelle pas activateTab("compte").
//
// .account-screen vit dans <main> en dehors de .main-grid.
// Quand Compte est actif : hero + .main-grid masqués, .account-screen seul visible.
// Quand Compte est désactivé : hero + .main-grid restaurés, .account-screen masqué.

// Éléments de la zone principale à masquer quand Compte est actif
const _MAIN_ELEMENTS = [
  '.hero-promesse',
  '.signature-cameleon',
  '#hero-section',
  '#guidanceCard',
  '.main-grid',
];

function _showComptePanel() {
  // Désactiver le panel Comportement s'il est ouvert
  document.body.classList.remove('bhv-panel-open');
  const bRoot = document.getElementById('behavior-root');
  if (bRoot) bRoot.hidden = true;
  document.getElementById('behaviorTabBtn')?.classList.remove('bhv-active');

  // Masquer hero + contenu moteur
  _MAIN_ELEMENTS.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.hidden = true;
  });
  // Replacer le viewport en haut avant d'afficher le panel (évite le scroll natif)
  window.scrollTo({ top: 0, behavior: 'instant' });
  // Désactiver les boutons tab render.js
  document.querySelectorAll('[data-tab-target]').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  // Afficher le panel Compte
  const panel = document.querySelector('.account-screen');
  if (panel) {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
  }
  // Activer le bouton Compte
  const btn = document.getElementById('sideTabCompte');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
  render();
}

function _hideComptePanel() {
  // Masquer le panel Compte
  const panel = document.querySelector('.account-screen');
  if (panel) {
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
  }
  // Restaurer hero + contenu moteur
  _MAIN_ELEMENTS.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.hidden = false;
  });
  // Désactiver le bouton Compte
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
  // Clic sur n'importe quel autre onglet → restaurer la zone principale
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', _hideComptePanel);
  });
  // Clic sur Comportement → fermer le panel Compte
  document.getElementById('behaviorTabBtn')?.addEventListener('click', _hideComptePanel);
}

// ── Sidebar + Header ──────────────────────────────────────────

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

// ── Utilitaire ────────────────────────────────────────────────

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Initialisation synchrone ──────────────────────────────────
// Exécutée à la fin du module (DOM disponible — script type="module" est déféré).
// Vérifie CE_account_v1 pour l'état initial (rechargement de page).

(function _init() {
  const existing = getAccount();
  if (existing) _uiState = 'connected';
  render();
  _syncSidebar();
  _syncHeader();
  _initTab();
}());
