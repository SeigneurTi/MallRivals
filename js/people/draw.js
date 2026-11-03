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
    const ctx = Game.view.ctx;
    ctx.save();
    ctx.translate(person.x, person.y);
    ctx.scale(person.drawScale, person.drawScale);

    // Nageur : seule la tête dépasse, avec un remous autour.
    if (person.activity === 'swim' && person.state === PERSON_STATE.INSIDE && person.insidePhase === 'active') {
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
    ctx.strokeStyle = person.pants;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const side of [-1, 1]) {
      const hipX = side * 1.5;
      const standingFoot = [hipX - side * legSwing, -0.5];
      const standingKnee = [(hipX + standingFoot[0]) / 2, (hipY + standingFoot[1]) / 2];
      const seatedKnee = [hipX * 0.5 + SEATED_THIGH * person.facing, hipY];
      const seatedFoot = [seatedKnee[0], hipY + SEATED_SHIN];
      const knee = lerpPoint(standingKnee, seatedKnee, sit);
      const foot = lerpPoint(standingFoot, seatedFoot, sit);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(knee[0], knee[1]);
      ctx.lineTo(foot[0], foot[1]);
    }
    ctx.stroke();

    // Buste, et jupe pour les filles.
    const top = -bob + drop;
    ctx.fillStyle = person.shirt;
    roundedRectPath(ctx, -3.8, -12.5 + top, 7.6, 7.5, 2.5);
    ctx.fill();
    if (person.skirt) {
      ctx.fillStyle = person.skirt;
      ctx.beginPath();
      ctx.moveTo(-3.6, -7.2 + top);
      ctx.lineTo(3.6, -7.2 + top);
      ctx.lineTo(5, -3 + top);
      ctx.lineTo(-5, -3 + top);
      ctx.closePath();
      ctx.fill();
    }

    drawHead(ctx, person, -16 + top);

    // En sortant d'une boutique, on porte un sac.
    if (person.state === PERSON_STATE.RETURNING || person.state === PERSON_STATE.LEAVING) {
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(3, -10 + top, 5, 5);
      ctx.strokeStyle = '#a0673c';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, -10 + top, 5, 5);
    }
    ctx.restore();
  }

  // Tête et coiffure (centre de la tête en (0, headY)).
  function drawHead(ctx, person, headY) {
    // Queue de cheval : dessinée derrière la tête, du côté opposé au regard.
    ctx.fillStyle = person.hair;
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
