# Concert Ticket Booking Platform

Nền tảng đặt vé ca nhạc trực tuyến. Khách đặt vé, áp voucher, thanh toán giả lập; admin quản lý sự kiện, đơn hàng và mã giảm giá. Hỗ trợ flash sale: chống bán vượt tồn kho, chống trùng đơn, giới hạn request.

**Stack:** Node.js, Express, Prisma, MySQL, Redis, React, Vite.

## Khởi chạy

```bash
cd backend && docker compose up -d

cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev

cd frontend && npm install && npm run dev
```

| | URL |
|---|-----|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |
| Web | http://localhost:5173 |

**Demo:** `customer@demo.com` / `admin@demo.com` - mật khẩu `password123` - voucher `FLASH10`

**Luồng đặt vé:** Checkout -> `PENDING` (giữ vé 15 phut) -> Pay money -> `PAID` (mock).

## Tài liệu

Chi tiết trong [docs/README.md](docs/README.md).

```bash
cd backend && npm test
```