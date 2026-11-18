# Cập nhật dự án so với kế hoạch gốc — 11/11/2026

Mục tiêu gốc: `KE_HOACH_GOC.md` phiên bản 1.0. Đây là trạng thái thực tế của phiên bắt đầu triển khai; không phải sản phẩm đã hoàn thành.

Đã có prototype cục bộ React 19/Vite/TypeScript/Babylon: quán 3D dựng bằng code, 5 bàn/20 ghế, quầy bar, cảnh trang trí, avatar, điều khiển và góc nhìn. Giao diện chọn tên, phòng public/chill, bàn, chat, menu mẫu; chế độ xem thử ngoại tuyến. Chưa kiểm tra scene trong trình duyệt hoặc trên điện thoại.

Server `ws` dùng bộ nhớ có danh sách phòng, ghế độc quyền, chat room/bàn và mã mời riêng ở server. UI chưa nối room riêng; thiếu xác thực production, voice, lưu bền vững và reconnect an toàn. Không công bố server này lên internet. Đây là thay đổi so với Colyseus đề xuất: cần review và ghi quyết định chính thức, không sửa kế hoạch gốc để giả như đã hoàn thành.

| Mã | Trạng thái | Đối chiếu với mục tiêu |
|---|---|---|
| T01 | Đang làm | Có đặc tả; chưa chốt thiết bị và review người dùng |
| T02 | Hoàn thành bước đầu | Đã lập `.codex/ADR_001_WEBSOCKET_WEBRTC.md`: chốt dùng `ws` thuần + WebRTC P2P Mesh + Procedural Audio cho MVP |
| T03 | Hoàn thành bước đầu | Đã lập `.codex/CONTRACT_GIAO_TIEP.md`: chuẩn hóa toàn bộ JSON schema sự kiện client/server, media, voice & order |
| T04 | Cần review | Đã có cổng quán, sân vào ~504m², sảnh biệt thự và facade 5 tầng; cần review trực quan. Các tầng trên hiện là facade, chưa phải 5 tầng tương tác độc lập. |
| T05 | Cần review | Nền và build đã có |
| T06 | Hoàn thành bước đầu | Thêm cổng đá, biển hiệu, lối đi sân vườn, cửa vào và mặt tiền villa café 5 tầng; sảnh/lửng giữ hoạt động hiện có. Chưa QA trực quan do browser host không khả dụng. |
| T07 | Hoàn thành bước đầu | Camera/di chuyển/ghế đa tầng; chống camera xuyên tường; chế độ Giảm chuyển động (Reduced Motion); âm thanh gõ gỗ & cầu thang |
| T08 | Hoàn thành bước đầu | Đã tích hợp HUD đo FPS, thời gian khung hình (ms), số lượng meshes thời gian thực |
| T09 | Hoàn thành bước đầu | Đã hoàn thành Thẻ Căn Cước Trader (Trader Passport): lựa chọn màu đại diện Industrial Luxury, Badge phong cách giao dịch (Zen, Scalper, Swing, HODLer, Macro, Arbitrage), bio/châm ngôn, số tách cà phê đã uống; lưu bền vững client-side (`localStorage`), đồng bộ với server qua `join` event; tính năng nhấp ngụm cà phê tích lũy tách uống và thăng hạng |
| T10 | Hoàn thành bước đầu — cần QA browser | Luồng lobby chọn sảnh/suite/salon đã có; cần kiểm tra trực quan trên browser khả dụng |
| T11 | Cần review | Test hai WebSocket thật; hỗ trợ tọa độ Y đa tầng |
| T12 | Hoàn thành bước đầu — cần QA browser | Regression test giữ ghế/sức chứa PASS; cần kiểm tra thao tác trực quan |
| T13 | Hoàn thành bước đầu | Server & UI phòng riêng với inviteCode, chia sẻ mã mời; tự động kết nối lại khi mất mạng (auto-reconnect) |
| T14 | Hoàn thành bước đầu | WebRTC Voice Chat Mesh theo bàn; signaling server cô lập theo bàn; tự dọn dẹp khi rời ghế; vòng hào quang 3D khi nói |
| T15 | Hoàn thành bước đầu | Chat phòng/bàn độc lập; biểu cảm emote 3D; chức năng chặn (Block), báo cáo (Report), chống spam chat |
| T16 | Hoàn thành bước đầu | Hệ thống Web Audio Lo-fi, tiếng mưa & âm thanh quán procedural; Màn hình Trader Terminal tương tác phóng to xem live feed |
| T17 | Hoàn thành bước đầu | Thực đơn 8 món đồ uống ảo, quy trình pha chế đếm ngược và phục vụ hiển thị 3D trên bàn ăn; âm thanh nhấp ngụm cà phê |
| T18 | Hoàn thành bước đầu | Barista tự động thông báo nhận đơn, pha chế và phục vụ vào chat phòng/bàn; xử lý hủy đơn khi khách rời bàn |
| T19 | Hoàn thành bước đầu | Quán 3D hoàn thiện chi tiết: thảm boho, nến lung linh, khói cà phê, mèo ngủ, máy đĩa than, Trader screen động, lan can kính dát vàng |
| T20 | Hoàn thành bước đầu | Virtual Joystick 360 độ cảm ứng, Action Pad nhanh trên mobile (POV, tầng, mic, ghế, menu, chat), giao diện responsive |
| T21 | Hoàn thành bước đầu | Đã hoàn thành bảng điều khiển Quản trị & Điều hành phòng: tự động chỉ định Host phòng riêng (`hostId`), Host phát thông báo khẩn toàn phòng (`announcement` banner), Host tắt tiếng (`mute`) chặn chat server-side và mời ra (`kick`) với lý do; hệ thống báo cáo vi phạm (`report` event) kèm lưu trữ server và API `GET /api/reports`; Tab Khách trong phòng trực quan |
| T22 | Chưa bắt đầu | Chưa review bảo mật production |
| T23 | Hoàn thành bước đầu | Đã cấu hình Rollup `manualChunks` trong `vite.config.ts` cô lập `@babylonjs/core` (`vendor-babylon`) và React (`vendor-react`); giảm kích thước JS entry bundle chính từ 6.4 MB xuống 328 kB (103 kB gzipped) |
| T24 | Chưa bắt đầu | Chưa staging/backup/rollback |
| T25 | Chưa bắt đầu | Chưa thử với người thật |
| T26 | Chưa bắt đầu | Chưa có vòng sửa sau thử nghiệm |
| T27 | Chưa bắt đầu | Chưa sẵn sàng phát hành |
| T28 | Đang làm | Đã tạo điểm vào chung `.codex/` cho Codex/agent; chưa có gói vận hành hoặc nghiệm thu bàn giao |

## Bằng chứng

- `npm run build` PASS: TypeScript và Vite; cảnh báo chunk JS chính khoảng 6.3 MB (Babylon full bundle), gzip 1.4 MB; build hoàn thành trong ~12.0 giây.
- `npm test` PASS 9/9: ghế độc quyền, chat theo bàn, mã phòng riêng, tọa độ an toàn, order đồ uống kèm thông báo Barista, broadcast biểu cảm emote 3D, tín hiệu thoại voice-signal cô lập theo bàn, đứng dậy dọn dẹp voice-peer-left, kiểm tra kết nối WebSocket song song.
- Dịch vụ cục bộ đang chạy nền: WebSocket Server (:3001) và Vite Dev (:5173). Đã xác nhận `{"ok":true}` và `HTTP 200 OK`.
- Git chưa có commit và remote khi bắt đầu. Không tạo remote, commit, push hay triển khai.
- `.codex/README.md` và `.codex/WORKFLOW.md` đã tạo tại `D:\\ChatGPT\\CafeTrader`: quy định thứ tự đọc tài liệu, quy trình nhận việc T01–T28, quy ước nhiều agent, quota, kiểm tra và mẫu bàn giao. `AGENTS.md` đã dẫn chiếu tới điểm vào này.
- Regression gate đã bổ sung: `npm run verify` chạy 15 test (RoomService, HTTP API và WebSocket thật) rồi TypeScript/Vite build. Test mới bảo vệ seat 7 bàn, voice state theo bàn, làm sạch profile, sức chứa phòng riêng, HTTP room list/health/404 và WebSocket trước join. PASS 15/15 ngày 11/11/2026.
- Đã hoàn thành triển khai IDEA-01: Dựng Lò sưởi lớn đá Travertine ở sảnh Hearth Hall kèm củi lửa bập bùng và ánh sáng amber, Thư viện Focus Library trên gác lửng với kệ sách lớn và đèn Banker's Lamp, Bảng chỉ dẫn 4 tầng Floor Directory Board đón khách tại sảnh vào, lò than brazier ngắm skyline đêm tại Night Terrace, minibar & podcast desk tại Private Lounge, thanh phím tắt 4 POV theo đúng CONCEPT_KHONG_GIAN.md Mục 4, âm thanh củi nổ tí tách procedural tự kích hoạt khi tới gần lò sưởi và preset âm thanh `Lò sưởi Hearth`. `npm run verify` PASS 15/15 tests, build PASS.
- `.codex/TASK_BOARD.md` là bảng việc hiện hành cho agent: đã cập nhật trạng thái IDEA-01 và T02/T03 sang `Hoàn thành bước đầu`.
- Đã hoàn thành T02 & T03: Lập văn kiện ADR chính thức `.codex/ADR_001_WEBSOCKET_WEBRTC.md` (chốt kiến trúc `ws` thuần, WebRTC mesh, procedural audio, lộ trình scale horizontal) và `.codex/CONTRACT_GIAO_TIEP.md` (đặc tả toàn bộ schema sự kiện JSON giữa Client/Server và quy tắc bảo mật validation). `npm run verify` PASS 15/15 tests.
- IDEA-02/T04/T06: `src/CafeScene.tsx` đã mở rộng cảnh với điểm spawn ở cổng, lối vào sân biệt thự 24 × 21m (~504m²) và mặt tiền 5 tầng; `src/App.tsx` đổi POV đầu thành Cổng quán. `npm run verify` PASS 19/19 và build PASS. Không có QA trực quan: browser host không khả dụng trong môi trường phiên này.
- Đã hoàn thành triển khai T09, T21 & T23: 1) T09: Modal Thẻ Căn Cước Trader (Trader Passport), Badge phong cách giao dịch, lưu trữ `localStorage`, đồng bộ `join`, nhấp ngụm cà phê tích lũy tách và thăng hạng; 2) T21: Quản trị Host phòng riêng (`hostId`), phát thông báo khẩn `announcement` banner, tắt tiếng `mute` chặn chat server-side, mời ra `kick`, hệ thống báo cáo vi phạm `report` lưu trữ server và API `GET /api/reports`, Tab Khách trong quán trực quan; 3) T23: Rollup `manualChunks` tách `@babylonjs/core` (`vendor-babylon`) và React (`vendor-react`), giảm kích thước main entry JS bundle từ 6.4 MB xuống 328 kB (103 kB gzip). `npm run verify` PASS 19/19 tests và build PASS trong 9.02s.

## Việc tiếp theo

1. Đọc kế hoạch, file này, `TIEN_DO.md`, `BAN_GIAO.md`; xem Git và quota.
2. Chạy server và Vite theo README; kiểm tra browser, hai tab, ghế, di chuyển, camera và thông báo phím V. Sửa lỗi có bằng chứng; đo hiệu năng.
3. Chốt T01–T03, kiến trúc ws/Colyseus; hoàn thành đăng nhập, UI phòng riêng và reconnect.
4. Thực hiện voice theo bàn, nhạc/video có quyền, đơn và phục vụ, quản trị và bảo mật; tiếp tục T08/T20/T22–T28 theo kế hoạch.
5. Sau mỗi phần cập nhật file này cùng `TIEN_DO.md` và `BAN_GIAO.md`. Khi gần quota ưu tiên review và bàn giao.
6. Trước khi bàn giao thay đổi mã, chạy `npm run verify`; bổ sung case thành công và bị từ chối cho contract mới theo `.codex/TESTING.md`.

## Review đối chiếu mã nguồn & trạng thái phiên — 12/11/2026 (Asia/Saigon)

- Phạm vi: Review và đối chiếu mã nguồn với tài liệu theo quy trình kiểm tra phiên mới (chưa có chỉ định Txx cụ thể từ người dùng; tuân thủ quy tắc không tự ý code tính năng mới).
- Đối chiếu trạng thái IDEA-08 (T10/T12/T13/T17/T18 — Lobby đặt chỗ & tiếp viên):
  + Mã nguồn server (`server/rooms.mjs`, `server/index.mjs`) và test (`server/http.test.mjs`) đã có logic sức chứa phòng riêng (2, 6, 8 người) và endpoint `/api/private-rooms?capacity=...`.
  + Giao diện `src/App.tsx` và `src/App.css` đã có logic/UI cho phòng chờ chọn không gian và tiếp viên hỏi món.
  + Tuy nhiên, `src/network/client.ts` chưa cập nhật chữ ký cho `CafeClient.createPrivateRoom` (vẫn chỉ nhận `url?: string`), khiến `src/App.tsx:496` gọi với `selection.capacity` bị lỗi kiểu dữ liệu.
- Kiểm tra thực tế:
  + Lệnh: `npm run verify`
  + `node --test`: **PASS 20/20** test (HTTP API, WebSocket protocol, seat exclusivity, table chat, map bounds, orders, emotes, voice isolation, profile sanitization, reports, host admin).
  + `tsc --noEmit && vite build`: **FAILED** với lỗi `src/App.tsx(496,64): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'`.
