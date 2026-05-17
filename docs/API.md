# Tài liệu API

> **Base URL (local):** `http://localhost:3000`  
> **Swagger UI:** http://localhost:3000/api-docs  
> **OpenAPI spec:** `backend/src/config/openapi.json`  
> **Postman:** [postman/Concert-Ticketing.postman_collection.json](postman/Concert-Ticketing.postman_collection.json)

---

## 1. Danh sách API (tổng quan)

Chú thích: 🔒 = cần `Authorization: Bearer <JWT>` · 🔒👤 = JWT role `ADMIN` hoặc `OPERATOR`

### Auth

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | `/auth/register` | — | Đăng ký khách (`CUSTOMER`) |
| POST | `/auth/login` | — | Đăng nhập, trả JWT |
| POST | `/auth/register-admin` | 🔒👤 | Tạo tài khoản admin/operator |

### Customer — Concerts

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/concerts` | — | Danh sách concert `PUBLISHED` |
| GET | `/concerts/:id` | — | Chi tiết + hạng vé, tồn kho |

### Customer — Bookings

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | `/bookings` | 🔒 | Tạo đơn `PENDING`, trừ kho, giữ 15 phút. Body: `concertId`, `items[]`, `idempotencyKey`, optional `voucherCode`. **Rate limit** |
| POST | `/bookings/:id/pay` | 🔒 | **Mock payment** — `PENDING` → `PAID` |
| GET | `/bookings/me` | 🔒 | Lịch sử đơn của user. Query: `?status=` |
| GET | `/bookings/:id` | 🔒 | Chi tiết đơn (owner hoặc admin) |

### Customer — Vouchers

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/vouchers/validate/:code` | 🔒 | Kiểm tra mã voucher hợp lệ |

### Admin — Bookings

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/admin/bookings` | 🔒👤 | Danh sách đơn. Filter: `status`, `concertId`, `userId` |
| PATCH | `/admin/bookings/:id/status` | 🔒👤 | Cập nhật trạng thái thủ công |

### Admin — Concerts

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/admin/concerts` | 🔒👤 | List mọi concert |
| POST | `/admin/concerts` | 🔒👤 | Tạo concert |
| GET | `/admin/concerts/:id` | 🔒👤 | Chi tiết + inventory |
| PATCH | `/admin/concerts/:id` | 🔒👤 | Cập nhật concert |
| DELETE | `/admin/concerts/:id` | 🔒👤 | Xóa concert |
| POST | `/admin/concerts/ticket-categories` | 🔒👤 | Thêm hạng vé |
| PATCH | `/admin/concerts/ticket-categories/:id` | 🔒👤 | Sửa hạng vé |
| DELETE | `/admin/concerts/ticket-categories/:id` | 🔒👤 | Xóa hạng vé |

### Admin — Vouchers

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/admin/vouchers` | 🔒👤 | Danh sách voucher |
| POST | `/admin/vouchers` | 🔒👤 | Tạo voucher |
| GET | `/admin/vouchers/:id` | 🔒👤 | Chi tiết voucher |
| PATCH | `/admin/vouchers/:id/status` | 🔒👤 | Đổi `status` voucher |
| DELETE | `/admin/vouchers/:id` | 🔒👤 | Xóa voucher |

### System & công cụ

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| GET | `/health` | — | Health check |
| GET | `/api-docs` | — | Swagger UI (trình duyệt) |

---

## 2. Quy ước chung

### 2.1 Response format

**Thành công:**

```json
{
  "data": { }
}
```

Mock pay có thêm `meta`:

```json
{
  "data": { },
  "meta": {
    "payment": "mock",
    "message": "Payment simulated successfully"
  }
}
```

**Lỗi:**

```json
{
  "error": {
    "message": "Human readable message"
  }
}
```

### 2.2 Authentication

```
Authorization: Bearer <JWT>
```

JWT payload: `sub` (user id), `email`, `role`. Hết hạn mặc định: **1 giờ** (`JWT_EXPIRES_IN`).

### 2.3 HTTP status thường gặp

| Code | Ý nghĩa |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No content (delete) |
| 400 | Validation / business rule |
| 401 | Chưa đăng nhập / token invalid |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy |
| 409 | Conflict (hết vé, trùng email, hết voucher) |
| 429 | Rate limit (`POST /bookings`) |

---

## 3. Chi tiết endpoint

### 3.1 Auth

#### POST `/auth/register`

Đăng ký khách hàng (`CUSTOMER`).

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A"
}
```

**Response 201:**

```json
{
  "data": {
    "id": 3,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "CUSTOMER"
  }
}
```

---

#### POST `/auth/login`

**Body:**

```json
{
  "email": "customer@demo.com",
  "password": "password123"
}
```

