import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import CafeScene, { type ActiveEmote, type PerformanceStats } from './CafeScene';
import { CafeClient, type ChatMessage, type RoomState, type NfpEvent, type Player } from './network/client';
import { chillAudio, type ChillPreset } from './audio/chillAudio';
import { tableVoice, type VoicePeerStatus } from './audio/tableVoice';
import { botVoice, BOT_PERSONAS, BOT_LIST, type BotId } from './audio/botVoice';
import TouchController from './components/TouchController';
import TraderTerminalModal from './components/TraderTerminalModal';
import ConciergePanel, { type ConciergeAction } from './components/ConciergePanel';
import PhotoModeOverlay, { type PhotoPresetId, type PhotoCaptureConfig } from './components/PhotoModeOverlay';
import TableMenuPages from './components/TableMenuPages';
import { staffVoice, STAFF_VOICE, type StaffId } from './audio/staffVoice';
import { vietnameseTts, type TtsEngineMode } from './audio/vietnameseTts';
import { CAFE_MENU } from './data/cafeMenu';
import './App.css';

type CameraMode = 'first' | 'third';
type Tab = 'tables' | 'guests' | 'chat' | 'menu' | 'music';

const colors = [
  '#8c4e2d', // Cognac Brown
  '#d49b58', // Amber Gold
  '#3d2314', // Espresso Roast
  '#2d6a4f', // Emerald Forest
  '#34495e', // Midnight Slate
  '#b2533e', // Terracotta Rust
];

export type TraderBadge =
  | '🧘 Zen Trader'
  | '⚡ Scalper'
  | '📈 Swing Trader'
  | '💎 HODLer'
  | '🌐 Macro Analyst'
  | '🎯 Arbitrageur';

const TRADER_BADGES: TraderBadge[] = [
  '🧘 Zen Trader',
  '⚡ Scalper',
  '📈 Swing Trader',
  '💎 HODLer',
  '🌐 Macro Analyst',
  '🎯 Arbitrageur',
];

export const FLOOR_NAMES: Record<number, { title: string; subtitle: string; icon: string }> = {
  1: { title: 'TẦNG 1 · SẢNH LỚN & HEARTH HALL', subtitle: 'Lò sưởi Travertine, Quầy bar & Sân vườn', icon: '🪵' },
  2: { title: 'TẦNG 2 · VIP SKYLINE LOUNGE', subtitle: 'Gác lửng VIP, Night Terrace & Focus Library', icon: '👑' },
  3: { title: 'TẦNG 3 · ROYAL SALON', subtitle: 'Hội đàm thượng lưu & Ban công view Chill', icon: '🏛️' },
  4: { title: 'TẦNG 4 · GOLDEN GALLERY', subtitle: 'Triển lãm thành tựu & Ban công ngắm đài phun nước', icon: '✨' },
  5: { title: 'TẦNG 5 · EMERALD CONSERVATORY', subtitle: 'Vườn kính thảo mộc & Góc tĩnh tâm', icon: '🌿' },
  6: { title: 'TẦNG 6 · CROWN LIBRARY & STUDY', subtitle: 'Thư viện hoàng gia & Co-working yên tĩnh', icon: '📚' },
  7: { title: 'TẦNG 7 · IMPERIAL TERRACE', subtitle: 'Sunset Lounge & Ban công ngắm hoàng hôn', icon: '🌅' },
  8: { title: 'TẦNG 8 · SKY OBSERVATORY', subtitle: 'Đài thiên văn trên mây & Toàn cảnh biệt thự', icon: '🌌' },
};

export type TraderProfile = {
  name: string;
  badge: TraderBadge;
  title: string;
  bio: string;
  color: string;
  cupsDrunk: number;
  phone?: string;
  xp?: number;
  level?: number;
};

export function getTraderLevelTitle(lvl: number): string {
  if (lvl >= 10) return '🏆 Huyền Thoại Market';
  if (lvl >= 8) return '🐋 Cá Voi Đại Dương';
  if (lvl >= 6) return '💎 Bàn Tay Kim Cương';
  if (lvl >= 4) return '🌊 Lướt Sóng Bậc Thầy';
  if (lvl >= 2) return '📈 Scalper Kỷ Luật';
  return '🌱 Trader Khởi Điểm';
}

export function getXpForLevel(lvl: number): number {
  return (lvl - 1) * (lvl - 1) * 100;
}

export function getXpForNextLevel(lvl: number): number {
  return lvl * lvl * 100;
}

function generateRandomPhone(): string {
  const mid = Math.floor(100 + Math.random() * 900);
  const end = Math.floor(1000 + Math.random() * 9000);
  return `098-${mid}-${end}`;
}

const DEFAULT_PROFILE: TraderProfile = {
  name: '',
  badge: '🧘 Zen Trader',
  title: 'Trader Tĩnh Lặng',
  bio: 'Nhâm nhi cà phê và quan sát thị trường.',
  color: colors[0],
  cupsDrunk: 0,
  phone: '098-888-6868',
  xp: 100,
  level: 1,
};

function loadStoredProfile(): TraderProfile {
  try {
    const raw = localStorage.getItem('cafetrader_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        phone: parsed.phone || generateRandomPhone(),
        xp: typeof parsed.xp === 'number' ? parsed.xp : 100,
        level: typeof parsed.level === 'number' ? parsed.level : 1,
      };
    }
  } catch { }
  return { ...DEFAULT_PROFILE, phone: generateRandomPhone() };
}

function saveStoredProfile(profile: TraderProfile) {
  try {
    localStorage.setItem('cafetrader_profile', JSON.stringify(profile));
  } catch { }
}

const tables = [
  // Tầng 1: Sảnh Lò Sưởi Hearth Hall & Quầy Bar
  { id: 1, title: 'Bàn Cửa Sổ · Hearth Hall', detail: 'Tầng 1 · Cửa kính nhìn phố mưa, ánh sáng amber ấm áp', floor: 1, zone: 'hearth', vip: false, mood: 'Ngắm mưa', sound: 'Êm vừa', bestFor: 'Trò chuyện 2–4 người' },
  { id: 2, title: 'Bàn Lò Sưởi Fireside', detail: 'Tầng 1 · Ngồi bên ngọn lửa bập bùng, ghế bành da cognac', floor: 1, zone: 'hearth', vip: false, mood: 'Ấm áp', sound: 'Rất êm', bestFor: 'Đọc sách · hẹn hò' },
  { id: 3, title: 'Bàn Giao Lưu Market Table', detail: 'Tầng 1 · Không gian mở, tầm nhìn hướng Trader Terminal', floor: 1, zone: 'hearth', vip: false, mood: 'Cởi mở', sound: 'Sôi nổi', bestFor: 'Gặp gỡ cộng đồng' },
  { id: 4, title: 'Bàn Thư Viện Focus', detail: 'Tầng 1 · Kệ sách trading, yên tĩnh làm việc & đọc sách', floor: 1, zone: 'focus', vip: false, mood: 'Tập trung', sound: 'Yên tĩnh', bestFor: 'Làm việc sâu' },
  { id: 5, title: 'Bàn Quầy Barista', detail: 'Tầng 1 · Gần hương espresso thơm nồng & quy trình pha chế', floor: 1, zone: 'hearth', vip: false, mood: 'Thơm cà phê', sound: 'Êm vừa', bestFor: 'Xem barista pha chế' },
  // Tầng 2: Focus Library & Private Lounge
  { id: 6, title: 'Ban công VIP Skyline', detail: 'Tầng 2 · Lan can kính dát vàng, view triệu đô ngắm phố đêm', floor: 2, zone: 'lounge', vip: true, mood: 'Toàn cảnh', sound: 'Riêng tư', bestFor: 'Khách mời đặc biệt' },
  { id: 7, title: 'Executive Marble Lounge', detail: 'Tầng 2 · Sofa da Chesterfield & Bàn cẩm thạch Calacatta', floor: 2, zone: 'lounge', vip: true, mood: 'Trang trọng', sound: 'Rất êm', bestFor: 'Trao đổi kín' },
];

const drinks = [
  { icon: '☕', title: 'Cà phê phin đen đá', desc: 'Đậm đà, nguyên chất hạt Robusta Buôn Ma Thuột', tag: 'NGUYÊN BẢN' },
  { icon: '🥛', title: 'Cà phê sữa đá Sài Gòn', desc: 'Ngọt bùi sữa đặc, thơm nồng vị cà phê truyền thống', tag: 'ĐƯỢC YÊU THÍCH' },
  { icon: '☕', title: 'Bạc xỉu ba tầng', desc: 'Nhiều sữa ít cà phê, dịu ngọt và nhẹ nhàng', tag: 'ÊM DỊU' },
  { icon: '🧁', title: 'Cà phê trứng Hà Nội', desc: 'Kem trứng béo ngậy bông xốp trên nền cà phê nóng', tag: 'ẤM NÓNG' },
  { icon: '🍵', title: 'Matcha Latte', desc: 'Trà xanh Nhật Bản thơm ngát cùng sữa tươi thanh ngọt', tag: 'THANH MÁT' },
  { icon: '🍑', title: 'Trà đào cam sả', desc: 'Chút chua ngọt mát lành, sảng khoái ngày dài', tag: 'TƯƠI MỚI' },
  { icon: '🍫', title: 'Cacao nóng marshmallow', desc: 'Ngọt ấm đậm đà cùng những viên kẹo dẻo xốp mịn', tag: 'ẤM ÁP' },
  { icon: '🪷', title: 'Trà sen vàng', desc: 'Hương sen thanh khiết cho tâm trí thư thái nhẹ nhõm', tag: 'TĨNH LẶNG' },
];

const EMOTES = ['☕', '❤️', '🌿', '📈', '✨', '🥂'];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const shapes: Record<string, ReactNode> = {
    coffee: <><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M17 9h1a2.5 2.5 0 0 1 0 5h-1M4 21h14M8 3v2M12 3v2" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1a5.5 5.5 0 0 1 11 0v1M17 5.5a3 3 0 0 1 0 5.8M17 13a4 4 0 0 1 3.5 4v2" /></>,
    volume: <><path d="M4 10v4h4l5 4V6l-5 4zM16 9a5 5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></>,
    volumeMute: <><path d="M4 10v4h4l5 4V6l-5 4zM23 9l-6 6M17 9l6 6" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5c-1.4 0-2.6-.3-3.7-1L4 19l1.1-4A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h.1M12 11h.1M16 11h.1" /></>,
    music: <><path d="M9 18V5l9-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="15.5" cy="16" r="2.5" /></>,
    menu: <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></>,
    view: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></>,
    exit: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    send: <><path d="m4 4 16 8-16 8 3-8zM7 12h13" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    sparkle: <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />,
    stairs: <><path d="M3 21h4v-4h4v-4h4V9h4V3" /><path d="M3 21v-4" /></>,
    flag: <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    gauge: <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="m14 12 4-4" /><path d="M2.05 13a10 10 0 1 1 19.9 0" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    ban: <><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></>,
    megaphone: <><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>,
    badgeCheck: <><path d="m9 12 2 2 4-4" /><path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand-mark"><Icon name="coffee" size={19} /></span>
      <span className="brand-name">café<span>trader</span><small>THE CHILL SOCIAL CAFÉ</small></span>
    </span>
  );
}

