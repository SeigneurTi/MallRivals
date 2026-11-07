// Messages au joueur : journal de la ville (sous le plateau), bannière sur le plateau,
// et textes flottants au-dessus des boutiques (« +42 », « Bouclier ! »…).
(function () {
  'use strict';

  const FEEDBACK = Game.config.feedback;
  const logElement = document.getElementById('log');
  const logListeners = [];       // prévenus à chaque message, avec null quand le journal est vidé
                                 // (partie à distance : l'hôte les envoie à son ami)

  // Ajoute une ligne en haut du journal et l'affiche en bannière.
  function log(text) {
    Game.state.banner = { text, age: 0 };
    const item = document.createElement('li');
    item.textContent = text;
    logElement.prepend(item);
    while (logElement.children.length > FEEDBACK.LOG_MAX_ENTRIES) {
      logElement.lastChild.remove();
    }
    for (const listener of logListeners) {
      listener(text);
    }
  }

  function addLogListener(listener) {
    logListeners.push(listener);
  }

  function clearLog() {
    logElement.innerHTML = '<li>La ville se réveille.</li>';
    for (const listener of logListeners) {
      listener(null);
    }
  }

  // Texte qui monte et s'efface au-dessus d'une case.
  // Chez l'ami d'une partie à distance, il est gardé quand une nouvelle photo de la ville arrive.
  function floatText(lot, text, color) {
    const isLocal = Boolean(Game.online && Game.online.isGuest());
    Game.state.floatingTexts.push({ x: lot.x + lot.width / 2, y: lot.y, text, color, age: 0, isLocal });
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

  Game.feedback = { log, addLogListener, clearLog, floatText, update };
})();
