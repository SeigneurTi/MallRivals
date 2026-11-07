// Animations des attaques et des événements : météorite, explosion, fumée, voiture,
// incendie, monstre, OVNI. Chacune est un objet de Game.state.animations :
//   kind      type d'animation (voir DRAWERS)
//   elapsed   temps écoulé, duration : durée totale (sauf la voiture, qui suit un trajet)
//   onEnd     facultatif : appelé une fois l'animation terminée
(function () {
  'use strict';

  const { FULL_TURN } = Game.draw;

  function addAnimation(animation) {
    Game.state.animations.push(animation);
  }

  function addExplosion(x, y) {
    addAnimation({ kind: 'boom', elapsed: 0, duration: 0.7, x, y });
  }

  function addSmoke(x, y) {
    addAnimation({ kind: 'smoke', elapsed: 0, duration: 1, x, y });
  }

  // ---------- Mise à jour ----------

  function updateAnimation(animation, dt) {
    if (animation.kind === 'car') {
      updateCar(animation, dt);
      return;
    }
    animation.elapsed += dt;
    if (animation.elapsed >= animation.duration) {
      finish(animation);
    }
  }

  // La voiture avance à vitesse constante, segment par segment.
  function updateCar(car, dt) {
    car.distance += Game.config.thief.CAR_SPEED * dt;
    while (car.segmentIndex < car.points.length - 1) {
      const start = car.points[car.segmentIndex];
      const end = car.points[car.segmentIndex + 1];
      const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
      if (car.distance < length) {
        break;
      }
      car.distance -= length;
      car.segmentIndex++;
    }
    if (car.segmentIndex >= car.points.length - 1) {
      finish(car);
    }
  }

  function finish(animation) {
    animation.done = true;
    if (animation.onEnd) {
      animation.onEnd();
    }
  }

  function updateAnimations(dt) {
    const state = Game.state;
    // Copie : onEnd peut ajouter de nouvelles animations pendant la boucle.
    for (const animation of state.animations.slice()) {
      updateAnimation(animation, dt);
    }
    state.animations = state.animations.filter(animation => !animation.done);
  }

  // Partie à distance, chez l'ami : les animations continuent d'avancer entre deux photos de la ville,
  // sans rien déclencher (c'est l'hôte qui décide de la suite).
  function advanceAnimationsForDisplay(dt) {
    for (const animation of Game.state.animations) {
      if (animation.kind !== 'car') {
        animation.elapsed = Math.min(animation.duration, animation.elapsed + dt);
        continue;
      }
      animation.distance += Game.config.thief.CAR_SPEED * dt;
      while (animation.segmentIndex < animation.points.length - 2) {
        const start = animation.points[animation.segmentIndex];
        const end = animation.points[animation.segmentIndex + 1];
        const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
        if (animation.distance < length) {
          break;
        }
        animation.distance -= length;
        animation.segmentIndex++;
      }
    }
  }

  // ---------- Dessin ----------

  // Point entre from et to, selon progress (0 à 1).
  function lerpPoint(from, to, progress) {
    return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];
  }

  const DRAWERS = {
    meteor(c, meteor, progress) {
      const [x, y] = lerpPoint(meteor.from, meteor.to, progress);
      // Traînée de feu.
      const trail = c.createLinearGradient(x + 90, y - 120, x, y);
      trail.addColorStop(0, 'rgba(255,200,80,0)');
      trail.addColorStop(1, 'rgba(255,120,30,.9)');
      c.strokeStyle = trail;
      c.lineWidth = 16;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x + 90, y - 122);
      c.lineTo(x, y);
      c.stroke();
      // Rocher et cratères.
      c.fillStyle = '#7a5a44';
      c.beginPath();
      c.arc(x, y, 14, 0, FULL_TURN);
      c.fill();
      c.fillStyle = '#5a4030';
      c.beginPath();
      c.arc(x - 4, y - 3, 3, 0, FULL_TURN);
      c.arc(x + 5, y + 4, 2.5, 0, FULL_TURN);
      c.fill();
    },

    boom(c, boom, progress) {
      const radius = 10 + progress * 60;
      c.fillStyle = `rgba(255,170,40,${0.7 * (1 - progress)})`;
      c.beginPath();
      c.arc(boom.x, boom.y, radius, 0, FULL_TURN);
      c.fill();
      c.fillStyle = `rgba(255,240,150,${0.8 * (1 - progress)})`;
      c.beginPath();
      c.arc(boom.x, boom.y, radius * 0.5, 0, FULL_TURN);
      c.fill();
    },

    smoke(c, smoke, progress) {
      for (let k = 0; k < 5; k++) {
        c.fillStyle = `rgba(120,120,120,${0.45 * (1 - progress)})`;
        c.beginPath();
        c.arc(smoke.x + (k - 2) * 10, smoke.y - progress * 40 - k * 4, 8 + progress * 14, 0, FULL_TURN);
        c.fill();
      }
    },

    car(c, car) {
      const start = car.points[car.segmentIndex];
      const end = car.points[Math.min(car.segmentIndex + 1, car.points.length - 1)];
      const length = Math.hypot(end[0] - start[0], end[1] - start[1]) || 1;
      const t = Math.min(1, car.distance / length);
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t;
      Game.sprites.drawCar(c, x, y, Math.atan2(end[1] - start[1], end[0] - start[0]), 30, '#2c3e50');
      // Gyrophare aux couleurs du joueur.
      c.fillStyle = car.color;
      c.beginPath();
      c.arc(x, y, 3, 0, FULL_TURN);
      c.fill();
    },

    fire(c, fire) {
      const lot = fire.lot;
      const x = lot.x;
      const y = lot.y;
      const size = lot.height;
      const width = lot.width;
      // Sept flammes qui dansent.
      for (let k = 0; k < 7; k++) {
        const flameX = x + width * (0.1 + k * 0.13);
        const flameHeight = size * (0.3 + 0.15 * Math.sin(fire.elapsed * 12 + k * 1.7));
        const flameY = y + size * (0.5 + 0.25 * Math.sin(k * 2.3));
        c.fillStyle = k % 2 ? 'rgba(255,90,30,.9)' : 'rgba(255,190,40,.9)';
        c.beginPath();
        c.moveTo(flameX - size * 0.07, flameY);
        c.quadraticCurveTo(flameX - size * 0.05, flameY - flameHeight * 0.6, flameX, flameY - flameHeight);
        c.quadraticCurveTo(flameX + size * 0.05, flameY - flameHeight * 0.6, flameX + size * 0.07, flameY);
        c.closePath();
        c.fill();
      }
      // Fumée qui monte en boucle.
      c.fillStyle = 'rgba(90,90,90,.35)';
      c.beginPath();
      c.arc(x + width / 2, y - 10 - (fire.elapsed * 20 % 30), size * 0.18, 0, FULL_TURN);
      c.fill();
    },

    monster(c, monster, progress) {
      const time = monster.elapsed;
      const groundY = monster.from[1] + (monster.to[1] - monster.from[1]) * progress;
      const x = monster.from[0] + (monster.to[0] - monster.from[0]) * progress;
      const y = groundY - Math.abs(Math.sin(time * 8)) * 8;   // il sautille
      // Ombre.
      c.fillStyle = 'rgba(20,25,20,.25)';
      c.beginPath();
      c.ellipse(x, groundY + 20, 26, 8, 0, 0, FULL_TURN);
      c.fill();
      // Cornes.
      c.fillStyle = '#6a3fb5';
      for (const side of [-1, 1]) {
        c.beginPath();
        c.moveTo(x + side * 12, y - 28);
        c.lineTo(x + side * 20, y - 46);
        c.lineTo(x + side * 4, y - 32);
        c.fill();
      }
      // Corps.
      c.fillStyle = '#5fb350';
      c.beginPath();
      c.ellipse(x, y - 6, 24, 28, 0, 0, FULL_TURN);
      c.fill();
      // Bras qui s'agitent.
      c.strokeStyle = '#5fb350';
      c.lineWidth = 7;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x - 20, y - 6);
      c.lineTo(x - 34, y - 20 + Math.sin(time * 10) * 6);
      c.moveTo(x + 20, y - 6);
      c.lineTo(x + 34, y - 20 - Math.sin(time * 10) * 6);
      c.stroke();
      // Yeux.
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(x - 9, y - 14, 6, 0, FULL_TURN);
      c.arc(x + 9, y - 14, 6, 0, FULL_TURN);
      c.fill();
      c.fillStyle = '#111';
      c.beginPath();
      c.arc(x - 8, y - 13, 3, 0, FULL_TURN);
      c.arc(x + 10, y - 13, 3, 0, FULL_TURN);
      c.fill();
      // Bouche et dents.
      c.fillStyle = '#2d5a26';
      c.beginPath();
      c.arc(x, y + 4, 9, 0, Math.PI);
      c.fill();
      c.fillStyle = '#fff';
      c.fillRect(x - 6, y + 4, 4, 4);
      c.fillRect(x + 2, y + 4, 4, 4);
    },

    ufo(c, ufo, progress) {
      const time = ufo.elapsed;
      const x = ufo.from[0] + (ufo.to[0] - ufo.from[0]) * progress;
      const y = ufo.from[1] + (ufo.to[1] - ufo.from[1]) * progress + Math.sin(time * 4) * 3;   // flotte
      // Rayon tracteur vers la boutique.
      if (ufo.beamLot) {
        const lot = ufo.beamLot;
        const alpha = 0.25 + 0.15 * Math.sin(time * 10);
        const beam = c.createLinearGradient(0, y, 0, lot.y + lot.height);
        beam.addColorStop(0, `rgba(180,255,170,${alpha + 0.2})`);
        beam.addColorStop(1, `rgba(180,255,170,${alpha * 0.4})`);
        c.fillStyle = beam;
        c.beginPath();
        c.moveTo(x - 12, y + 6);
        c.lineTo(x + 12, y + 6);
        c.lineTo(lot.x + lot.width + 6, lot.y + lot.height);
        c.lineTo(lot.x - 6, lot.y + lot.height);
        c.closePath();
        c.fill();
      }
      // Coupole et soucoupe.
      c.fillStyle = 'rgba(160,220,255,.85)';
      c.beginPath();
      c.ellipse(x, y - 6, 14, 12, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = '#8e9aa8';
      c.beginPath();
      c.ellipse(x, y, 36, 10, 0, 0, FULL_TURN);
      c.fill();
      c.fillStyle = '#c7d0da';
      c.beginPath();
      c.ellipse(x, y - 2, 30, 6, 0, 0, FULL_TURN);
      c.fill();
      // Lumières clignotantes.
      for (let k = 0; k < 5; k++) {
        c.fillStyle = (Math.floor(time * 6) + k) % 2 ? '#ffe27a' : '#ff6b6b';
        c.beginPath();
        c.arc(x - 24 + k * 12, y + 2, 2.5, 0, FULL_TURN);
        c.fill();
      }
    },
  };

  function drawAnimation(c, animation) {
    const progress = Math.min(1, animation.elapsed / (animation.duration || 1));
    DRAWERS[animation.kind](c, animation, progress);
  }

  // Le monstre et l'OVNI passent au-dessus de tout le reste.
  const isFlyingOrGiant = animation => animation.kind === 'ufo' || animation.kind === 'monster';

  function drawAnimations(c) {
    for (const animation of Game.state.animations) {
      if (!isFlyingOrGiant(animation)) {
        drawAnimation(c, animation);
      }
    }
    for (const animation of Game.state.animations) {
      if (isFlyingOrGiant(animation)) {
        drawAnimation(c, animation);
      }
    }
  }

  Game.events = { addAnimation, addExplosion, addSmoke, updateAnimations, advanceAnimationsForDisplay, drawAnimations };
})();
