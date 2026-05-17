Với dạng đề này, điều interviewer muốn thấy không phải build thật nhiều feature mà là:

Tư duy backend architecture
Khả năng define scope
Xử lý concurrency / flash sale
Database design
Clean code structure
Trade-off decision
Khả năng giải thích tại sao chọn giải pháp đó

Đây là plan mình khuyên bạn triển khai để maximize điểm trong 48h.

1. Scope nên làm

Đừng cố làm full production system.

Nên focus:

Customer APIs
Browse concerts
Get ticket categories
Create booking
Apply voucher
Get booking detail/status
Operation APIs
Create concert
Create ticket categories
Create vouchers
View bookings
Update booking status manually
Critical business logic

Đây là phần quan trọng nhất:

Prevent overselling
Prevent duplicate booking
Voucher usage limit
Handle concurrent booking
Booking state machine
2. Recommended Tech Stack

Nếu bạn mạnh Java:

Backend
Java 21
Spring Boot 3
Spring Web
Spring Data JPA
Validation
Spring Security (basic JWT nếu có thời gian)
Database
PostgreSQL
Cache / concurrency
Redis
Docs
Swagger / OpenAPI
Infra
Docker Compose
Testing
JUnit + Mockito
3. Kiến trúc nên chọn

Không cần microservice.

Recommend:
Modular Monolith

Interviewer thường thích choice này cho startup phase.

Vì:

Faster delivery
Easier debugging
Enough for 50k users
Easier deployment
4. Suggested Module Structure
src/main/java/com/geekup/ticketing

├── common
├── auth
├── concert
├── booking
├── voucher
├── payment
├── operation
├── infrastructure
└── config
5. Core Database Design
Main tables
users
id
email
name
role
concerts
id
name
venue
start_time
status
ticket_categories
id
concert_id
name
price
total_quantity
remaining_quantity
vouchers
id
code
discount_type
discount_value
usage_limit
remaining_usage
expired_at
bookings
id
user_id
status
total_amount
voucher_id
idempotency_key
created_at
booking_items
id
booking_id
ticket_category_id
quantity
price
6. Booking Flow (MOST IMPORTANT)

Đây là phần interviewer quan tâm nhất.

Flow
Client
  ↓
Create Booking API
  ↓
Validate request
  ↓
Acquire lock (Redis / DB)
  ↓
Check remaining ticket
  ↓
Reserve ticket
  ↓
Apply voucher
  ↓
Create booking
  ↓
Commit transaction
  ↓
Return booking
7. Cách chống Overselling

Đây là câu hỏi chắc chắn bị hỏi.

Option nên dùng:
Pessimistic Locking

Ví dụ:

SELECT * FROM ticket_categories
WHERE id = ?
FOR UPDATE

Ưu điểm:

Simple
Reliable
Easy explain

Hoặc:

Atomic update
UPDATE ticket_categories
SET remaining_quantity = remaining_quantity - 1
WHERE id = ?
AND remaining_quantity > 0

Cách này rất đẹp khi interview.

8. Chống Duplicate Booking

Dùng:

Idempotency Key

Client gửi:

Idempotency-Key: abc123

Backend:

Save key
Nếu retry → return old result

Đây là điểm cộng lớn.

9. Booking State Machine

Nên define rõ.

Recommended
RECEIVED
→ WAITING_PAYMENT
→ PAID
→ CANCELLED
→ EXPIRED

Operation team có thể:

force cancel
mark paid manually
10. Voucher Rules

Simple thôi:

Voucher constraints
Expiration date
Usage limit
One user one usage (optional)

Khi apply:

lock voucher row
decrement remaining_usage
11. API List (IMPORTANT)
Customer APIs
Concert
GET /concerts
GET /concerts/{id}
Booking
POST /bookings
GET /bookings/{id}
Operation APIs
Concert management
POST /admin/concerts
POST /admin/ticket-categories
Voucher
POST /admin/vouchers
Booking management
GET /admin/bookings
PATCH /admin/bookings/{id}/status
12. Redis nên dùng ở đâu

Không cần over-engineer.

Use Redis for:

Idempotency key
Rate limiting
Flash sale hot data
Distributed lock (optional)
13. Những thứ KHÔNG cần làm

Đừng phí thời gian:

Real payment gateway
Kafka
Kubernetes
CQRS
Event sourcing
Full auth system
Complex UI
14. Deliverables nên có
README cực kỳ quan trọng

README nên có:

1. Architecture
Vì sao chọn modular monolith
Vì sao PostgreSQL
Vì sao Redis
2. Assumptions

Ví dụ:

One booking contains one concert only
No seat selection
Payment mocked
3. Trade-offs

Ví dụ:

Pessimistic locking chosen over event-driven design for simplicity
4. How to run
docker compose up
15. Timeline 48h hợp lý
Phase 1 — Foundation (6h)
Setup project
DB schema
Docker
Swagger
Phase 2 — Core business (12h)
Concert APIs
Booking APIs
Voucher APIs
Phase 3 — Concurrency (8h)
Locking
Idempotency
Validation
Phase 4 — Admin APIs (6h)
Operation endpoints
Phase 5 — Documentation (6h)
README
Architecture doc
Postman
Assumptions
Phase 6 — Cleanup (4h)
Refactor
Unit tests
Final review
16. Thứ giúp bạn nổi bật hơn ứng viên khác

Nếu còn thời gian:

Add:
Rate limiting
Booking expiration job
Outbox pattern explanation (không cần implement)
Simple metrics/logging
Basic integration test
17. Cái interviewer sẽ hỏi bạn

Chuẩn bị answer:

Tại sao không microservice?
Làm sao chống overselling?
Vì sao dùng Redis?
Nếu traffic tăng 10x thì sao?
Nếu payment fail?
Nếu booking timeout?
Transaction boundary ở đâu?
Vì sao chọn pessimistic locking?
18. Recommendation cuối cùng

Đề này thắng ở:

Scope hợp lý
Architecture clean
Explain trade-off tốt

KHÔNG thắng ở:

Nhiều feature
Fancy tech stack