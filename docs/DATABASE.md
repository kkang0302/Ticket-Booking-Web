# Database Design

## ERD

```mermaid
erDiagram
  users ||--o{ bookings : places
  concerts ||--o{ ticket_categories : has
  concerts ||--o{ bookings : for
  vouchers ||--o{ bookings : applies
  bookings ||--|{ booking_items : contains
  ticket_categories ||--o{ booking_items : references

  users {
    int id PK
    string email UK
    string password
    string fullName
    enum role
  }

  concerts {
    int id PK
    string title
    string venue
    datetime startTime
    enum status
  }

  ticket_categories {
    int id PK
    int concertId FK
    string name
    decimal price
    int totalQuantity
    int remainingQuantity
  }

  vouchers {
    int id PK
    string code UK
    enum discountType
    decimal discountValue
    int usageLimit
    int usedCount
    datetime expiredAt
    enum status
  }

  bookings {
    int id PK
    int userId FK
    int concertId FK
    int voucherId FK
    decimal totalAmount
    enum status
    string idempotencyKey UK
    datetime expiresAt
  }

  booking_items {
    int id PK
    int bookingId FK
    int ticketCategoryId FK
    int quantity
    decimal unitPrice
  }
```

## Booking status

| Status | Meaning |
|--------|---------|
| PENDING | Reserved, awaiting mock payment |
| PAID | Mock payment completed |
| CANCELLED | Manually cancelled, inventory restored |
| EXPIRED | Hold timed out, inventory restored |
| FAILED | Marked failed by admin |

## Indexes

- `bookings.idempotencyKey` — UNIQUE (retry safety)
- `users.email` — UNIQUE
- `vouchers.code` — UNIQUE
- Consider composite index on `bookings(status, expiresAt)` for expiry job

## Inventory rule

`remainingQuantity` is decremented on booking create (`PENDING`) and restored on `CANCELLED` / `EXPIRED` / `FAILED` (from `PENDING` or `PAID` as per transition rules).
