# KIM CHỈ NAM — CAFETRADER / CLOSING BELL

Phiên bản: 1.1 · 11/11/2026 · Múi giờ: Asia/Saigon  
Trạng thái: định hướng sản phẩm và kiến trúc; không phải xác nhận rằng tính năng đã hoàn thành.

> **Lời hứa sản phẩm:** CafeTrader là một “quán cà phê để cùng hiện diện” dành cho trader: vào web nhanh, chọn một góc hợp tâm trạng, gặp đúng người, nói chuyện đúng phạm vi và cảm nhận một không gian có chiều sâu. Nó không phải sàn giao dịch, không phải metaverse thành phố rỗng, và không hứa hẹn lợi nhuận.

Tài liệu này là điểm vào bắt buộc cho người/agent mới. Trước khi làm, đọc thêm `AGENTS.md`, `.codex/README.md`, `CAP_NHAT_DU_AN.md`, `TIEN_DO.md` và `BAN_GIAO.md`. Yêu cầu mới nhất của chủ dự án luôn ưu tiên. Nếu kế hoạch, mã và tiến độ không khớp, đối chiếu bằng chứng rồi ghi rõ chênh lệch; không tự suy đoán là đã xong.

---

## 1. Concept: Closing Bell, nhưng mở đầu ngày mới

### 1.1 Bản sắc

**Tên trải nghiệm:** *Closing Bell — Café Trader Villa*. “Closing Bell” là cảm giác nghi thức, tập trung và kết nối sau một phiên thị trường; không phải mô phỏng thị trường hay khuyến khích giao dịch.

Khách bắt đầu **ngoài cổng**, đi qua lối dạo và sảnh lớn, sau đó tự chọn một trong sáu góc trải nghiệm. Toà biệt thự hoàng gia tám tầng là khung phát triển dài hạn; ở giai đoạn đầu, trải nghiệm phải vẫn rõ ràng và đầy đủ dù chỉ có một số tầng hoạt động.

### 1.2 Nguyên tắc thiết kế

1. **Một phút đầu phải có ích:** thấy ngay nơi mình đang ở, số người, góc phù hợp và cách bắt đầu.
2. **Không gian dẫn hành vi:** người muốn công khai, riêng tư, tập trung hoặc nghỉ ngơi được dẫn tới đúng khu thay vì dồn chung một sảnh.
3. **Đẹp nhưng có ngân sách:** chi tiết đặt ở tuyến nhìn chính; hình học, texture, ánh sáng và âm thanh phải phù hợp web/mobile.
4. **Social trước, 3D sau:** 3D làm cho cuộc gặp đáng nhớ; chọn phòng/bàn nhanh vẫn luôn có từ UI 2D.
5. **Âm thanh có phép tắc:** mic mặc định tắt, voice theo bàn, nhạc và hiệu ứng điều chỉnh độc lập.
6. **Mở rộng bằng tầng/khu, không mở rộng bằng sự phức tạp:** chỉ khai trương tầng mới khi tầng cũ có nhu cầu và vận hành ổn định.

### 1.3 Ngôn ngữ thị giác

Nền là nâu-đen ấm; điểm nhấn là vàng brass và kem giấy; không dùng neon tài chính hay bảng giá nhấp nháy. Cảm hứng là sự trang trọng ấm áp của café cổ điển quốc tế, diễn giải thành bản sắc riêng CafeTrader — không sao chép layout, hình ảnh hay tài sản của bất kỳ quán nào.

| Token | Màu gợi ý | Vai trò |
|---|---:|---|
| Ink | `#1B1410` | nền sâu, khung, chữ sáng |
| Brass | `#C9A248` | CTA, chuông, viền ưu tiên |
| Paper | `#F2E8D5` | tiêu đề, vùng đọc dài |
| Forest | `#2F6F62` | trạng thái yên tĩnh / có chỗ |
| Jade | `#30DC97` | online, kết nối tốt |
| Coral | `#FF6B5E` | cảnh báo, khu đang đông |

Typography: serif giàu cá tính chỉ cho tên khu/tiêu đề; sans-serif dễ đọc cho điều khiển, số liệu và mobile. UI phải sắc nét, ít lớp phủ, tương phản đủ cao, không phụ thuộc chỉ vào màu.

---

## 2. Mặt bằng: từ cổng đến Sky Observatory

