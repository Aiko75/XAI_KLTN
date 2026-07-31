# Báo cáo Sàng lọc Kịch bản & Phân tích Tỷ lệ Bỏ cuộc (Dropout)

Báo cáo này phân tích hành vi của **6 người dùng bỏ cuộc giữa chừng** và hiệu suất của **20 kịch bản tín dụng** để đưa ra các đề xuất tối ưu hóa bộ câu hỏi cho khóa luận.

---

## 🚪 1. Phân tích người dùng bỏ cuộc (Dropout Analysis)

Tổng số có **6 người** đăng ký nhưng không hoàn thành:
1. **Bùi Anh Dũng** (Nhóm A): Dừng ở câu 1 (0 câu trả lời).
2. **Nguyễn Sơn Tùng** (Nhóm C): Dừng ở câu 1 (0 câu trả lời).
3. **Nguyễn Quang Sơn** (Nhóm C): Làm được 3 câu, dừng trước câu 4.
4. **Nguyễn Văn A** (Nhóm B): Làm được 3 câu, dừng trước câu 4.
5. **Nguyễn Yến N** (Nhóm C): Làm được 4 câu, dừng trước câu 5.
6. **Hhgs** (Nhóm A): Làm được 5 câu, dừng trước câu 6.

> [!IMPORTANT]
> **Nhận xét & Phát hiện**:
> * **Điểm gãy hành vi**: 4/6 người bỏ cuộc dừng lại đúng ở **câu 4 hoặc 5**. Câu 4 chính là **kịch bản Bẫy (Trap) đầu tiên** trong bài test (AI đoán sai). Khi gặp mâu thuẫn giữa thông tin hồ sơ và quyết định của AI, người dùng có thể bị hoang mang hoặc cảm thấy quá khó nên đã thoát ứng dụng.
> * **Tác động của nhóm C**: 50% số người bỏ cuộc thuộc **Nhóm C (Giải thích phức tạp)**. Giao diện quá nhiều bảng biểu toán học và ma trận đã gây nản lòng (frustration) cho sinh viên ngay từ những câu đầu tiên.

---

## 🎯 2. Đánh giá hiệu suất 20 Kịch bản (Sàng lọc Câu hỏi)

Số liệu từ 14 người dùng hoàn thành toàn bộ 20 câu:

### A. Những câu hỏi quá dễ (Độ chính xác ~100%, Thời gian nhanh)
*   **Câu 3 (Normal - Duyệt)**:
    - Độ chính xác: **100%** ở cả 3 nhóm (A, B, C).
    - Thời gian phản hồi trung bình: **11.36 giây**.
    - *Đề xuất*: **Nên loại bỏ hoặc sửa đổi**. Câu này quá hiển nhiên (Khách hàng thu nhập 50tr, thâm niên 10 năm, vay 400tr, không nợ xấu). Người dùng không cần suy nghĩ cũng đồng ý với AI. Nó không giúp phân hóa hành vi giữa các nhóm.

*   **Câu 20 (Normal - Duyệt)**:
    - Độ chính xác: **92.86%** (Nhóm B & C đạt 100%, Nhóm A đạt 80%).
    - Thời gian phản hồi trung bình: **6.34 giây**.
    - *Đề xuất*: Giữ lại làm câu kết thúc nhẹ nhàng, hoặc thay thế nếu muốn tăng độ khó.

### B. Những câu hỏi quá khó hoặc gây nhiễu (Độ chính xác quá thấp, Thời gian quá dài)
*   **Câu 9 (Bẫy - AI Từ chối nhưng thực tế là Duyệt)**:
    - Độ chính xác: Chỉ **21.43%** người phát hiện ra bẫy.
    - Thời gian phản hồi trung bình: **57.01 giây** (Kỷ lục cao nhất). Đặc biệt ở **Nhóm C mất trung bình 174.78 giây (gần 3 phút)** cho riêng câu này và độ chính xác là **0%** (không ai phát hiện ra bẫy).
    - *Đề xuất*: **Cần biên tập lại**. Câu hỏi này quá phức tạp và gây nhiễu cực mạnh. Việc Nhóm C mất gần 3 phút mà vẫn trả lời sai 100% cho thấy giải thích toán học của câu này đang phản tác dụng hoàn toàn, khiến người dùng bị cuốn vào ma trận số liệu mà quên mất tư duy logic cơ bản.

*   **Câu 14 (Bẫy - AI Duyệt nhưng thực tế là Từ chối)**:
    - Độ chính xác: Chỉ **14.29%** (Nhóm A: 0%, Nhóm B: 16.67%, Nhóm C: 33.33%).
    - Thời gian phản hồi trung bình: **7.05 giây**.
    - *Đề xuất*: **Cần sửa đổi**. Người dùng làm câu này cực nhanh (7s) nhưng sai hàng loạt (85.7% dính bẫy). Điều này chứng tỏ bẫy này được thiết kế chưa đủ nổi bật, người dùng chỉ lướt qua và bấm "Đồng ý" theo thói quen mà không hề đọc kỹ thuộc tính hồ sơ.

*   **Câu 7 (Kiểm tra chú ý - Yêu cầu chọn Bác bỏ)**:
    - Độ chính xác (Tỷ lệ pass): **50.00%** (Nhóm A: 60%, Nhóm B: 50%, Nhóm C: 33.33%).
    - *Đề xuất*: **Giữ nguyên**. Tỷ lệ Nhóm C trượt chú ý cao nhất (66.6% trượt) là bằng chứng khoa học rất tốt cho thấy giao diện phức tạp làm giảm sự tập trung vào các chi tiết quan trọng.

---

## 💻 3. Quan điểm & Đề xuất cải thiện ứng dụng Web

Để giảm tỷ lệ bỏ cuộc (dropout) và tăng tính chính xác của thực nghiệm, tôi đề xuất các cải tiến sau cho nền tảng Web:

1. **Thêm màn hình Hướng dẫn Đọc hiểu Biểu đồ (Chart Tutorial):**
   * Đối với nhóm B và C, trước khi vào làm test, nên có 1 trang giải thích ngắn gọn: *"Biểu đồ cột ngang màu xanh là điểm cộng, màu đỏ là điểm trừ"*. Điều này giúp đối tượng sinh viên 2k5/2k6 nhanh chóng nắm bắt giao diện mà không bị sốc thông tin ở câu 1 (dẫn đến thời gian câu 1 của nhóm C lên tới 164 giây).

2. **Cân bằng lại độ tin cậy của AI (Confidence Percent):**
   * Theo feedback của người dùng ở nhóm C: *"Chả nhẽ mô hình trả 98% mà người dùng lại không đồng ý"*.
   * Hiện tại, các kịch bản đang để độ tin cậy quá cao (92% - 96%). Chúng ta nên điều chỉnh một số kịch bản về khoảng **60% - 75%** (mức độ phân vân). Khi AI báo độ tin cậy thấp, người dùng mới thực sự so sánh đối chiếu giữa Hồ sơ và Giải thích để tự đưa ra quyết định, thay vì nhắm mắt chọn theo AI.

3. **Cải tiến thanh tiến độ (Gamification để giảm dropout):**
   * Thêm các câu khích lệ nhỏ khi hoàn thành mỗi 5 câu (ví dụ: *"Tuyệt vời! Bạn đã hoàn thành 25% chặng đường"*).
   * Cho phép người dùng tạm dừng (Pause) và tiếp tục sau nếu bài test quá dài (tuy nhiên việc này có thể ảnh hưởng đến tính liên tục của đo lường thời gian).
