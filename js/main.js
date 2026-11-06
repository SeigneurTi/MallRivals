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
    Game.events.updateSales(dt);
    Game.autoplay.update(dt);
    Game.world.checkVictory();
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
    drawScene(ctx, timestamp);
    Game.magnifier.draw(timestamp);
  }

  // Tout ce qui bouge (carte et bacs de cartes), dans ctx déjà placé dans le repère du plateau.
  // Les fonctions de dessin utilisent Game.view.ctx : on le remplace le temps du dessin.
  function drawScene(ctx, timestamp) {
    const view = Game.view;
    const mainCtx = view.ctx;
    view.ctx = ctx;

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
    for (const lot of Game.state.lots) {
      if (lot.shop) {
        Game.shops.drawOverPeopleLayer(lot, timestamp / 1000);
      }
    }
    Game.events.drawAnimations(ctx);
    Game.overlay.drawFloatingTexts(ctx);
    if (Game.state.menuLot && Game.state.menuLot.shop) {
      Game.menu.draw(ctx, Game.state.menuLot);
    }
    Game.overlay.drawTooltip(ctx);
    Game.overlay.drawSalesClock(ctx);
    Game.overlay.drawBanner(ctx);
    Game.overlay.drawPauseBadge(ctx);
    Game.overlay.drawVictory(ctx);
    ctx.restore();

    Game.trays.draw(0);
    Game.trays.draw(1);
    view.ctx = mainCtx;
  }

  function step(timestamp) {
    // Temps réel écoulé, plafonné ; le temps de jeu suit le curseur « Vitesse ».
    const realDt = Math.min(Game.config.loop.MAX_FRAME_SECONDS, (timestamp - lastTimestamp) / 1000 || 0);
    lastTimestamp = timestamp;
    const state = Game.state;
    if (state.winner != null) {
      // Partie finie : la ville s'arrête ; en partie auto, une nouvelle partie commence peu après.
      state.victoryAge += realDt;
      if (state.isAutoplay && state.victoryAge >= Game.config.victory.AUTOPLAY_RESTART_SECONDS) {
        Game.world.reset();
      }
    } else if (state.isRunning) {
      simulate(realDt * state.speedMultiplier);
    }
    Game.feedback.update(realDt);
    Game.trays.update(realDt);
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

  Game.scene = { draw: drawScene };
  Game.input.bind();
  Game.magnifier.bind();
  Game.view.watchResize();
  Game.world.reset();
  Game.view.resize();
  Game.input.syncPlayButton();
  requestAnimationFrame(frame);
})();
