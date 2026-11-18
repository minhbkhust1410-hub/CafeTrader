/**
 * Procedural Web Audio engine for CafeTrader.
 * Zero external audio files required, zero copyright liability, instant start.
 */

type VolumeChannel = 'master' | 'music' | 'rain' | 'ambient' | 'sfx';

export type ChillPreset = 'rainy' | 'focus' | 'night' | 'cafe' | 'fireside';

class ChillAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Rain nodes
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private isRainPlaying = false;

  // Ambient nodes
  private ambientGain: GainNode | null = null;
  private ambientTimer: number | null = null;
  private isAmbientPlaying = false;

  // Fireplace nodes
  private fireGain: GainNode | null = null;
  private fireTimer: number | null = null;
  private isFirePlaying = false;

  // Music nodes
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private isMusicPlaying = false;
  private chordIndex = 0;

  // SFX nodes (Footsteps & Interactions)
  private sfxGain: GainNode | null = null;
  private footstepEnabled = true;
  private lastFootstepTime = 0;

  // Volumes (0 to 1)
  private volumes = {
    master: 0.8,
    music: 0.65,
    rain: 0.5,
    ambient: 0.4,
    // Keep movement feedback clearly audible above rain, music and café ambience.
    sfx: 0.78,
  };

  private muted = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volumes.master, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Rain channel
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(this.volumes.rain, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);

      // Ambient channel
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.volumes.ambient, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Fireplace crackles channel
      this.fireGain = this.ctx.createGain();
      this.fireGain.gain.setValueAtTime(this.volumes.ambient * 0.85, this.ctx.currentTime);
      this.fireGain.connect(this.masterGain);

      // Music channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.volumes.music, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.volumes.sfx, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Opens or resumes Web Audio during a trusted UI gesture. */
  resume(): void {
    this.ensureContext();
  }

  unmute(): void {
    this.muted = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
    }
  }

  // Generate pink noise buffer for realistic rain
  private createRainBuffer(ctx: AudioContext, seconds = 6): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  // --- Rain Channel ---
  startRain(): void {
    const ctx = this.ensureContext();
    if (this.isRainPlaying || !this.rainGain) return;

    const buffer = this.createRainBuffer(ctx, 8);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to sound like rain outside window
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    // Subtle LFO modulation for wind/intensity changes
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    source.connect(filter);
    filter.connect(this.rainGain);
    source.start();
    this.rainSource = source;
    this.isRainPlaying = true;
  }

  stopRain(): void {
    if (this.rainSource) {
      try { this.rainSource.stop(); } catch { /* ignore */ }
      this.rainSource.disconnect();
      this.rainSource = null;
    }
    this.isRainPlaying = false;
  }

  // --- Warm Ambient (Café Murmurs & Cups) ---
  startAmbient(): void {
    const ctx = this.ensureContext();
    if (this.isAmbientPlaying || !this.ambientGain) return;

    this.isAmbientPlaying = true;
    const scheduleNextClink = () => {
      if (!this.isAmbientPlaying) return;
      const delay = 4000 + Math.random() * 8000;
      this.ambientTimer = window.setTimeout(() => {
        this.playCeramicClink();
        scheduleNextClink();
      }, delay);
    };
    scheduleNextClink();
  }

  private playCeramicClink(): void {
    if (!this.ctx || !this.ambientGain || !this.isAmbientPlaying) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = 2100 + Math.random() * 800;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.12);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  stopAmbient(): void {
    if (this.ambientTimer !== null) {
      window.clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.isAmbientPlaying = false;
  }

  // --- Fireplace Crackling Channel (Hearth Hall) ---
  startFire(): void {
    const ctx = this.ensureContext();
    if (this.isFirePlaying || !this.fireGain) return;

    this.isFirePlaying = true;
    const scheduleCrackle = () => {
      if (!this.isFirePlaying) return;
      this.playFireCrackle();
      const delay = 140 + Math.random() * 480;
      this.fireTimer = window.setTimeout(scheduleCrackle, delay);
    };
    scheduleCrackle();
  }

  private playFireCrackle(): void {
    if (!this.ctx || !this.fireGain || !this.isFirePlaying) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const isDeepEmber = Math.random() < 0.35;
    osc.type = isDeepEmber ? 'sine' : 'sawtooth';
    const freq = isDeepEmber ? (75 + Math.random() * 110) : (700 + Math.random() * 1800);
    osc.frequency.setValueAtTime(freq, now);

    filter.type = isDeepEmber ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.setValueAtTime(2.5, now);

    const vol = isDeepEmber ? (0.022 + Math.random() * 0.025) : (0.010 + Math.random() * 0.018);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isDeepEmber ? 0.075 : 0.022));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.fireGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  stopFire(): void {
    if (this.fireTimer !== null) {
      window.clearTimeout(this.fireTimer);
      this.fireTimer = null;
    }
    this.isFirePlaying = false;
  }

  // --- Lo-fi Chill Chords Synth ---
  private readonly chords: number[][] = [
    // Fmaj9: F3 (174.61), C4 (261.63), E4 (329.63), G4 (392.00), A4 (440.00)
    [174.61, 261.63, 329.63, 392.00, 440.00],
    // Em7: E3 (164.81), B3 (246.94), D4 (293.66), G4 (392.00)
    [164.81, 246.94, 293.66, 392.00],
    // Dm9: D3 (146.83), A3 (220.00), C4 (261.63), E4 (329.63), F4 (349.23)
    [146.83, 220.00, 261.63, 329.63, 349.23],
    // Cmaj9: C3 (130.81), G3 (196.00), B3 (246.94), D4 (293.66), E4 (329.63)
    [130.81, 196.00, 246.94, 293.66, 329.63],
    // Am9: A2 (110.00), E3 (164.81), G3 (196.00), C4 (261.63), B4 (493.88)
    [110.00, 164.81, 196.00, 261.63, 493.88],
    // G13sus: G2 (98.00), F3 (174.61), A3 (220.00), C4 (261.63), E4 (329.63)
    [98.00, 174.61, 220.00, 261.63, 329.63],
  ];

  startMusic(): void {
    const ctx = this.ensureContext();
    if (this.isMusicPlaying || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.playNextChord();
  }

  private playNextChord(): void {
    if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;
    const chord = this.chords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    const duration = 3.6; // ~66 BPM chord changes

    chord.forEach((freq, i) => {
      if (!this.ctx || !this.musicGain) return;
      // Stagger notes slightly for strummed guitar/electric piano feel
      const noteTime = now + i * 0.04;

      // Base sine osc
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, noteTime);

      // Warm triangle overtone
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, noteTime);

      // Warm Lowpass Filter (vintage tone)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750 + (i * 80), noteTime);
      filter.frequency.exponentialRampToValueAtTime(450, noteTime + duration);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, noteTime);
      noteGain.gain.exponentialRampToValueAtTime(0.07 / Math.sqrt(chord.length), noteTime + 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.02, noteTime + duration * 0.85);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc1.start(noteTime);
      osc2.start(noteTime);
      osc1.stop(noteTime + duration + 0.1);
      osc2.stop(noteTime + duration + 0.1);
    });

    // Subtle vinyl dust click
    this.playVinylClick();

    this.musicTimer = window.setTimeout(() => {
      this.playNextChord();
    }, duration * 1000 - 150);
  }

  private playVinylClick(): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, now);
    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.isMusicPlaying = false;
  }

  // --- Volume & Master Controls ---
  setVolume(channel: VolumeChannel, value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    this.volumes[channel] = clamped;
    const now = this.ctx ? this.ctx.currentTime : 0;

    if (channel === 'master' && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : clamped, now);
    } else if (channel === 'music' && this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(clamped, now);
    } else if (channel === 'rain' && this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(clamped, now);
    } else if (channel === 'ambient' && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(clamped, now);
    } else if (channel === 'sfx' && this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(clamped, now);
    }
  }

  // --- Procedural Footstep & Interaction SFX ---
  playFootstep(surface: 'wood' | 'stair' | 'stone', isRunning: boolean): void {
    if (!this.footstepEnabled || this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = performance.now();
    const minInterval = isRunning ? 210 : 330;
    if (now - this.lastFootstepTime < minInterval) return;
    this.lastFootstepTime = now;

    const audioNow = ctx.currentTime;
    const basePitch = surface === 'stone' ? 86 : surface === 'stair' ? 145 : 110;
    const pitch = basePitch + (Math.random() * 24 - 12);
    const duration = surface === 'stone' ? (isRunning ? 0.075 : 0.092) : (isRunning ? 0.060 : 0.074);

    // Low wood tap oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, audioNow);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.65, audioNow + duration);

    // The footfall needs a confident low body so it is still present in a busy café mix.
    gain.gain.setValueAtTime(surface === 'stone' ? 0.24 : surface === 'stair' ? 0.21 : 0.19, audioNow);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioNow + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(audioNow);
    osc.stop(audioNow + duration + 0.01);

    // Add a short, audible contact transient on every surface—not only exterior stone.
    {
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = surface === 'wood' ? 'triangle' : 'square';
      const contactPitch = surface === 'stone' ? 760 : surface === 'stair' ? 520 : 410;
      click.frequency.setValueAtTime(contactPitch + Math.random() * 100, audioNow);
      clickGain.gain.setValueAtTime(surface === 'stone' ? 0.070 : surface === 'stair' ? 0.060 : 0.052, audioNow);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, audioNow + 0.045);
      click.connect(clickGain); clickGain.connect(this.sfxGain);
      click.start(audioNow); click.stop(audioNow + 0.045);
    }
  }

  playSipDrink(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    // Pleasant ceramic contact clink
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2600, now);
    osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.2);
  }

  /**
   * Celebratory fireworks sound: rising launch whoosh followed by thunderous crackling burst.
   */
  playFirework(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;

    // 1. Launch rocket whistle
    const launchOsc = ctx.createOscillator();
    const launchGain = ctx.createGain();
    launchOsc.type = 'sawtooth';
    launchOsc.frequency.setValueAtTime(260, now);
    launchOsc.frequency.exponentialRampToValueAtTime(1450, now + 0.45);
    launchGain.gain.setValueAtTime(0.04, now);
    launchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    launchOsc.connect(launchGain);
    launchGain.connect(this.sfxGain);
    launchOsc.start(now);
    launchOsc.stop(now + 0.5);

    // 2. Main explosive boom at t = +0.48s
    const boomTime = now + 0.48;
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(160, boomTime);
    boomOsc.frequency.exponentialRampToValueAtTime(42, boomTime + 0.55);
    boomGain.gain.setValueAtTime(0.18, boomTime);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, boomTime + 0.65);
    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(boomTime);
    boomOsc.stop(boomTime + 0.7);

    // 3. Crackling sparkle noise burst
    for (let i = 0; i < 6; i++) {
      const crackleTime = boomTime + 0.08 + i * 0.06 + Math.random() * 0.04;
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      cOsc.type = 'square';
      cOsc.frequency.setValueAtTime(700 + Math.random() * 800, crackleTime);
      cGain.gain.setValueAtTime(0.025, crackleTime);
      cGain.gain.exponentialRampToValueAtTime(0.0001, crackleTime + 0.04);
      cOsc.connect(cGain);
      cGain.connect(this.sfxGain);
      cOsc.start(crackleTime);
      cOsc.stop(crackleTime + 0.05);
    }
  }

  /**
   * Soothing singing bowl resonance for Trader massage & relaxation.
   */
  playMassage(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const freqs = [432, 864, 1296]; // Peaceful harmonic healing ratios
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Gentle subtle vibrato
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 1.8);
      gain.gain.setValueAtTime(0.09 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 2.3);
    });
  }

  /**
   * Victorious major arpeggio fanfare for Trader Level Up!
   */
  playLevelUp(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    // C5, E5, G5, C6 triumphant ascending fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  /**
   * Retro luxury phone chime for Trader hotline / phone assignment.
   */
  playPhoneChime(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    [0, 0.18].forEach(offset => {
      const t = now + offset;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(853, t);
      osc2.frequency.setValueAtTime(960, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain!);
      osc1.start(t); osc1.stop(t + 0.16);
      osc2.start(t); osc2.stop(t + 0.16);
    });
  }

  /**
   * Tactile micro-interaction click sound (wood & brass mechanical feedback).
   */
  playUiClick(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Subtle human-like acoustic vocal resonance for Bot traders.
   */
  playBotVocal(gender: 'male' | 'female', pitchMod = 1): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const baseFreq = gender === 'male' ? 140 * pitchMod : 255 * pitchMod;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(gender === 'male' ? 700 : 1200, now);
    filter.Q.setValueAtTime(3.2, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Dramatic economic news flash chime for NFP (Non-Farm Payrolls) market release.
   */
  playNfpAlert(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.065, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.36);
    });
  }

  /**
   * Sweet two-tone crystal chime when an order is opened / filled.
   */
  playOrderFilled(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    [1046.50, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.08, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.32);
    });
  }

  /**
   * Euphoric cash register & golden coins chime on Take Profit (Maximum Trader Dopamine!).
   */
  playCashRegister(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;

    // Metallic latch click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.06);

    // Multi-coin golden chime cascade (C6, E6, G6, B6, C7)
    const coinPitches = [1046.50, 1318.51, 1567.98, 1975.53, 2093.00];
    coinPitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + 0.05 + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.38);
      gain.gain.setValueAtTime(0.075, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  /**
   * Warm, deep breath & relaxing harmonic wave when savoring coffee.
   */
  playCoffeeEuphoria(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.05, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.85);
    });
  }

  /**
   * Vintage mechanical SLR camera shutter sound with mirror flip and winding click.
   */
  playCameraShutter(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;

    // 1. Mirror lift (transient noise burst)
    const bufSize = Math.floor(ctx.sampleRate * 0.018);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const output = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    noise.connect(filter);
    filter.connect(gain1);
    gain1.connect(this.sfxGain);
    noise.start(now);

    // 2. Shutter curtain snap (crisp, metallic click)
    const t2 = now + 0.042;
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(2200, t2);
    snapOsc.frequency.exponentialRampToValueAtTime(450, t2 + 0.025);
    snapGain.gain.setValueAtTime(0.22, t2);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.025);
    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(t2);
    snapOsc.stop(t2 + 0.03);

    // 3. Subtle micro mechanical film roll
    [0.09, 0.12, 0.15].forEach((offset, idx) => {
      const click = ctx.createOscillator();
      const cGain = ctx.createGain();
      const tc = now + offset;
      click.type = 'square';
      click.frequency.setValueAtTime(820 + idx * 110, tc);
      cGain.gain.setValueAtTime(0.04, tc);
      cGain.gain.exponentialRampToValueAtTime(0.001, tc + 0.015);
      click.connect(cGain);
      cGain.connect(this.sfxGain!);
      click.start(tc);
      click.stop(tc + 0.02);
    });
  }

  /**
   * Tactile procedural paper rustle when holding or flipping through the Cafe Menu.
   */
  playMenuPaper(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;

    // 1. Primary textured paper friction (short filtered noise burst)
    const duration = 0.12;
    const bufSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const output = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI) * Math.exp(-i / (bufSize * 0.4));
      output[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);

    // 2. Subtle low cardstock flex sound
    const flexOsc = ctx.createOscillator();
    const flexGain = ctx.createGain();
    flexOsc.type = 'sine';
    flexOsc.frequency.setValueAtTime(220, now);
    flexOsc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    flexGain.gain.setValueAtTime(0.06, now);
    flexGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    flexOsc.connect(flexGain);
    flexGain.connect(this.sfxGain);
    flexOsc.start(now);
    flexOsc.stop(now + 0.06);
  }

  /**
   * Crisp book page turn / leafing sound for Focus Library & reading books.
   */
  playPageFlip(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;

    // Stage 1: Quick page lift crisp snap
    const liftDur = 0.04;
    const liftBufSize = Math.floor(ctx.sampleRate * liftDur);
    const liftBuf = ctx.createBuffer(1, liftBufSize, ctx.sampleRate);
    const liftData = liftBuf.getChannelData(0);
    for (let i = 0; i < liftBufSize; i++) {
      liftData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (liftBufSize * 0.2));
    }
    const liftSrc = ctx.createBufferSource();
    liftSrc.buffer = liftBuf;
    const liftFilter = ctx.createBiquadFilter();
    liftFilter.type = 'bandpass';
    liftFilter.frequency.setValueAtTime(4200, now);
    liftFilter.Q.setValueAtTime(2.8, now);
    const liftGain = ctx.createGain();
    liftGain.gain.setValueAtTime(0.14, now);
    liftGain.gain.exponentialRampToValueAtTime(0.001, now + liftDur);
    liftSrc.connect(liftFilter);
    liftFilter.connect(liftGain);
    liftGain.connect(this.sfxGain);
    liftSrc.start(now);

    // Stage 2: Aerodynamic page flutter & slide
    const slideDur = 0.16;
    const t2 = now + 0.02;
    const slideBufSize = Math.floor(ctx.sampleRate * slideDur);
    const slideBuf = ctx.createBuffer(1, slideBufSize, ctx.sampleRate);
    const slideData = slideBuf.getChannelData(0);
    for (let i = 0; i < slideBufSize; i++) {
      const progress = i / slideBufSize;
      slideData[i] = (Math.random() * 2 - 1) * (1 - progress) * (0.8 + 0.2 * Math.sin(progress * 25));
    }
    const slideSrc = ctx.createBufferSource();
    slideSrc.buffer = slideBuf;
    const slideFilter = ctx.createBiquadFilter();
    slideFilter.type = 'lowpass';
    slideFilter.frequency.setValueAtTime(3200, t2);
    slideFilter.frequency.exponentialRampToValueAtTime(950, t2 + slideDur);
    slideFilter.Q.setValueAtTime(1.4, t2);
    const slideGain = ctx.createGain();
    slideGain.gain.setValueAtTime(0.11, t2);
    slideGain.gain.exponentialRampToValueAtTime(0.001, t2 + slideDur);
    slideSrc.connect(slideFilter);
    slideFilter.connect(slideGain);
    slideGain.connect(this.sfxGain);
    slideSrc.start(t2);
  }

  /**
   * Crisp, metallic resonance of a classic brass service desk call bell ("Ding!").
   */
  playDeskBell(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;

    // Dual-sine harmonics for authentic brass ring
    const freqs = [2093, 4186, 6280];
    const gains = [0.22, 0.08, 0.03];
    const decays = [1.3, 0.9, 0.5];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.998, now + 0.1);

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gains[idx] * (this.volumes.sfx / 0.78), now + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + decays[idx]);
    });
  }

  /**
   * Gentle, refreshing procedural stream of cold water pouring into a glass.
   */
  playWaterPour(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    const dur = 1.1;

    // Filtered pinkish/white noise for water stream
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const progress = i / bufSize;
      const env = Math.sin(progress * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * (0.8 + 0.2 * Math.sin(progress * 45));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.linearRampToValueAtTime(2200, now + dur);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 * (this.volumes.sfx / 0.78), now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);

    // Subtle droplet plops during pouring
    for (let p = 0; p < 4; p++) {
      const pt = now + 0.15 + p * 0.22 + Math.random() * 0.05;
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = 'sine';
      const pf = 900 + p * 200 + Math.random() * 80;
      osc.frequency.setValueAtTime(pf, pt);
      osc.frequency.exponentialRampToValueAtTime(pf * 1.5, pt + 0.04);
      og.gain.setValueAtTime(0.06, pt);
      og.gain.exponentialRampToValueAtTime(0.0001, pt + 0.05);
      osc.connect(og);
      og.connect(this.sfxGain);
      osc.start(pt);
      osc.stop(pt + 0.06);
    }
  }

  /**
   * Futuristic soft dual-chime for wireless Qi charging pad initiation ("Bip-bip").
   */
  playQiChime(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    [1760, 2637].forEach((f, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.08 * (this.volumes.sfx / 0.78), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  /**
   * Crisp stainless steel tongs click for picking artisan pastry.
   */
  playTongsClick(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const now = ctx.currentTime;
    [3200, 4800].forEach((f, idx) => {
      const t = now + idx * 0.04;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.03);
      g.gain.setValueAtTime(0.12 * (this.volumes.sfx / 0.78), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.04);
    });
  }

  setFootstepEnabled(enabled: boolean): void {
    this.footstepEnabled = enabled;
  }

  isFootstepEnabled(): boolean {
    return this.footstepEnabled;
  }

  getVolume(channel: VolumeChannel): number {
    return this.volumes[channel];
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volumes.master, this.ctx.currentTime);
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  applyPreset(preset: ChillPreset): void {
    switch (preset) {
      case 'rainy':
        this.setVolume('music', 0.65);
        this.setVolume('rain', 0.85);
        this.setVolume('ambient', 0.3);
        this.startMusic();
        this.startRain();
        this.startAmbient();
        break;
      case 'focus':
        this.setVolume('music', 0.75);
        this.setVolume('rain', 0.25);
        this.setVolume('ambient', 0.6);
        this.startMusic();
        this.startRain();
        this.startAmbient();
        break;
      case 'night':
        this.setVolume('music', 0.5);
        this.setVolume('rain', 0.8);
        this.setVolume('ambient', 0.2);
        this.startMusic();
        this.startRain();
        this.startAmbient();
        break;
      case 'cafe':
        this.setVolume('music', 0.7);
        this.setVolume('rain', 0.35);
        this.setVolume('ambient', 0.75);
        this.startMusic();
        this.startRain();
        this.startAmbient();
        this.stopFire();
        break;
      case 'fireside':
        this.setVolume('music', 0.55);
        this.setVolume('rain', 0.3);
        this.setVolume('ambient', 0.7);
        this.startMusic();
        this.startRain();
        this.startAmbient();
        this.startFire();
        break;
    }
  }

  startAll(): void {
    this.startMusic();
    this.startRain();
    this.startAmbient();
    this.startFire();
  }

  stopAll(): void {
    this.stopMusic();
    this.stopRain();
    this.stopAmbient();
    this.stopFire();
  }

  isPlaying(channel: 'music' | 'rain' | 'ambient' | 'fire'): boolean {
    if (channel === 'music') return this.isMusicPlaying;
    if (channel === 'rain') return this.isRainPlaying;
    if (channel === 'fire') return this.isFirePlaying;
    return this.isAmbientPlaying;
  }
}

export const chillAudio = new ChillAudioEngine();
