// Canvas du plateau et canvas de fond (carte statique, redessinée seulement quand elle change).
(function () {
  'use strict';

  const canvas = document.getElementById('c');
  const backgroundCanvas = document.createElement('canvas');

  Game.view = {
    canvas,
    ctx: canvas.getContext('2d'),
    backgroundCanvas,
    backgroundCtx: backgroundCanvas.getContext('2d'),
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scale: 1,        // pixels CSS par unité logique
    pixelRatio: 1,   // densité de l'écran, plafonnée à 2
  };

  // --- Alias temporaires pour le code pas encore refactorisé (retirés à la fin) ---
  window.cv = canvas;
  window.ctx = Game.view.ctx;
  window.bg = backgroundCanvas;
  window.bctx = Game.view.backgroundCtx;
  window.reduce = Game.view.prefersReducedMotion;
})();
