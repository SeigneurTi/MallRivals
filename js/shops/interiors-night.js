// Intérieurs des deux boutiques les plus chères : casino et discothèque.
// Coordonnées normalisées : voir js/shops/geometry.js.
// drawOverPeople (facultatif) est dessiné par-dessus les clients : lumière tamisée, spots.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle, ellipse } = Game.draw;
  const { slot, checkerFloor } = Game.furniture;

  // ---------- Casino ----------

  const SLOT_MACHINE_U = [0.1, 0.3, 0.5, 0.7, 0.9];
  const ROULETTE = { u: 0.5, v: 0.64 };
  const SLOT_SYMBOLS = ['#e74c3c', '#f2c14e', '#47a36b', '#3d7dd8', '#ffffff'];
  // 4 joueurs autour de la table, tournés vers elle.
  const CASINO_TABLE_SLOTS = [
    slot(0.22, 0.64, 'sit', 1),
    slot(0.78, 0.64, 'sit', -1),
    slot(0.38, 0.86, 'sit', 1),
    slot(0.62, 0.86, 'sit', -1),
  ];

  // ---------- Discothèque ----------

  const DANCE_FLOOR = { left: 0.14, top: 0.3, columns: 6, rows: 4, tileU: 0.12, tileV: 0.15 };
  const DISCO_BALL = { u: 0.5, v: 0.2 };
  const DANCER_POSITIONS = [0.22, 0.4, 0.6, 0.78].flatMap(u => [slot(u, 0.48, 'dance'), slot(u, 0.76, 'dance')]);

  Object.assign(Game.interiors, {
    // 5 machines à sous (debout) et 4 places à la table de roulette (assis).
    casino: {
      activity: 'mix',
      slots: [...SLOT_MACHINE_U.map(u => slot(u, 0.4, 'play')), ...CASINO_TABLE_SLOTS],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#6b1f33', '#5a1a2a', 6);   // moquette bordeaux
        // Machines à sous le long du mur du fond.
        for (const u of SLOT_MACHINE_U) {
          rect(c, x(u - 0.075), y(0.03), w(0.15), h(0.25), '#c9a227');   // caisse dorée
          rect(c, x(u - 0.055), y(0.07), w(0.11), h(0.1), '#1b1b2a');    // écran éteint
          rect(c, x(u - 0.06), y(0.2), w(0.12), h(0.04), '#8c1c1c');     // plateau à jetons
          circle(c, x(u + 0.085), y(0.09), radius(0.025), '#e74c3c');    // levier
        }
        // Chaises de la table.
        for (const seat of CASINO_TABLE_SLOTS) {
          circle(c, x(seat.u), y(seat.v), radius(0.07), '#2b1b10');
        }
        // Table de roulette : bord en bois, tapis vert, jetons et cartes.
        ellipse(c, x(ROULETTE.u), y(ROULETTE.v), w(0.24), h(0.18), '#6b3a1e');
        ellipse(c, x(ROULETTE.u), y(ROULETTE.v), w(0.215), h(0.15), '#1f8a4c');
        for (const [u, v, color] of [[0.36, 0.6, '#e74c3c'], [0.37, 0.7, '#3d7dd8'], [0.64, 0.6, '#f2c14e'], [0.63, 0.7, '#ffffff']]) {
          circle(c, x(u), y(v), radius(0.03), color);                     // piles de jetons
        }
        rect(c, x(0.46), y(0.75), w(0.03), h(0.06), '#ffffff');           // cartes
        rect(c, x(0.51), y(0.75), w(0.03), h(0.06), '#ffffff');
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h, radius } = g;
        // Écrans des machines : les symboles défilent quand quelqu'un joue.
        SLOT_MACHINE_U.forEach((u, k) => {
          if (!lot.occupants[k]) {
            return;
          }
          for (let reel = 0; reel < 3; reel++) {
            const symbol = SLOT_SYMBOLS[Math.floor(time * 8 + k * 3 + reel * 7) % SLOT_SYMBOLS.length];
            rect(c, x(u - 0.045 + reel * 0.033), y(0.085), w(0.025), h(0.07), symbol);
          }
          // Lampe clignotante au sommet.
          circle(c, x(u), y(0.035), radius(0.025), Math.floor(time * 4 + k) % 2 ? '#fff3a0' : '#e74c3c');
        });
        // Roulette qui tourne au centre de la table.
        const centerX = x(ROULETTE.u);
        const centerY = y(ROULETTE.v);
        const wheelRadius = radius(0.1);
        const spin = time * 2.5;
        for (let k = 0; k < 10; k++) {
          c.fillStyle = k === 0 ? '#1f8a4c' : (k % 2 ? '#c0392b' : '#1b1b2a');
          c.beginPath();
          c.moveTo(centerX, centerY);
          c.arc(centerX, centerY, wheelRadius, spin + k * Math.PI / 5, spin + (k + 1) * Math.PI / 5);
          c.closePath();
          c.fill();
        }
        circle(c, centerX, centerY, wheelRadius * 0.35, '#c9a227');
        // La bille tourne dans l'autre sens.
        circle(c, centerX + Math.cos(-spin * 1.7) * wheelRadius * 0.8, centerY + Math.sin(-spin * 1.7) * wheelRadius * 0.8, radius(0.018), '#ffffff');
      },
    },

    // 8 danseurs sur la piste.
    discotheque: {
      activity: 'dance',
      slots: DANCER_POSITIONS,
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        rect(c, g.left, g.top, g.width, g.height, '#141020');
        // Cabine du DJ et ses platines.
        rect(c, x(0.33), y(0.03), w(0.34), h(0.13), '#3a2f55');
        circle(c, x(0.42), y(0.095), radius(0.04), '#111');
        circle(c, x(0.58), y(0.095), radius(0.04), '#111');
        // Enceintes dans les coins du fond.
        for (const u of [0.03, 0.88]) {
          rect(c, x(u), y(0.04), w(0.09), h(0.2), '#0b0910');
          circle(c, x(u + 0.045), y(0.1), radius(0.03), '#2a2438');
          circle(c, x(u + 0.045), y(0.18), radius(0.04), '#2a2438');
        }
        // Piste de danse (dalles éteintes, allumées par drawAnimated).
        const floor = DANCE_FLOOR;
        rect(c, x(floor.left - 0.01), y(floor.top - 0.02), w(floor.columns * floor.tileU + 0.02), h(floor.rows * floor.tileV + 0.04), '#0b0910');
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h } = g;
        // Dalles de la piste qui changent de couleur au rythme de la musique.
        const floor = DANCE_FLOOR;
        const beat = Math.floor(time * 2.5);
        for (let row = 0; row < floor.rows; row++) {
          for (let column = 0; column < floor.columns; column++) {
            const hue = ((column + row * 2 + beat) * 47) % 360;
            const isLit = (column + row + beat) % 3 !== 0;
            const tileColor = isLit ? `hsl(${hue},80%,45%)` : '#241c36';
            rect(c, x(floor.left + column * floor.tileU) + 0.6, y(floor.top + row * floor.tileV) + 0.6, w(floor.tileU) - 1.2, h(floor.tileV) - 1.2, tileColor);
          }
        }
      },
      drawOverPeople(g, lot, time) {
        const { c, x, y, radius } = g;
        // Lumière tamisée sur toute la salle.
        c.fillStyle = 'rgba(15,5,35,.38)';
        c.fillRect(g.left, g.top, g.width, g.height);
        // Spots colorés qui balaient la salle depuis la boule à facettes.
        const ballX = x(DISCO_BALL.u);
        const ballY = y(DISCO_BALL.v);
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 5; k++) {
          const angle = time * 0.9 + k * Math.PI * 2 / 5;
          const spotX = x(0.5 + Math.cos(angle) * 0.32);
          const spotY = y(0.58 + Math.sin(angle) * 0.25);
          c.fillStyle = `hsla(${(k * 72 + time * 40) % 360},90%,60%,.28)`;
          c.beginPath();
          c.ellipse(spotX, spotY, radius(0.12), radius(0.09), 0, 0, FULL_TURN);
          c.fill();
        }
        c.restore();
        // Fil et boule à facettes, avec des reflets qui scintillent.
        c.strokeStyle = '#555';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(ballX, y(0));
        c.lineTo(ballX, ballY);
        c.stroke();
        const ballRadius = radius(0.07);
        circle(c, ballX, ballY, ballRadius, '#c9ced6');
        c.save();
        c.beginPath();
        c.arc(ballX, ballY, ballRadius, 0, FULL_TURN);
        c.clip();
        const facet = ballRadius / 2.5;
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            const shine = Math.sin(time * 6 + i * 1.7 + j * 2.3);
            c.fillStyle = shine > 0.5 ? '#ffffff' : (shine > -0.3 ? '#9aa2ad' : '#6b7280');
            c.fillRect(ballX + i * facet - facet / 2 + 0.2, ballY + j * facet - facet / 2 + 0.2, facet - 0.4, facet - 0.4);
          }
        }
        c.restore();
      },
    },
  });
})();