### 2.1 Luồng không gian

`Cổng quán → tiền sảnh/lối dạo → Grand Arrival Hall → chọn góc hoặc chọn bàn từ UI → vào khu → tương tác → đổi khu/rời quán`

| Tầng | Tên không gian | Vai trò khi mở |
|---:|---|---|
| Ngoài trời | Gate, boulevard, đài phun nước, vườn | điểm spawn, định hướng, nhịp chuyển từ web vào quán |
| T1 | Grand Arrival Hall + Trading Floor | social công khai, quầy bar, bảng lịch hoạt động |
| T2 | VIP Skyline Lounge + The Vault | bàn nhóm nhỏ, phòng theo lời mời |
| T3 | Royal Salon | workshop/AMA quy mô nhỏ |
| T4 | Golden Gallery | triển lãm nội dung cộng đồng, lịch sử mùa |
| T5 | Emerald Conservatory | focus/chill, cây xanh và đọc |
| T6 | Crown Library | học, đọc, co-working yên tĩnh |
| T7 | Imperial Terrace | sự kiện hoàng hôn, nhóm đông có điều phối |
| T8 | Sky Observatory | xem chương trình đặc biệt, góc quan sát, event giới hạn |

**Quy tắc khai trương:** T1 và một phần T2 là MVP có chức năng thật. T3–T8 trước hết là cấu trúc/map, điểm đến và định hướng; chỉ công bố là “mở” khi đã có ghế, quyền, voice, tối ưu và checklist vận hành tương ứng. Không dùng tầng trống để đánh lừa khách về mức hoạt động.

### 2.2 Sáu góc, sáu lý do để ở lại

Các diện tích chỉ là tỷ lệ tham khảo cho mặt bằng ảo, không phải thông số xây dựng thực.

| Mã | Góc | Quy mô tham chiếu | Hành vi chính | Vật liệu / ánh sáng / âm thanh | Trạng thái mở đầu |
|---|---|---:|---|---|---|
| A | **Trading Floor** | 70 m² | gặp công khai, theo dõi nội dung host | gỗ óc chó, brass, đèn ấm; nền café nhẹ | MVP |
| B | **The Vault** | 28 m² | nhóm kín 2–4 người | đá tối, sofa thấp, cách âm cảm nhận; voice bàn riêng | MVP có lời mời |
| C | **The Desk** | 34 m² | làm việc/focus, bàn cá nhân | desk tối giản, lamp task-light; ambient rất thấp | sau MVP |
| D | **Kitchen Pass** | 26 m² | xem pha đồ, gọi món ảo | inox đồng, gốm, hiệu ứng pha chế; tiếng quầy | MVP giới hạn |
| E | **Library Lounge** | 47 m² | đọc, học, thảo luận chậm | gỗ, da, giấy; jazz/ambient nhỏ | sau MVP |
| F | **Terrace** | 44 m² | chill, ngắm trời, event | đá sáng, cây, lan can; gió/đêm tùy giờ | sau MVP |

Mỗi góc bắt buộc có: tên, mục đích, sức chứa, độ ồn, quyền tham gia, nút vào nhanh, trạng thái còn chỗ và lối ra rõ ràng. Thêm khu mới phải trả lời được “khách đến đây để làm gì?” trước khi dựng model.

---

## 3. Một ngày, ba nhịp chuông

Âm thanh và UI đổi tinh tế theo nhịp, không tự phát tiếng lớn và luôn có tuỳ chọn giảm/tắt.

| Nhịp | Khung giờ địa phương gợi ý | Cảm giác | Cảnh/ánh sáng | Hoạt động |
|---|---|---|---|---|
| **Mở cửa** | 07:00–10:30 | nhẹ, sáng, bắt đầu | nắng sớm, espresso, acoustic êm | check-in, chọn bàn, morning briefing |
| **Giữa phiên** | 10:30–16:30 | rõ, tập trung, không căng | ánh sáng trung tính, màn hình có chủ đích | focus, watch party, gọi đồ |
| **Closing Bell** | 16:30–23:00 | vàng, chậm, kết nối | hoàng hôn/đêm, đèn bàn ấm, jazz/chill | recap, giao lưu, AMA, terrace |

