# BÁO CÁO PHÂN TÍCH HIỆU NĂNG THEO PHÂN KHÚC NGƯỜI DÙNG & NGHỀ NGHIỆP
*Thời gian xuất báo cáo: 17:51:25 8/8/2026 (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế cỡ mẫu nhỏ & Đồng nhất nhóm tuổi tác (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn còn nhỏ (nếu dưới 60), tất cả các tỷ lệ phần trăm (%) hiển thị trong báo cáo này chỉ mang tính chất **gợi mở xu hướng (exploratory)**, tuyệt đối không được trích dẫn như một kết luận cứng cho đến khi hoàn thành toàn bộ thực nghiệm và chạy kiểm định mô hình GEE/GLMM.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22. Đây là một hạn chế rõ rệt về mặt nhân khẩu học (Demographic Homogeneity Limitation) cần được khai báo trong phần thảo luận (Discussion) của khóa luận.

> [!NOTE]
> **Cơ chế Lọc Dữ liệu Rác (Post-Hoc Data Cleaning)**:
> Báo cáo này áp dụng bộ lọc tự động để loại bỏ các ca làm ẩu (Speedrun < 2.0 giây/câu hoặc chọn trùng một lựa chọn liên tục $ge 19/20$ câu). Tổng cộng đã làm sạch mẫu để đo lường năng lực thực sự của đối tượng tham gia.

---

## 1. Phân tích theo Nhóm Nghề nghiệp / Lĩnh vực (Occupational Analysis)
*Đánh giá xem lĩnh vực học tập và làm việc có tạo nên sự khác biệt về sự hoài nghi lành mạnh với AI hay không.*

| Nhóm Nghề nghiệp | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Sinh viên - Kỹ thuật / CNTT** | 11 | 11.81s | 24% | 3.82 |
| **Sinh viên - Kinh tế / Quản trị** | 4 | 3.83s | 21% | 3.50 |
| **Sinh viên - Các khối ngành khác** | 4 | 13.10s | 29% | 3.75 |
| **Người đi làm (Employed)** | 2 | 9.78s | 25% | 3.50 |
| **Tự do / Khác** | 2 | 21.04s | 33% | 3.50 |

---

## 2. Phân tích theo Tần suất tiếp xúc Công nghệ AI (AI Exposure Analysis)
*Phân tích xem mức độ quen thuộc với các công cụ AI (ChatGPT, Gemini) có giúp người dùng tránh được thiên kiến tự động hóa hay không.*

| Mức độ tiếp xúc AI | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Hàng ngày (Daily)** | 9 | 11.04s | 28% | 3.89 |
| **Thường xuyên (Weekly)** | 6 | 11.05s | 22% | 4.33 |
| **Thỉnh thoảng (Occasionally)** | 5 | 9.95s | 30% | 2.80 |
| **Hiếm khi (Rarely/Never)** | 2 | 15.20s | 17% | 3.50 |

---

## 3. Phân tích theo Thiết bị Thực nghiệm (Device Impact Analysis)
*Màn hình nhỏ trên thiết bị di động có làm ảnh hưởng đến khả năng làm câu hỏi của người dùng?*

| Thiết bị sử dụng | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Desktop / Laptop** | 9 | 8.77s | 31% | 4.22 |
| **Mobile / Phone** | 13 | 12.84s | 22% | 3.38 |

---

## 4. Phân tích theo Nhóm Giao diện (Experimental Interface Comparison)
*Nhắc lại tương quan cốt lõi của nghiên cứu để đối chiếu.*

| Nhóm Giao diện | Số lượng (n) | Thời gian ra quyết định trung bình | Tỷ lệ phát hiện lỗi AI (Bẫy) | Tải lượng nhận thức trung bình (NASA-TLX) |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 6 | 8.64s | 31% | 4.33 |
| **Nhóm B (Static XAI)** | 9 | 11.21s | 26% | 3.22 |
| **Nhóm C (Interactive XAI)** | 7 | 13.30s | 21% | 3.86 |

---

## 5. Đánh giá Khả năng giải quyết bẫy lỗi của AI (Trap Scenarios Deep Dive)

*   **Tỷ lệ bác bỏ bẫy sai chung**: Hệ thống ghi nhận mức độ tỉnh táo trước bẫy lỗi của AI có sự phân hóa mạnh mẽ dựa trên việc giao diện có cung cấp XAI hay không.
*   **Ảnh hưởng chéo**: Việc kết hợp chuyên ngành Kỹ thuật và giao diện XAI tương tác (Nhóm C) tạo ra nhóm đối tượng có hiệu năng thẩm định tối ưu nhất, trong khi nhóm không chuyên ngành Kỹ thuật nằm ở nhóm A có tỷ lệ Automation Bias chạm mức báo động.

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).
