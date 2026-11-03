// Bacs de cartes des deux joueurs (même catalogue de chaque côté) : 2 colonnes de cartes,
// le nom de la carte choisie en haut, l'argent du joueur en bas.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const PLAYERS = Game.config.players;
  const { circle, roundedRectPath } = Game.draw;

  // 24 cartes en 12 rangées de 2, entre le nom du joueur (en haut) et son argent (en bas).
  const CARD_WIDTH = 55;
  const CARD_HEIGHT = 42;
  const FIRST_ROW_Y = 46;
  const ROW_STEP = 54;
  const ICON_Y = 15;   // centre de l'icône, depuis le haut de la carte

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
      Game.sprites.drawActionIcon(c, card, x + width / 2 - 12, y + 3, 24);
    } else {
      circle(c, x + width / 2, y + ICON_Y, 11.5, '#ffffff');
      Game.icons.draw(c, card.icon, x + width / 2, y + ICON_Y, 8.2, card.color);
    }
    // Prix dans la carte, nom en petit dessous.
    c.fillStyle = card.isAction ? '#c0392b' : '#23272b';
    c.font = '800 10.5px Nunito, system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(card.price + ' $', x + width / 2, y + height - 7);
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
