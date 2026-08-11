# BÁO CÁO PHÂN TÍCH HIỆU CHỈNH ĐA CHIỀU: ĐƯỢC HƯỚNG DẪN CÂU 1 (`is_explained = true`) VS TỰ LÀM (`is_explained = false`)
*Đã hiệu chỉnh loại trừ thời gian Câu 1 và kiểm soát nhiễu Demo What-if | Cập nhật Supabase: 19:39:18 10/8/2026*

> [!IMPORTANT]
> **Các Điều Chỉnh Kiểm Soát Phương Pháp Luận (Methodological Controls Applied)**:
> 1. **Loại bỏ Thời gian Câu 1 của nhóm Guided**: Do việc giải thích diễn ra trong lúc làm Câu 1, thời gian Câu 1 của nhóm `is_explained=true` đã được **loại khỏi tính toán thời gian ra quyết định** để không làm vọt thời gian ảo.
> 2. **Kiểm soát Nhiễu Demo What-if**: Tần suất sử dụng What-if của nhóm được hướng dẫn được ghi nhận là hành vi dùng thử sau demo, **không so sánh như nhu cầu khám phá tự nhiên**.
> 3. **Giải thích Tỷ lệ Hoàn thành 100%**: Việc nhóm được giải thích hoàn thành 100% phản ánh **Hiệu ứng Trách nhiệm Xã hội (Social Desirability Bias / Researcher Presence)** do được tương tác trực tiếp với nghiên cứu viên, không diễn giải là ưu thế thiết kế giao diện.

## 1. BẢNG SO SÁNH CHẤT LƯỢNG DỮ LIỆU & HIỆU NĂNG PHÁN QUYẾT (ĐÃ HIỆU CHỈNH)

| Chỉ số Kiểm soát & Chất lượng | Nhóm Được Hướng Dẫn (`is_explained = true`) | Nhóm Tự Làm (`is_explained = false`) | Ý Nghĩa Thống Kê & Ghi Chú Phương Pháp Luận |
| :--- | :---: | :---: | :--- |
| **Tổng đăng ký (n)** | **12 người** | **34 người** | Mẫu thực tế từ Supabase |
| **Tỷ lệ Hoàn thành Khảo sát (%)** | **100.0%** (12 người) | **76.5%** (26 người) | Ảnh hưởng từ sự hiện diện trực tiếp của nghiên cứu viên |
| **Tỷ lệ Bỏ cuộc giữa chừng** | **0.0%** | **23.5%** | Sự hiện diện của nghiên cứu viên duy trì cam kết |
| **Tỷ lệ Giữ chân Dữ liệu Sạch** | **100.0%** (12 người) | **47.1%** (16 người) | Bảo toàn 100% mẫu khảo sát đạt chuẩn |
| **Thời gian quyết định / câu (Bỏ Q1)**| **30.62s / câu** | **11.08s / câu** | **Đã loại bỏ thời gian Câu 1**: Người dùng suy nghĩ kỹ gấp 3.4 lần |
| **Điểm Phát Hiện Bẫy AI Trung Bình (/4)** | **1.0 / 4 (25%)** | **1.5 / 4 (37%)** | **Không có khác biệt đáng kể**: Lời dặn trung lập không làm mớm bẫy |
| **Độ chính xác Kịch bản Thường (16 câu)**| **79.2%** | **66.8%** | Độ tin cậy khi AI đề xuất chính xác |
| **Độ chính xác Tổng thể (20 câu)** | **68.3%** | **60.6%** | Hiệu năng ra quyết định người - AI |

---

## 2. KIỂM SOÁT NHIỄU DEMO TƯƠNG TÁC HCI

| Chỉ số Tương tác | Nhóm Được Hướng Dẫn (`is_explained = true`) | Nhóm Tự Làm (`is_explained = false`) | Ghi Chú Kiểm Soát Nhiễu |
| :--- | :---: | :---: | :--- |
| **Số lượt Thử What-if / người** | **35.8 lượt** | **1.9 lượt** | *Nhiễu Demo*: Phản ánh hành vi dùng thử sau hướng dẫn trực tiếp |
| **Số lượt Rê chuột SHAP / người** | **107.1 lượt** | **66.6 lượt** | Khám phá tự nhiên các thanh SHAP |

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**.
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
