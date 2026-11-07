// Actions d'un joueur : construire, améliorer, protéger, jouer un malus.
// Utilisées par les clics (js/input.js) et par la partie auto (js/autoplay.js),
// pour que les deux suivent exactement les mêmes règles.
(function () {
  'use strict';

  const ECONOMY = Game.config.economy;
  const { log, floatText } = Game.feedback;
  const { shopName } = Game.names;

  function canAfford(player, cost) {
    return Game.state.bucks[player] >= cost;
  }

  // Nombre de boutiques de ce type que possède le joueur.
  function ownedCount(player, shop) {
    return Game.state.lots.filter(lot => lot.owner === player && lot.shop && lot.shop.id === shop.id).length;
  }

  // Le joueur peut-il encore construire cette boutique ? Pas plus de 2 fois la même.
  function canBuild(player, shop) {
    return ownedCount(player, shop) < ECONOMY.MAX_SAME_SHOP_PER_PLAYER;
  }

  // Ouvre une boutique sur une case libre (le prix est payé).
  function build(player, lot, shop) {
    Game.state.bucks[player] -= shop.price;
    Game.shops.open(lot, shop, player);
    Game.board.draw();
    log(`${Game.autoplay.nameOf(player)} ouvre ${shopName(lot)}.`);
  }

  function canUpgrade(lot) {
    return lot.owner != null && lot.level < ECONOMY.MAX_LEVEL;
  }

  function upgrade(lot) {
    Game.state.bucks[lot.owner] -= Game.catalog.upgradeCost(lot);
    lot.level++;
    Game.board.draw();
    floatText(lot, 'Niveau ' + lot.level, '#b7791f');
    log(`${Game.autoplay.nameOf(lot.owner)} améliore ${shopName(lot)} au niveau ${lot.level}.`);
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
  // Boutique : une case vide, si le joueur n'en a pas déjà 2. Malus : une boutique adverse, ou la banque pleine (voleur seulement).
  function isValidTarget(card, player, lot) {
    if (!card.isAction) {
      return !lot.shop && canBuild(player, card);
    }
    if (!lot.shop || lot.isBusy) {
      return false;
    }
    if (lot.isBank) {
      return card.id === 'voleur' && Game.shops.isBankFull(lot);
    }
    return lot.owner === 1 - player;
  }

  // Raison pour laquelle un malus ne peut pas partir sur cette case, ou null.
  function malusRefusal(player, card, lot) {
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
    return null;
  }

  // Joue un malus. Renvoie null s'il est parti, sinon le message à afficher (rien n'est payé).
  function playMalus(player, card, lot) {
    const refusal = malusRefusal(player, card, lot);
    if (refusal) {
      return refusal;
    }
    Game.state.bucks[player] -= card.price;
    if (card.id === 'meteorite') {
      Game.events.launchMeteor(player, lot);
    } else {
      Game.events.launchThief(player, lot);
    }
    return null;
  }

  // ---------- Ordres des joueurs ----------
  // Un ordre est un petit objet, qui peut voyager sur le réseau (partie à distance) :
  //   { type: 'build' | 'malus', lotIndex, cardIndex }   jouer une carte sur une case
  //   { type: 'upgrade' | 'shield', lotIndex }            améliorer ou protéger sa boutique

  // Raison pour laquelle l'ordre est impossible (message à afficher), ou null s'il est possible.
  function commandRefusal(player, command) {
    const state = Game.state;
    const lot = state.lots[command.lotIndex];
    if (!lot) {
      return 'Case inconnue';
    }
    if (command.type === 'build' || command.type === 'malus') {
      const card = Game.catalog.CARDS[command.cardIndex];
      if (!card || Boolean(card.isAction) !== (command.type === 'malus')) {
        return 'Carte inconnue';
      }
      if (!canAfford(player, card.price)) {
        return 'Pas assez de bucks';
      }
      if (command.type === 'build') {
        if (lot.shop) {
          return 'Case déjà prise';
        }
        return canBuild(player, card) ? null : `Déjà ${ECONOMY.MAX_SAME_SHOP_PER_PLAYER} fois !`;
      }
      if (!lot.shop || lot.isBusy) {
        return 'Pas maintenant';
      }
      return malusRefusal(player, card, lot);
    }
    if (command.type === 'upgrade' || command.type === 'shield') {
      if (!lot.shop || lot.owner !== player) {
        return "Ce n'est pas ta boutique";
      }
      const isUpgrade = command.type === 'upgrade';
      if (isUpgrade ? !canUpgrade(lot) : !canAddShield(lot)) {
        return isUpgrade ? 'Niveau max' : 'Boucliers au max';
      }
      const cost = isUpgrade ? Game.catalog.upgradeCost(lot) : Game.catalog.shieldCost(lot);
      return canAfford(player, cost) ? null : 'Pas assez de bucks';
    }
    return 'Ordre inconnu';
  }

  // Exécute l'ordre d'un joueur. Renvoie null s'il a été exécuté, sinon le message de refus.
  function perform(player, command) {
    const refusal = commandRefusal(player, command);
    if (refusal) {
      return refusal;
    }
    const lot = Game.state.lots[command.lotIndex];
    const card = Game.catalog.CARDS[command.cardIndex];
    if (command.type === 'build') {
      build(player, lot, card);
    } else if (command.type === 'malus') {
      playMalus(player, card, lot);
    } else if (command.type === 'upgrade') {
      upgrade(lot);
    } else {
      addShield(lot);
    }
    return null;
  }

  Game.actions = {
    canAfford, ownedCount, canBuild, build, canUpgrade, upgrade, canAddShield, addShield, isValidTarget, playMalus,
    commandRefusal, perform,
  };
})();
