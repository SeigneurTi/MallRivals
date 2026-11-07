// Partie à distance : rôle de chaque navigateur et messages échangés.
//
//   mode 'local'  les deux joueurs sur le même écran (ou partie auto)
//   mode 'host'   hôte : Joueur 1. Sa ville est la vraie : il fait tourner la simulation,
//                 envoie une photo de la ville plusieurs fois par seconde et exécute les ordres de son ami.
//   mode 'guest'  ami : Joueur 2. Il affiche les photos reçues et envoie ses ordres à l'hôte.
//
// Messages : les photos voyagent compressées (octets) ; le reste en texte JSON :
//   { type: 'command', command }        ami → hôte : un ordre (voir Game.actions.perform)
//   { type: 'refused', lotIndex, text } hôte → ami : l'ordre n'a pas pu être exécuté
//   { type: 'log', text }               hôte → ami : nouveau message du journal (text null : journal vidé)
//   { type: 'bye' }                     l'un ou l'autre : je quitte la partie
// Si les photos arrivent plus vite qu'on ne les traite, seule la plus récente compte.
(function () {
  'use strict';

  const NET = Game.config.net;
  const HOST_PLAYER = 0;
  const GUEST_PLAYER = 1;

  let mode = 'local';
  let snapshotTimer = 0;         // hôte : temps avant la prochaine photo
  let secondsSinceSnapshot = 0;  // ami : temps depuis la dernière photo (pour adoucir les mouvements)
  let hasSnapshot = false;       // ami : une première photo est arrivée
  let listeners = { connected: null, disconnected: null };

  function isOnline() {
    return mode !== 'local';
  }

  function isHost() {
    return mode === 'host';
  }

  function isGuest() {
    return mode === 'guest';
  }

  // Joueur de ce navigateur, ou null si les deux joueurs sont sur cet écran.
  function myPlayer() {
    if (mode === 'host') {
      return HOST_PLAYER;
    }
    return mode === 'guest' ? GUEST_PLAYER : null;
  }

  // Ce navigateur peut-il jouer pour ce joueur ?
  function canControl(player) {
    return mode === 'local' || player === myPlayer();
  }

  // ---------- Ordres ----------

  // Donne un ordre pour ce joueur. Renvoie le message de refus, ou null s'il est parti.
  // Chez l'ami, l'ordre est vérifié sur la dernière photo puis envoyé à l'hôte, qui le revérifie.
  function submit(player, command) {
    if (mode !== 'guest') {
      return Game.actions.perform(player, command);
    }
    const refusal = Game.actions.commandRefusal(player, command);
    if (!refusal) {
      Game.connection.send(JSON.stringify({ type: 'command', command }));
    }
    return refusal;
  }

  // ---------- Messages reçus ----------

  function onMessage(data) {
    if (typeof data !== 'string') {
      receiveSnapshot(data);
      return;
    }
    let message;
    try {
      message = JSON.parse(data);
    } catch (error) {
      return;
    }
    if (mode === 'host' && message.type === 'command' && message.command) {
      const refusal = Game.actions.perform(GUEST_PLAYER, message.command);
      if (refusal) {
        Game.connection.send(JSON.stringify({ type: 'refused', lotIndex: message.command.lotIndex, text: refusal }));
      }
    } else if (message.type === 'bye') {
      endConnection('Ton ami a quitté la partie.');
    } else if (mode === 'guest' && message.type === 'log') {
      if (message.text === null) {
        Game.feedback.clearLog();
      } else {
        Game.feedback.log(message.text);
      }
    } else if (mode === 'guest' && message.type === 'refused') {
      const lot = Game.state.lots[message.lotIndex];
      if (lot) {
        Game.feedback.floatText(lot, message.text, '#c0392b');
      }
    }
  }

  // Traite les éléments un par un ; s'il en arrive pendant un traitement, seul le dernier est gardé.
  function latestOnly(process) {
    let isBusy = false;
    let next = null;
    async function run() {
      isBusy = true;
      while (next !== null) {
        const item = next;
        next = null;
        try {
          await process(item);
        } catch (error) {
          showError(error);
        }
      }
      isBusy = false;
    }
    return item => {
      next = item;
      if (!isBusy) {
        run();
      }
    };
  }

  // Ami : décompresse puis affiche la photo.
  const receiveSnapshot = latestOnly(async bytes => {
    const text = Game.connection.canCompress ? await Game.connection.decompress(bytes) : new TextDecoder().decode(bytes);
    if (mode !== 'guest') {
      return;
    }
    Game.snapshot.apply(text);
    secondsSinceSnapshot = 0;
    hasSnapshot = true;
  });

  // Hôte : compresse puis envoie la photo.
  const sendSnapshotText = latestOnly(async text => {
    const bytes = Game.connection.canCompress ? await Game.connection.compress(text) : new TextEncoder().encode(text);
    Game.connection.send(bytes);
  });

  function showError(error) {
    const errorElement = document.getElementById('err');
    errorElement.hidden = false;
    errorElement.textContent = 'Erreur réseau : ' + error.message;
  }

  // ---------- Envoi des photos (hôte) ----------

  function sendSnapshot() {
    if (Game.connection.isCongested()) {
      return;   // connexion lente : la photo suivante partira à la place
    }
    sendSnapshotText(Game.snapshot.encode());
  }

  // Appelé à chaque image, après la simulation.
  function update(realDt) {
    if (mode === 'host') {
      snapshotTimer -= realDt;
      if (snapshotTimer <= 0 && Game.connection.isOpen()) {
        snapshotTimer = NET.SNAPSHOT_INTERVAL_SECONDS;
        sendSnapshot();
      }
    } else if (mode === 'guest') {
      secondsSinceSnapshot += realDt;
      Game.snapshot.smooth(secondsSinceSnapshot / NET.SNAPSHOT_INTERVAL_SECONDS);
      Game.events.advanceAnimationsForDisplay(realDt);
    }
  }

  // L'ami a-t-il déjà reçu la ville ?
  function isWaitingForSnapshot() {
    return mode === 'guest' && !hasSnapshot;
  }

  // ---------- Début et fin ----------

  // Hôte : chaque message du journal part aussitôt chez l'ami.
  function onLog(text) {
    if (mode === 'host') {
      Game.connection.send(JSON.stringify({ type: 'log', text }));
    }
  }

  function start(newMode) {
    mode = newMode;
    snapshotTimer = 0;
    secondsSinceSnapshot = 0;
    hasSnapshot = false;
    Game.state.selection = null;
    Game.state.menuLot = null;
    Game.state.isAutoplay = false;
    if (mode === 'host') {
      Game.world.reset();   // l'ami reçoit la nouvelle ville dès la première photo
    }
    if (listeners.connected) {
      listeners.connected();
    }
  }

  // Retour au jeu sur un seul écran : on prévient l'autre joueur, puis on ferme la connexion.
  function stop() {
    if (isOnline()) {
      Game.connection.send(JSON.stringify({ type: 'bye' }));
    }
    mode = 'local';
    Game.connection.close();
  }

  // L'autre joueur est parti, ou la connexion s'est coupée.
  function endConnection(notice) {
    const wasOnline = isOnline();
    mode = 'local';
    Game.connection.close();
    if (wasOnline && listeners.disconnected) {
      listeners.disconnected(notice);
    }
  }

  // listeners : { connected(), disconnected(notice) } (voir js/home.js).
  function on(newListeners) {
    listeners = Object.assign(listeners, newListeners);
  }

  Game.connection.on({
    message: onMessage,
    close() {
      endConnection('La connexion avec ton ami a été coupée.');
    },
  });
  Game.feedback.addLogListener(onLog);

  Game.online = {
    HOST_PLAYER,
    GUEST_PLAYER,
    isOnline,
    isHost,
    isGuest,
    myPlayer,
    canControl,
    submit,
    update,
    isWaitingForSnapshot,
    start,
    stop,
    on,
  };
})();
