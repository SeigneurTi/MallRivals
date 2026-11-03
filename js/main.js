// Boucle d'animation et démarrage du jeu.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  let lastTimestamp = 0;

  // Fait avancer la ville de dt secondes de jeu (rien ne bouge pendant la pause).
  function simulate(dt) {
    const state = Game.state;
    state.gameTime += dt;
    for (const lot of state.lots) {
      Game.shops.update(lot, dt);
    }
    Game.people.updateAll(dt);
    Game.people.spawnIfNeeded(dt);
    Game.events.updateAnimations(dt);
    Game.events.maybeTriggerRandomEvents(dt);
  }

  function render(timestamp) {
    const view = Game.view;
    const ctx = view.ctx;
    const pixelsPerUnit = view.pixelRatio * view.scale;

    // Fond de carte précalculé.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
    ctx.drawImage(view.backgroundCanvas, 0, 0);
    ctx.setTransform(pixelsPerUnit, 0, 0, pixelsPerUnit, 0, 0);

    // Tout ce qui est sur la carte, découpé à ses bords.
    ctx.save();
    ctx.translate(BOARD.MAP_LEFT, 0);
    ctx.beginPath();
    ctx.rect(0, 0, BOARD.MAP_WIDTH, BOARD.HEIGHT);
    ctx.clip();
    Game.overlay.drawSelectionTargets(ctx, timestamp);
    for (const lot of Game.state.lots) {
      if (lot.shop) {
        Game.shops.drawLiveLayer(lot, timestamp / 1000);
      }
    }
    Game.people.drawAll(Game.state.hoveredPerson);
    Game.events.drawAnimations(ctx);
    Game.overlay.drawFloatingTexts(ctx);
    if (Game.state.menuLot && Game.state.menuLot.shop) {
      Game.menu.draw(ctx, Game.state.menuLot);
    }
    Game.overlay.drawTooltip(ctx);
    Game.overlay.drawBanner(ctx);
    Game.overlay.drawPauseBadge(ctx);
    ctx.restore();

    Game.trays.draw(0);
    Game.trays.draw(1);
  }

  function step(timestamp) {
    // Temps réel écoulé, plafonné ; le temps de jeu suit le curseur « Vitesse ».
    const realDt = Math.min(Game.config.loop.MAX_FRAME_SECONDS, (timestamp - lastTimestamp) / 1000 || 0);
    lastTimestamp = timestamp;
    if (Game.state.isRunning) {
      simulate(realDt * Game.state.speedMultiplier);
    }
    Game.feedback.update(realDt);
    render(timestamp);
  }

  function frame(timestamp) {
    try {
      // Le canvas n'a pas encore de taille (page pas encore mise en page) : on réessaie.
      if (!Game.view.backgroundCanvas.width || !Game.view.canvas.width) {
        Game.view.resize();
        requestAnimationFrame(frame);
        return;
      }
      step(timestamp);
    } catch (error) {
      const errorElement = document.getElementById('err');
      errorElement.hidden = false;
      errorElement.textContent = 'Erreur : ' + error.message;
    }
    requestAnimationFrame(frame);
  }

  Game.input.bind();
  Game.view.watchResize();
  Game.world.reset();
  Game.view.resize();
  Game.input.syncPlayButton();
  requestAnimationFrame(frame);
})();
