import { chillAudio } from './chillAudio';
import { vietnameseTts } from './vietnameseTts';

export type BotId = 'bot-alex' | 'bot-mailinh' | 'bot-haidang' | 'bot-sarah';

export type BotPersona = {
  id: BotId;
  name: string;
  gender: 'male' | 'female';
  title: string;
  bio: string;
  badge: string;
  color: string;
  seatId: string;
  tableNum: string;
  drink: string;
  level: number;
  xp: number;
  phone: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  pitch: number;
  rate: number;
  voiceKeywords: string[];
  greeting: string;
  nfpReaction: string;
};

export const BOT_PERSONAS: Record<BotId, BotPersona> = {
  'bot-alex': {
    id: 'bot-alex',
    name: 'Alex Trần',
    gender: 'male',
    title: '🐋 Cá Voi Đại Dương',
    bio: 'Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn.',
    badge: '💎 HODLer',
    color: '#d49b58', // Amber Gold
    seatId: 'table-6-seat-1',
    tableNum: '6',
    drink: 'Cà phê trứng Hà Nội',
    level: 8,
    xp: 6400,
    phone: '098-888-9999',
    x: -3.8,
    y: 3.2,
    z: 1.75,
    rotation: 0,
    pitch: 0.84, // Trầm, đĩnh đạc, tự tin
    rate: 0.94,
    voiceKeywords: ['NamMinh', 'An', 'Vietnamese Male', 'David', 'Daniel', 'Male'],
    greeting: 'Chào bạn! Ban công VIP tầng 2 view rất thoáng, nhấp ngụm cà phê rồi cùng soi chart với mình nhé.',
    nfpReaction: 'Bình tĩnh anh em, đừng fomo cây nến 5 phút đầu. Chờ cấu trúc thanh khoản rõ ràng hãy mở vị thế.',
  },
  'bot-mailinh': {
    id: 'bot-mailinh',
    name: 'Mai Linh',
    gender: 'female',
    title: 'Lướt Sóng Bậc Thầy',
    bio: 'Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do.',
    badge: '🧘 Zen Trader',
    color: '#2d6a4f', // Emerald Forest
    seatId: 'table-1-seat-3',
    tableNum: '1',
    drink: 'Trà hoa cúc mật ong',
    level: 5,
    xp: 2500,
    phone: '098-666-8888',
    x: -5.4,
    y: 0,
    z: -1.65,
    rotation: Math.PI,
    pitch: 1.18, // Ấm áp, nhẹ nhàng, truyền cảm
    rate: 0.96,
    voiceKeywords: ['HoaiMy', 'Mai', 'Linh', 'Vietnamese Female', 'Google Tiếng Việt', 'Zira', 'Samantha', 'Victoria'],
    greeting: 'Chào bạn ghé Bàn 1 nhé! Ngồi đây ngắm mưa cho nhẹ lòng, hôm nay thị trường của bạn thế nào?',
    nfpReaction: 'Hít một hơi thật sâu nào cả nhà, ai có lệnh xanh nhớ dời stoploss hòa vốn để giữ thành quả nhé.',
  },
  'bot-haidang': {
    id: 'bot-haidang',
    name: 'Hải Đăng',
    gender: 'male',
    title: 'Bàn Tay Kim Cương',
    bio: 'Chuyên gia Scalping nến giật. Canh tin NFP, CPI & FOMC.',
    badge: '⚡ Scalper',
    color: '#b2533e', // Terracotta Rust
    seatId: 'table-2-seat-2',
    tableNum: '2',
    drink: 'Espresso đậm đặc',
    level: 7,
    xp: 4900,
    phone: '098-777-5555',
    x: -4.35,
    y: 0,
    z: 1.35,
    rotation: -Math.PI / 2,
    pitch: 1.05, // Nhanh nhẹn, trẻ trung, sắc bén
    rate: 1.06,
    voiceKeywords: ['NamMinh', 'Mark', 'George', 'Alex', 'Male'],
    greeting: 'Chào người anh em! Ngồi bên lò sưởi Fireside canh nến với mình nhé, sắp có sóng lớn đấy!',
    nfpReaction: 'Tin NFP ra 254K xanh lè anh em ơi! DXY giật dựng đứng, nến vàng quét râu cả trăm pips!',
  },
  'bot-sarah': {
    id: 'bot-sarah',
    name: 'Sarah Jenkins',
    gender: 'female',
    title: 'Huyền Thoại Market',
    bio: 'Hedge Fund Global Macro Analyst. Data-driven & liquidity cycles.',
    badge: '🌐 Macro Analyst',
    color: '#34495e', // Midnight Slate
    seatId: 'table-4-seat-3',
    tableNum: '4',
    drink: 'Cold Brew ủ lạnh',
    level: 9,
    xp: 8100,
    phone: '098-999-3333',
    x: -1.5,
    y: 0,
    z: -0.45,
    rotation: Math.PI,
    pitch: 1.08, // Thanh lịch, trí thức, phân tích chuẩn xác
    rate: 1.0,
    voiceKeywords: ['Samantha', 'Victoria', 'Karen', 'Zira', 'Female'],
    greeting: 'Hello! Góc thư viện Focus Library này rất yên tĩnh, rất tuyệt để soi báo cáo vĩ mô và chỉ số DXY.',
    nfpReaction: 'Báo cáo việc làm vượt xa dự báo củng cố kịch bản soft landing, Fed sẽ khó hạ lãi suất mạnh.',
  },
};

