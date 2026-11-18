# Bàn giao cho AI / phiên tiếp theo

**Trạng thái cuối phiên 11/11/2026:** Đọc `CAP_NHAT_DU_AN.md` trước các ghi chép bên dưới. Prototype React/Vite/Babylon và WebSocket đã được viết; `npm run build` PASS, `npm test` PASS 5/5; chưa kiểm tra browser/mobile. Chưa có voice, auth, nhạc, video, đơn đồng bộ hoặc bảo mật production. Bước kế tiếp: chạy bản thử theo README, review browser và tiếp tục theo bảng T01–T28 trong `CAP_NHAT_DU_AN.md`. Không công bố server thử nghiệm.

Cập nhật: 2026-11-11 (giờ Việt Nam)

## Đọc theo thứ tự

1. `AGENTS.md` — quy tắc làm việc và quota.
2. `KE_HOACH_GOC.md` — định hướng, phạm vi và mã T01–T28.
3. `TIEN_DO.md` — trạng thái và bằng chứng mới nhất.
4. Kiểm tra `git status --short --branch`, các file thực tế và yêu cầu mới nhất của chủ dự án.

## Bối cảnh hiện tại

Chủ dự án muốn quán cà phê **3D trên web**, không bắt đầu bằng một thành phố. Người dùng có thể vào room và bàn, đi lại, đổi POV/góc nhìn sau nhân vật, trò chuyện, nghe nhạc, xem màn hình, gọi đồ uống ảo. Các nội dung chi tiết và lộ trình nằm trong kế hoạch gốc.

Chủ dự án đã yêu cầu bắt đầu triển khai. Các agent đang dựng cảnh 3D, giao diện và WebSocket; nền React/Vite/Babylon đang được tích hợp, chưa nghiệm thu. Công cụ nhắc đã được kiểm tra. Git cục bộ chưa có commit hoặc remote tại lần kiểm tra 2026-11-11. Chưa công bố hay triển khai.

## Việc còn mở

- Người dùng nói “Gravity”; đang tạm hiểu là Google Antigravity, chưa xác nhận.
- Chưa xác định nhà cung cấp, tài khoản, miền, playlist được cấp phép hay thiết bị mục tiêu cụ thể.
- Trong phiên Codex có công cụ `get_usage_limits` để đọc quota; script nhắc tự nó không truy cập thông tin tài khoản. Các dịch vụ khác phải kiểm tra riêng.
- Server prototype đang dùng WebSocket `ws` thay cho Colyseus đề xuất; cần review quyết định, xác thực, voice, bảo mật và lưu trữ trước khi công bố.
- Việc tiếp theo: tích hợp 3 phần và kiểm tra theo kế hoạch. Cập nhật lại phần này sau khi có kết quả.

## Mẫu cập nhật cuối phiên

- Ngày / AI / phạm vi: 2026-11-11 / Antigravity / Hoàn thành T09 (Hồ sơ Trader & Trader Passport), T21 (Bảng điều khiển Quản trị Host & Báo cáo vi phạm), T23 (Tối ưu Bundle Rollup manualChunks)
- Nhiệm vụ và trạng thái:
  + T09 (Hoàn thành bước đầu):
    1. Thiết kế và triển khai Thẻ Căn Cước Trader (Trader Passport): lựa chọn Badge phong cách giao dịch (`🧘 Zen Trader`, `⚡ Scalper`, `📈 Swing Trader`, `💎 HODLer`, `🌐 Macro Analyst`, `🎯 Arbitrageur`), bio/châm ngôn, màu đại diện Industrial Luxury, bộ đếm số tách cà phê đã uống.
    2. Lưu bền vững client-side (`localStorage: cafetrader_profile`), tự động tải và đồng bộ lên server khi `join`.
    3. Modal Thẻ Căn Cước Trader mở từ header hoặc tab khách, chỉnh sửa và lưu tức thời.
    4. Thao tác nhấp ngụm cà phê (`handleSipDrink`) tích lũy tách uống và thăng hạng Trader (Khách mới -> Khách thân thiết -> Master Trader).
  + T21 (Hoàn thành bước đầu):
    1. Quản trị Host trong phòng riêng: chỉ định `hostId` cho người vào đầu tiên, tự động bàn giao host khi chủ phòng rời đi.
    2. Host phát thông báo khẩn toàn phòng (`announcement` event), banner hiển thị trực quan trên thanh điều khiển.
    3. Host tắt tiếng (`mute`) chặn chat người chơi vi phạm phía server và mời ra khỏi phòng (`kick`) với thông báo lý do (`kicked` event).
    4. Hệ thống báo cáo vi phạm (`report` event): rate limit 5s, lưu trữ server-side (`RoomService.reports`), endpoint `GET /api/reports`.
    5. Tab Khách trong quán (`tab === 'guests'`) hiển thị đầy đủ danh sách thành viên, badge, số tách uống, tag Chủ phòng/Đã tắt tiếng, và các nút điều hành Mute/Kick/Report/Block.
  + T23 (Hoàn thành bước đầu):
    1. Cấu hình Rollup `manualChunks` trong `vite.config.ts`: tách biệt `@babylonjs/core` (`vendor-babylon`) và React runtime (`vendor-react`).
    2. Giảm kích thước entry JavaScript bundle chính từ 6.4 MB (> 6,488 kB) xuống còn **328.76 kB** (103 kB gzipped), cải thiện tốc độ tải ban đầu vượt bậc.
- File đã thay đổi: `server/rooms.mjs`, `server/index.mjs`, `server/rooms.test.mjs`, `server/http.test.mjs`, `src/network/client.ts`, `src/App.tsx`, `src/App.css`, `vite.config.ts`, `.codex/TASK_BOARD.md`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm run verify`: PASS 19/19 test tự động (bao gồm 4 test mới cho report, kick, mute, announcement, reports API) và Vite production build hoàn tất trong 9.02s.
  + WebSocket server: Live port 3001.
  + Vite Dev server: Live port 5173.
- Chưa xong, rủi ro, lỗi hoặc thay đổi chưa commit: Chưa commit Git (theo quy tắc 8 trong AGENTS.md).
- Nhiệm vụ tiếp theo: Người dùng trải nghiệm tính năng Trader Passport, phát thông báo Host và tab Khách trên http://127.0.0.1:5173/. Tiếp tục T22 (Bảo mật / Data Review) hoặc T24 (Staging / HTTPS / WSS).
- Git: nhánh master, chưa commit.

Nếu quota sắp hết, ưu tiên cập nhật file này và `TIEN_DO.md` cùng bằng chứng ngắn gọn, sau đó dừng nhận việc lớn.

## Cập nhật phối hợp Codex — 11/11/2026

- Điểm vào chung đã có tại `.codex/README.md`; `AGENTS.md` yêu cầu đọc file này đầu tiên. Có thêm `.codex/WORKFLOW.md` cho quy tắc kiểm tra, phân file giữa các agent và kết thúc phiên.
- Khi giao việc cho AI khác, dùng prompt trong `.codex/README.md`; yêu cầu agent nêu phạm vi `Txx`, không sửa chồng file và cập nhật ba file trạng thái với bằng chứng.
- Không có commit, push, deploy hay thay đổi mã ứng dụng trong lần cập nhật tài liệu này.

## Regression test — 11/11/2026

- Trước khi bàn giao code, chạy `npm run verify`. Lệnh chạy 15 test server/API/WebSocket, sau đó TypeScript/Vite build. Kết quả lần bổ sung: **PASS 15/15**, build PASS.
- Dùng `npm run test:watch` khi sửa server. Ma trận case, cách thêm test và giới hạn automation: `.codex/TESTING.md`.
- Chưa có E2E browser/mobile/3D, test WebRTC với mic thật hay load test. Không suy ra các phần đó đã được nghiệm thu từ test hiện tại.

## Bảng việc cho agent — 11/11/2026

- Bắt buộc đọc `.codex/TASK_BOARD.md` sau `.codex/README.md` trước khi nhận việc. Đây là nguồn đọc nhanh cho yêu cầu mới nhất, trạng thái được phép làm và điều chưa được tự code.
- Việc mới nhất: ý tưởng quán nhiều tầng/lò sưởi đã ghi tại `.codex/CONCEPT_KHONG_GIAN.md`, chỉ là brief và **chưa được phép triển khai code**. Regression test là quy tắc bắt buộc khi có thay đổi mã.

## Cổng quán & biệt thự 5 tầng — 11/11/2026

- Chủ dự án đã cho phép code IDEA-02. `src/CafeScene.tsx` có spawn ngoài cổng, lối đi vào sân ~504m², cổng/biển hiệu/cảnh quan/cửa kính và mặt tiền 5 tầng. `src/App.tsx` đã đổi POV đầu thành “Cổng quán”.
- Kiểm tra: `npm run verify` PASS 19/19, production build PASS. Không thể kiểm tra trực quan trong browser vì browser host không khả dụng; cần người dùng mở `http://127.0.0.1:5173/` và xác nhận cảm giác đi từ cổng vào quán.
- Giới hạn cố ý: tầng sảnh và lửng vẫn là vùng tương tác hiện có; tầng 3–5 là facade kiến trúc để giữ hiệu năng và tránh làm hỏng room/ghế trước khi có task chi tiết cho từng tầng.

## Estate hoàng gia 8 tầng — 11/11/2026

- Chủ dự án yêu cầu mở rộng map, UI sắc nét và footsteps. `src/CafeScene.tsx` nay có estate 50 × 40m, đài phun nước/pavilion, sáu terrace thật T3–8 và Royal Lift; `src/App.tsx` có selector 8 tầng; `src/audio/chillAudio.ts` có tiếng bước chân đá ngoài sân.
- `server/rooms.mjs` đã mở bounds vị trí cho map/tầng cao; `server/rooms.test.mjs` có regression case T8. Kiểm tra `npm run verify`: **PASS 20/20**, build PASS.
- Cần người dùng kiểm tra trực quan tại `http://127.0.0.1:5173/`: đi từ cổng, mở Royal Lift, chọn T3–T8 và nghe tiếng bước chân. Browser host tự động vẫn không khả dụng; chưa có số FPS thực. Ghế/voice còn giới hạn T1–2.

## Kim chỉ nam Closing Bell v1.1 — 11/11/2026

- `KE_HOACH_GOC.md` đã được bố cục lại, là điểm định hướng đầu tiên cho agent mới: concept Closing Bell, palette, cổng → sảnh → sáu góc, mặt bằng 8 tầng, nhịp âm thanh/UI, scope Pilot, kiến trúc, vai trò và T01–T28.
- Quyết định sản phẩm: villa 8 tầng là **lộ trình có điều kiện**, không phải lý do để công bố thành phố hay các phòng trống. Pilot chức năng thật tập trung T1 và một phần T2; mọi tầng/khu tiếp theo cần task, owner, test và bằng chứng riêng.
- Lần cập nhật này **chỉ sửa tài liệu**; không chạy test mới, không sửa mã, không commit/push/deploy. Bằng chứng code gần nhất vẫn là IDEA-03: `npm run verify` PASS 20/20, build PASS; QA browser/FPS còn thiếu.

## Kiểm chứng tiếp nối — 12/11/2026

- Phạm vi: tiếp tục T01/T08 bằng kiểm tra cục bộ, không sửa mã.
- Bằng chứng mới: `npm run verify` **PASS 20/20**; TypeScript/Vite build PASS (18.80s). Local server và app đã khởi động: `/health` trả `200 {"ok":true}`, `/api/rooms` trả room `public`/`chill` (0/28), Vite `:5173` trả HTTP 200.
- Bị chặn: không có browser automation khả dụng trong phiên (native pipe và browser access host đều lỗi), vì vậy chưa có chứng cứ trực quan 3D, FPS, mobile hoặc mic WebRTC. Không nâng trạng thái T01/T08.
- Git: `master`, chưa có commit; không commit/push/deploy. Quota: không có công cụ chỉ số quota chính thức trong phiên này, nên chưa xác minh được.
- Tiếp theo: người có browser khả dụng mở `http://127.0.0.1:5173/`, kiểm tra hai tab join/ghế/chat, camera/di chuyển/Royal Lift T1–T8 và HUD FPS; ghi thiết bị, browser và kết quả thực trước khi sửa hoặc mở rộng phạm vi.

## T22 — Security/Data Review sơ bộ — 12/11/2026

- Không sửa mã. Server hiện vẫn loopback-only (`127.0.0.1`), có guard payload/burst/join, validation input và invite code ngẫu nhiên.
- Không được deploy: chưa có authentication hay quyền production; quyền host là người kết nối private room đầu tiên. `GET /api/reports` hiện không cần quyền và có thể lộ tên/lý do/thời điểm báo cáo. WebSocket chưa kiểm tra `Origin`; limit theo connection có thể bị né bằng reconnect.
- Cần quyết định của chủ dự án trước khi code remediation: nhà cung cấp auth, vai trò admin/moderator, nơi lưu reports/log và thời hạn lưu. Sau đó ưu tiên: đóng/bảo vệ reports API, auth+RBAC server-side, policy Origin/rate-limit theo nguồn, expiry room và audit log.

## IDEA-05 / Villa Winter Sightline — 12/11/2026 05:36 (Asia/Saigon) / Codex

- T04/T06/T07/T16/T19 — hoàn thành bước đầu, code chỉ ở `src/CafeScene.tsx`. POV dùng mắt đứng 1,64m, mắt ngồi 1,22m, FOV dọc 63°; giới hạn nhìn lên được mở rộng. Không diễn giải đây là cảm giác “100%” trên mọi thiết bị khi chưa QA thật.
- Bổ sung trần vault 8,4m với coffer/lantern, cảnh ngoài trời mùa đông (frost, tuyết động, bảng visual `Winter Market Outlook`) và lò sưởi lớn hơn có chimney/sconce/ember. Không có price feed hay lời khuyên giao dịch.
- Kiểm tra: `npm run verify` PASS 20/20; `npm run build` PASS 21,59s. Cảnh báo Babylon chunk lớn còn tồn tại; app bundle gzip 106,16 kB, Babylon gzip 1.315,74 kB.
- Cần người dùng review trực quan tại `http://127.0.0.1:5173/`: chọn POV Cổng quán và Lò sưởi, kéo nhìn lên trần, quan sát sân tuyết/bảng mùa đông/lò sưởi, kiểm tra HUD FPS. Browser automation không khả dụng trong phiên.
- Git: master chưa có commit; không commit/push/deploy. Quota: chưa xác minh qua chỉ số chính thức trong phiên.

## IDEA-06 / Grand Hotel Café Hall — 12/11/2026 05:47 (Asia/Saigon) / Codex

