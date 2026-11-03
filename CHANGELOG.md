# Journal des modifications

Les versions les plus récentes sont en haut.

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
