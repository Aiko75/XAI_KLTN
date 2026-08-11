# Báo cáo 5: Các Phát Hiện Mới Về Hành Vi HCI & Tính Chất Mô Hình AI (Phase 2.0)

Báo cáo này tài liệu hóa các phát hiện kỹ thuật và hành vi nhận thức mới được rút ra từ việc nâng cấp hệ thống Phase 2.0, bao gồm quy trình kiểm thử sơ bộ với các tính năng mới: So sánh đa mô hình, Thu thập phân khúc người dùng, và Trình giả lập Phản thực tế (What-If Simulator).

---

## 1. Phát hiện 1: Hiện tượng Ranh giới quyết định phi đơn điệu (Non-Monotonic Decision Boundaries) của AI
Khi vận hành trình giả lập What-If để thay đổi các thuộc tính tài chính đầu vào của khách hàng trong thời gian thực, nhóm nghiên cứu đã phát hiện một đặc tính hành vi bất thường nhưng phản ánh chính xác bản chất của AI:

*   **Hiện tượng**: Khi tăng dần Điểm tín dụng (Credit Score) từ 600 lên 850 (các biến khác giữ nguyên), phán quyết của AI không thay đổi tuyến tính mà nhảy vọt: **DUYỆT (600đ) $\rightarrow$ TỪ CHỐI (680đ) $\rightarrow$ DUYỆT (750đ)**.
*   **Giải thích kỹ thuật**:
    *   Mô hình Random Forest/XGBoost phân tách không gian đặc trưng đa chiều thành các khối hộp vuông góc (axis-aligned hyper-rectangles) dựa trên các ngưỡng cắt nhị phân của các cây quyết định độc lập.
    *   Thuật toán không tự động nhận thức được các quy tắc logic đơn điệu trong đời thực (ví dụ: điểm tín dụng cao hơn hoặc thu nhập cao hơn thì rủi ro luôn luôn thấp hơn).
    *   Ở mức 680 điểm, hồ sơ khách hàng rơi vào một phân vùng dữ liệu huấn luyện cụ thể kết hợp với các biến số khác (ví dụ: khoản vay lớn hơn 450 triệu VND) mà tại đó lịch sử dữ liệu của ngân hàng có tỷ lệ nợ xấu cao, khiến mô hình đưa ra phán quyết "Từ chối". Trong khi ở mức 600 điểm, hồ sơ lại rơi vào phân nhánh của các cây quyết định khác áp dụng các điều kiện nới lỏng hơn (ví dụ: lịch sử phá sản bằng 0).
*   **Đề xuất học thuật cho Luận văn**:
    *   **Giá trị của What-If Simulator**: Hiện tượng này nhấn mạnh tính cấp thiết của các công cụ XAI tương tác. Nếu không có giả lập What-If, người dùng (chuyên viên thẩm định) sẽ bị mắc kẹt trong "Thiên kiến tự động hóa" (Automation Bias) và tin tưởng mù quáng vào quyết định tĩnh của AI mà không nhận ra các điểm kỳ dị phi logic này của mô hình.
    *   **Giải pháp Ràng buộc đơn điệu (Monotonic Constraints)**: Khóa luận đề xuất cải tiến thuật toán bằng cách áp dụng ràng buộc đơn điệu trong quá trình huấn luyện mô hình (ép buộc hàm mục tiêu có đạo hàm không âm đối với các biến thuận như Credit Score, Income). Điều này giúp AI tuân thủ các quy tắc quản trị rủi ro nghiêm ngặt của ngân hàng thương mại.

---

## 2. Phát hiện 2: Phân khúc người dùng đa chiều, độ tuổi và thiết bị thực nghiệm
Việc tích hợp bộ câu hỏi phân khúc người dùng nâng cao (Chuyên ngành học, Tần suất sử dụng AI, Nhóm tuổi) và tự động nhận diện Thiết bị (Device Type) đã hé lộ các xu hướng hành vi sơ bộ:

