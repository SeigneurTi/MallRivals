// Canvas du plateau, canvas de fond (carte statique, redessinée seulement quand elle change)
// et adaptation à la taille de l'écran.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const canvas = document.getElementById('board');
  const backgroundCanvas = document.createElement('canvas');

  const LAYOUT = Game.config.layout;
  const isTouchScreen = matchMedia('(pointer: coarse)').matches;
  let lastSize = null;   // dernière place disponible utilisée { width, height }, en pixels CSS

  // Adapte les deux canvas à la place disponible et à la densité de l'écran : tout le plateau
  // tient dans la largeur de la tablette et dans la hauteur de la fenêtre. La disposition
  // (large ou haute, voir js/layout.js) est choisie à ce moment-là.
  function resize() {
    const container = canvas.parentElement;
    const padding = parseFloat(getComputedStyle(container).paddingLeft);
    const width = container.clientWidth - padding * 2;
    if (!(width > 0)) {
      return;
    }
    const height = Math.max(LAYOUT.MIN_HEIGHT, innerHeight - padding * 2 - LAYOUT.SCREEN_MARGIN);
    // Sur téléphone, la barre d'adresse qui apparaît en faisant défiler ne change que la hauteur :
    // on n'y touche pas, sinon le plateau grandirait et rapetisserait sans cesse.
    const isJitter = isTouchScreen && lastSize && lastSize.width === width && Math.abs(lastSize.height - height) < LAYOUT.HEIGHT_JITTER;
    if (isJitter && canvas.width) {
      return;
    }
    lastSize = { width, height };
    const layout = Game.layout;
    view.scale = layout.choose(width, height);
    view.pixelRatio = Math.min(devicePixelRatio || 1, 2);
    for (const target of [canvas, backgroundCanvas]) {
      target.width = Math.round(layout.width * view.scale * view.pixelRatio);
      target.height = Math.round(layout.height * view.scale * view.pixelRatio);
    }
    canvas.style.width = Math.round(layout.width * view.scale) + 'px';
    canvas.style.height = Math.round(layout.height * view.scale) + 'px';
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
