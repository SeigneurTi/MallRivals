// Petits utilitaires : tirages au hasard et mélange de couleurs.
(function () {
  'use strict';

  function randomBetween(min, max) {
    return min + (max - min) * Math.random();
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Copie mélangée d'une liste. Mélange approximatif (tri au hasard),
  // conservé tel quel pour ne pas changer le comportement du jeu.
  function shuffled(list) {
    return list.slice().sort(() => Math.random() - 0.5);
  }

  // Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur '#rrggbb'.
  // amount va de -1 (noir) à 1 (blanc).
  function mixColor(hex, amount) {
    const value = parseInt(hex.slice(1), 16);
    const red = value >> 16 & 255;
    const green = value >> 8 & 255;
    const blue = value & 255;
    const toward = amount < 0 ? 0 : 255;
    const strength = Math.abs(amount);
    const channel = start => Math.round(start + (toward - start) * strength);
    return `rgb(${channel(red)},${channel(green)},${channel(blue)})`;
  }

  Game.utils = { randomBetween, pickRandom, shuffled, mixColor };
})();
