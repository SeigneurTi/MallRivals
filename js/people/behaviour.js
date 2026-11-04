// Comportement d'un passant, image par image :
// rue → (entrée) → porte → place dans la boutique → activité → porte → rue → sortie de la ville.
(function () {
  'use strict';

  const PEOPLE = Game.config.people;
  const { PERSON_STATE } = Game.people;

  // Marche en ligne droite vers person.target. Renvoie true une fois arrivé.
  function moveToward(person, dt, speedFactor = 1) {
    const dx = person.target[0] - person.x;
    const dy = person.target[1] - person.y;
    const distance = Math.hypot(dx, dy);
    const step = person.speed * dt * speedFactor;
    person.walkPhase += step * 0.28;
    if (distance <= step) {
      person.x = person.target[0];
      person.y = person.target[1];
      return true;
    }
    person.x += dx / distance * step;
    person.y += dy / distance * step;
    if (Math.abs(dx) > 1) {
      person.facing = dx > 0 ? 1 : -1;
    }
    return false;
  }

  // En passant devant une boutique ouverte et pas complète, le passant peut décider d'entrer
  // (une seule fois par boutique). previousDistance : sa position sur le segment à l'image précédente.
  function tryEnterShop(person, previousDistance) {
    const nodes = Game.map.nodes;
    const fromNode = person.routeNodes[person.segmentIndex];
    const toNode = person.routeNodes[person.segmentIndex + 1];
    const lotsHere = Game.map.lotsAlongStreet(fromNode, toNode);
    if (!lotsHere || !lotsHere.length) {
      return false;
    }
    // Position le long de la rue (abscisse si elle est horizontale, ordonnée sinon).
    const start = nodes[fromNode];
    const end = nodes[toNode];
    const isHorizontal = start[1] === end[1];
    const direction = isHorizontal ? Math.sign(end[0] - start[0]) : Math.sign(end[1] - start[1]);
    const origin = isHorizontal ? start[0] : start[1];
    const positionBefore = origin + direction * previousDistance;
    const positionNow = origin + direction * person.distanceOnSegment;

    for (const access of lotsHere) {
      const lot = Game.state.lots[access.lotIndex];
      if (!lot.shop || person.visitedLots.has(lot) || !Game.shops.hasFreeSlot(lot)) {
        continue;
      }
      // La porte vient-elle d'être dépassée pendant cette image ?
      const justPassedDoor = (access.positionAlong - positionBefore) * direction > 0
        && (access.positionAlong - positionNow) * direction <= 0;
      if (!justPassedDoor) {
        continue;
      }
      person.visitedLots.add(lot);
      if (Math.random() < Game.catalog.entryChance(lot)) {
        // On le replace exactement face à la porte.
        person.distanceOnSegment = Math.abs(access.positionAlong - origin);
        Game.people.placeOnRoute(person);
        person.state = PERSON_STATE.ENTERING;
        person.lot = lot;
        person.door = access.door;
        person.returnPoint = [person.x, person.y];
        person.target = access.door;
        return true;
      }
    }
    return false;
  }

  // Libère la place occupée dans la boutique.
  function releaseSlot(person) {
    const lot = person.lot;
    if (lot && lot.occupants && person.slotIndex != null && lot.occupants[person.slotIndex] === person) {
      lot.occupants[person.slotIndex] = null;
    }
    person.slotIndex = null;
  }

  // Sortie immédiate (boutique détruite) : le passant réapparaît sur le pas de la porte.
  // Ce que le client emporte de la boutique (une fleur, un cornet…) : voir interior.souvenir.
  function takeSouvenir(person) {
    const interior = person.lot && person.lot.shop && Game.interiors[person.lot.shop.id];
    person.souvenir = interior && interior.souvenir ? interior.souvenir() : null;
  }

  function exitShopNow(person) {
    takeSouvenir(person);
    forgetChangingRoom(person);
    releaseSlot(person);
    person.x = person.door[0];
    person.y = person.door[1];
    person.state = PERSON_STATE.RETURNING;
    person.target = person.returnPoint;
    person.drawScale = 1;
    person.activity = null;
  }

  // Fin de l'activité : le passant regagne la porte à pied.
  function leaveShop(person) {
    takeSouvenir(person);
    releaseSlot(person);
    person.state = PERSON_STATE.LEAVING;
    person.target = person.door;
    person.activity = null;
    person.mustDress = Boolean(person.inSwimsuit);
  }

  // Enlevé par un OVNI : il disparaît à la prochaine image.
  function takeAway(person) {
    releaseSlot(person);
    person.isRemoved = true;
  }

  function isInOrEnteringShop(person) {
    return person.state === PERSON_STATE.INSIDE || person.state === PERSON_STATE.ENTERING || person.state === PERSON_STATE.LEAVING;
  }

  // Vestiaire (piscine) : aller à l'entrée de sa cabine, puis y rester caché le temps de se changer.
  // Renvoie true une fois changé.
  function changeClothes(person, dt) {
    const interior = Game.interiors[person.lot.shop.id];
    const cabin = interior.changingCabins[person.cabin];
    if (!person.isChanging) {
      const cabinDoor = Game.shopGeometry.lotPointToBoard(person.lot, cabin.u, cabin.v);
      if (!Game.people.walkAvoiding(person, cabinDoor, dt, PEOPLE.INSIDE_WALK_FACTOR)) {
        return false;
      }
      person.isChanging = true;
      person.changeTimer = Game.config.pool.CHANGE_SECONDS;
    }
    person.changeTimer -= dt;
    if (person.changeTimer > 0) {
      return false;
    }
    person.isChanging = false;
    return true;
  }

  // Remet ses vêtements d'un coup (boutique détruite pendant qu'on est en maillot).
  function forgetChangingRoom(person) {
    person.isChanging = false;
    person.inSwimsuit = false;
    person.mustDress = false;
  }

  // Arrivé à la porte : il prend une place libre (et paie), ou fait demi-tour si c'est complet.
  function arriveAtDoor(person) {
    const lot = person.lot;
    const freeSlots = lot.shop ? lot.occupants.map((occupant, index) => (occupant ? -1 : index)).filter(index => index >= 0) : [];
    if (!lot.shop || !Game.shops.hasFreeSlot(lot) || !freeSlots.length) {
      person.state = PERSON_STATE.RETURNING;
      person.target = person.returnPoint;
      return;
    }
    person.slotIndex = Game.utils.pickRandom(freeSlots);
    lot.occupants[person.slotIndex] = person;
    person.state = PERSON_STATE.INSIDE;
    person.insidePhase = 'toSlot';
    person.drawScale = PEOPLE.INSIDE_SCALE;
    person.sessionOver = false;
    person.target = Game.people.slotPosition(person);
    // Piscine : d'abord le vestiaire, dans la cabine la moins occupée.
    const changingCabins = Game.interiors[lot.shop.id].changingCabins;
    if (changingCabins) {
      const usersOfCabin = cabinIndex => Game.state.people.filter(other => other.lot === lot && other.cabin === cabinIndex && (other.isChanging || other.insidePhase === 'changing')).length;
      person.cabin = usersOfCabin(0) <= usersOfCabin(1) ? 0 : 1;
      person.insidePhase = 'changing';
    }

    const income = Game.catalog.incomePerCustomer(lot);
    if (lot.owner != null) {
      Game.state.bucks[lot.owner] += income;
    }
    Game.feedback.floatText(lot, '+' + income, lot.owner != null ? Game.config.players.COLORS[lot.owner] : '#555');
  }

  // S'asseoir une fois à sa place (si l'activité s'y prête), se relever en partant.
  function updateSitting(person, dt) {
    const isSeated = person.state === PERSON_STATE.INSIDE
      && person.insidePhase === 'active'
      && PEOPLE.SEATED_ACTIVITIES.includes(person.activity);
    const step = dt / PEOPLE.SIT_DOWN_SECONDS;
    if (isSeated) {
      person.sitAmount = Math.min(1, person.sitAmount + step);
    } else {
      person.sitAmount = Math.max(0, person.sitAmount - step);
      if (person.sitAmount === 0) {
        person.seatView = null;   // relevé : on retrouve la vue de profil
      }
    }
  }

  // Une image de la vie d'un passant. Renvoie false quand il a quitté la ville.
  function update(person, dt) {
    updateSitting(person, dt);
    switch (person.state) {
      case PERSON_STATE.ENTERING:
        if (moveToward(person, dt)) {
          arriveAtDoor(person);
        }
        return true;

      case PERSON_STATE.INSIDE:
        if (!person.lot.shop) {
          exitShopNow(person);
          return true;
        }
        if (person.insidePhase === 'changing') {
          // En ressortant de la cabine : maillot de bain, puis direction sa place.
          if (changeClothes(person, dt)) {
            person.inSwimsuit = true;
            person.swimsuitColor = Game.utils.pickRandom(Game.interiors[person.lot.shop.id].swimsuitColors);
            person.insidePhase = 'toSlot';
          }
          return true;
        }
        if (person.insidePhase === 'toSlot') {
          // La cible est recalculée à chaque image (le manège tourne, la nageuse avance…).
          if (Game.people.walkAvoiding(person, Game.people.slotPosition(person), dt, PEOPLE.INSIDE_WALK_FACTOR)) {
            person.insidePhase = 'active';
            Game.people.startActivity(person, person.lot);
          }
          return true;
        }
        Game.people.updateActivity(person, dt);
        return true;

      case PERSON_STATE.LEAVING:
        // En maillot : on repasse par le vestiaire pour se rhabiller avant de sortir.
        if (person.mustDress) {
          if (!person.lot.shop || !Game.interiors[person.lot.shop.id].changingCabins) {
            forgetChangingRoom(person);
          } else if (changeClothes(person, dt)) {
            person.mustDress = false;
            person.inSwimsuit = false;
          }
          return true;
        }
        if (Game.people.walkAvoiding(person, person.door, dt, PEOPLE.LEAVING_WALK_FACTOR)) {
          person.state = PERSON_STATE.RETURNING;
          person.target = person.returnPoint;
          person.drawScale = 1;
        }
        return true;

      case PERSON_STATE.RETURNING:
        if (moveToward(person, dt)) {
          person.state = PERSON_STATE.WALKING;
          person.lot = null;
        }
        return true;

      default:
        return Game.people.walkAlongRoute(person, dt);
    }
  }

  // Met à jour tous les passants et retire ceux qui sont partis.
  function updateAll(dt) {
    Game.state.people = Game.state.people.filter(person => !person.isRemoved && update(person, dt));
  }

  Object.assign(Game.people, {
    moveToward,
    tryEnterShop,
    leaveShop,
    exitShopNow,
    takeAway,
    isInOrEnteringShop,
    updateAll,
  });
})();
