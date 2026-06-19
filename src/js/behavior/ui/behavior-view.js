// Renders the behavior analysis module into #behavior-root.
// Self-contained: reads from behaviorRepo, writes to behaviorRepo, re-renders on changes.

import { behaviorRepo     } from '../storage/behavior-repo.js';
import { getAll as getSessions, save as saveSession, remove as removeSession, clearAll as clearAllSessions } from '../storage/session-repo.js';
import { analyzeSessions } from '../analytics/behavior-analyzer.js';
import { importBinanceSpot } from '../import/uploader.js';
import { computeMetrics, tradeSize } from '../analytics/metrics.js';
import { detectStyle, detectStyleTransitions, isShiftMoreAggressive } from '../analytics/style.js';
import { detectPatterns, tagTrades } from '../analytics/patterns.js';
import { computeScore          } from '../analytics/scoring.js';
import { computeCoaching       } from '../analytics/coaching.js';
import { buildBehaviorBridgeOutput } from '../behavior-bridge.js';
import { groupGridTrades } from '../analytics/grid-grouper.js';
import { anonymizeTrades } from '../anonymize/anonymizer.js';
import { importRegistry, portfolio } from '../../storage.js';
import { extract as extractPortfolio } from '../wallet/portfolio-extractor.js';

// ── Public entry point ────────────────────────────────────────────────────────

// ── Profil stratégique Order History — GRID uniquement ───────────────────────
// Seul le profil GRID déclenche la contextualisation du scoring Trade History.
//
// GRID  : contextualisé — structure intentionnelle claire. Les fills sur même
//   symbole reflètent une grille posée, pas une réaction émotionnelle.
// DCA   : exclu — trop facilement confondu avec averaging down émotionnel.
//   Un DCA régulier et un loss chasing progressif produisent des patterns
//   similaires. La contextualisation serait exploitable sans garde-fou suffisant.
// MIXTE : exclu — comportement hybride trop ambigu pour moduler le scoring.
//   Risque d'atténuer un signal agressif réel masqué par quelques ordres grille.
//
// Ce choix est conservateur par conception. Tout futur ajout doit démontrer
// que le profil est structurellement incompatible avec un comportement émotionnel.
const ORDER_STRATEGY_TTL_MS = 7 * 24 * 60 * 60 * 1000;  // 7 jours — TTL hard cutoff

// ── Debug ─────────────────────────────────────────────────────────────────────
const DEBUG_GRID_CTX = false;
const dbgCtx = (...args) => { if (DEBUG_GRID_CTX) console.debug('[bhv:grid-ctx]', ...args); };

// ── Décroissance de la confidence selon l'âge du profil ──────────────────────
// Évite qu'un profil GRID ancien conserve trop de poids. Fonction pure, pas de cron.
//
// J0–J2 → confidence pleine        (profil récent, signal fort)
// J3–J5 → confidence × 0.60        (signal modéré, profil en cours d'expiration)
// J6–J7 → confidence × 0.25        (signal minimal, quasi-expiré)
// >7j   → ignoré via TTL hard cutoff (retour null avant cet appel)
function applyConfidenceDecay(confidence, ageDays) {
  if (ageDays <= 2) return confidence;
  if (ageDays <= 5) return Math.round(confidence * 0.60 * 100) / 100;
  return               Math.round(confidence * 0.25 * 100) / 100;
}

function readGridContext() {
  const osp = behaviorRepo.get('orderStrategyProfile');
  if (!osp || osp.profile !== 'grid') {
    dbgCtx('OFF — profil absent ou non-grid (%s)', osp?.profile ?? 'null');
    return null;
  }

  const ageMs   = Date.now() - (osp.updatedAt || 0);
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  if (ageDays > 7) {
    dbgCtx('OFF — raison: expired (âge=%.1fj)', ageDays);
    return null;
  }

  const rawConf    = osp.confidence;
  const confidence = typeof rawConf === 'number'
    ? applyConfidenceDecay(rawConf, ageDays)
    : null;

  dbgCtx('ON — âge=%.1fj · confidence: %s → %s · symbols=%o',
    ageDays, rawConf ?? 'null', confidence ?? 'null(fallback 0.5 dans scoring)', osp.symbols);

  return {
    hasGridProfile:   true,
    gridProfileFresh: true,
    symbols:          osp.symbols || [],
    confidence
  };
}

