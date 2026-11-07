// Loupe : avec le bouton sur le bord de la tablette, un rond suit le curseur et montre
// le plateau grossi (×3 par défaut) ; autour, la carte reste à sa taille normale.
// Au doigt, la loupe suit le doigt qui glisse sur le plateau et s'affiche au-dessus de lui.
// Le rond est un petit canvas posé sur le plateau, qui laisse passer les clics.
// Pour une image nette, la scène y est redessinée en grand (pas d'agrandissement de pixels).
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const MAGNIFIER = Game.config.magnifier;
  const lens = document.getElementById('lens');
  const lensCtx = lens.getContext('2d');
  const button = document.getElementById('magnifier');

  let isActive = false;
  let pointer = null;   // position du curseur sur le plateau, en pixels CSS (null : hors du plateau)
  let isFinger = false; // pointeur au doigt (ou au stylet) : la loupe se place au-dessus

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
    const follow = event => {
      const bounds = board.getBoundingClientRect();
      pointer = [event.clientX - bounds.left, event.clientY - bounds.top];
      isFinger = event.pointerType !== 'mouse';
    };
    board.addEventListener('pointerdown', follow);
    board.addEventListener('pointermove', follow);
    board.addEventListener('pointerleave', () => {
      pointer = null;
    });
    // Au doigt : la loupe disparaît quand le doigt se relève.
    for (const type of ['pointerup', 'pointercancel']) {
      board.addEventListener(type, event => {
        if (event.pointerType !== 'mouse') {
          pointer = null;
        }
      });
    }
  }

  function strokeRing(radius, width, color) {
    lensCtx.strokeStyle = color;
    lensCtx.lineWidth = width;
    lensCtx.beginPath();
    lensCtx.arc(lens.width / 2, lens.height / 2, radius, 0, Game.draw.FULL_TURN);
    lensCtx.stroke();
  }

  // Appelé après chaque image du plateau : redessine la zone sous le curseur, grossie, dans le rond.
  function draw(timestamp) {
    if (!isActive || !pointer) {
      lens.hidden = true;
      return;
    }
    const view = Game.view;
    const board = view.canvas;
    const pixelRatio = view.pixelRatio;
    const diameter = Math.round(Math.min(MAGNIFIER.DIAMETER, innerWidth * MAGNIFIER.MAX_SCREEN_SHARE));
    const lensPixels = Math.round(diameter * pixelRatio);
    if (lens.width !== lensPixels) {
      lens.width = lensPixels;
      lens.height = lensPixels;
      lens.style.width = diameter + 'px';
      lens.style.height = diameter + 'px';
    }
    // Rond centré sur le curseur (position relative à la tablette) ; au doigt, juste au-dessus du doigt.
    const fingerShift = isFinger ? diameter / 2 + MAGNIFIER.FINGER_GAP : 0;
    lens.style.left = (board.offsetLeft + pointer[0] - diameter / 2) + 'px';
    lens.style.top = (board.offsetTop + pointer[1] - diameter / 2 - fingerShift) + 'px';
    lens.hidden = false;

    // Repère : le point du plateau sous le curseur arrive au centre du rond, ZOOM fois plus grand.
    const pixelsPerUnit = pixelRatio * view.scale * MAGNIFIER.ZOOM;
    const pointerX = pointer[0] / view.scale;
    const pointerY = pointer[1] / view.scale;
    const middle = lensPixels / 2;
    const offsetX = middle - pointerX * pixelsPerUnit;
    const offsetY = middle - pointerY * pixelsPerUnit;
    // Zone visible, en unités de la carte (pour ne redessiner que les cases utiles).
    const halfSize = middle / pixelsPerUnit;
    const visibleArea = {
      left: pointerX - Game.layout.mapLeft - halfSize,
      right: pointerX - Game.layout.mapLeft + halfSize,
      top: pointerY - halfSize,
      bottom: pointerY + halfSize,
    };

    lensCtx.setTransform(1, 0, 0, 1, 0, 0);
    lensCtx.clearRect(0, 0, lensPixels, lensPixels);
    lensCtx.save();
    lensCtx.beginPath();
    lensCtx.arc(middle, middle, middle - pixelRatio, 0, Game.draw.FULL_TURN);
    lensCtx.clip();
    lensCtx.fillStyle = '#16181c';   // hors du plateau (bords) : couleur de la tablette
    lensCtx.fillRect(0, 0, lensPixels, lensPixels);
    // Fond de carte, puis tout ce qui bouge, comme sur le plateau.
    lensCtx.setTransform(pixelsPerUnit, 0, 0, pixelsPerUnit, offsetX, offsetY);
    lensCtx.save();
    lensCtx.beginPath();
    lensCtx.rect(Game.layout.mapLeft, 0, BOARD.MAP_WIDTH, BOARD.HEIGHT);
    lensCtx.clip();
    lensCtx.translate(Game.layout.mapLeft, 0);
    Game.board.drawMap(lensCtx, visibleArea);
    lensCtx.restore();
    Game.scene.draw(lensCtx, timestamp);
    lensCtx.restore();

    // Monture de la loupe.
    lensCtx.setTransform(1, 0, 0, 1, 0, 0);
    strokeRing(middle - 2.5 * pixelRatio, 3 * pixelRatio, '#ffffff');
    strokeRing(middle - 0.5 * pixelRatio, pixelRatio, 'rgba(20, 25, 20, .45)');
  }

  Game.magnifier = { bind, draw, isActive: () => isActive };
})();
