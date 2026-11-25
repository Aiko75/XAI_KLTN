# BÁO CÁO PHÂN TÍCH CHI TIẾT 20 KỊCH BẢN THỰC NGHIỆM (SCENARIO-LEVEL ANALYSIS)
*Dựa trên dữ liệu thực nghiệm thực tế từ các người dùng sạch sau khi lọc 4 tầng (Time-Based)*

## I. BẢNG TỔNG QUAN HỆ THỐNG 20 KỊCH BẢN (16 KỊCH BẢN CHUẨN + 4 KỊCH BẢN BẪY)

| ID | Loại Kịch Bản | Credit Score | DTI (%) | Thu Nhập Tháng (VND) | Số Tiền Vay (VND) | Nợ Xấu | Đề Xuất AI | Ground Truth | Nhóm A Đúng (%) | Nhóm B Đúng (%) | Nhóm C Đúng (%) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | BẪY AI (Trap Scenario) | 696 | 21.0% | 32,365,754 | 216,213,313 | 0 | **REJECT** (59%) | **APPROVE** | 45.5% | 44.4% | 33.3% |
| **2** | BÌNH THƯỜNG (Normal Scenario) | 499 | 10.2% | 25,158,737 | 57,990,257 | 0 | **APPROVE** (64%) | **APPROVE** | 81.8% | 88.9% | 83.3% |
| **3** | BÌNH THƯỜNG (Normal Scenario) | 594 | 18.0% | 22,389,614 | 94,744,502 | 0 | **REJECT** (60%) | **REJECT** | 18.2% | 66.7% | 50.0% |
| **4** | BÌNH THƯỜNG (Normal Scenario) | 552 | 15.0% | 27,880,982 | 118,785,693 | 0 | **APPROVE** (55%) | **APPROVE** | 18.2% | 100.0% | 66.7% |
| **5** | BÌNH THƯỜNG (Normal Scenario) | 503 | 23.5% | 23,557,895 | 110,100,631 | 0 | **REJECT** (82%) | **REJECT** | 45.5% | 77.8% | 100.0% |
| **6** | BÌNH THƯỜNG (Normal Scenario) | 564 | 17.1% | 20,175,439 | 92,566,194 | 0 | **REJECT** (66%) | **REJECT** | 81.8% | 66.7% | 50.0% |
| **7** | BÌNH THƯỜNG (Normal Scenario) | 571 | 21.9% | 29,898,667 | 146,296,214 | 0 | **REJECT** (69%) | **REJECT** | 45.5% | 44.4% | 33.3% |
| **8** | BẪY AI (Trap Scenario) | 688 | 39.5% | 18,169,825 | 76,590,374 | 0 | **REJECT** (76%) | **APPROVE** | 36.4% | 33.3% | 0.0% |
| **9** | BÌNH THƯỜNG (Normal Scenario) | 608 | 13.8% | 30,399,439 | 82,829,535 | 1 | **APPROVE** (61%) | **APPROVE** | 72.7% | 66.7% | 50.0% |
| **10** | BÌNH THƯỜNG (Normal Scenario) | 617 | 18.1% | 17,002,947 | 94,495,686 | 0 | **REJECT** (65%) | **REJECT** | 54.5% | 77.8% | 83.3% |
| **11** | BẪY AI (Trap Scenario) | 632 | 17.8% | 49,258,386 | 202,899,347 | 1 | **APPROVE** (58%) | **REJECT** | 36.4% | 44.4% | 16.7% |
| **12** | BÌNH THƯỜNG (Normal Scenario) | 591 | 17.5% | 22,030,877 | 152,821,748 | 0 | **REJECT** (72%) | **REJECT** | 27.3% | 75.0% | 83.3% |
| **13** | BÌNH THƯỜNG (Normal Scenario) | 653 | 14.2% | 40,017,965 | 226,241,039 | 0 | **APPROVE** (73%) | **APPROVE** | 100.0% | 87.5% | 100.0% |
| **14** | BÌNH THƯỜNG (Normal Scenario) | 530 | 24.0% | 35,531,789 | 286,200,831 | 0 | **REJECT** (80%) | **REJECT** | 63.6% | 62.5% | 100.0% |
| **15** | BÌNH THƯỜNG (Normal Scenario) | 672 | 10.3% | 31,273,825 | 118,396,039 | 0 | **APPROVE** (81%) | **APPROVE** | 90.9% | 87.5% | 83.3% |
| **16** | BẪY AI (Trap Scenario) | 629 | 12.7% | 48,065,684 | 199,650,664 | 1 | **APPROVE** (73%) | **REJECT** | 18.2% | 12.5% | 33.3% |
| **17** | BÌNH THƯỜNG (Normal Scenario) | 546 | 16.0% | 26,061,754 | 85,970,242 | 0 | **APPROVE** (55%) | **APPROVE** | 63.6% | 87.5% | 80.0% |
| **18** | BÌNH THƯỜNG (Normal Scenario) | 603 | 24.7% | 38,586,947 | 292,613,693 | 0 | **REJECT** (82%) | **REJECT** | 63.6% | 87.5% | 80.0% |
| **19** | BÌNH THƯỜNG (Normal Scenario) | 630 | 17.3% | 35,754,105 | 106,448,210 | 0 | **APPROVE** (78%) | **APPROVE** | 90.9% | 87.5% | 100.0% |
| **20** | BÌNH THƯỜNG (Normal Scenario) | 615 | 8.4% | 30,126,035 | 67,816,114 | 0 | **APPROVE** (82%) | **APPROVE** | 100.0% | 100.0% | 100.0% |