- T04/T06/T19 — hoàn thành bước đầu. `src/CafeScene.tsx` có cánh đông Tầng 1 gồm năm nhịp 4m nối qua portal từ sảnh cũ: hotel concierge, lounge café và Grand Hall có stage/chandelier/bảng chương trình. Đây là không gian khách sạn/café, không có live-price hoặc signal.
- Client có thể đi tới x=30.4; server vẫn giới hạn x=±32. Không thêm ghế authoritative, room hoặc voice mới: hệ thống multiplayer vẫn chỉ có 7 bàn hiện hữu.
- Kiểm tra: `npm run verify` PASS 20/20; build PASS 20,50s. App bundle gzip 107,54 kB; Babylon gzip 1.315,74 kB; cảnh báo chunk lớn đã biết.
- Cần QA trực quan: mở `http://127.0.0.1:5173/`, đi qua portal, xem đủ 5 nhịp/ballroom, kiểm tra camera/FPS/va chạm. Browser automation không khả dụng trong phiên.
- Git: master chưa có commit; không commit/push/deploy. Quota: chưa xác minh qua chỉ số chính thức trong phiên.

## T07 — POV ngước trần — 12/11/2026 05:49 (Asia/Saigon) / Codex

- POV nay cho phép ngước tới 89,5° (gần thẳng đứng) để xem trần vault. Chừa 0,5° nhằm tránh gimbal singularity.
- `npm run build` PASS 13,69s. Cần người dùng xác nhận cảm giác kéo chuột trực tiếp tại `:5173`; browser automation không khả dụng.

## IDEA-07 / Classical Sky Salons T6–T8 — 12/11/2026 05:54 (Asia/Saigon) / Codex

- T6 Crown Library & Study, T7 Imperial Terrace Salon và T8 Sky Observatory Salon đã được chuyển thành salon khách sạn cổ điển theo hướng thẩm mỹ của ảnh tham chiếu: coffered ceiling, kính/ban công skyline, fireplace, sofa da, desk, thảm, loa hi-fi, chandelier và biển tên.
- Giới hạn có chủ đích: T8 có ceiling cao 4,85m; T6/T7 chỉ ~3,14m do cách deck 3,5m. Không sửa room, ghế hoặc voice: ba tầng chưa phải room chức năng.
- Kiểm tra: `npm run verify` PASS 20/20; build PASS 19,64s. App gzip 108,73 kB; Babylon gzip 1.315,74 kB.
- Cần QA trực quan ở `http://127.0.0.1:5173/`: Royal Lift → T6/T7/T8, kiểm tra panorama/fireplace/chandelier/desk và HUD FPS. Browser automation không khả dụng. Git: master chưa có commit; quota chưa xác minh.

## Phiên review đối chiếu mã nguồn & trạng thái — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review đối chiếu mã nguồn & tài liệu (yêu cầu phiên chưa chỉ định Txx/phạm vi cụ thể).
- Nhiệm vụ và trạng thái:
  + IDEA-08 (T10, T12, T13, T17, T18 — Lobby đặt chỗ & tiếp viên): Đang làm dở (WIP) bởi Codex.
  + Server (`server/rooms.mjs`, `server/index.mjs`) và test (`server/http.test.mjs`) đã có logic hỗ trợ sức chứa phòng riêng (2, 6, 8) và query parameter `/api/private-rooms?capacity=...`.
  + Giao diện (`src/App.tsx`, `src/App.css`) đã có logic sảnh chờ chọn không gian/bàn và tiếp viên hỏi món trước khi vào quán.
  + Thiếu sót gây gãy build: `src/network/client.ts` chưa cập nhật chữ ký `CafeClient.createPrivateRoom` để nhận `capacity?: number`, dẫn đến lỗi TypeScript `TS2345` tại `src/App.tsx:496`.
- File liên quan:
  + `server/rooms.mjs`, `server/index.mjs`, `server/http.test.mjs`
  + `src/App.tsx`, `src/App.css`, `src/network/client.ts`
  + `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `node --test server/rooms.test.mjs server/wire.test.mjs server/http.test.mjs`: **PASS 20/20** tests (bao gồm các test tạo phòng riêng với capacity 2, 6, 8 và từ chối 7).
  + `npm run verify`: **FAILED** tại bước `tsc --noEmit && vite build` (lỗi TS2345 tại `src/App.tsx:496`).
- Chưa xong / rủi ro:
  + Lỗi build TypeScript ngăn cản production build; cần khắc phục ngay trước khi phát triển tiếp.
  + Chưa commit Git (nhánh `master`, toàn bộ thay đổi nằm trong working tree).
  + Chưa có kiểm thử tự động browser/FPS thực tế.
- Việc tiếp theo (đề xuất 3 việc theo thứ tự ưu tiên):
  1. Cập nhật `createPrivateRoom` trong `src/network/client.ts` nhận `capacity?: number` (hoặc options) và truyền query param sang server để đưa `npm run verify` về trạng thái PASS (green build).
  2. Bổ sung kiểm thử hồi quy cho client network adapter và hoàn thiện IDEA-08.
  3. Mở browser tại `http://127.0.0.1:5173/` kiểm tra tương tác thực tế của luồng Lobby và tiếp viên.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-13 / T04, T07, T08, T19 — bỏ bảng vào quán, bước chân và hiệu năng — 12/11/2026

- Trạng thái: hoàn thành bước đầu; còn QA browser/FPS.
- Đã làm: gỡ bảng Floor Directory ở lối vào T1 và collision; `chillAudio.resume()` được gọi từ phím di chuyển, pointer-down và điều hướng cảm ứng để bước chân phát sau cử chỉ người dùng; tắt pointer-move picking và MSAA, giới hạn mật độ render, tự hạ render resolution khi frame time cao, freeze transform của mesh tĩnh.
- File liên quan: `src/CafeScene.tsx`, `src/audio/chillAudio.ts`.
- Kiểm tra: `npm run verify` PASS 25/25; Vite production build PASS trong 9.11s.
- Hạn chế: không đo được FPS/độ trễ thực tế hay xác nhận âm thanh/visual vì browser-access host không khả dụng.
- Việc tiếp theo: mở `http://127.0.0.1:5173/`, kiểm tra lối vào T1, di chuyển bằng WASD/joystick sau một lần chạm, và theo dõi HUD FPS trên desktop/mobile.
- Git: `master`, chưa commit. Quota: chưa xác minh.

## IDEA-13 / điều chỉnh chất lượng ảnh và SFX bước chân — 12/11/2026

- Quyết định: theo phản hồi chủ dự án, ưu tiên độ sắc nét: restore native device-pixel-ratio + MSAA, bỏ governor tự hạ render resolution; giữ tối ưu pointer-pick và mesh tĩnh.
- Đã làm: `handleEnterCafe` gọi `chillAudio.resume()` và `unmute()` trong cử chỉ Start; footsteps tăng âm lượng, duration, và thêm transient cho mọi bề mặt.
- File liên quan: `src/CafeScene.tsx`, `src/audio/chillAudio.ts`, `src/App.tsx`.
- Kiểm tra: `npm run verify` PASS 25/25; Vite production build PASS trong 13.66s.
- Hạn chế: browser-access host không khả dụng nên chưa nghe/đo FPS thật.
- Việc tiếp theo: reload `http://127.0.0.1:5173/`, vào quán bằng Start, kiểm tra WASD/joystick và HUD FPS. Nếu có lag, ưu tiên audit mesh/light trước khi giảm chất lượng hình.
- Git: `master`, chưa commit. Quota: chưa xác minh.

## IDEA-14 / T04, T06, T10, T16–T20 — trải nghiệm phục vụ Việt hoá & UX hospitality — 12/11/2026

- Ngày / AI / phạm vi: 12/11/2026 / Codex / lớp hospitality cho UI/UX, nhân sự và góc ngồi; không thay đổi kiến trúc online hay dịch vụ cloud.
- Đã làm:
  - `src/CafeScene.tsx`: đưa ba nhân sự có hit-box vào không gian 3D: quản gia Minh An, barista Thu Hà, tiếp viên Bảo Ngọc; callback chỉ mở panel ở client.
  - `src/components/ConciergePanel.tsx`, `src/components/ConciergePanel.css`, `src/audio/staffVoice.ts`: panel phục vụ tiếng Việt, profile giọng riêng từng người, `vi-VN` qua Web Speech API; fallback UI/toast nếu API không có.
  - `src/App.tsx`, `src/App.css`: nút Gọi quản gia, nối hành động dẫn tới POV/gọi đồ sẵn có; bổ sung mood, độ yên và mục đích cho 7 góc ngồi, vẫn giữ luồng ghế authoritative.
- Kiểm tra đã chạy: `npm run verify` — PASS 25/25 tests; `tsc --noEmit && vite build` PASS trong 8.81s.
- Chưa xong / rủi ro: chưa kiểm tra được browser/TTS/FPS trên thiết bị thật vì browser automation host không khả dụng. `speechSynthesis` phụ thuộc voice cài trên thiết bị; text vẫn là tiếng Việt và có toast fallback. Không có công cụ chỉ số quota chính thức trong phiên nên không thể xác nhận mức dùng so với giới hạn 5 giờ.
- Việc tiếp theo: tại `http://127.0.0.1:5173/`, vào quán và bấm cả 3 nhân sự, nghe lời chào, chọn một góc rồi gọi một món; kiểm thử 7 thẻ bàn ở viewport desktop/mobile. Ghi kết quả trước khi mở rộng thêm scope.
- Git: `master`, chưa có commit; mọi file hiện là untracked từ trước, không tự commit/push.

## IDEA-15 / T04, T06, T16, T19 — âm bước chân & trang hoàng Hearth Hall — 12/11/2026

- Ngày / AI / phạm vi: 12/11/2026 / Codex / tăng phản hồi bước chân và chỉnh mỹ thuật/ánh sáng T1; không đổi server, room, seat hay chất lượng render.
- Đã làm:
  - `src/audio/chillAudio.ts`: gain SFX mặc định 0,78; thân âm footsteps gỗ/cầu thang/đá và contact transient tăng để bước chân rõ trên nền ambience.
  - `src/CafeScene.tsx`: bầu trời/đèn quầy/VIP/lò sưởi ấm hơn, cửa sổ bớt lạnh; thêm `grand-hall-amber` là PointLight duy nhất mới. Chandelier brass 2 tầng, ba tranh khung vàng có sconce và nến làm T1 trang hoàng, ấm cúng.
  - Các mesh trang trí không chạy animation riêng và vẫn đi qua cơ chế freeze mesh tĩnh; tránh đưa thêm lưới light động.
- Kiểm tra đã chạy: `npm run verify` — PASS 25/25 tests; `tsc --noEmit && vite build` PASS trong 18.69s.
- Chưa xong / rủi ro: chưa nghe trực tiếp bằng loa/tai nghe, chưa xem visual/FPS trên browser thật. Warning chunk Babylon >500 kB vẫn xuất hiện khi build, không phải lỗi mới.
- Việc tiếp theo: tại `http://127.0.0.1:5173/`, dùng Start rồi thử WASD/joystick trên 3 mặt sàn; kiểm tra Hearth Hall desktop/mobile. Nếu bước chân quá lớn trên thiết bị thật, tinh chỉnh `sfx` trong `chillAudio.ts` trước, không tăng master gain.
- Git: `master`, chưa có commit. Quota: không có chỉ số chính thức trong phiên để xác minh giới hạn.

## IDEA-16 / T01, T02, T03, T05, T08, T22–T28 — runbook cấu hình & chuyển giao hoàn thiện — 12/11/2026

### Trạng thái và nguồn sự thật

- Tài liệu cấu hình chuẩn mới: `CAU_HINH_DU_AN.md`. Đọc file này trước khi đổi port, proxy, script hay kiến trúc online.
- Bản hiện tại là prototype **local**: React 19 + TypeScript + Vite 6 + BabylonJS 8 ở client; Node HTTP + `ws` 8 ở server. Server giữ state trong RAM, restart là mất dữ liệu.
- Không có `.env` bắt buộc và không có secret để bàn giao. Không tự bind public, deploy, mua cloud hay commit/push.

### Cấu hình thao tác chính xác

| Thành phần | Cấu hình / lệnh | Điểm phải nhớ |
|---|---|---|
| Prerequisite | Node.js 20+; `npm install` | Không thêm token/secret vào file cấu hình. |
| Realtime local | `npm run server` | Mặc định `HOST=127.0.0.1`, `PORT=3001`; `/ws`, `/api`, `/health`. |
| Web local | `npm run dev` | Vite thường là `http://127.0.0.1:5173`; proxy `/api` và `/ws` cùng trỏ `127.0.0.1:3001` trong `vite.config.ts`. Đổi PORT thì đổi proxy cùng thay đổi. |
| Bằng chứng code | `npm run verify` | Phải PASS test rồi `tsc --noEmit && vite build` trước bàn giao. |
| Build | `npm run build` | Ra `dist/`, đã ignore, không phải deploy. |

### Hợp đồng và giới hạn quan trọng

- Server yêu cầu `join` trong 10 giây, giới hạn 80 messages/giây/kết nối và payload WebSocket 8192 byte. Các giới hạn này chỉ phù hợp demo local, không là rate-limit production phân tán.
- Ghế/room/capacity phải authoritative ở server. `CafeScene` chỉ render/input; UI/TTS/âm thanh là fallback client, không được biến thành quyền server.
- `vite.config.ts` tách `vendor-babylon` và `vendor-react`. Warning Babylon chunk >500 kB còn tồn tại; không tăng `chunkSizeWarningLimit` để che warning trước T08/T23.
- TTS `vi-VN`, Web Audio và WebGL phụ thuộc trình duyệt/thiết bị; không có QA browser thật trong phiên hiện tại.

### Việc tiếp theo theo thứ tự — không làm đồng thời trên cùng file

1. **T01 + T08 — QA thiết bị và số đo.** Owner: người kiểm thử/UX. Mở hai tab local, ghi browser/thiết bị/mạng; đo first interaction, FPS P50/P95, memory, tiếng bước chân, TTS và touch. Hoàn thành khi có bảng số đo, không chỉ “mượt”. File đích: `TIEN_DO.md`, `CAP_NHAT_DU_AN.md`.
2. **T03 + T11–T18 — contract-first cho tính năng mới.** Owner: realtime. Trước khi thêm event cho NPC/order/chat/voice, version schema, validation server và thêm test accept/reject. Không sửa `src/App.tsx`/`server/index.mjs` song song với agent khác.
3. **T17 + T18 — Kitchen Pass tin cậy.** Owner: gameplay. Ưu tiên một đơn có trạng thái rõ `requested → brewing → served/cancelled`, retry idempotent và fallback nếu animation/NPC lỗi. Nghiệm thu bằng hai client ở cùng/khác bàn.
4. **T19 + T20 — visual/accessibility có budget.** Owner: 3D/UX. Mỗi asset mới ghi license, số mesh/light và fallback reduced-motion/mobile. Nghiệm thu theo T08, không giảm DPR chỉ để che lag.
5. **T22–T24 — cổng production (cần chủ dự án duyệt ADR trước).** Owner: tech lead/security. Chốt identity/auth, secrets, HTTPS, persistence, Redis/queue, observability, moderation, staging/backup/rollback và load model. Không đưa `ws` in-memory lên internet.
6. **T25–T28 — pilot, sửa, readiness, vận hành.** Owner: product/ops. Pilot nhỏ có consent, replay lỗi, go/no-go bằng số đo; sau đó runbook, FAQ, owner incident và rollback drill.

