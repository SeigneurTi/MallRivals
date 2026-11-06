// Événements aléatoires sur une boutique tirée au hasard : incendie, monstre, OVNI.
(function () {
  'use strict';

  const EVENTS = Game.config.events;
  const MAP_WIDTH = Game.config.board.MAP_WIDTH;
  const { randomBetween, pickRandom } = Game.utils;
  const { log, floatText } = Game.feedback;
  const { shopName, shopNameAfterA, shopNameAfterDe } = Game.names;

  // Appelé à chaque image : chaque événement a une petite chance de se produire,
  // mais pas en début de partie (le temps de construire ses premières boutiques).
  function maybeTriggerRandomEvents(dt) {
    if (Game.state.gameTime < EVENTS.START_DELAY_SECONDS) {
      return;
    }
    if (Math.random() < EVENTS.FIRE_PER_SECOND * dt) {
      triggerRandomEvent('fire');
    }
    if (Math.random() < EVENTS.MONSTER_PER_SECOND * dt) {
      triggerRandomEvent('monster');
    }
    if (Math.random() < EVENTS.UFO_PER_SECOND * dt) {
      triggerRandomEvent('ufo');
    }
  }

  function triggerRandomEvent(kind) {
    const candidates = Game.state.lots.filter(lot => lot.shop && !lot.isBusy && !lot.isBank);   // la banque est épargnée
    if (!candidates.length) {
      return;
    }
    const lot = pickRandom(candidates);
    const center = Game.world.lotCenter(lot);
    lot.isBusy = true;
    if (kind === 'fire') {
      startFire(lot, center);
    } else if (kind === 'monster') {
      startMonster(lot, center);
    } else {
      startUfo(lot, center);
    }
  }

  // Incendie : la boutique brûle ou les pompiers la sauvent (un bouclier aide beaucoup :
  // il ne reste que 20 % de chances qu'elle brûle).
  function startFire(lot, [centerX, centerY]) {
    const FIRE = Game.config.fire;
    log(`Incendie ${shopNameAfterA(lot)} !`);
    Game.events.addAnimation({
      kind: 'fire',
      elapsed: 0,
      duration: FIRE.DURATION_SECONDS,
      lot,
      onEnd() {
        lot.isBusy = false;
        if (!lot.shop) {
          return;
        }
        const burnChance = lot.shields > 0 ? Game.config.economy.SHIELD_BREAK_CHANCE : FIRE.BURN_CHANCE;
        if (Math.random() < burnChance) {
          log(`${lot.shop.name} a brûlé…`);
          Game.events.addSmoke(centerX, centerY);
          Game.world.destroyShop(lot);
        } else {
          floatText(lot, 'Éteint !', '#2b8fbd');
          log(`Les pompiers ont sauvé ${shopName(lot)}.`);
        }
      },
    });
  }

  // Monstre : il traverse la carte jusqu'à la boutique et fait perdre un bouclier (qui peut céder :
  // la boutique est alors détruite), sinon un niveau, sinon détruit la boutique.
  // Puis il repart de l'autre côté.
  function startMonster(lot, [centerX, centerY]) {
    const MONSTER = Game.config.monster;
    log(`Un monstre attaque ${shopName(lot)} !`);
    const comesFromLeft = Math.random() < 0.5;
    Game.events.addAnimation({
      kind: 'monster',
      elapsed: 0,
      duration: MONSTER.WALK_IN_SECONDS,
      from: [comesFromLeft ? -60 : MAP_WIDTH + 60, centerY + randomBetween(-80, 80)],
      to: [centerX, centerY + 8],
      onEnd() {
        lot.isBusy = false;
        Game.events.addExplosion(centerX, centerY);
        // Si la boutique a disparu entre-temps, le monstre disparaît aussi (comme en v2.4).
        if (!lot.shop) {
          return;
        }
        const shield = Game.events.shieldOutcome(lot);
        if (shield === 'holds') {
          log(`Le bouclier ${shopNameAfterDe(lot)} a repoussé le monstre.`);
        } else if (shield === 'breaks') {
          log(`Le monstre a percé le bouclier et détruit ${shopName(lot)} !`);
          Game.world.destroyShop(lot);
        } else if (lot.level > 1) {
          lot.level--;
          Game.board.draw();
          floatText(lot, 'Niveau −1', '#c0392b');
          log(`${lot.shop.name} perd un niveau à cause du monstre.`);
        } else {
          log(`Le monstre a détruit ${shopName(lot)} !`);
          Game.world.destroyShop(lot);
        }
        Game.events.addAnimation({
          kind: 'monster',
          elapsed: 0,
          duration: MONSTER.WALK_OUT_SECONDS,
          from: [centerX, centerY + 8],
          to: [comesFromLeft ? MAP_WIDTH + 60 : -60, centerY - 40],
        });
      },
    });
  }

  // OVNI : il arrive, éclaire la boutique de son rayon, puis repart.
  // Il emporte la boutique (et ses clients), sauf si un bouclier le repousse (il peut céder) ;
  // ou bien les extraterrestres font un gros achat.
  function startUfo(lot, [centerX, centerY]) {
    const UFO = Game.config.ufo;
    const hoverPoint = [centerX, centerY - 60];
    log(`Un OVNI survole ${shopName(lot)}…`);
    Game.events.addAnimation({
      kind: 'ufo',
      elapsed: 0,
      duration: UFO.ARRIVAL_SECONDS,
      from: [randomBetween(0, MAP_WIDTH), -80],
      to: hoverPoint,
      onEnd() {
        Game.events.addAnimation({
          kind: 'ufo',
          elapsed: 0,
          duration: UFO.BEAM_SECONDS,
          from: hoverPoint,
          to: hoverPoint,
          beamLot: lot,
          onEnd() {
            lot.isBusy = false;
            if (lot.shop) {
              resolveUfoVisit(lot);
            }
            Game.events.addAnimation({
              kind: 'ufo',
              elapsed: 0,
              duration: UFO.DEPARTURE_SECONDS,
              from: hoverPoint,
              to: [randomBetween(0, MAP_WIDTH), -90],
            });
          },
        });
      },
    });
  }

  function resolveUfoVisit(lot) {
    const UFO = Game.config.ufo;
    const roll = Math.random();
    const shield = roll < UFO.ABDUCTION_CHANCE ? Game.events.shieldOutcome(lot) : null;
    if (shield === 'holds') {
      log(`Le bouclier ${shopNameAfterDe(lot)} a repoussé l'OVNI.`);
    } else if (shield) {
      for (const person of Game.state.people) {
        if (person.lot === lot && person.state === Game.people.PERSON_STATE.INSIDE) {
          Game.people.takeAway(person);
        }
      }
      log(shield === 'breaks' ? `Le bouclier a cédé : l'OVNI a emporté ${shopName(lot)} !` : `L'OVNI a emporté ${shopName(lot)} !`);
      Game.world.destroyShop(lot);
    } else {
      const purchase = Math.round(lot.shop.price * UFO.SHOPPING_RATE);
      if (lot.owner != null) {
        Game.state.bucks[lot.owner] += purchase;
      }
      floatText(lot, '+' + purchase, '#6ad07a');
      log(`Les extraterrestres ont fait leurs courses ${shopNameAfterA(lot)} : +${purchase} $ !`);
    }
  }

  Object.assign(Game.events, { maybeTriggerRandomEvents, triggerRandomEvent });
})();
