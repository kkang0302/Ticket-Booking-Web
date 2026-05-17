# Bộ tài liệu — Concert Ticket Booking

| # | Yêu cầu đề bài | Tài liệu |
|---|----------------|----------|
| 1 | Thiết kế hệ thống & CSDL (phân tích + giải thích) | [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE.md](DATABASE.md) |
| 2 | Mã nguồn | Repository `backend/`, `frontend/` |
| 3 | Coding guideline & convention | [CODING_GUIDELINES.md](CODING_GUIDELINES.md) |
| 4 | Hướng dẫn setup & chạy local | [LOCAL_SETUP.md](LOCAL_SETUP.md) |
| 5 | Tài liệu API (Swagger) | [API.md](API.md)|
| 6 | Postman collection (local) | [postman/](postman/) |
| 7 | Giả định, đã làm / chưa làm | [ASSUMPTIONS.md](ASSUMPTIONS.md) |

## Thứ tự đọc đề xuất

1. [LOCAL_SETUP.md](LOCAL_SETUP.md) — chạy được hệ thống
2. [ARCHITECTURE.md](ARCHITECTURE.md) — hiểu kiến trúc & trade-off
3. [DATABASE.md](DATABASE.md) — schema & inventory
4. [API.md](API.md) — contract REST
5. [ASSUMPTIONS.md](ASSUMPTIONS.md) — phạm vi bài nộp

## OpenAPI / Swagger

Spec: `backend/src/config/openapi.json`  
UI: `GET /api-docs` khi backend đang chạy.

## Postman

- Collection: `postman/Concert-Ticketing.postman_collection.json`
- Environment: `postman/Concert-Ticketing.postman_environment.json`
- Hướng dẫn: [postman/README.md](postman/README.md)
