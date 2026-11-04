# Vérifications manuelles

À faire dans le navigateur après une modification, en ouvrant `index.html` par un double-clic. Astuce : le curseur **Vitesse** à ×3 accélère les attentes.

## Démarrage

- [ ] La page s'ouvre sans message d'erreur rouge sous le titre.
- [ ] Le plateau montre 4 routes qui sortent du cadre, 36 cases grises, quelques ronds roses 4 boutiques déjà ouvertes (2 par joueur, contour orange ou bleu) et la banque au centre.
- [ ] Chaque bac affiche 26 cartes avec leur prix et leur nom en petit dessous, et « 1000 bucks » en bas.
- [ ] Les accents s'affichent correctement (« Météorite », « Hôtel », « Manège »).
- [ ] Des passants arrivent par les 4 routes et se promènent.

## Construire, améliorer, protéger

- [ ] Toucher une carte boutique : elle s'entoure, son nom s'affiche en haut du bac et les cases libres clignotent en pointillés.
- [ ] Toucher à nouveau la carte : elle se désélectionne.
- [ ] Choisir une carte puis une case libre : la boutique apparaît, l'argent baisse du prix, le journal indique « Joueur 1 ouvre … ».
- [ ] Choisir une carte trop chère (cartes grisées) puis une case : « Pas assez de bucks ».
- [ ] Toucher une de ses boutiques : un menu s'ouvre (nom, propriétaire, niveau, places, gain par client).
- [ ] « Améliorer » : la boutique passe niveau 2, un badge ★2 apparaît, « Niveau 2 » flotte au-dessus. Au niveau 3, la ligne devient « Niveau max atteint ».
- [ ] « Bouclier » : un écusson bleu apparaît (jusqu'à 3, puis « Boucliers au max »).
- [ ] Sans assez d'argent, la ligne est grisée ; la toucher affiche « Pas assez de bucks » et le menu reste ouvert.
- [ ] « Fermer », ou un clic hors du menu, le ferme.

## Clients et places

- [ ] Des passants entrent dans les boutiques ; à chaque entrée, « +gain » flotte dans la couleur du propriétaire et son argent augmente.
- [ ] Une case rose rapporte le double (comparer le « $/client » du menu avec la même boutique sur une case normale).
- [ ] Quand toutes les places sont prises, la pastille rouge « Complet » s'affiche et personne n'entre.
- [ ] Café, pizzeria, burger : 6 clients assis (3 tables de 2). Restaurant : 8 clients (4 tables de 2).
- [ ] Au café, les 3 tables ne sont pas alignées et les chaises sont placées à des angles différents.
- [ ] Une fois à sa place, le client s'assoit (corps plus bas, jambes vers l'avant) et regarde sa table ; il se relève en repartant. Même chose au cinéma, chez le coiffeur et sur les transats.
- [ ] Parmi les passants, environ une fille sur deux (cheveux longs ou queue de cheval, jupe) ; l'info-bulle donne un prénom qui correspond.
- [ ] Les clients qui ressortent portent un petit sac jaune.

## Boutiques animées

- [ ] **Bowling** : 3 pistes ; les quilles forment un triangle dont la pointe est tournée vers le lanceur. Le client vise, la boule remonte la piste et, en touchant la quille de tête, les quilles basculent l'une après l'autre ; « Strike ! » ou « n quilles, m debout » s'affiche, et il reste exactement m quilles debout une fois les quilles tombées balayées ; 3 lancers puis il repart.
- [ ] **Cinéma** : pastille verte « Séance dans 40 s » qui décompte ; puis pastille rouge « Film · 25 s », écran coloré animé et faisceau du projecteur ; personne n'entre pendant le film ; à la fin, toute la salle sort.
- [ ] **Piscine** : 3 nageurs font des longueurs (seule la tête dépasse), 2 clients sur les transats.
- [ ] **Manège** : le plateau tourne et les clients tournent avec lui.
- [ ] **Arcade** : 5 bornes en colonne contre le mur de gauche ; l'écran d'une borne s'allume en couleurs quand un client y joue ; à droite, machine à pince, flippers et comptoir à lots.
- [ ] **Cinéma** : les spectateurs regardent l'écran (vus de dos si l'écran est en haut de la case, de face s'il est en bas).
- [ ] **Casino** (700 $) : les machines à sous font défiler des symboles et clignotent quand on y joue ; la roulette tourne ; 4 joueurs assis autour de la table.
- [ ] **Discothèque** (800 $) : dalles de couleur, boule à facettes, spots qui tournent, salle plus sombre ; les clients dansent bras levés.

## Malus