Chuông là biểu tượng UI/animation ngắn, có thể tắt, không thay thế cảnh báo giao dịch. Playlist phải có quyền dùng phù hợp; nguồn tham khảo không đồng nghĩa được phép phát công khai. YouTube chỉ qua trình phát nhúng chính thức và theo chính sách nền tảng.

---

## 4. Phạm vi, ranh giới và phiên bản

### 4.1 MVP cần giải quyết

- Khách vào link, vào thử hoặc đăng nhập, chọn avatar/tên.
- Nhìn thấy các room/khu đang hoạt động, sức chứa và độ ồn; vào bằng 3D hoặc nút “đến bàn”.
- Đi, va chạm hợp lý, góc nhìn POV/góc ba, điều khiển cảm ứng; có chế độ giảm chuyển động.
- Hai người trong cùng room thấy trạng thái của nhau; ghế không bị hai người chiếm cùng lúc.
- Chat, biểu cảm và voice theo bàn; mic mặc định tắt và quyền media thực thi ở server/media layer.
- Trading Floor, The Vault giới hạn, Kitchen Pass/menu ảo, màn hình host và cài đặt âm thanh cá nhân.
- Admin quản lý room/nội dung/menu/playlist/báo cáo với quyền phía server.
- Test hồi quy, đo hiệu năng, log cần thiết và bàn giao.

### 4.2 Chưa thuộc phạm vi

Không thanh toán thật, ví, sàn giao dịch, tín hiệu mua bán, tư vấn đầu tư, giữ tiền khách, NFT/bất động sản ảo, ghi âm voice tự động, NPC AI hội thoại, hay thành phố ảo. Những đề xuất này cần quyết định phạm vi mới, pháp lý và ngân sách riêng.

### 4.3 Lộ trình không gian

1. **Pilot:** Cổng + T1 + T2 tối thiểu; sáu góc hiện qua điều hướng/UI nhưng chỉ công bố khu đã đủ chức năng.
2. **Community:** mở The Desk, Library, Terrace theo nhu cầu; sự kiện định kỳ và review chỉ số giữ chân.
3. **Villa:** hoàn thiện T3–T8 lần lượt, mỗi tầng có mục đích, âm thanh, quyền và test riêng.
4. **Scale:** thêm room template/phiên song song; không nhân bản map nặng vô tội vạ.

---

## 5. Kiến trúc trải nghiệm và kỹ thuật

| Lớp | Đề xuất | Quy tắc không thoả hiệp |
|---|---|---|
| Web/UI | React + TypeScript + Vite | UI 2D luôn thay thế được thao tác 3D quan trọng |
| 3D | Babylon.js | LOD, instance, texture nén, ánh sáng bake/giới hạn realtime; tải theo khu |
| Realtime | Node.js + Colyseus hoặc tương đương | server có thẩm quyền với room, ghế, hành động chung |
| Auth/data | Supabase Auth + PostgreSQL hoặc tương đương | không đặt secret/quyền admin ở frontend; chính sách truy cập được test |
| Voice | LiveKit hoặc tương đương | token server-side; quyền nghe theo room/bàn, không chỉ mute UI |
| Media | player chính thức / nội dung được cấp phép | không tách âm thanh hay né chính sách nguồn |
| Vận hành | hosting web + server realtime + media + CDN tách lớp | staging, logs, backup/rollback trước phát hành |

### 5.1 Mô hình dữ liệu tối thiểu

`profile, avatar, room_template, room_session, member_presence, zone, table, seat, seat_claim, menu_item, virtual_order, playlist, screen_program, report, role, audit_event`.

Không ghi chuyển động từng khung hình vào database. Presence/transforms là dữ liệu thời gian thực có timeout; dữ liệu dài hạn chỉ lưu điều thật sự cần vận hành và theo chính sách riêng tư.

### 5.2 Ngân sách chất lượng cần đo

Mục tiêu thử ban đầu (không phải cam kết): laptop mục tiêu 60 FPS, mobile mục tiêu 30 FPS; P75 từ mở link tới điều khiển được ≤10 giây trên mạng thử 20 Mbps; dữ liệu cần trước khi điều khiển cố gắng ≤8 MB; room public thử 20 người trong 30 phút. T01/T08 phải chốt thiết bị, browser, mẫu đo và số đo thực. Không dùng ảnh đẹp hay build thành công làm bằng chứng multiplayer/performance.

---

## 6. Hành trình, quyền và tình huống lỗi

