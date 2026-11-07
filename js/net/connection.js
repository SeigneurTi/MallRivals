// Partie à distance : connexion directe entre les deux navigateurs (WebRTC), sans serveur de jeu.
//
// Pour se trouver, les deux navigateurs s'échangent deux codes, que les joueurs se passent eux-mêmes
// (SMS, Discord, mail…) :
//   1. l'hôte crée un code d'invitation et l'envoie à son ami ;
//   2. l'ami le colle : son navigateur crée un code réponse, qu'il renvoie à l'hôte ;
//   3. l'hôte colle la réponse : la connexion s'ouvre.
// Un code contient l'adresse réseau du navigateur (description WebRTC), compressée.
(function () {
  'use strict';

  const NET = Game.config.net;
  const CODE_PREFIX = 'BLB';

  let peer = null;           // RTCPeerConnection
  let channel = null;        // RTCDataChannel
  const handlers = { open: null, message: null, close: null };

  function isSupported() {
    return typeof RTCPeerConnection === 'function';
  }

  // ---------- Compression (codes et photos de la ville) ----------

  const canCompress = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

  async function compress(text) {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function decompress(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).text();
  }

  function bytesToBase64Url(bytes) {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlToBytes(text) {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }

  // Code à copier : « BLB » + « z » (compressé) ou « t » (texte brut) + base64.
  async function makeCode(description) {
    const text = JSON.stringify({ version: NET.PROTOCOL_VERSION, type: description.type, sdp: description.sdp });
    if (canCompress) {
      return CODE_PREFIX + 'z' + bytesToBase64Url(await compress(text));
    }
    return CODE_PREFIX + 't' + bytesToBase64Url(new TextEncoder().encode(text));
  }

  // Lit un code collé. Lève une erreur au message lisible s'il est abîmé ou du mauvais type.
  async function readCode(code, expectedType) {
    const cleaned = String(code).replace(/\s+/g, '');
    if (!cleaned.startsWith(CODE_PREFIX)) {
      throw new Error("Ce n'est pas un code de Bourg-les-Bonhommes.");
    }
    let description;
    try {
      const bytes = base64UrlToBytes(cleaned.slice(CODE_PREFIX.length + 1));
      const text = cleaned[CODE_PREFIX.length] === 'z' ? await decompress(bytes) : new TextDecoder().decode(bytes);
      description = JSON.parse(text);
    } catch (error) {
      throw new Error('Code incomplet ou abîmé : recopie-le en entier.');
    }
    if (description.version !== NET.PROTOCOL_VERSION) {
      throw new Error("Ton ami n'a pas la même version du jeu.");
    }
    if (description.type !== expectedType) {
      throw new Error(expectedType === 'offer'
        ? "C'est un code réponse : il faut coller le code d'invitation."
        : "C'est un code d'invitation : il faut coller le code réponse de ton ami.");
    }
    return { type: description.type, sdp: description.sdp };
  }

  // ---------- Connexion ----------

  function createPeer() {
    close();
    const connection = new RTCPeerConnection({ iceServers: NET.ICE_SERVERS });
    peer = connection;
    connection.addEventListener('connectionstatechange', () => {
      // Les événements d'une ancienne connexion sont ignorés.
      if (connection === peer && (connection.connectionState === 'failed' || connection.connectionState === 'closed')) {
        handleClose();
      }
    });
    return connection;
  }

  function setupChannel(newChannel) {
    channel = newChannel;
    newChannel.binaryType = 'arraybuffer';
    // Les événements d'un ancien canal sont ignorés.
    newChannel.addEventListener('open', () => {
      if (newChannel === channel && handlers.open) {
        handlers.open();
      }
    });
    newChannel.addEventListener('close', () => {
      if (newChannel === channel) {
        handleClose();
      }
    });
    newChannel.addEventListener('message', event => {
      if (newChannel === channel && handlers.message) {
        handlers.message(event.data);
      }
    });
  }

  // On attend que le navigateur ait trouvé ses adresses réseau : elles vont toutes dans le code.
  function waitForAddresses(connection) {
    return new Promise(resolve => {
      if (connection.iceGatheringState === 'complete') {
        resolve();
        return;
      }
      const timer = setTimeout(resolve, NET.ADDRESS_SEARCH_MAX_MS);
      connection.addEventListener('icegatheringstatechange', () => {
        if (connection.iceGatheringState === 'complete') {
          clearTimeout(timer);
          resolve();
        }
      });
    });
  }

  // Hôte, étape 1 : renvoie le code d'invitation.
  async function createInvitation() {
    const connection = createPeer();
    setupChannel(connection.createDataChannel('ville'));
    await connection.setLocalDescription(await connection.createOffer());
    await waitForAddresses(connection);
    return makeCode(connection.localDescription);
  }

  // Ami : lit le code d'invitation et renvoie le code réponse.
  async function answerInvitation(invitationCode) {
    const offer = await readCode(invitationCode, 'offer');
    const connection = createPeer();
    connection.addEventListener('datachannel', event => setupChannel(event.channel));
    await connection.setRemoteDescription(offer);
    await connection.setLocalDescription(await connection.createAnswer());
    await waitForAddresses(connection);
    return makeCode(connection.localDescription);
  }

  // Hôte, étape 2 : lit le code réponse ; la connexion s'ouvre ensuite toute seule.
  async function acceptAnswer(answerCode) {
    const answer = await readCode(answerCode, 'answer');
    if (!peer || peer.signalingState !== 'have-local-offer') {
      throw new Error("Crée d'abord une nouvelle invitation.");
    }
    await peer.setRemoteDescription(answer);
  }

  function isOpen() {
    return Boolean(channel && channel.readyState === 'open');
  }

  // Trop de données en attente (connexion lente) : mieux vaut sauter une photo.
  function isCongested() {
    return Boolean(channel && channel.bufferedAmount > NET.MAX_BUFFERED_BYTES);
  }

  function send(data) {
    if (isOpen()) {
      channel.send(data);
    }
  }

  // La connexion s'est coupée (ami parti, réseau perdu) : on prévient le jeu.
  function handleClose() {
    const wasConnected = Boolean(channel || peer);
    close();
    if (wasConnected && handlers.close) {
      handlers.close();
    }
  }

  // Ferme la connexion volontairement (sans prévenir le jeu).
  function close() {
    const oldChannel = channel;
    const oldPeer = peer;
    channel = null;
    peer = null;
    if (oldChannel) {
      oldChannel.close();
    }
    if (oldPeer) {
      oldPeer.close();
    }
  }

  // handlers : { open(), message(data), close() }.
  function on(newHandlers) {
    Object.assign(handlers, newHandlers);
  }

  Game.connection = {
    isSupported,
    canCompress,
    compress,
    decompress,
    createInvitation,
    answerInvitation,
    acceptAnswer,
    isOpen,
    isCongested,
    send,
    close,
    on,
  };
})();
