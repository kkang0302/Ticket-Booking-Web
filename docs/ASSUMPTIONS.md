# Assumptions & Scope

## Done

- Customer: browse concerts, view tiers/prices, create booking, apply voucher, track status, mock pay via **Pay money**
- Admin: manage concerts, ticket categories, vouchers, bookings; manual status updates; inventory view
- Auth: JWT register/login; roles `CUSTOMER`, `ADMIN`, `OPERATOR` (admin routes)
- Concurrency: atomic inventory decrement, idempotency key, Redis rate limit / cache / locks
- Booking expiry job (15 minutes for `PENDING`)
- Docker Compose: MySQL + Redis
- Swagger at `/api-docs`, Postman collection, seed data

## Not done (intentional)

- Real payment gateway (Stripe, MoMo, VNPay, etc.)
- Email/SMS notifications
- Seat map / assigned seating
- Kafka, Kubernetes, CQRS, event sourcing
- Production-grade monitoring/alerting
- One booking = one concert only (no multi-event cart)
- Booking fee in UI is display-only; backend totals ticket prices + voucher discount

## Payment (mock)

Payment is **100% mocked** for assessment purposes:

- Checkout creates `PENDING` booking only
- User clicks **Pay money** on My Bookings → `POST /bookings/:id/pay`
- No card data is collected or processed

## Environment

- MySQL 8 via Docker (`3307` host port)
- Redis 7 via Docker (`6379`)
- Backend port `3000`, frontend dev server with `/api` proxy
