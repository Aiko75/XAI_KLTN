# PHƯƠNG PHÁP NGHIÊN CỨU & THIẾT KẾ PHÂN TÍCH THỐNG KÊ THỰC NGHIỆM GIAI ĐOẠN 2
*(Research Methodology & Statistical Analysis Design for Phase 2)*

> [!NOTE]
> Tài liệu này thiết lập khung lý thuyết, các biến thực nghiệm, giả thuyết khoa học và phương pháp phân tích thống kê nâng cao (đặc biệt là GEE và GLMM cho dữ liệu đo lặp lại) nhằm phục vụ chương **Phương pháp nghiên cứu** trong khóa luận tốt nghiệp.

---

## 1. Khung Biến số Thực nghiệm (Variable Framework)

Thực nghiệm đo lường tương tác người - máy (HCI) được thiết kế dưới dạng **Thiết kế so sánh giữa các nhóm đối tượng (Between-Subjects Design)** kết hợp với **Đo lường lặp lại (Repeated Measures)** trên 20 kịch bản tín dụng.

### 1.1. Biến Độc lập (Independent Variables - IVs)
1.  **Kiểu Giao diện XAI (XAI Interface Type)** - *Biến giữa các nhóm (Between-Subjects IV)*: Gồm 3 mức độ (Nhóm A: Black-box AI, Nhóm B: Static XAI, Nhóm C: Interactive XAI).
2.  **Tính chính xác của Đề xuất AI (AI Accuracy)** - *Biến trong cùng nhóm (Within-Subjects IV)*: Gồm 2 mức độ (Hồ sơ chuẩn - AI đúng, Hồ sơ bẫy - AI sai).

### 1.2. Biến Phụ thuộc (Dependent Variables - DVs)
1.  **Quyết định thẩm định của Người dùng (User Decision Correctness)** - *Biến nhị phân (Binary DV)*: 
    *   `1`: Quyết định đúng nghiệp vụ thực tế (Ví dụ: Bác bỏ khi hồ sơ xấu dù AI đề xuất duyệt).
    *   `0`: Quyết định sai nghiệp vụ thực tế (Đồng thuận mù quáng với AI sai hoặc bác bỏ nhầm AI đúng).
2.  **Thời gian ra quyết định (Decision Time / Response Time)** - *Biến liên tục (Continuous DV)*: Đo bằng giây (s).
3.  **Tải lượng nhận thức NASA-TLX (Cognitive Workload)** - *Biến thứ bậc (Ordinal DV)*: Điểm số từ 1 - 20 trên 6 chiều kích thích nhận thức.

### 1.3. Biến Kiểm soát & Biến số phụ (Control Variables & Covariates - CVs)
1.  **Nhóm Nghề nghiệp / Lĩnh vực (Occupation Group)**: Chia làm hai khối lớn (STEM/Kỹ thuật vs. Kinh tế/Xã hội/Khác).
2.  **Thiết bị thực nghiệm (Device Type)**: Desktop vs. Mobile (Phát hiện từ pilot cho thấy 100% ca bỏ dở dùng Mobile).
3.  **Tần suất tiếp xúc công nghệ AI (AI Exposure)**: Hiếm khi, Thỉnh thoảng, Thường xuyên, Hàng ngày.
4.  **Thứ tự kịch bản (Scenario Order)**: Từ 1 đến 20 để kiểm soát hiệu ứng học tập (Learning Effect) hoặc mệt mỏi (Fatigue Effect).

---

## 2. Giả thuyết Nghiên cứu và Cơ sở Lý thuyết (Research Hypotheses)

Các giả thuyết được phát biểu dựa trên kết quả chạy thử nghiệm pilot ban đầu (đối tượng đơn lẻ) và hai lý thuyết nền tảng: **Thiên kiến tự động hóa (Automation Bias)** và **Hiệu chuẩn niềm tin (Trust Calibration)**.

