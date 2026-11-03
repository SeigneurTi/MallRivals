// Noms des boutiques dans les phrases du journal, avec le bon article :
// « le Cinéma », « au Cinéma », « du Cinéma », « le magasin de jouets »…
(function () {
  'use strict';

  const ARTICLES = {
    fleuriste: 'le ',
    kiosque: 'le ',
    boulangerie: 'la ',
    cafe: 'le ',
    glacier: 'le ',
    librairie: 'la ',
    pharmacie: 'la ',
    pizzeria: 'la ',
    jouets: 'le magasin de ',
    coiffeur: 'le ',
    burger: 'le ',
    vetements: 'la boutique de ',
    arcade: "l'",
    restaurant: 'le ',
    bowling: 'le ',
    cinema: 'le ',
    bijouterie: 'la ',
    piscine: 'la ',
    manege: 'le ',
    hotel: "l'",
  };

  // « le Cinéma », « la boutique de vêtements ».
  function shopName(lot) {
    const article = ARTICLES[lot.shop.id];
    // Après « magasin de » ou « boutique de », le nom passe en minuscules.
    const name = article.endsWith('de ') ? lot.shop.name.toLowerCase() : lot.shop.name;
    return article + name;
  }

  // « au Cinéma », « à la Pizzeria », « à l'Hôtel ».
  function shopNameAfterA(lot) {
    return shopName(lot)
      .replace(/^le /, 'au ')
      .replace(/^la /, 'à la ')
      .replace(/^l'/, "à l'");
  }

  // « du Cinéma », « de la Pizzeria », « de l'Hôtel ».
  function shopNameAfterDe(lot) {
    return shopName(lot)
      .replace(/^le /, 'du ')
      .replace(/^la /, 'de la ')
      .replace(/^l'/, "de l'");
  }

  Game.names = { shopName, shopNameAfterA, shopNameAfterDe };

  // --- Alias temporaires pour le code pas encore refactorisé (retirés à la fin) ---
  window.nom = shopName;
  window.aNom = shopNameAfterA;
  window.deNom = shopNameAfterDe;
})();
