# LinguaFlash Pro PWA

Bản này được tách từ bản Full đã test ổn. `index.html` chỉ còn giao diện, còn dữ liệu lớn nằm trong thư mục `data/`.

## Cấu trúc
- `index.html`: giao diện
- `app.js`: logic ứng dụng
- `data/*.js`: các gói dữ liệu học
- `manifest.webmanifest`: thông tin cài PWA
- `service-worker.js`: cache/offline
- `icons/`: icon Android/iOS
- `supabase-config.js`: cấu hình Supabase public hiện tại

## Chạy thử trên máy
Không mở bằng `file://` nếu muốn test PWA. Chạy một web server, ví dụ:

```bash
python -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

## Đưa lên GitHub Pages
Upload toàn bộ nội dung thư mục này vào root repo `linguaflash-pro` (không chỉ riêng index.html). GitHub Pages chạy HTTPS nên service worker và cài PWA sẽ hoạt động.

## Cài trên điện thoại
- Android/Chrome: menu > Install app / Add to Home screen.
- iPhone/Safari: Share > Add to Home Screen.

## Giai đoạn tiếp theo
Bản này ưu tiên ổn định: dữ liệu đã tách file nhưng vẫn được nạp khi mở app để không thay đổi logic đã test. Sau khi test PWA ổn, có thể chuyển từng Level sang lazy-load theo lựa chọn của người dùng để giảm tải ban đầu hơn nữa.
