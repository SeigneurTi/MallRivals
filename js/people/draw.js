// Dessin des passants (pieds en (x, y), environ 20 unités de haut).
(function () {
  'use strict';

  const { FULL_TURN, circle, roundedRectPath } = Game.draw;
  const { PERSON_STATE } = Game.people;

  // Posture assise : de combien le corps descend, longueur de la cuisse et du tibia.
  const SEATED_DROP = 3.5;
  const SEATED_THIGH = 5;
  const SEATED_SHIN = 3.5;

  function draw(person, isHovered) {
    if (person.isChanging) {
      return;   // dans une cabine du vestiaire
    }
    const ctx = Game.view.ctx;
    ctx.save();
    ctx.translate(person.x, person.y);
    ctx.scale(person.drawScale, person.drawScale);

    // Nageur ou client du jacuzzi : seule la tête dépasse, avec un remous autour.
    const isInWater = person.activity === 'swim' || person.activity === 'soak';
    if (isInWater && person.state === PERSON_STATE.INSIDE && person.insidePhase === 'active') {
      ctx.strokeStyle = 'rgba(255,255,255,.8)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, -2, 7, 3, 0, 0, FULL_TURN);
      ctx.stroke();
      circle(ctx, 0, -3, 3.6, person.skin);
      circle(ctx, 0, -4, 3.6 * 0.9, person.hair);
      circle(ctx, person.facing * 2, -2.5, 1.4, person.skin);   // bras
      ctx.restore();
      return;
    }

    // sit va de 0 (debout) à 1 (assis) : on ne balance plus les jambes, le corps descend.
    const sit = person.sitAmount;
    const legSwing = Math.sin(person.walkPhase) * 2.4 * (1 - sit);
    const bob = Math.abs(Math.sin(person.walkPhase)) * (1 - sit);
    const drop = SEATED_DROP * sit;

    // Ombre, et anneau orange si le passant est survolé.
    ctx.fillStyle = 'rgba(20,25,20,.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2, 0, 0, FULL_TURN);
    ctx.fill();
    if (isHovered) {
      ctx.strokeStyle = '#e8743b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 3.5, 0, 0, FULL_TURN);
      ctx.stroke();
    }

    // Jambes : chacune va de la hanche au pied en passant par le genou.
    // Debout, la jambe est droite ; assis, la cuisse part vers l'avant et le tibia descend.
    const hipY = -6 - bob + drop;
    ctx.strokeStyle = person.inSwimsuit ? person.skin : person.pants;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const side of [-1, 1]) {
      const hipX = side * 1.5;
      const standingFoot = [hipX - side * legSwing, -0.5];
      const standingKnee = [(hipX + standingFoot[0]) / 2, (hipY + standingFoot[1]) / 2];
      // Assis de profil, les cuisses partent vers l'avant. Assis de dos, les jambes sont cachées ;
      // assis de face, on voit deux petites jambes repliées vers nous.
      let seatedKnee = [hipX * 0.5 + SEATED_THIGH * person.facing, hipY];
      let seatedFoot = [seatedKnee[0], hipY + SEATED_SHIN];
      if (person.seatView === 'back') {
        seatedKnee = [hipX, hipY];
        seatedFoot = [hipX, hipY];
      } else if (person.seatView === 'front') {
        seatedKnee = [hipX * 1.2, hipY + 1.5];
        seatedFoot = [hipX * 1.2, hipY + SEATED_SHIN];
      }
      const knee = lerpPoint(standingKnee, seatedKnee, sit);
      const foot = lerpPoint(standingFoot, seatedFoot, sit);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(knee[0], knee[1]);
      ctx.lineTo(foot[0], foot[1]);
    }
    ctx.stroke();

    // Buste, et jupe pour les filles. En maillot de bain : maillot une pièce pour les filles,
    // short de bain pour les garçons.
    const top = -bob + drop;
    ctx.fillStyle = person.inSwimsuit ? person.skin : person.shirt;
    roundedRectPath(ctx, -3.8, -12.5 + top, 7.6, 7.5, 2.5);
    ctx.fill();
    if (person.inSwimsuit) {
      ctx.fillStyle = person.swimsuitColor;
      if (person.isGirl) {
        roundedRectPath(ctx, -3.2, -11.5 + top, 6.4, 6.6, 1.8);
      } else {
        roundedRectPath(ctx, -3.8, -7.6 + top, 7.6, 3, 1);
      }
      ctx.fill();
    } else if (person.skirt) {
      ctx.fillStyle = person.skirt;
      ctx.beginPath();
      ctx.moveTo(-3.6, -7.2 + top);
      ctx.lineTo(3.6, -7.2 + top);
      ctx.lineTo(5, -3 + top);
      ctx.lineTo(-5, -3 + top);
      ctx.closePath();
      ctx.fill();
    }

    const isActiveInside = person.state === PERSON_STATE.INSIDE && person.insidePhase === 'active';

    // Billard : on tient sa queue debout, sauf quand on vise (la table la dessine alors).
    if (person.activity === 'billiard' && person.state === PERSON_STATE.INSIDE && !person.cueOnTable) {
      ctx.strokeStyle = '#c8a165';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(person.facing * 4.5, 0);
      ctx.lineTo(person.facing * 4.5, -19 + top);
      ctx.stroke();
      circle(ctx, person.facing * 4.5, -19 + top, 0.6, '#3d7dd8');
    }

    // Laser game : gilet lumineux de l'équipe (blanc quand on est touché) et fusil.
    if (person.activity === 'laser' && isActiveInside) {
      const teamColor = Game.interiors.lasergame.TEAM_COLORS[person.laserTeam];
      circle(ctx, 0, -9.5 + top, 1.6, person.hitFlash > 0 ? '#ffffff' : teamColor);
      ctx.fillStyle = '#2a2e36';
      ctx.fillRect(person.facing > 0 ? 0.5 : -7.5, -10.5 + top, 7, 1.8);   // canon
      ctx.fillRect(person.facing > 0 ? 1 : -3, -9.5 + top, 2, 2.5);         // poignée
      circle(ctx, person.facing * 7.5, -9.6 + top, 0.7, teamColor);         // bout du canon
      if (person.muzzleFlash > 0) {
        circle(ctx, person.facing * 8, -9.6 + top, 1.8, '#ffffff');
      }
    }

    // Danseur : bras levés qui s'agitent en rythme.
    if (person.activity === 'dance' && person.state === PERSON_STATE.INSIDE && person.insidePhase === 'active') {
      const wave = Math.sin(person.walkPhase * 1.5) * 1.5;
      ctx.strokeStyle = person.skin;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-3.4, -11.5 + top);
      ctx.lineTo(-5.5, -16.5 + top + wave);
      ctx.moveTo(3.4, -11.5 + top);
      ctx.lineTo(5.5, -16.5 + top - wave);
      ctx.stroke();
    }

    // De dos : assis face à l'écran du cinéma, ou debout face à un tableau de la galerie.
    const seenFromBack = (person.seatView === 'back' && sit > 0.5) || (isActiveInside && person.activity === 'gallery' && person.looksAtWall);
    drawHead(ctx, person, -16 + top, seenFromBack);

    // Souvenir (fleur, cornet) : gardé jusqu'à la sortie de la ville.
    // Sinon, en sortant d'une boutique, on porte un sac.
    const isOut = person.state === PERSON_STATE.RETURNING || person.state === PERSON_STATE.LEAVING;
    if (person.souvenir && (isOut || person.state === PERSON_STATE.WALKING)) {
      drawSouvenir(ctx, person, top);
    } else if (isOut && !person.inSwimsuit) {   // en maillot, on va d'abord se rhabiller
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(3, -10 + top, 5, 5);
      ctx.strokeStyle = '#a0673c';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, -10 + top, 5, 5);
    }
    ctx.restore();
  }

  // Fleur ou cornet tenu à la main, du côté où le passant regarde.
  function drawSouvenir(ctx, person, top) {
    const handX = person.facing * 4.2;
    const handY = -8.5 + top;
    const souvenir = person.souvenir;
    if (souvenir.kind === 'flower') {
      // Tige, feuille, puis la fleur.
      ctx.strokeStyle = '#3f8a3a';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(handX, handY + 1);
      ctx.lineTo(handX + person.facing * 0.8, handY - 7);
      ctx.stroke();
      circle(ctx, handX + person.facing * 0.9, handY - 3.5, 0.9, '#4d9b42');
      const headX = handX + person.facing * 0.8;
      const headY = handY - 7.5;
      for (let k = 0; k < 5; k++) {
        const angle = k * Math.PI * 2 / 5;
        circle(ctx, headX + Math.cos(angle) * 1.3, headY + Math.sin(angle) * 1.3, 1.1, souvenir.color);
      }
      circle(ctx, headX, headY, 0.8, '#f2c14e');
    } else if (souvenir.kind === 'icecream') {
      // Cornet, puis les boules empilées.
      ctx.fillStyle = '#d9a35b';
      ctx.beginPath();
      ctx.moveTo(handX - 1.5, handY - 3);
      ctx.lineTo(handX + 1.5, handY - 3);
      ctx.lineTo(handX, handY + 1.5);
      ctx.closePath();
      ctx.fill();
      souvenir.scoops.forEach((color, k) => {
        circle(ctx, handX, handY - 3.8 - k * 2, 1.7, color);
      });
    } else if (souvenir.kind === 'giftbox') {
      // Petit écrin de la bijouterie, avec son ruban.
      ctx.fillStyle = souvenir.color;
      ctx.fillRect(handX - 1.8, handY - 3, 3.6, 3.2);
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(handX - 0.4, handY - 3, 0.8, 3.2);
      circle(ctx, handX, handY - 3.3, 0.8, '#f2c14e');
    }
  }

  // Tête et coiffure (centre de la tête en (0, headY)).
  function drawHead(ctx, person, headY, seenFromBack) {
    ctx.fillStyle = person.hair;
    if (seenFromBack) {
      // De dos : on ne voit que les cheveux.
      circle(ctx, 0, headY - 0.2, 3.6, person.hair);
      if (person.hairStyle === 'long') {
        roundedRectPath(ctx, -3.8, headY - 1, 7.6, 6.5, 2);
        ctx.fill();
      } else if (person.hairStyle === 'ponytail') {
        ctx.beginPath();
        ctx.ellipse(0, headY + 2.8, 1.3, 2.8, 0, 0, FULL_TURN);
        ctx.fill();
      }
      return;
    }
    // Queue de cheval : dessinée derrière la tête, du côté opposé au regard.
    if (person.hairStyle === 'ponytail') {
      const back = -person.facing;
      circle(ctx, back * 3.6, headY - 1, 1.9, person.hair);
      ctx.beginPath();
      ctx.ellipse(back * 4.4, headY + 2, 1.3, 2.8, back * 0.3, 0, FULL_TURN);
      ctx.fill();
    }
    circle(ctx, 0, headY, 3.4, person.skin);
    // Frange (commune à tous).
    ctx.fillStyle = person.hair;
    ctx.beginPath();
    ctx.arc(0, headY - 0.8, 3.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    // Cheveux longs : deux mèches qui encadrent le visage et tombent sur les épaules.
    if (person.hairStyle === 'long') {
      for (const side of [-1, 1]) {
        roundedRectPath(ctx, side > 0 ? 2.2 : -4.3, headY - 2, 2.1, 7.2, 1);
        ctx.fill();
      }
    }
  }

  function lerpPoint(from, to, amount) {
    return [from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount];
  }

  // Dessine tous les passants, du haut vers le bas pour que les plus proches passent devant.
  function drawAll(hoveredPerson) {
    const sorted = Game.state.people.slice().sort((a, b) => a.y - b.y);
    for (const person of sorted) {
      draw(person, person === hoveredPerson);
    }
  }

  Object.assign(Game.people, { draw, drawAll });
})();
