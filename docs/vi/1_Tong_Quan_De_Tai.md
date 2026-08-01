# Báo cáo 1: Tổng Quan Đề Tài Nghiên Cứu & Đề Cương Thực Nghiệm

**Đề tài**: Nghiên cứu, xây dựng hệ thống hỗ trợ ra quyết định tích hợp Trí tuệ nhân tạo có thể giải thích (XAI) và đánh giá tác động đến Thiên kiến tự động hóa.
**Tên tiếng Anh**: *Investigating the Effects of Explainable AI (XAI) Interfaces on Alleviating Automation Bias in Human Decision-Making.*
**Định hướng ứng dụng**: Hệ thống Đánh giá & Duyệt Tín dụng Ngân hàng (Credit Risk Assessment System).

---

## 1. Tính cấp thiết & Đặt vấn đề
Trong kỷ nguyên số, các hệ thống hỗ trợ ra quyết định dựa trên trí tuệ nhân tạo (AI Decision Support Systems - DSS) ngày càng được ứng dụng sâu rộng trong các lĩnh vực có độ rủi ro cao như tài chính (đặc biệt là duyệt tín dụng), y tế và tư pháp. Tuy nhiên, việc áp dụng các mô hình học máy dạng "Hộp đen" (Black-box AI) vốn có độ chính xác cao nhưng thiếu tính minh bạch đang đặt ra một thách thức tâm lý - hành vi nghiêm trọng: **Thiên kiến tự động hóa (Automation Bias)**.

Thiên kiến tự động hóa xảy ra khi con người có xu hướng tin tưởng một cách thụ động và thiếu căn cứ vào các đề xuất của hệ thống tự động, dẫn đến hai trạng thái lỗi:
*   **Lỗi bỏ sót (Omission Errors)**: Người dùng bỏ qua các dấu hiệu cảnh báo nghiệp vụ rõ ràng vì hệ thống không đưa ra cảnh báo.
*   **Lỗi thực hiện sai (Commission Errors)**: Người dùng mù quáng làm theo phán quyết sai lầm của AI (đặc biệt là trong các hồ sơ gài bẫy - adversarial cases).

Để khắc phục rủi ro này, **Trí tuệ nhân tạo có thể giải thích (Explainable AI - XAI)** được đề xuất như một giải pháp để minh bạch hóa cơ chế dự báo của mô hình. Tuy nhiên, việc thiết kế giao diện XAI vẫn đối mặt với bài toán cân bằng:
1.  **Quá tải nhận thức (Cognitive Load)**: Giao diện XAI quá phức tạp sẽ làm người dùng mệt mỏi và có xu hướng tin tưởng mù quáng để tiết kiệm thời gian.
2.  **Niềm tin hiệu chuẩn (Calibrated Trust)**: Làm thế nào giúp người dùng phân biệt được khi nào mô hình AI đúng để làm theo, và khi nào mô hình AI sai để bác bỏ.

---

## 2. Mục tiêu nghiên cứu
Đề tài tập trung giải quyết hai mục tiêu cốt lõi:
1.  **Phát triển hệ thống thực nghiệm**: Xây dựng ứng dụng Web mô phỏng quy trình thẩm định tín dụng cá nhân của ngân hàng. Hệ thống tích hợp mô hình học máy Random Forest và các kỹ thuật XAI (SHAP, văn bản giải thích tự nhiên, chatbot đối thoại).
2.  **Đo lường hành vi tương tác Người - Máy (HCI Study)**: Tổ chức thực nghiệm theo mô hình so sánh giữa các nhóm đối tượng (Between-Subjects Design) để đo lường định lượng tác động của các kiểu giao diện XAI lên:
    *   Mức độ thiên kiến tự động hóa (khả năng phát hiện lỗi bẫy của AI).
    *   Thời gian ra quyết định (Decision Time).
    *   Gánh nặng nhận thức của người thẩm định (thang đo chuẩn hóa NASA-TLX).

---

## 3. Kiến trúc hệ thống & Thiết kế giao diện thử nghiệm
Thực nghiệm phân chia người dùng ngẫu nhiên vào một trong 3 nhóm giao diện tương ứng với mức độ giải thích tăng dần:

### 3.1. Nhóm A - Black-box AI (Nhóm Đối chứng)
*   **Đặc điểm**: Chỉ hiển thị phán quyết gợi ý của AI (DUYỆT/TỪ CHỐI) kèm theo độ tin cậy của mô hình (ví dụ: Độ tin cậy: 78%).
*   **Mục đích**: Đo lường hành vi thẩm định truyền thống khi không có bất kỳ thông tin giải thích bổ sung nào từ AI.

