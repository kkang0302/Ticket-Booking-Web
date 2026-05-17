# Coding Guidelines

## Project layout

- `backend/src/modules/<domain>/` — routes, controller, service per domain
- Shared: `common/` (Prisma, error handler), `infrastructure/`, `middleware/`, `jobs/`

## API conventions

- JSON responses: `{ "data": ... }` on success
- Errors: `{ "error": { "message": "..." } }` with appropriate HTTP status
- Authenticated routes: `Authorization: Bearer <token>`
- Admin routes: prefix `/admin/...`, require `ADMIN` or `OPERATOR`

## Naming

- Files: `kebab-case` or `domain.action.js` (e.g. `booking.service.js`)
- DB: snake_case table names via Prisma `@@map`
- Enums: `SCREAMING_SNAKE` in Prisma, same in API payloads

## Business rules

- Inventory changes only inside Prisma transactions
- Voucher `usedCount` increments only when booking becomes `PAID`
- Idempotency key required on `POST /bookings`
- Use `updateMany` + `count` check for conditional updates (tickets, vouchers)

## Errors

Throw `Error` with `error.status` (400, 403, 404, 409) — handled by `errorHandler` middleware.

## Frontend

- API calls via `services/api.ts` → `request<T>(path, options)`
- Base URL: `/api` (Vite proxy to backend)
