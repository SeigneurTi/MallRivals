// Passants : création, trajet dans la ville et arrivée de nouveaux passants.
//
// Un passant arrive par une sortie, passe par deux carrefours tirés au hasard puis repart
// par une sortie (en général une autre). Il avance le long de son trajet, segment par segment.
(function () {
  'use strict';

  const PEOPLE = Game.config.people;
  const { randomBetween, pickRandom } = Game.utils;

  const SHIRT_COLORS = ['#e85d4a', '#3d7dd8', '#f2b134', '#47a36b', '#9a5fd1', '#ef7fb0', '#2bb3b1', '#ff8c42', '#3b4a6b'];
  const PANTS_COLORS = ['#3b4a6b', '#2d2d34', '#6b5440'];
  const SKIN_COLORS = ['#f5d0b0', '#e0ac80', '#b97a52', '#8a5536', '#f0c8a0'];
  const HAIR_COLORS = ['#2b1d14', '#5a3a22', '#c9a26b', '#111111', '#8b4513', '#d6d6d6'];
  const GIRL_NAMES = ['Léa', 'Chloé', 'Inès', 'Manon', 'Zoé', 'Camille', 'Jade', 'Emma', 'Sarah', 'Lina', 'Rose', 'Yasmine', 'Alice', 'Margot'];
  const BOY_NAMES = ['Hugo', 'Louis', 'Jules', 'Adam', 'Nathan', 'Lucas', 'Tom', 'Noé', 'Malo', 'Gabin', 'Sacha', 'Théo', 'Bilal', 'Arthur'];
  const GIRL_HAIR_STYLES = ['long', 'ponytail'];

  // États successifs d'un passant.
  const PERSON_STATE = {
    WALKING: 'walking',       // dans la rue, le long de son trajet
    ENTERING: 'entering',     // de la rue jusqu'à la porte d'une boutique
    INSIDE: 'inside',         // dans la boutique (rejoint sa place, puis son activité)
    LEAVING: 'leaving',       // de sa place jusqu'à la porte
    RETURNING: 'returning',   // de la porte jusqu'à la rue
  };

  let nextPersonId = 1;

  // Boutique pour laquelle un nouveau passant vient en ville : tirée au hasard parmi les boutiques
  // ouvertes, les plus attirantes un peu plus souvent. Ainsi chaque boutique reçoit sa part de clients,
  // où qu'elle soit sur la carte. null s'il n'y a encore aucune boutique.
  function pickDestination() {
    const shops = Game.state.lots.filter(lot => lot.shop && !lot.isBank);
    let remaining = Math.random() * shops.reduce((total, lot) => total + Game.catalog.entryChance(lot), 0);
    for (const lot of shops) {
      remaining -= Game.catalog.entryChance(lot);
      if (remaining <= 0) {
        return lot;
      }
    }
    return shops.length ? shops[shops.length - 1] : null;
  }

  // Crée un passant. Avec `alreadyInTown`, il est placé au hasard au milieu de son trajet
  // (début de partie) ; sinon il apparaît à sa sortie de départ.
  // Avec `salesLot` (soldes), il court tout droit vers cette boutique, puis repart.
  function create(alreadyInTown, salesLot) {
    const map = Game.map;
    const from = pickRandom(map.exits);
    let to = pickRandom(map.exits);
    if (to === from && Math.random() < PEOPLE.AVOID_SAME_EXIT_CHANCE) {
      to = pickRandom(map.exits.filter(id => id !== from));
    }
    // Rues à longer : celle de la boutique visée (soldes, ou boutique pour laquelle il vient en ville),
    // puis celles de quelques cases tirées au hasard. Il passe forcément devant leurs portes.
    const destinationLot = salesLot ? null : pickDestination();
    const targetLot = salesLot || destinationLot;
    const streets = targetLot ? [map.lotStreet[targetLot.index]] : [];
    if (!salesLot) {
      for (let k = 0; k < PEOPLE.ROUTE_LOT_COUNT; k++) {
        streets.push(pickRandom(map.lotStreet));
      }
    }
    const routeNodes = [from];
    for (const street of streets) {
      if (map.isExit(street.end)) {
        // Rue qui mène à une sortie : il y passe en arrivant, ou bien il repartira par là.
        if (street.end !== from) {
          to = street.end;
        }
        continue;
      }
      const goesForward = Math.random() < 0.5;
      const streetStart = goesForward ? street.start : street.end;
      const streetEnd = goesForward ? street.end : street.start;
      const current = routeNodes[routeNodes.length - 1];
      routeNodes.push(...map.findPath(current, streetStart).slice(1), streetEnd);
    }
    routeNodes.push(...map.findPath(routeNodes[routeNodes.length - 1], to).slice(1));
    const walkSpeed = randomBetween(PEOPLE.WALK_SPEED_MIN, PEOPLE.WALK_SPEED_MAX);

    const isGirl = Math.random() < 0.5;
    const person = {
      id: nextPersonId++,       // numéro unique (partie à distance : retrouver le passant d'une photo à l'autre)
      routeNodes,
      routePoints: routeNodes.map(id => map.nodes[id]),
      segmentIndex: 0,          // segment du trajet en cours
      distanceOnSegment: 0,     // distance parcourue sur ce segment
      state: PERSON_STATE.WALKING,
      from,
      to,
      visitedLots: new Set(),   // boutiques déjà devant lesquelles il est passé
      offsetX: randomBetween(-PEOPLE.ROAD_OFFSET, PEOPLE.ROAD_OFFSET),   // écart au milieu de la rue
      offsetY: randomBetween(-PEOPLE.ROAD_OFFSET, PEOPLE.ROAD_OFFSET),
      speed: salesLot ? walkSpeed * Game.config.sales.RUN_SPEED_FACTOR : walkSpeed,
      walkSpeed,                // vitesse normale (il court pendant les soldes)
      salesLot: salesLot || null,       // soldes : boutique visée (il paie moitié prix)
      isRushing: Boolean(salesLot),     // soldes : il fonce vers salesLot sans regarder les autres boutiques
      destinationLot,           // boutique pour laquelle il est venu : il y entre s'il reste de la place
      walkPhase: randomBetween(0, 6.28),                                  // balancement des jambes
      shirt: pickRandom(SHIRT_COLORS),
      pants: pickRandom(PANTS_COLORS),
      skin: pickRandom(SKIN_COLORS),
      hair: pickRandom(HAIR_COLORS),
      name: pickRandom(isGirl ? GIRL_NAMES : BOY_NAMES),
      isGirl,
      hairStyle: isGirl ? pickRandom(GIRL_HAIR_STYLES) : 'short',
      skirt: isGirl ? pickRandom(SHIRT_COLORS) : null,
      sitAmount: 0,             // 0 : debout, 1 : assis (varie progressivement)
      souvenir: null,           // objet emporté d'une boutique : { kind: 'flower' | 'icecream', … }
      seatView: null,           // assis face à un écran : 'back' (vu de dos) ou 'front' (vu de face)
      x: 0,
      y: 0,
      facing: 1,                // 1 : vers la droite, -1 : vers la gauche
      drawScale: 1,             // plus petit dans les boutiques
      // Remplis quand il entre dans une boutique :
      lot: null,
      door: null,               // porte de la boutique
      returnPoint: null,        // point de la rue où il reprendra son trajet
      target: null,             // point vers lequel il marche
      slotIndex: null,          // sa place dans la boutique
      insidePhase: null,        // 'toSlot' puis 'active'
      activity: null,           // browse, sit, bowl… (voir js/people/activities.js)
      cabin: null,              // piscine : cabine du vestiaire
      isChanging: false,        // dans la cabine : invisible
      inSwimsuit: false,        // en maillot de bain (piscine)
      mustDress: false,         // doit repasser au vestiaire avant de sortir
      swimsuitColor: null,
      stayTimer: 0,
      sessionOver: false,       // cinéma : la séance est finie
      isRemoved: false,         // emporté par un OVNI
    };
    if (alreadyInTown) {
      person.segmentIndex = Math.floor(randomBetween(1, person.routePoints.length - 2));
      person.distanceOnSegment = randomBetween(0, 1) * segmentLength(person);
    } else if (salesLot) {
      // Les clients des soldes arrivent les uns derrière les autres.
      person.distanceOnSegment = -randomBetween(0, Game.config.sales.SPREAD_DISTANCE);
    }
    placeOnRoute(person);
    return person;
  }

  function segmentLength(person) {
    const start = person.routePoints[person.segmentIndex];
    const end = person.routePoints[person.segmentIndex + 1];
    return Math.hypot(end[0] - start[0], end[1] - start[1]);
  }

  // Met à jour x, y et l'orientation d'après la position sur le trajet.
  function placeOnRoute(person) {
    const start = person.routePoints[person.segmentIndex];
    const end = person.routePoints[person.segmentIndex + 1];
    const length = segmentLength(person) || 1;
    const progress = Math.min(1, person.distanceOnSegment / length);
    person.x = start[0] + (end[0] - start[0]) * progress + person.offsetX;
    person.y = start[1] + (end[1] - start[1]) * progress + person.offsetY;
    if (end[0] !== start[0]) {
      person.facing = end[0] > start[0] ? 1 : -1;
    }
  }

  // Avance dans la rue. Renvoie false quand le passant a quitté la ville.
  function walkAlongRoute(person, dt) {
    const previousDistance = person.distanceOnSegment;
    person.distanceOnSegment += person.speed * dt;
    person.walkPhase += person.speed * dt * 0.28;
    if (Game.people.tryEnterShop(person, previousDistance)) {
      return true;
    }
    while (person.distanceOnSegment >= segmentLength(person)) {
      person.distanceOnSegment -= segmentLength(person);
      person.segmentIndex++;
      if (person.segmentIndex >= person.routePoints.length - 1) {
        return false;
      }
    }
    placeOnRoute(person);
    return true;
  }

  // Nombre de passants voulu : peu au début, davantage à chaque boutique ouverte,
  // sans dépasser le curseur « Passants max ».
  function targetPopulation() {
    const state = Game.state;
    const shopCount = state.lots.filter(lot => lot.shop && !lot.isBank).length;
    return Math.min(state.maxPopulation, PEOPLE.BASE_COUNT + PEOPLE.PER_SHOP * shopCount);
  }

  // Fait arriver un nouveau passant de temps en temps, jusqu'au nombre voulu.
  function spawnIfNeeded(dt) {
    const state = Game.state;
    state.spawnTimer -= dt;
    if (state.people.length < targetPopulation() && state.spawnTimer <= 0) {
      state.people.push(create(false));
      state.spawnTimer = randomBetween(PEOPLE.SPAWN_DELAY_MIN, PEOPLE.SPAWN_DELAY_MAX);
    }
  }

  // Passant le plus proche d'un point (pour l'info-bulle), ou null.
  function findNear(x, y) {
    let nearest = null;
    let nearestDistance = PEOPLE.HOVER_RADIUS;
    for (const person of Game.state.people) {
      if (person.isChanging) {
        continue;   // invisible dans sa cabine
      }
      // On vise le buste, une dizaine d'unités au-dessus des pieds.
      const distance = Math.hypot(person.x - x, person.y - 10 - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = person;
      }
    }
    return nearest;
  }

  Game.people = {
    PERSON_STATE,
    SKIN_COLORS,
    HAIR_COLORS,
    create,
    placeOnRoute,
    walkAlongRoute,
    spawnIfNeeded,
    targetPopulation,
    findNear,
  };
})();
