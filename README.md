# Bourg-les-Bonhommes 2

Petit jeu de ville pour deux joueurs, inspiré de CityBucks sur iPad. Les passants arrivent par les quatre routes, entrent dans les boutiques qui les attirent, s'y installent puis repartent. Chaque client rapporte des bucks au propriétaire de la boutique.

Le jeu tourne dans un navigateur, sans installation ni dépendance : ouvrir `index.html` suffit.

## Arborescence

```
bourg-les-bonhommes/
├── index.html        Page du jeu : titre, plateau, commandes, règles, journal
├── css/
│   └── styles.css    Mise en page et couleurs de la page autour du plateau
├── js/               Chargés dans cet ordre par index.html
│   ├── polyfills.js  Compléments pour les navigateurs anciens (iOS < 16)
│   ├── config.js     Dimensions du plateau, canvas, utilitaires
│   ├── map.js        Rues, sorties de la ville, cases de boutiques
│   ├── catalog.js    Les 20 boutiques, les 2 malus, formules de gains
│   ├── icons.js      Icônes des enseignes et des cartes
│   ├── shops.js      Intérieurs, places, bowling, séances de cinéma
│   ├── state.js      État de la partie, réinitialisation, journal
│   ├── render.js     Fond de carte, bacs de cartes, menu d'une boutique
│   ├── people.js     Passants et leurs activités dans les boutiques
│   ├── events.js     Météorite, voiture-voleur, monstre, OVNI, incendie
│   └── main.js       Boucle d'animation, interactions, démarrage
├── CHANGELOG.md      Ce qui a changé à chaque version
└── README.md
```

## Où régler quoi

| Pour changer… | Fichier | Ce qu'il faut modifier |
|---|---|---|
| Prix et nom des boutiques | `js/catalog.js` | tableau `SHOPS` |
| Prix des malus | `js/catalog.js` | tableau `ACTIONS` |
| Gain par client | `js/catalog.js` | fonction `income` |
| Envie des passants d'entrer | `js/catalog.js` | fonction `attraction` |
| Nombre de places d'une boutique | `js/shops.js` | `slots` dans `SPEC` |
| Durée des séances de cinéma | `js/shops.js` | `CINE_OPEN` (attente) et `CINE_FILM` (film) |
| Fréquence des événements | `js/main.js` | les trois lignes `randomEvent(...)` |
| Bucks de départ | `js/state.js` | `bucks=[1000,1000]` |

## Notes techniques

- Tout est dessiné dans un seul `<canvas>`. Le plateau fait 1200 × 760 unités et s'adapte à la largeur de l'écran.
- Les fichiers JavaScript sont de simples scripts partagés, sans module ni outil de compilation.
- Seules les polices viennent d'Internet (Google Fonts) ; sans connexion, le jeu utilise les polices système.
