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
    // Assis à une table, on se tourne vers elle.
    if (slot.facing) {
      person.facing = slot.facing;
    }
    // Face à un écran (cinéma) : on voit le spectateur de dos, ou de face si la salle
    // est retournée (porte en haut, écran en bas).
    person.seatView = null;
    if (slot.facesScreen) {
      person.seatView = frameOfLot(lot).flipped ? 'front' : 'back';
    }

    // Toutes les durées sont tirées, puis on garde celle de l'activité :
    // cela conserve exactement la suite de tirages au hasard de la v2.4.
    const durations = {};
    for (const [name, [min, max]] of Object.entries(PEOPLE.STAY_SECONDS)) {
      durations[name] = randomBetween(min, max);
    }
    person.stayTimer = durations[activity] || PEOPLE.DEFAULT_STAY_SECONDS;

    if (activity === 'laser') {
      person.laserTeam = slot.team;
      person.shootTimer = randomBetween(Game.config.lasergame.SHOT_DELAY_MIN, Game.config.lasergame.SHOT_DELAY_MAX);
      person.roamTarget = null;
      person.hitFlash = 0;
      person.muzzleFlash = 0;
    }
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
    if (person.activity === 'dance') {
      // Sur la piste : on se dandine d'un côté à l'autre et on change souvent de sens.
      const beat = gameTime * 6 + person.slotIndex * 1.3;
      const [slotX, slotY] = slotPosition(person);
      person.x = slotX + Math.sin(beat * 0.5) * 3;
      person.y = slotY;
      person.walkPhase = beat;
      person.facing = Math.sin(beat * 0.25 + person.slotIndex) > 0 ? 1 : -1;
    }
    if (person.activity === 'laser') {
      updateLaserPlayer(person, dt, lot, slot);
      if (person.sessionOver) {
        Game.people.leaveShop(person);
      }
      return;
    }
    if (person.activity === 'billiard') {
      updateBilliardPlayer(person, dt, lot);
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

  // Marche vers un point, sans « piétiner » une fois arrivé. Renvoie true à l'arrivée.
  function walkTo(person, point, dt, speedFactor) {
    if (Math.hypot(point[0] - person.x, point[1] - person.y) < 0.3) {
      return true;
    }
    person.target = point;
    return Game.people.moveToward(person, dt, speedFactor);
  }

  // Laser game. Pendant l'attente : rester dans sa base. Pendant la partie : courir d'un point
  // à l'autre de l'arène et tirer régulièrement sur un joueur de l'autre équipe.
  function updateLaserPlayer(person, dt, lot, slot) {
    const LASERGAME = Game.config.lasergame;
    person.muzzleFlash = Math.max(0, person.muzzleFlash - dt);
    person.hitFlash = Math.max(0, person.hitFlash - dt);
    if (lot.session.phase !== 'running') {
      walkTo(person, slotPosition(person), dt, 0.5);
      person.facing = slot.facing;
      return;
    }
    if (!person.roamTarget) {
      person.roamTarget = clampInside(lot, lotPointToBoard(lot, randomBetween(0.08, 0.92), randomBetween(0.22, 0.86)));
    }
    if (walkTo(person, person.roamTarget, dt, 0.75)) {
      person.roamTarget = null;
    }
    person.shootTimer -= dt;
    if (person.shootTimer <= 0) {
      person.shootTimer = randomBetween(LASERGAME.SHOT_DELAY_MIN, LASERGAME.SHOT_DELAY_MAX);
      const opponents = lot.occupants.filter(other => other && other.activity === 'laser'
        && other.insidePhase === 'active' && other.laserTeam !== person.laserTeam);
      if (opponents.length) {
        shootLaser(person, Game.utils.pickRandom(opponents), lot);
      }
    }
    // Juste après un tir, on reste tourné vers sa cible.
    if (person.muzzleFlash > 0) {
      person.facing = person.aimFacing;
    }
  }

  function shootLaser(shooter, target, lot) {
    const { boardPointToLot } = Game.shopGeometry;
    shooter.aimFacing = target.x >= shooter.x ? 1 : -1;
    shooter.facing = shooter.aimFacing;
    shooter.muzzleFlash = 0.12;
    // Du canon du fusil (à hauteur de poitrine) jusqu'au buste de la cible.
    const scale = shooter.drawScale;
    const from = boardPointToLot(lot, shooter.x + shooter.facing * 7.5 * scale, shooter.y - 9.5 * scale);
    const to = boardPointToLot(lot, target.x, target.y - 9 * target.drawScale);
    lot.laser.shots.push({ from, to, team: shooter.laserTeam, age: 0 });
    target.hitFlash = 0.35;
    lot.laser.hits[shooter.laserTeam]++;
  }

  // Billard : le joueur dont c'est le tour va se placer derrière la bille blanche, dans l'axe
  // du coup (point calculé par la table, voir js/shops/interiors-night.js) ; l'autre attend à sa place.
  function updateBilliardPlayer(person, dt, lot) {
    const table = lot.billiardTables[Math.floor(person.slotIndex / 2)];
    const isShooter = Boolean(table.aim && table.shooterSlot === person.slotIndex);
    walkTo(person, isShooter ? table.standPoint : slotPosition(person), dt, 0.6);
    // Une fois en place, la queue est dessinée par la table, dans l'axe du coup.
    person.cueOnTable = isShooter && table.shooterReady;
    if (isShooter) {
      person.facing = table.cueBallPoint[0] >= person.x ? 1 : -1;
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
