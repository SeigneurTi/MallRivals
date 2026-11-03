// Intérieur de la banque : salle des guichets et coffre-fort rempli de lingots.
// La banque n'a pas de clients (aucune place) ; son or se pille à la voiture-voleur.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle } = Game.draw;
  const { checkerFloor } = Game.furniture;

  const GOLD_BAR_COUNT = 10;   // lingots visibles quand le coffre est plein (2 rangées de 5)

  Object.assign(Game.interiors, {
    banque: {
      activity: 'none',
      slots: [],
      createState(lot) {
        lot.bank = { gold: 1 };   // de 0 (vide) à 1 (plein)
      },
      update(lot, dt) {
        lot.bank.gold = Math.min(1, lot.bank.gold + dt / Game.config.bank.REFILL_SECONDS);
      },
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#e8e4dc', '#d9d3c7', 6);   // marbre
        // Coffre-fort au fond : cadre d'acier et porte ronde ouverte sur le côté.
        rect(c, x(0.28), y(0.03), w(0.44), h(0.42), '#6b7280');
        rect(c, x(0.3), y(0.06), w(0.4), h(0.36), '#2f343d');
        circle(c, x(0.8), y(0.24), radius(0.17), '#9aa2ad');
        circle(c, x(0.8), y(0.24), radius(0.12), '#6b7280');
        c.strokeStyle = '#cfd3da';
        c.lineWidth = radius(0.025);
        c.beginPath();
        for (let k = 0; k < 3; k++) {
          const angle = k * Math.PI * 2 / 3;
          c.moveTo(x(0.8), y(0.24));
          c.lineTo(x(0.8) + Math.cos(angle) * radius(0.1), y(0.24) + Math.sin(angle) * radius(0.1));
        }
        c.stroke();
        // Colonnes de marbre.
        for (const u of [0.1, 0.18]) {
          circle(c, x(u), y(0.22), radius(0.06), '#cfcac0');
        }
        // Guichets : comptoir en bois et vitres.
        rect(c, x(0.05), y(0.6), w(0.9), h(0.09), '#8b6440');
        for (const u of [0.2, 0.5, 0.8]) {
          rect(c, x(u - 0.08), y(0.55), w(0.16), h(0.05), 'rgba(190,225,240,.8)');
        }
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h } = g;
        const visibleBars = Math.round(lot.bank.gold * GOLD_BAR_COUNT);
        for (let k = 0; k < visibleBars; k++) {
          const column = k % 5;
          const row = Math.floor(k / 5);
          const barX = x(0.325 + column * 0.074);
          const barY = y(0.33 - row * 0.1);
          // Lingot avec un liseré et un reflet (symétrique : même aspect si la salle est retournée).
          rect(c, barX, barY, w(0.06), h(0.07), '#b8860b');
          rect(c, barX + w(0.006), barY + h(0.01), w(0.048), h(0.05), '#f2c14e');
          rect(c, barX + w(0.015), barY + h(0.028), w(0.03), h(0.014), '#fff3a0');
        }
        // Coffre plein : l'or scintille.
        if (lot.bank.gold >= 1) {
          const sparkle = Math.floor(time * 3) % GOLD_BAR_COUNT;
          const column = sparkle % 5;
          const row = Math.floor(sparkle / 5);
          c.fillStyle = 'rgba(255,255,255,.9)';
          c.beginPath();
          c.arc(x(0.35 + column * 0.074), y(0.34 - row * 0.1), 1.3 + Math.sin(time * 10), 0, FULL_TURN);
          c.fill();
        }
      },
    },
  });
})();