function mount(root) {
  const trades            = behaviorRepo.get('trades');
  const importError       = behaviorRepo.get('importError');
  const importDiagnostic  = behaviorRepo.get('importDiagnostic');
  const importInfo        = behaviorRepo.get('importInfo');
  const importSummary     = behaviorRepo.get('importSummary');
  const walletResult      = behaviorRepo.get('walletResult');
  const orderResult       = behaviorRepo.get('orderResult');
  const validationWarning  = behaviorRepo.get('validationWarning');
  const validationWarnings = behaviorRepo.get('validationWarnings');

  let metrics   = null;
  let patterns  = null;
  let tradeTags = new Map();
  let score     = null;
  let coaching  = null;
  let style       = null;
  let transitions = null;
  let gridContext = null;

  if (trades && trades.length > 0) {
    // Regroupement grille avant pattern detection.
    // Les séquences grille (même symbole/côté, intervalle court) sont consolidées
    // en un trade synthétique pour éviter les faux positifs overtrading/size_inconsistency.
    // Limitation documentée : travaille sur timestamps d'exécution uniquement.
    const tradesForAnalysis = groupGridTrades(trades);

    // Contexte stratégique Order History — lu ici, passé à computeScore.
    // Présent uniquement si un profil GRID a été détecté dans les 7 derniers jours.
    gridContext = readGridContext();

    metrics     = computeMetrics(tradesForAnalysis);
    patterns    = detectPatterns(tradesForAnalysis, metrics);
    tradeTags   = tagTrades(tradesForAnalysis, metrics);
    score       = computeScore(patterns, metrics, gridContext);
    coaching    = computeCoaching(patterns, metrics, score);
    style       = detectStyle(tradesForAnalysis, metrics);
    transitions = detectStyleTransitions(tradesForAnalysis, style?.key);

    // ── Behavior Bridge — storage-mediated merge ──────────────────────────
    // Translates the historical score (0–100) into a Guard level (1–5) and
    // stores it for render.js to read. render.js applies Math.max() against
    // the instant guard level — historical may raise caution, never reduce it.
    // The timestamp is stored so render.js can expire the value after 7 days.
    // This does NOT overwrite payload.behavior.overtradingLevel in engine.js.
    const bridgeOutput = buildBehaviorBridgeOutput(score);
    behaviorRepo.set('guardLevel', bridgeOutput.guardLevel);
    behaviorRepo.set('guardLevelUpdatedAt', Date.now());
    if (bridgeOutput.dominantRisk) {
      behaviorRepo.set('dominantRisk', bridgeOutput.dominantRisk);
      behaviorRepo.set('dominantRiskUpdatedAt', Date.now());
    }
    // ─────────────────────────────────────────────────────────────────────

    // Expose le niveau de cohérence au moteur principal (lecture seule via localStorage)
    if (transitions && transitions.localStyles.length > 0) {
      const r   = transitions.transitionsCount / transitions.localStyles.length;
      const lvl = r === 0 ? 'Élevée' : r <= 0.2 ? 'Bonne' : r <= 0.4 ? 'Moyenne' : 'Faible';
      behaviorRepo.set('coherenceLevel', lvl);
    } else {
      behaviorRepo.set('coherenceLevel', null);
    }
  } else {
    behaviorRepo.set('coherenceLevel', null);
  }

  render(root, { trades, metrics, patterns, tradeTags, score, coaching, style, transitions, importError, importDiagnostic, importInfo, importSummary, walletResult, orderResult, gridContext, validationWarning, validationWarnings });
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
      </div>
      ${buildImportCard(state)}
      ${buildSessionsCard(state)}
      ${buildPortfolioSection()}
      ${state.trades && !state.orderResult ? buildAnalysis(state)
          : state.orderResult              ? buildOrderAnalysis(state.orderResult)
          : state.walletResult             ? buildWalletAnalysis(state.walletResult)
          : ''}
    </div>`;
}

// ── Import card ───────────────────────────────────────────────────────────────

function buildImportCard(state) {
  return `
    <div class="bhv-card bhv-import-card${state.importInfo ? ' bhv-pulse-ok' : ''}">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Que contient votre fichier ?</span>
      </div>

      <div class="bhv-drop-zone" id="bhvDropZone">
        <input type="file" id="bhvFileInput" accept=".csv,.xlsx,.xls,.pdf" class="bhv-file-input">
        <label for="bhvFileInput" class="bhv-drop-label">
          <div class="bhv-drop-types">
            <div class="bhv-drop-type"><span class="bhv-drop-type-icon">📈</span><span class="bhv-drop-type-name">Transactions exécutées</span><span class="bhv-drop-type-desc">Achats et ventes réellement réalisés</span></div>
            <div class="bhv-drop-type"><span class="bhv-drop-type-icon">🎯</span><span class="bhv-drop-type-name">Ordres de marché</span><span class="bhv-drop-type-desc">Ordres placés, annulés ou exécutés</span></div>
            <div class="bhv-drop-type"><span class="bhv-drop-type-icon">💰</span><span class="bhv-drop-type-name">Mouvements de capital</span><span class="bhv-drop-type-desc">Dépôts, retraits, transferts et revenus</span></div>
          </div>
          <div class="bhv-drop-formats">Formats acceptés : CSV • XLSX • PDF<br><span class="bhv-drop-formats-hint">Export standard depuis votre plateforme de trading</span></div>
          <span class="bhv-drop-icon">↑</span>
          <span class="bhv-drop-text">Glisser-déposer votre fichier ici</span>
          <span class="bhv-drop-hint">ou sélectionner un export</span>
        </label>
      </div>

      ${state.importError ? `<div class="bhv-msg bhv-msg--error">${escHtml(state.importError)}</div>` : ''}
      ${state.importDiagnostic ? `<pre class="bhv-msg bhv-msg--diagnostic">${escHtml(state.importDiagnostic)}</pre>` : ''}
      ${state.importSummary ? buildImportSummary(state.importSummary)
        : state.importInfo  ? `<div class="bhv-msg bhv-msg--info">${escHtml(state.importInfo)}</div>` : ''}

      ${(state.trades || state.walletResult || state.orderResult) ? `
        <div class="bhv-import-actions">
          <button class="bhv-btn bhv-btn--danger" id="bhvClearBtn" type="button">Effacer les données</button>
        </div>` : ''}
    </div>`;
}

function buildImportSummary(s) {
  const qualityWarning = s.pdfQuality === 'DEGRADED'
    ? `<div class="bhv-summary-row bhv-summary-row--warning"><span class="bhv-summary-label">Qualité extraction</span><span class="bhv-summary-val">Dégradée — résultats indicatifs</span></div>`
    : '';
  return `
    <div class="bhv-import-summary">
      <div class="bhv-summary-row"><span class="bhv-summary-label">Source détectée</span><span class="bhv-summary-val">${escHtml(s.source)}</span></div>
      <div class="bhv-summary-row"><span class="bhv-summary-label">Format</span><span class="bhv-summary-val">${escHtml(s.format)}</span></div>
      <div class="bhv-summary-row"><span class="bhv-summary-label">Lignes lues</span><span class="bhv-summary-val">${s.lus}</span></div>
      <div class="bhv-summary-row"><span class="bhv-summary-label">Lignes retenues</span><span class="bhv-summary-val">${s.retenus}</span></div>
      <div class="bhv-summary-row"><span class="bhv-summary-label">Lignes ignorées</span><span class="bhv-summary-val">${s.ignores}</span></div>
      ${qualityWarning}
    </div>`;
}

// ── Sessions card ─────────────────────────────────────────────────────────────

function buildSessionsCard(state) {
  const sessions  = getSessions();
  const hasTrades = !!(state.trades && state.trades.length);
  const hasData   = hasTrades || !!state.walletResult;

  if (!hasData && !sessions.length) return '';

  const analysis = sessions.length > 0 ? analyzeSessions(sessions) : null;

  // Score par session (id → { score, profile }) depuis l'évolution
  const scoreMap = analysis
    ? new Map(analysis.evolution.map(s => [s.id, { score: s.score, profile: s.profile }]))
    : new Map();

  const saveBtn = hasTrades
    ? `<button class="bhv-btn bhv-btn--save" id="bhvSaveSessionBtn" type="button">Sauvegarder</button>`
    : '';

  const clearBtn = sessions.length
    ? `<button class="bhv-btn bhv-btn--clear-sessions" id="bhvClearSessionsBtn" type="button">Effacer</button>`
    : '';

  const listItems = sessions.map(s => {
    const d    = new Date(s.createdAt);
    const date = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const sc   = scoreMap.get(s.id);
    const scoreBadge = sc
      ? `<span class="bhv-session-score bhv-session-score--${sc.profile.color}">${sc.score} / 100</span>`
      : '';
    return `
      <div class="bhv-session">
        <div class="bhv-session-info">
          <span class="bhv-session-name">${escHtml(s.name)}</span>
          <span class="bhv-session-meta">${s.trades.length} trade${s.trades.length !== 1 ? 's' : ''} analysé${s.trades.length !== 1 ? 's' : ''}</span>
        </div>
        ${scoreBadge}
        <div class="bhv-session-actions">
          <button class="bhv-session-btn bhv-session-btn--load" data-id="${escHtml(s.id)}" type="button">Charger</button>
          <button class="bhv-session-btn bhv-session-btn--delete" data-id="${escHtml(s.id)}" type="button">✕</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="bhv-card bhv-sessions-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Sessions</span>
        <div class="bhv-sessions-head-actions">${saveBtn}${clearBtn}</div>
      </div>
      <div class="bhv-sessions-tip">Conseil : conserve tes sessions pour suivre ton évolution.</div>
      ${sessions.length
        ? `<div class="bhv-session-list">${listItems}</div>`
        : `<div class="bhv-sessions-empty">Aucune session sauvegardée.</div>`
      }
      ${analysis ? buildSessionsSynthesis(analysis) : ''}
    </div>`;
}

function buildSessionsSynthesis(analysis) {
  const { bestSession, worstSession, globalStats, evolution } = analysis;
  if (globalStats.sessionsCount < 2) return '';

  const bars = evolution.map(s => {
    const h     = s.score;
    const color = s.profile.color;
    return `<div class="bhv-synth-bar-col" title="${escHtml(s.name)} · ${s.score}">
      <div class="bhv-synth-bar bhv-synth-bar--${color}" style="height:${h}%"></div>
    </div>`;
  }).join('');

  return `
    <div class="bhv-sessions-synthesis">
      <div class="bhv-synth-stats">
        <div class="bhv-synth-stat">
          <span class="bhv-synth-label">Score moyen</span>
          <span class="bhv-synth-value">${globalStats.avgScore}</span>
        </div>
        <div class="bhv-synth-stat">
          <span class="bhv-synth-label">Meilleure</span>
          <span class="bhv-synth-value bhv-synth-value--ok">${bestSession.score}</span>
        </div>
        <div class="bhv-synth-stat">
          <span class="bhv-synth-label">Pire</span>
          <span class="bhv-synth-value bhv-synth-value--danger">${worstSession.score}</span>
        </div>
        <div class="bhv-synth-stat">
          <span class="bhv-synth-label">Trades total</span>
          <span class="bhv-synth-value">${globalStats.totalTrades}</span>
        </div>
      </div>
      <div class="bhv-synth-chart">${bars}</div>
      ${(() => { const d = getDisciplineLabel(globalStats.avgScore); return `<div class="bhv-synth-reading bhv-synth-reading--${d.mod}">Lecture comportementale : ${d.label}</div>`; })()}
      <div class="bhv-synth-insight">Interprétation : ${getDisciplineInsight(globalStats.avgScore)}</div>
    </div>`;
}

// ── Reliability banner ────────────────────────────────────────────────────────

function buildReliabilityBanner(dataQuality) {
  if (!dataQuality || dataQuality.level === 'HIGH') return '';
  if (dataQuality.level === 'LOW') {
    return `<div class="bhv-msg bhv-msg--error">Données insuffisantes — lecture indicative uniquement.</div>`;
  }
  return `<div class="bhv-msg bhv-msg--grid-context">Analyse partielle — contexte limité.</div>`;
}

// ── Verdict block ─────────────────────────────────────────────────────────────

function buildVerdictBlock(state) {
  const { score, patterns, coaching } = state;
  if (!score) return '';

  const s = score.score;

  // A. Statut global
  const status = s < 40 ? { emoji: '🔴', label: 'STOP IMMÉDIAT', text: 'Ton comportement actuel détruit ton edge.',  mod: 'stop'   }
               : s < 70 ? { emoji: '🟡', label: 'AJUSTEMENT',    text: 'Ton système est bon mais mal exécuté.',      mod: 'adjust' }
               :           { emoji: '🟢', label: 'OK',             text: 'Ton comportement est cohérent.',             mod: 'ok'     };

  // B. Action principale (une seule)
  const dominant = score.dominantRisk || (patterns?.[0]?.label ?? '');
  const action   = dominant.includes('Escalade')    ? 'Interdis toute augmentation de taille immédiatement'
                 : dominant.includes('Overtrading') ? 'Stop trading pendant 24h'
                 :                                    'Réduis ta taille de 30%';

  // C. Cause principale
  const causeLabel = coaching?.dominantLabel || patterns?.[0]?.label || dominant || '—';

  return `
    <div class="bhv-verdict bhv-verdict--${status.mod}">
      <div class="bhv-verdict-status bhv-verdict-status--${status.mod}">
        <span class="bhv-verdict-emoji">${status.emoji}</span>
        <span class="bhv-verdict-label">${escHtml(status.label)}</span>
        <span class="bhv-verdict-text">${escHtml(status.text)}</span>
      </div>
      <div class="bhv-verdict-action">${escHtml(action)}</div>
      <div class="bhv-verdict-cause">Cause dominante : ${escHtml(causeLabel)}</div>
    </div>`;
}

// ── Analysis section ──────────────────────────────────────────────────────────

function buildAnalysis(state) {
  const { metrics, patterns, trades, tradeTags, score, coaching, style, transitions, gridContext } = state;
  if (!metrics) return '';

  const reliabilityBanner = buildReliabilityBanner(score?.dataQuality);

  const warningBanner = state.validationWarning
    ? `<div class="bhv-msg bhv-msg--warn">⚠️ Analyse potentiellement non fiable — format non standard</div>`
    : '';

  const warningsList = state.validationWarnings?.length
    ? `<ul class="bhv-warning-list">
         ${state.validationWarnings.map(w => {
           const type = /anormale|incohérent/i.test(w) ? 'warn-critical' : 'warn-info';
           return `<li class="${type}">${escHtml(w)}</li>`;
         }).join('')}
       </ul>`
    : '';

  // Notice contexte grille — affichée uniquement si le score l'a réellement appliqué.
  // Message sobre : contexte, pas correction. Le pattern reste visible.
  const gridContextBanner = score?.gridContextApplied
    ? `<div class="bhv-msg bhv-msg--grid-context">Profil grille récent détecté (Order History) : certaines alertes de fréquence sont contextualisées.</div>`
    : '';

  return `
    <div class="bhv-layout bhv-fade-in">
      <div class="bhv-analysis">
        ${buildVerdictBlock(state)}
        ${warningBanner}
        ${gridContextBanner}
        ${reliabilityBanner}
        ${warningsList}
        ${score ? buildScoreCard(score) : ''}
        ${coaching && coaching.tips.length ? buildCoachingCard(coaching) : ''}
        ${buildPatternsCard(patterns)}
        ${buildReadingCard(metrics, patterns, style, transitions)}
        ${buildSummaryCard(metrics)}
        ${buildJournalCard(trades, tradeTags)}
      </div>
      ${buildSidebar(metrics, patterns, score, trades)}
    </div>`;
}

// ── Wallet analysis panel ─────────────────────────────────────────────────────
// Rendered when the imported file is a wallet history (type === 'wallet').
// Completely separate from the trading analysis — no score, no patterns.

function buildWalletAnalysis(result) {
  const { metrics: m, summary: s } = result;
  if (!m || !s) return '';

  const levelColor = lvl => lvl === 'high' ? 'danger' : lvl === 'medium' ? 'warn' : 'ok';
  const levelLabel = lvl => lvl === 'high' ? 'Élevé'  : lvl === 'medium' ? 'Modéré' : 'Faible';

  const actColor = levelColor(s.activityLevel);
  const feeColor = levelColor(s.feeIntensity);

  const coinsDisplay = m.uniqueCoins.length > 5
    ? `${m.uniqueCoins.slice(0, 5).join(', ')} +${m.uniqueCoins.length - 5}`
    : m.uniqueCoins.join(', ') || '—';

  const convColor = m.totalConvert > 10 ? ' bhv-stat-value--warn' : '';

  return `
    <div class="bhv-analysis bhv-fade-in">

      <div class="bhv-card">
        <div class="bhv-card-head">
          <span class="bhv-card-title">Analyse comportementale financière</span>
          <span class="bhv-card-desc">Wallet · historique d'opérations</span>
        </div>
        <div class="bhv-dominant-banner bhv-dominant-banner--gold">
          <span class="bhv-dominant-label">Fichier détecté</span>
          <span class="bhv-dominant-value">Historique wallet — pas de données trading exploitables</span>
        </div>
        <div class="bhv-stat-grid">
          <div class="bhv-stat">
            <div class="bhv-stat-label">Opérations</div>
            <div class="bhv-stat-value">${m.totalOperations}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Coins actifs</div>
            <div class="bhv-stat-value">${m.uniqueCoins.length}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Ops / jour</div>
            <div class="bhv-stat-value bhv-stat-value--${actColor}">${m.avgOperationPerDay}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Pic journalier</div>
            <div class="bhv-stat-value">${m.maxOperationsInOneDay}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Frais (nb)</div>
            <div class="bhv-stat-value bhv-stat-value--${feeColor}">${m.totalFees}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Frais (valeur)</div>
            <div class="bhv-stat-value bhv-stat-value--${feeColor}">${m.totalFeeAmount}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Rewards / Earn</div>
            <div class="bhv-stat-value">${m.totalEarnRewards}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Conversions</div>
            <div class="bhv-stat-value${convColor}">${m.totalConvert}</div>
          </div>
        </div>
        ${m.uniqueCoins.length > 0 ? `
        <div class="bhv-reading-line">
          <span class="bhv-reading-dot bhv-reading-dot--gold"></span>
          <span>Coins : ${escHtml(coinsDisplay)}</span>
        </div>` : ''}
      </div>

      <div class="bhv-card">
        <div class="bhv-card-head">
          <span class="bhv-card-title">Lecture comportementale</span>
        </div>
        <div class="bhv-reading-line">
          <span class="bhv-reading-dot bhv-reading-dot--${actColor}"></span>
          <span>Activité wallet : <strong>${levelLabel(s.activityLevel)}</strong>
            (${m.avgOperationPerDay} ops/jour · pic à ${m.maxOperationsInOneDay} en une journée)</span>
        </div>
        <div class="bhv-reading-line">
          <span class="bhv-reading-dot bhv-reading-dot--${feeColor}"></span>
          <span>Intensité des frais : <strong>${levelLabel(s.feeIntensity)}</strong>
            (${m.totalFees} opérations de frais · valeur totale ${m.totalFeeAmount})</span>
        </div>
        <div class="bhv-dominant-banner bhv-dominant-banner--${actColor}">
          <span class="bhv-dominant-label">Comportement observé</span>
          <span class="bhv-dominant-value">${escHtml(s.behavior)}</span>
        </div>
      </div>

    </div>`;
}

// ── Order History analysis panel ──────────────────────────────────────────────
// Rendered when the imported file is an Order History (Format B).
// Shows strategy profile, fill rate, directional ratio, grid spacing.

function buildOrderAnalysis(result) {
  if (!result) return '';
  const { metrics: m, profile, summary } = result;

  const profileLabel = {
    grid:        'Grille',
    dca:         'DCA',
    opportuniste: 'Opportuniste',
    mixte:       'Mixte',
    inconnu:     'Inconnu'
  }[profile] || profile;

  const profileColor = {
    grid:        'ok',
    dca:         'ok',
    opportuniste: 'warn',
    mixte:       'neutral',
    inconnu:     'neutral'
  }[profile] || 'neutral';

  const pct = v => v != null ? `${Math.round(v * 100)} %` : '—';
  const num  = (v, dec = 1) => v != null ? v.toFixed(dec) : '—';

  return `
    <div class="bhv-analysis bhv-fade-in">
      <div class="bhv-card">
        <div class="bhv-card-head">
          <span class="bhv-card-title">Analyse Order History</span>
          <span class="bhv-card-desc">Format B · ordres exécutés (FILLED)</span>
        </div>
        <div class="bhv-dominant-banner bhv-dominant-banner--${profileColor}">
          <span class="bhv-dominant-label">Profil détecté</span>
          <span class="bhv-dominant-value">${escHtml(profileLabel)}</span>
        </div>
        ${m ? `
        <div class="bhv-stat-grid">
          <div class="bhv-stat">
            <div class="bhv-stat-label">Ordres FILLED</div>
            <div class="bhv-stat-value">${m.tradeCount}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Taux d'exéc.</div>
            <div class="bhv-stat-value">${pct(m.fillRate)}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Sens dominant</div>
            <div class="bhv-stat-value">${escHtml(m.majorSide || '—')}</div>
          </div>
          <div class="bhv-stat">
            <div class="bhv-stat-label">Ratio directionnel</div>
            <div class="bhv-stat-value">${pct(m.directionalRatio)}</div>
          </div>
          ${m.avgHoldMin != null ? `
          <div class="bhv-stat">
            <div class="bhv-stat-label">Durée moy. détention</div>
            <div class="bhv-stat-value">${m.avgHoldMin < 60 ? Math.round(m.avgHoldMin) + ' min' : (m.avgHoldMin / 60).toFixed(1) + ' h'}</div>
          </div>` : ''}
          ${m.gridSpacing != null ? `
          <div class="bhv-stat">
            <div class="bhv-stat-label">Espacement grille</div>
            <div class="bhv-stat-value">${pct(m.gridSpacing)}</div>
          </div>` : ''}
        </div>` : ''}
        <div class="bhv-dominant-banner bhv-dominant-banner--neutral" style="margin-top:0.75rem">
          <span class="bhv-dominant-label">Lecture</span>
          <span class="bhv-dominant-value">${escHtml(summary)}</span>
        </div>
        ${m && m.cancelProfile !== 'none' ? `
        <div class="bhv-reading-line" style="margin-top:0.5rem">
          <span class="bhv-reading-dot bhv-reading-dot--${m.cancelProfile === 'heavy' ? 'danger' : 'warn'}"></span>
          <span>Annulations : profil <strong>${escHtml(m.cancelProfile)}</strong></span>
        </div>` : ''}
      </div>
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

  const dominantBanner = dominantRisk ? `
    <div class="bhv-dominant-banner bhv-dominant-banner--${profile.color}">
      <span class="bhv-dominant-label">⚠ Comportement dominant</span>
      <span class="bhv-dominant-value">${escHtml(dominantRisk)}</span>
    </div>` : '';

  return `
    <div class="bhv-card bhv-score-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Score comportemental</span>
        <span class="bhv-card-desc">Sur 100 · basé sur patterns et intensité</span>
      </div>
      ${dominantBanner}
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
  if (!tips.length) return '';

  // tips[0] → action prioritaire (mise en évidence)
  // tips[1..2] → visibles
  // tips[3..] → collapsibles
  const actionTip    = tips[0];
  const visibleTips  = tips.slice(1, 3);
  const hiddenTips   = tips.slice(3);

  const visibleItems = visibleTips.map(tip => `
    <div class="bhv-coaching-tip">
      <span class="bhv-coaching-bullet"></span>
      <span>${escHtml(tip)}</span>
    </div>`).join('');

  const hiddenItems = hiddenTips.map(tip => `
    <div class="bhv-coaching-tip bhv-tip-extra" hidden>
      <span class="bhv-coaching-bullet"></span>
      <span>${escHtml(tip)}</span>
    </div>`).join('');

  const expandWrap = hiddenTips.length ? `
    <div id="bhvCoachingExpandWrap" class="bhv-journal-expand">
      <button class="bhv-journal-btn" id="bhvCoachingExpandBtn" type="button">
        +${hiddenTips.length} règle${hiddenTips.length > 1 ? 's' : ''}
      </button>
    </div>` : '';

  return `
    <div class="bhv-card bhv-coaching-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Coaching</span>
        <span class="bhv-card-desc">${escHtml(priority)}</span>
      </div>
      <div class="bhv-action-priority">
        <span class="bhv-action-priority-label">Action prioritaire</span>
        <span class="bhv-action-priority-text">${escHtml(actionTip)}</span>
      </div>
      ${visibleItems ? `<div class="bhv-coaching-tips">${visibleItems}${hiddenItems}</div>` : ''}
      ${expandWrap}
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
      <div class="bhv-metric-label bhv-plan-label">Plan d'action</div>
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
        ${metric('Délai moy.',     m.avgTimeBetween !== null ? m.avgTimeBetween + ' min' : '—', m.avgTimeBetween !== null && m.avgTimeBetween < 15 ? 'warn' : '')}
        ${metric('Après achat',   delayAfterBuy)}
        ${metric('Après vente',   delayAfterSell)}
        ${metric('Heures distinctes', m.activeHours + ' h sur la période', m.activeHours <= 5 ? 'warn' : '')}
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

function buildReadingCard(metrics, patterns, style, transitions) {
  const sentences = buildReadingSentences(metrics, patterns);

  const items = sentences.map(s => `
    <div class="bhv-reading-line">
      <span class="bhv-reading-dot"></span>
      <span>${escHtml(s)}</span>
    </div>`).join('');

  const styleLine = style && style.key !== 'unknown' ? `
    <div class="bhv-style-context">
      <span class="bhv-style-label">Style détecté</span>
      <span class="bhv-style-value">${escHtml(style.label)}</span>
    </div>` : '';

  let transitionLine = '';
  if (transitions) {
    let transitionText;
    if (transitions.isStable) {
      transitionText = 'Style stable sur la période.';
    } else if (transitions.dominantShift && isShiftMoreAggressive(transitions.dominantShift, transitions.globalStyle)) {
      transitionText = `Bascule locale observée vers un style plus agressif (${transitions.transitionsCount} transition${transitions.transitionsCount > 1 ? 's' : ''}).`;
    } else {
      transitionText = `Transitions détectées : ${transitions.transitionsCount}.`;
    }
    transitionLine = `
    <div class="bhv-style-context">
      <span class="bhv-style-label">Dynamique</span>
      <span class="bhv-style-value">${escHtml(transitionText)}</span>
    </div>`;
  }

  let coherenceLine = '';
  let postureLine   = '';
  if (transitions && transitions.localStyles.length > 0) {
    const ratio    = transitions.transitionsCount / transitions.localStyles.length;
    const cohLabel = ratio === 0  ? 'Élevée'
                   : ratio <= 0.2 ? 'Bonne'
                   : ratio <= 0.4 ? 'Moyenne'
                   :                'Faible';
    const cohText  = ratio === 0  ? 'Style respecté sur l\'ensemble de la période.'
                   : ratio <= 0.2 ? 'Style globalement respecté avec quelques écarts mineurs.'
                   : ratio <= 0.4 ? 'Style identifiable, mais dérives ponctuelles dans l\'exécution.'
                   :                'Le style global existe, mais il est souvent rompu localement.';
    coherenceLine = `
    <div class="bhv-style-context">
      <span class="bhv-style-label">Cohérence</span>
      <span class="bhv-style-value">${escHtml(cohLabel)} · ${escHtml(cohText)}</span>
    </div>`;

    const postureText = ratio === 0  ? 'Cadre respecté. Tu peux continuer à exécuter normalement.'
                      : ratio <= 0.2 ? 'Rester discipliné. Pas besoin d\'accélérer.'
                      : ratio <= 0.4 ? 'Ralentir légèrement et revenir à ton cadre habituel.'
                      :                'Réduire l\'intensité. Risque de dérive comportementale.';
    postureLine = `
    <div class="bhv-style-context">
      <span class="bhv-style-label">Posture recommandée</span>
      <span class="bhv-style-value">${escHtml(postureText)}</span>
    </div>`;
  }

  return `
    <div class="bhv-card bhv-reading-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Lecture comportementale</span>
        <span class="bhv-card-desc">Synthèse de l'historique</span>
      </div>
      ${styleLine}
      ${transitionLine}
      ${coherenceLine}
      ${postureLine}
      <div class="bhv-reading-list">${items}</div>
    </div>`;
}

function buildReadingSentences(m, patterns) {
  const sentences = [];
  const types = new Set((patterns || []).map(p => p.type));

  // ── Alertes locales (patterns détectés sur des sous-fenêtres) ─────────────────
  // Overtrading : pattern local — distinguer d'un rythme global élevé.
  // Si le délai moyen global est > 60 min, les pics sont isolés, pas habituels.
  if (types.has('overtrading')) {
    const globalPaceOk = m.avgTimeBetween !== null && m.avgTimeBetween > 60;
    if (globalPaceOk) {
      sentences.push('Quelques séquences rapprochées ont été détectées, mais l\'activité globale reste espacée.');
    } else {
      sentences.push('Tu multiplies les trades dans des fenêtres de temps très courtes.');
    }
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

  // ── Lecture globale (métriques sur l'ensemble de la période) ──────────────────
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

  // Trier : high en premier, medium ensuite
  const sorted = [...patterns].sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1
  );

  const tier = (p, i) => {
    if (p.severity === 'high' && i < 2) return 'critical';
    if (i < 4)                          return 'secondary';
    return 'tertiary';
  };

  const items = sorted.map((p, i) => `
    <div class="bhv-pattern bhv-pattern--${tier(p, i)}">
      <div class="bhv-pattern-name">${escHtml(p.label)}</div>
      <div class="bhv-pattern-desc">${escHtml(p.description)}</div>
    </div>`).join('');

  return `<div class="bhv-card">${head}<div class="bhv-patterns">${items}</div></div>`;
}

// ── Journal card ──────────────────────────────────────────────────────────────

const JOURNAL_LIMIT = 15;

function buildJournalCard(trades, tradeTags) {
  const sorted = [...trades].sort((a, b) => b.timestamp - a.timestamp).slice(0, 200);

  const buildRow = (t, hidden = false) => {
    const date     = new Date(t.timestamp).toISOString().replace('T', ' ').slice(0, 16);
    const stored   = tradeTags.get(t.timestamp);
    const tags     = stored && stored.length ? formatTags(stored) : '—';
    const tagClass = stored && stored.length ? ' bhv-tags--flagged' : '';
    const attr     = hidden ? ' class="bhv-row-extra" hidden' : '';
    return `
      <tr${attr}>
        <td>${date}</td>
        <td>${escHtml(t.symbol)}</td>
        <td class="bhv-side bhv-side--${t.side.toLowerCase()}">${t.side}</td>
        <td>${t.price}</td>
        <td>${t.quantity}</td>
        <td>${Math.round(t.price * t.quantity * 100) / 100}</td>
        <td class="bhv-tags${tagClass}">${escHtml(tags)}</td>
      </tr>`;
  };

  const rows = sorted.map((t, i) => buildRow(t, i >= JOURNAL_LIMIT)).join('');

  const expandBtn = sorted.length > JOURNAL_LIMIT ? `
    <div class="bhv-journal-expand" id="bhvJournalExpandWrap">
      <button class="bhv-journal-btn" id="bhvJournalExpandBtn" type="button">
        Voir tout (${trades.length})
      </button>
    </div>` : '';

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
      ${expandBtn}
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
  // tradeSize() : cohérence avec computeMetrics — évite que les trades sans Amount
  // valide (quote_quantity = 0) soient invisibles dans le graphique alors qu'ils
  // sont inclus dans avgSize.
  const sizes = trades.map(t => tradeSize(t)).filter(q => q > 0);
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
      e.target.value = '';  // reset : permet re-sélection du même fichier (iOS)
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

  const clearSessionsBtn = root.querySelector('#bhvClearSessionsBtn');
  if (clearSessionsBtn) {
    clearSessionsBtn.addEventListener('click', () => {
      if (confirm('Supprimer toutes les sessions ? Cette action est irréversible.')) {
        clearAllSessions();
        mount(root);
      }
    });
  }

  const saveSessionBtn = root.querySelector('#bhvSaveSessionBtn');
  if (saveSessionBtn) {
    saveSessionBtn.addEventListener('click', () => {
      const trades = behaviorRepo.get('trades');
      if (trades && trades.length) {
        const snapshot = buildSessionSnapshot(state);
        saveSession(trades, { snapshot });
        mount(root);
      }
    });
  }

  root.querySelectorAll('.bhv-session-btn--load').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = btn.dataset.id;
      const session = getSessions().find(s => s.id === id);
      if (!session) return;
      behaviorRepo.set('trades',       session.trades);
      behaviorRepo.set('importError',  null);
      behaviorRepo.set('walletResult', null);
      behaviorRepo.set('orderResult',  null);
      behaviorRepo.set('importInfo',   `Session chargée · ${session.trades.length} trade${session.trades.length !== 1 ? 's' : ''} analysé${session.trades.length !== 1 ? 's' : ''}`);
      behaviorRepo.set('importSummary', null);
      mount(root);
    });
  });

  root.querySelectorAll('.bhv-session-btn--delete').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSession(btn.dataset.id);
      mount(root);
    });
  });

  const coachingExpandBtn = root.querySelector('#bhvCoachingExpandBtn');
  if (coachingExpandBtn) {
    coachingExpandBtn.addEventListener('click', () => {
      root.querySelectorAll('.bhv-tip-extra').forEach(r => r.removeAttribute('hidden'));
      root.querySelector('#bhvCoachingExpandWrap').hidden = true;
    });
  }

  const expandBtn = root.querySelector('#bhvJournalExpandBtn');
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      root.querySelectorAll('.bhv-row-extra').forEach(r => r.removeAttribute('hidden'));
      root.querySelector('#bhvJournalExpandWrap').hidden = true;
    });
  }
}