---

## II. PHÂN TÍCH NỘI DUNG CHI TIẾT VÀ HÀNH VI HCI THEO TỪNG KỊCH BẢN

### Kịch bản #1 — BẪY AI (Trap Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **696**, DTI **21.0%**, Thu nhập **32,365,754 VNĐ/tháng**, Vay **216,213,313 VNĐ**, Tuổi **73**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 59%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — *AI đoán sai do bỏ qua điều kiện nợ xấu hoặc DTI vượt ngưỡng.*
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Khoản vay (-23%), Tỷ lệ DTI (-4%), vượt trội so với yếu tố tích cực như Thu nhập (+35%), Điểm tín dụng (+22%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **45.5%** | Tg xem **42.92s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **44.4%** | Tg xem **98.1s** | Rê chuột SHAP **4.33 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **33.3%** | Tg xem **141.59s** | Rê chuột **114.5 lượt** | Hỏi Chatbot **0.5 lượt** | Thử What-if **64.33 lượt**

### Kịch bản #2 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **499**, DTI **10.2%**, Thu nhập **25,158,737 VNĐ/tháng**, Vay **57,990,257 VNĐ**, Tuổi **36**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Self-Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 64%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Tỷ lệ DTI (+35%), Khoản vay (+16%), lấn át hoàn toàn điểm trừ từ Điểm tín dụng (-3%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **81.8%** | Tg xem **41.69s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **88.9%** | Tg xem **27.97s** | Rê chuột SHAP **0.33 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **83.3%** | Tg xem **118.82s** | Rê chuột **20.0 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.17 lượt**

### Kịch bản #3 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **594**, DTI **18.0%**, Thu nhập **22,389,614 VNĐ/tháng**, Vay **94,744,502 VNĐ**, Tuổi **37**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 60%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Thu nhập (-13%), Điểm tín dụng (-3%), vượt trội so với yếu tố tích cực như Tỷ lệ DTI (+35%), Khoản vay (+20%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **18.2%** | Tg xem **29.83s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **66.7%** | Tg xem **42.55s** | Rê chuột SHAP **0.67 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **50.0%** | Tg xem **25.93s** | Rê chuột **5.5 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #4 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **552**, DTI **15.0%**, Thu nhập **27,880,982 VNĐ/tháng**, Vay **118,785,693 VNĐ**, Tuổi **42**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 55%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Tỷ lệ DTI (+35%), Thu nhập (+33%), lấn át hoàn toàn điểm trừ từ Điểm tín dụng (-5%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **18.2%** | Tg xem **34.75s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **11.33s** | Rê chuột SHAP **1.0 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **66.7%** | Tg xem **25.67s** | Rê chuột **5.33 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #5 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **503**, DTI **23.5%**, Thu nhập **23,557,895 VNĐ/tháng**, Vay **110,100,631 VNĐ**, Tuổi **22**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 82%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Tuổi (-34%), Điểm tín dụng (-19%), vượt trội so với yếu tố tích cực như Khoản vay (+35%), Lịch sử nợ xấu (+3%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **45.5%** | Tg xem **21.64s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **77.8%** | Tg xem **23.91s** | Rê chuột SHAP **1.67 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **13.51s** | Rê chuột **4.17 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.17 lượt**

### Kịch bản #6 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **564**, DTI **17.1%**, Thu nhập **20,175,439 VNĐ/tháng**, Vay **92,566,194 VNĐ**, Tuổi **58**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 66%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Thu nhập (-27%), Điểm tín dụng (-5%), vượt trội so với yếu tố tích cực như Tỷ lệ DTI (+35%), Khoản vay (+13%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **81.8%** | Tg xem **21.77s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **66.7%** | Tg xem **31.23s** | Rê chuột SHAP **0.33 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **50.0%** | Tg xem **12.07s** | Rê chuột **2.67 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.17 lượt**

### Kịch bản #7 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **571**, DTI **21.9%**, Thu nhập **29,898,667 VNĐ/tháng**, Vay **146,296,214 VNĐ**, Tuổi **25**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 69%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Tuổi (-11%), Tỷ lệ DTI (-8%), vượt trội so với yếu tố tích cực như Thu nhập (+35%), Lịch sử nợ xấu (+1%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **45.5%** | Tg xem **22.44s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **44.4%** | Tg xem **18.6s** | Rê chuột SHAP **2.33 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **33.3%** | Tg xem **16.15s** | Rê chuột **4.83 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #8 — BẪY AI (Trap Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **688**, DTI **39.5%**, Thu nhập **18,169,825 VNĐ/tháng**, Vay **76,590,374 VNĐ**, Tuổi **55**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 76%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — *AI đoán sai do bỏ qua điều kiện nợ xấu hoặc DTI vượt ngưỡng.*
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Tỷ lệ DTI (-33%), Thu nhập (-28%), vượt trội so với yếu tố tích cực như Điểm tín dụng (+35%), Khoản vay (+22%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **36.4%** | Tg xem **14.63s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **33.3%** | Tg xem **14.16s** | Rê chuột SHAP **0.89 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **0.0%** | Tg xem **10.65s** | Rê chuột **5.83 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #9 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **608**, DTI **13.8%**, Thu nhập **30,399,439 VNĐ/tháng**, Vay **82,829,535 VNĐ**, Tuổi **18**, Nợ xấu **1**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 61%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Thu nhập (+35%), Tỷ lệ DTI (+31%), lấn át hoàn toàn điểm trừ từ Tuổi (-12%), Lịch sử nợ xấu (-10%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **72.7%** | Tg xem **20.08s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **66.7%** | Tg xem **13.86s** | Rê chuột SHAP **2.22 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **50.0%** | Tg xem **18.08s** | Rê chuột **7.17 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.17 lượt**

### Kịch bản #10 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **617**, DTI **18.1%**, Thu nhập **17,002,947 VNĐ/tháng**, Vay **94,495,686 VNĐ**, Tuổi **45**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 65%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Thu nhập (-33%), vượt trội so với yếu tố tích cực như Tỷ lệ DTI (+35%), Khoản vay (+13%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **54.5%** | Tg xem **11.81s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **77.8%** | Tg xem **16.59s** | Rê chuột SHAP **3.44 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **83.3%** | Tg xem **10.44s** | Rê chuột **3.17 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #11 — BẪY AI (Trap Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **632**, DTI **17.8%**, Thu nhập **49,258,386 VNĐ/tháng**, Vay **202,899,347 VNĐ**, Tuổi **42**, Nợ xấu **1**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 58%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — *AI đoán sai do bỏ qua điều kiện nợ xấu hoặc DTI vượt ngưỡng.*
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Thu nhập (+35%), Tỷ lệ DTI (+9%), lấn át hoàn toàn điểm trừ từ Khoản vay (-6%), Lịch sử nợ xấu (-6%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **36.4%** | Tg xem **25.03s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **44.4%** | Tg xem **21.59s** | Rê chuột SHAP **1.44 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **16.7%** | Tg xem **13.44s** | Rê chuột **4.67 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #12 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **591**, DTI **17.5%**, Thu nhập **22,030,877 VNĐ/tháng**, Vay **152,821,748 VNĐ**, Tuổi **38**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 72%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Thu nhập (-18%), Khoản vay (-9%), vượt trội so với yếu tố tích cực như Tỷ lệ DTI (+35%), Lịch sử phá sản (+1%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **27.3%** | Tg xem **26.18s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **75.0%** | Tg xem **26.35s** | Rê chuột SHAP **2.0 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **83.3%** | Tg xem **11.48s** | Rê chuột **3.5 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #13 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **653**, DTI **14.2%**, Thu nhập **40,017,965 VNĐ/tháng**, Vay **226,241,039 VNĐ**, Tuổi **43**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 73%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Thu nhập (+35%), Tỷ lệ DTI (+29%), lấn át hoàn toàn điểm trừ từ Khoản vay (-12%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **16.27s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **87.5%** | Tg xem **10.24s** | Rê chuột SHAP **1.0 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **13.42s** | Rê chuột **2.67 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **1.0 lượt**

### Kịch bản #14 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **530**, DTI **24.0%**, Thu nhập **35,531,789 VNĐ/tháng**, Vay **286,200,831 VNĐ**, Tuổi **31**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 80%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Khoản vay (-26%), Tỷ lệ DTI (-13%), vượt trội so với yếu tố tích cực như Thu nhập (+35%), Lịch sử nợ xấu (+1%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **63.6%** | Tg xem **33.12s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **62.5%** | Tg xem **11.83s** | Rê chuột SHAP **3.12 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **7.24s** | Rê chuột **3.83 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #15 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **672**, DTI **10.3%**, Thu nhập **31,273,825 VNĐ/tháng**, Vay **118,396,039 VNĐ**, Tuổi **58**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 81%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **DUYỆT VAY** do ghi nhận nhiều yếu tố tích cực như Tỷ lệ DTI (+35%), Thu nhập (+33%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **90.9%** | Tg xem **17.25s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **87.5%** | Tg xem **11.68s** | Rê chuột SHAP **1.25 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **83.3%** | Tg xem **11.02s** | Rê chuột **2.33 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #16 — BẪY AI (Trap Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **629**, DTI **12.7%**, Thu nhập **48,065,684 VNĐ/tháng**, Vay **199,650,664 VNĐ**, Tuổi **36**, Nợ xấu **1**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 73%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — *AI đoán sai do bỏ qua điều kiện nợ xấu hoặc DTI vượt ngưỡng.*
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Thu nhập (+35%), Tỷ lệ DTI (+21%), lấn át hoàn toàn điểm trừ từ Lịch sử nợ xấu (-5%), Khoản vay (-5%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **18.2%** | Tg xem **8.93s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **12.5%** | Tg xem **11.39s** | Rê chuột SHAP **1.5 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **33.3%** | Tg xem **9.95s** | Rê chuột **2.83 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #17 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **546**, DTI **16.0%**, Thu nhập **26,061,754 VNĐ/tháng**, Vay **85,970,242 VNĐ**, Tuổi **28**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 55%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình nghiêng về đề xuất **DUYỆT VAY** chủ yếu nhờ các yếu tố tích cực như Tỷ lệ DTI (+35%), Khoản vay (+28%), lấn át hoàn toàn điểm trừ từ Điểm tín dụng (-5%), Tuổi (-2%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **63.6%** | Tg xem **9.8s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **87.5%** | Tg xem **11.5s** | Rê chuột SHAP **1.0 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **80.0%** | Tg xem **14.71s** | Rê chuột **4.2 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #18 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **603**, DTI **24.7%**, Thu nhập **38,586,947 VNĐ/tháng**, Vay **292,613,693 VNĐ**, Tuổi **34**, Nợ xấu **0**, Phá sản **1**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **REJECT** (Độ tin cậy: 82%)
*   **Ground Truth (Đáp án Chuẩn)**: **REJECT** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **TỪ CHỐI** do chịu ảnh hưởng tiêu cực từ điểm trừ từ Khoản vay (-22%), Lịch sử phá sản (-13%), vượt trội so với yếu tố tích cực như Thu nhập (+35%), Lịch sử nợ xấu (+1%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **63.6%** | Tg xem **13.08s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **87.5%** | Tg xem **8.92s** | Rê chuột SHAP **0.88 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **80.0%** | Tg xem **14.33s** | Rê chuột **1.6 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.0 lượt**

### Kịch bản #19 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **630**, DTI **17.3%**, Thu nhập **35,754,105 VNĐ/tháng**, Vay **106,448,210 VNĐ**, Tuổi **57**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 78%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **DUYỆT VAY** do ghi nhận nhiều yếu tố tích cực như Thu nhập (+35%), Tỷ lệ DTI (+16%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **90.9%** | Tg xem **7.8s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **87.5%** | Tg xem **6.51s** | Rê chuột SHAP **0.25 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **10.05s** | Rê chuột **3.8 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.4 lượt**

### Kịch bản #20 — BÌNH THƯỜNG (Normal Scenario)
*   **Thông tin Hồ sơ**: Điểm tín dụng **615**, DTI **8.4%**, Thu nhập **30,126,035 VNĐ/tháng**, Vay **67,816,114 VNĐ**, Tuổi **57**, Nợ xấu **0**, Phá sản **0**, Trạng thái công việc: **Employed**
*   **Phán quyết AI**: Đề xuất **APPROVE** (Độ tin cậy: 82%)
*   **Ground Truth (Đáp án Chuẩn)**: **APPROVE** — **
*   **Giải thích SHAP (Visual Explanation)**: Mô hình đề xuất **DUYỆT VAY** do ghi nhận nhiều yếu tố tích cực như Tỷ lệ DTI (+35%), Thu nhập (+26%).
*   **Chỉ số Phản hồi Thực nghiệm (HCI Performance)**:
    *   **Nhóm A (Black-box)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **11.04s**
    *   **Nhóm B (Static XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **6.87s** | Rê chuột SHAP **0.75 lượt**
    *   **Nhóm C (Interactive XAI)**: Tỷ lệ quyết định đúng **100.0%** | Tg xem **8.91s** | Rê chuột **1.4 lượt** | Hỏi Chatbot **0.0 lượt** | Thử What-if **0.2 lượt**
