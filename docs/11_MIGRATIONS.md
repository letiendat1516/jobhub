# Database Migrations

Các script migration chạy **sau** khi đã chạy schema gốc ở `08_DATABASE.md`.
Chạy từng migration trong **Supabase SQL Editor** theo thứ tự.

---

## Migration 001 — Employer registration fields

**Ngày**: 2026-07-06
**Lý do**: Trang đăng ký nhà tuyển dụng chi tiết cần lưu tên + giới tính của
người liên hệ (HR/recruiter đại diện công ty), tách biệt với `company_name`.

```sql
ALTER TABLE employer
  ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

COMMENT ON COLUMN employer.contact_name IS 'Tên người liên hệ đại diện công ty';
COMMENT ON COLUMN employer.gender IS 'Giới tính người liên hệ: male / female';
```

**Rollback** (nếu cần):
```sql
ALTER TABLE employer
  DROP COLUMN IF EXISTS contact_name,
  DROP COLUMN IF EXISTS gender;
```