*   **Hiểu biết công nghệ vs. Sự hoài nghi thuật toán (Algorithm Skepticism)**:
    *   Nhóm người dùng chuyên ngành **CNTT / Khoa học Máy tính** có xu hướng tương tác nhiều hơn với trình giả lập What-If và Chatbot Gemini (số lượng hover và nhấn nút cao hơn 40% so với trung bình). Họ chủ động thử nghiệm các kịch bản cực đoan để kiểm tra giới hạn của AI.
    *   Nhóm CNTT ghi nhận tỷ lệ đồng ý với AI thấp hơn (hoài nghi cao hơn), giúp họ tránh được bẫy thiên kiến tự động hóa tốt hơn.
*   **Tần suất dùng AI và Tốc độ xử lý thông tin giải thích**:
    *   Những người dùng sử dụng công cụ AI **Hàng ngày / Thường xuyên** có tốc độ đọc hiểu các biểu đồ SHAP và Force Plot nhanh hơn đáng kể. Thời gian ra quyết định trung bình của họ ở nhóm C thấp hơn 15% so với nhóm người dùng ít tiếp xúc với AI, chứng minh sự tồn tại của kỹ năng "Fluency in AI Interaction" (Độ trôi chảy khi tương tác với AI).
*   **Ảnh hưởng thế hệ (Age Group) và Hành vi ra quyết định**:
    *   Nhóm tuổi trẻ **18-22 (Sinh viên)** và **23-30 (Người đi làm trẻ)** có xu hướng tin tưởng biểu đồ SHAP Force Plot trực quan và sẵn lòng dùng thử tính năng What-If để hiểu bản chất của AI. Trong khi nhóm trung niên **> 45** có xu hướng đọc kỹ hồ sơ vay gốc nhiều hơn và ra quyết định thận trọng, ít bị dao động bởi đề xuất AI.
*   **Kiểm soát nhiễu thiết bị di động (Mobile Device Control)**:
    *   Việc tự động phát hiện người dùng Mobile/Tablet và hiển thị banner cảnh báo giúp cải thiện chất lượng mẫu (khuyến khích họ dùng máy tính). Đối với các mẫu thực hiện trên mobile, hạ tầng tracking thu thập tọa độ chạm, thời gian giữ chạm (touch duration) giúp thay thế hoàn hảo cho hành vi Hover chuột trên desktop để tính toán thời gian phân vân.

---

## 3. Phát hiện 3: Hiệu ứng phân tán sự chú ý (Split-Attention Effect) và Quá tải nhận thức
Việc bổ dung thêm bảng giả lập What-If bên cạnh biểu đồ Force Plot, Bar Chart, và Chatbot trong Giao diện Nhóm C mang lại một phát hiện HCI quan trọng:

*   **Hiện tượng**: Tỷ lệ vượt qua câu hỏi kiểm tra sự chú ý (Attention Checks) ở Nhóm C trong đợt thử nghiệm sơ bộ chỉ đạt **50%** (so với 70% của Nhóm A không giải thích).
*   **Phân tích HCI**:
    *   Hiện tượng này minh họa cho **Hiệu ứng phân tán sự chú ý (Split-Attention Effect)** trong lý thuyết Tải lượng nhận thức (Cognitive Load Theory).
    *   Khi giao diện cung cấp quá nhiều tính năng giải thích mạnh mẽ cùng một lúc, sự chú ý của người dùng bị phân mảnh liên tục giữa các vùng thông tin. Người dùng phải liên tục đối chiếu thông số hồ sơ gốc, biểu đồ SHAP, câu trả lời chatbot, và các thanh trượt giả lập.
    *   Sự cạn kiệt tài nguyên chú ý dẫn đến trạng thái mệt mỏi tinh thần, khiến họ dễ bỏ qua các chi tiết bất thường cố ý gài vào hồ sơ (trap/adversarial cases).
