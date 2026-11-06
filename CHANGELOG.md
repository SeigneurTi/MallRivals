# Journal des modifications

Les versions les plus récentes sont en haut.

## v2.14 — Nouvelle carte, soldes, boucliers faillibles, départ modeste (6 novembre 2026)

- **Nouvelle carte** : une rue fait le tour de la ville et une croix la traverse en son centre. Les passants arrivent par 4 routes (nord, sud, est, ouest). Les boutiques bordent tout le tour de la carte, sauf là où passent ces 4 routes, et occupent les 4 quartiers du centre : 28 cases (au lieu de 36), la banque juste au-dessus du carrefour central. Pelouses et arbres dans les coins et entre les rangées.
- Sur les côtés gauche et droit de la carte, les boutiques sont tournées d'un quart de tour, porte vers la rue : le mobilier, les places et les clients suivent.
- **Soldes** : un compte à rebours de 2 minutes est affiché dans le coin en haut à gauche. À zéro, des clients arrivent en courant par les 4 routes et se ruent dans 4 boutiques tirées au hasard (pastille rose « Soldes −50 % »). Chacun rapporte deux fois moins qu'un client normal. Puis le compte à rebours repart.
- **Boucliers** : même avec un bouclier, il reste 20 % de chances que la boutique soit détruite (météorite, monstre, OVNI : « Bouclier percé ! » ; incendie : 20 % de chances de brûler au lieu de 15 %).
- **Départ modeste** : 140 $ chacun (au lieu de 1000), de quoi ouvrir une boulangerie ou un café, ou deux fleuristes ou kiosques, et aucune boutique déjà ouverte.
- **Affluence** : peu de passants au début (8), puis 4 de plus par boutique ouverte. Le curseur devient « Passants max » (120 par défaut).
- **Jauge d'argent** : derrière les cartes, une jauge à la couleur du joueur descend depuis le haut jusqu'à la dernière boutique qu'il peut s'offrir (avec 200 $ : jusqu'à la carte Jouets). Elle monte et descend en douceur quand l'argent change.
- Fichiers : `js/map.js` (carte), `js/shops/geometry.js` (boutiques tournées), `js/shops/shop.js` (porte, enseigne, badges, pastille « Soldes »), `js/events/sales.js` (nouveau : soldes), `js/events/attacks.js` et `js/events/random-events.js` (boucliers), `js/people/person.js` et `js/people/behaviour.js` (affluence, clients des soldes), `js/render/trays.js` (jauge), `js/render/overlay.js` (compte à rebours), `js/render/board.js` (pelouses), `js/state.js`, `js/main.js`, `js/input.js`, `js/people/activities.js`, `js/config.js`, `index.html` (curseur et règles).

## v2.13 — Loupe nette, bijouterie, piscine avec vestiaire et jacuzzi (5 novembre 2026)

- **Loupe nette** : au lieu d'agrandir les pixels de l'écran, la scène est redessinée trois fois plus grande dans le rond (textes, passants et mobilier restent nets). Seules les cases sous la loupe sont redessinées.
- **Bijouterie refaite** : comptoir vitré au fond (bagues, colliers, montres), vitrines murales (perles, bracelets), deux îlots vitrés, un gros diamant sous cloche sur un tapis rouge, caisse et miroir. Les pierres scintillent. Les clients repartent avec un petit écrin enrubanné. Toujours 4 places.
- **Piscine refaite** : bassin de 3 couloirs, jacuzzi à bulles, vestiaire à 2 cabines, 2 transats sous un parasol. En entrant, le client va au vestiaire ; il disparaît 3 s dans une cabine (rideau fermé, on voit ses pieds), en ressort en maillot de bain (maillot une pièce ou short de bain), puis va nager, se baigner dans le jacuzzi ou s'allonger sur un transat. Avant de partir, il repasse par une cabine pour se rhabiller.
- La piscine passe de 5 à 8 places (3 nageurs, 3 au jacuzzi, 2 transats) : un peu moins de gain par client, mais plus de clients.
- Fichiers : `js/render/magnifier.js`, `js/render/board.js`, `js/main.js` (loupe) ; `js/shops/interiors-shops.js` (bijouterie) ; `js/shops/interiors-leisure.js`, `js/people/behaviour.js`, `js/people/activities.js`, `js/people/person.js`, `js/people/draw.js`, `js/config.js` (piscine, écrin).

## v2.12 — Galerie d'art, bowling corrigé, loupe (4 novembre 2026)

- **Galerie d'art** (420 $, 6 places) : 4 tableaux au mur du fond derrière un cordon rouge (paysage, aplats de couleurs, portrait, écran d'art vidéo animé), 2 tableaux sur chaque mur de côté, un mobile qui tourne sur un socle au centre, un accueil. Les visiteurs passent d'un tableau libre à l'autre, regardent chacun 2,5 à 4,5 s et contournent le socle ; devant le mur du fond, on les voit de dos.
- **Bowling** : les quilles sont dans le bon sens (pointe du triangle vers le lanceur). Quand la boule touche la quille de tête, les quilles basculent en cascade, restent couchées un instant puis sont balayées. Le visuel correspond à l'annonce : « 7 quilles, 3 debout » laisse exactement 3 quilles debout (la quille de tête tombe toujours, celles du fond et des bords résistent plus souvent).
- **Loupe** : un bouton rond sur le bord droit de la tablette. Allumée, elle montre un rond grossi ×3 qui suit le curseur ; le reste de la carte garde sa taille, et les clics passent à travers.
- Fichiers : nouveaux `js/shops/interiors-gallery.js`, `js/render/magnifier.js` ; modifiés `js/shops/interiors-leisure.js`, `js/shops/shop.js`, `js/people/activities.js`, `js/people/draw.js`, `js/catalog.js`, `js/names.js`, `js/icons.js`, `js/config.js`, `js/main.js`, `index.html`, `css/styles.css`.