export default function App() {
  const initialProfile = useRef<TraderProfile>(loadStoredProfile());
  const [profile, setProfile] = useState<TraderProfile>(initialProfile.current);
  const [profileOpen, setProfileOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [name, setName] = useState(initialProfile.current.name);
  const [color, setColor] = useState(initialProfile.current.color || colors[0]);
  const [cupsDrunk, setCupsDrunk] = useState(initialProfile.current.cupsDrunk || 0);
  const [profileBadge, setProfileBadge] = useState<TraderBadge>(initialProfile.current.badge || '🧘 Zen Trader');
  const [profileBio, setProfileBio] = useState(initialProfile.current.bio || '');

  // T22 Fireworks, Massage, Leveling & Trader Virtual Phone
  const [fireworksNonce, setFireworksNonce] = useState(0);
  const [massageActive, setMassageActive] = useState(false);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffId>('concierge-minh-an');
  const [bartenderDialogue, setBartenderDialogue] = useState<string | null>(null);
  const bartenderDialogueTimerRef = useRef<number | null>(null);
  const [profitInput, setProfitInput] = useState('');
  const [xp, setXp] = useState(initialProfile.current.xp ?? 100);
  const [level, setLevel] = useState(initialProfile.current.level ?? 1);
  const [phone, setPhone] = useState(initialProfile.current.phone ?? '098-888-6868');
  const xpRef = useRef(xp);
  xpRef.current = xp;
  const levelRef = useRef(level);
  levelRef.current = level;
  const phoneRef = useRef(phone);
  phoneRef.current = phone;

  // Host Announcement & Moderation state (T21)
  const [activeAnnouncement, setActiveAnnouncement] = useState<{ text: string; author: string; timestamp: number } | null>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [reportModalPlayer, setReportModalPlayer] = useState<{ targetId: string; targetName: string } | null>(null);
  const [reportReason, setReportReason] = useState('Spam tin nhắn hoặc biểu cảm liên tục');

  const [cameraMode, setCameraMode] = useState<CameraMode>('third');
  const [seat, setSeat] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('tables');
  const [tableMenuSuggestionId, setTableMenuSuggestionId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ordered, setOrdered] = useState<string | null>(null);

  // Multi-floor & Zone state (8-Storey Royal Villa)
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [floorJump, setFloorJump] = useState<{ floor: number; nonce: number } | null>(null);
  const [floorFilter, setFloorFilter] = useState<'all' | 1 | 2 | 'hearth' | 'focus' | 'lounge'>('all');
  const [activePOV, setActivePOV] = useState<'arrival' | 'hearth' | 'library' | 'terrace' | null>(null);

  const jumpToFloor = (floor: number) => {
    const f = Math.max(1, Math.min(8, floor));
    chillAudio.playUiClick();
    setFloorJump({ floor: f, nonce: Date.now() });
    setCurrentFloor(f);
    const info = FLOOR_NAMES[f] || FLOOR_NAMES[1];
    showToast(`👑 ${info.icon} Thang máy Royal Lift: ${info.title}`);
  };

  // Photo Mode state (T07, T20, T22)
  const [photoModeOpen, setPhotoModeOpen] = useState(false);
  const [photoPreset, setPhotoPreset] = useState<PhotoPresetId>('current');
  const [photoFov, setPhotoFov] = useState(1.10);
  const [captureTrigger, setCaptureTrigger] = useState<{ nonce: number } | null>(null);
  const [capturedRawImage, setCapturedRawImage] = useState<string | null>(null);

  // Rooms state
  const [room, setRoom] = useState<'Quán chính' | 'Góc chill' | 'Phòng riêng'>('Quán chính');
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(null);
  const [privateInviteCode, setPrivateInviteCode] = useState<string | null>(null);
  const [inputInviteCode, setInputInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [connection, setConnection] = useState<'connecting' | 'live' | 'offline'>('offline');

  // Chat, Spam Protection, Block & Report (T15)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatScope, setChatScope] = useState<'room' | 'table'>('room');
  const [networkError, setNetworkError] = useState('');
  const [activeEmotes, setActiveEmotes] = useState<ActiveEmote[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [reportedMsgIds, setReportedMsgIds] = useState<Set<string>>(new Set());
  const [lastChatTime, setLastChatTime] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Performance Stats & T08
  const [stats, setStats] = useState<PerformanceStats>({ fps: 60, frameTime: 16.6, meshes: 85 });
  const [showStats, setShowStats] = useState(false);

  // T14 WebRTC Table Voice Chat States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [peerVoiceStates, setPeerVoiceStates] = useState<Map<string, VoicePeerStatus>>(new Map());

  // T20 Mobile Touch & Virtual Joystick States
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 960;
  });

  // T07 Accessibility & Reduced Motion Mode
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  });

  // T16 Trader Terminal Modal State
  const [terminalOpen, setTerminalOpen] = useState(false);

  // T17/T18 Realistic Beverage Order & Brewing Process Lifecycle
  const [orderState, setOrderState] = useState<'idle' | 'brewing' | 'served'>('idle');
  const [brewingDrink, setBrewingDrink] = useState<string | null>(null);
  const [brewingSecondsLeft, setBrewingSecondsLeft] = useState(0);
  const brewingTimerRef = useRef<number | null>(null);

  // BOT Trader & NFP Market States
  const [botVoiceEnabled, setBotVoiceEnabled] = useState<boolean>(() => botVoice.isVoiceEnabled());
  const [ttsEngine, setTtsEngine] = useState<TtsEngineMode>(() => vietnameseTts.getEngineMode());
  const [botSpeakingIds, setBotSpeakingIds] = useState<Set<string>>(new Set());
  const [nfpModalOpen, setNfpModalOpen] = useState(false);
  const [activeNfp, setActiveNfp] = useState<NfpEvent | null>(null);
  const lastGreetedTableRef = useRef<string | null>(null);

  const speakingPlayerIds = new Set<string>();
  if (isLocalSpeaking && !isMicMuted) {
    speakingPlayerIds.add('local');
    if (roomState?.selfId) speakingPlayerIds.add(roomState.selfId);
  }
  peerVoiceStates.forEach((peer, id) => {
    if (peer.isSpeaking && !peer.isMuted) speakingPlayerIds.add(id);
  });
  botSpeakingIds.forEach((id) => {
    speakingPlayerIds.add(id);
  });

  // Soundscape & Audio Controls
  const [audioMuted, setAudioMuted] = useState(false);
  const [footstepSound, setFootstepSound] = useState(true);
  const [musicActive, setMusicActive] = useState(true);
  const [rainActive, setRainActive] = useState(true);
  const [ambientActive, setAmbientActive] = useState(true);
  const [fireActive, setFireActive] = useState(false);
  const [masterVol, setMasterVol] = useState(80);
  const [musicVol, setMusicVol] = useState(65);
  const [rainVol, setRainVol] = useState(50);
  const [ambientVol, setAmbientVol] = useState(40);
  const [fireVol, setFireVol] = useState(60);
  const [activePreset, setActivePreset] = useState<ChillPreset | null>('rainy');

  const clientRef = useRef<CafeClient | null>(null);
  if (!clientRef.current) clientRef.current = new CafeClient();

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage((current) => current === msg ? null : current), 3200);
  };

  // Listen for 3D scene interactions (Water dispenser, Desk bell, Wi-Fi stand, Newspapers, etc.)
  useEffect(() => {
    const onCafeToast = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (msg) showToast(msg);
    };
    window.addEventListener('cafe-toast', onCafeToast);
    return () => window.removeEventListener('cafe-toast', onCafeToast);
  }, []);

  const toggleBotVoice = () => {
    const next = !botVoiceEnabled;
    setBotVoiceEnabled(next);
    botVoice.setVoiceEnabled(next);
    chillAudio.playUiClick();
    showToast(next ? '🎙️ Đã bật giọng nói BOT Trader' : '🔇 Đã tắt giọng nói BOT');
  };

  const handleSetTtsEngine = (mode: TtsEngineMode) => {
    setTtsEngine(mode);
    vietnameseTts.setEngineMode(mode);
    chillAudio.playUiClick();
    const label = mode === 'auto'
      ? 'Tự động đa tầng (Khuyên dùng)'
      : mode === 'cloud'
      ? 'Cloud Tiếng Việt HD (Nhanh & Ổn định)'
      : mode === 'korva'
      ? 'KorvaTTS Local AI (ONNX On-device)'
      : 'Trình duyệt (Web Speech API)';
    showToast(`🎙️ Đã chuyển Engine giọng nói: ${label}`);
  };

  const runNfpSimulation = (event: NfpEvent) => {
    setActiveNfp(event);
    chillAudio.playNfpAlert();
    showToast(`🔥 NFP BÙNG NỔ: ${event.actual} (Dự báo: ${event.forecast})! Các Bot Trader đang phản ứng...`);

    // Step 1: Hải Đăng (Scalper)
    window.setTimeout(() => {
      botVoice.speak('bot-haidang', BOT_PERSONAS['bot-haidang'].nfpReaction);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-nfp-hd-${Date.now()}`,
          authorId: 'bot-haidang',
          author: '🤖 Hải Đăng (Scalper)',
          text: BOT_PERSONAS['bot-haidang'].nfpReaction,
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
    }, 700);

    // Step 2: Alex Trần (Whale Trader)
    window.setTimeout(() => {
      botVoice.speak('bot-alex', BOT_PERSONAS['bot-alex'].nfpReaction);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-nfp-al-${Date.now()}`,
          authorId: 'bot-alex',
          author: '🤖 Alex Trần (Cá Voi)',
          text: BOT_PERSONAS['bot-alex'].nfpReaction,
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
    }, 6000);

    // Step 3: Mai Linh (Zen Trader)
    window.setTimeout(() => {
      botVoice.speak('bot-mailinh', BOT_PERSONAS['bot-mailinh'].nfpReaction);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-nfp-ml-${Date.now()}`,
          authorId: 'bot-mailinh',
          author: '🤖 Mai Linh (Zen Trader)',
          text: BOT_PERSONAS['bot-mailinh'].nfpReaction,
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
    }, 11500);

    // Step 4: Sarah Jenkins (Macro Analyst)
    window.setTimeout(() => {
      botVoice.speak('bot-sarah', BOT_PERSONAS['bot-sarah'].nfpReaction);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-nfp-sj-${Date.now()}`,
          authorId: 'bot-sarah',
          author: '🤖 Sarah Jenkins (Macro)',
          text: BOT_PERSONAS['bot-sarah'].nfpReaction,
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
    }, 17000);

    // Step 5: Fireworks celebration by Hải Đăng
    window.setTimeout(() => {
      chillAudio.playFirework();
      setFireworksNonce((n) => n + 1);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-nfp-fw-${Date.now()}`,
          authorId: 'bot-haidang',
          author: '🤖 Hải Đăng (Scalper)',
          text: '🎆 Vừa chốt lời Scalp nến Vàng NFP +$2,450! Bắn pháo hoa đãi toàn quán cà phê!',
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
      showToast('🎆 🤖 Hải Đăng vừa bắn pháo hoa ăn mừng chốt lãi NFP +$2,450! (+150 XP)');
    }, 23000);
  };

  const handleTriggerNfp = () => {
    chillAudio.playUiClick();
    if (connection === 'live' && clientRef.current) {
      clientRef.current.triggerNfp();
    } else {
      runNfpSimulation({
        type: 'nfp-event',
        title: 'BẢNG LƯƠNG PHI NÔNG NGHIỆP MỸ (NFP)',
        actual: '254K',
        forecast: '140K',
        previous: '159K',
        unemploymentRate: '4.1%',
        dxyImpact: '+75 pips',
        summary: 'Dữ liệu việc làm Mỹ tháng này đạt 254K việc làm mới, vượt xa dự báo 140K. Tỷ lệ thất nghiệp giảm xuống 4.1%. Chỉ số DXY tăng vọt, thị trường biến động cực mạnh!',
        timestamp: Date.now(),
      });
    }
    setNfpModalOpen(false);
  };

  // Keyboard shortcut V for POV toggle and P for Photo Mode
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key.toLowerCase() === 'v') setCameraMode((current) => current === 'third' ? 'first' : 'third');
      if (event.key.toLowerCase() === 'p') {
        chillAudio.playUiClick();
        setPhotoModeOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Connect to room
  useEffect(() => {
    if (!entered) return;
    const client = clientRef.current!;
    let disposed = false;
    setRoomState(null);
    setMessages([]);
    setSeat(null);
    setConnection('connecting');
    setNetworkError('');

    const removeState = client.onState((state) => {
      if (disposed) return;
      setRoomState(state);
      const me = state.players.find((player) => player.id === state.selfId);
      setSeat(me?.seatId ?? null);
      if (me?.phone) setPhone(me.phone);
      if (typeof me?.xp === 'number') setXp(me.xp);
      if (typeof me?.level === 'number') setLevel(me.level);
    });
    const removeMessage = client.onMessage((message) => {
      if (!disposed) setMessages((previous) => [...previous.slice(-99), message]);
    });
    const removeEmote = client.onEmote((data) => {
      if (disposed) return;
      if (blockedUsers.has(data.playerId)) return;
      const sender = roomState?.players.find(p => p.id === data.playerId);
      const x = sender?.x ?? 0;
      const y = sender?.y ?? 0;
      const z = sender?.z ?? 0;
      triggerEmoteVisual(data.emoji, x, y, z);
    });
    const removeError = client.onError((message) => {
      if (!disposed) {
        setNetworkError(message);
        if (message.includes('ngắt')) setConnection('offline');
      }
    });
    const removeFireworks = client.onFireworks((event) => {
      if (disposed) return;
      chillAudio.playFirework();
      setFireworksNonce((n) => n + 1);
      const authorName = event.playerName || event.author || 'Một Trader';
      showToast(`🎆 ${authorName} vừa bắn pháo hoa mừng trade lãi ${event.profitText}! (+150 XP)`);
    });
    const removeService = client.onService((event) => {
      if (disposed) return;
      chillAudio.playMassage();
      const serviceName = event.serviceType === 'massage-shoulders'
        ? 'Xoa bóp cổ vai gáy thư giãn'
        : event.serviceType === 'massage-head'
          ? 'Bấm huyệt thái dương tĩnh tâm'
          : 'Xông trầm hương & Chuông xoay Tây Tạng';
      const authorName = event.playerName || event.author || 'Một Trader';
      if (authorName === (name.trim() || 'Bạn ghé quán')) {
        setMassageActive(true);
        window.setTimeout(() => setMassageActive(false), 15000);
        showToast(`💆 Bạn đang được chăm sóc với: ${serviceName} (+100 XP)`);
        staffVoice.speak('host-bao-ngoc', `Mời bạn thả lỏng toàn thân và hít thở thật sâu. Chúc bạn có những phút giây thư giãn tuyệt đối cùng gói ${serviceName}.`);
      } else {
        showToast(`💆 ${authorName} đang thư giãn với: ${serviceName}`);
      }
    });
    const removeLevelUp = client.onLevelUp((event) => {
      if (disposed) return;
      chillAudio.playLevelUp();
      const playerName = event.name || event.playerName || 'Trader';
      showToast(`⭐ CHÚC MỪNG: ${playerName} đã thăng cấp lên LEVEL ${event.level}!`);
    });
    const removeVoiceSignal = client.onVoiceSignal((e) => {
      if (disposed) return;
      tableVoice.handleSignal(e.fromId, e.signal);
    });
    const removeVoicePeerLeft = client.onVoicePeerLeft((e) => {
      if (disposed) return;
      tableVoice.removePeer(e.peerId);
    });
    const removeVoiceClose = client.onVoiceClose(() => {
      if (disposed) return;
      tableVoice.leaveTableVoice();
      setIsVoiceConnected(false);
    });
    const removeVoiceState = client.onVoiceState((e) => {
      if (disposed) return;
      tableVoice.handlePeerVoiceState(e.playerId, e.isSpeaking, e.isMuted);
    });
    const removeReconnect = client.onReconnect((attempt, maxAttempts) => {
      if (disposed) return;
      setConnection('connecting');
      showToast(`🔄 Đang tự động kết nối lại quán (${attempt}/${maxAttempts})...`);
    });
    const removeAnnouncement = client.onAnnouncement((event) => {
      if (disposed) return;
      setActiveAnnouncement(event);
      chillAudio.playUiClick();
      vietnameseTts.speak(`Thông báo từ ${event.author}: ${event.text}`, {
        voice: 'hoang_nam',
        pitch: 0.95,
        rate: 0.95,
        volume: 1.0,
        gender: 'male',
      });
    });
    const removeKicked = client.onKicked((event) => {
      if (disposed) return;
      setEntered(false);
      showToast(`⚠️ Bạn đã bị mời rời khỏi phòng: ${event.reason}`);
    });
    const removeMuted = client.onMuted((event) => {
      if (disposed) return;
      showToast(event.isMuted ? '🔇 Bạn đã bị Quản trị viên tắt tiếng.' : '🔊 Bạn đã được Quản trị viên mở tiếng.');
    });
    const removeReported = client.onReported(() => {
      if (disposed) return;
      showToast('✅ Đã gửi báo cáo vi phạm tới Ban quản trị phòng.');
    });
    const removeNfp = client.onNfp((event) => {
      if (disposed) return;
      runNfpSimulation(event);
    });

    let targetRoomId = 'public';
    let invite: string | undefined = undefined;
    if (room === 'Góc chill') targetRoomId = 'chill';
    else if (room === 'Phòng riêng') {
      if (privateRoomId && privateInviteCode) {
        targetRoomId = privateRoomId;
        invite = privateInviteCode;
      }
    }

    client.connect({
      name: name.trim() || 'Bạn ghé quán',
      color,
      roomId: targetRoomId,
      inviteCode: invite,
      title: profileBadge,
      bio: profileBio,
      cupsDrunk,
      phone: phoneRef.current,
      xp: xpRef.current,
      level: levelRef.current,
    })
      .then(() => { if (!disposed) setConnection('live'); })
      .catch(() => { if (!disposed) { setConnection('offline'); setNetworkError('Chưa kết nối được máy chủ. Bạn có thể xem thử quán.'); } });

    return () => {
      disposed = true;
      removeState();
      removeMessage();
      removeEmote();
      removeError();
      removeFireworks();
      removeService();
      removeLevelUp();
      removeNfp();
      removeVoiceSignal();
      removeVoicePeerLeft();
      removeVoiceClose();
      removeVoiceState();
      removeReconnect();
      removeAnnouncement();
      removeKicked();
      removeMuted();
      removeReported();
      tableVoice.leaveTableVoice();
      client.disconnect();
    };
  }, [entered, room, privateRoomId, privateInviteCode, name, color, profileBadge, profileBio, cupsDrunk, blockedUsers]);

  // Listen to TableVoice events
  useEffect(() => {
    const unsubSpeaking = tableVoice.onSpeakingChange((speaking) => {
      setIsLocalSpeaking(speaking);
    });
    const unsubPeers = tableVoice.onPeersChange((peers) => {
      setPeerVoiceStates(new Map(peers));
    });
    const unsubError = tableVoice.onError((msg) => {
      showToast(msg);
    });
    return () => {
      unsubSpeaking();
      unsubPeers();
      unsubError();
    };
  }, []);

  // Listen to BOT Voice speaking events to trigger 3D audio halos
  useEffect(() => {
    const unsubBot = botVoice.onSpeakingChange((botId, isSpeaking) => {
      setBotSpeakingIds((prev) => {
        const next = new Set(prev);
        if (isSpeaking) next.add(botId);
        else next.delete(botId);
        return next;
      });
    });
    return () => unsubBot();
  }, []);

  // Table greeting by BOT when user sits at their table
  useEffect(() => {
    if (!entered || !seat) {
      lastGreetedTableRef.current = null;
      return;
    }
    const match = seat.match(/^table-([1-7])-seat-([1-4])$/);
    if (!match) return;
    const tableNum = match[1];
    if (lastGreetedTableRef.current === tableNum) return;
    lastGreetedTableRef.current = tableNum;

    const botAtTable = BOT_LIST.find((b) => b.tableNum === tableNum);
    if (!botAtTable) return;

    const timer = window.setTimeout(() => {
      botVoice.speak(botAtTable.id, botAtTable.greeting);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-greet-${Date.now()}`,
          authorId: botAtTable.id,
          author: `🤖 ${botAtTable.name}`,
          text: botAtTable.greeting,
          scope: 'table',
          tableId: `table-${tableNum}`,
          timestamp: Date.now(),
        },
      ]);
      showToast(`🤖 ${botAtTable.name}: "${botAtTable.greeting}"`);
    }, 900);

    return () => clearTimeout(timer);
  }, [entered, seat]);

  // Ambient natural bot banter (every 85s)
  useEffect(() => {
    if (!entered) return;
    const interval = window.setInterval(() => {
      const randomBot = BOT_LIST[Math.floor(Math.random() * BOT_LIST.length)];
      const quotes: Record<BotId, string[]> = {
        'bot-alex': [
          'Thị trường luôn có cơ hội, quan trọng là tài khoản của bạn còn tiền khi cơ hội đến.',
          'Khối lượng giao dịch ở ban công hôm nay rất đẹp, một ly cà phê trứng là đủ năng lượng.',
          'Kiên nhẫn là đức tính sinh lời cao nhất của một Trader.',
        ],
        'bot-mailinh': [
          'Một ngụm trà hoa cúc, nhìn nến rút chân thật bình yên.',
          'Đừng để một lệnh thua làm hỏng một ngày bình an của bạn.',
          'Kỷ luật cắt lỗ là món quà tuyệt vời nhất bạn tự tặng cho chính mình.',
        ],
        'bot-haidang': [
          'Vừa húp trọn 15 pips cây nến M1 bên lò sưởi, thơm lừng như ly Espresso!',
          'Cây nến vừa quét thanh khoản 2 đầu, anh em đánh breakout cẩn thận nhé.',
          'Thị trường đang nén volume cực mạnh, chuẩn bị bung nén!',
        ],
        'bot-sarah': [
          'Lợi suất trái phiếu chính phủ 10 năm đang giảm nhẹ, dòng tiền bắt đầu luân chuyển.',
          'Góc thư viện này đọc báo cáo On-chain và Fed minutes rất tập trung.',
          'DXY đang test lại vùng hỗ trợ quan trọng, hãy quan sát phản ứng giá.',
        ],
      };
      const botQuotes = quotes[randomBot.id];
      const quote = botQuotes[Math.floor(Math.random() * botQuotes.length)];

      botVoice.speak(randomBot.id, quote);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-ambient-${Date.now()}`,
          authorId: randomBot.id,
          author: `🤖 ${randomBot.name}`,
          text: quote,
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
    }, 85000);

    return () => clearInterval(interval);
  }, [entered]);

  // Periodic ambient bot celebration / trade win (every 110s)
  useEffect(() => {
    if (!entered) return;
    const interval = window.setInterval(() => {
      const luckyBot = BOT_LIST[Math.floor(Math.random() * BOT_LIST.length)];
      const wins = [
        { sym: 'BTC', pnl: '+$1,850', text: 'vừa chốt lời nhịp nến Swing BTC +$1,850' },
        { sym: 'GOLD', pnl: '+$940', text: 'vừa săn trọn sóng Breakout Vàng +$940' },
        { sym: 'SOL', pnl: '+$1,220', text: 'vừa chốt lãi Scalp M5 Solana +$1,220' },
        { sym: 'ETH', pnl: '+$2,150', text: 'vừa chốt vị thế Long ETH +$2,150' },
      ];
      const win = wins[Math.floor(Math.random() * wins.length)];
      chillAudio.playCashRegister();
      setFireworksNonce((n) => n + 1);
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          id: `bot-win-${Date.now()}`,
          authorId: luckyBot.id,
          author: `🤖 ${luckyBot.name}`,
          text: `🎆 Mình ${win.text}! Bắn pháo hoa chung vui cùng anh em trong quán nhé! 🥂`,
          scope: 'room',
          tableId: null,
          timestamp: Date.now(),
        },
      ]);
      showToast(`🎆 🤖 ${luckyBot.name} ${win.text}! Cả quán cùng chung vui! 🎉`);
    }, 110000);

    return () => clearInterval(interval);
  }, [entered]);

  // Sync Table Voice when seated / changing table
  const currentSeat = roomState?.players.find((player) => player.id === roomState.selfId)?.seatId ?? seat ?? null;
  const currentTableMatch = currentSeat?.match(/^table-([1-7])-seat-([1-4])$/);
  const currentTableNum = currentTableMatch ? currentTableMatch[1] : null;

  useEffect(() => {
    if (!entered || !clientRef.current || !roomState?.selfId) return;

    if (currentTableNum) {
      tableVoice
        .joinTableVoice(clientRef.current, roomState.selfId, currentTableNum)
        .then(() => {
          setIsVoiceConnected(true);
          const peersAtTable = roomState.players.filter(
            (p) => p.id !== roomState.selfId && p.seatId?.startsWith(`table-${currentTableNum}`)
          );
          peersAtTable.forEach((peer) => {
            tableVoice.connectToPeer(peer.id);
          });
        })
        .catch(() => { });
    } else {
      tableVoice.leaveTableVoice();
      setIsVoiceConnected(false);
    }
  }, [currentTableNum, entered, roomState?.selfId]);

  // When room state updates, connect to newly arrived peers at the same table
  useEffect(() => {
    if (!currentTableNum || !roomState?.selfId || !isVoiceConnected) return;
    const peersAtTable = roomState.players.filter(
      (p) => p.id !== roomState.selfId && p.seatId?.startsWith(`table-${currentTableNum}`)
    );
    peersAtTable.forEach((peer) => {
      tableVoice.connectToPeer(peer.id);
    });
  }, [roomState?.players, currentTableNum, isVoiceConnected]);

  // Handle Audio startup when entering café
  const handleEnterCafe = () => {
    const trimmed = name.trim();
    const finalName = trimmed || 'Bạn ghé quán';
    if (!trimmed) setName(finalName);
    const updated: TraderProfile = {
      ...profile,
      name: finalName,
      color,
      badge: profileBadge,
      bio: profileBio,
      cupsDrunk,
    };
    setProfile(updated);
    saveStoredProfile(updated);
    // This click is the browser-approved point to unlock Web Audio for footsteps.
    chillAudio.resume();
    chillAudio.unmute();
    setEntered(true);
    chillAudio.applyPreset('rainy');
    setAudioMuted(false);
  };

  // Passive XP timer for online presence & sitting at cafe (T22)
  useEffect(() => {
    if (!entered) return;
    const interval = window.setInterval(() => {
      if (connection === 'live') {
        clientRef.current?.awardXp(10);
        if (currentSeat) {
          clientRef.current?.awardXp(20);
        }
      } else {
        // Offline / preview progression
        setXp((prev) => {
          const next = prev + (currentSeat ? 30 : 10);
          const newLvl = Math.max(1, Math.floor(Math.sqrt(next / 100)) + 1);
          setLevel(newLvl);
          return next;
        });
      }
    }, 30000);
    return () => window.clearInterval(interval);
  }, [entered, connection, currentSeat]);

  const sit = (seatId: string) => {
    if (connection === 'live' && /^table-[1-7]-seat-[1-4]$/.test(seatId)) {
      clientRef.current?.sit(seatId);
    } else {
      setSeat(seatId);
    }
    setTab('tables');
  };

  const leaveSeat = () => {
    if (connection === 'live') clientRef.current?.stand();
    else setSeat(null);
    setOrdered(null);

    // Cancel pending brewing if customer stands up (T17/T18)
    if (brewingTimerRef.current) {
      window.clearInterval(brewingTimerRef.current);
      brewingTimerRef.current = null;
    }
    if (orderState === 'brewing') {
      showToast('⚠️ Đã hủy đơn đang pha chế do bạn rời bàn.');
    }
    setOrderState('idle');
    setBrewingDrink(null);

    tableVoice.leaveTableVoice();
    setIsVoiceConnected(false);
  };

  const handleToggleMic = () => {
    if (!currentSeat) {
      showToast('Hãy ngồi vào một bàn để tham gia voice chat bảo mật.');
      return;
    }
    const muted = tableVoice.toggleMute();
    setIsMicMuted(muted);
    showToast(muted ? '🔇 Đã tắt Micro đàm thoại bàn.' : '🎙️ Đã bật Micro đàm thoại bàn.');
  };

  const handleOrderDrink = (drinkTitle: string) => {
    if (orderState === 'brewing') {
      showToast('Barista đang pha chế món trước đó, vui lòng đợi trong giây lát.');
      return;
    }

    // Realistic Brewing Process Lifecycle: Order -> Brew -> Serve (T17/T18)
    if (brewingTimerRef.current) window.clearInterval(brewingTimerRef.current);

    const isSeated = Boolean(currentSeat);
    const tableMatch = currentSeat?.match(/^table-([1-7])-seat-([1-4])$/);
    const locationLabel = isSeated ? (tableMatch ? `Bàn ${tableMatch[1]}` : 'tại bàn') : 'mang đi (Takeaway)';

    setOrderState('brewing');
    setBrewingDrink(drinkTitle);
    setBrewingSecondsLeft(3);
    staffVoice.speak(
      'barista-thu-ha',
      isSeated
        ? `Thu Hà đã nhận món ${drinkTitle}. Mời bạn thư giãn tại ${locationLabel}, tôi sẽ mang đồ uống đến tận bàn.`
        : `Thu Hà đã nhận món ${drinkTitle} mang đi. Tôi đang pha chế cho bạn ngay đây!`
    );
    showToast(`☕ Barista đã nhận đơn "${drinkTitle}" (${isSeated ? locationLabel : 'Mang đi / Cầm tay'})! Đang pha chế...`);

    let remaining = 3;
    brewingTimerRef.current = window.setInterval(() => {
      remaining--;
      setBrewingSecondsLeft(remaining);
      if (remaining <= 0) {
        if (brewingTimerRef.current) {
          window.clearInterval(brewingTimerRef.current);
          brewingTimerRef.current = null;
        }
        setOrderState('served');
        setOrdered(drinkTitle);
        setBrewingDrink(null);
        if (connection === 'live') {
          clientRef.current?.order(drinkTitle);
        }
        chillAudio.playSipDrink();
        staffVoice.speak(
          'barista-thu-ha',
          isSeated
            ? `${drinkTitle} đã sẵn sàng. Mời bạn dùng cà phê thật ngon tại ${locationLabel}.`
            : `${drinkTitle} đã pha chế xong. Chúc bạn thưởng thức vui vẻ khi dạo quanh quán!`
        );
        showToast(
          isSeated
            ? `✨ Barista đã mang "${drinkTitle}" nóng hổi tới ${locationLabel} của bạn!`
            : `✨ Barista đã trao "${drinkTitle}" nóng hổi tới tay bạn! Bạn có thể nhấp ngụm hoặc ngồi vào bất kỳ bàn nào.`
        );
      }
    }, 1000);
  };

  const openTableMenu = (tableIndex: number) => {
    const item = CAFE_MENU[tableIndex % CAFE_MENU.length];
    if (!item) return;
    setTableMenuSuggestionId(item.id);
    setSidebarOpen(true);
    setTab('menu');
    chillAudio.playUiClick();
    showToast(`📖 Đã mở menu tại bàn · gợi ý ${item.name}.`);
  };

  const handleBartenderProximity = (staffId: StaffId) => {
    const quote = staffVoice.greetBartenderProactive();
    setBartenderDialogue(quote);
    if (bartenderDialogueTimerRef.current) window.clearTimeout(bartenderDialogueTimerRef.current);
    bartenderDialogueTimerRef.current = window.setTimeout(() => {
      setBartenderDialogue(null);
    }, 10000);
    showToast(`🍸 Bartender Thu Hà: "${quote}"`);
  };

  const handleConciergeAction = (staffId: StaffId, action: ConciergeAction) => {
    const staff = STAFF_VOICE[staffId];
    const speak = (text: string) => {
      const voiced = staffVoice.speak(staffId, text);
      chillAudio.playUiClick();
      showToast(`${staff.role} ${staff.name}: ${text}${voiced ? '' : ' (Thiết bị chưa có giọng Việt.)'}`);
    };
    if (action === 'greet') {
      speak(staffId === 'barista-thu-ha'
        ? 'Chào bạn, Thu Hà sẽ chuẩn bị một tách thật vừa ý.'
        : staffId === 'host-bao-ngoc'
          ? 'Bảo Ngọc rất vui được đón bạn. Mình cùng tìm một góc ngồi nhé.'
          : 'Chào mừng bạn đến Closing Bell. Tôi đã sẵn sàng hỗ trợ bạn.');
      return;
    }
    if (action === 'egg-coffee' || action === 'cold-brew') {
      const drink = action === 'egg-coffee' ? 'Cà phê trứng Hà Nội' : 'Cold Brew cam mật';
      speak(`Tôi đã ghi nhận ${drink}. Xin mời bạn ngồi vào bàn, chúng tôi sẽ phục vụ tận nơi.`);
      handleOrderDrink(drink);
      return;
    }
    const destination = action === 'hearth' ? 'hearth' : action === 'library' ? 'library' : 'terrace';
    const label = action === 'hearth' ? 'Lò sưởi Hearth' : action === 'library' ? 'Focus Library' : 'Skyline Terrace';
    leaveSeat();
    setActivePOV(destination);
    speak(`Tôi mời bạn tới ${label}. Chúc bạn có một khoảng thời gian thật thư thái.`);
  };

  const handleSipDrink = () => {
    chillAudio.playSipDrink();
    chillAudio.playCoffeeEuphoria();
    const nextCups = cupsDrunk + 1;
    setCupsDrunk(nextCups);
    clientRef.current?.awardXp(15);
    const updated: TraderProfile = { ...profile, cupsDrunk: nextCups, xp: (profile.xp ?? 100) + 15 };
    setProfile(updated);
    saveStoredProfile(updated);
    showToast(`☕ Bạn vừa nhấp một ngụm ${ordered || 'cà phê'} (+1 tách, +15 XP). Thư thái tâm hồn, cảm nhận vị đắng dịu ngọt.`);
  };

  // Host & Moderation Handlers (T21)
  const isHost = Boolean(roomState?.hostId && roomState.hostId === roomState.selfId);

  const handleSendAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    const text = announcementText.trim();
    if (!text) return;
    clientRef.current?.sendAnnouncement(text);
    setAnnouncementText('');
    setAnnouncementModalOpen(false);
    showToast('📢 Đã phát thông báo phòng thành công!');
  };

  const handleMutePlayer = (targetId: string, currentMuted: boolean) => {
    clientRef.current?.mute(targetId, !currentMuted);
    showToast(`Đã ${currentMuted ? 'mở tiếng cho' : 'tắt tiếng'} người chơi.`);
  };

  const handleKickPlayer = (targetId: string, targetName: string) => {
    if (window.confirm(`Bạn có chắc muốn mời "${targetName}" ra khỏi phòng không?`)) {
      clientRef.current?.kick(targetId, 'Vi phạm nội quy phòng');
      showToast(`Đã mời "${targetName}" ra khỏi phòng.`);
    }
  };

  const handleSubmitReport = (e: FormEvent) => {
    e.preventDefault();
    if (!reportModalPlayer) return;
    clientRef.current?.report(reportModalPlayer.targetId, reportReason);
    showToast(`🚩 Đang gửi báo cáo về "${reportModalPlayer.targetName}"...`);
    setReportModalPlayer(null);
  };

  const handleSaveProfile = (updated: TraderProfile) => {
    setProfile(updated);
    setName(updated.name);
    setColor(updated.color);
    setProfileBadge(updated.badge);
    setProfileBio(updated.bio);
    setCupsDrunk(updated.cupsDrunk);
    if (updated.phone) setPhone(updated.phone);
    if (typeof updated.xp === 'number') setXp(updated.xp);
    if (typeof updated.level === 'number') setLevel(updated.level);
    saveStoredProfile(updated);
    setProfileOpen(false);
    showToast('✨ Đã cập nhật Hồ sơ Trader thành công!');
  };

  const triggerEmoteVisual = (emoji: string, x: number, y: number, z: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setActiveEmotes(prev => [...prev.slice(-8), { id, emoji, x, y, z, time: Date.now() }]);
    window.setTimeout(() => {
      setActiveEmotes(prev => prev.filter(e => e.id !== id));
    }, 2800);
  };

  const handleSendEmote = (emoji: string) => {
    const selfPlayer = roomState?.players.find(p => p.id === roomState.selfId);
    const x = selfPlayer?.x ?? 0;
    const y = selfPlayer?.y ?? (currentFloor === 2 ? 3.2 : 0);
    const z = selfPlayer?.z ?? 0;
    triggerEmoteVisual(emoji, x, y, z);
    if (connection === 'live') {
      clientRef.current?.sendEmote(emoji);
    }
  };

  // Block & Report Handlers (T15)
  const handleBlockUser = (authorId: string, authorName: string) => {
    setBlockedUsers(prev => new Set(prev).add(authorId));
    showToast(`Đã chặn tin nhắn từ "${authorName}".`);
  };

  const handleReportMessage = (msgId: string) => {
    setReportedMsgIds(prev => new Set(prev).add(msgId));
    showToast('Đã gửi báo cáo vi phạm tới ban quản trị quán.');
  };

  const handleCreatePrivateRoom = async () => {
    try {
      setNetworkError('');
      const { roomId, inviteCode } = await CafeClient.createPrivateRoom();
      setPrivateRoomId(roomId);
      setPrivateInviteCode(inviteCode);
      setRoom('Phòng riêng');
      leaveSeat();
      showToast('Đã tạo phòng riêng mới! Hãy sao chép mã mời gửi cho bạn bè.');
    } catch {
      setNetworkError('Không thể tạo phòng riêng mới lúc này.');
    }
  };

  const handleJoinPrivateRoom = (e: FormEvent) => {
    e.preventDefault();
    const code = inputInviteCode.trim();
    if (!code) return;
    setPrivateInviteCode(code);
    setPrivateRoomId(`private-${code.slice(0, 16)}`);
    setRoom('Phòng riêng');
    leaveSeat();
  };

  const copyInviteCode = () => {
    if (privateInviteCode) {
      void navigator.clipboard.writeText(privateInviteCode);
      setCopiedCode(true);
      showToast('Đã sao chép mã mời vào bộ nhớ tạm.');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Audio adjustments
  const toggleAudioMute = () => {
    const muted = chillAudio.toggleMute();
    setAudioMuted(muted);
  };

  const handlePresetSelect = (preset: ChillPreset) => {
    setActivePreset(preset);
    chillAudio.applyPreset(preset);
    setMusicActive(true);
    setRainActive(true);
    setAmbientActive(true);
    setFireActive(preset === 'fireside');
  };

  const toggleMusicChannel = () => {
    if (musicActive) chillAudio.stopMusic();
    else chillAudio.startMusic();
    setMusicActive(!musicActive);
    setActivePreset(null);
  };

  const toggleRainChannel = () => {
    if (rainActive) chillAudio.stopRain();
    else chillAudio.startRain();
    setRainActive(!rainActive);
    setActivePreset(null);
  };

  const toggleAmbientChannel = () => {
    if (ambientActive) chillAudio.stopAmbient();
    else chillAudio.startAmbient();
    setAmbientActive(!ambientActive);
    setActivePreset(null);
  };

  const toggleFireChannel = () => {
    if (fireActive) chillAudio.stopFire();
    else chillAudio.startFire();
    setFireActive(!fireActive);
    setActivePreset(null);
  };

  const toggleFootsteps = () => {
    const next = !footstepSound;
    setFootstepSound(next);
    chillAudio.setFootstepEnabled(next);
    chillAudio.playUiClick();
    showToast(next ? '👣 Đã bật tiếng bước chân 3D' : '🔇 Đã tắt tiếng bước chân 3D');
  };

  const displayName = name.trim() || 'Bạn ghé quán';
  const realOthers = roomState?.players.filter((player) => player.id !== roomState.selfId) ?? [];
  const humanOccupiedSeats = new Set([
    ...(seat ? [seat] : []),
    ...realOthers.map((p) => p.seatId).filter(Boolean) as string[],
  ]);

  const botPlayers: Player[] = BOT_LIST.map((bot) => {
    const seatTakenByHuman = humanOccupiedSeats.has(bot.seatId);
    return {
      id: bot.id,
      name: `🤖 ${bot.name}`,
      color: bot.color,
      x: bot.x,
      y: bot.y,
      z: bot.z,
      rotation: bot.rotation,
      seatId: seatTakenByHuman ? null : bot.seatId,
      drink: bot.drink,
      title: bot.title,
      bio: bot.bio,
      cupsDrunk: 15,
      phone: bot.phone,
      xp: bot.xp,
      level: bot.level,
    };
  });

  const realPlayerIds = new Set(realOthers.map((p) => p.id));
  const others: Player[] = [...realOthers, ...botPlayers.filter((b) => !realPlayerIds.has(b.id))];
  const occupied = new Set(others.map((player) => player.seatId).filter(Boolean));

  const filteredTables = tables.filter((t) => {
    if (floorFilter === 'all') return true;
    if (typeof floorFilter === 'number') return t.floor === floorFilter;
    return t.zone === floorFilter;
  });
  const visibleMessages = messages.filter((m) => !blockedUsers.has(m.authorId));

  const sendChat = (event: FormEvent) => {
    event.preventDefault();
    const text = chatText.trim();
    if (!text || connection !== 'live' || (chatScope === 'table' && !seat)) return;

    // T15 Rate limit chống spam
    const now = Date.now();
    if (now - lastChatTime < 1100) {
      showToast('Vui lòng đợi một nhịp trước khi gửi tin nhắn tiếp theo.');
      return;
    }
    setLastChatTime(now);

    clientRef.current?.sendChat(text, chatScope);
    setChatText('');
  };

  return (
    <main className={`app ${entered ? 'app--entered' : 'app--welcome'}`}>
      <div className="scene-wrap" aria-label="Không gian quán cà phê 3D nhiều tầng">
        <CafeScene
          cameraMode={cameraMode}
          seatedSeatId={seat}
          onSeatClick={sit}
          onLeaveSeat={leaveSeat}
          remotePlayers={others}
          currentDrink={ordered}
          activeEmotes={activeEmotes}
          floorJump={floorJump}
          onFloorChange={(f) => setCurrentFloor(f)}
          onStatsUpdate={setStats}
          selfId={roomState?.selfId}
          speakingPlayerIds={speakingPlayerIds}
          reducedMotion={reducedMotion}
          targetPOV={activePOV}
          fireworksNonce={fireworksNonce}
          massageActive={massageActive}
          photoMode={photoModeOpen}
          photoCameraPreset={photoPreset}
          photoFov={photoFov}
          captureTrigger={captureTrigger}
          onPhotoCaptured={(rawPng) => setCapturedRawImage(rawPng)}
          onInspectTerminal={() => setTerminalOpen(true)}
          onStaffClick={(staffId) => { setSelectedStaff(staffId); setConciergeOpen(true); chillAudio.playUiClick(); }}
          onBartenderProximity={handleBartenderProximity}
          onTableMenuClick={openTableMenu}
          onMove={(position) => {
            if (activePOV) setActivePOV(null);
            if (connection === 'live') clientRef.current?.move(position);
          }}
        />
      </div>

      {!entered ? (
        <>
          <div className="welcome-shade" />
          <div className="welcome-shell">
            <header className="welcome-header">
              <Logo />
              <span className="welcome-header-note">
                <span className="status-dot" /> MỘT GÓC NHỎ DÀNH CHO TRADER
              </span>
            </header>
            <div className="welcome-main">
              <div className="welcome-copy">
                <div className="eyebrow"><span /> CHÀO MỪNG ĐẾN VỚI CAFÉTRADER</div>
                <h1>Mở máy.<br />Gọi cà phê.<br /><em>Gặp nhau nhé.</em></h1>
                <p className="welcome-description">
                  Không gian cà phê 2 tầng phong cách Industrial Luxury ấm cúng dành cho cộng đồng Trader. Cùng ngồi xuống, ngắm view thành phố từ tầng lửng VIP, thưởng thức đồ uống hảo hạng và tìm chút bình yên giữa những con số.
                </p>
                <div className="welcome-form">
                  <label htmlFor="display-name">BẠN MUỐN ĐƯỢC GỌI LÀ GÌ?</label>
                  <div className="name-row">
                    <input
                      id="display-name"
                      value={name}
                      onChange={(event) => setName(event.target.value.slice(0, 24))}
                      placeholder="Nhập tên của bạn"
                      maxLength={24}
                      onKeyDown={(event) => { if (event.key === 'Enter') handleEnterCafe(); }}
                    />
                    <button className="enter-button" onClick={handleEnterCafe}>
                      Vào quán <Icon name="arrow" size={18} />
                    </button>
                  </div>
                  <div className="avatar-picker">
                    <span>CHỌN MÀU ĐẠI DIỆN</span>
                    <div className="color-list">
                      {colors.map((item) => (
                        <button
                          key={item}
                          className={`color-option ${color === item ? 'selected' : ''}`}
                          style={{ backgroundColor: item }}
                          onClick={() => setColor(item)}
                          aria-label={`Chọn màu ${item}`}
                          aria-pressed={color === item}
                        >
                          {color === item && <Icon name="check" size={13} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="welcome-badge-picker">
                    <span>PHONG CÁCH GIAO DỊCH</span>
                    <div className="welcome-badge-list">
                      {TRADER_BADGES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          className={`badge-pill ${profileBadge === b ? 'selected' : ''}`}
                          onClick={() => setProfileBadge(b)}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="welcome-footnote">
                  <span className="footnote-icon">☕</span>
                  <span>
                    Ghé thăm sảnh trệt hoặc phòng VIP tầng lửng.<br />
                    <strong>Cứ tự nhiên thư giãn như ở nhà.</strong>
                  </span>
                </div>
              </div>
              <div className="welcome-caption">
                <span className="caption-line" />
                <div>
                  <span>LUXURY SKYLINE SUITE & CAFE</span>
                  <strong>Góc nhìn VIP triệu đô luôn đón chào bạn.</strong>
                </div>
              </div>
            </div>
            <footer className="welcome-footer">
              <span>© CAFÉTRADER · KHÔNG GIAN CÀ PHÊ NHIỀU TẦNG THƯỢNG LƯU</span>
              <span>PHA MỘT TÁCH · KẾT NỐI MỘT NGƯỜI</span>
            </footer>
          </div>
        </>
      ) : (
        <>
          {!photoModeOpen && (
            <header className="app-header">
              <Logo compact />
              <div className="header-divider" />
              <button className="room-pill" onClick={() => { setTab('tables'); setSidebarOpen(true); }}>
                <span className="status-dot" />
                <span>{room}</span>
                <span className="room-chevron">⌄</span>
              </button>

              {/* Royal Lift: 8-Floor Elevator Selector */}
              <div className="royal-floor-selector" aria-label="Thang máy hoàng gia 8 tầng">
                <span>LIFT</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={currentFloor === f ? 'active' : ''}
                    onClick={() => jumpToFloor(f)}
                    title={`${FLOOR_NAMES[f]?.title || `Tầng ${f}`}: ${FLOOR_NAMES[f]?.subtitle || ''}`}
                  >
                    T{f}
                  </button>
                ))}
              </div>

              {/* Current Floor Indicator */}
              <div className={`floor-indicator ${currentFloor > 1 ? 'floor-indicator--vip' : ''}`} title="Tầng hiện tại trong biệt thự">
                <span className="floor-badge-icon" style={{ marginRight: 4 }}>{FLOOR_NAMES[currentFloor]?.icon || '👑'}</span>
                <span>{FLOOR_NAMES[currentFloor]?.title || `TẦNG ${currentFloor}`}</span>
              </div>

              <div className="header-spacer" />

              {/* Quick Trader Terminal screen toggle in header */}
              <button
                className="header-screen-btn"
                onClick={() => setTerminalOpen(true)}
                title="Phóng to màn hình Trader Terminal"
              >
                <Icon name="gauge" size={16} />
                <span>Màn hình Trader</span>
              </button>

              {/* Quick sound toggle in header */}
              <button
                className={`header-sound-btn ${audioMuted ? 'muted' : ''}`}
                onClick={toggleAudioMute}
                title={audioMuted ? 'Bật âm thanh quán' : 'Tắt tiếng quán'}
              >
                <Icon name={audioMuted ? 'volumeMute' : 'volume'} size={17} />
                <span>{audioMuted ? 'Đang tắt tiếng' : 'Âm thanh Chill'}</span>
              </button>

              {/* Quick footstep sound toggle in header (T22) */}
              <button
                className={`header-footstep-btn ${footstepSound ? 'active' : 'muted'}`}
                onClick={toggleFootsteps}
                title={footstepSound ? 'Tắt tiếng bước chân 3D' : 'Bật tiếng bước chân 3D'}
              >
                <span>👣</span>
                <span className="btn-label">{footstepSound ? 'Bước chân' : 'Tắt bước'}</span>
              </button>

              {/* Quick Trader Services & Fireworks Modal toggle (T22) */}
              <button
                className="header-service-btn"
                onClick={() => { chillAudio.playUiClick(); setServicesModalOpen(true); }}
                title="Dịch vụ Pháo hoa & Thư giãn Spa cho Trader (Cấp quyền toàn bộ)"
              >
                <span>🎆</span>
                <span className="btn-label">Dịch vụ Trader</span>
              </button>

              {/* Quick Photo Mode button in header (T07, T20, T22) */}
              <button
                className="header-photo-btn"
                onClick={() => { chillAudio.playUiClick(); setPhotoModeOpen(true); }}
                title="Chế độ Chụp Ảnh Kỷ Niệm Closing Bell (Phím P)"
              >
                <span>📸</span>
                <span className="btn-label">Chụp ảnh</span>
              </button>

              <button
                className="header-concierge-btn"
                onClick={() => { setSelectedStaff('concierge-minh-an'); setConciergeOpen(true); chillAudio.playUiClick(); }}
                title="Gọi Quản gia Minh An hỗ trợ chỗ ngồi và đồ uống"
              >
                <span>✦</span>
                <span className="btn-label">Gọi quản gia</span>
              </button>

              {/* Quick NFP Market News & Bot Council Modal toggle (T23) */}
              <button
                className="header-nfp-btn"
                onClick={() => { chillAudio.playUiClick(); setNfpModalOpen(true); }}
                title="Bảng tin NFP & Hội đồng BOT Trader"
              >
                <span>🔥</span>
                <span className="btn-label">Tin NFP</span>
              </button>

              {/* Quick Bot Voice toggle in header (T23) */}
              <button
                className={`header-bot-voice-btn ${botVoiceEnabled ? 'active' : 'muted'}`}
                onClick={toggleBotVoice}
                title={botVoiceEnabled ? 'Tắt giọng nói BOT' : 'Bật giọng nói BOT sinh động'}
              >
                <span>🎙️</span>
                <span className="btn-label">{botVoiceEnabled ? 'Giọng BOT' : 'Tắt BOT'}</span>
              </button>

              <span className="connection-note">
                <span className={`status-dot ${connection !== 'live' ? 'status-dot--muted' : ''}`} />
                {connection === 'live'
                  ? `${others.length + 1} KHÁCH TRONG QUÁN`
                  : connection === 'connecting'
                    ? 'ĐANG KẾT NỐI'
                    : 'XEM THỬ NGOẠI TUYẾN'}
              </span>

              {isHost && (
                <button
                  className="round-button host-announcement-btn"
                  aria-label="Phát thông báo phòng"
                  title="Phát thông báo phòng (Chủ phòng)"
                  onClick={() => setAnnouncementModalOpen(true)}
                >
                  <Icon name="megaphone" size={16} />
                </button>
              )}

              <button className="round-button" aria-label="Cài đặt" onClick={() => setSettingsOpen(!settingsOpen)}>
                <Icon name="settings" />
              </button>
              <button
                className="profile profile-clickable"
                onClick={() => { chillAudio.playUiClick(); setProfileOpen(true); }}
                title="Mở Thẻ Căn Cước Trader"
              >
                <span className="profile-avatar" style={{ backgroundColor: color }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <div className="profile-text">
                  <span className="profile-name">
                    <span className="profile-lvl-badge">Lv.{level}</span>
                    {displayName}
                  </span>
                  <small className="profile-badge-label">{profileBadge} · 📱 {phone}</small>
                </div>
              </button>
            </header>
          )}

          {/* Active Host Announcement Banner */}
          {activeAnnouncement && (
            <div className="announcement-banner">
              <div className="announcement-content">
                <span className="announcement-tag">📢 THÔNG BÁO TỪ {activeAnnouncement.author.toUpperCase()}</span>
                <span className="announcement-text">{activeAnnouncement.text}</span>
              </div>
              <button
                className="announcement-close"
                onClick={() => setActiveAnnouncement(null)}
                title="Đóng thông báo"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          )}

          {/* Active NFP Breaking News Banner */}
          {activeNfp && (
            <div className="nfp-breaking-banner" onClick={() => setNfpModalOpen(true)}>
              <div className="nfp-breaking-tag">🔥 TIN NÓNG THỊ TRƯỜNG: {activeNfp.title}</div>
              <div className="nfp-breaking-stats">
                <span>Thực tế: <strong>{activeNfp.actual}</strong></span>
                <span>Dự báo: {activeNfp.forecast}</span>
                <span>Tác động: {activeNfp.dxyImpact}</span>
              </div>
              <button
                className="nfp-breaking-close"
                onClick={(e) => { e.stopPropagation(); setActiveNfp(null); }}
                title="Đóng bảng tin"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          )}

          {/* Bartender Proactive Greeting Dialogue Bubble */}
          {bartenderDialogue && !photoModeOpen && (
            <div className="bartender-dialogue-bubble">
              <div className="bartender-bubble-avatar">🍸</div>
              <div className="bartender-bubble-content">
                <div className="bartender-bubble-header">
                  <strong>Bartender Thu Hà</strong>
                  <span className="bartender-bubble-role">Quầy Barista & Pha Chế</span>
                </div>
                <p className="bartender-bubble-quote">"{bartenderDialogue}"</p>
              </div>
              <div className="bartender-bubble-actions">
                <button
                  type="button"
                  className="bartender-bubble-order-btn"
                  onClick={() => {
                    chillAudio.playUiClick();
                    openTableMenu(0);
                    setBartenderDialogue(null);
                  }}
                  title="Mở thực đơn quầy bar để chọn món"
                >
                  ☕ Xem Menu Quầy Bar
                </button>
                <button
                  type="button"
                  className="bartender-bubble-close-btn"
                  onClick={() => setBartenderDialogue(null)}
                  title="Đóng lời chào"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="scene-vignette" />

          {/* Atmospheric Status Pill */}
          {!photoModeOpen && (
            <div className="atmosphere-badge">
              <span>{FLOOR_NAMES[currentFloor]?.icon} {FLOOR_NAMES[currentFloor]?.title} · {FLOOR_NAMES[currentFloor]?.subtitle}</span>
              <span className="badge-sep">·</span>
              <span>☕ 24°C</span>
              <span className="badge-sep">·</span>
              <span>🎵 Lo-fi Chords Mellow</span>
              <span className="badge-sep">·</span>
              <button
                type="button"
                className="footstep-pill-btn"
                onClick={toggleFootsteps}
                title="Nhấn để bật/tắt tiếng bước chân 3D"
              >
                👣 {footstepSound ? 'Bước chân: Bật' : 'Bước chân: Tắt'}
              </button>
              <span className="badge-sep">·</span>
              <button
                type="button"
                className="services-pill-btn"
                onClick={() => { chillAudio.playUiClick(); setServicesModalOpen(true); }}
                title="Mở Dịch vụ Pháo hoa & Thư giãn Spa"
              >
                🎆 Dịch vụ Trader
              </button>
              <span className="badge-sep">·</span>
              <button
                type="button"
                className="photo-pill-btn"
                onClick={() => { chillAudio.playUiClick(); setPhotoModeOpen(true); }}
                title="Mở Chế độ Chụp Ảnh Kỷ Niệm Closing Bell (Phím P)"
              >
                📸 Chụp ảnh
              </button>
              <span className="badge-sep">·</span>
              <button
                type="button"
                className="nfp-pill-btn"
                onClick={() => { chillAudio.playUiClick(); setNfpModalOpen(true); }}
                title="Mở Bảng tin NFP & Hội đồng Bot Trader"
              >
                🔥 Tin NFP
              </button>
              <span className="badge-sep">·</span>
              <button
                type="button"
                className={`bot-voice-pill-btn ${botVoiceEnabled ? 'active' : 'muted'}`}
                onClick={toggleBotVoice}
                title="Bật/Tắt giọng nói BOT sinh động"
              >
                🎙️ {botVoiceEnabled ? 'Giọng BOT: Bật' : 'Giọng BOT: Tắt'}
              </button>
            </div>
          )}

          {/* Live Market Ticker Tape (T16 Dopamine Chill) */}
          {!photoModeOpen && (
            <div className="live-ticker-tape" onClick={() => setTerminalOpen(true)} title="Nhấp để mở Trader Terminal & Thử thách nến 12s">
              <span className="ticker-tape-pulse">● LIVE TICKER</span>
              <div className="ticker-tape-track">
                <span className="ticker-item"><strong className="up">BTC</strong> $96,540 ▲ +2.6%</span>
                <span className="tape-sep">·</span>
                <span className="ticker-item"><strong className="up">ETH</strong> $3,485 ▲ +1.9%</span>
                <span className="tape-sep">·</span>
                <span className="ticker-item"><strong className="up">GOLD</strong> $2,678 ▲ +0.8%</span>
                <span className="tape-sep">·</span>
                <span className="ticker-item"><strong className="up">SOL</strong> $218.4 ▲ +4.2%</span>
                <span className="tape-sep">·</span>
                <span className="ticker-item"><strong className="down">DXY</strong> 102.4 ▼ -0.3%</span>
                <span className="tape-sep">·</span>
                <span className="ticker-item"><strong className="up">SPX</strong> 5,992 ▲ +0.5%</span>
                <span className="tape-sep">·</span>
                <span className="ticker-item text-gold">☕ Bấm để mở màn hình Trader Terminal & Thử thách Quick Paper Trade 📈</span>
              </div>
            </div>
          )}

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="toast-banner">
              <span>{toastMessage}</span>
            </div>
          )}

          {conciergeOpen && (
            <ConciergePanel
              staffId={selectedStaff}
              onClose={() => { setConciergeOpen(false); staffVoice.stop(); }}
              onAction={handleConciergeAction}
            />
          )}

          {/* Performance HUD (T08 Early FPS & Stats) */}
          {showStats && !photoModeOpen && (
            <div className="stats-hud">
              <Icon name="gauge" size={14} />
              <span><strong>{stats.fps}</strong> FPS</span>
              <span className="hud-sep">·</span>
              <span><strong>{stats.frameTime}</strong> ms</span>
              <span className="hud-sep">·</span>
              <span><strong>{stats.meshes}</strong> Meshes</span>
              <span className="hud-sep">·</span>
              <span className="hud-ok">MƯỢT MÀ</span>
            </div>
          )}

          {!photoModeOpen && (
            <div className="scene-title">
              <span className="scene-title-kicker">MỘT CHÚT BÌNH YÊN</span>
              <strong>Chào mừng đến quán.</strong>
              <span>{currentFloor > 2 ? `Bạn đang ở ${FLOOR_NAMES[currentFloor]?.title}. Hãy bước ra ban công ngắm góc Chill và toàn cảnh estate.` : currentFloor === 2 ? 'Bạn đang ở tầng lửng VIP với tầm nhìn bao quát sảnh quán.' : 'Chọn một chiếc ghế tầng trệt hoặc bấm thang máy LIFT để khám phá các tầng 1–8 nhé.'}</span>
            </div>
          )}

          {/* Quick Emote Reactions Bar */}
          {!photoModeOpen && (
            <div className="emote-bar">
              {EMOTES.map((emoji) => (
                <button
                  key={emoji}
                  className="emote-btn"
                  onClick={() => handleSendEmote(emoji)}
                  title={`Thả cảm xúc ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {!photoModeOpen && (
            <button
              className="toggle-sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Ẩn bảng điều khiển' : 'Mở bảng điều khiển'}
            >
              <Icon name={sidebarOpen ? 'x' : 'grid'} />
            </button>
          )}

          {sidebarOpen && !photoModeOpen && (
            <aside className="sidebar">
              <div className="sidebar-top">
                <div>
                  <span className="panel-eyebrow">BẠN ĐANG Ở</span>
                  <h2>{room}</h2>
                  <p>Không gian 2 tầng Industrial Luxury ấm cúng.</p>
                </div>
                <span className="panel-coffee">☕</span>
              </div>

              {/* Room switcher with Private Room support */}
              <div className="room-list" aria-label="Chọn phòng">
                <button
                  className={room === 'Quán chính' ? 'active' : ''}
                  onClick={() => { setRoom('Quán chính'); leaveSeat(); }}
                >
                  Quán chính
                </button>
                <button
                  className={room === 'Góc chill' ? 'active' : ''}
                  onClick={() => { setRoom('Góc chill'); leaveSeat(); }}
                >
                  Góc chill
                </button>
                <button
                  className={room === 'Phòng riêng' ? 'active' : ''}
                  onClick={() => { setRoom('Phòng riêng'); leaveSeat(); }}
                >
                  Phòng riêng
                </button>
              </div>

              {room === 'Phòng riêng' && (
                <div className="private-room-box">
                  {privateInviteCode ? (
                    <div className="private-room-info">
                      <span className="invite-title">MÃ MỜI PHÒNG RIÊNG</span>
                      <div className="invite-code-row">
                        <code>{privateInviteCode}</code>
                        <button className="copy-btn" onClick={copyInviteCode} title="Sao chép mã mời">
                          <Icon name={copiedCode ? 'check' : 'copy'} size={15} />
                          <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                      <small>Gửi mã mời này cho bạn bè để cùng vào phòng đàm đạo.</small>
                    </div>
                  ) : (
                    <div className="private-actions">
                      <button className="create-room-btn" onClick={handleCreatePrivateRoom}>
                        <Icon name="sparkle" size={15} /> Tạo phòng riêng mới
                      </button>
                      <form className="join-room-form" onSubmit={handleJoinPrivateRoom}>
                        <input
                          placeholder="Dán mã mời của bạn bè..."
                          value={inputInviteCode}
                          onChange={(e) => setInputInviteCode(e.target.value)}
                        />
                        <button type="submit" disabled={!inputInviteCode.trim()}>Vào</button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              <div className="tabs" role="tablist" aria-label="Nội dung quán">
                {([
                  ['tables', 'grid', 'Bàn'],
                  ['guests', 'users', `Khách (${others.length + 1})`],
                  ['chat', 'chat', 'Chat'],
                  ['menu', 'coffee', 'Menu'],
                  ['music', 'music', 'Nhạc']
                ] as const).map(([key, icon, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    className={tab === key ? 'active' : ''}
                    onClick={() => {
                      setTab(key);
                      if (key === 'menu') chillAudio.playMenuPaper();
                      else if (key === 'tables') chillAudio.playPageFlip();
                      else chillAudio.playUiClick();
                    }}
                  >
                    <Icon name={icon} size={15} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="panel-scroll">
                {/* TAB 1: TABLES (Multi-floor) */}
                {tab === 'tables' && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Chọn chỗ ngồi</h3>
                        <p>Sảnh trệt gần gũi hoặc ban công VIP tầng 2.</p>
                      </div>
                      <span className="tiny-label">7 BÀN · 28 GHẾ</span>
                    </div>

                    {/* T14 Table Voice Chat Box */}
                    {currentTableNum && (
                      <div className="table-voice-box">
                        <div className="table-voice-header">
                          <div className="table-voice-status">
                            <span className={`voice-pulse-dot ${isVoiceConnected ? 'active' : ''}`} />
                            <div>
                              <strong>Đàm thoại Bàn {currentTableNum}</strong>
                              <small>{isVoiceConnected ? 'WebRTC P2P Mesh · Riêng tư' : 'Đang kết nối đàm thoại...'}</small>
                            </div>
                          </div>
                          <button
                            className={`voice-mic-toggle ${isMicMuted ? 'muted' : isLocalSpeaking ? 'speaking' : 'live'}`}
                            onClick={handleToggleMic}
                            title={isMicMuted ? 'Bật micro bàn' : 'Tắt micro bàn'}
                          >
                            <Icon name={isMicMuted ? 'volumeMute' : 'mic'} size={14} />
                            <span>{isMicMuted ? 'Tắt mic' : isLocalSpeaking ? 'Đang nói...' : 'Mic bật'}</span>
                          </button>
                        </div>

                        <div className="voice-members-list">
                          <div className={`voice-member-chip ${isLocalSpeaking && !isMicMuted ? 'speaking' : ''}`}>
                            <span className="member-avatar" style={{ backgroundColor: color }}>
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                            <span className="member-name">Bạn</span>
                            <span className="member-audio-icon">{isMicMuted ? '🔇' : isLocalSpeaking ? '🔊' : '🎙️'}</span>
                          </div>

                          {[...peerVoiceStates.entries()].map(([peerId, pState]) => {
                            const peerPlayer = roomState?.players.find((p) => p.id === peerId);
                            return (
                              <div
                                key={peerId}
                                className={`voice-member-chip ${pState.isSpeaking && !pState.isMuted ? 'speaking' : ''}`}
                              >
                                <span className="member-avatar" style={{ backgroundColor: peerPlayer?.color || '#ad8465' }}>
                                  {(peerPlayer?.name || peerId).charAt(0).toUpperCase()}
                                </span>
                                <span className="member-name">{peerPlayer?.name || 'Bạn cùng bàn'}</span>
                                <span className="member-audio-icon">{pState.isMuted ? '🔇' : pState.isSpeaking ? '🔊' : '🎙️'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="floor-filter-row">
                      <button
                        className={floorFilter === 'all' ? 'active' : ''}
                        onClick={() => setFloorFilter('all')}
                      >
                        Tất cả (7)
                      </button>
                      <button
                        className={floorFilter === 'hearth' ? 'active' : ''}
                        onClick={() => setFloorFilter('hearth')}
                      >
                        🪵 Hearth Hall (4)
                      </button>
                      <button
                        className={floorFilter === 'focus' ? 'active' : ''}
                        onClick={() => {
                          setFloorFilter('focus');
                          chillAudio.playPageFlip();
                        }}
                      >
                        📚 Focus Library (1)
                      </button>
                      <button
                        className={`vip-tab-btn ${floorFilter === 'lounge' ? 'active' : ''}`}
                        onClick={() => setFloorFilter('lounge')}
                      >
                        👑 Private Lounge (2)
                      </button>
                    </div>

                    {networkError && <div className="notice">{networkError}</div>}

                    <div className="table-list">
                      {filteredTables.map((table) => {
                        const selected = seat?.startsWith(`table-${table.id}-`) ?? false;
                        return (
                          <div
                            className={`table-card ${table.vip ? 'table-card--vip' : ''} ${selected ? 'table-card--selected' : ''}`}
                            key={table.id}
                          >
                            <div className="table-icon">
                              <Icon name={table.vip ? 'sparkle' : 'coffee'} size={18} />
                            </div>
                            <div className="table-info">
                              <div className="table-title-row">
                                <strong>{table.title}</strong>
                                {table.vip && <span className="vip-badge">VIP</span>}
                              </div>
                              <span>{table.detail}</span>
                              <div className="table-hospitality-meta" aria-label={`Không khí ${table.mood}; âm thanh ${table.sound}; phù hợp ${table.bestFor}`}>
                                <span>✦ {table.mood}</span>
                                <span>◌ {table.sound}</span>
                                <span>⌁ {table.bestFor}</span>
                              </div>
                            </div>
                            <div className="table-actions">
                              {[1, 2, 3, 4].map((chair) => {
                                const id = `table-${table.id}-seat-${chair}`;
                                const busy = occupied.has(id);
                                return (
                                  <button
                                    key={id}
                                    aria-label={`Ngồi ${table.title}, ghế ${chair}${busy ? ', đã có người' : ''}`}
                                    title={busy ? 'Đã có người' : `Ghế ${chair}`}
                                    disabled={busy}
                                    className={`${seat === id ? 'chair selected' : 'chair'} ${table.vip ? 'chair--vip' : ''}`}
                                    onClick={() => sit(id)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="panel-note">
                      <span>✦</span>
                      <p>
                        Bấm vào ghế để ngồi xuống. Ghế tầng 2 VIP sẽ tự động đưa bạn lên ban công ngắm toàn cảnh quán.{connection !== 'live' && ' Ghế đang ở chế độ xem thử.'}
                      </p>
                    </div>
                  </>
                )}

                {/* TAB 2: GUESTS & TRADER DIRECTORY (T09 & T21) */}
                {tab === 'guests' && (
                  <div className="guests-tab">
                    <div className="section-heading">
                      <div>
                        <h3>Cộng đồng Trader</h3>
                        <p>Những người bạn đang cùng thưởng thức cà phê tại quán.</p>
                      </div>
                      <span className="tiny-label">
                        {isHost ? '👑 BẠN LÀ CHỦ PHÒNG' : 'THÀNH VIÊN'}
                      </span>
                    </div>

                    {isHost && (
                      <div className="host-admin-box">
                        <div className="host-box-header">
                          <Icon name="megaphone" size={15} />
                          <strong>Bảng Quản Trị Phòng (Host)</strong>
                        </div>
                        <p>Bạn có quyền phát thông báo khẩn, tắt tiếng hoặc mời thành viên vi phạm rời phòng.</p>
                        <button
                          type="button"
                          className="host-broadcast-quick-btn"
                          onClick={() => setAnnouncementModalOpen(true)}
                        >
                          📢 Phát thông báo tới cả phòng
                        </button>
                      </div>
                    )}

                    <div className="guest-list">
                      {(() => {
                        const selfPlayer = roomState?.players.find((p) => p.id === roomState.selfId);
                        const currentSelfPlayer: Player = selfPlayer || {
                          id: roomState?.selfId || 'local',
                          name: displayName,
                          color,
                          x: 0,
                          y: currentFloor === 2 ? 3.2 : 0,
                          z: 0,
                          rotation: 0,
                          seatId: seat,
                          drink: ordered,
                          title: profileBadge,
                          bio: profileBio,
                          cupsDrunk,
                          phone,
                          xp,
                          level,
                        };
                        const allGuests: Player[] = [currentSelfPlayer, ...others];

                        return allGuests.map((p) => {
                          const isSelf = p.id === (roomState?.selfId || 'local');
                          const isBot = p.id.startsWith('bot-');
                          const seatMatch = p.seatId?.match(/^table-([1-7])-seat-([1-4])$/);
                          const locationText = seatMatch
                            ? `Đang ngồi Bàn ${seatMatch[1]}`
                            : 'Đang dạo quanh quán';

                          return (
                            <div className={`guest-card ${isSelf ? 'guest-card--self' : ''}`} key={p.id}>
                              <div className="guest-avatar-col">
                                <span className="guest-avatar" style={{ backgroundColor: p.color || '#8c4e2d' }}>
                                  {p.name.replace(/^🤖\s*/, '').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="guest-info-col">
                                <div className="guest-name-row">
                                  <strong>{p.name}</strong>
                                  <span className="guest-level-pill">Lv.{p.level ?? 1}</span>
                                  {isSelf && <span className="self-tag">(Bạn)</span>}
                                  {isBot && <span className="host-tag" style={{ background: '#2563eb' }}>🤖 AI Trader</span>}
                                  {p.isHost && <span className="host-tag">👑 Chủ phòng</span>}
                                  {p.isMutedByHost && <span className="muted-tag">🔇 Đã tắt tiếng</span>}
                                </div>
                                <div className="guest-badge-row">
                                  <span className="guest-style-badge">{p.title || '🧘 Zen Trader'}</span>
                                  {p.phone && (
                                    <button
                                      type="button"
                                      className="guest-phone-pill"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(p.phone!);
                                        chillAudio.playPhoneChime();
                                        showToast(`📱 Đã sao chép SĐT của ${p.name}: ${p.phone}`);
                                      }}
                                      title="Bấm để sao chép số điện thoại"
                                    >
                                      📱 {p.phone}
                                    </button>
                                  )}
                                  <span className="guest-cups">☕ {p.cupsDrunk ?? 0} tách</span>
                                </div>
                                {p.bio && <p className="guest-bio">"{p.bio}"</p>}
                                <small className="guest-location">📍 {locationText}</small>

                                {/* Action Buttons */}
                                <div className="guest-actions-row">
                                  {isBot ? (
                                    <button
                                      type="button"
                                      className="guest-action-btn guest-action-btn--voice"
                                      onClick={() => {
                                        const b = BOT_PERSONAS[p.id as BotId];
                                        if (b) botVoice.speak(b.id, b.greeting);
                                      }}
                                      title="Nghe giọng chào sống động của BOT"
                                    >
                                      🔊 Nghe giọng BOT
                                    </button>
                                  ) : isSelf ? (
                                    <button
                                      type="button"
                                      className="guest-action-btn guest-action-btn--edit"
                                      onClick={() => setProfileOpen(true)}
                                    >
                                      <Icon name="user" size={13} /> Sửa Thẻ Căn Cước
                                    </button>
                                  ) : (
                                    <>
                                      {isHost && (
                                        <>
                                          <button
                                            type="button"
                                            className={`guest-action-btn ${p.isMutedByHost ? 'unmute-btn' : 'mute-btn'}`}
                                            onClick={() => handleMutePlayer(p.id, Boolean(p.isMutedByHost))}
                                            title={p.isMutedByHost ? 'Mở tiếng cho người chơi này' : 'Tắt tiếng người chơi này'}
                                          >
                                            {p.isMutedByHost ? '🔊 Mở tiếng' : '🔇 Tắt tiếng'}
                                          </button>
                                          <button
                                            type="button"
                                            className="guest-action-btn kick-btn"
                                            onClick={() => handleKickPlayer(p.id, p.name)}
                                            title="Mời rời khỏi phòng"
                                          >
                                            <Icon name="ban" size={13} /> Mời ra
                                          </button>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        className="guest-action-btn report-btn"
                                        onClick={() => setReportModalPlayer({ targetId: p.id, targetName: p.name })}
                                        title="Báo cáo hành vi vi phạm"
                                      >
                                        <Icon name="flag" size={13} /> Báo cáo
                                      </button>
                                      <button
                                        type="button"
                                        className="guest-action-btn block-btn"
                                        onClick={() => handleBlockUser(p.id, p.name)}
                                        title="Chặn tin nhắn"
                                      >
                                        <Icon name="shield" size={13} /> Chặn
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB 3: CHAT (With T15 Block, Report & Anti-Spam) */}
                {tab === 'chat' && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Trò chuyện</h3>
                        <p>Mỗi người một câu chuyện, một tách cà phê.</p>
                      </div>
                    </div>
                    {connection !== 'live' ? (
                      <div className="empty-state">
                        <div className="empty-icon"><Icon name="chat" size={25} /></div>
                        <strong>Góc trò chuyện</strong>
                        <p>Kết nối máy chủ để trò chuyện với mọi người.</p>
                        <span>CHƯA KẾT NỐI</span>
                      </div>
                    ) : (
                      <>
                        <div className="chat-scope">
                          <button className={chatScope === 'room' ? 'active' : ''} onClick={() => setChatScope('room')}>
                            Cả phòng
                          </button>
                          <button className={chatScope === 'table' ? 'active' : ''} onClick={() => setChatScope('table')} disabled={!seat}>
                            Tại bàn
                          </button>
                        </div>
                        <div className="chat-messages">
                          {visibleMessages.length === 0 ? (
                            <p className="chat-empty">Hãy là người đầu tiên chào mọi người nhé.</p>
                          ) : (
                            visibleMessages.map((message) => {
                              const isSelf = message.authorId === roomState?.selfId;
                              const isReported = reportedMsgIds.has(message.id);
                              return (
                                <div className={`chat-message ${isReported ? 'chat-message--reported' : ''}`} key={message.id}>
                                  <div className="chat-message-header">
                                    <strong>{message.author}</strong>
                                    {!isSelf && (
                                      <div className="chat-msg-actions">
                                        <button
                                          type="button"
                                          className="msg-action-btn"
                                          title="Báo cáo tin nhắn này"
                                          onClick={() => handleReportMessage(message.id)}
                                        >
                                          <Icon name="flag" size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          className="msg-action-btn"
                                          title={`Chặn ${message.author}`}
                                          onClick={() => handleBlockUser(message.authorId, message.author)}
                                        >
                                          <Icon name="shield" size={12} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <span>{message.text}</span>
                                  <small>{message.scope === 'table' ? 'TẠI BÀN' : 'CẢ PHÒNG'}</small>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <form className="chat-form" onSubmit={sendChat}>
                          <input
                            aria-label="Nội dung tin nhắn"
                            maxLength={500}
                            value={chatText}
                            onChange={(event) => setChatText(event.target.value)}
                            placeholder="Viết lời nhắn..."
                          />
                          <button aria-label="Gửi tin nhắn" disabled={!chatText.trim()}>
                            <Icon name="send" size={16} />
                          </button>
                        </form>
                      </>
                    )}
                  </>
                )}

                {/* TAB 3: MENU & SIPPING (T17 & T18) */}
                {tab === 'menu' && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Thực đơn đồ uống</h3>
                        <p>Chọn một tách đồ uống ảo để Barista phục vụ tới bàn của bạn.</p>
                      </div>
                      <span className="tiny-label">12 MÓN BARISTA</span>
                    </div>

                    {!currentSeat && (
                      <div className="notice menu-takeaway-notice">
                        <div className="menu-takeaway-text">
                          💡 Bạn đang dạo quán: Đồ uống sẽ được Barista phục vụ <strong>cầm tay (Mang đi / Takeaway)</strong>.
                        </div>
                        <button
                          type="button"
                          className="menu-auto-seat-btn"
                          onClick={() => {
                            const vacant = ['table-1-seat-1', 'table-2-seat-1', 'table-3-seat-1', 'table-4-seat-1', 'table-5-seat-1', 'table-6-seat-1', 'table-7-seat-1']
                              .find((sId) => !roomState?.players.some((p) => p.seatId === sId)) ?? 'table-1-seat-1';
                            if (connection === 'live') clientRef.current?.sit(vacant);
                            else setSeat(vacant);
                            showToast(`🪑 Đã chọn ngồi vào ${vacant}!`);
                          }}
                        >
                          🪑 Hoặc ngồi vào bàn trống
                        </button>
                      </div>
                    )}

                    <TableMenuPages
                      suggestedItemId={tableMenuSuggestionId}
                      disabled={orderState === 'brewing'}
                      isSeated={Boolean(currentSeat)}
                      onOrder={(item) => handleOrderDrink(item.name)}
                    />

                    {/* Brewing Progress Card (T17/T18) */}
                    {orderState === 'brewing' && brewingDrink && (
                      <div className="brewing-status-card">
                        <div className="brewing-header">
                          <span className="brewing-spinner">☕</span>
                          <div>
                            <strong>Barista đang pha chế {brewingDrink}...</strong>
                            <small>Hoàn thành sau {brewingSecondsLeft}s</small>
                          </div>
                        </div>
                        <div className="brewing-bar-track">
                          <div
                            className="brewing-bar-fill"
                            style={{ width: `${Math.max(20, ((3 - brewingSecondsLeft) / 3) * 100)}%` }}
                          />
                        </div>
                        <button className="brewing-cancel-btn" onClick={leaveSeat}>
                          Hủy đơn
                        </button>
                      </div>
                    )}

                    {ordered && orderState !== 'brewing' && (
                      <div className="order-active-card">
                        <div className="order-active-info">
                          <Icon name="coffee" size={20} />
                          <div>
                            <strong>Đang thưởng thức {ordered} {currentSeat ? `(${currentTableMatch ? `Bàn ${currentTableMatch[1]}` : 'Tại bàn'})` : '(Cầm tay / Takeaway)'}</strong>
                            <span>{currentSeat ? 'Tách cà phê nóng bốc khói trên bàn của bạn' : 'Ly cà phê thơm lừng trên tay bạn khi dạo quanh quán'}</span>
                          </div>
                        </div>
                        <div className="order-active-actions">
                          <button className="sip-button" onClick={handleSipDrink} title="Nhấp một ngụm cà phê thơm">
                            ☕ Nhấp một ngụm
                          </button>
                          <button className="change-drink-button" onClick={() => { setOrdered(null); setOrderState('idle'); }}>
                            Đổi món
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="drink-list">
                      {drinks.map((drink) => (
                        <button
                          key={drink.title}
                          className={`drink-card ${ordered === drink.title ? 'drink-card--active' : ''}`}
                          disabled={orderState === 'brewing'}
                          onClick={() => handleOrderDrink(drink.title)}
                        >
                          <span className="drink-icon">{drink.icon}</span>
                          <span className="drink-info">
                            <small>{drink.tag}</small>
                            <strong>{drink.title}</strong>
                            <span>{drink.desc}</span>
                          </span>
                          <span className="drink-plus">
                            {ordered === drink.title ? <Icon name="check" size={17} /> : <Icon name="plus" size={16} />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* TAB 4: CHILL AUDIO & MUSIC */}
                {tab === 'music' && (
                  <div className="audio-mixer">
                    <div className="section-heading">
                      <div>
                        <h3>Không gian âm thanh</h3>
                        <p>Âm nhạc Lo-fi & tiếng mưa rơi nhẹ nhàng trên khung cửa sổ.</p>
                      </div>
                    </div>

                    <span className="audio-section-title">CHỌN KHÔNG GIAN CẢM XÚC</span>
                    <div className="preset-grid">
                      <button
                        className={`preset-btn ${activePreset === 'fireside' ? 'active' : ''}`}
                        onClick={() => handlePresetSelect('fireside')}
                      >
                        <span className="preset-icon">🪵</span>
                        <strong>Lò sưởi Hearth</strong>
                        <small>Củi nổ tí tách + Nhạc ấm</small>
                      </button>
                      <button
                        className={`preset-btn ${activePreset === 'rainy' ? 'active' : ''}`}
                        onClick={() => handlePresetSelect('rainy')}
                      >
                        <span className="preset-icon">🌧️</span>
                        <strong>Mưa chiều</strong>
                        <small>Mưa rào + Lo-fi chill</small>
                      </button>
                      <button
                        className={`preset-btn ${activePreset === 'cafe' ? 'active' : ''}`}
                        onClick={() => handlePresetSelect('cafe')}
                      >
                        <span className="preset-icon">☕</span>
                        <strong>Quán quen</strong>
                        <small>Ấm cúng + Ly tách nhẹ</small>
                      </button>
                      <button
                        className={`preset-btn ${activePreset === 'night' ? 'active' : ''}`}
                        onClick={() => handlePresetSelect('night')}
                      >
                        <span className="preset-icon">🌙</span>
                        <strong>Đêm tĩnh lặng</strong>
                        <small>Mưa đêm + Giai điệu êm</small>
                      </button>
                      <button
                        className={`preset-btn ${activePreset === 'focus' ? 'active' : ''}`}
                        onClick={() => handlePresetSelect('focus')}
                      >
                        <span className="preset-icon">🎯</span>
                        <strong>Tập trung</strong>
                        <small>Lo-fi thư thái làm việc</small>
                      </button>
                    </div>

                    <span className="audio-section-title">BỘ ĐIỀU CHỈNH ÂM THANH</span>
                    <div className="channel-list">
                      <div className="channel-row">
                        <div className="channel-meta">
                          <button
                            className={`toggle-channel-btn ${musicActive ? 'active' : ''}`}
                            onClick={toggleMusicChannel}
                          >
                            🎵 Nhạc Lo-fi Chords
                          </button>
                          <span>{musicVol}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={musicVol}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMusicVol(val);
                            chillAudio.setVolume('music', val / 100);
                          }}
                        />
                      </div>

                      <div className="channel-row">
                        <div className="channel-meta">
                          <button
                            className={`toggle-channel-btn ${fireActive ? 'active' : ''}`}
                            onClick={toggleFireChannel}
                          >
                            🪵 Lửa lò sưởi đá
                          </button>
                          <span>{fireVol}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={fireVol}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFireVol(val);
                            chillAudio.setVolume('ambient', val / 100);
                          }}
                        />
                      </div>

                      <div className="channel-row">
                        <div className="channel-meta">
                          <button
                            className={`toggle-channel-btn ${rainActive ? 'active' : ''}`}
                            onClick={toggleRainChannel}
                          >
                            🌧️ Tiếng mưa ngoài hiên
                          </button>
                          <span>{rainVol}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={rainVol}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRainVol(val);
                            chillAudio.setVolume('rain', val / 100);
                          }}
                        />
                      </div>

                      <div className="channel-row">
                        <div className="channel-meta">
                          <button
                            className={`toggle-channel-btn ${ambientActive ? 'active' : ''}`}
                            onClick={toggleAmbientChannel}
                          >
                            ☕ Tiếng ấm quán cà phê
                          </button>
                          <span>{ambientVol}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={ambientVol}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAmbientVol(val);
                            chillAudio.setVolume('ambient', val / 100);
                          }}
                        />
                      </div>

                      <div className="channel-row channel-row--master">
                        <div className="channel-meta">
                          <strong>Âm lượng tổng</strong>
                          <span>{masterVol}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={masterVol}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMasterVol(val);
                            chillAudio.setVolume('master', val / 100);
                          }}
                        />
                      </div>
                    </div>

                    <div className="panel-note">
                      <span>✦</span>
                      <p>Âm thanh được tổng hợp trực tiếp bằng Web Audio API mượt mà, không phụ thuộc mạng, hoàn toàn thư giãn và riêng tư.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar-bottom">
                <span className="bottom-spark">☕</span>
                <div>
                  <strong>Ở đây, bạn có thể chậm lại.</strong>
                  <span>Cứ thoải mái, như đang ở quán quen.</span>
                </div>
              </div>
            </aside>
          )}

          {/* Controls Bar */}
          <div className={`scene-controls ${sidebarOpen ? 'scene-controls--sidebar' : ''}`}>
            <div className="control-group">
              <button className={cameraMode === 'third' ? 'active' : ''} onClick={() => setCameraMode('third')}>
                <Icon name="view" size={16} /> Góc ngoài
              </button>
              <button className={cameraMode === 'first' ? 'active' : ''} onClick={() => setCameraMode('first')}>
                POV
              </button>
            </div>

            {/* 4-POV Spatial Journey Shortcuts (CONCEPT_KHONG_GIAN Section 4) */}
            <div className="control-group pov-journey-group">
              <button
                className={activePOV === 'arrival' ? 'active' : ''}
                onClick={() => { setActivePOV('arrival'); leaveSeat(); }}
                title="POV 1: Cổng biệt thự CaféTrader và lối đi vào quán"
              >
                🏛️ Cổng quán
              </button>
              <button
                className={activePOV === 'hearth' ? 'active' : ''}
                onClick={() => { setActivePOV('hearth'); leaveSeat(); }}
                title="POV 2: Trái Tim Lò Sưởi Đá (Hearth Hall)"
              >
                🪵 Lò sưởi
              </button>
              <button
                className={activePOV === 'library' ? 'active' : ''}
                onClick={() => { setActivePOV('library'); leaveSeat(); }}
                title="POV 3: Thư Viện Tĩnh Lặng (Focus Library)"
              >
                📚 Thư viện
              </button>
              <button
                className={activePOV === 'terrace' ? 'active' : ''}
                onClick={() => { setActivePOV('terrace'); leaveSeat(); }}
                title="POV 4: Ban Công Ngắm Skyline & Brazier (Night Terrace)"
              >
                🌌 Skyline
              </button>
            </div>

            {/* Quick Royal Lift Floor Transit Button */}
            <button
              className="scene-control scene-control--vip"
              onClick={() => jumpToFloor(currentFloor >= 8 ? 1 : currentFloor + 1)}
              title="Đi thang máy lên tầng tiếp theo (T1–T8)"
            >
              <Icon name="stairs" size={16} />
              <span>Thang máy: T{currentFloor} ➔ T{currentFloor >= 8 ? 1 : currentFloor + 1}</span>
            </button>

            {/* Voice Mic Button (Table Scoped) */}
            <button
              className={`scene-control ${isVoiceConnected
                ? !isMicMuted
                  ? isLocalSpeaking
                    ? 'scene-control--speaking'
                    : 'scene-control--mic-on'
                  : 'scene-control--muted'
                : ''
                }`}
              onClick={handleToggleMic}
              title={
                seat
                  ? isMicMuted
                    ? 'Bật micro bàn'
                    : 'Tắt micro bàn'
                  : 'Hãy ngồi vào bàn để đàm thoại'
              }
            >
              <Icon name={isMicMuted ? 'volumeMute' : 'mic'} size={17} />
              <span>
                {!seat
                  ? 'Mic theo bàn'
                  : isMicMuted
                    ? 'Mic tắt'
                    : isLocalSpeaking
                      ? 'Đang nói...'
                      : 'Mic bàn bật'}
              </span>
            </button>

            {seat && (
              <button className="scene-control scene-control--accent" onClick={leaveSeat}>
                <Icon name="exit" size={17} /> <span>Đứng dậy</span>
              </button>
            )}

            <div className="control-hint">
              <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>di chuyển</span>
              <i /> <kbd>V</kbd><span>đổi góc nhìn</span>
              <i /> <kbd>Shift</kbd><span>chạy nhẹ</span>
            </div>
          </div>

          {/* T20 Virtual Joystick & Mobile Touch Controls */}
          {showTouchControls && (
            <TouchController
              isSeated={Boolean(seat)}
              currentFloor={currentFloor}
              cameraMode={cameraMode}
              isMicMuted={isMicMuted}
              isVoiceConnected={isVoiceConnected}
              isSpeaking={isLocalSpeaking}
              onToggleCamera={() => setCameraMode((m) => (m === 'first' ? 'third' : 'first'))}
              onToggleFloor={() => jumpToFloor(currentFloor >= 8 ? 1 : currentFloor + 1)}
              onToggleMic={handleToggleMic}
              onLeaveSeat={leaveSeat}
              onOpenMenu={() => {
                setSidebarOpen(true);
                setTab('menu');
                chillAudio.playMenuPaper();
              }}
              onOpenChat={() => {
                setSidebarOpen(true);
                setTab('chat');
              }}
            />
          )}

          <div className="scene-bottom-left">
            <span className="scene-dot" /> CAFE TRADER <span className="scene-bottom-sep">/</span> BIỆT THỰ HOÀNG GIA 8 TẦNG · {FLOOR_NAMES[currentFloor]?.title || `TẦNG ${currentFloor}`}
          </div>

          {/* Settings & Quality Modal */}
          {settingsOpen && (
            <div className="settings-popover">
              <div className="settings-title">
                <strong>Cài đặt & Hiệu năng</strong>
                <button className="plain-button" onClick={() => setSettingsOpen(false)} aria-label="Đóng cài đặt">
                  <Icon name="x" size={17} />
                </button>
              </div>

              <div className="settings-options">
                <label className="settings-toggle-row">
                  <span>Chỉ số hiệu năng (FPS / T08)</span>
                  <input
                    type="checkbox"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                  />
                </label>

                <label className="settings-toggle-row">
                  <span>Tiếng bước chân (Footsteps SFX)</span>
                  <input
                    type="checkbox"
                    checked={footstepSound}
                    onChange={toggleFootsteps}
                  />
                </label>

                <label className="settings-toggle-row">
                  <span>Phím ảo Mobile / Touch (T20)</span>
                  <input
                    type="checkbox"
                    checked={showTouchControls}
                    onChange={(e) => setShowTouchControls(e.target.checked)}
                  />
                </label>

                <label className="settings-toggle-row">
                  <span>Giảm chuyển động (Reduced Motion / T07)</span>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                  />
                </label>
              </div>

              {blockedUsers.size > 0 && (
                <div className="blocked-users-list">
                  <small>Đang chặn {blockedUsers.size} người dùng</small>
                  <button className="unblock-all-btn" onClick={() => { setBlockedUsers(new Set()); showToast('Đã bỏ chặn tất cả.'); }}>
                    Bỏ chặn tất cả
                  </button>
                </div>
              )}

              <p className="settings-desc">Quán cà phê 2 tầng phong cách Industrial Luxury dành cho cộng đồng Trader.</p>

              <button
                className="settings-back"
                onClick={() => { setEntered(false); leaveSeat(); setSettingsOpen(false); chillAudio.stopAll(); }}
              >
                <Icon name="exit" size={16} /> Rời quán
              </button>
            </div>
          )}

          {/* T16 Trader Terminal Modal */}
          <TraderTerminalModal
            isOpen={terminalOpen}
            onClose={() => setTerminalOpen(false)}
            onWinTrade={(profitText) => {
              chillAudio.playCashRegister();
              chillAudio.playFirework();
              setFireworksNonce((n) => n + 1);
              clientRef.current?.awardXp(150);
              clientRef.current?.sendFireworks(profitText);
              showToast(`🎯 CHỐT LỜI THÀNH CÔNG [${profitText}]! (+150 XP) 🎆`);
            }}
          />

          {/* Trader Passport Modal (T09) */}
          {profileOpen && (
            <div className="modal-overlay" onClick={() => setProfileOpen(false)}>
              <div className="passport-modal" onClick={(e) => e.stopPropagation()}>
                <div className="passport-header">
                  <div className="passport-header-title">
                    <span className="passport-pre">HỒ SƠ CĂN CƯỚC · TRADER PASSPORT</span>
                    <h2>{name.trim() || displayName}</h2>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setProfileOpen(false)}
                    aria-label="Đóng"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>

                <div className="passport-body">
                  <div className="passport-preview-card">
                    <div
                      className="passport-avatar-big"
                      style={{ backgroundColor: color }}
                    >
                      {(name.trim() || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div className="passport-preview-info">
                      <div className="passport-badge-tag">{profileBadge}</div>
                      <strong>{name.trim() || 'Trader Tĩnh Lặng'}</strong>
                      <div className="passport-phone-row">
                        <span>📱 {phone}</span>
                        <button
                          type="button"
                          className="passport-copy-mini"
                          onClick={() => {
                            navigator.clipboard?.writeText(phone);
                            chillAudio.playPhoneChime();
                            showToast(`📱 Đã sao chép số ${phone}`);
                          }}
                          title="Sao chép số điện thoại"
                        >
                          Sao chép
                        </button>
                      </div>
                      <span className="passport-level">
                        ⭐ Level {level} · {getTraderLevelTitle(level)}
                      </span>
                      <div className="passport-xp-container">
                        <div className="passport-xp-bar">
                          <div
                            className="passport-xp-fill"
                            style={{
                              width: `${Math.min(100, Math.max(10, ((xp - getXpForLevel(level)) / Math.max(1, getXpForNextLevel(level) - getXpForLevel(level))) * 100))}%`
                            }}
                          />
                        </div>
                        <small className="passport-xp-text">{xp} / {getXpForNextLevel(level)} XP</small>
                      </div>
                      <span className="passport-stats-mini">
                        Đã thưởng thức <strong>{cupsDrunk}</strong> tách cà phê
                      </span>
                    </div>
                  </div>

                  <div className="passport-form">
                    <div className="form-group">
                      <label>SỐ ĐIỆN THOẠI TRADER (ẢO)</label>
                      <div className="passport-phone-input-row">
                        <input
                          maxLength={16}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="098-xxx-xxxx"
                        />
                        <button
                          type="button"
                          className="passport-regen-phone-btn"
                          onClick={() => {
                            const newPhone = generateRandomPhone();
                            setPhone(newPhone);
                            chillAudio.playPhoneChime();
                            showToast(`📱 Đã cấp số mới: ${newPhone}`);
                          }}
                          title="Cấp số mới ngẫu nhiên"
                        >
                          Đổi số
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>TÊN HIỂN THỊ CỦA BẠN</label>
                      <input
                        maxLength={24}
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 24))}
                        placeholder="Nhập tên của bạn"
                      />
                    </div>

                    <div className="form-group">
                      <label>PHONG CÁCH GIAO DỊCH (BADGE)</label>
                      <div className="passport-badge-grid">
                        {TRADER_BADGES.map((b) => (
                          <button
                            key={b}
                            type="button"
                            className={`passport-badge-choice ${profileBadge === b ? 'active' : ''}`}
                            onClick={() => setProfileBadge(b)}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>CHÂM NGÔN / TIỂU SỬ TRADER (BIO)</label>
                      <textarea
                        rows={2}
                        maxLength={120}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value.slice(0, 120))}
                        placeholder="Viết một câu nói hoặc tôn chỉ giao dịch của bạn..."
                      />
                    </div>

                    <div className="form-group">
                      <label>MÀU ĐẠI DIỆN AVATAR</label>
                      <div className="color-list">
                        {colors.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`color-option ${color === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                          >
                            {color === c && <Icon name="check" size={13} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="passport-footer">
                  <button
                    type="button"
                    className="passport-cancel-btn"
                    onClick={() => setProfileOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="passport-save-btn"
                    onClick={() => handleSaveProfile({
                      name: name.trim() || 'Bạn ghé quán',
                      badge: profileBadge,
                      title: profileBadge,
                      bio: profileBio.trim(),
                      color,
                      cupsDrunk,
                      phone,
                      xp,
                      level,
                    })}
                  >
                    Lưu Thẻ Căn Cước
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trader Services Modal: Fireworks & Massage Spa (T22) */}
          {servicesModalOpen && (
            <div className="modal-overlay" onClick={() => setServicesModalOpen(false)}>
              <div className="services-modal" onClick={(e) => e.stopPropagation()}>
                <div className="services-header">
                  <div className="services-header-title">
                    <span className="services-pre">DỊCH VỤ & TIỆN ÍCH TRADER · CẤP QUYỀN TOÀN BỘ</span>
                    <h2>Pháo Hoa Chúc Mừng & Spa Thư Giãn</h2>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setServicesModalOpen(false)}
                    aria-label="Đóng"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>

                <div className="services-body">
                  {/* Section 1: Fireworks */}
                  <div className="service-card">
                    <div className="service-card-header">
                      <span className="service-icon">🎆</span>
                      <div>
                        <h3>Bắn Pháo Hoa & Chúc Mừng Trade Lãi</h3>
                        <p>Khai hỏa pháo hoa 3D rực rỡ, lan tỏa khí thế lệnh xanh và chúc mừng toàn quán (+150 XP).</p>
                      </div>
                    </div>
                    <div className="fireworks-presets">
                      {['+$500 Scalp 🚀', '+$1,500 Swing 💎', '+$5,000 Whale 🐋', '+$10,000 ATH 👑'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className="preset-chip"
                          onClick={() => { chillAudio.playUiClick(); setProfitInput(preset); }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <div className="fireworks-input-row">
                      <input
                        type="text"
                        placeholder="Nhập số lãi hoặc lời chúc (ví dụ: +$2,500 Long SOL)..."
                        value={profitInput}
                        onChange={(e) => setProfitInput(e.target.value)}
                        maxLength={40}
                      />
                      <button
                        type="button"
                        className="fireworks-launch-btn"
                        onClick={() => {
                          const text = profitInput.trim() || '+$1,000 Big Win';
                          chillAudio.playUiClick();
                          clientRef.current?.sendFireworks(text);
                          setProfitInput('');
                          setServicesModalOpen(false);
                        }}
                      >
                        🚀 Bắn Pháo Hoa (+150 XP)
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Massage Wellness */}
                  <div className="service-card">
                    <div className="service-card-header">
                      <span className="service-icon">💆</span>
                      <div>
                        <h3>Dịch Vụ Massage Xoa Dịu Thư Giãn Cho Trader</h3>
                        <p>Giải tỏa áp lực tâm lý sau những phiên căng thẳng, kích hoạt hào quang thiền định (+100 XP).</p>
                      </div>
                    </div>
                    <div className="massage-grid">
                      <div className="massage-item">
                        <div className="massage-item-info">
                          <strong>💆 Xoa bóp cổ vai gáy</strong>
                          <small>Xua tan cơn nhức mỏi lưng, vai gáy sau chuỗi giờ quan sát nến.</small>
                        </div>
                        <button
                          type="button"
                          className="massage-order-btn"
                          onClick={() => {
                            chillAudio.playUiClick();
                            clientRef.current?.requestService('massage-shoulders');
                            setServicesModalOpen(false);
                          }}
                        >
                          Thư giãn (+100 XP)
                        </button>
                      </div>

                      <div className="massage-item">
                        <div className="massage-item-info">
                          <strong>🧘 Bấm huyệt thái dương tĩnh tâm</strong>
                          <small>Giải tỏa áp lực tâm lý, bình ổn nhịp tim, chấm dứt cảm xúc FOMO.</small>
                        </div>
                        <button
                          type="button"
                          className="massage-order-btn"
                          onClick={() => {
                            chillAudio.playUiClick();
                            clientRef.current?.requestService('massage-head');
                            setServicesModalOpen(false);
                          }}
                        >
                          Tĩnh tâm (+100 XP)
                        </button>
                      </div>

                      <div className="massage-item">
                        <div className="massage-item-info">
                          <strong>🌿 Xông trầm hương & Chuông xoay Tây Tạng</strong>
                          <small>Tần số âm thanh 432Hz xoa dịu thần kinh, tái tạo sinh lực tinh thần.</small>
                        </div>
                        <button
                          type="button"
                          className="massage-order-btn"
                          onClick={() => {
                            chillAudio.playUiClick();
                            clientRef.current?.requestService('zen-aromatherapy');
                            setServicesModalOpen(false);
                          }}
                        >
                          Chuông xoay (+100 XP)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Virtual Phone */}
                  <div className="service-card service-card--compact">
                    <div className="service-card-header">
                      <span className="service-icon">📱</span>
                      <div>
                        <h3>Số Điện Thoại Ảo Của Bạn</h3>
                        <p>Cấp số liên lạc riêng cho mỗi Trader, định danh uy tín trong quán.</p>
                      </div>
                    </div>
                    <div className="phone-card-row">
                      <span className="phone-number-vip">{phone}</span>
                      <button
                        type="button"
                        className="phone-copy-btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(phone);
                          chillAudio.playPhoneChime();
                          showToast(`📱 Đã sao chép số điện thoại ${phone}!`);
                        }}
                      >
                        Sao chép số 📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NFP Market Intel & Bot Council Modal (T23) */}
          {nfpModalOpen && (
            <div className="modal-overlay" onClick={() => setNfpModalOpen(false)}>
              <div className="nfp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="nfp-modal-header">
                  <div className="nfp-modal-title">
                    <span className="nfp-modal-pre">TRADER INTELLIGENCE & AI RESIDENTS · TIN NÓNG THỊ TRƯỜNG</span>
                    <h2>🔥 Bảng Tin NFP & Hội Đồng Bot Trader</h2>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setNfpModalOpen(false)}
                    aria-label="Đóng"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>

                <div className="nfp-modal-body">
                  {/* NFP Breaking Card */}
                  <div className="nfp-card">
                    <div className="nfp-card-header">
                      <span className="nfp-icon">📊</span>
                      <div>
                        <h3>Bảng Lương Phi Nông Nghiệp Hoa Kỳ (Non-Farm Payrolls)</h3>
                        <p>Dữ liệu kinh tế vĩ mô quyền lực nhất tháng, quyết định đường hướng lãi suất Fed và kích hoạt các đợt quét thanh khoản quy mô lớn.</p>
                      </div>
                    </div>

                    <div className="nfp-grid">
                      <div className="nfp-stat-box highlight">
                        <span className="stat-label">SỐ LIỆU THỰC TẾ</span>
                        <strong className="stat-val green">254K</strong>
                        <small className="stat-note">Vượt kỳ vọng (+114K) 🚀</small>
                      </div>
                      <div className="nfp-stat-box">
                        <span className="stat-label">DỰ BÁO ĐỒNG THUẬN</span>
                        <strong className="stat-val">140K</strong>
                        <small className="stat-note">Kỳ vọng các chuyên gia</small>
                      </div>
                      <div className="nfp-stat-box">
                        <span className="stat-label">KỲ TRƯỚC</span>
                        <strong className="stat-val">159K</strong>
                        <small className="stat-note">Tháng trước điều chỉnh</small>
                      </div>
                      <div className="nfp-stat-box highlight">
                        <span className="stat-label">TỶ LỆ THẤT NGHIỆP</span>
                        <strong className="stat-val green">4.1%</strong>
                        <small className="stat-note">Hạ nhiệt từ 4.2%</small>
                      </div>
                    </div>

                    <div className="nfp-impact-banner">
                      ⚡ <strong>Tác động thị trường:</strong> Chỉ số DXY giật tăng vọt lên 102.5 (+75 pips), Vàng (XAU/USD) quét 2 đầu biên độ lớn, BTC & chứng khoán hồi phục mạnh nhờ kinh tế vững chắc.
                    </div>

                    <div className="nfp-actions-row">
                      <button
                        type="button"
                        className="nfp-trigger-btn"
                        onClick={handleTriggerNfp}
                        title="Bắn tín hiệu thị trường NFP tới toàn bộ Trader trong phòng"
                      >
                        🚀 Kích Hoạt Tín Hiệu NFP Khẩn Cấp (Phản Ứng Toàn Quán)
                      </button>
                    </div>
                  </div>

                  {/* BOT Personas Section */}
                  <div className="bots-section">
                    <div className="bots-section-header">
                      <div>
                        <h3>Hệ Thống Giọng Nói Tiếng Việt & Hội Đồng Bot</h3>
                        <p>Giọng nói tiếng Việt chuẩn tự nhiên, tích hợp toàn diện cho 4 Bot Trader, 3 Nhân sự quán, Thông báo phòng và Tiện ích dịch vụ.</p>
                      </div>
                      <div className="voice-controls-row">
                        <select
                          className="tts-engine-select"
                          value={ttsEngine}
                          onChange={(e) => handleSetTtsEngine(e.target.value as TtsEngineMode)}
                          title="Chọn bộ giải mã giọng nói tiếng Việt"
                        >
                          <option value="auto">✨ Tự động đa tầng (Khuyên dùng)</option>
                          <option value="cloud">☁️ Cloud Neural HD (Nhanh & Ổn định)</option>
                          <option value="korva">💻 KorvaTTS Local AI (ONNX On-device)</option>
                          <option value="native">🌐 Trình duyệt (Web Speech API)</option>
                        </select>
                        <button
                          type="button"
                          className={`bot-voice-toggle-btn ${botVoiceEnabled ? 'active' : 'muted'}`}
                          onClick={toggleBotVoice}
                          title="Bật/Tắt giọng nói AI tự nhiên"
                        >
                          🎙️ Giọng nói AI: {botVoiceEnabled ? 'Đang Bật' : 'Đang Tắt'}
                        </button>
                      </div>
                    </div>

                    <div className="bots-grid">
                      {BOT_LIST.map((bot) => (
                        <div key={bot.id} className="bot-card">
                          <div className="bot-card-top">
                            <span className="bot-avatar" style={{ backgroundColor: bot.color }}>
                              {bot.name.charAt(0)}
                            </span>
                            <div className="bot-card-title-col">
                              <div className="bot-name-row">
                                <strong>🤖 {bot.name}</strong>
                                <span className="bot-level-tag">Lv.{bot.level}</span>
                              </div>
                              <small className="bot-subtitle">{bot.title} · {bot.badge}</small>
                            </div>
                          </div>

                          <p className="bot-bio">"{bot.bio}"</p>

                          <div className="bot-details">
                            <div>📍 <strong>Vị trí ngồi:</strong> Bàn {bot.tableNum} ({bot.tableNum === '6' ? 'Ban công VIP Tầng 2' : bot.tableNum === '2' ? 'Lò sưởi Tầng 1' : bot.tableNum === '1' ? 'Cửa sổ Tầng 1' : 'Thư viện Tầng 1'})</div>
                            <div>☕ <strong>Đồ uống yêu thích:</strong> {bot.drink}</div>
                            <div>📱 <strong>Số điện thoại:</strong> {bot.phone}</div>
                            <div>🎙️ <strong>Chất giọng:</strong> {bot.gender === 'male' ? 'Nam' : 'Nữ'} ({bot.pitch < 1 ? 'Trầm ấm đĩnh đạc' : bot.pitch > 1.1 ? 'Dịu dàng truyền cảm' : 'Trẻ trung sắc bén'}, {bot.rate}x)</div>
                          </div>

                          <div className="bot-quote-box">
                            <small>Phản ứng khi có tin NFP:</small>
                            <em>"{bot.nfpReaction}"</em>
                          </div>

                          <div className="bot-card-footer">
                            <button
                              type="button"
                              className="bot-listen-btn"
                              onClick={() => {
                                botVoice.speak(bot.id, bot.greeting);
                              }}
                              title="Nghe giọng chào tự nhiên"
                            >
                              🔊 Nghe thử giọng chào
                            </button>
                            <button
                              type="button"
                              className="bot-listen-nfp-btn"
                              onClick={() => {
                                botVoice.speak(bot.id, bot.nfpReaction);
                              }}
                              title="Nghe phản ứng giật nến NFP"
                            >
                              ⚡ Phản ứng NFP
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Staff Voices Section */}
                    <div className="staff-voices-card">
                      <div className="staff-voices-header">
                        <h4>👥 Đội Ngũ Nhân Sự Quán (Giọng Nói Tiếng Việt)</h4>
                        <p>Nhân viên túc trực tại sảnh đón, quầy bar và phòng khách với các lời chào và phục vụ chuyên nghiệp.</p>
                      </div>
                      <div className="staff-voices-grid">
                        <div className="staff-voice-item">
                          <div className="staff-voice-info">
                            <strong>👨‍💼 Quản gia Minh An</strong>
                            <span>Tiền sảnh & Grand Foyer</span>
                          </div>
                          <button
                            type="button"
                            className="staff-voice-test-btn"
                            onClick={() => {
                              chillAudio.playUiClick();
                              staffVoice.speak('concierge-minh-an', 'Kính chào quý khách ghé thăm biệt thự Café Trader Villa! Tôi là Minh An, rất hân hạnh được đón tiếp bạn.');
                            }}
                          >
                            🔊 Nghe lời chào tiền sảnh
                          </button>
                        </div>
                        <div className="staff-voice-item">
                          <div className="staff-voice-info">
                            <strong>👩‍🍳 Barista Thu Hà</strong>
                            <span>Quầy Barista & Pha chế</span>
                          </div>
                          <button
                            type="button"
                            className="staff-voice-test-btn"
                            onClick={() => {
                              chillAudio.playUiClick();
                              staffVoice.speak('barista-thu-ha', 'Xin chào quý khách! Cà phê pha thủ công của Thu Hà đã sẵn sàng, mời bạn nhấp một ngụm thật thơm ngon.');
                            }}
                          >
                            🔊 Nghe giọng Barista
                          </button>
                        </div>
                        <div className="staff-voice-item">
                          <div className="staff-voice-info">
                            <strong>💁‍♀️ Tiếp viên Bảo Ngọc</strong>
                            <span>Sảnh Hearth & Dịch vụ Spa</span>
                          </div>
                          <button
                            type="button"
                            className="staff-voice-test-btn"
                            onClick={() => {
                              chillAudio.playUiClick();
                              staffVoice.speak('host-bao-ngoc', 'Chào mừng quý khách đến với sảnh Hearth ấm cúng! Mời bạn ngắm củi lửa reo vui và thư giãn tâm trí.');
                            }}
                          >
                            🔊 Nghe lời chào sảnh Hearth
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Host Announcement Broadcast Modal (T21) */}
          {announcementModalOpen && (
            <div className="modal-overlay" onClick={() => setAnnouncementModalOpen(false)}>
              <div className="moderation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="moderation-header">
                  <div className="moderation-title">
                    <Icon name="megaphone" size={18} />
                    <h3>Phát thông báo tới phòng</h3>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setAnnouncementModalOpen(false)}
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <form onSubmit={handleSendAnnouncement}>
                  <div className="moderation-body">
                    <p>Nội dung này sẽ hiển thị nổi bật dưới dạng banner thông báo cho toàn bộ người chơi trong phòng.</p>
                    <textarea
                      rows={3}
                      maxLength={200}
                      required
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="Ví dụ: Bàn 6 đang mở phiên thảo luận về Bitcoin ETF, mời mọi người ghé giao lưu..."
                    />
                  </div>
                  <div className="moderation-footer">
                    <button
                      type="button"
                      className="passport-cancel-btn"
                      onClick={() => setAnnouncementModalOpen(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="passport-save-btn"
                      disabled={!announcementText.trim()}
                    >
                      Phát thông báo 📢
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Report Violation Modal (T21) */}
          {reportModalPlayer && (
            <div className="modal-overlay" onClick={() => setReportModalPlayer(null)}>
              <div className="moderation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="moderation-header">
                  <div className="moderation-title">
                    <Icon name="flag" size={18} />
                    <h3>Báo cáo vi phạm: {reportModalPlayer.targetName}</h3>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setReportModalPlayer(null)}
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <form onSubmit={handleSubmitReport}>
                  <div className="moderation-body">
                    <label className="dialog-field-label">LÝ DO BÁO CÁO:</label>
                    <div className="report-choices">
                      {[
                        'Spam tin nhắn hoặc biểu cảm liên tục',
                        'Quấy rối hoặc ngôn từ thù địch / thiếu văn hóa',
                        'Quảng cáo, spam link hoặc lừa đảo',
                        'Hành vi phá hoại trải nghiệm phòng',
                      ].map((reason) => (
                        <label key={reason} className="report-radio-label">
                          <input
                            type="radio"
                            name="reportReason"
                            value={reason}
                            checked={reportReason === reason}
                            onChange={(e) => setReportReason(e.target.value)}
                          />
                          <span>{reason}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="moderation-footer">
                    <button
                      type="button"
                      className="passport-cancel-btn"
                      onClick={() => setReportModalPlayer(null)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="report-submit-btn"
                    >
                      Gửi báo cáo vi phạm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Photo Mode "Closing Bell" (T07, T20, T22) */}
          <PhotoModeOverlay
            isOpen={photoModeOpen}
            onClose={() => {
              setPhotoModeOpen(false);
              setPhotoPreset('current');
              setCapturedRawImage(null);
            }}
            activeFloor={currentFloor}
            traderName={profile.name || name || 'Trader'}
            traderLevel={level}
            traderBadge={profile.badge || profileBadge}
            onPresetChange={(preset) => setPhotoPreset(preset)}
            onFovChange={(fov) => setPhotoFov(fov)}
            onTriggerCapture={(_cfg) => {
              setCaptureTrigger({ nonce: Date.now() });
            }}
            capturedRawImage={capturedRawImage}
            onClearCapturedImage={() => setCapturedRawImage(null)}
          />
        </>
      )}
    </main>
  );
}