**Response 200:**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 2,
      "email": "customer@demo.com",
      "fullName": "Demo Customer",
      "role": "CUSTOMER"
    }
  }
}
```

---

#### POST `/auth/register-admin`

🔒👤 JWT role `ADMIN`. Tạo tài khoản vận hành.

---

### 3.2 Customer — Concerts

#### GET `/concerts`

Public — concert `PUBLISHED`.

**Response 200:** `{ "data": [ { "id", "title", "venue", "startTime", "status", "ticketCategories": [...] } ] }`

---

#### GET `/concerts/:id`

Chi tiết concert publish kèm `ticketCategories` (`price`, `remainingQuantity`).

---

### 3.3 Customer — Bookings

#### POST `/bookings`

🔒 Auth + **rate limit** 30 req / 15 phút / IP.

Tạo đơn **`PENDING`**, trừ tồn kho, `expiresAt` = now + **15 phút**.

**Body:**

```json
{
  "concertId": 1,
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    { "ticketCategoryId": 1, "quantity": 2 }
  ],
  "voucherCode": "FLASH10"
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|--------|
| `concertId` | Có | ID concert |
| `idempotencyKey` | Có | UUID client — retry an toàn |
| `items` | Có | `{ ticketCategoryId, quantity }`; trùng category được merge |
| `voucherCode` | Không | Mã giảm giá |

**Response 201:** Booking + `bookingItems`, `concert`, `voucher`.

**Lỗi:** `409` hết vé / voucher / lock busy · `400` concert không publish · `429` rate limit.

**Idempotency:** Gửi lại cùng `idempotencyKey` → trả booking cũ, không trừ kho thêm.

---

#### POST `/bookings/:id/pay`

🔒 **Mock payment** — không thu tiền thật.

Điều kiện: `PENDING`, chưa hết `expiresAt`, đúng owner.

**Response 200:** `status: "PAID"`, `meta.payment: "mock"`. Voucher `usedCount` tăng tại đây.

---

#### GET `/bookings/me`

🔒 Query tùy chọn: `?status=PENDING`

---

#### GET `/bookings/:id`

🔒 Customer: đơn của mình. Admin/Operator: mọi đơn.

---

### 3.4 Customer — Vouchers

#### GET `/vouchers/validate/:code`

🔒 Kiểm tra `ACTIVE`, chưa hết hạn, `usedCount < usageLimit`. **400** nếu invalid.

---

### 3.5 Admin — Bookings

#### GET `/admin/bookings`

🔒👤 Query: `status`, `concertId`, `userId`.

**Response:** bookings kèm `user`, `concert`, `bookingItems`.

---

#### PATCH `/admin/bookings/:id/status`

🔒👤 Body: `{ "status": "CANCELLED" }`

**Transitions:**

| Từ | Sang |
|----|------|
| `PENDING` | `PAID`, `CANCELLED`, `FAILED`, `EXPIRED` |
| `PAID` | `CANCELLED`, `FAILED` |
| `RESERVED` | `PAID`, `CANCELLED`, `FAILED`, `EXPIRED` |

`CANCELLED` / `FAILED` / `EXPIRED` từ trạng thái đang giữ kho → **hoàn inventory** (và voucher nếu đã `PAID`).

---

### 3.6 Admin — Concerts

Prefix `/admin/concerts` — 🔒👤

**POST `/` — tạo concert:**

```json
{
  "title": "New Year Concert",
  "venue": "Arena",
  "startTime": "2026-12-31T20:00:00.000Z",
  "status": "DRAFT",
  "ticketCategories": [
    { "name": "VIP", "price": 200, "totalQuantity": 100 }
  ]
}
```

**POST `/ticket-categories`:**

```json
{
  "concertId": 1,
  "name": "Early Bird",
  "price": 50,
  "totalQuantity": 500
}
```

---

### 3.7 Admin — Vouchers

Prefix `/admin/vouchers` — 🔒👤

**POST `/`:**

```json
{
  "code": "NEWYEAR20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "usageLimit": 50,
  "expiredAt": "2026-12-31T23:59:59.000Z",
  "status": "ACTIVE"
}
```

`discountType`: `PERCENTAGE` | `FIXED`

---

### 3.8 System

#### GET `/health`

```json
{ "message": "Server is running" }
```

---

## 4. Rate limiting

| | |
|---|---|
| Endpoint | `POST /bookings` |
| Giới hạn | 30 requests / 15 phút / IP |
| Store | Redis (nếu có) hoặc in-memory |
| Header | `RateLimit-*` (standardHeaders) |

---

## 5. Kiểm thử API

| Cách | Đường dẫn |
|------|-----------|
| Swagger UI | http://localhost:3000/api-docs |
| Postman collection | [postman/Concert-Ticketing.postman_collection.json](postman/Concert-Ticketing.postman_collection.json) |
| Postman environment | [postman/Concert-Ticketing.postman_environment.json](postman/Concert-Ticketing.postman_environment.json) |
| Hướng dẫn Postman | [postman/README.md](postman/README.md) |
| Chạy hệ thống | [LOCAL_SETUP.md](LOCAL_SETUP.md) |

**Tài khoản demo:** `customer@demo.com` / `admin@demo.com` — `password123` · Voucher: `FLASH10`
