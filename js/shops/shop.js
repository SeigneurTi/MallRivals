// Une boutique posée sur une case : ouverture, places libres, séances de cinéma,
// pistes de bowling, et dessin du bâtiment.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle, roundedRectPath } = Game.draw;
  const { wallThickness, frameOfLot, withPainter, lotPointToBoard } = Game.shopGeometry;
  const CINEMA = Game.config.cinema;
  const PLAYER_COLORS = Game.config.players.COLORS;

  // Chaque boutique reçoit 3 pistes de bowling, utilisées seulement par le bowling.
  const BOWLING_LANE_COUNT = 3;

  // Installe une boutique (ou la remplace) sur une case.
  function open(lot, shop, owner) {
    lot.shop = shop;
    lot.owner = owner;
    lot.occupants = Array(Game.interiors[shop.id].slots.length).fill(null);   // client assis à chaque place
    lot.bowlingLanes = Array.from({ length: BOWLING_LANE_COUNT }, () => ({
      ballProgress: -1,     // -1 : pas de boule sur la piste
      pinsDownTimer: 0,     // > 0 : les quilles sont à terre
    }));
    lot.cinema = { phase: 'waiting', elapsed: 0 };   // 'waiting' puis 'film'
  }

  // Un passant peut-il entrer ? Il faut une place libre, et au cinéma, pas de film en cours.
  function hasFreeSlot(lot) {
    if (!lot.shop || !lot.occupants.some(occupant => !occupant)) {
      return false;
    }
    const isCinema = Game.interiors[lot.shop.id].activity === 'session';
    return !(isCinema && lot.cinema.phase !== 'waiting');
  }

  function update(lot, dt) {
    if (!lot.shop) {
      return;
    }
    for (const lane of lot.bowlingLanes) {
      if (lane.pinsDownTimer > 0) {
        lane.pinsDownTimer = Math.max(0, lane.pinsDownTimer - dt);
      }
    }
    if (Game.interiors[lot.shop.id].activity === 'session') {
      updateCinema(lot, dt);
    }
  }

  // Attente (les spectateurs s'installent), puis film (personne n'entre),
  // puis toute la salle sort et une nouvelle attente commence.
  function updateCinema(lot, dt) {
    const cinema = lot.cinema;
    cinema.elapsed += dt;
    if (cinema.phase === 'waiting' && cinema.elapsed >= CINEMA.WAITING_SECONDS) {
      cinema.phase = 'film';
      cinema.elapsed = 0;
    } else if (cinema.phase === 'film' && cinema.elapsed >= CINEMA.FILM_SECONDS) {
      cinema.phase = 'waiting';
      cinema.elapsed = 0;
      for (const person of lot.occupants) {
        if (person) {
          person.sessionOver = true;
        }
      }
    }
  }

  // ---------- Dessin ----------

  // Bâtiment complet sur le fond de carte : murs, mobilier, porte, enseigne, badges.
  function drawBuilding(c, lot) {
    const shop = lot.shop;
    const x = lot.x;
    const y = lot.y;
    const width = lot.width;
    const height = lot.height;
    const wall = wallThickness(height);
    const wallColor = Game.utils.mixColor(shop.color, -0.3);
    const doorOnTop = Game.map.lotDoorSide[lot.index] === 'top';

    c.save();
    // Ombre portée.
    c.fillStyle = 'rgba(20,25,20,.22)';
    roundedRectPath(c, x + 3, y + 4, width, height, 6);
    c.fill();

    // Intérieur, découpé aux coins arrondis.
    c.save();
    roundedRectPath(c, x, y, width, height, 5);
    c.clip();
    rect(c, x, y, width, height, wallColor);
    withPainter(c, frameOfLot(lot), g => Game.interiors[shop.id].drawFurniture(g));
    c.restore();

    // Murs.
    c.strokeStyle = wallColor;
    c.lineWidth = wall;
    roundedRectPath(c, x + wall / 2, y + wall / 2, width - wall, height - wall, 4);
    c.stroke();

    // Porte : ouverture au milieu du mur côté rue.
    const doorWidth = width * 0.24;
    const doorLeft = (width - doorWidth) / 2;
    c.fillStyle = '#e9e3d6';
    if (doorOnTop) {
      c.fillRect(x + doorLeft, y - 1, doorWidth, wall + 2);
    } else {
      c.fillRect(x + doorLeft, y + height - wall - 1, doorWidth, wall + 2);
    }

    // Enseigne ronde, près de la porte, à droite.
    const signX = x + width - height * 0.17;
    const signY = doorOnTop ? y + height * 0.2 : y + height * 0.8;
    const signRadius = Math.max(7, height * 0.1);
    circle(c, signX, signY, signRadius, '#ffffff');
    c.strokeStyle = wallColor;
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(signX, signY, signRadius, 0, FULL_TURN);
    c.stroke();
    Game.icons.draw(c, shop.icon, signX, signY, signRadius * 0.72, shop.color);

    // Contour aux couleurs du propriétaire.
    if (lot.owner != null) {
      c.strokeStyle = PLAYER_COLORS[lot.owner];
      c.lineWidth = 3;
      roundedRectPath(c, x - 2, y - 2, width + 4, height + 4, 7);
      c.stroke();
    }

    // Badges (niveau, boucliers) du côté opposé à la porte.
    const badgeY = doorOnTop ? y + height - 19 : y + 4;
    if (lot.level > 1) {
      const badgeWidth = 30;
      const badgeHeight = 15;
      c.fillStyle = '#f2c14e';
      roundedRectPath(c, x + 4, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
      c.fill();
      c.fillStyle = '#5a3d00';
      c.font = '800 11px Nunito, system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('★' + lot.level, x + 4 + badgeWidth / 2, badgeY + badgeHeight / 2 + 0.5);
    }
    for (let k = 0; k < lot.shields; k++) {
      Game.sprites.drawShield(c, x + 40 + k * 13, badgeY, 10);
    }
    c.restore();
  }

  // Ce qui se dessine par-dessus les clients (lumière tamisée de la discothèque…).
  function drawOverPeopleLayer(lot, time) {
    const interior = Game.interiors[lot.shop.id];
    if (interior.drawOverPeople) {
      withPainter(Game.view.ctx, frameOfLot(lot), g => interior.drawOverPeople(g, lot, time));
    }
  }

  // Ce qui change à chaque image : parties animées, « Complet », compte à rebours du cinéma.
  function drawLiveLayer(lot, time) {
    const ctx = Game.view.ctx;
    const interior = Game.interiors[lot.shop.id];
    if (interior.drawAnimated) {
      withPainter(ctx, frameOfLot(lot), g => interior.drawAnimated(g, lot, time));
    }

    const freeSlots = lot.occupants.filter(occupant => !occupant).length;
    let label = null;
    let color = '#c0392b';
    if (interior.activity === 'session') {
      const isWaiting = lot.cinema.phase === 'waiting';
      const remaining = Math.ceil((isWaiting ? CINEMA.WAITING_SECONDS : CINEMA.FILM_SECONDS) - lot.cinema.elapsed);
      label = isWaiting ? `Séance dans ${remaining} s` : `Film · ${remaining} s`;
      color = isWaiting ? '#2f7d6d' : '#d22f3b';
    } else if (!freeSlots) {
      label = 'Complet';
    }
    if (!label) {
      return;
    }

    // Pastille près de la porte.
    ctx.font = '800 10px Nunito, system-ui, sans-serif';
    const labelWidth = ctx.measureText(label).width + 12;
    const [labelX, labelY] = lotPointToBoard(lot, 0.5, 0.93);
    ctx.fillStyle = color;
    roundedRectPath(ctx, labelX - labelWidth / 2, labelY - 7, labelWidth, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelX, labelY + 0.5);
  }

  Game.shops = { open, hasFreeSlot, update, drawBuilding, drawLiveLayer, drawOverPeopleLayer };
})();
