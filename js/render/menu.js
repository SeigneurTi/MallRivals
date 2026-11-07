// Menu d'une boutique : informations, amélioration, bouclier, fermer.
// Coordonnées dans le repère de la carte. Sur petit écran, tout le menu est grossi
// (Game.layout.uiScale) : il est dessiné à sa taille normale dans un repère agrandi.
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
    // Dans une partie à distance, on n'améliore que ses propres boutiques.
    if (lot.owner != null && Game.online.canControl(lot.owner)) {
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
    // rect : place de la ligne sur la carte ; localRect : dans le menu, avant grossissement.
    const scale = Game.layout.uiScale;
    const localHeight = 58 + items.length * ITEM_HEIGHT;
    const width = MENU_WIDTH * scale;
    const height = localHeight * scale;
    let x = lot.x + lot.width / 2 - width / 2;
    let y = lot.y + lot.height + 8;
    if (y + height > BOARD.HEIGHT - 6) {
      y = lot.y - height - 8;
    }
    x = Math.max(6, Math.min(BOARD.MAP_WIDTH - width - 6, x));
    y = Math.max(6, Math.min(BOARD.HEIGHT - height - 6, y));
    items.forEach((item, k) => {
      item.localRect = [10, 50 + k * ITEM_HEIGHT, MENU_WIDTH - 20, 30];
      item.rect = item.localRect.map((value, index) => value * scale + (index === 0 ? x : index === 1 ? y : 0));
    });
    return { x, y, width, height, scale, localHeight, items };
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
    const ownerName = lot.owner != null ? Game.autoplay.nameOf(lot.owner) : 'Sans propriétaire';
    c.save();
    c.translate(menu.x, menu.y);
    c.scale(menu.scale, menu.scale);

    // Ombre et fond.
    c.fillStyle = 'rgba(20,25,20,.25)';
    roundedRectPath(c, 3, 4, MENU_WIDTH, menu.localHeight, 12);
    c.fill();
    c.fillStyle = '#ffffff';
    roundedRectPath(c, 0, 0, MENU_WIDTH, menu.localHeight, 12);
    c.fill();

    // Titre et résumé.
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillStyle = '#23272b';
    c.font = '800 17px "Baloo 2", system-ui, sans-serif';
    c.fillText(lot.shop.name, 12, 18);
    c.fillStyle = '#5d6560';
    c.font = '600 11px Nunito, system-ui, sans-serif';
    const summary = lot.isBank ? bankSummary(lot) : `${ownerName} · niv. ${lot.level} · ${Game.catalog.capacityOf(lot.shop)} places · ${Game.catalog.incomePerCustomer(lot)} $/client`;
    c.fillText(summary, 12, 37, MENU_WIDTH - 20);

    for (const item of menu.items) {
      const [x, y, width, height] = item.localRect;
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
    c.restore();
  }

  Game.menu = { layout, draw };
})();
