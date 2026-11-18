import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomService } from './rooms.mjs';

function add(service, id, options = {}) {
  const events = [];
  service.join(id, { name: id, roomId: 'public', color: '#abcdef', ...options }, event => events.push(event));
  return events;
}

test('seat is exclusive and becomes available when a client leaves', () => {
  const service = new RoomService();
  add(service, 'first'); add(service, 'second');
  service.sit('first', 'table-1-seat-1');
  assert.throws(() => service.sit('second', 'table-1-seat-1'), /vừa có người/);
  assert.equal(service.connections.get('second').player.seatId, null);
  service.leave('first');
  service.sit('second', 'table-1-seat-1');
  assert.equal(service.connections.get('second').player.seatId, 'table-1-seat-1');
  assert.throws(() => service.sit('second', 'table-9-seat-9'), /không hợp lệ/);
});

test('table chat reaches only players seated at the same table in the same room', () => {
  const service = new RoomService();
  const alice = add(service, 'alice');
  const bob = add(service, 'bob');
  const otherTable = add(service, 'other');
  const otherRoom = add(service, 'away', { roomId: 'chill' });
  service.sit('alice', 'table-1-seat-1');
  service.sit('bob', 'table-1-seat-2');
  service.sit('other', 'table-2-seat-1');
  service.sit('away', 'table-1-seat-1');
  service.chat('alice', 'Xin chào', 'table');
  for (const events of [alice, bob]) assert.equal(events.filter(e => e.type === 'chat').length, 1);
  for (const events of [otherTable, otherRoom]) assert.equal(events.filter(e => e.type === 'chat').length, 0);
  service.stand('alice');
  assert.throws(() => service.chat('alice', 'Hi', 'table'), /ngồi vào bàn/);
});

test('private room requires the correct invite and is excluded from public room listing', () => {
  const service = new RoomService();
  const { roomId, inviteCode } = service.createPrivateRoom();
  assert.equal(service.publicRooms().some(room => room.id === roomId), false);
  assert.throws(() => add(service, 'uninvited', { roomId, inviteCode: 'wrong' }), /lời mời không hợp lệ/);
  const events = add(service, 'invited', { roomId, inviteCode });
  assert.equal(events.at(-1).state.id, roomId);
  assert.equal(service.connections.has('uninvited'), false);
});

test('invalid positions do not corrupt authoritative player state', () => {
  const service = new RoomService();
  add(service, 'player');
  const player = service.connections.get('player').player;
  assert.throws(() => service.move('player', { x: NaN, y: 0, z: 0, rotation: 0 }), /không hợp lệ/);
  assert.throws(() => service.move('player', { x: 100, y: 0, z: 0, rotation: 0 }), /ngoài khu vực/);
  assert.equal(player.x, 0);
  service.move('player', { x: 3, y: 0, z: 2, rotation: 1 });
  assert.equal(player.x, 3);
});

test('royal villa upper levels accept valid multiplayer positions but retain map bounds', () => {
  const service = new RoomService();
  add(service, 'skyline-guest');
  service.move('skyline-guest', { x: 4, y: 24.2, z: 3, rotation: 0.4 });
  assert.equal(service.connections.get('skyline-guest').player.y, 24.2);
  assert.throws(
    () => service.move('skyline-guest', { x: 4, y: 28.1, z: 3, rotation: 0.4 }),
    /ngoài khu vực/,
  );
});

test('ordering a drink updates player state and broadcasts barista message', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  service.sit('alice', 'table-2-seat-1');
  service.order('alice', 'Cà phê trứng');
  const alice = service.connections.get('alice').player;
  assert.equal(alice.drink, 'Cà phê trứng');
  const chatEvents = aliceEvents.filter(e => e.type === 'chat');
  assert.equal(chatEvents.length, 1);
  assert.match(chatEvents[0].message.text, /Cà phê trứng/);
  assert.equal(chatEvents[0].message.author, '☕ Barista');
  service.stand('alice');
  assert.equal(alice.drink, null);
});

