# XAI_KLTN

Nền tảng thực nghiệm HCI cho đề tài XAI, tối ưu để chạy nhanh với dữ liệu kịch bản đã pre-compute.

## Kiến trúc đã áp dụng

- **Backend**: FastAPI (Python).
- **Nguồn dữ liệu test**: `backend/data/scenarios.json` gồm **20 kịch bản** đã chuẩn hóa.
- **Nguyên tắc quan trọng**: Web app **không gọi mô hình ML/SHAP realtime** khi người dùng làm bài; backend chỉ load dữ liệu pre-compute.
- **Logging**: SQLite (`backend/experiment.db`) lưu:
  - `users`: `user_id`, `group_assigned (A/B/C)`, `start_time`, `end_time`
  - `response_logs`: quyết định người dùng, thời gian phản hồi, cờ đúng/sai ở câu lỗi
  - `survey_logs`: điểm NASA-TLX (1–7)

## API chính

- `GET /api/scenarios`: trả 20 kịch bản (bao gồm trap/attention-check).
- `POST /api/users/start`: tạo user mới + random nhóm A/B/C theo cơ chế cân bằng.
- `POST /api/responses`: ghi log cho từng câu trả lời.
- `POST /api/survey`: ghi điểm NASA-TLX.
- `POST /api/users/{user_id}/finish`: kết thúc phiên làm test.
- `GET /admin/export`: xuất dữ liệu CSV để phân tích thống kê.

## Chạy local

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

Swagger UI: `http://127.0.0.1:8000/docs`

## Test

```bash
pytest -q
```
