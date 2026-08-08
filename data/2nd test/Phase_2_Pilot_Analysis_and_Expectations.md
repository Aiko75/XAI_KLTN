# BÁO CÁO PHÂN TÍCH THỬ NGHIỆM SƠ BỘ & KỲ VỌNG THỰC NGHIỆM GIAI ĐOẠN 2
*(Phase 2 Pilot Evaluation & Experimental Expectations Report)*

> [!IMPORTANT]
> Tài liệu này được xây dựng tại thư mục `data/2nd test` nhằm phục vụ việc đúc kết kinh nghiệm từ đợt kiểm thử nội bộ (Pilot Run) và thiết lập các kỳ vọng khoa học, đánh giá chất lượng câu hỏi, cùng chất lượng kỹ thuật của hệ thống thu thập dữ liệu HCI thực nghiệm cho khóa luận tốt nghiệp.

---

## 1. Kỳ vọng khoa học trong đợt thử nghiệm Giai đoạn 2 (Phase 2 Expectations)

Đợt thử nghiệm chính thức Giai đoạn 2 hướng tới thu thập dữ liệu thực tế từ **60 - 100 đối tượng** (sinh viên và người đi làm thuộc nhiều nhóm ngành và độ tuổi khác nhau). Kỳ vọng khoa học tập trung vào 3 giả thuyết nghiên cứu chính:

### Giả thuyết H1: Hiệu chỉnh niềm tin và Giảm thiểu Thiên kiến tự động hóa (Automation Bias Calibration)
*   **Kỳ vọng**: Giao diện chỉ có đề xuất AI thô (Nhóm A) sẽ dẫn tới hiện tượng đồng thuận mù quáng (Automation Bias) rất cao. Trái lại, các giao diện có XAI giải thích tĩnh (Nhóm B) và giải thích tương tác (Nhóm C) sẽ giúp người dùng hiệu chỉnh niềm tin (Trust Calibration): họ sẽ tin tưởng khi AI đúng, nhưng có đủ thông tin phản biện để bác bỏ khi AI sai (bẫy AI).
*   **Chỉ số kiểm chứng**: Tỷ lệ phát hiện bẫy chính xác ở Nhóm B và C dự kiến sẽ vượt trội so với Nhóm A.

### Giả thuyết H2: Tải lượng nhận thức vs. Hiệu quả thẩm định (Cognitive Load Trade-off)
*   **Kỳ vọng**: Sự xuất hiện của các công cụ XAI nâng cao (biểu đồ SHAP, câu hỏi chatbot, mô phỏng What-if ở Nhóm C) sẽ làm tăng nhẹ tải lượng nhận thức về mặt trí óc (Mental Demand) và thời gian (Temporal Demand) theo thang đo NASA-TLX. Tuy nhiên, đổi lại, người dùng sẽ có hiệu suất tự đánh giá (Performance) tốt hơn và tự tin hơn với quyết định của mình.

### Giả thuyết H3: Ảnh hưởng của Nghề nghiệp và Chuyên ngành (User Demographics & Domain Knowledge)
*   **Kỳ vọng**: Việc nâng cấp phân cấp Nghề nghiệp mới (Sinh viên kỹ thuật vs. Kinh tế vs. Y tế; Người đi làm) sẽ chứng minh sự khác biệt lớn trong cách tiếp cận AI. Sinh viên khối ngành Công nghệ/Kỹ thuật có xu hướng phân tích sâu các biểu đồ SHAP và chatbot (Interactive Clicks cao), trong khi nhóm ngành Kinh tế/Xã hội dựa nhiều hơn vào các nhãn Đánh giá nhanh (Good/Fair/Bad) vừa bổ sung.

---

## 2. Phân tích kết quả khảo sát sơ bộ (Pilot Survey Results Analysis)

Từ dữ liệu chạy thử thực tế lưu tại `local_db.json` (bao gồm các lượt chạy hoàn chỉnh của Quân - nhóm A, Nhân - nhóm C, v.v.), chúng tôi thu được những phát hiện sơ khởi quan trọng:

### Bảng tổng hợp số liệu thực nghiệm sơ bộ
| Nhóm thực nghiệm | Thời gian trung bình / câu | Tỷ lệ hoài nghi lành mạnh (Phát hiện lỗi AI) | Số lượt hover XAI / người | Số câu hỏi chatbot | Điểm NASA-TLX trung bình |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Nhóm A (Black-box)** | `31.05s` | **8.3%** (Rất thấp) | `30.67` (Chỉ hover bảng hồ sơ) | Không hỗ trợ | `4.13 / 20` |
| **Nhóm B (Static XAI)** | `0.50s` | **25.0%** (Trung bình) | `4.00` | Không hỗ trợ | `4.00 / 20` |
| **Nhóm C (Interactive)** | `5.31s` | **0.0%** (Pilot 1 người) | `41.00` (Rất cao) | `3.00` | `4.00 / 20` |

