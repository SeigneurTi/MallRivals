// Réglages du jeu : dimensions du plateau et toutes les valeurs d'équilibrage.
// Les prix, noms et couleurs des boutiques sont dans js/catalog.js.
// Les places de chaque boutique sont définies avec son mobilier (js/shops/interiors-*.js).
(function () {
  'use strict';

  const BOARD_WIDTH = 1200;
  const TRAY_WIDTH = 130;

  Game.config = {
    // Plateau en unités logiques ; le canvas est ensuite mis à l'échelle de l'écran.
    board: {
      WIDTH: BOARD_WIDTH,
      HEIGHT: 760,
      TRAY_WIDTH: TRAY_WIDTH,          // largeur de chaque bac de cartes (gauche et droite)
      MAP_LEFT: TRAY_WIDTH,            // la carte commence après le bac de gauche
      MAP_WIDTH: BOARD_WIDTH - 2 * TRAY_WIDTH,
      ROAD_HALF_WIDTH: 20,
    },

    players: {
      COLORS: ['#e8743b', '#3d7dd8'],
      NAMES: ['Joueur 1', 'Joueur 2'],
    },

    start: {
      BUCKS: 1000,
      HOT_LOT_COUNT: 5,                // cases avec un rond rose (gains doublés)
      PREBUILT_SHOP_COUNT: 4,          // boutiques déjà ouvertes en début de partie
      PREBUILT_SHOP_CHOICES: 10,       // tirées parmi les 10 boutiques les moins chères
    },

    economy: {
      INCOME_RATE: 0.5,                // part du prix gagnée par client (avant correction)
      LEVEL_INCOME_BONUS: 0.5,         // +50 % de gain par niveau au-dessus de 1
      HOT_LOT_MULTIPLIER: 2,
      UPGRADE_COST_RATE: 0.5,          // coût = prix × 0,5 × niveau actuel
      SHIELD_BASE_COST: 60,            // coût = 60 + prix × 0,25
      SHIELD_PRICE_RATE: 0.25,
      MAX_LEVEL: 3,
      MAX_SHIELDS: 3,
    },

    // Probabilité qu'un passant entre quand il passe devant une boutique.
    attraction: {
      BASE: 0.45,
      PRICE_WEIGHT: 0.4,
      REFERENCE_PRICE: 600,
      LEVEL_BONUS: 0.08,
      MAX: 0.97,
    },

    people: {
      DEFAULT_COUNT: 40,               // doit correspondre à la valeur du curseur dans index.html
      WALK_SPEED_MIN: 28,
      WALK_SPEED_MAX: 46,
      ROAD_OFFSET: 13,                 // écart latéral maximal par rapport au milieu de la rue
      AVOID_SAME_EXIT_CHANCE: 0.8,     // chance de ne pas ressortir par la route d'arrivée
      SPAWN_DELAY_MIN: 0.25,
      SPAWN_DELAY_MAX: 0.7,
      INSIDE_SCALE: 0.8,               // les passants sont dessinés plus petits dans les boutiques
      INSIDE_WALK_FACTOR: 0.5,         // vitesse relative pour rejoindre sa place
      LEAVING_WALK_FACTOR: 0.6,        // vitesse relative pour regagner la porte
      // Durée de séjour (en secondes, tirée entre min et max) selon l'activité.
      STAY_SECONDS: {
        browse: [3, 6],                // flâner dans les rayons
        sit: [6, 10],                  // s'asseoir à une table, chez le coiffeur
        play: [6, 9],                  // borne d'arcade
        lobby: [5, 8],                 // hall de l'hôtel
        swim: [8, 12],
        ride: [8, 11],                 // manège
      },
      DEFAULT_STAY_SECONDS: 6,
      HOVER_RADIUS: 16,                // distance de survol pour afficher le prénom
    },

    bowling: {
      THROWS_PER_VISIT: 3,
      AIM_SECONDS: 1,
      ROLL_SECONDS: 1.1,
      PAUSE_AFTER_THROW_SECONDS: 1.5,
      PINS_DOWN_SECONDS: 1.4,
      STRIKE_CHANCE: 0.35,
      MIN_PINS: 4,                     // sans strike : entre 4 et 9 quilles
      MAX_PINS: 10,
    },

    cinema: {
      WAITING_SECONDS: 40,             // les spectateurs s'installent
      FILM_SECONDS: 25,                // personne n'entre, puis toute la salle sort
    },

    carousel: {
      TURN_SPEED: 0.9,                 // radians par seconde
    },

    meteor: {
      FALL_SECONDS: 1.3,
    },

    thief: {
      BASE_SUCCESS: 0.75,
      SUCCESS_LOSS_PER_SHIELD: 0.22,
      MIN_SUCCESS: 0.1,
      CAR_SPEED: 170,
    },

    // Fréquence moyenne des événements aléatoires (par seconde de jeu).
    events: {
      FIRE_PER_SECOND: 0.004,
      MONSTER_PER_SECOND: 0.011,
      UFO_PER_SECOND: 0.009,
    },

    fire: {
      DURATION_SECONDS: 6,
      BURN_CHANCE: 0.45,
      BURN_CHANCE_WITH_SHIELD: 0.15,
    },

    monster: {
      WALK_IN_SECONDS: 2.6,
      WALK_OUT_SECONDS: 1.8,
    },

    ufo: {
      ARRIVAL_SECONDS: 2,
      BEAM_SECONDS: 2.6,
      DEPARTURE_SECONDS: 1.4,
      ABDUCTION_CHANCE: 0.35,          // sinon les extraterrestres font des achats
      SHOPPING_RATE: 0.6,              // achat = prix de la boutique × 0,6
    },

    feedback: {
      FLOATING_TEXT_SECONDS: 1.4,
      BANNER_SECONDS: 4,
      LOG_MAX_ENTRIES: 8,
    },

    loop: {
      MAX_FRAME_SECONDS: 0.05,         // évite les sauts après un onglet en arrière-plan
    },
  };

  // --- Alias temporaires pour le code pas encore refactorisé (retirés à la fin) ---
  const board = Game.config.board;
  window.LW = board.WIDTH;
  window.LH = board.HEIGHT;
  window.TW = board.TRAY_WIDTH;
  window.BX = board.MAP_LEFT;
  window.BW = board.MAP_WIDTH;
  window.RH = board.ROAD_HALF_WIDTH;
  window.PCOL = Game.config.players.COLORS;
  window.PNAME = Game.config.players.NAMES;
})();
