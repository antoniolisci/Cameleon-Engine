export const OVERTRADING_DICT = {
  1: {
    niveau: 1,
    etat: "Calme",
    lecture: "Le marché est neutre, aucune pression",
    comportement: "Tu observes sans chercher à agir",
    risque: "Aucun",
    signal: "Pas d’impulsion",
    action: [
      "Ne rien faire",
      "Laisser le marché respirer",
      "Préparer des zones"
    ],
    interdit: [
      "Entrée impulsive",
      "Forcer un trade"
    ],
    imageChameleon: "../assets/images/overtrading/niveau_1_chameleon.jpg",
    imageTrading: "../assets/images/overtrading/niveau_1_trading.jpg",
    message: "Tu observes. Tu n’agis pas."
  },

  2: {
    niveau: 2,
    etat: "Veille active",
    lecture: "Le marché attire ton attention",
    comportement: "Tu scans le marché avec une légère tension",
    risque: "FOMO latent",
    signal: "Attention orientée",
    action: [
      "Attendre confirmation",
      "Poser des scénarios",
      "Ne pas entrer sans signal clair"
    ],
    reaction: [
      "Ralentir",
      "Revenir à l’observation",
      "Ne pas anticiper"
    ],
    interdit: [
      "Anticiper sans validation",
      "Multiplier les setups"
    ],
    imageChameleon: "../assets/images/overtrading/niveau_2_chameleon.jpg",
    imageTrading: "../assets/images/overtrading/niveau_2_trading.jpg",
    message: "Tu commences à chercher une opportunité."
  },

  3: {
    niveau: 3,
    etat: "Fixation",
    lecture: "Tu interprètes le marché de manière biaisée",
    comportement: "Tu te focalises sur un seul scénario",
    risque: "Perte d’objectivité",
    signal: "Vision biaisée",
    action: [
      "Recul immédiat",
      "Sortir de l’écran",
      "Réévaluer à froid"
    ],
    reaction: [
      "Stop analyse en boucle",
      "Changer de contexte",
      "Respirer et couper l’impulsion"
    ],
    interdit: [
      "Entrer en position",
      "Ajuster en boucle",
      "Sur-analyser"
    ],
    imageChameleon: "../assets/images/overtrading/niveau_3_chameleon.jpg",
    imageTrading: "../assets/images/overtrading/niveau_3_trading.jpg",
    message: "Tu n’analyses plus. Tu fixes."
  },

  4: {
    niveau: 4,
    etat: "Sur-engagement",
    lecture: "Le marché devient un terrain de forçage",
    comportement: "Tu veux absolument trader",
    risque: "Overtrading",
    signal: "Accélération des décisions",
    action: [
      "Réduire taille de position",
      "Stop trading temporaire",
      "Bloquer nouvelles entrées"
    ],
    reaction: [
      "Réduire exposition immédiatement",
      "Couper toute nouvelle prise de position",
      "S’éloigner physiquement de l’écran"
    ],
    interdit: [
      "Ajouter du risque",
      "Entrer sans setup",
      "Revenge trade"
    ],
    imageChameleon: "../assets/images/overtrading/niveau_4_chameleon.jpg",
    imageTrading: "../assets/images/overtrading/niveau_4_trading.jpg",
    message: "Tu forces le marché."
  },

  5: {
    niveau: 5,
    etat: "Rupture",
    lecture: "Le marché devient incontrôlable pour toi",
    comportement: "Tu trades sans lucidité",
    risque: "Destruction du capital",
    signal: "Décisions irrationnelles",
    action: [
      "STOP TOTAL",
      "Fermer la plateforme",
      "Sortir complètement du marché"
    ],
    reaction: [
      "Fermer immédiatement toutes les positions non maîtrisées",
      "Couper l’accès au trading",
      "Revenir uniquement après stabilisation mentale"
    ],
    interdit: [
      "Toute prise de position",
      "Toute décision financière",
      "Continuer à trader"
    ],
    imageChameleon: "../assets/images/overtrading/niveau_5_chameleon.jpg",
    imageTrading: "../assets/images/overtrading/niveau_5_trading.jpg",
    message: "Tu n’es plus en contrôle."
  }
};