// ── DEBUG-IPAD — overlay visible sans DevTools · retirer après diagnostic ─────
async function _debugIpadOverlay(file) {
  const lines = [
    `Fichier   : ${file.name}`,
    `Extension : .${file.name.split('.').pop().toLowerCase()}`,
    `MIME      : ${file.type || '(vide — courant iOS Safari)'}`,
    `Taille    : ${(file.size / 1024).toFixed(1)} Ko`,
  ];
  if (file.name.split('.').pop().toLowerCase() !== 'pdf') {
    try {
      const raw    = await file.slice(0, 600).text();
      const bom    = raw.startsWith('\ufeff');
      const clean  = raw.replace(/^\ufeff/, '');
      const sep    = clean.includes('\t') ? 'TAB' : clean.includes(';') ? ';' : ',';
      const lignes = clean.split(/\r?\n/).filter(l => l.trim());
      const cols   = (lignes[0] ?? '').split(sep === 'TAB' ? '\t' : sep);
      lines.push(`BOM UTF-8  : ${bom}`);
      lines.push(`Séparateur : ${sep}`);
      lines.push(`Lignes vues (600o) : ${lignes.length}`);
      lines.push(`Colonnes L1 : ${cols.length} — ${cols.slice(0, 5).join(' | ')}`);
      lines.push(`Début : ${clean.slice(0, 100).replace(/[\r\n]/g, '↵')}`);
    } catch (e) {
      lines.push(`Aperçu CSV : ERREUR — ${e.message}`);
    }
  }
  const el = document.createElement('pre');
  el.id = '_bhv_debug_ipad';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(0,0,0,0.92);color:#00ff88;padding:12px 14px;font-size:11px;line-height:1.5;max-height:50vh;overflow:auto;white-space:pre-wrap;word-break:break-all;border-bottom:2px solid #00ff88;';
  el.textContent = '[DEBUG IMPORT iPad]\n' + lines.join('\n');
  document.getElementById('_bhv_debug_ipad')?.remove();
  document.body.appendChild(el);
  console.warn('[DEBUG-IPAD] import\n' + lines.join('\n'));
}
// ── FIN DEBUG-IPAD ─────────────────────────────────────────────────────────────

