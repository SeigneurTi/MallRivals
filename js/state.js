// État de la partie (Game.state) et opérations sur la ville (Game.world) :
// nouvelle partie, destruction d'une boutique.
(function () {
  'use strict';

  const START = Game.config.start;

  // Tout ce qui change pendant une partie.
  Game.state = {
    lots: [],                 // les 28 cases (voir createLots)
    bucks: [0, 0],            // argent de chaque joueur
    selection: null,          // carte choisie : { player, cardIndex }
    menuLot: null,            // case dont le menu est ouvert
    people: [],               // passants (voir js/people/person.js)
    floatingTexts: [],        // « +42 », « Volé ! »… (voir js/feedback.js)
    animations: [],           // météorites, voitures, monstres… (voir js/events/animations.js)
    spawnTimer: 0,            // délai avant l'arrivée du prochain passant
    sales: null,              // compte à rebours des soldes (voir js/events/sales.js)
    banner: null,             // dernier message du journal, affiché sur le plateau
    gameTime: 0,              // temps de jeu écoulé (s), sert à faire tourner le manège
    maxPopulation: Game.config.people.DEFAULT_MAX,   // curseur « Passants max »
    speedMultiplier: 1,       // curseur « Vitesse »
    isRunning: !Game.view.prefersReducedMotion,           // bouton Pause / Lecture
    hoveredPerson: null,      // passant survolé (info-bulle)
    isAutoplay: false,        // bouton « Partie auto » : les joueurs jouent tout seuls
    winner: null,             // joueur qui a atteint l'objectif (la partie est alors finie)
    victoryAge: 0,            // temps réel écoulé depuis la victoire (s)
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
      salesUntil: 0,          // soldes : pastille « Soldes » jusqu'à ce temps de jeu
      isBusy: false,          // une attaque ou un événement est en cours sur cette case
    }));
  }

  // Nouvelle partie.
  function reset() {
    const state = Game.state;
    state.lots = createLots();

    // La banque est toujours au même endroit ; les tirages ci-dessous se font sur les autres cases.
    const bankLot = state.lots[Game.config.bank.LOT_INDEX];
    Game.shops.openBank(bankLot);
    const otherLots = state.lots.filter(lot => lot !== bankLot);

    Game.utils.shuffled(otherLots).slice(0, START.HOT_LOT_COUNT).forEach(lot => {
      lot.isHot = true;
    });

    // Quelques boutiques bon marché déjà ouvertes, une sur deux pour chaque joueur.
    const cheapShops = Game.catalog.SHOPS.slice(0, START.PREBUILT_SHOP_CHOICES);
    Game.utils.shuffled(otherLots).slice(0, START.PREBUILT_SHOP_COUNT).forEach((lot, k) => {
      Game.shops.open(lot, Game.utils.pickRandom(cheapShops), k % 2);
    });

    state.bucks = [START.BUCKS, START.BUCKS];
    state.selection = null;
    state.menuLot = null;
    state.floatingTexts = [];
    state.animations = [];
    state.spawnTimer = 0;
    state.banner = null;
    state.gameTime = 0;
    state.winner = null;
    state.victoryAge = 0;
    Game.events.resetSales();
    state.people = [];
    const startingPopulation = Game.people.targetPopulation();
    for (let k = 0; k < startingPopulation; k++) {
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
    lot.isBank = false;
    lot.salesUntil = 0;
    if (Game.state.menuLot === lot) {
      Game.state.menuLot = null;
    }
    Game.board.draw();
  }

  // Le premier joueur qui atteint l'objectif gagne (le plus riche si les deux l'atteignent ensemble).
  function checkVictory() {
    const state = Game.state;
    const target = Game.config.victory.TARGET_BUCKS;
    if (state.winner != null || Math.max(...state.bucks) < target) {
      return;
    }
    state.winner = state.bucks[0] >= state.bucks[1] ? 0 : 1;
    state.victoryAge = 0;
    state.selection = null;
    state.menuLot = null;
    Game.feedback.log(`${Game.config.players.NAMES[state.winner]} atteint ${target} $ et gagne la partie !`);
  }

  Game.world = { reset, lotCenter, destroyShop, checkVictory };
})();