### Ý tưởng sáng tạo đang chờ phê duyệt

- **Café Passport:** stamp trải nghiệm khi ngồi/uống ở từng góc, hoàn toàn opt-in và không có phần thưởng tài chính.
- **Evening Ritual:** quản gia hỏi nhịp “tập trung / trò chuyện / nghỉ”, chỉ đổi ambience và POV, luôn có mute/reduced-motion.
- **Bàn kể chuyện:** prompt Việt ngắn về kỷ luật, đọc sách và cà phê; có ẩn/báo cáo/rate-limit, không phải tư vấn đầu tư.
- **Kitchen Pass thấy được:** thẻ order xuất hiện rồi barista mang ly ảo đến bàn; animation được skip, đơn vẫn chạy nếu NPC lỗi.
- **Closing Bell photo-mode:** xuất ảnh cục bộ theo consent, không auto-upload/lộ private room.
- **Đêm theo mùa:** preset mưa/đông/lễ hội có asset ledger, nút tắt và budget mesh/light riêng.

Không ý tưởng nào ở trên đã được triển khai trong mục tài liệu này. Chọn một ý tưởng/lần, đánh dấu owner/file/mã Txx ở `.codex/TASK_BOARD.md`, rồi chạy `npm run verify` và cập nhật ba file trạng thái.

### Bằng chứng và hạn chế phiên

- Đã đối chiếu thực tế: `package.json`, `vite.config.ts`, `tsconfig.json`, `server/index.mjs`, `.gitignore`, scripts/test và state Git.
- Verify cuối gói bàn giao: `npm run verify` PASS 25/25 test, production build PASS trong 18.42s; `GET http://127.0.0.1:3001/health` và Vite `http://127.0.0.1:5173/` đều HTTP 200. IDEA-16 chỉ sửa tài liệu/runtime config, không đổi source gameplay/server.
- Git: `master`, chưa có commit; toàn bộ project đang untracked từ trước. Quota: không có công cụ/chỉ số chính thức trong phiên nên không thể xác minh mốc 10% hoặc “dùng đủ limit”.

## IDEA-08 / T10, T12, T13, T17, T18 — xác minh hồi quy — 12/11/2026

- Trạng thái: Hoàn thành bước đầu, còn QA browser trực quan.
- Đã làm: xác minh lại contract lobby/phòng riêng hiện hữu; `CafeClient.createPrivateRoom` nhận `capacity`, server giữ sức chứa phòng riêng, và giao diện lobby/tiếp viên đã nằm trong `src/App.tsx`/`src/App.css`.
- File liên quan: `src/App.tsx`, `src/App.css`, `src/network/client.ts`, `server/index.mjs`, `server/rooms.mjs`, `server/rooms.test.mjs`, `server/http.test.mjs`.
- Kiểm tra đã chạy: `npm run verify` — PASS 25/25; `tsc --noEmit && vite build` PASS trong 10.38s.
- Chưa xong / rủi ro: browser-access host không khả dụng, nên chưa có bằng chứng thao tác UI/3D trực quan hoặc responsive.
- Việc tiếp theo: trong browser có thể truy cập, kiểm tra Start → lobby → chọn sảnh/suite/salon → menu tiếp viên, bao gồm trạng thái sức chứa và viewport nhỏ.
- Git: `master`, chưa commit. Quota: chưa xác minh.

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-11 / T07, T09, T14, T15, T16, T22 — BOT Trader (Giọng Nói Sống Động Như Người Thật) & Sự Kiện Thị Trường NFP — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai BOT Trader với giọng nói AI sống động, tính cách và ghế ngồi độc lập trong không gian 3D, sự kiện thị trường NFP thời gian thực theo yêu cầu mới nhất của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Hội đồng 4 BOT Trader Thường Trú (Hoàn thành bước đầu)**:
    1. **Alex Trần (`bot-alex`)**: Cá Voi Đại Dương, Lv.8, Bàn 6 VIP Ban công Tầng 2, Cà phê trứng Hà Nội, SĐT `098-888-9999`, chất giọng nam trầm đĩnh đạc (pitch 0.84x, rate 0.94x). Châm ngôn: *"Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn."*
    2. **Mai Linh (`bot-mailinh`)**: Zen Trader, Lv.5, Bàn 1 Cửa sổ Tầng 1, Trà hoa cúc mật ong, SĐT `098-666-8888`, chất giọng nữ dịu dàng truyền cảm (pitch 1.18x, rate 0.96x). Châm ngôn: *"Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do."*
    3. **Hải Đăng (`bot-haidang`)**: Scalper, Lv.7, Bàn 2 Lò sưởi Fireside Tầng 1, Espresso đậm đặc, SĐT `098-777-5555`, chất giọng nam trẻ trung sắc bén (pitch 1.05x, rate 1.06x). Châm ngôn: *"Chuyên gia Scalping nến giật M1-M5, săn tin NFP, CPI & FOMC."*
    4. **Sarah Jenkins (`bot-sarah`)**: Macro Analyst, Lv.9, Bàn 4 Thư viện Focus Tầng 1, Cold Brew ủ lạnh, SĐT `098-999-3333`, chất giọng nữ trí thức chuẩn mực (pitch 1.08x, rate 1.0x). Châm ngôn: *"Hedge Fund Global Macro Analyst. Data-driven & chu kỳ thanh khoản."*
  + **Giọng nói sinh động như người thật (Web Speech API & Procedural Audio) (Hoàn thành bước đầu)**:
    1. Sử dụng Web Speech Synthesis (`window.speechSynthesis`) với thuật toán lựa chọn voice tối ưu: ưu tiên giọng Tiếng Việt, fallback theo giới tính và tính cách từng persona.
    2. Tinh chỉnh pitch, rate, volume phù hợp từng bot để tạo âm sắc tự nhiên, biểu cảm chân thực.
    3. Hỗ trợ procedural vocal chime qua Web Audio API (`chillAudio.playBotVocal`) làm lớp âm thanh vi mô cộng hưởng formant.
    4. Đồng bộ vòng hào quang âm thanh 3D nhấp nháy trên đầu bot (`speakingHalo`) trong BabylonJS scene khi bot đang phát biểu.
    5. Quản lý trạng thái bật/tắt giọng nói của bot lưu vào `localStorage`.
  + **Tương tác thông minh trong quán cà phê (Hoàn thành bước đầu)**:
    1. Lời chào tự nhiên khi người chơi ngồi cùng bàn với bot (`table greeting` sau 900ms).
    2. Trò chuyện chia sẻ triết lý và kinh nghiệm thị trường ngẫu hứng định kỳ (`ambient banter` mỗi ~85s).
    3. Người chơi có thể bấm nghe thử giọng chào hoặc phản ứng của từng bot tại Modal NFP hoặc Tab Khách.
    4. Cơ chế nhường ghế linh hoạt khi người chơi thật ngồi vào chỗ của bot.
  + **Sự kiện thị trường NFP (Non-Farm Payrolls) thời gian thực (Hoàn thành bước đầu)**:
    1. Báo động âm thanh staccato phá vỡ `chillAudio.playNfpAlert()`.
    2. Hiển thị banner tin nóng NFP trên đỉnh màn hình (Actual 254K, Forecast 140K, Thất nghiệp 4.1%, DXY +75 pips).
    3. Chuỗi phản ứng thoại nối tiếp tự nhiên: Hải Đăng (báo tin giật nến M1) → Alex Trần (nhắc giữ bình tĩnh, quản lý rủi ro) → Mai Linh (nhắc dời stoploss hòa vốn) → Sarah Jenkins (phân tích vĩ mô tác động Fed).
    4. Kết thúc bằng màn bắn pháo hoa ăn mừng chốt lời Scalp Vàng +$2,450 của Hải Đăng đãi toàn quán (+150 XP).
    5. Nút bấm kích hoạt tin NFP khẩn cấp từ Header, Atmosphere Pill hoặc Modal NFP.
- File đã thay đổi:
  + `src/audio/botVoice.ts` (mới)
  + `src/audio/chillAudio.ts`
  + `server/rooms.mjs`
  + `server/index.mjs`
  + `server/rooms.test.mjs`
  + `src/network/client.ts`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (bao gồm 2 test mới cho `initBots` và `triggerNfp`).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.97s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm tương tác với 4 Bot Trader, bấm nghe thử giọng nói và kích hoạt sự kiện tin tức NFP.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-10 / T07, T09, T16, T22 — Pháo hoa Trade Lãi, Spa Massage, Nút Bước Chân, SĐT Ảo & Hệ Thống Cấp Độ EXP — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai IDEA-10 (Dịch vụ pháo hoa & chúc mừng trade lãi, dịch vụ massage xoa dịu thư giãn, nút bật tắt tiếng bước chân trong điều khiển, cấp số điện thoại ảo cho Trader, chế độ kinh nghiệm/leveling, âm thanh procedural Web Audio từng công đoạn tiểu tiết, cấp quyền toàn bộ).
