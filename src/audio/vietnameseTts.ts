export type TtsEngineMode = 'auto' | 'cloud' | 'korva' | 'native';

export type VietnameseTtsProfile = {
  /** Voice style or speaker identifier (Korva style or voice name) */
  voice: string;
  pitch: number;
  rate: number;
  volume: number;
  gender?: 'male' | 'female';
  nativeVoice?: SpeechSynthesisVoice | null;
};

export type VietnameseTtsEvents = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
};

const KORVA_ENGINE = 'korva';
const KORVA_COOLDOWN_MS = 60_000;
const CLOUD_COOLDOWN_MS = 30_000;
const STORAGE_KEY = 'cafetrader_tts_engine';

/**
 * Resilient multi-tier Vietnamese Text-To-Speech Service.
 *
 * Tier 1: Local AI Neural Engine (KorvaTTS ONNX flow-matching 44.1kHz / VieNeu-TTS)
 *         when configured via VIET_TTS_SERVICE_URL.
 * Tier 2: Free Cloud Vietnamese Neural Audio Stream (/api/tts-cloud) with in-memory caching.
 *         Works 100% out-of-the-box on desktop, mobile, and web tunnels without local models.
 * Tier 3: Native Web Speech API (SpeechSynthesis) for zero-latency offline playback.
 */
class VietnameseTtsService {
  private audio: HTMLAudioElement | null = null;
  private objectUrl: string | null = null;
  private controller: AbortController | null = null;
  private korvaUnavailableUntil = 0;
  private cloudUnavailableUntil = 0;
  private engineMode: TtsEngineMode = 'auto';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as TtsEngineMode | null;
        if (saved && ['auto', 'cloud', 'korva', 'native'].includes(saved)) {
          this.engineMode = saved;
        }
      } catch { }
    }
  }

  getEngineMode(): TtsEngineMode {
    return this.engineMode;
  }

  setEngineMode(mode: TtsEngineMode): void {
    this.engineMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch { }
  }

  private get useKorvaEnv(): boolean {
    return import.meta.env.VITE_VIET_TTS_ENGINE === KORVA_ENGINE;
  }

  private clearAudio(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  stop(): void {
    this.controller?.abort();
    this.controller = null;
    this.clearAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  speak(text: string, profile: VietnameseTtsProfile, events: VietnameseTtsEvents = {}): boolean {
    if (typeof window === 'undefined' || !text.trim()) return false;
    this.stop();

    const mode = this.engineMode;

    // Explicit Native Web Speech
    if (mode === 'native') {
      return this.playNative(text, profile, events);
    }

    // Explicit Korva local bridge
    if (mode === 'korva') {
      void this.playKorva(text, profile, events);
      return true;
    }

    // Explicit Cloud TTS
    if (mode === 'cloud') {
      void this.playCloud(text, profile, events);
      return true;
    }

    // Auto mode: Try Korva -> Cloud -> Native
    if (this.useKorvaEnv && Date.now() >= this.korvaUnavailableUntil) {
      void this.playKorva(text, profile, events);
      return true;
    }

    if (Date.now() >= this.cloudUnavailableUntil) {
      void this.playCloud(text, profile, events);
      return true;
    }

    return this.playNative(text, profile, events);
  }

  private playNative(text: string, profile: VietnameseTtsProfile, events: VietnameseTtsEvents): boolean {
    if (!('speechSynthesis' in window)) {
      events.onEnd?.();
      return false;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.voice = profile.nativeVoice ?? null;
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = profile.volume;
      utterance.onstart = () => events.onStart?.();
      utterance.onend = () => events.onEnd?.();
      utterance.onerror = () => events.onEnd?.();
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      events.onEnd?.();
      return false;
    }
  }

  private async playCloud(text: string, profile: VietnameseTtsProfile, events: VietnameseTtsEvents): Promise<void> {
    const controller = new AbortController();
    this.controller = controller;
    events.onStart?.();

    try {
      const response = await fetch('/api/tts-cloud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: profile.voice, speed: profile.rate }),
        signal: controller.signal,
      });

      if (!response.ok || !response.headers.get('content-type')?.includes('audio/')) {
        throw new Error(`Cloud TTS error ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error('Cloud TTS returned empty audio');
      if (this.controller !== controller) return;

      this.objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(this.objectUrl);
      this.audio = audio;
      audio.volume = Math.max(0, Math.min(1, profile.volume));
      // Tinh chỉnh tốc độ phát âm thanh theo profile nhân vật
      audio.playbackRate = Math.max(0.75, Math.min(1.35, profile.rate));

      audio.onended = () => {
        this.clearAudio();
        events.onEnd?.();
      };
      audio.onerror = () => {
        this.clearAudio();
        events.onEnd?.();
      };

      await audio.play();
    } catch (error) {
      if (controller.signal.aborted) return;
      this.cloudUnavailableUntil = Date.now() + CLOUD_COOLDOWN_MS;
      // Fallback to Native SpeechSynthesis
      const nativeStarted = this.playNative(text, profile, { onEnd: events.onEnd });
      if (!nativeStarted) events.onEnd?.();
    } finally {
      if (this.controller === controller) this.controller = null;
    }
  }

  private async playKorva(text: string, profile: VietnameseTtsProfile, events: VietnameseTtsEvents): Promise<void> {
    const controller = new AbortController();
    this.controller = controller;
    events.onStart?.();
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: profile.voice, speed: profile.rate }),
        signal: controller.signal,
      });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) {
        throw new Error('KorvaTTS bridge is unavailable');
      }
      const blob = await response.blob();
      if (!blob.size) throw new Error('KorvaTTS returned empty audio');
      if (this.controller !== controller) return;

      this.objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(this.objectUrl);
      this.audio = audio;
      audio.volume = profile.volume;
      audio.onended = () => {
        this.clearAudio();
        events.onEnd?.();
      };
      audio.onerror = () => {
        this.clearAudio();
        events.onEnd?.();
      };
      await audio.play();
    } catch (error) {
      if (controller.signal.aborted) return;
      this.korvaUnavailableUntil = Date.now() + KORVA_COOLDOWN_MS;
      // Fallback to Cloud Vietnamese TTS -> Native
      void this.playCloud(text, profile, events);
    } finally {
      if (this.controller === controller) this.controller = null;
    }
  }
}

export const vietnameseTts = new VietnameseTtsService();