*   **Triết lý thiết kế XAI đề xuất**: 
    Khóa luận khẳng định thiết kế giải thích AI cần tuân theo triết lý **"Less is More"**. Giải thích không nên là sự nhồi nhét thông tin phức tạp, mà nên được thiết kế dưới dạng phân cấp hiển thị (progressive disclosure) - chỉ kích hoạt What-If hoặc Chatbot khi người dùng yêu cầu hoặc khi mô hình phát hiện sự không chắc chắn (low confidence).

---

## 4. Phát hiện 4: Hạn chế về Thiết kế Giao diện Thực nghiệm & Điều chỉnh Quy mô Mẫu Giai đoạn 2

### Hạn chế 1: Sự mơ hồ trong Quy trình Tương tác Giao diện (Interface Ambiguity)
*   **Vấn đề**: Qua đợt chạy thử sơ bộ, nhóm nghiên cứu phát hiện giao diện thực nghiệm tồn tại một sự mơ hồ nhất định về mặt nhận thức (cognitive ambiguity). Người tham gia khảo sát không lập tức định hình được quy trình thẩm định tối ưu: họ nên nhìn vào đâu trước, phân tích những chỉ số nào, và đối chiếu ra sao để đưa ra quyết định.
*   **Thiết kế lý tưởng**: Thông tin khoản vay đề xuất (Loan details) và thông tin hồ sơ cá nhân của khách hàng (Customer credit profile) cần được phân chia thành hai khu vực trực quan tách biệt hoàn toàn. Giao diện nên nêu rõ chỉ dẫn: *"Người dùng cần thẩm định tính hợp lý của số tiền vay so với năng lực tài chính trước, sau đó đối chiếu với các chỉ số rủi ro của khách hàng làm căn cứ phê duyệt hoặc từ chối"*.
*   **Giải pháp ghi nhận**: Do hệ thống thực nghiệm hiện tại đã được phân phối diện rộng để thu thập số liệu thực tế nên không thể can thiệp chỉnh sửa mã nguồn giao diện để tránh làm sai lệch tính đồng nhất của mẫu. Yếu tố này được ghi nhận như một **Hạn chế về mặt Thiết kế Giao diện Thực nghiệm (Experimental UI Limitation)** trong Khóa luận và sẽ được đưa vào chương thảo luận để phân tích ảnh hưởng của sự mơ hồ này đến thời gian ra quyết định (Decision Time) và mức độ ức chế (Frustration) trên thang đo NASA-TLX.

### Hạn chế 2: Điều chỉnh Quy mô Mẫu Tối thiểu (Sample Size Threshold Adjustment)
*   **Vấn đề**: Mục tiêu ban đầu là thu thập dữ liệu từ 60-100 người dùng thực tế. Tuy nhiên, việc tiếp cận đối tượng tham gia gặp khó khăn do bài test gồm 20 tình huống chi tiết đòi hỏi thời gian tập trung cao độ (khoảng 15-20 phút), có thể ảnh hưởng đến tiến độ nộp bài (deadline).
*   **Giải pháp điều chỉnh**: Để đảm bảo tiến độ khóa luận và chất lượng dữ liệu thực tế thu được, **mục tiêu số lượng mẫu tối thiểu (mức sàn) được điều chỉnh xuống 40 người**. 
*   **Ý nghĩa thống kê**: Cỡ mẫu tối thiểu $N = 40$ (khoảng 13-15 người mỗi nhóm giao diện A, B, C) hoàn toàn đáp ứng yêu cầu kỹ thuật tối thiểu để thực hiện các kiểm định thống kê phi tham số (như Wilcoxon signed-rank test hoặc Kruskal-Wallis test) nhằm tìm ra sự khác biệt có ý nghĩa thống kê giữa các nhóm trong nghiên cứu HCI.

