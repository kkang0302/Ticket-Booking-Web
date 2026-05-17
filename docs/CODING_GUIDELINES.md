# Hướng dẫn lập trình và quy ước (Coding Guidelines & Conventions)

Tài liệu  cho repository Concert Ticket Booking: quy ước chung, cấu trúc thực tế của project, pattern backend/frontend, Git/CI, audit và checklist review.

---

## 1. Mục tiêu và phạm vi

**Mục tiêu**

- Code nhất quán, dễ đọc, dễ bảo trì và dễ review.
- Tách rõ **HTTP layer** và **business logic** để test và mở rộng.
- Ưu tiên **correctness** (transaction, inventory) hơn số lượng feature.
- Có checklist tự động và thủ công để audit mã hiện có.

**Phạm vi**

| Layer | Công nghệ |
|-------|-----------|
| Backend | Node.js, Express 5, Prisma 7, MySQL |
| Frontend | React, TypeScript, Vite, Tailwind |
| Công cụ | ESLint, Prettier, TypeScript; test: Node test runner / Vitest-Jest (mở rộng), Playwright (E2E mở rộng) |
| Quy trình | Git branching, Conventional Commits, PR, CI (gợi ý) |

---

## 2. Cấu trúc dự án

```
Ticket-booking-web/
├── backend/src/
│   ├── modules/<domain>/
│   │   ├── *.routes.js       # Express router, middleware
│   │   ├── *.controller.js   # req/res only
│   │   └── *.service.js      # business logic + Prisma
│   ├── common/               # prismaClient, errorHandler
│   ├── infrastructure/       # Redis
│   ├── middleware/           # rate limit
│   ├── jobs/                 # expire PENDING bookings
│   └── config/               # openapi.json, swagger
├── backend/prisma/           # schema, migrations, seed
└── frontend/src/
    ├── components/
    ├── services/api          # gọi API, base /api
    └── ...
```

**Quy tắc import**

- Service **không** import `express`.
- Controller **không** gọi Prisma trực tiếp (gọi qua service).
- Routes chỉ mount middleware và controller.

**Mapping với pattern generic**

| Generic | Trong project |
|---------|----------------|
| `routes/` | `modules/*/*.routes.js` |
| `controllers/` | `modules/*/*.controller.js` |
| `services/` | `modules/*/*.service.js` |
| `middlewares/` | `middleware/`, `modules/auth/auth.middleware.js` |
| `db/` | `common/prismaClient.js` + logic trong service |

---

## 3. Quy tắc chung

### 3.1 Đặt tên

| Loại | Quy ước | Ví dụ |
|------|---------|--------|
| Biến / hàm | `camelCase` | `createBooking`, `idempotencyKey` |
| Component / Class | `PascalCase` | `BookingCard` |
| Hằng số | `UPPER_SNAKE_CASE` | `BOOKING_HOLD_MINUTES` |
| File backend | `domain.layer.js` | `booking.service.js` |
| File frontend | `kebab-case` hoặc `PascalCase` component | nhất quán trong `frontend/` |
| Bảng DB | `snake_case` | `ticket_categories` (`@@map`) |
| Enum Prisma / API | `SCREAMING_SNAKE` | `PENDING`, `PUBLISHED` |
| Route path | `kebab-case`, plural | `/ticket-categories` |

### 3.2 Định dạng và style

- Dùng **Prettier** (2 spaces, semicolons) và **ESLint** khi đã cấu hình.
- Hàm nhỏ, ưu tiên **~30 dòng**; tách hàm nếu phức tạp.
- **Comment:** chỉ giải thích `why` hoặc business rule khó; tránh mô tả `what` đã rõ trong code.
- **Async:** `try/catch` + `next(error)` ở controller; tránh unhandled rejection.

### 3.3 Bảo mật và logging

- Không commit secrets (`.env`, keys).
- Validate input **phía server**; không tin client.
- Log có ngữ cảnh (request id, user id khi hợp lệ); **không** log password, JWT đầy đủ.
- `JWT_SECRET` từ biến môi trường; validate config (khuyến nghị schema zod cho env).

---

## 4. Quy ước API (REST)

### 4.1 Response envelope

