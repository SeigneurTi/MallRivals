// Intérieurs de loisirs et de services : coiffeur, arcade, bowling, cinéma, piscine,
// manège, hôtel. Certains ont une partie animée (drawAnimated), redessinée à chaque image.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { rect, circle, ellipse } = Game.draw;
  const { slot, checkerFloor } = Game.furniture;

  const ARCADE_MACHINES = 5;
  const BOWLING_LANE_U = [0.2, 0.5, 0.8];
  const BOWLING_BALL_COLORS = ['#d6336c', '#3d7dd8', '#47a36b'];
  const CINEMA_ROWS_V = [0.34, 0.52, 0.7];
  const CINEMA_SEATS_U = [0.1, 0.24, 0.38, 0.62, 0.76, 0.9];
  const CAROUSEL_SEATS = 8;

  Object.assign(Game.interiors, {
    coiffeur: {
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
    arcade: {
      activity: 'play',
      slots: [0, 1, 2, 3, 4].map(k => slot(0.17 + k * 0.165, 0.42)),
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        rect(c, g.left, g.top, g.width, g.height, '#2a2340');
        for (let k = 0; k < ARCADE_MACHINES; k++) {
          rect(c, x(0.1 + k * 0.165), y(0.04), w(0.14), h(0.24), '#1b1630');   // borne
          rect(c, x(0.12 + k * 0.165), y(0.07), w(0.1), h(0.1), '#3a3355');    // écran éteint
        }
        c.strokeStyle = '#8c3fd1';
        c.lineWidth = 2;
        c.strokeRect(x(0.02), y(0.02), w(0.96), h(0.96));   // néon
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h } = g;
        for (let k = 0; k < ARCADE_MACHINES; k++) {
          const isPlaying = !!lot.occupants[k];
          const screenColor = isPlaying ? `hsl(${(time * 120 + k * 70) % 360},90%,60%)` : '#3a3355';
          rect(c, x(0.12 + k * 0.165), y(0.07), w(0.1), h(0.1), screenColor);
        }
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
      drawAnimated(g, lot) {
        const { c, x, y, radius } = g;
        BOWLING_LANE_U.forEach((u, laneIndex) => {
          const lane = lot.bowlingLanes[laneIndex];
          // 10 quilles en triangle (rangées de 1 à 4).
          for (let row = 0; row < 4; row++) {
            for (let q = 0; q <= row; q++) {
              const pinX = x(u + (q - row / 2) * 0.035);
              const pinY = y(0.07 + row * 0.045);
              // Après un lancer, toutes les quilles tombent sauf celles où (q + row) % 5 === 4.
              const isDown = lane.pinsDownTimer > 0 && (q + row) % 5 !== 4;
              if (isDown) {
                c.strokeStyle = '#cfcfcf';
                c.lineWidth = radius(0.025);
                c.beginPath();
                c.moveTo(pinX - radius(0.03), pinY);
                c.lineTo(pinX + radius(0.03), pinY + radius(0.01));
                c.stroke();
              } else {
                circle(c, pinX, pinY, radius(0.022), '#ffffff');
              }
            }
          }
          // La boule remonte la piste : ballProgress va de 0 (lancer) à 1 (quilles).
          if (lane.ballProgress >= 0) {
            circle(c, x(u), y(0.76 - lane.ballProgress * 0.66), radius(0.045), BOWLING_BALL_COLORS[laneIndex]);
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

    // 3 nageurs (couloirs) et 2 transats.
    piscine: {
      activity: 'mix',
      slots: [
        slot(0.5, 0.18, 'swim'),
        slot(0.5, 0.38, 'swim'),
        slot(0.5, 0.58, 'swim'),
        slot(0.12, 0.86, 'sit'),
        slot(0.88, 0.86, 'sit'),
      ],
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        rect(c, g.left, g.top, g.width, g.height, '#e9e2d0');
        rect(c, x(0.04), y(0.05), w(0.92), h(0.64), '#4fa8de');   // bassin
        // Lignes d'eau en pointillés.
        c.strokeStyle = 'rgba(255,255,255,.8)';
        c.lineWidth = 1;
        c.setLineDash([3, 3]);
        for (const v of [0.28, 0.48]) {
          c.beginPath();
          c.moveTo(x(0.05), y(v));
          c.lineTo(x(0.95), y(v));
          c.stroke();
        }
        c.setLineDash([]);
        // Serviettes de bain.
        for (const u of [0.06, 0.18, 0.82, 0.94]) {
          const towelColor = ['#f2c14e', '#ef7fb0', '#2bb3b1', '#ff8c42'][Math.round(u * 10) % 4];
          rect(c, x(u - 0.04), y(0.76), w(0.08), h(0.2), towelColor);
        }
      },
    },

    // 8 places ; les clients tournent avec le plateau (voir js/people/activities.js).
    manege: {
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
