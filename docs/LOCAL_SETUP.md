# Hướng dẫn thiết lập và chạy tại máy local

Tài liệu này mô tả cách chạy toàn bộ hệ thống (MySQL, Redis, Backend API, Frontend) trên Windows.

---

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản gợi ý |
|---------|-----------------|
| Node.js | 20 LTS trở lên |
| npm | 9+ (đi kèm Node) |
| Docker Desktop | Để chạy MySQL + Redis |
| Git | Clone repository |

**Tùy chọn:** Postman hoặc Insomnia để test API; trình duyệt cho frontend.

---

## 2. Clone repository

```bash
git clone <repository-url>
cd Ticket-booking-web
```

---

## 3. Khởi động hạ tầng (MySQL + Redis)

```bash
cd backend
docker compose up -d
```

| Service | Container | Port host |
|---------|-----------|-----------|
| MySQL 8 | `concert-mysql` | **3307** → 3306 |
| Redis 7 | `concert-redis` | **6379** |

Kiểm tra container đang chạy:

```bash
docker compose ps
```

Database mặc định: `concert_ticketing`, user `root`, password `root` (xem `docker-compose.yml`).

---

## 4. Cấu hình Backend

### 4.1 Biến môi trường

```bash
cd backend
cp .env.example .env
```

Chỉnh `.env` nếu cần:

```env
DATABASE_URL="mysql://root:root@localhost:3307/concert_ticketing"
JWT_SECRET="change-me-in-production"
REDIS_URL="redis://127.0.0.1:6379"
PORT=3000
NODE_ENV=development
```

**Không có Redis?** Thêm `REDIS_ENABLED=false` — API vẫn chạy (rate limit in-memory, không cache idempotency Redis).

### 4.2 Cài dependency & database

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

### 4.3 Chạy API

```bash
npm run dev
```

| Endpoint | URL |
|----------|-----|
| API base | http://localhost:3000 |
| Health | http://localhost:3000/health |
| Swagger UI | http://localhost:3000/api-docs |

Log mong đợi: `Server running on port 3000`, `Redis connected` (hoặc cảnh báo fallback).

---

## 5. Chạy Frontend

Terminal mới:

```bash
cd frontend
npm install
npm run dev
```

| | URL |
|---|-----|
| Ứng dụng | http://localhost:5173 |
| Proxy API | `/api/*` → `http://localhost:3000/*` |

File `frontend/.env` (tùy chọn):

```env
VITE_API_URL=/api
```

---

## 6. Tài khoản demo (sau seed)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@demo.com | password123 |
| Customer | customer@demo.com | password123 |

**Voucher mẫu:** `FLASH10` (giảm 10%)

---

## 7. Luồng kiểm thử nhanh (thủ công)

1. Mở http://localhost:5173 — đăng nhập customer.
2. Chọn concert → chọn vé → Checkout (tạo booking `PENDING`).
3. **My Bookings** → **Pay money** → `PAID` (mock).
4. Đăng nhập admin → quản lý concert / booking / voucher.

**Giữ chỗ hết hạn:** Đợi > 15 phút không pay → job chuyển `EXPIRED`, vé trở lại kho.

---

## 8. Kiểm thử API bằng Postman

1. Import collection: `docs/postman/Concert-Ticketing.postman_collection.json`
2. Import environment: `docs/postman/Concert-Ticketing.postman_environment.json`
3. Chọn environment **Concert Ticketing - Local**
4. Chạy folder theo thứ tự: **Auth → Customer → Admin**

Chi tiết: [postman/README.md](postman/README.md)

---

## 9. Chạy unit test Backend

```bash
cd backend
npm test
```

---

## 10. Lệnh thường dùng

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | API + nodemon |
| `npm start` | API production mode |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed dữ liệu demo |
| `docker compose down` | Dừng MySQL/Redis |
| `docker compose down -v` | Xóa volume DB (reset data) |

---

## 11. Xử lý sự cố

### `ECONNREFUSED` MySQL

- Docker chưa chạy: `docker compose up -d`
- Sai port trong `DATABASE_URL` — phải là **3307** (host map), không phải 3306 trong container.

### Redis unavailable

- Bình thường nếu Redis chưa lên — server vẫn start với cảnh báo.
- Hoặc set `REDIS_ENABLED=false` trong `.env`.

### `P2002` idempotencyKey

- Client gửi trùng key — API trả booking cũ (đúng thiết kế).
- Muốn đơn mới: dùng `idempotencyKey` UUID mới.

### Prisma migrate lỗi

```bash
npx prisma migrate reset   # CẢNH BÁO: xóa toàn bộ data local
npm run db:seed
```

### Frontend không gọi được API

- Backend phải chạy port 3000.
- Kiểm tra proxy trong `frontend/vite.config.ts`.

---

## 12. Cấu trúc thư mục dự án

```
Ticket-booking-web/
├── backend/          # Express API, Prisma, Docker
├── frontend/         # React + Vite UI
├── docs/             # Tài liệu nộp bài
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── LOCAL_SETUP.md
│   ├── ASSUMPTIONS.md
│   ├── CODING_GUIDELINES.md
│   └── postman/
├── README.md
└── technical_assessment.md
```
