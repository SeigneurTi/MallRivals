// Partie à distance : photo de la ville envoyée par l'hôte à son ami, plusieurs fois par seconde.
// L'hôte fait tourner toute la simulation ; l'ami ne fait qu'afficher la dernière photo reçue.
//
// La ville contient des références croisées (un passant connaît sa boutique, une boutique ses
// clients…). Dans la photo, elles deviennent des renvois : { $l: numéro de case },
// { $p: numéro de passant }, { $s: identifiant du catalogue }, { $set: [...] }, { $num: 'Infinity' }.
(function () {
  'use strict';

  // Champs de Game.state envoyés à l'ami (la sélection, le menu ouvert, le survol restent à chacun).
  const SHARED_FIELDS = ['lots', 'people', 'animations', 'floatingTexts', 'bucks', 'sales', 'banner', 'gameTime',
    'winner', 'victoryAge', 'isRunning', 'maxPopulation', 'speedMultiplier', 'round'];

  // Champs des passants qui ne servent qu'à la simulation : inutile de les envoyer à l'ami.
  const SIMULATION_ONLY_PERSON_FIELDS = new Set(['routeNodes', 'routePoints', 'visitedLots', 'distanceOnSegment', 'segmentIndex',
    'offsetX', 'offsetY', 'destinationLot', 'returnPoint', 'target', 'speed', 'walkSpeed', 'stayTimer']);

  // Champs des passants adoucis entre deux photos (sinon ils avanceraient par saccades).
  const SMOOTHED_PERSON_FIELDS = ['x', 'y', 'walkPhase', 'sitAmount', 'drawScale'];
  // Au-delà de cette distance, le passant saute directement (il vient d'entrer dans une boutique…).
  const MAX_SMOOTHED_JUMP = 60;

  function catalogEntries() {
    return Game.catalog.CARDS.concat([Game.catalog.BANK]);
  }

  // Arrondit à 2 décimales : la photo est bien plus légère et l'écart ne se voit pas.
  function roundNumber(value) {
    return Math.round(value * 100) / 100;
  }

  // Photo de la ville (texte JSON).
  function encode() {
    const state = Game.state;
    const lots = new Set(state.lots);
    const people = new Set(state.people);
    const catalogIds = new Map(catalogEntries().map(entry => [entry, entry.id]));
    const payload = {};
    for (const field of SHARED_FIELDS) {
      payload[field] = state[field];
    }
    return JSON.stringify(payload, function (key, value) {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? roundNumber(value) : { $num: String(value) };
      }
      if (!value || typeof value !== 'object') {
        return value;
      }
      if (people.has(this) && SIMULATION_ONLY_PERSON_FIELDS.has(key)) {
        return undefined;
      }
      // Les cases et les passants sont écrits en entier une seule fois, dans leur liste.
      if (lots.has(value) && this !== state.lots) {
        return { $l: value.index };
      }
      if (people.has(value) && this !== state.people) {
        return { $p: value.id };
      }
      if (catalogIds.has(value)) {
        return { $s: catalogIds.get(value) };
      }
      if (value instanceof Set) {
        return { $set: Array.from(value) };
      }
      return value;
    });
  }

  // Remplace les renvois par les vrais objets.
  function resolveReferences(data) {
    const peopleById = new Map(data.people.map(person => [person.id, person]));
    const catalogById = new Map(catalogEntries().map(entry => [entry.id, entry]));

    function resolve(value) {
      if (!value || typeof value !== 'object') {
        return value;
      }
      if (Array.isArray(value)) {
        for (let k = 0; k < value.length; k++) {
          value[k] = resolve(value[k]);
        }
        return value;
      }
      if ('$l' in value) {
        return data.lots[value.$l];
      }
      if ('$p' in value) {
        return peopleById.get(value.$p) || null;
      }
      if ('$s' in value) {
        return catalogById.get(value.$s);
      }
      if ('$set' in value) {
        return new Set(resolve(value.$set));
      }
      if ('$num' in value) {
        return Number(value.$num);
      }
      for (const key of Object.keys(value)) {
        value[key] = resolve(value[key]);
      }
      return value;
    }

    for (const field of SHARED_FIELDS) {
      data[field] = resolve(data[field]);
    }
  }

  // Ce qui se voit sur le fond de carte : s'il change, on le redessine.
  function boardSignature(lots) {
    return lots.map(lot => [lot.shop ? lot.shop.id : '', lot.owner, lot.level, lot.shields, lot.isHot, lot.isBank].join(',')).join(';');
  }

  // Chez l'ami : remplace la ville par la photo reçue.
  function apply(text) {
    const state = Game.state;
    const data = JSON.parse(text);
    resolveReferences(data);

    // Les passants repartent de l'endroit où ils sont affichés, et glissent jusqu'à leur nouvelle place.
    const previousPeople = new Map(state.people.map(person => [person.id, person]));
    for (const person of data.people) {
      const previous = previousPeople.get(person.id);
      person.smoothFrom = {};
      person.smoothTo = {};
      for (const field of SMOOTHED_PERSON_FIELDS) {
        person.smoothTo[field] = person[field];
        person.smoothFrom[field] = person[field];
        if (previous && typeof previous[field] === 'number') {
          person.smoothFrom[field] = previous[field];
        }
      }
      if (Math.hypot(person.x - person.smoothFrom.x, person.y - person.smoothFrom.y) > MAX_SMOOTHED_JUMP) {
        Object.assign(person.smoothFrom, person.smoothTo);
      }
    }

    // Les textes « Pas assez de bucks »… affichés seulement chez l'ami sont gardés.
    const localTexts = state.floatingTexts.filter(floating => floating.isLocal);
    const previousSignature = boardSignature(state.lots);
    const menuIndex = state.menuLot ? state.menuLot.index : null;
    const hoveredId = state.hoveredPerson ? state.hoveredPerson.id : null;
    const isNewRound = data.round !== state.round;

    for (const field of SHARED_FIELDS) {
      state[field] = data[field];
    }
    state.floatingTexts = state.floatingTexts.concat(localTexts);
    state.menuLot = menuIndex != null && state.lots[menuIndex].shop ? state.lots[menuIndex] : null;
    state.hoveredPerson = state.people.find(person => person.id === hoveredId) || null;
    if (isNewRound) {
      state.selection = null;
      state.menuLot = null;
    }
    if (state.winner != null) {
      state.selection = null;
      state.menuLot = null;
    }
    if (boardSignature(state.lots) !== previousSignature) {
      Game.board.draw();
    }
  }

  // Chez l'ami, à chaque image : progress va de 0 (photo précédente) à 1 (dernière photo).
  function smooth(progress) {
    const amount = Math.min(1, progress);
    for (const person of Game.state.people) {
      if (!person.smoothTo) {
        continue;
      }
      for (const field of SMOOTHED_PERSON_FIELDS) {
        const from = person.smoothFrom[field];
        const to = person.smoothTo[field];
        if (typeof from === 'number' && typeof to === 'number') {
          person[field] = from + (to - from) * amount;
        }
      }
    }
  }

  Game.snapshot = { encode, apply, smooth };
})();
