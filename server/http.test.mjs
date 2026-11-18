import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';

function startServer(t, extraEnv = {}) {
  const port = 42000 + Math.floor(Math.random() * 10000);
  const child = spawn(process.execPath, ['server/index.mjs'], {
    env: { ...process.env, ...extraEnv, PORT: String(port), HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 5000);
    child.stdout.on('data', () => { clearTimeout(timer); resolve(); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
  });
  return { port, ready };
}

function openSocket(url) {
  const socket = new WebSocket(url);
  const queue = [];
  const waiters = [];
  socket.on('message', bytes => {
    const event = JSON.parse(bytes.toString());
    const index = waiters.findIndex(waiter => waiter.matches(event));
    if (index === -1) queue.push(event);
    else {
      const waiter = waiters.splice(index, 1)[0];
      clearTimeout(waiter.timer);
      waiter.resolve(event);
    }
  });
  const ready = new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  const waitFor = (type, predicate = () => true) => new Promise((resolve, reject) => {
    const matches = event => event.type === type && predicate(event);
    const existing = queue.findIndex(matches);
    if (existing !== -1) return resolve(queue.splice(existing, 1)[0]);
    const waiter = {
      matches,
      resolve,
      timer: setTimeout(() => {
        const index = waiters.indexOf(waiter);
        if (index !== -1) waiters.splice(index, 1);
        reject(new Error(`Timed out waiting for ${type}`));
      }, 3000),
    };
    waiters.push(waiter);
  });
  return { socket, ready, waitFor, send: event => socket.send(JSON.stringify(event)) };
}

test('HTTP API exposes only public room data and keeps private invites secret', async t => {
  const { port, ready } = startServer(t);
  await ready;
  const base = `http://127.0.0.1:${port}`;

  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });

  const initialRooms = await (await fetch(`${base}/api/rooms`)).json();
  assert.deepEqual(initialRooms.map(room => room.id).sort(), ['chill', 'public']);
  assert.equal(initialRooms.every(room => !Object.hasOwn(room, 'inviteCode')), true);

  const created = await fetch(`${base}/api/private-rooms`, { method: 'POST' });
  assert.equal(created.status, 201);
  const privateRoom = await created.json();
  assert.match(privateRoom.roomId, /^private-[0-9a-f]{16}$/);
  assert.match(privateRoom.inviteCode, /^[0-9a-f]{32}$/);
  assert.equal(privateRoom.capacity, 6);

  const duoCreated = await fetch(`${base}/api/private-rooms?capacity=2`, { method: 'POST' });
  assert.equal(duoCreated.status, 201);
  assert.equal((await duoCreated.json()).capacity, 2);

  const groupCreated = await fetch(`${base}/api/private-rooms?capacity=8`, { method: 'POST' });
  assert.equal(groupCreated.status, 201);
  assert.equal((await groupCreated.json()).capacity, 8);

  const invalidCapacity = await fetch(`${base}/api/private-rooms?capacity=7`, { method: 'POST' });
  assert.equal(invalidCapacity.status, 429);

  const listedRooms = await (await fetch(`${base}/api/rooms`)).json();
  assert.equal(listedRooms.some(room => room.id === privateRoom.roomId), false);

  const missing = await fetch(`${base}/not-a-route`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Not found' });

  const reports = await fetch(`${base}/api/reports`);
  assert.equal(reports.status, 200);
  assert.deepEqual(await reports.json(), []);

  const ttsUnavailable = await fetch(`${base}/api/tts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Xin chào', voice: 'khanh_vy', speed: 1 }),
  });
  assert.equal(ttsUnavailable.status, 503);
  assert.deepEqual(await ttsUnavailable.json(), { error: 'Vietnamese TTS local bridge is not configured.' });
});

test('TTS relay only forwards valid requests to a configured local bridge', async t => {
  let received = null;
  const bridge = createHttpServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    received = { method: req.method, path: req.url, payload: JSON.parse(body) };
    res.writeHead(200, { 'Content-Type': 'audio/wav' });
    res.end(Buffer.from('RIFFmock-wav'));
  });
  await new Promise(resolve => bridge.listen(0, '127.0.0.1', resolve));
  t.after(() => bridge.close());
  const bridgePort = bridge.address().port;
  const { port, ready } = startServer(t, { VIET_TTS_SERVICE_URL: `http://127.0.0.1:${bridgePort}/synthesize` });
  await ready;

  const response = await fetch(`http://127.0.0.1:${port}/api/tts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Mời bạn dùng cà phê.', voice: 'khanh_vy', speed: 0.98 }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'audio/wav');
  assert.equal(Buffer.from(await response.arrayBuffer()).toString(), 'RIFFmock-wav');
  assert.deepEqual(received, {
    method: 'POST', path: '/synthesize',
    payload: { text: 'Mời bạn dùng cà phê.', voice: 'khanh_vy', speed: 0.98 },
  });

  const invalid = await fetch(`http://127.0.0.1:${port}/api/tts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'x', voice: 'unknown', speed: 1 }),
  });
  assert.equal(invalid.status, 400);
});

test('Cloud Vietnamese TTS endpoint synthesizes and caches audio stream', async t => {
  const { port, ready } = startServer(t);
  await ready;
  const base = `http://127.0.0.1:${port}`;

  const invalid = await fetch(`${base}/api/tts-cloud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '' }),
  });
  assert.equal(invalid.status, 400);

  const res1 = await fetch(`${base}/api/tts-cloud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Xin chào bạn ghé quán' }),
  });
  assert.equal(res1.status, 200);
  assert.equal(res1.headers.get('content-type'), 'audio/mpeg');
  assert.equal(res1.headers.get('x-tts-source'), 'live');
  const buf1 = await res1.arrayBuffer();
  assert.ok(buf1.byteLength > 1000);

  // Second call must be served from in-memory cache
  const res2 = await fetch(`${base}/api/tts-cloud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Xin chào bạn ghé quán' }),
  });
  assert.equal(res2.status, 200);
  assert.equal(res2.headers.get('x-tts-source'), 'cache');
  const buf2 = await res2.arrayBuffer();
  assert.equal(buf2.byteLength, buf1.byteLength);
});

test('WebSocket protocol rejects events before joining and accepts a valid private invite', async t => {
  const { port, ready } = startServer(t);
  await ready;
  const base = `http://127.0.0.1:${port}`;
  const privateRoom = await (await fetch(`${base}/api/private-rooms`, { method: 'POST' })).json();
  const client = openSocket(`ws://127.0.0.1:${port}/ws`);
  t.after(() => client.socket.close());
  await client.ready;

  client.send({ type: 'move', position: { x: 0, y: 0, z: 0, rotation: 0 } });
  assert.match((await client.waitFor('error')).message, /vào phòng trước/);

  client.send({
    type: 'join', name: 'Private guest', color: '#abcdef',
    roomId: privateRoom.roomId, inviteCode: privateRoom.inviteCode,
  });
  await client.waitFor('joined');
  const stateEvent = await client.waitFor('state', event => event.state.id === privateRoom.roomId);
  assert.equal(stateEvent.state.players.length, 1);
  assert.equal(stateEvent.state.players[0].name, 'Private guest');

  client.send({ type: 'unsupported-event' });
  assert.match((await client.waitFor('error')).message, /không được hỗ trợ/);
});