### Giả thuyết H1: XAI cải thiện Khả năng hiệu chuẩn niềm tin và Giảm thiểu Thiên kiến tự động hóa
*   **Phát biểu Giả thuyết**: Người dùng ở nhóm B (Static XAI) và nhóm C (Interactive XAI) sẽ đạt tỷ lệ quyết định đúng trên các **Hồ sơ bẫy (Trap Scenarios)** cao hơn đáng kể so với nhóm A (Black-box). Đồng thời, nhóm B và C thể hiện mức độ tin cậy hiệu chuẩn tốt hơn (Calibrated Trust) - đồng thuận khi AI đúng và từ chối khi AI sai.
*   **Cơ sở lý thuyết**:
    *   *Automation Bias (Parasuraman & Manzey, 2010)*: Khi đối mặt với hệ thống tự động không có giải thích, con người rơi vào trạng thái lười nhận thức (cognitive miser), mặc định coi phán quyết của AI là chuẩn xác.
    *   *Trust Calibration (Muir, 1987)*: Giải thích SHAP và chatbot giúp người thẩm định hiểu được trọng số ra quyết định của mô hình AI, giúp họ nhìn thấy điểm phi logic của AI trong hồ sơ bẫy để kích hoạt tư duy phản biện.
*   **Cơ sở thực tế ban đầu**: Kết quả chạy pilot 1 người ban đầu ở Nhóm A cho thấy người dùng đồng thuận với phán quyết sai của AI ở hầu hết hồ sơ bẫy, phản ánh xu hướng phụ thuộc thụ động khi thiếu thông tin giải thích.

### Giả thuyết H2: XAI làm tăng Thời gian thẩm định do kích hoạt tư duy phân tích
*   **Phát biểu Giả thuyết**: Thời gian ra quyết định trung bình của nhóm B và C sẽ dài hơn nhóm A. Đồng thời, hiệu ứng tương tác (IV1 * IV2) sẽ xuất hiện: Khi gặp hồ sơ bẫy (AI sai), thời gian quyết định của nhóm B và C sẽ kéo dài ra nhiều hơn so với hồ sơ chuẩn, trong khi nhóm A không có sự biến thiên lớn về thời gian giữa hồ sơ bẫy và hồ sơ chuẩn.
*   **Cơ sở lý thuyết**:
    *   *Lý thuyết Hệ thống kép (Dual-Process Theory - Kahneman, 2011)*: Giao diện XAI đóng vai trò là tác nhân ngăn chặn tư duy nhanh (System 1 - trực giác, đồng ý luôn với AI) và kích hoạt tư duy chậm (System 2 - phân tích, đối chiếu số liệu và biểu đồ), dẫn đến tăng thời gian phản hồi.
*   **Cơ sở thực tế ban đầu**: Chạy thử nghiệm pilot ban đầu ghi nhận thời gian thẩm định của cá nhân có sự hỗ trợ của XAI kéo dài hơn hẳn so với người dùng không có XAI.

### Giả thuyết H3: Giải thích tương tác (Interactive XAI) tăng Tải nhận thức ngoại lai nhưng giảm Sự ức chế
*   **Phát biểu Giả thuyết**: Nhóm C (Interactive XAI) sẽ ghi nhận điểm tải lượng nhận thức NASA-TLX về mặt trí óc (Mental Demand) và thời gian (Temporal Demand) cao hơn nhóm B và A. Tuy nhiên, nhóm C sẽ đạt mức độ tự đánh giá hiệu suất (Performance) cao hơn và mức độ thất vọng/ức chế (Frustration) thấp hơn nhờ có Chatbot hỗ trợ giải thích theo ngữ cảnh.
*   **Cơ sở lý thuyết**:
    *   *Cognitive Load Theory (Sweller, 1988)*: Việc cung cấp đồng thời nhiều cấu phần XAI tương tác (Force plot, Chatbot, Sliders) gây ra **Hiệu ứng phân tán sự chú ý (Split-Attention Effect)**, làm tăng tải lượng nhận thức ngoại lai (extraneous cognitive load). Tuy nhiên, chatbot đối thoại giúp cá nhân hóa thông tin, giảm bớt sự mơ hồ nhận thức của người dùng.

---

## 3. Phương pháp Phân tích Thống kê cho Dữ liệu Đo lặp lại (Statistical Methods)

