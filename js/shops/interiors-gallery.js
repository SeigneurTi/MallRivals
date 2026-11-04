// Intérieur de la galerie d'art : tableaux aux murs, cordon devant le mur du fond,
// mobile qui tourne sur un socle au centre, écran d'art vidéo et accueil.
// Les visiteurs vont d'un tableau à l'autre (voir updateGalleryVisitor dans js/people/activities.js).
// Coordonnées normalisées : voir js/shops/geometry.js.
(function () {
  'use strict';

  const { FULL_TURN, rect, circle } = Game.draw;
  const { slot, plankFloor } = Game.furniture;

  const FRAME_COLOR = '#c9a23a';

  // Tableaux du mur du fond : centre u et style.
  const BACK_PAINTINGS = [
    { u: 0.15, style: 'landscape' },
    { u: 0.38, style: 'grid' },
    { u: 0.62, style: 'video' },
    { u: 0.85, style: 'portrait' },
  ];
  const BACK_PAINTING_WIDTH = 0.17;

  // Tableaux des murs de côté (vus par la tranche) : mur, centre v et couleurs.
  const SIDE_PAINTINGS = [
    { wall: 'left', v: 0.38, colors: ['#d1495b', '#edae49'] },
    { wall: 'left', v: 0.62, colors: ['#00798c', '#30638e'] },
    { wall: 'right', v: 0.36, colors: ['#3a1f5d', '#e8578f'] },
    { wall: 'right', v: 0.58, colors: ['#66a182', '#f2c14e'] },
  ];

  // Où se tient un visiteur pour regarder chaque tableau, et de quel côté il regarde.
  const VIEWPOINTS = [
    ...BACK_PAINTINGS.map((painting, index) => ({ u: painting.u, v: 0.33, wall: 'back', facing: index < 2 ? 1 : -1 })),
    ...SIDE_PAINTINGS.map(painting => ({
      u: painting.wall === 'left' ? 0.17 : 0.83,
      v: painting.v + 0.06,
      wall: painting.wall,
      facing: painting.wall === 'left' ? -1 : 1,
    })),
  ];

  // Socle du mobile, au centre : les visiteurs le contournent.
  const PEDESTAL = { u: 0.43, v: 0.5, width: 0.14, height: 0.16 };

  function pedestalRects(lot) {
    const { lotPointToBoard } = Game.shopGeometry;
    const [x1, y1] = lotPointToBoard(lot, PEDESTAL.u - 0.02, PEDESTAL.v - 0.02);
    const [x2, y2] = lotPointToBoard(lot, PEDESTAL.u + PEDESTAL.width + 0.02, PEDESTAL.v + PEDESTAL.height + 0.02);
    return [{ left: Math.min(x1, x2), top: Math.min(y1, y2), right: Math.max(x1, x2), bottom: Math.max(y1, y2) }];
  }

  // Contenu d'un tableau du fond, dans le rectangle (left, top, width, height).
  function drawCanvasArt(c, style, left, top, width, height) {
    if (style === 'landscape') {
      rect(c, left, top, width, height, '#8fc6e8');                       // ciel
      circle(c, left + width * 0.75, top + height * 0.3, height * 0.16, '#f7d046');   // soleil
      c.fillStyle = '#4d9b42';                                             // collines
      c.beginPath();
      c.moveTo(left, top + height);
      c.lineTo(left, top + height * 0.65);
      c.quadraticCurveTo(left + width * 0.3, top + height * 0.35, left + width * 0.55, top + height * 0.7);
      c.quadraticCurveTo(left + width * 0.8, top + height * 0.5, left + width, top + height * 0.6);
      c.lineTo(left + width, top + height);
      c.closePath();
      c.fill();
    } else if (style === 'grid') {
      // Grands aplats de couleurs primaires séparés de traits noirs.
      rect(c, left, top, width, height, '#f5f1e6');
      rect(c, left, top, width * 0.45, height * 0.6, '#d62828');
      rect(c, left + width * 0.7, top + height * 0.55, width * 0.3, height * 0.45, '#1d4e89');
      rect(c, left + width * 0.45, top + height * 0.75, width * 0.25, height * 0.25, '#f7c815');
      c.strokeStyle = '#1b1b1b';
      c.lineWidth = Math.max(0.6, height * 0.05);
      c.beginPath();
      c.moveTo(left + width * 0.45, top);
      c.lineTo(left + width * 0.45, top + height);
      c.moveTo(left + width * 0.7, top + height * 0.55);
      c.lineTo(left + width * 0.7, top + height);
      c.moveTo(left, top + height * 0.6);
      c.lineTo(left + width, top + height * 0.6);
      c.moveTo(left + width * 0.45, top + height * 0.75);
      c.lineTo(left + width * 0.7, top + height * 0.75);
      c.stroke();
    } else if (style === 'portrait') {
      rect(c, left, top, width, height, '#5a3d2b');
      c.fillStyle = '#2b1d14';                                             // cheveux
      c.beginPath();
      c.ellipse(left + width * 0.5, top + height * 0.45, width * 0.2, height * 0.36, 0, 0, FULL_TURN);
      c.fill();
      c.fillStyle = '#e8c39e';                                             // visage
      c.beginPath();
      c.ellipse(left + width * 0.5, top + height * 0.5, width * 0.13, height * 0.26, 0, 0, FULL_TURN);
      c.fill();
      rect(c, left + width * 0.25, top + height * 0.82, width * 0.5, height * 0.18, '#1f2a44');   // épaules
    } else {
      // Art vidéo : fond noir, l'image animée est dessinée par drawAnimated.
      rect(c, left, top, width, height, '#111');
    }
  }

  Object.assign(Game.interiors, {
    galerie: {
      activity: 'gallery',
      // 6 visiteurs, chacun commence devant un tableau différent.
      slots: [0, 2, 4, 6, 1, 7].map(index => Object.assign(slot(VIEWPOINTS[index].u, VIEWPOINTS[index].v), { viewpoint: index })),
      viewpoints: VIEWPOINTS,
      obstacles: pedestalRects,
      drawFurniture(g) {
        const { c, x, y, w, h, radius } = g;
        plankFloor(g, '#eadfc8', '#d9caa9');
        // Tableaux du mur du fond, dans leur cadre doré.
        for (const painting of BACK_PAINTINGS) {
          const left = x(painting.u - BACK_PAINTING_WIDTH / 2);
          rect(c, left, y(0.03), w(BACK_PAINTING_WIDTH), h(0.15), FRAME_COLOR);
          drawCanvasArt(c, painting.style, left + w(0.012), y(0.03) + h(0.02), w(BACK_PAINTING_WIDTH - 0.024), h(0.11));
        }
        // Cordon rouge entre des poteaux, devant les tableaux du fond.
        c.strokeStyle = '#b3243a';
        c.lineWidth = radius(0.018);
        c.beginPath();
        c.moveTo(x(0.05), y(0.24));
        c.lineTo(x(0.95), y(0.24));
        c.stroke();
        for (const u of [0.05, 0.27, 0.5, 0.73, 0.95]) {
          circle(c, x(u), y(0.24), radius(0.025), '#c9a23a');
        }
        // Tableaux des murs de côté, vus par la tranche.
        for (const painting of SIDE_PAINTINGS) {
          const left = painting.wall === 'left' ? x(0.02) : x(0.93);
          rect(c, left, y(painting.v - 0.09), w(0.05), h(0.18), FRAME_COLOR);
          rect(c, left + w(0.01), y(painting.v - 0.075), w(0.03), h(0.075), painting.colors[0]);
          rect(c, left + w(0.01), y(painting.v), w(0.03), h(0.075), painting.colors[1]);
        }
        // Socle blanc du mobile.
        rect(c, x(PEDESTAL.u), y(PEDESTAL.v), w(PEDESTAL.width), h(PEDESTAL.height), '#f7f7f2');
        c.strokeStyle = '#c8c4b8';
        c.lineWidth = 1;
        c.strokeRect(x(PEDESTAL.u), y(PEDESTAL.v), w(PEDESTAL.width), h(PEDESTAL.height));
        // Accueil : comptoir, catalogues et plante.
        rect(c, x(0.03), y(0.8), w(0.17), h(0.11), '#3b3f4a');
        rect(c, x(0.05), y(0.82), w(0.05), h(0.05), '#f5f1e6');
        rect(c, x(0.11), y(0.83), w(0.05), h(0.05), '#e8578f');
        circle(c, x(0.27), y(0.87), radius(0.05), '#8a6a4a');
        circle(c, x(0.27), y(0.86), radius(0.045), '#4d9b42');
      },
      drawAnimated(g, lot, time) {
        const { c, x, y, w, h, radius } = g;
        // Art vidéo : bandes de couleurs qui défilent.
        const video = BACK_PAINTINGS.find(painting => painting.style === 'video');
        const left = x(video.u - BACK_PAINTING_WIDTH / 2) + w(0.012);
        const stripeWidth = w(BACK_PAINTING_WIDTH - 0.024) / 4;
        for (let k = 0; k < 4; k++) {
          const hue = Math.round((time * 60 + k * 50) % 360);
          rect(c, left + k * stripeWidth, y(0.03) + h(0.02), stripeWidth, h(0.11), `hsl(${hue}, 75%, 55%)`);
        }
        // Mobile : deux bras qui tournent lentement, chacun avec ses disques colorés.
        const centerX = x(PEDESTAL.u + PEDESTAL.width / 2);
        const centerY = y(PEDESTAL.v + PEDESTAL.height / 2);
        const arms = [
          { length: radius(0.14), angle: time * 0.6, colors: ['#d62828', '#1b1b1b'] },
          { length: radius(0.09), angle: -time * 0.9 + 1, colors: ['#f7c815', '#1d4e89'] },
        ];
        c.strokeStyle = '#1b1b1b';
        c.lineWidth = Math.max(0.5, radius(0.01));
        for (const arm of arms) {
          const dx = Math.cos(arm.angle) * arm.length;
          const dy = Math.sin(arm.angle) * arm.length;
          c.beginPath();
          c.moveTo(centerX - dx, centerY - dy);
          c.lineTo(centerX + dx, centerY + dy);
          c.stroke();
          circle(c, centerX - dx, centerY - dy, radius(0.035), arm.colors[0]);
          circle(c, centerX + dx, centerY + dy, radius(0.028), arm.colors[1]);
        }
        circle(c, centerX, centerY, radius(0.015), '#1b1b1b');
      },
    },
  });
})();
