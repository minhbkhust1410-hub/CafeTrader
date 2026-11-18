import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { RoomService } from './rooms.mjs';

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
const rooms = new RoomService();
const maxTtsTextLength = 500;
const maxTtsAudioBytes = 12 * 1024 * 1024;
const korvaVoices = new Set(['bao_kim', 'gia_bao', 'khanh_vy', 'hoang_nam', 'ngoc_huyen', 'huu_dat', 'phuong_linh', 'quang_huy', 'quynh_nhu', 'thanh_phong']);
const json = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
};

function localTtsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' && ['127.0.0.1', 'localhost', '::1'].includes(url.hostname) ? url : null;
  } catch { return null; }
}

async function readJson(req, limit = 2048) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > limit) throw new Error('Payload quá lớn.');
  }
  try { return JSON.parse(body || '{}'); }
  catch { throw new Error('JSON không hợp lệ.'); }
}

async function relayTts(req, res) {
  const serviceUrl = localTtsUrl(process.env.VIET_TTS_SERVICE_URL);
  if (!serviceUrl) return json(res, 503, { error: 'Vietnamese TTS local bridge is not configured.' });
  try {
    const payload = await readJson(req);
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    const voice = typeof payload.voice === 'string' ? payload.voice : '';
    const speed = Number(payload.speed);
    if (!text || text.length > maxTtsTextLength || !korvaVoices.has(voice) || !Number.isFinite(speed) || speed < 0.5 || speed > 2) {
      return json(res, 400, { error: 'TTS request không hợp lệ.' });
    }
    const provider = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, speed }),
      signal: AbortSignal.timeout(20_000),
    });
    const contentType = provider.headers.get('content-type') || '';
    const contentLength = Number(provider.headers.get('content-length') || 0);
    if (!provider.ok || !contentType.startsWith('audio/') || contentLength > maxTtsAudioBytes) {
      return json(res, 502, { error: 'Vietnamese TTS bridge did not return valid audio.' });
    }
    const audio = Buffer.from(await provider.arrayBuffer());
    if (!audio.length || audio.length > maxTtsAudioBytes) return json(res, 502, { error: 'Vietnamese TTS bridge returned invalid audio.' });
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    return res.end(audio);
  } catch (error) {
    return json(res, 502, { error: error instanceof Error ? error.message : 'Vietnamese TTS bridge failed.' });
  }
}

// In-memory LRU audio cache for cloud Vietnamese TTS
const cloudTtsCache = new Map();
const MAX_CLOUD_CACHE = 200;

function splitTtsChunks(text, maxLen = 180) {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length <= maxLen) {
      cur += s;
    } else {
      if (cur) chunks.push(cur.trim());
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.slice(i, i + maxLen).trim());
        }
        cur = '';
      } else {
        cur = s;
      }
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

async function streamFreeTts(req, res, queryParams = null) {
  try {
    let text = '';
    let voice = 'vi-VN';
    let speed = 1.0;

    if (req.method === 'GET' && queryParams) {
      text = (queryParams.get('text') || '').trim();
      voice = queryParams.get('voice') || 'vi-VN';
      speed = Number(queryParams.get('speed') || 1.0);
    } else {
      const payload = await readJson(req);
      text = typeof payload.text === 'string' ? payload.text.trim() : '';
      voice = typeof payload.voice === 'string' ? payload.voice : 'vi-VN';
      speed = Number(payload.speed || 1.0);
    }

    if (!text || text.length > maxTtsTextLength) {
      return json(res, 400, { error: 'Văn bản TTS không hợp lệ hoặc quá dài.' });
    }

    const cacheKey = `vi:${text}`;
    if (cloudTtsCache.has(cacheKey)) {
      const cached = cloudTtsCache.get(cacheKey);
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-TTS-Source': 'cache',
      });
      return res.end(cached);
    }

    const chunks = splitTtsChunks(text, 180);
    const audioBuffers = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        throw new Error(`Upstream TTS trả về mã lỗi ${response.status}`);
      }
      const buf = Buffer.from(await response.arrayBuffer());
      if (buf.length > 0) audioBuffers.push(buf);
    }

    if (!audioBuffers.length) {
      return json(res, 502, { error: 'Không thể tổng hợp âm thanh tiếng Việt.' });
    }

    const combined = Buffer.concat(audioBuffers);
    if (cloudTtsCache.size >= MAX_CLOUD_CACHE) {
      const oldestKey = cloudTtsCache.keys().next().value;
      cloudTtsCache.delete(oldestKey);
    }
    cloudTtsCache.set(cacheKey, combined);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-TTS-Source': 'live',
    });
    return res.end(combined);
  } catch (error) {
    return json(res, 502, { error: error instanceof Error ? error.message : 'Lỗi tổng hợp giọng nói tiếng Việt.' });
  }
}

