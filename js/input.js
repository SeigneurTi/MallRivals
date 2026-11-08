// Interactions : toucher les cartes, les cases et le menu ; survoler les passants ;
// curseurs et boutons sous le plateau. Marche à la souris comme au doigt (téléphone, tablette).
(function () {
  'use strict';

  const MAGNIFIER = Game.config.magnifier;
  const { floatText } = Game.feedback;
  let pendingTap = null;   // au doigt, loupe allumée : toucher en attente (on ne sait pas encore si le doigt va glisser)

  // Position du pointeur en unités logiques du plateau.
  function toBoardPoint(event) {
    const bounds = Game.view.canvas.getBoundingClientRect();
    return [(event.clientX - bounds.left) / Game.view.scale, (event.clientY - bounds.top) / Game.view.scale];
  }

  function isInside(x, y, [left, top, width, height]) {
    return x >= left && x <= left + width && y >= top && y <= top + height;
  }

  // Ligne du menu d'une boutique. Sur un seul écran, c'est le propriétaire qui paie ;
  // dans une partie à distance, seul le joueur de ce navigateur peut toucher ses boutiques.
  function chooseMenuItem(lot, item) {
    if (item.action !== 'upgrade' && item.action !== 'shield') {
      return;
    }
    const player = Game.online.isOnline() ? Game.online.myPlayer() : lot.owner;
    const refusal = Game.online.submit(player, { type: item.action, lotIndex: lot.index });
    if (refusal) {
      // Pas assez d'argent : le menu reste ouvert.
      Game.state.menuLot = lot;
      floatText(lot, refusal, '#c0392b');
    }
  }

  // Joue la carte choisie sur une case. Renvoie false si rien ne s'est passé
  // (carte boutique sur une case prise, malus sur une case vide ou occupée par une attaque).
  function playSelectedCard(lot) {
    const state = Game.state;
    const card = Game.catalog.CARDS[state.selection.cardIndex];
    const isPlayable = card.isAction ? lot.shop && !lot.isBusy : !lot.shop;
    if (!isPlayable) {
      return false;
    }
    const command = { type: card.isAction ? 'malus' : 'build', lotIndex: lot.index, cardIndex: state.selection.cardIndex };
    const refusal = Game.online.submit(state.selection.player, command);
    if (refusal) {
      floatText(lot, refusal, '#c0392b');
    } else {
      state.selection = null;
    }
    return true;
  }

  function onPointerDown(event) {
    const state = Game.state;
    const [x, y] = toBoardPoint(event);
    const mapX = x - Game.layout.mapLeft;
    if (state.winner != null || Game.online.isWaitingForSnapshot()) {
      return;   // partie finie (on attend « Recommencer »), ou ville de l'ami pas encore reçue
    }

    // Un menu est ouvert : tout clic le ferme, et active la ligne touchée.
    if (state.menuLot) {
      const lot = state.menuLot;
      const menu = Game.menu.layout(lot);
      state.menuLot = null;
      for (const item of menu.items) {
        if (isInside(mapX, y, item.rect)) {
          chooseMenuItem(lot, item);
          return;
        }
      }
      if (isInside(mapX, y, [menu.x, menu.y, menu.width, menu.height])) {
        return;
      }
    }

    // Une carte d'un bac : la choisir, ou la reposer si elle était déjà choisie.
    // Dans une partie à distance, seulement le bac de ce navigateur.
    for (const player of [0, 1].filter(Game.online.canControl)) {
      for (let cardIndex = 0; cardIndex < Game.catalog.CARDS.length; cardIndex++) {
        if (isInside(x, y, Game.trays.cardTouchRect(player, cardIndex))) {
          const alreadySelected = state.selection && state.selection.player === player && state.selection.cardIndex === cardIndex;
          state.selection = alreadySelected ? null : { player, cardIndex };
          return;
        }
      }
    }

    // Une case : jouer la carte choisie, ou ouvrir le menu de la boutique.
    const lot = state.lots.find(candidate => isInside(mapX, y, [candidate.x, candidate.y, candidate.width, candidate.height]));
    if (state.selection && lot && playSelectedCard(lot)) {
      return;
    }
    if (lot && lot.shop && !state.selection) {
      state.menuLot = lot;
      return;
    }
    // Sinon (au doigt, pas de survol) : toucher un passant affiche son info-bulle.
    state.hoveredPerson = Game.people.findNear(mapX, y);
  }

  // Au doigt avec la loupe allumée, faire glisser le doigt sert à regarder : on ne joue
  // qu'un toucher bref, quand le doigt se relève sans avoir bougé.
  function onPointerDownOrTap(event) {
    if (event.pointerType !== 'mouse' && Game.magnifier.isActive()) {
      pendingTap = { event, x: event.clientX, y: event.clientY };
      return;
    }
    onPointerDown(event);
  }

  function onPointerUp(event) {
    if (!pendingTap) {
      return;
    }
    const moved = Math.hypot(event.clientX - pendingTap.x, event.clientY - pendingTap.y);
    const tap = pendingTap.event;
    pendingTap = null;
    if (moved <= MAGNIFIER.TAP_MAX_MOVE) {
      onPointerDown(tap);
    }
  }

  function syncPlayButton() {
    document.getElementById('play').textContent = Game.state.isRunning ? 'Pause' : 'Lecture';
  }

  function syncAutoplayButton() {
    const autoplayButton = document.getElementById('autoplay');
    autoplayButton.setAttribute('aria-pressed', String(Game.state.isAutoplay));
    autoplayButton.textContent = Game.state.isAutoplay ? 'Partie auto ✓' : 'Partie auto';
  }

  function bind() {
    const canvas = Game.view.canvas;
    canvas.addEventListener('pointerdown', onPointerDownOrTap);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', () => {
      pendingTap = null;
    });
    canvas.addEventListener('pointermove', event => {
      // Au doigt, sans loupe, un glissement fait défiler la page : l'info-bulle reste celle du toucher.
      if (event.pointerType !== 'mouse' && !Game.magnifier.isActive()) {
        return;
      }
      const [x, y] = toBoardPoint(event);
      Game.state.hoveredPerson = Game.people.findNear(x - Game.layout.mapLeft, y);
    });
    canvas.addEventListener('pointerleave', event => {
      // Au doigt, le pointeur « quitte » le plateau dès que le doigt se relève : l'info-bulle reste affichée.
      if (event.pointerType === 'mouse') {
        Game.state.hoveredPerson = null;
      }
    });

    const populationSlider = document.getElementById('pop');
    const speedSlider = document.getElementById('spd');
    populationSlider.addEventListener('input', () => {
      Game.state.maxPopulation = +populationSlider.value;
      document.getElementById('popv').textContent = Game.state.maxPopulation;
    });
    speedSlider.addEventListener('input', () => {
      Game.state.speedMultiplier = +speedSlider.value;
      document.getElementById('spdv').textContent = '×' + Game.state.speedMultiplier;
    });
    document.getElementById('play').addEventListener('click', () => {
      Game.state.isRunning = !Game.state.isRunning;
      syncPlayButton();
    });
    document.getElementById('reset').addEventListener('click', Game.world.reset);
    document.getElementById('autoplay').addEventListener('click', () => {
      Game.state.isAutoplay = !Game.state.isAutoplay;
      syncAutoplayButton();
    });
    bindFullscreenButton();
  }

  // Plein écran (surtout utile sur téléphone) : bouton « Plein écran » sous le plateau et bouton à
  // côté de la loupe. Seul le plateau reste à l'écran (classe is-fullscreen sur la page) ; quand le
  // navigateur le permet, la barre d'adresse disparaît aussi. Sur iPhone, Safari ne le permet pas :
  // on garde le mode « plateau seul ».
  function isFullscreen() {
    return document.body.classList.contains('is-fullscreen');
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function setFullscreen(enabled) {
    const root = document.documentElement;
    document.body.classList.toggle('is-fullscreen', enabled);
    if (enabled) {
      const request = root.requestFullscreen || root.webkitRequestFullscreen;
      if (request && !fullscreenElement()) {
        try {
          const result = request.call(root, { navigationUI: 'hide' });
          if (result && result.catch) {
            result.catch(() => {});
          }
        } catch (error) {
          // Refusé par le navigateur : on garde le mode « plateau seul ».
        }
      }
    } else if (fullscreenElement()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      exit.call(document);
    }
    syncFullscreenButtons();
    scrollTo(0, 0);
    Game.view.resize(true);
  }

  function syncFullscreenButtons() {
    const enabled = isFullscreen();
    const barButton = document.getElementById('fullscreen');
    barButton.textContent = enabled ? 'Quitter le plein écran' : 'Plein écran';
    barButton.setAttribute('aria-pressed', String(enabled));
    const cornerButton = document.getElementById('fullscreen-corner');
    cornerButton.setAttribute('aria-pressed', String(enabled));
    cornerButton.setAttribute('aria-label', enabled ? 'Quitter le plein écran' : 'Plein écran');
    cornerButton.title = enabled ? 'Quitter le plein écran' : 'Plein écran : le plateau occupe tout l\'écran';
  }

  function bindFullscreenButton() {
    for (const id of ['fullscreen', 'fullscreen-corner']) {
      document.getElementById(id).addEventListener('click', () => setFullscreen(!isFullscreen()));
    }
    // Sortie par le navigateur (touche Échap, geste « retour ») : la page revient aussi à la normale.
    const onChange = () => {
      if (!fullscreenElement() && isFullscreen()) {
        setFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
  }

  Game.input = { bind, syncPlayButton, syncAutoplayButton, setFullscreen };
})();