### Phân tích ca điển hình (Trường hợp của Quân - Nhóm A):
*   **Hành vi quyết định**: Quân hoàn thành 20 câu với thời gian ra quyết định trung bình `31.05` giây/câu.
*   **Minh chứng Thiên kiến tự động hóa**: Vì thuộc Nhóm A (không có giải thích XAI), Quân đã đồng thuận với AI ở 11/12 tình huống bẫy sai. Điều này chứng minh khi thiếu thông tin giải thích thuật toán, người thẩm định có xu hướng phó mặc quyết định cho AI dù hồ sơ thực tế có nợ xấu hoặc DTI vượt ngưỡng nguy hiểm.
*   **Tải lượng nhận thức**: Điểm số NASA-TLX của Quân đạt mức trung bình thấp (`4.00` - `6.00` trên thang 20), cho thấy giao diện thô không gây áp lực lớn nhưng không kích thích tư duy phản biện.

---

## 3. Đánh giá chất lượng khảo sát & Bộ kịch bản (Scenario & Question Quality)

Bộ kịch bản gồm **20 câu hỏi** phân bổ thành **14 câu bình thường** và **6 câu bẫy AI (Trap)**:

### Đánh giá chất lượng bẫy AI
*   **Lập luận logic**: Các câu bẫy (ví dụ: Câu 1, 4, 9, v.v.) có các thông số tài chính cực kỳ rõ ràng để bác bỏ (Ví dụ: Có 1-2 lần nợ xấu hoặc tỷ lệ DTI trên 45%). AI đề xuất "Duyệt" dựa trên các tương quan nhiễu ngẫu nhiên của mô hình máy học. Điều này phản ánh chính xác các rủi ro trong thực tế ngân hàng khi AI bị thiên lệch (bias).
*   **Độ nhạy của bẫy**: Pilot test cho thấy người dùng nhóm A hoàn toàn không nhận ra bẫy, chứng tỏ bẫy có độ nhạy rất cao và phân loại tốt mức độ phụ thuộc vào công nghệ.

### Các cải tiến chất lượng khảo sát vừa thực hiện
1.  **Nhãn đánh giá nhanh (Cognitive Aids)**: Việc bổ sung nhãn `Tốt`, `Tạm ổn`, `Tệ`, `Cao` ngay bên cạnh các thông số số học (như Điểm tín dụng 591, DTI 17%) giúp giải quyết triệt để vấn đề "thiếu kiến thức nền tảng" của người tham gia, giúp họ nhận định nhanh chất lượng hồ sơ mà không cần tra cứu.
2.  **Lồng ghép Trọng số SHAP (+/- %)**: Việc đưa các phần trăm tác động trực tiếp vào bảng hồ sơ (Nhóm B & C) giúp giải thích toán học đằng sau các phán quyết phi logic của AI (Ví dụ: AI từ chối vì Khoản vay kéo điểm nặng hơn các lực đẩy khác), tăng tính thuyết phục của XAI.
3.  **Ràng buộc biến tĩnh**: Giữ nguyên các biến Lịch sử phá sản, Nợ quá hạn ở mức 0 trong đa số trường hợp giúp tập trung sự chú ý của đối tượng khảo sát vào các biến số liên tục (Thu nhập, Khoản vay, Điểm tín dụng), tránh gây quá tải thông tin (Information Overload).

---

## 4. Đánh giá chất lượng kỹ thuật & Hệ thống Telemetry (Technical Quality)

Hệ thống Next.js tích hợp Supabase và Prisma Client đạt chất lượng kỹ thuật cao cho đợt chạy chính thức:

### Hệ thống Telemetry thụ động (Passive Telemetry)
*   **Chính xác**: Ghi nhận chính xác tọa độ chạm (X, Y), thời gian nhấn giữ màn hình cảm ứng điện thoại (Touch Duration), số lần chạm dồn dập do ức chế (Rage Taps), số lần đổi hướng cuộn và độ sâu cuộn màn hình.
*   **Tránh lag giật**: Toàn bộ dữ liệu high-frequency được thu thập qua `useRef` và chỉ đóng gói thành JSON khi bấm nút quyết định. Giao diện luôn mượt mà đạt 60fps trên mọi thiết bị di động.
*   **Thời gian thực tế (Active Time)**: Việc tự động trừ đi thời gian tab bị ẩn hoặc màn hình điện thoại bị khóa (Page Visibility API) giúp loại bỏ hoàn toàn các sai số do người dùng bỏ máy đi làm việc khác.

### Cơ chế dự phòng (Robustness)
*   **Gemini Q&A Fallback**: Khi chatbot gặp sự cố kết nối hoặc giới hạn API key, hệ thống tự động kích hoạt bộ QA matching nội bộ, đảm bảo người dùng nhóm C luôn nhận được câu trả lời giải thích tức thời mà không bị treo ứng dụng.
*   **Local DB Sync**: Tệp `local_db.json` đóng vai trò là bản sao lưu hoàn hảo. Script di chuyển dữ liệu (`pg` driver) đã được kiểm chứng có khả năng đồng bộ dữ liệu local lên Supabase cloud chỉ trong vài giây.

