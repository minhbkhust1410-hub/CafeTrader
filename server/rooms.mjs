import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

const seatPattern = /^table-([1-7])-seat-([1-4])$/;
const shortText = (value, length) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, length)
  : '';
const seatTable = (seat) => seat?.match(seatPattern)?.[1] ?? null;
const safeColor = (color) => typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#ad8465';
const sameSecret = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};
const generatePhone = (id) => {
  const hash = Math.abs(String(id).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 7777777));
  const s = String(hash).padStart(7, '8').slice(-7);
  return `098-${s.slice(0, 3)}-${s.slice(3, 7)}`;
};

/** Authoritative, in-memory prototype. Not an authentication service. */
export class RoomService {
  constructor() {
    this.rooms = new Map([
      ['public', this.newRoom('public', 'Sảnh cà phê', 'public', 28)],
      ['chill', this.newRoom('chill', 'Góc tĩnh lặng', 'chill', 28)],
    ]);
    this.connections = new Map();
    this.lastChatTimes = new Map();
    this.lastEmoteTimes = new Map();
    this.lastReportTimes = new Map();
    this.reports = [];
  }
  newRoom(id, name, kind, capacity, inviteCode = null) {
    return { id, name, kind, capacity, inviteCode, hostId: null, players: new Map() };
  }
  publicRooms() {
    return [...this.rooms.values()].filter((r) => r.kind !== 'private').map((r) => ({
      id: r.id, name: r.name, kind: r.kind, capacity: r.capacity, count: r.players.size,
    }));
  }
  createPrivateRoom(capacity = 6) {
    const privateRooms = [...this.rooms.values()].filter((r) => r.kind === 'private');
    if (privateRooms.length >= 100) throw new Error('Không thể tạo thêm phòng riêng.');
    if (![2, 6, 8].includes(capacity)) throw new Error('Sức chứa phòng riêng không hợp lệ.');
    const roomId = `private-${randomBytes(8).toString('hex')}`;
    const inviteCode = randomBytes(16).toString('hex');
    const roomName = capacity === 2 ? 'Suite đôi riêng tư' : capacity === 8 ? 'Salon riêng nhóm' : 'Bàn riêng';
    this.rooms.set(roomId, this.newRoom(roomId, roomName, 'private', capacity, inviteCode));
    return { roomId, inviteCode, capacity };
  }
  join(connectionId, options, send) {
    if (this.connections.has(connectionId)) throw new Error('Bạn đã vào một phòng.');
    const room = this.rooms.get(options?.roomId);
    if (!room || (room.kind === 'private' && !sameSecret(room.inviteCode, options?.inviteCode))) {
      throw new Error('Phòng không có sẵn hoặc lời mời không hợp lệ.');
    }
    if (room.players.size >= room.capacity) throw new Error('Phòng đã đầy.');
    const name = shortText(options?.name, 32);
    if (!name) throw new Error('Vui lòng nhập tên.');
    const title = shortText(options?.title, 32) || 'Trader Tĩnh Lặng';
    const bio = shortText(options?.bio, 120);
    const cupsDrunk = Math.max(0, Math.min(9999, Number(options?.cupsDrunk) || 0));
    const phone = shortText(options?.phone, 20) || generatePhone(connectionId);
    const xp = Math.max(0, Math.min(999999, Number(options?.xp) || 0));
    const level = Math.max(1, Math.min(100, Number(options?.level) || Math.floor(Math.sqrt(xp / 100)) + 1));
    if (room.kind === 'private' && !room.hostId) {
      room.hostId = connectionId;
    }
    const player = {
      id: connectionId,
      name,
      title,
      bio,
      cupsDrunk,
      phone,
      xp,
      level,
      color: safeColor(options?.color),
      x: 0,
      y: 0,
      z: 4,
      rotation: 0,
      seatId: null,
      drink: null,
      isMutedByHost: false,
    };
    room.players.set(connectionId, player);
    this.connections.set(connectionId, { room, player, send });
    this.broadcastState(room);
    return player;
  }
  send(connectionId, event) {
    const connection = this.connections.get(connectionId);
    if (connection) connection.send(event);
  }
  state(connection) {
    const { room, player } = connection;
    return {
      id: room.id,
      name: room.name,
      kind: room.kind,
      capacity: room.capacity,
      hostId: room.hostId || null,
      players: [...room.players.values()].map(p => ({ ...p, isHost: p.id === room.hostId })),
      selfId: player.id
    };
  }
  broadcastState(room) {
    for (const player of room.players.values()) {
      const connection = this.connections.get(player.id);
      if (connection) connection.send({ type: 'state', state: this.state(connection) });
    }
  }
  move(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.player.seatId) return;
    const { x, y, z, rotation } = data ?? {};
    if (![x, y, z, rotation].every((n) => typeof n === 'number' && Number.isFinite(n))) throw new Error('Vị trí không hợp lệ.');
    // Royal villa map: broad estate and eight accessible vertical levels.
    if (Math.abs(x) > 32 || Math.abs(z) > 38 || y < -1 || y > 28) throw new Error('Vị trí ngoài khu vực.');
    Object.assign(connection.player, { x, y, z, rotation });
    this.broadcastState(connection.room);
  }
  sit(connectionId, seatId) {
    const connection = this.connections.get(connectionId);
    if (!connection || typeof seatId !== 'string' || !seatPattern.test(seatId)) throw new Error('Ghế không hợp lệ.');
    if ([...connection.room.players.values()].some((p) => p.id !== connectionId && p.seatId === seatId)) {
      throw new Error('Ghế vừa có người ngồi. Vui lòng chọn ghế khác.');
    }
    connection.player.seatId = seatId;
    this.broadcastState(connection.room);
  }
  stand(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const oldTable = seatTable(connection.player.seatId);
    connection.player.seatId = null;
    connection.player.drink = null;
    this.broadcastState(connection.room);
    if (oldTable) {
      for (const player of connection.room.players.values()) {
        if (player.id !== connectionId && seatTable(player.seatId) === oldTable) {
          this.send(player.id, { type: 'voice-peer-left', peerId: connectionId, tableId: oldTable });
        }
      }
      this.send(connectionId, { type: 'voice-close' });
    }
  }
  leave(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const { room, player } = connection;
    const oldTable = seatTable(player.seatId);
    room.players.delete(connectionId);
    this.connections.delete(connectionId);
    if (room.kind === 'private' && room.hostId === connectionId) {
      const nextPlayer = room.players.values().next().value;
      room.hostId = nextPlayer ? nextPlayer.id : null;
    }
    this.broadcastState(room);
    if (oldTable) {
      for (const other of room.players.values()) {
        if (seatTable(other.seatId) === oldTable) {
          this.send(other.id, { type: 'voice-peer-left', peerId: connectionId, tableId: oldTable });
        }
      }
    }
    if (room.kind === 'private' && room.players.size === 0) {
      this.rooms.delete(room.id);
    }
  }
  voiceSignal(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const table = seatTable(connection.player.seatId);
    if (!table) throw new Error('Chỉ có thể dùng voice chat khi đang ngồi tại bàn.');
    if (!data?.targetId || !data?.signal) return;
    const target = this.connections.get(data.targetId);
    if (!target || target.room.id !== connection.room.id || seatTable(target.player.seatId) !== table) {
      throw new Error('Không thể gửi tín hiệu thoại ra ngoài bàn.');
    }
    this.send(data.targetId, {
      type: 'voice-signal',
      fromId: connectionId,
      tableId: table,
      signal: data.signal,
    });
  }
  voiceState(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const table = seatTable(connection.player.seatId);
    if (!table) return;
    const payload = {
      type: 'voice-state',
      playerId: connectionId,
      tableId: table,
      isMuted: Boolean(data?.isMuted),
      isSpeaking: Boolean(data?.isSpeaking),
    };
    for (const player of connection.room.players.values()) {
      if (seatTable(player.seatId) === table) {
        this.send(player.id, payload);
      }
    }
  }
  order(connectionId, drink) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const cleaned = shortText(drink, 60);
    connection.player.drink = cleaned || null;
    this.broadcastState(connection.room);
    if (cleaned) {
      const table = seatTable(connection.player.seatId);
      const tableName = table ? `Bàn ${table}` : 'bàn';
      const baristaMsg = {
        id: randomUUID(),
        authorId: 'barista',
        author: '☕ Barista',
        text: `Đã pha xong "${cleaned}" mang tới ${tableName} cho ${connection.player.name}. Chúc bạn thưởng thức vui vẻ! ✨`,
        scope: 'room',
        tableId: table ? `table-${table}` : null,
        timestamp: Date.now(),
      };
      for (const player of connection.room.players.values()) {
        this.send(player.id, { type: 'chat', message: baristaMsg });
      }
    }
  }
  emote(connectionId, emoji) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const cleaned = shortText(emoji, 12);
    if (!cleaned) return;
    const event = { type: 'emote', playerId: connectionId, emoji: cleaned, timestamp: Date.now() };
    for (const player of connection.room.players.values()) {
      this.send(player.id, event);
    }
  }
  chat(connectionId, text, scope) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    if (connection.player.isMutedByHost) {
      throw new Error('Bạn đang bị tắt tiếng bởi Quản trị viên phòng.');
    }
    const cleaned = shortText(text, 500);
    if (!cleaned || !['room', 'table'].includes(scope)) throw new Error('Tin nhắn không hợp lệ.');
    const table = seatTable(connection.player.seatId);
    if (scope === 'table' && !table) throw new Error('Hãy ngồi vào bàn để nhắn riêng.');
    const message = { id: randomUUID(), authorId: connection.player.id, author: connection.player.name, text: cleaned, scope, tableId: table ? `table-${table}` : null, timestamp: Date.now() };
    for (const player of connection.room.players.values()) {
      if (scope === 'room' || seatTable(player.seatId) === table) this.send(player.id, { type: 'chat', message });
    }
  }

  fireworks(connectionId, profitText) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const last = this.lastEmoteTimes.get(`fw-${connectionId}`) || 0;
    if (Date.now() - last < 2500) {
      throw new Error('Vui lòng đợi giây lát giữa các lần bắn pháo hoa.');
    }
    this.lastEmoteTimes.set(`fw-${connectionId}`, Date.now());

    const cleanedProfit = shortText(profitText, 80) || 'Chốt Lời Thành Công';
    connection.player.xp = (connection.player.xp || 0) + 150;
    connection.player.level = Math.max(connection.player.level || 1, Math.floor(Math.sqrt(connection.player.xp / 100)) + 1);

    const event = {
      type: 'fireworks',
      playerId: connectionId,
      playerName: connection.player.name,
      profitText: cleanedProfit,
      timestamp: Date.now(),
    };
    const announcement = {
      type: 'announcement',
      author: '🎆 PHÁO HOA CHÚC MỪNG',
      text: `Chúc mừng Trader ${connection.player.name} vừa chốt lời rực rỡ [${cleanedProfit}]! Cả biệt thự cùng chung vui! 🎉`,
      timestamp: Date.now(),
    };
    for (const player of connection.room.players.values()) {
      this.send(player.id, event);
      this.send(player.id, announcement);
    }
    this.broadcastState(connection.room);
  }

  service(connectionId, serviceType) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const validServices = {
      'massage-shoulders': 'Xoa bóp cổ vai gáy Trader',
      'massage-head': 'Bấm huyệt tĩnh tâm thư thái',
      'zen-aromatherapy': 'Xông tinh dầu trầm hương & chuông xoay',
    };
    const serviceName = validServices[serviceType];
    if (!serviceName) throw new Error('Dịch vụ thư giãn không hợp lệ.');

    connection.player.xp = (connection.player.xp || 0) + 100;
    connection.player.level = Math.max(connection.player.level || 1, Math.floor(Math.sqrt(connection.player.xp / 100)) + 1);

    const event = {
      type: 'service',
      playerId: connectionId,
      playerName: connection.player.name,
      serviceType,
      serviceName,
      timestamp: Date.now(),
    };
    const message = {
      id: randomUUID(),
      authorId: 'spa-wellness',
      author: '🌿 Wellness Spa',
      text: `${connection.player.name} vừa trải nghiệm "${serviceName}". Tinh thần thư thái, hồi phục năng lượng giao dịch! ✨`,
      scope: 'room',
      tableId: null,
      timestamp: Date.now(),
    };
    for (const player of connection.room.players.values()) {
      this.send(player.id, event);
      this.send(player.id, { type: 'chat', message });
    }
    this.broadcastState(connection.room);
  }

  awardXp(connectionId, amount = 10) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const clamped = Math.max(1, Math.min(500, Number(amount) || 10));
    connection.player.xp = (connection.player.xp || 0) + clamped;
    const newLevel = Math.max(connection.player.level || 1, Math.floor(Math.sqrt(connection.player.xp / 100)) + 1);
    const leveledUp = newLevel > (connection.player.level || 1);
    connection.player.level = newLevel;
    this.broadcastState(connection.room);
    if (leveledUp) {
      this.send(connectionId, { type: 'level-up', level: newLevel, xp: connection.player.xp });
    }
  }

  report(connectionId, targetId, reason) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    if (!targetId || typeof targetId !== 'string') throw new Error('Mục tiêu báo cáo không hợp lệ.');
    if (targetId === connectionId) throw new Error('Không thể tự báo cáo chính mình.');
    const targetConn = this.connections.get(targetId);
    if (!targetConn || targetConn.room.id !== connection.room.id) {
      throw new Error('Người chơi này không còn trong phòng.');
    }
    const cleanedReason = shortText(reason, 120);
    if (!cleanedReason) throw new Error('Vui lòng nêu lý do báo cáo.');

    const lastReport = this.lastReportTimes.get(connectionId) || 0;
    if (Date.now() - lastReport < 5000) {
      throw new Error('Vui lòng chờ giây lát trước khi gửi báo cáo tiếp theo.');
    }
    this.lastReportTimes.set(connectionId, Date.now());

    const reportEntry = {
      id: randomUUID(),
      reporterId: connectionId,
      targetId,
      targetName: targetConn.player.name,
      roomId: connection.room.id,
      reason: cleanedReason,
      timestamp: Date.now(),
    };
    this.reports.push(reportEntry);
    if (this.reports.length > 200) this.reports.shift();

    this.send(connectionId, { type: 'reported', targetId });
  }

  kick(connectionId, targetId, reason) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const { room } = connection;
    if (room.hostId !== connectionId) {
      throw new Error('Chỉ Quản trị viên phòng mới có quyền mời rời phòng.');
    }
    if (targetId === connectionId) throw new Error('Không thể tự mời bản thân rời phòng.');
    const targetConn = this.connections.get(targetId);
    if (!targetConn || targetConn.room.id !== room.id) {
      throw new Error('Người chơi không có trong phòng này.');
    }
    const cleanedReason = shortText(reason, 120) || 'Vi phạm nội quy phòng.';
    this.send(targetId, { type: 'kicked', reason: cleanedReason });
    this.leave(targetId);
  }

  mute(connectionId, targetId, muted) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const { room } = connection;
    if (room.hostId !== connectionId) {
      throw new Error('Chỉ Quản trị viên phòng mới có quyền tắt tiếng.');
    }
    if (targetId === connectionId) throw new Error('Không thể tự tắt tiếng bản thân.');
    const targetConn = this.connections.get(targetId);
    if (!targetConn || targetConn.room.id !== room.id) {
      throw new Error('Người chơi không có trong phòng này.');
    }
    targetConn.player.isMutedByHost = Boolean(muted);
    this.send(targetId, { type: 'muted', isMuted: Boolean(muted) });
    this.broadcastState(room);
  }

  announcement(connectionId, text) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    const { room } = connection;
    if (room.hostId !== connectionId) {
      throw new Error('Chỉ Quản trị viên phòng mới có quyền phát thông báo.');
    }
    const cleaned = shortText(text, 200);
    if (!cleaned) throw new Error('Nội dung thông báo không được để trống.');
    const msg = {
      type: 'announcement',
      text: cleaned,
      author: connection.player.name,
      timestamp: Date.now(),
    };
    for (const player of room.players.values()) {
      this.send(player.id, msg);
    }
  }

  initBots(roomId = 'public') {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Phòng không tồn tại.');
    const BOT_DEFINITIONS = [
      {
        id: 'bot-alex',
        name: 'Alex Trần',
        title: '🐋 Cá Voi Đại Dương',
        bio: 'Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn.',
        cupsDrunk: 38,
        phone: '098-888-9999',
        xp: 6400,
        level: 8,
        color: '#d49b58',
        x: -3.8,
        y: 3.2,
        z: 1.75,
        rotation: 0,
        seatId: 'table-6-seat-1',
        drink: 'Cà phê trứng Hà Nội',
        isBot: true,
      },
      {
        id: 'bot-mailinh',
        name: 'Mai Linh',
        title: 'Lướt Sóng Bậc Thầy',
        bio: 'Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do.',
        cupsDrunk: 24,
        phone: '098-666-8888',
        xp: 2500,
        level: 5,
        color: '#2d6a4f',
        x: -5.4,
        y: 0,
        z: -1.65,
        rotation: Math.PI,
        seatId: 'table-1-seat-3',
        drink: 'Trà hoa cúc mật ong',
        isBot: true,
      },
      {
        id: 'bot-haidang',
        name: 'Hải Đăng',
        title: 'Bàn Tay Kim Cương',
        bio: 'Chuyên gia Scalping nến giật. Canh tin NFP & FOMC.',
        cupsDrunk: 42,
        phone: '098-777-5555',
        xp: 4900,
        level: 7,
        color: '#b2533e',
        x: -4.35,
        y: 0,
        z: 1.35,
        rotation: -Math.PI / 2,
        seatId: 'table-2-seat-2',
        drink: 'Espresso đậm đặc',
        isBot: true,
      },
      {
        id: 'bot-sarah',
        name: 'Sarah Jenkins',
        title: 'Huyền Thoại Market',
        bio: 'Global Macro & Liquidity Cycles. Data-driven mindset.',
        cupsDrunk: 55,
        phone: '098-999-3333',
        xp: 8100,
        level: 9,
        color: '#34495e',
        x: -1.5,
        y: 0,
        z: -0.45,
        rotation: Math.PI,
        seatId: 'table-4-seat-3',
        drink: 'Cold Brew ủ lạnh',
        isBot: true,
      },
    ];

    for (const b of BOT_DEFINITIONS) {
      if (!room.players.has(b.id)) {
        room.players.set(b.id, { ...b, isMutedByHost: false });
      }
    }
    this.broadcastState(room);
    return BOT_DEFINITIONS;
  }

  triggerNfp(roomId = 'public') {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Phòng không tồn tại.');
    const nfpEvent = {
      type: 'nfp-event',
      title: 'BẢNG LƯƠNG PHI NÔNG NGHIỆP MỸ (NFP)',
      actual: '254K',
      forecast: '140K',
      previous: '159K',
      unemploymentRate: '4.1%',
      dxyImpact: '+75 pips',
      summary: 'Dữ liệu việc làm Mỹ tháng này đạt 254K việc làm mới, vượt xa dự báo 140K. Tỷ lệ thất nghiệp giảm xuống 4.1%. Chỉ số DXY tăng vọt, thị trường biến động cực mạnh!',
      timestamp: Date.now(),
    };
    for (const player of room.players.values()) {
      this.send(player.id, nfpEvent);
      this.send(player.id, {
        type: 'announcement',
        author: 'MARKET NEWSWIRE',
        text: '🔴 [BREAKING NFP] Bảng Lương Phi Nông Nghiệp: 254K (Dự báo 140K) · Thất nghiệp 4.1%! DXY tăng vọt!',
        timestamp: Date.now(),
      });
    }
    return nfpEvent;
  }
}
