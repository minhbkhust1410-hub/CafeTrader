import React, { useState, useEffect, useRef } from 'react';
import { chillAudio } from '../audio/chillAudio';
import './PhotoModeOverlay.css';

export type PhotoPresetId =
  | 'current'
  | 'exterior'
  | 'hearth'
  | 'bar'
  | 'library'
  | 'balcony'
  | 'observatory'
  | 'selfie';

export type FilmFilterId =
  | 'none'
  | 'vintage-amber'
  | 'closing-bell'
  | 'noir'
  | 'emerald-chill'
  | 'cyber-dopamine';

export type AspectRatioId = 'free' | '16-9' | '1-1' | '9-16';

export type CompositionGridId = 'none' | 'rule-of-thirds' | 'golden-ratio' | 'center';

export type PhotoCaptureConfig = {
  filter: FilmFilterId;
  aspectRatio: AspectRatioId;
  watermark: boolean;
  anonymous: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeFloor: number;
  traderName: string;
  traderLevel: number;
  traderBadge: string;
  onPresetChange: (preset: PhotoPresetId) => void;
  onFovChange: (fov: number) => void;
  onTriggerCapture: (config: PhotoCaptureConfig) => void;
  capturedRawImage: string | null;
  onClearCapturedImage: () => void;
};

const PRESET_OPTIONS: { id: PhotoPresetId; label: string; icon: string; desc: string }[] = [
  { id: 'current', label: 'Góc hiện tại', icon: '📍', desc: 'Giữ nguyên vị trí & hướng nhìn hiện tại' },
  { id: 'exterior', label: 'Cổng & Biệt Thự', icon: '🏛️', desc: 'Toàn cảnh mặt tiền estate 8 tầng & sân tuyết' },
  { id: 'hearth', label: 'Lò Sưởi Hearth', icon: '🔥', desc: 'Lò sưởi Travertine củi nổ bập bùng tầng 1' },
  { id: 'bar', label: 'Quầy Bar & Barista', icon: '☕', desc: 'Quầy pha chế ấm cúng đèn amber' },
  { id: 'library', label: 'Focus Library', icon: '📚', desc: 'Kệ sách bìa da & đèn Banker gác lửng T2' },
  { id: 'balcony', label: 'Ban Công Skyline', icon: '🌌', desc: 'Góc chill ngoài trời nhìn ra skyline đêm' },
  { id: 'observatory', label: 'T8 Sky Terrace', icon: '👑', desc: 'Terrace hoàng gia ngắm toàn cảnh từ trên cao' },
  { id: 'selfie', label: 'Chân Dung Trader', icon: '👤', desc: 'Góc chụp cận cảnh 45° tôn vinh avatar của bạn' },
];

const FILTER_OPTIONS: { id: FilmFilterId; label: string; tag: string; previewColor: string }[] = [
  { id: 'none', label: 'Tự Nhiên', tag: 'Natural', previewColor: '#e0d5c1' },
  { id: 'closing-bell', label: 'Closing Bell', tag: 'Golden Hour', previewColor: '#c9a248' },
  { id: 'vintage-amber', label: 'Vintage Amber', tag: 'Warm Film 800', previewColor: '#d97736' },
  { id: 'emerald-chill', label: 'Emerald Chill', tag: 'Zen Teal', previewColor: '#30dc97' },
  { id: 'noir', label: 'Noir 1930', tag: 'B&W Classic', previewColor: '#8a8a8a' },
  { id: 'cyber-dopamine', label: 'Dopamine Vivid', tag: 'High Contrast', previewColor: '#ff6b5e' },
];

const ASPECT_OPTIONS: { id: AspectRatioId; label: string; ratio: string }[] = [
  { id: 'free', label: 'Tự do', ratio: 'Toàn màn hình' },
  { id: '16-9', label: '16:9', ratio: 'Điện ảnh / PC' },
  { id: '1-1', label: '1:1', ratio: 'Vuông / Instagram' },
  { id: '9-16', label: '9:16', ratio: 'Dọc / Story' },
];

