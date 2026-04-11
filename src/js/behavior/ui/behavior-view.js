// Renders the behavior analysis module into #behavior-root.
// Self-contained: reads from behaviorRepo, writes to behaviorRepo, re-renders on changes.

import { behaviorRepo     } from '../storage/behavior-repo.js';
import { importBinanceSpot } from '../import/uploader.js';
import { computeMetrics   } from '../analytics/metrics.js';
import { detectPatterns, tagTrades } from '../analytics/patterns.js';
import { computeScore     } from '../analytics/scoring.js';
import { computeCoaching  } from '../analytics/coaching.js';

// ── Public entry point ────────────────────────────────────────────────────────

function mount(root) {
  const trades      = behaviorRepo.get('trades');
  const importError = behaviorRepo.get('importError');
  const importInfo  = behaviorRepo.get('importInfo');

  let metrics   = null;
  let patterns  = null;
  let tradeTags = new Map();
  let score     = null;
  let coaching  = null;

  if (trades && trades.length > 0) {
    metrics   = computeMetrics(trades);
    patterns  = detectPatterns(trades, metrics);
    tradeTags = tagTrades(trades, metrics);
    score     = computeScore(patterns, metrics);
    coaching  = computeCoaching(patterns, metrics, score);
  }

  render(root, { trades, metrics, patterns, tradeTags, score, coaching, importError, importInfo });
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function render(root, state) {
  root.innerHTML = buildShell(state);
  bindEvents(root, state);
}

function buildShell(state) {
  return `
    <div class="bhv-shell">
      <div class="bhv-header">
        <h2 class="bhv-title">Analyse comportementale</h2>
        <p class="bhv-subtitle">Import CSV Binance Spot · V3</p>
      </div>
      ${buildImportCard(state)}
      ${state.trades ? buildAnalysis(state) : ''}
    </div>`;
}

// ── Import card ───────────────────────────────────────────────────────────────

function buildImportCard(state) {
  return `
    <div class="bhv-card bhv-import-card${state.importInfo ? ' bhv-pulse-ok' : ''}">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Import CSV</span>
        <span class="bhv-card-desc">Export Binance Spot · colonnes : Date(UTC), Pair, Side, Price, Executed, Amount, Fee</span>
      </div>

      <div class="bhv-drop-zone" id="bhvDropZone">
        <input type="file" id="bhvFileInput" accept=".csv" class="bhv-file-input">
        <label for="bhvFileInput" class="bhv-drop-label">
          <span class="bhv-drop-icon">↑</span>
          <span class="bhv-drop-text">Sélectionner un fichier CSV</span>
          <span class="bhv-drop-hint">ou glisser-déposer ici</span>
        </label>
      </div>

      ${state.importError ? `<div class="bhv-msg bhv-msg--error">${escHtml(state.importError)}</div>` : ''}
      ${state.importInfo  ? `<div class="bhv-msg bhv-msg--info">${escHtml(state.importInfo)}</div>`  : ''}

      ${state.trades ? `
        <div class="bhv-import-actions">
          <button class="bhv-btn bhv-btn--danger" id="bhvClearBtn" type="button">Effacer les données</button>
        </div>` : ''}
    </div>`;
}

// ── Analysis section ──────────────────────────────────────────────────────────

function buildAnalysis(state) {
  const { metrics, patterns, trades, tradeTags, score, coaching } = state;
  if (!metrics) return '';
  return `
    <div class="bhv-layout bhv-fade-in">
      <div class="bhv-analysis">
        ${score ? buildScoreCard(score) : ''}
        ${coaching && coaching.tips.length ? buildCoachingCard(coaching) : ''}
        ${buildSummaryCard(metrics)}
        ${buildReadingCard(metrics, patterns)}
        ${buildPatternsCard(patterns)}
        ${buildJournalCard(trades, tradeTags)}
      </div>
      ${buildSidebar(metrics, patterns, score, trades)}
    </div>`;
}

// ── Score card ────────────────────────────────────────────────────────────────

function buildScoreCard(s) {
  const { score, profile, dominantRisk, interpretation } = s;

  const interpLines = interpretation.map(line => `
    <div class="bhv-reading-line">
      <span class="bhv-reading-dot bhv-reading-dot--${profile.color}"></span>
      <span>${escHtml(line)}</span>
    </div>`).join('');

  return `
    <div class="bhv-card bhv-score-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Score comportemental</span>
        <span class="bhv-card-desc">Sur 100 · basé sur patterns et intensité</span>
      </div>
      <div class="bhv-score-body">
        <div class="bhv-score-num bhv-score-num--${profile.color}">${score}</div>
        <div class="bhv-score-meta">
          <div class="bhv-score-profile bhv-score-profile--${profile.color}">${escHtml(profile.label)}</div>
          <div class="bhv-score-risk">${dominantRisk ? escHtml(dominantRisk) : 'Aucun risque dominant'}</div>
          <div class="bhv-score-range">Score / 100</div>
        </div>
      </div>
      <div class="bhv-score-interp">${interpLines}</div>
    </div>`;
}

// ── Coaching card ─────────────────────────────────────────────────────────────

function buildCoachingCard(coaching) {
  const { priority, tips, plan } = coaching;

  const tipItems = tips.map(tip => `
    <div class="bhv-coaching-tip">
      <span class="bhv-coaching-bullet"></span>
      <span>${escHtml(tip)}</span>
    </div>`).join('');

  return `
    <div class="bhv-card bhv-coaching-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Coaching</span>
        <span class="bhv-card-desc">${escHtml(priority)}</span>
      </div>
      <div class="bhv-coaching-tips">${tipItems}</div>
      ${plan && plan.length ? buildCoachingPlan(plan) : ''}
    </div>`;
}

function buildCoachingPlan(plan) {
  const items = plan.map(step => `
    <div class="bhv-coaching-tip">
      <span class="bhv-coaching-bullet bhv-coaching-bullet--plan"></span>
      <span>${escHtml(step)}</span>
    </div>`).join('');

  return `
    <div class="bhv-coaching-plan">
      <div class="bhv-metric-label">Plan d'action</div>
      <div class="bhv-coaching-tips">${items}</div>
    </div>`;
}

// ── Summary card (enrichi) ────────────────────────────────────────────────────

function buildSummaryCard(m) {
  const firstDate = new Date(m.firstTs).toISOString().slice(0, 10);
  const lastDate  = new Date(m.lastTs).toISOString().slice(0, 10);

  const delayAfterBuy  = m.avgDelayAfterBuy  !== null ? m.avgDelayAfterBuy  + ' min' : '—';
  const delayAfterSell = m.avgDelayAfterSell !== null ? m.avgDelayAfterSell + ' min' : '—';

  return `
    <div class="bhv-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Résumé</span>
        <span class="bhv-card-desc">${firstDate} → ${lastDate}</span>
      </div>

      <div class="bhv-metrics-grid">
        ${metric('Trades',       m.totalTrades)}
        ${metric('Période',      m.spanDays + ' j')}
        ${metric('Achats',       m.buyCount)}
        ${metric('Ventes',       m.sellCount)}
        ${metric('Taille moy.',  m.avgSize + ' $')}
        ${metric('Moy. achat',   m.avgBuySize + ' $')}
        ${metric('Moy. vente',   m.avgSellSize + ' $')}
        ${metric('Hors norme',   m.oversizedTradesCount, m.oversizedTradesCount > 0 ? 'warn' : '')}
      </div>

      <div class="bhv-metrics-grid bhv-metrics-grid--secondary">
        ${metric('Délai moy.',        m.avgTimeBetween  !== null ? m.avgTimeBetween  + ' min' : '—')}
        ${metric('Après achat',       delayAfterBuy)}
        ${metric('Après vente',       delayAfterSell)}
        ${metric('Heures actives',    m.activeHours + ' / 24')}
      </div>

    </div>`;
}

function metric(label, value, mod = '') {
  return `
    <div class="bhv-metric${mod ? ' bhv-metric--' + mod : ''}">
      <div class="bhv-metric-label">${label}</div>
      <div class="bhv-metric-value">${value}</div>
    </div>`;
}

function buildHourBars(dist) {
  const max = Math.max(...dist, 1);
  return dist.map((count, h) => `
    <div class="bhv-hour-col" title="${h}h · ${count} trade${count !== 1 ? 's' : ''}">
      <div class="bhv-hour-bar" style="height:${Math.round((count / max) * 100)}%"></div>
      <div class="bhv-hour-label">${h % 6 === 0 ? h : ''}</div>
    </div>`).join('');
}

// ── Lecture comportementale ───────────────────────────────────────────────────

function buildReadingCard(metrics, patterns) {
  const sentences = buildReadingSentences(metrics, patterns);

  const items = sentences.map(s => `
    <div class="bhv-reading-line">
      <span class="bhv-reading-dot"></span>
      <span>${escHtml(s)}</span>
    </div>`).join('');

  return `
    <div class="bhv-card bhv-reading-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Lecture comportementale</span>
        <span class="bhv-card-desc">Synthèse de l'historique</span>
      </div>
      <div class="bhv-reading-list">${items}</div>
    </div>`;
}

function buildReadingSentences(m, patterns) {
  const sentences = [];
  const types = new Set((patterns || []).map(p => p.type));

  // Patterns détectés
  if (types.has('overtrading')) {
    sentences.push('Tu multiplies les trades dans des fenêtres de temps très courtes.');
  }
  if (types.has('revenge_trading')) {
    sentences.push('Tu enchaînes un achat rapidement après une vente, avec une taille supérieure à ta moyenne.');
  }
  if (types.has('rapid_reentry')) {
    sentences.push('Tu réintègres une position dans les 45 minutes suivant une sortie courte.');
  }
  if (types.has('loss_chasing')) {
    sentences.push('Tes positions grossissent successivement sur une courte fenêtre.');
  }
  if (types.has('size_inconsistency')) {
    sentences.push('Tes tailles de position sont instables — manque de règles fixes.');
  }

  // Métriques complémentaires
  if (m.avgTimeBetween !== null && m.avgTimeBetween < 30) {
    sentences.push('Ton rythme moyen entre trades est inférieur à 30 minutes.');
  }
  if (m.activeHours !== undefined && m.activeHours <= 5) {
    sentences.push('Ton activité est concentrée sur une fenêtre horaire très courte.');
  }
  if (m.oversizedTradesCount >= 3) {
    sentences.push(`${m.oversizedTradesCount} trades dépassent significativement ta taille habituelle.`);
  }

  // Délai après vente < délai après achat = impulsivité post-vente
  if (
    m.avgDelayAfterSell !== null &&
    m.avgDelayAfterBuy  !== null &&
    m.avgDelayAfterSell < m.avgDelayAfterBuy * 0.5
  ) {
    sentences.push('Tu rejoues beaucoup plus vite après une vente qu\'après un achat.');
  }

  // Cas sain
  if (sentences.length === 0) {
    sentences.push('Aucun pattern agressif évident détecté sur cet historique.');
    sentences.push('Le comportement global paraît structuré.');
  }

  return sentences.slice(0, 5);
}

// ── Patterns card ─────────────────────────────────────────────────────────────

function buildPatternsCard(patterns) {
  const head = `
    <div class="bhv-card-head">
      <span class="bhv-card-title">Patterns détectés</span>
      ${patterns && patterns.length ? `<span class="bhv-badge bhv-badge--warn">${patterns.length}</span>` : ''}
    </div>`;

  if (!patterns || patterns.length === 0) {
    return `<div class="bhv-card">${head}<p class="bhv-empty">Aucun pattern détecté sur ce fichier.</p></div>`;
  }

  const items = patterns.map(p => `
    <div class="bhv-pattern bhv-pattern--${p.severity}">
      <div class="bhv-pattern-name">${escHtml(p.label)}</div>
      <div class="bhv-pattern-desc">${escHtml(p.description)}</div>
    </div>`).join('');

  return `<div class="bhv-card">${head}<div class="bhv-patterns">${items}</div></div>`;
}

// ── Journal card ──────────────────────────────────────────────────────────────

function buildJournalCard(trades, tradeTags) {
  const sorted = [...trades].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
  const rows = sorted.map(t => {
    const date   = new Date(t.timestamp).toISOString().replace('T', ' ').slice(0, 16);
    const stored = tradeTags.get(t.timestamp);
    const tags   = stored && stored.length ? stored.join(', ') : '—';
    const tagClass = stored && stored.length ? ' bhv-tags--flagged' : '';
    return `
      <tr>
        <td>${date}</td>
        <td>${escHtml(t.symbol)}</td>
        <td class="bhv-side bhv-side--${t.side.toLowerCase()}">${t.side}</td>
        <td>${t.price}</td>
        <td>${t.quantity}</td>
        <td>${t.quote_quantity}</td>
        <td class="bhv-tags${tagClass}">${escHtml(tags)}</td>
      </tr>`;
  }).join('');

  return `
    <div class="bhv-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Journal des trades</span>
        <span class="bhv-badge">${trades.length}</span>
      </div>
      <div class="bhv-table-wrap">
        <table class="bhv-table">
          <thead>
            <tr>
              <th>Date (UTC)</th><th>Symbole</th><th>Côté</th>
              <th>Prix</th><th>Qté</th><th>Valeur $</th><th>Tags</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ── Sidebar droite ────────────────────────────────────────────────────────────

function buildSidebar(metrics, patterns, score, trades) {
  return `
    <div class="bhv-sidebar">
      ${buildStatCard(metrics, patterns, score)}
      ${buildActivityCard(metrics)}
      ${buildSizeCard(trades, metrics)}
    </div>`;
}

function buildStatCard(metrics, patterns, score) {
  const patCount  = patterns ? patterns.length : 0;
  const patMod    = patCount >= 3 ? 'danger' : patCount >= 1 ? 'warn' : '';
  const scoreMod  = score ? score.profile.color : '';
  const scoreVal  = score ? score.score : '—';
  const risk      = score?.dominantRisk || '—';
  const riskMod   = patCount >= 3 ? 'danger' : patCount >= 1 ? 'warn' : 'gold';

  return `
    <div class="bhv-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Vue rapide</span>
      </div>
      <div class="bhv-stat-grid">
        <div class="bhv-stat">
          <div class="bhv-stat-label">Trades</div>
          <div class="bhv-stat-value">${metrics.totalTrades}</div>
        </div>
        <div class="bhv-stat">
          <div class="bhv-stat-label">Score</div>
          <div class="bhv-stat-value${scoreMod ? ' bhv-stat-value--' + scoreMod : ''}">${scoreVal}</div>
        </div>
        <div class="bhv-stat">
          <div class="bhv-stat-label">Patterns</div>
          <div class="bhv-stat-value${patMod ? ' bhv-stat-value--' + patMod : ''}">${patCount}</div>
        </div>
        <div class="bhv-stat bhv-stat--full">
          <div class="bhv-stat-label">Risque dominant</div>
          <div class="bhv-stat-risk bhv-stat-risk--${riskMod}">${escHtml(risk)}</div>
        </div>
      </div>
    </div>`;
}

function buildActivityCard(metrics) {
  return `
    <div class="bhv-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Activité</span>
        <span class="bhv-card-desc">UTC</span>
      </div>
      <div class="bhv-hour-chart">${buildHourBars(metrics.hourDist)}</div>
    </div>`;
}

function buildSizeCard(trades, metrics) {
  return `
    <div class="bhv-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Taille</span>
        <span class="bhv-card-desc">Distribution · $</span>
      </div>
      ${buildSizeChart(trades, metrics)}
    </div>`;
}

function buildSizeChart(trades, metrics) {
  const sizes = trades.map(t => t.quote_quantity).filter(q => q > 0);
  if (sizes.length < 2) return '<p class="bhv-empty">Données insuffisantes.</p>';

  const min  = Math.min(...sizes);
  const max  = Math.max(...sizes);
  const N    = 8;
  const step = (max - min) / N || 1;

  const counts = new Array(N).fill(0);
  sizes.forEach(s => {
    const idx = Math.min(Math.floor((s - min) / step), N - 1);
    counts[idx]++;
  });

  const peak = Math.max(...counts, 1);

  const bars = counts.map((count, i) => {
    const lo    = Math.round(min + i * step);
    const hi    = Math.round(min + (i + 1) * step);
    const h     = Math.round((count / peak) * 100);
    const label = i % 2 === 0 ? fmtK(lo) : '';
    return `
      <div class="bhv-size-col" title="${lo}–${hi}$ · ${count} trade${count !== 1 ? 's' : ''}">
        <div class="bhv-size-bar" style="height:${h}%"></div>
        <div class="bhv-size-label">${label}</div>
      </div>`;
  }).join('');

  return `<div class="bhv-size-chart">${bars}</div>`;
}

function fmtK(n) {
  return n >= 1000 ? Math.round(n / 1000) + 'k' : String(n);
}

// ── Events ────────────────────────────────────────────────────────────────────

function bindEvents(root, state) {
  const fileInput = root.querySelector('#bhvFileInput');
  const dropZone  = root.querySelector('#bhvDropZone');
  const clearBtn  = root.querySelector('#bhvClearBtn');

  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) handleImport(file, root);
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('bhv-dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('bhv-dragover');
    });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('bhv-dragover');
      const file = e.dataTransfer?.files[0];
      if (file) handleImport(file, root);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      behaviorRepo.clear();
      mount(root);
    });
  }
}

async function handleImport(file, root) {
  const result = await importBinanceSpot(file);

  if (!result.ok) {
    behaviorRepo.set('importError', result.error);
    behaviorRepo.set('importInfo', null);
    behaviorRepo.set('trades', null);
  } else {
    behaviorRepo.set('importError', null);
    behaviorRepo.set('importInfo',
      `${result.trades.length} trade${result.trades.length !== 1 ? 's' : ''} importé${result.trades.length !== 1 ? 's' : ''} · ${result.skipped} ligne${result.skipped !== 1 ? 's' : ''} ignorée${result.skipped !== 1 ? 's' : ''}`
    );
    behaviorRepo.set('trades', result.trades);
  }

  mount(root);
}

// ── Utility ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export { mount };
