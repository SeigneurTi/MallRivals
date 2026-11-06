// Plan de la ville : carrefours, rues, sorties et cases de boutiques.
// Coordonnées en unités logiques de la carte (0 = bord gauche de la carte, après le bac de cartes).
//
// Plan « en moulinet », comme le City Bucks d'origine : un carré de rues dont chaque côté se
// prolonge hors de la carte par un coin (le haut vers la droite, la droite vers le bas, le bas
// vers la gauche, la gauche vers le haut). Les passants arrivent par ces 4 routes.
// Les boutiques bordent tout le tour de la carte, côté extérieur du carré ; à l'intérieur,
// une rangée de boutiques le long du carré et une rue centrale bordée de boutiques et de parcs.
(function () {
  'use strict';

  const ROAD_HALF_WIDTH = Game.config.board.ROAD_HALF_WIDTH;
  const MAP_WIDTH = Game.config.board.MAP_WIDTH;
  const MAP_HEIGHT = Game.config.board.HEIGHT;

  // Le carré de rues (gauche, milieu, droite × haut, bas) : le milieu est la rue centrale.
  const STREET_X = [118, 470, 822];
  const STREET_Y = [118, 642];

  // Une case mesure 124 le long de sa rue et 90 de profondeur (le long d'une rue verticale,
  // elle est donc tournée : 90 de large, 124 de haut).
  const LOT_LENGTH = 124;
  const LOT_DEPTH = 90;
  const LOT_GAP = 8;
  const EDGE_MARGIN = 8;          // marge entre les cases et le bord de la carte

  // ---------- Carrefours et sorties ----------

  // Identifiant d'un carrefour : 'colonne,ligne' (par exemple '1,0').
  const nodeId = (column, row) => column + ',' + row;

  const nodes = {};
  STREET_X.forEach((x, column) => {
    STREET_Y.forEach((y, row) => {
      nodes[nodeId(column, row)] = [x, y];
    });
  });

  // Les 4 sorties, hors du cadre, au bout des 4 prolongements. L'ordre compte : il sert au tirage des trajets.
  const EXIT_NAMES = { north: 'Nord', west: 'Ouest', south: 'Sud', east: 'Est' };
  nodes.north = [STREET_X[0], -50];                  // la rue de gauche monte
  nodes.east = [MAP_WIDTH + 50, STREET_Y[0]];        // la rue du haut part à droite
  nodes.south = [STREET_X[2], MAP_HEIGHT + 50];      // la rue de droite descend
  nodes.west = [-50, STREET_Y[1]];                   // la rue du bas part à gauche

  const isExit = id => id in EXIT_NAMES;
  const exits = Object.keys(EXIT_NAMES);
  const intersections = Object.keys(nodes).filter(id => !isExit(id));

  // ---------- Rues (tronçons entre deux carrefours) ----------

  const STREETS = [
    // Haut et bas du carré, coupés par la rue centrale.
    ['0,0', '1,0'], ['1,0', '2,0'],
    ['0,1', '1,1'], ['1,1', '2,1'],
    // Côtés gauche et droit, et rue centrale.
    ['0,0', '0,1'], ['2,0', '2,1'], ['1,0', '1,1'],
    // Les 4 prolongements vers les sorties (le carrefour d'abord, la sortie ensuite).
    ['0,0', 'north'], ['2,0', 'east'], ['2,1', 'south'], ['0,1', 'west'],
  ];

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

  // Rangées de cases le long d'une rue droite. side : où sont les cases par rapport à la rue
  // ('above', 'below' pour une rue horizontale à l'ordonnée `line` ; 'left', 'right' pour une
  // rue verticale à l'abscisse `line`). Les cases sont centrées entre `from` et `to` (le long de la rue).
  // La porte donne toujours sur la rue.
  const TOP = STREET_Y[0];
  const BOTTOM = STREET_Y[1];
  const LEFT = STREET_X[0];
  const MIDDLE = STREET_X[1];
  const RIGHT = STREET_X[2];
  const SIDEWALK = ROAD_HALF_WIDTH + 2;
  const INNER_TOP = TOP + ROAD_HALF_WIDTH + LOT_DEPTH + LOT_GAP;        // bas de la rangée intérieure du haut
  const INNER_BOTTOM = BOTTOM - ROAD_HALF_WIDTH - LOT_DEPTH - LOT_GAP;  // haut de la rangée intérieure du bas
  const LOT_ROWS = [
    // Tour de la carte (côté extérieur du carré), en tournant comme le moulinet.
    { side: 'above', line: TOP, from: LEFT + SIDEWALK, to: MAP_WIDTH - EDGE_MARGIN, count: 6 },
    { side: 'right', line: RIGHT, from: TOP + SIDEWALK, to: MAP_HEIGHT - EDGE_MARGIN, count: 4 },
    { side: 'below', line: BOTTOM, from: EDGE_MARGIN, to: RIGHT - SIDEWALK, count: 6 },
    { side: 'left', line: LEFT, from: EDGE_MARGIN, to: BOTTOM - SIDEWALK, count: 4 },
    // Intérieur du carré : le long du haut et du bas, de part et d'autre de la rue centrale.
    { side: 'below', line: TOP, from: LEFT + SIDEWALK, to: MIDDLE - SIDEWALK, count: 2 },
    { side: 'below', line: TOP, from: MIDDLE + SIDEWALK, to: RIGHT - SIDEWALK, count: 2 },
    { side: 'above', line: BOTTOM, from: LEFT + SIDEWALK, to: MIDDLE - SIDEWALK, count: 2 },
    { side: 'above', line: BOTTOM, from: MIDDLE + SIDEWALK, to: RIGHT - SIDEWALK, count: 2 },
    // Rue centrale, des deux côtés.
    { side: 'left', line: MIDDLE, from: INNER_TOP, to: INNER_BOTTOM, count: 2 },
    { side: 'right', line: MIDDLE, from: INNER_TOP, to: INNER_BOTTOM, count: 2 },
  ];

  const DOOR_OF_SIDE = { above: 'bottom', below: 'top', left: 'right', right: 'left' };

  const lotRects = [];          // [x, y, largeur, hauteur] de chaque case
  const lotDoorSide = [];       // 'top', 'bottom', 'left' ou 'right' : côté de la porte
  const lotStreet = [];         // rue qui dessert chaque case : { start (un carrefour), end, access }
  const lotsByStreet = {};      // 'a|b' → cases le long du tronçon a–b (dans les deux sens)

  for (const [a, b] of STREETS) {
    lotsByStreet[a + '|' + b] = lotsByStreet[b + '|' + a] = [];
  }

  // Tronçons qui passent devant une porte (deux si la porte est face à un carrefour).
  function streetsAlong(isHorizontal, line, position) {
    return STREETS.filter(([a, b]) => {
      const [ax, ay] = nodes[a];
      const [bx, by] = nodes[b];
      if (isHorizontal ? ay !== line || by !== line : ax !== line || bx !== line) {
        return false;
      }
      const start = isHorizontal ? Math.min(ax, bx) : Math.min(ay, by);
      const end = isHorizontal ? Math.max(ax, bx) : Math.max(ay, by);
      return position >= start - 1 && position <= end + 1;
    });
  }

  for (const row of LOT_ROWS) {
    const isHorizontal = row.side === 'above' || row.side === 'below';
    const rowLength = row.count * LOT_LENGTH + (row.count - 1) * LOT_GAP;
    const first = row.from + (row.to - row.from - rowLength) / 2;

    for (let k = 0; k < row.count; k++) {
      const along = first + k * (LOT_LENGTH + LOT_GAP);
      const middle = along + LOT_LENGTH / 2;
      let rect;
      let door;
      if (row.side === 'above') {
        rect = [along, row.line - ROAD_HALF_WIDTH - LOT_DEPTH, LOT_LENGTH, LOT_DEPTH];
        door = [middle, row.line - ROAD_HALF_WIDTH];
      } else if (row.side === 'below') {
        rect = [along, row.line + ROAD_HALF_WIDTH, LOT_LENGTH, LOT_DEPTH];
        door = [middle, row.line + ROAD_HALF_WIDTH];
      } else if (row.side === 'left') {
        rect = [row.line - ROAD_HALF_WIDTH - LOT_DEPTH, along, LOT_DEPTH, LOT_LENGTH];
        door = [row.line - ROAD_HALF_WIDTH, middle];
      } else {
        rect = [row.line + ROAD_HALF_WIDTH, along, LOT_DEPTH, LOT_LENGTH];
        door = [row.line + ROAD_HALF_WIDTH, middle];
      }
      const lotIndex = lotRects.length;
      const access = {
        lotIndex,
        positionAlong: middle,      // position de la porte le long de la rue (abscisse ou ordonnée)
        door,
        streetPoint: isHorizontal ? [middle, row.line] : [row.line, middle],   // point de la rue face à la porte
      };
      const streets = streetsAlong(isHorizontal, row.line, middle);
      for (const [a, b] of streets) {
        lotsByStreet[a + '|' + b].push(access);
      }
      lotRects.push(rect);
      lotDoorSide.push(DOOR_OF_SIDE[row.side]);
      lotStreet.push({ start: streets[0][0], end: streets[0][1], access });
    }
  }

  // Cases qui donnent sur le tronçon a–b.
  function lotsAlongStreet(a, b) {
    return lotsByStreet[a + '|' + b];
  }

  // ---------- Décor : parcs et compte à rebours des soldes ----------

  // Deux parcs à l'intérieur du carré, de part et d'autre des boutiques de la rue centrale.
  const PARK_TOP = INNER_TOP;
  const PARK_HEIGHT = INNER_BOTTOM - INNER_TOP;
  const PARK_LEFT_END = MIDDLE - ROAD_HALF_WIDTH - LOT_DEPTH - LOT_GAP;
  const PARK_RIGHT_START = MIDDLE + ROAD_HALF_WIDTH + LOT_DEPTH + LOT_GAP;
  const PARKS = [
    [LEFT + SIDEWALK + LOT_GAP, PARK_TOP, PARK_LEFT_END - LEFT - SIDEWALK - LOT_GAP, PARK_HEIGHT],
    [PARK_RIGHT_START, PARK_TOP, RIGHT - SIDEWALK - LOT_GAP - PARK_RIGHT_START, PARK_HEIGHT],
  ];
  // Le compte à rebours des soldes est au milieu du parc de gauche.
  const SALES_CLOCK = [PARKS[0][0] + PARKS[0][2] / 2, PARKS[0][1] + PARKS[0][3] / 2];

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
    SALES_CLOCK,
  };
})();
