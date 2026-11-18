# KorvaTTS local bridge

Đây là adapter tự host cho [dogenthq/KorvaTTS](https://github.com/dogenthq/KorvaTTS), không phải một dịch vụ cloud. Repo công bố code, trọng số và voice style theo Apache-2.0; kiểm tra lại model card và license tại thời điểm phát hành trước khi phân phối.

## Cài lần đầu (không commit môi trường hoặc trọng số)

```powershell
py -3.10 -m venv .venv-tts
.\.venv-tts\Scripts\python -m pip install -r services\korvatts\requirements.txt
.\.venv-tts\Scripts\python -m uvicorn services.korvatts.bridge:app --host 127.0.0.1 --port 7861
```

KorvaTTS tải trọng số khi khởi động lần đầu. Chỉ chạy sau khi người vận hành đã xem dung lượng ổ đĩa, tài nguyên CPU/RAM và điều khoản model. Không tải model vào source tree hay Git.

## Nối vào CafeTrader

Mở một terminal khác cho server game:

```powershell
$env:VIET_TTS_SERVICE_URL = 'http://127.0.0.1:7861/synthesize'
npm run server
```

Tạo `.env.local` (đã được ignore) cho Vite:

```text
VITE_VIET_TTS_ENGINE=korva
```

Sau đó chạy lại `npm run dev`. CafeTrader chỉ gửi `text`, `voice` và `speed` đến Node local; Node chỉ relay đến `localhost`/`127.0.0.1`. Nếu bridge không chạy hoặc bị lỗi, ứng dụng tự quay về Web Speech API. Các giọng map trong UI là tên KorvaTTS, không dùng audio tham chiếu, không nhân bản giọng và không gửi hội thoại ra dịch vụ thứ ba.

## Kiểm tra local

```powershell
Invoke-RestMethod http://127.0.0.1:7861/health
```

Chỉ nên dùng endpoint cho câu thông báo ngắn. Hàng đợi/streaming, cache file audio, metrics và hardening cho môi trường công khai chưa nằm trong prototype này.
