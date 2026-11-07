# Journal des modifications

Les versions les plus récentes sont en haut.

## v2.23 — Adapté au téléphone (8 novembre 2026)

- **Téléphone tenu en hauteur** : nouvelle disposition du plateau. La carte de la ville est en haut, sur toute la largeur ; les deux bacs sont côte à côte en dessous, avec des cartes deux fois plus grandes (4 colonnes) et l'argent de chaque joueur en haut de son bac. Le jeu choisit tout seul la disposition qui affiche le plateau le plus grand (aussi sur une tablette tenue en hauteur).
- **Téléphone tenu en largeur** : le plateau habituel prend toute la hauteur de l'écran, sans le titre.
- **Le plateau tient toujours en entier dans la fenêtre**, sur ordinateur aussi (sur une fenêtre basse, il rapetisse au lieu de dépasser).
- **Petits écrans** : le menu d'une boutique, les textes qui s'envolent, la bannière du journal, l'info-bulle d'un passant, le badge « Pause » et le panneau de victoire grossissent (jusqu'à ×2,2) pour rester lisibles et faciles à toucher.
- **Au doigt** :
  - on choisit une carte en touchant aussi son nom, sous la carte ;
  - l'info-bulle d'un passant touché reste affichée (elle disparaissait dès que le doigt se relevait) ;
  - loupe : faire glisser le doigt sur la carte la déplace (la page ne défile plus), elle s'affiche au-dessus du doigt pour ne pas être cachée ; un toucher bref joue toujours, un glissement ne joue rien ;
  - pas de menu « Enregistrer l'image » en laissant le doigt appuyé sur le plateau.
- Nouveau bouton **« Plein écran »** sous le plateau (caché sur iPhone, où le navigateur ne le permet pas).
- Sur téléphone, la loupe est au-dessus de la tablette, à droite du titre ; marges réduites.
- Fichiers : `js/layout.js` (nouveau : choix de la disposition), `js/canvas.js` (taille du plateau), `js/render/trays.js` (bacs dans les deux dispositions), `js/render/menu.js`, `js/render/overlay.js` (grossissement), `js/render/magnifier.js` et `js/input.js` (doigt, plein écran), `js/render/board.js`, `js/main.js`, `js/config.js` (`layout`, `magnifier`), `index.html`, `css/styles.css`, `README.md`, `VERIFICATIONS.md`.

## v2.22 — Mode contre un bot, trois niveaux (7 novembre 2026)

- **Contre un bot** : nouveau choix sur l'accueil. Tu joues Joueur 1 (bac de gauche), l'ordinateur joue Joueur 2, avec les mêmes cartes et les mêmes règles. Trois niveaux :
  - **Facile** : réfléchit toutes les 7 s environ, ne construit que de petites boutiques, n'améliore rien, ne se protège pas et n'attaque presque jamais ;
  - **Normal** : achète dès qu'il peut, améliore ses boutiques, met un bouclier, pille parfois la banque et attaque de temps en temps ;
  - **Difficile** : joue toutes les 1,5 s, construit la boutique la plus chère possible sur les cases animées, protège ses 3 meilleures boutiques quand tu peux lancer une météorite, améliore celle qui rapporte le plus, pille la banque dès qu'elle est pleine, et envoie des météorites sur tes boutiques chères (sans bouclier de préférence), surtout quand il est derrière.
- Sur 12 parties simulées contre le joueur de la partie auto : Facile gagne 1 fois, Normal 5 fois, Difficile 12 fois (et Difficile bat Normal 12 fois sur 12).
- Le bac du bot affiche « Bot (Difficile) » et le tien « Joueur 1 (toi) » ; on ne peut pas jouer les cartes du bot ni toucher à ses boutiques. Le journal et l'écran de victoire disent « Bot (…) ».
- L'accueil passe à quatre choix, en deux colonnes.
- **Correction** : pendant les soldes, un client dont la boutique était dans la rue de sa sortie d'arrivée, et qui devait repartir par la même sortie, faisait planter le jeu (trajet d'un seul point). Il repart maintenant par une autre sortie.
- Fichiers : `js/autoplay.js` (bot et ses trois niveaux, `isBot`, `nameOf`), `js/config.js` (`autoplay.SHOWCASE`, `autoplay.LEVELS`), `js/home.js`, `index.html`, `css/styles.css` (accueil), `js/state.js` (`botLevel`), `js/net/online.js` (`canControl`), `js/render/trays.js`, `js/render/overlay.js`, `js/render/menu.js`, `js/actions.js`, `js/events/attacks.js` (noms), `js/people/person.js` (correction des soldes), `README.md`, `VERIFICATIONS.md`.

## v2.21 — Vendeurs derrière leur comptoir, qui parlent aux clients (7 novembre 2026)