const server = createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const path = requestUrl.pathname;
  if (req.method === 'POST' && path === '/api/tts') return void relayTts(req, res);
  if (path === '/api/tts-cloud' || path === '/api/tts-free') {
    if (req.method === 'POST') return void streamFreeTts(req, res);
    if (req.method === 'GET') return void streamFreeTts(req, res, requestUrl.searchParams);
  }
  if (req.method === 'GET' && path === '/api/rooms') return json(res, 200, rooms.publicRooms());
  if (req.method === 'GET' && path === '/api/reports') {
    return json(res, 200, rooms.reports.map(r => ({ id: r.id, targetName: r.targetName, reason: r.reason, timestamp: r.timestamp })));
  }
  // Local demo only. Public deployment requires authenticated creation and abuse controls.
  if (req.method === 'POST' && path === '/api/private-rooms') {
    const capacity = Number(requestUrl.searchParams.get('capacity') || 6);
    try { return json(res, 201, rooms.createPrivateRoom(capacity)); }
    catch (error) { return json(res, 429, { error: error.message }); }
  }
  if (req.method === 'GET' && path === '/health') return json(res, 200, { ok: true });
  return json(res, 404, { error: 'Not found' });
});
const websocket = new WebSocketServer({ server, path: '/ws', maxPayload: 8192 });
websocket.on('connection', (socket) => {
  const id = randomUUID();
  let joined = false;
  let burstStart = Date.now();
  let burstMessages = 0;
  const send = (event) => { if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(event)); };
  const timeout = setTimeout(() => { if (!joined) socket.close(1008, 'Join required'); }, 10000);
  socket.on('message', (bytes, isBinary) => {
    if (isBinary) return socket.close(1003, 'Text messages only');
    if (Date.now() - burstStart > 1000) { burstStart = Date.now(); burstMessages = 0; }
    if (++burstMessages > 80) return socket.close(1008, 'Too many messages');
    try {
      const event = JSON.parse(bytes.toString());
      if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('Yêu cầu không hợp lệ.');
      if (event.type === 'join') {
        rooms.join(id, event, send);
        joined = true;
        clearTimeout(timeout);
        send({ type: 'joined' });
      } else if (!joined) throw new Error('Hãy vào phòng trước.');
      else if (event.type === 'move') rooms.move(id, event.position);
      else if (event.type === 'sit') rooms.sit(id, event.seatId);
      else if (event.type === 'stand') rooms.stand(id);
      else if (event.type === 'order') rooms.order(id, event.drink);
      else if (event.type === 'emote') rooms.emote(id, event.emoji);
      else if (event.type === 'chat') rooms.chat(id, event.text, event.scope);
      else if (event.type === 'voice-signal') rooms.voiceSignal(id, event);
      else if (event.type === 'voice-state') rooms.voiceState(id, event);
      else if (event.type === 'report') rooms.report(id, event.targetId, event.reason);
      else if (event.type === 'kick') rooms.kick(id, event.targetId, event.reason);
      else if (event.type === 'mute') rooms.mute(id, event.targetId, event.muted);
      else if (event.type === 'announcement') rooms.announcement(id, event.text);
      else if (event.type === 'fireworks') rooms.fireworks(id, event.profitText);
      else if (event.type === 'service') rooms.service(id, event.serviceType);
      else if (event.type === 'award-xp') rooms.awardXp(id, event.amount);
      else if (event.type === 'trigger-nfp') rooms.triggerNfp(rooms.connections.get(id)?.room?.id || 'public');
      else throw new Error('Yêu cầu không được hỗ trợ.');
    } catch (error) {
      send({ type: 'error', message: error instanceof Error ? error.message : 'Không thể xử lý yêu cầu.' });
    }
  });
  socket.on('close', () => { clearTimeout(timeout); rooms.leave(id); });
  socket.on('error', () => { clearTimeout(timeout); rooms.leave(id); });
});
server.listen(port, host, () => console.log(`CafeTrader local multiplayer listening on http://${host}:${port}`));