async function handleImport(file, root) {
  await _debugIpadOverlay(file);  // DEBUG-IPAD — retirer après diagnostic
  const isPdf = file.name.split('.').pop().toLowerCase() === 'pdf';
  const dropZone = root.querySelector('#bhvDropZone');
  if (dropZone) dropZone.classList.add('bhv-loading');
  let result;
  try {
    result = await importBinanceSpot(file);
  } catch (err) {
    console.warn('[bhv:import] exception non catchée dans importBinanceSpot:', err);
    result = { ok: false, error: 'Erreur inattendue lors de la lecture du fichier.', trades: [] };
  }

  // DEBUG-IPAD — retirer après diagnostic
  if (isPdf && result._debugPdf) {
    const d  = result._debugPdf;
    const ex = d.debugExtract;
    const pdfLines = [
      '',
      '── Extraction PDF ──────────────',
      `Qualité          : ${d.quality}`,
      `Pages            : ${d.pages}`,
      `Items extraits   : ${d.items}`,
      `Chars utiles     : ${d.chars}`,
      `Famille détectée : ${d.family ?? '(non atteinte — bloqué avant)'}`,
      `Rows extraits    : ${d.rowsExtracted ?? '(non atteint)'}`,
      `Rows normalisés  : ${d.rowsNormalized ?? '(non atteint)'}`,
      `Statuts trouvés  : ${d.statuts ?? '(non atteint)'}`,
      '',
      ...(d.normalizedSample ? [
        '── Audit mapping status ────────────',
        `Longueurs rows brutes (5) : [${(d.rawRowLengths ?? []).join(', ')}]`,
        '',
        ...d.normalizedSample.map((r, i) => [
          `Row ${i} (${r.row_length} cells)`,
          `  row[11] brut  : "${r.row11_raw}"`,
          `  status normalisé : ${r.status === null ? 'null' : JSON.stringify(r.status)}`,
          `  symbol=${r.symbol}  side=${r.side}  created_at=${r.created_at}  executed_qty=${r.executed_qty}`,
        ].join('\n')),
        '',
        '── Rows brutes (3 premières) ───────',
        ...(d.rawRowSample ?? []).map((cells, i) =>
          `Row ${i}: ${cells.map((c, j) => `[${j}]${c}`).join('  ')}`
        ),
        '',
      ] : []),
      ...(ex ? [
        '── Signature X ─────────────────────',
        `Source    : ${ex.sigSource} (score=${ex.sigScore})`,
        `Détectée  : ${ex.sigFound ? 'OUI' : 'NON — fallback statique b3.pdf'}`,
        `Header Y  : ${ex.sigHeaderY ?? '—'}`,
        `Colonnes sig     : ${ex.sigColCount ?? '—'} (attendu 12)`,
        `Lignes header fusionnées : ${ex.sigMergedLines ?? '—'}`,
        `Positions : ${ex.sigPositions}`,
        '',
        '── Audit fusion clusters (★=BEST_HEADER) ─',
        ...(ex.clusterAuditLines ?? ['(aucun audit disponible)']),
        '',
        `── Items bruts p${ex.pagesProcessed[0]}–${ex.pagesProcessed[1] ?? ex.pagesProcessed[0]} (30 max) ─`,
        ...ex.debugItems,
        '',
        '── sigMatches / cluster (10 premiers) ─',
        ...ex.sigCounts,
        '',
        '── Distribution X (200 items, buckets 5pt) ─',
        ex.xDist,
      ] : [
        'Extrait brut (200c) :',
        d.extrait || '(vide)',
      ]),
    ].join('\n');
    const existing = document.getElementById('_bhv_debug_ipad');
    if (existing) {
      existing.textContent += pdfLines;
    } else {
      const el = document.createElement('pre');
      el.id = '_bhv_debug_ipad';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(0,0,0,0.92);color:#00ff88;padding:12px 14px;font-size:11px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;word-break:break-all;border-bottom:2px solid #00ff88;';
      el.textContent = '[DEBUG PDF]\n' + pdfLines;
      document.body.appendChild(el);
    }
    console.warn('[DEBUG-IPAD] pdf\n' + pdfLines);
  }
  // FIN DEBUG-IPAD

  if (!result.ok) {
    behaviorRepo.set('importError',       result.error);
    behaviorRepo.set('importDiagnostic',  result.diagnostic ?? null);
    behaviorRepo.set('importInfo',        null);
    behaviorRepo.set('importSummary',     null);
    behaviorRepo.set('importNotice',      null);
    behaviorRepo.set('trades',            null);
    behaviorRepo.set('walletResult',      null);
    behaviorRepo.set('orderResult',       null);
    behaviorRepo.set('analysisQuality',    null);
    behaviorRepo.set('validationWarning',  false);
    behaviorRepo.set('validationWarnings', []);
  } else if (result.type === 'wallet') {
    behaviorRepo.set('importError',        null);
    behaviorRepo.set('importDiagnostic',   null);
    behaviorRepo.set('trades',             null);
    behaviorRepo.set('walletResult',       result);
    behaviorRepo.set('orderResult',        null);
    behaviorRepo.set('importInfo',         result.message);
    behaviorRepo.set('importSummary',      null);
    behaviorRepo.set('importNotice',       null);
    behaviorRepo.set('analysisQuality',    null);
    behaviorRepo.set('validationWarning',  false);
    behaviorRepo.set('validationWarnings', []);
  } else if (result.type === 'order_history') {
    const count = result.trades.length;
    const skip  = result.skipped;
    const pl    = n => n !== 1;
    const info  = `${count} ordre${pl(count) ? 's' : ''} FILLED importé${pl(count) ? 's' : ''} · ${skip} ignoré${pl(skip) ? 's' : ''} · Order History`;
    behaviorRepo.set('importError',        null);
    behaviorRepo.set('importDiagnostic',   null);
    behaviorRepo.set('trades',             anonymizeTrades(result.trades));
    behaviorRepo.set('walletResult',       null);
    behaviorRepo.set('orderResult',        result.orderAnalysis);
    behaviorRepo.set('importInfo',         info);
    behaviorRepo.set('importSummary',      { source: isPdf ? 'Order History PDF' : 'Ordres de marché', format: file.name.split('.').pop().toUpperCase(), lus: result.trades.length + (result.skipped || 0), retenus: result.trades.length, ignores: result.skipped || 0, pdfQuality: result.pdfQuality ?? null });
    behaviorRepo.set('importNotice',       null);
    behaviorRepo.set('analysisQuality',    result.analysisQuality || 'full');
    behaviorRepo.set('validationWarning',  false);
    behaviorRepo.set('validationWarnings', []);

    // ── Pont comportemental Order History → Trade History ─────────────────
    // Si le profil détecté est GRID, on persiste le contexte stratégique dans
    // une clé dédiée. Cette clé n'est jamais effacée lors d'un import Trade History
    // ultérieur — elle lui permet de contextualiser son scoring overtrading.
    // Un import Order History non-GRID efface explicitement le contexte précédent.
    const oa = result.orderAnalysis;
    if (oa && oa.profile === 'grid') {
      behaviorRepo.set('orderStrategyProfile', {
        profile:    'grid',
        confidence: oa.confidence ?? null,
        symbols:    oa.symbols    ?? [],
        updatedAt:  Date.now(),
        source:     'order_history'
      });
    } else {
      behaviorRepo.set('orderStrategyProfile', null);
    }

  } else {
    const count     = result.trades.length;
    const skip      = result.skipped;
    const isPartial = result.analysisQuality === 'partial';
    const pl        = n => n !== 1;
    const info = isPartial
      ? `Données partielles — ${count} trade${pl(count) ? 's' : ''} exploitable${pl(count) ? 's' : ''} · ${skip} ligne${pl(skip) ? 's' : ''} ignorée${pl(skip) ? 's' : ''} · analyse indicative`
      : `${count} trade${pl(count) ? 's' : ''} importé${pl(count) ? 's' : ''} · ${skip} ligne${pl(skip) ? 's' : ''} ignorée${pl(skip) ? 's' : ''}`;
    behaviorRepo.set('importError',       null);
    behaviorRepo.set('importDiagnostic',  null);
    behaviorRepo.set('walletResult',      null);
    behaviorRepo.set('orderResult',       null);
    // orderStrategyProfile : intentionnellement NON effacé ici.
    // Un profil GRID d'un Order History récent doit pouvoir contextualiser
    // plusieurs imports Trade History successifs pendant 7 jours.
    behaviorRepo.set('importInfo',        info);
    behaviorRepo.set('importSummary',     { source: isPdf ? 'Trade History PDF' : 'Transactions exécutées', format: file.name.split('.').pop().toUpperCase(), lus: result.trades.length + (result.skipped || 0), retenus: result.trades.length, ignores: result.skipped || 0, pdfQuality: result.pdfQuality ?? null });
    behaviorRepo.set('importNotice',      null);
    behaviorRepo.set('trades',            anonymizeTrades(result.trades));
    behaviorRepo.set('analysisQuality',    result.analysisQuality || 'full');
    behaviorRepo.set('validationWarning',  result.validationWarning || false);
    behaviorRepo.set('validationWarnings', result.validationWarnings || []);
  }

  if (result.ok) {
    importRegistry.append(buildRegistryEntry(result, file));
    if (result.type === 'wallet') {
      try { persistPortfolioSnapshot(result, file); } catch { /* non-bloquant */ }
    }
  }

  mount(root);
}

