from copy import deepcopy
from pathlib import Path
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

src = Path(r"D:\Download\KLTN (1).docx")
out = Path(r"D:\My_projects\XAI_KLTN\docs\thesis\KLTN_Tran_Ngoc_Nhan_Da_sua.docx")
d = Document(src)

def fmt(p, first=True):
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    f = p.paragraph_format
    f.first_line_indent = Cm(1 if first else 0)
    f.line_spacing = 1.3
    f.space_after = Pt(4)
    for r in p.runs:
        r.font.name = "Times New Roman"; r._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman'); r.font.size = Pt(13)

def insert_after(p, text, style=None):
    q = d.add_paragraph(text, style=style)
    p._p.addnext(q._p)
    return q

# Correct incorrect product description and normalize body typography/margins.
for p in d.paragraphs:
    if "sản phẩm chatbot" in p.text:
        for r in p.runs:
            r.text = r.text.replace("sản phẩm chatbot", "môi trường thực nghiệm")
    if p.style.name == "Normal": fmt(p)
for s in d.sections:
    s.top_margin = Cm(2.5); s.bottom_margin = Cm(2.5); s.left_margin = Cm(3.5); s.right_margin = Cm(2.5)

# Add stated main results directly after the introduction title.
for p in list(d.paragraphs):
    if p.text.strip() == "MỞ ĐẦU":
        n = insert_after(p, "Kết quả chính của nghiên cứu cho thấy, trên 28 phiên được giữ lại sau làm sạch, tỷ lệ quyết định trùng đáp án theo kịch bản mô phỏng ở các hồ sơ AI sai là 34,1% ở điều kiện A, 35,9% ở điều kiện B và 21,4% ở điều kiện C. Các chỉ số này không cho thấy lợi thế rõ ràng của giao diện tương tác phức tạp; chúng được diễn giải như bằng chứng mô tả trong môi trường mô phỏng, không phải kết luận về năng lực thẩm định tín dụng thực tế.")
        fmt(n); break