### 3.2. Nhóm B - Visual XAI (Nhóm thực nghiệm 1)
*   **Đặc điểm**: Bổ sung thêm giải thích trực quan:
    *   Đoạn văn giải thích ngôn ngữ tự nhiên, mạch lạc, chỉ rõ các thuộc tính đóng góp chính và đi tới kết luận phê duyệt.
    *   Biểu đồ cột phân rã đóng góp SHAP (SHAP Bar Chart) phân màu xanh (+) thể hiện nhân tố thúc đẩy duyệt, màu đỏ (-) thể hiện nhân tố kéo giảm điểm.
*   **Mục đích**: Kiểm tra xem giao diện trực quan hóa SHAP cơ bản có giúp cải thiện khả năng phát hiện lỗi của AI hay không.

### 3.3. Nhóm C - Interactive & Contextual XAI (Nhóm thực nghiệm 2)
*   **Đặc điểm**: Giao diện Dashboard phân tích tối đa với các tính năng:
    *   **SHAP Force Plot**: Trực quan hóa lực đẩy toán học chi tiết của các thuộc tính từ mốc cơ sở (Base Value) đến giá trị dự báo thực tế.
    *   **Trợ lý Gemini AI Chatbot**: Người dùng có thể đối thoại tự do với AI hoặc click vào các câu hỏi gợi ý nghiệp vụ để AI biện hộ quyết định.
    *   **Chú giải Nghiệp vụ (Domain Tooltips)**: Cho phép người thẩm định tra cứu nhanh định nghĩa và quy tắc quản trị rủi ro khi hover chuột vào các trường dữ liệu.
    *   **Toán học chi tiết & Ma trận tương quan**: Trình bày công thức Sigmoid, Logit và ma trận hệ số tương quan Pearson 7x7 cùng các chỉ số thuật toán phục vụ chuyên gia kiểm thử.
*   **Mục đích**: Đo lường tác động của các tính năng giải thích tương tác cao cấp đối với gánh nặng nhận thức và hiệu chuẩn niềm tin của người dùng.

---

## 4. Thiết kế kịch bản thực nghiệm (Scenario Design)
Hệ thống sử dụng bộ dữ liệu gồm **20 kịch bản hồ sơ tín dụng** được chọn lọc khoa học để loại bỏ bias chuỗi và đan xen ngẫu nhiên giữa DUYỆT và TỪ CHỐI (với random seed cố định):
1.  **14 Hồ sơ chuẩn mực (Normal Cases)**: AI đưa ra phán quyết chính xác dựa trên luật nghiệp vụ thực tế, đóng vai trò xây dựng niềm tin nền tảng ổn định cho người dùng.
2.  **4 Hồ sơ gài bẫy (Trap/Adversarial Cases)**: AI đưa ra đề xuất sai lệch nghiêm trọng so với thực tế nghiệp vụ (ví dụ: Khách hàng có 4 lần nợ xấu nghiêm trọng nhóm 3-4 nhưng AI vẫn đề xuất DUYỆT VAY với độ tin cậy 85% do thu nhập cao). Đây là chỉ số then chốt để đo lường xem người thẩm định có phản biện và phát hiện ra lỗi của AI hay không.
3.  **2 Hồ sơ kiểm tra độ tập trung (Attention Checks)**: Các kịch bản yêu cầu người dùng chọn một đáp án cố định theo chỉ dẫn ghi sẵn để loại bỏ các dữ liệu khảo sát bấm bừa (spam).

---

## 5. Các chỉ số đo lường thực nghiệm (Dependent Variables)
*   **Tỷ lệ phát hiện lỗi (Accuracy on Trap Cases)**: Tỷ lệ phần trăm người dùng phát hiện ra AI sai ở các hồ sơ bẫy và chọn quyết định ngược lại với đề xuất của AI.
*   **Thời gian ra quyết định (Decision Time)**: Đo lường chi tiết thời gian (giây) xử lý từng kịch bản để phân tích gánh nặng nhận thức.
*   **Chỉ số tải nhận thức NASA-TLX**: Bản khảo sát 6 chiều (Đòi hỏi trí óc, áp lực thời gian, hiệu suất tự đánh giá, mức độ nỗ lực, mức độ thất vọng, đòi hỏi thể chất) thực hiện ở cuối buổi kiểm thử.
*   **Dữ liệu lưu vết hành vi (HCI Interactive Logs)**: Lưu vết số lần và vị trí di chuột (hover), thời gian đọc tài liệu hướng dẫn, và lịch sử câu hỏi chat với chatbot AI để phân tích sâu thói quen khai thác thông tin của người thẩm định.