**Hành trình chuẩn:** Mở link → khách/đăng nhập → chọn avatar → xem “Chọn góc của bạn” → vào cổng → chọn room/bàn hoặc teleport UI → ngồi → nói chuyện/xem màn hình/nghe nhạc → gọi món ảo → đổi bàn, đổi room hoặc rời quán.

**Phải xử lý rõ:** room/ghế đầy; tranh chấp ghế; lời mời Vault hết hạn; mic bị từ chối; mất mạng/reconnect; rời bàn lúc đơn đang pha; hai tab; khóa màn hình mobile; autoplay bị chặn; host đổi màn hình; asset 3D tải chậm; người dùng cần giảm chuyển động. Mọi lỗi cần lời giải thích và thao tác phục hồi, không chỉ console error.

Quyền cần tách: khách, thành viên, host room, moderator, admin. Mọi quyền ảnh hưởng tới room, ghế, voice, playlist, màn hình, report phải kiểm tra phía server.

---

## 7. Vai trò agent và quy tắc phối hợp

| Mã | Vai trò | Chịu trách nhiệm |
|---|---|---|
| A0 | Điều phối/kiến trúc | scope, contract, ownership file, tích hợp, quyết định |
| A1 | Sản phẩm/UX | journey, onboarding, “chọn góc”, usability test |
| A2 | 3D/tài nguyên | mặt bằng, villa, asset ledger, lighting, tối ưu |
| A3 | Character/camera | movement, POV, camera ba, ghế, touch, accessibility |
| A4 | Web/auth/admin | login/guest, room UI, admin, quyền |
| A5 | Multiplayer | presence, room, seat claim, chat, reconnect |
| A6 | Media | voice, music, screen, token/quyền media |
| A7 | Menu/service | menu, virtual order, trạng thái phục vụ |
| A8 | QA/review | test case, review độc lập, hiệu năng, bảo mật |
| A9 | Ops | staging, monitoring, backup, rollback, runbook |

A0 phải chốt contract và file ownership trước khi chạy song song. Mỗi thay đổi lớn cần review độc lập, test hành vi thật và cập nhật `CAP_NHAT_DU_AN.md`, `TIEN_DO.md`, `BAN_GIAO.md`. Không agent nào tự commit, push, triển khai hoặc mua dịch vụ nếu không có ủy quyền cụ thể.

---

## 8. Danh mục thực hiện T01–T28

Trạng thái thật xem `TIEN_DO.md`; bảng này chỉ định nghĩa đầu ra/điều kiện nghiệm thu.

| Mã | Công việc | Chủ trì | Đầu ra / nghiệm thu |
|---|---|---|---|
| T01 | Chốt persona, journey, thiết bị và số đo | A1/A8 | luồng + lỗi + ma trận thiết bị có xác nhận |
| T02 | Chốt scope/kiến trúc theo Pilot | A0 | ADR, ranh giới dịch vụ, chi phí giả định |
| T03 | Chốt contract giao tiếp | A0/A5/A6 | events room/seat/media/order và version |
| T04 | Mặt bằng Closing Bell + asset ledger | A2 | cổng, sáu góc, 8 tầng, palette, license |
| T05 | Nền dự án và CI kiểm tra cơ bản | A0/A4 | chạy được, lint/type/test/build cơ bản |
| T06 | Map khối: cổng, T1–T2, cấu trúc villa | A2 | đường đi/camera/collision qua được |
| T07 | Movement, POV, camera ba, touch | A3 | desktop/mobile có fallback UI |
| T08 | Đo performance sớm | A8 | report FPS/tải theo thiết bị và quyết định |
| T09 | Guest/auth/session | A4 | vào thử, login/logout, chuyển trạng thái an toàn |
| T10 | UI chọn góc/room/bàn | A1/A4 | sức chứa, trạng thái, lỗi, teleport fallback |
| T11 | Multiplayer presence | A5 | hai thiết bị thấy nhau, timeout/reconnect |
| T12 | Bàn/ghế authoritative | A5/A3 | không trùng ghế, release đúng |
| T13 | Private room/Vault và invite | A4/A5 | quyền, token/lời mời, không rò room |
| T14 | Voice theo bàn | A6 | đúng phạm vi nghe, mic permission, đổi bàn |
| T15 | Chat, block, report | A5/A4 | rate limit, audit phù hợp, moderator flow |
| T16 | Nhạc, soundscape, màn hình | A6/A2 | ba nhịp chuông, consent/autoplay, quyền nguồn |
| T17 | Menu và đơn ảo | A7 | đúng bàn, cancel/retry, không trùng đơn |
| T18 | Kitchen Pass/nhân viên kịch bản | A7/A2 | đường phục vụ, fallback khi NPC/animation lỗi |
| T19 | Hoàn thiện visual theo zone/tầng | A2 | review art, LOD/texture/lighting trong budget |
| T20 | Mobile, accessibility, cài đặt | A3/A4 | touch, reduced motion, controls/audio dễ tìm |
| T21 | Admin/content ops | A4/A9 | room, screen, playlist, menu, moderation có quyền |
| T22 | Review bảo mật/dữ liệu | A8 | authz, secret, privacy, abuse cases |
| T23 | Load/performance/reliability | A8/A5/A6 | kịch bản tải, số đo, giới hạn công bố |
| T24 | Staging và phục hồi | A9 | HTTPS, logs, backup/rollback được diễn tập |
| T25 | Pilot người thật | A1/A8 | phản hồi, replay lỗi, quyết định ưu tiên |
| T26 | Sửa, regression, review lại | A0 + owners | test/lỗi xác minh lại |
| T27 | Readiness phát hành | A8/A9 | checklist, rủi ro còn lại, go/no-go chủ dự án |
| T28 | Bàn giao vận hành | A9/A1 | runbook, FAQ, owner, cách báo sự cố |

