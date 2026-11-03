// Intérieurs des commerces où l'on flâne : fleuriste, kiosque, boulangerie, librairie,
// pharmacie, jouets, vêtements, bijouterie.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle, ellipse } = Game.draw;
  const { MAGAZINE_COLORS, slot, checkerFloor, plankFloor, horizontalShelf, verticalShelf } = Game.furniture;

  Object.assign(Game.interiors, {
    fleuriste: {
      activity: 'browse',
      slots: [slot(0.22, 0.45), slot(0.45, 0.45), slot(0.7, 0.45), slot(0.2, 0.75)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#eef5e6', '#e1ecd6', 7);
        // Six pots de fleurs le long du mur du fond.
        for (let k = 0; k < 6; k++) {
          const u = 0.09 + k * 0.164;
          circle(c, x(u), y(0.17), radius(0.11), '#a0673c');
          circle(c, x(u), y(0.17), radius(0.085), '#4d9b42');
          for (let q = 0; q < 3; q++) {
            const petalColor = ['#e8578f', '#f2c14e', '#ffffff', '#9a6fd6'][(q + k) % 4];
            circle(c, x(u) + Math.cos(q * 2.1 + k) * radius(0.04), y(0.17) + Math.sin(q * 2.1 + k) * radius(0.04), radius(0.03), petalColor);
          }
        }
        // Deux seaux de fleurs contre le mur gauche.
        for (const v of [0.45, 0.7]) {
          circle(c, x(0.05), y(v), radius(0.06), '#7aa0c8');
          circle(c, x(0.05), y(v), radius(0.04), '#ef7fb0');
        }
        rect(c, x(0.72), y(0.62), w(0.24), h(0.13), '#c9a27a');   // comptoir
      },
    },

    kiosque: {
      activity: 'browse',
      slots: [slot(0.22, 0.42), slot(0.5, 0.42), slot(0.82, 0.42)],
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        checkerFloor(g, '#ece6d9', '#e2dbcb', 7);
        horizontalShelf(c, x(0.03), y(0.05), w(0.94), h(0.17), MAGAZINE_COLORS);
        verticalShelf(c, x(0.03), y(0.35), w(0.06), h(0.42), MAGAZINE_COLORS);
        // Comptoir et journaux du jour.
        rect(c, x(0.7), y(0.58), w(0.26), h(0.14), '#3d6fb6');
        for (let k = 0; k < 3; k++) {
          rect(c, x(0.73 + k * 0.075), y(0.6), w(0.055), h(0.1), MAGAZINE_COLORS[k]);
        }
      },
    },

    boulangerie: {
      activity: 'browse',
      slots: [slot(0.2, 0.45), slot(0.4, 0.45), slot(0.6, 0.45), slot(0.8, 0.45)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#f6ead7', '#ead8bc', 7);
        // Vitrine réfrigérée et ses pains.
        rect(c, x(0.04), y(0.05), w(0.92), h(0.22), '#c08a4e');
        rect(c, x(0.06), y(0.07), w(0.88), h(0.16), 'rgba(210,240,255,.7)');
        for (let k = 0; k < 8; k++) {
          ellipse(c, x(0.1 + k * 0.115), y(0.15), radius(0.06), radius(0.04), k % 2 ? '#d99a4a' : '#b8742f');
        }
        verticalShelf(c, x(0.02), y(0.4), w(0.05), h(0.4), ['#e0a85a', '#d48a2c']);
      },
    },

    librairie: {
      activity: 'browse',
      slots: [slot(0.25, 0.36), slot(0.5, 0.36), slot(0.75, 0.36), slot(0.18, 0.68)],
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        plankFloor(g, '#c9a27a', '#b88f66');
        horizontalShelf(c, x(0.03), y(0.04), w(0.94), h(0.14), MAGAZINE_COLORS);
        verticalShelf(c, x(0.02), y(0.25), w(0.06), h(0.5), MAGAZINE_COLORS);
        verticalShelf(c, x(0.92), y(0.25), w(0.06), h(0.5), MAGAZINE_COLORS.slice().reverse());
        ellipse(c, x(0.55), y(0.62), w(0.16), h(0.12), '#a3473a');   // tapis
        rect(c, x(0.72), y(0.55), w(0.1), h(0.16), '#2f7d6d');       // fauteuil de lecture
      },
    },

    pharmacie: {
      activity: 'browse',
      slots: [slot(0.5, 0.4), slot(0.2, 0.55), slot(0.8, 0.55)],
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        checkerFloor(g, '#f4f7f4', '#e6eee6', 7);
        const boxColors = ['#ffffff', '#27a35a', '#bfe3f2', '#f2c14e'];
        verticalShelf(c, x(0.02), y(0.06), w(0.07), h(0.72), boxColors);
        verticalShelf(c, x(0.91), y(0.06), w(0.07), h(0.72), boxColors);
        // Comptoir et croix verte.
        rect(c, x(0.3), y(0.05), w(0.4), h(0.16), '#27a35a');
        rect(c, x(0.485), y(0.07), w(0.03), h(0.12), '#fff');
        rect(c, x(0.465), y(0.11), w(0.07), h(0.04), '#fff');
      },
    },

    jouets: {
      activity: 'browse',
      slots: [slot(0.2, 0.38), slot(0.4, 0.38), slot(0.6, 0.38), slot(0.8, 0.38), slot(0.3, 0.72)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        rect(c, g.left, g.top, g.width, g.height, '#e3eefb');
        // Confettis sur le sol (positions pseudo-aléatoires mais fixes).
        for (let k = 0; k < 14; k++) {
          circle(c, x((k * 37 % 100) / 100), y((k * 53 % 100) / 100), radius(0.03), MAGAZINE_COLORS[k % 5] + '55');
        }
        horizontalShelf(c, x(0.03), y(0.04), w(0.94), h(0.15), ['#e74c3c', '#f2c14e', '#3d7dd8', '#47a36b', '#9a5fd1']);
        // Circuit de train et sa locomotive.
        c.strokeStyle = '#8b6440';
        c.lineWidth = radius(0.03);
        c.beginPath();
        c.ellipse(x(0.62), y(0.68), w(0.14), h(0.1), 0, 0, FULL_TURN);
        c.stroke();
        rect(c, x(0.5), y(0.63), w(0.05), h(0.06), '#3d7dd8');
        // Ballon rouge et ours en peluche.
        circle(c, x(0.08), y(0.5), radius(0.07), '#e74c3c');
        circle(c, x(0.92), y(0.5), radius(0.07), '#a0673c');
        circle(c, x(0.89), y(0.43), radius(0.03), '#a0673c');
        circle(c, x(0.95), y(0.43), radius(0.03), '#a0673c');
      },
    },

    vetements: {
      activity: 'browse',
      slots: [slot(0.15, 0.44), slot(0.35, 0.44), slot(0.55, 0.44), slot(0.78, 0.5), slot(0.3, 0.74)],
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        plankFloor(g, '#efe7da', '#e2d7c6');
        const clothColors = ['#2b8fbd', '#e85d4a', '#f2b134', '#47a36b', '#ffffff', '#9a5fd1', '#3b4a6b'];
        // Deux portants chargés de vêtements.
        for (const v of [0.24, 0.6]) {
          c.strokeStyle = '#888';
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(x(0.05), y(v));
          c.lineTo(x(0.64), y(v));
          c.stroke();
          for (let k = 0; k < 9; k++) {
            rect(c, x(0.07 + k * 0.064), y(v) - h(0.07), w(0.045), h(0.14), clothColors[(k + Math.round(v * 10)) % 7]);
          }
        }
        // Deux cabines d'essayage.
        for (const u of [0.71, 0.85]) {
          rect(c, x(u), y(0.04), w(0.12), h(0.3), '#2b8fbd');
          rect(c, x(u), y(0.04), w(0.025), h(0.3), '#1d6a8e');
        }
      },
    },

    bijouterie: {
      activity: 'browse',
      slots: [slot(0.25, 0.38), slot(0.75, 0.38), slot(0.22, 0.7), slot(0.78, 0.7)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#f4efe4', '#ebe3d2', 6);
        // Vitrine du fond et ses bijoux.
        rect(c, x(0.04), y(0.05), w(0.92), h(0.16), '#cfeef3');
        for (let k = 0; k < 8; k++) {
          circle(c, x(0.09 + k * 0.117), y(0.13), radius(0.03), k % 2 ? '#f2c14e' : '#2aa7b8');
        }
        // Vitrines latérales et présentoir central.
        rect(c, x(0.02), y(0.3), w(0.06), h(0.5), '#cfeef3');
        rect(c, x(0.92), y(0.3), w(0.06), h(0.5), '#cfeef3');
        circle(c, x(0.5), y(0.52), radius(0.14), '#cfeef3');
        circle(c, x(0.5), y(0.52), radius(0.05), '#f2c14e');
      },
    },
  });
})();
