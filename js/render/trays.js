// Bacs de cartes des deux joueurs (même catalogue de chaque côté) : 2 colonnes de cartes,
// le nom de la carte choisie en haut, l'argent du joueur en bas.
// Derrière les cartes, une jauge alimentée par l'argent descend depuis le haut jusqu'à la
// dernière boutique que le joueur peut s'offrir (avec 200 $ : jusqu'à la carte Jouets).
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const PLAYERS = Game.config.players;
  const { circle, roundedRectPath } = Game.draw;

  // Les cartes, en rangées de 2, se répartissent entre le nom du joueur (en haut) et son argent
  // (en bas) : plus il y a de cartes, plus elles sont basses. Sous chaque carte, 12 unités pour le nom.
  const CARD_WIDTH = 55;
  const FIRST_ROW_Y = 46;
  const LAST_NAME_Y = 698;   // le nom de la dernière carte doit finir avant l'argent du joueur
  const ROW_COUNT = Math.ceil(Game.catalog.CARDS.length / 2);
  const ROW_STEP = Math.min(58, Math.floor((LAST_NAME_Y - FIRST_ROW_Y) / ROW_COUNT));
  const CARD_HEIGHT = ROW_STEP - 12;
  const ICON_Y = Math.round(CARD_HEIGHT * 0.36);                // centre de l'icône, depuis le haut de la carte
  const ICON_RADIUS = Math.min(11.5, CARD_HEIGHT * 0.27);
  const ACTION_ICON_SIZE = Math.min(24, CARD_HEIGHT - 16);
  const COLUMN_STEP = 59;                                        // écart entre les deux colonnes de cartes

  // Jauge : nombre de cartes boutiques « remplies », qui rattrape peu à peu l'argent du joueur.
  const gaugeLevels = [0, 0];
  let gaugeTime = 0;

  // Nombre de boutiques que le joueur peut s'offrir (elles sont rangées de la moins chère à la plus chère).
  function affordableShopCount(player) {
    return Game.catalog.SHOPS.filter(shop => shop.price <= Game.state.bucks[player]).length;
  }

  // Appelé à chaque image (temps réel) : la jauge monte ou descend en douceur.
  function update(dt) {
    gaugeTime += dt;
    const blend = Math.min(1, dt * Game.config.moneyGauge.FILL_SPEED);
    for (const player of [0, 1]) {
      const target = affordableShopCount(player);
      gaugeLevels[player] += (target - gaugeLevels[player]) * blend;
      if (Math.abs(target - gaugeLevels[player]) < 0.01) {
        gaugeLevels[player] = target;
      }
    }
  }

  function trayLeft(player) {
    return player ? BOARD.WIDTH - BOARD.TRAY_WIDTH : 0;
  }

  // [x, y, largeur, hauteur] de la carte n° cardIndex dans le bac d'un joueur.
  function cardRect(player, cardIndex) {
    const column = cardIndex % 2;
    const row = Math.floor(cardIndex / 2);
    return [trayLeft(player) + 8 + column * COLUMN_STEP, FIRST_ROW_Y + row * ROW_STEP, CARD_WIDTH, CARD_HEIGHT];
  }

  // Forme de la jauge : chaque carte (avec son nom) est une case qui se remplit de haut en bas,
  // dans l'ordre des cartes. Les cases se touchent : la jauge forme un seul bloc.
  function gaugePath(c, player, level) {
    const left = trayLeft(player) + 6;
    const top = FIRST_ROW_Y - 3;
    const fullRows = Math.floor(level / 2);
    const rest = level - fullRows * 2;
    const rowTop = top + fullRows * ROW_STEP;
    c.beginPath();
    if (fullRows) {
      c.rect(left, top, 2 * COLUMN_STEP, fullRows * ROW_STEP);
    }
    if (rest > 0) {
      c.rect(left, rowTop, COLUMN_STEP, Math.min(1, rest) * ROW_STEP);
    }
    if (rest > 1) {
      c.rect(left + COLUMN_STEP, rowTop, COLUMN_STEP, (rest - 1) * ROW_STEP);
    }
  }

  function drawMoneyGauge(c, player) {
    const level = gaugeLevels[player];
    if (level <= 0) {
      return;
    }
    const left = trayLeft(player);
    const color = PLAYERS.COLORS[player];
    c.save();
    gaugePath(c, player, level);
    c.clip();
    // Fond à la couleur du joueur, plus vif en bas (là où l'argent arrive).
    const bottom = FIRST_ROW_Y - 3 + Math.ceil(level / 2) * ROW_STEP;
    const glow = c.createLinearGradient(0, FIRST_ROW_Y, 0, bottom);
    glow.addColorStop(0, Game.utils.mixColor(color, -0.55));
    glow.addColorStop(1, Game.utils.mixColor(color, -0.2));
    c.fillStyle = glow;
    c.fillRect(left, 0, BOARD.TRAY_WIDTH, BOARD.HEIGHT);
    // Rayures qui descendent : la jauge a l'air de couler.
    c.strokeStyle = 'rgba(255,255,255,.07)';
    c.lineWidth = 6;
    const offset = (gaugeTime * 18) % 24;
    for (let k = -BOARD.TRAY_WIDTH; k < BOARD.HEIGHT; k += 24) {
      c.beginPath();
      c.moveTo(left, k + offset);
      c.lineTo(left + BOARD.TRAY_WIDTH, k + offset + BOARD.TRAY_WIDTH * 0.6);
      c.stroke();
    }
    c.restore();
  }

  function isSelected(player, cardIndex) {
    const selection = Game.state.selection;
    return selection && selection.player === player && selection.cardIndex === cardIndex;
  }

  function drawCard(c, player, card, cardIndex) {
    const [x, y, width, height] = cardRect(player, cardIndex);
    const selected = isSelected(player, cardIndex);
    const affordable = Game.state.bucks[player] >= card.price;
    const owned = card.isAction ? 0 : Game.actions.ownedCount(player, card);
    const isMaxed = owned >= Game.config.economy.MAX_SAME_SHOP_PER_PLAYER;

    c.globalAlpha = affordable && !isMaxed ? 1 : 0.4;
    c.fillStyle = card.isAction ? '#fde9e4' : Game.utils.mixColor(card.color, 0.78);
    roundedRectPath(c, x, y, width, height, 7);
    c.fill();
    if (selected) {
      c.strokeStyle = '#ffffff';
      c.lineWidth = 3;
      c.stroke();
      c.strokeStyle = PLAYERS.COLORS[player];
      c.lineWidth = 1.5;
      c.stroke();
    }
    if (card.isAction) {
      Game.sprites.drawActionIcon(c, card, x + width / 2 - ACTION_ICON_SIZE / 2, y + 3, ACTION_ICON_SIZE);
    } else {
      circle(c, x + width / 2, y + ICON_Y, ICON_RADIUS, '#ffffff');
      Game.icons.draw(c, card.icon, x + width / 2, y + ICON_Y, ICON_RADIUS * 0.71, card.color);
    }
    // Prix dans la carte, nom en petit dessous.
    c.fillStyle = card.isAction ? '#c0392b' : '#23272b';
    c.font = '800 10.5px Nunito, system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(card.price + ' $', x + width / 2, y + height - 6);
    c.fillStyle = selected ? PLAYERS.COLORS[player] : '#c9ced6';
    c.font = '700 8.5px Nunito, system-ui, sans-serif';
    c.fillText(card.name, x + width / 2, y + height + 6.5, width + 2);
    c.globalAlpha = 1;
    // Pastille « 1/2 », « 2/2 » : combien de boutiques de ce type le joueur possède déjà.
    if (owned) {
      const label = owned + '/' + Game.config.economy.MAX_SAME_SHOP_PER_PLAYER;
      c.fillStyle = isMaxed ? '#c0392b' : PLAYERS.COLORS[player];
      roundedRectPath(c, x + width - 20, y - 3, 22, 12, 6);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = '800 8.5px Nunito, system-ui, sans-serif';
      c.fillText(label, x + width - 9, y + 3.2);
    }
  }

  function draw(player) {
    const c = Game.view.ctx;
    const left = trayLeft(player);
    const middle = left + BOARD.TRAY_WIDTH / 2;
    const selection = Game.state.selection;

    // Fond et liseré à la couleur du joueur.
    c.fillStyle = '#2a2e36';
    c.fillRect(left, 0, BOARD.TRAY_WIDTH, BOARD.HEIGHT);
    c.fillStyle = PLAYERS.COLORS[player];
    c.fillRect(left, 0, BOARD.TRAY_WIDTH, 5);
    drawMoneyGauge(c, player);

    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = '800 16px "Baloo 2", system-ui, sans-serif';
    c.fillStyle = '#ffffff';
    c.fillText(PLAYERS.NAMES[player], middle, 21);

    c.font = '700 11px Nunito, system-ui, sans-serif';
    if (selection && selection.player === player) {
      c.fillStyle = PLAYERS.COLORS[player];
      c.fillText(Game.catalog.CARDS[selection.cardIndex].name, middle, 39);
    } else if (Game.catalog.hasCatchUpBonus(player)) {
      // Coup de pouce : ce joueur est loin derrière, ses clients rapportent plus.
      const bonus = Math.round((Game.config.catchUp.INCOME_BONUS - 1) * 100);
      c.fillStyle = '#27a35a';
      roundedRectPath(c, left + 8, 31, BOARD.TRAY_WIDTH - 16, 16, 8);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = '800 10px Nunito, system-ui, sans-serif';
      c.fillText(`Coup de pouce +${bonus} %`, middle, 39.5);
    } else {
      c.fillStyle = '#9aa2ad';
      c.fillText('Choisis une carte', middle, 39);
    }

    Game.catalog.CARDS.forEach((card, cardIndex) => drawCard(c, player, card, cardIndex));

    c.fillStyle = '#ffffff';
    c.font = '800 28px "Baloo 2", system-ui, sans-serif';
    c.fillText(Game.state.bucks[player], middle, BOARD.HEIGHT - 40);
    c.fillStyle = '#9aa2ad';
    c.font = '700 12px Nunito, system-ui, sans-serif';
    c.fillText(`objectif ${Game.config.victory.TARGET_BUCKS} $`, middle, BOARD.HEIGHT - 18);
  }

  Game.trays = { cardRect, update, draw };
})();
