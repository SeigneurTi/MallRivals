// Compléments pour les navigateurs anciens : roundRect n'existe pas sur iOS < 16.
(function () {
  'use strict';

  if (!window.CanvasRenderingContext2D || CanvasRenderingContext2D.prototype.roundRect) {
    return;
  }

  CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radii) {
    // On ne gère qu'un seul rayon (le premier s'il s'agit d'un tableau).
    const requested = typeof radii === 'number' ? radii : (radii && radii[0]) || 0;
    const radius = Math.max(0, Math.min(requested, Math.abs(width) / 2, Math.abs(height) / 2));
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  };
})();
