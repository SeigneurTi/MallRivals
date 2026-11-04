// Loupe : avec le bouton sur le bord de la tablette, un rond suit le curseur et montre
// le plateau grossi (×3 par défaut) ; autour, la carte reste à sa taille normale.
// Le rond est un petit canvas posé sur le plateau, qui laisse passer les clics.
(function () {
  'use strict';

  const MAGNIFIER = Game.config.magnifier;
  const lens = document.getElementById('lens');
  const lensCtx = lens.getContext('2d');
  const button = document.getElementById('magnifier');

  let isActive = false;
  let pointer = null;   // position du curseur sur le plateau, en pixels CSS (null : hors du plateau)

  function setActive(active) {
    isActive = active;
    button.setAttribute('aria-pressed', String(active));
    Game.view.canvas.parentElement.classList.toggle('is-magnifying', active);
    if (!active) {
      lens.hidden = true;
    }
  }

  function bind() {
    const board = Game.view.canvas;
    button.addEventListener('click', () => setActive(!isActive));
    board.addEventListener('pointermove', event => {
      const bounds = board.getBoundingClientRect();
      pointer = [event.clientX - bounds.left, event.clientY - bounds.top];
    });
    board.addEventListener('pointerleave', () => {
      pointer = null;
    });
  }

  // Appelé après chaque image du plateau : recopie la zone sous le curseur, grossie, dans le rond.
  function draw() {
    if (!isActive || !pointer) {
      lens.hidden = true;
      return;
    }
    const board = Game.view.canvas;
    const pixelRatio = Game.view.pixelRatio;
    const diameter = MAGNIFIER.DIAMETER;
    const lensPixels = Math.round(diameter * pixelRatio);
    if (lens.width !== lensPixels) {
      lens.width = lensPixels;
      lens.height = lensPixels;
      lens.style.width = diameter + 'px';
      lens.style.height = diameter + 'px';
    }
    // Rond centré sur le curseur (position relative à la tablette).
    lens.style.left = (board.offsetLeft + pointer[0] - diameter / 2) + 'px';
    lens.style.top = (board.offsetTop + pointer[1] - diameter / 2) + 'px';
    lens.hidden = false;

    // Zone source : un carré ZOOM fois plus petit que la loupe, centré sur le curseur.
    const pixelsPerCssPixel = board.width / board.clientWidth;
    const sourceSize = diameter / MAGNIFIER.ZOOM * pixelsPerCssPixel;
    const sourceX = pointer[0] * pixelsPerCssPixel - sourceSize / 2;
    const sourceY = pointer[1] * pixelsPerCssPixel - sourceSize / 2;

    const middle = lensPixels / 2;
    lensCtx.setTransform(1, 0, 0, 1, 0, 0);
    lensCtx.clearRect(0, 0, lensPixels, lensPixels);
    lensCtx.save();
    lensCtx.beginPath();
    lensCtx.arc(middle, middle, middle - pixelRatio, 0, Game.draw.FULL_TURN);
    lensCtx.clip();
    lensCtx.fillStyle = '#16181c';   // hors du plateau (bords) : couleur de la tablette
    lensCtx.fillRect(0, 0, lensPixels, lensPixels);
    lensCtx.imageSmoothingEnabled = true;
    // La source peut dépasser du plateau : on la recadre et on décale la destination d'autant.
    const clippedLeft = Math.max(0, sourceX);
    const clippedTop = Math.max(0, sourceY);
    const clippedRight = Math.min(board.width, sourceX + sourceSize);
    const clippedBottom = Math.min(board.height, sourceY + sourceSize);
    if (clippedRight > clippedLeft && clippedBottom > clippedTop) {
      const scale = lensPixels / sourceSize;
      lensCtx.drawImage(
        board,
        clippedLeft, clippedTop, clippedRight - clippedLeft, clippedBottom - clippedTop,
        (clippedLeft - sourceX) * scale, (clippedTop - sourceY) * scale,
        (clippedRight - clippedLeft) * scale, (clippedBottom - clippedTop) * scale
      );
    }
    lensCtx.restore();
    // Monture de la loupe.
    lensCtx.strokeStyle = '#ffffff';
    lensCtx.lineWidth = 3 * pixelRatio;
    lensCtx.beginPath();
    lensCtx.arc(middle, middle, middle - 2.5 * pixelRatio, 0, Game.draw.FULL_TURN);
    lensCtx.stroke();
    lensCtx.strokeStyle = 'rgba(20, 25, 20, .45)';
    lensCtx.lineWidth = pixelRatio;
    lensCtx.beginPath();
    lensCtx.arc(middle, middle, middle - 0.5 * pixelRatio, 0, Game.draw.FULL_TURN);
    lensCtx.stroke();
  }

  Game.magnifier = { bind, draw };
})();