// ── Import registry ───────────────────────────────────────────────────────────

function buildRegistryEntry(result, file) {
  const format = file.name.split('.').pop().toUpperCase();
  return {
    schemaVersion:   1,
    importedAt:      new Date().toISOString(),
    source:          result.type === 'order_history' ? 'Order History'
                   : result.type === 'wallet'        ? 'Wallet History'
                   : 'Trade History',
    format,
    importType:      result.type,
    fileName:        file.name        ?? null,
    rowsRead:        result.type === 'wallet' ? (result.metrics?.totalOperations ?? 0)
                   : (result.trades?.length ?? 0) + (result.skipped ?? 0),
    rowsKept:        result.type === 'wallet' ? (result.metrics?.totalOperations ?? 0)
                   : (result.trades?.length ?? 0),
    rowsIgnored:     result.type === 'wallet' ? 0 : (result.skipped ?? 0),
    analysisQuality: result.analysisQuality  ?? null,
    pdfQuality:      result.pdfQuality       ?? null,
    sessionId:       result.sessionId        ?? null,
  };
}

// ── Portfolio V1 ──────────────────────────────────────────────────────────────

function getUniqueCoinsCount(metrics) {
  if (!metrics) return 0;
  const uc = metrics.uniqueCoins;
  if (Array.isArray(uc))      return uc.length;
  if (typeof uc === 'number') return uc;
  return 0;
}

