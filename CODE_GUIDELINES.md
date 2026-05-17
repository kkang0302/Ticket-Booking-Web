# Coding Guidelines & Conventions

## Mục tiêu
- Đảm bảo code nhất quán, dễ đọc, dễ bảo trì và dễ review.
- Cung cấp checklist tự động và thủ công để kiểm tra (audit) mã hiện có.

## Phạm vi
- Backend: Node.js, Express, Prisma
- Frontend: React + TypeScript + Vite + Tailwind
- Công cụ: ESLint, Prettier, TypeScript, Vitest/Jest, Playwright
- Quy trình: Git branching, commit, PR, CI

---

## Quy tắc chung

- **Đặt tên**:
  - Biến/ham: `camelCase`
  - Component/Class: `PascalCase`
  - Hằng số: `UPPER_SNAKE_CASE`
  - File: `kebab-case` hoặc `camelCase` (nhất quán trong project)
- **Định dạng**:
  - Dùng `Prettier` với cấu hình chung (ví dụ: 2 spaces, semicolons on, singleQuote:false) và `ESLint` để kiểm soát chất lượng.
- **Kích thước hàm**: ưu tiên hàm nhỏ, tối đa ~30 dòng; nếu quá phức tạp, tách thành hàm nhỏ hơn.
- **Comment**: Chỉ comment lý do (`why`) hoặc business rule phức tạp; tránh comment `what` nếu code rõ ràng.
- **Async**: luôn `try/catch` cho `async/await`; tránh promise unhandled.
- **Bảo mật**: không commit secrets; validate input server-side; escape/encode output khi cần.
- **Logging**: log có ngữ cảnh (request id, user id khi hợp lệ); không log sensitive data.

---

## Backend (Node / Express / Prisma)

- **Cấu trúc thư mục (gợi ý)**:
  - `src/`
    - `routes/` — định nghĩa routes, chỉ mount route và middleware
    - `controllers/` — parse request, gọi `services`, trả response
    - `services/` — business logic, testable, không thao tác req/res
    - `repositories/` hoặc `db/` — tương tác trực tiếp với Prisma
    - `middlewares/` — auth, validation, error handling
    - `utils/`, `config/`
- **Controller vs Service**:
  - Controller: nhẹ, chịu parse & response
  - Service: định nghĩa logic nghiệp vụ, có thể tái sử dụng và unit test
- **Prisma**:
  - Sử dụng migrations (Prisma Migrate) cho changes schema
  - Đặt Prisma client chung (singleton) để dễ mock trong test
  - Dùng transactions rõ ràng (`prisma.$transaction`) cho atomic ops
- **Validation**: dùng `zod`/`yup` để validate request body/params/query
- **Error handling**:
  - Dùng error classes có cấu trúc `{statusCode, code, message, details}`
  - Middleware global bắt lỗi, log và trả response chuẩn hóa
- **Config & Env**:
  - Biến môi trường qua `.env` và validate bằng schema (zod)

---

## Frontend (React + TypeScript + Vite + Tailwind)

- **Cấu trúc thư mục (gợi ý)**:
  - `src/components/` — components tái sử dụng
  - `src/pages/` hoặc `routes/`
  - `src/hooks/` — custom hooks
  - `src/services/api.ts` — nơi gọi API (tách concerns)
  - `src/utils/` — helper functions
- **Component design**:
  - Tách Presentational (UI) vs Container (logic)
  - Props: dùng interfaces/ types rõ ràng, tránh `any`
- **State management**:
  - Local state cho UI; React Query (TanStack Query) cho server state
- **Types**:
  - Bật `strict` trong `tsconfig.json`
  - Dùng DTO/interface rõ ràng cho data từ API
- **Styles**:
  - Dùng Tailwind utility-first; nếu styles phức tạp, tách component hoặc dùng CSS modules
  - Giữ class lists có tổ chức, tránh chuỗi class dài không kiểm soát
- **Accessibility (a11y)**:
  - Semantic HTML, keyboard navigation, `aria-*` attributes khi cần
- **Assets**:
  - Tối ưu hình ảnh, dùng `ImageWithFallback` cho fallback logic

---

## Git, Commit & Pull Request

