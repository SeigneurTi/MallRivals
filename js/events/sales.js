// Soldes : un compte à rebours de 2 minutes, affiché dans le coin de la carte. À zéro, des clients
// arrivent en courant par les 4 routes et se ruent dans plusieurs boutiques tirées au hasard.
// Chacun de ces clients rapporte deux fois moins qu'un client normal. Puis le compte à rebours repart.
(function () {
  'use strict';

  const SALES = Game.config.sales;
  const { log } = Game.feedback;

  // Nouvelle partie : le compte à rebours repart de 2 minutes.
  function resetSales() {
    Game.state.sales = { countdown: SALES.COUNTDOWN_SECONDS, startedAt: -Infinity };
  }

  // Appelé à chaque image de jeu (rien ne se passe pendant la pause).
  function updateSales(dt) {
    const sales = Game.state.sales;
    sales.countdown -= dt;
    if (sales.countdown <= 0) {
      sales.countdown += SALES.COUNTDOWN_SECONDS;
      startSales();
    }
  }

  function startSales() {
    const state = Game.state;
    state.sales.startedAt = state.gameTime;
    const candidates = state.lots.filter(lot => lot.shop && !lot.isBank);
    const targets = Game.utils.shuffled(candidates).slice(0, SALES.SHOP_COUNT);
    if (!targets.length) {
      log("Les soldes commencent… mais la ville n'a encore aucune boutique !");
      return;
    }
    let shopperCount = 0;
    for (const lot of targets) {
      lot.salesUntil = state.gameTime + SALES.LABEL_SECONDS;
      const count = Math.min(SALES.MAX_SHOPPERS_PER_SHOP, Game.catalog.capacityOf(lot.shop));
      for (let k = 0; k < count; k++) {
        state.people.push(Game.people.create(false, lot));
        shopperCount++;
      }
    }
    log(`C'est les soldes ! ${shopperCount} clients se ruent dans ${targets.length} boutiques (gains divisés par 2).`);
  }

  // La boutique affiche-t-elle la pastille « Soldes » ?
  function isOnSale(lot) {
    return lot.salesUntil > Game.state.gameTime;
  }

  // Les soldes viennent-elles de commencer (pour faire clignoter le compte à rebours) ?
  function salesJustStarted() {
    return Game.state.gameTime - Game.state.sales.startedAt < SALES.LABEL_SECONDS;
  }

  Object.assign(Game.events, { resetSales, updateSales, isOnSale, salesJustStarted });
})();
