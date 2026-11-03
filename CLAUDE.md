# Règles pour faire évoluer Bourg-les-Bonhommes 2

## Contraintes du projet

- JavaScript et CSS natifs, **sans dépendance** ni outil de compilation.
- Le jeu doit toujours **s'ouvrir en double-cliquant sur `index.html`**. Pas de modules ES (`import`/`export`) : ils ne fonctionnent pas en `file://`. On garde des scripts classiques, chacun rangé dans l'objet global `Game` (voir README.md, « Organisation du code »).
- Toute valeur d'équilibrage (prix mis à part, qui sont dans `js/catalog.js`) va dans `js/config.js`, avec un nom explicite.
- Noms explicites en anglais, une instruction par ligne, commentaires courts en français.

## À chaque modification

1. **Ajouter une entrée dans `CHANGELOG.md`**, en haut, avec le numéro de version et la date.
2. **Faire un commit par version**, avec un message en français.
3. Mettre à jour `README.md` si l'arborescence ou « Où régler quoi » change, et `VERIFICATIONS.md` si une fonctionnalité est ajoutée ou modifiée.

## Dans chaque réponse

Expliquer **ce qui a changé et dans quels fichiers**.
