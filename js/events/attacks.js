// Cartes malus jouées par un joueur contre une boutique adverse : météorite et voiture-voleur.
(function () {
  'use strict';

  const PLAYER_COLORS = Game.config.players.COLORS;
  const { log, floatText } = Game.feedback;
  const { shopName, shopNameAfterDe } = Game.names;

  // Face à une attaque, un bouclier tient (il est alors perdu)… sauf dans 20 % des cas,
  // où il cède : la boutique est détruite quand même.
  // Renvoie 'none' (pas de bouclier), 'holds' (le bouclier tient) ou 'breaks' (il cède).
  function shieldOutcome(lot) {
    if (lot.shields <= 0) {
      return 'none';
    }
    if (Math.random() < Game.config.economy.SHIELD_BREAK_CHANCE) {
      floatText(lot, 'Bouclier percé !', '#c0392b');
      return 'breaks';
    }
    lot.shields--;
    Game.board.draw();
    floatText(lot, 'Bouclier !', '#3a86ff');
    return 'holds';
  }

  // La météorite tombe en diagonale. Un bouclier l'arrête (et il est perdu), sauf s'il cède ;
  // sinon la boutique est détruite.
  function launchMeteor(player, lot) {
    lot.isBusy = true;
    const [centerX, centerY] = Game.world.lotCenter(lot);
    log(`${Game.autoplay.nameOf(player)} envoie une météorite sur ${shopName(lot)} de ${Game.autoplay.nameOf(lot.owner)} !`);
    Game.events.addAnimation({
      kind: 'meteor',
      elapsed: 0,
      duration: Game.config.meteor.FALL_SECONDS,
      from: [centerX + 380, centerY - 520],
      to: [centerX, centerY],
      onEnd() {
        Game.events.addExplosion(centerX, centerY);
        lot.isBusy = false;
        if (!lot.shop) {
          return;
        }
        const shield = shieldOutcome(lot);
        if (shield === 'holds') {
          log(`Le bouclier ${shopNameAfterDe(lot)} a arrêté la météorite.`);
        } else {
          log(shield === 'breaks' ? `Le bouclier a cédé : ${lot.shop.name} détruit par la météorite !` : `${lot.shop.name} détruit par la météorite !`);
          Game.world.destroyShop(lot);
        }
      },
    });
  }

  // La voiture part de la sortie du joueur (ouest pour le joueur 1, est pour le joueur 2),
  // rejoint le carrefour au bout de la rue de la boutique, puis la porte.
  // Réussite : la boutique change de propriétaire et perd ses boucliers.
  // Échec : la boutique perd quand même un bouclier si elle en a.
  function launchThief(player, lot) {
    lot.isBusy = true;
    log(`${Game.autoplay.nameOf(player)} envoie une voiture-voleur vers ${shopName(lot)}…`);
    const street = Game.map.lotStreet[lot.index];
    const startExit = player ? 'east' : 'west';
    const points = [
      ...Game.map.findPath(startExit, street.start).map(id => Game.map.nodes[id]),
      street.access.streetPoint,
      street.access.door,
    ];
    Game.events.addAnimation({
      kind: 'car',
      points,
      segmentIndex: 0,
      distance: 0,
      color: PLAYER_COLORS[player],
      onEnd() {
        lot.isBusy = false;
        if (!lot.shop) {
          return;
        }
        if (lot.isBank) {
          robBank(player, lot);
          return;
        }
        const thief = Game.config.thief;
        const successChance = Math.max(thief.MIN_SUCCESS, thief.BASE_SUCCESS - thief.SUCCESS_LOSS_PER_SHIELD * lot.shields);
        if (Math.random() < successChance) {
          const previousOwner = lot.owner;
          lot.owner = player;
          lot.shields = 0;
          Game.board.draw();
          floatText(lot, 'Volé !', PLAYER_COLORS[player]);
          log(`Vol réussi : ${lot.shop.name} passe de ${Game.autoplay.nameOf(previousOwner)} à ${Game.autoplay.nameOf(player)} !`);
        } else {
          if (lot.shields > 0) {
            lot.shields--;
          }
          Game.board.draw();
          floatText(lot, 'Raté !', '#555');
          log(`Le voleur a échoué devant ${shopName(lot)}.`);
        }
        Game.events.addSmoke(...Game.world.lotCenter(lot));
      },
    });
  }

  // Pillage de la banque : le voleur emporte tout l'or (si un autre voleur ne l'a pas
  // vidée entre-temps). Le coffre se remplit ensuite peu à peu.
  function robBank(player, lot) {
    if (!Game.shops.isBankFull(lot)) {
      Game.feedback.floatText(lot, 'Coffre vide !', '#555');
      log(`Le voleur de ${Game.autoplay.nameOf(player)} arrive trop tard : la banque est vide.`);
      Game.events.addSmoke(...Game.world.lotCenter(lot));
      return;
    }
    const loot = Game.config.bank.LOOT;
    lot.bank.gold = 0;
    Game.state.bucks[player] += loot;
    floatText(lot, '+' + loot + ' $', PLAYER_COLORS[player]);
    log(`${Game.autoplay.nameOf(player)} pille la banque : +${loot} $ !`);
    Game.events.addSmoke(...Game.world.lotCenter(lot));
  }

  Object.assign(Game.events, { shieldOutcome, launchMeteor, launchThief });
})();