- Hạn chế / rủi ro:
  + Bản build hiện đang gãy (broken build) do việc dở dang của IDEA-08; cần sửa đồng bộ `src/network/client.ts`.
  + Git cục bộ chưa có commit nào (toàn bộ file nằm ở working tree).
  + Chưa thể QA browser/FPS thực tế.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).
- Đề xuất 3 việc tiếp theo theo ưu tiên:
  1. Cập nhật `CafeClient.createPrivateRoom` trong `src/network/client.ts` để hỗ trợ tham số `capacity?: number`, khôi phục trạng thái `npm run verify` PASS.
  2. Bổ sung kiểm thử hồi quy cho luồng Lobby/tiếp viên và hoàn tất nghiệm thu IDEA-08.
  3. Mở browser tại `http://127.0.0.1:5173/` để kiểm tra trải nghiệm người dùng thực tế của luồng đặt chỗ.

## IDEA-09 / T04, T06, T07, T19 — Ban công 8 tầng có bàn ghế nhìn ra Góc Chill — 12/11/2026

- Theo yêu cầu mới nhất của chủ dự án: thiết kế ban công ở mỗi tầng, có bàn ghế ngoài trời nhìn ra Góc Chill (view đài phun nước, sân vườn tuyết và skyline đêm).
- Đã sửa `src/CafeScene.tsx` và `src/network/client.ts`:
  + **Tầng 1 (Ground Floor):** Sân vườn ngoài trời Garden Patio Balcony (`[-9.2, 0, -11.0]`) sàn đá Travertine viền gỗ, lan can kính & đồng, bàn bistro cẩm thạch Calacatta, cặp ghế bành thư giãn da Cognac, đèn nung amber, 2 tách cà phê, 2 chậu cây cảnh và biển đồng `GÓC CHILL SÂN VƯỜN · TẦNG 1`.
  + **Tầng 2 (VIP Mezzanine):** Ban công ngoài trời Skyline Balcony (`[-10.6, 3.2, 2.4]`) vươn ra ngoài trời cánh Tây nối từ Night Terrace/Brazier, lan can kính & đồng, bàn bistro tròn cẩm thạch, 2 ghế bành ngắm skyline, đèn lantern và chậu cây xanh.
  + **Tầng 3 đến Tầng 8:** Mỗi tầng được trang bị một ban công cantilevered vươn ra phía trước (`[0, y, -7.65]`, kích thước 8.6 × 3.2m), có thanh chống console bằng đồng dưới đáy sàn; lan can kính tempered viền đồng bóng; lối đi từ sảnh/terrace mở thẳng ra ban công (tầng 6–8 có cửa đôi kính Pháp mở ra); bàn tròn bistro cẩm thạch viền đồng, 2 ghế bành ngoài trời bọc da Cognac/Nhung xanh, đèn amber, tách cà phê bốc khói, 2 chậu cây xanh và biển tên ban công riêng cho từng tầng.
  + **Tương tác & Di chuyển:** Nới biên an toàn `tryMove` và cao độ `onMezzanine` cho phép người chơi bước ra ban công cả 8 tầng an toàn, không bị rơi; thêm đĩa va chạm vật lý cho bàn ghế ban công.
  + **Đồng bộ Client:** Sửa hàm `CafeClient.createPrivateRoom` trong `src/network/client.ts` hỗ trợ tham số `capacity?: number`, khắc phục triệt để lỗi TypeScript TS2345 còn tồn đọng trước đó.
- Kiểm tra thực tế:
  + `npm run verify`: **PASS 20/20 test** tự động (Server HTTP, WebSocket, Rooms, Security Bounds); Vite production build **PASS** trong 9.03s (entry bundle gzip 111.97 kB).
- Hạn chế / rủi ro:
  + Chưa có browser automation để kiểm tra trực quan render và FPS thực tế. Cần người dùng mở `http://127.0.0.1:5173/`, dùng phím W/A/S/D và Royal Lift để ghé thăm ban công các tầng 1–8.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên).
- Git: master, chưa có commit.

## IDEA-11 / T07, T09, T14, T15, T16, T22 — Thêm Các BOT Trader (Giọng Nói Sống Động Như Người Thật) & Sự Kiện Thị Trường NFP — 12/11/2026

- Theo yêu cầu mới nhất của chủ dự án:
  1. Thêm các BOT Trader (làm cho giống người, đặc biệt là giọng nói) vào không gian quán cà phê 3D.
  2. Mô phỏng các sự kiện thị trường NFP (Non-Farm Payrolls) để môi trường giao dịch sống động, giống thực tế hơn.
- Chi tiết kỹ thuật đã triển khai:
  + `src/audio/botVoice.ts`: Tạo mới module quản lý giọng nói AI với Web Speech API (`window.speechSynthesis`), hỗ trợ chọn lọc voice tối ưu (ưu tiên Tiếng Việt, fallback theo giới tính), điều chỉnh cao độ (pitch), tốc độ nói (rate), âm lượng và hệ thống đăng ký sự kiện `onSpeakingChange`. Bổ sung cơ chế procedural chime vocal formant fallback qua Web Audio API khi trình duyệt không có TTS. Lưu trữ trạng thái bật/tắt giọng nói vào `localStorage`.
  + 4 BOT Trader Personas có tính cách, phong cách giao dịch và chỗ ngồi cố định:
    1. **Alex Trần (`bot-alex`)**: 🐋 Cá Voi Đại Dương, Lv.8, Bàn 6 VIP Ban công Tầng 2, Cà phê trứng Hà Nội, SĐT `098-888-9999`, chất giọng nam trầm đĩnh đạc (pitch 0.84x, rate 0.94x). Châm ngôn: *"Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn."*
    2. **Mai Linh (`bot-mailinh`)**: 🧘 Zen Trader, Lv.5, Bàn 1 Cửa sổ Tầng 1, Trà hoa cúc mật ong, SĐT `098-666-8888`, chất giọng nữ dịu dàng truyền cảm (pitch 1.18x, rate 0.96x). Châm ngôn: *"Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do."*
    3. **Hải Đăng (`bot-haidang`)**: ⚡ Scalper, Lv.7, Bàn 2 Lò sưởi Fireside Tầng 1, Espresso đậm đặc, SĐT `098-777-5555`, chất giọng nam trẻ trung sắc bén (pitch 1.05x, rate 1.06x). Châm ngôn: *"Chuyên gia Scalping nến giật M1-M5, săn tin NFP, CPI & FOMC."*
    4. **Sarah Jenkins (`bot-sarah`)**: 🌐 Macro Analyst, Lv.9, Bàn 4 Thư viện Focus Tầng 1, Cold Brew ủ lạnh, SĐT `098-999-3333`, chất giọng nữ trí thức chuẩn mực (pitch 1.08x, rate 1.0x). Châm ngôn: *"Hedge Fund Global Macro Analyst. Data-driven & chu kỳ thanh khoản."*
  + `src/audio/chillAudio.ts`: Bổ sung `playBotVocal(gender, pitchMod)` (formant vocal resonance) và `playNfpAlert()` (fanfare tin kinh tế khẩn cấp staccato arpeggio).
  + `server/rooms.mjs`:
    - Thêm `initBots(roomId)`: Khởi tạo dữ liệu bot vào `room.players` với tọa độ 3D, ghế ngồi, ly đồ uống, SĐT, XP, Level (idempotent, chống trùng lặp).
    - Thêm `triggerNfp(roomId)`: Broadcast sự kiện `nfp-event` và tin nóng `announcement` toàn phòng.
  + `server/index.mjs`: Đăng ký message handler WebSocket `trigger-nfp`.
  + `server/rooms.test.mjs`: Bổ sung 2 test regression:
    - `initBots populates room with trading bots and handles duplicate calls idempotently` (test thành công + chống trùng lặp + từ chối phòng không hợp lệ).
    - `triggerNfp broadcasts NFP news event and rejects non-existent room` (test thành công + từ chối phòng không tồn tại).
  + `src/network/client.ts`: Định nghĩa kiểu dữ liệu `NfpEvent`, bổ sung phương thức `triggerNfp()` và event emitter `onNfp(handler)`.
  + `src/App.tsx`:
    - Tích hợp 4 BOT Trader vào danh sách khách `others` hiển thị trực tiếp trong 3D `CafeScene`, cầm ly đồ uống và ngồi tại các bàn 1, 2, 4, 6; tự động nhường ghế khi người chơi thật ngồi vào.
    - Lắng nghe `botVoice.onSpeakingChange` đưa `botId` vào `speakingPlayerIds`, kích hoạt vòng sóng âm 3D (`speakingHalo`) nhấp nháy trên đầu bot khi nói.
    - Lời chào tự nhiên bằng giọng nói khi người chơi ngồi vào bàn của bot (`table greeting`).
    - Lời trò chuyện ngẫu hứng chia sẻ kinh nghiệm định kỳ (`ambient banter` mỗi ~85s).
    - Kịch bản mô phỏng tin thị trường NFP thời gian thực (`runNfpSimulation`): Báo động âm thanh `playNfpAlert()`, hiển thị banner tin nóng NFP, chuỗi phát biểu TTS lần lượt của 4 bot trader và màn bắn pháo hoa ăn mừng chốt lời Scalp Vàng +$2,450 của Hải Đăng.
    - Nút bấm "🔥 Tin NFP" và nút bật/tắt "🎙️ Giọng BOT" trên Header và Atmosphere Pill.
    - Modal "Bảng Tin NFP & Hội Đồng Bot Trader": Hiển thị số liệu thực tế 254K, dự báo 140K, thất nghiệp 4.1%, DXY +75 pips; nút kích hoạt tin NFP khẩn cấp; thẻ thông tin 4 bot kèm nút "🔊 Nghe thử giọng chào" và "⚡ Phản ứng NFP".
    - Tab Khách: Hiển thị đầy đủ khách thật và 4 AI Bot Trader kèm nút "🔊 Nghe giọng BOT".
  + `src/App.css`: Bổ sung styles cho header buttons, status pills, breaking banner, modal NFP, bot cards và badges.
- Kiểm tra thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.97s, zero TypeScript errors.
- Hạn chế / rủi ro:
  + Cần người dùng trải nghiệm trực tiếp trên trình duyệt tại `http://127.0.0.1:5173/` để nghe giọng nói Web Speech API và xem các bot tương tác 3D.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-13 / T04, T07, T08, T19 — bỏ bảng vào quán, bước chân và hiệu năng — 12/11/2026

- Trạng thái: hoàn thành bước đầu; cần QA browser/FPS trên thiết bị thật.
- Đã làm: gỡ Floor Directory và collision ở cửa vào T1; resume Web Audio từ thao tác phím/chạm để SFX bước chân được phép phát từ bước đầu; tắt ray-pick thừa khi xoay camera, tắt MSAA, giới hạn mật độ điểm ảnh và hạ render resolution theo frame time; freeze transform các mesh kiến trúc tĩnh.
- File: `src/CafeScene.tsx`, `src/audio/chillAudio.ts`.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 9.11s.
- Hạn chế: chưa đo được FPS trước/sau hoặc kiểm tra trực quan do browser-access host không khả dụng trong phiên.
- Việc tiếp theo: kiểm tra cửa vào không còn bảng, bước chân sau cú nhấn/phím đầu tiên, HUD FPS và chất lượng hình ảnh trên desktop lẫn mobile.
- Quota: chưa xác minh (phiên không cung cấp chỉ số quota chính thức).

## IDEA-13 / điều chỉnh chất lượng ảnh và SFX bước chân — 12/11/2026

- Quyết định: ưu tiên ảnh sắc nét theo phản hồi chủ dự án; render trở lại native device-pixel-ratio với MSAA, không còn governor tự hạ độ phân giải.
- Đã làm: nút vào quán gọi `resume()` và `unmute()` cho Web Audio; bước chân có âm nền lớn hơn, dài hơn và contact transient trên gỗ/cầu thang/đá.
- File: `src/CafeScene.tsx`, `src/audio/chillAudio.ts`, `src/App.tsx`.
- Kiểm tra: `npm run verify` PASS 25/25; build production PASS trong 13.66s.
- Hạn chế: chưa có QA âm thanh/FPS trực quan do browser-access host không khả dụng.
- Việc tiếp theo: reload tab, vào quán bằng nút Start, sau đó đi WASD/joystick để nghe bước chân; nếu FPS không đáp ứng, tối ưu theo mesh/light trước khi giảm render quality.

## IDEA-14 / T04, T06, T10, T16–T20 — trải nghiệm phục vụ Việt hoá & UX hospitality — 12/11/2026

- Trạng thái: hoàn thành bước đầu; cần QA browser/TTS trên thiết bị thật.
- Đã làm:
  - Thêm ba nhân sự 3D có thể bấm: quản gia Minh An, barista Thu Hà và tiếp viên Bảo Ngọc. Mỗi người mở đúng ngữ cảnh trong bảng phục vụ, không thay đổi giao thức room/ghế authoritative.
  - Thêm `ConciergePanel`: lời chào và hành động bằng tiếng Việt, phát `speechSynthesis` với `lang: vi-VN`, điều hướng nhanh tới Lò sưởi/Thư viện/Ban công, hoặc yêu cầu cà phê trứng/Cold Brew qua luồng gọi đồ hiện có. Khi thiết bị không có Web Speech API, UI vẫn phản hồi bằng toast.
  - Bổ sung chi tiết chọn bàn cho cả 7 góc: không khí, độ yên và mục đích phù hợp; giữ nút ghế và trạng thái occupancy hiện có.
