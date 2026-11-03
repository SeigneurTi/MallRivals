// Ce que font les clients une fois à leur place : flâner, s'asseoir, jouer, nager,
// tourner sur le manège, regarder un film ou jouer au bowling.
(function () {
  'use strict';

  const PEOPLE = Game.config.people;
  const BOWLING = Game.config.bowling;
  const { randomBetween } = Game.utils;
  const { frameOfLot, lotPointToBoard } = Game.shopGeometry;

  // Garde un point à l'intérieur des murs (en hauteur).
  function clampInside(lot, [x, y]) {
    const frame = frameOfLot(lot);
    return [x, Math.max(frame.top + 15, Math.min(frame.top + frame.height - 1, y))];
  }

  // Position de la place du passant, sur le plateau.
  function slotPosition(person) {
    const lot = person.lot;
    const slot = Game.interiors[lot.shop.id].slots[person.slotIndex];
    return clampInside(lot, lotPointToBoard(lot, slot.u, slot.v));
  }

  function startActivity(person, lot) {
    const interior = Game.interiors[lot.shop.id];
    const slot = interior.slots[person.slotIndex];
    const activity = slot.activity || interior.activity;
    person.activity = activity;

    // Toutes les durées sont tirées, puis on garde celle de l'activité :
    // cela conserve exactement la suite de tirages au hasard de la v2.4.
    const durations = {};
    for (const [name, [min, max]] of Object.entries(PEOPLE.STAY_SECONDS)) {
      durations[name] = randomBetween(min, max);
    }
    person.stayTimer = durations[activity] || PEOPLE.DEFAULT_STAY_SECONDS;

    if (activity === 'bowl') {
      person.throwCount = 0;
      person.bowlingPhase = 'aim';   // 'aim' → 'roll' → 'wait', trois fois
      person.bowlingTimer = BOWLING.AIM_SECONDS;
    }
  }

  function updateActivity(person, dt) {
    const lot = person.lot;
    const slot = Game.interiors[lot.shop.id].slots[person.slotIndex];
    const gameTime = Game.state.gameTime;

    if (person.activity === 'ride') {
      // Les 8 places sont réparties sur le plateau du manège, qui tourne.
      const angle = gameTime * Game.config.carousel.TURN_SPEED + person.slotIndex * Math.PI / 4;
      const frame = frameOfLot(lot);
      const ringRadius = 0.3;
      const u = 0.5 + Math.cos(angle) * ringRadius * frame.height / frame.width;
      const v = 0.47 + Math.sin(angle) * ringRadius + 0.04;
      [person.x, person.y] = clampInside(lot, lotPointToBoard(lot, u, v));
    }
    if (person.activity === 'swim') {
      // Longueurs de bassin, chacun dans son couloir.
      const strokePhase = gameTime * 0.5 + person.slotIndex * 1.9;
      [person.x, person.y] = clampInside(lot, lotPointToBoard(lot, 0.5 + 0.38 * Math.sin(strokePhase), slot.v));
      person.facing = Math.cos(strokePhase) > 0 ? 1 : -1;
    }
    if (person.activity === 'session') {
      // Au cinéma, on reste jusqu'à la fin du film.
      if (person.sessionOver) {
        Game.people.leaveShop(person);
      }
      return;
    }
    if (person.activity === 'bowl') {
      updateBowling(person, dt, lot);
      return;
    }
    person.stayTimer -= dt;
    if (person.stayTimer <= 0) {
      Game.people.leaveShop(person);
    }
  }

  // Viser, lancer (la boule roule), attendre que les quilles se relèvent ; trois lancers.
  function updateBowling(person, dt, lot) {
    const lane = lot.bowlingLanes[person.slotIndex];
    person.bowlingTimer -= dt;
    if (person.bowlingPhase === 'aim' && person.bowlingTimer <= 0) {
      person.bowlingPhase = 'roll';
      lane.ballProgress = 0;
    } else if (person.bowlingPhase === 'roll') {
      lane.ballProgress += dt / BOWLING.ROLL_SECONDS;
      if (lane.ballProgress >= 1) {
        lane.ballProgress = -1;
        lane.pinsDownTimer = BOWLING.PINS_DOWN_SECONDS;
        person.bowlingPhase = 'wait';
        person.bowlingTimer = BOWLING.PAUSE_AFTER_THROW_SECONDS;
        const pins = Math.random() < BOWLING.STRIKE_CHANCE ? 10 : Math.floor(randomBetween(BOWLING.MIN_PINS, BOWLING.MAX_PINS));
        Game.feedback.floatText(lot, pins === 10 ? 'Strike !' : pins + ' quilles', '#d6336c');
      }
    } else if (person.bowlingPhase === 'wait' && person.bowlingTimer <= 0) {
      person.throwCount++;
      if (person.throwCount >= BOWLING.THROWS_PER_VISIT) {
        Game.people.leaveShop(person);
      } else {
        person.bowlingPhase = 'aim';
        person.bowlingTimer = BOWLING.AIM_SECONDS;
      }
    }
  }

  Object.assign(Game.people, { slotPosition, startActivity, updateActivity });
})();
