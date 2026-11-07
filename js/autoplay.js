// Joueurs automatiques : la « Partie auto » (les deux joueurs jouent tout seuls) et le bot
// d'une partie « Contre un bot » (Joueur 2, en Facile, Normal ou Difficile).
// Ils utilisent les mêmes actions qu'un vrai joueur (js/actions.js), donc les mêmes règles.
(function () {
  'use strict';

  const AUTOPLAY = Game.config.autoplay;
  const PLAYER_NAMES = Game.config.players.NAMES;
  const { randomBetween, pickRandom } = Game.utils;
  const actions = Game.actions;

  // En partie contre un bot, c'est Joueur 2 (bac de droite) qui est le bot.
  const BOT_PLAYER = 1;

  // Délai avant la prochaine décision de chaque joueur (décalés pour ne pas jouer en même temps).
  const decisionTimers = [0.5, 2];

  // Ce joueur est-il le bot d'une partie « Contre un bot » ? (Le joueur humain ne peut pas toucher à son bac.)
  function isBot(player) {
    return Game.state.botLevel != null && player === BOT_PLAYER;
  }

  // Nom affiché sur le bac et à la victoire : « Bot (Difficile) », ou « Joueur 1 ».
  function nameOf(player) {
    return isBot(player) ? `Bot (${AUTOPLAY.LEVELS[Game.state.botLevel].label})` : PLAYER_NAMES[player];
  }

  // Façon de jouer de ce joueur, ou null s'il est joué par un humain.
  function profileOf(player) {
    if (isBot(player)) {
      return AUTOPLAY.LEVELS[Game.state.botLevel];
    }
    return Game.state.isAutoplay ? AUTOPLAY.SHOWCASE : null;
  }

  function cardById(id) {
    return Game.catalog.CARDS.find(card => card.id === id);
  }

  // Valeur d'une boutique : son prix multiplié par son niveau.
  function valueOf(lot) {
    return lot.shop.price * lot.level;
  }

  function bestBy(items, score) {
    return items.reduce((best, item) => (best == null || score(item) > score(best) ? item : best), null);
  }

  // Boutiques qui ne sont pas encore dans la ville (de la moins chère à la plus chère).
  function missingShops() {
    const builtIds = new Set(Game.state.lots.filter(lot => lot.shop).map(lot => lot.shop.id));
    return Game.catalog.SHOPS.filter(shop => !builtIds.has(shop.id));
  }

  // Argent mis de côté pour la prochaine boutique manquante (0 s'il n'en manque plus).
  function savingsGoal(profile) {
    if (profile.strategy !== 'showcase') {
      return 0;
    }
    const hasEmptyLot = Game.state.lots.some(lot => !lot.shop);
    const missing = missingShops();
    return hasEmptyLot && missing.length ? missing[0].price : 0;
  }

  function affordableShops(player, shops) {
    return shops.filter(shop => actions.canAfford(player, shop.price) && actions.canBuild(player, shop));
  }

  // Construire.
  //   Facile : une des boutiques les moins chères possibles, sur une case au hasard.
  //   Normal : n'importe quelle boutique possible, sur une case au hasard.
  //   Difficile : la boutique la plus chère possible, sur une case animée si possible.
  //   Partie auto : d'abord chaque type de boutique une fois (une des 3 plus chères possibles), puis des doublons.
  function tryBuild(player, profile) {
    const emptyLots = Game.state.lots.filter(lot => !lot.shop);
    if (!emptyLots.length) {
      return false;
    }
    if (profile.strategy === 'easy' || profile.strategy === 'normal') {
      const pool = affordableShops(player, Game.catalog.SHOPS);
      if (!pool.length) {
        return false;
      }
      const choices = profile.strategy === 'easy' ? pool.slice(0, AUTOPLAY.EASY_SHOP_CHOICES) : pool;
      actions.build(player, pickRandom(emptyLots), pickRandom(choices));
      return true;
    }
    if (profile.strategy === 'hard') {
      const pool = affordableShops(player, Game.catalog.SHOPS);
      if (!pool.length) {
        return false;
      }
      const hotLots = emptyLots.filter(lot => lot.isHot);
      actions.build(player, pickRandom(hotLots.length ? hotLots : emptyLots), pool[pool.length - 1]);
      return true;
    }
    const missing = missingShops();
    // Tant qu'il manque des boutiques, on économise plutôt que d'acheter un doublon.
    const pool = affordableShops(player, missing.length ? missing : Game.catalog.SHOPS);
    if (!pool.length) {
      return false;
    }
    actions.build(player, pickRandom(emptyLots), pickRandom(pool.slice(-3)));
    return true;
  }

  // Améliorer ou protéger une de ses boutiques.
  //   Facile : rien (il ne fait que construire).
  //   Normal, Partie auto : au hasard, un bouclier au plus par boutique (Partie auto : sans toucher aux économies).
  //   Difficile : protège ses boutiques les plus rentables quand l'adversaire peut lancer une météorite,
  //   sinon améliore celle qui rapporte le plus.
  function tryImprove(player, profile) {
    const spendable = Game.state.bucks[player] - savingsGoal(profile);
    const myLots = Game.state.lots.filter(lot => lot.owner === player);
    const canUpgrade = lot => actions.canUpgrade(lot) && Game.catalog.upgradeCost(lot) <= spendable;
    const canShield = lot => lot.shields < profile.MAX_SHIELDS && actions.canAddShield(lot) && Game.catalog.shieldCost(lot) <= spendable;

    if (profile.strategy === 'easy') {
      return false;
    }
    if (profile.strategy === 'hard') {
      const opponentCanAttack = actions.canAfford(1 - player, cardById('meteorite').price);
      const mostValuable = myLots.slice().sort((a, b) => valueOf(b) - valueOf(a)).slice(0, AUTOPLAY.HARD_PROTECTED_SHOPS);
      const toShield = opponentCanAttack ? mostValuable.find(canShield) : null;
      if (toShield) {
        actions.addShield(toShield);
        return true;
      }
      const toUpgrade = bestBy(myLots.filter(canUpgrade), valueOf);
      if (toUpgrade) {
        actions.upgrade(toUpgrade);
        return true;
      }
      return false;
    }

    const choices = [];
    for (const lot of myLots) {
      if (canUpgrade(lot)) {
        choices.push(() => actions.upgrade(lot));
      }
      if (canShield(lot)) {
        choices.push(() => actions.addShield(lot));
      }
    }
    if (!choices.length) {
      return false;
    }
    pickRandom(choices)();
    return true;
  }

  // Jouer un malus sur une cible. Renvoie true s'il est parti.
  function tryMalus(player, card, target) {
    if (!target || !actions.canAfford(player, card.price)) {
      return false;
    }
    return actions.playMalus(player, card, target) === null;
  }

  // Attaquer l'adversaire. Difficile : météorite sur sa boutique la plus rentable (sans bouclier si possible),
  // surtout quand il est devant. Sinon : météorite ou voleur sur une boutique au hasard.
  function tryAttack(player, profile) {
    const lots = Game.state.lots;
    const thief = cardById('voleur');
    const meteor = cardById('meteorite');
    if (profile.strategy === 'hard') {
      const isBehind = Game.catalog.wealthOf(player) < Game.catalog.wealthOf(1 - player);
      if (Math.random() >= (isBehind ? profile.MALUS_CHANCE_WHEN_BEHIND : profile.MALUS_CHANCE)) {
        return false;
      }
      const targets = lots.filter(lot => actions.isValidTarget(meteor, player, lot) && !lot.isBank);
      const unshielded = targets.filter(lot => !lot.shields);
      const target = bestBy(unshielded.length ? unshielded : targets, valueOf);
      return Boolean(target) && valueOf(target) >= AUTOPLAY.HARD_MIN_TARGET_VALUE && tryMalus(player, meteor, target);
    }
    if (Math.random() >= profile.MALUS_CHANCE) {
      return false;
    }
    const card = Math.random() < 0.5 ? thief : meteor;
    const targets = lots.filter(lot => actions.isValidTarget(card, player, lot) && !lot.isBank);
    return targets.length > 0 && tryMalus(player, card, pickRandom(targets));
  }

  function decide(player, profile) {
    const thief = cardById('voleur');
    const bank = Game.state.lots.find(lot => lot.isBank && actions.isValidTarget(thief, player, lot));
    if (bank && Math.random() < profile.BANK_ROBBERY_CHANCE && tryMalus(player, thief, bank)) {
      return;
    }
    if (tryAttack(player, profile)) {
      return;
    }
    if (Math.random() < profile.BUILD_CHANCE && tryBuild(player, profile)) {
      return;
    }
    if (!tryImprove(player, profile)) {
      tryBuild(player, profile);
    }
  }

  // Appelé à chaque image de jeu (rien ne se passe pendant la pause).
  function update(dt) {
    for (const player of [0, 1]) {
      const profile = profileOf(player);
      if (!profile) {
        continue;
      }
      decisionTimers[player] -= dt;
      if (decisionTimers[player] <= 0) {
        decisionTimers[player] = profile.DECISION_SECONDS * randomBetween(0.7, 1.3);
        decide(player, profile);
      }
    }
  }

  Game.autoplay = { BOT_PLAYER, update, isBot, nameOf };
})();