function buildPortfolioSnapshot(result, file, assets, duplicateWarning) {
  const now = new Date().toISOString();
  const m   = result?.metrics ?? {};
  const s   = result?.summary ?? {};
  const id  = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return {
    snapshotId:    id,
    schemaVersion: 1,
    createdAt:     now,
    importRef: {
      fileName:   file?.name ?? null,
      fileSize:   file?.size ?? 0,
      importedAt: now,
    },
    assets: Array.isArray(assets) ? assets : [],
    metrics: {
      totalOperations:  m.totalOperations  ?? 0,
      uniqueCoinsCount: getUniqueCoinsCount(m),
      activityLevel:    s.activityLevel    ?? m.activityLevel ?? null,
      feeIntensity:     s.feeIntensity     ?? m.feeIntensity  ?? null,
    },
    duplicateWarning: Boolean(duplicateWarning),
  };
}

function detectPortfolioDuplicate(file) {
  try {
    const snapshots = portfolio.getAll();
    if (!snapshots.length) return false;
    const last    = snapshots[0];
    const elapsed = Date.now() - Date.parse(last.importRef?.importedAt);
    if (isNaN(elapsed)) return false;
    return (
      last.importRef?.fileName === file.name &&
      last.importRef?.fileSize === file.size &&
      elapsed < 86400000   // 24h en ms
    );
  } catch {
    return false;
  }
}

