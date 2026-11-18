export type Player = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  seatId: string | null;
  drink?: string | null;
  title?: string;
  bio?: string;
  cupsDrunk?: number;
  phone?: string;
  xp?: number;
  level?: number;
  isHost?: boolean;
  isMutedByHost?: boolean;
};
export type RoomState = {
  id: string;
  name: string;
  kind: 'public' | 'chill' | 'private';
  capacity: number;
  hostId?: string | null;
  players: Player[];
  selfId: string;
};
export type ChatMessage = { id: string; authorId: string; author: string; text: string; scope: 'room' | 'table'; tableId: string | null; timestamp: number };
export type EmoteEvent = { playerId: string; emoji: string; timestamp: number };
export type VoiceSignalEvent = { fromId: string; tableId: string; signal: any };
export type VoicePeerLeftEvent = { peerId: string; tableId: string };
export type VoiceStateEvent = { playerId: string; tableId: string; isMuted: boolean; isSpeaking: boolean };
export type AnnouncementEvent = { text: string; author: string; timestamp: number };
export type KickedEvent = { reason: string };
export type MutedEvent = { isMuted: boolean };
export type FireworksEvent = { type: 'fireworks'; playerId: string; playerName: string; author?: string; profitText: string; timestamp: number };
export type ServiceEvent = { type: 'service'; playerId: string; playerName: string; author?: string; serviceType: string; serviceName: string; timestamp: number };
export type LevelUpEvent = { type: 'level-up'; level: number; xp: number; playerId?: string; playerName?: string; name?: string };
export type NfpEvent = {
  type: 'nfp-event';
  title: string;
  actual: string;
  forecast: string;
  previous: string;
  unemploymentRate: string;
  dxyImpact: string;
  summary: string;
  timestamp: number;
};
export type PublicRoom = { id: string; name: string; kind: 'public' | 'chill'; capacity: number; count: number };
type Position = { x: number; y: number; z: number; rotation: number };
type JoinOptions = { name: string; color: string; roomId: string; inviteCode?: string; title?: string; bio?: string; cupsDrunk?: number; phone?: string; xp?: number; level?: number };

function socketUrl(url?: string): string {
  if (url) return url;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}
function apiUrl(url: string | undefined, path: string): string {
  const base = new URL(socketUrl(url), window.location.href);
  base.protocol = base.protocol === 'wss:' ? 'https:' : 'http:';
  base.pathname = path;
  base.search = '';
  return base.toString();
}

/** Browser-side adapter for the local multiplayer prototype. */
export class CafeClient {
  private socket: WebSocket | null = null;
  private readonly url?: string;
  private stateListeners = new Set<(state: RoomState) => void>();
  private messageListeners = new Set<(message: ChatMessage) => void>();
  private emoteListeners = new Set<(emote: EmoteEvent) => void>();
  private voiceSignalListeners = new Set<(event: VoiceSignalEvent) => void>();
  private voicePeerLeftListeners = new Set<(event: VoicePeerLeftEvent) => void>();
  private voiceCloseListeners = new Set<() => void>();
  private voiceStateListeners = new Set<(event: VoiceStateEvent) => void>();
  private announcementListeners = new Set<(event: AnnouncementEvent) => void>();
  private kickedListeners = new Set<(event: KickedEvent) => void>();
  private mutedListeners = new Set<(event: MutedEvent) => void>();
  private reportedListeners = new Set<(targetId: string) => void>();
  private fireworksListeners = new Set<(event: FireworksEvent) => void>();
  private serviceListeners = new Set<(event: ServiceEvent) => void>();
  private levelUpListeners = new Set<(event: LevelUpEvent) => void>();
  private nfpListeners = new Set<(event: NfpEvent) => void>();
  private errorListeners = new Set<(message: string) => void>();
  private reconnectListeners = new Set<(attempt: number, maxAttempts: number) => void>();

  private lastOptions: JoinOptions | null = null;
  private manualDisconnect: boolean = false;
  private reconnectCount: number = 0;
  private reconnectTimer: number | null = null;

  constructor(url?: string) { this.url = url; }

