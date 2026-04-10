export const MARKET_DICTIONARY = {

  range: {
    label: "Range",
    journal: {
      main: "Le prix ne va nulle part.",
      sub: "Aucun biais. Rien à trader."
    },
    mantra: "Pas de signal. Pas de trade.",
    signal: {
      main: "Aucun signal",
      sub: "Du bruit."
    },
    decision: {
      centrale: "Pas de signal — pas de position",
      raison: "Du bruit. Tu paies."
    },
    posture: "Zéro initiative",
    actions: {
      autorisees: [
        "Observer",
        "Attendre la sortie",
        "Couper si exposé"
      ],
      interdites: [
        "Anticiper",
        "Forcer une entrée",
        "Entrer sans signal"
      ]
    },
    risque: "Drawdown inutile",
    validation: "Sortie de structure confirmée"
  },

  compression: {
    label: "Compression",
    journal: {
      main: "Le marché se tasse.",
      sub: "La direction est inconnue. L'entrée n'existe pas."
    },
    mantra: "Pas de cassure. Pas d'entrée.",
    signal: {
      main: "Pas de signal",
      sub: "Pas de cassure."
    },
    decision: {
      centrale: "Pas de cassure — pas d'entrée",
      raison: "Aucun edge. Juste du risque."
    },
    posture: "Prêt. Pas actif.",
    actions: {
      autorisees: [
        "Identifier les niveaux",
        "Préparer le plan",
        "Attendre"
      ],
      interdites: [
        "Anticiper",
        "Deviner la direction",
        "Forcer"
      ]
    },
    risque: "Tu finances l'incertitude",
    validation: "Cassure nette + clôture confirmée"
  },

  expansion: {
    label: "Tendance",
    journal: {
      main: "Le mouvement est en cours.",
      sub: "Précis ou dehors."
    },
    mantra: "Pas propre. Pas d'entrée.",
    signal: {
      main: "Signal actif",
      sub: "S'aligner proprement ou rester dehors."
    },
    decision: {
      centrale: "Pas de retracement propre — pas d'entrée",
      raison: "Tu poursuis. Tu paies."
    },
    posture: "Sélectif ou dehors",
    actions: {
      autorisees: [
        "Entrer sur retracement validé",
        "Déplacer le stop sur extension",
        "Réduire si le mouvement s'étire"
      ],
      interdites: [
        "Poursuivre le prix",
        "Ignorer le stop",
        "Sur-exposer"
      ]
    },
    risque: "Tu achètes le sommet",
    validation: "Retracement sur zone clé + structure tenue"
  },

  breakout: {
    label: "Breakout",
    journal: {
      main: "Le prix franchit une zone.",
      sub: "La cassure est visible. Le piège aussi."
    },
    mantra: "Ce que tout le monde voit est souvent un piège.",
    signal: {
      main: "Cassure en cours",
      sub: "Attends le retest."
    },
    decision: {
      centrale: "Pas de retest — pas d'entrée",
      raison: "Pas de retest. Tu paies."
    },
    posture: "Alerte. Pas d'action.",
    actions: {
      autorisees: [
        "Attendre la clôture confirmée",
        "Entrer sur le retest tenu",
        "Taille réduite"
      ],
      interdites: [
        "Entrer sur la mèche",
        "Ignorer un rejet",
        "Forcer l'entrée"
      ]
    },
    risque: "La sortie sera pire que l'entrée",
    validation: "Clôture confirmée + retest tenu"
  },

  defense: {
    label: "Mode défensif",
    journal: {
      main: "Les conditions ne permettent pas d'agir.",
      sub: "Agir ici coûte plus qu'attendre."
    },
    mantra: "Ne pas perdre est une performance.",
    signal: {
      main: "Signal de risque",
      sub: "Aucune entrée ici."
    },
    decision: {
      centrale: "Risque présent — réduction immédiate",
      raison: "Exposé ici. Tu perds."
    },
    posture: "Capital d'abord. Rien d'autre.",
    actions: {
      autorisees: [
        "Réduire ou fermer",
        "Déplacer les stops au coût",
        "Attendre"
      ],
      interdites: [
        "Ouvrir une position",
        "Moyenner",
        "Ignorer"
      ]
    },
    risque: "Tu le vois venir. Agis.",
    validation: "Bloquée — stabilité requise"
  },

  riskoff: {
    label: "Risk-off",
    journal: {
      main: "Le marché fuit le risque.",
      sub: "Les règles ne s'appliquent plus."
    },
    mantra: "Avoir raison ne suffit pas.",
    signal: {
      main: "Aversion généralisée",
      sub: "Aucun trade ne vaut ce contexte."
    },
    decision: {
      centrale: "Contexte instable — hors marché",
      raison: "Plus d'edge. Chaque position est un pari."
    },
    posture: "Cash. Rien d'autre.",
    actions: {
      autorisees: [
        "Fermer les positions",
        "Attendre la stabilisation",
        "Observer"
      ],
      interdites: [
        "Entrer long",
        "Trader contre le flux",
        "Croire qu'un niveau tient"
      ]
    },
    risque: "Tu peux perdre plus que prévu",
    validation: "Bloquée — stabilisation macro confirmée"
  },

  instable: {
    label: "Instable",
    journal: {
      main: "Aucune lecture fiable.",
      sub: "Agir ici = parier."
    },
    mantra: "Pas de structure. Pas de trade.",
    signal: {
      main: "Aucun signal",
      sub: "Ce n'est pas un marché."
    },
    decision: {
      centrale: "Pas de structure — pas de trade",
      raison: "Tu inventes un signal. L'erreur est déjà là."
    },
    posture: "Observation uniquement",
    actions: {
      autorisees: [
        "Attendre un contexte lisible",
        "Couper l'exposition",
        "Ne rien faire"
      ],
      interdites: [
        "Entrer sans structure",
        "Interpréter le chaos",
        "Compenser une perte"
      ]
    },
    risque: "Tu perds. Et tu le savais.",
    validation: "Bloquée — structure lisible requise"
  }

};
