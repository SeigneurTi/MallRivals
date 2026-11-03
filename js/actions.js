// Actions d'un joueur : construire, améliorer, protéger, jouer un malus.
// Utilisées par les clics (js/input.js) et par la partie auto (js/autoplay.js),
// pour que les deux suivent exactement les mêmes règles.
(function () {
  'use strict';

  const PLAYER_NAMES = Game.config.players.NAMES;
  const ECONOMY = Game.config.economy;
  const { log, floatText } = Game.feedback;
  const { shopName } = Game.names;

  function canAfford(player, cost) {
    return Game.state.bucks[player] >= cost;
  }

  // Ouvre une boutique sur une case libre (le prix est payé).
  function build(player, lot, shop) {
    Game.state.bucks[player] -= shop.price;
    Game.shops.open(lot, shop, player);
    Game.board.draw();
    log(`${PLAYER_NAMES[player]} ouvre ${shopName(lot)}.`);
  }

  function canUpgrade(lot) {
    return lot.owner != null && lot.level < ECONOMY.MAX_LEVEL;
  }

  function upgrade(lot) {
    Game.state.bucks[lot.owner] -= Game.catalog.upgradeCost(lot);
    lot.level++;
    Game.board.draw();
    floatText(lot, 'Niveau ' + lot.level, '#b7791f');
    log(`${PLAYER_NAMES[lot.owner]} améliore ${shopName(lot)} au niveau ${lot.level}.`);
  }

  function canAddShield(lot) {
    return lot.owner != null && lot.shields < ECONOMY.MAX_SHIELDS;
  }

  function addShield(lot) {
    Game.state.bucks[lot.owner] -= Game.catalog.shieldCost(lot);
    lot.shields++;
    Game.board.draw();
    floatText(lot, 'Bouclier +1', '#3a86ff');
  }

  // La case est-elle une cible possible pour cette carte ?
  // Boutique : une case vide. Malus : une boutique adverse, ou la banque pleine (voleur seulement).
  function isValidTarget(card, player, lot) {
    if (!card.isAction) {
      return !lot.shop;
    }
    if (!lot.shop || lot.isBusy) {
      return false;
    }
    if (lot.isBank) {
      return card.id === 'voleur' && Game.shops.isBankFull(lot);
    }
    return lot.owner === 1 - player;
  }

  // Joue un malus. Renvoie null s'il est parti, sinon le message à afficher (rien n'est payé).
  function playMalus(player, card, lot) {
    if (lot.isBank) {
      if (card.id !== 'voleur') {
        return 'La banque est trop solide !';
      }
      if (!Game.shops.isBankFull(lot)) {
        return 'Coffre vide';
      }
    } else if (lot.owner !== 1 - player) {
      return 'Vise une boutique adverse';
    }
    Game.state.bucks[player] -= card.price;
    if (card.id === 'meteorite') {
      Game.events.launchMeteor(player, lot);
    } else {
      Game.events.launchThief(player, lot);
    }
    return null;
  }

  Game.actions = { canAfford, build, canUpgrade, upgrade, canAddShield, addShield, isValidTarget, playMalus };
})();
