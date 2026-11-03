# Bourg-les-Bonhommes 2

Petit jeu de ville pour deux joueurs sur le même écran, inspiré de CityBucks sur iPad. Les passants arrivent par les quatre routes, entrent dans les boutiques qui les attirent, s'y installent puis repartent. Chaque client rapporte des bucks au propriétaire de la boutique.

## Lancer le jeu

Double-cliquer sur `index.html`. Aucune installation, aucune dépendance, aucun outil de compilation.

Le code utilise des **scripts classiques** et non des modules ES (`import`/`export`) : les modules ne fonctionnent pas quand la page est ouverte directement depuis le disque (`file://`). Seules les polices viennent d'Internet (Google Fonts) ; sans connexion, le jeu utilise les polices système.

## Arborescence

```
bourg-les-bonhommes/
├── index.html               Page du jeu : titre, plateau, commandes, règles, journal
├── css/styles.css           Mise en page autour du plateau
├── js/                      Chargés dans l'ordre de index.html
│   ├── polyfills.js         roundRect pour les navigateurs anciens (iOS < 16)
│   ├── game.js              Crée l'espace de noms Game
│   ├── config.js            ★ Dimensions et toutes les valeurs d'équilibrage
│   ├── utils.js             Hasard, mélange de couleurs
│   ├── canvas.js            Canvas, mise à l'échelle de l'écran (Game.view)
│   ├── draw.js              Primitives : rectangle, disque, ellipse, rectangle arrondi
│   ├── map.js               Carrefours, rues, sorties, cases, recherche de trajet
│   ├── catalog.js           ★ Les 20 boutiques et 2 malus, formules de gains
│   ├── names.js             « le Cinéma », « au Cinéma », « du Cinéma »…
│   ├── icons.js             Icônes des enseignes et des cartes
│   ├── sprites.js           Bouclier, voiture, icônes des malus
│   ├── shops/
│   │   ├── geometry.js      Repère de l'intérieur (u, v), retournement selon la porte
│   │   ├── furniture.js     Sols, étagères, places des clients
│   │   ├── interiors-shops.js    Fleuriste, kiosque, boulangerie, librairie, pharmacie,
│   │   │                         jouets, vêtements, bijouterie
│   │   ├── interiors-food.js     Café, glacier, pizzeria, burger, restaurant
│   │   ├── interiors-leisure.js  Coiffeur, arcade, bowling, cinéma, piscine, manège, hôtel
│   │   └── shop.js          Ouverture, places libres, séances, pistes, dessin du bâtiment
│   ├── state.js             État de la partie (Game.state), nouvelle partie, destruction
│   ├── feedback.js          Journal, bannière, textes flottants
│   ├── render/
│   │   ├── board.js         Fond de carte
│   │   ├── trays.js         Bacs de cartes
│   │   ├── menu.js          Menu d'une boutique
│   │   └── overlay.js       Cases jouables, info-bulle, bannière, « Pause »
│   ├── people/
│   │   ├── person.js        Création d'un passant, trajet, arrivée de nouveaux passants
│   │   ├── behaviour.js     Machine à états : rue → boutique → rue
│   │   ├── activities.js    Flâner, s'asseoir, nager, manège, séance, bowling
│   │   └── draw.js          Dessin d'un passant
│   ├── events/
│   │   ├── animations.js    Mise à jour et dessin des animations
│   │   ├── attacks.js       Météorite, voiture-voleur
│   │   └── random-events.js Incendie, monstre, OVNI
│   ├── input.js             Clics, survol, curseurs et boutons
│   └── main.js              Boucle d'animation et démarrage
├── CHANGELOG.md             Ce qui a changé à chaque version
├── CLAUDE.md                Règles pour les prochaines modifications
├── VERIFICATIONS.md         Vérifications manuelles dans le navigateur
└── README.md
```

## Où régler quoi

