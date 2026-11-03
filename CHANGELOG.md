# Journal des modifications

Les versions les plus récentes sont en haut.

## v2.8 — Banque, billard, partie auto, événements plus rares (4 novembre 2026)

- **Banque** : toujours au centre de la carte, elle n'appartient à personne et ne peut pas être détruite (les événements l'épargnent, la météorite rebondit dessus). Quand son coffre est plein, une voiture-voleur l'emporte : +600 $. Le coffre se vide, puis l'or revient peu à peu (lingots visibles, « Or 45 % ») : pillable à nouveau au bout de 2 minutes. Son menu indique le temps restant.
- **Salle de billard** (280 $, 4 places) : 2 tables ; deux clients jouent l'un contre l'autre, chacun son tour. Billes simulées (rebonds, chocs, poches), queue qui recule pendant la visée, « Partie gagnée ! » quand toutes les billes sont rentrées.
- **Événements aléatoires beaucoup plus rares** : environ un toutes les 4 minutes au lieu de toutes les 40 secondes.
- **Bouton « Partie auto »** : les deux joueurs jouent tout seuls (ils construisent chaque type de boutique, économisent pour les plus chères, améliorent, protègent, pillent la banque et s'attaquent rarement). Pratique pour regarder la ville.
- Les bacs de cartes s'adaptent au nombre de cartes (25 désormais).
- Code : les actions d'un joueur sont regroupées dans `js/actions.js`, partagées par les clics et la partie auto ; un intérieur peut avoir son propre état (`createState`, `update`).
- Fichiers : nouveaux `js/actions.js`, `js/autoplay.js`, `js/shops/interiors-bank.js` ; modifiés `js/config.js`, `js/catalog.js`, `js/names.js`, `js/icons.js`, `js/shops/shop.js`, `js/shops/interiors-night.js`, `js/state.js`, `js/events/attacks.js`, `js/events/random-events.js`, `js/input.js`, `js/main.js`, `js/render/menu.js`, `js/render/overlay.js`, `js/render/trays.js`, `index.html`, `css/styles.css`.

## v2.7 — Casino, discothèque, spectateurs face à l'écran (4 novembre 2026)

- Deux nouvelles boutiques, les plus chères du jeu :
  - **Casino** (700 $, 9 places) : 5 machines à sous dont l'écran fait défiler des symboles et la lampe clignote quand quelqu'un joue, et une table de roulette qui tourne, avec 4 joueurs assis.
  - **Discothèque** (800 $, 8 places) : piste de danse aux dalles colorées, boule à facettes, spots qui balaient la salle, lumière tamisée ; les clients dansent bras levés.
- Cinéma : les spectateurs regardent l'écran. On les voit de dos (cheveux, jambes cachées) quand l'écran est en haut, de face quand la salle est retournée. Les dossiers des fauteuils sont du côté opposé à l'écran.
- Bacs de cartes : 24 cartes au lieu de 22, cartes légèrement plus compactes.
- Fichiers : `js/catalog.js`, `js/names.js`, `js/icons.js` (dé, boule à facettes), `js/config.js` (durée de danse), nouveau `js/shops/interiors-night.js`, `js/shops/interiors-leisure.js`, `js/shops/shop.js` et `js/main.js` (couche dessinée par-dessus les clients), `js/people/activities.js`, `js/people/draw.js`, `js/people/behaviour.js`, `js/people/person.js`, `js/render/trays.js`, `index.html`.

## v2.6 — Filles, clients assis, café réaménagé (4 novembre 2026)

- Des filles parmi les passants (une sur deux) : cheveux longs ou queue de cheval, jupe, et un prénom de fille. Les garçons ont un prénom de garçon.
- Les clients s'assoient vraiment : une fois à leur place, ils s'installent en 0,4 s (le corps descend, les jambes passent à l'horizontale) et se relèvent en repartant. Cela vaut pour toutes les places assises : café, glacier, pizzeria, burger, restaurant, coiffeur, fauteuils du cinéma et transats de la piscine.
- Assis à une table, le client se tourne vers elle.
- Café : les 3 tables ne sont plus alignées, et leurs chaises sont placées à des angles différents. Toujours 6 places, donc mêmes gains par client.
- Fichiers : `js/people/person.js`, `js/people/draw.js`, `js/people/behaviour.js`, `js/people/activities.js`, `js/shops/furniture.js`, `js/shops/interiors-food.js`, `js/config.js`.

## v2.5 — Code remis au propre (3 novembre 2026)

Aucun changement de règle, d'équilibrage ni d'affichage : le jeu se joue et se dessine exactement comme en v2.4.

- Tout le code est rangé dans un seul objet global, `Game`, au lieu de dizaines de variables globales. Le jeu reste en scripts classiques et s'ouvre toujours en double-cliquant sur `index.html`.
- Nouveau fichier `js/config.js` : toutes les valeurs d'équilibrage (argent de départ, gains, probabilités, durées, fréquences des événements) y sont regroupées et nommées.
- Nouvelle arborescence : `js/shops/` (les 20 intérieurs, répartis en trois fichiers), `js/people/` (passants), `js/events/` (attaques et événements), `js/render/` (dessin du plateau), plus `names.js`, `sprites.js`, `feedback.js`, `input.js`.
- Noms explicites, une instruction par ligne, commentaires en français.
- Suppression du code inutilisé (anciens sols, champs jamais lus).
- `index.html` a désormais un squelette HTML standard (`<!doctype html>`, `<meta charset="utf-8">`, viewport) : les accents s'affichent correctement dans tous les navigateurs.
- Ajout de `CLAUDE.md` (règles pour la suite) et de `VERIFICATIONS.md` (vérifications manuelles dans le navigateur).

## v2.4 — Mise en dépôt git (3 novembre 2026)

- Le jeu, qui tenait dans une seule page, est découpé en fichiers : `index.html`, `css/styles.css` et onze fichiers dans `js/`.
- Ajout du README (arborescence, où régler quoi) et de ce journal.
- Aucun changement de règle ni d'affichage.

## v2.3 — Plus de clients, séances plus longues

- Les passants entrent beaucoup plus souvent dans les boutiques : au moins une fois sur deux, presque toujours pour les boutiques chères.
- Cinéma : 40 s d'attente avant la séance (au lieu de 15 s) et 25 s de film (au lieu de 20 s).

## v2.2 — Capacités et activités dans les boutiques

- Chaque boutique a un nombre de places. Complète, elle affiche « Complet » et personne n'entre.
- Café, pizzeria et burger : 3 tables de 2 places. Restaurant : 4 tables de 2.
- Bowling : 3 pistes. Le client vise, lance la boule, fait tomber les quilles, 3 lancers puis il repart.
- Cinéma : séances avec compte à rebours, film animé à l'écran, sortie de toute la salle à la fin.
- Piscine (nageurs et transats), manège (les clients tournent), arcade (bornes allumées quand on joue).
- Moins une boutique a de places, plus chaque client rapporte.
- Bâtiments et intérieurs sur toute la largeur de la case (fin des bandes de couleur sur les côtés).

## v2.1 — Noms sous les cartes

- Le nom de chaque boutique et malus s'affiche en petit sous sa carte.

## v2.0 — Cases rectangulaires identiques

- Nouvelle carte : 36 cases rectangulaires de même taille, chacune ouverte sur une rue.
- L'intérieur de la boutique s'oriente selon le côté de la porte.

## v1 — Bourg-les-Bonhommes (première page)

- Ville avec 4 routes, passants qui entrent et repartent.
- 20 boutiques vues de l'intérieur, mêmes cartes pour les deux joueurs.
- Niveaux, boucliers, météorite, voiture-voleur, monstre, OVNI, incendie.