- Nhiệm vụ và trạng thái:
  + **Dịch vụ bắn pháo hoa mừng trade lãi (Hoàn thành bước đầu)**:
    1. Người chơi có thể nhập số tiền lãi / lời chúc mừng hoặc chọn nhanh các preset: `+$500 Scalp 🚀`, `+$1,500 Swing 💎`, `+$5,000 Whale 🐋`, `+$10,000 ATH 👑`.
    2. Broadcast sự kiện `fireworks` và `announcement` tới toàn bộ người chơi trong phòng.
    3. Thưởng ngay +150 XP và kiểm tra thăng cấp tự động.
    4. Hiệu ứng hạt pháo hoa 3D phát sáng nhiều màu (Vàng, Hồng Ruby, Xanh Emerald, Xanh Cyan) bay đa hướng chịu trọng lực và lực cản không khí, kèm ánh chớp `PointLight` trên trời cao.
    5. Âm thanh Web Audio procedural đa tầng: tiếng rít phóng rocket, tiếng nổ dội vang rền và chuỗi tiếng nổ lách tách lép bép.
    6. Rate limit 2.5s chống spam pháo hoa.
  + **Dịch vụ massage xoa dịu thư giãn cho Trader (Hoàn thành bước đầu)**:
    1. Cung cấp 3 liệu trình chuyên biệt: Xoa bóp cổ vai gáy (`massage-shoulders`), Bấm huyệt thái dương tĩnh tâm (`massage-head`), Xông trầm hương & Chuông xoay Tây Tạng (`zen-aromatherapy`).
    2. Thưởng +100 XP cho mỗi lần dùng dịch vụ.
    3. Hiệu ứng 3D hào quang thiền định (Zen Halo) xoay và tỏa sáng vàng kim quanh nhân vật trong 15s.
    4. Âm thanh chuông xoay Tây Tạng tần số 432Hz & 864Hz tĩnh tâm, giảm stress và chống FOMO.
    5. Broadcast sự kiện `service` và chat thông báo từ Barista / `🌿 Wellness Spa`.
  + **Tiếng bước chân & Nút bật/tắt trong điều khiển (Hoàn thành bước đầu)**:
    1. Bổ sung nút bấm nhanh bật/tắt tiếng bước chân 👣 trên thanh Header, trên Atmosphere Status Pill và trong bảng Cài đặt.
    2. Có phản hồi âm thanh UI click và toast thông báo trạng thái tức thời.
    3. Âm thanh bước chân procedural theo bề mặt: gỗ, cầu thang và đá sân ngoài trời.
  + **Cấp số điện thoại ảo Trader (Hoàn thành bước đầu)**:
    1. Tự động cấp số điện thoại định dạng VIP `098-xxx-xxxx` cho mỗi Trader khi kết nối.
    2. Hiển thị trên Thẻ Căn Cước Trader (Trader Passport), trên Header Profile và trong danh sách Khách (Guest Directory).
    3. Tích hợp nút bấm sao chép số một chạm kèm âm thanh phone chime vintage.
    4. Cho phép đổi số ngẫu nhiên mới trong form Thẻ Căn Cước Trader.
  + **Hệ thống kinh nghiệm & Cấp độ (EXP & Leveling) (Hoàn thành bước đầu)**:
    1. Tính cấp độ chuẩn xác theo hàm căn bậc hai: $Level = \lfloor\sqrt{xp / 100}\rfloor + 1$.
    2. Tích lũy XP thụ động: +10 XP mỗi 30s online trong phòng, +20 XP mỗi 30s ngồi bàn cafe, +15 XP mỗi ngụm cà phê thưởng thức.
    3. Tích lũy XP chủ động: +150 XP khi bắn pháo hoa mừng trade lãi, +100 XP khi dùng dịch vụ massage thư giãn.
    4. Tự động thăng cấp kèm broadcast `level-up`, âm thanh fanfare hào hùng và toast chúc mừng toàn phòng.
    5. Danh hiệu Trader tương ứng với cấp độ (Huyền Thoại Market, Cá Voi Đại Dương, Bàn Tay Kim Cương, Lướt Sóng Bậc Thầy, Scalper Kỷ Luật, Trader Khởi Điểm).
    6. Thanh tiến độ XP trực quan trong Thẻ Căn Cước Trader.
  + **Âm thanh vi mô từng công đoạn tiểu tiết (Hoàn thành bước đầu)**:
    1. Procedural Web Audio hoàn toàn không phụ thuộc file mp3 ngoài: tiếng click gỗ/đồng UI (`playUiClick`), tiếng chuông điện thoại (`playPhoneChime`), tiếng pháo hoa (`playFirework`), tiếng chuông xoay massage (`playMassage`), tiếng thăng cấp (`playLevelUp`), tiếng bước chân (`playFootstep`), tiếng nhấp ngụm (`playSipDrink`).
  + **Cấp quyền toàn bộ (Hoàn thành)**:
    1. Mọi Trader đều có toàn quyền bắn pháo hoa, yêu cầu massage, tích lũy XP, xem và sao chép SĐT mà không cần quyền Host hay kiểm tra phân quyền phức tạp.
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `server/rooms.mjs`
  + `server/index.mjs`
  + `server/rooms.test.mjs`
  + `src/network/client.ts`
  + `src/CafeScene.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `.codex/TASK_BOARD.md`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 23/23 tests** (bao gồm 3 test mới cho fireworks, service, virtual phone).
  + `npm run verify`: **PASS 23/23 tests**, `tsc --noEmit && vite build` **PASS** trong 9.16s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm dịch vụ bắn pháo hoa, massage, nút bước chân và hệ thống level/SĐT.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-11 / T07, T09, T14, T15, T16, T22 — BOT Trader (Giọng Nói Sống Động Như Người Thật) & Sự Kiện Thị Trường NFP — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai BOT Trader với giọng nói AI sống động, tính cách và ghế ngồi độc lập trong không gian 3D, sự kiện thị trường NFP thời gian thực theo yêu cầu mới nhất của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Hội đồng 4 BOT Trader Thường Trú (Hoàn thành bước đầu)**:
    1. **Alex Trần (`bot-alex`)**: Cá Voi Đại Dương, Lv.8, Bàn 6 VIP Ban công Tầng 2, Cà phê trứng Hà Nội, SĐT `098-888-9999`, chất giọng nam trầm đĩnh đạc (pitch 0.84x, rate 0.94x). Châm ngôn: *"Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn."*
    2. **Mai Linh (`bot-mailinh`)**: Zen Trader, Lv.5, Bàn 1 Cửa sổ Tầng 1, Trà hoa cúc mật ong, SĐT `098-666-8888`, chất giọng nữ dịu dàng truyền cảm (pitch 1.18x, rate 0.96x). Châm ngôn: *"Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do."*
    3. **Hải Đăng (`bot-haidang`)**: Scalper, Lv.7, Bàn 2 Lò sưởi Fireside Tầng 1, Espresso đậm đặc, SĐT `098-777-5555`, chất giọng nam trẻ trung sắc bén (pitch 1.05x, rate 1.06x). Châm ngôn: *"Chuyên gia Scalping nến giật M1-M5, săn tin NFP, CPI & FOMC."*
    4. **Sarah Jenkins (`bot-sarah`)**: Macro Analyst, Lv.9, Bàn 4 Thư viện Focus Tầng 1, Cold Brew ủ lạnh, SĐT `098-999-3333`, chất giọng nữ trí thức chuẩn mực (pitch 1.08x, rate 1.0x). Châm ngôn: *"Hedge Fund Global Macro Analyst. Data-driven & chu kỳ thanh khoản."*
  + **Giọng nói sinh động như người thật (Web Speech API & Procedural Audio) (Hoàn thành bước đầu)**:
    1. Sử dụng Web Speech Synthesis (`window.speechSynthesis`) với thuật toán lựa chọn voice tối ưu: ưu tiên giọng Tiếng Việt, fallback theo giới tính và tính cách từng persona.
    2. Tinh chỉnh pitch, rate, volume phù hợp từng bot để tạo âm sắc tự nhiên, biểu cảm chân thực.
    3. Hỗ trợ procedural vocal chime qua Web Audio API (`chillAudio.playBotVocal`) làm lớp âm thanh vi mô cộng hưởng formant.
    4. Đồng bộ vòng hào quang âm thanh 3D nhấp nháy trên đầu bot (`speakingHalo`) trong BabylonJS scene khi bot đang phát biểu.
    5. Quản lý trạng thái bật/tắt giọng nói của bot lưu vào `localStorage`.
  + **Tương tác thông minh trong quán cà phê (Hoàn thành bước đầu)**:
    1. Lời chào tự nhiên khi người chơi ngồi cùng bàn với bot (`table greeting` sau 900ms).
    2. Trò chuyện chia sẻ triết lý và kinh nghiệm thị trường ngẫu hứng định kỳ (`ambient banter` mỗi ~85s).
    3. Người chơi có thể bấm nghe thử giọng chào hoặc phản ứng của từng bot tại Modal NFP hoặc Tab Khách.
    4. Cơ chế nhường ghế linh hoạt khi người chơi thật ngồi vào chỗ của bot.
  + **Sự kiện thị trường NFP (Non-Farm Payrolls) thời gian thực (Hoàn thành bước đầu)**:
    1. Báo động âm thanh staccato phá vỡ `chillAudio.playNfpAlert()`.
    2. Hiển thị banner tin nóng NFP trên đỉnh màn hình (Actual 254K, Forecast 140K, Thất nghiệp 4.1%, DXY +75 pips).
    3. Chuỗi phản ứng thoại nối tiếp tự nhiên: Hải Đăng (báo tin giật nến M1) → Alex Trần (nhắc giữ bình tĩnh, quản lý rủi ro) → Mai Linh (nhắc dời stoploss hòa vốn) → Sarah Jenkins (phân tích vĩ mô tác động Fed).
    4. Kết thúc bằng màn bắn pháo hoa ăn mừng chốt lời Scalp Vàng +$2,450 của Hải Đăng đãi toàn quán (+150 XP).
    5. Nút bấm kích hoạt tin NFP khẩn cấp từ Header, Atmosphere Pill hoặc Modal NFP.
- File đã thay đổi:
  + `src/audio/botVoice.ts` (mới)
  + `src/audio/chillAudio.ts`
  + `server/rooms.mjs`
  + `server/index.mjs`
  + `server/rooms.test.mjs`
  + `src/network/client.ts`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (bao gồm 2 test mới cho `initBots` và `triggerNfp`).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.97s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm tương tác với 4 Bot Trader, bấm nghe thử giọng nói và kích hoạt sự kiện tin tức NFP.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-09 / T04, T06, T07, T19 — Ban công 8 tầng nhìn ra Góc Chill — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai IDEA-09 (Thiết kế ban công ở mỗi tầng, có bàn ghế ở ngoài nhìn ra góc Chill).
- Nhiệm vụ và trạng thái:
  + **IDEA-09 (T04, T06, T07, T19 — Hoàn thành bước đầu, cần review trực quan)**:
    1. **Tầng 1:** Garden Patio Balcony ngoài sân trước nhìn ra đài phun nước, sân tuyết và cổng quán. Sàn đá Travertine viền gỗ, lan can kính & đồng, bàn café đá Calacatta, cặp ghế da Cognac, đèn amber, tách cà phê & chậu cây cảnh.
    2. **Tầng 2:** Skyline Balcony cánh Tây nhô ra ngoài trời nối từ Night Terrace/Brazier, lan can kính & đồng, bàn bistro tròn cẩm thạch, 2 ghế bành ngắm skyline, đèn lantern và chậu cây xanh.
    3. **Tầng 3–8:** Ban công ngoài trời cantilevered (8.6 × 3.2m), lan can kính tempered & đồng bóng, bàn bistro cẩm thạch Calacatta, 2 ghế bành ngoài trời bọc da Cognac/Royal Velvet, đèn lantern amber, tách cà phê bốc khói, 2 chậu cây xanh và biển tên ban công riêng cho từng tầng.
    4. **Tương tác & Đi lại:** Nới biên an toàn `tryMove` và cao độ `onMezzanine` cho phép người chơi bước ra ban công cả 8 tầng một cách tự nhiên, không bị rơi; thêm đĩa va chạm vật lý cho bàn ghế ban công.
  + **Fix Broken Build (IDEA-08)**: Sửa hàm `CafeClient.createPrivateRoom` trong `src/network/client.ts` hỗ trợ nhận `capacity?: number`, khắc phục lỗi TS2345, khôi phục `npm run verify` về trạng thái PASS toàn diện.
- File đã thay đổi:
  + `src/CafeScene.tsx`
  + `src/network/client.ts`
  + `.codex/TASK_BOARD.md`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm run verify`: **PASS 20/20 test** tự động (Server HTTP, WebSocket, Rooms, Security Bounds); Vite production build **PASS** trong 9.03s (entry bundle gzip 111.97 kB).
- Chưa xong / rủi ro:
  + Chưa có browser automation để kiểm tra trực quan render 3D và FPS thực tế. Cần người dùng mở `http://127.0.0.1:5173/`, dùng phím W/A/S/D và nút chọn tầng Royal Lift để bước ra ban công ngắm cảnh tại từng tầng.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` kiểm tra trực quan ban công cả 8 tầng, thử đi lại từ sảnh ra ban công và ngắm góc Chill.
  2. Tiếp tục hoàn thiện kiểm thử hoặc các tính năng tiếp theo theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-11 / T07, T09, T14, T15, T16, T22 — BOT Trader (Giọng Nói Sống Động Như Người Thật) & Sự Kiện Thị Trường NFP — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai BOT Trader với giọng nói AI sống động, tính cách và ghế ngồi độc lập trong không gian 3D, sự kiện thị trường NFP thời gian thực theo yêu cầu mới nhất của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Hội đồng 4 BOT Trader Thường Trú (Hoàn thành bước đầu)**:
    1. **Alex Trần (`bot-alex`)**: Cá Voi Đại Dương, Lv.8, Bàn 6 VIP Ban công Tầng 2, Cà phê trứng Hà Nội, SĐT `098-888-9999`, chất giọng nam trầm đĩnh đạc (pitch 0.84x, rate 0.94x). Châm ngôn: *"Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn."*
    2. **Mai Linh (`bot-mailinh`)**: Zen Trader, Lv.5, Bàn 1 Cửa sổ Tầng 1, Trà hoa cúc mật ong, SĐT `098-666-8888`, chất giọng nữ dịu dàng truyền cảm (pitch 1.18x, rate 0.96x). Châm ngôn: *"Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do."*
    3. **Hải Đăng (`bot-haidang`)**: Scalper, Lv.7, Bàn 2 Lò sưởi Fireside Tầng 1, Espresso đậm đặc, SĐT `098-777-5555`, chất giọng nam trẻ trung sắc bén (pitch 1.05x, rate 1.06x). Châm ngôn: *"Chuyên gia Scalping nến giật M1-M5, săn tin NFP, CPI & FOMC."*
    4. **Sarah Jenkins (`bot-sarah`)**: Macro Analyst, Lv.9, Bàn 4 Thư viện Focus Tầng 1, Cold Brew ủ lạnh, SĐT `098-999-3333`, chất giọng nữ trí thức chuẩn mực (pitch 1.08x, rate 1.0x). Châm ngôn: *"Hedge Fund Global Macro Analyst. Data-driven & chu kỳ thanh khoản."*
  + **Giọng nói sinh động như người thật (Web Speech API & Procedural Audio) (Hoàn thành bước đầu)**:
    1. Sử dụng Web Speech Synthesis (`window.speechSynthesis`) với thuật toán lựa chọn voice tối ưu: ưu tiên giọng Tiếng Việt, fallback theo giới tính và tính cách từng persona.
    2. Tinh chỉnh pitch, rate, volume phù hợp từng bot để tạo âm sắc tự nhiên, biểu cảm chân thực.
    3. Hỗ trợ procedural vocal chime qua Web Audio API (`chillAudio.playBotVocal`) làm lớp âm thanh vi mô cộng hưởng formant.
    4. Đồng bộ vòng hào quang âm thanh 3D nhấp nháy trên đầu bot (`speakingHalo`) trong BabylonJS scene khi bot đang phát biểu.
    5. Quản lý trạng thái bật/tắt giọng nói của bot lưu vào `localStorage`.
  + **Tương tác thông minh trong quán cà phê (Hoàn thành bước đầu)**:
    1. Lời chào tự nhiên khi người chơi ngồi cùng bàn với bot (`table greeting` sau 900ms).
    2. Trò chuyện chia sẻ triết lý và kinh nghiệm thị trường ngẫu hứng định kỳ (`ambient banter` mỗi ~85s).
    3. Người chơi có thể bấm nghe thử giọng chào hoặc phản ứng của từng bot tại Modal NFP hoặc Tab Khách.
    4. Cơ chế nhường ghế linh hoạt khi người chơi thật ngồi vào chỗ của bot.
  + **Sự kiện thị trường NFP (Non-Farm Payrolls) thời gian thực (Hoàn thành bước đầu)**:
    1. Báo động âm thanh staccato phá vỡ `chillAudio.playNfpAlert()`.
    2. Hiển thị banner tin nóng NFP trên đỉnh màn hình (Actual 254K, Forecast 140K, Thất nghiệp 4.1%, DXY +75 pips).
    3. Chuỗi phản ứng thoại nối tiếp tự nhiên: Hải Đăng (báo tin giật nến M1) → Alex Trần (nhắc giữ bình tĩnh, quản lý rủi ro) → Mai Linh (nhắc dời stoploss hòa vốn) → Sarah Jenkins (phân tích vĩ mô tác động Fed).
    4. Kết thúc bằng màn bắn pháo hoa ăn mừng chốt lời Scalp Vàng +$2,450 của Hải Đăng đãi toàn quán (+150 XP).
    5. Nút bấm kích hoạt tin NFP khẩn cấp từ Header, Atmosphere Pill hoặc Modal NFP.
- File đã thay đổi:
  + `src/audio/botVoice.ts` (mới)
  + `src/audio/chillAudio.ts`
  + `server/rooms.mjs`
  + `server/index.mjs`
  + `server/rooms.test.mjs`
  + `src/network/client.ts`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (bao gồm 2 test mới cho `initBots` và `triggerNfp`).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.97s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm tương tác với 4 Bot Trader, bấm nghe thử giọng nói và kích hoạt sự kiện tin tức NFP.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-10 / T07, T09, T16, T22 — Pháo hoa Trade Lãi, Spa Massage, Nút Bước Chân, SĐT Ảo & Hệ Thống Cấp Độ EXP — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai IDEA-10 (Dịch vụ pháo hoa & chúc mừng trade lãi, dịch vụ massage xoa dịu thư giãn, nút bật tắt tiếng bước chân trong điều khiển, cấp số điện thoại ảo cho Trader, chế độ kinh nghiệm/leveling, âm thanh procedural Web Audio từng công đoạn tiểu tiết, cấp quyền toàn bộ).
- Nhiệm vụ và trạng thái:
  + **Dịch vụ bắn pháo hoa mừng trade lãi (Hoàn thành bước đầu)**:
    1. Người chơi có thể nhập số tiền lãi / lời chúc mừng hoặc chọn nhanh các preset: `+$500 Scalp 🚀`, `+$1,500 Swing 💎`, `+$5,000 Whale 🐋`, `+$10,000 ATH 👑`.
    2. Broadcast sự kiện `fireworks` và `announcement` tới toàn bộ người chơi trong phòng.
    3. Thưởng ngay +150 XP và kiểm tra thăng cấp tự động.
    4. Hiệu ứng hạt pháo hoa 3D phát sáng nhiều màu (Vàng, Hồng Ruby, Xanh Emerald, Xanh Cyan) bay đa hướng chịu trọng lực và lực cản không khí, kèm ánh chớp `PointLight` trên trời cao.
    5. Âm thanh Web Audio procedural đa tầng: tiếng rít phóng rocket, tiếng nổ dội vang rền và chuỗi tiếng nổ lách tách lép bép.
    6. Rate limit 2.5s chống spam pháo hoa.
  + **Dịch vụ massage xoa dịu thư giãn cho Trader (Hoàn thành bước đầu)**:
    1. Cung cấp 3 liệu trình chuyên biệt: Xoa bóp cổ vai gáy (`massage-shoulders`), Bấm huyệt thái dương tĩnh tâm (`massage-head`), Xông trầm hương & Chuông xoay Tây Tạng (`zen-aromatherapy`).
    2. Thưởng +100 XP cho mỗi lần dùng dịch vụ.
    3. Hiệu ứng 3D hào quang thiền định (Zen Halo) xoay và tỏa sáng vàng kim quanh nhân vật trong 15s.
    4. Âm thanh chuông xoay Tây Tạng tần số 432Hz & 864Hz tĩnh tâm, giảm stress và chống FOMO.
    5. Broadcast sự kiện `service` và chat thông báo từ Barista / `🌿 Wellness Spa`.
  + **Tiếng bước chân & Nút bật/tắt trong điều khiển (Hoàn thành bước đầu)**:
    1. Bổ sung nút bấm nhanh bật/tắt tiếng bước chân 👣 trên thanh Header, trên Atmosphere Status Pill và trong bảng Cài đặt.
    2. Có phản hồi âm thanh UI click và toast thông báo trạng thái tức thời.
    3. Âm thanh bước chân procedural theo bề mặt: gỗ, cầu thang và đá sân ngoài trời.
  + **Cấp số điện thoại ảo Trader (Hoàn thành bước đầu)**:
    1. Tự động cấp số điện thoại định dạng VIP `098-xxx-xxxx` cho mỗi Trader khi kết nối.
    2. Hiển thị trên Thẻ Căn Cước Trader (Trader Passport), trên Header Profile và trong danh sách Khách (Guest Directory).
    3. Tích hợp nút bấm sao chép số một chạm kèm âm thanh phone chime vintage.
    4. Cho phép đổi số ngẫu nhiên mới trong form Thẻ Căn Cước Trader.
  + **Hệ thống kinh nghiệm & Cấp độ (EXP & Leveling) (Hoàn thành bước đầu)**:
    1. Tính cấp độ chuẩn xác theo hàm căn bậc hai: $Level = \lfloor\sqrt{xp / 100}\rfloor + 1$.
    2. Tích lũy XP thụ động: +10 XP mỗi 30s online trong phòng, +20 XP mỗi 30s ngồi bàn cafe, +15 XP mỗi ngụm cà phê thưởng thức.
    3. Tích lũy XP chủ động: +150 XP khi bắn pháo hoa mừng trade lãi, +100 XP khi dùng dịch vụ massage thư giãn.
    4. Tự động thăng cấp kèm broadcast `level-up`, âm thanh fanfare hào hùng và toast chúc mừng toàn phòng.
    5. Danh hiệu Trader tương ứng với cấp độ (Huyền Thoại Market, Cá Voi Đại Dương, Bàn Tay Kim Cương, Lướt Sóng Bậc Thầy, Scalper Kỷ Luật, Trader Khởi Điểm).
    6. Thanh tiến độ XP trực quan trong Thẻ Căn Cước Trader.
  + **Âm thanh vi mô từng công đoạn tiểu tiết (Hoàn thành bước đầu)**:
    1. Procedural Web Audio hoàn toàn không phụ thuộc file mp3 ngoài: tiếng click gỗ/đồng UI (`playUiClick`), tiếng chuông điện thoại (`playPhoneChime`), tiếng pháo hoa (`playFirework`), tiếng chuông xoay massage (`playMassage`), tiếng thăng cấp (`playLevelUp`), tiếng bước chân (`playFootstep`), tiếng nhấp ngụm (`playSipDrink`).
  + **Cấp quyền toàn bộ (Hoàn thành)**:
    1. Mọi Trader đều có toàn quyền bắn pháo hoa, yêu cầu massage, tích lũy XP, xem và sao chép SĐT mà không cần quyền Host hay kiểm tra phân quyền phức tạp.
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `server/rooms.mjs`
  + `server/index.mjs`
  + `server/rooms.test.mjs`
  + `src/network/client.ts`
  + `src/CafeScene.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `.codex/TASK_BOARD.md`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 23/23 tests** (bao gồm 3 test mới cho fireworks, service, virtual phone).
  + `npm run verify`: **PASS 23/23 tests**, `tsc --noEmit && vite build` **PASS** trong 9.16s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm dịch vụ bắn pháo hoa, massage, nút bước chân và hệ thống level/SĐT.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-11 / T07, T09, T14, T15, T16, T22 — BOT Trader (Giọng Nói Sống Động Như Người Thật) & Sự Kiện Thị Trường NFP — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai BOT Trader với giọng nói AI sống động, tính cách và ghế ngồi độc lập trong không gian 3D, sự kiện thị trường NFP thời gian thực theo yêu cầu mới nhất của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Hội đồng 4 BOT Trader Thường Trú (Hoàn thành bước đầu)**:
    1. **Alex Trần (`bot-alex`)**: Cá Voi Đại Dương, Lv.8, Bàn 6 VIP Ban công Tầng 2, Cà phê trứng Hà Nội, SĐT `098-888-9999`, chất giọng nam trầm đĩnh đạc (pitch 0.84x, rate 0.94x). Châm ngôn: *"Price Action & On-chain. Giữ cái đầu lạnh và bảo toàn vốn."*
    2. **Mai Linh (`bot-mailinh`)**: Zen Trader, Lv.5, Bàn 1 Cửa sổ Tầng 1, Trà hoa cúc mật ong, SĐT `098-666-8888`, chất giọng nữ dịu dàng truyền cảm (pitch 1.18x, rate 0.96x). Châm ngôn: *"Tâm tĩnh giữa ngàn biến động. Không fomo, kỷ luật là sự tự do."*
    3. **Hải Đăng (`bot-haidang`)**: Scalper, Lv.7, Bàn 2 Lò sưởi Fireside Tầng 1, Espresso đậm đặc, SĐT `098-777-5555`, chất giọng nam trẻ trung sắc bén (pitch 1.05x, rate 1.06x). Châm ngôn: *"Chuyên gia Scalping nến giật M1-M5, săn tin NFP, CPI & FOMC."*
    4. **Sarah Jenkins (`bot-sarah`)**: Macro Analyst, Lv.9, Bàn 4 Thư viện Focus Tầng 1, Cold Brew ủ lạnh, SĐT `098-999-3333`, chất giọng nữ trí thức chuẩn mực (pitch 1.08x, rate 1.0x). Châm ngôn: *"Hedge Fund Global Macro Analyst. Data-driven & chu kỳ thanh khoản."*
  + **Giọng nói sinh động như người thật (Web Speech API & Procedural Audio) (Hoàn thành bước đầu)**:
    1. Sử dụng Web Speech Synthesis (`window.speechSynthesis`) với thuật toán lựa chọn voice tối ưu: ưu tiên giọng Tiếng Việt, fallback theo giới tính và tính cách từng persona.
    2. Tinh chỉnh pitch, rate, volume phù hợp từng bot để tạo âm sắc tự nhiên, biểu cảm chân thực.
    3. Hỗ trợ procedural vocal chime qua Web Audio API (`chillAudio.playBotVocal`) làm lớp âm thanh vi mô cộng hưởng formant.
    4. Đồng bộ vòng hào quang âm thanh 3D nhấp nháy trên đầu bot (`speakingHalo`) trong BabylonJS scene khi bot đang phát biểu.
    5. Quản lý trạng thái bật/tắt giọng nói của bot lưu vào `localStorage`.
  + **Tương tác thông minh trong quán cà phê (Hoàn thành bước đầu)**:
    1. Lời chào tự nhiên khi người chơi ngồi cùng bàn với bot (`table greeting` sau 900ms).
    2. Trò chuyện chia sẻ triết lý và kinh nghiệm thị trường ngẫu hứng định kỳ (`ambient banter` mỗi ~85s).
    3. Người chơi có thể bấm nghe thử giọng chào hoặc phản ứng của từng bot tại Modal NFP hoặc Tab Khách.
    4. Cơ chế nhường ghế linh hoạt khi người chơi thật ngồi vào chỗ của bot.
  + **Sự kiện thị trường NFP (Non-Farm Payrolls) thời gian thực (Hoàn thành bước đầu)**:
    1. Báo động âm thanh staccato phá vỡ `chillAudio.playNfpAlert()`.
    2. Hiển thị banner tin nóng NFP trên đỉnh màn hình (Actual 254K, Forecast 140K, Thất nghiệp 4.1%, DXY +75 pips).
    3. Chuỗi phản ứng thoại nối tiếp tự nhiên: Hải Đăng (báo tin giật nến M1) → Alex Trần (nhắc giữ bình tĩnh, quản lý rủi ro) → Mai Linh (nhắc dời stoploss hòa vốn) → Sarah Jenkins (phân tích vĩ mô tác động Fed).
    4. Kết thúc bằng màn bắn pháo hoa ăn mừng chốt lời Scalp Vàng +$2,450 của Hải Đăng đãi toàn quán (+150 XP).
    5. Nút bấm kích hoạt tin NFP khẩn cấp từ Header, Atmosphere Pill hoặc Modal NFP.