Chuỗi ưu tiên: **T01–T04 → T05–T08 → T09–T15 → T16–T21 → T22–T24 → T25–T28**. Có thể song song sau T03, miễn ownership file rõ và không sửa cùng vùng.

---

## 9. Kiểm thử, review và điều kiện “xong”

- Mỗi feature có test case hạnh phúc, lỗi, regression và bằng chứng chạy; auto test chạy sau thay đổi phù hợp.
- Tối thiểu: unit cho state/room, integration cho protocol/quyền, smoke E2E cho vào quán–chọn bàn–rời bàn, manual đa thiết bị cho 3D/voice/media.
- Review độc lập xác nhận: scope đúng, quyền server-side, mobile fallback, asset/license, performance budget.
- “Hoàn thành” chỉ khi có thay đổi đã review, kiểm tra đã chạy/kết quả thật, tài liệu tiến độ/bàn giao đã cập nhật và hạn chế còn lại được nêu.

Khi quota Codex còn khoảng 20% hoặc không đủ review: không nhận thêm việc lớn; đối chiếu plan–Git–code; chạy kiểm tra khả thi; cập nhật tiến độ/bàn giao. Dùng chỉ số chính thức của từng dịch vụ; `scripts/usage_guard.py` chỉ nhắc thủ công, không đọc quota tài khoản. Nếu không xem được quota, nói rõ là không xem được và chia việc nhỏ.

---

## 10. Git, quyền nội dung và quyết định chủ dự án

Git là lịch sử; GitHub hữu ích cho đồng bộ/bàn giao khi chủ dự án ủy quyền, nhưng không tự xuất bản website. Trước khi chuyển agent: kiểm tra thay đổi, cập nhật tài liệu, sau đó chỉ commit/push khi được phép. Không đưa lên repo: `.env`, token, secret, dữ liệu riêng, asset lớn hoặc nhạc không có quyền.

Chủ dự án quyết định: tên miền, ngân sách, tài khoản dịch vụ, mức công khai, tài nguyên thương hiệu, playlist và phát hành. Chi phí gồm AI/Codex, web, realtime/voice, CDN/storage và quyền media; chỉ ước lượng sau Pilot và số đo thật. Hạn mức Codex, Gravity/Antigravity và mọi dịch vụ khác là riêng biệt, không suy luận thay nhau.

## 11. Tham khảo triển khai

- Babylon.js performance: https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene/
- Colyseus rooms: https://docs.colyseus.io/room
- LiveKit media: https://docs.livekit.io/transport/media/publish/
- YouTube Developer Policies: https://developers.google.com/youtube/terms/developer-policies
- Poly Haven license: https://polyhaven.com/license
- Jamendo licensing: https://support-licensing.jamendo.com/individual-licenses
- Freesound licensing/FAQ: https://freesound.org/help/faq/
