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
