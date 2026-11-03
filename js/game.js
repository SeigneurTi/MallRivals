// Espace de noms unique du jeu.
// Chaque fichier y range sa partie : Game.config, Game.map, Game.people…
// On évite ainsi des dizaines de variables globales, tout en gardant des scripts
// classiques (les modules ES ne fonctionnent pas en ouvrant index.html en file://).
window.Game = {};