- **Derrière un comptoir**, le vendeur est maintenant debout et de face, et la façade du comptoir (à la couleur du comptoir de la boutique) passe devant lui : seules sa tête et ses épaules dépassent, ses mains sont posées sur le plateau. Avant, on voyait son buste de dos, posé sur le comptoir.
- **Interactions avec les clients** :
  - un client entre et paie : le vendeur le regarde, hoche la tête, tapote la caisse (une pièce d'or saute) et dit « Bonjour ! », « Bienvenue ! », « Merci ! » ou « Salut ! » dans une bulle ;
  - un client s'en va : il lui fait coucou de la main (« Au revoir ! », « À bientôt ! », « Bonne journée ! ») ;
  - le reste du temps, il respire, regarde le client le plus proche, et essuie son comptoir quand la boutique est vide.
- Les vendeurs debout (coiffeuse, serveur, gardien…) saluent et font coucou de la même façon.
- Fichiers : `js/shops/seller.js` (nouveau : dessin et réactions du vendeur), `js/shops/shop.js` (`lot.sellerAction`, ancien `drawSeller` retiré), `js/people/behaviour.js` (le vendeur réagit à l'entrée et au départ d'un client), `js/config.js` (`sellers`), `js/shops/interiors-*.js` (`counterColor`), `index.html`, `README.md`, `VERIFICATIONS.md`.

## v2.20 — Magasin de musique, rayons de la pharmacie, vendeurs (7 novembre 2026)

- **Magasin de musique** (370 $, entre Jouets et Coiffeur) : mur de guitares, piano à queue, batterie sur un tapis, ampli et comptoir. Un client s'assoit au piano et joue : des notes de musique s'envolent. Nouvelle icône (deux croches).
- **Pharmacie** : deux rayons de médicaments au milieu de la boutique, avec une pancarte verte ; les clients flânent dans les allées et contournent les rayons.
- **Vendeurs** pour le décor dans 21 boutiques : chemise à la couleur de la boutique et tablier blanc. Derrière un comptoir, on ne voit que leur buste (boulangerie, café, glacier, pizzeria, burger, pharmacie, bijouterie, fleuriste, kiosque, arcade, hôtel, casino, discothèque, musique) ; ailleurs, ils sont debout (coiffeuse près des fauteuils, serveur au restaurant, gardien de la galerie, forain du manège, vendeurs de la librairie, des jouets et des vêtements). Ils se tournent de temps en temps.
- Partie à distance : version des codes passée à 2 (le catalogue a changé).
- Fichiers : `js/shops/interiors-music.js` (nouveau), `js/catalog.js`, `js/icons.js`, `js/names.js`, `js/shops/interiors-shops.js` (pharmacie, vendeurs), `js/shops/interiors-food.js`, `js/shops/interiors-leisure.js`, `js/shops/interiors-gallery.js`, `js/shops/interiors-night.js` (vendeurs), `js/shops/shop.js` (`drawSeller`), `js/shops/furniture.js`, `js/people/draw.js` (tablier), `js/people/person.js`, `js/config.js`, `index.html`.

## v2.19 — Page d'accueil et partie à distance (7 novembre 2026)

- **Page d'accueil** : à l'ouverture, on choisit « Deux joueurs, un écran », « À distance » ou « Partie auto ». Le bouton « Accueil » sous le plateau y ramène.
- **Partie à distance** : chacun joue chez soi, dans son navigateur, sans serveur de jeu. L'hôte crée la partie et envoie son code d'invitation (SMS, Discord…) ; son ami le colle et renvoie un code réponse ; l'hôte le colle et la partie commence, en connexion directe entre les deux navigateurs (WebRTC).
  - L'hôte (Joueur 1) fait tourner la ville et envoie une photo compressée de la ville 10 fois par seconde (4 à 7 Ko) ; chez son ami (Joueur 2), les passants glissent d'une photo à l'autre.
  - L'ami envoie seulement ses ordres (construire, malus, améliorer, bouclier) ; l'hôte les vérifie avant de les exécuter.
  - Chacun ne peut toucher que son bac de cartes ; le menu d'une boutique adverse n'a que « Fermer ». Le bac du joueur affiche « (toi) ».
  - L'hôte règle la pause, la vitesse, les passants et « Recommencer » (grisés chez l'ami) ; pas de partie auto à distance. Le journal de l'hôte s'affiche aussi chez l'ami.
  - Si l'un quitte (« Accueil ») ou si la connexion se coupe, l'autre revient à l'accueil avec un message.
  - Les codes portent un numéro de version : deux versions différentes du jeu refusent de jouer ensemble. Un code mal collé ou inversé donne un message clair.
- Fichiers : `js/home.js` (accueil, échange des codes), `js/net/connection.js` (WebRTC, codes), `js/net/snapshot.js` (photo de la ville), `js/net/online.js` (rôles, messages), `js/actions.js` (ordres : `commandRefusal`, `perform`), `js/input.js`, `js/main.js`, `js/feedback.js`, `js/state.js` (`round`), `js/people/person.js` (`id`), `js/events/animations.js`, `js/render/menu.js`, `js/render/trays.js`, `js/render/overlay.js`, `js/config.js` (`net`), `index.html`, `css/styles.css`.

## v2.18 — Victoire à 20 000 $, coup de pouce au joueur qui perd (6 novembre 2026)

