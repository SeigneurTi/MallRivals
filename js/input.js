// Interactions : toucher les cartes, les cases et le menu ; survoler les passants ;
// curseurs et boutons sous le plateau.
(function () {
  'use strict';

  const BOARD = Game.config.board;
  const { floatText } = Game.feedback;

  // Position du pointeur en unités logiques du plateau.
  function toBoardPoint(event) {
    const bounds = Game.view.canvas.getBoundingClientRect();
    return [(event.clientX - bounds.left) / Game.view.scale, (event.clientY - bounds.top) / Game.view.scale];
  }

  function isInside(x, y, [left, top, width, height]) {
    return x >= left && x <= left + width && y >= top && y <= top + height;
  }

  function chooseMenuItem(lot, item) {
    const actions = Game.actions;
    if (item.action === 'upgrade' && actions.canAfford(lot.owner, item.cost)) {
      actions.upgrade(lot);
    } else if (item.action === 'shield' && actions.canAfford(lot.owner, item.cost)) {
      actions.addShield(lot);
    } else if (item.action && item.action !== 'close') {
      // Pas assez d'argent : le menu reste ouvert.
      Game.state.menuLot = lot;
      floatText(lot, 'Pas assez de bucks', '#c0392b');
    }
  }

  // Joue la carte choisie sur une case. Renvoie false si rien ne s'est passé.
  function playSelectedCard(lot) {
    const state = Game.state;
    const card = Game.catalog.CARDS[state.selection.cardIndex];
    const player = state.selection.player;
    if (state.bucks[player] < card.price) {
      floatText(lot, 'Pas assez de bucks', '#c0392b');
      return true;
    }
    if (!card.isAction && !lot.shop && !Game.actions.canBuild(player, card)) {
      floatText(lot, `Déjà ${Game.config.economy.MAX_SAME_SHOP_PER_PLAYER} fois !`, '#c0392b');
      return true;
    }
    if (!card.isAction && !lot.shop) {
      state.selection = null;
      Game.actions.build(player, lot, card);
      return true;
    }
    if (card.isAction && lot.shop && !lot.isBusy) {
      const refusal = Game.actions.playMalus(player, card, lot);
      if (refusal) {
        floatText(lot, refusal, '#c0392b');
      } else {
        state.selection = null;
      }
      return true;
    }
    return false;
  }

  function onPointerDown(event) {
    const state = Game.state;
    const [x, y] = toBoardPoint(event);
    const mapX = x - BOARD.MAP_LEFT;

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
    for (const player of [0, 1]) {
      for (let cardIndex = 0; cardIndex < Game.catalog.CARDS.length; cardIndex++) {
        if (isInside(x, y, Game.trays.cardRect(player, cardIndex))) {
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
    // Sinon (sur tablette, pas de survol) : toucher un passant affiche son info-bulle.
    state.hoveredPerson = Game.people.findNear(mapX, y);
  }

  function syncPlayButton() {
    document.getElementById('play').textContent = Game.state.isRunning ? 'Pause' : 'Lecture';
  }

  function bind() {
    const canvas = Game.view.canvas;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', event => {
      const [x, y] = toBoardPoint(event);
      Game.state.hoveredPerson = Game.people.findNear(x - BOARD.MAP_LEFT, y);
    });
    canvas.addEventListener('pointerleave', () => {
      Game.state.hoveredPerson = null;
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
    const autoplayButton = document.getElementById('autoplay');
    autoplayButton.addEventListener('click', () => {
      Game.state.isAutoplay = !Game.state.isAutoplay;
      autoplayButton.setAttribute('aria-pressed', String(Game.state.isAutoplay));
      autoplayButton.textContent = Game.state.isAutoplay ? 'Partie auto ✓' : 'Partie auto';
    });
  }

  Game.input = { bind, syncPlayButton };
})();
