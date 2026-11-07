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
      BUCKS: 140,                      // de quoi ouvrir une boulangerie, un café, ou deux fleuristes ou kiosques
      HOT_LOT_COUNT: 5,                // cases avec un rond rose (gains doublés)
      PREBUILT_SHOP_COUNT: 0,          // boutiques déjà ouvertes en début de partie (aucune : on part de rien)
      PREBUILT_SHOP_CHOICES: 10,       // tirées parmi les 10 boutiques les moins chères
    },

    economy: {
      INCOME_RATE: 0.1,                // part du prix gagnée par client (avant correction) ; réglée pour une partie de 15 min environ
      LEVEL_INCOME_BONUS: 0.5,         // +50 % de gain par niveau au-dessus de 1
      HOT_LOT_MULTIPLIER: 2,
      UPGRADE_COST_RATE: 0.5,          // coût = prix × 0,5 × niveau actuel
      SHIELD_BASE_COST: 60,            // coût = 60 + prix × 0,25
      SHIELD_PRICE_RATE: 0.25,
      MAX_LEVEL: 3,
      MAX_SHIELDS: 3,
      SHIELD_BREAK_CHANCE: 0.2,
      MAX_SAME_SHOP_PER_PLAYER: 2,     // un joueur ne construit pas plus de 2 fois la même boutique        // même avec un bouclier, 20 % de chances que la boutique soit détruite
    },

    // Coup de pouce au joueur qui perd : si sa fortune (argent + prix de ses boutiques) tombe sous
    // la moitié de celle de l'autre, chacun de ses clients rapporte 50 % de plus.
    catchUp: {
      WEALTH_RATIO: 0.5,
      INCOME_BONUS: 1.5,
    },

    // Victoire : le premier joueur qui atteint ce montant gagne la partie.
    victory: {
      TARGET_BUCKS: 20000,
      AUTOPLAY_RESTART_SECONDS: 10,    // en partie auto, une nouvelle partie commence 10 s après
    },

    // Soldes : toutes les 2 minutes, des clients se ruent dans plusieurs boutiques.
    sales: {
      COUNTDOWN_SECONDS: 120,          // compte à rebours avant les soldes
      SHOP_COUNT: 4,                   // nombre de boutiques prises d'assaut
      MAX_SHOPPERS_PER_SHOP: 6,        // clients envoyés vers chaque boutique (au plus ses places)
      INCOME_RATE: 0.5,                // un client des soldes rapporte deux fois moins
      RUN_SPEED_FACTOR: 2.2,           // ils courent jusqu'à la boutique
      SPREAD_DISTANCE: 140,            // ils n'arrivent pas tous en même temps
      LABEL_SECONDS: 15,               // durée de la pastille « Soldes » sur les boutiques visées
    },

    // Probabilité qu'un passant entre quand il passe devant une boutique.
    attraction: {
      BASE: 0.45,
      PRICE_WEIGHT: 0.4,
      REFERENCE_PRICE: 1300,           // les prix vont jusqu'à 1800 $ : l'attrait suit la même courbe qu'avant
      LEVEL_BONUS: 0.08,
      MAX: 0.97,
    },

    people: {
      // Plus il y a de boutiques, plus il y a de passants : BASE_COUNT + PER_SHOP × boutiques,
      // sans dépasser le curseur « Passants max ».
      BASE_COUNT: 8,
      PER_SHOP: 4,
      DEFAULT_MAX: 120,                // doit correspondre à la valeur du curseur dans index.html
      WALK_SPEED_MIN: 28,
      WALK_SPEED_MAX: 46,
      ROAD_OFFSET: 13,                 // écart latéral maximal par rapport au milieu de la rue
      AVOID_SAME_EXIT_CHANCE: 0.8,     // chance de ne pas ressortir par la route d'arrivée
      ROUTE_LOT_COUNT: 1,              // en plus de sa boutique, chaque passant longe la rue d'une case tirée au hasard
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
        dance: [8, 12],                // piste de danse de la discothèque
        billiard: [16, 26],            // une partie de billard
        gallery: [14, 20],             // visite de la galerie d'art
        soak: [8, 12],                 // jacuzzi de la piscine
      },
      DEFAULT_STAY_SECONDS: 6,
      SEATED_ACTIVITIES: ['sit', 'session'],   // activités où le client s'assoit (tables, fauteuils de cinéma…)
      SIT_DOWN_SECONDS: 0.4,           // temps pour s'asseoir ou se relever
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
      PIN_FALL_SECONDS: 0.35,          // durée de la chute d'une quille
      PIN_FALL_DELAY_PER_ROW: 0.07,    // la chute se propage de rangée en rangée
      PIN_LIE_SECONDS: 0.45,           // les quilles tombées restent couchées…
      PIN_SWEEP_SECONDS: 0.3,          // …puis sont balayées : seules les quilles debout restent
    },

    pool: {
      CHANGE_SECONDS: 3,               // temps pour se changer dans une cabine du vestiaire
    },

    gallery: {
      LOOK_SECONDS_MIN: 2.5,           // temps passé devant un tableau
      LOOK_SECONDS_MAX: 4.5,
    },

    cinema: {
      WAITING_SECONDS: 40,             // les spectateurs s'installent
      FILM_SECONDS: 25,                // personne n'entre, puis toute la salle sort
    },

    lasergame: {
      WAITING_SECONDS: 30,             // les joueurs s'équipent dans leur base
      PLAYING_SECONDS: 25,             // la partie : personne n'entre, puis tout le monde sort
      SHOT_DELAY_MIN: 0.5,             // temps entre deux tirs d'un joueur
      SHOT_DELAY_MAX: 1.4,
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
    // Au total, environ un événement toutes les 4 minutes (v2.7 : toutes les 40 s).
    events: {
      START_DELAY_SECONDS: 360,        // aucun événement pendant les 6 premières minutes de jeu
      FIRE_PER_SECOND: 0.0007,         // un incendie toutes les 24 min environ
      MONSTER_PER_SECOND: 0.002,       // un monstre toutes les 8 min environ
      UFO_PER_SECOND: 0.0015,          // un OVNI toutes les 11 min environ
    },

    // Banque : sans propriétaire, toujours au même endroit, pillable à la voiture-voleur.
    bank: {
      LOT_INDEX: 28,                   // au centre de la carte, le long de la rue centrale
      LOOT: 600,                       // butin quand le coffre est plein
      REFILL_SECONDS: 120,             // l'or revient en 2 minutes
    },

    billiard: {
      AIM_SECONDS_MIN: 1.2,            // temps de visée avant chaque coup
      AIM_SECONDS_MAX: 2.2,
      SHOT_SPEED: 2.6,                 // vitesse de la bille blanche (longueurs de table par seconde)
      FRICTION: 1.2,                   // ralentissement des billes
    },

    // Partie auto (bouton « Partie auto ») : les deux joueurs jouent tout seuls.
    magnifier: {
      ZOOM: 3,                         // grossissement de la loupe
      DIAMETER: 220,                   // diamètre de la loupe, en pixels de l'écran
    },

    autoplay: {
      DECISION_SECONDS: 3,             // un joueur réfléchit toutes les 3 s environ
      BUILD_CHANCE: 0.7,               // préfère construire quand c'est possible
      BANK_ROBBERY_CHANCE: 0.25,       // tente de piller la banque quand elle est pleine
      MALUS_CHANCE: 0.05,              // joue rarement une météorite ou un voleur contre l'adversaire
    },

    fire: {
      DURATION_SECONDS: 6,
      BURN_CHANCE: 0.45,               // avec un bouclier : economy.SHIELD_BREAK_CHANCE
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

    // Jauge d'argent derrière les cartes : elle descend jusqu'à la dernière boutique qu'on peut s'offrir.
    moneyGauge: {
      FILL_SPEED: 3,                   // vitesse à laquelle la jauge rattrape l'argent du joueur
    },

    feedback: {
      FLOATING_TEXT_SECONDS: 1.4,
      BANNER_SECONDS: 4,
      LOG_MAX_ENTRIES: 8,
    },

    loop: {
      MAX_FRAME_SECONDS: 0.05,         // évite les sauts après un onglet en arrière-plan
    },

    // Partie à distance (js/net/) : l'hôte envoie une photo de la ville à son ami.
    net: {
      SNAPSHOT_INTERVAL_SECONDS: 0.1,  // une photo toutes les 0,1 s (10 par seconde)
      MAX_BUFFERED_BYTES: 256 * 1024,  // au-delà, connexion trop lente : on saute une photo
      ADDRESS_SEARCH_MAX_MS: 4000,     // temps maximal pour trouver ses adresses réseau avant d'écrire le code
      CONNECT_TIMEOUT_SECONDS: 20,     // sans connexion au bout de ce temps, on explique pourquoi ça peut bloquer
      PROTOCOL_VERSION: 1,             // à changer si les messages changent : deux versions différentes refusent de jouer ensemble
      // Serveurs publics qui aident deux navigateurs à se trouver à travers les box internet (STUN).
      // Ils ne voient passer que les adresses réseau, jamais la partie.
      ICE_SERVERS: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }],
    },
  };
})();