- **Branches**:
  - `main` cho production
  - `feature/<ticket-id>` cho feature
  - `hotfix/<id>` cho fix khẩn
- **Commit messages**: dùng Conventional Commits
  - `feat(scope): description`
  - `fix(scope): description`
  - `chore:`, `docs:`, `refactor:`
- **PR**:
  - Title ngắn gọn, liên kết ticket
  - Mô tả thay đổi, ảnh chụp nếu UI thay đổi
  - Checklist: lint pass, typecheck pass, tests pass, migration notes
  - Reviewer tối thiểu 1 (module owner)

---

## Testing & CI

- **Unit tests**: business logic ở `services` phải có unit tests (Vitest/Jest)
- **Integration tests**: endpoints quan trọng, database migrations testing trên test DB
- **E2E**: Playwright cho flow chính (đặt vé, checkout)
- **CI pipeline** (gợi ý):
  - `install` -> `lint` -> `typecheck` -> `test` -> `build` -> `deploy-staging`
- **Test data**: dùng factories/fixtures, không phụ thuộc data production

---

## Code Review Checklist

- Build passes & linter OK
- Tests added/updated for critical logic
- No secrets or credentials in diff
- Performance/regression considerations noted
- Edge cases and error handling covered

---

## Ví dụ nhanh

- Commit: `feat(booking): add seat reservation endpoint`

- Controller (pattern):

```js
// controllers/booking.controller.js
async function reserveSeat(req, res, next) {
  try {
    const dto = validateReserveDto(req.body);
    const result = await bookingService.reserveSeat(dto);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
```

- Service (pattern):

```js
// services/booking.service.js
async function reserveSeat(dto) {
  validateBusinessRules(dto);
  return prisma.$transaction(async (tx) => {
    // logic reserve
  });
}
```

---

## Audit Plan — Kiểm tra từng phần của codebase theo guideline

Mục tiêu: Kiểm tra tự động + thủ công để xác nhận code hiện tại tuân thủ guideline.

1) Setup & Automated checks (fast)
  - Chạy `npm ci`/`pnpm install` ở root và `frontend`/`backend` nếu cần.
  - Chạy `npm run lint` và `npm run format:check`.
  - Chạy `npm run typecheck` (TS strict)
  - Chạy test suite: `npm test` / `pnpm -w test`.

2) Static analysis (code smells)
  - ESLint rules (no-console in prod, no-unused-vars, consistent-return)
  - Security linter (npm audit / Snyk) nếu có

3) Backend focused checks
  - Kiểm tra controller: không có business logic nặng trong controller
  - Kiểm tra services: có unit tests, transaction đúng chỗ
  - Kiểm tra Prisma: migrations nằm trong `prisma/migrations`, không có schema drift
  - Kiểm tra env usage: secrets không commit, config validate

4) Frontend focused checks
  - Kiểm tra types: không dùng `any`, `tsc --noEmit` clean
  - Kiểm tra components: kích thước, props defined, accessibility
  - Kiểm tra styles: tailwind usage đúng, không duplicate styles

5) Manual reviews (spot checks)
  - Mở 3-5 PR gần nhất, review theo checklist
  - Chạy flow chính trên dev (đặt vé) để catch runtime issues

6) Report & Fix plan
  - Tổng hợp findings thành file `CODE_AUDIT_REPORT.md` hoặc issue per problem
  - Prioritize fixes: security > correctness > tests > style

7) Automation (optional)
  - Thêm GitHub Action hoặc CI step để block PR nếu lint/type/tests fail

---

## How to run quick checks (example commands)

```powershell
# Backend
cd backend
npm ci
npm run lint
npm run test

# Frontend
cd frontend
pnpm install
pnpm lint
pnpm test
pnpm build
```

---

## Checklist mẫu khi review module `booking`

- [ ] Controller chỉ parse & response
- [ ] Service có tests
- [ ] DB access qua repository/prisma client
- [ ] Env vars validated
- [ ] No hard-coded secrets
- [ ] Accessibility checks cho UI liên quan

---

## Next steps

- Tôi đã tạo `CODE_GUIDELINES.md` và kèm Audit Plan.
- Muốn tôi tạo template `CODE_AUDIT_REPORT.md` và chạy lint/type/tests để lấy báo cáo hiện trạng không? (y/n)
