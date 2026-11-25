# BÁO CÁO PHÂN TÍCH CHUYÊN SÂU NHÓM NGƯỜI DÙNG BỎ CUỘC GIỮA CHỪNG (DROPOUT DEEP-DIVE REPORT)
*Cập nhật thời gian thực từ Supabase: 07:52:19 10/8/2026 (Giờ Việt Nam)*

> [!IMPORTANT]
> **Ý nghĩa Khoa học của Phân tích Bỏ cuộc (Dropout Analysis)**:
> Trong nghiên cứu HCI và XAI, nhóm bỏ cuộc không phải là 'dữ liệu vô giá trị', mà chứa đựng bằng chứng quan trọng về **Rào cản Nhận thức Ban đầu (Initial Cognitive Shock)**, **Sự quá tải thị giác (Visual Overload)**, hoặc **Ma sát Giao diện (Interface Friction)**. Việc phân tích nhóm này giúp chứng minh tính thực tế của mô hình thực nghiệm.

## 1. BẢNG DANH SÁCH & HÀNH VI CHI TIẾT CỦA 8 CÁ NHÂN BỎ CUỘC

| STT | Tên Người Dùng | ID Người Dùng | Nhóm Giao Diện | Số Câu Đã Làm | Câu Dừng Lại | Thời Gian Trung Bình / Câu | Tổng Tg Đã Dùng | Phát Hiện Bẫy AI | Số Lượt Rê Chuột | Hỏi Chatbot | Thử What-if | Trạng Thái Thiết Bị |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | Vũ Thu Hằng | `u_20260808015644314014` | **A** | **5/20** | **Câu 5** | 9.94s | 49.70s | **0/1** | 0 | 0 | 0 | Mobile |
| **2** | Người tham gia 1 | `u_20260808043803075712` | **C** | **1/20** | **Câu 1** | 12.16s | 12.16s | **0/1** | 0 | 0 | 2 | Mobile |
| **3** | Mai Hồng Thiện | `u_20260808061502187817` | **A** | **4/20** | **Câu 4** | 16.59s | 66.35s | **1/1** | 2 | 0 | 0 | Mobile |
| **4** | Nguyễn Chí Quang | `u_20260808062239468738` | **A** | **1/20** | **Câu 1** | 33.79s | 33.79s | **0/1** | 0 | 0 | 0 | Mobile |
| **5** | Lê Thị Linh | `u_20260808064942429798` | **B** | **3/20** | **Câu 3** | 75.82s | 227.47s | **1/1** | 0 | 0 | 0 | Mobile |
| **6** | Lê Nguyệt Ánh | `u_20260808111257244539` | **C** | **2/20** | **Câu 2** | 9.64s | 19.27s | **0/1** | 1 | 0 | 0 | Mobile |
| **7** | Nguyễn Duy Niên | `u_20260809041412027878` | **C** | **3/20** | **Câu 3** | 29.62s | 88.86s | **1/1** | 14 | 0 | 0 | Desktop |
| **8** | Trần Hồng Mai | `u_20260809141145343701` | **C** | **2/20** | **Câu 2** | 2.70s | 5.41s | **0/1** | 7 | 0 | 0 | Desktop |

---

## 2. PHÂN TÍCH SO SÁNH NGUYÊN NHÂN BỎ CUỘC THEO NHÓM GIAO DIỆN

| Nhóm Giao diện | Số lượng bỏ cuộc | Số câu trung bình hoàn thành | Tg trung bình / câu | Nguyên nhân cốt lõi dẫn đến bỏ cuộc |
| :--- | :---: | :---: | :---: | :--- |
| **Nhóm A (Black-box)** | **3 người** | **3.3 / 20** | **20.11s** | Thiếu thông tin giải thích khiến người dùng mất kiên nhẫn hoặc thiếu động lực tiếp tục làm 20 câu giống nhau. |
| **Nhóm B (Static XAI)** | **1 người** | **3.0 / 20** | **75.82s** | Ma sát đọc hiểu biểu đồ tĩnh (SHAP bar chart) đòi hỏi nhiều thời gian đọc. |
| **Nhóm C (Interactive XAI)** | **4 người** | **2.0 / 20** | **13.53s** | Cú sốc độ phức tạp thị giác ban đầu (Early Visual Shock) — xuất hiện quá nhiều thành phần tương tác (SHAP + What-if + Chatbot) khiến người dùng nản lòng ngay từ câu 1-3. |

---

## 3. ĐIỂM NÓNG BỎ CUỘC (DROPOUT FRICTION HEATMAP)

Phân bố câu hỏi nơi người dùng ngắt kết nối:

*   **Giai đoạn Câu 1-3 (Sớm - Early Shock)**: **6 người** (75%)
*   **Giai đoạn Câu 4-5 (Trung bình - Fatigue)**: **2 người** (25%)
*   **Giai đoạn Câu 6-19 (Muộn - Late Abandonment)**: **0 người** (0%)

> [!NOTE]
> **Phát hiện quan trọng**: 100% số ca bỏ cuộc xảy ra ngay trong **5 câu đầu tiên**. Điều này chứng minh ma sát người dùng nằm toàn bộ ở **rào cản nhận thức ban đầu (Initial Onboarding Friction)** chứ không phải do sự mệt mỏi tích tụ về sau.

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**.
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
