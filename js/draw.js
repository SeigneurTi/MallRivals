// Primitives de dessin partagées : rectangle, disque, ellipse, rectangle arrondi.
(function () {
  'use strict';

  // Angle de fin des cercles : un peu plus d'un tour complet (2π ≈ 6,28).
  const FULL_TURN = 7;

  function rect(c, x, y, width, height, color) {
    c.fillStyle = color;
    c.fillRect(x, y, width, height);
  }

  function circle(c, x, y, radius, color) {
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, radius, 0, FULL_TURN);
    c.fill();
  }

  function ellipse(c, x, y, radiusX, radiusY, color) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, radiusX, radiusY, 0, 0, FULL_TURN);
    c.fill();
  }

  // Prépare le tracé (sans le remplir) : l'appelant fait ensuite fill() ou stroke().
  function roundedRectPath(c, x, y, width, height, radius) {
    c.beginPath();
    c.roundRect(x, y, width, height, radius);
  }

  Game.draw = { FULL_TURN, rect, circle, ellipse, roundedRectPath };
})();
