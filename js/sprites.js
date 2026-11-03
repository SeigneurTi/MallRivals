// Petits dessins réutilisés : bouclier, voiture, icônes des cartes malus.
(function () {
  'use strict';

  const { FULL_TURN, roundedRectPath } = Game.draw;

  // Écusson bleu de largeur `width`, coin haut gauche en (x, y).
  function drawShield(c, x, y, width) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + width, y);
    c.lineTo(x + width, y + width * 0.55);
    c.quadraticCurveTo(x + width, y + width * 1.05, x + width / 2, y + width * 1.25);
    c.quadraticCurveTo(x, y + width * 1.05, x, y + width * 0.55);
    c.closePath();
    c.fillStyle = '#3a86ff';
    c.fill();
    c.strokeStyle = '#fff';
    c.lineWidth = 1.4;
    c.stroke();
  }

  // Voiture vue de dessus, centrée en (x, y), orientée selon `angle`, de longueur `length`.
  function drawCar(c, x, y, angle, length, color) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    const width = length * 0.5;
    // Roues.
    c.fillStyle = '#222';
    for (const u of [-0.3, 0.3]) {
      for (const side of [-1, 1]) {
        c.fillRect(length * u - length * 0.08, side * width / 2 - (side > 0 ? 0 : length * 0.05), length * 0.16, length * 0.05);
      }
    }
    // Carrosserie.
    c.fillStyle = color;
    roundedRectPath(c, -length / 2, -width / 2, length, width, length * 0.12);
    c.fill();
    // Pare-brise et lunette arrière.
    c.fillStyle = '#bfe3f2';
    c.fillRect(length * 0.05, -width * 0.38, length * 0.18, width * 0.76);
    c.fillRect(-length * 0.3, -width * 0.34, length * 0.12, width * 0.68);
    // Toit.
    c.fillStyle = '#111';
    c.fillRect(-length * 0.12, -width * 0.3, length * 0.12, width * 0.6);
    // Phares.
    c.fillStyle = '#fff3a0';
    c.fillRect(length * 0.44, -width * 0.4, length * 0.05, width * 0.18);
    c.fillRect(length * 0.44, width * 0.22, length * 0.05, width * 0.18);
    c.restore();
  }

  // Icône carrée (côté `size`) d'une carte malus : météorite ou voiture-voleur.
  function drawActionIcon(c, card, x, y, size) {
    c.save();
    c.fillStyle = card.id === 'meteorite' ? '#2b2440' : '#cfe3c4';
    roundedRectPath(c, x, y, size, size, 6);
    c.fill();
    if (card.id === 'meteorite') {
      // Traînée de feu.
      const trail = c.createLinearGradient(x + size * 0.9, y + size * 0.1, x + size * 0.45, y + size * 0.55);
      trail.addColorStop(0, 'rgba(255,200,80,0)');
      trail.addColorStop(1, 'rgba(255,140,40,.95)');
      c.strokeStyle = trail;
      c.lineWidth = size * 0.22;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x + size * 0.9, y + size * 0.1);
      c.lineTo(x + size * 0.45, y + size * 0.55);
      c.stroke();
      // Rocher et cratères.
      c.fillStyle = '#7a5a44';
      c.beginPath();
      c.arc(x + size * 0.4, y + size * 0.6, size * 0.2, 0, FULL_TURN);
      c.fill();
      c.fillStyle = '#5a4030';
      c.beginPath();
      c.arc(x + size * 0.35, y + size * 0.58, size * 0.05, 0, FULL_TURN);
      c.arc(x + size * 0.46, y + size * 0.67, size * 0.04, 0, FULL_TURN);
      c.fill();
    } else {
      // Route et voiture.
      c.fillStyle = '#8a8f86';
      c.fillRect(x, y + size * 0.4, size, size * 0.22);
      drawCar(c, x + size / 2, y + size * 0.51, 0, size * 0.75, '#2c3e50');
    }
    c.restore();
  }

  Game.sprites = { drawShield, drawCar, drawActionIcon };
})();
