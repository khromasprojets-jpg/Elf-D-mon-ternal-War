/**
 * ws_bridge.js — WebSocket ↔ TCP Bridge
 * Elf&Démon : Éternal War — Dragon Pals Private Server
 *
 * Rôle : relaie les messages entre les clients React (WebSocket)
 *         et le game server TCP Node.js (port 8888).
 *
 * Format paquet TCP :
 *   [4B MAGIC][4B longueur][8B timestamp][4B dest][4B cmd][JSON payload]
 *   Total header = 20 bytes
 *
 * Déploiement : Render (Web Service) — port WS = process.env.PORT || 9999
 */

const WebSocket = require('ws');
const net = require('net');

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const WS_PORT        = parseInt(process.env.PORT)          || 9999;
const TCP_HOST       = process.env.GAME_SERVER_HOST        || 'elf-demon-game-server.onrender.com';
const TCP_PORT       = parseInt(process.env.GAME_SERVER_PORT) || 8888;
const MAGIC          = 0x44524147; // "DRAG" en hex — à ajuster selon tes captures
const HEADER_SIZE    = 20;         // 4+4+8+4+4

// ─── LOGS ──────────────────────────────────────────────────────────────────────
const log  = (...a) => console.log ('[BRIDGE]', new Date().toISOString(), ...a);
const warn = (...a) => console.warn ('[BRIDGE]', new Date().toISOString(), ...a);
const err  = (...a) => console.error('[BRIDGE]', new Date().toISOString(), ...a);

// ─── HELPERS PAQUETS ───────────────────────────────────────────────────────────

/**
 * Construit un paquet TCP depuis un objet JS.
 * @param {number} cmd   - opcode (ex: 1001 = login)
 * @param {number} dest  - destination (0 = server par défaut)
 * @param {object} data  - payload JSON
 */
function buildPacket(cmd, dest, data) {
  const payload    = Buffer.from(JSON.stringify(data), 'utf8');
  const totalLen   = HEADER_SIZE + payload.length;
  const buf        = Buffer.alloc(totalLen);
  const now        = BigInt(Date.now());

  buf.writeUInt32BE(MAGIC,            0);  // 4B magic
  buf.writeUInt32BE(totalLen,         4);  // 4B longueur totale
  buf.writeBigUInt64BE(now,           8);  // 8B timestamp
  buf.writeUInt32BE(dest,            16);  // 4B dest
  buf.writeUInt32BE(cmd,             20);  // 4B cmd
  payload.copy(buf,                  24);  // JSON

  return buf;
}

/**
 * Parse un ou plusieurs paquets depuis un Buffer TCP entrant.
 * Gère la fragmentation (TCP peut livrer plusieurs paquets d'un coup).
 * @returns {{ packets: Array<{cmd,dest,data}>, remainder: Buffer }}
 */
function parsePackets(buf) {
  const packets = [];

  while (buf.length >= HEADER_SIZE) {
    const magic  = buf.readUInt32BE(0);
    const length = buf.readUInt32BE(4);

    if (magic !== MAGIC) {
      warn('Magic invalide, flush du buffer');
      return { packets, remainder: Buffer.alloc(0) };
    }

    if (buf.length < length) break; // paquet incomplet, on attend la suite

    // const timestamp = buf.readBigUInt64BE(8); // disponible si besoin
    const dest      = buf.readUInt32BE(16);
    const cmd       = buf.readUInt32BE(20);
    const jsonRaw   = buf.slice(HEADER_SIZE, length).toString('utf8');

    let data = {};
    try   { data = JSON.parse(jsonRaw); }
    catch { warn(`JSON invalide pour cmd=${cmd}:`, jsonRaw.slice(0, 80)); }

    packets.push({ cmd, dest, data });
    buf = buf.slice(length);
  }

  return { packets, remainder: buf };
}

// ─── SERVEUR WEBSOCKET ─────────────────────────────────────────────────────────
const wss = new WebSocket.Server({ port: WS_PORT });
log(`WebSocket Bridge démarré sur ws://0.0.0.0:${WS_PORT}`);

// Garde une référence vers chaque session active : wsClient → { tcpSocket, remainder }
const sessions = new Map();

wss.on('connection', (ws, req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  log(`Nouveau client WS connecté depuis ${ip}`);

  // ── Ouvre une connexion TCP dédiée vers le game server ──
  const tcp = new net.Socket();
  let tcpReady = false;
  let sendQueue = []; // paquets en attente si TCP pas encore prêt
  let remainder = Buffer.alloc(0); // buffer pour fragmentation TCP

  sessions.set(ws, { tcp, remainder });

  tcp.connect(TCP_PORT, TCP_HOST, () => {
    tcpReady = true;
    log(`TCP connecté vers ${TCP_HOST}:${TCP_PORT} pour client ${ip}`);
    // Vide la file d'attente
    sendQueue.forEach(pkt => tcp.write(pkt));
    sendQueue = [];
  });

  // ── Données reçues du game server → forwarde au client WS ──
  tcp.on('data', (chunk) => {
    remainder = Buffer.concat([remainder, chunk]);
    const { packets, remainder: rest } = parsePackets(remainder);
    remainder = rest;

    packets.forEach(pkt => {
      if (ws.readyState === WebSocket.OPEN) {
        // Envoie en JSON au frontend React — plus facile à consommer
        ws.send(JSON.stringify({ cmd: pkt.cmd, dest: pkt.dest, data: pkt.data }));
      }
    });
  });

  tcp.on('error', (e) => {
    err(`Erreur TCP pour client ${ip}:`, e.message);
    ws.close(1011, 'Game server unreachable');
  });

  tcp.on('close', () => {
    log(`Connexion TCP fermée pour client ${ip}`);
    if (ws.readyState === WebSocket.OPEN) ws.close(1001, 'Game server closed');
    sessions.delete(ws);
  });

  // ── Messages reçus du client React → forwarde au game server TCP ──
  ws.on('message', (raw) => {
    let msg;
    try   { msg = JSON.parse(raw); }
    catch { warn('Message WS non-JSON reçu, ignoré'); return; }

    const { cmd, dest = 0, data = {} } = msg;

    if (typeof cmd !== 'number') {
      warn('Message sans cmd valide:', msg);
      return;
    }

    const pkt = buildPacket(cmd, dest, data);

    if (tcpReady) {
      tcp.write(pkt);
    } else {
      sendQueue.push(pkt); // TCP pas encore prêt
    }
  });

  ws.on('close', (code, reason) => {
    log(`Client WS déconnecté ${ip} — code=${code} reason=${reason}`);
    tcp.destroy();
    sessions.delete(ws);
  });

  ws.on('error', (e) => {
    err(`Erreur WS pour client ${ip}:`, e.message);
    tcp.destroy();
    sessions.delete(ws);
  });
});

// ─── STATS (optionnel, utile pour debug sur Render) ───────────────────────────
setInterval(() => {
  log(`Sessions actives : ${sessions.size}`);
}, 60_000);

// ─── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  log('SIGTERM reçu — fermeture propre');
  wss.close(() => {
    sessions.forEach(({ tcp }) => tcp.destroy());
    process.exit(0);
  });
});