- **Victoire** : le premier joueur qui atteint 20 000 $ gagne. La ville s'arrête et un panneau annonce le gagnant, la durée de la partie et l'argent des deux joueurs ; « Recommencer » relance une partie. En partie auto, une nouvelle partie commence toute seule 10 s plus tard. L'objectif est rappelé sous l'argent de chaque joueur.
- **Coup de pouce** : si la fortune d'un joueur (son argent plus le prix de ses boutiques) tombe sous la moitié de celle de l'autre, chacun de ses clients rapporte 50 % de plus. Un badge vert « Coup de pouce +50 % » s'affiche en haut de son bac ; il disparaît dès qu'il remonte.
- **Gains par client divisés par 5** (`INCOME_RATE` 0,5 → 0,1) : avant, l'argent s'emballait (des centaines de milliers de dollars en 10 minutes). En partie auto, une partie dure maintenant 14 à 17 minutes. Le butin de la banque, les malus et les courses des extraterrestres pèsent donc plus lourd qu'avant.
- Fichiers : `js/config.js` (`catchUp`, `victory`, `economy.INCOME_RATE`), `js/catalog.js` (`wealthOf`, `hasCatchUpBonus`), `js/state.js` (`checkVictory`), `js/main.js` (fin de partie, relance auto), `js/render/overlay.js` (panneau de victoire), `js/render/trays.js` (badge, objectif), `js/input.js` (clics ignorés après la victoire), `index.html` (règles).

## v2.17 — Pas plus de 2 fois la même boutique par joueur (6 novembre 2026)

- Un joueur ne peut pas construire plus de 2 fois la même boutique. Une pastille « 1/2 » ou « 2/2 » sur la carte indique combien il en possède ; à 2/2, la carte est grisée, les cases libres ne sont plus proposées et un clic affiche « Déjà 2 fois ! ». Une boutique volée à la voiture-voleur peut faire dépasser cette limite (la règle porte sur la construction).
- La partie auto respecte la même règle.
- Fichiers : `js/config.js` (`economy.MAX_SAME_SHOP_PER_PLAYER`), `js/actions.js` (`ownedCount`, `canBuild`), `js/input.js`, `js/render/trays.js` (pastille), `js/autoplay.js`, `index.html` (règle).

## v2.16 — Prix plus espacés, clients mieux répartis (6 novembre 2026)

- **Prix plus espacés** : de 60 $ (fleuriste) à 1800 $ (discothèque), au lieu de 60 à 800 $. L'écart grandit d'une boutique à la suivante (fleuriste 60, kiosque 70, boulangerie 100, café 120, glacier 160, librairie 200… casino 1650, discothèque 1800). Les gains, les améliorations et les boucliers suivent les prix. Avec les 140 $ du départ, on peut toujours ouvrir une boulangerie ou un café, ou deux fleuristes ou deux kiosques.
- **Clients mieux répartis** : avant, certaines rues étaient bien plus passantes que d'autres, et une boutique pouvait recevoir 4 fois moins de clients qu'une autre selon sa case. Désormais, chaque nouveau passant vient en ville pour une boutique tirée au hasard parmi celles qui sont ouvertes (les plus attirantes un peu plus souvent) : il y entre s'il reste de la place, et peut s'arrêter dans d'autres en chemin. En début de partie, avec une boutique chacun, l'écart de gains entre les deux joueurs passe d'environ ×2 à ×1,4.
- Fichiers : `js/catalog.js` (prix), `js/config.js` (`attraction.REFERENCE_PRICE`, `people.ROUTE_LOT_COUNT`), `js/people/person.js` (boutique visée, trajet), `js/people/behaviour.js` (entrée dans la boutique visée).

## v2.15 — Carte en moulinet, événements plus tardifs (6 novembre 2026)

- **Carte en moulinet**, d'après le plan du City Bucks d'origine : un carré de rues dont chaque côté se prolonge hors de la carte par un coin (le haut vers la droite, la droite vers le bas, le bas vers la gauche, la gauche vers le haut). Les passants arrivent par ces 4 routes, aux coins.
- Les boutiques bordent tout le tour de la carte, côté extérieur du carré (20 cases, y compris le long des prolongements). À l'intérieur : une rangée le long du haut et du bas du carré, et une rue centrale bordée de 4 boutiques dont la banque. 32 cases en tout.
- Deux parcs arborés de part et d'autre de la rue centrale ; le compte à rebours des soldes est au milieu du parc de gauche.
- **Événements aléatoires plus tardifs** : aucun incendie, monstre ni OVNI pendant les 6 premières minutes de jeu, le temps de construire ses premières boutiques. « Recommencer » remet aussi ce délai à zéro.
- Fichiers : `js/map.js` (plan), `js/render/board.js` (parcs), `js/render/overlay.js` (place du compte à rebours), `js/people/person.js` (clients des soldes sur les prolongements), `js/events/attacks.js` (trajet de la voiture-voleur), `js/events/random-events.js` et `js/config.js` (délai des événements, place de la banque), `js/state.js` (temps de jeu remis à zéro).

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