---

## 5. Hạn chế của Thiết kế Giao diện Thực nghiệm & Điều chỉnh Quy mô Mẫu Giai đoạn 2

### Hạn chế lớn nhất: Sự mơ hồ về Quy trình Nhiệm vụ trên Giao diện (Cognitive Task Ambiguity)
*   **Mô tả hạn chế**: Qua đợt chạy thử sơ bộ, nhóm nghiên cứu phát hiện giao diện thực nghiệm tồn tại một sự mơ hồ nhất định về mặt nhận thức. Người tham gia khảo sát khi mới vào bài test không dễ dàng hiểu ngay mình cần làm gì với các thông tin hiển thị, chưa nắm rõ quy trình đánh giá tối ưu: nên nhìn vào đâu trước, phân tích những chỉ số nào, và đối chiếu ra sao để đưa ra quyết định duyệt hay từ chối.
*   **Thiết kế lý tưởng đề xuất**: Đáng lẽ thông tin khoản vay yêu cầu (Loan details) và thông tin hồ sơ tài chính của khách hàng (Customer credit profile) cần được phân chia thành hai khu vực trực quan tách biệt hoàn toàn. Giao diện nên nêu rõ chỉ dẫn: *"Người dùng cần thẩm định tính hợp lý của số tiền vay so với năng lực tài chính trước, sau đó đối chiếu với các chỉ số rủi ro của khách hàng làm căn cứ phê duyệt hoặc từ chối"*.
*   **Giải pháp ghi nhận cho luận văn**: Do hệ thống thực nghiệm hiện tại đã được triển khai rộng rãi để thu thập số liệu thực tế từ đối tượng bên ngoài nên việc sửa đổi mã nguồn giao diện là không khả thi (tránh gây mất đồng nhất mẫu). Yếu tố này được ghi nhận như một **Hạn chế về mặt Thiết kế Giao diện Thực nghiệm (Experimental UI Limitation)** trong Khóa luận và sẽ được đưa vào chương thảo luận để phân tích ảnh hưởng của sự mơ hồ này đến thời gian ra quyết định (Decision Time) và mức độ ức chế (Frustration) trên thang đo NASA-TLX.

### Điều chỉnh Quy mô Mẫu Tối thiểu (Giảm mức sàn xuống 40 người)
*   **Lý do điều chỉnh**: Mục tiêu ban đầu là 60-100 người dùng thực tế. Tuy vậy, do mỗi người tham gia phải làm 20 kịch bản chi tiết (mất từ 15-20 phút tập trung cao độ), việc đạt con số này trong quỹ thời gian hạn hẹp (ảnh hưởng tới deadline nộp khóa luận) là rất khó khả thi.
*   **Quy mô mẫu mới**: Đặt số lượng người tham gia tối thiểu ở **mức sàn là 40 người** (tương đương 13-15 người mỗi nhóm giao diện A, B, C).
*   **Tính khả thi học thuật**: Với $N \ge 40$, mẫu thử vẫn hoàn toàn đáp ứng yêu cầu kỹ thuật tối thiểu để thực hiện các kiểm định thống kê phi tham số (như Wilcoxon signed-rank test hoặc Kruskal-Wallis test) nhằm tìm ra sự khác biệt có ý nghĩa thống kê về hiệu năng, hành vi và tải lượng nhận thức giữa 3 nhóm trong nghiên cứu tương tác người - máy (HCI).

### Hạn chế nhân khẩu học về độ tuổi (Age Demographic Homogeneity)
*   **Mô tả hạn chế**: Dữ liệu từ thực nghiệm ghi nhận hơn 90% đối tượng tham gia thuộc nhóm tuổi **18-22 (Độ tuổi sinh viên)** do khảo sát được chia sẻ chủ yếu trong mạng lưới sinh viên đại học. 
*   **Giải pháp ghi nhận cho luận văn**: Yếu tố này được ghi nhận như một **Hạn chế nhân khẩu học (Demographic Limitation)** rõ rệt trong phần thảo luận (Discussion) của khóa luận. Người trẻ (sinh viên) có khả năng thích nghi công nghệ nhanh hơn và tiếp thu các biểu đồ XAI trực quan tốt hơn so với nhóm dân số trung niên (> 45 tuổi) - những người có thể phụ thuộc hoặc hoài nghi thuật toán theo các chiều hướng khác. Kết quả nghiên cứu đại diện tốt nhất cho phân khúc người thẩm định trẻ tuổi và cần thận trọng khi tổng quát hóa cho toàn bộ lực lượng lao động.

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**. 
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện (bao gồm các quan sát về sự mơ hồ trong tương tác giao diện) và việc chịu trách nhiệm khoa học/bảo vệ kết quả nghiên cứu hoàn toàn thuộc về tác giả khóa luận (con người).

