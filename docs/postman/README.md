# Postman — Concert Ticketing API

Bộ collection kiểm thử API trên môi trường **local** (`http://localhost:3000`).

## Yêu cầu trước khi import

1. Backend đang chạy (`npm run dev` trong `backend/`)
2. MySQL + Redis: `docker compose up -d`
3. Đã migrate + seed: `npx prisma migrate deploy && npm run db:seed`

## Import vào Postman

1. **File → Import**
2. Chọn:
   - `Concert-Ticketing.postman_collection.json`
   - `Concert-Ticketing.postman_environment.json`
3. Chọn environment **Concert Ticketing - Local** (góc trên phải)

## Chạy theo thứ tự đề xuất

### Folder: Auth

1. **Login Customer** — lưu JWT vào biến `token`
2. (Tùy chọn) **Login Admin** — khi test API admin

### Folder: Customer

1. **List Concerts** — xác nhận có concert seed
2. **Concert Detail** — kiểm tra `ticketCategoryId` (cập nhật biến `ticketCategoryId` nếu khác 1)
3. **Validate Voucher** — mã `FLASH10`
4. **Create Booking (PENDING)** — tự sinh `idempotencyKey`, lưu `bookingId`
5. **Mock Pay Booking** — `PENDING` → `PAID`
6. **My Bookings** / **Get Booking By Id**

### Folder: Admin

Đăng nhập admin trước (Login Admin), sau đó:

- List Bookings, List Concerts, List Vouchers
- Patch Booking Status, Create Voucher, ...

## Biến collection / environment

| Biến | Mô tả |
|------|--------|
| `baseUrl` | `http://localhost:3000` |
| `token` | JWT — set tự động sau Login |
| `concertId` | ID concert (mặc định 1 sau seed) |
| `ticketCategoryId` | ID hạng vé (VIP thường = 1) |
| `bookingId` | Set sau Create Booking |
| `idempotencyKey` | UUID — pre-request script trên Create Booking |

## Tài khoản demo

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | password123 |
| Admin | admin@demo.com | password123 |

## Idempotency test

1. Chạy **Create Booking** hai lần **không đổi** `idempotencyKey` → cùng `bookingId`, không trừ kho thêm.
2. Đổi `idempotencyKey` (hoặc chạy **New Idempotency Key**) → booking mới.

## Swagger thay thế

Nếu không dùng Postman: http://localhost:3000/api-docs
