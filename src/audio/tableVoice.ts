import type { CafeClient, VoiceSignalEvent } from '../network/client';

export type VoicePeerStatus = {
  peerId: string;
  name?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  audioElement?: HTMLAudioElement;
};

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class TableVoiceManager {
  private client: CafeClient | null = null;
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micCheckTimer: number | null = null;

  private localPlayerId: string | null = null;
  private currentTableId: string | null = null;

  private peers = new Map<string, { pc: RTCPeerConnection; audio: HTMLAudioElement; isSpeaking: boolean; isMuted: boolean }>();

  public isMicMuted: boolean = false;
  public isLocalSpeaking: boolean = false;
  public isConnected: boolean = false;
  public hasPermission: boolean = false;

  private onSpeakingChangeCallbacks = new Set<(isSpeaking: boolean) => void>();
  private onPeersChangeCallbacks = new Set<(peers: Map<string, VoicePeerStatus>) => void>();
  private onErrorCallbacks = new Set<(msg: string) => void>();

  constructor() {}

  public onSpeakingChange(cb: (isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallbacks.add(cb);
    return () => this.onSpeakingChangeCallbacks.delete(cb);
  }

  public onPeersChange(cb: (peers: Map<string, VoicePeerStatus>) => void) {
    this.onPeersChangeCallbacks.add(cb);
    return () => this.onPeersChangeCallbacks.delete(cb);
  }

  public onError(cb: (msg: string) => void) {
    this.onErrorCallbacks.add(cb);
    return () => this.onErrorCallbacks.delete(cb);
  }

  private notifyPeers() {
    const map = new Map<string, VoicePeerStatus>();
    for (const [id, p] of this.peers.entries()) {
      map.set(id, {
        peerId: id,
        isSpeaking: p.isSpeaking,
        isMuted: p.isMuted,
        audioElement: p.audio,
      });
    }
    this.onPeersChangeCallbacks.forEach((cb) => cb(map));
  }

  /**
   * Khởi động voice chat khi ngồi vào bàn
   */
  public async joinTableVoice(client: CafeClient, localPlayerId: string, tableId: string) {
    this.leaveTableVoice(); // Clean previous if any
    this.client = client;
    this.localPlayerId = localPlayerId;
    this.currentTableId = tableId;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        this.hasPermission = true;
        this.setupAudioAnalysis();
      } else {
        this.onErrorCallbacks.forEach((cb) => cb('Trình duyệt không hỗ trợ WebRTC Microphone.'));
      }
    } catch (err: any) {
      this.hasPermission = false;
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isDenied
        ? 'Bạn đã từ chối quyền Micro. Chế độ chỉ nghe đàm thoại tại bàn.'
        : 'Không tìm thấy Microphone khả dụng. Chuyển sang chế độ chỉ nghe.';
      this.onErrorCallbacks.forEach((cb) => cb(msg));
    }

    this.isConnected = true;
    this.client.sendVoiceState({ isMuted: this.isMicMuted, isSpeaking: false });
  }

  private setupAudioAnalysis() {
    if (!this.localStream) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingCounter = 0;

      this.micCheckTimer = window.setInterval(() => {
        if (!this.analyser || this.isMicMuted || !this.isConnected) {
          if (this.isLocalSpeaking) {
            this.isLocalSpeaking = false;
            this.onSpeakingChangeCallbacks.forEach((cb) => cb(false));
            this.client?.sendVoiceState({ isMuted: true, isSpeaking: false });
          }
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Ngưỡng phát hiện tiếng nói
        const currentlySpeaking = average > 14;
        if (currentlySpeaking) {
          speakingCounter = Math.min(speakingCounter + 1, 10);
        } else {
          speakingCounter = Math.max(speakingCounter - 1, 0);
        }

        const speaksNow = speakingCounter >= 2;
        if (speaksNow !== this.isLocalSpeaking) {
          this.isLocalSpeaking = speaksNow;
          this.onSpeakingChangeCallbacks.forEach((cb) => cb(speaksNow));
          this.client?.sendVoiceState({ isMuted: this.isMicMuted, isSpeaking: speaksNow });
        }
      }, 100);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Bật/tắt micro của bản thân
   */
  public toggleMute(): boolean {
    this.isMicMuted = !this.isMicMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMicMuted;
      });
    }
    if (this.isMicMuted) {
      this.isLocalSpeaking = false;
      this.onSpeakingChangeCallbacks.forEach((cb) => cb(false));
    }
    this.client?.sendVoiceState({ isMuted: this.isMicMuted, isSpeaking: this.isLocalSpeaking });
    return this.isMicMuted;
  }

  /**
   * Kết nối đàm thoại tới một người cùng bàn
   */
  public async connectToPeer(peerId: string) {
    if (!this.isConnected || !this.client || peerId === this.localPlayerId) return;
    if (this.peers.has(peerId)) return;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const audio = new Audio();
    audio.autoplay = true;

    this.peers.set(peerId, { pc, audio, isSpeaking: false, isMuted: false });

    // Thêm track âm thanh của mình nếu có
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        audio.srcObject = event.streams[0];
        audio.play().catch(() => {});
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.client?.sendVoiceSignal(peerId, {
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };

    // Deterministic offer: Người có ID nhỏ hơn khởi xướng offer
    if (this.localPlayerId && this.localPlayerId < peerId) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.client.sendVoiceSignal(peerId, {
          type: 'offer',
          sdp: offer.sdp,
        });
      } catch (e) {
        // Offer fail
      }
    }

    this.notifyPeers();
  }

  /**
   * Xử lý tín hiệu WebRTC từ người khác cùng bàn
   */
  public async handleSignal(fromId: string, signal: any) {
    if (!this.isConnected || !this.client) return;

    let peer = this.peers.get(fromId);
    if (!peer) {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      const audio = new Audio();
      audio.autoplay = true;
      peer = { pc, audio, isSpeaking: false, isMuted: false };
      this.peers.set(fromId, peer);

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          audio.srcObject = event.streams[0];
          audio.play().catch(() => {});
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.client?.sendVoiceSignal(fromId, {
            type: 'candidate',
            candidate: event.candidate,
          });
        }
      };

      this.notifyPeers();
    }

    const { pc } = peer;

    try {
      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.client.sendVoiceSignal(fromId, {
          type: 'answer',
          sdp: answer.sdp,
        });
      } else if (signal.type === 'answer') {
        if (pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
        }
      } else if (signal.type === 'candidate') {
        if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    } catch {
      // Signal error handling
    }
  }

  /**
   * Cập nhật trạng thái nói/mute của peer cùng bàn
   */
  public handlePeerVoiceState(playerId: string, isSpeaking: boolean, isMuted: boolean) {
    const peer = this.peers.get(playerId);
    if (peer) {
      peer.isSpeaking = isSpeaking;
      peer.isMuted = isMuted;
      this.notifyPeers();
    }
  }

  /**
   * Người cùng bàn rời bàn hoặc ngắt voice
   */
  public removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      try {
        peer.audio.srcObject = null;
        peer.audio.pause();
        peer.pc.close();
      } catch {}
      this.peers.delete(peerId);
      this.notifyPeers();
    }
  }

  /**
   * Rời bàn hoặc đứng dậy: dọn dẹp toàn bộ voice
   */
  public leaveTableVoice() {
    if (this.micCheckTimer) {
      window.clearInterval(this.micCheckTimer);
      this.micCheckTimer = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    for (const peer of this.peers.values()) {
      try {
        peer.audio.srcObject = null;
        peer.audio.pause();
        peer.pc.close();
      } catch {}
    }
    this.peers.clear();
    this.isLocalSpeaking = false;
    this.isConnected = false;
    this.currentTableId = null;
    this.localPlayerId = null;
    this.notifyPeers();
  }
}

export const tableVoice = new TableVoiceManager();
