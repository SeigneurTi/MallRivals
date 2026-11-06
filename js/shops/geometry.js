// Repère de l'intérieur d'une boutique.
//
// Le mobilier est décrit en coordonnées normalisées :
//   u va de 0 (mur gauche) à 1 (mur droit),
//   v va de 0 (mur du fond) à 1 (mur de la porte).
// Le fond de la boutique reste toujours à l'opposé de la rue :
//   porte en bas : dessin tel quel ; porte en haut : dessin retourné verticalement ;
//   porte à gauche ou à droite (côtés de la carte) : dessin tourné d'un quart de tour.
(function () {
  'use strict';

  // Épaisseur des murs : 6 % de la profondeur de la case, au moins 3 unités.
  function wallThickness(lotDepth) {
    return Math.max(3, lotDepth * 0.06);
  }

  // Zone intérieure (entre les murs) d'une case.
  //   left, top, width, height : la zone sur le plateau ;
  //   localWidth, localHeight : ses dimensions dans le repère de la boutique (le long de u et de v) ;
  //   door : côté de la porte ; flipped : porte en haut (dessin retourné).
  function frameOfLot(lot) {
    const wall = wallThickness(Math.min(lot.width, lot.height));
    const door = Game.map.lotDoorSide[lot.index];
    const width = lot.width - 2 * wall;
    const height = lot.height - 2 * wall;
    const isSideways = door === 'left' || door === 'right';
    return {
      left: lot.x + wall,
      top: lot.y + wall,
      width,
      height,
      localWidth: isSideways ? height : width,
      localHeight: isSideways ? width : height,
      door,
      flipped: door === 'top',
    };
  }

  // Place le contexte dans le repère de la boutique : (u × localWidth, v × localHeight) → plateau.
  function applyFrameTransform(c, frame) {
    const { left, top, width, height } = frame;
    if (frame.door === 'top') {
      c.transform(1, 0, 0, -1, left, top + height);
    } else if (frame.door === 'right') {
      c.transform(0, -1, 1, 0, left, top + height);
    } else if (frame.door === 'left') {
      c.transform(0, 1, -1, 0, left + width, top);
    } else {
      c.transform(1, 0, 0, 1, left, top);
    }
  }

  // Appelle draw(g) avec un « pinceau » g qui convertit les coordonnées normalisées :
  //   g.x(u), g.y(v)  → position dans le repère de la boutique
  //   g.w(u), g.h(v)  → largeur, hauteur
  //   g.radius(k)     → rayon proportionnel à la profondeur de l'intérieur
  //   g.left, g.top, g.width, g.height → la zone intérieure elle-même
  // Le contexte est retourné ou tourné selon le côté de la porte (voir applyFrameTransform).
  function withPainter(c, frame, draw) {
    c.save();
    applyFrameTransform(c, frame);
    const width = frame.localWidth;
    const height = frame.localHeight;
    draw({
      c,
      left: 0,
      top: 0,
      width,
      height,
      x: u => u * width,
      y: v => v * height,
      w: u => u * width,
      h: v => v * height,
      radius: k => k * height,
    });
    c.restore();
  }

  // Position sur le plateau d'un point (u, v) de l'intérieur, retournement ou rotation compris.
  function lotPointToBoard(lot, u, v) {
    const { left, top, width, height, door } = frameOfLot(lot);
    if (door === 'top') {
      return [left + u * width, top + (1 - v) * height];
    }
    if (door === 'right') {
      return [left + v * width, top + (1 - u) * height];
    }
    if (door === 'left') {
      return [left + (1 - v) * width, top + u * height];
    }
    return [left + u * width, top + v * height];
  }

  // L'inverse : coordonnées (u, v) de l'intérieur d'un point du plateau.
  function boardPointToLot(lot, x, y) {
    const { left, top, width, height, door } = frameOfLot(lot);
    const across = (x - left) / width;
    const down = (y - top) / height;
    if (door === 'top') {
      return [across, 1 - down];
    }
    if (door === 'right') {
      return [1 - down, across];
    }
    if (door === 'left') {
      return [down, 1 - across];
    }
    return [across, down];
  }

  Game.shopGeometry = { wallThickness, frameOfLot, withPainter, lotPointToBoard, boardPointToLot };
})();
