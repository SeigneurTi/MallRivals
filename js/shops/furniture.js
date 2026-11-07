// Éléments communs aux intérieurs : sols, étagères et places des clients.
(function () {
  'use strict';

  const { rect } = Game.draw;

  // Couleurs de magazines et de livres, réutilisées par plusieurs boutiques.
  const MAGAZINE_COLORS = ['#e85d4a', '#3d7dd8', '#f2b134', '#47a36b', '#9a5fd1', '#ffffff'];

  // Une place pour un client, en coordonnées normalisées (voir geometry.js).
  // activity remplace, pour cette place seulement, l'activité de la boutique
  // (à la piscine : nager ou s'allonger sur un transat).
  // facing (facultatif) : 1 ou -1, sens dans lequel le client regarde une fois assis.
  function slot(u, v, activity, facing) {
    return { u, v, activity, facing };
  }

  // Deux chaises de part et d'autre de chaque table (tables aux abscisses tableUs),
  // chaque client tourné vers sa table.
  function seatPairs(tableUs, v, offset) {
    return tableUs.flatMap(u => [slot(u - offset, v, undefined, 1), slot(u + offset, v, undefined, -1)]);
  }

  // Rapport hauteur / largeur de l'intérieur (toutes les cases ont la même taille) :
  // sert à placer des chaises en cercle autour d'une table sans les écraser.
  const [, , LOT_WIDTH, LOT_HEIGHT] = Game.map.lotRects[0];
  const WALL = Game.shopGeometry.wallThickness(LOT_HEIGHT);
  const INTERIOR_ASPECT = (LOT_HEIGHT - 2 * WALL) / (LOT_WIDTH - 2 * WALL);

  // Chaise autour d'une table ronde en (table.u, table.v).
  // angleDegrees : 0 à droite de la table, 90 côté porte, 180 à gauche, 270 côté fond.
  // distance : en hauteur d'intérieur. Le client assis regarde la table.
  function chairAround(table, angleDegrees, distance) {
    const angle = angleDegrees * Math.PI / 180;
    const u = table.u + Math.cos(angle) * distance * INTERIOR_ASPECT;
    const v = table.v + Math.sin(angle) * distance;
    return slot(u, v, undefined, Math.cos(angle) > 0 ? -1 : 1);
  }

  // Carrelage en damier : `rows` carreaux sur la hauteur, des carreaux carrés.
  function checkerFloor(g, colorA, colorB, rows) {
    const { c, left, top, width, height } = g;
    rect(c, left, top, width, height, colorA);
    c.fillStyle = colorB;
    const tile = height / rows;
    for (let i = 0; i * tile < width; i++) {
      for (let j = 0; j < rows; j++) {
        if ((i + j) % 2) {
          // Le dernier carreau de chaque rangée est coupé au mur droit.
          c.fillRect(left + i * tile, top + j * tile, Math.min(tile, left + width - (left + i * tile)), tile);
        }
      }
    }
  }

  // Parquet : 7 lames horizontales.
  function plankFloor(g, color, lineColor) {
    const { c, left, top, width, height } = g;
    rect(c, left, top, width, height, color);
    c.strokeStyle = lineColor;
    c.lineWidth = 1;
    for (let k = 1; k < 7; k++) {
      c.beginPath();
      c.moveTo(left, top + k * height / 7);
      c.lineTo(left + width, top + k * height / 7);
      c.stroke();
    }
  }

  // Étagère en bois garnie d'objets colorés, posée à l'horizontale.
  function horizontalShelf(c, x, y, width, height, colors) {
    rect(c, x, y, width, height, '#8b6440');
    const count = Math.max(3, Math.round(width / (height * 0.7)));
    for (let k = 0; k < count; k++) {
      rect(c, x + 1 + k * (width - 2) / count, y + 1.2, Math.max(0.5, (width - 2) / count - 0.8), height - 2.4, colors[k % colors.length]);
    }
  }

  // Même étagère, posée à la verticale (le long d'un mur latéral).
  function verticalShelf(c, x, y, width, height, colors) {
    rect(c, x, y, width, height, '#8b6440');
    const count = Math.max(3, Math.round(height / (width * 0.7)));
    for (let k = 0; k < count; k++) {
      rect(c, x + 1.2, y + 1 + k * (height - 2) / count, width - 2.4, Math.max(0.5, (height - 2) / count - 0.8), colors[k % colors.length]);
    }
  }

  Game.furniture = {
    MAGAZINE_COLORS,
    slot,
    seatPairs,
    chairAround,
    checkerFloor,
    plankFloor,
    horizontalShelf,
    verticalShelf,
  };

  // Intérieurs des 20 boutiques, remplis par js/shops/interiors-*.js. Chaque intérieur :
  //   activity        ce que font les clients : browse, sit, play, bowl, session, ride, lobby, mix
  //   slots           les places (leur nombre = capacité de la boutique)
  //   drawFurniture   le mobilier fixe (dessiné une fois sur le fond de carte)
  //   drawAnimated    facultatif : ce qui bouge (écran, bornes, quilles), à chaque image
  //   seller          facultatif : vendeur pour le décor, { u, v, behindCounter } (voir js/shops/shop.js)
  Game.interiors = {};
})();
