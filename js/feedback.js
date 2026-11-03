// Messages au joueur : journal de la ville (sous le plateau), bannière sur le plateau,
// et textes flottants au-dessus des boutiques (« +42 », « Bouclier ! »…).
(function () {
  'use strict';

  const FEEDBACK = Game.config.feedback;
  const logElement = document.getElementById('log');

  // Ajoute une ligne en haut du journal et l'affiche en bannière.
  function log(text) {
    Game.state.banner = { text, age: 0 };
    const item = document.createElement('li');
    item.textContent = text;
    logElement.prepend(item);
    while (logElement.children.length > FEEDBACK.LOG_MAX_ENTRIES) {
      logElement.lastChild.remove();
    }
  }

  function clearLog() {
    logElement.innerHTML = '<li>La ville se réveille.</li>';
  }

  // Texte qui monte et s'efface au-dessus d'une case.
  function floatText(lot, text, color) {
    Game.state.floatingTexts.push({ x: lot.x + lot.width / 2, y: lot.y, text, color, age: 0 });
  }

  // Vieillit textes et bannière (en temps réel : ils continuent pendant la pause).
  function update(realDt) {
    const state = Game.state;
    for (const floating of state.floatingTexts) {
      floating.age += realDt;
    }
    state.floatingTexts = state.floatingTexts.filter(floating => floating.age < FEEDBACK.FLOATING_TEXT_SECONDS);
    if (state.banner) {
      state.banner.age += realDt;
      if (state.banner.age > FEEDBACK.BANNER_SECONDS) {
        state.banner = null;
      }
    }
  }

  Game.feedback = { log, clearLog, floatText, update };
})();