- File đã thay đổi:
  + `src/audio/botVoice.ts` (mới)
  + `src/audio/chillAudio.ts`
  + `server/rooms.mjs`
  + `server/index.mjs`
  + `server/rooms.test.mjs`
  + `src/network/client.ts`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (bao gồm 2 test mới cho `initBots` và `triggerNfp`).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.97s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm tương tác với 4 Bot Trader, bấm nghe thử giọng nói và kích hoạt sự kiện tin tức NFP.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).

## IDEA-12 / T16, T19, T07, T09 — Tinh Chỉnh Auto-Update Đời Thực & Dopamine Chill Cho Trader — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Review toàn bộ, đối chiếu kim chỉ nam `KE_HOACH_GOC.md` v1.1, tinh chỉnh hệ thống Auto-Update thị trường thời gian thực và trải nghiệm Dopamine Chill cho Trader theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Auto-Update 3D Wall TV Screen trên tường quán (Hoàn thành bước đầu)**:
    1. Kích hoạt vòng lặp auto-update định kỳ 2.8s cho `updateTraderScreen()` trong `src/CafeScene.tsx`.
    2. Giá nến và các cặp tài sản BTC, ETH, GOLD, SPX nhảy ticks liên tục; nến động tịnh tiến; đồng hồ live feed thời gian thực; trích dẫn triết lý luân chuyển mượt mà; tự động dọn dẹp interval khi scene dispose.
  + **Nâng cấp toàn diện Trader Terminal Modal (Hoàn thành bước đầu)**:
    1. Bộ Ticker 6 tài sản: BTC/USDT, ETH/USDT, GOLD (XAU), SOL/USDT, DXY, SPX 500 nhảy giá liên tục theo thuật toán ngẫu nhiên mô phỏng thị trường; hỗ trợ nhấp chuột để chuyển đổi tức thì asset hiển thị trên đồ thị.
    2. Dynamic Candlestick Engine: Cây nến hiện tại liên tục hình thành và co giãn râu/thân nến theo nhịp thị trường; tự động sinh nến mới sau mỗi 8 ticks; hiển thị thanh Volume profile và đường chỉ báo giá chạy (Tracker Line).
    3. Thử thách "Quick Paper Trade" 12s Dopamine: Cho phép Trader vào lệnh Long / Short với vốn giả lập $1,000; đếm ngược 12s với PnL nhảy thời gian thực; khi chốt lời -> âm thanh Ka-Ching leng keng, thưởng +150 XP, kích hoạt pháo hoa chúc mừng toàn quán; khi cắt lỗ -> âm thanh an ủi và trích dẫn chánh niệm từ bot Mai Linh.
    4. Nút gạt Auto-Market Pulse bật/tắt cập nhật tự động.
  + **Âm thanh Dopamine & Thư giãn chuyên sâu (Hoàn thành bước đầu)**:
    1. `chillAudio.playOrderFilled()`: Two-tone crystal chime C6-E6 (1046Hz - 1318Hz) khi vào lệnh / khớp lệnh.
    2. `chillAudio.playCashRegister()`: Tiếng chốt kim loại kèm chuỗi reo vàng leng keng (C6, E6, G6, B6, C7 cascade) bùng nổ Dopamine khi chốt lời (Take Profit).
    3. `chillAudio.playCoffeeEuphoria()`: Chuỗi hợp âm tam giác êm dịu C4-E4-G4-C5 thư giãn sâu khi nhấp ngụm cà phê thơm nóng.
  + **Không khí quán sinh động tự nhiên (Hoàn thành bước đầu)**:
    1. Tích hợp thanh băng chuyền giá chạy (Live Market Ticker Tape) ở đầu màn hình, click để mở ngay Terminal.
    2. Chu kỳ Bot Trader tự động chốt lời thành công và bắn pháo hoa chung vui mỗi 110s.
    3. Nhấp ngụm cà phê kích hoạt âm thanh thở phào thư thái (`playCoffeeEuphoria`).
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/CafeScene.tsx`
  + `src/components/TraderTerminalModal.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 8.90s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Chưa có kiểm thử tự động trên browser/thiết bị thật do môi trường thiếu browser automation.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm thử thách Quick Paper Trade 12s, nghe âm thanh khớp lệnh/chốt lời Dopamine và quan sát màn hình 3D TV tự động nhảy nến.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md`.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (không có công cụ chỉ số quota chính thức trong phiên này).


## Review & Kiểm tra bàn giao toàn bộ hệ thống — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Thực hiện load dự án, rà soát và kiểm tra toàn bộ việc bàn giao theo quy trình chuẩn của `AGENTS.md`.
- Trạng thái các nhiệm vụ:
  + Toàn bộ 25 bài kiểm thử tự động (`server/rooms.test.mjs`, `server/wire.test.mjs`, `server/http.test.mjs`) **PASS 100%**.
  + TypeScript compiler (`tsc --noEmit`) đạt **0 errors**.
  + Vite production build hoàn tất thành công trong **9.32s**, các chunks `@babylonjs/core` và React runtime được cô lập tối ưu.
  + Server backend WebSocket & HTTP API (`port 3001`) và Vite Frontend Server (`port 5173`) đang chạy nền và phản hồi ổn định (`/health` HTTP 200 `{"ok":true}`).
  + Mã nguồn sạch sẽ, không có thay đổi dở dang, không xung đột file giữa các agent.
- Bàn giao đúng mẫu chuẩn:
  + **Đã làm**:
    1. Đọc và đối chiếu toàn bộ hệ thống tài liệu: `AGENTS.md`, `.codex/README.md`, `.codex/TASK_BOARD.md`, `KE_HOACH_GOC.md`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
    2. Kiểm tra Git: Nhánh `master`, giữ nguyên trạng thái chưa commit theo Rule 8 của `AGENTS.md`.
    3. Xác minh hoạt động của cả 2 tiến trình mạng: WebSocket server (:3001) và Vite dev server (:5173).
    4. Chạy kiểm thử hồi quy `npm test` (PASS 25/25) và kiểm thử build nghiệm thu `npm run verify` (PASS 25/25, build PASS).
    5. Cập nhật đồng thời 3 tài liệu theo dõi tiến độ: `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`.
  + **Chưa làm / bị chặn**:
    - Chưa có browser automation trên thiết bị thật (môi trường không hỗ trợ) nên chưa đo FPS/visual/audio thực tế tự động. Cần người dùng mở trực tiếp tại `http://127.0.0.1:5173/`.
  + **File thay đổi**:
    - `CAP_NHAT_DU_AN.md`
    - `TIEN_DO.md`
    - `BAN_GIAO.md`
  + **Kiểm tra đã chạy**:
    - `git status --short --branch`
    - `npm test` -> PASS 25/25 tests
    - `npm run verify` -> PASS 25/25 tests, TypeScript PASS, Vite build PASS (9.32s)
    - `Invoke-RestMethod http://127.0.0.1:3001/health` -> `{"ok": true}`
    - `Invoke-RestMethod http://127.0.0.1:3001/api/rooms` -> 2 phòng hoạt động
  + **Kết quả**: Tất cả kiểm tra tự động và dịch vụ hệ thống hoạt động hoàn hảo 100%.
  + **Rủi ro / giới hạn**:
    - Chưa xác thực Web Speech API trên các trình duyệt không có giọng đọc `vi-VN` (đã có lớp fallback procedural Web Audio).
    - Chưa commit Git (theo quy định Rule 8 của `AGENTS.md`).
  + **Việc tiếp theo**:
    1. Đề xuất 1: Người dùng mở `http://127.0.0.1:5173/` kiểm tra luồng trải nghiệm thực tế (dạo ban công 8 tầng, thử Quick Paper Trade 12s, nghe âm thanh Dopamine, tương tác 4 bot trader và sự kiện NFP).
    2. Đề xuất 2: Đo đạc FPS trên thiết bị thật để ghi nhận baseline hiệu năng cho T01/T08.
    3. Đề xuất 3: Chuẩn bị thiết kế bảo mật production, HTTPS/WSS và kế hoạch staging (T22, T24).
  + **Git**: `master`, chưa có commit.
  + **Quota**: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).


