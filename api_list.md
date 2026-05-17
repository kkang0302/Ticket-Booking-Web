# API List (implemented)

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register customer |
| POST | `/auth/login` | Login, returns JWT |

## Customer

| Method | Path | Description |
|--------|------|-------------|
| GET | `/concerts` | List published concerts |
| GET | `/concerts/:id` | Concert detail + ticket categories |
| POST | `/bookings` | Create booking (`PENDING`, reserves inventory). Body: `concertId`, `items[]`, `idempotencyKey`, optional `voucherCode` |
| POST | `/bookings/:id/pay` | **Mock payment** — `PENDING` → `PAID` |
| GET | `/bookings/me` | My booking history |
| GET | `/bookings/:id` | Booking detail |
| GET | `/vouchers/validate/:code` | Validate voucher (auth required) |

## Admin (`ADMIN` or `OPERATOR`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/bookings` | List bookings (filters: `status`, `concertId`, `userId`) |
| PATCH | `/admin/bookings/:id/status` | Manual status update |
| GET | `/admin/concerts` | List all concerts |
| POST | `/admin/concerts` | Create concert |
| GET | `/admin/concerts/:id` | Concert detail + inventory |
| PATCH | `/admin/concerts/:id` | Update concert |
| DELETE | `/admin/concerts/:id` | Delete concert |
| POST | `/admin/concerts/ticket-categories` | Add ticket tier |
| PATCH | `/admin/concerts/ticket-categories/:id` | Update tier |
| DELETE | `/admin/concerts/ticket-categories/:id` | Delete tier |
| GET | `/admin/vouchers` | List vouchers |
| POST | `/admin/vouchers` | Create voucher |
| GET | `/admin/vouchers/:id` | Voucher detail |
| PATCH | `/admin/vouchers/:id/status` | Update voucher status |
| DELETE | `/admin/vouchers/:id` | Delete voucher |

## Docs & tools

- Swagger UI: `GET /api-docs`
- Health: `GET /health`