export const BOT_LIST: BotPersona[] = Object.values(BOT_PERSONAS);

export type BotSpeakingListener = (botId: string, isSpeaking: boolean) => void;

class BotVoiceService {
  private voiceEnabled = true;
  private listeners = new Set<BotSpeakingListener>();
  private currentSpeaker: string | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
      // Restore user voice preference
      try {
        const stored = localStorage.getItem('cafetrader_bot_voice');
        if (stored !== null) this.voiceEnabled = stored === 'true';
      } catch { }
    }
  }

  isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    try {
      localStorage.setItem('cafetrader_bot_voice', String(enabled));
    } catch { }
    if (!enabled) this.stop();
  }

  onSpeakingChange(listener: BotSpeakingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(botId: string, isSpeaking: boolean): void {
    this.listeners.forEach((fn) => {
      try { fn(botId, isSpeaking); } catch { }
    });
  }

  stop(): void {
    vietnameseTts.stop();
    if (this.currentSpeaker) {
      this.notify(this.currentSpeaker, false);
      this.currentSpeaker = null;
    }
  }

  private findBestVoice(persona: BotPersona): SpeechSynthesisVoice | null {
    if (!this.cachedVoices.length && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    const list = this.cachedVoices;
    if (!list.length) return null;

    // 1. Try finding Vietnamese voice
    const viVoice = list.find((v) =>
      v.lang.toLowerCase().startsWith('vi') ||
      v.name.includes('Vietnamese') ||
      v.name.includes('Tiếng Việt') ||
      persona.voiceKeywords.some((kw) => v.name.toLowerCase().includes(kw.toLowerCase()))
    );
    if (viVoice) return viVoice;

    // 2. Try preferred keywords for this persona's gender
    for (const kw of persona.voiceKeywords) {
      const match = list.find((v) => v.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) return match;
    }

    // 3. Fallback to gender-appropriate English voice
    if (persona.gender === 'female') {
      const fVoice = list.find((v) => /female|zira|samantha|victoria|karen|catherine|hazel/i.test(v.name));
      if (fVoice) return fVoice;
    } else {
      const mVoice = list.find((v) => /male|david|george|mark|daniel|james|richard/i.test(v.name));
      if (mVoice) return mVoice;
    }

    return list[0] || null;
  }

  speak(botId: BotId, text: string, onEnd?: () => void): void {
    const persona = BOT_PERSONAS[botId];
    if (!persona) return;

    // Always play the procedural acoustic vocal tone for rich atmosphere
    chillAudio.playBotVocal(persona.gender, persona.pitch);

    if (!this.voiceEnabled || typeof window === 'undefined') {
      // Still trigger visual 3D speaking halo briefly
      this.notify(botId, true);
      const estDuration = Math.min(4500, Math.max(1800, text.length * 75));
      window.setTimeout(() => {
        this.notify(botId, false);
        onEnd?.();
      }, estDuration);
      return;
    }

    try {
      const voice = this.findBestVoice(persona);
      this.currentSpeaker = botId;
      const finish = () => {
        if (this.currentSpeaker === botId) {
          this.notify(botId, false);
          this.currentSpeaker = null;
        }
        onEnd?.();
      };
      const started = vietnameseTts.speak(text, {
        voice: ({
          'bot-alex': 'hoang_nam',
          'bot-mailinh': 'bao_kim',
          'bot-haidang': 'quang_huy',
          'bot-sarah': 'quynh_nhu',
        } as const)[botId],
        gender: persona.gender,
        pitch: persona.pitch,
        rate: persona.rate,
        volume: 1,
        nativeVoice: voice,
      }, {
        onStart: () => this.notify(botId, true),
        onEnd: finish,
      });
      if (!started) throw new Error('No Vietnamese TTS output available');
    } catch {
      this.notify(botId, true);
      window.setTimeout(() => {
        this.notify(botId, false);
        onEnd?.();
      }, 2500);
    }
  }
}

export const botVoice = new BotVoiceService();

