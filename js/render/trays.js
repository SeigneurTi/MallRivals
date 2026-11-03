// Bacs de cartes des deux joueurs (même catalogue de chaque côté) : 2 colonnes de cartes,
// le nom de la carte choisie en haut, l'argent du joueur en bas.
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

  function trayLeft(player) {
    return player ? BOARD.WIDTH - BOARD.TRAY_WIDTH : 0;
  }

  // [x, y, largeur, hauteur] de la carte n° cardIndex dans le bac d'un joueur.
  function cardRect(player, cardIndex) {
    const column = cardIndex % 2;
    const row = Math.floor(cardIndex / 2);
    return [trayLeft(player) + 8 + column * 59, FIRST_ROW_Y + row * ROW_STEP, CARD_WIDTH, CARD_HEIGHT];
  }

  function isSelected(player, cardIndex) {
    const selection = Game.state.selection;
    return selection && selection.player === player && selection.cardIndex === cardIndex;
  }

  function drawCard(c, player, card, cardIndex) {
    const [x, y, width, height] = cardRect(player, cardIndex);
    const selected = isSelected(player, cardIndex);
    const affordable = Game.state.bucks[player] >= card.price;

    c.globalAlpha = affordable ? 1 : 0.4;
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

    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = '800 16px "Baloo 2", system-ui, sans-serif';
    c.fillStyle = '#ffffff';
    c.fillText(PLAYERS.NAMES[player], middle, 21);

    c.font = '700 11px Nunito, system-ui, sans-serif';
    if (selection && selection.player === player) {
      c.fillStyle = PLAYERS.COLORS[player];
      c.fillText(Game.catalog.CARDS[selection.cardIndex].name, middle, 39);
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
    c.fillText('bucks', middle, BOARD.HEIGHT - 18);
  }

  Game.trays = { cardRect, draw };
})();