test('emotes are broadcasted to room players', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  const bobEvents = add(service, 'bob');
  service.emote('alice', '☕');
  const aliceEmotes = aliceEvents.filter(e => e.type === 'emote');
  const bobEmotes = bobEvents.filter(e => e.type === 'emote');
  assert.equal(aliceEmotes.length, 1);
  assert.equal(bobEmotes.length, 1);
  assert.equal(aliceEmotes[0].emoji, '☕');
  assert.equal(aliceEmotes[0].playerId, 'alice');
});

test('voice signals are strictly isolated to the same table', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  const bobEvents = add(service, 'bob');
  const charlieEvents = add(service, 'charlie');

  service.sit('alice', 'table-2-seat-1');
  service.sit('bob', 'table-2-seat-2');
  service.sit('charlie', 'table-3-seat-1');

  // Alice sends signal to Bob at same table (table 2) -> Allowed
  service.voiceSignal('alice', { targetId: 'bob', signal: { type: 'offer', sdp: 'dummy-sdp' } });
  const bobSignals = bobEvents.filter(e => e.type === 'voice-signal');
  assert.equal(bobSignals.length, 1);
  assert.equal(bobSignals[0].fromId, 'alice');
  assert.equal(bobSignals[0].tableId, '2');

  // Alice tries to signal Charlie at table 3 -> Rejected
  assert.throws(() => service.voiceSignal('alice', { targetId: 'charlie', signal: { type: 'offer' } }), /ra ngoài bàn/);

  // Unseated player tries to signal -> Rejected
  service.stand('alice');
  assert.throws(() => service.voiceSignal('alice', { targetId: 'bob', signal: { type: 'offer' } }), /khi đang ngồi/);
});

test('standing up drops table voice and notifies peers', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  const bobEvents = add(service, 'bob');

  service.sit('alice', 'table-4-seat-1');
  service.sit('bob', 'table-4-seat-2');

  service.stand('alice');

  // Bob receives peer left event
  const bobVoiceLeft = bobEvents.filter(e => e.type === 'voice-peer-left');
  assert.equal(bobVoiceLeft.length, 1);
  assert.equal(bobVoiceLeft[0].peerId, 'alice');
  assert.equal(bobVoiceLeft[0].tableId, '4');

  // Alice receives voice-close event
  const aliceVoiceClose = aliceEvents.filter(e => e.type === 'voice-close');
  assert.equal(aliceVoiceClose.length, 1);
});

test('all seven table seat ranges are accepted, while out-of-map seats are rejected', () => {
  const service = new RoomService();
  add(service, 'terrace');
  service.sit('terrace', 'table-7-seat-4');
  assert.equal(service.connections.get('terrace').player.seatId, 'table-7-seat-4');
  assert.throws(() => service.sit('terrace', 'table-8-seat-1'), /không hợp lệ/);
  assert.throws(() => service.sit('terrace', 'table-1-seat-5'), /không hợp lệ/);
});

test('voice state is delivered only to people sitting at the same table', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  const bobEvents = add(service, 'bob');
  const charlieEvents = add(service, 'charlie');
  service.sit('alice', 'table-6-seat-1');
  service.sit('bob', 'table-6-seat-2');
  service.sit('charlie', 'table-7-seat-1');

  service.voiceState('alice', { isMuted: false, isSpeaking: true });

  for (const events of [aliceEvents, bobEvents]) {
    const state = events.filter(event => event.type === 'voice-state').at(-1);
    assert.deepEqual(state, {
      type: 'voice-state', playerId: 'alice', tableId: '6', isMuted: false, isSpeaking: true,
    });
  }
  assert.equal(charlieEvents.some(event => event.type === 'voice-state'), false);
});

test('join sanitizes public profile fields and clamps cup count without altering valid data', () => {
  const service = new RoomService();
  const events = [];
  service.join('profile', {
    roomId: 'public',
    name: '  Linh\u0000\n  ',
    title: '  Night\tTrader ',
    bio: '  Loves charts\u0007 and coffee  ',
    cupsDrunk: 20000,
    color: 'not-a-colour',
  }, event => events.push(event));
  const player = events.at(-1).state.players[0];
  assert.equal(player.name, 'Linh');
  assert.equal(player.title, 'NightTrader');
  assert.equal(player.bio, 'Loves charts and coffee');
  assert.equal(player.cupsDrunk, 9999);
  assert.equal(player.color, '#ad8465');
});

