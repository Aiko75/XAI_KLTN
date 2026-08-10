# BÁO CÁO PHÂN TÍCH HIỆU NĂNG THEO PHÂN KHÚC NGƯỜI DÙNG & NGHỀ NGHIỆP
*Thời gian xuất báo cáo: 07:45:06 10/8/2026 (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế thực nghiệm & Cỡ mẫu nhỏ (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn đang tích lũy (mục tiêu sàn N >= 40), tất cả các tỷ lệ phần trăm (%) hiển thị trong báo cáo này chỉ mang tính chất **gợi mở xu hướng (exploratory)**.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22 (Demographic Homogeneity Limitation).
> 3. **Mơ hồ nhận thức từ nhãn nút bấm (Cognitive Inversion)**: Việc dán nhãn nút quyết định là "Đồng ý/Từ chối đề xuất của AI" có thể đã gây ra đảo ngược nhận thức vô ý trên một số câu bẫy.

> [!NOTE]
> **Cơ chế Lọc 5 Tầng (5-Tier Data Filtering Algorithm)**:
> Báo cáo này áp dụng bộ lọc tự động 5 tầng để loại bỏ triệt để hiện tượng sụp đổ nhận thức (Collapse Point) và làm ẩu. Dữ liệu được tính toán trên các phản hồi HỢP LỆ từ 27 người dùng sạch.

---

## 1. So sánh Hiệu năng theo Ngành học (Academic Major Comparison)

| Ngành học | Số lượng (n) | Thời gian ra quyết định trung bình | Điểm Bẫy Trung Bình (/4) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **STEM / Công nghệ (Tech/IT)** | 12 | 12.83s | **1.2 / 4 (30%)** | 0.0 |
| **Kinh tế / Tài chính / Ngân hàng** | 1 | 24.12s | **1.0 / 4 (25%)** | 0.0 |
| **Khác (Xã hội / Sức khỏe / Nghệ thuật)** | 14 | 29.81s | **1.4 / 4 (34%)** | 0.0 |

---

## 2. Phân tích theo Tần suất Sử dụng AI (AI Experience Exposure)

| Tần suất Sử dụng AI | Số lượng (n) | Thời gian ra quyết định trung bình | Điểm Bẫy Trung Bình (/4) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Hàng ngày / Thường xuyên** | 16 | 14.52s | **1.3 / 4 (32%)** | 0.0 |
| **Thỉnh thoảng / Đôi khi** | 6 | 15.17s | **2.0 / 4 (50%)** | 0.0 |
| **Hiếm khi / Chưa bao giờ** | 5 | 54.62s | **0.4 / 4 (10%)** | 0.0 |

---

## 3. Phân tích theo Loại Thiết bị Thực nghiệm (Device Impact Analysis)

| Loại Thiết bị | Số lượng (n) | Thời gian ra quyết định trung bình | Điểm Bẫy Trung Bình (/4) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Desktop / Laptop** | 15 | 25.23s | **1.2 / 4 (31%)** | 0.0 |
| **Mobile / Phone** | 12 | 18.75s | **1.3 / 4 (33%)** | 0.0 |

---

## 4. Bảng So sánh Hiệu năng theo Nhóm Giao diện (Interface Group Performance)

| Nhóm Giao diện | Số lượng hợp lệ (n) | Thời gian ra quyết định / câu | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 11 | 21.50s | **undefined** | 0.0 |
| **Nhóm B (Static XAI)** | 10 | 21.02s | **undefined** | 0.0 |
| **Nhóm C (Interactive XAI)** | 6 | 25.83s | **undefined** | 0.0 |

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
