import { STAFF_VOICE, type StaffId } from '../audio/staffVoice';
import './ConciergePanel.css';

export type ConciergeAction = 'greet' | 'hearth' | 'library' | 'terrace' | 'egg-coffee' | 'cold-brew';

type Props = {
  staffId: StaffId;
  onClose: () => void;
  onAction: (staffId: StaffId, action: ConciergeAction) => void;
};

const STAFF_COPY: Record<StaffId, { accent: string; greeting: string; detail: string }> = {
  'concierge-minh-an': {
    accent: '✦',
    greeting: 'Chào mừng bạn trở về Closing Bell. Tôi sẽ giúp bạn chọn một góc thật vừa ý.',
    detail: 'Dẫn khách tới không gian phù hợp với nhịp hôm nay.',
  },
  'barista-thu-ha': {
    accent: '☕',
    greeting: 'Barista Thu Hà xin chào. Cà phê trứng vừa sẵn sàng, bạn muốn thử chứ?',
    detail: 'Pha và mang đồ uống ảo đến đúng bàn của bạn.',
  },
  'host-bao-ngoc': {
    accent: '❋',
    greeting: 'Bảo Ngọc đây ạ. Bạn cần một bàn yên tĩnh hay muốn gặp gỡ mọi người?',
    detail: 'Tiếp viên sảnh, gợi ý chỗ ngồi và hỗ trợ phục vụ.',
  },
};

export default function ConciergePanel({ staffId, onClose, onAction }: Props) {
  const staff = STAFF_VOICE[staffId];
  const copy = STAFF_COPY[staffId];

  return (
    <aside className="concierge-panel" aria-label={`Dịch vụ từ ${staff.role} ${staff.name}`}>
      <div className="concierge-panel__topline"><span>ĐỘI NGŨ CAFE TRADER</span><button onClick={onClose} aria-label="Đóng bảng phục vụ">×</button></div>
      <div className="concierge-panel__identity">
        <div className="concierge-panel__avatar">{copy.accent}</div>
        <div><span>{staff.role.toUpperCase()}</span><h2>{staff.name}</h2><p>{copy.detail}</p></div>
      </div>
      <blockquote>“{copy.greeting}”</blockquote>
      <button className="concierge-panel__speak" onClick={() => onAction(staffId, 'greet')}>🔊 Nghe lời chào tiếng Việt</button>

      <section>
        <div className="concierge-panel__section-title">GỢI Ý CHỖ NGỒI</div>
        <div className="concierge-panel__choices">
          <button onClick={() => onAction(staffId, 'hearth')}><span>🔥</span><strong>Lò sưởi Hearth</strong><small>Ấm áp, trò chuyện chậm</small></button>
          <button onClick={() => onAction(staffId, 'library')}><span>📚</span><strong>Focus Library</strong><small>Yên tĩnh, đọc và làm việc</small></button>
          <button onClick={() => onAction(staffId, 'terrace')}><span>🌃</span><strong>Skyline Terrace</strong><small>Ngắm thành phố, thư giãn</small></button>
        </div>
      </section>

      <section>
        <div className="concierge-panel__section-title">GỌI ĐỒ UỐNG TỚI BÀN</div>
        <div className="concierge-panel__drink-row">
          <button onClick={() => onAction(staffId, 'egg-coffee')}><span>☕</span><div><strong>Cà phê trứng Hà Nội</strong><small>Mượt, ấm, nhẹ ngọt</small></div><b>Gọi món</b></button>
          <button onClick={() => onAction(staffId, 'cold-brew')}><span>🧊</span><div><strong>Cold Brew cam mật</strong><small>Thanh, sáng, tỉnh táo</small></div><b>Gọi món</b></button>
        </div>
      </section>
      <p className="concierge-panel__hint">Mẹo: hãy ngồi vào bàn trước để Barista mang đồ uống tới đúng chỗ.</p>
    </aside>
  );
}