| Pour changer… | Fichier | Ce qu'il faut modifier |
|---|---|---|
| Nom, prix, couleur, icône d'une boutique ou d'un malus | `js/catalog.js` | tableaux `SHOPS` et `ACTIONS` |
| Bucks de départ, cases roses, boutiques déjà ouvertes | `js/config.js` | `start` |
| Gain par client, coût d'amélioration et de bouclier, maximums | `js/config.js` | `economy` (formules dans `js/catalog.js`) |
| Envie des passants d'entrer | `js/config.js` | `attraction` |
| Vitesse des passants, durée de séjour par activité | `js/config.js` | `people` |
| Bowling (lancers, durées, chance de strike) | `js/config.js` | `bowling` |
| Durée de l'attente et du film au cinéma | `js/config.js` | `cinema` |
| Réussite de la voiture-voleur, vitesse de la voiture | `js/config.js` | `thief` |
| Fréquence des incendies, monstres, OVNI | `js/config.js` | `events` |
| Effets de l'incendie, du monstre, de l'OVNI | `js/config.js` | `fire`, `monster`, `ufo` |
| Nombre de places d'une boutique | `js/shops/interiors-*.js` | `slots` de la boutique |
| Disposition des tables du café | `js/shops/interiors-food.js` | `CAFE_TABLES` (position et angle des chaises) |
| Activités où l'on s'assoit, durée pour s'asseoir | `js/config.js` | `people.SEATED_ACTIVITIES`, `people.SIT_DOWN_SECONDS` |
| Prénoms, coiffures, couleurs des passants | `js/people/person.js` | `GIRL_NAMES`, `BOY_NAMES`, `GIRL_HAIR_STYLES`… |
| Mobilier d'une boutique | `js/shops/interiors-*.js` | `drawFurniture` (et `drawAnimated`) |
| Nombre de passants au démarrage | `js/config.js` et `index.html` | `people.DEFAULT_COUNT` et la valeur du curseur `#pop` |

### Ajouter une boutique

1. Ajouter une ligne dans `SHOPS` (`js/catalog.js`), avec un `id` unique et une icône existante de `js/icons.js` (ou en créer une).
2. Ajouter son intérieur dans le fichier `js/shops/interiors-*.js` qui convient : `activity`, `slots`, `drawFurniture(g)`.
3. Ajouter son article dans `js/names.js` (« le », « la », « l' »…).
4. Le bac de cartes est dimensionné pour 22 cartes en 2 colonnes : au-delà, il faut revoir `js/render/trays.js`.

## Organisation du code

- **Un seul objet global, `Game`.** Chaque fichier est enveloppé dans une fonction exécutée immédiatement et ne publie que son API : `Game.config`, `Game.map`, `Game.people`, etc. Ses autres fonctions restent privées.
- **`Game.state`** contient tout ce qui change pendant une partie (cases, argent, passants, animations, réglages des curseurs). Le reste est constant après le chargement.
- **Une case** (`Game.state.lots[i]`) : position, taille, `shop` (entrée du catalogue ou `null`), `owner`, `level`, `shields`, `isHot`, `isBusy`, et pour une boutique ouverte `occupants`, `bowlingLanes`, `cinema`.
- **Intérieurs** : le mobilier est décrit en coordonnées normalisées (u de 0 à 1 de gauche à droite, v de 0 au fond à 1 côté porte). Les fonctions de dessin reçoivent un « pinceau » `g` (`g.x(u)`, `g.y(v)`, `g.w(u)`, `g.h(v)`, `g.radius(k)`), détaillé dans `js/shops/geometry.js`.
- **Rendu** : la carte et les bâtiments sont dessinés sur un canvas de fond seulement quand ils changent (`Game.board.draw()`) ; à chaque image, on recopie ce fond puis on dessine ce qui bouge.

## Conventions

- JavaScript et CSS natifs, sans dépendance.
- Noms explicites en anglais, en camelCase ; constantes en `MAJUSCULES`.
- Une instruction par ligne, accolades systématiques, `'use strict'` dans chaque fichier.
- Commentaires courts en français, là où la logique n'est pas évidente.
- Toute valeur d'équilibrage va dans `js/config.js`.
