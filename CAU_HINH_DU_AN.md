# Cấu hình kỹ thuật & runbook cục bộ — CafeTrader

> Nguồn sự thật cho cấu hình hiện tại. Đây là bản thử nghiệm local, **không phải** cấu hình triển khai internet hay cam kết vận hành quy mô lớn.

## 1. Nền tảng thực tế

| Lớp | Công nghệ đang dùng | Vai trò | Lưu ý quan trọng |
|---|---|---|---|
| Web client | React 19, TypeScript 5, Vite 6 | UI, state và bundling | `src/App.tsx` điều phối luồng vào quán/room/seat/menu. |
| 3D | BabylonJS Core 8 | Map, camera, pointer, mesh, lighting | `src/CafeScene.tsx`; mesh tĩnh được freeze, không tự tăng light grid. |
| Âm thanh | Web Audio API, Web Speech API | ambience/SFX/TTS Việt hoá | Phụ thuộc gesture, loa và voice cài trên thiết bị. Không có file nhạc bên ngoài. |
| Realtime demo | Node HTTP + `ws` 8 | room/presence/seat/chat event | `server/index.mjs`, `server/rooms.mjs`; state **in-memory**. |
| Kiểm thử | Node test runner, TypeScript, Vite build | contract server + type/build | `npm run verify` là cổng bắt buộc trước bàn giao. |

## 2. Điều kiện máy và cài đặt

- Yêu cầu: Node.js **20+**, npm và trình duyệt Chromium/Firefox/Safari hiện đại có WebGL/Web Audio.
- Cài dependencies một lần tại thư mục gốc: `npm install`.
- Không có `.env` bắt buộc hiện tại. Không tạo hoặc đưa token/secret vào repo.
- `node_modules/`, `dist/`, `.local/`, `.env*` đã được ignore. `dist/` là đầu ra build, có thể xoá và tạo lại bằng `npm run build`.

## 3. Lệnh làm việc

Mở hai terminal trong `D:\ChatGPT\CafeTrader`:

```powershell
npm run server
```

```powershell
npm run dev
```

| Lệnh | Kết quả mong đợi |
|---|---|
| `npm run server` | HTTP/WebSocket local ở `http://127.0.0.1:3001`. |
| `npm run dev` | Vite local, thường là `http://127.0.0.1:5173`. |
| `npm test` | 25 test server/HTTP/WebSocket hiện có phải pass. |
| `npm run typecheck` | `tsc --noEmit`, không sinh file. |
| `npm run build` | typecheck + Vite production build vào `dist/`. |
| `npm run verify` | `test` rồi `build`; dùng trước khi báo bàn giao. |

## 4. Port, proxy và biến môi trường

| Thành phần | Giá trị hiện tại | Cách đổi an toàn |
|---|---|---|
| Server HTTP/WS | `HOST=127.0.0.1`, `PORT=3001` | Có thể truyền `HOST`/`PORT` vào `npm run server`. Nếu đổi port, phải đổi đồng thời proxy Vite. Không bind public khi chưa có T22–T24. |
| Vite dev | Vite tự chọn, thường `5173` | Port thực tế do Vite in ra; client không hard-code port này. |
| REST proxy | `/api` → `http://127.0.0.1:3001` | Nằm trong `vite.config.ts`. |
| WebSocket proxy | `/ws` → `ws://127.0.0.1:3001` | Nằm trong `vite.config.ts`, bắt buộc `ws: true`. |
| Production chunk | `vendor-babylon`, `vendor-react` | Khai báo `build.rollupOptions.output.manualChunks` trong `vite.config.ts`. Warning Babylon >500 kB là cảnh báo hiện hữu, không được che bằng cách nâng limit mà chưa đo T08/T23. |
| Vietnamese TTS (tuỳ chọn) | `VITE_VIET_TTS_ENGINE=korva`, `VIET_TTS_SERVICE_URL=http://127.0.0.1:7861/synthesize` | Chỉ bật sau khi chạy bridge `services/korvatts/bridge.py` cùng máy. Node từ chối URL không phải loopback; không dùng token hay cloud API. |

## 5. Ranh giới an toàn của server hiện tại

- `server/index.mjs` dùng HTTP thuần và `ws`, path WebSocket là `/ws`, payload tối đa 8192 byte.
- Client phải gửi `join` trong 10 giây; giới hạn burst là 80 message/giây/kết nối.
- `RoomService` không lưu dữ liệu bền vững. Restart server sẽ mất room, ghế, report và session demo.
- API private room hiện ghi rõ chỉ cho local demo; chưa có auth, HTTPS, database, queue, log/audit bền vững hay rate-limit phân tán.
- Không đưa lên internet, không xem là kiến trúc 100.000 người dùng. Mọi hướng production phải đi qua quyết định T02/T03 và review T22–T24.

## 6. Luồng dữ liệu cần giữ khi sửa

```text
React UI ── /api, /ws (Vite proxy) ──> Node/ws RoomService
   │                                      │
   ├─ CafeScene (position/seat/POV) <─────┤ room snapshot/events
   └─ Web Audio / Speech (chỉ client)     └─ state in-memory demo
```

