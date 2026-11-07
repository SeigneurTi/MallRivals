// Magasin de musique : guitares au mur, piano à queue où un client s'assoit pour jouer,
// batterie, ampli et comptoir. Des notes s'envolent du piano quand quelqu'un en joue.
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle, ellipse } = Game.draw;
  const { slot, plankFloor } = Game.furniture;

  const GUITAR_COLORS = ['#c0392b', '#e08a2c', '#1f2a44', '#3d7dd8', '#f2f2f2', '#2e7d4f', '#9a5fd1'];
  const PIANO_BENCH = { u: 0.36, v: 0.6 };
  const NOTE_COLORS = ['#4b3f9e', '#d6336c', '#2b8fbd'];

  // Guitare accrochée au mur, vue de face : caisse en 8, rosace, manche et tête.
  function guitar(g, u, v, color) {
    const { c, x, y, w, h, radius } = g;
    rect(c, x(u) - radius(0.009), y(v - 0.13), radius(0.018), h(0.1), '#6b4a2a');    // manche
    rect(c, x(u) - radius(0.016), y(v - 0.15), radius(0.032), h(0.03), '#3a2a1a');   // tête
    circle(c, x(u), y(v), radius(0.055), color);                                      // bas de la caisse
    circle(c, x(u), y(v - 0.045), radius(0.042), color);                              // haut de la caisse
    circle(c, x(u), y(v - 0.02), radius(0.016), '#2a1e14');                            // rosace
  }

  // Piano à queue vu de dessus : caisse noire arrondie, couvercle, clavier côté banc.
  function grandPiano(g) {
    const { c, x, y, w, h, radius } = g;
    c.fillStyle = '#16161c';
    c.beginPath();
    c.moveTo(x(0.06), y(0.36));
    c.lineTo(x(0.2), y(0.36));
    c.quadraticCurveTo(x(0.3), y(0.38), x(0.3), y(0.5));
    c.lineTo(x(0.3), y(0.72));
    c.lineTo(x(0.06), y(0.72));
    c.closePath();
    c.fill();
    // Reflet du couvercle et cordes.
    c.strokeStyle = 'rgba(255,255,255,.18)';
    c.lineWidth = radius(0.006);
    for (let k = 0; k < 5; k++) {
      c.beginPath();
      c.moveTo(x(0.09 + k * 0.035), y(0.4));
      c.lineTo(x(0.09 + k * 0.035), y(0.66));
      c.stroke();
    }
    // Clavier le long du bord droit, face au banc.
    rect(c, x(0.27), y(0.4), w(0.03), h(0.3), '#ffffff');
    for (let k = 0; k < 7; k++) {
      rect(c, x(0.27), y(0.42 + k * 0.04), w(0.018), h(0.018), '#16161c');
    }
    // Banc.
    rect(c, x(PIANO_BENCH.u - 0.025), y(PIANO_BENCH.v - 0.07), w(0.05), h(0.14), '#3a2a1a');
  }

  // Batterie vue de dessus : grosse caisse, caisse claire, toms et cymbales dorées.
  function drumKit(g) {
    const { c, x, y, radius } = g;
    circle(c, x(0.8), y(0.43), radius(0.07), '#c0392b');
    circle(c, x(0.8), y(0.43), radius(0.055), '#f4efe6');
    circle(c, x(0.7), y(0.5), radius(0.035), '#c0392b');
    circle(c, x(0.7), y(0.5), radius(0.026), '#f4efe6');
    circle(c, x(0.74), y(0.36), radius(0.03), '#c0392b');
    circle(c, x(0.87), y(0.35), radius(0.03), '#c0392b');
    for (const [u, v] of [[0.66, 0.38], [0.93, 0.47]]) {
      circle(c, x(u), y(v), radius(0.045), '#d9b44a');
      circle(c, x(u), y(v), radius(0.01), '#8a6d1f');
    }
    circle(c, x(0.85), y(0.52), radius(0.02), '#2a2e36');   // tabouret
  }

  // Note de musique : tête ronde, hampe et crochet.
  function musicNote(c, centerX, centerY, size, color) {
    c.fillStyle = color;
    c.strokeStyle = color;
    c.lineWidth = size * 0.25;
    ellipse(c, centerX, centerY, size * 0.55, size * 0.4, color);
    c.beginPath();
    c.moveTo(centerX + size * 0.5, centerY);
    c.lineTo(centerX + size * 0.5, centerY - size * 1.6);
    c.quadraticCurveTo(centerX + size * 1.1, centerY - size * 1.2, centerX + size * 1.1, centerY - size * 0.7);
    c.stroke();
  }

  Object.assign(Game.interiors, {
    musique: {
      seller: { u: 0.7, v: 0.7, behindCounter: true, counterColor: '#5a3d2b' },   // vendeur (décor)
      activity: 'browse',
      // Un client s'assoit au piano ; les autres regardent les guitares et la batterie.
      slots: [slot(PIANO_BENCH.u, PIANO_BENCH.v, 'sit', -1), slot(0.3, 0.27), slot(0.6, 0.27), slot(0.62, 0.55)],
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        plankFloor(g, '#b98a5e', '#a6784f');
        // Tapis sous la batterie.
        rect(c, x(0.62), y(0.3), w(0.34), h(0.27), '#7d2a3a');
        // Mur de guitares au fond.
        rect(c, x(0.03), y(0.03), w(0.94), h(0.17), '#6b4a2a');
        for (let k = 0; k < 6; k++) {
          guitar(g, 0.11 + k * 0.156, 0.15, GUITAR_COLORS[k]);
        }
        grandPiano(g);
        drumKit(g);
        // Ampli.
        rect(c, x(0.42), y(0.32), w(0.1), h(0.1), '#2a2e36');
        circle(c, x(0.47), y(0.37), radius(0.03), '#55595f');
        // Comptoir et caisse, devant le vendeur.
        rect(c, x(0.56), y(0.68), w(0.26), h(0.1), '#5a3d2b');
        rect(c, x(0.6), y(0.7), w(0.05), h(0.05), '#2a2e36');
        // Partitions posées sur le comptoir.
        rect(c, x(0.7), y(0.7), w(0.05), h(0.06), '#ffffff');
      },
      drawAnimated(g, lot, time) {
        // Quand le pianiste joue, des notes s'envolent du piano.
        const pianist = lot.occupants[0];
        if (!pianist || pianist.insidePhase !== 'active') {
          return;
        }
        for (let k = 0; k < 3; k++) {
          const progress = (time * 0.5 + k / 3) % 1;
          const u = 0.18 + Math.sin(progress * 6 + k * 2) * 0.05;
          const v = 0.5 - progress * 0.3;
          g.c.globalAlpha = 1 - progress;
          musicNote(g.c, g.x(u), g.y(v), g.radius(0.025), NOTE_COLORS[k]);
        }
        g.c.globalAlpha = 1;
      },
    },
  });
})();
