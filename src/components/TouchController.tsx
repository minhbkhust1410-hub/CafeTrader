import { useEffect, useRef, useState, type TouchEvent } from 'react';

type TouchControllerProps = {
  isSeated: boolean;
  currentFloor: number;
  cameraMode: 'first' | 'third';
  isMicMuted: boolean;
  isVoiceConnected: boolean;
  isSpeaking: boolean;
  onToggleCamera: () => void;
  onToggleFloor: () => void;
  onToggleMic: () => void;
  onLeaveSeat: () => void;
  onOpenMenu: () => void;
  onOpenChat: () => void;
};

export default function TouchController({
  isSeated,
  currentFloor,
  cameraMode,
  isMicMuted,
  isVoiceConnected,
  isSpeaking,
  onToggleCamera,
  onToggleFloor,
  onToggleMic,
  onLeaveSeat,
  onOpenMenu,
  onOpenChat,
}: TouchControllerProps) {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const MAX_RADIUS = 46; // pixels

  const emitDirection = (forward: number, right: number) => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.dispatchEvent(
        new CustomEvent('cafe-direction', {
          detail: { forward, right },
        })
      );
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    setIsActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - originRef.current.x;
        const dy = touch.clientY - originRef.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, MAX_RADIUS);
        const angle = Math.atan2(dy, dx);

        const x = Math.cos(angle) * clampedDist;
        const y = Math.sin(angle) * clampedDist;

        setKnobPos({ x, y });

        // Forward: y âm là đi tới, y dương là lùi
        const forward = -(y / MAX_RADIUS);
        // Right: x dương là rẽ phải, x âm là rẽ trái
        const right = x / MAX_RADIUS;

        emitDirection(forward, right);
        break;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        emitDirection(0, 0);
        break;
      }
    }
  };

  useEffect(() => {
    return () => {
      emitDirection(0, 0);
    };
  }, []);

  return (
    <div className="mobile-touch-layer" style={{ pointerEvents: 'none' }}>
      {/* Virtual Joystick (Bottom Left) */}
      {!isSeated && (
        <div
          ref={joystickBaseRef}
          className={`virtual-joystick-base ${isActive ? 'active' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ pointerEvents: 'auto' }}
          aria-label="Cần điều khiển ảo"
        >
          <div className="joystick-arrow joystick-arrow--up">▲</div>
          <div className="joystick-arrow joystick-arrow--down">▼</div>
          <div className="joystick-arrow joystick-arrow--left">◀</div>
          <div className="joystick-arrow joystick-arrow--right">▶</div>

          <div
            className="virtual-joystick-knob"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>
      )}

      {/* Quick Action Floating Pad (Bottom Right) */}
      <div className="mobile-action-pad" style={{ pointerEvents: 'auto' }}>
        {/* POV / 3rd Camera */}
        <button
          className="mobile-action-btn"
          onClick={onToggleCamera}
          title="Đổi góc nhìn (POV / Camera 3rd)"
          aria-label="Đổi góc nhìn"
        >
          <span className="btn-icon">{cameraMode === 'first' ? '👁️' : '🎥'}</span>
          <span className="btn-label">{cameraMode === 'first' ? 'POV' : 'Góc ngoài'}</span>
        </button>

        {/* Chuyển tầng */}
        <button
          className={`mobile-action-btn ${currentFloor > 1 ? 'mobile-action-btn--vip' : ''}`}
          onClick={onToggleFloor}
          title={currentFloor >= 8 ? 'Về tầng 1' : `Lên tầng ${currentFloor + 1}`}
          aria-label="Chuyển tầng"
        >
          <span className="btn-icon">{currentFloor >= 8 ? '🏛️' : '👑'}</span>
          <span className="btn-label">{currentFloor >= 8 ? 'Về T1' : `Lên T${currentFloor + 1}`}</span>
        </button>

        {/* Micro Voice Chat (Table Scoped) */}
        {isSeated && (
          <button
            className={`mobile-action-btn ${
              !isMicMuted && isSpeaking ? 'mobile-action-btn--speaking' : isMicMuted ? 'mobile-action-btn--muted' : ''
            }`}
            onClick={onToggleMic}
            title={isVoiceConnected ? (isMicMuted ? 'Bật micro bàn' : 'Tắt micro bàn') : 'Bật đàm thoại bàn'}
            aria-label="Microphone"
          >
            <span className="btn-icon">{isMicMuted ? '🔇' : isSpeaking ? '🔊' : '🎙️'}</span>
            <span className="btn-label">{isMicMuted ? 'Mute' : isSpeaking ? 'Nói...' : 'Bật Mic'}</span>
          </button>
        )}

        {/* Đứng dậy nếu đang ngồi */}
        {isSeated && (
          <button
            className="mobile-action-btn mobile-action-btn--stand"
            onClick={onLeaveSeat}
            title="Đứng dậy khỏi bàn"
            aria-label="Đứng dậy"
          >
            <span className="btn-icon">🚶</span>
            <span className="btn-label">Đứng dậy</span>
          </button>
        )}

        {/* Mở Menu đồ uống */}
        <button
          className="mobile-action-btn"
          onClick={onOpenMenu}
          title="Mở thực đơn đồ uống"
          aria-label="Thực đơn đồ uống"
        >
          <span className="btn-icon">☕</span>
          <span className="btn-label">Menu</span>
        </button>

        {/* Mở Chat */}
        <button
          className="mobile-action-btn"
          onClick={onOpenChat}
          title="Mở trò chuyện"
          aria-label="Trò chuyện"
        >
          <span className="btn-icon">💬</span>
          <span className="btn-label">Chat</span>
        </button>
      </div>
    </div>
  );
}
