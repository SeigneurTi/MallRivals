// Intérieurs des commerces où l'on flâne : fleuriste, kiosque, boulangerie, librairie,
// pharmacie, jouets, vêtements, bijouterie (vitrines et bijoux qui scintillent).
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle, ellipse } = Game.draw;
  const { MAGAZINE_COLORS, slot, checkerFloor, plankFloor, horizontalShelf, verticalShelf } = Game.furniture;

  const FLOWER_COLORS = ['#e8578f', '#f2c14e', '#ffffff', '#9a6fd6', '#ff7a45', '#e74c3c', '#7fc8f8'];

  // Bouquet vu de dessus : feuillage, 5 fleurs autour et une au centre.
  // colorIndex décale les couleurs pour que deux bouquets voisins ne se ressemblent pas.
  function flowerCluster(c, x, y, size, colorIndex) {
    circle(c, x, y, size, '#4d9b42');
    for (let k = 0; k < 5; k++) {
      const angle = k * Math.PI * 2 / 5 + colorIndex;
      const bloomX = x + Math.cos(angle) * size * 0.55;
      const bloomY = y + Math.sin(angle) * size * 0.55;
      circle(c, bloomX, bloomY, size * 0.34, FLOWER_COLORS[(colorIndex + k) % FLOWER_COLORS.length]);
      circle(c, bloomX, bloomY, size * 0.12, '#f2c14e');
    }
    circle(c, x, y, size * 0.3, FLOWER_COLORS[(colorIndex + 3) % FLOWER_COLORS.length]);
  }

  // Bijouterie : couleurs des pierres et des écrins, et points qui scintillent.
  const JEWEL_COLORS = ['#e8f6ff', '#d62848', '#2a9d8f', '#3d5bd8', '#9a4fd6'];
  const JEWEL_BOX_COLORS = ['#2aa7b8', '#d62848', '#1f2a44'];
  const SPARKLES = [[0.5, 0.49], [0.1, 0.085], [0.32, 0.085], [0.21, 0.465], [0.71, 0.465], [0.94, 0.6], [0.06, 0.6], [0.6, 0.11]];

  // Vitrine vue de dessus : cadre doré, velours bleu nuit, reflet du verre.
  function glassCase(g, u, v, width, height) {
    const { c, x, y, w, h } = g;
    rect(c, x(u), y(v), w(width), h(height), '#c9a23a');
    rect(c, x(u + 0.006), y(v + 0.01), w(width - 0.012), h(height - 0.02), '#1f2a44');
    c.fillStyle = 'rgba(255,255,255,.14)';
    c.beginPath();
    c.moveTo(x(u + 0.006), y(v + height - 0.01));
    c.lineTo(x(u + width * 0.35), y(v + 0.01));
    c.lineTo(x(u + width * 0.5), y(v + 0.01));
    c.lineTo(x(u + width * 0.15), y(v + height - 0.01));
    c.closePath();
    c.fill();
  }

  // Bague : anneau doré et sa pierre.
  function ring(g, u, v, stoneColor) {
    const { c, x, y, radius } = g;
    c.strokeStyle = '#f2c14e';
    c.lineWidth = radius(0.008);
    c.beginPath();
    c.arc(x(u), y(v), radius(0.017), 0, FULL_TURN);
    c.stroke();
    circle(c, x(u), y(v) - radius(0.017), radius(0.01), stoneColor);
  }

  // Collier posé en arc, avec un pendentif.
  function necklace(g, u, v, halfWidth, chainColor, pendantColor) {
    const { c, x, y, w, radius } = g;
    c.strokeStyle = chainColor;
    c.lineWidth = radius(0.008);
    c.beginPath();
    c.ellipse(x(u), y(v), w(halfWidth), radius(0.045), 0, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();
    circle(c, x(u), y(v) + radius(0.047), radius(0.013), pendantColor);
  }

  function bracelet(g, u, v, color) {
    const { c, x, y, radius } = g;
    c.strokeStyle = color;
    c.lineWidth = radius(0.01);
    c.beginPath();
    c.ellipse(x(u), y(v), radius(0.03), radius(0.02), 0, 0, FULL_TURN);
    c.stroke();
  }

  // Montre : bracelet, boîtier et cadran.
  function watch(g, u, v) {
    const { c, x, y, radius } = g;
    rect(c, x(u) - radius(0.008), y(v) - radius(0.04), radius(0.016), radius(0.08), '#6b4a2a');
    circle(c, x(u), y(v), radius(0.022), '#d9d9e0');
    circle(c, x(u), y(v), radius(0.016), '#ffffff');
  }

  // Diamant taillé : couronne et pointe.
  function diamondShape(c, centerX, centerY, size) {
    c.fillStyle = '#e8f6ff';
    c.beginPath();
    c.moveTo(centerX - size, centerY - size * 0.3);
    c.lineTo(centerX - size * 0.5, centerY - size * 0.8);
    c.lineTo(centerX + size * 0.5, centerY - size * 0.8);
    c.lineTo(centerX + size, centerY - size * 0.3);
    c.lineTo(centerX, centerY + size);
    c.closePath();
    c.fill();
    c.strokeStyle = '#7fc8f8';
    c.lineWidth = size * 0.12;
    c.stroke();
  }

  // Éclat de lumière en étoile à quatre branches.
  function sparkle(c, centerX, centerY, size) {
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.moveTo(centerX, centerY - size);
    c.lineTo(centerX + size * 0.25, centerY - size * 0.25);
    c.lineTo(centerX + size, centerY);
    c.lineTo(centerX + size * 0.25, centerY + size * 0.25);
    c.lineTo(centerX, centerY + size);
    c.lineTo(centerX - size * 0.25, centerY + size * 0.25);
    c.lineTo(centerX - size, centerY);
    c.lineTo(centerX - size * 0.25, centerY - size * 0.25);
    c.closePath();
    c.fill();
  }

  // Pharmacie : boîtes de médicaments, et les deux rayons du milieu (u, v, largeur, hauteur).
  const PHARMACY_BOX_COLORS = ['#ffffff', '#27a35a', '#bfe3f2', '#f2c14e', '#f4a3b8'];
  const PHARMACY_AISLES = [
    { u: 0.26, v: 0.32, width: 0.13, height: 0.36 },
    { u: 0.61, v: 0.32, width: 0.13, height: 0.36 },
  ];

  // Rectangle de l'intérieur (u, v, largeur, hauteur) en coordonnées du plateau (obstacles).
  function boardRect(lot, u, v, width, height) {
    const { lotPointToBoard } = Game.shopGeometry;
    const [x1, y1] = lotPointToBoard(lot, u, v);
    const [x2, y2] = lotPointToBoard(lot, u + width, v + height);
    return { left: Math.min(x1, x2), top: Math.min(y1, y2), right: Math.max(x1, x2), bottom: Math.max(y1, y2) };
  }

  // Rayon vu de dessus : montant blanc au milieu, boîtes rangées des deux côtés, pancarte en haut.
  function pharmacyAisle(g, aisle) {
    const { c, x, y, w, h } = g;
    rect(c, x(aisle.u), y(aisle.v), w(aisle.width), h(aisle.height), '#d9e2dc');
    const rows = 7;
    const half = aisle.width / 2;
    for (let row = 0; row < rows; row++) {
      const v = aisle.v + 0.015 + row * (aisle.height - 0.03) / rows;
      const boxHeight = (aisle.height - 0.03) / rows - 0.01;
      for (const side of [0, 1]) {
        const color = PHARMACY_BOX_COLORS[(row * 2 + side + Math.round(aisle.u * 10)) % PHARMACY_BOX_COLORS.length];
        rect(c, x(aisle.u + 0.01 + side * half), y(v), w(half - 0.02), h(boxHeight), color);
      }
    }
    rect(c, x(aisle.u + half - 0.006), y(aisle.v), w(0.012), h(aisle.height), '#9aa8a0');
    // Pancarte verte au bout du rayon.
    rect(c, x(aisle.u - 0.005), y(aisle.v - 0.03), w(aisle.width + 0.01), h(0.035), '#27a35a');
  }

  Object.assign(Game.interiors, {
    fleuriste: {
      seller: { u: 0.84, v: 0.66, behindCounter: true },   // vendeur (décor)
      activity: 'browse',
      slots: [slot(0.22, 0.45), slot(0.45, 0.45), slot(0.7, 0.45), slot(0.2, 0.75)],
      // Chaque client repart avec une fleur.
      souvenir: () => ({ kind: 'flower', color: Game.utils.pickRandom(FLOWER_COLORS) }),
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#eef5e6', '#e1ecd6', 7);
        // Pétales tombés par terre (positions fixes).
        for (let k = 0; k < 16; k++) {
          circle(c, x(0.1 + (k * 41 % 80) / 100), y(0.3 + (k * 23 % 60) / 100), radius(0.015), FLOWER_COLORS[k % FLOWER_COLORS.length]);
        }
        // Étagère du fond garnie de 8 pots fleuris.
        rect(c, x(0.03), y(0.03), w(0.94), h(0.16), '#a0673c');
        for (let k = 0; k < 8; k++) {
          const u = 0.08 + k * 0.12;
          circle(c, x(u), y(0.11), radius(0.065), '#c8553d');
          flowerCluster(c, x(u), y(0.1), radius(0.065), k);
        }
        // Seaux de bouquets contre le mur gauche.
        for (const [v, k] of [[0.34, 1], [0.52, 4], [0.7, 6]]) {
          circle(c, x(0.06), y(v), radius(0.08), '#7aa0c8');
          flowerCluster(c, x(0.06), y(v), radius(0.075), k);
        }
        // Jardinières suspendues.
        for (const [u, k] of [[0.34, 2], [0.6, 5]]) {
          circle(c, x(u), y(0.29), radius(0.06), '#6b4a2a');
          flowerCluster(c, x(u), y(0.29), radius(0.055), k);
        }
        // Table de présentation ronde au centre, chargée de fleurs.
        circle(c, x(0.47), y(0.66), radius(0.13), '#c9a27a');
        flowerCluster(c, x(0.43), y(0.64), radius(0.06), 0);
        flowerCluster(c, x(0.52), y(0.69), radius(0.055), 3);
        // Comptoir : bouquet emballé, pot de fleurs et caisse.
        rect(c, x(0.72), y(0.62), w(0.24), h(0.13), '#c9a27a');
        c.fillStyle = '#f4efe6';
        c.beginPath();
        c.moveTo(x(0.76), y(0.64));
        c.lineTo(x(0.84), y(0.64));
        c.lineTo(x(0.8), y(0.74));
        c.closePath();
        c.fill();
        flowerCluster(c, x(0.8), y(0.645), radius(0.045), 2);
        flowerCluster(c, x(0.9), y(0.68), radius(0.045), 5);
        rect(c, x(0.86), y(0.7), w(0.04), h(0.04), '#555');
      },
    },

    kiosque: {
      seller: { u: 0.83, v: 0.64, behindCounter: true },   // vendeur (décor)
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
      seller: { u: 0.5, v: 0.22, behindCounter: true },   // vendeur (décor)
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
      seller: { u: 0.16, v: 0.84, behindCounter: false },   // vendeur (décor)
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

    // Pharmacie : comptoir au fond, étagères le long des murs et deux rayons au milieu,
    // que les clients contournent pour flâner dans les allées.
    pharmacie: {
      seller: { u: 0.4, v: 0.2, behindCounter: true },   // vendeur (décor)
      activity: 'browse',
      slots: [slot(0.17, 0.52), slot(0.5, 0.45), slot(0.84, 0.52), slot(0.5, 0.78)],
      obstacles: lot => PHARMACY_AISLES.map(aisle => boardRect(lot, aisle.u - 0.02, aisle.v - 0.02, aisle.width + 0.04, aisle.height + 0.04)),
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        checkerFloor(g, '#f4f7f4', '#e6eee6', 7);
        verticalShelf(c, x(0.02), y(0.06), w(0.07), h(0.72), PHARMACY_BOX_COLORS);
        verticalShelf(c, x(0.91), y(0.06), w(0.07), h(0.72), PHARMACY_BOX_COLORS);
        for (const aisle of PHARMACY_AISLES) {
          pharmacyAisle(g, aisle);
        }
        // Comptoir et croix verte.
        rect(c, x(0.3), y(0.05), w(0.4), h(0.16), '#27a35a');
        rect(c, x(0.485), y(0.07), w(0.03), h(0.12), '#fff');
        rect(c, x(0.465), y(0.11), w(0.07), h(0.04), '#fff');
      },
    },

    jouets: {
      seller: { u: 0.3, v: 0.3, behindCounter: false },   // vendeur (décor)
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
      seller: { u: 0.82, v: 0.62, behindCounter: false },   // vendeur (décor)
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

    // Bijouterie : comptoir vitré au fond, vitrines murales, deux îlots de présentation
    // et un gros diamant sur son coussin ; les pierres scintillent (drawAnimated).
    bijouterie: {
      seller: { u: 0.27, v: 0.19, behindCounter: true },   // vendeur (décor)
      activity: 'browse',
      slots: [slot(0.3, 0.33), slot(0.7, 0.33), slot(0.2, 0.62), slot(0.8, 0.62)],
      // Chaque client repart avec un petit écrin emballé.
      souvenir: () => ({ kind: 'giftbox', color: Game.utils.pickRandom(JEWEL_BOX_COLORS) }),
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#f4efe4', '#e9dfc9', 6);
        // Tapis rouge de l'entrée au diamant.
        rect(c, x(0.4), y(0.55), w(0.2), h(0.45), '#8e2a3c');
        // Comptoir vitré du fond : velours bleu nuit, bagues, colliers, montres.
        glassCase(g, 0.04, 0.03, 0.92, 0.16);
        for (let k = 0; k < 5; k++) {
          ring(g, 0.1 + k * 0.055, 0.1, JEWEL_COLORS[k % JEWEL_COLORS.length]);
        }
        necklace(g, 0.47, 0.06, 0.05, '#f2c14e', JEWEL_COLORS[1]);
        necklace(g, 0.6, 0.06, 0.05, '#f3f3f3', JEWEL_COLORS[0]);
        for (let k = 0; k < 3; k++) {
          watch(g, 0.74 + k * 0.08, 0.11);
        }
        // Vitrines murales à gauche et à droite : colliers de perles et bracelets.
        glassCase(g, 0.02, 0.27, 0.08, 0.42);
        glassCase(g, 0.9, 0.27, 0.08, 0.42);
        for (const u of [0.06, 0.94]) {
          necklace(g, u, 0.31, 0.025, '#f3f3f3', '#f3f3f3');
          bracelet(g, u, 0.47, '#f2c14e');
          necklace(g, u, 0.55, 0.025, '#f2c14e', JEWEL_COLORS[2]);
        }
        // Deux îlots vitrés : bagues, boucles d'oreilles et bracelets.
        for (const left of [0.17, 0.67]) {
          glassCase(g, left, 0.42, 0.16, 0.12);
          ring(g, left + 0.04, 0.48, JEWEL_COLORS[3]);
          ring(g, left + 0.08, 0.5, JEWEL_COLORS[0]);
          bracelet(g, left + 0.12, 0.47, '#d9d9e0');
          circle(c, x(left + 0.05), y(0.515), radius(0.008), JEWEL_COLORS[1]);
          circle(c, x(left + 0.065), y(0.515), radius(0.008), JEWEL_COLORS[1]);
        }
        // Gros diamant sur un coussin, sous une cloche de verre.
        circle(c, x(0.5), y(0.5), radius(0.085), 'rgba(207,238,243,.9)');
        rect(c, x(0.47), y(0.48), w(0.06), h(0.045), '#8e2a3c');
        diamondShape(c, x(0.5), y(0.497), radius(0.03));
        // Caisse, miroir et plante.
        rect(c, x(0.04), y(0.8), w(0.22), h(0.1), '#5a3d2b');
        rect(c, x(0.06), y(0.82), w(0.06), h(0.05), '#2a2e36');
        circle(c, x(0.2), y(0.85), radius(0.03), '#2aa7b8');
        ellipse(c, x(0.33), y(0.86), radius(0.035), radius(0.05), '#bfe3f2');
      },
      drawAnimated(g, lot, time) {
        // Éclats de lumière qui passent d'une pierre à l'autre.
        SPARKLES.forEach(([u, v], index) => {
          const glow = Math.sin(time * 3 + index * 1.7);
          if (glow > 0.4) {
            sparkle(g.c, g.x(u), g.y(v), g.radius(0.03) * (glow - 0.3));
          }
        });
      },
    },
  });
})();