## v2.11 — Arcade : bornes en colonne (4 novembre 2026)

- Les 5 bornes d'arcade sont rangées en colonne contre le mur de gauche ; chaque joueur se tient à droite de la sienne, tourné vers l'écran, qui s'allume quand il joue. Toujours 5 places.
- Nouveau décor à droite : machine à pince remplie de peluches (la pince se balade), deux flippers aux champignons clignotants, comptoir à lots.
- Fichier : `js/shops/interiors-leisure.js`.

## v2.10 — Billard : on contourne les tables (4 novembre 2026)

- Les clients du billard ne marchent plus sur les tables : en entrant, en sortant, pour aller tirer ou revenir à leur place, ils passent autour (par les coins des tables).
- Le tireur se place toujours à un endroit libre : ses pieds restent hors des tables, et si un coup ne peut pas se jouer depuis un endroit libre (par exemple coincé entre les deux tables), il vise une autre bille.
- Les autres boutiques ne changent pas (vérifié sur les parties de test).
- Fichiers : nouveau `js/people/pathing.js` (trajets qui contournent les obstacles) ; modifiés `js/shops/interiors-night.js`, `js/people/behaviour.js`, `js/people/activities.js`, `index.html`.

## v2.9 — Fleuriste, souvenirs, laser game, billard corrigé (4 novembre 2026)

- **Fleuriste** réaménagé : étagère de 8 pots fleuris, seaux de bouquets, jardinières suspendues, table de présentation, comptoir avec bouquet emballé, pétales au sol. Toujours 4 places.
- **Souvenirs** : les clients du fleuriste repartent avec une fleur, ceux du glacier avec un cornet de 1 à 3 boules de couleurs différentes ; ils les gardent jusqu'à la sortie de la ville. Ailleurs, toujours le sac jaune.
- **Laser game** (380 $, 10 joueurs) : comme au cinéma, 30 s pour entrer et s'équiper (équipe rouge à gauche, bleue à droite), puis 25 s de partie dans le noir pendant lesquelles personne n'entre. Les joueurs courent entre les obstacles fluo et se tirent dessus au fusil laser ; le gilet du joueur touché clignote. À la fin : « Équipe rouge gagne ! », « Équipe bleue gagne ! » ou « Égalité ! ».
- **Billard corrigé** : le joueur dont c'est le tour marche avec sa queue jusqu'au point de tir, derrière la blanche et dans l'axe du coup ; la queue va de ses mains à la bille et le coup ne part qu'une fois en place. L'autre joueur attend, queue debout à la main.
- Code : les séances (cinéma, laser game) sont un mécanisme commun (`session` dans l'intérieur) ; un intérieur peut donner un souvenir (`souvenir`).
- Fichiers : nouveau `js/shops/interiors-lasergame.js` ; modifiés `js/shops/shop.js`, `js/shops/interiors-shops.js`, `js/shops/interiors-food.js`, `js/shops/interiors-leisure.js`, `js/shops/interiors-night.js`, `js/shops/geometry.js`, `js/people/activities.js`, `js/people/behaviour.js`, `js/people/draw.js`, `js/people/person.js`, `js/catalog.js`, `js/names.js`, `js/icons.js`, `js/config.js`, `index.html`.

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
