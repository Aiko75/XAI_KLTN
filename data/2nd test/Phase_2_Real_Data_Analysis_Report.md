# BÁO CÁO PHÂN TÍCH DỮ LIỆU THỰC NGHIỆM GIAI ĐOẠN 2 (REAL-TIME DATA REPORT)
*Thời gian xuất báo cáo: 14:13:31 9/8/2026 (Giờ Việt Nam)*

> [!WARNING]
> **Hạn chế thực nghiệm & Cỡ mẫu nhỏ (Research Limitations)**:
> 1. **Kháng nghị tính chắc chắn**: Do cỡ mẫu hiện tại vẫn đang tích lũy (mục tiêu sàn N >= 40), các tỷ lệ phần trăm (%) hiển thị chỉ mang tính chất **gợi mở xu hướng (exploratory)**, không trích dẫn như kết luận cứng cho đến khi hoàn thành thực nghiệm và kiểm định GEE/GLMM.
> 2. **Đồng nhất nhân khẩu học**: Dữ liệu ghi nhận hơn 90% đối tượng tham gia là sinh viên trong độ tuổi 18-22 (Demographic Homogeneity Limitation) cần được khai báo trong phần Thảo luận (Discussion).
> 3. **Ánh xạ Ý nghĩa Nút bấm & Phân tích Độ nhạy (Sensitivity Analysis)**: 
>    * Giao diện dùng nhãn "Đồng ý/Từ chối đề xuất của AI" tạo rủi ro nhiễu nhận thức đảo ngược (Response-Mapping Ambiguity).
>    * **Phân tích độ nhạy**: Do nhãn nút nhất quán ở cả 3 nhóm, sai số này mang tính chất **ngẫu nhiên không thiên lệch (non-differential measurement error)**. Nó chỉ làm giảm độ nhạy phát hiện hiệu ứng (attenuation bias / giảm effect size) chứ không làm đảo ngược hướng của các giả thuyết nghiên cứu chính.
>    * **Kiểm chứng định lượng thực tế**: Đã bổ sung câu hỏi Comprehension Check ở cuối bài cho các đối tượng mới. Kết quả kiểm tra hiện tại: **0** đối tượng đã trả lời kiểm tra (0 người chọn đúng ~0%, 0 người hiểu nhầm ~0%).

> [!NOTE]
> **Cơ chế Lọc 5 Tầng (5-Tier Data Filtering Algorithm - Đã hiệu chỉnh Tầng 5)**:
> Báo cáo này áp dụng thuật toán lọc 5 tầng tiên tiến:
> *   **Tầng 1**: Ngưỡng thời gian đọc tối thiểu theo giao diện (A >= 2.0s, B >= 3.0s, C >= 4.0s).
> *   **Tầng 2**: Phát hiện điểm sụp đổ nhận thức (Collapse Point - chuỗi >= 3 câu liên tiếp dưới ngưỡng).
> *   **Tầng 3**: Cắt dữ liệu liền mạch từ điểm sụp đổ đến hết bài.
> *   **Tầng 4**: Loại bỏ hoàn toàn người dùng nếu số câu hợp lệ < 10.
> *   **Tầng 5**: Kiểm tra Straight-lining (>= 80% trùng đáp án) **chỉ áp dụng cho những người chưa bị cắt** (giữ nguyên đủ 20 câu gốc).

---

## 1. Phân tích Tỷ lệ Giữ chân & Lọc Dữ liệu theo Nhóm Giao diện (5-Tier Filter Results)

