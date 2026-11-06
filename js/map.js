// Plan de la ville : carrefours, rues, sorties et cases de boutiques.
// Coordonnées en unités logiques de la carte (0 = bord gauche de la carte, après le bac de cartes).
//
// Une rue fait le tour de la ville, une croix la traverse en son centre, et les passants
// arrivent par 4 routes (nord, sud, est, ouest). Les boutiques bordent tout le tour de la carte,
// sauf là où passent ces 4 routes ; d'autres boutiques occupent les 4 quartiers du centre.
(function () {
  'use strict';

  const ROAD_HALF_WIDTH = Game.config.board.ROAD_HALF_WIDTH;
  const MAP_WIDTH = Game.config.board.MAP_WIDTH;
  const MAP_HEIGHT = Game.config.board.HEIGHT;

  // 3 rues verticales × 3 rues horizontales : le tour de la ville et la croix du centre.
  const STREET_X = [118, 470, 822];
  const STREET_Y = [118, 380, 642];

  // Une case mesure 124 le long de sa rue et 90 de profondeur (sur les côtés gauche et droit
  // de la carte, elle est donc tournée : 90 de large, 124 de haut).
  const LOT_LENGTH = 124;
  const LOT_DEPTH = 90;
  const LOT_GAP = 8;

  // ---------- Carrefours et sorties ----------

  // Identifiant d'un carrefour : 'colonne,ligne' (par exemple '1,2').
  const nodeId = (column, row) => column + ',' + row;

  const nodes = {};
  STREET_X.forEach((x, column) => {
    STREET_Y.forEach((y, row) => {
      nodes[nodeId(column, row)] = [x, y];
    });
  });

  // Les 4 sorties, hors du cadre, au bout des 4 routes. L'ordre compte : il sert au tirage des trajets.
  const EXIT_NAMES = { north: 'Nord', west: 'Ouest', south: 'Sud', east: 'Est' };
  nodes.north = [STREET_X[1], -50];
  nodes.west = [-50, STREET_Y[1]];
  nodes.south = [STREET_X[1], MAP_HEIGHT + 50];
  nodes.east = [MAP_WIDTH + 50, STREET_Y[1]];

  const isExit = id => id in EXIT_NAMES;
  const exits = Object.keys(EXIT_NAMES);
  const intersections = Object.keys(nodes).filter(id => !isExit(id));

  // ---------- Rues (tronçons entre deux carrefours) ----------

  const STREETS = [];
  for (let row = 0; row < STREET_Y.length; row++) {
    for (let column = 0; column < STREET_X.length - 1; column++) {
      STREETS.push([nodeId(column, row), nodeId(column + 1, row)]);
    }
  }
  for (let column = 0; column < STREET_X.length; column++) {
    for (let row = 0; row < STREET_Y.length - 1; row++) {
      STREETS.push([nodeId(column, row), nodeId(column, row + 1)]);
    }
  }
  STREETS.push(['north', '1,0'], ['west', '0,1'], ['south', '1,2'], ['east', '2,1']);

  const neighbours = {};
  for (const id in nodes) {
    neighbours[id] = [];
  }
  for (const [a, b] of STREETS) {
    neighbours[a].push(b);
    neighbours[b].push(a);
  }

  // Plus court chemin (en nombre de tronçons) de `from` à `to`, en parcours en largeur.
  // Les voisins sont mélangés pour varier les trajets. On ne traverse jamais une sortie,
  // sauf si c'est la destination.
  function findPath(from, to) {
    const previous = { [from]: null };
    const queue = [from];
    while (queue.length) {
      const current = queue.shift();
      if (current === to) {
        break;
      }
      for (const next of Game.utils.shuffled(neighbours[current])) {
        if (!(next in previous) && (!isExit(next) || next === to)) {
          previous[next] = current;
          queue.push(next);
        }
      }
    }
    const path = [];
    for (let id = to; id != null; id = previous[id]) {
      path.unshift(id);
    }
    return path;
  }

  // ---------- Cases de boutiques ----------

  // Groupes de cases le long d'un tronçon. side : où sont les cases par rapport à la rue
  // ('above', 'below' pour une rue horizontale ; 'left', 'right' pour une rue verticale).
  // La porte donne toujours sur la rue.
  const LOT_GROUPS = [];
  for (let row = 0; row < STREET_Y.length; row++) {
    for (const side of ['above', 'below']) {
      for (let column = 0; column < STREET_X.length - 1; column++) {
        LOT_GROUPS.push({ start: nodeId(column, row), end: nodeId(column + 1, row), side, count: 2 });
      }
    }
  }
  // Côtés gauche et droit de la carte : une case par tronçon (les deux routes ouest et est passent entre elles).
  for (let row = 0; row < STREET_Y.length - 1; row++) {
    LOT_GROUPS.push({ start: nodeId(0, row), end: nodeId(0, row + 1), side: 'left', count: 1 });
  }
  for (let row = 0; row < STREET_Y.length - 1; row++) {
    LOT_GROUPS.push({ start: nodeId(2, row), end: nodeId(2, row + 1), side: 'right', count: 1 });
  }

  const DOOR_OF_SIDE = { above: 'bottom', below: 'top', left: 'right', right: 'left' };

  const lotRects = [];          // [x, y, largeur, hauteur] de chaque case
  const lotDoorSide = [];       // 'top', 'bottom', 'left' ou 'right' : côté de la porte
  const lotStreet = [];         // rue qui dessert chaque case : { start, end, access }
  const lotsByStreet = {};      // 'a|b' → cases le long du tronçon a–b (dans les deux sens)

  for (const [a, b] of STREETS) {
    lotsByStreet[a + '|' + b] = lotsByStreet[b + '|' + a] = [];
  }

  for (const group of LOT_GROUPS) {
    const [startX, startY] = nodes[group.start];
    const [endX, endY] = nodes[group.end];
    const isHorizontal = startY === endY;
    // Les cases sont centrées entre les deux carrefours, hors des trottoirs des rues qui croisent.
    const streetStart = (isHorizontal ? startX : startY) + ROAD_HALF_WIDTH + 2;
    const streetEnd = (isHorizontal ? endX : endY) - ROAD_HALF_WIDTH - 2;
    const groupLength = group.count * LOT_LENGTH + (group.count - 1) * LOT_GAP;
    const first = streetStart + (streetEnd - streetStart - groupLength) / 2;

    for (let k = 0; k < group.count; k++) {
      const along = first + k * (LOT_LENGTH + LOT_GAP);
      const middle = along + LOT_LENGTH / 2;
      let rect;
      let door;
      let streetPoint;
      if (group.side === 'above') {
        rect = [along, startY - ROAD_HALF_WIDTH - LOT_DEPTH, LOT_LENGTH, LOT_DEPTH];
        door = [middle, startY - ROAD_HALF_WIDTH];
        streetPoint = [middle, startY];
      } else if (group.side === 'below') {
        rect = [along, startY + ROAD_HALF_WIDTH, LOT_LENGTH, LOT_DEPTH];
        door = [middle, startY + ROAD_HALF_WIDTH];
        streetPoint = [middle, startY];
      } else if (group.side === 'left') {
        rect = [startX - ROAD_HALF_WIDTH - LOT_DEPTH, along, LOT_DEPTH, LOT_LENGTH];
        door = [startX - ROAD_HALF_WIDTH, middle];
        streetPoint = [startX, middle];
      } else {
        rect = [startX + ROAD_HALF_WIDTH, along, LOT_DEPTH, LOT_LENGTH];
        door = [startX + ROAD_HALF_WIDTH, middle];
        streetPoint = [startX, middle];
      }
      const lotIndex = lotRects.length;
      const access = {
        lotIndex,
        positionAlong: middle,      // position de la porte le long de la rue (abscisse ou ordonnée)
        door,
        streetPoint,                // point de la rue face à la porte
      };
      lotRects.push(rect);
      lotDoorSide.push(DOOR_OF_SIDE[group.side]);
      lotsByStreet[group.start + '|' + group.end].push(access);
      lotStreet.push({ start: group.start, end: group.end, access });
    }
  }

  // Cases qui donnent sur le tronçon a–b.
  function lotsAlongStreet(a, b) {
    return lotsByStreet[a + '|' + b];
  }

  // ---------- Décor : pelouses et arbres ----------

  // Les 4 coins de la carte et les bandes entre les rangées de boutiques du centre.
  const CORNER_SIZE = STREET_X[0] - ROAD_HALF_WIDTH - 2 * LOT_GAP;
  const PARKS = [
    [LOT_GAP, LOT_GAP, CORNER_SIZE, CORNER_SIZE],
    [MAP_WIDTH - LOT_GAP - CORNER_SIZE, LOT_GAP, CORNER_SIZE, CORNER_SIZE],
    [LOT_GAP, MAP_HEIGHT - LOT_GAP - CORNER_SIZE, CORNER_SIZE, CORNER_SIZE],
    [MAP_WIDTH - LOT_GAP - CORNER_SIZE, MAP_HEIGHT - LOT_GAP - CORNER_SIZE, CORNER_SIZE, CORNER_SIZE],
  ];
  for (const row of [0, 1]) {
    const top = STREET_Y[row] + ROAD_HALF_WIDTH + LOT_DEPTH + 6;
    const bottom = STREET_Y[row + 1] - ROAD_HALF_WIDTH - LOT_DEPTH - 6;
    for (const column of [0, 1]) {
      const left = STREET_X[column] + ROAD_HALF_WIDTH + 2 + LOT_GAP;
      const right = STREET_X[column + 1] - ROAD_HALF_WIDTH - 2 - LOT_GAP;
      PARKS.push([left, top, right - left, bottom - top]);
    }
  }

  Game.map = {
    nodes,
    STREETS,
    EXIT_NAMES,
    exits,
    intersections,
    isExit,
    findPath,
    lotRects,
    lotDoorSide,
    lotStreet,
    lotsAlongStreet,
    PARKS,
  };
})();
