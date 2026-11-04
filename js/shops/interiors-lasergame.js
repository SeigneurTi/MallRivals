// Laser game : deux équipes (rouge à gauche, bleue à droite).
// Comme au cinéma, il y a un temps pour entrer et s'équiper, puis une partie pendant laquelle
// personne n'entre : les joueurs courent dans l'arène et se tirent dessus au laser.
// Les déplacements et les tirs des joueurs sont dans js/people/activities.js.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle } = Game.draw;
  const { slot } = Game.furniture;
  const LASERGAME = Game.config.lasergame;

  const TEAM_COLORS = ['#ff3b5c', '#3bc8ff'];
  const TEAM_NAMES = ['rouge', 'bleue'];
  const SHOT_SECONDS = 0.22;   // durée d'affichage d'un tir

  // 5 joueurs par équipe, dans leur base au début de la partie, tournés vers l'adversaire.
  const BASE_POSITIONS = [[0.1, 0.32], [0.1, 0.52], [0.1, 0.72], [0.21, 0.42], [0.21, 0.62]];
  const LASER_SLOTS = [
    ...BASE_POSITIONS.map(([u, v]) => Object.assign(slot(u, v, 'laser', 1), { team: 0 })),
    ...BASE_POSITIONS.map(([u, v]) => Object.assign(slot(1 - u, v, 'laser', -1), { team: 1 })),
  ];

  // Obstacles de l'arène (rectangles u, v, largeur, hauteur), éclairés aux néons.
  const OBSTACLES = [[0.36, 0.24, 0.08, 0.2], [0.56, 0.56, 0.08, 0.2], [0.44, 0.5, 0.12, 0.06], [0.3, 0.7, 0.1, 0.06], [0.62, 0.3, 0.1, 0.06]];

  Object.assign(Game.interiors, {
    lasergame: {
      activity: 'laser',
      slots: LASER_SLOTS,
      session: {
        WAITING_SECONDS: LASERGAME.WAITING_SECONDS,
        RUNNING_SECONDS: LASERGAME.PLAYING_SECONDS,
        waitingLabel: remaining => `Partie dans ${remaining} s`,
        runningLabel: remaining => `Partie · ${remaining} s`,
      },
      TEAM_COLORS,
      createState(lot) {
        lot.laser = { shots: [], hits: [0, 0] };   // tirs affichés, adversaires touchés par équipe
      },
      onSessionStart(lot) {
        lot.laser.hits = [0, 0];
      },
      // Fin de partie : l'équipe qui a le plus touché l'autre gagne.
      onSessionEnd(lot) {
        const [red, blue] = lot.laser.hits;
        if (red + blue === 0) {
          return;
        }
        if (red === blue) {
          Game.feedback.floatText(lot, 'Égalité !', '#ffffff');
        } else {
          const winner = red > blue ? 0 : 1;
          Game.feedback.floatText(lot, `Équipe ${TEAM_NAMES[winner]} gagne !`, TEAM_COLORS[winner]);
        }
      },
      update(lot, dt) {
        for (const shot of lot.laser.shots) {
          shot.age += dt;
        }
        lot.laser.shots = lot.laser.shots.filter(shot => shot.age < SHOT_SECONDS);
      },
      drawFurniture(g) {
        const { c, x, y, w, h } = g;
        rect(c, g.left, g.top, g.width, g.height, '#15161f');
        // Bases des deux équipes.
        rect(c, x(0.02), y(0.2), w(0.26), h(0.62), 'rgba(255,59,92,.18)');
        rect(c, x(0.72), y(0.2), w(0.26), h(0.62), 'rgba(59,200,255,.18)');
        // Râtelier de fusils au fond.
        rect(c, x(0.38), y(0.03), w(0.24), h(0.1), '#2a2e36');
        for (let k = 0; k < 6; k++) {
          rect(c, x(0.4 + k * 0.035), y(0.045), w(0.015), h(0.07), k < 3 ? TEAM_COLORS[0] : TEAM_COLORS[1]);
        }
        // Obstacles.
        for (const [u, v, width, height] of OBSTACLES) {
          rect(c, x(u), y(v), w(width), h(height), '#2a2e40');
        }
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h } = g;
        // Néons des obstacles, qui pulsent pendant la partie.
        const isPlaying = lot.session.phase === 'running';
        const glow = isPlaying ? 0.6 + 0.4 * Math.sin(time * 6) : 0.5;
        c.lineWidth = 1.2;
        OBSTACLES.forEach(([u, v, width, height], k) => {
          c.strokeStyle = k % 2 ? `rgba(43,209,160,${glow})` : `rgba(200,90,255,${glow})`;
          c.strokeRect(x(u), y(v), w(width), h(height));
        });
      },
      drawOverPeople(g, lot, time) {
        const { c, x, y, radius } = g;
        // Pendant la partie, la salle est dans le noir.
        if (lot.session.phase === 'running') {
          c.fillStyle = 'rgba(5,5,20,.32)';
          c.fillRect(g.left, g.top, g.width, g.height);
        }
        // Tirs laser : un trait lumineux du canon jusqu'à la cible, qui s'efface vite.
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.lineCap = 'round';
        for (const shot of lot.laser.shots) {
          const fade = 1 - shot.age / SHOT_SECONDS;
          c.globalAlpha = fade;
          c.strokeStyle = TEAM_COLORS[shot.team];
          c.lineWidth = radius(0.025);
          c.beginPath();
          c.moveTo(x(shot.from[0]), y(shot.from[1]));
          c.lineTo(x(shot.to[0]), y(shot.to[1]));
          c.stroke();
          c.strokeStyle = '#ffffff';
          c.lineWidth = radius(0.008);
          c.stroke();
          // Impact.
          c.fillStyle = TEAM_COLORS[shot.team];
          c.beginPath();
          c.arc(x(shot.to[0]), y(shot.to[1]), radius(0.03) * (1 + shot.age * 4), 0, FULL_TURN);
          c.fill();
        }
        c.restore();
      },
    },
  });
})();
