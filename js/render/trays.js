// Bacs de cartes des deux joueurs (même catalogue de chaque côté).
// Disposition large : un bac de chaque côté de la carte, 2 colonnes de cartes, le nom de la carte
// choisie en haut, l'argent du joueur en bas. Disposition haute (téléphone en hauteur, voir
// js/layout.js) : les deux bacs sous la carte, 4 colonnes de cartes plus grandes, l'argent en haut.
// Derrière les cartes, une jauge alimentée par l'argent descend depuis le haut jusqu'à la
// dernière boutique que le joueur peut s'offrir (avec 200 $ : jusqu'à la carte Jouets).
(function () {
  'use strict';

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
  const COLUMN_STEP = 59;                                        // écart entre deux colonnes de cartes
  const GRID_MARGIN = 8;                                         // marge à gauche et à droite des cartes
  const TALL_HEADER_HEIGHT = 74;                                 // disposition haute : en-tête du bac (nom, argent)
  const TALL_BOTTOM_MARGIN = 6;

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

  // Grille de cartes d'un bac : coin en haut à gauche, grossissement et nombre de colonnes.
  // Dans la grille, les cartes ont toujours la même taille (CARD_WIDTH × CARD_HEIGHT) :
  // en disposition haute, la grille entière est agrandie pour remplir la largeur du bac.
  function grid(player) {
    const tray = Game.layout.trayRect(player);
    if (!Game.layout.isTall) {
      return { x: tray.left, y: FIRST_ROW_Y, scale: 1, columns: 2 };
    }
    const columns = Game.config.layout.TALL_TRAY_COLUMNS;
    return { x: tray.left, y: tray.top + TALL_HEADER_HEIGHT, scale: tray.width / gridWidth(columns), columns };
  }

  // Largeur d'une grille de cartes, marges comprises (en unités de la grille).
  function gridWidth(columns) {
    return 2 * GRID_MARGIN + (columns - 1) * COLUMN_STEP + CARD_WIDTH;
  }

  // Hauteur d'un bac en disposition haute (en-tête puis cartes), pour une largeur donnée.
  function tallHeight(width) {
    const columns = Game.config.layout.TALL_TRAY_COLUMNS;
    const rows = Math.ceil(Game.catalog.CARDS.length / columns);
    return TALL_HEADER_HEIGHT + rows * ROW_STEP * width / gridWidth(columns) + TALL_BOTTOM_MARGIN;
  }

  // [x, y, largeur, hauteur] d'une carte dans la grille.
  function cardRectInGrid(cardIndex, columns) {
    const column = cardIndex % columns;
    const row = Math.floor(cardIndex / columns);
    return [GRID_MARGIN + column * COLUMN_STEP, row * ROW_STEP, CARD_WIDTH, CARD_HEIGHT];
  }

  // [x, y, largeur, hauteur] de la carte n° cardIndex dans le bac d'un joueur, sur le plateau.
  function cardRect(player, cardIndex) {
    const { x, y, scale, columns } = grid(player);
    const [left, top, width, height] = cardRectInGrid(cardIndex, columns);
    return [x + left * scale, y + top * scale, width * scale, height * scale];
  }

  // Zone qu'on peut toucher pour choisir une carte : la carte, un peu de marge et son nom dessous.
  function cardTouchRect(player, cardIndex) {
    const { x, y, scale, columns } = grid(player);
    const [left, top, width] = cardRectInGrid(cardIndex, columns);
    return [x + (left - 2) * scale, y + (top - 2) * scale, (width + 4) * scale, (ROW_STEP - 1) * scale];
  }

  // Forme de la jauge, dans la grille : chaque carte (avec son nom) est une case qui se remplit
  // dans l'ordre des cartes. Les cases se touchent : la jauge forme un seul bloc.
  function gaugePath(c, columns, level) {
    const left = GRID_MARGIN - 2;
    const top = -3;
    const fullRows = Math.floor(level / columns);
    const rest = level - fullRows * columns;
    const rowTop = top + fullRows * ROW_STEP;
    c.beginPath();
    if (fullRows) {
      c.rect(left, top, columns * COLUMN_STEP, fullRows * ROW_STEP);
    }
    for (let column = 0; column < columns; column++) {
      const fill = Math.min(1, rest - column);
      if (fill > 0) {
        c.rect(left + column * COLUMN_STEP, rowTop, COLUMN_STEP, fill * ROW_STEP);
      }
    }
  }

  // Jauge, dessinée dans la grille (c est déjà placé et agrandi).
  function drawMoneyGauge(c, player, columns) {
    const level = gaugeLevels[player];
    if (level <= 0) {
      return;
    }
    const color = PLAYERS.COLORS[player];
    const width = gridWidth(columns);
    const height = Math.ceil(Game.catalog.CARDS.length / columns) * ROW_STEP;
    c.save();
    gaugePath(c, columns, level);
    c.clip();
    // Fond à la couleur du joueur, plus vif en bas (là où l'argent arrive).
    const bottom = -3 + Math.ceil(level / columns) * ROW_STEP;
    const glow = c.createLinearGradient(0, 0, 0, bottom);
    glow.addColorStop(0, Game.utils.mixColor(color, -0.55));
    glow.addColorStop(1, Game.utils.mixColor(color, -0.2));
    c.fillStyle = glow;
    c.fillRect(0, -5, width, height + 5);
    // Rayures qui descendent : la jauge a l'air de couler.
    c.strokeStyle = 'rgba(255,255,255,.07)';
    c.lineWidth = 6;
    const offset = (gaugeTime * 18) % 24;
    for (let k = -width; k < height; k += 24) {
      c.beginPath();
      c.moveTo(0, k + offset);
      c.lineTo(width, k + offset + width * 0.6);
      c.stroke();
    }
    c.restore();
  }

  function isSelected(player, cardIndex) {
    const selection = Game.state.selection;
    return selection && selection.player === player && selection.cardIndex === cardIndex;
  }

  // Dessine une carte dans la grille (c est déjà placé et agrandi).
  function drawCard(c, player, card, cardIndex, columns) {
    const [x, y, width, height] = cardRectInGrid(cardIndex, columns);
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
    // Prix dans la carte, nom en petit dessous (un peu plus gros en disposition haute, où il y a la place).
    c.fillStyle = card.isAction ? '#c0392b' : '#23272b';
    c.font = '800 10.5px Nunito, system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(card.price + ' $', x + width / 2, y + height - 6);
    c.fillStyle = selected ? PLAYERS.COLORS[player] : '#c9ced6';
    c.font = Game.layout.isTall ? '700 10px Nunito, system-ui, sans-serif' : '700 8.5px Nunito, system-ui, sans-serif';
    c.fillText(card.name, x + width / 2, y + height + 6.5, COLUMN_STEP - 2);
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

  // Nom du bac : « Joueur 1 (toi) » sur le bac du joueur humain (à distance ou contre un bot),
  // « Bot (Facile) » sur celui du bot.
  function trayName(player) {
    const isMine = Game.online.myPlayer() === player || (Game.state.botLevel != null && !Game.autoplay.isBot(player));
    const name = Game.autoplay.nameOf(player);
    return isMine ? `${name} (toi)` : name;
  }

  // Ligne sous le nom : carte choisie, coup de pouce, ou invitation à choisir une carte.
  function hintOf(player) {
    const selection = Game.state.selection;
    if (selection && selection.player === player) {
      return { text: Game.catalog.CARDS[selection.cardIndex].name, color: PLAYERS.COLORS[player], isBonus: false };
    }
    if (Game.catalog.hasCatchUpBonus(player)) {
      // Coup de pouce : ce joueur est loin derrière, ses clients rapportent plus.
      const bonus = Math.round((Game.config.catchUp.INCOME_BONUS - 1) * 100);
      return { text: `Coup de pouce +${bonus} %`, color: '#27a35a', isBonus: true };
    }
    return { text: 'Choisis une carte', color: '#9aa2ad', isBonus: false };
  }

  // Textes du bac, disposition large : nom en haut, argent en bas.
  function drawWideTexts(c, player, tray) {
    const middle = tray.left + tray.width / 2;
    const hint = hintOf(player);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = '800 16px "Baloo 2", system-ui, sans-serif';
    c.fillStyle = '#ffffff';
    c.fillText(trayName(player), middle, 21, tray.width - 8);
    if (hint.isBonus) {
      c.fillStyle = hint.color;
      roundedRectPath(c, tray.left + 8, 31, tray.width - 16, 16, 8);
      c.fill();
      c.fillStyle = '#ffffff';
      c.font = '800 10px Nunito, system-ui, sans-serif';
      c.fillText(hint.text, middle, 39.5);
    } else {
      c.fillStyle = hint.color;
      c.font = '700 11px Nunito, system-ui, sans-serif';
      c.fillText(hint.text, middle, 39);
    }
    const bottom = tray.top + tray.height;
    c.fillStyle = '#ffffff';
    c.font = '800 28px "Baloo 2", system-ui, sans-serif';
    c.fillText(Game.state.bucks[player], middle, bottom - 40);
    c.fillStyle = '#9aa2ad';
    c.font = '700 12px Nunito, system-ui, sans-serif';
    c.fillText(`objectif ${Game.config.victory.TARGET_BUCKS} $`, middle, bottom - 18);
  }

  // Textes du bac, disposition haute : nom et argent sur la première ligne, aide et objectif dessous.
  function drawTallTexts(c, player, tray) {
    const left = tray.left + 14;
    const right = tray.left + tray.width - 14;
    const hint = hintOf(player);
    const money = `${Game.state.bucks[player]} $`;
    c.textBaseline = 'middle';
    c.textAlign = 'right';
    c.fillStyle = '#ffffff';
    c.font = '800 36px "Baloo 2", system-ui, sans-serif';
    c.fillText(money, right, tray.top + 30);
    const moneyWidth = c.measureText(money).width;
    c.textAlign = 'left';
    c.font = '800 28px "Baloo 2", system-ui, sans-serif';
    c.fillText(trayName(player), left, tray.top + 30, right - left - moneyWidth - 16);
    c.font = '700 20px Nunito, system-ui, sans-serif';
    const hintMaxWidth = tray.width * 0.6;
    if (hint.isBonus) {
      const hintWidth = Math.min(c.measureText(hint.text).width, hintMaxWidth);
      c.fillStyle = hint.color;
      roundedRectPath(c, left - 6, tray.top + 48, hintWidth + 12, 25, 12);
      c.fill();
      c.fillStyle = '#ffffff';
    } else {
      c.fillStyle = hint.color;
    }
    c.fillText(hint.text, left, tray.top + 61, hintMaxWidth);
    c.textAlign = 'right';
    c.fillStyle = '#9aa2ad';
    c.font = '700 16px Nunito, system-ui, sans-serif';
    c.fillText(`objectif ${Game.config.victory.TARGET_BUCKS} $`, right, tray.top + 61, tray.width * 0.34);
  }

  function draw(player) {
    const c = Game.view.ctx;
    const tray = Game.layout.trayRect(player);
    const cardGrid = grid(player);

    // Fond et liseré à la couleur du joueur.
    c.fillStyle = '#2a2e36';
    c.fillRect(tray.left, tray.top, tray.width, tray.height);
    c.fillStyle = PLAYERS.COLORS[player];
    c.fillRect(tray.left, tray.top, tray.width, 5);
    if (Game.layout.isTall && player === 1) {
      // Disposition haute : trait sombre entre les deux bacs.
      c.fillStyle = '#16181c';
      c.fillRect(tray.left - 2, tray.top, 4, tray.height);
    }

    // Jauge et cartes, dans le repère de la grille.
    c.save();
    c.translate(cardGrid.x, cardGrid.y);
    c.scale(cardGrid.scale, cardGrid.scale);
    drawMoneyGauge(c, player, cardGrid.columns);
    Game.catalog.CARDS.forEach((card, cardIndex) => drawCard(c, player, card, cardIndex, cardGrid.columns));
    c.restore();

    if (Game.layout.isTall) {
      drawTallTexts(c, player, tray);
    } else {
      drawWideTexts(c, player, tray);
    }
  }

  Game.trays = { cardRect, cardTouchRect, tallHeight, update, draw };
})();
