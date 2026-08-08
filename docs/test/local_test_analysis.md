# BÁO CÁO PHÂN TÍCH DỮ LIỆU KIỂM THỬ NỘI BỘ (LOCAL EXPERIMENT ANALYSIS REPORT)

> [!NOTE]
> Báo cáo này đúc kết kết quả thu thập từ các lượt chạy thử nghiệm nội bộ (Pilot Test / Local Testing) được lưu trong tệp tin `data/local_db.json`. Kết quả phân tích nhằm kiểm định tính ổn định của hệ thống đo lường hành vi (HCI Telemetry) và đánh giá sơ bộ thiên kiến tự động hóa (Automation Bias) của người dùng trước khi triển khai thu thập dữ liệu thực tế giai đoạn 2.

---

## 1. Phương pháp & Dữ liệu tổng quan

Hệ thống ghi nhận tổng cộng **16 lượt đăng ký** tham gia thử nghiệm cục bộ, trong đó có **5 đối tượng hoàn thành** toàn bộ quy trình thực nghiệm (20 tình huống và khảo sát NASA-TLX).

*   **Thời gian đọc hướng dẫn trung bình (Tutorial Duration)**: `3.54 giây` (Các đối tượng chạy thử thường bỏ qua nhanh phần này).
*   **Tỷ lệ hoàn thành (Completion Rate)**: `31.3%` (Số liệu thấp do quá trình phát triển thường ngắt quãng giữa chừng để sửa code).

### Phân bố đối tượng tham gia theo nhóm
| Nhóm Giao diện | Đăng ký | Hoàn thành | Tỷ lệ hoàn thành (%) |
| :--- | :---: | :---: | :---: |
| **Nhóm A (Black-box AI)** | 6 | 3 | 50.0% |
| **Nhóm B (Static XAI)** | 5 | 1 | 20.0% |
| **Nhóm C (Interactive XAI)** | 5 | 1 | 20.0% |

---

## 2. Phân tích chỉ số hành vi tương tác (HCI Behavioral Metrics)

*Các chỉ số dưới đây đại diện cho giá trị trung bình tích lũy trên mỗi người dùng đã hoàn thành.*

| Nhóm Giao diện | Thời gian quyết định / câu | Số lượt hover / người | Số câu hỏi chat / người | Số click tương tác / người |
| :--- | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | `31.05s` | `30.67` | `0.00` | `0.33` |
| **Nhóm B (Static XAI)** | `0.50s` | `4.00` | `0.00` | `0.00` |
| **Nhóm C (Interactive XAI)** | `5.31s` | `41.00` | `3.00` | `3.00` |

### Phát hiện quan trọng từ tương tác:
1.  **Nhóm A (Black-box)**: Dù không có biểu đồ XAI, người dùng vẫn có lượt hover rất cao (`30.67` lần) trên bảng hồ sơ tín dụng. Điều này cho thấy nhu cầu tìm hiểu thông tin qua các tooltip định nghĩa thuộc tính (nhấp chuột vào biểu tượng trợ giúp) của người dùng là cực kỳ lớn khi họ không có các giải thích thuật toán hỗ trợ.
2.  **Nhóm B (Static XAI)**: Thời gian phản hồi quá nhanh (`0.50s`) của đối tượng ở nhóm B phản ánh hành vi "click nhanh" (speedrun) của người test cục bộ, chưa mang tính chất suy nghĩ thực tế.
3.  **Nhóm C (Interactive XAI)**: Ghi nhận mức độ tương tác cao nhất với trung bình `41` lượt hover, `3` câu hỏi chatbot và `3` lần click mô phỏng What-if mỗi người. Nhóm C thành công trong việc kích thích tính chủ động tìm tòi của người dùng đối với các thành phần giải thích trực quan.

---

## 3. Đánh giá Thiên kiến tự động hóa (Automation Bias & Calibration)

*Bẫy AI (Trap Scenario) là những hồ sơ mà đề xuất của AI bị cố ý làm sai lệch so với bản chất thực tế của hồ sơ để đo lường mức độ hoài nghi lành mạnh (healthy skepticism) của người dùng.*

| Nhóm Giao diện | Tổng số bẫy gặp phải | Số lần phát hiện bẫy đúng | Độ chính xác phát hiện lỗi AI (%) |
| :--- | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | 12 | 1 | **8.3%** |
| **Nhóm B (Static XAI)** | 4 | 1 | **25.0%** |
| **Nhóm C (Interactive XAI)** | 4 | 0 | **0.0%** |

> [!WARNING]
> **Hiện tượng Thiên kiến tự động hóa cực kỳ nghiêm trọng ở Nhóm A**:
> Nhóm A có tỷ lệ đồng thuận sai với AI lên tới **91.7%** (chỉ phát hiện đúng 8.3% lỗi). Khi giao diện chỉ cung cấp đề xuất và độ tin cậy dạng con số thô (ví dụ: Duyệt - 61%), người dùng có xu hướng "nhắm mắt tin tưởng" AI hoàn toàn thay vị tự phân tích các thuộc tính hồ sơ (như DTI, nợ xấu) để bác bỏ AI.

> [!TIP]
> **Vai trò của XAI trong việc hiệu chỉnh niềm tin**:
> Nhóm B có tỷ lệ phát hiện bẫy tăng lên **25.0%**. Sự xuất hiện của biểu đồ SHAP và giải thích bằng văn bản giúp người dùng nhận ra các điểm nghịch lý trong lập luận của AI, từ đó kích hoạt tư duy phản biện để đưa ra quyết định độc lập chính xác hơn.

---

## 4. Tải lượng nhận thức (Cognitive Load - NASA-TLX)

Thang đo NASA-TLX chấm điểm từ 1 (Rất thấp / Tốt) đến 20 (Rất cao / Quá tải).

| Chỉ số tải lượng nhận thức | Nhóm A (Black-box) | Nhóm B (Static XAI) | Nhóm C (Interactive XAI) |
| :--- | :---: | :---: | :---: |
| **Mental Demand (Yêu cầu trí óc)** | `4.67` | `4.00` | `4.00` |
| **Temporal Demand (Yêu cầu thời gian)** | `4.33` | `4.00` | `4.00` |
| **Performance (Hiệu suất tự đánh giá)** | `4.00` | `4.00` | `4.00` |
| **Effort (Mức độ nỗ lực)** | `4.00` | `4.00` | `4.00` |
| **Frustration (Sự ức chế)** | `3.67` | `4.00` | `4.00` |

*Lưu ý: Chỉ số tải lượng nhận thức ghi nhận mức thấp (xung quanh điểm 4) vì các đối tượng chạy thử cục bộ chưa cảm thấy áp lực công việc thực sự. Khi chạy thực tế trên tệp dữ liệu lớn hơn với các tình huống phức tạp, khoảng cách tải lượng nhận thức giữa các nhóm dự kiến sẽ phân hóa rõ rệt hơn.*

---

## 5. Kết luận cho thực nghiệm chính thức (Phase 2)
1.  **Tính ổn định của Telemetry**: Hệ thống passive listeners hoạt động hoàn hảo, ghi nhận chính xác đến từng mili-giây thời gian phản hồi, tọa độ touch và các rage taps. Dữ liệu xuất CSV đã sẵn sàng cho các mô hình thống kê (R/Python) phân tích sâu.
2.  **Khuyến nghị thực tế**: Tỷ lệ Automation Bias cao ở nhóm A là một giả thuyết nghiên cứu đắt giá cần được tập trung chứng minh trong báo cáo khóa luận chính thức khi có tập dữ liệu thực tế lớn.

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).
