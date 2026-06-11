// admin.js — Admin Bootstrap Caméléon Engine · LOT 2.5
// Outil local uniquement — jamais déployé sur GitHub Pages.
// Accès : http://localhost:8000/admin/index.html (serve-local.ps1)
//
// Périmètre strict :
//   - Lecture : email · status · local_uuid · created_at
//   - Écriture : status uniquement, confirmation email obligatoire
//   - Interdit : payloads sessions, données comportementales, suppression, RGPD

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './admin-config.local.js';
import { createClient }                             from '../src/js/vendor/supabase.esm.js';

// ── Client Supabase service_role ──────────────────────────────────────────────
// autoRefreshToken et persistSession désactivés — outil admin non-interactif.
// BYPASSRLS : toutes les lignes accounts sont accessibles sans filtre RLS.

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── État courant ──────────────────────────────────────────────────────────────

let _accounts     = [];
let _pendingId    = null;
let _pendingEmail = null;
let _pendingStatus = null;

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, email, status, local_uuid, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    showError(`Erreur de chargement : ${error.message}`);
    return;
  }

  _accounts = data ?? [];
  renderStats();
  renderTable();
}

// ── Mise à jour statut ────────────────────────────────────────────────────────

async function applyStatusChange() {
  if (!_pendingId || !_pendingStatus) return;

  const { error } = await supabase
    .from('accounts')
    .update({ status: _pendingStatus })
    .eq('id', _pendingId);

  closeModal();

  if (error) {
    showError(`Échec de la mise à jour : ${error.message}`);
    return;
  }

  await fetchAccounts();
}

// ── Statistiques ──────────────────────────────────────────────────────────────

function renderStats() {
  const total    = _accounts.length;
  const disabled = _accounts.filter(a => a.status === 'disabled').length;
  const premium  = _accounts.filter(a => a.status === 'premium').length;
  const actifs   = total - disabled;

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-actifs').textContent   = actifs;
  document.getElementById('stat-premium').textContent  = premium;
  document.getElementById('stat-disabled').textContent = disabled;
}

// ── Table ─────────────────────────────────────────────────────────────────────

function renderTable() {
  const tbody = document.getElementById('accounts-tbody');
  tbody.innerHTML = '';

  if (_accounts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">Aucun compte enregistré.</td></tr>';
    return;
  }

  for (const account of _accounts) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-email">${esc(account.email)}</td>
      <td><span class="badge badge-${account.status}">${account.status}</span></td>
      <td class="cell-uuid" title="${esc(account.local_uuid)}">${esc(account.local_uuid.slice(0, 8))}…</td>
      <td class="cell-date">${formatDate(account.created_at)}</td>
      <td class="cell-actions">${buildActions(account)}</td>
    `;
    tbody.appendChild(tr);
  }

  // Délégation d'événements sur les boutons d'action
  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = btn.dataset.id;
      const email  = btn.dataset.email;
      const status = btn.dataset.action;
      openModal(id, email, status);
    });
  });
}

function buildActions(account) {
  const btns = [];
  const s = account.status;

  if (s === 'free') {
    btns.push(actionBtn(account, 'premium',  'Passer premium'));
    btns.push(actionBtn(account, 'disabled', 'Désactiver'));
  } else if (s === 'premium') {
    btns.push(actionBtn(account, 'free',     'Rétrograder free'));
    btns.push(actionBtn(account, 'disabled', 'Désactiver'));
  } else if (s === 'disabled') {
    btns.push(actionBtn(account, 'free',     'Réactiver (free)'));
  }

  return btns.join('');
}

function actionBtn(account, targetStatus, label) {
  return `<button class="btn-action btn-${targetStatus}"
    data-action="${targetStatus}"
    data-id="${esc(account.id)}"
    data-email="${esc(account.email)}"
  >${label}</button>`;
}

// ── Modal confirmation ────────────────────────────────────────────────────────

function openModal(id, email, newStatus) {
  _pendingId     = id;
  _pendingEmail  = email;
  _pendingStatus = newStatus;

  document.getElementById('modal-email-label').textContent = email;
  document.getElementById('modal-target-status').textContent = newStatus;
  document.getElementById('modal-email-input').value = '';
  document.getElementById('modal-confirm-btn').disabled = true;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-email-input').focus();
}

function closeModal() {
  _pendingId     = null;
  _pendingEmail  = null;
  _pendingStatus = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function showError(msg) {
  const el = document.getElementById('error-banner');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 6000);
}

// ── Initialisation ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Bouton refresh
  document.getElementById('btn-refresh').addEventListener('click', fetchAccounts);

  // Validation email dans la modale — activation du bouton confirm
  document.getElementById('modal-email-input').addEventListener('input', e => {
    document.getElementById('modal-confirm-btn').disabled =
      e.target.value.trim() !== _pendingEmail;
  });

  // Confirmation
  document.getElementById('modal-confirm-btn').addEventListener('click', applyStatusChange);

  // Annulation
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  fetchAccounts();
});
