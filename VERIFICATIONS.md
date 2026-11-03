# Vérifications manuelles

À faire dans le navigateur après une modification, en ouvrant `index.html` par un double-clic. Astuce : le curseur **Vitesse** à ×3 accélère les attentes.

## Démarrage

- [ ] La page s'ouvre sans message d'erreur rouge sous le titre.
- [ ] Le plateau montre 4 routes qui sortent du cadre, 36 cases grises, quelques ronds roses et 4 boutiques déjà ouvertes (2 par joueur, contour orange ou bleu).
- [ ] Chaque bac affiche 22 cartes avec leur prix et leur nom en petit dessous, et « 1000 bucks » en bas.
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
- [ ] Les clients qui ressortent portent un petit sac jaune.

## Boutiques animées

- [ ] **Bowling** : 3 pistes ; le client vise, la boule remonte la piste, les quilles tombent, « Strike ! » ou « n quilles » s'affiche ; 3 lancers puis il repart.
- [ ] **Cinéma** : pastille verte « Séance dans 40 s » qui décompte ; puis pastille rouge « Film · 25 s », écran coloré animé et faisceau du projecteur ; personne n'entre pendant le film ; à la fin, toute la salle sort.
- [ ] **Piscine** : 3 nageurs font des longueurs (seule la tête dépasse), 2 clients sur les transats.
- [ ] **Manège** : le plateau tourne et les clients tournent avec lui.
- [ ] **Arcade** : l'écran d'une borne s'allume en couleurs quand un client y joue.

## Malus

- [ ] **Météorite** sur une boutique adverse sans bouclier : chute, explosion, boutique détruite, ses clients ressortent.
- [ ] **Météorite** sur une boutique adverse avec bouclier : « Bouclier ! », un écusson en moins, la boutique reste.
- [ ] Malus sur sa propre boutique : « Vise une boutique adverse », rien n'est payé.
- [ ] **Voiture-voleur** : la voiture part de la sortie Ouest (joueur 1) ou Est (joueur 2), roule jusqu'à la porte ; « Volé ! » (le contour change de couleur, les boucliers disparaissent) ou « Raté ! » (un bouclier en moins s'il y en avait).

## Événements aléatoires (laisser tourner à ×3)

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
