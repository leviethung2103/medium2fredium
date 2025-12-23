<img src="assets/icons/icon-128.png" width="64"/>

# Medium to Freedium Converter

Tiện ích mở rộng trình duyệt Chrome/Edge giúp bạn đọc miễn phí các bài viết Medium có trả phí thông qua Freedium.

## Tính năng

- **Click icon để chuyển đổi**: Click icon tiện ích khi đang trên trang Medium để tự động mở bài viết trên Freedium trong tab mới
- **Menu chuột phải**: Click chuột phải vào bất kỳ link Medium nào để mở trên Freedium
- **Nhẹ và nhanh**: Không tốn tài nguyên, không chạy ngầm
- **Bảo mật riêng tư**: Không theo dõi, không thu thập dữ liệu, xử lý hoàn toàn cục bộ
- **Hỗ trợ nhiều domain**: Hoạt động với medium.com và các publication phổ biến

## Các domain được hỗ trợ

Tiện ích hoạt động trên tất cả các domain sau:
- medium.com (và tất cả subdomain)
- hackernoon.com
- towardsdatascience.com
- betterprogramming.pub
- bettermarketing.pub
- betterhumans.pub
- uxdesign.cc
- levelup.gitconnected.com
- codeburst.io
- infosecwriteups.com
- plainenglish.io
- Và nhiều domain khác...

## Cài đặt

### Từ mã nguồn

1. **Kiểm tra phiên bản Node.js** >= 18
   ```bash
   node --version
   ```

2. **Clone repository**
   ```bash
   git clone <repository-url>
   cd freedium_converter
   ```

3. **Cài đặt dependencies**
   ```bash
   npm install
   ```

4. **Build extension**
   ```bash
   npm run build
   ```

5. **Load extension vào Chrome/Edge**
   1. Mở `chrome://extensions/` (hoặc `edge://extensions/`)
   2. Bật "Developer mode" (góc trên bên phải)
   3. Click "Load unpacked"
   4. Chọn thư mục `dist` trong project

## Cách sử dụng

### 1. Click icon tiện ích
- Truy cập bất kỳ bài viết Medium nào
- Click vào icon "Medium to Freedium" trên thanh công cụ
- Bài viết sẽ tự động mở trên Freedium trong tab mới

### 2. Menu chuột phải
- Click chuột phải vào bất kỳ link Medium nào trên bất kỳ trang web nào
- Chọn "Đọc miễn phí trên Freedium"
- Link sẽ mở trên Freedium trong tab mới

### 3. Mở nhiều link cùng lúc
- Click chuột phải trên trang web có nhiều link Medium
- Chọn "Mở tất cả link Medium trong tabs mới"
- Tất cả link Medium trên trang sẽ được mở trên Freedium

## Development

### Watch mode
Để phát triển với hot reload:
```bash
npm run watch
```

### Build production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

### Format code
```bash
npm run format
```

### Type checking
```bash
npm run check-types
```

## Cấu trúc dự án

```
freedium_converter/
├── src/
│   ├── background/         # Service worker (background script)
│   │   └── index.ts        # Xử lý logic chính, context menu, icon click
│   ├── content/            # Content scripts
│   │   └── index.ts        # Script chạy trên các trang Medium
│   └── common/             # Shared utilities
├── assets/
│   └── icons/              # Extension icons
├── manifest.json           # Extension manifest
├── vite.config.ts          # Vite configuration
└── dist/                   # Build output (generated)
```

## Công nghệ sử dụng

- **Manifest V3**: Chrome Extension API mới nhất
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **CRXJS**: Vite plugin cho Chrome extensions
- **React**: UI library (minimal usage)
- **ESLint + Prettier**: Code quality

## Quyền hạn

Tiện ích yêu cầu các quyền sau:
- `storage`: Lưu cài đặt người dùng
- `tabs`: Mở tab mới với link Freedium
- `activeTab`: Đọc URL của tab đang hoạt động
- `contextMenus`: Tạo menu chuột phải
- `scripting`: Inject scripts vào trang Medium
- `notifications`: Hiển thị thông báo khi click icon trên trang không phải Medium

## Bảo mật & Riêng tư

- Không thu thập dữ liệu người dùng
- Không gửi thông tin đến server bên ngoài
- Xử lý hoàn toàn cục bộ trên máy
- Mã nguồn mở, có thể kiểm tra

## Giấy phép

MIT License

## Đóng góp

Contributions, issues và feature requests luôn được hoan nghênh!

## Credits

Built with [Chrome Extension Boilerplate](https://github.com/Gunock/chrome-extension-boilerplate-react-vite)

---

Made with ❤️ for the Vietnamese developer community
