# BÁO CÁO PHÂN TÍCH DỮ LIỆU THỰC NGHIỆM GIAI ĐOẠN 2 (REAL-TIME DATA REPORT)
*Thời gian xuất báo cáo: 07:45:05 10/8/2026 (Giờ Việt Nam)*

> [!IMPORTANT]
> **Bộ Lọc Lọc 4 Tầng Dựa Trên Thời Gian (4-Tier Time-Based Filter)**:
> Báo cáo này áp dụng bộ lọc chính thức 4 tầng dựa trên thời gian đọc và điểm sụp đổ nhận thức:
> *   **Tầng 1**: Ngưỡng thời gian đọc tối thiểu theo giao diện (A >= 2.0s, B >= 3.0s, C >= 4.0s).
> *   **Tầng 2**: Phát hiện điểm sụp đổ nhận thức (Collapse Point - chuỗi >= 3 câu liên tiếp dưới ngưỡng thời gian).
> *   **Tầng 3**: Cắt dữ liệu liền mạch từ điểm sụp đổ đến hết bài.
> *   **Tầng 4**: Loại bỏ hoàn toàn người dùng nếu số câu hợp lệ < 10.
> *(Lưu ý: Tầng 5 kiểm tra trùng lặp đáp án đã được xóa bỏ hoàn toàn để bảo toàn biến phụ thuộc phát hiện bẫy AI).*

---

## 1. Phân tích Tỷ lệ Giữ chân & Lọc Dữ liệu theo Nhóm Giao diện (4-Tier Time Filter Results)

| Nhóm Giao diện | Đăng ký (Registered) | Hoàn thành gốc (Completed) | Giữ được sau Lọc 4 Tầng | Tỷ lệ giữ chân sau lọc (%) | Điểm Phát Hiện Bẫy Trung Bình (/4) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 15 | 12 | **11** | **~92%** | **1.4 / 4 (34%)** |
| **Nhóm B (Static XAI)** | 15 | 14 | **10** | **~71%** | **1.4 / 4 (35%)** |
| **Nhóm C (Interactive XAI)** | 15 | 11 | **6** | **~55%** | **0.8 / 4 (21%)** |
| **TỔNG CỘNG** | **45** | **37** | **27** | **~73%** | — |

### Phân loại Người dùng Hoàn thành:
*   **Dữ liệu hợp lệ 20/20 câu (Full Clean)**: 25 người
*   **Dữ liệu cắt một phần (Partial Clean - Giữ 10-19 câu)**: 2 người
*   **Loại hoàn toàn (Do sụp đổ sớm < 10 câu)**: 10 người

---

## 2. BIẾN PHỤ THUỘ TRUNG TÂM: ĐÔ CHÍNH XÁC PHÁT HIỆN BẪY AI (TRAP DETECTION ACCURACY)