  static async createPrivateRoom(capacityOrUrl?: number | string, maybeUrl?: string): Promise<{ roomId: string; inviteCode: string; capacity?: number }> {
    let capacity: number | undefined;
    let url: string | undefined;
    if (typeof capacityOrUrl === 'number') {
      capacity = capacityOrUrl;
      url = maybeUrl;
    } else {
      url = capacityOrUrl;
    }
    const endpoint = capacity ? `/api/private-rooms?capacity=${encodeURIComponent(capacity)}` : '/api/private-rooms';
    const response = await fetch(apiUrl(url, endpoint), { method: 'POST' });
    if (!response.ok) throw new Error('Không thể tạo phòng riêng.');
    return response.json();
  }
  static async listRooms(url?: string): Promise<PublicRoom[]> {
    const response = await fetch(apiUrl(url, '/api/rooms'));
    if (!response.ok) throw new Error('Không thể tải danh sách phòng.');
    return response.json();
  }
  onState(listener: (state: RoomState) => void): () => void { this.stateListeners.add(listener); return () => this.stateListeners.delete(listener); }
  onMessage(listener: (message: ChatMessage) => void): () => void { this.messageListeners.add(listener); return () => this.messageListeners.delete(listener); }
  onEmote(listener: (emote: EmoteEvent) => void): () => void { this.emoteListeners.add(listener); return () => this.emoteListeners.delete(listener); }
  onVoiceSignal(listener: (event: VoiceSignalEvent) => void): () => void { this.voiceSignalListeners.add(listener); return () => this.voiceSignalListeners.delete(listener); }
  onVoicePeerLeft(listener: (event: VoicePeerLeftEvent) => void): () => void { this.voicePeerLeftListeners.add(listener); return () => this.voicePeerLeftListeners.delete(listener); }
  onVoiceClose(listener: () => void): () => void { this.voiceCloseListeners.add(listener); return () => this.voiceCloseListeners.delete(listener); }
  onVoiceState(listener: (event: VoiceStateEvent) => void): () => void { this.voiceStateListeners.add(listener); return () => this.voiceStateListeners.delete(listener); }
  onAnnouncement(listener: (event: AnnouncementEvent) => void): () => void { this.announcementListeners.add(listener); return () => this.announcementListeners.delete(listener); }
  onKicked(listener: (event: KickedEvent) => void): () => void { this.kickedListeners.add(listener); return () => this.kickedListeners.delete(listener); }
  onMuted(listener: (event: MutedEvent) => void): () => void { this.mutedListeners.add(listener); return () => this.mutedListeners.delete(listener); }
  onReported(listener: (targetId: string) => void): () => void { this.reportedListeners.add(listener); return () => this.reportedListeners.delete(listener); }
  onFireworks(listener: (event: FireworksEvent) => void): () => void { this.fireworksListeners.add(listener); return () => this.fireworksListeners.delete(listener); }
  onService(listener: (event: ServiceEvent) => void): () => void { this.serviceListeners.add(listener); return () => this.serviceListeners.delete(listener); }
  onLevelUp(listener: (event: LevelUpEvent) => void): () => void { this.levelUpListeners.add(listener); return () => this.levelUpListeners.delete(listener); }
  onNfp(listener: (event: NfpEvent) => void): () => void { this.nfpListeners.add(listener); return () => this.nfpListeners.delete(listener); }
  onError(listener: (message: string) => void): () => void { this.errorListeners.add(listener); return () => this.errorListeners.delete(listener); }
  onReconnect(listener: (attempt: number, maxAttempts: number) => void): () => void { this.reconnectListeners.add(listener); return () => this.reconnectListeners.delete(listener); }