| Nhóm Giao diện | Đăng ký (Registered) | Hoàn thành gốc (Completed) | Giữ được sau Lọc 5 Tầng | Tỷ lệ giữ chân sau lọc (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 15 | 12 | **11** | **~92%** |
| **Nhóm B (Static XAI)** | 14 | 13 | **9** | **~69%** |
| **Nhóm C (Interactive XAI)** | 14 | 11 | **6** | **~55%** |
| **TỔNG CỘNG** | **43** | **36** | **26** | **~72%** |

### Phân loại Người dùng Hoàn thành:
*   **Dữ liệu hợp lệ 20/20 câu (Full Clean)**: 24 người
*   **Dữ liệu cắt một phần (Partial Clean - Giữ 10-19 câu)**: 2 người
*   **Loại hoàn toàn (Excluded Spammers/Early Collapse)**: 10 người

---

## 2. Phân tích Chuyên sâu Nhóm Bỏ cuộc giữa chừng (Dropout Deep-Dive Analysis)

*Tổng số người dùng bỏ cuộc (ngắt kết nối giữa chừng): **7** người (~16% trên tổng số đăng ký).*

### 2.1. Tỷ lệ Bỏ cuộc theo Nhóm Giao diện
*   **Nhóm A (Black-box AI)**: 3 người bỏ dở
*   **Nhóm B (Static XAI)**: 1 người bỏ dở
*   **Nhóm C (Interactive XAI)**: 3 người bỏ dở

### 2.2. Giai đoạn Bỏ cuộc (Where Participants Dropped Out)
*   **Giai đoạn Early (1-5)**: 7 người (~100%)
*   **Giai đoạn Middle (6-14)**: 0 người (~0%)
*   **Giai đoạn Late (15-19)**: 0 người (~0%)
*   **Giai đoạn Start (0)**: 0 người (~0%)

---

## 3. Chỉ số Hành vi & Tương tác HCI (Valid Clean Data)

*Tính toán dựa trên các bản ghi phản hồi HỢP LỆ từ 26 người dùng sạch sau khi lọc 5 tầng.*

| Nhóm Giao diện | Thời gian ra quyết định / câu | Số lượt hover / người | Số câu hỏi chatbot / người | Số tương tác What-if / người |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 21.50s | 34.82 | Không hỗ trợ | Không hỗ trợ |
| **Nhóm B (Static XAI)** | 21.76s | 29.11 | Không hỗ trợ | Không hỗ trợ |
| **Nhóm C (Interactive)** | 25.83s | 202.17 | 0.50 | 66.50 |

---

## 4. Độ chính xác Phát hiện Bẫy AI (Cognitive Trust Calibration)

| Nhóm Giao diện | Bác bỏ Bẫy thành công / Tổng số bẫy | Tỷ lệ phát hiện lỗi AI (%) |
| :--- | :---: | :---: |
| **Nhóm A (Black-box)** | 15 / 66 | **~23%** |
| **Nhóm B (Static XAI)** | 12 / 52 | **~23%** |
| **Nhóm C (Interactive)** | 5 / 36 | **~14%** |

---

## 5. Danh sách Người dùng Giữ lại sau Lọc (Clean Completes Roster)
*   **[1]** Trần Thị Thanh Nhàn (ID: u_20260808012849765247) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[2]** Nguyễn Sơn Tùng (ID: u_20260808014609826896) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[3]** Nguyễn Thu Hương (ID: u_20260808021246115312) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[4]** Đỗ Duy Phát (ID: u_20260808021850257380) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[5]** Dương Tuấn Hưng (ID: u_20260808024651938655) - Nhóm: **C** | Trạng thái: Giữ đủ 20/20 câu
*   **[6]** Trần Hoàng Gia Huy (ID: u_20260808024122738274) - Nhóm: **C** | Trạng thái: Giữ đủ 20/20 câu
*   **[7]** Trần Đức Thắng (ID: u_20260808025810457289) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[8]** Nguyễn Thành Nam (ID: u_20260808032010497439) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[9]** Lưu Minh Hiếu (ID: u_20260808054439590496) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[10]** Nguyễn Hà Anh (ID: u_20260808064212216989) - Nhóm: **C** | Trạng thái: Giữ đủ 20/20 câu
*   **[11]** Nguyễn Ngọc Vượng (ID: u_20260808072935897191) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[12]** Hoang Nang Minh (ID: u_20260808080143445358) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[13]** Nguyễn Tuấn Dương (ID: u_20260808080022140595) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[14]** Nguyễn Thị Thùy Dung (ID: u_20260808095947098513) - Nhóm: **C** | Trạng thái: Giữ đủ 20/20 câu
*   **[15]** Người tham gia 2 (ID: u_20260808044252458778) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[16]** Nguyen tien khoi nguyen (ID: u_20260808111436072775) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[17]** Nguyễn Quang Anh (ID: u_20260808030445615887) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[18]** Trần Quốc Quân (ID: u_20260807145247958905) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[19]** Nguyễn Văn Sáng (ID: u_20260808132825400642) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[20]** Đào thị nhàn (ID: u_20260808135211757025) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[21]** Nguyễn Thị Ngọc Ánh (ID: u_20260808140343567002) - Nhóm: **B** | Trạng thái: Giữ đủ 20/20 câu
*   **[22]** Nguyễn văn thiệu (ID: u_20260808142426393582) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[23]** Đỗ Bá Hiếu (ID: u_20260809040106204820) - Nhóm: **C** | Trạng thái: Giữ đủ 20/20 câu
*   **[24]** Lê Thị Bích (ID: u_20260809051651961722) - Nhóm: **A** | Trạng thái: Giữ đủ 20/20 câu
*   **[25]** Duy (ID: u_20260808104025367892) - Nhóm: **B** | Trạng thái: Cắt một phần (Giữ 11/20 câu - Collapse tại câu 12)
*   **[26]** Phạm Thanh Quang (ID: u_20260808033546466328) - Nhóm: **C** | Trạng thái: Cắt một phần (Giữ 16/20 câu - Collapse tại câu 17)

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