### 3.1. Bản chất Dữ liệu đo lặp lại dạng cụm (Repeated Measures & Clustered Data)
Mỗi đối tượng thực nghiệm tham gia đánh giá **20 kịch bản liên tiếp**. Do đó, 20 bản ghi phản hồi của cùng một người dùng sẽ tương quan chặt chẽ với nhau (Within-subject correlation) do chịu ảnh hưởng bởi tính cách, tốc độ đọc và khả năng cá nhân của người đó. 

Nếu sử dụng các mô hình hồi quy OLS hoặc Logistic thông thường, ta sẽ vi phạm nghiêm trọng giả định về **Tính độc lập của các sai số quan trắc (Independence of observations)**, dẫn đến sai số chuẩn (Standard Errors) bị ước lượng chệch, làm sai lệch kết quả kiểm định mức ý nghĩa ($p$-value).

Để xử lý dữ liệu đo lặp lại này, hai phương pháp thống kê nâng cao dưới đây sẽ được áp dụng:

### 3.2. Phương trình Ước lượng Tổng quát (Generalized Estimating Equations - GEE)
GEE là phương pháp bán tham số được thiết kế đặc trị cho dữ liệu dạng cụm/đo lặp lại. GEE kiểm soát sự tương quan trong cùng một đối tượng bằng cách thiết lập một **Ma trận tương quan công tác (Working Correlation Matrix)**.

*   **Lựa chọn ma trận tương quan**: Sử dụng cấu trúc **Tự hồi quy bậc 1 (Autoregressive - AR(1))** hoặc **Không cấu trúc (Unstructured)** để mô tả việc các quyết định ở các câu gần nhau có độ tương quan cao hơn các câu xa nhau.
*   **Đặc tả mô hình GEE cho Quyết định người dùng (Biến nhị phân - Link: Logit)**:
    $$\text{logit}(P(Y_{ij} = 1)) = \beta_0 + \beta_1 (\text{XAI\_Group}_i) + \beta_2 (\text{AI\_Accuracy}_{ij}) + \beta_3 (\text{XAI\_Group}_i \times \text{AI\_Accuracy}_{ij}) + \beta_4 (\text{Device}_i) + \beta_5 (\text{Scenario\_Order}_{ij})$$
    Trong đó:
    *   $Y_{ij}$ là quyết định đúng/sai của người dùng $i$ tại tình huống $j$.
    *   $\beta_3$ là hệ số tương tác then chốt, kiểm chứng xem XAI có thực sự giúp tăng độ chính xác đặc biệt ở các ca bẫy (AI sai) hay không.
*   **Đặc tả mô hình GEE cho Thời gian quyết định (Biến liên tục - Link: Identity)**:
    Sử dụng mô hình GEE tuyến tính với biến phụ thuộc là thời gian phản hồi (hoặc logarit của thời gian phản hồi để đưa về phân phối chuẩn).

### 3.3. Mô hình Hỗn hợp Tuyến tính Tổng quát (Generalized Linear Mixed-Effects Models - GLMM)
Trong khi GEE tập trung vào ước lượng tác động trung bình của tổng thể (Population-averaged effects), GLMM cho phép phân tích tác động đặc trưng cho từng đối tượng (Subject-specific effects) bằng cách đưa vào mô hình các **Tác động ngẫu nhiên (Random Effects)**.

*   **Tác động cố định (Fixed Effects)**: Các biến độc lập chính (XAI Group, AI Accuracy, Tương tác Group * Accuracy) và các biến kiểm soát (Nghề nghiệp, Thiết bị, AI Exposure).
*   **Tác động ngẫu nhiên (Random Effects)**:
    *   `Random intercept` cho từng đối tượng (`(1 | User_ID)`): Kiểm soát sự biến thiên về tốc độ ra quyết định và mức độ tỉnh táo nền tảng của mỗi cá nhân.
    *   `Random intercept` cho từng kịch bản (`(1 | Scenario_ID)`): Kiểm soát độ khó/dễ khác nhau của từng kịch bản cụ thể.
*   **Cách thức thực hiện**: Chạy mô hình trên R sử dụng thư viện `lme4` (hàm `glmer` cho biến nhị phân và `lmer` cho biến liên tục).

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).