- [ ] **Météorite** sur une boutique adverse sans bouclier : chute, explosion, boutique détruite, ses clients ressortent.
- [ ] **Météorite** sur une boutique adverse avec bouclier : « Bouclier ! », un écusson en moins, la boutique reste.
- [ ] Malus sur sa propre boutique : « Vise une boutique adverse », rien n'est payé.
- [ ] **Voiture-voleur** : la voiture part de la sortie Ouest (joueur 1) ou Est (joueur 2), roule jusqu'à la porte ; « Volé ! » (le contour change de couleur, les boucliers disparaissent) ou « Raté ! » (un bouclier en moins s'il y en avait).

## Banque

- [ ] La banque est au centre de la carte dès le départ, sans contour de couleur, avec « Coffre plein » et 10 lingots.
- [ ] Voiture-voleur sur la banque pleine : +600 $ pour le joueur, le coffre se vide (« Or 0 % »), puis les lingots reviennent un à un.
- [ ] Tant que le coffre n'est pas plein : la banque n'est pas proposée comme cible, et la viser affiche « Coffre vide ».
- [ ] Météorite sur la banque : « La banque est trop solide ! », rien n'est payé.
- [ ] Toucher la banque : le menu indique le temps restant avant que le coffre soit plein (2 minutes en tout).

## Fleuriste, glacier, laser game

- [ ] Fleuriste plein de fleurs (étagère, seaux, jardinières, table, comptoir) ; les clients repartent avec une fleur à la main et la gardent dans la rue.
- [ ] Glacier : les clients repartent avec un cornet de 1 à 3 boules de couleurs différentes.
- [ ] Laser game : « Partie dans 30 s » pendant que les joueurs se placent dans leur base (rouge à gauche, bleue à droite) ; puis « Partie · 25 s », salle sombre, personne n'entre, les joueurs courent et tirent des lasers ; le gilet du joueur touché clignote en blanc ; à la fin, l'équipe gagnante s'affiche et tout le monde sort.

## Billard

- [ ] 2 tables ; un client à chaque bout. À deux, ils jouent chacun leur tour.
- [ ] Le tireur marche avec sa queue jusque derrière la blanche, dans l'axe du coup ; la queue va de ses mains à la bille, recule, puis la blanche part. L'autre joueur attend, queue debout à la main.
- [ ] Personne ne marche sur les tables : en entrant, en sortant ou pour aller tirer, les joueurs passent autour.
- [ ] Quand toutes les billes sont rentrées : « Partie gagnée ! » et les billes sont remises en triangle.

## Galerie d'art

- [ ] Carte « Galerie d'art » (420 $) ; 6 places. 4 tableaux au fond derrière un cordon rouge (dont un écran d'art vidéo aux couleurs qui défilent), 2 tableaux sur chaque mur de côté, un mobile qui tourne sur un socle au centre, un accueil.
- [ ] Les visiteurs vont d'un tableau à l'autre (jamais deux devant le même), regardent chacun quelques secondes, contournent le socle ; devant le mur du fond, on les voit de dos.

## Loupe

- [ ] Bouton rond à loupe sur le bord droit de la tablette : un clic l'allume (orange). En survolant le plateau, un rond montre la zone sous le curseur grossie ×3 ; autour, la carte reste normale.
- [ ] Les clics passent à travers la loupe (on peut construire en loupe) ; un nouveau clic sur le bouton l'éteint ; la loupe disparaît quand le curseur quitte le plateau.

## Partie auto

- [ ] Bouton « Partie auto » : il s'enfonce (« Partie auto ✓ ») et les deux joueurs construisent, améliorent et protègent tout seuls ; au bout de quelques minutes, la ville est pleine et toutes les boutiques sont présentes.
- [ ] Le rejouer l'arrête ; Pause met aussi la partie auto en pause.

## Événements aléatoires (laisser tourner à ×3, ils sont rares : environ un toutes les 4 minutes)

- [ ] **Monstre** : il traverse la carte et fait perdre un bouclier, sinon un niveau (« Niveau −1 »), sinon détruit la boutique ; puis il repart.
- [ ] **OVNI** : il arrive, éclaire la boutique de son rayon vert, puis l'emporte, est repoussé par un bouclier, ou fait des courses (« +gain » vert).
- [ ] **Incendie** (rare) : flammes, puis « Éteint ! » ou la boutique brûle.
- [ ] Chaque événement s'inscrit dans le journal et dans la bannière en bas du plateau.

## Commandes

- [ ] Survoler un passant (ou le toucher) : anneau orange et info-bulle « Prénom · de Nord vers Est », ou « Prénom · Boutique » s'il est dans une boutique.
- [ ] Curseur **Passants** : la foule grossit ou diminue progressivement.
- [ ] Curseur **Vitesse** : tout va plus ou moins vite.
- [ ] **Pause** : tout s'arrête, badge « Pause » sur le plateau, le bouton devient « Lecture ».
- [ ] **Recommencer** : nouvelle partie, 1000 bucks chacun, journal remis à « La ville se réveille. ».
- [ ] Redimensionner la fenêtre (ou tourner la tablette) : le plateau s'adapte sans se déformer.