```javascript
// Success
res.status(201).json({ data: result });

// Error — errorHandler middleware
res.status(400).json({ error: { message: "..." } });
```

Mock pay có thêm `meta`:

```json
{ "data": { }, "meta": { "payment": "mock", "message": "..." } }
```

### 4.2 HTTP methods

| Method | Dùng cho |
|--------|----------|
| GET | Đọc, không side effect |
| POST | Tạo mới (booking, pay, login) |
| PATCH | Cập nhật một phần (status, concert) |
| DELETE | Xóa resource |

### 4.3 Authentication

```
Authorization: Bearer <JWT>
```

- Route customer/admin: `authMiddleware`.
- Route admin: thêm `adminMiddleware` (role `ADMIN` hoặc `OPERATOR`).

Chi tiết endpoint: [API.md](API.md).

---

## 5. Backend (Node / Express / Prisma)

### 5.1 Controller

- Parse `req.body`, `req.params`, `req.query`.
- Gọi service với DTO/object rõ ràng.
- `try/catch` → `next(error)`.

```javascript
// modules/booking/booking.controller.js
async function createBooking(req, res, next) {
  try {
    const result = await bookingService.createBooking({
      userId: req.user.id,
      data: req.body,
    });
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}
```

### 5.2 Service

- Validation nghiệp vụ, transaction, throw `Error` + `error.status` (400, 403, 404, 409).
- Không tham chiếu `req` / `res`.

```javascript
// modules/booking/booking.service.js
async function reserveInventory(tx, categoryId, qty) {
  const updated = await tx.ticketCategory.updateMany({
    where: { id: categoryId, remainingQuantity: { gte: qty } },
    data: { remainingQuantity: { decrement: qty } },
  });
  if (updated.count !== 1) {
    throw buildConflictError("Not enough tickets.");
  }
}

return prisma.$transaction(async (tx) => {
  // atomic steps
});
```

### 5.3 Prisma

- Schema thay đổi → **Prisma Migrate** (`prisma/migrations/`).
- Client singleton: `common/prismaClient.js`.
- Transaction (`prisma.$transaction`) cho: tạo booking, mock pay, admin đổi status, expire job.
- Seed idempotent: `upsert` trong `prisma/seed.js`.

### 5.4 Validation và lỗi

- Hiện tại: validate trong service + `buildValidationError` / `buildConflictError`.
- Mở rộng: **zod** / **yup** cho body/query (DTO) trước khi vào service.
- Lỗi có cấu trúc: `error.status` → `common/errorHandler.js`.

```javascript
function buildValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}
```

### 5.5 Config & môi trường

- Biến trong `.env`, mẫu `.env.example`.
- Không commit `.env`.

---

## 6. Business rules (bắt buộc — domain booking)

1. **Inventory** chỉ thay đổi trong transaction Prisma.
2. **Voucher `usedCount`** chỉ tăng khi booking → `PAID` (mock pay).
3. **`idempotencyKey`** bắt buộc trên `POST /bookings`.
4. Cập nhật có điều kiện: `updateMany` + kiểm tra `count === 1`.
5. Hoàn kho: `bookingInventory.releaseBookingInventory` khi expire / cancel / fail (theo state machine).
6. Admin đổi status: tuân `ALLOWED_TRANSITIONS` trong `admin.booking.service.js`.
7. Rate limit: `POST /bookings` — 30 req / 15 phút / IP.

Tham chiếu: `backend/src/modules/booking/booking.service.js`.

---

## 7. Frontend (React + TypeScript + Vite + Tailwind)

### 7.1 Cấu trúc gợi ý

- `src/components/` — UI tái sử dụng
- `src/pages/` hoặc routing theo feature
- `src/hooks/` — custom hooks
- `src/services/api.ts` — **mọi** gọi HTTP (base `/api`, Vite proxy)
- `src/utils/` — helpers

### 7.2 Component và state

- Tách presentational vs container khi component lớn.
- Props có type/interface; tránh `any`.
- Local state cho UI; **TanStack Query** (khuyến nghị) cho server state khi mở rộng.
- `tsconfig` bật **`strict`**.

### 7.3 Styles và a11y

- Tailwind utility-first; tách component nếu class quá dài.
- Semantic HTML, keyboard, `aria-*` khi cần.
- Tối ưu asset; fallback ảnh khi có pattern `ImageWithFallback`.

