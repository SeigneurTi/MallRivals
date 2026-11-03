// État de la partie (Game.state) et opérations sur la ville (Game.world) :
// nouvelle partie, destruction d'une boutique.
(function () {
  'use strict';

  const START = Game.config.start;

  // Tout ce qui change pendant une partie.
  Game.state = {
    lots: [],                 // les 36 cases (voir createLots)
    bucks: [0, 0],            // argent de chaque joueur
    selection: null,          // carte choisie : { player, cardIndex }
    menuLot: null,            // case dont le menu est ouvert
    people: [],               // passants (voir js/people/person.js)
    floatingTexts: [],        // « +42 », « Volé ! »… (voir js/feedback.js)
    animations: [],           // météorites, voitures, monstres… (voir js/events/animations.js)
    spawnTimer: 0,            // délai avant l'arrivée du prochain passant
    banner: null,             // dernier message du journal, affiché sur le plateau
    gameTime: 0,              // temps de jeu écoulé (s), sert à faire tourner le manège
    targetPopulation: Game.config.people.DEFAULT_COUNT,   // curseur « Passants »
    speedMultiplier: 1,       // curseur « Vitesse »
    isRunning: !Game.view.prefersReducedMotion,           // bouton Pause / Lecture
    hoveredPerson: null,      // passant survolé (info-bulle)
  };

  function createLots() {
    return Game.map.lotRects.map(([x, y, width, height], index) => ({
      index,
      x,
      y,
      width,
      height,
      shop: null,             // entrée du catalogue, ou null si la case est libre
      owner: null,            // 0, 1, ou null (boutique sans propriétaire)
      level: 1,
      shields: 0,
      isHot: false,           // rond rose : gains doublés
      isBusy: false,          // une attaque ou un événement est en cours sur cette case
    }));
  }

  // Nouvelle partie.
  function reset() {
    const state = Game.state;
    state.lots = createLots();

    Game.utils.shuffled(state.lots).slice(0, START.HOT_LOT_COUNT).forEach(lot => {
      lot.isHot = true;
    });

    // Quelques boutiques bon marché déjà ouvertes, une sur deux pour chaque joueur.
    const cheapShops = Game.catalog.SHOPS.slice(0, START.PREBUILT_SHOP_CHOICES);
    Game.utils.shuffled(state.lots).slice(0, START.PREBUILT_SHOP_COUNT).forEach((lot, k) => {
      Game.shops.open(lot, Game.utils.pickRandom(cheapShops), k % 2);
    });

    state.bucks = [START.BUCKS, START.BUCKS];
    state.selection = null;
    state.menuLot = null;
    state.floatingTexts = [];
    state.animations = [];
    state.spawnTimer = 0;
    state.banner = null;
    state.people = [];
    for (let k = 0; k < state.targetPopulation; k++) {
      state.people.push(Game.people.create(true));
    }
    Game.feedback.clearLog();
    Game.board.draw();
  }

  function lotCenter(lot) {
    return [lot.x + lot.width / 2, lot.y + lot.height / 2];
  }

  // Détruit la boutique d'une case : ses clients ressortent, la case redevient libre.
  function destroyShop(lot) {
    for (const person of Game.state.people) {
      if (person.lot === lot && Game.people.isInOrEnteringShop(person)) {
        Game.people.exitShopNow(person);
      }
    }
    lot.shop = null;
    lot.owner = null;
    lot.level = 1;
    lot.shields = 0;
    lot.occupants = [];
    if (Game.state.menuLot === lot) {
      Game.state.menuLot = null;
    }
    Game.board.draw();
  }

  Game.world = { reset, lotCenter, destroyShop };
})();
