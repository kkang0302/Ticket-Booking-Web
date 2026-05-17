# Giả định, phạm vi đã làm và chưa làm

mô tả các giả định, những gì đã làm và chưa làm (giới hạn hệ thống).

---

## 1. Giả định nghiệp vụ (Assumptions)

| # | Giả định | Ảnh hưởng kỹ thuật |
|---|----------|-------------------|
| 1 | Một booking chỉ thuộc **một concert** | Không có giỏ hàng multi-event |
| 2 | Không chọn **ghế cụ thể** — chỉ hạng vé + số lượng | Schema `ticket_categories` + `quantity`, không có seat map |
| 3 | **Thanh toán giả lập** — không tích hợp cổng thật | Endpoint `POST /bookings/:id/pay`, UI nút "Pay money" |
| 4 | Giữ chỗ có thời hạn **15 phút** (`PENDING`) | `expiresAt` + background job |
| 5 | Voucher áp dụng lúc tạo booking; **usage chỉ trừ khi PAID** | Tránh “khóa” voucher khi user không pay |
| 6 | Peak traffic ~**300–500 booking/phút** (~5–8 req/s) | Monolith + MySQL đủ; chưa cần queue |
| 7 | ~**50.000** user tổng — không yêu cầu sharding ngay | Single DB instance trong scope bài test |
| 8 | Client tự sinh **`idempotencyKey`** (UUID) mỗi lần checkout mới | Retry cùng key → cùng booking |
| 9 | Mật khẩu demo đơn giản (`password123`) | Chỉ cho môi trường dev/assessment |
| 10 | Tiền tệ / thuế / phí platform | `totalAmount` = giá vé − voucher; không có phí dịch vụ riêng trên API |

---

## 2. Đã triển khai (Done)

### 2.1 Luồng khách hàng (Customer)

- [x] Duyệt concert đã publish (`GET /concerts`, `GET /concerts/:id`)
- [x] Xem hạng vé, giá, số vé còn (`ticketCategories.remainingQuantity`)
- [x] Tạo booking giữ chỗ (`POST /bookings` → `PENDING`)
- [x] Áp dụng mã voucher khi đặt (`voucherCode`)
- [x] Validate voucher (`GET /vouchers/validate/:code`)
- [x] Theo dõi trạng thái (`GET /bookings/me`, `GET /bookings/:id`)
- [x] Mock thanh toán (`POST /bookings/:id/pay` → `PAID`)
- [x] UI React: browse, checkout, my bookings, pay

### 2.2 Luồng vận hành (Operation / Admin)

- [x] Theo dõi đơn (`GET /admin/bookings` + filter)
- [x] Quản lý concert & hạng vé (CRUD `/admin/concerts`, ticket-categories)
- [x] Xem tồn kho qua `remainingQuantity` trên category
- [x] Quản lý voucher (CRUD `/admin/vouchers`)
- [x] Cập nhật trạng thái thủ công (`PATCH /admin/bookings/:id/status`)
- [x] UI admin (dashboard cơ bản)

### 2.3 Kỹ thuật cốt lõi (Critical — điểm đề bài)

- [x] **Chống overselling:** atomic `updateMany` + `remainingQuantity >= qty` trong transaction
- [x] **Chống duplicate booking:** `idempotencyKey` UNIQUE + Redis cache + xử lý race `P2002`
- [x] **Giới hạn lạm dụng voucher:** validate + `usedCount` conditional increment on pay
- [x] **Flash sale stability:** rate limit booking, optional Redis per-category lock
- [x] **Booking state machine** với hoàn kho khi expire/cancel/fail
- [x] **Job expire** PENDING quá hạn
- [x] JWT auth + roles (`CUSTOMER`, `ADMIN`, `OPERATOR`)

### 2.4 Hạ tầng & tài liệu

- [x] Docker Compose (MySQL + Redis)
- [x] Prisma migrations + seed data
- [x] Swagger `/api-docs`
- [x] Postman collection chạy local
- [x] Unit test logic booking (normalize items, discount)
- [x] Bộ tài liệu trong `docs/`

---

## 3. Chưa triển khai (Not done — có chủ đích)

| Hạng mục | Lý do |
|----------|--------|
| Payment gateway (Stripe, MoMo, VNPay, …) | Ngoài scope; đề cho phép mock |
| Webhook thanh toán / đối soát | Phụ thuộc PSP thật |
| Email / SMS xác nhận đơn | Không yêu cầu đề |
| Seat map / assigned seating | Giả định đơn giản hóa |
| Kafka, Kubernetes, CQRS, event sourcing | Over-engineering cho bài test |
| Monitoring / alerting production (Datadog, PagerDuty) | Không yêu cầu production-ready |
| Refresh token / OAuth social login | Auth tối giản JWT |
| Multi-tenant / nhiều organizer | Một platform đơn giản |
| Báo cáo doanh thu / export CSV | Admin cơ bản |
| E2E test Playwright đầy đủ | Có unit test core logic |
| CI/CD pipeline | Có thể bổ sung sau |

---

## 4. Giới hạn hệ thống hiện tại (Limitations)

1. **Redis optional:** Nếu Redis down, hệ thống vẫn đúng nhờ DB; rate limit và cache chuyển fallback — hiệu năng có thể giảm khi spike.
2. **Expire job in-process:** Chạy trong process API (interval 60s), không phải cron distributed — nhiều instance API có thể cần leader election hoặc job riêng.
3. **Rate limit theo IP:** User NAT chung có thể bị ảnh hưởng; production nên kết hợp user id hoặc token bucket per user.
4. **Không có payment idempotency:** Chỉ create booking idempotent; mock pay không nhận idempotency key riêng.
5. **Admin xóa concert/category:** Có thể fail nếu còn FK booking — chưa soft-delete.
6. **Không audit log:** Thay đổi status admin không lưu lịch sử ai đổi khi nào.
7. **Frontend:** UI từ Figma Make — đủ demo flow, chưa tối ưu a11y/production UX toàn diện.
8. **Bảo mật production:** `JWT_SECRET` mặc định yếu; cần rotate, HTTPS, secret manager khi deploy thật.

---

## 5. Mock payment — mô tả rõ ràng

Để đáp ứng flow “thanh toán” trong đề mà không tích hợp PSP:

```
Checkout → POST /bookings → PENDING (đã trừ kho)
         → User bấm "Pay money"
         → POST /bookings/:id/pay → PAID (mock)
```

- Không thu thập số thẻ, không PCI.
- Response có `meta.payment: "mock"` để client biết đây là mô phỏng.

---

## 6. Câu hỏi phỏng vấn — gợi ý trả lời ngắn

| Câu hỏi | Hướng trả lời |
|---------|----------------|
| Vì sao không microservice? | Startup, 48h, peak vừa phải; monolith giao dịch đơn giản |
| Chống overselling? | Atomic decrement trong transaction MySQL |
| Vì sao Redis? | Rate limit, cache idempotency, lock ngắn — DB vẫn source of truth |
| Traffic x10? | Cache read, scale API, queue write, có thể tách inventory service |
| Payment fail? | Không có PSP; PENDING expire hoặc admin FAILED/CANCELLED |
| Booking timeout? | Job 60s + `expiresAt` 15 phút → EXPIRED + restore stock |

---

## 7. Ưu tiên nếu có thêm thời gian

1. Integration test `POST /bookings` với DB test container  
2. Idempotency cho `POST /pay`  
3. Audit log admin actions  
4. CI: lint + test on PR  
5. Outbox + email notification (design only hoặc stub)
