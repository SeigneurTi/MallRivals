// Menu d'une boutique : informations, amélioration, bouclier, fermer.
// Coordonnées dans le repère de la carte.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const ECONOMY = Game.config.economy;
  const { roundedRectPath } = Game.draw;

  const MENU_WIDTH = 220;
  const ITEM_HEIGHT = 36;

  // Position du menu et de ses lignes. Chaque ligne : { label, cost, action, rect }.
  // action vaut 'upgrade', 'shield', 'close', ou null pour une ligne grisée (maximum atteint).
  function layout(lot) {
    const items = [];
    if (lot.owner != null) {
      const canUpgrade = lot.level < ECONOMY.MAX_LEVEL;
      items.push({
        label: canUpgrade ? `Améliorer → niv. ${lot.level + 1}` : 'Niveau max atteint',
        cost: canUpgrade ? Game.catalog.upgradeCost(lot) : null,
        action: canUpgrade ? 'upgrade' : null,
      });
      const canAddShield = lot.shields < ECONOMY.MAX_SHIELDS;
      items.push({
        label: canAddShield ? `Bouclier (${lot.shields}/${ECONOMY.MAX_SHIELDS})` : 'Boucliers au max',
        cost: canAddShield ? Game.catalog.shieldCost(lot) : null,
        action: canAddShield ? 'shield' : null,
      });
    }
    items.push({ label: 'Fermer', cost: null, action: 'close' });

    // Sous la case, ou au-dessus s'il n'y a pas la place, sans sortir de la carte.
    const height = 58 + items.length * ITEM_HEIGHT;
    let x = lot.x + lot.width / 2 - MENU_WIDTH / 2;
    let y = lot.y + lot.height + 8;
    if (y + height > BOARD.HEIGHT - 6) {
      y = lot.y - height - 8;
    }
    x = Math.max(6, Math.min(BOARD.MAP_WIDTH - MENU_WIDTH - 6, x));
    y = Math.max(6, y);
    items.forEach((item, k) => {
      item.rect = [x + 10, y + 50 + k * ITEM_HEIGHT, MENU_WIDTH - 20, 30];
    });
    return { x, y, width: MENU_WIDTH, height, items };
  }

  // « À personne · coffre plein : 600 $ à piller » ou « … · coffre plein dans 1 min 20 s ».
  function bankSummary(lot) {
    if (Game.shops.isBankFull(lot)) {
      return `À personne · coffre plein : ${Game.config.bank.LOOT} $ à piller (voiture-voleur)`;
    }
    const secondsLeft = Math.ceil((1 - lot.bank.gold) * Game.config.bank.REFILL_SECONDS);
    const minutes = Math.floor(secondsLeft / 60);
    const wait = minutes ? `${minutes} min ${secondsLeft % 60} s` : `${secondsLeft} s`;
    return `À personne · coffre plein dans ${wait}`;
  }

  function draw(c, lot) {
    const menu = layout(lot);
    const ownerName = lot.owner != null ? Game.config.players.NAMES[lot.owner] : 'Sans propriétaire';

    // Ombre et fond.
    c.fillStyle = 'rgba(20,25,20,.25)';
    roundedRectPath(c, menu.x + 3, menu.y + 4, menu.width, menu.height, 12);
    c.fill();
    c.fillStyle = '#ffffff';
    roundedRectPath(c, menu.x, menu.y, menu.width, menu.height, 12);
    c.fill();

    // Titre et résumé.
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillStyle = '#23272b';
    c.font = '800 17px "Baloo 2", system-ui, sans-serif';
    c.fillText(lot.shop.name, menu.x + 12, menu.y + 18);
    c.fillStyle = '#5d6560';
    c.font = '600 11px Nunito, system-ui, sans-serif';
    const summary = lot.isBank ? bankSummary(lot) : `${ownerName} · niv. ${lot.level} · ${Game.catalog.capacityOf(lot.shop)} places · ${Game.catalog.incomePerCustomer(lot)} $/client`;
    c.fillText(summary, menu.x + 12, menu.y + 37, menu.width - 20);

    for (const item of menu.items) {
      const [x, y, width, height] = item.rect;
      const enabled = item.action === 'close' || (item.action && Game.state.bucks[lot.owner] >= item.cost);
      if (item.action === 'close') {
        c.fillStyle = '#eef0ec';
      } else if (enabled) {
        c.fillStyle = item.action === 'shield' ? '#e3edff' : '#fff1e6';
      } else {
        c.fillStyle = '#f2f2f2';
      }
      roundedRectPath(c, x, y, width, height, 8);
      c.fill();
      c.fillStyle = enabled ? '#23272b' : '#9aa0a6';
      c.font = '700 13px Nunito, system-ui, sans-serif';
      c.textAlign = 'left';
      c.fillText(item.label, x + 10, y + height / 2 + 0.5);
      if (item.cost != null) {
        c.textAlign = 'right';
        c.fillStyle = enabled ? '#c05621' : '#9aa0a6';
        c.fillText(item.cost + ' $', x + width - 10, y + height / 2 + 0.5);
      }
    }
  }

  Game.menu = { layout, draw };
})();