---

## 8. Git, commit và Pull Request

**Branches**

- `main` — stable / nộp bài
- `feature/<mô-tả>` — tính năng
- `hotfix/<mô-tả>` — sửa khẩn

**Conventional Commits**

```
feat(booking): add mock pay endpoint
fix(inventory): restore stock on admin cancel
docs: merge API documentation
chore: update dependencies
refactor(auth): extract token helper
```

**Pull Request**

- Title ngắn, mô tả thay đổi + ảnh UI nếu có.
- Checklist: lint, typecheck, test, ghi chú migration Prisma.
- Reviewer tối thiểu 1 (khi làm việc nhóm).

**Không commit:** `.env`, `node_modules/`, `dist/`, credentials.

---

## 9. Testing và CI

| Loại | Vị trí / công cụ | Mục tiêu |
|------|------------------|----------|
| Unit | `backend/tests/*.test.js` | Logic thuần (discount, normalize items) |
| Unit (service) | Khuyến nghị thêm | Business rules trong service |
| Integration | Test DB / supertest (mở rộng) | `POST /bookings`, auth |
| E2E | Playwright (mở rộng) | Checkout → pay |
| Manual | Postman, Swagger | Flow local |

**Chạy test hiện có:**

```bash
cd backend && npm test
```

**CI pipeline (gợi ý):**

`install` → `lint` → `typecheck` → `test` → `build` → deploy staging

**Test data:** factories/fixtures; không dùng data production.

---

## 10. Security checklist

- [ ] Không log password / JWT đầy đủ
- [ ] Validate input server-side
- [ ] `JWT_SECRET` từ env, đủ entropy trên production
- [ ] Rate limit trên `POST /bookings`
- [ ] Helmet + CORS trên API
- [ ] Không secrets trong diff Git

---

## 11. Code review checklist (chung)

- [ ] Build / linter / test pass
- [ ] Controller mỏng; logic ở service
- [ ] Transaction đúng boundary
- [ ] Không regression inventory / voucher
- [ ] Response `{ data }` / `{ error }` đúng chuẩn
- [ ] Migration + seed nếu đổi schema
- [ ] Cập nhật [API.md](API.md) / `openapi.json` nếu đổi contract
- [ ] Không secrets trong diff
- [ ] Edge cases và error handling
- [ ] a11y cho thay đổi UI liên quan

### 11.1 Checklist module `booking`

- [ ] Controller chỉ parse & response
- [ ] Service có test (hoặc plan test) cho logic critical
- [ ] DB qua Prisma trong transaction
- [ ] Env validated
- [ ] Idempotency + inventory rules giữ nguyên

---

## 12. Audit plan (kiểm tra codebase theo guideline)

1. **Setup & automated:** `npm ci` / `npm install` → `npm run lint` → `npm test` → `tsc --noEmit` (frontend).
2. **Static analysis:** ESLint, `npm audit` (security).
3. **Backend:** controller không chứa logic nặng; service có transaction; migrations khớp schema; env không lộ.
4. **Frontend:** không `any` bừa bãi; components có props typed; Tailwind nhất quán.
5. **Manual:** flow đặt vé trên dev; review PR gần nhất theo checklist §11.
6. **Báo cáo:** ghi finding (issue hoặc `CODE_AUDIT_REPORT.md`); ưu tiên security → correctness → tests → style.
7. **Automation (tùy chọn):** GitHub Action chặn PR khi lint/test fail.

### Lệnh kiểm tra nhanh

```powershell
# Backend
cd backend
npm ci
npm test

# Frontend
cd frontend
npm install
npm run build
```

*(Thêm `npm run lint` khi đã cấu hình script trong package.json.)*

---

## 13. Tài liệu liên quan

| Tài liệu | Nội dung |
|----------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Kiến trúc, concurrency, state machine |
| [API.md](API.md) | Danh sách và chi tiết REST API |
| [DATABASE.md](DATABASE.md) | Schema, inventory |
| [LOCAL_SETUP.md](LOCAL_SETUP.md) | Chạy local |
| `backend/src/modules/booking/booking.service.js` | Implementation mẫu |
