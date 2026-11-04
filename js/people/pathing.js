// Déplacements à l'intérieur d'une boutique qui a des obstacles (tables de billard…) :
// au lieu d'aller tout droit, le client passe par les coins des obstacles.
// Un intérieur déclare ses obstacles avec obstacles(lot) → rectangles sur le plateau
// { left, top, right, bottom } ; sans obstacles, on marche en ligne droite comme avant.
(function () {
  'use strict';

  const CLEARANCE = 3;      // distance gardée autour des obstacles (unités du plateau)
  const CORNER_GAP = 0.6;   // les points de passage sont un peu au-delà des coins

  function expand(rect, margin) {
    return { left: rect.left - margin, top: rect.top - margin, right: rect.right + margin, bottom: rect.bottom + margin };
  }

  function contains(rect, [x, y]) {
    return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
  }

  // Le segment a–b traverse-t-il l'intérieur du rectangle ? (découpage de Liang–Barsky)
  function crosses(a, b, rect) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    let enter = 0;
    let exit = 1;
    const sides = [[-dx, a[0] - rect.left], [dx, rect.right - a[0]], [-dy, a[1] - rect.top], [dy, rect.bottom - a[1]]];
    for (const [p, q] of sides) {
      if (p === 0) {
        if (q <= 0) {
          return false;
        }
      } else {
        const t = q / p;
        if (p < 0) {
          enter = Math.max(enter, t);
        } else {
          exit = Math.min(exit, t);
        }
      }
    }
    return exit - enter > 1e-6;
  }

  // Plus court chemin de start à goal en contournant les rectangles (graphe de visibilité).
  // Si le départ ou l'arrivée est dans la marge autour d'un obstacle, on garde l'obstacle sans
  // marge ; s'il est sur l'obstacle lui-même, on l'ignore, pour ne jamais rester bloqué.
  function findWay(start, goal, obstacles) {
    const blockers = obstacles.map(rect => {
      const withMargin = expand(rect, CLEARANCE);
      const endpointInMargin = contains(withMargin, start) || contains(withMargin, goal);
      return endpointInMargin ? rect : withMargin;
    }).filter(rect => !contains(rect, start) && !contains(rect, goal));
    const isClear = (a, b) => !blockers.some(rect => crosses(a, b, rect));
    if (isClear(start, goal)) {
      return [goal];
    }
    const points = [start, goal];
    for (const rect of blockers) {
      const corner = expand(rect, CORNER_GAP);
      points.push([corner.left, corner.top], [corner.right, corner.top], [corner.left, corner.bottom], [corner.right, corner.bottom]);
    }
    // Dijkstra sur ces quelques points.
    const distance = points.map(() => Infinity);
    const previous = points.map(() => -1);
    const done = points.map(() => false);
    distance[0] = 0;
    for (let round = 0; round < points.length; round++) {
      let current = -1;
      for (let i = 0; i < points.length; i++) {
        if (!done[i] && (current < 0 || distance[i] < distance[current])) {
          current = i;
        }
      }
      if (current < 0 || distance[current] === Infinity || current === 1) {
        break;
      }
      done[current] = true;
      for (let next = 0; next < points.length; next++) {
        if (done[next] || !isClear(points[current], points[next])) {
          continue;
        }
        const length = distance[current] + Math.hypot(points[next][0] - points[current][0], points[next][1] - points[current][1]);
        if (length < distance[next]) {
          distance[next] = length;
          previous[next] = current;
        }
      }
    }
    if (previous[1] < 0) {
      return [goal];   // pas de chemin trouvé : tout droit (ne devrait pas arriver)
    }
    const way = [];
    for (let i = 1; i !== 0; i = previous[i]) {
      way.unshift(points[i]);
    }
    return way;
  }

  // Marche vers goal en contournant les obstacles de la boutique. Renvoie true une fois arrivé.
  function walkAvoiding(person, goal, dt, speedFactor) {
    const interior = person.lot && person.lot.shop && Game.interiors[person.lot.shop.id];
    if (!interior || !interior.obstacles) {
      person.target = goal;
      return Game.people.moveToward(person, dt, speedFactor);
    }
    if (Math.hypot(goal[0] - person.x, goal[1] - person.y) < 0.3) {
      return true;
    }
    // On recalcule le chemin quand la destination change.
    const goalMoved = !person.wayGoal || Math.hypot(goal[0] - person.wayGoal[0], goal[1] - person.wayGoal[1]) > 0.5;
    if (goalMoved || !person.way || !person.way.length) {
      person.way = findWay([person.x, person.y], goal, interior.obstacles(person.lot));
      person.wayGoal = goal;
    }
    person.target = person.way[0];
    if (Game.people.moveToward(person, dt, speedFactor)) {
      person.way.shift();
      return person.way.length === 0;
    }
    return false;
  }

  Object.assign(Game.people, { walkAvoiding });
})();
