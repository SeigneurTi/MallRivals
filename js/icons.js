// Icônes des enseignes et des cartes (fleur, croissant, bobine de film…).
// Chaque icône est dessinée autour de (cx, cy) dans un rayon r, avec la couleur de la boutique.
(function () {
  'use strict';

  const { FULL_TURN, roundedRectPath } = Game.draw;

  function dot(c, x, y, radius) {
    c.beginPath();
    c.arc(x, y, radius, 0, FULL_TURN);
    c.fill();
  }

  const ICONS = {
    flower(c, cx, cy, r) {
      for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5;
        dot(c, cx + Math.cos(angle) * r * 0.45, cy + Math.sin(angle) * r * 0.45, r * 0.38);
      }
      c.fillStyle = '#f2c14e';
      dot(c, cx, cy, r * 0.3);
    },

    news(c, cx, cy, r) {
      c.fillRect(cx - r * 0.6, cy - r * 0.65, r * 1.2, r * 1.3);
      c.fillStyle = '#fff';
      c.fillRect(cx - r * 0.45, cy - r * 0.5, r * 0.9, r * 0.25);   // titre
      for (let i = 0; i < 3; i++) {
        c.fillRect(cx - r * 0.45, cy - r * 0.1 + i * r * 0.25, r * 0.9, r * 0.1);   // lignes de texte
      }
    },

    croissant(c, cx, cy, r) {
      c.lineWidth = r * 0.5;
      c.beginPath();
      c.arc(cx, cy + r * 0.45, r * 0.65, Math.PI * 1.12, Math.PI * 1.88);
      c.stroke();
    },

    cup(c, cx, cy, r) {
      c.fillRect(cx - r * 0.55, cy - r * 0.15, r * 0.85, r * 0.7);
      // Anse.
      c.lineWidth = r * 0.18;
      c.beginPath();
      c.arc(cx + r * 0.35, cy + r * 0.18, r * 0.22, -1.4, 1.4);
      c.stroke();
      // Vapeur.
      c.lineWidth = r * 0.12;
      c.beginPath();
      c.moveTo(cx - r * 0.3, cy - r * 0.35);
      c.lineTo(cx - r * 0.2, cy - r * 0.7);
      c.moveTo(cx, cy - r * 0.35);
      c.lineTo(cx + r * 0.1, cy - r * 0.7);
      c.stroke();
    },

    icecream(c, cx, cy, r, color) {
      c.fillStyle = '#d9a35b';
      c.beginPath();
      c.moveTo(cx - r * 0.38, cy);
      c.lineTo(cx + r * 0.38, cy);
      c.lineTo(cx, cy + r * 0.8);
      c.closePath();
      c.fill();
      c.fillStyle = color;
      dot(c, cx, cy - r * 0.12, r * 0.45);
    },

    book(c, cx, cy, r) {
      c.fillRect(cx - r * 0.7, cy - r * 0.5, r * 0.62, r * 1);
      c.fillRect(cx + r * 0.08, cy - r * 0.5, r * 0.62, r * 1);
      c.fillStyle = '#fff';
      for (let i = 0; i < 2; i++) {
        c.fillRect(cx - r * 0.58, cy - r * 0.25 + i * r * 0.3, r * 0.4, r * 0.08);
        c.fillRect(cx + r * 0.2, cy - r * 0.25 + i * r * 0.3, r * 0.4, r * 0.08);
      }
    },

    cross(c, cx, cy, r) {
      c.fillRect(cx - r * 0.22, cy - r * 0.68, r * 0.44, r * 1.36);
      c.fillRect(cx - r * 0.68, cy - r * 0.22, r * 1.36, r * 0.44);
    },

    pizza(c, cx, cy, r, color) {
      c.fillStyle = '#f2c14e';
      c.beginPath();
      c.moveTo(cx - r * 0.6, cy - r * 0.45);
      c.lineTo(cx + r * 0.6, cy - r * 0.45);
      c.lineTo(cx, cy + r * 0.7);
      c.closePath();
      c.fill();
      c.fillStyle = '#c98a3a';
      c.fillRect(cx - r * 0.66, cy - r * 0.62, r * 1.32, r * 0.2);   // croûte
      c.fillStyle = color;
      for (const [u, v] of [[-0.22, -0.15], [0.2, -0.12], [0, 0.22]]) {
        dot(c, cx + u * r, cy + v * r, r * 0.12);                      // rondelles
      }
    },

    bear(c, cx, cy, r) {
      c.fillStyle = '#a0673c';
      for (const side of [-1, 1]) {
        dot(c, cx + side * r * 0.45, cy - r * 0.45, r * 0.24);        // oreilles
      }
      dot(c, cx, cy, r * 0.55);
      c.fillStyle = '#f0d2b0';
      dot(c, cx, cy + r * 0.15, r * 0.22);                            // museau
      c.fillStyle = '#222';
      c.beginPath();
      c.arc(cx - r * 0.2, cy - r * 0.12, r * 0.07, 0, FULL_TURN);
      c.arc(cx + r * 0.2, cy - r * 0.12, r * 0.07, 0, FULL_TURN);
      c.fill();
    },

    scissors(c, cx, cy, r) {
      c.lineWidth = r * 0.16;
      c.beginPath();
      c.arc(cx - r * 0.32, cy + r * 0.45, r * 0.2, 0, FULL_TURN);
      c.stroke();
      c.beginPath();
      c.arc(cx + r * 0.32, cy + r * 0.45, r * 0.2, 0, FULL_TURN);
      c.stroke();
      c.beginPath();
      c.moveTo(cx - r * 0.2, cy + r * 0.3);
      c.lineTo(cx + r * 0.35, cy - r * 0.65);
      c.moveTo(cx + r * 0.2, cy + r * 0.3);
      c.lineTo(cx - r * 0.35, cy - r * 0.65);
      c.stroke();
    },

    burger(c, cx, cy, r) {
      c.fillStyle = '#e0a346';
      c.beginPath();
      c.ellipse(cx, cy - r * 0.2, r * 0.65, r * 0.38, 0, Math.PI, 0);   // pain du dessus
      c.fill();
      c.fillStyle = '#5fb350';
      c.fillRect(cx - r * 0.68, cy - r * 0.2, r * 1.36, r * 0.14);     // salade
      c.fillStyle = '#6b3a1e';
      c.fillRect(cx - r * 0.62, cy - r * 0.06, r * 1.24, r * 0.24);    // steak
      c.fillStyle = '#e0a346';
      roundedRectPath(c, cx - r * 0.62, cy + r * 0.2, r * 1.24, r * 0.24, r * 0.1);
      c.fill();
    },

    shirt(c, cx, cy, r) {
      c.beginPath();
      c.moveTo(cx - r * 0.3, cy - r * 0.6);
      c.lineTo(cx - r * 0.75, cy - r * 0.3);
      c.lineTo(cx - r * 0.55, cy);
      c.lineTo(cx - r * 0.42, cy - r * 0.08);
      c.lineTo(cx - r * 0.42, cy + r * 0.62);
      c.lineTo(cx + r * 0.42, cy + r * 0.62);
      c.lineTo(cx + r * 0.42, cy - r * 0.08);
      c.lineTo(cx + r * 0.55, cy);
      c.lineTo(cx + r * 0.75, cy - r * 0.3);
      c.lineTo(cx + r * 0.3, cy - r * 0.6);
      c.quadraticCurveTo(cx, cy - r * 0.35, cx - r * 0.3, cy - r * 0.6);   // col
      c.fill();
    },

    joystick(c, cx, cy, r, color) {
      c.fillStyle = '#333';
      roundedRectPath(c, cx - r * 0.6, cy + r * 0.15, r * 1.2, r * 0.45, r * 0.12);
      c.fill();
      c.lineWidth = r * 0.16;
      c.strokeStyle = '#333';
      c.beginPath();
      c.moveTo(cx, cy + r * 0.2);
      c.lineTo(cx, cy - r * 0.35);
      c.stroke();
      c.fillStyle = color;
      dot(c, cx, cy - r * 0.45, r * 0.26);
      c.fillStyle = '#e74c3c';
      dot(c, cx + r * 0.35, cy + r * 0.37, r * 0.09);
    },

    cutlery(c, cx, cy, r) {
      // Fourchette.
      c.lineWidth = r * 0.14;
      c.beginPath();
      c.moveTo(cx - r * 0.3, cy - r * 0.65);
      c.lineTo(cx - r * 0.3, cy + r * 0.65);
      for (const u of [-0.5, -0.3, -0.1]) {
        c.moveTo(cx + u * r, cy - r * 0.65);
        c.lineTo(cx + u * r, cy - r * 0.2);
      }
      c.moveTo(cx - r * 0.5, cy - r * 0.2);
      c.lineTo(cx - r * 0.1, cy - r * 0.2);
      c.stroke();
      // Couteau.
      c.beginPath();
      c.moveTo(cx + r * 0.35, cy + r * 0.65);
      c.lineTo(cx + r * 0.35, cy - r * 0.65);
      c.quadraticCurveTo(cx + r * 0.65, cy - r * 0.3, cx + r * 0.35, cy);
      c.fill();
      c.stroke();
    },

    pin(c, cx, cy, r) {
      dot(c, cx, cy - r * 0.42, r * 0.25);
      c.beginPath();
      c.ellipse(cx, cy + r * 0.2, r * 0.38, r * 0.5, 0, 0, FULL_TURN);
      c.fill();
      c.fillRect(cx - r * 0.13, cy - r * 0.32, r * 0.26, r * 0.3);
      c.fillStyle = '#fff';
      c.fillRect(cx - r * 0.2, cy - r * 0.2, r * 0.4, r * 0.07);     // bandes de la quille
      c.fillRect(cx - r * 0.24, cy - r * 0.08, r * 0.48, r * 0.07);
    },

    reel(c, cx, cy, r) {
      dot(c, cx, cy, r * 0.7);
      c.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
        dot(c, cx + Math.cos(angle) * r * 0.38, cy + Math.sin(angle) * r * 0.38, r * 0.16);
      }
      dot(c, cx, cy, r * 0.08);
    },

    diamond(c, cx, cy, r) {
      c.beginPath();
      c.moveTo(cx - r * 0.65, cy - r * 0.25);
      c.lineTo(cx - r * 0.35, cy - r * 0.6);
      c.lineTo(cx + r * 0.35, cy - r * 0.6);
      c.lineTo(cx + r * 0.65, cy - r * 0.25);
      c.lineTo(cx, cy + r * 0.7);
      c.closePath();
      c.fill();
      // Facettes.
      c.strokeStyle = 'rgba(255,255,255,.8)';
      c.lineWidth = r * 0.07;
      c.beginPath();
      c.moveTo(cx - r * 0.65, cy - r * 0.25);
      c.lineTo(cx + r * 0.65, cy - r * 0.25);
      c.moveTo(cx - r * 0.2, cy - r * 0.6);
      c.lineTo(cx, cy + r * 0.7);
      c.lineTo(cx + r * 0.2, cy - r * 0.6);
      c.stroke();
    },

    pool(c, cx, cy, r, color) {
      c.fillStyle = color;
      roundedRectPath(c, cx - r * 0.7, cy - r * 0.55, r * 1.4, r * 1.1, r * 0.25);
      c.fill();
      // Vagues.
      c.strokeStyle = '#fff';
      c.lineWidth = r * 0.12;
      for (const v of [-0.15, 0.2]) {
        c.beginPath();
        c.moveTo(cx - r * 0.5, cy + v * r);
        c.quadraticCurveTo(cx - r * 0.25, cy + (v - 0.18) * r, cx, cy + v * r);
        c.quadraticCurveTo(cx + r * 0.25, cy + (v + 0.18) * r, cx + r * 0.5, cy + v * r);
        c.stroke();
      }
    },

    carousel(c, cx, cy, r, color) {
      for (let k = 0; k < 8; k++) {
        c.fillStyle = k % 2 ? '#d64560' : color;
        c.beginPath();
        c.moveTo(cx, cy);
        c.arc(cx, cy, r * 0.75, k * Math.PI / 4, (k + 1) * Math.PI / 4);
        c.closePath();
        c.fill();
      }
      c.fillStyle = '#fff';
      dot(c, cx, cy, r * 0.18);
    },

    dice(c, cx, cy, r) {
      roundedRectPath(c, cx - r * 0.65, cy - r * 0.65, r * 1.3, r * 1.3, r * 0.25);
      c.fill();
      c.fillStyle = '#fff';
      for (const [u, v] of [[-0.32, -0.32], [0.32, -0.32], [0, 0], [-0.32, 0.32], [0.32, 0.32]]) {
        dot(c, cx + u * r, cy + v * r, r * 0.13);   // les 5 points du dé
      }
    },

    discoball(c, cx, cy, r, color) {
      c.fillStyle = '#c9ced6';
      dot(c, cx, cy + r * 0.1, r * 0.6);
      // Facettes.
      c.strokeStyle = '#7d8590';
      c.lineWidth = r * 0.08;
      c.beginPath();
      for (const offset of [-0.3, 0, 0.3]) {
        c.moveTo(cx - r * 0.55, cy + r * (0.1 + offset));
        c.lineTo(cx + r * 0.55, cy + r * (0.1 + offset));
        c.moveTo(cx + r * offset, cy - r * 0.45);
        c.lineTo(cx + r * offset, cy + r * 0.65);
      }
      c.stroke();
      // Fil et reflet coloré.
      c.strokeStyle = color;
      c.lineWidth = r * 0.12;
      c.beginPath();
      c.moveTo(cx, cy - r * 0.5);
      c.lineTo(cx, cy - r * 0.85);
      c.stroke();
      c.fillStyle = color;
      dot(c, cx - r * 0.2, cy - r * 0.1, r * 0.14);
    },

    H(c, cx, cy, r) {
      c.font = `800 ${r * 1.5}px "Baloo 2", system-ui, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('H', cx, cy + r * 0.1);
    },
  };

  function drawIcon(c, kind, cx, cy, r, color) {
    c.save();
    c.fillStyle = color;
    c.strokeStyle = color;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    if (ICONS[kind]) {
      ICONS[kind](c, cx, cy, r, color);
    }
    c.restore();
  }

  Game.icons = { draw: drawIcon };
})();