  connect(options: JoinOptions): Promise<void> {
    if (this.reconnectTimer) { window.clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    this.lastOptions = options;
    this.manualDisconnect = false;
    this.disconnect();
    const socket = new WebSocket(socketUrl(this.url));
    this.socket = socket;
    return new Promise((resolve, reject) => {
      let joined = false;
      let settled = false;
      const timer = window.setTimeout(() => {
        if (!settled) { settled = true; socket.close(); reject(new Error('Kết nối quá thời gian.')); }
      }, 10000);
      socket.onopen = () => socket.send(JSON.stringify({ type: 'join', ...options }));
      socket.onmessage = (event) => {
        let data: any;
        try { data = JSON.parse(String(event.data)); } catch { return; }
        if (data.type === 'state') this.stateListeners.forEach((listener) => listener(data.state as RoomState));
        if (data.type === 'chat') this.messageListeners.forEach((listener) => listener(data.message as ChatMessage));
        if (data.type === 'emote') this.emoteListeners.forEach((listener) => listener(data as EmoteEvent));
        if (data.type === 'voice-signal') this.voiceSignalListeners.forEach((l) => l(data as VoiceSignalEvent));
        if (data.type === 'voice-peer-left') this.voicePeerLeftListeners.forEach((l) => l(data as VoicePeerLeftEvent));
        if (data.type === 'voice-close') this.voiceCloseListeners.forEach((l) => l());
        if (data.type === 'voice-state') this.voiceStateListeners.forEach((l) => l(data as VoiceStateEvent));
        if (data.type === 'announcement') this.announcementListeners.forEach((l) => l(data as AnnouncementEvent));
        if (data.type === 'kicked') this.kickedListeners.forEach((l) => l(data as KickedEvent));
        if (data.type === 'muted') this.mutedListeners.forEach((l) => l(data as MutedEvent));
        if (data.type === 'reported') this.reportedListeners.forEach((l) => l(data.targetId));
        if (data.type === 'fireworks') this.fireworksListeners.forEach((l) => l(data as FireworksEvent));
        if (data.type === 'service') this.serviceListeners.forEach((l) => l(data as ServiceEvent));
        if (data.type === 'level-up') this.levelUpListeners.forEach((l) => l(data as LevelUpEvent));
        if (data.type === 'nfp-event') this.nfpListeners.forEach((l) => l(data as NfpEvent));
        if (data.type === 'joined' && !settled) {
          joined = true;
          settled = true;
          this.reconnectCount = 0;
          window.clearTimeout(timer);
          resolve();
        }
        if (data.type === 'error') {
          const message = typeof data.message === 'string' ? data.message : 'Có lỗi kết nối.';
          if (!settled) { settled = true; window.clearTimeout(timer); socket.close(); reject(new Error(message)); }
          else this.errorListeners.forEach((listener) => listener(message));
        }
      };
      socket.onerror = () => {
        if (!settled) { settled = true; window.clearTimeout(timer); reject(new Error('Không kết nối được quán.')); }
      };
      socket.onclose = () => {
        window.clearTimeout(timer);
        if (!settled) {
          settled = true;
          reject(new Error('Kết nối tới quán đã đóng.'));
        } else if (joined && this.socket === socket && !this.manualDisconnect) {
          // Graceful auto-reconnect with exponential backoff (up to 3 attempts)
          if (this.reconnectCount < 3 && this.lastOptions) {
            this.reconnectCount++;
            const delay = Math.min(1500 * Math.pow(1.5, this.reconnectCount - 1), 5000);
            this.reconnectListeners.forEach((l) => l(this.reconnectCount, 3));
            this.reconnectTimer = window.setTimeout(() => {
              if (!this.manualDisconnect && this.lastOptions) {
                this.connect(this.lastOptions).catch(() => { });
              }
            }, delay);
          } else {
            this.errorListeners.forEach((listener) => listener('Mất kết nối tới máy chủ. Vui lòng kiểm tra lại mạng.'));
          }
        }
        if (this.socket === socket) this.socket = null;
      };
    });
  }
  private send(event: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(event));
  }
  move(position: Position): void { this.send({ type: 'move', position }); }
  sit(seatId: string): void { this.send({ type: 'sit', seatId }); }
  stand(): void { this.send({ type: 'stand' }); }
  order(drink: string): void { this.send({ type: 'order', drink }); }
  sendEmote(emoji: string): void { this.send({ type: 'emote', emoji }); }
  sendChat(text: string, scope: 'room' | 'table'): void { this.send({ type: 'chat', text, scope }); }
  sendVoiceSignal(targetId: string, signal: any): void { this.send({ type: 'voice-signal', targetId, signal }); }
  sendVoiceState(state: { isMuted?: boolean; isSpeaking?: boolean }): void { this.send({ type: 'voice-state', ...state }); }
  report(targetId: string, reason: string): void { this.send({ type: 'report', targetId, reason }); }
  kick(targetId: string, reason?: string): void { this.send({ type: 'kick', targetId, reason }); }
  mute(targetId: string, muted: boolean): void { this.send({ type: 'mute', targetId, muted }); }
  sendAnnouncement(text: string): void { this.send({ type: 'announcement', text }); }
  sendFireworks(profitText?: string): void { this.send({ type: 'fireworks', profitText }); }
  requestService(serviceType: string): void { this.send({ type: 'service', serviceType }); }
  awardXp(amount?: number): void { this.send({ type: 'award-xp', amount }); }
  triggerNfp(): void { this.send({ type: 'trigger-nfp' }); }
  disconnect(): void {
    this.manualDisconnect = true;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Manual disconnect');
  }
}