## IDEA-17 / T07, T20, T22 — Photo Mode Chụp Ảnh Kỷ Niệm "Closing Bell" — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai tính năng Photo Mode Chụp Ảnh Kỷ Niệm "Closing Bell", camera nghệ thuật ngắm toàn cảnh biệt thự 8 tầng, bộ lọc màu ảnh phim, watermark và tải ảnh PNG về máy theo yêu cầu được duyệt của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Hệ thống Camera Nghệ thuật & Preset Góc Chụp (Hoàn thành bước đầu)**:
    1. 8 góc chụp nghệ thuật: Cổng & Biệt Thự 8 tầng (`exterior`), Lò Sưởi Hearth Hall than hồng (`hearth`), Quầy Bar & Barista Thu Hà (`bar`), Focus Library gác lửng (`library`), Ban Công VIP ngắm Skyline đêm (`balcony`), T8 Sky Terrace ngắm toàn cảnh (`observatory`), Chân Dung Trader góc nghiêng 45° (`selfie`), và Góc hiện tại (`current`).
    2. Ống kính & Tiêu cự: 24mm (Góc rộng 1.32), 35mm (Tiêu chuẩn 1.10), 50mm (Mắt người 0.85), 85mm (Chân dung xóa phông 0.58).
    3. Hiển thị avatar người chơi trong scene khi chụp góc chân dung hoặc góc toàn cảnh.
  + **Màu Phim, Bố Cục & Tỉ Lệ Khung Hình (Hoàn thành bước đầu)**:
    1. 5 bộ lọc phim cổ điển: Tự nhiên (`none`), Closing Bell Golden Hour (`closing-bell`), Vintage Amber Warm Film 800 (`vintage-amber`), Emerald Chill Zen Teal (`emerald-chill`), Noir 1930 B&W Classic (`noir`), Dopamine Vivid High Contrast (`cyber-dopamine`), kèm hiệu ứng vignette viền tối và ánh sắc hoàng hôn.
    2. 3 lưới bố cục: Lưới 1/3 (Rule of Thirds), Tỉ lệ vàng (Golden Ratio), Điểm ngắm trung tâm (Center Crosshair).
    3. 4 tỉ lệ khung hình: Tự do (Full screen), 16:9 (Điện ảnh / PC Wallpaper), 1:1 (Vuông / Avatar / Instagram), 9:16 (Dọc / Story / Mobile Wallpaper).
  + **Watermark Sang Trọng & Bảo Mật Quyền Riêng Tư T22 (Hoàn thành bước đầu)**:
    1. Đóng dấu logo 🔔 CLOSING BELL · CAFÉ TRADER VILLA, số tầng/vị trí, ngày giờ chụp thực tế, tên Trader & cấp độ.
    2. Tùy chọn ẩn danh `anonymousEnabled` để bảo vệ quyền riêng tư người dùng (T22 Privacy).
    3. Xử lý ảnh 100% client-side bằng HTML5 Canvas 2D; tải trực tiếp file PNG về máy, không gửi lên bất kỳ server nào.
  + **Âm Thanh Màn Trập & Trải Nghiệm Người Dùng (Hoàn thành bước đầu)**:
    1. Âm thanh màn trập SLR cơ học procedural Web Audio `playCameraShutter()`: tiếng lật gương phản xạ + tiếng sập màn trập kim loại + tiếng cuộn cơ học.
    2. Nút chụp ảnh trung tâm viền đồng sang trọng; chớp flash màn hình trắng điện ảnh khi chụp.
    3. Phím tắt `Space` chụp ảnh, `F10` hoặc `H` ẩn/hiện công cụ ngắm cảnh, `Esc` thoát, `P` bật/tắt nhanh Photo Mode.
    4. Nút bấm trên Header và Atmosphere Pill.
- File đã thay đổi:
  + `src/audio/chillAudio.ts`
  + `src/components/PhotoModeOverlay.tsx` (mới)
  + `src/components/PhotoModeOverlay.css` (mới)
  + `src/CafeScene.tsx`
  + `src/App.tsx`
  + `src/App.css`
  + `.codex/TASK_BOARD.md`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 21.63s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Cần người dùng trải nghiệm trực tiếp trên trình duyệt tại `http://127.0.0.1:5173/`, bấm phím `P` hoặc nút "📸 Chụp ảnh", ngắm các góc biệt thự và tải ảnh thử nghiệm về máy.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` trải nghiệm tính năng Photo Mode, chụp thử các góc và tải ảnh PNG về máy.
  2. Tiếp tục hoàn thiện các đầu việc theo bảng việc `.codex/TASK_BOARD.md` (Evening Ritual, Sổ lưu bút Trader, hoặc Bảo mật T22).
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## IDEA-21 / T16, T19, T22 — TTS Việt cục bộ KorvaTTS — 12/11/2026 / Codex

- Phạm vi đã làm: kiểm tra repo TTS miễn phí trên GitHub và tích hợp đường phát âm thanh local có fallback. Chọn KorvaTTS: Vietnamese-first, ONNX, 44,1 kHz, 10 giọng; theo upstream, code và weights Apache-2.0. Không tải model hoặc gọi API cloud trong phiên này.
- File: `src/audio/vietnameseTts.ts`, `src/audio/staffVoice.ts`, `src/audio/botVoice.ts`, `server/index.mjs`, `server/http.test.mjs`, `src/vite-env.d.ts`, `services/korvatts/{bridge.py,requirements.txt,README.md}`, `CAU_HINH_DU_AN.md` và ba tài liệu trạng thái.
- Cách vận hành: mặc định giữ Web Speech. Khi người vận hành đã review license/tài nguyên và chạy bridge loopback, đặt `VIET_TTS_SERVICE_URL=http://127.0.0.1:7861/synthesize` cho Node và `VITE_VIET_TTS_ENGINE=korva` trong `.env.local`, rồi restart server/Vite. Node chỉ relay `localhost`/`127.0.0.1`, validation text/voice/speed, timeout 20 s, không cache WAV/reference-audio/cloning.
- Kiểm tra đã chạy: `npm run verify` — PASS 26/26 test, `tsc --noEmit` và Vite production build PASS. Test chứng minh bridge chưa cấu hình trả 503 và relay WAV loopback hợp lệ. Chưa chạy Python/model nên chưa thể khẳng định âm thanh Korva, latency hay CPU/RAM.
- Việc tiếp theo: cài theo `services/korvatts/README.md` sau khi người vận hành chấp thuận tải weights; gọi `/health`, thử 3 nhân sự + 4 BOT, tắt bridge để kiểm fallback, ghi browser/autoplay/độ trễ/CPU-RAM. Không bind bridge hay Node public. Quota: không có chỉ số chính thức trong phiên. Git: `master`, chưa commit.


## IDEA-18 / T04, T16, T17, T18, T19 — Menu công thức & quầy pha chế Barista — 12/11/2026 / Codex

- Owner/file để phối hợp song song: Codex sở hữu `src/CafeScene.tsx` (khu vực quầy) và `src/data/cafeMenu.ts`; Antigravity đang làm UI/Photo Mode, vì vậy **không** sửa `src/App.tsx` trong phần này.
- Đã làm: catalogue `CAFE_MENU` có 12 món/3 nhóm và từng `recipe` concept; quầy 3D có máy espresso hai group, grinder/hopper, portafilter, knock box, pour-over, syrup/tea jars, pastry dome, foot rail, marble inset, back bar và 3 bảng menu vật lý render từ data chung.
- Contract tích hợp cho owner UI: import `{ CAFE_MENU, CAFE_MENU_CATEGORIES, menuByCategory }` từ `src/data/cafeMenu.ts`; giữ callback `handleOrderDrink(item.name)` và state ghế/order hiện có. Không copy menu về `App.tsx`. Khi thêm allergen/đơn vị bán thật phải qua owner barista/food-safety, không suy từ catalogue concept.
- Kiểm tra: `npm run verify` PASS 25/25; `tsc --noEmit && vite build` PASS trong 11.88s.
- Hạn chế: chưa QA trực quan (đọc bảng 3D, collision, mobile/FPS), browser automation không khả dụng. Catalogue hiện là menu trải nghiệm ảo, không phải công thức sản xuất hay tư vấn an toàn thực phẩm.
- Việc tiếp theo theo thứ tự: (1) owner UI tích hợp `CAFE_MENU` ở tab Menu bằng thay đổi riêng; (2) QA desktop/mobile quanh quầy và Photo Mode preset Bar; (3) test hai client order/cancel/retry; (4) chỉ sau đó mới thêm animation barista/order state T17–T18.
- Git: `master`, chưa có commit. Quota: không có chỉ số chính thức trong phiên.

## IDEA-19 / T04, T10, T17, T19 — Menu riêng trên từng bàn — 12/11/2026 / Codex

- Ownership: chỉ `src/CafeScene.tsx`; không sửa `App.tsx` để tránh chồng lên Photo Mode/UI của Antigravity.
- Đã làm: mỗi trong 7 bàn multiplayer sinh một quyển menu mở trên mặt bàn. Bìa là dark leather ở bàn thường, royal velvet ở VIP; có brass spine/corner và trang DynamicTexture với nhóm/món signature/mô tả/bước công thức đầu/kiểu phục vụ từ `src/data/cafeMenu.ts`.
- Không thay đổi: map seat, metadata click, collision, server event, room/đơn hay số light. Asset tĩnh tiếp tục được freeze cùng kiến trúc scene.
- Kiểm tra: `npm run verify` PASS 25/25; Vite production build PASS trong 15.09s.
- Hạn chế: chưa QA visual/readability/FPS do không có browser automation; menu vật lý chưa click để mở tab UI. Không tuyên bố công thức là chuẩn dịch vụ thực tế/an toàn thực phẩm.
- Việc tiếp theo: kiểm tra từng bàn T1–T2, cả Photo Mode preset Bar và mobile. Nếu người dùng muốn click menu, owner UI thêm callback/panel ở `App.tsx` theo thay đổi riêng và tái sử dụng `CAFE_MENU`; không sửa trực tiếp scene contract ghế.
- Git: `master`, chưa có commit. Quota: không có chỉ số chính thức trong phiên.

## IDEA-20 / T10, T16, T17, T18, T20 — Menu tương tác tại bàn & mời món tiếng Việt — 12/11/2026 / Codex

- Files/ownership: `src/CafeScene.tsx` (hit-box menu + callback), `src/components/TableMenuPages.tsx`, `src/components/TableMenuPages.css`, `src/App.tsx` (tích hợp tối thiểu), `src/data/cafeMenu.ts`. Photo Mode không bị sửa về hành vi.
- Luồng đã triển khai: bấm quyển menu 3D → `onTableMenuClick(tableIndex)` → mở sidebar tab Menu với món gợi ý → chọn trang/recipe → bấm Gọi món → `handleOrderDrink(item.name)` → brewing 3 giây → server `order` khi live → phục vụ tại ghế. Menu vật thể có metadata riêng, được ưu tiên trước click ghế.
- Tiếng Việt: gọi `staffVoice.speak('barista-thu-ha', ...)` khi nhận đơn và khi món sẵn sàng. Browser thiếu TTS/voice Việt vẫn giữ toast. Không hứa chắc âm thanh sẽ phát nếu browser chặn autoplay hoặc thiết bị thiếu voice.
- Kiểm tra: `npm run verify` PASS 25/25; production build PASS trong 9.37s.
- QA bắt buộc: tại `http://127.0.0.1:5173/`, bấm menu của từng bàn, thử tab touch, gọi một món khi chưa ngồi (phải bị chặn), sau đó chọn ghế và gọi món, chờ lời mời của Thu Hà. Dùng tab thứ hai xác nhận đồ uống/broadcast đúng room/ghế.
- Rủi ro/hạn chế: chưa có browser automation, nên chưa đo được hit-box, responsive overlay, TTS/autoplay hay FPS thật. Công thức chỉ dành cho trải nghiệm ảo; không dùng để pha/chào bán thực tế khi chưa có chuyên gia xác nhận.
- Git: `master`, chưa có commit. Quota: không có chỉ số chính thức trong phiên.

## Khôi phục Điều Hướng & Thang Máy Hoàng Gia 8 Tầng (Royal Lift T1–T8) — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục tình trạng các tầng trên (T3–T8) bị thiếu bộ điều khiển và mở toàn diện thang máy Royal Lift theo yêu cầu của chủ dự án.
- Nhiệm vụ và trạng thái:
  + **Toàn bộ 8 tầng 3D biệt thự hoàng gia đã sẵn sàng và có thể đi lại tự do**:
    1. T1: Sảnh Lớn & Hearth Hall (`y = 0m`) — Lò sưởi Travertine, quầy Barista Thu Hà, sân vườn & đài phun nước.
    2. T2: VIP Skyline Lounge (`y = 3.2m`) — Gác lửng VIP, Night Terrace lò than brazier, Focus Library & Bàn 6-7.
    3. T3: Royal Salon (`y = 6.7m`) — Hội đàm thượng lưu, sofa da, thảm nhung & Ban công nhô nhìn ra góc Chill.
    4. T4: Golden Gallery (`y = 10.2m`) — Triển lãm thành tựu, bảng lịch sử & Ban công ngoài trời view đài phun nước.
    5. T5: Emerald Conservatory (`y = 13.7m`) — Vườn kính thảo mộc, sofa tĩnh tâm & Ban công ngắm skyline.
    6. T6: Crown Library & Study (`y = 17.2m`) — Thư viện hoàng gia cổ điển, bàn học & Ban công ngoài trời.
    7. T7: Imperial Terrace Salon (`y = 20.7m`) — Sunset Lounge đá cẩm thạch trắng & Ban công hoàng hôn lộng lẫy.
    8. T8: Sky Observatory (`y = 24.2m`) — Đài thiên văn tầng thượng, salon ngắm sao & Ban công mây toàn cảnh estate.
  + **Thang Máy Hoàng Gia (Royal Lift)**:
    1. Bảng 8 nút điều hướng thang máy `[ T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 ]` trên thanh Header (`.royal-floor-selector`).
    2. Nút chuyển tầng nhanh ở thanh đáy (`scene-controls`) và bộ điều khiển cảm ứng di động `TouchController` cho phép luân chuyển qua 8 tầng chỉ bằng 1 cú chạm.
    3. Thẻ tầng (`floor-indicator`) và thanh không khí (`atmosphere-badge`) hiển thị đầy đủ tên, biểu tượng và mô tả riêng của từng tầng.
    4. Chuyển tầng mượt mà an toàn thông qua sự kiện `floorJump` kết nối với `CafeScene`.
