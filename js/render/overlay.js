// Ce qui se dessine par-dessus la carte : cases jouables, textes flottants,
// info-bulle d'un passant, compte à rebours des soldes, bannière du journal, badge « Pause ».
// Coordonnées dans le repère de la carte.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const FEEDBACK = Game.config.feedback;
  const { roundedRectPath } = Game.draw;
  const SALES_CLOCK_RADIUS = 40;

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
      if (Game.actions.isValidTarget(card, selection.player, lot)) {
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

  // Compte à rebours des soldes, au milieu du parc de gauche.
  // Il clignote en rose quand les soldes commencent, en rouge dans les 10 dernières secondes.
  function drawSalesClock(ctx) {
    const sales = Game.state.sales;
    if (!sales) {
      return;
    }
    const [centerX, centerY] = Game.map.SALES_CLOCK;
    const radius = SALES_CLOCK_RADIUS;
    const isOn = Game.events.salesJustStarted();
    const pulse = 0.5 + 0.5 * Math.sin(Game.state.gameTime * 8);
    const secondsLeft = Math.ceil(sales.countdown);
    const isSoon = secondsLeft <= 10;

    ctx.fillStyle = isOn ? (pulse > 0.5 ? '#e8578f' : '#f07fa8') : '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Game.draw.FULL_TURN);
    ctx.fill();
    ctx.strokeStyle = '#e8578f';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Anneau qui se vide au fil du compte à rebours.
    if (!isOn) {
      ctx.strokeStyle = 'rgba(232,87,143,.35)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 6, -Math.PI / 2, -Math.PI / 2 + Game.draw.FULL_TURN * sales.countdown / Game.config.sales.COUNTDOWN_SECONDS);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isOn) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 15px "Baloo 2", system-ui, sans-serif';
      ctx.fillText('SOLDES', centerX, centerY - 6);
      ctx.font = '800 11px Nunito, system-ui, sans-serif';
      ctx.fillText('−50 %', centerX, centerY + 10);
      return;
    }
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    ctx.fillStyle = '#c2185b';
    ctx.font = '800 9.5px Nunito, system-ui, sans-serif';
    ctx.fillText('Soldes dans', centerX, centerY - 11);
    ctx.fillStyle = isSoon && pulse > 0.5 ? '#c0392b' : '#23272b';
    ctx.font = '800 19px "Baloo 2", system-ui, sans-serif';
    ctx.fillText(minutes + ':' + seconds, centerX, centerY + 7);
  }

  // Fin de partie : la carte s'assombrit et un panneau annonce le gagnant.
  function drawVictory(ctx) {
    const state = Game.state;
    if (state.winner == null) {
      return;
    }
    const players = Game.config.players;
    const victory = Game.config.victory;
    const fadeIn = Math.min(1, state.victoryAge * 2);
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = 'rgba(20,25,30,.55)';
    ctx.fillRect(0, 0, BOARD.MAP_WIDTH, BOARD.HEIGHT);
    const width = 420;
    const height = 170;
    const left = BOARD.MAP_WIDTH / 2 - width / 2;
    const top = BOARD.HEIGHT / 2 - height / 2;
    ctx.fillStyle = '#ffffff';
    roundedRectPath(ctx, left, top, width, height, 18);
    ctx.fill();
    ctx.fillStyle = players.COLORS[state.winner];
    roundedRectPath(ctx, left, top, width, 10, 5);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = players.COLORS[state.winner];
    ctx.font = '800 34px "Baloo 2", system-ui, sans-serif';
    ctx.fillText(`${players.NAMES[state.winner]} gagne !`, BOARD.MAP_WIDTH / 2, top + 55);
    const minutes = Math.floor(state.gameTime / 60);
    const seconds = Math.floor(state.gameTime % 60);
    ctx.fillStyle = '#23272b';
    ctx.font = '700 15px Nunito, system-ui, sans-serif';
    ctx.fillText(`${victory.TARGET_BUCKS} $ atteints en ${minutes} min ${seconds} s · ${state.bucks[0]} $ contre ${state.bucks[1]} $`, BOARD.MAP_WIDTH / 2, top + 98, width - 30);
    ctx.fillStyle = '#5d6560';
    ctx.font = '600 13px Nunito, system-ui, sans-serif';
    const restartIn = Math.ceil(victory.AUTOPLAY_RESTART_SECONDS - state.victoryAge);
    let hint = state.isAutoplay ? `Nouvelle partie dans ${restartIn} s` : 'Touche « Recommencer » pour rejouer';
    if (Game.online.isGuest()) {
      hint = `${players.NAMES[Game.online.HOST_PLAYER]} peut relancer une partie (« Recommencer »)`;
    }
    ctx.fillText(hint, BOARD.MAP_WIDTH / 2, top + 132);
    ctx.globalAlpha = 1;
  }

  // Partie à distance, chez l'ami : la ville de l'hôte n'est pas encore arrivée.
  function drawWaitingForHost(ctx) {
    if (!Game.online.isWaitingForSnapshot()) {
      return;
    }
    ctx.fillStyle = 'rgba(20,25,30,.6)';
    ctx.fillRect(0, 0, BOARD.MAP_WIDTH, BOARD.HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 22px "Baloo 2", system-ui, sans-serif';
    ctx.fillText(`Connexion à la ville de ${Game.config.players.NAMES[Game.online.HOST_PLAYER]}…`, BOARD.MAP_WIDTH / 2, BOARD.HEIGHT / 2);
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

  Game.overlay = { drawSelectionTargets, drawFloatingTexts, drawTooltip, drawSalesClock, drawBanner, drawPauseBadge, drawVictory, drawWaitingForHost };
})();