test('private room capacity is authoritative and does not admit a seventh guest', () => {
  const service = new RoomService();
  const { roomId, inviteCode } = service.createPrivateRoom();
  for (let index = 1; index <= 6; index += 1) {
    add(service, `guest-${index}`, { roomId, inviteCode });
  }
  assert.throws(
    () => add(service, 'guest-7', { roomId, inviteCode }),
    /Phòng đã đầy/,
  );
  assert.equal(service.rooms.get(roomId).players.size, 6);
});

test('reporting bad player records report and enforces rate limiting', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  add(service, 'bob');
  service.report('alice', 'bob', 'Spamming messages');
  const reportedEvents = aliceEvents.filter(e => e.type === 'reported');
  assert.equal(reportedEvents.length, 1);
  assert.equal(reportedEvents[0].targetId, 'bob');
  assert.equal(service.reports.length, 1);
  assert.equal(service.reports[0].targetName, 'bob');
  assert.equal(service.reports[0].reason, 'Spamming messages');

  // Rate limit prevents immediate second report
  assert.throws(() => service.report('alice', 'bob', 'Second spam'), /chờ giây lát/);

  // Self-report is rejected
  assert.throws(() => service.report('alice', 'alice', 'Self'), /Không thể tự báo cáo/);
});

test('host can kick player from private room and non-host is rejected', () => {
  const service = new RoomService();
  const { roomId, inviteCode } = service.createPrivateRoom();
  add(service, 'host', { roomId, inviteCode });
  const badGuestEvents = add(service, 'bad-guest', { roomId, inviteCode });

  // bad-guest tries to kick host -> rejected
  assert.throws(() => service.kick('bad-guest', 'host', 'Troll'), /Chỉ Quản trị viên/);

  // host kicks bad-guest -> success
  service.kick('host', 'bad-guest', 'Vi phạm nội quy');
  const kickedEvents = badGuestEvents.filter(e => e.type === 'kicked');
  assert.equal(kickedEvents.length, 1);
  assert.equal(kickedEvents[0].reason, 'Vi phạm nội quy');
  assert.equal(service.rooms.get(roomId).players.has('bad-guest'), false);
});

test('host can mute and unmute player, suppressing chat', () => {
  const service = new RoomService();
  const { roomId, inviteCode } = service.createPrivateRoom();
  add(service, 'host', { roomId, inviteCode });
  const guestEvents = add(service, 'guest', { roomId, inviteCode });

  // Host mutes guest
  service.mute('host', 'guest', true);
  const mutedEvents = guestEvents.filter(e => e.type === 'muted');
  assert.equal(mutedEvents.length, 1);
  assert.equal(mutedEvents[0].isMuted, true);

  // Muted guest cannot send chat
  assert.throws(() => service.chat('guest', 'Hello', 'room'), /tắt tiếng/);

  // Host unmutes guest
  service.mute('host', 'guest', false);
  service.chat('guest', 'Can chat now', 'room');
  assert.equal(service.connections.get('guest').player.isMutedByHost, false);
});

test('host can broadcast announcement to all room players', () => {
  const service = new RoomService();
  const { roomId, inviteCode } = service.createPrivateRoom();
  const hostEvents = add(service, 'host', { roomId, inviteCode });
  const guestEvents = add(service, 'guest', { roomId, inviteCode });

  // Guest tries to broadcast -> rejected
  assert.throws(() => service.announcement('guest', 'Fake news'), /Chỉ Quản trị viên/);

  // Host broadcasts announcement
  service.announcement('host', 'Chào mừng đến với buổi thảo luận!');
  const hostAnnouncements = hostEvents.filter(e => e.type === 'announcement');
  const guestAnnouncements = guestEvents.filter(e => e.type === 'announcement');
  assert.equal(hostAnnouncements.length, 1);
  assert.equal(guestAnnouncements.length, 1);
  assert.equal(guestAnnouncements[0].text, 'Chào mừng đến với buổi thảo luận!');
  assert.equal(guestAnnouncements[0].author, 'host');
});

