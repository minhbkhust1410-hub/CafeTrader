# CafeTrader

Thư mục này lưu kế hoạch, cơ chế bàn giao và bản thử cục bộ của quán cà phê 3D. Bản thử chưa đủ tính năng hoặc bảo mật để công bố.

## Đọc trước khi bắt đầu

1. [Kế hoạch gốc](KE_HOACH_GOC.md): mục tiêu, phạm vi, phân vai, T01–T28 và tiêu chí.
2. [Tiến độ](TIEN_DO.md): trạng thái đã xác minh và việc tiếp theo.
3. [Bàn giao](BAN_GIAO.md): bối cảnh ngắn cho phiên hoặc AI kế tiếp.
4. [Hướng dẫn cho AI](AGENTS.md): quy tắc phối hợp và cập nhật.
5. [Cập nhật dự án](CAP_NHAT_DU_AN.md): đối chiếu mới nhất với từng mục T01–T28.
6. [Cấu hình kỹ thuật & runbook](CAU_HINH_DU_AN.md): port, proxy, lệnh chạy, ranh giới an toàn và checklist QA.

## Chạy bản thử cục bộ

Cần Node.js 20+ và npm. Tại thư mục dự án chạy `npm install`, sau đó mở hai cửa sổ terminal:

```powershell
npm run server
```

```powershell
npm run dev
```

Mở URL Vite in ra, thường là `http://127.0.0.1:5173/`. Có thể thử hai tab. Server chỉ chạy cục bộ, dữ liệu trong bộ nhớ và mất khi khởi động lại. Không đưa server prototype ra internet. Chạy `npm run build` và `npm test` để kiểm tra; kiểm thử kết nối cần quyền sử dụng socket localhost. Xem `CAP_NHAT_DU_AN.md` để biết giới hạn và các việc chưa hoàn thành.

Khi gửi cho một AI khác, có thể dán: “Đọc AGENTS.md, KE_HOACH_GOC.md, TIEN_DO.md và BAN_GIAO.md; kiểm tra Git và mã hiện có, đối chiếu tiến độ, nêu việc tiếp theo rồi thực hiện yêu cầu mới nhất của tôi.”

## Nhắc dành thời gian review

```powershell
python scripts/usage_guard.py start
python scripts/usage_guard.py check
python scripts/usage_guard.py check --remaining 20
python scripts/usage_guard.py start --service antigravity
python scripts/usage_guard.py check --service antigravity --remaining 20
```

`--remaining` là **phần trăm quota còn lại** mà người dùng tự đọc từ dashboard của dịch vụ đang sử dụng; nếu có nhiều cửa sổ thì dùng tỷ lệ thấp nhất. Chỉ số dưới hoặc bằng 20% yêu cầu chuyển sang review và bàn giao. Có thể thêm `--reset-minutes 30` nếu biết chính xác còn 30 phút đến lúc reset; từ 60 phút trở xuống sẽ nhắc review. Dùng `--service antigravity` để lưu đồng hồ riêng. Chạy `python scripts/usage_guard.py --help` để xem chi tiết.

Công cụ không tự đọc quota, không tự theo dõi nền và không chắc chắn bảo vệ quota. Mốc 4 giờ chỉ tính từ lúc chạy `start`, **không phải** thời gian reset chính thức; chỉ là nhắc dự phòng. Dữ liệu này ở `.local/` và không được đưa lên Git. Dùng dashboard là nguồn chính, và kiểm tra lại sau mỗi đầu việc.

Mã thoát: `0` chưa chạm ngưỡng theo dữ liệu đã nhập; `2` cần review/bàn giao; `3` chưa biết quota; `1` lỗi. `start` là mốc nhắc cục bộ mới, không thay đổi hoặc làm mới quota của nhà cung cấp.

## Git và bàn giao

GitHub có thể là nơi lưu lịch sử và đồng bộ sau khi người dùng thiết lập. Trước khi chuyển AI: kiểm tra thay đổi, cập nhật tiến độ/bàn giao, lưu phiên bản bằng commit, rồi push nếu đã được yêu cầu. AI tiếp theo kéo phiên bản mới và đọc bốn tài liệu trên. Không đăng khóa, mật khẩu, dữ liệu riêng, tài nguyên chưa được phép lên Git. Đưa project lên GitHub không đồng nghĩa website đã được triển khai.
