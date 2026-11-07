// Intérieurs des deux boutiques les plus chères : casino et discothèque.
// Coordonnées normalisées : voir js/shops/geometry.js.
// drawOverPeople (facultatif) est dessiné par-dessus les clients : lumière tamisée, spots.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle, ellipse } = Game.draw;
  const { slot, checkerFloor } = Game.furniture;

  // ---------- Casino ----------

  const SLOT_MACHINE_U = [0.1, 0.3, 0.5, 0.7, 0.9];
  const ROULETTE = { u: 0.5, v: 0.64 };
  const SLOT_SYMBOLS = ['#e74c3c', '#f2c14e', '#47a36b', '#3d7dd8', '#ffffff'];
  // 4 joueurs autour de la table, tournés vers elle.
  const CASINO_TABLE_SLOTS = [
    slot(0.22, 0.64, 'sit', 1),
    slot(0.78, 0.64, 'sit', -1),
    slot(0.38, 0.86, 'sit', 1),
    slot(0.62, 0.86, 'sit', -1),
  ];

  // ---------- Discothèque ----------

  const DANCE_FLOOR = { left: 0.14, top: 0.3, columns: 6, rows: 4, tileU: 0.12, tileV: 0.15 };
  const DISCO_BALL = { u: 0.5, v: 0.2 };
  const DANCER_POSITIONS = [0.22, 0.4, 0.6, 0.78].flatMap(u => [slot(u, 0.48, 'dance'), slot(u, 0.76, 'dance')]);

  // ---------- Billard ----------
  //
  // Deux tables ; deux joueurs par table, qui jouent chacun leur tour.
  // Les billes sont simulées dans le repère de la table : x de 0 à TABLE_LENGTH, y de 0 à 1.

  const BILLIARD = Game.config.billiard;
  const TABLE_LENGTH = 1.4;
  const BALL_RADIUS = 0.07;
  const POCKET_RADIUS = 0.11;
  const POCKETS = [[0, 0], [TABLE_LENGTH / 2, 0], [TABLE_LENGTH, 0], [0, 1], [TABLE_LENGTH / 2, 1], [TABLE_LENGTH, 1]];
  const BALL_COLORS = ['#ffffff', '#f2c14e', '#3d7dd8', '#e74c3c', '#9a5fd1', '#ff8c42', '#1b1b2a'];   // blanche puis 6 billes
  const FELT = { v: 0.34, width: 0.36, height: 0.36 };
  const BILLIARD_TABLES_U = [0.08, 0.56];   // bord gauche du tapis de chaque table
  // Un joueur côté fond et un côté porte, à chaque table.
  const BILLIARD_SLOTS = BILLIARD_TABLES_U.flatMap(u => [
    slot(u + FELT.width / 2, 0.2, 'billiard'),
    slot(u + FELT.width / 2, 0.86, 'billiard'),
  ]);

  // Billes en position de départ : la blanche à gauche, les autres en triangle à droite.
  function rackBalls() {
    const positions = [[0.35, 0.5], [1, 0.5], [1.13, 0.43], [1.13, 0.57], [1.26, 0.36], [1.26, 0.5], [1.26, 0.64]];
    return positions.map(([x, y], index) => ({ x, y, vx: 0, vy: 0, sunk: false, color: BALL_COLORS[index] }));
  }

  function createBilliardTable() {
    return { balls: rackBalls(), aim: null, aimTimer: 0, aimDuration: 1, turn: 0 };
  }

  const isMoving = table => table.balls.some(ball => !ball.sunk && (ball.vx || ball.vy));

  // Fait avancer les billes : rebonds sur les bandes, chocs entre billes, poches, frottement.
  function simulateBalls(table, dt) {
    const steps = 4;
    const stepDt = dt / steps;
    const balls = table.balls;
    for (let s = 0; s < steps; s++) {
      for (const ball of balls) {
        if (ball.sunk) {
          continue;
        }
        ball.x += ball.vx * stepDt;
        ball.y += ball.vy * stepDt;
        // Poches : une bille de couleur tombe ; la blanche est replacée (faute).
        if (POCKETS.some(([px, py]) => Math.hypot(ball.x - px, ball.y - py) < POCKET_RADIUS)) {
          if (ball === balls[0]) {
            Object.assign(ball, { x: 0.35, y: 0.5, vx: 0, vy: 0 });
          } else {
            ball.sunk = true;
          }
          continue;
        }
        // Bandes.
        if (ball.x < BALL_RADIUS || ball.x > TABLE_LENGTH - BALL_RADIUS) {
          ball.x = Math.min(TABLE_LENGTH - BALL_RADIUS, Math.max(BALL_RADIUS, ball.x));
          ball.vx = -ball.vx;
        }
        if (ball.y < BALL_RADIUS || ball.y > 1 - BALL_RADIUS) {
          ball.y = Math.min(1 - BALL_RADIUS, Math.max(BALL_RADIUS, ball.y));
          ball.vy = -ball.vy;
        }
      }
      // Chocs entre deux billes de même masse : elles échangent leur vitesse le long du choc.
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          if (a.sunk || b.sunk) {
            continue;
          }
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy);
          if (distance === 0 || distance >= 2 * BALL_RADIUS) {
            continue;
          }
          const nx = dx / distance;
          const ny = dy / distance;
          const approach = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (approach > 0) {
            a.vx -= approach * nx;
            a.vy -= approach * ny;
            b.vx += approach * nx;
            b.vy += approach * ny;
          }
          // On écarte les billes pour qu'elles ne restent pas collées.
          const overlap = (2 * BALL_RADIUS - distance) / 2;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
        }
      }
      // Frottement du tapis.
      for (const ball of balls) {
        const slowdown = Math.max(0, 1 - BILLIARD.FRICTION * stepDt);
        ball.vx *= slowdown;
        ball.vy *= slowdown;
        if (Math.hypot(ball.vx, ball.vy) < 0.03) {
          ball.vx = 0;
          ball.vy = 0;
        }
      }
    }
  }

  // Hauteur des mains au-dessus des pieds d'un client (dans une boutique, à l'échelle 0,8).
  const HANDS_HEIGHT = 7.2;

  // Point de la table (repère de la table) vers un point du plateau.
  function tableToBoard(lot, tableIndex, bx, by) {
    const u = BILLIARD_TABLES_U[tableIndex] + bx / TABLE_LENGTH * FELT.width;
    const v = FELT.v + by * FELT.height;
    return Game.shopGeometry.lotPointToBoard(lot, Math.min(0.97, Math.max(0.03, u)), Math.min(0.95, Math.max(0.1, v)));
  }

  // Les deux tables (avec leur cadre en bois), en rectangles sur le plateau : les clients les
  // contournent (voir js/people/pathing.js).
  function tableRects(lot) {
    const { lotPointToBoard } = Game.shopGeometry;
    return BILLIARD_TABLES_U.map(u => {
      const [x1, y1] = lotPointToBoard(lot, u - 0.03, FELT.v - 0.05);
      const [x2, y2] = lotPointToBoard(lot, u + FELT.width + 0.03, FELT.v + FELT.height + 0.05);
      return { left: Math.min(x1, x2), top: Math.min(y1, y2), right: Math.max(x1, x2), bottom: Math.max(y1, y2) };
    });
  }

  // Marge autour des tables pour les pieds du tireur (un peu plus que pour les déplacements,
  // voir js/people/pathing.js).
  const STAND_MARGIN = 3.5;

  function isNearTable(rects, [x, y]) {
    return rects.some(rect => x > rect.left - STAND_MARGIN && x < rect.right + STAND_MARGIN
      && y > rect.top - STAND_MARGIN && y < rect.bottom + STAND_MARGIN);
  }

  // Où se tenir pour jouer ce coup : derrière la blanche, dans l'axe, les mains sur cet axe.
  // On recule depuis le bord de la table jusqu'à ce que les pieds soient hors des tables.
  // Renvoie null si c'est impossible (par exemple coincé entre les deux tables).
  function standPointFor(lot, tableIndex, cueBall, aim, rects) {
    const backX = -aim.dx;
    const backY = -aim.dy;
    // Distance jusqu'au bord de la table en reculant depuis la blanche.
    const toEdgeX = backX > 0 ? (TABLE_LENGTH - cueBall.x) / backX : backX < 0 ? -cueBall.x / backX : Infinity;
    const toEdgeY = backY > 0 ? (1 - cueBall.y) / backY : backY < 0 ? -cueBall.y / backY : Infinity;
    const toEdge = Math.min(toEdgeX, toEdgeY);
    for (let extra = 0.22; extra <= 1.2; extra += 0.04) {
      const [handX, handY] = tableToBoard(lot, tableIndex, cueBall.x + backX * (toEdge + extra), cueBall.y + backY * (toEdge + extra));
      const feet = [handX, handY + HANDS_HEIGHT];
      if (!isNearTable(rects, feet)) {
        return feet;
      }
    }
    return null;
  }

  // Choisit le coup à jouer et la place du tireur. On essaie les billes une à une
  // (avec une petite imprécision) jusqu'à trouver un coup qu'on peut jouer depuis un endroit libre.
  function chooseShot(lot, table, tableIndex, remaining) {
    const cueBall = table.balls[0];
    const rects = tableRects(lot);
    let fallbackAim = null;
    for (const target of Game.utils.shuffled(remaining)) {
      const angle = Math.atan2(target.y - cueBall.y, target.x - cueBall.x) + Game.utils.randomBetween(-0.1, 0.1);
      const aim = { dx: Math.cos(angle), dy: Math.sin(angle) };
      fallbackAim = fallbackAim || aim;
      const stand = standPointFor(lot, tableIndex, cueBall, aim, rects);
      if (stand) {
        table.aim = aim;
        table.standPoint = stand;
        return;
      }
    }
    // Aucun coup jouable proprement : on se met au-dessus ou en dessous de la table, face à la blanche.
    table.aim = fallbackAim;
    const rect = rects[tableIndex];
    const [ballX, ballY] = tableToBoard(lot, tableIndex, cueBall.x, cueBall.y);
    const above = rect.top - STAND_MARGIN - 0.5;
    const below = rect.bottom + STAND_MARGIN + 0.5 + HANDS_HEIGHT;
    table.standPoint = [ballX, Math.abs(ballY - above) < Math.abs(ballY - below) ? above : below];
  }

  function isPlayingBilliard(person) {
    return person && person.insidePhase === 'active' && person.activity === 'billiard';
  }

  function updateBilliardTable(lot, table, tableIndex, dt) {
    simulateBalls(table, dt);
    if (isMoving(table)) {
      return;
    }
    const remaining = table.balls.slice(1).filter(ball => !ball.sunk);
    if (!remaining.length) {
      table.balls = rackBalls();
      Game.feedback.floatText(lot, 'Partie gagnée !', '#2e7d4f');
      return;
    }
    const players = [2 * tableIndex, 2 * tableIndex + 1].filter(slotIndex => isPlayingBilliard(lot.occupants[slotIndex]));
    // Si le tireur est parti entre-temps, on recommence la visée.
    if (table.aim && !players.includes(table.shooterSlot)) {
      table.aim = null;
    }
    if (!players.length) {
      return;
    }
    if (!table.aim) {
      // À deux, on joue chacun son tour ; seul, on s'entraîne.
      table.turn = players.length === 2 ? 1 - table.turn : players[0] % 2;
      table.shooterSlot = 2 * tableIndex + table.turn;
      chooseShot(lot, table, tableIndex, remaining);
      table.cueBallPoint = tableToBoard(lot, tableIndex, table.balls[0].x, table.balls[0].y);
      table.aimDuration = Game.utils.randomBetween(BILLIARD.AIM_SECONDS_MIN, BILLIARD.AIM_SECONDS_MAX);
      table.aimTimer = table.aimDuration;
    }
    // Le compte à rebours ne démarre qu'une fois le tireur en place, queue en main.
    const shooter = lot.occupants[table.shooterSlot];
    table.shooterReady = Math.hypot(shooter.x - table.standPoint[0], shooter.y - table.standPoint[1]) < 1.5;
    if (!table.shooterReady) {
      return;
    }
    table.aimTimer -= dt;
    if (table.aimTimer <= 0) {
      table.balls[0].vx = table.aim.dx * BILLIARD.SHOT_SPEED;
      table.balls[0].vy = table.aim.dy * BILLIARD.SHOT_SPEED;
      table.aim = null;
    }
  }

  Object.assign(Game.interiors, {
    // 2 tables, 2 joueurs par table.
    billard: {
      activity: 'billiard',
      slots: BILLIARD_SLOTS,
      createState(lot) {
        lot.billiardTables = BILLIARD_TABLES_U.map(createBilliardTable);
      },
      // Les clients marchent autour des tables, jamais dessus.
      obstacles: tableRects,
      update(lot, dt) {
        lot.billiardTables.forEach((table, tableIndex) => updateBilliardTable(lot, table, tableIndex, dt));
      },
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        // Parquet sombre.
        rect(c, g.left, g.top, g.width, g.height, '#4a3426');
        c.strokeStyle = '#3d2a1e';
        c.lineWidth = 1;
        for (let k = 1; k < 7; k++) {
          c.beginPath();
          c.moveTo(g.left, g.top + k * g.height / 7);
          c.lineTo(g.left + g.width, g.top + k * g.height / 7);
          c.stroke();
        }
        // Râtelier à queues contre le mur du fond.
        rect(c, x(0.44), y(0.03), w(0.12), h(0.04), '#6b3a1e');
        for (let k = 0; k < 4; k++) {
          rect(c, x(0.455 + k * 0.03), y(0.05), w(0.008), h(0.16), '#c8a165');
        }
        // Les deux tables : cadre en bois, tapis vert, six poches.
        for (const u of BILLIARD_TABLES_U) {
          rect(c, x(u - 0.03), y(FELT.v - 0.05), w(FELT.width + 0.06), h(FELT.height + 0.1), '#6b3a1e');
          rect(c, x(u), y(FELT.v), w(FELT.width), h(FELT.height), '#2e7d4f');
          for (const [px, py] of POCKETS) {
            circle(c, x(u) + px / TABLE_LENGTH * w(FELT.width), y(FELT.v) + py * h(FELT.height), radius(0.035), '#111');
          }
        }
      },
      drawAnimated(g, lot) {
        const { c, x, y, w, h, radius } = g;
        lot.billiardTables.forEach((table, tableIndex) => {
          const u = BILLIARD_TABLES_U[tableIndex];
          const toBoard = (bx, by) => [x(u) + bx / TABLE_LENGTH * w(FELT.width), y(FELT.v) + by * h(FELT.height)];
          const ballRadius = BALL_RADIUS * h(FELT.height);
          for (const ball of table.balls) {
            if (!ball.sunk) {
              const [bx, by] = toBoard(ball.x, ball.y);
              circle(c, bx, by, ballRadius, ball.color);
            }
          }
          // Queue pendant la visée, des mains du tireur jusqu'à la blanche : elle recule, puis le coup part.
          const shooter = table.aim && table.shooterReady && lot.occupants[table.shooterSlot];
          if (shooter) {
            const cueBall = table.balls[0];
            const progress = 1 - table.aimTimer / table.aimDuration;
            const pullBack = 0.04 + 0.12 * Math.min(1, progress * 1.5);
            const tipDistance = BALL_RADIUS + pullBack;
            const [tipX, tipY] = toBoard(cueBall.x - table.aim.dx * tipDistance, cueBall.y - table.aim.dy * tipDistance);
            const [handU, handV] = Game.shopGeometry.boardPointToLot(lot, shooter.x, shooter.y - HANDS_HEIGHT);
            const endX = x(handU);
            const endY = y(handV);
            c.strokeStyle = '#c8a165';
            c.lineWidth = radius(0.02);
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(tipX, tipY);
            c.lineTo(endX, endY);
            c.stroke();
            circle(c, tipX, tipY, radius(0.012), '#3d7dd8');   // bout bleu (craie)
          }
        });
      },
      drawOverPeople(g) {
        const { c, x, y, w, h } = g;
        // Salle un peu sombre, lumière chaude des lampes au-dessus des tables.
        c.fillStyle = 'rgba(25,12,0,.22)';
        c.fillRect(g.left, g.top, g.width, g.height);
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (const u of BILLIARD_TABLES_U) {
          // Halo doux, plus fort au centre de la table.
          const centerX = x(u + FELT.width / 2);
          const centerY = y(FELT.v + FELT.height / 2);
          const glow = c.createRadialGradient(centerX, centerY, 0, centerX, centerY, w(FELT.width * 0.6));
          glow.addColorStop(0, 'rgba(255,220,150,.22)');
          glow.addColorStop(1, 'rgba(255,220,150,0)');
          c.fillStyle = glow;
          c.beginPath();
          c.arc(centerX, centerY, w(FELT.width * 0.6), 0, FULL_TURN);
          c.fill();
        }
        c.restore();
      },
    },

    // 5 machines à sous (debout) et 4 places à la table de roulette (assis).
    casino: {
      seller: { u: 0.38, v: 0.58, behindCounter: true, counterColor: '#6b3a1e' },   // vendeur (décor)
      activity: 'mix',
      slots: [...SLOT_MACHINE_U.map(u => slot(u, 0.4, 'play')), ...CASINO_TABLE_SLOTS],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#6b1f33', '#5a1a2a', 6);   // moquette bordeaux
        // Machines à sous le long du mur du fond.
        for (const u of SLOT_MACHINE_U) {
          rect(c, x(u - 0.075), y(0.03), w(0.15), h(0.25), '#c9a227');   // caisse dorée
          rect(c, x(u - 0.055), y(0.07), w(0.11), h(0.1), '#1b1b2a');    // écran éteint
          rect(c, x(u - 0.06), y(0.2), w(0.12), h(0.04), '#8c1c1c');     // plateau à jetons
          circle(c, x(u + 0.085), y(0.09), radius(0.025), '#e74c3c');    // levier
        }
        // Chaises de la table.
        for (const seat of CASINO_TABLE_SLOTS) {
          circle(c, x(seat.u), y(seat.v), radius(0.07), '#2b1b10');
        }
        // Table de roulette : bord en bois, tapis vert, jetons et cartes.
        ellipse(c, x(ROULETTE.u), y(ROULETTE.v), w(0.24), h(0.18), '#6b3a1e');
        ellipse(c, x(ROULETTE.u), y(ROULETTE.v), w(0.215), h(0.15), '#1f8a4c');
        for (const [u, v, color] of [[0.36, 0.6, '#e74c3c'], [0.37, 0.7, '#3d7dd8'], [0.64, 0.6, '#f2c14e'], [0.63, 0.7, '#ffffff']]) {
          circle(c, x(u), y(v), radius(0.03), color);                     // piles de jetons
        }
        rect(c, x(0.46), y(0.75), w(0.03), h(0.06), '#ffffff');           // cartes
        rect(c, x(0.51), y(0.75), w(0.03), h(0.06), '#ffffff');
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h, radius } = g;
        // Écrans des machines : les symboles défilent quand quelqu'un joue.
        SLOT_MACHINE_U.forEach((u, k) => {
          if (!lot.occupants[k]) {
            return;
          }
          for (let reel = 0; reel < 3; reel++) {
            const symbol = SLOT_SYMBOLS[Math.floor(time * 8 + k * 3 + reel * 7) % SLOT_SYMBOLS.length];
            rect(c, x(u - 0.045 + reel * 0.033), y(0.085), w(0.025), h(0.07), symbol);
          }
          // Lampe clignotante au sommet.
          circle(c, x(u), y(0.035), radius(0.025), Math.floor(time * 4 + k) % 2 ? '#fff3a0' : '#e74c3c');
        });
        // Roulette qui tourne au centre de la table.
        const centerX = x(ROULETTE.u);
        const centerY = y(ROULETTE.v);
        const wheelRadius = radius(0.1);
        const spin = time * 2.5;
        for (let k = 0; k < 10; k++) {
          c.fillStyle = k === 0 ? '#1f8a4c' : (k % 2 ? '#c0392b' : '#1b1b2a');
          c.beginPath();
          c.moveTo(centerX, centerY);
          c.arc(centerX, centerY, wheelRadius, spin + k * Math.PI / 5, spin + (k + 1) * Math.PI / 5);
          c.closePath();
          c.fill();
        }
        circle(c, centerX, centerY, wheelRadius * 0.35, '#c9a227');
        // La bille tourne dans l'autre sens.
        circle(c, centerX + Math.cos(-spin * 1.7) * wheelRadius * 0.8, centerY + Math.sin(-spin * 1.7) * wheelRadius * 0.8, radius(0.018), '#ffffff');
      },
    },

    // 8 danseurs sur la piste.
    discotheque: {
      seller: { u: 0.42, v: 0.15, behindCounter: true, counterColor: '#3a2f55' },   // vendeur (décor)
      activity: 'dance',
      slots: DANCER_POSITIONS,
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        rect(c, g.left, g.top, g.width, g.height, '#141020');
        // Cabine du DJ et ses platines.
        rect(c, x(0.33), y(0.03), w(0.34), h(0.13), '#3a2f55');
        circle(c, x(0.42), y(0.095), radius(0.04), '#111');
        circle(c, x(0.58), y(0.095), radius(0.04), '#111');
        // Enceintes dans les coins du fond.
        for (const u of [0.03, 0.88]) {
          rect(c, x(u), y(0.04), w(0.09), h(0.2), '#0b0910');
          circle(c, x(u + 0.045), y(0.1), radius(0.03), '#2a2438');
          circle(c, x(u + 0.045), y(0.18), radius(0.04), '#2a2438');
        }
        // Piste de danse (dalles éteintes, allumées par drawAnimated).
        const floor = DANCE_FLOOR;
        rect(c, x(floor.left - 0.01), y(floor.top - 0.02), w(floor.columns * floor.tileU + 0.02), h(floor.rows * floor.tileV + 0.04), '#0b0910');
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h } = g;
        // Dalles de la piste qui changent de couleur au rythme de la musique.
        const floor = DANCE_FLOOR;
        const beat = Math.floor(time * 2.5);
        for (let row = 0; row < floor.rows; row++) {
          for (let column = 0; column < floor.columns; column++) {
            const hue = ((column + row * 2 + beat) * 47) % 360;
            const isLit = (column + row + beat) % 3 !== 0;
            const tileColor = isLit ? `hsl(${hue},80%,45%)` : '#241c36';
            rect(c, x(floor.left + column * floor.tileU) + 0.6, y(floor.top + row * floor.tileV) + 0.6, w(floor.tileU) - 1.2, h(floor.tileV) - 1.2, tileColor);
          }
        }
      },
      drawOverPeople(g, lot, time) {
        const { c, x, y, radius } = g;
        // Lumière tamisée sur toute la salle.
        c.fillStyle = 'rgba(15,5,35,.38)';
        c.fillRect(g.left, g.top, g.width, g.height);
        // Spots colorés qui balaient la salle depuis la boule à facettes.
        const ballX = x(DISCO_BALL.u);
        const ballY = y(DISCO_BALL.v);
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 5; k++) {
          const angle = time * 0.9 + k * Math.PI * 2 / 5;
          const spotX = x(0.5 + Math.cos(angle) * 0.32);
          const spotY = y(0.58 + Math.sin(angle) * 0.25);
          c.fillStyle = `hsla(${(k * 72 + time * 40) % 360},90%,60%,.28)`;
          c.beginPath();
          c.ellipse(spotX, spotY, radius(0.12), radius(0.09), 0, 0, FULL_TURN);
          c.fill();
        }
        c.restore();
        // Fil et boule à facettes, avec des reflets qui scintillent.
        c.strokeStyle = '#555';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(ballX, y(0));
        c.lineTo(ballX, ballY);
        c.stroke();
        const ballRadius = radius(0.07);
        circle(c, ballX, ballY, ballRadius, '#c9ced6');
        c.save();
        c.beginPath();
        c.arc(ballX, ballY, ballRadius, 0, FULL_TURN);
        c.clip();
        const facet = ballRadius / 2.5;
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            const shine = Math.sin(time * 6 + i * 1.7 + j * 2.3);
            c.fillStyle = shine > 0.5 ? '#ffffff' : (shine > -0.3 ? '#9aa2ad' : '#6b7280');
            c.fillRect(ballX + i * facet - facet / 2 + 0.2, ballY + j * facet - facet / 2 + 0.2, facet - 0.4, facet - 0.4);
          }
        }
        c.restore();
      },
    },
  });
})();