# Add a substantive final discussion section before Chapter 5 (about 3 rendered pages).
anchor = next(p for p in d.paragraphs if p.text.strip().startswith("CHƯƠNG 5."))
head = anchor.insert_paragraph_before("4.6. Tổng hợp kết quả và hàm ý đánh giá giao diện")
head.style = "Heading 2"
for r in head.runs: r.font.name="Times New Roman"; r._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman'); r.font.size=Pt(13); r.bold=True
paras = [
"Các kết quả của Chương 4 cần được đọc theo cấu trúc của nhiệm vụ thay vì dựa trên một tỷ lệ đồng ý với AI duy nhất. Khi AI và đáp án theo kịch bản mô phỏng cùng hướng, việc đồng ý với AI là một lựa chọn phù hợp với chuẩn nhiệm vụ. Khi AI và đáp án mâu thuẫn, người tham gia phải bác bỏ đề xuất AI để trùng đáp án. Việc tách hai trạng thái này giúp tránh đồng nhất sự đồng thuận với AI với niềm tin được hiệu chỉnh. Nó cũng cho phép đánh giá rõ hơn liệu giao diện có hỗ trợ người dùng kiểm tra một khuyến nghị hay chỉ khiến họ tiếp nhận đầu ra có sẵn.",
"Ở các hồ sơ AI đúng, tỷ lệ quyết định trùng đáp án cao hơn ở cả ba điều kiện. Đây là một dấu hiệu hợp lý trong phạm vi kịch bản: phần lớn người tham gia đã có thể sử dụng khuyến nghị AI khi khuyến nghị và thông tin hồ sơ cùng hướng. Tuy nhiên, kết quả này không đủ để suy ra rằng người dùng hiểu cách mô hình vận hành. Một người tham gia có thể đồng ý vì đã kiểm tra hồ sơ, nhưng cũng có thể đồng ý do dựa vào confidence hoặc do coi AI là nguồn mặc định. Dữ liệu hiện có không phân biệt được hoàn toàn các cơ chế đó.",
"Ở bốn hồ sơ AI sai, tỷ lệ trùng đáp án thấp hơn đáng kể về mô tả. Điều này tạo ra một điểm kiểm tra cần thiết cho thiết kế XAI: giải thích chỉ có ích khi người dùng có thể gắn thông tin hiển thị với thao tác quyết định. Giao diện B có tỷ lệ nhỉnh hơn A nhưng chênh lệch nhỏ; điều kiện C có nhiều thành phần tương tác hơn nhưng không cho thấy lợi thế tương ứng. Vì số phiên còn lại không cân bằng và nhóm C chỉ có bảy người, các khác biệt này không được xem là bằng chứng thống kê về hiệu quả của từng giao diện.",
"Thời gian phản hồi và telemetry góp phần đặt các tỷ lệ trên vào bối cảnh. Điều kiện C ghi nhận thời gian và số thao tác cao hơn, phù hợp với việc người dùng phải điều hướng thêm giữa biểu đồ, mô phỏng What-if và vùng hỏi đáp. Tuy vậy, thời gian dài không tự nó chứng minh người dùng hiểu sâu hơn, cũng như số lượt di chuột không cho biết phần thông tin nào đã được sử dụng. Các chỉ báo này được xem là chi phí hoặc mức sử dụng giao diện, không được gộp thành một thước đo chất lượng nhận thức.",
"Kết quả tự báo cáo tải công việc cũng cần được diễn giải theo từng chiều. Mental Demand, Temporal Demand, Performance, Effort và Frustration phản ánh các khía cạnh khác nhau của trải nghiệm. Một nhóm có thể thấy cần nhiều nỗ lực hơn nhưng vẫn không đánh giá gánh nặng chung cao hơn. Vì biểu mẫu của nghiên cứu là phiên bản điều chỉnh từ NASA-TLX và không gồm đầy đủ quy trình trọng số chuẩn, kết quả chỉ được dùng để mô tả trải nghiệm sau phiên, không được gọi là điểm NASA-TLX chuẩn hóa.",
"Quy tắc làm sạch dữ liệu là một giới hạn phương pháp quan trọng. Các ngưỡng thời gian 2, 3 và 4 giây được áp dụng cho A, B và C; một phiên được giữ đến trước chuỗi ba phản hồi liên tiếp dưới ngưỡng nếu còn ít nhất mười hồ sơ hợp lệ. So sánh trước và sau làm sạch cho thấy các tỷ lệ thay đổi về mức tuyệt đối, nhưng thứ tự mô tả giữa các nhóm không đảo chiều. Phân tích độ nhạy này không chứng minh quy tắc là tối ưu, song giúp minh bạch hóa ảnh hưởng của quyết định hậu xử lý.",
"Về hàm ý thiết kế, một giao diện XAI nên ưu tiên hỗ trợ người dùng xác định thông tin cần kiểm tra hơn là chỉ tăng lượng chi tiết kỹ thuật. Các thành phần như biểu đồ đóng góp, diễn giải ngôn ngữ tự nhiên và mô phỏng giả định có thể hữu ích, nhưng cần được sắp xếp theo trình tự nhiệm vụ và chỉ xuất hiện khi người dùng cần. Một hướng thử nghiệm phù hợp là yêu cầu người dùng chỉ ra một yếu tố hồ sơ ủng hộ hoặc mâu thuẫn với đề xuất trước khi xác nhận ở các tình huống rủi ro.",
"Cuối cùng, nghiên cứu không đánh giá chính sách cấp tín dụng hay hiệu năng thương mại của mô hình. Ground truth trong thí nghiệm là đáp án của kịch bản mô phỏng; các hồ sơ và lỗi AI được thiết kế nhằm tạo tình huống tương tác có kiểm soát. Những kết quả đạt được vì thế có giá trị như dữ liệu thăm dò cho thiết kế nghiên cứu người - AI, đồng thời cung cấp cơ sở để triển khai thử nghiệm tiếp theo với mẫu lớn hơn, phân nhóm ngẫu nhiên, kịch bản đối trọng và thước đo hiểu biết đầy đủ hơn."
,
"Một điểm cần lưu ý là confidence hiển thị trong giao diện là đầu ra của mô hình trong môi trường mô phỏng. Confidence có thể tạo cảm giác chắc chắn, nhưng không thay thế việc kiểm tra các yếu tố trong hồ sơ. Trong các kịch bản mâu thuẫn, người tham gia vẫn cần cân nhắc tín hiệu được đưa vào nhiệm vụ thay vì coi phần trăm confidence là căn cứ duy nhất. Cách nhìn này phù hợp với mục tiêu hỗ trợ quyết định: AI cung cấp thông tin, còn trách nhiệm phán đoán cuối cùng vẫn thuộc về con người.",
"Việc trình bày song song kết quả hành vi, chi phí thời gian và tự báo cáo cũng giúp giảm nguy cơ đánh giá giao diện chỉ theo một tiêu chí. Một điều kiện có thể tạo ra nhiều thao tác hơn nhưng không cải thiện quyết định; một điều kiện khác có thể tạo ra tải chủ quan thấp hơn nhưng chưa chắc giúp người dùng phát hiện mâu thuẫn. Vì vậy, các tiêu chí cần được đọc như một tập bằng chứng bổ sung thay vì được dùng để xếp hạng tuyệt đối các giao diện.",
"Ở cấp độ triển khai, dữ liệu ghi nhận theo phiên và theo hồ sơ tạo điều kiện để kiểm tra lại các phép tính mô tả. Mỗi tỷ lệ có thể truy về nhóm giao diện, scenario_id, lựa chọn người dùng và quy tắc giữ lại dữ liệu. Cách tổ chức này có ích cho các lần thử nghiệm sau vì cho phép thay đổi cách tổng hợp mà không làm mất dấu vết ban đầu. Đồng thời, các trường chi tiết có khả năng nhận diện người tham gia chỉ nên được sử dụng ở mức cần thiết và không công bố nguyên văn.",
"Một nghiên cứu tiếp theo có thể cải thiện thiết kế bằng cách đối trọng thứ tự hồ sơ. Trong dữ liệu hiện tại, vị trí của kịch bản là cố định nên thời gian hoặc tỷ lệ trùng đáp án có thể chịu ảnh hưởng của việc làm quen, mệt mỏi hoặc chiến lược trả lời thay đổi theo tiến trình. Đối trọng thứ tự, hoặc mô hình hóa rõ vị trí hồ sơ, sẽ giúp tách tốt hơn tác động của giao diện khỏi tác động của quá trình tham gia.",
"Ngoài ra, cần kiểm tra hiểu biết về ý nghĩa của hai nút quyết định trước khi bắt đầu nhiệm vụ. Trong hệ thống, “từ chối đề xuất AI” là bác bỏ khuyến nghị của hệ thống chứ không luôn đồng nghĩa với từ chối khoản vay. Một câu hỏi kiểm tra hiểu biết có đủ quan sát sẽ giúp phân biệt sai sót thao tác với việc người dùng thực sự lựa chọn khác chuẩn kịch bản. Đây là điều kiện quan trọng để các nghiên cứu tiếp theo diễn giải chính xác hơn chỉ báo phụ thuộc vào AI."
,
"Từ góc độ quản trị nghiên cứu, việc công bố rõ giới hạn dữ liệu cũng quan trọng như việc trình bày kết quả tích cực. Mẫu phân tích nhỏ, số phiên không cân bằng và điều kiện giao diện thay đổi theo gói thành phần khiến nghiên cứu phù hợp với mục tiêu thăm dò. Các kết quả được sử dụng để đề xuất câu hỏi và phương án thiết kế mới, không phải để khẳng định một giao diện có hiệu quả phổ quát. Cách diễn giải này giữ cho đóng góp của khóa luận phù hợp với bằng chứng thu thập được.",
"Nhìn chung, môi trường thực nghiệm đã cho phép quan sát đồng thời quyết định, thời gian, dấu vết tương tác và trải nghiệm chủ quan. Đây là nền tảng cần thiết để đánh giá XAI theo hành vi nhiệm vụ thay vì chỉ dựa vào sự hiện diện của biểu đồ hoặc lời giải thích. Những dữ liệu này có thể được mở rộng trong tương lai bằng mẫu lớn hơn và quy trình tiền đăng ký, qua đó tạo cơ sở vững chắc hơn cho các kết luận về giao diện hỗ trợ ra quyết định."
]
prev = head
for t in paras:
    prev = insert_after(prev, t); fmt(prev)

# Remove duplicate bibliography entries [13] and [15]; citations remain valid through originals [7] and [5].
for p in list(d.paragraphs):
    if p.text.strip().startswith('[13] T. Kulesza') or p.text.strip().startswith('[15] T. Miller'):
        p._element.getparent().remove(p._element)

d.save(out)
print(out)
