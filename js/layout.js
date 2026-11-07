// Disposition du plateau selon l'écran :
//  - « large » (ordinateur, tablette, téléphone tenu en largeur) : bac de Joueur 1 à gauche,
//    carte au milieu, bac de Joueur 2 à droite ;
//  - « haute » (téléphone tenu en hauteur) : la carte en haut, sur toute la largeur, et les deux
//    bacs côte à côte en dessous, avec des cartes plus grandes (4 colonnes).
// On garde celle qui affiche le plateau le plus grand dans la place disponible.
// La carte garde ses propres coordonnées (MAP_WIDTH × HEIGHT) : seule sa place sur le plateau change.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const LAYOUT = Game.config.layout;

  // Hauteur du plateau en disposition haute : la carte, puis les bacs.
  function tallHeight() {
    return BOARD.HEIGHT + Game.trays.tallHeight(BOARD.MAP_WIDTH / 2);
  }

  // Choisit la disposition pour une place de availableWidth × availableHeight pixels.
  // Renvoie l'échelle du plateau (pixels par unité).
  function choose(availableWidth, availableHeight) {
    const wideScale = Math.min(availableWidth / BOARD.WIDTH, availableHeight / BOARD.HEIGHT);
    const tallScale = Math.min(availableWidth / BOARD.MAP_WIDTH, availableHeight / tallHeight());
    layout.isTall = tallScale > wideScale * LAYOUT.TALL_MIN_GAIN;
    layout.width = layout.isTall ? BOARD.MAP_WIDTH : BOARD.WIDTH;
    layout.height = layout.isTall ? tallHeight() : BOARD.HEIGHT;
    layout.mapLeft = layout.isTall ? 0 : BOARD.MAP_LEFT;
    const scale = layout.isTall ? tallScale : wideScale;
    // Petit écran : menus, info-bulles et textes de la carte grossissent pour rester lisibles.
    layout.uiScale = Math.max(1, Math.min(LAYOUT.MAX_UI_SCALE, LAYOUT.COMFORT_SCALE / scale));
    return scale;
  }

  // Place du bac d'un joueur sur le plateau, en unités : { left, top, width, height }.
  function trayRect(player) {
    if (layout.isTall) {
      const width = BOARD.MAP_WIDTH / 2;
      return { left: player * width, top: BOARD.HEIGHT, width, height: layout.height - BOARD.HEIGHT };
    }
    return { left: player ? BOARD.WIDTH - BOARD.TRAY_WIDTH : 0, top: 0, width: BOARD.TRAY_WIDTH, height: BOARD.HEIGHT };
  }

  const layout = {
    isTall: false,                // disposition haute (téléphone en hauteur)
    width: BOARD.WIDTH,           // taille du plateau, en unités
    height: BOARD.HEIGHT,
    mapLeft: BOARD.MAP_LEFT,      // bord gauche de la carte sur le plateau (elle commence toujours en haut)
    uiScale: 1,                   // grossissement des menus et textes de la carte
    choose,
    trayRect,
  };
  Game.layout = layout;
})();