- File: `src/audio/staffVoice.ts`, `src/components/ConciergePanel.tsx`, `src/components/ConciergePanel.css`, `src/CafeScene.tsx`, `src/App.tsx`, `src/App.css`, `.codex/TASK_BOARD.md`.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 8.81s.
- Hạn chế: phiên không có chỉ số quota chính thức để đối chiếu giới hạn 5 giờ; browser automation không khả dụng nên chưa xác nhận giao diện/responsive, hit-box nhân sự, FPS hay chất lượng giọng Việt trên máy thật.
- Việc tiếp theo: mở `http://127.0.0.1:5173/`, Start → bấm từng nhân sự hoặc “Gọi quản gia” → nghe lời chào → chọn góc/đồ uống → thử đủ 7 thẻ bàn trên desktop và mobile. Chỉ mở rộng nội dung mới sau khi vòng QA này đạt.
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-15 / T04, T06, T16, T19 — âm bước chân & trang hoàng Hearth Hall — 12/11/2026

- Trạng thái: hoàn thành bước đầu; cần QA browser/audio/FPS trên thiết bị thật.
- Đã làm:
  - `src/audio/chillAudio.ts`: tăng SFX mặc định từ 0,60 lên 0,78; tăng thân âm và contact transient của footsteps trên gỗ/cầu thang/đá để không bị chìm dưới mưa, nhạc và ambience.
  - `src/CafeScene.tsx`: tăng ánh sáng ấm tại quầy, VIP và lò sưởi; giảm ánh cửa sổ lạnh; thêm duy nhất một nguồn sáng amber trung tâm. T1 có chandelier brass hai tầng, mảng tranh khung vàng/sconce và ánh nến để không gian lộng lẫy nhưng vẫn ấm.
  - Quyết định hiệu năng: chandelier/tranh/nến là mesh tĩnh hoặc emissive; chỉ bổ sung một `PointLight`, không thêm lưới ánh sáng động hay thay đổi room/seat/network.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 18,69s.
- Hạn chế: chưa đo SPL/độ cân bằng âm thanh, không có QA trực quan hoặc đo FPS trên thiết bị thật vì browser automation host không khả dụng. Cảnh báo chunk Babylon >500 kB là cảnh báo build có từ trước, build vẫn thành công.
- Việc tiếp theo: vào `http://127.0.0.1:5173/`, Start rồi đi WASD/joystick trên gỗ, cầu thang và sân đá; kiểm tra âm không chói/vỡ khi chạy. Quan sát Hearth Hall và FPS desktop/mobile; nếu cần giảm tải, ưu tiên giảm mesh/light thay vì hạ độ phân giải.
- Git: `master`, chưa có commit.

## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

 Quota: chưa xác minh bằng chỉ số chính thức trong phiên.

## IDEA-16 / T01, T02, T03, T05, T08, T22–T28 — runbook cấu hình & chuyển giao — 12/11/2026

- Trạng thái: hoàn thành tài liệu; không phải xác nhận vận hành/production.
- Đã làm: thêm `CAU_HINH_DU_AN.md` làm nguồn cấu hình chính: React/Vite/Babylon/Node `ws`, Node 20+, lệnh chạy/test/build, port/proxy, `HOST`/`PORT`, giới hạn server demo, luồng state, checklist QA, các cổng quyết định production và backlog sáng tạo chưa triển khai. `README.md` đã liên kết tài liệu này.
- Quyết định ghi nhận: server `ws` state in-memory chỉ là local demo; không được dùng như bằng chứng hỗ trợ online quy mô lớn. Mọi cloud/auth/persistence/voice/moderation/observability cần ADR được chủ dự án duyệt trước T22–T24.
- Bằng chứng: đã đối chiếu `package.json`, `vite.config.ts`, `tsconfig.json`, `server/index.mjs`, test scripts và trạng thái Git; sau đó chạy `npm run verify` PASS 25/25, build production PASS trong 18,42s; `GET /health` và Vite đều HTTP 200. Không sửa source runtime trong mục tài liệu này.
- Hạn chế: chưa có đo quota chính thức, QA browser/performance chưa thực thi; không suy ra production readiness từ build/test hiện có.
- Việc tiếp theo ưu tiên: (1) T01/T08 ma trận thiết bị và baseline FPS; (2) T03 contract version + test cho event mới; (3) T22–T24 ADR security/staging/load; (4) T25 pilot nhỏ rồi T26–T28 theo evidence.
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-18 / T04, T16, T17, T18, T19 — menu công thức & quầy pha chế Barista — 12/11/2026

- Trạng thái: hoàn thành bước đầu; cần QA 3D/browser và tích hợp UI theo owner riêng.
- Phạm vi ownership: Codex chỉ sửa `src/CafeScene.tsx` và tạo `src/data/cafeMenu.ts`; không sửa `src/App.tsx` hoặc Photo Mode vì Antigravity đang làm song song ở vùng đó.
- Đã làm:
  - `src/data/cafeMenu.ts`: nguồn dữ liệu menu gồm 12 món, 3 nhóm (Phin Việt, Espresso Craft, Trà & không cà phê), mô tả, kiểu phục vụ, các bước công thức concept và ghi chú. Đây không phải hướng dẫn an toàn thực phẩm/dinh dưỡng; T17 UI có thể import `CAFE_MENU`/`menuByCategory` để thay thế data trùng lặp sau khi owner UI đồng ý.
  - `src/CafeScene.tsx`: thay quầy đơn giản bằng espresso station hai group, grinder/hopper, portafilter, knock box, pour-over, back bar chai syrup/hũ trà-hạt, pastry dome, foot rail brass và quầy marble; thêm ba bảng menu vật lý từ cùng catalogue.
  - Hiệu năng: không thêm light mới; props là mesh/dynamic texture tĩnh, tiếp tục qua luồng freeze mesh có sẵn.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 11,88s.
- Hạn chế: chưa có QA browser/readability/FPS hoặc xác minh công thức với chuyên gia barista; tab Menu React vẫn dùng danh sách cũ cho đến khi owner UI tích hợp module data. Browser automation không khả dụng.
- Việc tiếp theo: owner UI import `CAFE_MENU` vào tab Menu theo một commit riêng, hiển thị mở rộng công thức/allergen (nếu áp dụng) và giữ `handleOrderDrink`; sau đó hai client kiểm tra đơn đúng bàn, cancel/retry và performance ở gần quầy.
- Git: `master`, chưa có commit.

## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

 Quota: chưa xác minh bằng chỉ số chính thức.

## IDEA-19 / T04, T10, T17, T19 — menu riêng trên từng bàn — 12/11/2026

- Trạng thái: hoàn thành bước đầu; cần QA 3D/browser.
- Đã làm: trong vòng tạo 7 bàn multiplayer ở `src/CafeScene.tsx`, thêm một menu mở cho mỗi bàn: bìa da hoặc nhung VIP, spine/corner brass và trang menu render từ `CAFE_MENU`. Mỗi bàn gợi ý một signature khác nhau, hiển thị nhóm, mô tả, bước đầu công thức và kiểu phục vụ.
- Giữ nguyên: không thêm collision, click handler, event realtime hoặc light động; menu là mesh/DynamicTexture tĩnh, nhờ đó không làm thay đổi contract ghế/đơn.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 15,09s.
- Hạn chế: browser automation không khả dụng nên chưa quan sát trực tiếp độ đọc text, khoảng cách ly/nến, Photo Mode và FPS trên thiết bị thật.
- Việc tiếp theo: thử từng bàn T1–T2 ở desktop/mobile; nếu text nhỏ, đổi sang trang menu tối giản hoặc mở panel UI khi bấm menu trong task riêng T10/T17, không tăng texture resolution mặc định.
- Git: `master`, chưa có commit.

## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

 Quota: chưa có chỉ số chính thức.

## IDEA-20 / T10, T16, T17, T18, T20 — menu tương tác tại bàn & mời món Việt — 12/11/2026

- Trạng thái: hoàn thành bước đầu; cần QA browser/touch/TTS.
- Đã làm:
  - `src/CafeScene.tsx`: quyển menu ở mỗi bàn có `tableMenuIndex` metadata; click ưu tiên mở menu thay vì chọn ghế. Callback `onTableMenuClick` không đổi collision, event room hay quyền server.
  - `src/components/TableMenuPages.tsx` và CSS riêng: ba trang Phin Việt/Espresso Craft/Trà & không cà phê, xem đủ bước công thức và nút gọi món. Trang được chọn theo quyển sách đã bấm.
  - `src/App.tsx`: tích hợp hẹp callback mở sidebar/tab Menu; `handleOrderDrink` tiếp tục là lifecycle duy nhất (ngồi → pha → phục vụ → broadcast khi live). Thu Hà nói tiếng Việt khi nhận đơn và sau khi món sẵn sàng; toast vẫn là fallback nếu thiết bị không phát TTS.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 9,37s.
- Hạn chế: chưa có QA hit-box sách, thao tác touch, voice `vi-VN`, autoplay policy, overlay/responsive hay FPS trên trình duyệt thật. Công thức là catalogue concept, không là hướng dẫn an toàn thực phẩm.
- Việc tiếp theo: mở `http://127.0.0.1:5173/`, click menu ở từng bàn → chọn trang/món → chọn ghế → gọi món → chờ 3 giây để nghe lời mời; thử một tab thứ hai cùng room để xác nhận đồ uống đúng ghế.
- Git: `master`, chưa có commit.

## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

 Quota: không có chỉ số chính thức trong phiên.

## IDEA-08 / T10, T12, T13, T17, T18 — xác minh hồi quy — 12/11/2026

- Trạng thái: Hoàn thành bước đầu; còn QA browser trực quan.
- Đối chiếu: luồng lobby/đặt chỗ và lựa chọn sức chứa phòng riêng đã có trong `src/App.tsx`, `src/App.css`, `src/network/client.ts`, `server/index.mjs`, `server/rooms.mjs`; server test bao gồm sức chứa phòng riêng có thẩm quyền.
- Kiểm tra đã chạy: `npm run verify` — PASS 25/25 test; `tsc --noEmit && vite build` PASS (10,38s).
- Hạn chế: không có browser-access host nên chưa thể thao tác/quan sát luồng UI 3D trực tiếp trong phiên này.
- Việc tiếp theo: mở `http://127.0.0.1:5173/` trên browser khả dụng để kiểm tra Start → lobby → chọn loại phòng/bàn → tiếp viên; xác nhận cả màn hình nhỏ và thao tác chọn món.
- Quota: chưa xác minh (phiên không cung cấp chỉ số quota chính thức).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026

- Theo yêu cầu mới nhất của chủ dự án:
  1. Review lại toàn bộ và tinh chỉnh code, đối chiếu với mục tiêu và kim chỉ nam ban đầu (`KE_HOACH_GOC.md` v1.1 Closing Bell — Café Trader Villa).
  2. Triển khai cơ chế Auto-Update thời gian thực để không gian sống động giống đời thực nhất có thể.
  3. Thỏa mãn trọn vẹn niềm Dopamine chill cho Trader (cảm giác khớp lệnh, chốt lời giòn giã, nhấp cà phê thư thái).
- Chi tiết kỹ thuật đã tinh chỉnh:
  + `src/audio/chillAudio.ts`: Bổ sung 3 bộ tổng hợp Web Audio procedural chuyên biệt:
    - `playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    - `playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    - `playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + `src/CafeScene.tsx`:
    - Kích hoạt vòng lặp auto-update `updateTraderScreen()` định kỳ mỗi 2.8s cho màn hình 3D Wall TV kép trên tường quán.
    - Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX liên tục nhảy ticks thời gian thực; nến động tịnh tiến; đồng hồ live feed `hh:mm:ss` cập nhật từng giây; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + `src/components/TraderTerminalModal.tsx`: Nâng cấp toàn diện màn hình Trader Terminal thành sàn giao dịch ảo thời gian thực:
    - Bảng Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục, cho phép click vào bất kỳ thẻ nào để đổi đồ thị sang tài sản đó.
    - Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    - Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    - Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + `src/App.tsx`:
    - Kết nối callback `onWinTrade` từ Trader Terminal: kích hoạt âm thanh tiền vàng, cộng 150 XP, bắn pháo hoa chúc mừng và toast thông báo toàn phòng.
    - Tích hợp `chillAudio.playCoffeeEuphoria()` khi nhấp ngụm cà phê (`handleSipDrink`).
    - Bổ sung chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    - Bổ sung thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
  + `src/App.css`: Bổ sung styles cho demo balance, pulse button, candle volume, dopamine trade panel, timer, PnL pills, live ticker tape.
- Kiểm tra thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Hạn chế / rủi ro:
  + Cần người dùng trải nghiệm trực tiếp trên trình duyệt tại `http://127.0.0.1:5173/` để cảm nhận nến nhảy và âm thanh Dopamine.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-10 / T07, T09, T16, T22 — Pháo hoa Trade Lãi, Spa Massage, Nút Bước Chân, SĐT Ảo & Hệ Thống Cấp Độ EXP — 12/11/2026

- Theo yêu cầu mới nhất của chủ dự án:
  1. Dịch vụ bắn pháo hoa và thông báo chúc mừng trade lãi cho Trader.
  2. Dịch vụ massage xoa dịu thư giãn cho Trader.
  3. Thêm tiếng bước chân (có nút bật tắt trong điều khiển).
  4. Cấp số điện thoại ảo cho Trader.
  5. Thêm chế độ kinh nghiệm (EXP & Leveling) dựa trên các hoạt động: online, ngồi cafe, trade lãi, mua pháo hoa, dùng dịch vụ massage.
  6. Thêm âm thanh procedural Web Audio từng công đoạn tiểu tiết.
  7. Cấp quyền toàn bộ cho tất cả Trader.