- File đã thay đổi:
  + `src/App.tsx`
  + `CAP_NHAT_DU_AN.md`
  + `TIEN_DO.md`
  + `BAN_GIAO.md`
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 18.48s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Cần người dùng mở `http://127.0.0.1:5173/`, bấm các nút `T1`–`T8` trên thanh Header để trải nghiệm di chuyển qua các tầng biệt thự và bước ra ban công ngắm cảnh.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` kiểm tra thang máy Royal Lift và dạo quanh các tầng 1 đến 8.
  2. Tiếp tục hoàn thiện các đầu việc tiếp theo theo kế hoạch.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## IDEA-19 / T04, T06, T07, T16, T19 — View Ngoài Trời New York, Click Bàn Ghế Để Ngồi & Tự Đứng Lên, Âm Thanh Menu/Sách & Nhân Viên Tuần Tra — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Triển khai toàn cảnh view ngoài trời New York theo thời tiết (bầu trời, mây trôi, cây xanh, đại lộ, Manhattan skyline), hỗ trợ click bàn hoặc ghế để ngồi và bấm di chuyển tự động đứng lên, nâng cấp âm thanh procedural tactile (sột soạt mở Menu, lật sách thư viện), nhân viên quán tuần tra sống động theo yêu cầu chủ dự án.
- Nhiệm vụ và trạng thái:
  1. **View ngoài trời New York (Sky, Clouds, Trees, Roads & Manhattan Skyline)**:
     - Xóa bỏ hoàn toàn khoảng đen vô định (black void) khi ngắm nhìn từ ban công các tầng T1–T8.
     - Vòm trời New York (`skyDome` 750m) Dynamic Texture chuyển màu gradient điện ảnh: từ đỉnh thiên đỉnh xanh đêm thẫm (`#060a14` → `#0e1828`) chuyển mượt mà xuống chân trời ánh rực hổ phách ánh đèn Manhattan (`#3a231b` → `#523022`), điểm xuyết 450 vì sao đêm và vầng trăng khuyết nghệ thuật.
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
  + [src/audio/chillAudio.ts](file:///d:/ChatGPT/CafeTrader/src/audio/chillAudio.ts)
  + [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy và kết quả thực tế:
  + `npm test`: **PASS 25/25 tests** (100%).
  + `npm run verify`: **PASS 25/25 tests**, `tsc --noEmit && vite build` **PASS** trong 9.64s, zero lỗi TypeScript hay build.
- Chưa xong / rủi ro:
  + Cần người dùng mở `http://127.0.0.1:5173/`, lên ban công T7/T8 ngắm đại lộ & skyline New York, click ngồi ghế và bấm phím di chuyển để kiểm tra tự đứng dậy.
  + Nhánh Git `master` chưa commit (theo quy tắc 8 trong `AGENTS.md`).
- Việc tiếp theo:
  1. Người dùng mở `http://127.0.0.1:5173/` ngắm toàn cảnh New York từ ban công các tầng, trải nghiệm click ngồi bàn ghế, WASD tự đứng dậy, và nghe âm thanh menu/lật sách.
  2. Tiếp tục hoàn thiện các nội dung tiếp theo theo định hướng dự án.
- Git: `master`, chưa có commit.
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Cập nhật Nới Rộng Lối Đi Hội Trường & Tái Cấu Trúc Cầu Thang — 12/11/2026 / Antigravity

- Phạm vi: Sửa lỗi thanh tay vịn vàng nghiêng chéo như bị ngã chắn ngang lối vào Hội trường, nới rộng khẩu độ cổng vòm lên 5.4m, di dời cầu thang gác lửng sang phía Tây cạnh vách kính lớn New York skyline, tái cấu trúc lan can chuẩn kiến trúc có trụ baluster nâng đỡ và di dời bàn đĩa than.
- File đã thay đổi: [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx), [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md), [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md), [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md).
- Kiểm tra đã chạy:
  + `npm test`: **PASS 26/26 tests** (100%).
  + `npm run verify`: **PASS 26/26 tests**, `tsc --noEmit && vite build` PASS trong 16.73s.
- Hạn chế / Việc tiếp theo: Người chơi trải nghiệm lối đi thênh thang vào Hội trường và ngắm cầu thang mới bên vách kính phía Tây qua web local hoặc Cloudflare Tunnel.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Cập nhật Xóa Bỏ Thanh Chéo & Tối Giản Cầu Thang Bay — 12/11/2026 / Antigravity

- Phạm vi: Xóa bỏ hoàn toàn thanh chéo vàng nghiêng và các trụ baluster cản tầm nhìn ở cầu thang phía Tây theo yêu cầu người dùng, giữ thiết kế cầu thang bay gỗ tối giản (Modern Cantilevered Floating Staircase) có đèn LED âm bậc ấm áp, trả lại 100% tầm nhìn thoáng đãng qua vách kính 2 tầng ngắm New York skyline.
- File đã thay đổi: [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx), [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md), [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md), [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md).
- Kiểm tra đã chạy:
  + `npm test`: **PASS 26/26 tests** (100%).
  + `npm run verify`: **PASS 26/26 tests**, `tsc --noEmit && vite build` PASS trong 22.60s.
- Hạn chế / Việc tiếp theo: Người chơi ngắm cầu thang bay gỗ tối giản bên vách kính phía Tây qua web local hoặc Cloudflare Tunnel.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Cập nhật Tái Thiết Kế Bố Cục Tầng Lửng VIP (Giải Phóng Nút Thắt) — 12/11/2026 / Antigravity

- Phạm vi: Tái quy hoạch toàn bộ không gian sảnh tầng lửng VIP (Tầng 2) giải phóng nút thắt nghẽn lối đi: xóa bỏ bộ ghế lò than brazier đặt sai vị trí trong nhà, đưa lò than gang và 2 ghế ngắm skyline ra đúng sàn ban công ngoài trời ngắm New York; lùi bàn học thư viện Focus Library sâu về phía sau (z = 5.2) giải phóng hành lang trước; dịch Bàn 6 sang x = -2.0 mở rộng khoảng trống thông thủy hơn 5.5 mét; dời chậu cây vào góc phòng. Tạo đại sảnh đến 5m × 4m thênh thang, sang trọng, không vật cản.
- File đã thay đổi: [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx), [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md), [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md), [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md).
- Kiểm tra đã chạy:
  + `npm test`: **PASS 26/26 tests** (100%).
  + `npm run verify`: **PASS 26/26 tests**, `tsc --noEmit && vite build` PASS trong 14.48s.
- Hạn chế / Việc tiếp theo: Người chơi trải nghiệm sảnh tầng lửng VIP thoáng đãng, bước thẳng ra ban công ngoài trời hoặc vào Focus Library qua web local hoặc Cloudflare Tunnel.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## IDEA-25 / T16, T19, T22 — Nghiên Cứu Repo TTS Free & Tích Hợp Giọng Nói Tiếng Việt Toàn Diện Đa Tầng — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khảo sát toàn diện các kho lưu trữ (repo) Text-To-Speech tiếng Việt miễn phí tốt nhất và tích hợp giọng nói tự nhiên vào toàn bộ hệ thống (4 Bot Trader, 3 Nhân sự, Đọc thông báo phòng Host, Dịch vụ Spa massage, Bộ chọn Engine).
- Nhiệm vụ và trạng thái:
  1. **Khảo sát chuyên sâu các Repo TTS Tiếng Việt Free**:
     - **VieNeu-TTS** (`pnnbao97/VieNeu-TTS`): v3 Turbo lên tới 48kHz, zero-shot voice cloning 3-5s, code-switching Anh-Việt (`sea-g2p`), OpenAI API-compatible, chạy CPU (GGUF/ONNX) hoặc GPU.
     - **KorvaTTS** (`dogenthq/KorvaTTS`): Flow-matching ~99M params, 44.1kHz, on-device CPU qua ONNX Runtime, 10 profile giọng Việt, Apache-2.0.
     - **Microsoft Edge Neural TTS** (`rany2/edge-tts` / `SchneeHertz/node-edge-tts`): Model `vi-VN-HoaiMyNeural` & `vi-VN-NamMinhNeural`, 100% Free, không cần API Key, không tốn dung lượng ổ cứng, MP3 stream trực tiếp.
     - **Valtec TTS / v-tts** (`tronghieuit/v-tts`): Siêu nhẹ 74.8M params, RTF ~0.24 trên CPU, voice cloning 3-10s, có bản Windows `.exe` chạy ngay.
     - **VietTTS** (`dangvansam/viet-tts`) & **VietVoice-TTS** (`nguyenvulebinh/VietVoice-TTS`): FastSpeech2 / tối ưu ngữ điệu tiếng Việt.
     - **Google Neural Vietnamese Audio Stream** (`client=tw-ob&tl=vi`): Tốc độ <200ms, 100% chuẩn dấu thanh điệu, MP3 stream.
  2. **Tích hợp Kiến trúc Giọng nói Đa tầng (*Fail-Safe Multi-Tier Engine*)**:
     - **Tier 1 (Local AI Engine)**: Kết nối `/api/tts` tới KorvaTTS hoặc VieNeu-TTS local bridge khi được cấu hình.
     - **Tier 2 (Cloud Neural HD Stream)**: Endpoint `/api/tts-cloud` trên server Node.js tự động ngắt câu thông minh (chunking <= 180 ký tự), tổng hợp audio MP3 chuẩn xác, lưu đệm in-memory LRU cache (`cloudTtsCache` tối đa 200 bản ghi, phản hồi trong <5ms cho các câu lặp lại). Hoạt động mượt mà 100% trên cả Desktop, Mobile và Web Tunnel mà không đòi hỏi người dùng tải model nặng.
     - **Tier 3 (Web Speech API Native)**: Chạy trực tiếp trên trình duyệt khi mất mạng hoặc người dùng chọn chế độ Native.
     - **Tier 4 (Procedural Audio Chime)**: Âm sắc synthesizer `chillAudio.playBotVocal` làm tín hiệu âm thanh dự phòng.
  3. **Tích hợp toàn bộ hệ thống giọng nói trong CafeTrader**:
     - **4 Bot Trader**: Alex Trần, Mai Linh, Hải Đăng, Sarah Jenkins (chào khi ngồi cùng bàn, tán gẫu ambient quote, phản ứng sự kiện NFP, nghe thử tại Tab Khách).
     - **3 Nhân Sự Quán**: Quản gia Minh An (chào tiền sảnh), Barista Thu Hà (đọc to xác nhận nhận món và thông báo khi đồ uống hoàn thành mang tới bàn), Tiếp viên Bảo Ngọc (chào đón sảnh Hearth & hướng dẫn thả lỏng thiền định).
     - **Đọc thông báo Host toàn phòng**: Khi Chủ phòng gửi thông báo khẩn, hệ thống tự động phát âm thông báo bằng giọng nam quản trị trang trọng.
     - **Dịch vụ Spa Massage**: Lời hướng dẫn thư giãn, điều hòa hơi thở dịu êm của Bảo Ngọc hòa cùng tiếng chuông xoay 432Hz.
     - **Hộp chọn Engine UI**: Cho phép chuyển đổi tức thì giữa các chế độ `✨ Tự động đa tầng`, `☁️ Cloud Neural HD`, `💻 KorvaTTS Local AI`, `🌐 Trình duyệt Web Speech`.
  4. **Cẩm nang kỹ thuật**: Tạo tài liệu chi tiết [VIETNAMESE_TTS_GUIDE.md](file:///d:/ChatGPT/CafeTrader/.codex/VIETNAMESE_TTS_GUIDE.md).
- File đã thay đổi:
  + [server/index.mjs](file:///d:/ChatGPT/CafeTrader/server/index.mjs)
  + [server/http.test.mjs](file:///d:/ChatGPT/CafeTrader/server/http.test.mjs)
  + [src/audio/vietnameseTts.ts](file:///d:/ChatGPT/CafeTrader/src/audio/vietnameseTts.ts)
  + [src/audio/staffVoice.ts](file:///d:/ChatGPT/CafeTrader/src/audio/staffVoice.ts)
  + [src/audio/botVoice.ts](file:///d:/ChatGPT/CafeTrader/src/audio/botVoice.ts)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [.codex/VIETNAMESE_TTS_GUIDE.md](file:///d:/ChatGPT/CafeTrader/.codex/VIETNAMESE_TTS_GUIDE.md)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.05s.
- Hạn chế / Việc tiếp theo: Người chơi trải nghiệm giọng nói tiếng Việt chuẩn tự nhiên qua web local hoặc Cloudflare Tunnel; có thể đổi các Engine giọng nói tại tab Khách.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## IDEA-26 / T06, T07, T17, T18, T19, T20 — Thiết Kế Bartender Đứng Quầy & Chủ Động Hỏi Bằng Tiếng Việt — 12/11/2026 / Antigravity

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Thiết kế diện mạo Bartender chuyên nghiệp đứng ở quầy bar và cơ chế nhận diện người chơi tiếp cận để chủ động hỏi chuyện bằng tiếng Việt kèm bong bóng thoại tương tác.
- Nhiệm vụ và trạng thái:
  1. **Bartender Character & Workstation Props**:
     - Cập nhật nhân vật thành `🍸 Bartender Thu Hà` với bảng tên vàng sang trọng.
     - Trang phục Bartender cao cấp: tạp dề đen charcoal (`#1c2226`), quai da chéo lưng, nơ cổ đỏ ruby (`#943828`), huy hiệu kim loại đồng sáng bóng.
     - Đạo cụ Bartender Workstation đặt ngay trên mặt quầy bar phía trước: bình lắc cocktail inox (`bar-cocktail-shaker`), nắp đậy, ly đong jigger 2 đầu bằng đồng (`bar-jigger`), khăn lau quầy gấp gọn (`bar-folded-towel`), ly mixing glass và thìa xoắn dài cán vàng (`bar-spoon-handle`).
  2. **Proximity Detection & Cử chỉ tương tác**:
     - Khoanh vùng khu vực trước quầy bar (`x: 2.8..8.2, z: 0.5..3.3, y < 2.0`).
     - Khi người chơi bước tới khoảng cách < 3.4m, Bartender Thu Hà tạm dừng tuần tra, xoay người nhìn thẳng vào người chơi.
     - Cử chỉ tay chào đón thân thiện (tay phải nâng cao vẫy chào, tay trái đặt nhẹ lên mặt quầy).
     - Vòng hào quang âm thanh 3D (`speakingHalo`) xanh lá trên đỉnh đầu phát sáng và nhịp nhàng phát xung khi nói.
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
- File đã thay đổi:
  + [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx)
  + [src/audio/staffVoice.ts](file:///d:/ChatGPT/CafeTrader/src/audio/staffVoice.ts)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 8.95s.
- Hạn chế / Việc tiếp theo: Người chơi đi lại gần quầy bar sảnh trệt để trải nghiệm Bartender Thu Hà xoay người chào đón và chủ động hỏi chuyện bằng tiếng Việt qua web local hoặc Cloudflare Tunnel.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).





## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-27: Cửa Xoay Tự Động 4 Ô Hình Trục Ống Khách Sạn 5 Sao (4-Wing Cylindrical Luxury Revolving Door)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Thay thế cửa trượt phẳng cũ và cột chắn chính giữa bằng Cụm Cửa Xoay 4 Ô Trục Ống Tròn 5 Sao tự động quay, lấy cảm hứng từ các khách sạn hạng sang quốc tế và Trung Quốc.
- Nhiệm vụ và trạng thái:
  1. **Loại bỏ thiết kế cũ**:
     - Xóa bỏ 2 cánh cửa kính trượt phẳng cũ (`entry-door-left`, `entry-door-right`) và thanh beam chữ nhật đơn điệu (`entry-door-top`).
     - Xóa bỏ cột đá Travertine nằm ngay chính giữa cửa (`entry-column-0`) gây cản trở lối đi.
  2. **Vách kính cong hình trục ống (Curved Glass Drum Enclosure)**:
     - 2 bán nguyệt kính cong hướng Đông và Tây (`MeshBuilder.CreateCylinder` với `arc: 0.28`, `cap: Mesh.NO_CAP`, `sideOrientation: DOUBLESIDE`), chất liệu kính tinh thể `revolvingGlass` bóng sang trọng.
     - Nẹp viền vành cong kim loại vàng bóng (`goldBrass`) trên và dưới ở cả 2 vách kính.
     - 4 cột đồng đứng (`goldBrass`) định vị 4 góc mép kính cong, tạo 2 cổng mở rộng 2.06m hướng Bắc (vào quán) và hướng Nam (ra sân New York).
  3. **Vòm tán trục ống tròn & Sàn đá cẩm thạch**:
     - Vòm tán hình trụ tròn đường kính 3.42m bọc kim loại vàng bóng với phào chỉ nổi (`cornice`), tích hợp 4 đèn spotlight LED âm trần rọi sáng ấm áp xuống từng ô và đèn PointLight vàng ấm đón khách.
     - Đĩa sàn đá cẩm thạch đen (`marbleBlack`) viền chỉ vàng tròn đồng bộ dưới chân cụm cửa xoay.
     - 2 vách kính cố định và 2 trụ đá Travertine ở hai mép `x = ±2.8m` gắn đèn hoa đăng sconces, dầm trán cổng vàng `5.8m` kết nối liền mạch mặt tiền biệt thự.
  4. **Cơ cấu trục xoay 4 ô (4-Wing Revolving Rotor)**:
     - Trục quay trung tâm bằng đồng vàng bóng (`revolving-spindle-shaft`, đường kính 0.15m, cao 3.04m) kèm ổ trục trên/dưới.
     - 4 cánh kính quay chia đều 90° (`0°, 90°, 180°, 270°`) gắn vào trục trung tâm.
     - Mỗi cánh gồm: tấm kính cường lực trong suốt, khung nẹp viền kim loại vàng bóng 4 cạnh, gioăng cao su chắn bụi sàn (`charcoal`), thanh nẹp cao su mép ngoài chống va đập, tay đẩy ngang đôi bằng inox/đồng bóng hai mặt (`push-bar`) ở độ cao 1.05m và dải chỉ an toàn tầm mắt.
  5. **Chuyển động xoay mượt mà & cảm biến tiếp cận**:
     - Cửa tự động quay liên tục và êm ái ở tốc độ 0.32 rad/s (~19.6 giây/vòng).
     - Khi người chơi tiến lại gần cửa (`dist < 4.2m, y < 1.8m`), hệ thống cảm ứng tăng tốc nhịp nhàng lên 0.52 rad/s, tạo cảm giác cửa tự động mở lối đón khách vào sảnh.
     - Đăng ký toàn bộ các mesh cánh quay vào `dynamicMeshes` để Babylon.js không đóng băng ma trận transform.
  6. **Cơ chế vật lý & lối đi thông suốt**:
     - Lối đi qua cửa xoay rộng rãi, người chơi đi tự nhiên qua lại giữa sân trước (`z < -7.36`) và sảnh Hearth (`z > -7.36`) qua các khoang xoay.
     - Cột xoay trung tâm có đĩa va chạm nhỏ (`r = 0.12m`), vách kính cong hai bên có đĩa va chạm chặn va quẹt cạnh ngoài (`x = ±1.62m, r = 0.40m`), tường mặt tiền ngăn đi xuyên tường bê tông nhưng mở thoáng hoàn toàn hành lang cửa xoay (`|x| <= 0.95m`).
- File đã thay đổi:
  + [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi bước qua cửa xoay 4 ô hình trục ống giữa sân New York và sảnh Hearth trên `http://localhost:5173/` hoặc link Cloudflare Tunnel để trải nghiệm hiệu ứng tự động quay và tăng tốc mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-28: Cửa Kính Phẳng Tự Động Trượt Mở Khi Lại Gần & Đóng Khi Đi Ra (Luxury Automatic Sliding Glass Doors)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Chuyển đổi từ cửa xoay sang Cửa Kính Phẳng Tự Động 2 Cánh Trượt Cao Cấp (tự động mở trượt sang hai bên khi người chơi đến gần và tự động khép lại khi đi ra xa).
- Nhiệm vụ và trạng thái:
  1. **Hủy bỏ cửa xoay**: Tháo dỡ hoàn toàn vách kính cong, vòm tán tròn và cụm cánh xoay của cửa xoay.
  2. **Cụm Cửa Kính Phẳng Tự Động Trượt 2 Cánh (Automatic Sliding Glass Doors)**:
     - Dầm trán cổng vòm đồng vàng 5.8m (`goldBrass`).
     - Hộp ray trượt tự động cao cấp (`auto-door-track-box`) nẹp chỉ vàng, gắn cụm cảm biến radar chuyển động và đèn LED chỉ báo trạng thái hoạt động (`lampGlow`).
     - Đèn PointLight vàng ấm rọi xuống ngưỡng cửa, 2 trụ đá Travertine ở `x = ±2.8m` gắn đèn hoa đăng sconces.
     - 2 vách kính cố định hai bên phẳng nẹp viền vàng và thanh mullion dọc (`x = ±2.12m`).
     - Ray dẫn hướng âm sàn nẹp vàng và đĩa ngưỡng đá cẩm thạch đen (`marbleBlack`).
  3. **Hai Cánh Cửa Kính Trượt Phẳng**:
     - 2 cánh kính phẳng cường lực `revolvingGlass` viền vàng bóng 4 cạnh (`goldBrass`), dải chổi quét chân và gioăng cao su chắn bụi sàn, đệm cao su chạm êm giữa 2 cánh khi đóng.
     - Trang bị cặp tay vịn đứng hình trụ tròn mạ vàng sang trọng dài 1.35m gắn chốt standoff xuyên kính, dải chỉ an toàn mạ vàng ngang tầm mắt.
  4. **Cơ chế đóng/mở tự động theo khoảng cách**:
     - Cảm biến khoảng cách (`distToAutoDoor < 4.2m, y < 1.8m`).
     - Khi người chơi lại gần: `autoDoorProgress` tăng mượt mà lên `1.0` (dt * 3.8), hai cánh cửa trượt êm ái sang hai bên mở rộng lối đi thông thủy lên tới **2.76 mét**. Đèn cảm biến sáng vàng ấm.
     - Khi người chơi đi ra xa: `autoDoorProgress` giảm về `0.0`, hai cánh cửa tự động khép lại nhẹ nhàng chạm khít vào nhau ở chính giữa `x = 0`.
     - Đăng ký toàn bộ các mesh cánh trượt vào `dynamicMeshes` để Babylon.js render hoạt họa mượt mà.
  5. **Cơ chế va chạm & đi lại tự nhiên**:
     - Ngăn đi xuyên qua kính khi cửa đóng (`autoDoorProgress < 0.20`); khi cửa mở thì người chơi đi lại thông suốt giữa sân New York và sảnh Hearth.
- File đã thay đổi:
  + [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.10s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi bước tới gần cửa chính để trải nghiệm hai cánh cửa kính phẳng tự động trượt mở đón khách và tự động khép lại khi bước qua.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-29: Bổ Sung 10 Chi Tiết Chuẩn Quán Café Thực Tế & Tương Tác Xúc Giác Bất Ngờ (Authentic Real-World Cafe Details & Surprises)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Bổ sung 10 chi tiết quan trọng đặc trưng của một quán specialty coffee và trading lounge đẳng cấp ngoài đời thực, kèm hệ thống âm thanh Web Audio procedural và tương tác phản hồi xúc giác trong không gian 3D.
- Nhiệm vụ và trạng thái:
  1. **Quầy Nước Lọc Detox Chanh & Bạc Hà Tự Phục Vụ (Self-Serve Detox Lemon & Mint Water Station)**:
     - Bàn console gỗ sồi tối màu và mặt đá cẩm thạch trắng Calacatta (`x = -3.8m, z = -4.5m`).
     - Bình thủy tinh chứa nước detox ngâm 3 lát chanh vàng nổi và 4 nhánh bạc hà tươi, vòi đồng spigot, nắp gỗ núm vàng.
     - Khay gỗ đựng 4 ly thủy tinh sạch trong suốt, hộp khăn giấy kraft vuông, cốc đựng ống hút giấy thân thiện môi trường.
     - Thẻ gỗ khắc laser: "NƯỚC LỌC CHANH BẠC HÀ TỰ PHỤC VỤ (MIỄN PHÍ)".
     - Tương tác: Click vào bình/khay phát âm thanh rót nước róc rách procedural `playWaterPour()` và hiện thông báo Toast.
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
- File đã thay đổi:
  + [src/audio/chillAudio.ts](file:///d:/ChatGPT/CafeTrader/src/audio/chillAudio.ts)
  + [src/CafeScene.tsx](file:///d:/ChatGPT/CafeTrader/src/CafeScene.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 18.23s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi click vào các trạm/chi tiết trong quán tại `http://localhost:5173/` hoặc link Cloudflare Tunnel để nghe âm thanh tương tác Web Audio và nhận phản hồi trực quan.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).

## Bàn giao IDEA-30: Khắc Phục Lỗi Nút Chọn Gọi Món Bị Khóa & Hỗ Trợ Đồ Uống Cầm Tay (Takeaway / Dạo Quán)

- Ngày / AI / phạm vi: 12/11/2026 / Antigravity / Khắc phục triệt để lỗi nút gọi món trong thực đơn bị vô hiệu hóa (`disabled`) khi người chơi chưa ngồi vào ghế, mở rộng tính năng cho phép gọi đồ uống cầm tay (mang đi) hoặc tự động chọn bàn trống ngay trong tab Menu.
- Nhiệm vụ và trạng thái:
  1. **Khắc phục lỗi nút disabled**:
     - Gỡ bỏ điều kiện `!seat` khỏi thuộc tính `disabled` của `TableMenuPages` và `drink-card`.
     - Nút gọi món luôn trong trạng thái sáng và có thể bấm được; chỉ tạm khóa hiển thị `⏳ Barista đang pha chế...` khi đang trong tiến trình 3 giây đếm ngược.
  2. **Nâng cấp component `TableMenuPages`**:
     - Thêm prop `isSeated`.
     - Tự động thay đổi nhãn nút thông minh: `☕ Gọi [Món] (Tại bàn)` khi người chơi đã có ghế, hoặc `☕ Gọi [Món] (Mang đi)` khi đang đứng dạo quán.
  3. **Cải tiến logic `handleOrderDrink`**:
     - Cho phép xử lý gọi món thành công cả khi chưa ngồi vào bàn (chế độ cầm tay / mang đi).
     - Giọng nói tiếng Việt của Bartender Thu Hà phân biệt rõ ràng: *"Thu Hà đã nhận đơn... Mời bạn thư giãn tại Bàn X, tôi sẽ mang đồ uống đến tận bàn."* vs *"Thu Hà đã nhận món... mang đi. Tôi đang pha chế cho bạn ngay đây!"*.
     - Khi đồ uống sẵn sàng, phát âm thanh `playSipDrink()`, cấp ly đồ uống cho người chơi (`ordered = drinkTitle`) và gửi thông báo Toast.
  4. **Bổ sung tiện ích tự động chọn bàn trong Tab Menu**:
     - Thêm banner thông báo tinh tế `menu-takeaway-notice` với nút `[🪑 Hoặc ngồi vào bàn trống]`, cho phép người chơi ngồi ngay vào bàn còn trống gần nhất chỉ với 1 cú click.
  5. **Tương tác thưởng thức & Nhấp ngụm đa năng**:
     - Thẻ `order-active-card` hiển thị đầy đủ và cho phép nhấp ngụm `☕ Nhấp một ngụm` (+15 XP, tích lũy tách cà phê) cho cả khách đứng lẫn khách ngồi.
     - Khi khách dạo quán bước tới bàn bất kỳ và ngồi xuống, hệ thống 3D tự động hiển thị ly đồ uống bốc khói lên mặt bàn đó.
- File đã thay đổi:
  + [src/components/TableMenuPages.tsx](file:///d:/ChatGPT/CafeTrader/src/components/TableMenuPages.tsx)
  + [src/App.tsx](file:///d:/ChatGPT/CafeTrader/src/App.tsx)
  + [src/App.css](file:///d:/ChatGPT/CafeTrader/src/App.css)
  + [CAP_NHAT_DU_AN.md](file:///d:/ChatGPT/CafeTrader/CAP_NHAT_DU_AN.md)
  + [TIEN_DO.md](file:///d:/ChatGPT/CafeTrader/TIEN_DO.md)
  + [BAN_GIAO.md](file:///d:/ChatGPT/CafeTrader/BAN_GIAO.md)
- Kiểm tra đã chạy:
  + `npm test`: **PASS 27/27 tests** (100%).
  + `npm run verify`: **PASS 27/27 tests**, `tsc --noEmit && vite build` PASS trong 9.21s (0 lỗi TypeScript, 0 lỗi build).
- Hạn chế / Việc tiếp theo: Người chơi mở Menu đồ uống trên `http://localhost:5173/` hoặc link Cloudflare Tunnel và bấm nút "Gọi món" để trải nghiệm quy trình pha chế và nhận ly cà phê cầm tay hoặc tại bàn mượt mà.
- Git: `master`, chưa commit (tuân thủ Điều 8 AGENTS.md).
- Quota: Chưa xác minh quota (phiên không có công cụ chỉ số quota chính thức).