test('fireworks broadcasts celebration, grants xp, and enforces rate limit', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');
  const bobEvents = add(service, 'bob');

  // Trigger fireworks successfully
  service.fireworks('alice', '+3,500$ BTC Long');
  const fwEventsAlice = aliceEvents.filter(e => e.type === 'fireworks');
  const fwEventsBob = bobEvents.filter(e => e.type === 'fireworks');
  assert.equal(fwEventsAlice.length, 1);
  assert.equal(fwEventsBob.length, 1);
  assert.equal(fwEventsAlice[0].profitText, '+3,500$ BTC Long');

  const playerAlice = service.connections.get('alice').player;
  assert.equal(playerAlice.xp >= 150, true);

  // Calling again immediately is rejected
  assert.throws(() => service.fireworks('alice', 'Another win'), /Vui lòng đợi giây lát/);
});

test('service orders relaxation, awards xp, and rejects invalid service type', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');

  // Valid massage service
  service.service('alice', 'massage-shoulders');
  const sEvents = aliceEvents.filter(e => e.type === 'service');
  assert.equal(sEvents.length, 1);
  assert.equal(sEvents[0].serviceName, 'Xoa bóp cổ vai gáy Trader');
  assert.equal(service.connections.get('alice').player.xp >= 100, true);

  // Invalid service type is rejected
  assert.throws(() => service.service('alice', 'invalid-service'), /Dịch vụ thư giãn không hợp lệ/);
});

test('join assigns virtual phone number and initializes trader level', () => {
  const service = new RoomService();
  add(service, 'trader1', { phone: '098-123-4567', xp: 250 });
  const player = service.connections.get('trader1').player;
  assert.equal(player.phone, '098-123-4567');
  assert.equal(player.xp, 250);
  assert.equal(player.level >= 2, true);

  // Auto-generated phone when not provided
  add(service, 'trader2');
  const player2 = service.connections.get('trader2').player;
  assert.match(player2.phone, /^098-\d{3}-\d{4}$/);
  assert.equal(player2.level, 1);
});

test('initBots populates room with trading bots and handles duplicate calls idempotently', () => {
  const service = new RoomService();
  const bots = service.initBots('public');
  assert.equal(bots.length, 4);
  const room = service.rooms.get('public');
  assert.equal(room.players.has('bot-alex'), true);
  assert.equal(room.players.has('bot-mailinh'), true);
  assert.equal(room.players.has('bot-haidang'), true);
  assert.equal(room.players.has('bot-sarah'), true);

  const alex = room.players.get('bot-alex');
  assert.equal(alex.seatId, 'table-6-seat-1');
  assert.equal(alex.drink, 'Cà phê trứng Hà Nội');
  assert.equal(alex.level, 8);
  assert.equal(alex.isBot, true);

  // Re-calling initBots does not duplicate or corrupt
  service.initBots('public');
  assert.equal(room.players.size, 4);

  // Calling on invalid room throws
  assert.throws(() => service.initBots('nonexistent-room'), /Phòng không tồn tại/);
});

test('triggerNfp broadcasts NFP news event and rejects non-existent room', () => {
  const service = new RoomService();
  const aliceEvents = add(service, 'alice');

  const nfp = service.triggerNfp('public');
  assert.equal(nfp.actual, '254K');
  assert.equal(nfp.forecast, '140K');

  const nfpEvents = aliceEvents.filter(e => e.type === 'nfp-event');
  assert.equal(nfpEvents.length, 1);
  assert.equal(nfpEvents[0].unemploymentRate, '4.1%');

  const announceEvents = aliceEvents.filter(e => e.type === 'announcement');
  assert.equal(announceEvents.some(e => e.text.includes('BREAKING NFP')), true);

  // Calling on invalid room throws
  assert.throws(() => service.triggerNfp('invalid-room'), /Phòng không tồn tại/);
});