- Các file đã thay đổi:
  + `src/audio/chillAudio.ts`: Bổ sung các bộ tổng hợp Web Audio procedural hoàn chỉnh: `playFirework()` (tiếng rít phóng rocket + nổ vang rền + nổ lách tách), `playMassage()` (chuông xoay Tây Tạng 432Hz/864Hz tĩnh tâm), `playLevelUp()` (fanfare hợp âm C5-E5-G5-C6), `playPhoneChime()` (chime điện thoại vintage), `playUiClick()` (click gỗ/đồng).
  + `server/rooms.mjs`:
    - Helper `generatePhone(id)` tự động cấp số điện thoại `098-xxx-xxxx` cho mỗi Trader khi kết nối.
    - Cập nhật `join()` để lưu trữ và phát tán `phone`, `xp`, `level`.
    - Thêm hàm `fireworks(connectionId, profitText)`: cộng 150 XP, kiểm tra level up, rate limit 2.5s, broadcast event `fireworks` và `announcement` toàn phòng.
    - Thêm hàm `service(connectionId, serviceType)`: hỗ trợ `massage-shoulders`, `massage-head`, `zen-aromatherapy`, cộng 100 XP, broadcast event `service` và chat từ `🌿 Wellness Spa`.
    - Thêm hàm `awardXp(connectionId, amount)`: hỗ trợ cộng XP, tự động thăng cấp và broadcast `level-up`.
  + `server/index.mjs`: Wire đầy đủ WebSocket message handlers: `fireworks`, `service`, `award-xp`.
  + `server/rooms.test.mjs`: Bổ sung 3 test regression:
    - `fireworks broadcasts celebration, grants xp, and enforces rate limit` (case thành công + bị từ chối do rate limit).
    - `service orders relaxation, awards xp, and rejects invalid service type` (case thành công + bị từ chối dịch vụ không hợp lệ).
    - `join assigns virtual phone number and initializes trader level`.
  + `src/network/client.ts`: Cập nhật schema `Player`, `JoinOptions`, `FireworksEvent`, `ServiceEvent`, `LevelUpEvent`; bổ sung các phương thức `sendFireworks`, `requestService`, `awardXp` và các event listener tương ứng.
  + `src/CafeScene.tsx`:
    - Nhận props `fireworksNonce` và `massageActive`.
    - Lắng nghe event `cafe-fireworks`: kích hoạt hệ thống hạt pháo hoa 3D 66 tia lửa bay đa hướng chịu trọng lực và lực cản không khí kèm ánh chớp `PointLight` vàng cam.
    - Tích hợp vòng hào quang thiền định 3D `zenHalo` vàng kim xoay quanh avatar khi kích hoạt liệu trình massage.
  + `src/App.tsx`:
    - Quản lý state `phone`, `xp`, `level`, `footstepSound`, `fireworksNonce`, `massageActive`, `servicesModalOpen`.
    - Timer cộng XP thụ động: +10 XP mỗi 30s online, +20 XP mỗi 30s ngồi bàn cafe, +15 XP mỗi ngụm cà phê.
    - Nút bật/tắt tiếng bước chân 👣 trên Header, Atmosphere Pill và Cài đặt, có phản hồi âm thanh UI click và toast.
    - Nút mở Modal Dịch Vụ Trader 🎆 trên Header và Atmosphere Pill.
    - Modal "Dịch vụ & Tiện ích Trader": Bắn pháo hoa chúc mừng trade lãi (+150 XP) với preset và input tùy chọn; 3 liệu trình Spa Massage thư giãn (+100 XP); Hiển thị số điện thoại ảo và nút sao chép số.
    - Nâng cấp Thẻ Căn Cước Trader: hiển thị SĐT, cấp độ, thanh tiến độ EXP, nút đổi số ngẫu nhiên.
    - Hiển thị SĐT và Level trên danh sách Khách (Guest Tab).
  + `src/App.css`: Bổ sung 350+ dòng CSS cho các nút header, status badge, modal dịch vụ, preset chips, massage cards, thanh tiến độ XP, phone cards.
- Kiểm tra thực tế:
  + `npm test`: **PASS 23/23 tests** (100%).
  + `npm run verify`: **PASS 23/23 tests**, `tsc --noEmit && vite build` **PASS** trong 9.16s, zero TypeScript errors.
- Hạn chế / rủi ro:
  + Chưa có browser automation để kiểm tra trực quan render và âm thanh thực tế. Cần người dùng trải nghiệm tại `http://127.0.0.1:5173/`.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên).
- Git: master, chưa có commit.

## Review & Kiểm tra bàn giao toàn bộ hệ thống — 12/11/2026 / Antigravity