### Hạn chế 3: Sự Đồng nhất Nhân khẩu học về Độ tuổi (Demographic Homogeneity Limitation)
*   **Vấn đề**: Dữ liệu từ thực nghiệm ghi nhận hơn 90% đối tượng tham gia thuộc nhóm tuổi **18-22 (Độ tuổi sinh viên)** do khảo sát được chia sẻ chủ yếu trong mạng lưới sinh viên đại học. Điều này tạo nên sự đồng nhất quá lớn về mặt nhân khẩu học.
*   **Học thuật hóa**: Yếu tố này được ghi nhận như một **Hạn chế nhân khẩu học (Demographic Limitation)** rõ ràng trong phần Thảo luận (Discussion). Sinh viên có thể có khả năng thích nghi công nghệ nhanh hơn và xử lý các biểu đồ XAI trực quan tốt hơn so với nhóm dân số trung niên (> 45 tuổi) - những người có thể phụ thuộc hoặc hoài nghi thuật toán theo các chiều hướng khác. Do đó, kết quả nghiên cứu đại diện tốt nhất cho phân khúc người thẩm định trẻ tuổi và cần thận trọng khi tổng quát hóa (generalization) cho toàn bộ lực lượng lao động ngành ngân hàng.

### Hạn chế 4: Ánh xạ Ý nghĩa Nút bấm (Response-Mapping Ambiguity) & Phân tích Độ nhạy (Sensitivity Analysis)
*   **Vấn đề Ánh xạ (Response-Mapping Ambiguity)**: Giao diện thực nghiệm sử dụng hai nút *"Đồng ý với đề xuất của AI"* / *"Từ chối đề xuất của AI"* thay vì trực tiếp *"Duyệt vay"* / *"Từ chối vay"*. Có khả năng một số người tham gia hiểu nhầm ý nghĩa hai nút này như một quyết định thẩm định trực tiếp thay vì một phản hồi tương đối với đề xuất của AI, dẫn đến khả năng đảo ngược giá trị ghi nhận (Cognitive Inversion) so với ý định thật ở một số lượt trả lời không xác định được.
*   **Phân tích Độ nhạy (Sensitivity Analysis)**: 
    *   Vì thiết kế nhãn nút bấm được giữ nguyên nhất quán xuyên suốt cả ba nhóm giao diện (A, B, C), rủi ro sai số này mang tính chất **phân bố ngẫu nhiên không thiên lệch (non-differential measurement error)**.
    *   Theo lý thuyết thống kê thực nghiệm, sai số đo lường ngẫu nhiên không làm đảo ngược hướng của các giả thuyết nghiên cứu (hypothesized direction), mà chỉ làm giảm độ nhạy phát hiện khác biệt thực tế giữa các nhóm (**attenuation bias toward the null** / đánh giá thấp effect size). 
    *   Do đó, ngay cả khi giả định có $X\%$ lượt trả lời bị đảo ngược ngẫu nhiên, xu hướng tác động cốt lõi của XAI (giúp giảm Automation Bias) vẫn được duy trì đúng hướng.
*   **Giải pháp Kiểm chứng Định lượng Chủ động (Proactive Comprehension Check)**:
    *   Để biến một "hạn chế định tính không xác định" thành một "hạn chế có số liệu định lượng kiểm chứng đi kèm", nghiên cứu đã chèn thêm một **Câu hỏi kiểm tra sự hiểu (Comprehension Check)** trực tiếp ở cuối 20 kịch bản (ngay trước thang đo NASA-TLX) cho các đối tượng tham gia tiếp theo.
    *   Câu hỏi này thu thập con số tỷ lệ phần trăm ($X\%$) hiểu nhầm thực tế trong mẫu, cung cấp bằng chứng định lượng chính xác để báo cáo trước Hội đồng bảo vệ luận văn.


---

## 5. Phát hiện 5: Cơ chế Lọc Dữ liệu 5 Tầng và Kỹ thuật Tuyển mẫu Không đều (Oversampling Group C)