*Bẫy AI gồm 4 kịch bản (#1, #8, #11, #16) nơi phán quyết AI mâu thuẫn với Ground Truth ngân hàng.*

| Nhóm Giao diện | Số người sạch | Điểm Bẫy Trung Bình (/4) | Tỷ lệ Phát Hiện Bẫy (%) | Bác bỏ Bẫy / Tổng bẫy |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 11 | **1.4 / 4 (34%)** | **~34%** | 15 / 44 |
| **Nhóm B (Static XAI)** | 10 | **1.4 / 4 (35%)** | **~35%** | 14 / 39 |
| **Nhóm C (Interactive XAI)** | 6 | **0.8 / 4 (21%)** | **~21%** | 5 / 24 |

---

## 3. Chỉ số Hành vi & Tương tác HCI (Valid Clean Data)

| Nhóm Giao diện | Thời gian ra quyết định / câu | Số lượt hover / người | Số câu hỏi chatbot / người | Số tương tác What-if / người |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 21.50s | 34.82 | Không hỗ trợ | Không hỗ trợ |
| **Nhóm B (Static XAI)** | 21.02s | 26.50 | Không hỗ trợ | Không hỗ trợ |
| **Nhóm C (Interactive)** | 25.83s | 202.17 | 0.50 | 66.50 |

---

## 4. Phân tích Chuyên sâu Nhóm Bỏ cuộc giữa chừng (Dropout Deep-Dive)

*Tổng số người dùng bỏ cuộc giữa chừng: **8** người (~18% trên tổng đăng ký).*

### Tỷ lệ Bỏ cuộc theo Nhóm Giao diện
*   **Nhóm A (Black-box AI)**: 3 người bỏ dở
*   **Nhóm B (Static XAI)**: 1 người bỏ dở
*   **Nhóm C (Interactive XAI)**: 4 người bỏ dở

---

## 5. DANH SÁCH NGƯỜI DÙNG SẠCH & ĐIỂM PHÁT HIỆN BẪY (CLEAN ROSTER & TRAP SCORE)

*Bảng tổng hợp chi tiết kết quả từng cá nhân sạch được giữ lại cho phân tích thống kê:*

| STT | Tên Người Dùng | ID Người Dùng | Nhóm Giao Diện | **Số Bẫy Phát Hiện Đúng (/4)** | Tỷ Lệ Phát Hiện Bẫy (%) | Trạng Thái Dữ Liệu |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | Trần Thị Thanh Nhàn | `u_20260808012849765247` | **B** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **2** | Nguyễn Sơn Tùng | `u_20260808014609826896` | **B** | **2/4** | **50%** | Giữ đủ 20/20 câu |
| **3** | Nguyễn Thu Hương | `u_20260808021246115312` | **A** | **2/4** | **50%** | Giữ đủ 20/20 câu |
| **4** | Đỗ Duy Phát | `u_20260808021850257380` | **B** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **5** | Dương Tuấn Hưng | `u_20260808024651938655` | **C** | **3/4** | **75%** | Giữ đủ 20/20 câu |
| **6** | Trần Hoàng Gia Huy | `u_20260808024122738274` | **C** | **0/4** | **0%** | Giữ đủ 20/20 câu |
| **7** | Trần Đức Thắng | `u_20260808025810457289` | **A** | **2/4** | **50%** | Giữ đủ 20/20 câu |
| **8** | Nguyễn Thành Nam | `u_20260808032010497439` | **A** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **9** | Lưu Minh Hiếu | `u_20260808054439590496` | **A** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **10** | Nguyễn Hà Anh | `u_20260808064212216989` | **C** | **2/4** | **50%** | Giữ đủ 20/20 câu |
| **11** | Nguyễn Ngọc Vượng | `u_20260808072935897191` | **B** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **12** | Hoang Nang Minh | `u_20260808080143445358` | **A** | **2/4** | **50%** | Giữ đủ 20/20 câu |
| **13** | Nguyễn Tuấn Dương | `u_20260808080022140595` | **B** | **0/4** | **0%** | Giữ đủ 20/20 câu |
| **14** | Nguyễn Thị Thùy Dung | `u_20260808095947098513` | **C** | **0/4** | **0%** | Giữ đủ 20/20 câu |
| **15** | Người tham gia 2 | `u_20260808044252458778` | **A** | **3/4** | **75%** | Giữ đủ 20/20 câu |
| **16** | Nguyen tien khoi nguyen | `u_20260808111436072775` | **A** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **17** | Nguyễn Quang Anh | `u_20260808030445615887` | **B** | **3/4** | **75%** | Giữ đủ 20/20 câu |
| **18** | Trần Quốc Quân | `u_20260807145247958905` | **A** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **19** | Nguyễn Văn Sáng | `u_20260808132825400642` | **B** | **3/4** | **75%** | Giữ đủ 20/20 câu |
| **20** | Đào thị nhàn | `u_20260808135211757025` | **A** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **21** | Nguyễn Thị Ngọc Ánh | `u_20260808140343567002` | **B** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **22** | Nguyễn văn thiệu | `u_20260808142426393582` | **A** | **1/4** | **25%** | Giữ đủ 20/20 câu |
| **23** | Đỗ Bá Hiếu | `u_20260809040106204820` | **C** | **0/4** | **0%** | Giữ đủ 20/20 câu |
| **24** | Lê Thị Bích | `u_20260809051651961722` | **A** | **0/4** | **0%** | Giữ đủ 20/20 câu |
| **25** | Châu Đăng Khoa | `u_20260809150036079343` | **B** | **2/4** | **50%** | Giữ đủ 20/20 câu |
| **26** | Duy | `u_20260808104025367892` | **B** | **0/3** | **0%** | Cắt một phần (Giữ 11/20 câu) |
| **27** | Phạm Thanh Quang | `u_20260808033546466328` | **C** | **0/4** | **0%** | Cắt một phần (Giữ 16/20 câu) |

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
