import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';

function connect(url) {
  const socket = new WebSocket(url);
  const pending = [];
  const waiters = [];
  socket.on('message', bytes => {
    const event = JSON.parse(bytes.toString());
    const index = waiters.findIndex(w => w.test(event));
    if (index === -1) pending.push(event);
    else { const waiter = waiters.splice(index, 1)[0]; clearTimeout(waiter.timer); waiter.resolve(event); }
  });
  const ready = new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  const wait = (type, predicate = () => true) => new Promise((resolve, reject) => {
    const matches = e => e.type === type && predicate(e);
    const index = pending.findIndex(matches);
    if (index !== -1) return resolve(pending.splice(index, 1)[0]);
    const waiter = { test: matches, resolve, timer: setTimeout(() => {
      const i = waiters.indexOf(waiter); if (i !== -1) waiters.splice(i, 1);
      reject(new Error(`Timed out waiting for ${type}`));
    }, 3000) };
    waiters.push(waiter);
  });
  return { socket, ready, wait, send: event => socket.send(JSON.stringify(event)) };
}

test('WebSocket clients share a room, enforce seats, and reject bad private invites', async t => {
  const port = 32000 + Math.floor(Math.random() * 10000);
  const child = spawn(process.execPath, ['server/index.mjs'], { env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 5000);
    child.stdout.on('data', () => { clearTimeout(timer); resolve(); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
  });
  const url = `ws://127.0.0.1:${port}/ws`;
  const alice = connect(url); const bob = connect(url);
  t.after(() => { alice.socket.close(); bob.socket.close(); });
  await Promise.all([alice.ready, bob.ready]);
  alice.send({ type: 'join', name: 'Alice', color: '#aabbcc', roomId: 'public' });
  bob.send({ type: 'join', name: 'Bob', color: '#aabbcc', roomId: 'public' });
  await Promise.all([alice.wait('joined'), bob.wait('joined')]);
  await alice.wait('state', e => e.state.players.length === 2);
  alice.send({ type: 'sit', seatId: 'table-1-seat-1' });
  await alice.wait('state', e => e.state.players.some(p => p.name === 'Alice' && p.seatId === 'table-1-seat-1'));
  bob.send({ type: 'sit', seatId: 'table-1-seat-1' });
  const error = await bob.wait('error');
  assert.match(error.message, /vừa có người/);
  bob.send({ type: 'sit', seatId: 'table-1-seat-2' });
  await bob.wait('state', e => e.state.players.some(p => p.name === 'Bob' && p.seatId === 'table-1-seat-2'));
  alice.send({ type: 'chat', scope: 'table', text: 'Cà phê nhé' });
  assert.equal((await bob.wait('chat')).message.text, 'Cà phê nhé');
  const response = await fetch(`http://127.0.0.1:${port}/api/private-rooms`, { method: 'POST' });
  const { roomId } = await response.json();
  const stranger = connect(url); t.after(() => stranger.socket.close());
  await stranger.ready;
  stranger.send({ type: 'join', name: 'Stranger', roomId, inviteCode: 'wrong' });
  assert.match((await stranger.wait('error')).message, /không hợp lệ/);
});