function persistPortfolioSnapshot(result, file) {
  if (result.type !== 'wallet')             return false;
  if (!Array.isArray(result.rawRows))       return false;
  const extraction       = extractPortfolio(result.rawRows);
  const duplicateWarning = detectPortfolioDuplicate(file);
  const snapshot         = buildPortfolioSnapshot(result, file, extraction.assets, duplicateWarning);
  return portfolio.append(snapshot);
}

function _fmtQty(n) {
  const num = Number(n);
  if (isNaN(num)) return '—';
  return num.toFixed(8).replace(/\.?0+$/, '') || '0';
}

function _fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return '—'; }
}

function _fmtLevel(v) {
  if (v === 'high')   return 'Élevé';
  if (v === 'medium') return 'Moyen';
  if (v === 'low')    return 'Faible';
  return '—';
}

function buildPortfolioSection() {
  const snapshots = portfolio.getAll();
  const latest    = Array.isArray(snapshots) && snapshots.length ? snapshots[0] : null;

  if (!latest) {
    return `
      <div class="bhv-card bhv-portfolio-card">
        <div class="bhv-card-head">
          <span class="bhv-card-title">Portefeuille</span>
        </div>
        <div class="bhv-portfolio-empty">Aucun portefeuille importé. Importez un fichier Wallet History pour voir votre composition.</div>
      </div>`;
  }

  const assets        = Array.isArray(latest.assets) ? latest.assets : [];
  const m             = latest.metrics ?? {};
  const displayAssets = assets.slice(0, 20);
  const hiddenCount   = assets.length - displayAssets.length;

  const assetRows = displayAssets.map(a => `
    <div class="bhv-portfolio-asset">
      <span class="bhv-portfolio-symbol">${escHtml(a.symbol)}</span>
      <span class="bhv-portfolio-category">${escHtml(a.category)}</span>
      <span class="bhv-portfolio-qty">${escHtml(_fmtQty(a.netQuantity))}</span>
    </div>`).join('');

  const assetsBlock = assets.length === 0
    ? `<div class="bhv-portfolio-empty">Aucun actif exploitable détecté dans ce snapshot.</div>`
    : `<div class="bhv-portfolio-assets">
        <div class="bhv-portfolio-asset bhv-portfolio-asset--header">
          <span>Actif</span><span>Catégorie</span><span>Quantité nette</span>
        </div>
        ${assetRows}
        ${hiddenCount > 0 ? `<div class="bhv-portfolio-more">+ ${hiddenCount} actif${hiddenCount > 1 ? 's' : ''} masqué${hiddenCount > 1 ? 's' : ''}</div>` : ''}
      </div>`;

  const duplicateNotice = latest.duplicateWarning
    ? `<div class="bhv-portfolio-notice">Ce fichier semble avoir déjà été importé récemment. Le snapshot a été conservé.</div>`
    : '';

  return `
    <div class="bhv-card bhv-portfolio-card">
      <div class="bhv-card-head">
        <span class="bhv-card-title">Portefeuille</span>
      </div>
      ${duplicateNotice}
      <div class="bhv-portfolio-meta">
        <div class="bhv-summary-row"><span class="bhv-summary-label">Snapshot</span><span class="bhv-summary-val">${escHtml(_fmtDate(latest.createdAt))}</span></div>
        <div class="bhv-summary-row"><span class="bhv-summary-label">Fichier</span><span class="bhv-summary-val">${escHtml(latest.importRef?.fileName ?? '—')}</span></div>
        <div class="bhv-summary-row"><span class="bhv-summary-label">Actifs</span><span class="bhv-summary-val">${assets.length}</span></div>
        <div class="bhv-summary-row"><span class="bhv-summary-label">Opérations</span><span class="bhv-summary-val">${m.totalOperations ?? '—'}</span></div>
        <div class="bhv-summary-row"><span class="bhv-summary-label">Activité wallet</span><span class="bhv-summary-val">${escHtml(_fmtLevel(m.activityLevel))}</span></div>
        <div class="bhv-summary-row"><span class="bhv-summary-label">Intensité frais</span><span class="bhv-summary-val">${escHtml(_fmtLevel(m.feeIntensity))}</span></div>
      </div>
      ${assetsBlock}
    </div>`;
}

