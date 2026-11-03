// Dessin des passants (pieds en (x, y), environ 20 unités de haut).
(function () {
  'use strict';

  const { FULL_TURN, circle, roundedRectPath } = Game.draw;
  const { PERSON_STATE } = Game.people;

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

    const legSwing = Math.sin(person.walkPhase) * 2.4;
    const bob = Math.abs(Math.sin(person.walkPhase));

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

    // Jambes.
    ctx.strokeStyle = person.pants;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-1.5, -6 - bob);
    ctx.lineTo(-1.5 + legSwing, -0.5);
    ctx.moveTo(1.5, -6 - bob);
    ctx.lineTo(1.5 - legSwing, -0.5);
    ctx.stroke();

    // Buste, tête, cheveux.
    ctx.fillStyle = person.shirt;
    roundedRectPath(ctx, -3.8, -12.5 - bob, 7.6, 7.5, 2.5);
    ctx.fill();
    circle(ctx, 0, -16 - bob, 3.4, person.skin);
    ctx.fillStyle = person.hair;
    ctx.beginPath();
    ctx.arc(0, -16.8 - bob, 3.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();

    // En sortant d'une boutique, il porte un sac.
    if (person.state === PERSON_STATE.RETURNING || person.state === PERSON_STATE.LEAVING) {
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(3, -10 - bob, 5, 5);
      ctx.strokeStyle = '#a0673c';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, -10 - bob, 5, 5);
    }
    ctx.restore();
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
