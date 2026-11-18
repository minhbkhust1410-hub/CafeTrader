import { vietnameseTts } from './vietnameseTts';

export type StaffId = 'concierge-minh-an' | 'barista-thu-ha' | 'host-bao-ngoc';

export type StaffVoiceProfile = {
  name: string;
  role: string;
  voice: string;
  gender: 'male' | 'female';
  pitch: number;
  rate: number;
};

export const STAFF_VOICE: Record<StaffId, StaffVoiceProfile> = {
  'concierge-minh-an': { name: 'Minh An', role: 'Quản gia', voice: 'hoang_nam', gender: 'male', pitch: 0.9, rate: 0.93 },
  'barista-thu-ha': { name: 'Thu Hà', role: 'Bartender & Barista', voice: 'khanh_vy', gender: 'female', pitch: 1.08, rate: 0.98 },
  'host-bao-ngoc': { name: 'Bảo Ngọc', role: 'Tiếp viên', voice: 'phuong_linh', gender: 'female', pitch: 1.14, rate: 1.0 },
};

export const BARTENDER_PROACTIVE_GREETINGS = [
  'Chào bạn! Mời bạn ghé quầy bar. Hôm nay bạn muốn dùng cà phê truyền thống hay một ly cocktail chill để giải tỏa căng thẳng trading?',
  'Xin chào quý khách! Thị trường hôm nay thế nào bạn ơi? Thu Hà có thể pha cho bạn một món đặc biệt để lấy lại năng lượng nhé!',
  'Chào mừng bạn đến quầy bar! Quầy đang có cà phê trứng béo ngậy và cold brew ủ lạnh rất ngon, bạn muốn thử món nào?',
  'Chào bạn! Mời bạn xem qua thực đơn trên quầy nhé. Bạn thích uống đậm vị hay thanh mát để Thu Hà chuẩn bị ngay nào?',
];

export type StaffSpeakingListener = (staffId: StaffId, isSpeaking: boolean) => void;

function vietnameseVoice(gender: 'male' | 'female') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const list = window.speechSynthesis.getVoices();
  const viVoice = list.find((v) => v.lang.toLowerCase().startsWith('vi'));
  if (viVoice) return viVoice;
  return null;
}

class StaffVoiceService {
  private listeners = new Set<StaffSpeakingListener>();
  private currentSpeaker: StaffId | null = null;

  onSpeakingChange(listener: StaffSpeakingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(staffId: StaffId, isSpeaking: boolean): void {
    this.listeners.forEach((fn) => {
      try { fn(staffId, isSpeaking); } catch { }
    });
  }

  getCurrentSpeaker(): StaffId | null {
    return this.currentSpeaker;
  }

  speak(staffId: StaffId, text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !text.trim()) return false;
    const profile = STAFF_VOICE[staffId];
    if (!profile) return false;

    this.currentSpeaker = staffId;

    const finish = () => {
      if (this.currentSpeaker === staffId) {
        this.notify(staffId, false);
        this.currentSpeaker = null;
      }
      onEnd?.();
    };

    return vietnameseTts.speak(text, {
      voice: profile.voice,
      pitch: profile.pitch,
      rate: profile.rate,
      volume: 0.98,
      gender: profile.gender,
      nativeVoice: vietnameseVoice(profile.gender),
    }, {
      onStart: () => this.notify(staffId, true),
      onEnd: finish,
      onError: finish,
    });
  }

  greetBartenderProactive(onEnd?: () => void): string {
    const greeting = BARTENDER_PROACTIVE_GREETINGS[Math.floor(Math.random() * BARTENDER_PROACTIVE_GREETINGS.length)];
    this.speak('barista-thu-ha', greeting, onEnd);
    return greeting;
  }

  stop(): void {
    vietnameseTts.stop();
    if (this.currentSpeaker) {
      this.notify(this.currentSpeaker, false);
      this.currentSpeaker = null;
    }
  }
}

export const staffVoice = new StaffVoiceService();
