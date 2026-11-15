# assets/ — thay ảnh & âm thanh tại đây

```
assets/
├── images/
│   ├── avatar.svg          ← ảnh đại diện (placeholder)
│   └── favicon.svg         ← icon tab trình duyệt
└── audio/
    ├── voice/              ← giọng nói giới thiệu (bạn tự thêm, ví dụ intro.mp3)
    ├── music/
    │   └── little-world-lullaby.wav   ← nhạc nền mẫu (thay bằng bài của bạn)
    └── sfx/
        ├── click.wav         ← tiếng click
        ├── hover.wav         ← tiếng hover (mặc định tắt)
        ├── transition.wav    ← tiếng chuyển cảnh
        └── notification.wav  ← tiếng thông báo
```

**Cách nhanh nhất:** bỏ file mới vào đúng thư mục, **giữ nguyên tên file** → không cần sửa code.
Nếu tên/định dạng khác (ví dụ `.mp3`), chỉ cần đổi đường dẫn trong `public/js/config.js`.

Gợi ý:
- Ảnh đại diện: ảnh vuông, ≥ 400×400px (jpg/png/webp đều được, Netlify tự tối ưu).
- Hiệu ứng âm thanh: ngắn (< 0.5 giây), nhỏ (< 50 KB), âm lượng nhẹ.
- Nhạc nền: mp3 128–192 kbps là đủ. Bài nhạc sẽ tự lặp nếu chỉ có 1 bài.
- Giọng nói: mp3/m4a, nên dưới 20 giây. Chỉ phát 1 lần, không lặp.
