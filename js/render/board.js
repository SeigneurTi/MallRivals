// Fond de carte : sol, rues, cases et bâtiments.
// Dessiné sur un canvas à part, seulement quand quelque chose change (construction,
// niveau, bouclier, destruction…), puis recopié à chaque image.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const { FULL_TURN, roundedRectPath } = Game.draw;

  // Rectangle d'une rue entre deux carrefours, élargi de halfWidth de chaque côté.
  function streetRect([a, b], halfWidth) {
    const start = Game.map.nodes[a];
    const end = Game.map.nodes[b];
    return [
      Math.min(start[0], end[0]) - halfWidth,
      Math.min(start[1], end[1]) - halfWidth,
      Math.abs(start[0] - end[0]) + 2 * halfWidth,
      Math.abs(start[1] - end[1]) + 2 * halfWidth,
    ];
  }

  function drawHotSpot(c, lot) {
    const centerX = lot.x + lot.width / 2;
    const centerY = lot.y + lot.height / 2;
    const radius = Math.min(lot.width, lot.height) * 0.46;
    const glow = c.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    glow.addColorStop(0, 'rgba(242,120,150,.6)');
    glow.addColorStop(1, 'rgba(242,120,150,0)');
    c.fillStyle = glow;
    c.beginPath();
    c.arc(centerX, centerY, radius, 0, FULL_TURN);
    c.fill();
  }

  // Parcs : pelouse et arbres en quinconce, sauf autour du compte à rebours des soldes.
  const TREE_SPACING = 46;
  const TREE_RADIUS = 13;
  const CLOCK_CLEARANCE = 62;

  function drawTree(c, treeX, treeY) {
    c.fillStyle = 'rgba(20,25,20,.18)';
    c.beginPath();
    c.arc(treeX + 2, treeY + 3, TREE_RADIUS, 0, FULL_TURN);
    c.fill();
    c.fillStyle = '#4f9a4a';
    c.beginPath();
    c.arc(treeX, treeY, TREE_RADIUS, 0, FULL_TURN);
    c.fill();
    c.fillStyle = '#6cb85f';
    c.beginPath();
    c.arc(treeX - TREE_RADIUS * 0.3, treeY - TREE_RADIUS * 0.3, TREE_RADIUS * 0.55, 0, FULL_TURN);
    c.fill();
  }

  function drawParks(c) {
    const [clockX, clockY] = Game.map.SALES_CLOCK;
    for (const [x, y, width, height] of Game.map.PARKS) {
      c.fillStyle = '#a5d38a';
      roundedRectPath(c, x, y, width, height, 10);
      c.fill();
      const columns = Math.floor(width / TREE_SPACING);
      const rows = Math.floor(height / TREE_SPACING);
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          if ((row + column) % 2) {
            continue;   // en quinconce
          }
          const treeX = x + (column + 0.5) * width / columns;
          const treeY = y + (row + 0.5) * height / rows;
          if (Math.hypot(treeX - clockX, treeY - clockY) < CLOCK_CLEARANCE) {
            continue;
          }
          drawTree(c, treeX, treeY);
        }
      }
    }
  }

  function isLotVisible(lot, visibleArea) {
    return !visibleArea || (lot.x < visibleArea.right && lot.x + lot.width > visibleArea.left
      && lot.y < visibleArea.bottom && lot.y + lot.height > visibleArea.top);
  }

  // Dessine le fond de carte dans c, déjà placé dans le repère de la carte.
  // visibleArea (facultatif, pour la loupe) : seules les cases qui la touchent sont dessinées.
  function drawMap(c, visibleArea) {
    c.fillStyle = '#d9dbd5';
    c.fillRect(0, 0, BOARD.MAP_WIDTH, BOARD.HEIGHT);
    drawParks(c);

    // Trottoirs, puis chaussée par-dessus.
    c.fillStyle = '#c6c9c1';
    for (const street of Game.map.STREETS) {
      c.fillRect(...streetRect(street, BOARD.ROAD_HALF_WIDTH + 2));
    }
    c.fillStyle = '#f5f5f1';
    for (const street of Game.map.STREETS) {
      c.fillRect(...streetRect(street, BOARD.ROAD_HALF_WIDTH));
    }

    for (const lot of Game.state.lots) {
      if (!isLotVisible(lot, visibleArea)) {
        continue;
      }
      // Terrain gris avec un léger reflet.
      c.fillStyle = '#b8bbb3';
      roundedRectPath(c, lot.x, lot.y, lot.width, lot.height, 6);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,.12)';
      roundedRectPath(c, lot.x + 3, lot.y + 3, lot.width - 6, lot.height * 0.4, 4);
      c.fill();
      if (lot.isHot) {
        drawHotSpot(c, lot);
      }
      if (lot.shop) {
        Game.shops.drawBuilding(c, lot);
      }
    }
  }

  // Redessine le canvas de fond, recopié ensuite à chaque image.
  function draw() {
    const view = Game.view;
    const c = view.backgroundCtx;
    const pixelsPerUnit = view.pixelRatio * view.scale;
    // Repère de la carte : décalé de la largeur du bac de gauche.
    c.setTransform(pixelsPerUnit, 0, 0, pixelsPerUnit, pixelsPerUnit * BOARD.MAP_LEFT, 0);
    drawMap(c);
  }

  Game.board = { draw, drawMap };
})();
