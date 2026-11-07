// Intérieurs de loisirs et de services : coiffeur, arcade, bowling, cinéma, piscine (vestiaire, jacuzzi),
// manège, hôtel. Certains ont une partie animée (drawAnimated), redessinée à chaque image.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { rect, circle, ellipse } = Game.draw;
  const { slot, checkerFloor } = Game.furniture;

  const ARCADE_ROWS_V = [0.05, 0.22, 0.39, 0.56, 0.73];   // haut de chaque borne, en colonne
  const BOWLING_LANE_U = [0.2, 0.5, 0.8];
  const BOWLING_BALL_COLORS = ['#d6336c', '#3d7dd8', '#47a36b'];
  // Quilles en triangle : la pointe (quille n° 1) vers le lanceur, la rangée de 4 au fond.
  const HEAD_PIN_V = 0.205;
  const PIN_ROW_GAP_V = 0.045;
  const PIN_GAP_U = 0.035;
  // La boule va de v = 0,76 (ligne de lancer) à v = 0,04 (fosse, derrière les quilles).
  const BALL_START_V = 0.76;
  const BALL_END_V = 0.04;
  const PIN_LENGTH = 0.06;   // longueur d'une quille couchée (proportion de la hauteur)
  const CINEMA_ROWS_V = [0.34, 0.52, 0.7];
  const CINEMA_SEATS_U = [0.1, 0.24, 0.38, 0.62, 0.76, 0.9];
  const CAROUSEL_SEATS = 8;
  // Piscine : bassin à droite, jacuzzi en haut à gauche, vestiaire en bas à gauche.
  const POOL_CENTER_U = 0.65;
  const POOL_SWIM_RANGE = 0.25;   // les nageurs vont de u = 0,40 à u = 0,90
  const JACUZZI = { u: 0.16, v: 0.24, radius: 0.15 };
  const CABINS = [{ u: 0.09, curtain: '#2b8fbd' }, { u: 0.21, curtain: '#e8578f' }];
  const CABIN_DOOR_V = 0.83;

  Object.assign(Game.interiors, {
    coiffeur: {
      seller: { u: 0.35, v: 0.36, behindCounter: false },   // vendeur (décor)
      activity: 'sit',
      slots: [slot(0.2, 0.3), slot(0.5, 0.3), slot(0.8, 0.3)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#ffffff', '#2d2d34', 8);
        rect(c, x(0.04), y(0.03), w(0.92), h(0.07), '#bfe3f2');   // miroirs
        for (const u of [0.2, 0.5, 0.8]) {
          circle(c, x(u), y(0.3), radius(0.1), '#6b4fb3');          // fauteuils
          circle(c, x(u), y(0.3), radius(0.05), '#8f74d1');
        }
        rect(c, x(0.04), y(0.74), w(0.24), h(0.11), '#a0673c');   // caisse
        circle(c, x(0.92), y(0.78), radius(0.08), '#4d9b42');      // plante
      },
    },

    // Une place devant chaque borne ; la borne s'allume quand elle est occupée.
    // 5 bornes en colonne contre le mur de gauche ; chaque joueur se tient à droite de la sienne,
    // tourné vers l'écran. À droite : machine à pince, flippers et comptoir à lots (décor).
    arcade: {
      seller: { u: 0.58, v: 0.77, behindCounter: true },   // vendeur (décor)
      activity: 'play',
      slots: ARCADE_ROWS_V.map(v => slot(0.25, v + 0.11, undefined, -1)),
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        rect(c, g.left, g.top, g.width, g.height, '#2a2340');
        // Bornes : caisse, écran (éteint) tourné vers la salle, panneau de commandes.
        for (const v of ARCADE_ROWS_V) {
          rect(c, x(0.03), y(v), w(0.13), h(0.14), '#1b1630');
          rect(c, x(0.115), y(v + 0.02), w(0.035), h(0.1), '#3a3355');
          rect(c, x(0.155), y(v + 0.035), w(0.035), h(0.07), '#45406a');
          circle(c, x(0.172), y(v + 0.055), radius(0.014), '#e74c3c');   // joystick
          circle(c, x(0.172), y(v + 0.085), radius(0.01), '#f2c14e');    // bouton
        }
        // Machine à pince : vitrine remplie de peluches.
        rect(c, x(0.76), y(0.05), w(0.2), h(0.26), '#8c3fd1');
        rect(c, x(0.775), y(0.07), w(0.17), h(0.2), 'rgba(190,225,240,.35)');
        ['#f2c14e', '#ef7fb0', '#47a36b', '#3d7dd8', '#ff8c42', '#e74c3c'].forEach((color, k) => {
          circle(c, x(0.8 + (k % 3) * 0.055), y(0.2 + Math.floor(k / 3) * 0.045), radius(0.03), color);
        });
        // Deux flippers.
        for (const u of [0.48, 0.63]) {
          rect(c, x(u), y(0.38), w(0.1), h(0.3), '#1b1630');
          rect(c, x(u + 0.01), y(0.4), w(0.08), h(0.24), '#3d7dd8');
          rect(c, x(u + 0.02), y(0.6), w(0.025), h(0.015), '#ffffff');   // batteurs
          rect(c, x(u + 0.055), y(0.6), w(0.025), h(0.015), '#ffffff');
        }
        // Comptoir à lots (à gauche de l'enseigne de la boutique).
        rect(c, x(0.46), y(0.73), w(0.27), h(0.1), '#5a3a22');
        ['#f2c14e', '#ef7fb0', '#2bb3b1', '#e74c3c'].forEach((color, k) => {
          circle(c, x(0.5 + k * 0.062), y(0.78), radius(0.028), color);
        });
        c.strokeStyle = '#8c3fd1';
        c.lineWidth = 2;
        c.strokeRect(x(0.02), y(0.02), w(0.96), h(0.96));   // néon
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h, radius } = g;
        // Écrans des bornes : allumés et changeants quand quelqu'un joue.
        ARCADE_ROWS_V.forEach((v, k) => {
          const isPlaying = !!lot.occupants[k];
          const screenColor = isPlaying ? `hsl(${(time * 120 + k * 70) % 360},90%,60%)` : '#3a3355';
          rect(c, x(0.115), y(v + 0.02), w(0.035), h(0.1), screenColor);
        });
        // Pince qui se balade dans la vitrine.
        const clawU = 0.8 + (0.5 + 0.5 * Math.sin(time * 0.8)) * 0.11;
        c.strokeStyle = '#cfd3da';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(x(clawU), y(0.07));
        c.lineTo(x(clawU), y(0.13));
        c.stroke();
        circle(c, x(clawU), y(0.135), radius(0.018), '#cfd3da');
        // Champignons des flippers qui clignotent.
        [0.48, 0.63].forEach((u, k) => {
          for (let b = 0; b < 3; b++) {
            const lit = Math.floor(time * 5 + b + k * 2) % 3 === 0;
            circle(c, x(u + 0.025 + b * 0.025), y(0.47 + (b % 2) * 0.05), radius(0.018), lit ? '#fff3a0' : '#e74c3c');
          }
        });
      },
    },

    // 3 pistes ; le joueur se tient au bout de la sienne, côté porte.
    bowling: {
      activity: 'bowl',
      slots: BOWLING_LANE_U.map(u => slot(u, 0.88)),
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        rect(c, g.left, g.top, g.width, g.height, '#3a3f5c');
        for (const u of BOWLING_LANE_U) {
          rect(c, x(u - 0.12), y(0.03), w(0.24), h(0.76), '#8a8f9c');    // gouttières
          rect(c, x(u - 0.09), y(0.03), w(0.18), h(0.76), '#e2c08d');    // piste
          rect(c, x(u - 0.12), y(0.78), w(0.24), h(0.015), '#c0392b');   // ligne de lancer
        }
        rect(c, x(0), y(0.8), w(0.06), h(0.18), '#555');                 // retour des boules
      },
      // Moment où la boule touche la quille de tête (progression de 0 à 1).
      ballHitsPinsAt: (BALL_START_V - HEAD_PIN_V) / (BALL_START_V - BALL_END_V),
      drawAnimated(g, lot) {
        const { c, x, y, radius } = g;
        const BOWLING = Game.config.bowling;
        BOWLING_LANE_U.forEach((u, laneIndex) => {
          const lane = lot.bowlingLanes[laneIndex];
          const sinceHit = BOWLING.PINS_DOWN_SECONDS - lane.pinsDownTimer;
          // 10 quilles : rangées de 1 à 4, numérotées de la tête vers le fond.
          let pinIndex = 0;
          for (let row = 0; row < 4; row++) {
            for (let q = 0; q <= row; q++) {
              const pinX = x(u + (q - row / 2) * PIN_GAP_U);
              const pinY = y(HEAD_PIN_V - row * PIN_ROW_GAP_V);
              const fall = lane.pinsDownTimer > 0 && lane.pins && lane.pins[pinIndex];
              const sinceFall = fall ? sinceHit - fall.delay : 0;
              const fallAmount = fall ? Math.min(1, Math.max(0, sinceFall / BOWLING.PIN_FALL_SECONDS)) : 0;
              const sweptAmount = (sinceFall - BOWLING.PIN_FALL_SECONDS - BOWLING.PIN_LIE_SECONDS) / BOWLING.PIN_SWEEP_SECONDS;
              if (fallAmount > 0 && sweptAmount < 1) {
                // La quille bascule vers le fond (et un peu sur le côté), puis reste couchée.
                const directionLength = Math.hypot(fall.sideways, 1);
                const dx = fall.sideways / directionLength * radius(PIN_LENGTH);
                const dy = -1 / directionLength * radius(PIN_LENGTH);
                const baseX = pinX + dx * 0.3 * fallAmount;
                const baseY = pinY + dy * 0.3 * fallAmount;
                c.save();
                c.globalAlpha = 1 - Math.max(0, sweptAmount);
                c.strokeStyle = '#d8d8d8';
                c.lineWidth = radius(0.03);
                c.lineCap = 'round';
                c.beginPath();
                c.moveTo(baseX, baseY);
                c.lineTo(baseX + dx * fallAmount, baseY + dy * fallAmount);
                c.stroke();
                circle(c, baseX + dx * 0.7 * fallAmount, baseY + dy * 0.7 * fallAmount, radius(0.011), '#d22f3b');
                c.restore();
              } else if (fallAmount === 0) {
                circle(c, pinX, pinY, radius(0.022), '#ffffff');
                circle(c, pinX, pinY, radius(0.009), '#d22f3b');
              }
              pinIndex++;
            }
          }
          // La boule remonte la piste : ballProgress va de 0 (lancer) à 1 (fosse).
          if (lane.ballProgress >= 0) {
            circle(c, x(u), y(BALL_START_V - lane.ballProgress * (BALL_START_V - BALL_END_V)), radius(0.045), BOWLING_BALL_COLORS[laneIndex]);
          }
        });
      },
    },

    // 18 fauteuils en 3 rangées. Séances : voir Game.shops.update.
    cinema: {
      activity: 'session',
      session: {
        WAITING_SECONDS: Game.config.cinema.WAITING_SECONDS,
        RUNNING_SECONDS: Game.config.cinema.FILM_SECONDS,
        waitingLabel: remaining => `Séance dans ${remaining} s`,
        runningLabel: remaining => `Film · ${remaining} s`,
      },
      // Les spectateurs regardent l'écran (facesScreen), pas sur le côté.
      slots: CINEMA_ROWS_V.flatMap(v => CINEMA_SEATS_U.map(u => Object.assign(slot(u, v), { facesScreen: true }))),
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        rect(c, g.left, g.top, g.width, g.height, '#2b1f2a');
        rect(c, x(0.05), y(0.03), w(0.9), h(0.1), '#4a4048');   // cadre de l'écran
        for (const v of CINEMA_ROWS_V) {
          for (const u of CINEMA_SEATS_U) {
            rect(c, x(u - 0.05), y(v - 0.06), w(0.1), h(0.11), '#d22f3b');
            rect(c, x(u - 0.05), y(v + 0.02), w(0.1), h(0.03), '#9e1f29');   // dossier, côté opposé à l'écran
          }
        }
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h } = g;
        if (lot.session.phase === 'running') {
          // Image du film : bandes de couleurs changeantes.
          for (let k = 0; k < 8; k++) {
            const hue = (time * 60 + k * 25 + Math.sin(time * 3 + k) * 40) % 360;
            const lightness = 55 + 20 * Math.sin(time * 5 + k);
            rect(c, x(0.07 + k * 0.1075), y(0.045), w(0.11), h(0.07), `hsl(${hue},70%,${lightness}%)`);
          }
          // Faisceau du projecteur qui scintille.
          c.fillStyle = `rgba(255,255,230,${0.1 + 0.06 * Math.sin(time * 7)})`;
          c.beginPath();
          c.moveTo(x(0.07), y(0.12));
          c.lineTo(x(0.93), y(0.12));
          c.lineTo(x(0.98), y(0.8));
          c.lineTo(x(0.02), y(0.8));
          c.closePath();
          c.fill();
        } else {
          rect(c, x(0.07), y(0.045), w(0.86), h(0.07), '#e9e6dc');   // écran blanc
        }
      },
    },

    // Piscine : vestiaire (2 cabines), jacuzzi, bassin de 3 couloirs et 2 transats.
    // Les clients passent d'abord par une cabine (on ne les voit plus le temps de se changer),
    // en ressortent en maillot de bain, puis y repassent avant de partir (js/people/behaviour.js).
    piscine: {
      activity: 'mix',
      slots: [
        Object.assign(slot(POOL_CENTER_U, 0.15, 'swim'), { swimRange: POOL_SWIM_RANGE }),
        Object.assign(slot(POOL_CENTER_U, 0.31, 'swim'), { swimRange: POOL_SWIM_RANGE }),
        Object.assign(slot(POOL_CENTER_U, 0.47, 'swim'), { swimRange: POOL_SWIM_RANGE }),
        slot(JACUZZI.u - 0.055, JACUZZI.v - 0.01, 'soak', 1),
        slot(JACUZZI.u + 0.055, JACUZZI.v - 0.01, 'soak', -1),
        slot(JACUZZI.u, JACUZZI.v + 0.08, 'soak', 1),
        slot(0.62, 0.74, 'sit'),
        slot(0.8, 0.74, 'sit'),
      ],
      // Entrée de chaque cabine du vestiaire : le client y disparaît pour se changer.
      changingCabins: CABINS.map(cabin => ({ u: cabin.u, v: CABIN_DOOR_V })),
      swimsuitColors: ['#e74c3c', '#2b8fbd', '#f2c14e', '#27a35a', '#9a4fd6', '#ff7a45'],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        // Carrelage clair autour des bassins.
        checkerFloor(g, '#eef3f4', '#dde8ea', 8);
        // Bassin : margelle, eau, lignes d'eau en pointillés.
        rect(c, x(0.33), y(0.03), w(0.64), h(0.58), '#c9d6d9');
        rect(c, x(0.345), y(0.05), w(0.61), h(0.54), '#4fa8de');
        c.strokeStyle = 'rgba(255,255,255,.8)';
        c.lineWidth = 1;
        c.setLineDash([3, 3]);
        for (const v of [0.23, 0.39]) {
          c.beginPath();
          c.moveTo(x(0.35), y(v));
          c.lineTo(x(0.95), y(v));
          c.stroke();
        }
        c.setLineDash([]);
        // Échelle du bassin.
        c.strokeStyle = '#9aa2ad';
        c.lineWidth = radius(0.012);
        c.beginPath();
        c.moveTo(x(0.36), y(0.53));
        c.lineTo(x(0.4), y(0.53));
        c.moveTo(x(0.36), y(0.57));
        c.lineTo(x(0.4), y(0.57));
        c.stroke();
        // Jacuzzi rond : bord en bois, eau turquoise.
        circle(c, x(JACUZZI.u), y(JACUZZI.v), radius(JACUZZI.radius + 0.03), '#a0673c');
        circle(c, x(JACUZZI.u), y(JACUZZI.v), radius(JACUZZI.radius), '#5fd0d6');
        // Vestiaire : cloison, 2 cabines à rideau (dessinés dans drawAnimated) et un banc.
        rect(c, x(0.03), y(0.66), w(0.26), h(0.3), '#d9c9a8');
        rect(c, x(0.03), y(0.66), w(0.26), h(0.015), '#8a6a4a');
        for (const cabin of CABINS) {
          rect(c, x(cabin.u - 0.05), y(0.68), w(0.1), h(0.13), '#efe6d2');
          rect(c, x(cabin.u + 0.05), y(0.68), w(0.008), h(0.13), '#8a6a4a');   // séparation
        }
        rect(c, x(0.05), y(0.88), w(0.22), h(0.05), '#a0673c');   // banc
        // Transats et serviettes.
        for (const u of [0.62, 0.8]) {
          rect(c, x(u - 0.06), y(0.68), w(0.12), h(0.2), '#ffffff');
          rect(c, x(u - 0.05), y(0.7), w(0.1), h(0.16), ['#f2c14e', '#ef7fb0'][Math.round(u * 10) % 2]);
        }
        // Parasol.
        circle(c, x(0.71), y(0.71), radius(0.07), '#e74c3c');
        circle(c, x(0.71), y(0.71), radius(0.035), '#ffffff');
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h, radius } = g;
        // Bulles du jacuzzi.
        for (let k = 0; k < 9; k++) {
          const angle = k * 2.4 + time * 0.8;
          const distance = ((k * 37) % 10) / 10 * JACUZZI.radius * 0.85;
          const size = 0.01 + 0.008 * Math.sin(time * 6 + k);
          circle(c, x(JACUZZI.u) + Math.cos(angle) * radius(distance), y(JACUZZI.v) + Math.sin(angle) * radius(distance),
            radius(Math.max(0.004, size)), 'rgba(255,255,255,.75)');
        }
        // Rideaux des cabines : fermés quand quelqu'un se change (on voit ses pieds dessous).
        CABINS.forEach((cabin, cabinIndex) => {
          const isBusy = Game.state.people.some(person => person.lot === lot && person.isChanging && person.cabin === cabinIndex);
          if (isBusy) {
            rect(c, x(cabin.u - 0.05), y(0.68), w(0.1), h(0.12), cabin.curtain);
            for (let fold = 1; fold < 4; fold++) {
              rect(c, x(cabin.u - 0.05 + fold * 0.025), y(0.68), w(0.004), h(0.12), 'rgba(0,0,0,.15)');
            }
            circle(c, x(cabin.u - 0.015), y(0.81), radius(0.012), '#8a5a36');
            circle(c, x(cabin.u + 0.015), y(0.81), radius(0.012), '#8a5a36');
          } else {
            rect(c, x(cabin.u - 0.05), y(0.68), w(0.02), h(0.12), cabin.curtain);   // rideau tiré
          }
        });
      },
    },

    // 8 places ; les clients tournent avec le plateau (voir js/people/activities.js).
    manege: {
      seller: { u: 0.12, v: 0.62, behindCounter: false },   // vendeur (décor)
      activity: 'ride',
      slots: Array.from({ length: CAROUSEL_SEATS }, () => slot(0.5, 0.47, 'ride')),
      drawFurniture(g) {
        const { c, x, y, radius } = g;
        rect(c, g.left, g.top, g.width, g.height, '#f6ebc6');
        circle(c, x(0.5), y(0.47), radius(0.43), '#d9c48a');   // socle
        for (const u of [0.06, 0.94]) {
          circle(c, x(u), y(0.2), radius(0.07), '#3f8a3a');    // arbustes
        }
      },
      drawAnimated(g) {
        const { c, x, y, radius } = g;
        const centerX = x(0.5);
        const centerY = y(0.47);
        const plateRadius = radius(0.4);
        const startAngle = Game.state.gameTime * Game.config.carousel.TURN_SPEED;
        // Plateau à 12 parts qui tourne.
        for (let k = 0; k < 12; k++) {
          c.fillStyle = k % 2 ? '#ffffff' : (k % 4 ? '#e9b92e' : '#d64560');
          c.beginPath();
          c.moveTo(centerX, centerY);
          c.arc(centerX, centerY, plateRadius, startAngle + k * Math.PI / 6, startAngle + (k + 1) * Math.PI / 6);
          c.closePath();
          c.fill();
        }
        circle(c, centerX, centerY, plateRadius * 0.2, '#d64560');
        circle(c, centerX, centerY, plateRadius * 0.08, '#f2c14e');
      },
    },

    hotel: {
      seller: { u: 0.38, v: 0.17, behindCounter: true },   // vendeur (décor)
      activity: 'lobby',
      slots: [slot(0.5, 0.36), slot(0.15, 0.4), slot(0.15, 0.62), slot(0.85, 0.4), slot(0.85, 0.62)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        checkerFloor(g, '#efe9dc', '#e4dccb', 6);
        rect(c, x(0.3), y(0.05), w(0.4), h(0.16), '#b08a2e');     // réception
        circle(c, x(0.65), y(0.13), radius(0.025), '#fff');        // sonnette
        rect(c, x(0.03), y(0.3), w(0.07), h(0.42), '#7d2a3a');     // canapés
        rect(c, x(0.9), y(0.3), w(0.07), h(0.42), '#7d2a3a');
        ellipse(c, x(0.5), y(0.6), w(0.16), h(0.15), '#c8553d');   // tapis
        ellipse(c, x(0.5), y(0.6), w(0.1), h(0.09), '#e08a6a');
        circle(c, x(0.08), y(0.13), radius(0.07), '#3f8a3a');      // plantes
        circle(c, x(0.92), y(0.13), radius(0.07), '#3f8a3a');
      },
    },
  });
})();