### 5.1. Thuật toán Lọc Dữ liệu 5 Tầng (5-Tier Data Filtering Algorithm)
Nhằm loại bỏ triệt để hiện tượng sụp đổ nhận thức (Collapse Point) và làm ẩu, dữ liệu được xử lý qua 5 tầng nghiêm ngặt:
1.  **Tầng 1 (Ngưỡng thời gian theo Giao diện)**: Thiết lập thời gian đọc tối thiểu dựa trên độ phức tạp thị giác: Nhóm A >= 2.0s, Nhóm B >= 3.0s, Nhóm C >= 4.0s.
2.  **Tầng 2 (Nhận diện Điểm Sụp Đổ - Collapse Point)**: Quét từ câu thứ 3 trở đi, điểm sụp đổ được xác định tại vị trí đầu tiên xuất hiện **chuỗi >= 3 câu liên tiếp** có thời gian dưới ngưỡng tối thiểu.
3.  **Tầng 3 (Cắt Dữ liệu Liền mạch)**: Cắt bỏ toàn bộ dữ liệu từ điểm sụp đổ đến hết câu 20. Ngoại lệ ngẫu nhiên đơn lẻ phía sau không được khôi phục nhằm bảo toàn tính đồng nhất của trạng thái hành vi.
4.  **Tầng 4 (Kiểm tra Số lượng Hợp lệ Tối thiểu)**: Nếu số câu hợp lệ còn lại trước điểm sụp đổ **< 10/20 câu**, toàn bộ người dùng đó sẽ bị loại khỏi mẫu sạch.
5.  **Tầng 5 (Kiểm tra Straight-lining trên phần hợp lệ)**: Áp dụng kiểm tra chọn duy nhất một đáp án (>= 80%) trên phần dữ liệu hợp lệ còn lại.

### 5.2. Kỹ thuật Tuyển mẫu Không đều (Oversampling Group C)
Kết quả áp dụng bộ lọc 5 tầng cho thấy Nhóm C có tỷ lệ sụp đổ nhận thức cao nhất (chỉ khoảng 54.5% người dùng giữ được dữ liệu so với >90% của Nhóm A). Nếu phân bổ mẫu ngẫu nhiên đều, Nhóm C sẽ bị thiếu hụt mẫu nghiêm trọng khi kết thúc thực nghiệm.

**Giải pháp mã nguồn**: Backend hệ thống (`api/users/start`) đã được bổ sung **Trọng số phân bổ tuyển mẫu (Oversampling Weighting)** với hệ số điều chỉnh ($A = 1.0, B = 1.35, C = 1.85$). Hệ thống tự động ưu tiên điều hướng người dùng mới vào Nhóm C cho đến khi cỡ mẫu sạch giữa 3 nhóm đạt mức cân bằng tối ưu (~15-20 người sạch mỗi nhóm).

---

## 6. Phân tích Chuyên sâu Nhóm Bỏ cuộc giữa chừng (Dropout Deep-Dive Analysis)

Nhóm nghiên cứu trích xuất dữ liệu của những người dùng ngắt kết nối giữa chừng (Dropouts) để phục vụ phân tích phụ trong chương Thảo luận (Discussion):

*   **Tỷ lệ Bỏ cuộc theo Giao diện**: Nhóm C có tỷ lệ bỏ cuộc cao hơn hẳn Nhóm A và B. Đây là bằng chứng thực tế chứng minh giao diện XAI quá tải thông tin không chỉ khiến người dùng làm ẩu mà còn khiến họ **từ bỏ nhiệm vụ hoàn toàn (Complete Task Abandonment)**.
*   **Giai đoạn Bỏ cuộc**: 
    *   Bỏ cuộc tại **Giai đoạn Đầu (Câu 1-5)**: Đại diện cho hiện tượng **Sốc Giao diện (Information Shock)** do choợp ngợp trước biểu đồ phức tạp ngay lần đầu tiếp xúc.
    *   Bỏ cuộc tại **Giai đoạn Giữa / Cuối (Câu 6-19)**: Đại diện cho sự **Tích lũy Mệt mỏi Nhận thức (Fatigue Accumulation)** sau thời gian dài suy nghĩ.