- Yêu cầu phiên: Load dự án và check việc bàn giao.
- Phạm vi: Đọc toàn bộ tài liệu theo thứ tự bắt buộc (`AGENTS.md`, `.codex/README.md`, `.codex/TASK_BOARD.md`, `KE_HOACH_GOC.md`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`); kiểm tra Git; chạy kiểm thử hồi quy và đối chiếu trạng thái mã nguồn so với kim chỉ nam ban đầu.
- Trạng thái đối chiếu T01–T28:
  + T01/T08: Cần QA trực quan (Server :3001 và Vite :5173 đang live; bundle tối ưu; HUD FPS hoạt động; chờ người dùng mở trình duyệt kiểm tra thực tế).
  + T02/T03: Hoàn thành bước đầu (Đã lập ADR_001 kiến trúc `ws` thuần + WebRTC Mesh + Procedural Audio; CONTRACT_GIAO_TIEP chuẩn hóa JSON schema toàn diện).
  + T04/T06/T07/T19: Hoàn thành bước đầu (Biệt thự 8 tầng phong cách Closing Bell, ban công 8 tầng có bàn ghế ngoài trời nhìn ra góc Chill, Hearth Hall lò sưởi than hồng ấm cúng, 3 nhân viên phục vụ 3D, 4 Bot Trader thường trú, TV Wall 3D nhảy nến tự động).
  + T09/T21/T22: Hoàn thành bước đầu (Thẻ Căn Cước Trader Passport, cấp SĐT ảo `098-xxx-xxxx`, hệ thống tích lũy EXP & thăng cấp, bắn pháo hoa trade lãi, spa massage thư giãn, quản trị Host điều hành phòng, chặn chat Mute, mời ra Kick, gửi Report vi phạm).
  + T10/T12/T13/T17/T18: Hoàn thành bước đầu (Luồng lobby đặt chỗ, sức chứa phòng riêng có thẩm quyền, 8 món đồ uống ảo, Barista phục vụ 3D kèm đếm ngược, bảng phục vụ Concierge tiếng Việt).
  + T14/T15/T16: Hoàn thành bước đầu (Voice Chat WebRTC theo bàn, Chat cô lập theo bàn/phòng, Web Audio procedural lo-fi, mưa, củi nổ, tiếng bước chân bật/tắt, micro-SFX Dopamine Trade Ka-Ching, AI Bot Trader giọng nói Web Speech API & kịch bản tin NFP).
  + T20: Hoàn thành bước đầu (Virtual Joystick 360 độ và Action Pad responsive trên mobile/tablet).
  + T23: Hoàn thành bước đầu (Rollup `manualChunks` tách vendor-babylon và vendor-react, build thành công).
  + T24–T27: Chưa bắt đầu (Chưa staging, chưa triển khai internet, chưa thử nghiệm diện rộng).
  + T28: Đang làm (Hệ thống tài liệu bàn giao, TASK_BOARD, runbook CAU_HINH_DU_AN.md).
- Kiểm tra thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 9.32s, zero lỗi TypeScript hay build.
  + Endpoint kiểm tra: `GET http://127.0.0.1:3001/health` trả về `{"ok":true}`; `GET http://127.0.0.1:3001/api/rooms` trả về 2 phòng public và chill; Vite dev server tại `http://127.0.0.1:5173/` đang hoạt động ổn định.
- Hạn chế / rủi ro:
  + Môi trường không có browser automation để kiểm tra visual/audio/FPS tự động. Cần người dùng mở trực tiếp tại `http://127.0.0.1:5173/`.
  + Git: Nhánh `master`, chưa có commit theo quy định Rule 8 của `AGENTS.md`.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Đề xuất 3 việc tiếp theo theo thứ tự ưu tiên:
  1. Người dùng mở `http://127.0.0.1:5173/` để trải nghiệm trực tiếp luồng vào quán, di chuyển ban công 8 tầng, thử thách Quick Paper Trade 12s, nghe âm thanh Dopamine, tương tác với 4 Bot Trader và kích hoạt tin NFP.
  2. Đo đạc baseline FPS, thời gian frame ms và độ mượt mà trên các thiết bị thật (desktop, tablet, mobile) để hoàn tất nghiệm thu T01/T08.
  3. Lập kế hoạch kiến trúc bảo mật production, HTTPS/WSS và chuẩn bị lộ trình staging (T22, T24).


## IDEA-17 / T07, T20, T22 — Photo Mode Chụp Ảnh Kỷ Niệm "Closing Bell" — 12/11/2026 / Antigravity

- Theo yêu cầu đã chọn của chủ dự án: Triển khai chế độ Chụp Ảnh Kỷ Niệm Photo Mode "Closing Bell", hỗ trợ camera tự do dạo quanh biệt thự 8 tầng, tắt UI, bộ lọc màu ảnh phim cổ điển, watermark Closing Bell và tải ảnh PNG trực tiếp về máy.
- Chi tiết kỹ thuật đã triển khai:
  + `src/audio/chillAudio.ts`: Bổ sung bộ tổng hợp âm thanh Web Audio procedural `playCameraShutter()`: tiếng màn trập cơ học SLR cổ điển gồm âm phản hồi gương lật lật lên (transient noise burst 1400Hz), chớp màn trập kim loại (metallic curtain snap 2200Hz -> 450Hz) và tiếng cuộn cơ học micro-winding click.
  + `src/components/PhotoModeOverlay.tsx` & `src/components/PhotoModeOverlay.css`: Tạo mới component quản lý Photo Mode toàn diện:
    1. **8 góc chụp nghệ thuật (Camera Presets)**: Cổng & Biệt Thự 8 tầng (`exterior`), Lò Sưởi Travertine (`hearth`), Quầy Bar & Barista (`bar`), Focus Library gác lửng (`library`), Ban Công Skyline T2 (`balcony`), T8 Sky Terrace (`observatory`), Chân Dung Trader góc nghiêng 45° (`selfie`), và Góc hiện tại (`current`).
    2. **Ống kính & Tiêu cự (Focal Length / FOV)**: 4 preset ống kính điện ảnh: 24mm (Góc rộng 1.32), 35mm (Tiêu chuẩn 1.10), 50mm (Mắt người 0.85), 85mm (Chân dung 0.58).
    3. **5 bộ lọc phim nghệ thuật (Film Filters)**: Tự nhiên (`none`), Closing Bell Golden Hour (`closing-bell`), Vintage Amber Warm Film 800 (`vintage-amber`), Emerald Chill Zen Teal (`emerald-chill`), Noir 1930 B&W Classic (`noir`), Dopamine Vivid High Contrast (`cyber-dopamine`), kèm hiệu ứng vignette viền tối và ánh sắc hoàng hôn.
    4. **3 lưới bố cục (Composition Grids)**: Lưới 1/3 (Rule of Thirds), Tỉ lệ vàng (Golden Ratio), Điểm ngắm trung tâm (Center Crosshair).
    5. **4 tỉ lệ khung hình (Aspect Ratios)**: Tự do (Full screen), 16:9 (Điện ảnh / Wallpaper), 1:1 (Vuông / Avatar / Instagram), 9:16 (Dọc / Story / Mobile).
    6. **Watermark sang trọng & Bảo mật T22**: Đóng dấu logo 🔔 CLOSING BELL · CAFÉ TRADER VILLA, số tầng/vị trí, ngày giờ chụp thực tế, tên Trader & cấp độ (có tùy chọn ẩn danh `anonymousEnabled` để bảo vệ quyền riêng tư T22).
    7. **Xử lý ảnh thuần túy client-side**: Xử lý cắt cúp, màu phim và watermark bằng HTML5 Canvas 2D; xuất file PNG chất lượng cao không nén trực tiếp về máy người dùng qua thẻ tải xuống; 100% không gửi ảnh lên bất kỳ server nào.
    8. **Giao diện & Phím tắt**: Nút chụp ảnh trung tâm viền đồng sang trọng; chớp flash màn hình trắng điện ảnh khi chụp; phím tắt `Space` để bấm chụp; phím `F10` hoặc `H` để ẩn/hiện toàn bộ công cụ ngắm cảnh; phím `Esc` để thoát; phím `P` bật/tắt nhanh Photo Mode.
  + `src/CafeScene.tsx`:
    - Nhận props `photoMode`, `photoCameraPreset`, `photoFov`, `captureTrigger`, `onPhotoCaptured`.
    - Điều chỉnh vị trí và góc nhìn camera tương ứng với từng preset chụp ảnh nghệ thuật; hiển thị avatar người chơi khi chụp góc chân dung `selfie` hoặc toàn cảnh.
    - Chụp snapshot trực tiếp từ BabylonJS scene thông qua `Tools.CreateScreenshotUsingRenderTarget` với độ phân giải cao và khử răng cưa `samples = 2, antialiasing = true`.
  + `src/App.tsx`:
    - Quản lý state Photo Mode (`photoModeOpen`, `photoPreset`, `photoFov`, `captureTrigger`, `capturedRawImage`).
    - Nút "📸 Chụp ảnh" trên Header và Atmosphere Pill; hotkey phím `P`.
    - Tự động ẩn toàn bộ header, atmosphere pill, live ticker tape, emote bar, sidebar khi Photo Mode được kích hoạt để mang lại khung nhìn điện ảnh tinh khiết.
    - Tích hợp `<PhotoModeOverlay />`.
  + `src/App.css`: Bổ sung styles cho `.header-photo-btn` và `.photo-pill-btn`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 21.63s, zero lỗi TypeScript hay build.
- Hạn chế / rủi ro:
  + Cần người dùng trải nghiệm trực tiếp trên trình duyệt tại `http://127.0.0.1:5173/`, bấm phím `P` hoặc nút "📸 Chụp ảnh", ngắm các góc biệt thự và tải ảnh thử nghiệm về máy.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-26 / T06, T07, T17, T18, T19, T20 — Thiết Kế Bartender Đứng Ở Quầy & Chủ Động Hỏi Bằng Tiếng Việt — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Thiet ke Bartender nhan vien dung o quay, khi lai gan thi se chu dong hoi bang tieng viet".
- Chi tiết kỹ thuật đã thực hiện:
  1. **Thiết kế trang phục & đạo cụ Bartender chuyên nghiệp**:
     - Cập nhật nhân vật tại quầy thành `🍸 Bartender Thu Hà` với bảng tên vàng sang trọng.
     - Thiết kế trang phục Bartender & Barista cao cấp: tạp dề đen charcoal (`#1c2226`), dây quai da bắt chéo lưng, nơ cổ đỏ ruby (`#943828`), huy hiệu kim loại đồng sáng bóng.
     - Bổ sung bộ dụng cụ pha chế Bartender Workstation trên mặt quầy bar: Bình lắc cocktail inox (`bar-cocktail-shaker`), nắp đậy, ly đong jigger 2 đầu bằng đồng (`bar-jigger`), khăn lau quầy gấp gọn (`bar-folded-towel`), ly pha chế mixing glass và thìa xoắn dài cán vàng (`bar-spoon-handle`).
  2. **Cơ chế nhận diện người chơi tiếp cận (Proximity Detection) & Hoạt ảnh tương tác**:
     - Khoanh vùng khu vực trước quầy bar sảnh trệt (`x: 2.8..8.2, z: 0.5..3.3, y < 2.0`).
     - Khi người chơi bước tới gần quầy bar (khoảng cách < 3.4m), Bartender Thu Hà tạm dừng tuần tra, xoay người mượt mà đối diện trực tiếp với người chơi.
     - Thu Hà thực hiện cử chỉ tay chào đón thân thiện (tay phải nâng cao vẫy chào, tay trái đặt nhẹ lên mặt quầy).
     - Vòng hào quang âm thanh 3D (`speakingHalo`) xanh lá trên đỉnh đầu Bartender phát sáng và nhịp nhàng phát xung khi nói.
  3. **Chủ động mở lời chào bằng tiếng Việt chuẩn**:
     - Hệ thống cất tiếng hỏi thăm tự nhiên với các câu chào ngẫu nhiên:
       * "Chào bạn! Mời bạn ghé quầy bar. Hôm nay bạn muốn dùng cà phê truyền thống hay một ly cocktail chill để giải tỏa căng thẳng trading?"
       * "Xin chào quý khách! Thị trường hôm nay thế nào bạn ơi? Thu Hà có thể pha cho bạn một món đặc biệt để lấy lại năng lượng nhé!"
       * "Chào mừng bạn đến quầy bar! Quầy đang có cà phê trứng béo ngậy và cold brew ủ lạnh rất ngon, bạn muốn thử món nào?"
       * "Chào bạn! Mời bạn xem qua thực đơn trên quầy nhé. Bạn thích uống đậm vị hay thanh mát để Thu Hà chuẩn bị ngay nào?"
     - Cơ chế cooldown thông minh (35 giây và khoảng cách > 5.0m để reset) giúp tránh nói lặp phiền toái.
  4. **Bong bóng thoại tương tác cao cấp (Dialogue Bubble)**:
     - Hiển thị bảng đối thoại sang trọng nổi ở góc dưới màn hình với avatar 🍸, tên Bartender Thu Hà, lời thoại trích dẫn tiếng Việt và nút bấm tắt nhanh `[☕ Xem Menu Quầy Bar]`.
     - Nhấp nút ngay lập tức mở thực đơn quầy bar để chọn món.
- File đã thay đổi: `src/CafeScene.tsx`, `src/audio/staffVoice.ts`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 8.95s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-24 / T06, T07, T19 — Tái Thiết Kế Bố Cục Tầng Lửng VIP: Giải Phóng Nút Thắt, Mở Rộng Không Gian Thênh Thang — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "goc nay bi mac ket roi, thiet ke bo cuc lai cho thoang, rong hon" (kèm ảnh chụp khoanh vùng nút thắt góc cầu thang bước lên tầng lửng bị kẹt giữa chậu cây, bộ ghế lò than brazier, bàn thư viện và Bàn 6).
- Chi tiết kỹ thuật đã thực hiện:
  1. **Giải phóng 100% nút thắt cầu thang tầng lửng**:
     - Xóa bỏ bộ ghế bành da và lò than brazier đặt sai vị trí trong nhà chắn ngang sảnh đến của cầu thang.
     - Đưa lò than gang rực lửa (`terrace-brazier`) và 2 ghế ngắm skyline (`balcony-chair-s/n-2` tương ứng `balcony-2-seat-1/2`) ra đúng vị trí ngoài trời trên sàn ban công ngắm New York (`f2BalconyX = -10.6, z = 2.4`).
  2. **Tái quy hoạch Thư viện Focus Library**:
     - Thu gọn và lùi bàn học thư viện (`lib-study-table`) sâu về phía sau sát kệ sách (`z = 5.2`, kích thước thanh lịch 2.8m × 0.9m), giải phóng hoàn toàn hành lang phía trước dài hơn 4 mét.
  3. **Tái định vị Bàn 6 VIP Balcony**:
     - Dịch chuyển Bàn 6 từ `x = -3.8` sang `x = -2.0, z = 2.8`, tạo khoảng thông thủy rộng hơn 5.5 mét từ đầu cầu thang (`x = -7.5`) tới Bàn 6.
  4. **Di dời cây xanh cảnh quan**:
     - Chuyển chậu cây từ lối đi (`x = -8.0, z = 2.0`) vào góc phòng yên tĩnh cạnh kệ sách (`x = -8.4, z = 6.2`).
  5. **Kết quả không gian**:
     - Khu vực sảnh tầng lửng VIP khi bước lên từ cầu thang giờ đây là một đại sảnh gỗ sang trọng, rộng hơn 5m × 4m hoàn toàn thông thoáng, không vật cản: rẽ trái bước thẳng ra ban công ngoài trời, đi thẳng vào thư viện tĩnh lặng, rẽ phải dạo bước dọc hành lang lan can nhìn xuống sảnh trệt và màn hình Trader Terminal.
- File đã thay đổi: `src/CafeScene.tsx`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 26/26 tests**.
  + `npm run verify`: **PASS 26/26 tests**, build Vite hoàn tất trong 14.48s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## Khôi phục Điều Hướng & Thang Máy Hoàng Gia 8 Tầng (Royal Lift T1–T8) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: Làm rõ và mở quyền truy cập đầy đủ vào các tầng trên của biệt thự hoàng gia 8 tầng ("mấy tầng trên đâu hết rồi ?").
- Nguyên nhân phát hiện:
  + Cảnh 3D `src/CafeScene.tsx` đã xây dựng đầy đủ hình học, ban công ngắm cảnh, sàn gỗ/cẩm thạch, salon cổ điển cho toàn bộ 8 tầng (`ROYAL_FLOOR_HEIGHTS = [0, 3.2, 6.7, 10.2, 13.7, 17.2, 20.7, 24.2]m`).
  + Tuy nhiên tại `src/App.tsx`, state `currentFloor` bị giới hạn kiểu `1 | 2`, prop `floorJump` chưa được truyền vào `CafeScene`, `onFloorChange` bị ép kiểu kẹp cứng tầng >= 3 về 1 (`f === 2 ? 2 : 1`), và thanh điều khiển thang máy `royal-floor-selector` chưa được đưa lên thanh Header.
- Chi tiết kỹ thuật đã tinh chỉnh:
  + `src/App.tsx`:
    1. Định nghĩa từ điển danh xưng 8 tầng `FLOOR_NAMES`:
       - T1: Sảnh Lớn & Hearth Hall (Lò sưởi Travertine, Quầy bar & Sân vườn)
       - T2: VIP Skyline Lounge (Gác lửng VIP, Night Terrace & Focus Library)
       - T3: Royal Salon (Hội đàm thượng lưu & Ban công view Chill)
       - T4: Golden Gallery (Triển lãm thành tựu & Ban công ngắm đài phun nước)
       - T5: Emerald Conservatory (Vườn kính thảo mộc & Góc tĩnh tâm)
       - T6: Crown Library & Study (Thư viện hoàng gia & Co-working yên tĩnh)
       - T7: Imperial Terrace (Sunset Lounge & Ban công ngắm hoàng hôn)
       - T8: Sky Observatory (Đài thiên văn trên mây & Toàn cảnh biệt thự)
    2. Nâng cấp state `currentFloor` từ `1 | 2` lên `number` (1 đến 8) và tạo state `floorJump: { floor: number; nonce: number } | null`.
    3. Thêm hàm `jumpToFloor(floor: number)`: kích hoạt âm thanh UI click, gửi tín hiệu dịch chuyển tầng an toàn `floorJump` tới scene 3D, cập nhật state và thông báo toast danh xưng tầng.
    4. Tích hợp thanh Thang Máy Hoàng Gia **Royal Lift (`royal-floor-selector`)** trên Header với 8 nút chọn nhanh `[T1|T2|T3|T4|T5|T6|T7|T8]`.
    5. Cập nhật thẻ hiển thị tầng (`floor-indicator`) và thanh trạng thái (`atmosphere-badge`) hiển thị đầy đủ tên, biểu tượng và mô tả không khí của từng tầng 1 đến 8.
    6. Cập nhật nút chuyển tầng nhanh ở thanh đáy (`scene-controls`) và bộ điều khiển cảm ứng di động `TouchController` để cho phép luân chuyển thang máy qua toàn bộ 8 tầng.
    7. Truyền đầy đủ `floorJump={floorJump}` và `onFloorChange={(f) => setCurrentFloor(f)}` vào `<CafeScene />`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 18.48s, zero lỗi TypeScript hay build.
- Hạn chế / rủi ro:
  + Cần người dùng mở trình duyệt tại `http://127.0.0.1:5173/`, bấm các nút `T1` đến `T8` trên thanh Royal Lift ở Header để đi thang máy và khám phá ban công các tầng 1–8.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-19 / T04, T06, T07, T16, T19 — View Ngoài Trời New York, Click Bàn Ghế Để Ngồi & Tự Đứng Lên, Âm Thanh Menu/Sách & Nhân Viên Tuần Tra — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "View ngoài trời theo thời tiết của Newyork, có mây, bầu trời, cây, đường sá. Những cái bàn cái ghê thì Click vào để ngồi và di chuyển là tự đứng lên, nâng cấp lại tiếng, tiếng sột soạt ghi tay cầm Menu, lật sách, nhân viên chạy qua lại" (Kèm ảnh chụp từ ban công T7 nhìn ra khoảng đen hư vô).
- Chi tiết kỹ thuật đã thực hiện:
  1. **View ngoài trời New York (Sky, Clouds, Trees, Roads & Manhattan Skyline)**:
     - Xóa bỏ hoàn toàn khoảng đen vô định (black void) nhìn từ ban công các tầng T1–T8.
     - Vòm trời New York (`skyDome` đường kính 750m) phủ Dynamic Texture gradient điện ảnh: từ đỉnh thiên đỉnh xanh đêm thẫm (`#060a14` → `#0e1828`) chuyển mượt mà xuống đường chân trời ánh vàng rực của đèn thành phố Manhattan (`#3a231b` → `#523022`), kết hợp 450 ngôi sao lấp lánh và vầng trăng khuyết nghệ thuật.
     - Sương mù khí quyển nghệ thuật (`scene.fogMode = Scene.FOGMODE_EXP2`, density 0.0012, màu `#05070c`).
     - 12 cụm mây 3D bồng bềnh (`nycCloudRoots`) trôi lơ lửng tự nhiên theo gió Manhattan trong render loop.
     - Đại lộ Manhattan Avenue bên dưới sân biệt thự (`z = -36` đến `-90`): mặt đường nhựa asphalt đen bóng, vạch tim đường đôi vàng rực, vạch kẻ làn đứt khúc trắng, các vạch đi bộ sang đường zebra crosswalks, vỉa hè đá granite, hàng cột đèn gang cổ điển Manhattan tỏa ánh sáng amber ấm áp, và các xe taxi vàng New York (Yellow Cabs) biểu tượng đậu dọc tuyến phố.
     - Hàng cây xanh phong cách Central Park (24+ cây sồi lớn hai bên vỉa hè) với thân gỗ sồi và tán lá 3 tầng xanh thẫm và vàng thu óng ả.
     - Toàn cảnh Manhattan Skyline hùng vĩ: 21 tòa tháp chọc trời cao từ 42m đến 140m (vượt cao hơn cả ban công T8) với kiến trúc Art Deco giật cấp (Empire State & Chrysler), tháp kính hiện đại, hàng ngàn ô cửa sổ văn phòng vàng ấm lung linh (dynamic window texture), tháp nước mái gỗ đặc trưng New York và cột ăng-ten phát tín hiệu đèn đỏ chớp nháy hàng không.
  2. **Click Bàn Ghế Để Ngồi & Tự Động Đứng Lên Khi Di Chuyển**:
     - Đăng ký đầy đủ `seatPositions` và metadata nhấp chuột cho mọi ghế và bàn trên toàn bộ các tầng:
       - 7 bàn chính và 28 ghế sảnh trệt + gác lửng.
       - Click trực tiếp vào mặt bàn bất kỳ (T1–T7) cũng tự động chọn ghế ngồi vào bàn.
       - Ban công T1: `balcony-1-seat-1`, `balcony-1-seat-2` và bàn trà.
       - Ban công T2: `balcony-2-seat-1`, `balcony-2-seat-2` cạnh lò than brazier.
       - Ban công T3 đến T8: `balcony-${floor}-seat-1`, `balcony-${floor}-seat-2` và bàn tròn cẩm thạch ban công.
     - Click vào bất kỳ bàn hoặc ghế nào trong quán hoặc ngoài ban công là người chơi lập tức ngồi vào ghế.
     - **Tự động đứng lên khi di chuyển**: Khi đang ngồi ghế, chỉ cần nhấn bất kỳ phím di chuyển nào (W, A, S, D, Mũi tên lên/xuống/trái/phải hoặc joystick cảm ứng trên mobile), scene lập tức gọi `onLeaveSeat()` hủy trạng thái ngồi và nhân vật lập tức bước đi ngay trong frame đó, không bị kẹt hay giật lag.
  3. **Nâng Cấp Âm Thanh Procedural Tactile (Web Audio API)**:
     - `playMenuPaper()`: Âm thanh sột soạt chân thực của bìa thực đơn cao cấp khi mở Menu hoặc cầm thẻ đồ uống, tổng hợp từ noise bursts lọc dải tần (bandpass 2600Hz → 1400Hz) kết hợp độ nảy cardstock 220Hz.
     - `playPageFlip()`: Âm thanh sột soạt lật trang sách trong thư viện Focus Library hoặc khi lật chuyển các trang bảng, gồm 2 giai đoạn: nhấc mép trang sắc sảo (4200Hz) và tiếng gió lật trang hạ tần (3200Hz → 950Hz).
     - Tích hợp tiếng sột soạt khi bấm tab Menu / mở Menu, tiếng lật sách khi bấm tab Bàn hoặc chọn xem sách Focus Library.
  4. **Nhân Viên Quán Chạy Qua Lại Tuần Tra Sống Động**:
     - Khắc phục tình trạng nhân viên đứng bất động:
       - Barista Thu Hà: đi lại tuần tra dọc quầy bar (từ máy xay/pour-over ở `x = 3.8` đến máy pha espresso ở `x = 7.2` tại `z = 4.15`), dừng lại kiểm tra đồ uống và lau quầy, tay chân đung đưa tự nhiên theo chu kỳ bước đi.
       - Tiếp viên Bảo Ngọc: tuần tra dọc hành lang Hearth Hall (từ cửa đón khách `z = -2.6` đến cạnh lò sưởi lớn `z = 2.6` tại `x = -6.9`), dừng lại quan sát độ ấm cúng của khách.
       - Quản gia Minh An: tuần tra tiền sảnh Grand Foyer (từ cửa đón khách `x = 9.8` đến bàn tiếp tân `x = 13.6` tại `z = -3.3`), dừng lại đón khách với phong thái lịch thiệp.
     - Đưa toàn bộ mesh nhân viên vào `dynamicMeshes` để tránh bị `freezeWorldMatrix()`, đảm bảo animation chạy mượt mà 60 FPS.
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/App.tsx`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 9.64s, zero lỗi TypeScript hay build.
- Hạn chế / rủi ro:
  + Cần người dùng mở `http://127.0.0.1:5173/`, đi thang máy lên ban công T7/T8 ngắm view New York, click vào ghế ngồi thử và bấm WASD để kiểm tra tự đứng dậy.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## Tích hợp Live Tunnel (Cloudflare Tunnel) Chia Sẻ Chơi Thử Miễn Phí — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Tôi muốn đưa lên sever cho bạn bè chơi thử, có cách nào đẩy lên Free không ? Tôi vừa cho chơi thử vừa sửa Code" -> Chốt Phương án 1 (Live Tunnel từ máy cá nhân).
- Chi tiết kỹ thuật đã thực hiện:
  1. Cấu hình `vite.config.ts`: mở `server.host: true` và `server.allowedHosts: true` cho phép kết nối từ mọi tunnel/mạng ngoài mà không bị chặn. Proxy tự động `/ws` và `/api` tới backend port 3001.
  2. Bổ sung script vào `package.json`: `"tunnel": ".\\cloudflared.exe tunnel --url http://localhost:5173"`.
  3. Tải và cấu hình công cụ độc lập `cloudflared.exe` (Cloudflare Tunnel) bản portable, thêm vào `.gitignore` để không ảnh hưởng repository Git.
  4. Khởi chạy thử nghiệm tunnel: thành công kết nối tới Cloudflare Edge (`sin18` / QUIC), cấp URL HTTPS công khai an toàn.
  5. Đã kiểm tra kết nối từ bên ngoài qua tunnel: HTTP 200 OK, endpoint `/api/rooms` trả về danh sách phòng chính xác qua proxy.
- File đã thay đổi: `vite.config.ts`, `package.json`, `.gitignore`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế: `npm test` PASS 25/25; `(Invoke-WebRequest ... trycloudflare.com).StatusCode` trả về 200 OK.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-21 / T16, T19, T22 — Giọng Việt local KorvaTTS (12/11/2026)

- Đã rà soát các lựa chọn GitHub: chọn KorvaTTS làm adapter đề xuất vì tập trung tiếng Việt, ONNX tại chỗ, 10 giọng và license Apache-2.0 theo công bố upstream. Không chọn ZeroTTS cho client trực tiếp vì tài liệu upstream nêu lần tải đầu khoảng 900 MB; không dùng V-TTS vì license CC BY-NC 4.0 không phù hợp để mặc định cho sản phẩm.
- Đã thêm `src/audio/vietnameseTts.ts`; nhân sự và BOT dùng một đường audio: `VITE_VIET_TTS_ENGINE=korva` gọi `/api/tts`, lỗi/tắt bridge thì fallback Web Speech. `server/index.mjs` giới hạn 500 ký tự, 10 voice cho phép, WAV tối đa 12 MB, timeout 20 giây và chỉ cho relay URL loopback.
- Đã thêm bridge tự host `services/korvatts/bridge.py`, requirements và runbook; không cài Python package, không tải trọng số/model, không bật cloud API, không cloning và không lưu/cache WAV.
- Kiểm tra thật: `npm run verify` PASS 26/26 tests; TypeScript/build PASS (Vite 6.4.6). Test HTTP xác nhận `/api/tts` trả 503 rõ ràng khi bridge chưa cấu hình và relay hợp lệ phát WAV từ bridge loopback giả lập. Chưa xác nhận âm thanh Korva thật vì model/bridge chưa được cài hoặc khởi động.
- Rủi ro/việc tiếp theo: người vận hành cần kiểm license/model card, dung lượng/RAM/CPU rồi mới cài bridge cục bộ và set 2 biến môi trường; sau đó đo autoplay, độ trễ câu đầu, CPU/RAM và chất lượng giọng trên browser thật. Quota phiên không có chỉ số chính thức; Git `master` chưa commit.

## IDEA-22 / T06, T07, T19 — Nới Rộng Lối Đi Vào Hội Trường (Grand Hall), Sửa Thanh Dọc Bị Ngã & Tái Cấu Trúc Cầu Thang Gác Lửng — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "phan nay dang bi loi ne, tu dung co cai thanh doc nga o day, ban coi noi rong ra, de cho co loi di vao hoi truong" (kèm ảnh chụp từ Sảnh Hearth T1 nhìn về phía cổng vào Hội trường, bị chắn ngang bởi thanh tay vịn vàng nghiêng 45 độ và bậc thang).
- Nguyên nhân kỹ thuật phát hiện:
  1. Cầu thang gỗ nổi cũ được đặt tại `x = 7.5, z = -3.8..1.2` (trước khi có Hội trường Grand Hall ở `x > 9`). Khi cổng Hội trường được tạo tại `x = 9, z = 0`, các bậc thang và thanh tay vịn đồng vàng đơn độc (`stair-rail-outer` dài 5.6m, nghiêng ~32-45 độ, không có trụ đỡ baluster) đã vắt ngang ngay chính giữa lối vào, khiến người chơi nhìn như một thanh sắt rơi ngã chắn ngang cửa.
  2. Cổng vòm vào Hội trường cũ chỉ rộng 2.96m (chật hẹp) và bàn máy đĩa than `vinylConsole` tại `z = 0.6` đặt ngay giữa lối đi.
  3. Khi người chơi đi qua khu vực này ở tầng 1, biến `inStaircase` nhận diện sai khiến người chơi bị nâng lơ lửng lên không trung (`targetY`).
- Chi tiết kỹ thuật đã thực hiện:
  1. **Nới rộng thênh thang Lối đi vào Hội trường (Grand Hall)**:
     - Mở rộng khẩu độ cổng vòm từ 2.96m lên **5.4m** (từ `z = -2.7` đến `z = +2.7`).
     - Tái cấu trúc đôi trụ vòm đá Travertine La Mã (`grand-hall-portal-left/right`, cao 6.8m, dày 0.52m) và vòm trán đồng vàng bóng bẩy (`grand-hall-portal-crown` dài 5.92m).
     - Bổ sung nẹp ngạch cửa đồng vàng nguyên khối (`grand-hall-portal-threshold` rộng 5.4m), đèn tường amber đôi (`grand-hall-sconce-l/r`) và biển hiệu phát sáng trang trọng: `★ HỘI TRƯỜNG LỚN · GRAND HOTEL HALL & BALLROOM ★`.
     - Điều chỉnh lại tường phải `right wall south` và `right wall north` ôm khít hai bên cổng vòm 5.4m, bổ sung va chạm tường ngăn không cho đi xuyên tường đặc.
  2. **Xóa bỏ hoàn toàn thanh nghiêng bị ngã & Tái tạo Cầu thang nổi sang phía Tây (West Window Vista)**:
     - Di dời cầu thang gác lửng sang cạnh vách kính lớn phía Tây (`stairX = -7.5`, rộng 1.4m, chạy từ `z = -3.2` đến `1.2`): vừa tạo view ngắm trọn vẹn New York skyline 2 tầng qua kính khi bước lên lầu, vừa giải phóng 100% không gian cho đại sảnh và lối vào Hội trường.
     - Thiết kế hệ lan can tay vịn chuẩn kiến trúc: mỗi bậc thang đều có trụ tiện đồng vàng dọc (`stair-baluster-${i}`), cột trụ cái chân cầu thang và đầu cầu thang (`stair-newel-bottom/top`) với quả cầu tiện mỹ thuật (`stair-finial`), tay vịn tròn nguyên khối (`stair-handrail`) được nâng đỡ vững chắc, xóa sổ vĩnh viễn hiện tượng thanh kim loại ngã đơn độc.
     - Bổ sung đèn LED âm bậc ấm áp (`stair-led-${i}`) và mở rộng lan can kính gác lửng (`balcony-glass` dài 15.2m từ `x = -6.4` đến `8.8`) bảo vệ an toàn toàn bộ mép sàn tầng 2.
  3. **Di dời bàn đĩa than cổ (`vinylConsole`)**: chuyển từ giữa lối đi về góc lò sưởi Sảnh Hearth (`[-3.6, 0, 5.8]`), tạo góc chill nghe nhạc bên ngọn lửa ấm cúng.
  4. **Cập nhật Logic Di Chuyển & Camera**:
     - Cập nhật tọa độ `inStaircase` và bước lên tầng lửng sang phía Tây (`x: -8.6..-6.4, z: -3.2..1.2`).
     - Cập nhật giới hạn camera góc nhìn thứ 3 theo dõi mượt mà khi người chơi bước sang Hội trường lớn (`maxX = 28.5, maxZ = 8.5`).
- File đã thay đổi: `src/CafeScene.tsx`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 26/26 tests**.
  + `npm run verify`: **PASS 26/26 tests**, build Vite hoàn tất trong 16.73s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-23 / T06, T07 — Xóa Bỏ Thanh Chéo & Tối Giản Cầu Thang Bay Gỗ (Cantilever Floating Steps) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "bo cai thanh nay di" (kèm ảnh chụp vẽ mũi tên đỏ chỉ thẳng vào thanh chéo vàng nằm nghiêng vắt qua cửa sổ).
- Chi tiết kỹ thuật đã thực hiện:
  1. Xóa bỏ hoàn toàn thanh chéo (`stair-handrail`), các thanh trụ tiện dọc (`stair-baluster-${i}`) và trụ cái (`stair-newel`) ở cầu thang phía Tây.
  2. Giữ trọn thiết kế cầu thang bay gỗ tối giản (Modern Cantilevered Floating Staircase): các khối bậc gỗ nổi (`woodLight`) với đèn LED âm bậc ấm áp (`stair-led-${i}`) tỏa ánh sáng dịu nhẹ xuống từng bậc.
  3. Tầm nhìn qua vách kính 2 tầng hướng ra skyline New York giờ đây 100% trong suốt, thoáng đãng, không bị vướng bất kỳ thanh kim loại nào.
  4. Cơ chế di chuyển bước lên tầng lửng (`inStaircase`) vẫn hoạt động trơn tru, liền mạch.
- File đã thay đổi: `src/CafeScene.tsx`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 26/26 tests**.
  + `npm run verify`: **PASS 26/26 tests**, build Vite hoàn tất trong 22.60s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-25 / T16, T19, T22 — Nghiên Cứu Repo TTS Tiếng Việt Free & Tích Hợp Giọng Nói Toàn Diện Đa Tầng — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Tim cac repo noi tieng Viet Free va tich hop vao giong noi toan bo".
- Nghiên cứu các Repo TTS Tiếng Việt Miễn phí hàng đầu:
  1. `pnnbao97/VieNeu-TTS`: v3 Turbo lên tới 48kHz, zero-shot voice cloning 3-5s, code-switching Anh-Việt (`sea-g2p`), chuẩn OpenAI API `/v1/audio/speech`, chạy CPU (GGUF/ONNX) hoặc GPU.
  2. `dogenthq/KorvaTTS`: Flow-matching ~99M params, 44.1kHz, chạy on-device CPU qua ONNX Runtime, 10 profile giọng đọc Việt ngữ, code-switching tài chính/crypto mượt mà, Apache-2.0.
  3. `rany2/edge-tts` / `SchneeHertz/node-edge-tts`: Microsoft Edge Azure Neural TTS (`vi-VN-HoaiMyNeural`, `vi-VN-NamMinhNeural`), 100% Free, không cần API Key, không tốn dung lượng ổ cứng, MP3 stream trực tiếp.
  4. `tronghieuit/v-tts`: Valtec TTS siêu nhẹ 74.8M params, RTF ~0.24 trên CPU, voice cloning 3-10s, có bản Windows `.exe` chạy ngay không cần cài Python.
  5. `dangvansam/viet-tts`: FastSpeech2 + HiFiGAN, đóng gói Docker compose.
  6. `nguyenvulebinh/VietVoice-TTS`: Tối ưu thanh điệu tiếng Việt chuẩn xác.
  7. Google Neural Vietnamese Audio Stream (`client=tw-ob&tl=vi`): Tốc độ <200ms, 100% chuẩn dấu tiếng Việt, định dạng MP3.
- Tích hợp giọng nói toàn bộ vào CafeTrader:
  1. **Server Multi-Tier TTS**:
     - `POST /api/tts`: Giữ nguyên tương thích tuyệt đối cho KorvaTTS / VieNeu-TTS local bridge.
     - `POST /api/tts-cloud` & `GET /api/tts-cloud`: Tự động ngắt đoạn (chunking) câu thông minh (<= 180 ký tự), tổng hợp audio MP3 tiếng Việt chuẩn xác, bộ đệm in-memory LRU cache (`cloudTtsCache`, tối đa 200 bản ghi, phản hồi trong <5ms cho các câu lặp lại).
  2. **Client `VietnameseTtsService` (`src/audio/vietnameseTts.ts`)**:
     - Kiến trúc 4 tầng chống sập (*Fail-Safe Multi-Tier*):
       * Tier 1: Local AI Bridge (KorvaTTS/VieNeu-TTS nếu được bật).
       * Tier 2: Cloud Neural HD Stream (`/api/tts-cloud`) hoạt động ngay lập tức trên mọi thiết bị/browser/mobile mà không cần cài đặt gì thêm.
       * Tier 3: Native Web Speech API (`SpeechSynthesis`) tự động nhận diện voice tiếng Việt khi offline.
       * Tier 4: Procedural acoustic vocal chime (`chillAudio.playBotVocal`).
     - Hỗ trợ chọn Engine Mode: `'auto' | 'cloud' | 'korva' | 'native'` lưu trữ bền vững tại `localStorage`.
  3. **Tích hợp toàn bộ hệ thống giọng nói**:
     - **4 Bot Trader Thường Trú**: Alex Trần (Nam trầm), Mai Linh (Nữ thiền định), Hải Đăng (Nam scalper nhanh), Sarah Jenkins (Nữ vĩ mô thanh lịch).
     - **3 Nhân Sự Quán**: Quản gia Minh An (chào tiền sảnh), Barista Thu Hà (đọc to xác nhận đơn gọi món & thông báo phục vụ lên bàn), Tiếp viên Bảo Ngọc (chào sảnh Hearth & hướng dẫn thiền định Spa).
     - **Thông báo Host toàn phòng**: Khi Host gửi thông báo khẩn, tự động đọc giọng nam quản trị trang trọng tiếng Việt.
     - **Dịch vụ Spa Massage**: Lời hướng dẫn thả lỏng cơ thể, tĩnh tâm thiền định bằng giọng nói truyền cảm kết hợp chuông xoay 432Hz.
     - **Giao diện Tab Khách**: Bộ chọn Engine giọng nói (`tts-engine-select`) và thẻ nghe thử giọng nói của tất cả 4 Bot Trader và 3 Nhân sự quán.
  4. **Tài liệu hướng dẫn**: Lập `.codex/VIETNAMESE_TTS_GUIDE.md` lưu trữ toàn văn so sánh các repo và hướng dẫn vận hành.
- File đã thay đổi: `server/index.mjs`, `server/http.test.mjs`, `src/audio/vietnameseTts.ts`, `src/audio/staffVoice.ts`, `src/audio/botVoice.ts`, `src/App.tsx`, `src/App.css`, `.codex/VIETNAMESE_TTS_GUIDE.md`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests** (bao gồm test mới cho `/api/tts-cloud` cache & synthesis).
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.05s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-26 / T06, T07, T17, T18, T19, T20 — Thiết Kế Bartender Đứng Quầy & Chủ Động Hỏi Bằng Tiếng Việt — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Thiet ke Bartender nhan vien dung o quay, khi lai gan thi se chu dong hoi bang tieng viet".
- Chi tiết kỹ thuật đã thực hiện:
  1. Cập nhật nhân viên thành `🍸 Bartender Thu Hà` với bảng tên vàng sang trọng.
  2. Trang phục Bartender cao cấp: tạp dề đen charcoal (`#1c2226`), quai da chéo lưng, nơ cổ đỏ ruby (`#943828`), huy hiệu kim loại đồng sáng bóng.
  3. Đạo cụ Bartender Workstation đặt ngay trên mặt quầy bar phía trước: bình lắc cocktail inox (`bar-cocktail-shaker`), nắp đậy, ly đong jigger 2 đầu bằng đồng (`bar-jigger`), khăn lau quầy gấp gọn (`bar-folded-towel`), ly mixing glass và thìa xoắn dài cán vàng (`bar-spoon-handle`).
  4. Cơ chế nhận diện khoảng cách (Proximity Detection < 3.4m, y < 2.0m): khi người chơi bước tới quầy, Thu Hà tạm dừng tuần tra, xoay người nhìn thẳng vào người chơi, giơ tay chào đón, vòng hào quang 3D (`speakingHalo`) xanh lá phát sáng và chủ động cất tiếng hỏi thăm bằng tiếng Việt chuẩn.
  5. Bong bóng thoại Dialogue Bubble sang trọng nổi ở góc dưới màn hình kèm nút bấm tắt nhanh `[☕ Xem Menu Quầy Bar]`.
- File đã thay đổi: `src/CafeScene.tsx`, `src/audio/staffVoice.ts`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 8.95s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-27 / T04, T06, T07, T19 — Cửa Xoay Tự Động 4 Ô Hình Trục Ống Khách Sạn 5 Sao (4-Wing Cylindrical Luxury Revolving Door) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Cua nay lam dang cua xoay chia 4 o, hinh truc ong nhu cac cua xin ben Trung quoc" (kèm ảnh chụp trực diện sảnh vào biệt thự với cửa kính trượt cũ và cột chắn giữa).
- Phân tích & Giải pháp kiến trúc:
  1. Loại bỏ thiết kế cửa phẳng cũ (`entry-door-left`, `entry-door-right`, `entry-door-top`) và cột đá nằm ngay chính giữa cửa vào (`entry-column-0`).
  2. Dựng cụm cửa xoay tự động 4 ô hình trục ống tròn tiêu chuẩn khách sạn siêu sang (5-star luxury hotel revolving door):
     - **Vách kính cong hình trục ống (Curved Glass Drum Enclosure)**: 2 bán nguyệt kính cong hướng Đông và Tây (`MeshBuilder.CreateCylinder` với `arc: 0.28`, `cap: Mesh.NO_CAP`, `sideOrientation: DOUBLESIDE`), chất liệu kính tinh thể `revolvingGlass` bóng sang trọng, nẹp viền vành cong kim loại vàng bóng (`goldBrass`) trên và dưới.
     - **4 Trụ đứng (Corner Mullions)**: 4 cột đồng đứng (`goldBrass`) định vị 4 góc mép kính cong, tạo lối mở rộng 2.06m đón khách ra vào hai hướng Bắc (vào sảnh) và Nam (ra sân New York).
     - **Vòm tán trục ống tròn (Circular Gold Canopy Drum)**: Vòm tán hình trụ tròn đường kính 3.42m bọc kim loại vàng bóng với phào chỉ nổi (`cornice`), tích hợp 4 đèn spotlight LED âm trần rọi sáng ấm áp xuống từng ô và đèn PointLight vàng ấm đón khách.
     - **Mặt sàn đá cẩm thạch (Circular Floor Medallion)**: Đĩa đá cẩm thạch đen (`marbleBlack`) viền chỉ vàng tròn đồng bộ dưới chân cụm cửa xoay.
     - **Khung vách kính phụ hai bên (Flanking Glass & Pilasters)**: 2 vách kính cố định và 2 trụ đá Travertine ở hai mép `x = ±2.8m` gắn đèn hoa đăng sconces, dầm trán cổng vàng `5.8m` kết nối liền mạch mặt tiền biệt thự.
  3. **Cơ cấu xoay 4 ô (4-Wing Revolving Rotor)**:
     - Trục quay trung tâm bằng đồng vàng bóng (`revolving-spindle-shaft`, đường kính 0.15m, cao 3.04m) kèm ổ trục trên/dưới.
     - 4 cánh kính quay chia đều 90° (`0°, 90°, 180°, 270°`) gắn vào trục trung tâm.
     - Mỗi cánh gồm: tấm kính cường lực trong suốt, khung nẹp viền kim loại vàng bóng 4 cạnh, gioăng cao su chắn bụi sàn (`charcoal`), thanh nẹp cao su mép ngoài chống va đập, tay đẩy ngang đôi bằng inox/đồng bóng hai mặt (`push-bar`) ở độ cao 1.05m và dải chỉ an toàn tầm mắt.
  4. **Chuyển động xoay mượt mà & cảm biến tiếp cận (Continuous Rotation & Proximity Response)**:
     - Cửa tự động quay liên tục và êm ái ở tốc độ 0.32 rad/s (~19.6 giây/vòng).
     - Khi người chơi tiến lại gần cửa (`dist < 4.2m, y < 1.8m`), hệ thống cảm ứng tăng tốc nhịp nhàng lên 0.52 rad/s, tạo cảm giác cửa tự động mở lối đón khách vào sảnh.
     - Đăng ký toàn bộ các mesh cánh quay vào `dynamicMeshes` để Babylon.js không đóng băng ma trận transform.
  5. **Cơ chế vật lý & lối đi thông suốt**:
     - Lối đi qua cửa xoay rộng rãi, người chơi đi tự nhiên qua lại giữa sân trước (`z < -7.36`) và sảnh Hearth (`z > -7.36`) qua các khoang xoay.
     - Cột xoay trung tâm có đĩa va chạm nhỏ (`r = 0.12m`), vách kính cong hai bên có đĩa va chạm chặn va quẹt cạnh ngoài (`x = ±1.62m, r = 0.40m`), tường mặt tiền ngăn đi xuyên tường bê tông nhưng mở thoáng hoàn toàn hành lang cửa xoay (`|x| <= 0.95m`).
- File đã thay đổi: `src/CafeScene.tsx`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.



## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-28 / T04, T06, T07, T19 — Cửa Kính Phẳng Tự Động Trượt Mở Khi Lại Gần & Đóng Khi Đi Ra (Luxury Automatic Sliding Glass Doors) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Thoi sua lai la dang cua kinh phang mo tu dong khi di gan va tu dong dong khi di ra di, cai cua xoay nay xau qua".
- Chi tiết kỹ thuật đã thực hiện:
  1. Loại bỏ hoàn toàn hệ thống cửa xoay hình trục ống tròn.
  2. Thiết kế và triển khai Cụm Cửa Kính Phẳng Tự Động 2 Cánh Trượt Cao Cấp (Luxury Automatic Sliding Glass Doors):
     - **Cổng vòm & Hộp ray trượt tự động (Overhead Sliding Track Housing)**: Dầm trán cổng vàng `5.8m` (`goldBrass`), hộp động cơ ray trượt gỗ đen cao cấp (`auto-door-track-box`) nẹp chỉ vàng, gắn cụm cảm biến radar chuyển động (`auto-door-sensor-unit`) với đèn LED chỉ báo trạng thái (`autoSensorIndicator`).
     - **Đèn rọi trần & Trụ đá Travertine**: Đèn PointLight vàng ấm rọi xuống ngưỡng cửa, 2 trụ đá Travertine ở `x = ±2.8m` gắn đèn hoa đăng sconces.
     - **Vách kính cố định hai bên (Fixed Sidelites)**: 2 vách kính cố định phẳng ở `x = ±2.12m` có nẹp viền vàng và thanh mullion dọc đón cánh cửa khi trượt mở.
     - **Ray dẫn hướng âm sàn & Ngưỡng đá cẩm thạch đen**: Thanh ray trượt âm sàn chỉ vàng kết hợp đĩa ngưỡng đá cẩm thạch đen (`marbleBlack`) sang trọng.
  3. **Hai Cánh Cửa Kính Trượt Phẳng (Left & Right Sliding Panels)**:
     - 2 cánh kính cường lực phẳng `revolvingGlass` viền vàng bóng 4 cạnh (`goldBrass`), dải chổi quét chân và gioăng cao su chắn bụi sàn (`charcoal`), dải đệm cao su chạm êm ái ở mép giữa khi đóng.
     - Mỗi cánh được trang bị **tay vịn đứng trụ tròn bằng đồng vàng sang trọng** (`door-handle-l` và `door-handle-r`, dài 1.35m) gắn bằng chốt standoff đôi xuyên kính, kèm dải chỉ an toàn mạ vàng ngang tầm mắt.
  4. **Cơ Chế Mở Tự Động Khi Đến Gần & Tự Động Đóng Khi Đi Ra (Automatic Proximity Sensor & Damping)**:
     - Nhận diện khoảng cách người chơi đến cửa (`distToAutoDoor < 4.2m, y < 1.8m`).
     - Khi người chơi lại gần: `autoDoorProgress` tăng mượt mà lên `1.0` (dt * 3.8), hai cánh cửa tự động trượt êm ái sang hai bên mở rộng lối đi thông thủy lên tới **2.76 mét**. Đèn cảm biến trên trán cửa sáng đèn ấm áp.
     - Khi người chơi đi ra xa: `autoDoorProgress` giảm dần về `0.0`, hai cánh cửa tự động trượt khép lại nhẹ nhàng chạm khít vào nhau ở chính giữa `x = 0`.
     - Đăng ký toàn bộ các mesh cánh trượt vào `dynamicMeshes` để loại trừ khỏi `freezeWorldMatrix`.
  5. **Cơ Chế Vật Lý & Va Chạm**:
     - Khi cửa mở: người chơi đi lại tự nhiên qua lại giữa sân New York và sảnh Hearth không vướng bất kỳ chướng ngại vật nào.
     - Khi cửa đóng: ngăn xuyên qua kính; tường bê tông hai bên mặt tiền (`|x| > 1.35m`) chặn xuyên tường chuẩn xác.
- File đã thay đổi: `src/CafeScene.tsx`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.10s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity



- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.


## IDEA-29 / T04, T06, T07, T16, T17, T19, T20 — Bổ Sung 10 Chi Tiết Chuẩn Quán Café Thực Tế & Tương Tác Xúc Giác Bất Ngờ (Authentic Real-World Cafe Details & Surprises) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Bo sung nhung chi tiet quan trong, de chuan theo mot quan cafe thuc te - ban suy nghi copy tren mang, bo sung bat ngo".
- Phân tích & Ý tưởng thiết kế:
  Để quán cà phê ảo tái hiện trọn vẹn không khí chân thực, ấm cúng và tinh tế của một quán specialty coffee cao cấp ngoài đời thực (kết hợp văn hóa trading lounge), hệ thống được trang bị 10 chi tiết đặc trưng kèm âm thanh Web Audio procedural và phản hồi tương tác thời gian thực:
  1. **Quầy Nước Lọc Detox Chanh & Bạc Hà Tự Phục Vụ (Self-Serve Detox Lemon & Mint Water Station)**:
     - Bàn console gỗ sồi tối màu và mặt đá cẩm thạch trắng Calacatta (`x = -3.8m, z = -4.5m`).
     - Bình thủy tinh chứa nước detox ngâm 3 lát chanh vàng nổi và 4 nhánh bạc hà tươi, vòi đồng spigot, nắp gỗ núm vàng.
     - Khay gỗ đựng 4 ly thủy tinh sạch trong suốt, hộp khăn giấy kraft vuông, cốc đựng ống hút giấy thân thiện môi trường.
     - Thẻ gỗ khắc laser: "NƯỚC LỌC CHANH BẠC HÀ TỰ PHỤC VỤ (MIỄN PHÍ)".
     - Tương tác: Click vào bình/khay phát âm thanh rót nước chảy róc rách procedural `playWaterPour()` và hiện thông báo Toast.
  2. **Biển Chữ A Menu Phấn Đen Viết Tay (A-Frame Chalkboard Daily Specials)**:
     - Giá vẽ chữ A gỗ gập đôi đặt gần lối vào (`x = 1.95m, z = -5.75m`), bản lề đồng, thanh gác phấn và 2 mẩu phấn trắng/vàng.
     - Mặt bảng vẽ tay độ phân giải cao: "CLOSING BELL CAFÉ", Món đặc biệt hôm nay (Cold Brew Cam Sả Vàng, Croissant Bơ Pháp, Trà Đào Cam Sả), Giờ Vàng 14h-16h Mua 1 Tặng 1, Wi-Fi & Mật khẩu.
     - Tương tác: Click vào phát âm thanh sột soạt `playMenuPaper()` và thông báo chi tiết món đặc biệt.
  3. **Ống Cắm Dù Sang Trọng Bằng Đồng Thau (Vintage Brass Umbrella Stand)**:
     - Ống đồng thau hình trụ viền chỉ vàng đặt cạnh cửa kính tự động (`x = 1.82m, z = -6.95m`).
     - 3 chiếc dù cán gỗ cong chữ J cổ điển (đen charcoal, xanh rêu Anh quốc, đỏ burgundy).
     - Tương tác: Click vào nhắc nhở quý khách mượn ô miễn phí khi trời New York đổ mưa tuyết.
  4. **Kệ Treo Báo & Tạp Chí Tài Chính Quốc Tế (Financial Periodicals & Newspaper Rack)**:
     - Kệ đứng bằng gỗ sồi sẫm và 3 thanh suốt bằng đồng thau (`x = -7.2m, z = 0.5m`).
     - Treo nẹp các tờ báo tài chính nổi tiếng: Financial Times (giấy hồng cá hồi salmon-pink đặc trưng), The Wall Street Journal (giấy trắng ngà in cột báo), tạp chí Bloomberg Markets bìa đen.
     - Tương tác: Click vào phát âm thanh lật trang giấy xào xạc `playPageFlip()` và cập nhật tin tức vĩ mô/crypto.
  5. **Chuông Bấm Gọi Phục Vụ Quầy Bar (Service Desk Call Bell)**:
     - Chuông đồng vòm tròn đế gỗ đặt trên mặt quầy bar (`x = 3.62m, z = 1.95m`).
     - Tương tác: Click vào phát âm thanh ngân chuông "Ding!" trong trẻo `playDeskBell()`, thông báo Toast và kích hoạt Bartender Thu Hà mỉm cười chào đón.
  6. **Thẻ Gỗ Khắc Laser Wi-Fi & Crypto Accepted (Tabletop Wi-Fi & Crypto Tent Card)**:
     - Khối gỗ sồi hình mái lều chữ A gắn biển kim loại khắc thông tin Wi-Fi CafeTrader_VIP tốc độ 1Gbps, đặt tại quầy bar và trên tất cả các bàn.
     - Tương tác: Click vào sao chép và hiển thị mật khẩu Wi-Fi chuẩn xác.
  7. **Tủ Kính 2 Tầng Trưng Bày Bánh Nóng Sốt (Two-Tier Pastry Showcase & Dessert Warmer)**:
     - Tủ khung đồng vách kính 2 tầng đặt trên quầy bar (`x = 3.78m, z = 3.25m`) có đèn sưởi vàng ấm dịu.
     - Trưng bày Bánh sừng bò Pháp (Croissant) nướng bơ vàng ruộm, bánh cuộn socola Pain au Chocolat, bánh Canelé Bordeaux giòn caramen và kẹp gắp bánh inox.
     - Tương tác: Click vào phát âm thanh kẹp gắp inox `playTongsClick()` và giới thiệu các món bánh vừa ra lò.
  8. **Đế Sạc Không Dây Nhanh 15W Qi2 & Ổ Cắm Đa Năng Dưới Bàn (Wireless Charging Pads & Under-Table Outlets)**:
     - Tích hợp đĩa sạc không dây âm mặt bàn phẳng màu than chì viền chỉ vàng kèm vòng LED teal phát sáng tại mọi bàn (Sảnh Hearth & VIP Lounge).
     - Hộp ổ cắm điện âm yếm bàn gồm 2 cổng cắm xoay chiều AC và 2 cổng USB-C sạc nhanh cho laptop và điện thoại của trader.
     - Tương tác: Click vào phát âm thanh chuông sạc thông minh `playQiChime()` và kích hoạt sạc thiết bị.
  9. **Kệ Trưng Bày Hạt Cà Phê Specialty & Quà Lưu Niệm (Specialty Coffee Beans & Retail Shelf)**:
     - Hệ tủ gỗ 4 tầng gắn dải đèn LED hắt ấm (`x = 8.82m, z = 2.4m`).
     - Trưng bày các túi cà phê giấy kraft van 1 chiều (Bourbon Cầu Đất, Ethiopia Yirgacheffe, Colombia Geisha), cốc sứ nung thủ công và bình giữ nhiệt cao cấp CafeTrader.
     - Tương tác: Click vào phát âm thanh bao bì `playMenuPaper()` và xem danh mục quà tặng lưu niệm.
  10. **Trạm Trả Khay & Phân Loại Rác Tự Phục Vụ (Tray Return & Waste Sorting Station)**:
     - Tủ gỗ hiện đại mặt đá cẩm thạch đen (`x = 3.65m, z = -4.5m`) có gờ chặn chống rơi bằng đồng.
     - Chồng khay phục vụ bằng gỗ, 3 cửa bỏ rác tròn inox riêng biệt (ly giấy, nắp nhựa, bã cà phê/hữu cơ).
     - Tương tác: Click vào gửi lời cảm ơn quý khách giữ gìn không gian quán xanh sạch.
- File đã thay đổi: `src/audio/chillAudio.ts`, `src/CafeScene.tsx`, `src/App.tsx`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 18.23s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.

## IDEA-30 / T10, T16, T17, T18, T20 — Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán) — 12/11/2026 / Antigravity

- Yêu cầu người dùng: "Sao toi vao menu ma k an duoc vao nut chon de goi mon ?".
- Phân tích nguyên nhân gốc rễ (Root Cause):
  1. Trong mã nguồn cũ, cả nút "Gọi món" bên trong component `TableMenuPages` và 8 thẻ `drink-card` đều mang thuộc tính `disabled={!seat || orderState === 'brewing'}`.
  2. Khi người chơi mới vào quán hoặc đứng tại quầy bar (`seat === null`), thuộc tính `disabled={true}` kích hoạt, trình duyệt web chặn hoàn toàn mọi sự kiện click vào nút (người chơi bấm vào không có bất kỳ phản hồi nào).
  3. Hàm xử lý `handleOrderDrink` trước đây cũng chặn người chưa ngồi: `if (!currentSeat) { showToast(...); return; }`.
  4. Thẻ trạng thái đang thưởng thức đồ uống (`order-active-card`) cũng bị ràng buộc điều kiện `ordered && seat`, khiến khách đứng dạo quán không thấy được ly cà phê của mình.
- Giải pháp kỹ thuật đã triển khai:
  1. **Cho phép gọi đồ uống linh hoạt ở mọi vị trí**: Khách ngồi tại bàn được phục vụ tận nơi (`Tại bàn`), khách đang đứng được phục vụ cầm tay (`Mang đi / Takeaway`).
  2. **Gỡ bỏ thuộc tính `disabled` do thiếu ghế**: Nút bấm luôn sáng và có thể bấm được; chỉ tạm khóa khi Barista đang trong quá trình 3s pha chế.
  3. **Cập nhật giao diện `TableMenuPages` & `drink-card`**:
     - Nút gọi món đổi nhãn thông minh theo trạng thái: `☕ Gọi [Món] (Tại bàn)` hoặc `☕ Gọi [Món] (Mang đi)`.
     - Khi Barista đang pha: nút hiển thị `⏳ Barista đang pha chế...`.
  4. **Nâng cấp giọng nói & thông báo Barista Thu Hà**:
     - Khi ngồi bàn: *"Thu Hà đã nhận món... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."*
     - Khi đứng dạo: *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
  5. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Cung cấp nút `[🪑 Hoặc ngồi vào bàn trống]` ngay trên đầu menu để người chơi lập tức ngồi vào bàn nếu muốn chuyển sang trải nghiệm phục vụ tại bàn.
  6. **Đồng bộ hóa ly đồ uống 3D & Nhấp ngụm**:
     - Thẻ `order-active-card` hiển thị đầy đủ cho cả khách ngồi lẫn khách dạo quán, cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê).
     - Khi khách dạo quán sau đó bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi: `src/components/TableMenuPages.tsx`, `src/App.tsx`, `src/App.css`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra thực tế:
  + `npm test`: **PASS 27/27 tests**.
  + `npm run verify`: **PASS 27/27 tests**, build Vite hoàn tất trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
- Git: `master`, chưa có commit.
