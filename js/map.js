// Plan de la ville : carrefours, rues, sorties et cases de boutiques.
// Coordonnées en unités logiques de la carte (0 = bord gauche de la carte, après le bac de cartes).
(function () {
  'use strict';

  const ROAD_HALF_WIDTH = Game.config.board.ROAD_HALF_WIDTH;
  const MAP_WIDTH = Game.config.board.MAP_WIDTH;

  // 3 rues verticales × 4 rues horizontales.
  const STREET_X = [40, 612, 920];
  const STREET_Y = [30, 266, 502, 738];

  // Toutes les cases ont la même taille et touchent une rue horizontale.
  const LOT_WIDTH = 124;
  const LOT_HEIGHT = 90;
  const LOT_COLUMNS_X = [66, 198, 330, 462, 638, 770];

  // ---------- Carrefours et sorties ----------

  // Identifiant d'un carrefour : 'colonne,ligne' (par exemple '1,2').
  const nodeId = (column, row) => column + ',' + row;

  const nodes = {};
  STREET_X.forEach((x, column) => {
    STREET_Y.forEach((y, row) => {
      nodes[nodeId(column, row)] = [x, y];
    });
  });

  // Les 4 sorties, hors du cadre. L'ordre compte : il sert au tirage des trajets.
  const EXIT_NAMES = { north: 'Nord', west: 'Ouest', south: 'Sud', east: 'Est' };
  nodes.north = [STREET_X[1], -50];
  nodes.west = [-50, STREET_Y[1]];
  nodes.south = [STREET_X[0], 810];
  nodes.east = [MAP_WIDTH + 50, STREET_Y[2]];

  const isExit = id => id in EXIT_NAMES;
  const exits = Object.keys(EXIT_NAMES);
  const intersections = Object.keys(nodes).filter(id => !isExit(id));

  // ---------- Rues (tronçons entre deux carrefours) ----------

  const STREETS = [];
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 2; column++) {
      STREETS.push([nodeId(column, row), nodeId(column + 1, row)]);
    }
  }
  for (let column = 0; column < 3; column++) {
    for (let row = 0; row < 3; row++) {
      STREETS.push([nodeId(column, row), nodeId(column, row + 1)]);
    }
  }
  STREETS.push(['north', '1,0'], ['west', '0,1'], ['south', '0,3'], ['east', '2,2']);

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

  // Chaque rangée : position verticale, côté de la porte, rue horizontale desservie.
  const LOT_ROWS = [
    { y: STREET_Y[0] + ROAD_HALF_WIDTH, door: 'top', streetRow: 0 },
    { y: STREET_Y[1] - ROAD_HALF_WIDTH - LOT_HEIGHT, door: 'bottom', streetRow: 1 },
    { y: STREET_Y[1] + ROAD_HALF_WIDTH, door: 'top', streetRow: 1 },
    { y: STREET_Y[2] - ROAD_HALF_WIDTH - LOT_HEIGHT, door: 'bottom', streetRow: 2 },
    { y: STREET_Y[2] + ROAD_HALF_WIDTH, door: 'top', streetRow: 2 },
    { y: STREET_Y[3] - ROAD_HALF_WIDTH - LOT_HEIGHT, door: 'bottom', streetRow: 3 },
  ];

  const lotRects = [];          // [x, y, largeur, hauteur] de chaque case
  const lotDoorSide = [];       // 'top' ou 'bottom' : côté de la porte
  const lotStreet = [];         // rue qui dessert chaque case (voir plus bas)
  const lotsByStreet = {};      // 'a|b' → cases le long du tronçon a–b (dans les deux sens)

  for (const [a, b] of STREETS) {
    lotsByStreet[a + '|' + b] = lotsByStreet[b + '|' + a] = [];
  }

  for (const row of LOT_ROWS) {
    for (const x of LOT_COLUMNS_X) {
      const lotIndex = lotRects.length;
      lotRects.push([x, row.y, LOT_WIDTH, LOT_HEIGHT]);
      lotDoorSide.push(row.door);

      const centerX = x + LOT_WIDTH / 2;
      const column = centerX < STREET_X[1] ? 0 : 1;
      const left = nodeId(column, row.streetRow);
      const right = nodeId(column + 1, row.streetRow);
      const access = {
        lotIndex,
        positionAlong: centerX,                                       // abscisse de la porte sur la rue
        door: [centerX, row.door === 'top' ? row.y : row.y + LOT_HEIGHT],
        streetPoint: [centerX, STREET_Y[row.streetRow]],              // point de la rue face à la porte
      };
      lotsByStreet[left + '|' + right].push(access);
      lotStreet.push({ left, right, access });
    }
  }

  // Cases qui donnent sur le tronçon a–b (liste vide pour les rues verticales).
  function lotsAlongStreet(a, b) {
    return lotsByStreet[a + '|' + b];
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
  };

  // --- Alias temporaires pour le code pas encore refactorisé (retirés à la fin) ---
  window.N = nodes;
  window.EDGES = STREETS;
  window.EXIT_LABEL = EXIT_NAMES;
  window.inner = intersections;
  window.exits = exits;
  window.bfs = findPath;
  window.LOT_RECTS = lotRects;
  window.LOT_DOOR = lotDoorSide;
})();
