# BÁO CÁO PHÂN TÍCH DỮ LIỆU THỰC NGHIỆM GIAI ĐOẠN 2 (REAL-TIME DATA REPORT)
*Thời gian xuất báo cáo: 17:51:24 8/8/2026 (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế cỡ mẫu nhỏ & Đồng nhất nhóm tuổi tác (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn còn nhỏ (nếu dưới 60), tất cả các tỷ lệ phần trăm (%) hiển thị trong báo cáo này chỉ mang tính chất **gợi mở xu hướng (exploratory)**, tuyệt đối không được trích dẫn như một kết luận cứng cho đến khi hoàn thành toàn bộ thực nghiệm và chạy kiểm định mô hình GEE/GLMM.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22. Đây là một hạn chế rõ rệt về mặt nhân khẩu học (Demographic Homogeneity Limitation) cần được khai báo trong phần thảo luận (Discussion) của khóa luận.

> [!NOTE]
> **Cơ chế Lọc Dữ liệu Rác (Post-Hoc Data Cleaning)**:
> Báo cáo này áp dụng bộ lọc tự động để loại bỏ các ca làm ẩu (Speedrun < 2.0 giây/câu hoặc chọn trùng một lựa chọn liên tục $ge 19/20$ câu). Tổng cộng đã phát hiện và loại bỏ **6** ca làm ẩu ra khỏi các tính năng thống kê hành vi và nhận diện bẫy lỗi để bảo đảm chất lượng dữ liệu sạch.

---

## 1. Phân tích Phân khúc Đối tượng tham gia (Demographics & Users Profile)

*   **Tổng số người dùng thực tế tham gia**: 27 người
*   **Hoàn thành hợp lệ (Clean Completes)**: 22 người (~81%)
*   **Làm ẩu bị loại bỏ (Flagged Spam)**: 6 người
*   **Số lượng bỏ dở giữa chừng (Dropouts)**: 5 người (~19%)

### Phân bố Nhóm Giao diện (Interface Group Assignment - Bao gồm cả Dropouts)
*   **Nhóm A (Black-box AI)**: 9 người (Hoàn thành sạch: 6 - Bỏ dở: 3)
*   **Nhóm B (Static XAI)**: 10 người (Hoàn thành sạch: 9 - Bỏ dở: 1)
*   **Nhóm C (Interactive XAI)**: 8 người (Hoàn thành sạch: 7 - Bỏ dở: 1)

### Phân bố Thiết bị sử dụng (Device Distribution - Toàn bộ mẫu)
*   **Mobile**: 18 người (~67%)
*   **Desktop**: 9 người (~33%)

### Phân bố Nhóm Tuổi (Age Group Distribution - Toàn bộ mẫu)
*   **23-30**: 1 người (~4%)
*   **18-22**: 25 người (~93%)
*   **< 18**: 1 người (~4%)

### Phân bố Tần suất sử dụng công cụ AI (AI Exposure Frequency - Toàn bộ mẫu)
*   **Thường xuyên**: 7 người (~26%)
*   **Thỉnh thoảng**: 5 người (~19%)
*   **Hàng ngày**: 13 người (~48%)
*   **Hiếm khi**: 2 người (~7%)

### Phân bố Chi tiết Nghề nghiệp (Detailed Occupation Distribution)
*   **Sinh viên - Khối ngành Kỹ thuật / Công nghệ**: 14 người
*   **Sinh viên - Khối ngành Kinh tế / Quản trị**: 5 người
*   **Sinh viên - Khối ngành Y tế / Sức khỏe**: 2 người
*   **Sinh viên - Khác**: 2 người
*   **Tự doanh / Tự do**: 1 người
*   **Người đi làm - Lĩnh vực Y tế / Giáo dục**: 1 người
*   **Khác**: 1 người
*   **Người đi làm - Lĩnh vực Kỹ thuật / Công nghệ**: 1 người

---

## 2. Phân tích Chỉ số Hành vi & HCI (HCI Engagement Metrics)

*Số liệu được tính trung bình trên mỗi đối tượng HOÀN THÀNH HỢP LỆ sau khi lọc.*

| Nhóm Giao diện | Thời gian ra quyết định / câu | Thời gian tương tác thực tế (Active Time) | Số lượt hover / người | Số câu hỏi chatbot / người | Số tương tác What-if / người |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 8.64 | 8.64 | 37.33 | Không hỗ trợ | Không hỗ trợ |
| **Nhóm B (Static XAI)** | 11.21 | 11.22 | 32.44 | Không hỗ trợ | Không hỗ trợ |
| **Nhóm C (Interactive)** | 13.30 | 13.30 | 78.43 | 0.43 | 19.29 |

---

## 3. Độ chính xác Phát hiện Bẫy AI (Cognitive Trust Calibration)

*Tỷ lệ phần trăm thể hiện số lần người dùng phát hiện lỗi AI và bác bỏ thành công trên các câu bẫy.*

| Nhóm Giao diện | Quyết định bác bỏ AI / Tổng số lượt gặp bẫy | Tỷ lệ phát hiện lỗi AI (%) |
| :--- | :---: | :---: |
| **Nhóm A (Black-box)** | 11 / 36 | **~31%** |
| **Nhóm B (Static XAI)** | 14 / 54 | **~26%** |
| **Nhóm C (Interactive)** | 9 / 42 | **~21%** |

*Chú thích: Tỷ lệ phần trăm trên đây chỉ biểu thị xu hướng phân bố thô trên mẫu thử hiện tại. Mối liên hệ có ý nghĩa thống kê thực tế sẽ được xác định thông qua kiểm định phương trình ước lượng tổng quát (GEE) trên bộ dữ liệu hoàn chỉnh.*

---

## 4. Tải lượng Nhận thức (NASA-TLX Cognitive Load)

*Khảo sát NASA-TLX cuối bài kiểm tra. Thang đo từ 1 (Rất nhẹ) đến 20 (Quá tải).*

| Chỉ số tải lượng nhận thức | Nhóm A (Black-box) | Nhóm B (Static XAI) | Nhóm C (Interactive XAI) |
| :--- | :---: | :---: | :---: |
| **Mental Demand (Yêu cầu trí óc)** | 4.67 | 3.78 | 4.29 |
| **Temporal Demand (Yêu cầu thời gian)** | 3.83 | 3.00 | 3.71 |
| **Performance (Hiệu suất tự đánh giá)** | 4.83 | 5.11 | 4.29 |
| **Effort (Mức độ nỗ lực)** | 4.67 | 3.89 | 4.57 |
| **Frustration (Sự ức chế)** | 3.00 | 3.00 | 3.43 |
| **Overall Load (Tải lượng tổng thể)** | 4.33 | 3.22 | 3.86 |

---

## 5. Danh sách người dùng hợp lệ (Completes Roster)
*   **[1]** Trần Thị Thanh Nhàn (ID: u_20260808012849765247) - Nhóm: **B** | Nghề: Tự doanh / Tự do | Thiết bị: Mobile
*   **[2]** Nguyễn Yến Nhi (ID: u_20260808014513268208) - Nhóm: **C** | Nghề: Sinh viên - Khối ngành Kinh tế / Quản trị | Thiết bị: Mobile
*   **[3]** Nguyễn Sơn Tùng (ID: u_20260808014609826896) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Desktop
*   **[4]** Nguyễn Thu Hương (ID: u_20260808021246115312) - Nhóm: **A** | Nghề: Sinh viên - Khối ngành Y tế / Sức khỏe | Thiết bị: Mobile
*   **[5]** Dương Tuấn Hưng (ID: u_20260808024651938655) - Nhóm: **C** | Nghề: Sinh viên - Khác | Thiết bị: Desktop
*   **[6]** Trần Hoàng Gia Huy (ID: u_20260808024122738274) - Nhóm: **C** | Nghề: Sinh viên - Khác | Thiết bị: Mobile
*   **[7]** Trần Đức Thắng (ID: u_20260808025810457289) - Nhóm: **A** | Nghề: Người đi làm - Lĩnh vực Y tế / Giáo dục | Thiết bị: Mobile
*   **[8]** Gff (ID: u_20260808044252458778) - Nhóm: **A** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Mobile
*   **[9]** Adolf Hitler (ID: u_20260808030445615887) - Nhóm: **B** | Nghề: Khác | Thiết bị: Desktop
*   **[10]** Nguyễn Thành Lân (ID: u_20260808031140233393) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Y tế / Sức khỏe | Thiết bị: Desktop
*   **[11]** Trần Thanh Nga (ID: u_20260808045226073517) - Nhóm: **C** | Nghề: Sinh viên - Khối ngành Kinh tế / Quản trị | Thiết bị: Mobile
*   **[12]** Nguyễn Thành Nam (ID: u_20260808032010497439) - Nhóm: **A** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Desktop
*   **[13]** Trần Văn Bình (ID: u_20260808043610955059) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Kinh tế / Quản trị | Thiết bị: Desktop
*   **[14]** Trần Phát Tuyển (ID: u_20260808045912244646) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Kinh tế / Quản trị | Thiết bị: Mobile
*   **[15]** Lưu Minh Hiếu (ID: u_20260808054439590496) - Nhóm: **A** | Nghề: Người đi làm - Lĩnh vực Kỹ thuật / Công nghệ | Thiết bị: Mobile
*   **[16]** Đặng Vũ Nam (ID: u_20260808064222130471) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Mobile
*   **[17]** Nguyễn Hà Anh (ID: u_20260808064212216989) - Nhóm: **C** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Mobile
*   **[18]** Nguyễn Ngọc Vượng (ID: u_20260808072935897191) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Mobile
*   **[19]** Nguyễn Thành Đạt (ID: u_20260808073150460815) - Nhóm: **C** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Desktop
*   **[20]** Hoang Nang Minh (ID: u_20260808080143445358) - Nhóm: **A** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Desktop
*   **[21]** Nguyễn Tuấn Dương (ID: u_20260808080022140595) - Nhóm: **B** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Mobile
*   **[22]** Nguyễn Thị Thùy Dung (ID: u_20260808095947098513) - Nhóm: **C** | Nghề: Sinh viên - Khối ngành Kỹ thuật / Công nghệ | Thiết bị: Desktop

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).
