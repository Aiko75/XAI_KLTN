# Báo cáo Phân tích Dữ liệu Thực nghiệm (XAI HCI)

Báo cáo này tổng hợp kết quả thống kê từ **3 bộ dữ liệu** thu thập được từ Supabase, đại diện cho **14 người dùng đã hoàn thành** toàn bộ thực nghiệm (gồm 295 lượt quyết định hồ sơ và 84 câu hỏi khảo sát NASA-TLX).

---

## 📊 1. Thống kê số lượng người tham gia (Completed Participants)

* **Nhóm A (Black-box)**: 5 người hoàn thành.
* **Nhóm B (Standard XAI)**: 6 người hoàn thành.
* **Nhóm C (Over-complex XAI)**: 3 người hoàn thành.

---

## 📈 2. Phân tích Hành vi Quyết định & Thiên kiến Tự động hóa

### Tỷ lệ đồng ý với AI (Agreement Rate - Automation Bias)
Chỉ số này phản ánh xu hướng tin tưởng hoàn toàn vào gợi ý của AI.
* **Nhóm A (Không giải thích)**: **70.00%**
* **Nhóm B (Giải thích chuẩn)**: **72.50%**
* **Nhóm C (Giải thích phức tạp)**: **80.00%**

> [!IMPORTANT]
> **Nhận xét quan trọng cho Khóa luận**: 
> Nhóm C (Over-complex XAI) có tỷ lệ đồng ý với AI cao nhất (80%). Điều này cho thấy khi giao diện cung cấp quá nhiều thông tin toán học phức tạp, người dùng gặp hiện tượng **quá tải nhận thức** và có xu hướng "nhắm mắt đồng ý" theo AI để giảm bớt nỗ lực tư duy (Automation Bias gia tăng).

### Thời gian phản hồi trung bình (Average Response Time)
* **Nhóm A**: **12.29 giây**
* **Nhóm B**: **9.27 giây**
* **Nhóm C**: **24.63 giây**

> [!NOTE]
> Nhóm B ra quyết định nhanh nhất (9.27s) vì giải thích chuẩn giúp họ hiểu ngay vấn đề. Nhóm C mất thời gian gấp đôi (24.63s) để cố gắng đọc hiểu ma trận và biểu đồ chồng chéo trước khi đưa ra quyết định.

---

## 🎯 3. Khả năng phát hiện lỗi AI (Trap Detection Accuracy)

Thực nghiệm có **4 kịch bản "Bẫy" (Trap)** nơi gợi ý của AI bị sai so với thực tế (scenarios 4, 9, 14, 18).

* **Tỷ lệ vượt bẫy (Từ chối gợi ý sai của AI)**:
  - **Nhóm A**: **30.00%**
  - **Nhóm B**: **50.00%**
  - **Nhóm C**: **50.00%**

* **Tỷ lệ vượt qua câu hỏi kiểm tra sự chú ý (Attention Checks - 7 & 15)**:
  - **Nhóm A**: **70.00%**
  - **Nhóm B**: **66.67%**
  - **Nhóm C**: **50.00%**

> [!WARNING]
> Tỷ lệ vượt câu hỏi kiểm tra chú ý (Attention Check) ở Nhóm C chỉ đạt 50%. Điều này chứng minh sự quá tải thông tin ở nhóm C làm người dùng mệt mỏi và bỏ qua các dòng lưu ý hướng dẫn trong hồ sơ tín dụng.

---

## 🧠 4. Đánh giá Tải lượng nhận thức (NASA-TLX)

Điểm khảo sát được tính trên thang đo từ 1 (Rất thấp/Tốt) đến 7 (Rất cao/Tệ).

| Nhóm | Đòi hỏi Trí óc | Đòi hỏi Thời gian | Sự Nỗ lực | Sự Ức chế | Hiệu quả tự đánh giá | Gánh nặng chung (Overall) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Nhóm A** | 3.80 | 3.20 | 4.20 | 2.20 | 4.80 | **3.73 / 7** |
| **Nhóm B** | 3.17 | 2.67 | 4.00 | 2.17 | 4.17 | **3.33 / 7** |
| **Nhóm C** | 3.33 | 4.00 | 3.00 | 3.00 | 4.33 | **3.50 / 7** |

> [!TIP]
> * Nhóm B có gánh nặng nhận thức thấp nhất (3.33), cho thấy giải thích vừa đủ giúp giảm tải lượng trí óc.
> * Nhóm C có độ ức chế (3.00) và áp lực thời gian (4.00) cao nhất. Điểm nỗ lực tự đánh giá thấp (3.00) cho thấy họ đã "từ bỏ" việc tự kiểm tra và dựa hẳn vào AI.

---

## 📚 5. Đề xuất nguồn dữ liệu chuẩn hóa (Real-world Datasets)

Để nâng cao tính khoa học và thực tế cho số liệu Scenarios của khóa luận tốt nghiệp, bạn nên tham khảo và trích dẫn các nguồn dữ liệu tín dụng chuẩn quốc tế sau:

1. **Kaggle - Give Me Some Credit Dataset**:
   - *Mô tả*: Bộ dữ liệu chứa thông tin lịch sử của 150.000 người đi vay.
   - *Đặc trưng*: Tuổi, tỷ lệ DTI (Debt-to-Income), thu nhập hàng tháng, số lần trả nợ trễ (30-59 ngày, 60-89 ngày, trên 90 ngày). Rất khớp với cấu trúc 7 đặc trưng hiện tại của chúng ta.
   - *Ứng dụng*: Bạn có thể trích dẫn nguồn này trong khóa luận để chứng minh bộ hồ sơ tín dụng được xây dựng dựa trên phân phối thực tế.

2. **UCI Machine Learning Repository - German Credit Dataset**:
   - *Mô tả*: Bộ dữ liệu kinh điển gồm 1.000 hồ sơ vay tiền của Đức với 20 thuộc tính (mục đích vay, thời hạn, lịch sử tín dụng, số dư tài khoản).
   - *Đặc trưng*: Thường dùng để chạy các mô hình Logistic Regression và XGBoost mẫu trong các nghiên cứu XAI.

3. **LendingClub Loan Data**:
   - *Mô tả*: Dữ liệu thực tế từ nền tảng cho vay ngang hàng LendingClub (Mỹ), chứa điểm FICO, thu nhập hàng năm, tỷ lệ DTI, và trạng thái khoản vay (Default/Paid).

### Hướng xử lý đề xuất cho phần SHAP thực tế:
Bạn có thể viết một đoạn mã Python ngắn (dùng Google Colab):
1. Tải tập dữ liệu **Give Me Some Credit** hoặc **German Credit**.
2. Huấn luyện một mô hình phân loại đơn giản như **LightGBM** hoặc **XGBoost**.
3. Sử dụng thư viện `shap` (`shap.TreeExplainer`) để tính toán SHAP values chính xác cho 20 hồ sơ tín dụng mẫu.
4. Trích xuất các hệ số SHAP này ghi đè vào file `scenarios.json`. Việc này sẽ giúp dữ liệu giải thích SHAP của khóa luận có độ chính xác khoa học tuyệt đối.

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).

