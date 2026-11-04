// Catalogue des cartes (identique pour les deux joueurs) et formules de gains et de coûts.
// Fichier de données : on peut changer ici le nom, le prix, la couleur ou l'icône d'une carte.
(function () {
  'use strict';

  const config = Game.config;

  // Les 24 boutiques, de la moins chère à la plus chère.
  // color : couleur de l'enseigne et des murs ; icon : voir js/icons.js.
  const SHOPS = [
    { id: 'fleuriste', name: 'Fleuriste', price: 60, color: '#e8578f', icon: 'flower' },
    { id: 'kiosque', name: 'Kiosque', price: 70, color: '#3d6fb6', icon: 'news' },
    { id: 'boulangerie', name: 'Boulangerie', price: 100, color: '#d48a2c', icon: 'croissant' },
    { id: 'cafe', name: 'Café', price: 110, color: '#8a5a36', icon: 'cup' },
    { id: 'glacier', name: 'Glacier', price: 120, color: '#f07fa8', icon: 'icecream' },
    { id: 'librairie', name: 'Librairie', price: 140, color: '#2f7d6d', icon: 'book' },
    { id: 'pharmacie', name: 'Pharmacie', price: 160, color: '#27a35a', icon: 'cross' },
    { id: 'pizzeria', name: 'Pizzeria', price: 180, color: '#c8402f', icon: 'pizza' },
    { id: 'jouets', name: 'Jouets', price: 200, color: '#f2a31f', icon: 'bear' },
    { id: 'coiffeur', name: 'Coiffeur', price: 210, color: '#6b4fb3', icon: 'scissors' },
    { id: 'burger', name: 'Burger', price: 240, color: '#e2552a', icon: 'burger' },
    { id: 'vetements', name: 'Vêtements', price: 270, color: '#2b8fbd', icon: 'shirt' },
    { id: 'billard', name: 'Billard', price: 280, color: '#2e7d4f', icon: 'eightball' },
    { id: 'arcade', name: 'Arcade', price: 300, color: '#8c3fd1', icon: 'joystick' },
    { id: 'restaurant', name: 'Restaurant', price: 330, color: '#7d2a3a', icon: 'cutlery' },
    { id: 'bowling', name: 'Bowling', price: 360, color: '#d6336c', icon: 'pin' },
    { id: 'lasergame', name: 'Laser game', price: 380, color: '#2bd1a0', icon: 'laser' },
    { id: 'cinema', name: 'Cinéma', price: 400, color: '#d22f3b', icon: 'reel' },
    { id: 'bijouterie', name: 'Bijouterie', price: 450, color: '#2aa7b8', icon: 'diamond' },
    { id: 'piscine', name: 'Piscine', price: 480, color: '#4fa8de', icon: 'pool' },
    { id: 'manege', name: 'Manège', price: 520, color: '#e9b92e', icon: 'carousel' },
    { id: 'hotel', name: 'Hôtel', price: 600, color: '#b08a2e', icon: 'H' },
    { id: 'casino', name: 'Casino', price: 700, color: '#1f8a4c', icon: 'dice' },
    { id: 'discotheque', name: 'Discothèque', price: 800, color: '#b83dd1', icon: 'discoball' },
  ];

  // Les 2 malus, qui se jouent sur une boutique adverse.
  const ACTIONS = [
    { id: 'meteorite', name: 'Météorite', price: 250, isAction: true },
    { id: 'voleur', name: 'Voiture-voleur', price: 300, isAction: true },
  ];

  // La banque : déjà sur la carte, sans propriétaire, ne s'achète pas (pas de carte).
  const BANK = { id: 'banque', name: 'Banque', price: 0, color: '#5b6b7a', icon: 'bank' };

  // Ordre des cartes dans les bacs : boutiques puis malus.
  const CARDS = [...SHOPS, ...ACTIONS];

  // Nombre de places d'une boutique (défini avec son mobilier, voir js/shops/).
  function capacityOf(shop) {
    return Game.interiors[shop.id].slots.length;
  }

  // Gain par client. Moins il y a de places, plus chaque client rapporte.
  function incomePerCustomer(lot) {
    const economy = config.economy;
    const levelBonus = 1 + economy.LEVEL_INCOME_BONUS * (lot.level - 1);
    const hotBonus = lot.isHot ? economy.HOT_LOT_MULTIPLIER : 1;
    return Math.round(lot.shop.price * economy.INCOME_RATE / Math.sqrt(capacityOf(lot.shop)) * levelBonus * hotBonus);
  }

  // Probabilité qu'un passant entre : augmente avec le prix et le niveau.
  function entryChance(lot) {
    const attraction = config.attraction;
    return Math.min(
      attraction.MAX,
      attraction.BASE + attraction.PRICE_WEIGHT * lot.shop.price / attraction.REFERENCE_PRICE + attraction.LEVEL_BONUS * (lot.level - 1)
    );
  }

  function upgradeCost(lot) {
    return Math.round(lot.shop.price * config.economy.UPGRADE_COST_RATE * lot.level);
  }

  function shieldCost(lot) {
    return Math.round(config.economy.SHIELD_BASE_COST + lot.shop.price * config.economy.SHIELD_PRICE_RATE);
  }

  Game.catalog = { SHOPS, ACTIONS, CARDS, BANK, capacityOf, incomePerCustomer, entryChance, upgradeCost, shieldCost };
})();
