// Page d'accueil : choix du mode de jeu (un écran, à distance, partie auto) et échange des codes
// d'une partie à distance. Elle s'affiche à l'ouverture et avec le bouton « Accueil ».
(function () {
  'use strict';

  const NET = Game.config.net;
  const PLAYER_NAMES = Game.config.players.NAMES;
  const element = id => document.getElementById(id);

  const homeElement = element('home');
  const gameElement = element('game');
  const PANEL_IDS = ['homeMenu', 'homeBot', 'homeOnline', 'homeHost', 'homeGuest'];
  const INVITATION_HASH = '#invitation=';

  let connectTimer = null;      // explique pourquoi la connexion n'aboutit pas

  function isOpen() {
    return !homeElement.hidden;
  }

  function showPanel(panelId) {
    for (const id of PANEL_IDS) {
      element(id).hidden = id !== panelId;
    }
    const firstButton = element(panelId).querySelector('button:not([disabled]), textarea:not([readonly])');
    if (firstButton) {
      firstButton.focus();
    }
  }

  function setStatus(id, text, isError) {
    const status = element(id);
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function setNotice(text) {
    element('homeNotice').hidden = !text;
    element('homeNotice').textContent = text || '';
  }

  // Ouvre l'accueil. Une partie à distance en cours est fermée.
  function open(notice) {
    clearTimeout(connectTimer);
    Game.online.stop();
    homeElement.hidden = false;
    gameElement.hidden = true;
    setNotice(notice);
    showPanel('homeMenu');
    syncControls();
    scrollTo(0, 0);
  }

  // Passe de l'accueil au plateau.
  function showGame() {
    clearTimeout(connectTimer);
    homeElement.hidden = true;
    gameElement.hidden = false;
    Game.view.resize();
    syncControls();
    scrollTo(0, 0);
  }

  // Partie sur un seul écran : à deux, en partie auto, ou contre un bot (botLevel : 'easy', 'normal', 'hard').
  function startLocalGame(isAutoplay, botLevel = null) {
    Game.online.stop();
    Game.world.reset();
    Game.state.isAutoplay = isAutoplay;
    Game.state.botLevel = botLevel;
    Game.input.syncAutoplayButton();
    showGame();
  }

  // Commandes sous le plateau : chez l'ami, c'est l'hôte qui règle la partie ;
  // à distance, pas de partie auto (elle jouerait aussi pour l'autre joueur).
  function syncControls() {
    const isGuest = Game.online.isGuest();
    for (const id of ['pop', 'spd', 'play', 'reset']) {
      element(id).disabled = isGuest;
    }
    element('autoplay').disabled = Game.online.isOnline();
    const status = element('netStatus');
    status.hidden = !Game.online.isOnline();
    if (Game.online.isOnline()) {
      const me = Game.online.myPlayer();
      const side = me === 0 ? 'à gauche' : 'à droite';
      status.textContent = `Partie à distance : tu joues ${PLAYER_NAMES[me]} (bac ${side}), ton ami joue ${PLAYER_NAMES[1 - me]}.`
        + (Game.online.isHost() ? ' Garde cet onglet ouvert au premier plan : c’est lui qui fait tourner la ville.' : '');
    }
  }

  // Copie le texte d'un champ ; le bouton affiche « Copié ! » un instant.
  async function copyField(fieldId, button) {
    const field = element(fieldId);
    try {
      await navigator.clipboard.writeText(field.value);
    } catch (error) {
      field.select();
      document.execCommand('copy');
    }
    const label = button.textContent;
    button.textContent = 'Copié !';
    setTimeout(() => {
      button.textContent = label;
    }, 1500);
  }

  // Sans connexion au bout d'un moment : les réseaux des deux joueurs se bloquent sans doute.
  function startConnectTimer(statusId) {
    clearTimeout(connectTimer);
    connectTimer = setTimeout(() => {
      setStatus(statusId, 'La connexion n’aboutit pas. Certains réseaux (entreprise, école, certaines 4G) bloquent les connexions directes : essayez un autre réseau (un partage de connexion, par exemple), puis recommencez avec un nouveau code.', true);
    }, NET.CONNECT_TIMEOUT_SECONDS * 1000);
  }

  // ---------- Créer une partie (hôte) ----------

  let isHostFlow = false;

  async function startHosting() {
    isHostFlow = true;
    showPanel('homeHost');
    element('inviteCode').value = '';
    element('answerInput').value = '';
    element('inviteLinkRow').hidden = true;
    setStatus('hostStatus', 'Préparation du code d’invitation…');
    try {
      const code = await Game.connection.createInvitation();
      element('inviteCode').value = code;
      if (/^https?:$/.test(location.protocol)) {
        element('inviteLink').value = location.href.split('#')[0] + INVITATION_HASH + code;
        element('inviteLinkRow').hidden = false;
      }
      setStatus('hostStatus', 'En attente du code réponse de ton ami…');
    } catch (error) {
      setStatus('hostStatus', 'Impossible de créer l’invitation : ' + error.message, true);
    }
  }

  async function submitAnswer() {
    try {
      await Game.connection.acceptAnswer(element('answerInput').value);
      setStatus('hostStatus', 'Connexion en cours…');
      startConnectTimer('hostStatus');
    } catch (error) {
      setStatus('hostStatus', error.message, true);
    }
  }

  // ---------- Rejoindre une partie (ami) ----------

  function startJoining(invitationCode) {
    isHostFlow = false;
    Game.connection.close();
    showPanel('homeGuest');
    element('inviteInput').value = invitationCode || '';
    element('answerCode').value = '';
    element('answerStep').classList.add('is-waiting');
    setStatus('guestStatus', '');
    if (invitationCode) {
      submitInvitation();
    }
  }

  async function submitInvitation() {
    setStatus('guestStatus', 'Lecture du code…');
    try {
      const code = await Game.connection.answerInvitation(element('inviteInput').value);
      element('answerCode').value = code;
      element('answerStep').classList.remove('is-waiting');
      setStatus('guestStatus', 'Envoie ce code réponse à ton ami. La partie commence dès qu’il l’a collé.');
      startConnectTimer('guestStatus');
    } catch (error) {
      setStatus('guestStatus', error.message, true);
    }
  }

  // ---------- Branchements ----------

  function bind() {
    for (const button of homeElement.querySelectorAll('[data-choice]')) {
      button.addEventListener('click', () => {
        const choice = button.dataset.choice;
        setNotice('');
        if (choice === 'local' || choice === 'auto') {
          startLocalGame(choice === 'auto');
        } else if (choice === 'bot') {
          showPanel('homeBot');
        } else if (choice.startsWith('bot-')) {
          startLocalGame(false, choice.slice('bot-'.length));
        } else if (choice === 'online') {
          showPanel('homeOnline');
        } else if (choice === 'host') {
          startHosting();
        } else if (choice === 'join') {
          startJoining('');
        } else {
          Game.connection.close();
          showPanel(choice === 'back-online' ? 'homeOnline' : 'homeMenu');
        }
      });
    }
    element('copyInvite').addEventListener('click', event => copyField('inviteCode', event.currentTarget));
    element('copyInviteLink').addEventListener('click', event => copyField('inviteLink', event.currentTarget));
    element('copyAnswer').addEventListener('click', event => copyField('answerCode', event.currentTarget));
    element('answerSubmit').addEventListener('click', submitAnswer);
    element('inviteSubmit').addEventListener('click', submitInvitation);
    element('home-button').addEventListener('click', () => open(''));

    if (!Game.connection.isSupported()) {
      const onlineButton = homeElement.querySelector('[data-choice="online"]');
      onlineButton.disabled = true;
      onlineButton.querySelector('.home-choice-text').textContent = 'Ce navigateur ne permet pas de jouer à distance.';
    }

    // La connexion s'ouvre : la partie commence chez les deux joueurs.
    Game.connection.on({
      open() {
        Game.online.start(isHostFlow ? 'host' : 'guest');
        showGame();
      },
    });
    Game.online.on({
      disconnected(notice) {
        open(notice);
      },
    });

    // Lien d'invitation (jeu hébergé sur un site) : on arrive directement sur « Rejoindre ».
    if (location.hash.startsWith(INVITATION_HASH)) {
      const code = decodeURIComponent(location.hash.slice(INVITATION_HASH.length));
      history.replaceState(null, '', location.href.split('#')[0]);
      startJoining(code);
    }
  }

  Game.home = { bind, isOpen, open };
})();
