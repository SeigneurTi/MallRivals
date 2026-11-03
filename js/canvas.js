// Canvas du plateau, canvas de fond (carte statique, redessinée seulement quand elle change)
// et adaptation à la largeur de l'écran.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const canvas = document.getElementById('board');
  const backgroundCanvas = document.createElement('canvas');

  // Adapte les deux canvas à la largeur disponible et à la densité de l'écran.
  function resize() {
    const container = canvas.parentElement;
    const width = container.clientWidth - parseFloat(getComputedStyle(container).paddingLeft) * 2;
    if (!(width > 0)) {
      return;
    }
    view.pixelRatio = Math.min(devicePixelRatio || 1, 2);
    view.scale = width / BOARD.WIDTH;
    for (const target of [canvas, backgroundCanvas]) {
      target.width = Math.round(BOARD.WIDTH * view.scale * view.pixelRatio);
      target.height = Math.round(BOARD.HEIGHT * view.scale * view.pixelRatio);
    }
    canvas.style.height = Math.round(BOARD.HEIGHT * view.scale) + 'px';
    Game.board.draw();
  }

  // Redimensionne (avec un petit délai) quand la fenêtre ou le conteneur change de taille.
  function watchResize() {
    let pendingResize;
    addEventListener('resize', () => {
      clearTimeout(pendingResize);
      pendingResize = setTimeout(resize, 120);
    });
    if (window.ResizeObserver) {
      let lastWidth = 0;
      new ResizeObserver(() => {
        const width = canvas.parentElement.clientWidth;
        if (width !== lastWidth) {
          lastWidth = width;
          clearTimeout(pendingResize);
          pendingResize = setTimeout(resize, 60);
        }
      }).observe(canvas.parentElement);
    }
  }

  const view = {
    canvas,
    ctx: canvas.getContext('2d'),
    backgroundCanvas,
    backgroundCtx: backgroundCanvas.getContext('2d'),
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scale: 1,        // pixels CSS par unité logique
    pixelRatio: 1,   // densité de l'écran, plafonnée à 2
    resize,
    watchResize,
  };
  Game.view = view;
})();