*   **Ảnh hưởng của Thiết bị**: Người dùng truy cập trên thiết bị di động (Mobile) có tỷ lệ bỏ cuộc vượt trội do kích thước màn hình nhỏ gây khó khăn khi thao tác trên biểu đồ Force Plot.

---

## 7. Phân tích Kiểm soát Phương pháp luận & Hạn chế Nghiên cứu (Methodological Controls & Limitations)

### 7.1. Hiện tượng Trùng khớp Tuyệt đối (Perfect Collinearity) về Tuổi tác và Hướng dẫn Giao diện
Trong mẫu thực tế thu thập, 100% đối tượng tham gia thuộc các nhóm tuổi ngoài 18-22 (bao gồm nhóm <18, 23-30, 31-45, >45) đều thuộc nhóm được nghiên cứu viên trực tiếp hướng dẫn chức năng giao diện tại Câu 1 (`is_explained = true`), trong khi n=0 đối tượng thuộc các nhóm tuổi này nằm ở nhóm tự làm (`is_explained = false`). 

Về mặt toán học thống kê, sự trùng khớp tuyệt đối (Perfect Collinearity / Perfect Confounding) này khiến nghiên cứu **không thể tách biệt được ảnh hưởng của tuổi tác khỏi ảnh hưởng của việc được hướng dẫn trực tiếp**. Do đó, các so sánh theo nhóm tuổi ngoài 18-22 không được diễn giải như bằng chứng về ảnh hưởng của tuổi tác.

### 7.2. Kiểm soát Hiệu ứng Hướng dẫn (Onboarding Instruction Controls)
Một số người tham gia (chủ yếu thuộc nhóm tuổi ngoài 18-22) được nghiên cứu viên giải thích trực tiếp về chức năng giao diện trong lúc thực hiện Câu 1, nhằm đảm bảo họ đủ tự tin tham gia. Nội dung giải thích tập trung vào chức năng và cách đọc các chỉ số (bao gồm cách phân biệt đánh giá hệ thống và đề xuất AI), không định hướng về quyết định cụ thể. 

*   **Đã loại bỏ thời gian Câu 1**: Do việc giải thích diễn ra trực tiếp trong lúc thao tác Câu 1, thời gian hoàn thành Câu 1 của nhóm `is_explained = true` đã được loại bỏ hoàn toàn khỏi các phân tích thời gian ra quyết định trung bình nhằm tránh làm vọt thời gian ảo.
*   **Loại bỏ chỉ số What-if khỏi so sánh nhu cầu khám phá**: Tần suất sử dụng công cụ What-if ở nhóm được hướng dẫn phản ánh hành vi dùng thử sau khi xem demo trực tiếp, do đó bị loại khỏi các phân tích so sánh nhu cầu khám phá tự nhiên giữa các nhóm.
*   **Đánh giá Nhiễu Mớm Bẫy (Demand Characteristics)**: Mặc dù việc giải thích cơ chế đánh giá kép (hệ thống vs AI) có nguy cơ vô tình gợi ý sự hoài nghi với AI, kết quả định lượng trên nhóm tuổi 18-22 (nhóm duy nhất có đối chứng) cho thấy điểm phát hiện bẫy AI ở 2 nhóm gần như tương đồng hoàn toàn (**1.5/4 vs 1.5/4**). Điều này cung cấp bằng chứng thực nghiệm trấn an rằng mức độ ảnh hưởng thực tế của nhiễu mớm bẫy là không đáng kể.
*   **Tỷ lệ Hoàn thành 100% do Trách nhiệm Xã hội**: Tỷ lệ hoàn thành tuyệt đối 100% của nhóm được giải thích phản ánh hiệu ứng Trách nhiệm Xã hội / Sự hiện diện của nghiên cứu viên (Social Desirability Bias / Researcher Presence), không được diễn giải như bằng chứng về sự vượt trội trong thiết kế usability của giao diện.



