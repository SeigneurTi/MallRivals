// Ce qui se dessine par-dessus la carte : cases jouables, textes flottants,
// info-bulle d'un passant, bannière du journal, badge « Pause ».
// Coordonnées dans le repère de la carte.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const FEEDBACK = Game.config.feedback;
  const { roundedRectPath } = Game.draw;

  // Contour pointillé animé autour des cases où la carte choisie peut être jouée.
  function drawSelectionTargets(ctx, time) {
    const selection = Game.state.selection;
    if (!selection) {
      return;
    }
    const card = Game.catalog.CARDS[selection.cardIndex];
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -time / 40;
    for (const lot of Game.state.lots) {
      // Malus : une boutique adverse libre de tout événement. Boutique : une case vide.
      const isTarget = card.isAction
        ? (lot.shop && lot.owner === 1 - selection.player && !lot.isBusy)
        : !lot.shop;
      if (isTarget) {
        ctx.strokeStyle = card.isAction ? '#c0392b' : Game.config.players.COLORS[selection.player];
        roundedRectPath(ctx, lot.x + 2, lot.y + 2, lot.width - 4, lot.height - 4, 6);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  // Textes qui montent et s'effacent (règle aussi l'alignement utilisé par l'info-bulle).
  function drawFloatingTexts(ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const floating of Game.state.floatingTexts) {
      const y = floating.y - floating.age * 30;
      ctx.globalAlpha = 1 - floating.age / FEEDBACK.FLOATING_TEXT_SECONDS;
      ctx.font = '800 18px "Baloo 2", system-ui, sans-serif';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(floating.text, floating.x, y);
      ctx.fillStyle = floating.color;
      ctx.fillText(floating.text, floating.x, y);
    }
    ctx.globalAlpha = 1;
  }

  // Prénom et trajet du passant survolé (ou la boutique où il se trouve).
  function drawTooltip(ctx) {
    const person = Game.state.hoveredPerson;
    if (!person || !Game.state.people.includes(person)) {
      return;
    }
    const exitNames = Game.map.EXIT_NAMES;
    const isInShop = (person.state === 'inside' || person.state === 'leaving') && person.lot && person.lot.shop;
    const text = isInShop
      ? `${person.name} · ${person.lot.shop.name}`
      : `${person.name} · de ${exitNames[person.from]} vers ${exitNames[person.to]}`;
    ctx.font = '700 14px Nunito, system-ui, sans-serif';
    const width = ctx.measureText(text).width + 18;
    const x = Math.max(6, Math.min(BOARD.MAP_WIDTH - width - 6, person.x - width / 2));
    const y = Math.max(6, person.y - 52);
    ctx.fillStyle = '#ffffff';
    roundedRectPath(ctx, x, y, width, 26, 8);
    ctx.fill();
    ctx.fillStyle = '#23272b';
    ctx.textAlign = 'left';
    ctx.fillText(text, x + 9, y + 13.5);
  }

  // Dernier message du journal, en bas de la carte : apparaît puis s'efface.
  function drawBanner(ctx) {
    const banner = Game.state.banner;
    if (!banner) {
      return;
    }
    ctx.font = '800 16px Nunito, system-ui, sans-serif';
    const width = Math.min(BOARD.MAP_WIDTH - 40, ctx.measureText(banner.text).width + 30);
    const fadeInOut = Math.min(1, banner.age * 4, (FEEDBACK.BANNER_SECONDS - banner.age) * 2);
    ctx.globalAlpha = fadeInOut;
    ctx.fillStyle = 'rgba(30,34,40,.88)';
    roundedRectPath(ctx, BOARD.MAP_WIDTH / 2 - width / 2, BOARD.HEIGHT - 52, width, 34, 17);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(banner.text, BOARD.MAP_WIDTH / 2, BOARD.HEIGHT - 34.5, width - 20);
    ctx.globalAlpha = 1;
  }

  function drawPauseBadge(ctx) {
    if (Game.state.isRunning) {
      return;
    }
    ctx.fillStyle = 'rgba(30,34,40,.75)';
    roundedRectPath(ctx, BOARD.MAP_WIDTH / 2 - 50, 14, 100, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 15px Nunito, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pause', BOARD.MAP_WIDTH / 2, 29.5);
  }

  Game.overlay = { drawSelectionTargets, drawFloatingTexts, drawTooltip, drawBanner, drawPauseBadge };
})();
