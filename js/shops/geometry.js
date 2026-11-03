// Repère de l'intérieur d'une boutique.
//
// Le mobilier est décrit en coordonnées normalisées :
//   u va de 0 (mur gauche) à 1 (mur droit),
//   v va de 0 (mur du fond) à 1 (mur de la porte).
// Quand la porte est en haut de la case, le dessin est retourné verticalement :
// le fond de la boutique reste toujours à l'opposé de la rue.
(function () {
  'use strict';

  // Épaisseur des murs : 6 % de la hauteur de la case, au moins 3 unités.
  function wallThickness(lotHeight) {
    return Math.max(3, lotHeight * 0.06);
  }

  // Zone intérieure (entre les murs) d'une case.
  function frameOfLot(lot) {
    const wall = wallThickness(lot.height);
    return {
      left: lot.x + wall,
      top: lot.y + wall,
      width: lot.width - 2 * wall,
      height: lot.height - 2 * wall,
      flipped: Game.map.lotDoorSide[lot.index] === 'top',
    };
  }

  // Appelle draw(g) avec un « pinceau » g qui convertit les coordonnées normalisées :
  //   g.x(u), g.y(v)  → position sur le plateau
  //   g.w(u), g.h(v)  → largeur, hauteur
  //   g.radius(k)     → rayon proportionnel à la hauteur de l'intérieur
  //   g.left, g.top, g.width, g.height → la zone intérieure elle-même
  function withPainter(c, frame, draw) {
    c.save();
    if (frame.flipped) {
      c.translate(0, 2 * frame.top + frame.height);
      c.scale(1, -1);
    }
    const { left, top, width, height } = frame;
    draw({
      c,
      left,
      top,
      width,
      height,
      x: u => left + u * width,
      y: v => top + v * height,
      w: u => u * width,
      h: v => v * height,
      radius: k => k * height,
    });
    c.restore();
  }

  // Position sur le plateau d'un point (u, v) de l'intérieur, retournement compris.
  function lotPointToBoard(lot, u, v) {
    const frame = frameOfLot(lot);
    return [frame.left + u * frame.width, frame.top + (frame.flipped ? 1 - v : v) * frame.height];
  }

  Game.shopGeometry = { wallThickness, frameOfLot, withPainter, lotPointToBoard };
})();
