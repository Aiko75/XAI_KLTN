# XAI_KLTN (Next.js Version)

Nền tảng thực nghiệm HCI cho đề tài XAI, tối ưu để chạy nhanh với dữ liệu kịch bản đã pre-compute, chạy hoàn toàn trên Next.js (Frontend & Backend API) để dễ dàng triển khai miễn phí (Vercel + Supabase).

## Kiến trúc đã áp dụng

- **Frontend & Backend**: Next.js (React & Route Handlers).
- **Nguồn dữ liệu test**: `src/data/scenarios.json` gồm **20 kịch bản** đã chuẩn hóa từ tài liệu KLTN.
- **Nguyên tắc quan trọng**: Web app **không gọi mô hình ML/SHAP realtime** khi người dùng làm bài; backend chỉ load dữ liệu pre-compute.
- **Database (Cloud)**: Supabase (PostgreSQL) lưu các bảng:
  - `users`: `user_id` (PRIMARY KEY), `name`, `student_code`, `group_assigned (A/B/C)`, `start_time` (TIMESTAMPTZ), `end_time` (TIMESTAMPTZ), `feedback` (TEXT)
  - `response_logs`: `id` (SERIAL PRIMARY KEY), `user_id`, `scenario_id`, `user_decision (agree/reject)`, `time_spent_seconds`, `is_correct_on_error_case`, `created_at` (TIMESTAMPTZ)
  - `survey_logs`: `id` (SERIAL PRIMARY KEY), `user_id`, `question_key`, `score` (1-7), `created_at` (TIMESTAMPTZ)

## API chính (Next.js Route Handlers)

- `GET /api/health`: Kiểm tra trạng thái hệ thống.
- `GET /api/scenarios`: Trả về 20 kịch bản (bao gồm trap/attention-check).
- `POST /api/users/start`: Tạo user mới + random nhóm A/B/C theo cơ chế cân bằng số lượng.
- `POST /api/responses`: Ghi log cho từng câu trả lời của người dùng.
- `POST /api/survey`: Ghi điểm khảo sát NASA-TLX.
- `POST /api/users/[userId]/finish`: Cập nhật thời gian kết thúc phiên làm bài test.
- `POST /api/users/[userId]/feedback`: Lưu ý kiến phản hồi tùy chọn của người dùng.
- `GET /api/admin/export`: Xuất dữ liệu CSV của toàn bộ bảng để phục vụ phân tích.
- `/docs`: Trang Swagger UI tương tác trực quan.

## Khởi tạo và Chạy local

### 1. Cài đặt các thư viện cần thiết
```bash
npm install
```

### 2. Thiết lập biến môi trường
Tạo file `.env` ở thư mục gốc:
```env
DATABASE_URL="your-supabase-postgresql-connection-string"
```

### 3. Khởi tạo Database (Supabase)
Bạn có thể chạy các câu lệnh SQL khởi tạo bảng từ file `schema.sql` trực tiếp trên SQL Editor của Supabase.

### 4. Chạy Development Server
```bash
npm run dev
```
Mở `http://localhost:3000` để xem ứng dụng và `http://localhost:3000/docs` để xem tài liệu API.
