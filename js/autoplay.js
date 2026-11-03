// Partie auto : les deux joueurs jouent tout seuls (bouton « Partie auto »).
// Pratique pour regarder la ville vivre : ils construisent, améliorent, protègent,
// pillent la banque et, rarement, s'attaquent. Ils utilisent les mêmes actions qu'un vrai joueur.
(function () {
  'use strict';

  const AUTOPLAY = Game.config.autoplay;
  const { randomBetween, pickRandom } = Game.utils;
  const actions = Game.actions;

  // Délai avant la prochaine décision de chaque joueur (décalés pour ne pas jouer en même temps).
  const decisionTimers = [0.5, 2];

  function cardById(id) {
    return Game.catalog.CARDS.find(card => card.id === id);
  }

  // Boutiques qui ne sont pas encore dans la ville (de la moins chère à la plus chère).
  function missingShops() {
    const builtIds = new Set(Game.state.lots.filter(lot => lot.shop).map(lot => lot.shop.id));
    return Game.catalog.SHOPS.filter(shop => !builtIds.has(shop.id));
  }

  // Argent mis de côté pour la prochaine boutique manquante (0 s'il n'en manque plus).
  function savingsGoal() {
    const hasEmptyLot = Game.state.lots.some(lot => !lot.shop);
    const missing = missingShops();
    return hasEmptyLot && missing.length ? missing[0].price : 0;
  }

  // Construire : d'abord chaque type de boutique une fois (les plus chères possibles),
  // pour que toute la variété soit visible ; ensuite seulement des doublons.
  function tryBuild(player) {
    const emptyLots = Game.state.lots.filter(lot => !lot.shop);
    if (!emptyLots.length) {
      return false;
    }
    const missing = missingShops();
    const affordable = shops => shops.filter(shop => actions.canAfford(player, shop.price));
    // Tant qu'il manque des boutiques, on économise plutôt que d'acheter un doublon.
    const pool = missing.length ? affordable(missing) : affordable(Game.catalog.SHOPS);
    if (!pool.length) {
      return false;
    }
    actions.build(player, pickRandom(emptyLots), pickRandom(pool.slice(-3)));   // une des 3 plus chères
    return true;
  }

  // Améliorer ou protéger une de ses boutiques, sans toucher aux économies.
  function tryImprove(player) {
    const spendable = Game.state.bucks[player] - savingsGoal();
    const choices = [];
    for (const lot of Game.state.lots) {
      if (lot.owner !== player) {
        continue;
      }
      if (actions.canUpgrade(lot) && Game.catalog.upgradeCost(lot) <= spendable) {
        choices.push(() => actions.upgrade(lot));
      }
      if (lot.shields < 1 && actions.canAddShield(lot) && Game.catalog.shieldCost(lot) <= spendable) {
        choices.push(() => actions.addShield(lot));
      }
    }
    if (!choices.length) {
      return false;
    }
    pickRandom(choices)();
    return true;
  }

  // Jouer un malus : piller la banque, ou viser une boutique adverse.
  function tryMalus(player, card, targets) {
    if (!targets.length || !actions.canAfford(player, card.price)) {
      return false;
    }
    return actions.playMalus(player, card, pickRandom(targets)) === null;
  }

  function decide(player) {
    const lots = Game.state.lots;
    const thief = cardById('voleur');
    const meteor = cardById('meteorite');
    const bankTargets = lots.filter(lot => actions.isValidTarget(thief, player, lot) && lot.isBank);
    if (bankTargets.length && Math.random() < AUTOPLAY.BANK_ROBBERY_CHANCE && tryMalus(player, thief, bankTargets)) {
      return;
    }
    if (Math.random() < AUTOPLAY.MALUS_CHANCE) {
      const card = Math.random() < 0.5 ? thief : meteor;
      const targets = lots.filter(lot => actions.isValidTarget(card, player, lot) && !lot.isBank);
      if (tryMalus(player, card, targets)) {
        return;
      }
    }
    if (Math.random() < AUTOPLAY.BUILD_CHANCE && tryBuild(player)) {
      return;
    }
    if (!tryImprove(player)) {
      tryBuild(player);
    }
  }

  // Appelé à chaque image de jeu (rien ne se passe pendant la pause).
  function update(dt) {
    if (!Game.state.isAutoplay) {
      return;
    }
    for (const player of [0, 1]) {
      decisionTimers[player] -= dt;
      if (decisionTimers[player] <= 0) {
        decisionTimers[player] = AUTOPLAY.DECISION_SECONDS * randomBetween(0.7, 1.3);
        decide(player);
      }
    }
  }

  Game.autoplay = { update };
})();