Tuỳ chọn khi đã tự host KorvaTTS:

```text
React `vietnameseTts` ──> `/api/tts` ──> Node relay ──> `127.0.0.1:7861/synthesize`
```

- Chỉ server được quyết định ghế, capacity, room private và event multiplayer.
- `CafeScene` chỉ render/nhận input; không biến visual click thành quyền server.
- Âm thanh, TTS, local profile và reduced motion có fallback client; không làm điều kiện để join room.
- TTS Korva chỉ dùng cho câu thông báo ngắn. Nếu bridge tắt/lỗi, client cooldown 60 giây rồi phát Web Speech; không cache WAV, không nhận reference-audio và không có voice cloning.
- Khi thêm event, cập nhật contract/client/server/test trong cùng thay đổi (T03, T11–T18).

### Bật giọng Việt tự host (IDEA-21)

1. Đọc `services/korvatts/README.md`, kiểm tra license/trọng số và dung lượng trước khi cài. Không thêm model/venv vào Git.
2. Chạy bridge bind `127.0.0.1:7861`, rồi chạy Node với `VIET_TTS_SERVICE_URL=http://127.0.0.1:7861/synthesize`.
3. Tạo `.env.local` chỉ ở máy phát triển: `VITE_VIET_TTS_ENGINE=korva`; khởi động lại Vite.
4. Test `/health` của bridge, gọi nhân sự/BOT, thử mute/đổi bàn và tắt bridge để xác nhận fallback. Ghi browser, CPU/RAM, độ trễ câu đầu và lỗi autoplay.

Bridge là adapter local cho KorvaTTS, không phải xác nhận chất lượng production. Không bind public, không đưa user text sang URL ngoài loopback, không dùng audio tham chiếu để clone giọng.

## 7. Checklist cấu hình trước một vòng QA

1. Chạy server rồi Vite, mở hai tab ẩn danh.
2. Xác nhận `GET /health` trả `{ "ok": true }`, `/api/rooms` trả dữ liệu public.
3. Vào cùng room, thử ghế trùng, rời ghế, chat theo bàn và private room.
4. Từ Start, thử tiếng bước chân trên gỗ/cầu thang/đá; kiểm tra mute, giảm chuyển động, TTS Việt hoá và điều khiển mobile.
5. Mở DevTools Performance và ghi lại thiết bị, browser, FPS P50/P95, memory, tải đầu tiên. Không dùng cảm nhận thay cho T08/T23.
6. Chạy `npm run verify`; lưu lỗi thật vào `TIEN_DO.md` trước khi chuyển người phụ trách.

## 8. Backlog sáng tạo được đề xuất (chưa được triển khai)

| Ưu tiên | Ý tưởng | Mã kế hoạch | Tiêu chí nghiệm thu tối thiểu |
|---|---|---|---|
| 1 | **Café Passport**: mỗi góc có thẻ trải nghiệm 1 câu, stamp khi ngồi/uống; không biến thành loop gây nghiện. | T01, T10, T17, T20 | Có thể bỏ qua hoàn toàn; clear state; không thưởng tiền/đầu tư. |
| 2 | **Evening Ritual**: lúc vào quán, quản gia gợi ý một nhịp “tập trung / trò chuyện / nghỉ”, chỉ đổi ambience và POV. | T16, T18, T20 | Consent âm thanh rõ; reduced motion/mute vẫn dùng được. |
| 3 | **Bàn kể chuyện**: mỗi bàn có một prompt Việt ngắn về kỷ luật giao dịch, đọc sách hoặc cà phê, có nút ẩn. | T10, T15, T19 | Không tư vấn tài chính, có moderation/rate limit và fallback text. |
| 4 | **Phiếu order nhìn thấy được**: barista xác nhận → pha → đặt ly tại bàn bằng animation có thể skip. | T17, T18, T19 | Đơn đúng ghế; retry/cancel idempotent; animation lỗi không chặn đơn. |
| 5 | **Ảnh kỷ niệm “Closing Bell”**: photo-mode client chỉ khi có consent, watermark ngày/room, không tự upload. | T07, T20, T22 | Không lộ người chơi khác/room private; export cục bộ rõ ràng. |
| 6 | **Đêm theo mùa**: mưa/đông/đèn lễ hội là preset asset ledger, không tải asset không rõ license. | T04, T16, T19 | Mỗi preset có budget mesh/light và nút tắt. |

## 9. Cổng quyết định trước online quy mô lớn

Không tự triển khai. Trước khi chọn cloud hoặc làm 100.000 người dùng, cần chủ dự án phê duyệt ADR nêu rõ:

1. mô hình authoritative rooms/sharding, giới hạn người/room và vùng địa lý;
2. identity/auth, quyền riêng tư/voice/moderation, retention và xử lý report;
3. state bền vững (database/Redis), queue, rate limit toàn cục và observability;
4. staging HTTPS, secret management, backup/rollback, load test và chi phí;
5. tiêu chí go/no-go có số đo T23–T27.

Không dùng server `ws` in-memory hiện tại làm bằng chứng cho năng lực production.
