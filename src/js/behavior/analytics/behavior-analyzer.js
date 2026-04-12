// Analyse comparative de sessions comportementales.
//
// Réutilise strictement le pipeline existant : computeMetrics → detectPatterns → computeScore.
// N'ajoute aucune logique de calcul propre.
//
// Entrée  : sessions[] (issues de session-repo.getAll)
// Sortie  : { bestSession, worstSession, evolution, globalStats }

import { computeMetrics } from './metrics.js';
import { detectPatterns } from './patterns.js';
import { computeScore   } from './scoring.js';

function analyzeSessions(sessions) {
  if (!sessions || sessions.length === 0) return null;

  // Passer chaque session dans le pipeline — ignorer celles sans trades valides
  const scored = sessions
    .filter(s => Array.isArray(s.trades) && s.trades.length > 0)
    .map(s => {
      const metrics  = computeMetrics(s.trades);
      const patterns = detectPatterns(s.trades, metrics);
      const result   = computeScore(patterns, metrics);
      if (!result) return null;
      return {
        id:         s.id,
        name:       s.name,
        createdAt:  s.createdAt,
        score:      result.score,
        profile:    result.profile,
        tradeCount: s.trades.length,
      };
    })
    .filter(Boolean);

  if (scored.length === 0) return null;

  // Meilleure / pire session (par score)
  const byScore = [...scored].sort((a, b) => b.score - a.score);
  const best    = byScore[0];
  const worst   = byScore[byScore.length - 1];

  const bestSession  = { id: best.id,  name: best.name,  score: best.score,  tradeCount: best.tradeCount  };
  const worstSession = { id: worst.id, name: worst.name, score: worst.score, tradeCount: worst.tradeCount };

  // Évolution chronologique (pour lecture temporelle)
  const evolution = [...scored]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(s => ({ id: s.id, name: s.name, createdAt: s.createdAt, score: s.score, profile: s.profile }));

  // Stats globales
  const avgScore    = Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length);
  const totalTrades = scored.reduce((sum, s) => sum + s.tradeCount, 0);

  return {
    bestSession,
    worstSession,
    evolution,
    globalStats: { avgScore, totalTrades, sessionsCount: scored.length },
  };
}

export { analyzeSessions };