const FOV_PRESETS = [
  { label: '24mm (Rộng)', fov: 1.32 },
  { label: '35mm (Tiêu chuẩn)', fov: 1.10 },
  { label: '50mm (Mắt người)', fov: 0.85 },
  { label: '85mm (Chân dung)', fov: 0.58 },
];

export default function PhotoModeOverlay(props: Props) {
  const {
    isOpen,
    onClose,
    activeFloor,
    traderName,
    traderLevel,
    traderBadge,
    onPresetChange,
    onFovChange,
    onTriggerCapture,
    capturedRawImage,
    onClearCapturedImage,
  } = props;

  const [activePreset, setActivePreset] = useState<PhotoPresetId>('current');
  const [activeFilter, setActiveFilter] = useState<FilmFilterId>('closing-bell');
  const [activeAspect, setActiveAspect] = useState<AspectRatioId>('16-9');
  const [activeGrid, setActiveGrid] = useState<CompositionGridId>('rule-of-thirds');
  const [fovValue, setFovValue] = useState<number>(1.10);
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(true);
  const [anonymousEnabled, setAnonymousEnabled] = useState<boolean>(false);
  const [hideControls, setHideControls] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [finalProcessedUrl, setFinalProcessedUrl] = useState<string | null>(null);

  // Keyboard shortcuts (Space to snap, F10 / H to hide UI, Esc to close/cancel)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (capturedRawImage) {
        if (e.key === 'Escape') onClearCapturedImage();
        return;
      }

      if (e.key === ' ' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleSnap();
      } else if (e.key === 'F10' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setHideControls((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (hideControls) {
          setHideControls(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, capturedRawImage, hideControls, activeFilter, activeAspect, watermarkEnabled, anonymousEnabled]);

  // Process raw capture with canvas: film filters, aspect ratio cropping & elegant watermark
  useEffect(() => {
    if (!capturedRawImage) {
      setFinalProcessedUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const srcW = img.width;
      const srcH = img.height;

      // 1. Calculate Crop Box for Aspect Ratio
      let targetRatio = srcW / srcH;
      if (activeAspect === '16-9') targetRatio = 16 / 9;
      else if (activeAspect === '1-1') targetRatio = 1;
      else if (activeAspect === '9-16') targetRatio = 9 / 16;

      let cropW = srcW;
      let cropH = srcH;
      if (srcW / srcH > targetRatio) {
        cropW = Math.round(srcH * targetRatio);
      } else {
        cropH = Math.round(srcW / targetRatio);
      }
      const cropX = Math.round((srcW - cropW) / 2);
      const cropY = Math.round((srcH - cropH) / 2);

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 2. Apply Film Filter
      ctx.save();
      let filterCss = 'none';
      if (activeFilter === 'vintage-amber') {
        filterCss = 'sepia(0.36) contrast(1.14) brightness(1.04) saturate(1.22)';
      } else if (activeFilter === 'closing-bell') {
        filterCss = 'contrast(1.24) saturate(1.36) brightness(0.97)';
      } else if (activeFilter === 'noir') {
        filterCss = 'grayscale(1) contrast(1.42) brightness(0.95)';
      } else if (activeFilter === 'emerald-chill') {
        filterCss = 'contrast(1.10) saturate(1.18) hue-rotate(16deg) brightness(1.02)';
      } else if (activeFilter === 'cyber-dopamine') {
        filterCss = 'contrast(1.34) saturate(1.65) brightness(1.05)';
      }
      ctx.filter = filterCss;

      // Draw cropped image
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      ctx.restore();

      // 3. Subtle Film Vignette & Atmosphere Tints
      if (activeFilter !== 'none') {
        ctx.save();
        const rad = Math.sqrt(cropW * cropW + cropH * cropH) / 2;
        const vignette = ctx.createRadialGradient(cropW / 2, cropH / 2, rad * 0.45, cropW / 2, cropH / 2, rad);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, activeFilter === 'noir' ? 'rgba(0,0,0,0.65)' : 'rgba(15,10,6,0.48)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, cropW, cropH);

        // Golden hour tint for Closing Bell
        if (activeFilter === 'closing-bell') {
          ctx.fillStyle = 'rgba(201, 162, 72, 0.08)';
          ctx.fillRect(0, 0, cropW, cropH);
        } else if (activeFilter === 'vintage-amber') {
          ctx.fillStyle = 'rgba(255, 184, 108, 0.07)';
          ctx.fillRect(0, 0, cropW, cropH);
        }
        ctx.restore();
      }

      // 4. Elegant Watermark "CLOSING BELL · CAFÉ TRADER VILLA" (T07, T22)
      if (watermarkEnabled) {
        ctx.save();
        const scale = Math.max(0.65, cropW / 1600);
        const marginX = 36 * scale;
        const marginY = 32 * scale;

        // Bottom right watermark block
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const floorLabels = ['Ground Estate', 'Sảnh Hearth T1', 'VIP Mezzanine T2', 'Royal Salon T3', 'Golden Gallery T4', 'Emerald T5', 'Crown Library T6', 'Imperial Terrace T7', 'Sky Observatory T8'];
        const floorText = floorLabels[activeFloor] || `Tầng ${activeFloor}`;

        // Subtle dark backdrop pill for readability
        const bannerW = 390 * scale;
        const bannerH = 74 * scale;
        const bannerX = cropW - marginX - bannerW;
        const bannerY = cropH - marginY - bannerH;

        ctx.fillStyle = 'rgba(14, 11, 9, 0.72)';
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8 * scale);
        ctx.fill();

        ctx.strokeStyle = 'rgba(201, 162, 72, 0.55)';
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();

        // Insignia bell icon / logo
        ctx.fillStyle = '#c9a248';
        ctx.font = `bold ${19 * scale}px "Cinzel", "Playfair Display", Georgia, serif`;
        ctx.fillText('🔔 CLOSING BELL', bannerX + 16 * scale, bannerY + 28 * scale);

        ctx.fillStyle = '#f2e8d5';
        ctx.font = `600 ${11 * scale}px system-ui, -apple-system, sans-serif`;
        ctx.fillText('CAFÉ TRADER VILLA', bannerX + 185 * scale, bannerY + 26 * scale);

        // Subtitle line: Location · Date/Time
        ctx.fillStyle = '#bfa588';
        ctx.font = `400 ${11 * scale}px system-ui, -apple-system, sans-serif`;
        const locTime = `${floorText} · ${dateStr} ${timeStr}`;
        ctx.fillText(locTime, bannerX + 16 * scale, bannerY + 48 * scale);

        // Trader line (unless anonymous is selected for privacy)
        ctx.fillStyle = '#e8dcc4';
        ctx.font = `500 ${11 * scale}px system-ui, -apple-system, sans-serif`;
        const traderStr = anonymousEnabled ? 'Trader Ẩn Danh' : `${traderName} (Lv.${traderLevel} ${traderBadge})`;
        ctx.fillText(`📸 ${traderStr}`, bannerX + 16 * scale, bannerY + 64 * scale);

        ctx.restore();
      }

      setFinalProcessedUrl(canvas.toDataURL('image/png'));
    };
    img.src = capturedRawImage;
  }, [capturedRawImage, activeFilter, activeAspect, watermarkEnabled, anonymousEnabled, activeFloor, traderName, traderLevel, traderBadge]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetId: PhotoPresetId) => {
    setActivePreset(presetId);
    onPresetChange(presetId);
  };

  const handleFovChange = (newFov: number) => {
    setFovValue(newFov);
    onFovChange(newFov);
  };

  const handleSnap = () => {
    chillAudio.playCameraShutter();
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 220);

    onTriggerCapture({
      filter: activeFilter,
      aspectRatio: activeAspect,
      watermark: watermarkEnabled,
      anonymous: anonymousEnabled,
    });
  };

  const handleDownload = () => {
    if (!finalProcessedUrl) return;
    chillAudio.playUiClick();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const filename = `ClosingBell_CafeTrader_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;

    const a = document.createElement('a');
    a.href = finalProcessedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`photo-mode-container ${hideControls ? 'hide-controls' : ''}`}>
      {/* 1. Camera Composition Grid Overlay */}
      {activeGrid === 'rule-of-thirds' && (
        <div className="photo-grid photo-grid-thirds">
          <div className="grid-line grid-v1" />
          <div className="grid-line grid-v2" />
          <div className="grid-line grid-h1" />
          <div className="grid-line grid-h2" />
        </div>
      )}
      {activeGrid === 'golden-ratio' && (
        <div className="photo-grid photo-grid-golden">
          <div className="grid-line grid-gv1" />
          <div className="grid-line grid-gv2" />
          <div className="grid-line grid-gh1" />
          <div className="grid-line grid-gh2" />
        </div>
      )}
      {activeGrid === 'center' && (
        <div className="photo-grid photo-grid-center">
          <div className="crosshair-h" />
          <div className="crosshair-v" />
          <div className="center-dot" />
        </div>
      )}

      {/* 2. Aspect Ratio Crop Guides */}
      {activeAspect !== 'free' && (
        <div className={`aspect-mask aspect-${activeAspect}`}>
          <div className="mask-top" />
          <div className="mask-bottom" />
          <div className="mask-left" />
          <div className="mask-right" />
        </div>
      )}

      {/* 3. Camera Flash Effect */}
      {flashActive && <div className="camera-flash" />}

      {/* 4. Minimalist HUD Hidden Notice */}
      {hideControls && (
        <div className="hide-notice-badge" onClick={() => setHideControls(false)}>
          👁️ Đang ẩn thanh công cụ · Bấm [F10], [H] hoặc chạm vào đây để hiện lại
        </div>
      )}

      {/* 5. Top Navigation & Header */}
      {!hideControls && (
        <header className="photo-header">
          <div className="photo-title-block">
            <span className="photo-icon">📷</span>
            <div>
              <h1>PHOTO MODE · CLOSING BELL</h1>
              <p>Biệt thự hoàng gia 8 tầng · Lưu giữ khoảnh khắc thảnh thơi sau phiên</p>
            </div>
          </div>

          <div className="photo-header-actions">
            <button
              type="button"
              className="photo-btn-pill"
              onClick={() => setHideControls(true)}
              title="Ẩn thanh công cụ để ngắm cảnh (Phím H hoặc F10)"
            >
              👁️ Ẩn công cụ (F10)
            </button>
            <button
              type="button"
              className="photo-btn-close"
              onClick={onClose}
              title="Thoát chế độ chụp ảnh (Phím Esc)"
            >
              ✕ Thoát
            </button>
          </div>
        </header>
      )}

      {/* 6. Left Sidebar: Location & Camera Presets */}
      {!hideControls && (
        <aside className="photo-left-panel">
          <div className="panel-section-title">GÓC CHỤP NGHỆ THUẬT</div>
          <div className="preset-list">
            {PRESET_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`preset-btn ${activePreset === item.id ? 'active' : ''}`}
                onClick={() => handlePresetSelect(item.id)}
                title={item.desc}
              >
                <span className="preset-icon">{item.icon}</span>
                <div className="preset-text">
                  <span className="preset-name">{item.label}</span>
                  <small className="preset-desc">{item.desc}</small>
                </div>
              </button>
            ))}
          </div>

          <div className="panel-section-title" style={{ marginTop: '14px' }}>ỐNG KÍNH / TIÊU CỰ</div>
          <div className="fov-presets">
            {FOV_PRESETS.map((p) => (
              <button
                key={p.fov}
                type="button"
                className={`fov-btn ${Math.abs(fovValue - p.fov) < 0.05 ? 'active' : ''}`}
                onClick={() => handleFovChange(p.fov)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* 7. Bottom Floating Control Bar */}
      {!hideControls && (
        <div className="photo-bottom-bar">
          {/* Filter Selection Row */}
          <div className="filter-carousel">
            <span className="control-label">Màu phim:</span>
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(f.id);
                  chillAudio.playUiClick();
                }}
              >
                <span className="filter-indicator" style={{ backgroundColor: f.previewColor }} />
                <span className="filter-name">{f.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Settings & Big Shutter Button */}
          <div className="shutter-row">
            <div className="setting-group">
              <span className="control-label">Khung hình:</span>
              <div className="btn-toggle-group">
                {ASPECT_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`toggle-btn ${activeAspect === a.id ? 'active' : ''}`}
                    onClick={() => setActiveAspect(a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Central Iconic Shutter Button */}
            <div className="shutter-button-wrapper">
              <button
                type="button"
                className="main-shutter-btn"
                onClick={handleSnap}
                title="Bấm để chụp ảnh (Phím Space)"
              >
                <div className="shutter-inner-ring">
                  <div className="shutter-core">📸</div>
                </div>
              </button>
              <span className="shutter-tip">Bấm Space hoặc Click để chụp</span>
            </div>

            <div className="setting-group">
              <span className="control-label">Lưới & Bảo mật:</span>
              <div className="btn-toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${activeGrid !== 'none' ? 'active' : ''}`}
                  onClick={() => {
                    const nextGrid: Record<CompositionGridId, CompositionGridId> = {
                      none: 'rule-of-thirds',
                      'rule-of-thirds': 'golden-ratio',
                      'golden-ratio': 'center',
                      center: 'none',
                    };
                    setActiveGrid(nextGrid[activeGrid]);
                  }}
                  title="Đổi lưới bố cục"
                >
                  📐 {activeGrid === 'none' ? 'Tắt lưới' : activeGrid === 'rule-of-thirds' ? '1/3' : activeGrid === 'golden-ratio' ? 'Tỉ lệ vàng' : 'Tâm'}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${watermarkEnabled ? 'active' : ''}`}
                  onClick={() => setWatermarkEnabled((prev) => !prev)}
                  title="Bật/Tắt Watermark Closing Bell Villa"
                >
                  🔔 Logo {watermarkEnabled ? 'Bật' : 'Tắt'}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${anonymousEnabled ? 'active' : ''}`}
                  onClick={() => setAnonymousEnabled((prev) => !prev)}
                  title="Ẩn danh Trader trên ảnh chụp để bảo vệ quyền riêng tư (T22)"
                >
                  🕶️ {anonymousEnabled ? 'Ẩn danh' : 'Hiện tên'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Photo Review & Export Modal (Client-only, T22 privacy) */}
      {capturedRawImage && (
        <div className="photo-preview-backdrop">
          <div className="photo-preview-card">
            <div className="preview-header">
              <div>
                <h2>📸 ẢNH KỶ NIỆM CLOSING BELL</h2>
                <p>Xuất ảnh chất lượng cao thuần túy client-side · Bảo vệ quyền riêng tư (T22)</p>
              </div>
              <button
                type="button"
                className="preview-close-btn"
                onClick={onClearCapturedImage}
              >
                ✕
              </button>
            </div>

            <div className="preview-image-container">
              {finalProcessedUrl ? (
                <img src={finalProcessedUrl} alt="Closing Bell Snapshot" className="preview-img" />
              ) : (
                <div className="preview-loading">Đang hoàn thiện hiệu ứng phim và đóng dấu watermark...</div>
              )}
            </div>

            <div className="preview-footer">
              <div className="preview-meta">
                <span>🔔 Tầng: <strong>{activeFloor === 0 ? 'Sân ngoài' : `Tầng ${activeFloor}`}</strong></span>
                <span className="dot">·</span>
                <span>Màu phim: <strong>{FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label}</strong></span>
                <span className="dot">·</span>
                <span>Định dạng: <strong>PNG 100% Lossless</strong></span>
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="preview-btn-retake"
                  onClick={onClearCapturedImage}
                >
                  🔄 Chụp Lại
                </button>
                <button
                  type="button"
                  className="preview-btn-download"
                  onClick={handleDownload}
                  disabled={!finalProcessedUrl}
                >
                  ⬇️ Tải Ảnh Về Máy (PNG)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

