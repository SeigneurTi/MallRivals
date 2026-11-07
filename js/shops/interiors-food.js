// Intérieurs où l'on s'attable : café, glacier, pizzeria, burger, restaurant.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { rect, circle } = Game.draw;
  const { slot, seatPairs, chairAround, checkerFloor, plankFloor } = Game.furniture;

  // Tables rondes avec une chaise de chaque côté (et une assiette si plateColor est donné).
  function roundTables(g, tableUs, v, chairColor, tableColor, plateColor) {
    const { c, x, y, radius } = g;
    for (const u of tableUs) {
      for (const offset of [-0.1, 0.1]) {
        circle(c, x(u + offset), y(v), radius(0.07), chairColor);
      }
      circle(c, x(u), y(v), radius(0.1), tableColor);
      if (plateColor) {
        circle(c, x(u), y(v), radius(0.045), plateColor);
      }
    }
  }

  // Café : 3 tables disposées librement, chacune avec 2 chaises placées à des angles différents
  // (angles en degrés : 0 à droite, 90 côté porte, 180 à gauche, 270 côté fond).
  const CAFE_TABLES = [
    { u: 0.2, v: 0.5, chairAngles: [200, 75] },
    { u: 0.5, v: 0.66, chairAngles: [150, 15] },
    { u: 0.8, v: 0.45, chairAngles: [250, 35] },
  ];
  const CAFE_CHAIR_DISTANCE = 0.17;
  const CAFE_SLOTS = CAFE_TABLES.flatMap(table => table.chairAngles.map(angle => chairAround(table, angle, CAFE_CHAIR_DISTANCE)));

  Object.assign(Game.interiors, {
    // 3 tables de 2 places.
    cafe: {
      seller: { u: 0.3, v: 0.17, behindCounter: true },   // vendeur (décor)
      activity: 'sit',
      slots: CAFE_SLOTS,
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        plankFloor(g, '#b98a5e', '#a57850');
        // Comptoir, machine à café, deux tasses.
        rect(c, x(0.03), y(0.05), w(0.5), h(0.16), '#5a3a22');
        rect(c, x(0.06), y(0.07), w(0.08), h(0.11), '#c0c0c0');
        circle(c, x(0.22), y(0.13), radius(0.03), '#fff');
        circle(c, x(0.3), y(0.13), radius(0.03), '#fff');
        circle(c, x(0.92), y(0.14), radius(0.08), '#4d9b42');   // plante
        // Chaque table avec ses chaises (les chaises sont exactement les places des clients).
        CAFE_TABLES.forEach((table, tableIndex) => {
          for (const chair of CAFE_SLOTS.slice(tableIndex * 2, tableIndex * 2 + 2)) {
            circle(c, x(chair.u), y(chair.v), radius(0.07), '#7a4a2a');
          }
          circle(c, x(table.u), y(table.v), radius(0.1), '#f4efe6');
        });
      },
    },

    // 2 tables de 2 places.
    glacier: {
      seller: { u: 0.5, v: 0.2, behindCounter: true },   // vendeur (décor)
      activity: 'sit',
      slots: seatPairs([0.27, 0.73], 0.62, 0.1),
      // On repart avec un cornet de 1 à 3 boules de parfums différents.
      souvenir: () => {
        const flavours = ['#f7b2c4', '#fff1c1', '#a0673c', '#b8e0d2', '#f2c14e', '#c9b6f2', '#ef7fb0'];
        const scoopCount = 1 + Math.floor(Math.random() * 3);
        return { kind: 'icecream', scoops: Game.utils.shuffled(flavours).slice(0, scoopCount) };
      },
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        checkerFloor(g, '#ffffff', '#ffe0ea', 7);
        // Vitrine et bacs de glace.
        rect(c, x(0.04), y(0.05), w(0.92), h(0.2), '#cfe8f5');
        ['#f7b2c4', '#fff1c1', '#a0673c', '#b8e0d2', '#f2c14e', '#c9b6f2', '#ef7fb0'].forEach((flavourColor, k) => {
          rect(c, x(0.07 + k * 0.125), y(0.08), w(0.1), h(0.13), flavourColor);
        });
        roundTables(g, [0.27, 0.73], 0.62, '#ffffff', '#f07fa8');
      },
    },

    // 3 tables de 2 places.
    pizzeria: {
      seller: { u: 0.6, v: 0.2, behindCounter: true },   // vendeur (décor)
      activity: 'sit',
      slots: seatPairs([0.2, 0.5, 0.8], 0.64, 0.1),
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#f1e3cf', '#e3cfb3', 7);
        // Four à bois allumé.
        circle(c, x(0.12), y(0.2), radius(0.17), '#8c3b2a');
        circle(c, x(0.12), y(0.2), radius(0.09), '#ff9a3c');
        circle(c, x(0.12), y(0.2), radius(0.045), '#ffd27a');
        rect(c, x(0.3), y(0.05), w(0.66), h(0.15), '#c8402f');   // comptoir
        roundTables(g, [0.2, 0.5, 0.8], 0.64, '#8b5e3c', '#e74c3c', '#ffffff');
      },
    },

    // 3 tables de 2 places, avec banquettes.
    burger: {
      seller: { u: 0.5, v: 0.2, behindCounter: true },   // vendeur (décor)
      activity: 'sit',
      slots: seatPairs([0.2, 0.5, 0.8], 0.55, 0.11),
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        checkerFloor(g, '#ffffff', '#f6d5c8', 7);
        // Comptoir et plateaux.
        rect(c, x(0.03), y(0.05), w(0.94), h(0.16), '#e2552a');
        for (let k = 0; k < 5; k++) {
          rect(c, x(0.08 + k * 0.18), y(0.08), w(0.12), h(0.08), '#f2c14e');
        }
        // Box : deux banquettes rouges autour d'une table jaune.
        for (const u of [0.2, 0.5, 0.8]) {
          rect(c, x(u - 0.15), y(0.43), w(0.05), h(0.25), '#c0392b');
          rect(c, x(u + 0.1), y(0.43), w(0.05), h(0.25), '#c0392b');
          rect(c, x(u - 0.06), y(0.46), w(0.12), h(0.19), '#f2c14e');
        }
      },
    },

    // 4 tables de 2 places (une chaise côté fond, une côté porte).
    restaurant: {
      seller: { u: 0.5, v: 0.47, behindCounter: false },   // vendeur (décor)
      activity: 'sit',
      slots: [0.14, 0.38, 0.62, 0.86].flatMap(u => [slot(u, 0.25), slot(u, 0.68)]),
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#8a3a48', '#7d2a3a', 6);
        for (const u of [0.14, 0.38, 0.62, 0.86]) {
          circle(c, x(u), y(0.25), radius(0.07), '#3a2a1a');
          circle(c, x(u), y(0.68), radius(0.07), '#3a2a1a');
          rect(c, x(u - 0.08), y(0.35), w(0.16), h(0.22), '#ffffff');   // nappe
          circle(c, x(u), y(0.46), radius(0.035), '#f2c14e');           // bougie
        }
      },
    },
  });
})();