// ── Session snapshot ──────────────────────────────────────────────────────────

function buildSessionSnapshot(state) {
  const { score, patterns, coaching, importSummary, orderResult, trades } = state;
  const importType = orderResult ? 'order_history' : 'trades';
  return {
    schemaVersion:    1,
    computedAt:       new Date().toISOString(),
    importType,
    tradeCount:       Array.isArray(trades) ? trades.length : 0,
    analysisQuality:  behaviorRepo.get('analysisQuality') ?? null,
    score:            score?.score          ?? null,
    profile:          score?.profile?.key   ?? null,
    dominantRisk:     score?.dominantRisk   ?? null,
    patternsSummary:  (patterns || []).map(p => ({
      type:  p.type,
      label: p.label  ?? null,
      count: p.count  ?? null,
      cv:    p.cv     ?? null,
    })),
    coachingPriority: coaching?.priority    ?? null,
    pdfQuality:       importSummary?.pdfQuality ?? null,
    importSummary:    importSummary          ?? null,
    macroContext:     null,
    engineContext:    null,
  };
}

// ── Utility ───────────────────────────────────────────────────────────────────

function formatTags(tags) {
  const counts = new Map();
  const order  = [];
  for (const tag of tags) {
    if (!counts.has(tag)) { counts.set(tag, 0); order.push(tag); }
    counts.set(tag, counts.get(tag) + 1);
  }
  return order.map(tag => {
    const n = counts.get(tag);
    return n > 1 ? `${tag} ×${n}` : tag;
  }).join(', ');
}

function getDisciplineInsight(score) {
  if (score >= 70) return 'Tu contrôles ton exécution dans la majorité des cas.';
  if (score >= 40) return 'Tu alternes entre discipline et impulsivité.';
  return                  'Ton comportement est dominé par des réactions.';
}

function getDisciplineLabel(score) {
  if (score >= 70) return { label: 'Discipline solide', mod: 'solid' };
  if (score >= 40) return { label: 'Irrégulier',        mod: 'irregular' };
  return                  { label: 'Instable',           mod: 'unstable' };
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export { mount };
