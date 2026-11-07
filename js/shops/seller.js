// Vendeur d'une boutique : décor animé qui réagit aux clients.
//
// Derrière un comptoir (seller.behindCounter), le devant du comptoir est redessiné par-dessus
// son corps : seules sa tête et ses épaules dépassent, et ses mains sont posées sur le plateau.
// À l'arrivée d'un client, il le salue et encaisse (une pièce saute de la caisse) ;
// au départ, il fait coucou. Sans client, il essuie son comptoir ; sinon il regarde la salle.
// L'action en cours est rangée dans lot.sellerAction (envoyée à l'ami d'une partie à distance).
(function () {
  'use strict';

  const SELLERS = Game.config.sellers;
  const { circle, roundedRectPath } = Game.draw;

  // Repères du corps d'un passant (pieds en 0, voir js/people/draw.js), en unités du passant.
  const SHOULDER_Y = -11.5;
  const SHOULDER_X = 3.4;
  const COUNTER_TOP_Y = -9;          // haut du comptoir : juste sous les épaules
  const COUNTER_HALF_WIDTH = 8;
  const COUNTER_BOTTOM_Y = 1.5;
  const DEFAULT_COUNTER_COLOR = '#5a3d2b';

  // Le vendeur réagit : 'serve' (un client entre et paie) ou 'goodbye' (un client s'en va).
  function react(lot, kind, person) {
    if (!lot.shop || !Game.interiors[lot.shop.id].seller) {
      return;
    }
    const isServing = kind === 'serve';
    lot.sellerAction = {
      kind,
      age: 0,
      duration: isServing ? SELLERS.SERVE_SECONDS : SELLERS.GOODBYE_SECONDS,
      text: Game.utils.pickRandom(isServing ? SELLERS.SERVE_WORDS : SELLERS.GOODBYE_WORDS),
      customerX: person.x,
    };
  }

  function update(lot, dt) {
    const action = lot.sellerAction;
    if (!action) {
      return;
    }
    action.age += dt;
    if (action.age >= action.duration) {
      lot.sellerAction = null;
    }
  }

  // Le vendeur regarde le client qu'il sert, sinon le client le plus proche, sinon il se tourne de temps en temps.
  function facingOf(lot, x, time) {
    const action = lot.sellerAction;
    if (action) {
      return action.customerX >= x ? 1 : -1;
    }
    let nearest = null;
    for (const person of lot.occupants) {
      if (person && (!nearest || Math.abs(person.x - x) < Math.abs(nearest.x - x))) {
        nearest = person;
      }
    }
    if (nearest && Math.abs(nearest.x - x) > 2) {
      return nearest.x > x ? 1 : -1;
    }
    return Math.sin(time * 0.35 + lot.index * 1.3) > 0 ? 1 : -1;
  }

  // Apparence stable pour une case et une boutique données.
  function appearance(lot) {
    const people = Game.people;
    const variant = lot.index * 7 + lot.shop.price;
    const isGirl = variant % 2 === 0;
    return {
      skin: people.SKIN_COLORS[variant % people.SKIN_COLORS.length],
      hair: people.HAIR_COLORS[(variant >> 1) % people.HAIR_COLORS.length],
      isGirl,
      hairStyle: isGirl ? 'ponytail' : 'short',
    };
  }

  // Position des deux mains (en unités du passant) selon l'action en cours.
  // Renvoie aussi de combien le buste se penche (bob) et si une main est levée.
  function pose(lot, facing, time, behindCounter) {
    const action = lot.sellerAction;
    const restY = behindCounter ? COUNTER_TOP_Y + 0.6 : -6;
    const front = { x: facing * 4.2, y: restY };
    const back = { x: -facing * 4.2, y: restY };
    let bob = Math.sin(time * 1.8 + lot.index) * 0.25;   // respiration
    let coin = null;
    if (action && action.kind === 'serve') {
      const progress = action.age / action.duration;
      // Petit salut de la tête, puis la main tapote la caisse.
      bob += progress < 0.3 ? Math.sin(progress / 0.3 * Math.PI) * 1.2 : 0;
      front.x = facing * 5.5;
      front.y = restY - Math.abs(Math.sin(action.age * 14)) * 1.6;
      if (progress > 0.25) {
        coin = (progress - 0.25) / 0.75;
      }
    } else if (action && action.kind === 'goodbye') {
      // Coucou : bras levé qui se balance.
      front.x = facing * (6 + Math.sin(action.age * 12) * 1.6);
      front.y = SHOULDER_Y - 5;
    } else if (!behindCounter) {
      // Debout sans rien faire : bras le long du corps (non dessinés, comme les passants).
      return { front: null, back: null, bob, coin };
    } else if (!lot.occupants.some(Boolean)) {
      // Personne : il essuie le comptoir.
      front.x = facing * 1.5 + Math.sin(time * 3 + lot.index) * 4;
    }
    return { front, back: behindCounter ? back : null, bob, coin };
  }

  function drawArm(ctx, skin, side, hand, bob) {
    ctx.strokeStyle = skin;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(side * SHOULDER_X, SHOULDER_Y + bob);
    ctx.lineTo(hand.x, hand.y);
    ctx.stroke();
    circle(ctx, hand.x, hand.y, 1.1, skin);
  }

  // Devant du comptoir, droit face au joueur : plateau clair, façade, ombre en bas.
  function drawCounterFront(ctx, color) {
    const width = COUNTER_HALF_WIDTH * 2;
    ctx.fillStyle = color;
    roundedRectPath(ctx, -COUNTER_HALF_WIDTH, COUNTER_TOP_Y, width, COUNTER_BOTTOM_Y - COUNTER_TOP_Y, 1.2);
    ctx.fill();
    ctx.fillStyle = Game.utils.mixColor(color, 0.25);
    roundedRectPath(ctx, -COUNTER_HALF_WIDTH - 0.6, COUNTER_TOP_Y - 0.6, width + 1.2, 1.8, 0.9);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fillRect(-COUNTER_HALF_WIDTH, COUNTER_BOTTOM_Y - 2, width, 2);
  }

  // Pièce d'or qui saute au-dessus de la caisse puis s'efface (progress de 0 à 1).
  function drawCoin(ctx, facing, progress) {
    const x = facing * 6;
    const y = COUNTER_TOP_Y - 2 - Math.sin(progress * Math.PI) * 6;
    ctx.globalAlpha = 1 - progress * progress;
    circle(ctx, x, y, 1.6, '#f2c14e');
    circle(ctx, x, y, 0.8, '#d9a21b');
    ctx.globalAlpha = 1;
  }

  // Bulle de paroles au-dessus de la tête, qui s'efface à la fin de l'action.
  function drawBubble(ctx, action, headTop) {
    const fade = Math.min(1, (action.duration - action.age) / 0.3, action.age / 0.12);
    ctx.globalAlpha = Math.max(0, fade);
    ctx.font = '800 6px Nunito, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const width = ctx.measureText(action.text).width + 6;
    const height = 8;
    const bottom = headTop - 3;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(40,40,50,.35)';
    ctx.lineWidth = 0.6;
    roundedRectPath(ctx, -width / 2, bottom - height, width, height, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1.5, bottom - 0.3);
    ctx.lineTo(1.5, bottom - 0.3);
    ctx.lineTo(0, bottom + 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2d2d34';
    ctx.fillText(action.text, 0, bottom - height / 2 + 0.3);
    ctx.globalAlpha = 1;
  }

  function draw(lot, time) {
    const seller = Game.interiors[lot.shop.id].seller;
    if (!seller) {
      return;
    }
    const [x, y] = Game.shopGeometry.lotPointToBoard(lot, seller.u, seller.v);
    const scale = Game.config.people.INSIDE_SCALE;
    const facing = facingOf(lot, x, time);
    const look = appearance(lot);
    const { front, back, bob, coin } = pose(lot, facing, time, seller.behindCounter);

    // Corps : debout, de face ; derrière un comptoir, le bas sera caché par la façade.
    Game.people.draw(Object.assign({
      x,
      y: y + bob * scale,
      drawScale: scale,
      sitAmount: 0,
      seatView: null,
      walkPhase: 0,
      facing,
      shirt: lot.shop.color,
      pants: '#2d2d34',
      apron: '#ffffff',
      skirt: null,
    }, look), false);

    const ctx = Game.view.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    if (seller.behindCounter) {
      drawCounterFront(ctx, seller.counterColor || DEFAULT_COUNTER_COLOR);
    }
    if (back) {
      drawArm(ctx, look.skin, -facing, back, bob);
    }
    if (front) {
      drawArm(ctx, look.skin, facing, front, bob);
    }
    if (coin != null) {
      drawCoin(ctx, facing, coin);
    }
    if (lot.sellerAction) {
      drawBubble(ctx, lot.sellerAction, -19.5 + bob);
    }
    ctx.restore();
  }

  Game.sellers = { react, update, draw };
})();
