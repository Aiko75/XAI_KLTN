from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION_START
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "NEU_FIT_thesis_template.docx"
OUTPUT = ROOT / "KLTN_Tran_Ngoc_Nhan_Ban_mo_rong.docx"

TITLE = (
    "NGHIÊN CỨU TÁC ĐỘNG CỦA GIAO DIỆN TRÍ TUỆ NHÂN TẠO CÓ THỂ "
    "GIẢI THÍCH ĐỐI VỚI THIÊN KIẾN TỰ ĐỘNG HÓA TRONG HỖ TRỢ "
    "RA QUYẾT ĐỊNH TÍN DỤNG"
)
AUTHOR = "TRẦN NGỌC NHÂN"
SUPERVISOR = "NGUYỄN HÙNG VIỆT"


def cover_images():
    """Update the supplied FIT cover artwork with the student's required spine data."""
    out = ROOT / "assets" / "covers"
    out.mkdir(parents=True, exist_ok=True)
    first = out / "page-1.png"
    second = out / "page-2.png"
    if first.exists() and second.exists():
        return [first, second]
    source = ROOT / "assets" / "covers"
    font = ImageFont.truetype(r"C:\Windows\Fonts\times.ttf", 18)
    bold = ImageFont.truetype(r"C:\Windows\Fonts\timesbd.ttf", 20)
    first = Image.open(source / "page-1.png").convert("RGB")
    draw = ImageDraw.Draw(first)
    draw.rectangle((55, 135, 155, 1040), fill="white")
    for y, value in [(145, "2026-2027.1"), (450, "CÔNG NGHỆ THÔNG TIN"), (750, "TRẦN NGỌC NHÂN"), (1005, "11236173")]:
        layer = Image.new("RGBA", (300, 32), "white")
        ImageDraw.Draw(layer).text((2, 2), value, font=bold, fill="black")
        first.paste(layer.rotate(90, expand=True), (75, y), layer.rotate(90, expand=True))
    first.save(out / "page-1.png")
    second = Image.new("RGB", Image.open(source / "page-2.png").size, "white")
    draw = ImageDraw.Draw(second)
    title_font = ImageFont.truetype(r"C:\Windows\Fonts\timesbd.ttf", 34)
    body_font = ImageFont.truetype(r"C:\Windows\Fonts\times.ttf", 22)
    w, h = second.size
    def center(text, y, font):
        box = draw.textbbox((0, 0), text, font=font)
        draw.text(((w - (box[2] - box[0])) / 2, y), text, font=font, fill="black")
    center("ĐẠI HỌC KINH TẾ QUỐC DÂN", 65, title_font)
    center("TRƯỜNG CÔNG NGHỆ", 115, title_font)
    center("KHÓA LUẬN TỐT NGHIỆP", 205, ImageFont.truetype(r"C:\Windows\Fonts\timesbd.ttf", 48))
    center("NGHIÊN CỨU TÁC ĐỘNG CỦA GIAO DIỆN TRÍ TUỆ NHÂN TẠO", 300, title_font)
    center("CÓ THỂ GIẢI THÍCH ĐỐI VỚI THIÊN KIẾN TỰ ĐỘNG HÓA", 345, title_font)
    center("TRONG HỖ TRỢ RA QUYẾT ĐỊNH TÍN DỤNG", 390, title_font)
    for y, text in [(500, "Tên sinh viên       : Trần Ngọc Nhân"), (540, "Mã sinh viên        : 11236173"), (580, "Lớp                : IT65B"), (620, "Ngành              : Công nghệ thông tin"), (660, "Khoa               : Công nghệ thông tin"), (700, "Giảng viên hướng dẫn: Nguyễn Hùng Việt")]:
        draw.text((210, y), text, font=body_font, fill="black")
    center("Hà Nội, 2026", 880, body_font)
    second.save(out / "page-2.png")
    return [out / "page-1.png", out / "page-2.png"]


def set_run_font(run, size=None, bold=None, italic=None):
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.color.rgb = RGBColor(0, 0, 0)
    if size:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def clear_paragraph(p):
    p._p.clear_content()


def set_text(p, text, size=None, bold=None, align=None, italic=None):
    clear_paragraph(p)
    r = p.add_run(text)
    set_run_font(r, size=size, bold=bold, italic=italic)
    if align is not None:
        p.alignment = align
    return p


def set_update_fields(doc):
    settings = doc.settings.element
    update = settings.find(qn("w:updateFields"))
    if update is None:
        update = OxmlElement("w:updateFields")
        settings.append(update)
    update.set(qn("w:val"), "true")


def set_spacing(p, before=0, after=0, line=1.3):
    fmt = p.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing = line


def normal(doc, text, first_line=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent = Cm(1.0 if first_line else 0)
    set_spacing(p, after=5)
    r = p.add_run(text)
    set_run_font(r, size=13)
    return p


def heading(doc, text, level=1, include_toc=True):
    # Use native Heading styles so Word can generate the table of contents.
    p = doc.add_paragraph(style=f"Heading {level}" if include_toc else None)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if level == 1 else WD_ALIGN_PARAGRAPH.LEFT
    set_spacing(p, before=12 if level == 1 else 8, after=6)
    r = p.add_run(text)
    set_run_font(r, size=18 if level == 1 else 13, bold=True)
    p.paragraph_format.keep_with_next = True
    return p


def front_heading(doc, text):
    return heading(doc, text, include_toc=False)


def add_field(doc, instruction, placeholder):
    """Insert a Word field that Word/LibreOffice can update on open."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.first_line_indent = Cm(0)
    set_spacing(p, after=0)
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = instruction
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text_run = p.add_run(placeholder)
    set_run_font(text_run, size=13)
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    p.runs[0]._r.append(begin)
    p.runs[0]._r.append(instr)
    p.runs[0]._r.append(separate)
    p.runs[0]._r.append(end)
    return p


def bullet(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(0.75)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    set_spacing(p, after=3)
    r = p.add_run("• " + text)
    set_run_font(r, size=13)
    return p


def table(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = h
        for p in c.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                set_run_font(r, size=11, bold=True)
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = value
            for p in cells[i].paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if i else WD_ALIGN_PARAGRAPH.CENTER
                for r in p.runs:
                    set_run_font(r, size=11)
    if widths:
        for row in t.rows:
            for i, width in enumerate(widths):
                row.cells[i].width = Cm(width)
    doc.add_paragraph()
    return t


def caption(doc, text, source=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    set_spacing(p, after=1, line=1.15)
    r = p.add_run(text)
    set_run_font(r, size=11, italic=True)
    # FIT formatting places a table title above its table, while a figure
    # caption remains below the image. Tables are emitted immediately before
    # their caption in this builder, so relocate only table titles in OOXML.
    if text.startswith("Bảng") and doc.tables:
        doc.tables[-1]._element.addprevious(p._p)
    if source:
        src = doc.add_paragraph()
        src.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_spacing(src, after=5, line=1.0)
        r = src.add_run(source)
        set_run_font(r, size=10, italic=True)


def add_figure(doc, image_path, figure_text, width=14.3, crop_top=0):
    """Embed a UI screenshot; crop only the internal test toolbar when needed."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_together = True
    shape = p.add_run().add_picture(str(image_path), width=Cm(width))
    if crop_top:
        blip_fill = shape._inline.graphic.graphicData.pic.blipFill
        src_rect = OxmlElement("a:srcRect")
        src_rect.set("t", str(crop_top))
        blip_fill.insert(1, src_rect)
    caption(doc, figure_text, "Nguồn: Tác giả chụp từ hệ thống thực nghiệm.")


def add_page_number(section):
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run()
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = "PAGE"
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)
    set_run_font(run, size=12)


def remove_paragraphs_from(doc, start_index):
    for p in list(doc.paragraphs[start_index:]):
        p._element.getparent().remove(p._element)


def compact_cover_spacers(paragraphs, indices):
    for idx in indices:
        p = paragraphs[idx]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = Pt(1)


def main():
    # Use rendered pages of the official NEU template for the covers. A clean
    # body avoids inheriting unused section breaks from the sample document.
    doc = Document()
    cover_paths = cover_images()
    for index, cover_path in enumerate(cover_paths):
        cover_section = doc.sections[-1]
        cover_section.top_margin = Cm(0)
        cover_section.bottom_margin = Cm(0)
        cover_section.left_margin = Cm(0)
        cover_section.right_margin = Cm(0)
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.add_run().add_picture(str(cover_path), width=Cm(21), height=Cm(29.7))
        doc.add_section(WD_SECTION_START.NEW_PAGE)

    sec = doc.sections[-1]
    sec.top_margin = Cm(2.5)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin = Cm(3.5)
    sec.right_margin = Cm(2.5)
    add_page_number(sec)

    # The two reports consulted from the official FIT archive both place the
    # automatically generated contents and lists before the main body.
    front_heading(doc, "MỤC LỤC")
    add_field(
        doc,
        'TOC \\o "1-2" \\h \\z \\u',
        "LỜI CAM ĐOAN\t\t\t\t5\n"
        "LỜI CẢM ƠN\t\t\t\t6\n"
        "TÓM TẮT\t\t\t\t\t7\n"
        "DANH MỤC CÁC TỪ VIẾT TẮT\t\t\t8\n"
        "DANH MỤC BẢNG\t\t\t\t9\n"
        "DANH MỤC HÌNH\t\t\t\t10\n"
        "MỞ ĐẦU\t\t\t\t\t11\n"
        "CHƯƠNG 1. TỔNG QUAN VỀ BÀI TOÁN NGHIÊN CỨU\t14\n"
        "1.1. Hỗ trợ ra quyết định tín dụng dựa trên trí tuệ nhân tạo\t14\n"
        "1.2. Thiên kiến tự động hóa trong tương tác người – máy\t14\n"
        "1.3. Vai trò và giới hạn của giao diện XAI\t14\n"
        "1.4. Khoảng trống nghiên cứu và định hướng của đề tài\t14\n"
        "1.5. Đóng góp dự kiến của khóa luận\t14\n"
        "CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ KHUNG NGHIÊN CỨU\t16\n"
        "2.1. Hệ thống hỗ trợ ra quyết định và tương tác người - AI\t16\n"
        "2.2. Trí tuệ nhân tạo có thể giải thích\t16\n"
        "2.2.1. Giải thích theo thuộc tính và SHAP\t17\n"
        "2.2.2. Tính đầy đủ, tính dễ hiểu và chi phí nhận thức\t17\n"
        "2.3. Thiên kiến tự động hóa và phụ thuộc quá mức\t18\n"
        "2.4. Niềm tin được hiệu chỉnh và mô hình tinh thần\t18\n"
        "2.5. Tải nhận thức và NASA-TLX\t19\n"
        "2.6. Khung khái niệm cho nghiên cứu\t20\n"
        "CHƯƠNG 3. THIẾT KẾ NGHIÊN CỨU VÀ MÔI TRƯỜNG THỰC NGHIỆM\t21\n"
        "3.1. Mục tiêu và logic thiết kế\t21\n"
        "3.2. Biến nghiên cứu và thao tác hóa\t21\n"
        "3.3. Quy trình tham gia\t22\n"
        "3.4. Các điều kiện giao diện giải thích\t24\n"
        "3.5. Thu thập dữ liệu và thước đo tải công việc\t27\n"
        "3.6. Kế hoạch xử lý dữ liệu và giới hạn\t29\n"
        "CHƯƠNG 4. KẾT QUẢ THỰC NGHIỆM VÀ THẢO LUẬN\t30\n"
        "4.1. Bộ dữ liệu và quy tắc làm sạch\t30\n"
        "4.2. Khả năng phát hiện khuyến nghị AI sai\t30\n"
        "4.3. Thời gian và dấu vết tương tác\t31\n"
        "4.4. Tải công việc tự báo cáo\t32\n"
        "4.5. Thảo luận kết quả\t32\n"
        "CHƯƠNG 5. KẾT LUẬN VÀ ĐỊNH HƯỚNG NGHIÊN CỨU\t34\n"
        "5.1. Kết luận\t34\n"
        "5.2. Giới hạn của nghiên cứu\t34\n"
        "5.3. Định hướng nghiên cứu tiếp theo\t35\n"
        "TÀI LIỆU THAM KHẢO\t\t\t\t36",
    )

    doc.add_page_break()
    front_heading(doc, "LỜI CAM ĐOAN")
    normal(doc, "Tôi xin cam đoan khóa luận tốt nghiệp với đề tài “Nghiên cứu tác động của giao diện trí tuệ nhân tạo có thể giải thích đối với thiên kiến tự động hóa trong hỗ trợ ra quyết định tín dụng” là công trình nghiên cứu do tôi thực hiện dưới sự hướng dẫn của giảng viên hướng dẫn. Các nội dung, số liệu và kết quả sử dụng trong khóa luận được trình bày trung thực; các tài liệu tham khảo đã được trích dẫn đầy đủ theo quy định.")
    normal(doc, "Tôi chịu trách nhiệm về tính chính xác và trung thực của nội dung khóa luận.")
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    set_text(p, "Hà Nội, năm 2026\nSinh viên\n\n\nTrần Ngọc Nhân", size=13, align=WD_ALIGN_PARAGRAPH.RIGHT)

    doc.add_page_break()
    front_heading(doc, "LỜI CẢM ƠN")
    normal(doc, "Trước hết, em xin trân trọng cảm ơn thầy Nguyễn Hùng Việt đã tận tình hướng dẫn, góp ý và định hướng trong quá trình thực hiện khóa luận. Những trao đổi của thầy đã giúp em hoàn thiện cách tiếp cận vấn đề nghiên cứu, thiết kế thực nghiệm và trình bày kết quả.")
    normal(doc, "Em xin cảm ơn các thầy cô Khoa Công nghệ thông tin, Trường Công nghệ, Đại học Kinh tế Quốc dân đã trang bị nền tảng kiến thức và tạo điều kiện cho em thực hiện đề tài. Em cũng cảm ơn những người tham gia thử nghiệm đã dành thời gian thực hiện các tình huống đánh giá và cung cấp dữ liệu cho nghiên cứu.")
    normal(doc, "Cuối cùng, em xin cảm ơn gia đình và bạn bè đã luôn động viên, hỗ trợ em trong quá trình học tập và hoàn thành khóa luận.")

    doc.add_page_break()
    front_heading(doc, "TÓM TẮT")
    normal(doc, "Các hệ thống hỗ trợ ra quyết định dựa trên trí tuệ nhân tạo đang được triển khai trong nhiều lĩnh vực có rủi ro cao, trong đó có thẩm định tín dụng. Bên cạnh lợi ích về tốc độ và tính nhất quán, việc người dùng quá phụ thuộc vào khuyến nghị của hệ thống có thể dẫn đến thiên kiến tự động hóa. Khóa luận nghiên cứu tác động của các mức độ giải thích khác nhau trong giao diện trí tuệ nhân tạo có thể giải thích (Explainable Artificial Intelligence – XAI) đối với hành vi ra quyết định của người dùng trong bối cảnh tín dụng.")
    normal(doc, "Nghiên cứu sử dụng môi trường thực nghiệm web mô phỏng nhiệm vụ đánh giá hồ sơ tín dụng. Người tham gia được phân vào một trong ba nhóm giao diện bằng cơ chế thích ứng có kiểm soát số lượng hoàn thành: nhóm A chỉ hiển thị khuyến nghị và độ tin cậy của AI; nhóm B bổ sung biểu đồ đóng góp SHAP và diễn giải ngôn ngữ tự nhiên; nhóm C cung cấp các thành phần giải thích tương tác và ngữ cảnh. Mỗi người tham gia xử lý 20 kịch bản, trong đó có các kịch bản AI đưa ra khuyến nghị sai có chủ đích. Các chỉ báo quan sát gồm tính đúng đắn của quyết định, thời gian phản hồi, thước đo tải công việc điều chỉnh từ NASA-TLX và dấu vết tương tác.")
    normal(doc, "Trên 28 phiên được giữ lại sau làm sạch, tỷ lệ quyết định trùng đáp án theo kịch bản mô phỏng ở bốn hồ sơ AI sai là 34,1% ở A, 35,9% ở B và 21,4% ở C. Kết quả mô tả này chưa cho thấy lợi thế rõ ràng của giao diện tương tác phức tạp. Đóng góp của khóa luận là thiết lập một quy trình thực nghiệm có thể tái sử dụng để khảo sát hành vi kiểm tra khuyến nghị, chi phí tương tác và tải công việc; kết quả được diễn giải trong giới hạn của mẫu nghiên cứu và thiết kế thực nghiệm, không mặc định rằng mọi hình thức giải thích đều làm giảm thiên kiến tự động hóa.")
    normal(doc, "Từ khóa: trí tuệ nhân tạo có thể giải thích; thiên kiến tự động hóa; hỗ trợ ra quyết định; thẩm định tín dụng; tương tác người – máy; NASA-TLX.")

    doc.add_page_break()
    front_heading(doc, "DANH MỤC CÁC TỪ VIẾT TẮT")
    table(doc, ["Từ viết tắt", "Diễn giải"], [
        ["AI", "Artificial Intelligence – Trí tuệ nhân tạo"],
        ["XAI", "Explainable Artificial Intelligence – Trí tuệ nhân tạo có thể giải thích"],
        ["HCI", "Human–Computer Interaction – Tương tác người – máy"],
        ["DSS", "Decision Support System – Hệ thống hỗ trợ ra quyết định"],
        ["SHAP", "SHapley Additive exPlanations"],
        ["NASA-TLX", "NASA Task Load Index – Thang đo tải công việc"],
        ["GEE", "Generalized Estimating Equations"],
        ["GLMM", "Generalized Linear Mixed-Effects Model"],
    ], [3.5, 11.5])

    doc.add_page_break()
    front_heading(doc, "DANH MỤC BẢNG")
    add_field(doc, 'TOC \\h \\z \\c "Table"', "Bảng 3.1. Các biến và cách thao tác hóa trong thực nghiệm\t22\nBảng 3.2. Mô tả ba điều kiện giao diện\t24\nBảng 4.1. Dòng dữ liệu từ đăng ký đến mẫu phân tích\t30\nBảng 4.2. Khả năng phát hiện khuyến nghị AI sai theo điều kiện giao diện\t31\nBảng 4.3. Chỉ số thời gian và tương tác theo điều kiện giao diện\t31\nBảng 4.4. Điểm tự báo cáo tải công việc theo nhóm\t32")

    doc.add_page_break()
    front_heading(doc, "DANH MỤC HÌNH")
    add_field(doc, 'TOC \\h \\z \\c "Figure"', "Hình 3.1. Màn hình bắt đầu phiên và thu thập thông tin nền\t23\nHình 3.2. Màn hình xác nhận hoàn thành phiên thực nghiệm\t24\nHình 3.3. Ví dụ giao diện điều kiện A\t25\nHình 3.4. Ví dụ giao diện điều kiện B\t25\nHình 3.5. Tổng quan giao diện điều kiện C\t26\nHình 3.6. Mô phỏng What-if và thông tin toán học\t27\nHình 3.7. Chỉ số mô hình và thao tác quyết định\t27\nHình 3.8. Biểu mẫu kiểm tra hiểu biết và tải công việc\t28\nHình 3.9. Phần còn lại của biểu mẫu tải công việc\t29")

    doc.add_page_break()
    heading(doc, "MỞ ĐẦU")
    heading(doc, "1. Tính cấp thiết của đề tài", level=2)
    normal(doc, "Trí tuệ nhân tạo ngày càng được dùng để hỗ trợ các quyết định có ảnh hưởng trực tiếp đến con người, như đánh giá tín dụng, tuyển dụng, y tế và tư pháp. Trong bối cảnh tín dụng, một khuyến nghị của mô hình có thể giúp chuẩn hóa việc sàng lọc hồ sơ, nhưng cũng có thể làm thay đổi cách người thẩm định phân bổ sự chú ý và chịu trách nhiệm cho quyết định cuối cùng. Khi khuyến nghị tự động được thể hiện với độ tự tin cao hoặc bằng hình thức có vẻ thuyết phục, người dùng có thể chấp nhận nó mà không kiểm tra đầy đủ thông tin nghiệp vụ.")
    normal(doc, "Hiện tượng này thường được gọi là thiên kiến tự động hóa: xu hướng phụ thuộc quá mức vào thông tin hoặc đề xuất của hệ thống tự động. Vấn đề không chỉ xuất hiện khi AI sai; ngay cả một hệ thống có độ chính xác trung bình cao cũng có thể tạo ra rủi ro nếu người dùng không nhận diện được các trường hợp ngoại lệ. Do đó, giá trị của hệ thống hỗ trợ ra quyết định không thể đánh giá chỉ bằng hiệu năng dự báo, mà còn cần xem xét cách giao diện định hình mức độ tin cậy và hành vi phản biện của người sử dụng.")
    normal(doc, "XAI được kỳ vọng hỗ trợ người dùng hiểu căn cứ của dự báo và từ đó hiệu chỉnh niềm tin vào AI. Tuy nhiên, giải thích không mặc nhiên đem lại lợi ích. Một giao diện có quá nhiều biểu đồ, chỉ số hoặc tương tác có thể làm tăng tải nhận thức, phân tán sự chú ý và làm suy giảm chất lượng đánh giá. Vì vậy, câu hỏi cần trả lời không chỉ là “có giải thích hay không”, mà là mức độ và cách tổ chức giải thích nào tác động đến hành vi ra quyết định.")
    heading(doc, "2. Mục tiêu nghiên cứu", level=2)
    normal(doc, "Mục tiêu tổng quát của khóa luận là khảo sát tác động của các mức độ giải thích trong giao diện XAI đến thiên kiến tự động hóa trong nhiệm vụ hỗ trợ ra quyết định tín dụng.")
    bullet(doc, "Thiết kế môi trường thực nghiệm web mô phỏng đánh giá hồ sơ tín dụng có tích hợp khuyến nghị AI và các giao diện XAI với độ phức tạp khác nhau.")
    bullet(doc, "Đo lường sự khác biệt về tính đúng đắn của quyết định, đặc biệt là khả năng nhận diện các trường hợp AI khuyến nghị sai có chủ đích, giữa các nhóm giao diện.")
    bullet(doc, "Phân tích thời gian phản hồi, tải công việc tự báo cáo điều chỉnh từ NASA-TLX và dữ liệu tương tác để làm rõ các đánh đổi giữa minh bạch thông tin và chi phí nhận thức.")
    heading(doc, "3. Câu hỏi nghiên cứu", level=2)
    normal(doc, "RQ1: Mức độ giải thích của giao diện XAI ảnh hưởng như thế nào đến khả năng người dùng phát hiện khuyến nghị sai của AI trong các tình huống thẩm định tín dụng?")
    normal(doc, "RQ2: Độ phức tạp của giao diện XAI ảnh hưởng như thế nào đến thời gian ra quyết định và tải nhận thức tự đánh giá của người dùng?")
    normal(doc, "RQ3: Người tham gia sử dụng các thành phần giải thích bổ sung ở mức độ nào trong điều kiện giao diện tương tác?")
    heading(doc, "4. Đối tượng và phạm vi nghiên cứu", level=2)
    normal(doc, "Đối tượng nghiên cứu là tương tác giữa người dùng và giao diện hỗ trợ ra quyết định tín dụng có tích hợp AI. Nghiên cứu không nhằm xây dựng một mô hình chấm điểm tín dụng để đưa vào vận hành thực tế, cũng không thay thế quy trình thẩm định của tổ chức tài chính. Mô hình dự báo, hồ sơ và các tình huống được sử dụng như thành phần của môi trường thực nghiệm nhằm quan sát hành vi ra quyết định.")
    normal(doc, "Phạm vi thực nghiệm gồm ba mức giao diện XAI, 20 kịch bản hồ sơ tín dụng và các biến quan sát được lưu vết trong một phiên thực hiện. Việc khái quát hóa kết quả cần được giới hạn theo đặc điểm mẫu, kinh nghiệm của người tham gia và điều kiện thực hiện thí nghiệm.")
    heading(doc, "5. Phương pháp nghiên cứu", level=2)
    normal(doc, "Khóa luận kết hợp nghiên cứu tài liệu, phát triển môi trường thực nghiệm và phân tích dữ liệu định lượng. Thiết kế thực nghiệm sử dụng yếu tố giữa các nhóm là kiểu giao diện XAI và yếu tố lặp lại trong từng người tham gia là tính chính xác của khuyến nghị AI. Các dữ liệu quyết định nhị phân, thời gian phản hồi, thước đo tải công việc tự báo cáo và dấu vết tương tác được tổ chức để phân tích mô tả và kiểm định theo mô hình phù hợp với dữ liệu đo lặp lại.")
    heading(doc, "6. Kết cấu khóa luận", level=2)
    normal(doc, "Ngoài phần mở đầu, tài liệu tham khảo và phụ lục, khóa luận gồm năm chương. Chương 1 trình bày tổng quan vấn đề, bối cảnh và khoảng trống nghiên cứu. Chương 2 tổng hợp cơ sở lý thuyết. Chương 3 mô tả thiết kế nghiên cứu và môi trường thực nghiệm. Chương 4 trình bày kết quả và thảo luận. Chương 5 tổng kết đóng góp, giới hạn và định hướng nghiên cứu tiếp theo.")

    doc.add_page_break()
    heading(doc, "CHƯƠNG 1. TỔNG QUAN VỀ BÀI TOÁN NGHIÊN CỨU")
    heading(doc, "1.1. Hỗ trợ ra quyết định tín dụng dựa trên trí tuệ nhân tạo", level=2)
    normal(doc, "Quyết định tín dụng đòi hỏi kết hợp nhiều nguồn thông tin, bao gồm năng lực trả nợ, lịch sử tín dụng, mục đích vay và các chỉ báo rủi ro. Các mô hình học máy có thể khai thác quan hệ phức tạp trong dữ liệu lịch sử để ước lượng xác suất rủi ro và đưa ra khuyến nghị. Tuy nhiên, khuyến nghị thuật toán là đầu vào của quá trình ra quyết định chứ không phải quyết định nghiệp vụ cuối cùng. Người thẩm định vẫn cần kiểm tra sự phù hợp giữa kết quả dự báo, dữ liệu hồ sơ và nguyên tắc quản trị rủi ro.")
    normal(doc, "Khi AI được sử dụng như một công cụ hỗ trợ, giao diện là lớp trung gian quyết định người dùng nhìn thấy gì, theo trình tự nào và hiểu kết quả ra sao. Một giao diện chỉ hiển thị nhãn duyệt hoặc từ chối có thể giúp thao tác nhanh, nhưng không cung cấp căn cứ để kiểm tra. Ngược lại, giao diện có giải thích cần lựa chọn cách biểu đạt phù hợp với năng lực và nhiệm vụ của người dùng.")
    heading(doc, "1.2. Thiên kiến tự động hóa trong tương tác người – máy", level=2)
    normal(doc, "Thiên kiến tự động hóa là khuynh hướng ưu tiên hoặc làm theo khuyến nghị của hệ thống tự động thay vì tự đánh giá thông tin sẵn có. Trong nhiệm vụ giám sát và ra quyết định, thiên kiến này có thể biểu hiện dưới dạng lỗi bỏ sót, khi người dùng không nhận ra dấu hiệu cần xem xét, hoặc lỗi thực hiện, khi người dùng chấp nhận một chỉ dẫn không phù hợp. Trong bối cảnh nghiên cứu này, chỉ báo trung tâm là việc người tham gia đồng ý với khuyến nghị sai có chủ đích của AI ở các hồ sơ bẫy.")
    normal(doc, "Điều cần phân biệt là tin cậy không đồng nghĩa với phụ thuộc mù quáng. Tin cậy được hiệu chỉnh là trạng thái người dùng dựa vào hệ thống khi hệ thống đáng tin và sẵn sàng bác bỏ hoặc kiểm tra thêm khi có dấu hiệu bất thường. Vì vậy, đánh giá giao diện XAI cần đặt cả hai mặt: hỗ trợ người dùng khai thác năng lực của AI và duy trì năng lực phản biện của con người.")
    heading(doc, "1.3. Vai trò và giới hạn của giao diện XAI", level=2)
    normal(doc, "XAI hướng tới việc trình bày cơ sở hoặc yếu tố ảnh hưởng đến một dự báo. Trong ứng dụng tín dụng, giải thích cục bộ có thể cho biết những đặc trưng nào đang đẩy dự báo về phía duyệt hoặc từ chối. Các biểu đồ dựa trên giá trị SHAP là một cách biểu đạt thông dụng vì cho phép mô tả đóng góp tương đối của từng đặc trưng đối với dự báo của một hồ sơ cụ thể.")
    normal(doc, "Tuy nhiên, một giải thích chỉ có ích khi người dùng hiểu được nó, kết nối nó với nhiệm vụ và có thời gian xử lý hợp lý. Các thành phần như biểu đồ lực, ma trận tương quan, mô phỏng thay đổi đầu vào hoặc hội thoại giải thích có thể mở rộng khả năng khám phá, nhưng cũng tăng số lượng thông tin cần tích hợp. Đây là lý do nghiên cứu so sánh các mức độ giao diện thay vì coi XAI là một biến nhị phân.")
    heading(doc, "1.4. Khoảng trống nghiên cứu và định hướng của đề tài", level=2)
    normal(doc, "Nhiều đánh giá XAI tập trung vào độ chính xác của mô hình hoặc mức độ dễ hiểu của từng kỹ thuật giải thích. Góc nhìn HCI bổ sung một câu hỏi khác: khi đặt giải thích vào một nhiệm vụ thực tế, chúng thay đổi hành vi và gánh nặng nhận thức của người sử dụng như thế nào? Trong các nhiệm vụ rủi ro cao, một giao diện được xem là minh bạch vẫn có thể không giúp người dùng phát hiện lỗi nếu cách trình bày làm họ quá tải hoặc tạo cảm giác thẩm quyền quá mức.")
    normal(doc, "Đề tài tiếp cận khoảng trống này thông qua môi trường thẩm định tín dụng mô phỏng có các trường hợp AI đúng và các trường hợp AI sai có chủ đích. Ba nhóm giao diện tạo ra ba mức độ thông tin giải thích: không giải thích, giải thích trực quan cơ bản và giải thích tương tác/ngữ cảnh. Cách bố trí này cho phép quan sát sự đánh đổi giữa quyết định theo đáp án kịch bản mô phỏng và chi phí nhận thức, thay vì chỉ đo lường mức độ hài lòng chung của người dùng.")
    heading(doc, "1.5. Đóng góp dự kiến của khóa luận", level=2)
    bullet(doc, "Đóng góp về phương pháp: mô tả một thiết kế thực nghiệm có kiểm soát để đo lường thiên kiến tự động hóa trong bối cảnh hỗ trợ ra quyết định tín dụng.")
    bullet(doc, "Đóng góp về hệ thống: cung cấp môi trường thực nghiệm web lưu vết quyết định, thời gian phản hồi, hành vi khai thác thông tin và tự đánh giá NASA-TLX.")
    bullet(doc, "Đóng góp về thực nghiệm: phân tích dữ liệu để làm rõ điều kiện mà các mức giải thích khác nhau có thể hỗ trợ hoặc cản trở niềm tin được hiệu chỉnh.")
    normal(doc, "Các đóng góp trên được hiểu trong phạm vi của nghiên cứu thực nghiệm. Chúng không phải là tuyên bố rằng một giao diện cụ thể là giải pháp tối ưu cho mọi tổ chức tín dụng hoặc mọi nhóm người dùng.")
    heading(doc, "1.8. Phạm vi diễn giải của kết quả", level=2)
    normal(doc, "Đề tài được giới hạn ở hành vi ra quyết định trong một môi trường web mô phỏng. Người tham gia thực hiện nhiệm vụ trên các hồ sơ đã được cấu trúc sẵn, không chịu trách nhiệm tài chính hay pháp lý như trong một tổ chức tín dụng thực tế. Vì vậy, kết quả không được hiểu là đánh giá năng lực cấp tín dụng của người tham gia, chất lượng của một ngân hàng, hoặc tính công bằng của một mô hình dùng trong vận hành.")
    normal(doc, "Thuật ngữ “AI sai” trong khóa luận chỉ mô tả sự khác nhau giữa ai_prediction và ground_truth đã được quy ước trong tệp kịch bản. Thuật ngữ này thuận tiện để mô tả tình huống thực nghiệm nhưng không khẳng định rằng mô hình vi phạm một tiêu chuẩn tín dụng bên ngoài nghiên cứu. Tương tự, quyết định trùng đáp án chỉ là kết quả của việc đối chiếu thao tác người dùng với nhãn nhiệm vụ. Sự phân biệt này giữ cho kết luận về XAI và hành vi người dùng không bị chuyển thành một tuyên bố về nghiệp vụ tín dụng thật.")
    normal(doc, "Các chỉ số thời gian, di chuột, hỏi đáp và thao tác tương tác được dùng để mô tả quá trình sử dụng giao diện. Chúng không cho phép suy ra trực tiếp người dùng đã đọc, hiểu hay tin vào một lời giải thích. Để trả lời các câu hỏi đó, một nghiên cứu tiếp theo cần kết hợp kiểm tra hiểu biết có đủ quan sát, phỏng vấn hồi tưởng hoặc thiết kế thực nghiệm cô lập từng thành phần giải thích. Phạm vi này là cơ sở cho cách đọc thận trọng ở Chương 4 và Chương 5.")
    heading(doc, "1.6. Bối cảnh rủi ro và trách nhiệm trong hỗ trợ tín dụng", level=2)
    normal(doc, "Một quyết định tín dụng không chỉ là kết quả phân loại nhị phân. Trong vận hành thực tế, quyết định còn gắn với việc giải thích hồ sơ, kiểm tra các điều kiện nghiệp vụ, lưu vết căn cứ và trách nhiệm của người có thẩm quyền. Vì vậy, vai trò phù hợp của mô hình trong phạm vi khóa luận là đưa ra một tín hiệu hỗ trợ để người dùng xem xét, không phải tự động thay thế phán đoán nghiệp vụ. Cách đặt vấn đề này giúp phân biệt hiệu năng dự báo của thuật toán với chất lượng của quá trình ra quyết định người - AI.")
    normal(doc, "Khi một hệ thống tự động có vẻ nhất quán và phản hồi nhanh, người dùng có thể coi đầu ra của nó là mặc định hợp lý, đặc biệt khi thời gian xử lý bị giới hạn. Parasuraman và Riley phân biệt các dạng sử dụng, không sử dụng và lạm dụng tự động hóa; trong đó lạm dụng xảy ra khi năng lực của hệ thống hoặc bối cảnh sử dụng bị đánh giá cao hơn thực tế [9]. Với nhiệm vụ tín dụng mô phỏng, nguy cơ tương ứng là người tham gia đồng ý với khuyến nghị chỉ vì nó được trình bày dưới dạng một phán quyết rõ ràng kèm độ tin cậy.")
    normal(doc, "Do đó, nghiên cứu không đánh đồng việc phản biện AI với việc luôn bác bỏ AI. Hành vi mong đợi là người dùng chấp nhận khuyến nghị khi hồ sơ và khuyến nghị nhất quán, nhưng nhận ra hoặc kiểm tra thêm ở những trường hợp có dấu hiệu mâu thuẫn. Khái niệm này gần với tin cậy được hiệu chỉnh: mức tin cậy cần thay đổi theo năng lực, độ không chắc chắn và giới hạn của hệ thống, thay vì giữ nguyên ở mọi tình huống [2], [10].")
    heading(doc, "1.7. Logic đánh giá giao diện theo hành vi nhiệm vụ", level=2)
    normal(doc, "Một giao diện giải thích có thể được đánh giá ở nhiều cấp độ. Cấp độ thứ nhất là khả năng hiển thị thông tin: người dùng có nhìn thấy lý do hoặc yếu tố liên quan hay không. Cấp độ thứ hai là khả năng hiểu: người dùng có thể mô tả đúng vai trò của thông tin đó hay không. Cấp độ thứ ba là hành vi nhiệm vụ: thông tin được dùng như thế nào khi người dùng lựa chọn duyệt hoặc từ chối. Khóa luận ưu tiên cấp độ thứ ba, đồng thời sử dụng các chỉ báo thời gian, thao tác và tự báo cáo để diễn giải bối cảnh của quyết định.")
    normal(doc, "Cách tiếp cận này tránh suy luận rằng một biểu đồ hoặc lời giải thích tốt về mặt hình thức chắc chắn sẽ cải thiện quyết định. Các nghiên cứu về mô hình tinh thần trong nhóm người - AI chỉ ra rằng hiệu quả hợp tác phụ thuộc vào việc người dùng hình thành kỳ vọng đúng về năng lực và giới hạn của mô hình [11]. Vì vậy, thí nghiệm đưa vào các kịch bản AI sai có chủ đích. Nếu người dùng chỉ làm theo đề xuất, kịch bản bẫy sẽ bộc lộ giới hạn của cơ chế kiểm tra đang được giao diện hỗ trợ.")

    doc.add_page_break()
    heading(doc, "CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ KHUNG NGHIÊN CỨU")
    heading(doc, "2.1. Hệ thống hỗ trợ ra quyết định và tương tác người - AI", level=2)
    normal(doc, "Hệ thống hỗ trợ ra quyết định dùng AI thường cung cấp dự báo, khuyến nghị hoặc xếp hạng để con người xem xét trước khi đưa ra quyết định cuối cùng. Trong bối cảnh tín dụng, khuyến nghị có thể hỗ trợ người dùng sàng lọc hồ sơ và nhận diện yếu tố rủi ro. Tuy nhiên, quyết định của con người và đầu ra của mô hình là hai thành phần khác nhau: chất lượng của đội người - AI phụ thuộc không chỉ vào độ chính xác riêng lẻ, mà còn vào việc người dùng biết khi nào nên tiếp nhận hoặc bác bỏ khuyến nghị [11].")
    normal(doc, "Vì vậy, giao diện không chỉ là lớp trình bày kết quả. Cách giao diện sắp xếp khuyến nghị, độ tin cậy, dữ liệu hồ sơ và lời giải thích ảnh hưởng đến thông tin mà người dùng chú ý, thứ tự họ kiểm tra và mức nỗ lực cần thiết để đối chiếu. Trong khóa luận này, môi trường web mô phỏng không được xem là một hệ thống chấm điểm tín dụng vận hành thực tế; nó là công cụ kiểm soát điều kiện trình bày thông tin để quan sát hành vi ra quyết định.")
    normal(doc, "Một nguyên tắc quan trọng là tách độ tin cậy được hiển thị của mô hình khỏi niềm tin của người dùng. Giá trị xác suất hoặc confidence có thể là đầu ra kỹ thuật của mô hình, nhưng không tự chứng minh rằng mô hình được hiệu chuẩn cho một quần thể sử dụng cụ thể. Tương tự, một người dùng tin tưởng nhiều chưa chắc đã ra quyết định tốt. Nghiên cứu về niềm tin vào tự động hóa cho thấy niềm tin chịu tác động đồng thời bởi đặc điểm người dùng, đặc điểm hệ thống và tình huống tương tác [10].")

    heading(doc, "2.2. Trí tuệ nhân tạo có thể giải thích", level=2)
    normal(doc, "Trí tuệ nhân tạo có thể giải thích (XAI) là tập hợp phương pháp và cách trình bày nhằm giúp con người hiểu một dự báo, hành vi hoặc giới hạn của hệ thống AI. Đối với một bài toán dự báo, lời giải thích có thể hướng đến toàn cục, tức là mô tả khuynh hướng chung của mô hình, hoặc cục bộ, tức là lý giải một dự báo trên một hồ sơ cụ thể. Hai mức này không thay thế cho nhau: lời giải thích cục bộ hữu ích khi xem xét một quyết định cụ thể, còn thông tin toàn cục hỗ trợ hình thành hiểu biết về phạm vi hoạt động và giới hạn của mô hình.")
    normal(doc, "Trong tài liệu XAI, giải thích cần được đánh giá trong quan hệ với người nhận, nhiệm vụ và bối cảnh sử dụng chứ không chỉ dựa vào tính sẵn có của một biểu đồ. Miller [15] lập luận rằng nghiên cứu XAI có thể học từ các kết quả về cách con người tạo, chọn và đánh giá lời giải thích. Theo cách nhìn này, một lời giải thích có tính kỹ thuật đúng vẫn có thể không hữu dụng nếu người dùng không hiểu được, không có thời gian xử lý, hoặc không thể liên hệ nó với nhiệm vụ ra quyết định.")

    heading(doc, "2.2.1. Giải thích theo thuộc tính và SHAP", level=2)
    normal(doc, "SHAP (SHapley Additive exPlanations) là một khuôn khổ gán giá trị đóng góp cho từng thuộc tính đối với một dự báo cụ thể. Lundberg và Lee [3] trình bày SHAP như một khuôn khổ thống nhất cho lớp phương pháp gán tầm quan trọng cộng tính; mỗi thuộc tính nhận một giá trị thể hiện đóng góp của nó trong mô hình giải thích. Trong giao diện, các giá trị này có thể được biểu diễn bằng biểu đồ cột hoặc force plot để chỉ ra những thuộc tính đang đẩy dự báo theo các hướng khác nhau.")
    normal(doc, "Cần diễn giải đúng giới hạn của SHAP. Giá trị SHAP mô tả đóng góp theo mô hình và dữ liệu nền được chọn, không phải bằng chứng về quan hệ nhân quả và cũng không phải một quy tắc nghiệp vụ độc lập. Vì vậy, trong nghiên cứu này SHAP là thông tin hỗ trợ để người tham gia kiểm tra khuyến nghị, không phải căn cứ duy nhất để kết luận một hồ sơ nên được duyệt hay từ chối.")

    heading(doc, "2.2.2. Tính đầy đủ, tính dễ hiểu và chi phí nhận thức", level=2)
    normal(doc, "Thiết kế lời giải thích đặt ra một đánh đổi. Thông tin quá ít có thể không giúp người dùng hiểu được cơ sở của khuyến nghị; thông tin quá nhiều hoặc quá kỹ thuật có thể làm tăng nỗ lực diễn giải. Nghiên cứu của Kulesza và cộng sự [13] về mô hình tinh thần của người dùng cuối cho thấy mức độ đầy đủ và tính đúng đắn của giải thích có liên hệ với cách người dùng hình thành hiểu biết về tác nhân thông minh; việc đơn giản hóa quá mức có thể làm tăng mental demand và làm giảm niềm tin vào lời giải thích trong bối cảnh nghiên cứu của họ.")
    normal(doc, "Do đó, không nên suy luận rằng giao diện nhiều thành phần hơn mặc nhiên tốt hơn. Giao diện XAI cần được xem xét theo nhiệm vụ cụ thể: người dùng có thể xác định thông tin liên quan hay không, có phân biệt được tín hiệu mô hình với quy tắc nghiệp vụ hay không, và có đủ thời gian để kiểm tra hay không. Ba điều kiện giao diện của khóa luận tạo ra các mức độ thông tin khác nhau để kiểm tra chính đánh đổi này.")

    heading(doc, "2.3. Thiên kiến tự động hóa và phụ thuộc quá mức", level=2)
    normal(doc, "Thiên kiến tự động hóa là xu hướng người dùng dựa quá mức vào khuyến nghị của hệ thống tự động. Parasuraman và Riley [9] phân biệt misuse, tức phụ thuộc quá mức vào tự động hóa, với disuse, tức bỏ qua hoặc sử dụng dưới mức hệ thống tự động. Trong hỗ trợ ra quyết định, phụ thuộc quá mức có thể làm giảm hoạt động giám sát và khiến người dùng chấp nhận một khuyến nghị không phù hợp.")
    normal(doc, "Parasuraman và Manzey [1] tổng hợp bằng chứng cho thấy automation bias có thể dẫn đến lỗi bỏ sót và lỗi thực hiện khi công cụ hỗ trợ không hoàn hảo. Lỗi bỏ sót là không nhận ra thông tin hoặc dấu hiệu đáng lẽ cần được xem xét; lỗi thực hiện là làm theo chỉ dẫn sai. Trong môi trường của đề tài, chỉ báo vận hành trực tiếp nhất là phản ứng đối với các kịch bản AI sai có chủ đích: người tham gia có kiểm tra thông tin hồ sơ và đưa ra quyết định nghiệp vụ đúng hay đồng ý với khuyến nghị sai của AI.")
    normal(doc, "Cách vận hành trên không đo toàn bộ khái niệm thiên kiến tự động hóa. Nó đo một biểu hiện quan sát được trong một nhiệm vụ mô phỏng có kiểm soát. Kết quả vì vậy cần được diễn giải là bằng chứng về hành vi trong điều kiện thí nghiệm, không phải ước lượng trực tiếp mức thiên kiến của mọi người dùng hay mọi tổ chức tín dụng.")

    heading(doc, "2.4. Niềm tin được hiệu chỉnh và mô hình tinh thần", level=2)
    normal(doc, "Niềm tin được hiệu chỉnh (calibrated trust) là sự tương ứng phù hợp giữa mức dựa vào hệ thống của người dùng và năng lực thực tế của hệ thống trong tình huống đang xét. Trong một hệ thống không hoàn hảo, mục tiêu không phải là tối đa hóa sự đồng thuận với AI. Mục tiêu là người dùng có thể tận dụng khuyến nghị ở trường hợp phù hợp đồng thời nhận diện hoặc kiểm tra thêm ở các trường hợp có dấu hiệu sai lệch.")
    normal(doc, "Khái niệm mô hình tinh thần giúp giải thích cơ chế này. Bansal và cộng sự [11] nhấn mạnh rằng người dùng cần hiểu ranh giới lỗi của AI, tức hiểu điều kiện hoặc loại đầu vào mà AI có thể sai, để quyết định khi nào chấp nhận hay ghi đè khuyến nghị. Môi trường thực nghiệm của khóa luận không giả định rằng người tham gia có thể học đầy đủ ranh giới lỗi thật của một mô hình tín dụng. Thay vào đó, các kịch bản bẫy được dùng để quan sát liệu cách trình bày giải thích có hỗ trợ việc phát hiện mâu thuẫn giữa khuyến nghị AI và thông tin hồ sơ hay không.")
    normal(doc, "Một cảnh báo quan trọng là lời giải thích không bảo đảm tạo ra niềm tin được hiệu chỉnh. Buçinca, Malaya và Gajos [12] báo cáo trong một bối cảnh hỗ trợ quyết định rằng việc thêm giải thích đơn giản không nhất thiết làm giảm phụ thuộc quá mức, và các can thiệp buộc người dùng suy nghĩ kỹ hơn có thể giảm phụ thuộc quá mức nhưng đi kèm đánh đổi về đánh giá chủ quan. Kết quả này củng cố lựa chọn thực nghiệm của đề tài: đánh giá trực tiếp hành vi quyết định, thay vì giả định lợi ích của XAI từ sự hiện diện của lời giải thích.")

    heading(doc, "2.5. Tải nhận thức và NASA-TLX", level=2)
    normal(doc, "Tải nhận thức trong khóa luận được tiếp cận như mức gánh nặng chủ quan mà người tham gia cảm nhận khi thực hiện nhiệm vụ. Đây là một biến liên quan nhưng không đồng nhất với thời gian phản hồi hay chất lượng quyết định: người dùng có thể mất nhiều thời gian nhưng vẫn cảm nhận tải thấp, hoặc ra quyết định nhanh trong khi bỏ qua thông tin quan trọng. Vì vậy, tải nhận thức cần được đo bằng một công cụ riêng thay vì suy luận chỉ từ dấu vết thời gian.")
    normal(doc, "NASA-TLX là công cụ tự đánh giá workload đa chiều. Theo tài liệu chính thức của NASA [14], công cụ này gồm sáu thang: Mental Demand, Physical Demand, Temporal Demand, Performance, Effort và Frustration. Nghiên cứu sử dụng điểm tự đánh giá sau phiên thực nghiệm để mô tả trải nghiệm của người tham gia. Điểm NASA-TLX phản ánh cảm nhận chủ quan, không phải đo trực tiếp hoạt động sinh lý hoặc năng lực nhận thức khách quan.")
    normal(doc, "Trong bối cảnh nhiệm vụ web ngồi trước màn hình, một biểu mẫu có thể được điều chỉnh để phù hợp với ngữ cảnh nghiên cứu. Việc điều chỉnh cần được báo cáo minh bạch thay vì gọi kết quả là điểm NASA-TLX chuẩn. Chương 3 sẽ nêu cụ thể biểu mẫu triển khai trong hệ thống: năm chiều được kế thừa theo NASA-TLX, một câu hỏi về gánh nặng chung và một câu hỏi kiểm tra hiểu biết; tất cả sử dụng thang 1–7. Khi phân tích, chiều Performance phải được diễn giải theo đúng chiều nghĩa của biểu mẫu, tránh giả định rằng điểm cao luôn có cùng ý nghĩa với các chiều còn lại.")

    heading(doc, "2.6. Khung khái niệm cho nghiên cứu", level=2)
    normal(doc, "Từ các cơ sở trên, nghiên cứu xem kiểu giao diện XAI là điều kiện tác động chính giữa các nhóm. Nhóm A cung cấp khuyến nghị và độ tin cậy; nhóm B bổ sung diễn giải ngôn ngữ tự nhiên và biểu đồ đóng góp SHAP; nhóm C bổ sung các thành phần giải thích tương tác và ngữ cảnh. Tính chính xác của khuyến nghị AI được thay đổi trong các kịch bản của cùng người tham gia, gồm trường hợp AI đúng và trường hợp AI sai có chủ đích.")
    normal(doc, "Các kết quả quan sát gồm tính đúng đắn của quyết định, thời gian phản hồi, thước đo tải công việc tự báo cáo và dấu vết tương tác. Khung này không đặt XAI như một nguyên nhân chắc chắn làm giảm thiên kiến tự động hóa. Thay vào đó, nó kiểm tra thực nghiệm liệu các điều kiện giao diện khác nhau có đi kèm khác biệt về khả năng phát hiện lỗi AI, chi phí thời gian và tải nhận thức hay không. Chương 3 sẽ mô tả chi tiết thao tác hóa biến, kịch bản, quy trình thu thập và kế hoạch phân tích.")
    heading(doc, "2.7. Giải thích cục bộ, mô hình và mức độ quyết định", level=2)
    normal(doc, "Cần phân biệt lời giải thích ở cấp mô hình và cấp dự báo. Giải thích cấp mô hình mô tả xu hướng chung của mô hình trên tập dữ liệu, ví dụ mức độ quan trọng tương đối của các biến. Giải thích cục bộ mô tả tại sao một hồ sơ cụ thể nhận một dự báo cụ thể. Trong giao diện của khóa luận, người dùng xử lý từng hồ sơ tín dụng; vì thế, các biểu đồ đóng góp theo hồ sơ và đoạn diễn giải theo ngữ cảnh là thành phần trung tâm hơn so với một chỉ số tổng quát về hiệu năng mô hình.")
    normal(doc, "SHAP là một họ phương pháp gán đóng góp cho đặc trưng dựa trên tư tưởng giá trị Shapley. Trong cách diễn giải trực quan, các giá trị dương và âm được dùng để biểu thị hướng đóng góp đối với đầu ra đang xét. Tuy nhiên, SHAP không tạo ra quan hệ nhân quả; nó mô tả cách mô hình đang sử dụng đầu vào trong phép dự báo [3]. Do đó, người dùng cần hiểu biểu đồ như một căn cứ để rà soát mô hình, không phải bằng chứng rằng một yếu tố gây ra kết quả tín dụng ngoài đời thực.")
    normal(doc, "Đối với người không phải chuyên gia mô hình, một dải số hoặc đồ thị kỹ thuật có thể chưa đủ để tạo thành lời giải thích hữu ích. Miller lập luận rằng giải thích cần được xem xét trong bối cảnh xã hội và nhu cầu câu hỏi của người nhận [5]. Từ góc nhìn này, nhóm B cung cấp cả biểu đồ và đoạn diễn giải tóm tắt; nhóm C cung cấp thêm khả năng đặt câu hỏi và mô phỏng thay đổi đầu vào. Các điều kiện không chỉ khác nhau về lượng thông tin mà còn khác nhau về cách người dùng có thể truy cập thông tin.")
    heading(doc, "2.8. Tải nhận thức và đánh đổi thông tin", level=2)
    normal(doc, "Tải công việc là một khái niệm đa chiều. Trong NASA-TLX, các chiều như nhu cầu tinh thần, nhu cầu thời gian, nỗ lực, hiệu quả cảm nhận và ức chế được dùng để ghi nhận trải nghiệm thực hiện nhiệm vụ [4]. Khóa luận dùng các câu hỏi được điều chỉnh theo nhiệm vụ, không tính điểm NASA-TLX có trọng số. Vì vậy, từng chiều cần được đọc riêng, thay vì gộp thành một điểm duy nhất rồi kết luận người dùng bị quá tải.")
    normal(doc, "Một giao diện phong phú hơn có thể tạo ra hai tác động trái chiều. Nó có thể giúp người dùng tìm được thông tin liên quan để kiểm tra khuyến nghị; đồng thời, nó buộc người dùng phân bổ chú ý giữa nhiều thành phần và học cách thao tác. Nghiên cứu của Kulesza và cộng sự gợi ý rằng lượng giải thích quá ít hoặc quá nhiều đều có thể không phù hợp với mô hình tinh thần của người dùng [7]. Vì thế, việc đo đồng thời kết quả quyết định, thời gian và thao tác là cần thiết để diễn giải bất kỳ thay đổi nào quan sát được.")

    heading(doc, "2.9. Giá trị đo lường của chỉ báo phụ thuộc vào AI", level=2)
    normal(doc, "Phụ thuộc vào AI là một khái niệm hành vi phức tạp nên không thể được xác định chỉ bằng một tỷ lệ đồng ý. Một người đồng ý với AI có thể làm như vậy sau khi kiểm tra kỹ và thấy khuyến nghị phù hợp; một người bác bỏ AI có thể làm đúng theo kịch bản nhưng cũng có thể chỉ đoán ngẫu nhiên. Vì thế, đánh giá phù hợp nhất là đặt quyết định của người dùng trong mối quan hệ với trạng thái của khuyến nghị: khi AI và đáp án nhiệm vụ cùng hướng, đồng ý với AI là hành vi trùng đáp án; khi hai bên khác hướng, bác bỏ AI mới là hành vi trùng đáp án.")
    normal(doc, "Cách đặt chỉ báo theo hai trạng thái nói trên giúp tách “đồng ý” khỏi “tin cậy được hiệu chỉnh”. Một tỷ lệ đồng ý cao ở mọi hồ sơ có thể là dấu hiệu phụ thuộc quá mức nếu AI sai ở một phần hồ sơ. Ngược lại, tỷ lệ bác bỏ cao ở mọi hồ sơ có thể là biểu hiện không sử dụng hỗ trợ. Mô hình hành vi mong đợi về mặt lý thuyết là mức đồng thuận thay đổi theo bằng chứng: người dùng có thể chấp nhận khi khuyến nghị và thông tin kịch bản nhất quán, đồng thời chuyển sang kiểm tra hoặc bác bỏ khi phát hiện mâu thuẫn.")
    normal(doc, "Trong đề tài, bốn hồ sơ AI sai chỉ tạo ra một chỉ báo gián tiếp cho vế thứ hai của mô hình hành vi này. Chúng không đo được người dùng đã thấy chi tiết nào, tin vào chi tiết đó đến mức nào, hoặc đã dùng quy tắc suy luận nào. Vì vậy, kết quả 35/111 lượt trùng đáp án ở các hồ sơ AI sai không nên được chuyển thành một “điểm thiên kiến tự động hóa” cá nhân. Nó chỉ cho biết tần suất hành vi quan sát được trong bốn tình huống mô phỏng có chủ đích.")
    normal(doc, "Một đánh giá mạnh hơn trong nghiên cứu sau có thể kết hợp ba lớp bằng chứng: kết quả quyết định theo trạng thái của AI; câu hỏi hiểu biết có chấm điểm; và lời giải thích ngắn sau khi ra quyết định. Nếu có đủ mẫu, mô hình thống kê ở cấp lượt phản hồi cũng có thể xét sự phụ thuộc lặp lại trong cùng người tham gia, vị trí kịch bản và confidence. Khóa luận không thực hiện các phân tích này vì cỡ mẫu và dữ liệu hiện có không đáp ứng yêu cầu suy luận tương ứng.")

    heading(doc, "2.10. Giá trị sinh thái, đạo đức và giới hạn của mô phỏng", level=2)
    normal(doc, "Mô phỏng giúp kiểm soát các yếu tố mà dữ liệu tín dụng thật thường khó cung cấp cho một nghiên cứu HCI: người tham gia nhận cùng cấu trúc nhiệm vụ, các trạng thái đúng/sai của AI được xác định trước và không cần xử lý thông tin định danh hoặc hồ sơ tài chính thật. Nhờ vậy, nghiên cứu có thể quan sát hành vi trước một mâu thuẫn được đặt có chủ đích mà không gây hậu quả cho người vay thực.")
    normal(doc, "Đổi lại, giá trị sinh thái của nhiệm vụ bị giới hạn. Một quyết định tín dụng trong thực tế có thể cần thêm hồ sơ, chính sách nội bộ, xác minh dữ liệu, thảo luận giữa các vai trò và cơ chế khiếu nại. Người tham gia trong thí nghiệm cũng có thể có động cơ, mức kiến thức chuyên môn và áp lực thời gian khác với chuyên viên tín dụng. Không nên coi các thao tác trên giao diện là bản sao đầy đủ của quy trình nghiệp vụ.")
    normal(doc, "Ở góc độ đạo đức, việc mô tả trường hợp có nợ xấu, thu nhập hoặc điểm tín dụng trong kịch bản không nhằm kết luận về bất kỳ cá nhân thực nào. Các giá trị được dùng làm thuộc tính của hồ sơ mô phỏng. Khóa luận không đề xuất dùng các yếu tố này để tự động hóa quyết định ngoài thực tế, không đưa ra ngưỡng chấp nhận/từ chối chung, và không đánh giá công bằng theo nhóm nhân khẩu học vì dữ liệu thực nghiệm không được thiết kế cho mục tiêu đó.")
    normal(doc, "Những giới hạn này dẫn đến một nguyên tắc diễn giải: đóng góp của đề tài nằm ở thiết kế và quan sát tương tác người - AI, không nằm ở việc xác nhận một chính sách tín dụng. Khi chuyển sang bối cảnh vận hành, hệ thống cần được kiểm định riêng về hiệu năng, công bằng, quản trị dữ liệu, khả năng giải trình và trách nhiệm quyết định. Các yêu cầu đó vượt ra ngoài phạm vi của khóa luận này.")

    doc.add_page_break()
    heading(doc, "CHƯƠNG 3. THIẾT KẾ NGHIÊN CỨU VÀ MÔI TRƯỜNG THỰC NGHIỆM")
    heading(doc, "3.1. Mục tiêu và logic thiết kế", level=2)
    normal(doc, "Chương này mô tả môi trường thực nghiệm dùng để quan sát sự khác biệt trong hành vi ra quyết định khi cách trình bày thông tin AI thay đổi. Mục tiêu không phải đánh giá một hệ thống chấm điểm tín dụng thương mại, cũng không khẳng định giao diện nào tốt hơn trước khi có dữ liệu. Môi trường được xây dựng như một nhiệm vụ mô phỏng: người tham gia đóng vai trò chuyên viên tín dụng, xem hồ sơ và đưa ra quyết định cuối cùng sau khi tham khảo khuyến nghị của AI.")
    normal(doc, "Thiết kế so sánh ba điều kiện giao diện. Điều kiện A chỉ hiển thị khuyến nghị và mức độ tin cậy; điều kiện B bổ sung phần diễn giải trực quan và ngôn ngữ về các yếu tố đóng góp; điều kiện C bổ sung các thành phần giải thích có thể tương tác. Mỗi người tham gia xử lý một chuỗi 20 hồ sơ. Các hồ sơ có cả trường hợp khuyến nghị AI phù hợp và trường hợp lỗi có chủ đích để đo khả năng người dùng rà soát, thay vì chỉ đo mức độ đồng ý với AI.")
    normal(doc, "Cơ chế phân nhóm hiện thực trong hệ thống theo dõi số lượng người tham gia ở từng điều kiện và sử dụng trọng số giữ chân dự kiến trước khi chọn ngẫu nhiên trong các nhóm có mức phân bổ hiệu dụng thấp nhất. Vì vậy, đây là cơ chế phân bổ thích ứng nhằm hạn chế lệch số lượng hoàn thành, không phải phân bổ ngẫu nhiên thuần túy. Khi diễn giải kết quả, các khác biệt quan sát được cần được gắn với điều kiện giao diện và các biến nền được ghi nhận, tránh suy rộng thành quan hệ nhân quả tuyệt đối.")

    heading(doc, "3.2. Biến nghiên cứu và thao tác hóa", level=2)
    normal(doc, "Biến điều kiện chính là kiểu giao diện XAI mà người tham gia được chỉ định. Các kết quả quan sát gồm quyết định cuối cùng trên từng hồ sơ, khả năng phát hiện khuyến nghị sai trong kịch bản bẫy, thời gian phản hồi, các dấu vết tương tác và tự đánh giá tải công việc sau phiên. Các đại lượng này được dùng bổ sung cho nhau: đồng ý hay từ chối một mình không cho biết người dùng đã suy xét thông tin như thế nào.")
    doc.add_page_break()
    table(doc,
        ["Thành phần", "Thao tác hóa trong môi trường", "Diễn giải dự kiến"],
        [
            ["Điều kiện giao diện", "A: khuyến nghị và độ tin cậy; B: thêm giải thích tĩnh; C: thêm giải thích tương tác và ngữ cảnh.", "Biến so sánh giữa các nhóm."],
            ["Độ chính xác của AI", "Hồ sơ thông thường và hồ sơ bẫy, trong đó khuyến nghị cần bị người dùng rà soát.", "Biến lặp lại theo hồ sơ."],
            ["Quyết định cuối cùng", "Đồng ý hoặc từ chối khuyến nghị trên mỗi hồ sơ.", "Kết quả hành vi chính."],
            ["Chi phí tương tác", "Thời gian phản hồi, thời gian xem XAI, di chuột, hỏi đáp và thao tác trên giao diện.", "Chỉ báo phụ về mức độ xem xét."],
            ["Tải chủ quan", "Biểu mẫu sau phiên theo thang 1–7, được điều chỉnh từ NASA-TLX.", "Trải nghiệm tự báo cáo, không phải chỉ số sinh lý."],
        ],
        widths=[3.1, 7.2, 4.2],
    )
    caption(doc, "Bảng 3.1. Các biến và cách thao tác hóa trong thực nghiệm", "Nguồn: Tác giả tổng hợp từ thiết kế hệ thống.")

    heading(doc, "3.3. Quy trình tham gia", level=2)
    normal(doc, "Phiên thực nghiệm bắt đầu bằng màn hình giới thiệu và thu thập một số thông tin nền tối thiểu: họ tên, mã sinh viên hoặc mã liên hệ, lĩnh vực, tần suất sử dụng công cụ AI và nhóm tuổi. Các trường này hỗ trợ mô tả mẫu và kiểm tra khác biệt nền; chúng không được dùng để thay thế đánh giá tín dụng hoặc tạo khuyến nghị cho hồ sơ mô phỏng.")
    add_figure(doc, ROOT / "assets" / "chapter3" / "onboarding.png", "Hình 3.1. Màn hình bắt đầu phiên và thu thập thông tin nền", crop_top=6000)
    normal(doc, "Sau bước khởi tạo, người tham gia được hướng dẫn nhiệm vụ và thao tác trên giao diện tương ứng với điều kiện đã được phân bổ. Họ lần lượt xử lý các hồ sơ, quan sát khuyến nghị AI, xem thông tin giải thích nếu giao diện cung cấp và đưa ra quyết định cuối cùng. Hệ thống chỉ chuyển sang hồ sơ kế tiếp sau khi quyết định hiện tại được ghi nhận. Cuối phiên, người tham gia hoàn thành biểu mẫu tải công việc và có thể để lại phản hồi mở.")
    normal(doc, "Thời gian phản hồi được tính ở cấp hồ sơ. Hệ thống tách thời gian cửa sổ không còn ở trạng thái hoạt động khỏi thời gian phiên hiển thị để giảm ảnh hưởng của việc chuyển sang ứng dụng khác. Đây là biện pháp làm sạch dữ liệu kỹ thuật, không bảo đảm hoàn toàn rằng mọi gián đoạn ngoài màn hình đã được loại bỏ; vì vậy thời gian cần được xem là chỉ báo gần đúng về nhịp độ xem xét.")
    add_figure(doc, ROOT / "assets" / "chapter3" / "completion.png", "Hình 3.2. Màn hình xác nhận hoàn thành phiên thực nghiệm", crop_top=6000)

    heading(doc, "3.4. Các điều kiện giao diện giải thích", level=2)
    normal(doc, "Ba điều kiện được tổ chức theo mức tăng dần của thông tin giải thích. Việc phân tầng này nhằm tạo phép so sánh có cấu trúc, không giả định rằng nhiều thành phần hơn sẽ luôn tốt hơn. Mỗi thành phần bổ sung có thể tăng khả năng kiểm tra khuyến nghị, đồng thời cũng có thể làm tăng thời gian tìm kiếm thông tin và tải nhận thức.")
    table(doc,
        ["Nhóm", "Nội dung chính", "Mục đích quan sát"],
        [
            ["A", "Khuyến nghị của AI và mức độ tin cậy; thông tin hồ sơ cơ bản.", "Mốc tham chiếu khi ít giải thích."],
            ["B", "Nội dung của A, kèm diễn giải bằng ngôn ngữ tự nhiên và biểu đồ đóng góp SHAP.", "Quan sát tác động của giải thích tĩnh."],
            ["C", "Nội dung của B, kèm hỏi đáp, mô phỏng What-if và chỉ số/ngữ cảnh mô hình.", "Quan sát đánh đổi của giải thích tương tác."],
        ],
        widths=[1.2, 8.6, 4.7],
    )
    caption(doc, "Bảng 3.2. Mô tả ba điều kiện giao diện", "Nguồn: Tác giả tổng hợp từ hệ thống thực nghiệm.")
    normal(doc, "Ở điều kiện A, giao diện giới hạn phần giải thích nhằm bảo toàn vai trò của nhóm tham chiếu. Ở điều kiện B, giải thích tĩnh được trình bày qua thông tin về chiều tác động của đặc trưng, biểu đồ đóng góp và bản tóm tắt bằng ngôn ngữ tự nhiên. Các biểu diễn này giúp người tham gia thấy lý do mô hình nghiêng về một đề xuất, nhưng không tự chứng minh rằng đề xuất đó là đúng.")
    add_figure(doc, ROOT.parent / "assets" / "layout_group_a.png", "Hình 3.3. Ví dụ giao diện điều kiện A", width=14.3)
    add_figure(doc, ROOT.parent / "assets" / "layout_group_b.png", "Hình 3.4. Ví dụ giao diện điều kiện B", width=14.3)
    normal(doc, "Điều kiện C giữ các thông tin cốt lõi của điều kiện B và mở rộng bằng các cơ chế cho phép người dùng đặt câu hỏi, xem mô phỏng thay đổi dữ liệu đầu vào và xem thêm thông tin kỹ thuật của mô hình. Các chức năng này được thiết kế để khuyến khích quá trình kiểm tra giả định. Tuy nhiên, chúng chỉ cung cấp thông tin về mô hình trong bối cảnh mô phỏng; chúng không thay thế quy trình thẩm định tín dụng thực tế.")
    add_figure(doc, ROOT / "assets" / "chapter3" / "group-c-overview.png", "Hình 3.5. Tổng quan giao diện điều kiện C với giải thích SHAP và hỏi đáp", crop_top=6000)
    add_figure(doc, ROOT / "assets" / "chapter3" / "what-if.png", "Hình 3.6. Mô phỏng What-if và phần thông tin toán học của điều kiện C", crop_top=6000)
    add_figure(doc, ROOT / "assets" / "chapter3" / "diagnostics.png", "Hình 3.7. Phần chỉ số mô hình và thao tác quyết định của điều kiện C", crop_top=6000)
    normal(doc, "Các chỉ số và ma trận được hiển thị trong điều kiện C có vai trò là ngữ cảnh giải thích. Chúng không được trình bày trong khóa luận như bằng chứng độc lập về hiệu năng của mô hình: việc đánh giá hiệu năng chỉ có ý nghĩa khi đi kèm dữ liệu, quy trình chia mẫu và tiêu chí đánh giá được báo cáo riêng. Trong nghiên cứu này, trọng tâm là cách người tham gia sử dụng hoặc bỏ qua thông tin đó khi ra quyết định.")

    heading(doc, "3.5. Thu thập dữ liệu và thước đo tải công việc", level=2)
    normal(doc, "Trên mỗi hồ sơ, hệ thống lưu lựa chọn cuối cùng, thời gian phản hồi, số lần di chuột, chi tiết vùng di chuột, số lượt hỏi đáp và lịch sử hỏi đáp (nếu có), thao tác tương tác và một số telemetry giao diện như độ sâu cuộn trang, thời gian xem vùng XAI hoặc thời gian ứng dụng không hoạt động. Các dấu vết này phục vụ phân tích hành vi; không nên tự diễn giải một chỉ số đơn lẻ, chẳng hạn số lần di chuột cao, như dấu hiệu chắc chắn của việc hiểu tốt hơn.")
    normal(doc, "Sau khi hoàn thành chuỗi hồ sơ, người tham gia trả lời một câu hỏi kiểm tra hiểu biết về nút quyết định và sáu câu hỏi tự đánh giá. Năm câu hỏi được đặt theo các chiều Mental Demand, Temporal Demand, Performance, Effort và Frustration của NASA-TLX; một câu hỏi bổ sung đo gánh nặng chung. Mỗi câu hỏi dùng thang 1–7 như ảnh minh họa dưới đây. Vì thiếu chiều Physical Demand chuẩn và có thêm gánh nặng chung, dữ liệu này sẽ được báo cáo là thước đo tải công việc điều chỉnh từ NASA-TLX, không phải điểm NASA-TLX chuẩn hóa [14].")
    add_figure(doc, ROOT / "assets" / "chapter3" / "workload-top.png", "Hình 3.8. Phần đầu biểu mẫu kiểm tra hiểu biết và tải công việc", crop_top=6000)
    add_figure(doc, ROOT / "assets" / "chapter3" / "workload-bottom.png", "Hình 3.9. Phần còn lại của biểu mẫu tải công việc và nút gửi", crop_top=6000)

    heading(doc, "3.6. Kế hoạch xử lý dữ liệu và giới hạn", level=2)
    normal(doc, "Trước khi phân tích, dữ liệu cần được kiểm tra tính đầy đủ ở cấp phiên và cấp hồ sơ; các bản ghi thiếu quyết định hoặc có lỗi kỹ thuật cần được gắn cờ và báo cáo rõ. Trường hợp hồ sơ bẫy được dùng để xác định khả năng không chấp nhận khuyến nghị sai theo quy ước thiết kế. Với các biến đo lặp lại theo người tham gia, phân tích nên báo cáo cả thống kê mô tả theo nhóm và mô hình hoặc kiểm định có xét đến cấu trúc lặp lại. Lựa chọn mô hình cuối cùng cần dựa trên cỡ mẫu thực nhận, phân phối dữ liệu và giả định kiểm định, không ấn định kết quả từ trước.")
    normal(doc, "Một số giới hạn cần được duy trì khi diễn giải. Thứ nhất, tình huống tín dụng là mô phỏng nên không có đầy đủ rủi ro, hồ sơ pháp lý và trách nhiệm của môi trường thật. Thứ hai, cơ chế phân bổ thích ứng không phải ngẫu nhiên thuần túy. Thứ ba, dữ liệu tự báo cáo về tải công việc phản ánh cảm nhận chủ quan. Cuối cùng, các công cụ XAI cho biết hành vi của mô hình trong thiết lập đã triển khai; chúng không tự xác thực dữ liệu đầu vào, loại bỏ thiên lệch dữ liệu hay đảm bảo tính công bằng của quyết định tín dụng.")

    heading(doc, "3.6.1. Quy trình một phiên thực nghiệm và đơn vị phân tích", level=2)
    normal(doc, "Một phiên bắt đầu khi người tham gia đọc hướng dẫn, cung cấp thông tin nền tối thiểu và được hệ thống gán vào một điều kiện giao diện. Sau đó, người tham gia lần lượt xử lý 20 hồ sơ theo thứ tự cố định của môi trường. Trên mỗi hồ sơ, họ xem thông tin hồ sơ, khuyến nghị AI và phần giải thích được phép ở điều kiện của mình, rồi chọn đồng ý hoặc từ chối đề xuất AI. Không có phản hồi đúng/sai được hiển thị trong quá trình làm nhiệm vụ để tránh biến các hồ sơ sau thành một bài học có đáp án trực tiếp.")
    normal(doc, "Đơn vị quan sát cơ bản là một lượt phản hồi trên một hồ sơ. Tuy nhiên, các lượt phản hồi của cùng một người tham gia không độc lập hoàn toàn: chúng cùng chịu ảnh hưởng của kinh nghiệm, tốc độ thao tác và việc làm quen dần với giao diện. Vì vậy, khóa luận báo cáo cả số người, số lượt và mẫu số ở từng tỷ lệ; không coi 111 lượt hồ sơ AI sai là 111 người tham gia độc lập. Khi so sánh nhóm, đơn vị gán điều kiện là người tham gia, còn trạng thái AI đúng/sai thay đổi theo hồ sơ.")
    normal(doc, "Sau hồ sơ thứ 20, người tham gia hoàn thành biểu mẫu tải công việc và có thể để lại ý kiến tự do. Các bản ghi được nối bằng mã phiên. Chuỗi xử lý phân tích gồm: kiểm tra phiên hoàn thành; áp dụng quy tắc giữ lại theo thời gian; xác định trạng thái AI đúng/sai từ tệp kịch bản; sau đó tổng hợp theo nhóm và theo kịch bản. Việc tách các bước này giúp truy vết nguồn của mọi mẫu số trong Chương 4.")
    table(doc, ["Bước", "Đầu vào", "Đầu ra dùng trong phân tích", "Rủi ro cần lưu ý"], [["Gán điều kiện", "Phiên đăng ký", "Nhóm A/B/C của người tham gia", "Không phải ngẫu nhiên thuần túy"], ["Ra quyết định", "20 hồ sơ và giao diện được gán", "Lựa chọn, thời gian, telemetry theo hồ sơ", "Lượt trong cùng người có tính lặp lại"], ["Làm sạch", "Chuỗi thời gian phản hồi", "Tiền tố hợp lệ của phiên", "Ngưỡng 2/3/4 giây khác nhau"], ["Chấm theo kịch bản", "user_decision và ground_truth", "Trùng/không trùng đáp án mô phỏng", "Không phải đúng/sai tín dụng thực tế"]], widths=[3.0, 5.0, 6.4, 4.0])
    caption(doc, "Bảng 3.3. Dòng xử lý dữ liệu từ một phiên đến chỉ báo kết quả", "Nguồn: Tác giả tổng hợp từ quy trình triển khai và mã phân tích của dự án.")
    normal(doc, "Quy trình trên hỗ trợ tái lập phép tính mô tả nhưng không biến nghiên cứu thành thử nghiệm xác nhận. Thứ tự hồ sơ cố định có thể tạo hiệu ứng học hoặc mệt mỏi, còn sự khác biệt giữa các giao diện là sự khác biệt của cả một gói thành phần. Các nguy cơ này được ghi nhận trước khi diễn giải kết quả, thay vì được xử lý bằng các suy luận mà dữ liệu chưa hỗ trợ.")

    heading(doc, "3.7. Kiến trúc ứng dụng và luồng dữ liệu", level=2)
    normal(doc, "Môi trường thực nghiệm được triển khai theo kiến trúc ứng dụng web Next.js với phần giao diện, API và tầng lưu trữ dữ liệu. Người dùng bắt đầu phiên bằng biểu mẫu thông tin nền, sau đó hệ thống tạo một mã người dùng, lựa chọn điều kiện giao diện và trả về dữ liệu cần thiết để hiển thị chuỗi kịch bản. Sau mỗi quyết định, giao diện gửi một bản ghi phản hồi lên API. Khi kết thúc chuỗi 20 hồ sơ, hệ thống ghi thời điểm hoàn thành và lưu câu trả lời khảo sát sau phiên.")
    normal(doc, "Tầng dữ liệu sử dụng ba thực thể chính. Thực thể User lưu mã phiên, điều kiện được gán, thời điểm bắt đầu/kết thúc và một số thông tin nền do người tham gia tự khai. Thực thể ResponseLog lưu một quyết định trên một kịch bản, còn SurveyLog lưu từng câu trả lời khảo sát. Quan hệ một - nhiều từ User tới ResponseLog và SurveyLog cho phép liên kết các quan sát trong cùng một phiên, đồng thời tách dữ liệu định danh khỏi bảng phản hồi khi thực hiện phân tích.")
    table(doc, ["Thực thể", "Vai trò trong thực nghiệm", "Ví dụ trường dữ liệu"], [["User", "Quản lý phiên và điều kiện giao diện", "user_id, group_assigned, start_time, end_time"], ["ResponseLog", "Lưu quyết định và telemetry theo hồ sơ", "scenario_id, user_decision, time_spent_seconds, hover_count"], ["SurveyLog", "Lưu tự báo cáo sau phiên", "question_key, score, created_at"]], widths=[3.0, 6.2, 6.2])
    caption(doc, "Bảng 3.4. Các thực thể dữ liệu chính của môi trường thực nghiệm", "Nguồn: Tác giả tổng hợp từ prisma/schema.prisma.")
    normal(doc, "Ở cấp API, điểm cuối bắt đầu phiên kiểm tra dữ liệu biểu mẫu, thực hiện phân nhóm thích ứng rồi tạo User. Điểm cuối phản hồi kiểm tra mã người dùng, số thứ tự kịch bản, lựa chọn agree hoặc reject và thời gian phản hồi không âm trước khi tạo ResponseLog. Điểm cuối khảo sát chỉ chấp nhận các khóa câu hỏi đã được định nghĩa và điểm trong miền 0 đến 7. Các kiểm tra này không thay thế toàn bộ cơ chế xác thực cho hệ thống thương mại, nhưng giúp dữ liệu thí nghiệm có cấu trúc nhất quán.")
    normal(doc, "Mã dự đoán tại phía ứng dụng nhận tám thuộc tính: tuổi, thu nhập tháng, khoản vay, điểm tín dụng, tỷ lệ tổng nợ trên thu nhập, số lần nợ xấu, lịch sử phá sản và tình trạng việc làm. Tình trạng việc làm được mã hóa trước khi đưa vào mảng đặc trưng. Thành phần Random Forest tính xác suất trung bình qua các cây đã lưu; hệ thống gán đề xuất duyệt khi xác suất từ 0,5 trở lên và hiển thị confidence theo phía quyết định. Mô tả này giải thích hành vi của môi trường mô phỏng, không phải xác nhận mô hình đủ điều kiện sử dụng thương mại.")

    heading(doc, "3.8. Cơ sở thiết lập đáp án theo kịch bản mô phỏng", level=2)
    normal(doc, "Tệp kịch bản cung cấp 20 hồ sơ, trong đó mỗi hồ sơ chứa các thuộc tính đầu vào, dự báo AI, đáp án của nhiệm vụ (trường ground_truth), phần tóm tắt SHAP và các câu hỏi - trả lời gợi ý. Đáp án này là chuẩn đánh giá được quy ước khi xây dựng kịch bản mô phỏng và được lưu trực tiếp trong tệp dữ liệu của thí nghiệm; nó không phải quyết định tín dụng thực tế, cũng không thay thế quy trình thẩm định hoặc chính sách của một ngân hàng. Trong phạm vi dữ liệu hiện có, không có biên bản thẩm định độc lập của chuyên gia tín dụng cho từng hồ sơ. Vì vậy, toàn bộ chương kết quả sử dụng thuật ngữ “quyết định trùng đáp án theo kịch bản mô phỏng”, thay vì gọi đó là quyết định tín dụng “đúng” ngoài đời thực.")
    normal(doc, "Mười sáu hồ sơ normal được thiết kế sao cho ai_prediction nhất quán với ground_truth. Bốn hồ sơ 1, 8, 11 và 16 được đánh dấu trap, trong đó hai trường này cố ý khác nhau. Mục tiêu là tạo các tình huống mâu thuẫn có kiểm soát: người tham gia cần đối chiếu thông tin hồ sơ và, nếu thấy cần thiết, bác bỏ đề xuất AI. Nút “Từ chối đề xuất AI” nghĩa là bác bỏ khuyến nghị của hệ thống, không đồng nghĩa với từ chối khoản vay. Cách phân biệt này đặc biệt quan trọng khi AI đã đề xuất từ chối: bác bỏ AI khi đó tương ứng với quyết định duyệt theo kịch bản mô phỏng.")
    table(doc, ["Kịch bản", "AI đề xuất", "Đáp án mô phỏng", "Dấu hiệu được đưa vào kịch bản", "Thao tác đúng trên giao diện"], [["1", "Từ chối (59%)", "Duyệt", "Điểm tín dụng 696; DTI 21%; không có nợ xấu/phá sản", "Từ chối đề xuất AI"], ["8", "Từ chối (76%)", "Duyệt", "Điểm tín dụng 688; không có nợ xấu/phá sản", "Từ chối đề xuất AI"], ["11", "Duyệt (58%)", "Từ chối", "Có 1 lần nợ xấu trước đó", "Từ chối đề xuất AI"], ["16", "Duyệt (73%)", "Từ chối", "Có 1 lần nợ xấu trước đó", "Từ chối đề xuất AI"]], widths=[1.5, 2.7, 2.6, 6.2, 4.3])
    caption(doc, "Bảng 3.5. Cấu trúc bốn kịch bản AI sai có chủ đích", "Nguồn: Tác giả tổng hợp từ src/data/scenarios.json của môi trường thực nghiệm.")
    normal(doc, "Ví dụ, ở kịch bản 1, AI đề xuất từ chối với confidence 59%, còn đáp án của kịch bản là duyệt. Người tham gia cần nhận ra sự không nhất quán được cài đặt giữa đề xuất từ chối và các dấu hiệu hồ sơ như điểm tín dụng 696, DTI 21%, không có nợ xấu hay phá sản, rồi chọn bác bỏ đề xuất AI. Ngược lại, kịch bản 16 cho AI đề xuất duyệt với confidence 73% nhưng đáp án mô phỏng là từ chối; dấu hiệu mâu thuẫn được đặt ở lịch sử một lần nợ xấu. Hai ví dụ cho thấy “đúng” trong nghiên cứu là đi theo quy ước nhiệm vụ trước một mâu thuẫn được thiết kế, không phải suy diễn một ngưỡng cấp tín dụng chung từ một vài biến số.")
    normal(doc, "Các nhóm không thay đổi danh sách hồ sơ hay câu hỏi quyết định cuối cùng. Khác biệt nằm ở thông tin hỗ trợ được hiển thị cùng hồ sơ. Nhóm A có hồ sơ, phán quyết và confidence. Nhóm B có thêm phần tóm tắt đóng góp và biểu đồ. Nhóm C có thêm giao diện khám phá như force plot, bảng đóng góp, mô phỏng What-if và vùng hỏi đáp. Nhờ giữ lõi nhiệm vụ nhất quán, nghiên cứu tập trung quan sát tác động của cách trình bày thông tin, dù không tách được hoàn toàn ảnh hưởng của từng thành phần trong gói giao diện C.")

    heading(doc, "3.9. Thu thập, xuất và bảo vệ dữ liệu thực nghiệm", level=2)
    normal(doc, "Dữ liệu xuất dùng trong khóa luận gồm ba tệp CSV tương ứng với User, ResponseLog và SurveyLog. Khi xây dựng bảng tổng hợp, mã phiên được dùng để nối các bản ghi; tên, mã liên hệ và phản hồi mở không được đưa vào bảng kết quả. Việc tách tập phân tích khỏi các trường định danh giúp giảm rủi ro công bố thông tin cá nhân không cần thiết trong báo cáo.")
    normal(doc, "Telemetry được lưu theo hai mức. Các trường đếm như hover_count, chat_count và interactive_clicks thuận tiện cho mô tả định lượng. Các trường chi tiết như hover_details, chat_history và telemetry_data có thể chứa cấu trúc JSON hoặc nội dung hội thoại, nên không được trích dẫn nguyên văn trong khóa luận. Chúng chỉ được dùng ở mức tổng hợp hoặc để kiểm tra vận hành. Quyết định này vừa phù hợp với mục tiêu nghiên cứu, vừa hạn chế việc tiết lộ dữ liệu có thể nhận diện người tham gia.")
    normal(doc, "Sau khi kết thúc phiên, người tham gia có thể nhập phản hồi tự do về giao diện. Trường phản hồi này được coi là dữ liệu bổ trợ định tính. Vì bộ dữ liệu dùng cho Chương 4 không đặt trước một quy trình mã hóa định tính và không có báo cáo đầy đủ về số lượng phản hồi mở, khóa luận không rút ra chủ đề định tính từ trường này. Giới hạn này được nêu rõ để tránh diễn giải chọn lọc từ một số phản hồi lẻ.")

    heading(doc, "3.10. Mô hình dự báo trong môi trường mô phỏng", level=2)
    normal(doc, "Mô hình dự báo được dùng để tạo khuyến nghị trong môi trường thực nghiệm là Random Forest. Mục đích của mô hình là cung cấp một đầu ra nhất quán để người tham gia có thể quan sát và phản biện, không phải xây dựng một hệ thống chấm điểm tín dụng đã được phê duyệt để vận hành. Tài liệu kỹ thuật của dự án mô tả quá trình thử nghiệm trên bộ dữ liệu mô phỏng gồm 20.000 hồ sơ, trong đó tám thuộc tính đầu vào được chuẩn hóa về đơn vị và nhãn hiển thị phù hợp với giao diện tiếng Việt.")
    normal(doc, "Quy trình dự báo ở phía ứng dụng duyệt từng cây trong tệp mô hình, lấy giá trị lá tương ứng rồi tính trung bình các xác suất. Ngưỡng 0,5 được dùng để phân định đề xuất duyệt và từ chối. Confidence hiển thị là xác suất theo phía quyết định được chọn: nếu đề xuất duyệt thì dùng xác suất duyệt, còn nếu đề xuất từ chối thì dùng một trừ xác suất duyệt. Cách trình bày này cần được hiểu là thuộc tính đầu ra của mô hình trong thí nghiệm; confidence không phải bảo đảm về độ đúng của từng hồ sơ.")
    normal(doc, "Việc dùng dữ liệu mô phỏng có hai lợi ích đối với thí nghiệm HCI. Thứ nhất, nó cho phép xây dựng các kịch bản có cấu trúc, trong đó thông tin hồ sơ và khuyến nghị AI được kiểm soát. Thứ hai, nó tránh sử dụng dữ liệu tín dụng cá nhân thật trong một nghiên cứu sinh viên. Đổi lại, phân phối dữ liệu, quy tắc nhãn và các chỉ số hiệu năng không đại diện trực tiếp cho khách hàng của bất kỳ tổ chức tín dụng nào. Bởi vậy, các hình dưới đây được dùng để mô tả hệ thống thí nghiệm, không phải chứng nhận năng lực triển khai nghiệp vụ.")
    add_figure(doc, ROOT.parent / "assets" / "roc_curve.png", "Hình 3.10. Đường cong ROC của mô hình Random Forest trên tập kiểm thử mô phỏng", width=13.0)
    normal(doc, "Đường cong ROC là một cách biểu diễn khả năng phân biệt của bộ phân loại khi thay đổi ngưỡng quyết định. Chỉ số ROC-AUC được báo cáo trong tài liệu mô hình là 0,8924 trên tập kiểm thử mô phỏng. Chỉ số này giúp mô tả lý do dự án chọn Random Forest làm nguồn khuyến nghị cho thí nghiệm, nhưng không loại bỏ nhu cầu để người dùng kiểm tra từng trường hợp. Chính các kịch bản bẫy trong nghiên cứu được thiết kế để nhắc rằng một mô hình có chỉ số tổng quát tốt vẫn có thể đưa ra khuyến nghị không phù hợp ở một đầu vào cụ thể.")
    add_figure(doc, ROOT.parent / "assets" / "feature_importance.png", "Hình 3.11. Mức độ quan trọng thuộc tính của mô hình trên dữ liệu mô phỏng", width=13.0)
    normal(doc, "Độ quan trọng thuộc tính là thông tin toàn cục, còn biểu đồ SHAP bên trong giao diện là thông tin cục bộ theo từng hồ sơ. Hai loại thông tin phục vụ các câu hỏi khác nhau. Người tham gia trong điều kiện B và C không được yêu cầu ghi nhớ xếp hạng toàn cục của mô hình; họ được yêu cầu cân nhắc thông tin cụ thể đang xuất hiện ở hồ sơ hiện tại. Sự phân biệt này tránh nhầm lẫn giữa việc biết một biến thường quan trọng với việc hiểu tại sao biến đó tác động theo một hướng nhất định ở một hồ sơ.")
    add_figure(doc, ROOT.parent / "assets" / "confusion_matrix.png", "Hình 3.12. Ma trận nhầm lẫn trên tập kiểm thử mô phỏng", width=12.5)
    normal(doc, "Ma trận nhầm lẫn cho thấy mô hình có cả dự đoán đúng lẫn dự đoán sai trên tập kiểm thử. Về logic nghiên cứu, sự không hoàn hảo này là điều kiện để bài toán tương tác trở nên có ý nghĩa: nếu AI luôn đúng, việc người dùng kiểm tra hay đồng ý sẽ không phân biệt được thiên kiến tự động hóa. Tuy nhiên, các lỗi được đưa vào chuỗi 20 kịch bản được kiểm soát theo đáp án nhiệm vụ, vì vậy chúng không được dùng để ước lượng trực tiếp tỷ lệ lỗi thật của mô hình trên quần thể ngoài thí nghiệm.")
    add_figure(doc, ROOT.parent / "assets" / "model_comparison.png", "Hình 3.13. So sánh các mô hình thử nghiệm trên tập dữ liệu mô phỏng", width=13.0)
    normal(doc, "Tài liệu kỹ thuật của dự án cũng lưu kết quả so sánh Logistic Regression, Decision Tree, Random Forest và XGBoost trên cùng tập dữ liệu mô phỏng. Random Forest được chọn làm mô hình cấp khuyến nghị vì có chỉ số Accuracy và F1 cao nhất trong bảng thử nghiệm của dự án. Quyết định này là quyết định kỹ thuật cho môi trường thí nghiệm; khóa luận không tuyên bố rằng Random Forest luôn là lựa chọn tốt nhất cho mọi bài toán tín dụng, bởi lựa chọn đó còn phụ thuộc dữ liệu, yêu cầu giải trình và chi phí sai lầm cụ thể.")

    doc.add_page_break()
    heading(doc, "CHƯƠNG 4. KẾT QUẢ THỰC NGHIỆM VÀ THẢO LUẬN")
    heading(doc, "4.1. Bộ dữ liệu và quy tắc làm sạch", level=2)
    normal(doc, "Chương này phân tích các tệp xuất của đợt thực nghiệm giai đoạn 2, gồm thông tin phiên người dùng, bản ghi quyết định theo hồ sơ và câu trả lời khảo sát sau phiên. Dữ liệu thô có 46 lượt đăng ký; trong đó 38 người có thời điểm hoàn thành và mỗi người hoàn thành đã có 20 bản ghi quyết định. Phân tích không sử dụng tên, mã liên hệ hoặc phản hồi mở của người tham gia.")
    normal(doc, "Để giảm ảnh hưởng của các lượt trả lời quá nhanh, quy tắc làm sạch theo thời gian của dự án được áp dụng ở cấp người tham gia. Ngưỡng thời gian tối thiểu lần lượt là 2 giây, 3 giây và 4 giây cho các nhóm A, B và C. Khi xuất hiện ba hồ sơ liên tiếp dưới ngưỡng, dữ liệu được giữ đến trước chuỗi đó; phiên chỉ được giữ nếu còn ít nhất 10 hồ sơ hợp lệ. Các ngưỡng khác nhau được đặt theo độ phong phú thao tác tăng dần của ba điều kiện, nhưng trong hồ sơ dự án hiện không có tài liệu tiền đăng ký hoặc thử nghiệm ngưỡng độc lập trước thu thập. Vì vậy, đây được trình bày là quy tắc hậu xử lý của nghiên cứu, không phải tiêu chuẩn đã được chuẩn hóa. Quy tắc này cũng không phải bằng chứng rằng các câu trả lời bị loại là không trung thực.")
    table(doc,
        ["Giai đoạn", "A", "B", "C", "Tổng"],
        [
            ["Đăng ký", "15", "15", "16", "46"],
            ["Hoàn thành 20 hồ sơ", "12", "14", "12", "38"],
            ["Giữ lại để phân tích", "11", "10", "7", "28"],
            ["Bị loại sau làm sạch", "1", "4", "5", "10"],
        ],
        widths=[6.0, 2.4, 2.4, 2.4, 2.4],
    )
    caption(doc, "Bảng 4.1. Dòng dữ liệu từ đăng ký đến mẫu phân tích", "Nguồn: Tác giả tính từ các tệp xuất thực nghiệm giai đoạn 2.")
    normal(doc, "Mẫu cuối cùng có 26 phiên đầy đủ 20 hồ sơ và 2 phiên được giữ một phần theo quy tắc trên. Vì vậy, số quan sát ở một vài chỉ báo cấp hồ sơ không hoàn toàn bằng nhau giữa các nhóm. Tất cả tỷ lệ trong chương được trình bày kèm tử số và mẫu số khi cần thiết; việc này đặc biệt quan trọng với chỉ báo bẫy AI.")

    heading(doc, "4.2. Quyết định trùng đáp án ở các hồ sơ AI sai", level=2)
    normal(doc, "Bốn kịch bản số 1, 8, 11 và 16 được cài đặt là kịch bản AI sai: khuyến nghị của AI khác với đáp án quy ước của nhiệm vụ. Chỉ báo chính là tỷ lệ lượt người tham gia đưa ra lựa chọn trùng đáp án kịch bản mô phỏng, nghĩa là bác bỏ đề xuất AI ở bốn hồ sơ này. Đây là chỉ báo gián tiếp về việc người dùng có thể đã không kiểm tra hoặc không bác bỏ khuyến nghị AI; nó không đo trực tiếp thiên kiến tự động hóa, không xác định động cơ của một quyết định sai, và không phải thước đo năng lực thẩm định tín dụng thực tế.")
    table(doc,
        ["Nhóm", "Số người", "Trùng đáp án / lượt AI sai", "Tỷ lệ", "Không trùng đáp án"],
        [
            ["A", "11", "15 / 44", "34,1%", "65,9%"],
            ["B", "10", "14 / 39", "35,9%", "64,1%"],
            ["C", "7", "6 / 28", "21,4%", "78,6%"],
            ["Toàn mẫu", "28", "35 / 111", "31,5%", "68,5%"],
        ],
        widths=[2.0, 2.5, 4.8, 3.2, 3.0],
    )
    caption(doc, "Bảng 4.2. Quyết định trùng đáp án theo kịch bản mô phỏng ở các hồ sơ AI sai", "Nguồn: Tác giả tính từ bản ghi quyết định đã làm sạch.")
    normal(doc, "Nhóm B có tỷ lệ trùng đáp án cao hơn nhóm A 1,8 điểm phần trăm, nhưng chênh lệch này rất nhỏ. Nhóm C có tỷ lệ thấp hơn hai nhóm còn lại. Vì cỡ mẫu còn nhỏ, số lượt AI sai hữu hiệu không cân bằng và phân nhóm là thích ứng thay vì ngẫu nhiên thuần túy, các số liệu trên chỉ nên được xem là mô tả xu hướng của mẫu; nghiên cứu không dùng chúng để khẳng định ý nghĩa thống kê hoặc quan hệ nhân quả giữa giao diện và hành vi.")
    normal(doc, "Trong các hồ sơ AI sai có 35/111 (31,5%) lượt quyết định trùng đáp án theo kịch bản mô phỏng. Đây là chỉ báo gián tiếp về mức độ người dùng có thể không kiểm tra hoặc không bác bỏ khuyến nghị AI, nhưng không xác định nguyên nhân của một quyết định không trùng đáp án. Do đó, dữ liệu hiện tại không ủng hộ giả định đơn giản rằng chỉ cần bổ sung thông tin giải thích thì sẽ luôn giảm thiên kiến tự động hóa.")

    heading(doc, "4.2.1. Quyết định ở các hồ sơ AI đúng và trên toàn bộ chuỗi", level=2)
    normal(doc, "Để tránh chỉ nhìn vào bốn hồ sơ AI sai, bảng dưới đây báo cáo đồng thời 16 hồ sơ AI đúng và toàn bộ chuỗi 20 hồ sơ. Với 16 hồ sơ AI đúng, lựa chọn đồng ý với AI cũng chính là lựa chọn trùng đáp án mô phỏng; vì vậy hai tỷ lệ này bằng nhau theo chính cấu trúc kịch bản, không phải hai phát hiện độc lập. Việc đặt các nhóm cạnh nhau cho thấy mức độ đồng thuận với AI khi AI đúng và mức độ bác bỏ AI khi AI sai.")
    table(doc, ["Nhóm", "AI đúng: trùng đáp án / lượt", "Đồng ý AI khi AI đúng", "AI sai: trùng đáp án / lượt", "Toàn bộ: trùng đáp án / lượt"], [["A", "112 / 176 (63,6%)", "63,6%", "15 / 44 (34,1%)", "127 / 220 (57,7%)"], ["B", "118 / 152 (77,6%)", "77,6%", "14 / 39 (35,9%)", "132 / 191 (69,1%)"], ["C", "85 / 108 (78,7%)", "78,7%", "6 / 28 (21,4%)", "91 / 136 (66,9%)"]], widths=[1.5, 4.7, 3.8, 4.5, 4.6])
    caption(doc, "Bảng 4.3. Quyết định theo đáp án mô phỏng theo trạng thái đúng/sai của AI", "Nguồn: Tác giả tính từ response_logs_rows.csv sau làm sạch.")
    normal(doc, "Ở cả ba nhóm, tỷ lệ trùng đáp án trong các hồ sơ AI đúng cao hơn đáng kể về mặt mô tả so với bốn hồ sơ AI sai. Mẫu hình này cho thấy người tham gia thường đồng ý với AI trong phần lớn hồ sơ mà AI và đáp án mô phỏng cùng hướng; tuy nhiên, khi đặt vào tình huống mâu thuẫn có chủ đích, tỷ lệ bác bỏ AI thấp hơn. Đây là lý do cần báo cáo song song hai loại hồ sơ thay vì suy luận từ tỷ lệ đồng ý chung rằng người dùng đã tin cậy AI một cách được hiệu chỉnh.")

    heading(doc, "4.2.2. Kiểm tra độ nhạy trước và sau làm sạch", level=2)
    normal(doc, "Bảng 4.4 so sánh chỉ báo ở bốn hồ sơ AI sai trước và sau khi áp dụng quy tắc giữ lại phiên. So sánh này không chứng minh quy tắc làm sạch là tối ưu, nhưng cho biết mức độ phụ thuộc của kết quả vào quyết định hậu xử lý. Ở cả ba nhóm, tỷ lệ sau làm sạch thấp hơn tỷ lệ thô, song thứ tự mô tả giữa các nhóm không thay đổi: B nhỉnh hơn A và C thấp hơn hai nhóm còn lại.")
    table(doc, ["Nhóm", "Trước làm sạch", "Sau làm sạch", "Thay đổi (điểm %)", "Diễn giải"], [["A", "19 / 48 (39,6%)", "15 / 44 (34,1%)", "-5,5", "Giảm nhẹ sau khi bỏ tiền tố phản hồi quá nhanh"], ["B", "21 / 56 (37,5%)", "14 / 39 (35,9%)", "-1,6", "Giảm nhỏ; mẫu số giảm nhiều hơn"], ["C", "11 / 48 (22,9%)", "6 / 28 (21,4%)", "-1,5", "Mẫu sau làm sạch còn 7 phiên"]], widths=[1.4, 3.8, 3.8, 2.7, 6.8])
    caption(doc, "Bảng 4.4. Độ nhạy của chỉ báo hồ sơ AI sai trước và sau làm sạch", "Nguồn: Tác giả tính lại từ response_logs_rows.csv; trước làm sạch chỉ gồm phiên hoàn thành.")
    normal(doc, "Nhóm C đặc biệt cần được đọc thận trọng vì chỉ còn bảy phiên sau làm sạch. Sự khác biệt trong ngưỡng 2/3/4 giây và số phiên giữ lại khiến so sánh giữa nhóm là mô tả vận hành, không đủ mạnh để suy ra hiệu quả của từng thiết kế giao diện. Trong các nghiên cứu tiếp theo, ngưỡng nên được xác định trước, áp dụng cùng một logic có kiểm chứng và đi kèm phân tích độ nhạy như trên.")

    heading(doc, "4.3. Thời gian và dấu vết tương tác", level=2)
    normal(doc, "Thời gian phản hồi được tính bình quân theo hồ sơ hợp lệ của từng người tham gia, sau đó tổng hợp theo nhóm. Số lượt di chuột, hỏi đáp và tương tác là tổng theo phiên. Các chỉ số này phản ánh mức độ thao tác trên giao diện, không trực tiếp chứng minh việc hiểu đúng hay chất lượng suy luận.")
    table(doc,
        ["Nhóm", "Thời gian TB / hồ sơ", "Hover TB / phiên", "Hỏi đáp TB / phiên", "Tương tác TB / phiên"],
        [
            ["A", "21,50 giây", "34,82", "0", "0"],
            ["B", "20,73 giây", "26,50", "0", "0"],
            ["C", "27,84 giây", "243,29", "0,43", "65,71"],
        ],
        widths=[1.5, 3.4, 3.4, 3.8, 3.8],
    )
    caption(doc, "Bảng 4.5. Chỉ số thời gian và tương tác theo điều kiện giao diện", "Nguồn: Tác giả tính từ telemetry và bản ghi quyết định đã làm sạch.")
    normal(doc, "Nhóm C có thời gian trung bình trên mỗi hồ sơ cao hơn khoảng 6–7 giây so với A và B, đồng thời có số lượt di chuột và thao tác cao hơn đáng kể. Mẫu hình này phù hợp với việc giao diện C có thêm thành phần để khám phá, như mô phỏng What-if và hỏi đáp. Tuy nhiên, vì khả năng phát hiện bẫy của nhóm C không cao hơn, không thể diễn giải số tương tác lớn là hiệu quả hơn. Một khả năng là người dùng đã dành thêm thời gian để tìm kiếm hoặc xử lý thông tin; dữ liệu hiện có không đủ để xác định chính xác cơ chế này.")

    heading(doc, "4.4. Tải công việc tự báo cáo", level=2)
    normal(doc, "Các câu hỏi sau phiên được báo cáo theo thang 1–7. Năm chiều Mental Demand, Temporal Demand, Performance, Effort và Frustration được điều chỉnh theo ngữ cảnh từ NASA-TLX; Overall Load là một câu hỏi riêng. Vì vậy, Overall Load không phải trung bình chuẩn hóa của các chiều và các giá trị dưới đây không được gọi là điểm NASA-TLX chuẩn [14]. Chiều Performance có hướng nghĩa tích cực trong biểu mẫu: điểm cao hơn phản ánh người tham gia tự đánh giá hiệu quả hơn.")
    table(doc,
        ["Nhóm", "Mental", "Temporal", "Hiệu quả", "Nỗ lực", "Ức chế", "Gánh nặng\nchung"],
        [
            ["A (n=11)", "4,64", "3,73", "4,55", "4,45", "3,18", "3,82"],
            ["B (n=10)", "3,70", "2,80", "5,20", "3,70", "3,20", "3,30"],
            ["C (n=7)", "4,71", "3,71", "5,00", "4,57", "2,86", "3,14"],
        ],
        widths=[2.5, 2.25, 2.25, 2.4, 2.25, 2.45, 2.65],
    )
    caption(doc, "Bảng 4.6. Điểm tự báo cáo tải công việc theo nhóm (thang 1–7)", "Nguồn: Tác giả tính từ biểu mẫu sau phiên của các mẫu được giữ lại.")
    normal(doc, "Nhóm B có điểm Mental Demand, Temporal Demand và Effort thấp nhất, đồng thời tự đánh giá Performance cao nhất trong mẫu. Nhóm C có Mental Demand và Effort cao hơn, nhất quán với chi phí xử lý thêm thông tin quan sát qua thời gian và thao tác. Mặc dù vậy, Overall Load của nhóm C không cao nhất và Frustration của nhóm này thấp hơn A, B. Các chiều tự báo cáo không hoàn toàn đồng biến nên không nên rút gọn chúng thành một nhận định đơn tuyến về “quá tải”.")
    normal(doc, "Biến kiểm tra hiểu biết về nút quyết định chỉ có một bản ghi trong dữ liệu được xuất. Do chưa đủ quan sát, biến này không được đưa vào so sánh giữa các nhóm. Đây là một hạn chế đo lường cần được khắc phục trước khi dùng kết quả cho các phân tích tiếp theo.")

    heading(doc, "4.5. Thảo luận kết quả", level=2)
    normal(doc, "Kết quả trả lời RQ1 theo hướng thận trọng: trong mẫu này, giải thích tĩnh ở nhóm B đi kèm tỷ lệ quyết định trùng đáp án ở hồ sơ AI sai nhỉnh hơn nhóm A, nhưng mức chênh nhỏ; giao diện tương tác ở nhóm C không cho thấy lợi thế về chỉ báo này. Khi AI và đáp án mô phỏng cùng hướng, tỷ lệ trùng đáp án cao hơn ở cả ba nhóm; do đó, vấn đề quan sát được tập trung ở các tình huống mâu thuẫn được cài đặt. Phát hiện này phù hợp với lập luận rằng một lời giải thích không tự thân tạo ra niềm tin được hiệu chỉnh [11], [12]. Giá trị của XAI phụ thuộc vào việc người dùng nhận diện được thông tin liên quan, hiểu giới hạn của mô hình và có cơ chế chuyển thông tin đó thành hành động kiểm tra.")
    normal(doc, "Đối với RQ2, giao diện C gắn với thời gian và số thao tác cao hơn, trong khi một số chiều tải chủ quan cũng cao hơn. Song các chỉ báo này chưa đủ để khẳng định rằng giao diện C gây quá tải nhận thức: các nhóm có quy mô nhỏ, giao diện C đồng thời thay đổi nhiều thành phần và những người còn lại sau làm sạch có thể khác với những người bị loại. Kết quả phù hợp hơn với cách diễn giải về đánh đổi giữa độ phong phú thông tin và chi phí tương tác, thay vì kết luận một chiều về ưu hoặc nhược điểm của giải thích tương tác.")
    normal(doc, "Đối với RQ3, telemetry cho thấy người dùng nhóm C đã sử dụng các thành phần bổ sung ở mức quan sát được: trung bình 0,43 lượt hỏi đáp và 65,71 thao tác tương tác trên một phiên, trong khi A và B không có các chức năng này. Đây là câu trả lời ở mức độ sử dụng thành phần, không phải bằng chứng về chất lượng suy luận hay về quan hệ nhân quả giữa từng thao tác và quyết định. Phân tích tiếp theo ở cấp hồ sơ, có xét người tham gia lặp lại và loại thao tác, sẽ cần thiết nếu muốn kiểm tra quan hệ đó.")

    heading(doc, "4.6. Phân tích theo từng kịch bản bẫy", level=2)
    normal(doc, "Bảng tổng hợp theo kịch bản dưới đây giữ nguyên đơn vị quan sát là lượt phản hồi hợp lệ. Cả bốn kịch bản đều yêu cầu người tham gia chọn “Từ chối đề xuất AI”, nhưng lý do mâu thuẫn được cài đặt không giống nhau: kịch bản 1 và 8 có AI đề xuất từ chối dù hồ sơ có các dấu hiệu thuận lợi được chỉ ra trong kịch bản; kịch bản 11 và 16 có AI đề xuất duyệt dù lịch sử một lần nợ xấu được đặt làm dấu hiệu cần bác bỏ. Cột “trùng đáp án” là số lượt chọn theo đáp án quy ước thay vì đồng ý với đề xuất AI. Các số liệu không được cộng ngang thành số người duy nhất vì một người có thể xuất hiện ở nhiều kịch bản AI sai.")
    table(doc, ["Kịch bản", "Nhóm A", "Nhóm B", "Nhóm C", "Nhận xét mô tả"], [["1", "5 / 11", "4 / 10", "2 / 7", "Kịch bản đầu phiên có thời gian phản hồi cao hơn ở B và C."], ["8", "4 / 11", "4 / 10", "1 / 7", "Tỷ lệ phát hiện thấp nhất ở C trong bốn bẫy."], ["11", "4 / 11", "5 / 10", "1 / 7", "B có nhiều lượt phát hiện hơn A và C tại kịch bản này."], ["16", "2 / 11", "1 / 9", "2 / 7", "Mẫu số B giảm do một phiên chỉ được giữ một phần."]], widths=[2.0, 2.5, 2.5, 2.5, 7.6])
    caption(doc, "Bảng 4.7. Số lượt trùng đáp án trên từng kịch bản AI sai", "Nguồn: Tác giả tính lại từ phase2_analysis.json và response_logs_rows.csv.")
    normal(doc, "Kịch bản 1: AI đề xuất từ chối với confidence 59%, trong khi kịch bản quy ước duyệt; người tham gia cần nhận ra các tín hiệu thuận lợi đã hiển thị như điểm tín dụng 696, DTI 21% và không có nợ xấu/phá sản để bác bỏ AI. Kết quả trùng đáp án lần lượt là 5/11 ở A, 4/10 ở B và 2/7 ở C. Thời gian phản hồi tại kịch bản này cao hơn ở B và C, nhưng vì đây cũng là hồ sơ đầu phiên, không thể quy thời gian cao trực tiếp cho hiệu quả của lời giải thích.")
    normal(doc, "Kịch bản 8: AI tiếp tục đề xuất từ chối, lần này với confidence 76%, dù kịch bản đặt đáp án duyệt và nêu điểm tín dụng 688, không có nợ xấu/phá sản. Để trùng đáp án, người tham gia vẫn phải bác bỏ AI. Tỷ lệ là 4/11 ở A, 4/10 ở B và 1/7 ở C. Đây là kịch bản có mức trùng đáp án thấp nhất ở C trong bốn hồ sơ AI sai; tuy nhiên, mẫu số nhỏ không cho phép kết luận đây là một khác biệt bền vững của giao diện.")
    normal(doc, "Kịch bản 11: AI đề xuất duyệt với confidence 58%, nhưng kịch bản quy ước từ chối vì có một lần nợ xấu trước đó. Người tham gia cần đặt dấu hiệu lịch sử này cạnh các yếu tố thuận lợi mà AI nhấn mạnh và bác bỏ đề xuất duyệt. Số lượt trùng đáp án là 4/11 ở A, 5/10 ở B và 1/7 ở C. Đây là điểm duy nhất B có số lượt cao hơn rõ rệt theo mô tả, song không lặp lại ở kịch bản 16.")
    normal(doc, "Kịch bản 16: AI đề xuất duyệt với confidence 73%, trong khi kịch bản cũng quy ước từ chối và nhấn mạnh một lần nợ xấu. Số lượt trùng đáp án là 2/11 ở A, 1/9 ở B và 2/7 ở C. Mẫu số B giảm vì một phiên chỉ được giữ một phần theo quy tắc làm sạch. Việc hiển thị mẫu số giúp tránh suy diễn rằng mọi nhóm đều có cùng số cơ hội ở từng kịch bản.")
    normal(doc, "Không có một mẫu hình đồng nhất cho thấy một điều kiện giao diện luôn giúp người tham gia chọn theo đáp án mô phỏng ở mọi dạng mâu thuẫn. B có năm lượt ở kịch bản 11 nhưng chỉ một lượt ở kịch bản 16; hai kịch bản này đều có AI đề xuất duyệt và cùng một dấu hiệu nợ xấu. Điều này cho thấy chỉ báo tổng hợp cần được đọc cùng đặc điểm kịch bản, confidence và vị trí trong phiên. Trong nghiên cứu tiếp theo, các dạng mâu thuẫn và thứ tự kịch bản nên được cân bằng hoặc mô hình hóa rõ ràng hơn.")

    heading(doc, "4.7. Mức độ hoàn thành và chất lượng dữ liệu", level=2)
    normal(doc, "Trong 46 lượt đăng ký, 38 lượt có thời điểm kết thúc và 28 lượt thỏa quy tắc giữ lại để phân tích. Sự suy giảm mẫu không đồng đều: A mất một phiên sau làm sạch, B mất bốn và C mất năm. Đây là một quan sát vận hành quan trọng vì điều kiện C có nhiều thành phần tương tác hơn và cũng có tỷ lệ giữ lại thấp hơn trong tệp xuất. Tuy nhiên, dữ liệu không cho phép kết luận nguyên nhân của việc không hoàn thành hoặc trả lời nhanh; có thể tồn tại nhiều lý do như thiết bị, thời điểm tham gia hoặc đặc điểm người dùng.")
    normal(doc, "Hai phiên được giữ lại một phần vẫn đáp ứng điều kiện có ít nhất mười hồ sơ hợp lệ. Lựa chọn này nhằm bảo toàn các quan sát được ghi nhận trước khi xuất hiện chuỗi bất thường, thay vì loại toàn bộ phiên. Đổi lại, các thống kê theo kịch bản ở nửa sau chuỗi có thể có mẫu số nhỏ hơn. Chương này vì thế dùng hai nguyên tắc trình bày: nêu rõ đơn vị phân tích và luôn giữ tử số/mẫu số đối với các tỷ lệ trung tâm.")
    normal(doc, "Các trường hover_count, chat_count và interactive_clicks được thu thập tự động theo phiên. Chúng là chỉ báo mức sử dụng chức năng, không phải thước đo trực tiếp của hiểu biết. Chẳng hạn, một số lượt di chuột cao có thể phản ánh sự tò mò, khó tìm thông tin hoặc kiểm tra kỹ hơn; không có nhãn hành vi bổ sung để phân biệt các cơ chế đó. Do vậy, kết quả telemetry được sử dụng để mô tả chi phí tương tác và gợi ý câu hỏi nghiên cứu tiếp theo, không dùng để đánh giá năng lực nhận thức của từng cá nhân.")

    heading(doc, "4.8. Hàm ý cho thiết kế giao diện XAI", level=2)
    normal(doc, "Trong giới hạn mẫu, kết quả nhấn mạnh rằng mục tiêu của giao diện không nên chỉ là tăng lượng thông tin giải thích. Một giao diện cần giúp người dùng biết khi nào nên dừng lại để kiểm tra khuyến nghị, yếu tố nào nên được đối chiếu và cách ra quyết định cuối cùng vẫn thuộc về con người. Điều này phù hợp với hướng tiếp cận tin cậy được hiệu chỉnh thay vì tối đa hóa sự đồng thuận với AI.")
    normal(doc, "Với nhóm B, phần giải thích tĩnh đi kèm mức phát hiện bẫy tương đương hoặc nhỉnh hơn nhóm A trong dữ liệu hiện có, nhưng khoảng cách quá nhỏ để dùng làm khuyến nghị triển khai. Với nhóm C, các chức năng khám phá làm tăng thời gian và thao tác mà chưa cho thấy lợi thế tương ứng ở chỉ báo bẫy. Một diễn giải thận trọng là giao diện tương tác cần được tổ chức theo trình tự nhiệm vụ và tiết lộ dần, thay vì đưa toàn bộ thông tin kỹ thuật lên màn hình ngay từ đầu.")
    normal(doc, "Một cơ chế cần thử nghiệm trong tương lai là yêu cầu người dùng chỉ ra ít nhất một yếu tố hồ sơ ủng hộ hoặc mâu thuẫn với đề xuất trước khi bấm xác nhận ở kịch bản rủi ro. Cơ chế này là một dạng gợi nhắc suy nghĩ, khác với việc chỉ thêm biểu đồ. Nó có thể làm tăng thời gian phản hồi, nên cần đánh giá đồng thời hiệu quả phát hiện lỗi, tải công việc và mức chấp nhận của người dùng [12].")

    heading(doc, "4.9. Tổng hợp bằng chứng theo câu hỏi nghiên cứu", level=2)
    normal(doc, "Đối với RQ1, bằng chứng trực tiếp nhất là Bảng 4.2 và Bảng 4.3. Ở bốn hồ sơ AI sai, tỷ lệ trùng đáp án lần lượt là 34,1%, 35,9% và 21,4% cho A, B và C. Ở các hồ sơ AI đúng, các tỷ lệ lần lượt là 63,6%, 77,6% và 78,7%. Hai nhóm số liệu phải được đọc cùng nhau: chúng mô tả mức phù hợp giữa quyết định của người dùng và đáp án kịch bản trong hai trạng thái của AI, chứ không xác định nguyên nhân tâm lý của từng lựa chọn.")
    normal(doc, "Đối với RQ2, thời gian phản hồi, các thao tác quan sát được và biểu mẫu tải công việc đều gợi ý rằng điều kiện C đòi hỏi nhiều tương tác hơn. Tuy nhiên, chỉ báo tự báo cáo không đồng nhất giữa các chiều và không có kiểm định suy luận do cỡ mẫu nhỏ. Kết quả phù hợp với giả thuyết về đánh đổi thông tin - chi phí tương tác, nhưng chưa đủ để gán nhãn giao diện C là quá tải hoặc kém hiệu quả.")
    normal(doc, "Đối với RQ3, dữ liệu trả lời ở mức sử dụng chức năng: nhóm C ghi nhận trung bình 0,43 lượt hỏi đáp và 65,71 thao tác tương tác trên một phiên, trong khi hai nhóm còn lại không có những chức năng tương ứng. Chỉ số này cho thấy chức năng đã được dùng ít nhất ở một mức nhất định, nhưng không cho biết người dùng đã đọc nội dung nào, có hiểu nội dung đó hay không, hoặc thao tác nào dẫn đến một quyết định cụ thể.")
    normal(doc, "Ba câu trả lời trên có cùng một nguyên tắc giới hạn. Số liệu được tổng hợp từ 28 phiên được giữ lại, với nhóm C chỉ có bảy phiên. Quy tắc làm sạch thay đổi mẫu số giữa các kịch bản ở cuối chuỗi. Vì thế, các bảng cung cấp bằng chứng mô tả minh bạch cho thiết kế hiện tại, không phải bằng chứng đủ mạnh để xếp hạng các giao diện XAI hay khuyến nghị triển khai trong nghiệp vụ tín dụng.")
    normal(doc, "Giá trị thực hành nhất của kết quả là nhắc rằng đánh giá XAI nên kết hợp cả hành vi nhiệm vụ và chi phí sử dụng. Nếu chỉ quan sát người dùng có mở biểu đồ hoặc bấm nhiều chức năng, ta có thể nhầm mức hoạt động với sự hiểu biết. Nếu chỉ quan sát tỷ lệ đồng ý AI, ta có thể nhầm đồng thuận khi AI đúng với tin cậy được hiệu chỉnh. Thiết kế nghiên cứu và cách báo cáo trong khóa luận cố gắng tránh hai kiểu suy luận này.")

    heading(doc, "4.10. Những diễn giải không rút ra từ dữ liệu", level=2)
    normal(doc, "Thứ nhất, kết quả không chứng minh rằng nhóm B tốt hơn nhóm A hay C. Chênh lệch 1,8 điểm phần trăm ở các hồ sơ AI sai là một mô tả trên số lượt quan sát hạn chế. Cơ chế phân bổ thích ứng, khác biệt về số phiên giữ lại và sự lặp lại theo người tham gia đều khiến việc coi chênh lệch này là hiệu quả của giao diện trở nên không phù hợp.")
    normal(doc, "Thứ hai, kết quả không chứng minh nhóm C phụ thuộc vào AI nhiều hơn. Nhóm C có tỷ lệ trùng đáp án thấp hơn ở các hồ sơ AI sai, nhưng một lựa chọn không trùng đáp án có thể xuất phát từ nhiều nguyên nhân: đồng ý với khuyến nghị, hiểu sai nút thao tác, bỏ sót thông tin, hoặc suy luận khác với chuẩn kịch bản. Biến kiểm tra hiểu nút quyết định không có đủ bản ghi để phân biệt các khả năng này.")
    normal(doc, "Thứ ba, thời gian và telemetry không chứng minh cơ chế nhận thức. Thời gian dài hơn có thể là đọc kỹ hơn, tìm thông tin lâu hơn, gặp khó khăn với bố cục hoặc bị gián đoạn. Tương tự, số lần di chuột và số thao tác cao hơn không cho biết người dùng đã xem phần nào hay rút ra kết luận gì. Vì vậy, các chỉ số này chỉ được dùng để mô tả chi phí và mức sử dụng giao diện.")
    normal(doc, "Thứ tư, các kết quả không đánh giá hiệu năng dự báo hay tính công bằng của Random Forest đối với người vay thật. Bốn tình huống AI sai được xây dựng ở lớp kịch bản để phục vụ nhiệm vụ HCI; chúng không phải tập kiểm thử đại diện, cũng không thể dùng để ước lượng tỷ lệ lỗi của mô hình ngoài thí nghiệm. Các biểu đồ kỹ thuật của mô hình vì thế chỉ có vai trò mô tả nguồn khuyến nghị trong môi trường.")
    normal(doc, "Việc nêu rõ các diễn giải bị loại trừ là một phần của tính minh bạch nghiên cứu. Nó không làm giảm giá trị của các bảng kết quả, mà xác định đúng mức bằng chứng mà chúng cung cấp: một quan sát có dữ liệu về cách người tham gia dùng ba giao diện trong một nhiệm vụ mô phỏng cụ thể. Các kết quả là cơ sở để thiết kế nghiên cứu tiếp theo chặt chẽ hơn, không phải điểm kết thúc của câu hỏi về XAI và phụ thuộc vào tự động hóa.")

    heading(doc, "4.11. Khả năng kiểm tra lại kết quả mô tả", level=2)
    normal(doc, "Một yêu cầu quan trọng đối với kết quả trong chương này là khả năng kiểm tra lại phép tính từ tệp xuất. Mỗi tỷ lệ trung tâm được xác định bằng ba thông tin có thể truy vết: nhóm giao diện của phiên trong User, lựa chọn và thời gian phản hồi trong ResponseLog, cùng trạng thái AI đúng/sai và ground_truth trong tệp kịch bản. Nhờ đó, người đọc không cần suy đoán từ giao diện để biết mẫu số của một tỷ lệ được hình thành như thế nào.")
    normal(doc, "Ví dụ, tử số 15 của nhóm A ở Bảng 4.2 là số ResponseLog hợp lệ thuộc bốn scenario_id 1, 8, 11 và 16, có lựa chọn bác bỏ đề xuất AI và thuộc các phiên A được giữ lại. Mẫu số 44 là số lượt hồ sơ AI sai còn lại của chính các phiên đó. Khi chuyển sang Bảng 4.3, tệp kịch bản được dùng để tách 16 hồ sơ AI đúng và bốn hồ sơ AI sai; vì thế các mẫu số 176, 44 và 220 của A có thể khác nhau nhưng nhất quán với nhau theo 16:4:20 hồ sơ, trừ các tiền tố phiên được giữ một phần.")
    normal(doc, "Quy tắc tiền tố làm sạch là điểm cần chú ý nhất khi tái lập. Một phiên không bị xóa đơn giản chỉ vì có một phản hồi nhanh. Chuỗi dữ liệu được giữ đến trước lần đầu xuất hiện ba hồ sơ liên tiếp dưới ngưỡng của nhóm; sau đó phiên chỉ đi vào phân tích nếu phần còn lại có ít nhất mười hồ sơ. Cách làm này giải thích vì sao nhóm B có 10 người nhưng chỉ có 9 lượt ở kịch bản 16, và vì sao tổng số lượt không luôn bằng số người nhân 20.")
    normal(doc, "Bảng độ nhạy trước/sau làm sạch được đưa vào để người đọc kiểm tra liệu câu chuyện mô tả có hoàn toàn do thao tác lọc tạo ra hay không. Trước làm sạch, tỷ lệ ở bốn hồ sơ AI sai là 39,6% ở A, 37,5% ở B và 22,9% ở C; sau làm sạch, các tỷ lệ lần lượt là 34,1%, 35,9% và 21,4%. Các giá trị thay đổi về mức tuyệt đối, nhưng không đảo thứ tự mô tả. Dù vậy, tính ổn định thứ tự không biến kết quả thành kiểm định thống kê hoặc loại bỏ mọi nguy cơ thiên lệch do lọc dữ liệu.")
    normal(doc, "Các bảng thời gian và tải công việc dùng đơn vị tổng hợp khác với bảng quyết định. Thời gian được tính bình quân theo hồ sơ hợp lệ của từng người rồi tổng hợp theo nhóm; hover, hỏi đáp và tương tác được thể hiện như tổng theo phiên; tải công việc là tự báo cáo sau phiên. Vì các chỉ số không cùng đơn vị và không cùng ý nghĩa, chúng không được cộng thành một chỉ số “hiệu quả giao diện”. Việc giữ riêng từng thước đo giúp người đọc thấy rõ dữ liệu nào đang hỗ trợ một nhận định nào.")
    normal(doc, "Một giới hạn tái lập vẫn còn: tệp xuất hiện có các trường chi tiết như lịch sử hỏi đáp, vùng di chuột và phản hồi mở, nhưng khóa luận không công bố nội dung vi mô của các trường này do không có quy trình mã hóa định tính được định trước và để hạn chế nguy cơ tiết lộ thông tin không cần thiết. Do đó, khả năng kiểm tra lại trong báo cáo này tập trung vào các thống kê tổng hợp có thể tính từ biến cấu trúc, không phải tái dựng từng trải nghiệm của từng người tham gia.")
    normal(doc, "Quy trình kiểm tra lại này cũng là một tiêu chí thiết kế cho các đợt nghiên cứu tiếp theo: một bảng kết quả nên luôn cho biết đơn vị quan sát, điều kiện giữ lại dữ liệu, tử số, mẫu số và nguồn biến. Đối với nghiên cứu người - AI, mức minh bạch đó đặc biệt hữu ích vì cùng một tỷ lệ đồng ý có thể mang ý nghĩa khác nhau tùy AI đang đúng hay sai, tùy nút thao tác được diễn giải ra sao và tùy cách dữ liệu phiên bị lọc.")
    normal(doc, "Trong thực hành báo cáo, mỗi thay đổi từ dữ liệu thô đến bảng kết quả cũng cần được ghi lại như một quyết định phương pháp. Chẳng hạn, việc chỉ phân tích các phiên hoàn thành bảo đảm người tham gia đã đi qua cùng một điểm kết thúc, nhưng có thể bỏ qua thông tin về lý do rời phiên. Việc giữ lại tiền tố hợp lệ bảo toàn một phần dữ liệu, nhưng làm mẫu số giảm dần ở các hồ sơ cuối. Không có lựa chọn nào hoàn toàn trung tính; điều quan trọng là nêu rõ lựa chọn và kiểm tra tác động của nó.")
    normal(doc, "Một cách cải thiện trong các đợt sau là tạo một tệp dữ liệu phân tích dẫn xuất, trong đó mỗi lượt phản hồi đã mang sẵn nhãn trạng thái AI, nhãn trùng/không trùng đáp án, cờ giữ lại và mã phiên ẩn danh. Tệp này cho phép kiểm tra trực tiếp các con số trong báo cáo mà không cần truy cập các trường telemetry chi tiết. Nó cũng làm giảm nguy cơ sai khác khi nhiều bảng được tính ở các thời điểm khác nhau từ tệp xuất gốc.")
    normal(doc, "Ngoài việc tái lập phép tính, báo cáo cần tái lập cả ngữ cảnh giao diện. Ảnh chụp của ba điều kiện trong Chương 3 cho thấy người tham gia đã thấy loại thông tin nào, nhưng không thay thế được mô tả bằng văn bản về các chức năng. Một nghiên cứu nối tiếp nên lưu phiên bản mã nguồn, cấu hình kịch bản và tài liệu hướng dẫn người tham gia cùng với dữ liệu xuất để tránh nhầm lẫn giữa thay đổi giao diện và khác biệt hành vi.")

    doc.add_page_break()
    heading(doc, "CHƯƠNG 5. KẾT LUẬN VÀ ĐỊNH HƯỚNG NGHIÊN CỨU")
    heading(doc, "5.1. Kết luận", level=2)
    normal(doc, "Khóa luận khảo sát tác động của các mức giao diện XAI khác nhau đối với hành vi ra quyết định trong nhiệm vụ tín dụng mô phỏng. Môi trường thực nghiệm tổ chức ba điều kiện giao diện, ghi nhận quyết định trên 20 hồ sơ, thời gian phản hồi, dấu vết tương tác và tự báo cáo tải công việc điều chỉnh từ NASA-TLX. Thiết kế có các kịch bản AI sai có chủ đích để quan sát liệu người tham gia có rà soát và bác bỏ khuyến nghị không phù hợp với đáp án mô phỏng hay không.")
    normal(doc, "Trên bộ dữ liệu xuất của giai đoạn 2, 28 trong 38 phiên hoàn thành được giữ lại sau quy tắc làm sạch. Tỷ lệ quyết định trùng đáp án theo kịch bản mô phỏng ở các hồ sơ AI sai là 34,1% ở A, 35,9% ở B và 21,4% ở C; trên các hồ sơ AI đúng, các tỷ lệ tương ứng là 63,6%, 77,6% và 78,7%. Nhóm C đồng thời có thời gian phản hồi và lượng thao tác cao hơn. Các kết quả mô tả này chưa cho thấy giao diện tương tác phức tạp có lợi thế rõ ràng trong các hồ sơ AI sai. Chúng cũng không cho phép kết luận trực tiếp về thiên kiến tự động hóa, bởi chỉ báo dùng đáp án quy ước của nhiệm vụ và mẫu phân tích nhỏ, không ngẫu nhiên thuần túy.")
    normal(doc, "Đóng góp chính của khóa luận nằm ở việc thiết lập và sử dụng một môi trường HCI có thể ghi nhận đồng thời kết quả quyết định, chi phí thời gian, dấu vết sử dụng thông tin và trải nghiệm tự báo cáo. Cách tiếp cận này giúp đánh giá XAI bằng hành vi thực hiện nhiệm vụ, thay vì suy luận lợi ích từ sự có mặt của biểu đồ hay lời giải thích. Về mặt thiết kế, kết quả nhấn mạnh nhu cầu tổ chức thông tin theo nhiệm vụ và hỗ trợ người dùng kiểm tra khuyến nghị, thay vì chỉ gia tăng số lượng thành phần giải thích.")

    heading(doc, "5.2. Giới hạn của nghiên cứu", level=2)
    normal(doc, "Thứ nhất, quy mô mẫu phân tích nhỏ và không cân bằng giữa các nhóm sau làm sạch, đặc biệt nhóm C chỉ còn bảy người. Vì vậy, các so sánh trong Chương 4 là thống kê mô tả và không được dùng để suy rộng cho quần thể rộng hơn hoặc kết luận nhân quả. Cơ chế phân bổ thích ứng, dù hữu ích cho vận hành thí nghiệm, cũng không phải phân nhóm ngẫu nhiên thuần túy.")
    normal(doc, "Thứ hai, quy tắc lọc dựa trên thời gian có thể làm thay đổi thành phần mẫu còn lại. Ngưỡng khác nhau theo điều kiện chưa được tiền đăng ký trong hồ sơ dự án; vì vậy nghiên cứu đã báo cáo thêm so sánh trước/sau làm sạch, nhưng không loại trừ khả năng hành vi trả lời nhanh liên hệ với đặc điểm người dùng hoặc giao diện. Thứ ba, các kịch bản tín dụng và lỗi AI là mô phỏng; đáp án ground_truth được dùng như chuẩn nhiệm vụ chứ chưa có thẩm định độc lập của chuyên gia tín dụng. Chúng không đại diện cho toàn bộ quy trình, dữ liệu và trách nhiệm pháp lý của thẩm định tín dụng thực tế.")
    normal(doc, "Thứ tư, ba điều kiện giao diện thay đổi theo gói thành phần, nên không tách được ảnh hưởng riêng của biểu đồ SHAP, diễn giải ngôn ngữ, What-if hay hỏi đáp. Thước đo tải công việc cũng là biểu mẫu điều chỉnh, không phải NASA-TLX đầy đủ; biến kiểm tra hiểu biết về nút quyết định chưa có đủ dữ liệu để phân tích. Các giới hạn này là lý do để xem kết quả như bằng chứng thăm dò có cơ sở dữ liệu, không phải kết luận cuối cùng về hiệu quả của một kỹ thuật XAI.")

    heading(doc, "5.3. Định hướng nghiên cứu tiếp theo", level=2)
    normal(doc, "Nghiên cứu tiếp theo nên thu thập mẫu lớn hơn với phân nhóm ngẫu nhiên và cân bằng hơn, đồng thời chốt trước quy tắc làm sạch, tiêu chí loại mẫu và kế hoạch phân tích. Với dữ liệu đủ lớn, có thể sử dụng mô hình logistic hỗn hợp hoặc GEE ở cấp hồ sơ để xét tính lặp lại theo người tham gia, tình trạng bẫy của kịch bản và các biến nền như kinh nghiệm sử dụng AI.")
    normal(doc, "Về giao diện, nên tách riêng từng cơ chế giải thích để kiểm tra tác động biên của chúng, và cân nhắc trình bày theo nguyên tắc tiết lộ dần: thông tin cốt lõi xuất hiện trước, còn biểu đồ kỹ thuật hoặc mô phỏng chỉ mở khi người dùng cần. Một hướng đáng khảo sát là bổ sung các cơ chế buộc kiểm tra hợp lý, chẳng hạn yêu cầu người dùng chỉ ra yếu tố hồ sơ mâu thuẫn với khuyến nghị trước khi xác nhận trong kịch bản bẫy. Cơ chế này cần được kiểm chứng thực nghiệm vì có thể cải thiện rà soát nhưng cũng làm tăng thời gian và gánh nặng nhiệm vụ [12].")
    normal(doc, "Cuối cùng, đánh giá trong bối cảnh gần thực tế hơn cần kết hợp chuyên gia tín dụng, dữ liệu đã được quản trị phù hợp và các tiêu chí về công bằng, hiệu chuẩn, quyền riêng tư và trách nhiệm giải trình. Khi đó, XAI không chỉ được đánh giá qua mức độ dễ hiểu của giao diện mà còn qua khả năng hỗ trợ con người đưa ra quyết định có căn cứ trong các điều kiện vận hành cụ thể.")

    heading(doc, "5.4. Bài học phương pháp", level=2)
    normal(doc, "Bài học thứ nhất là cần xác định rõ chuẩn đánh giá trước khi diễn giải hành vi người dùng. Trong nghiên cứu này, ground_truth là đáp án của kịch bản mô phỏng. Việc gọi đúng tên chuẩn này giúp phân biệt nghiên cứu giao diện với một nghiên cứu xác nhận chính sách tín dụng. Khi một kịch bản AI sai được dùng để kiểm tra sự rà soát, mô tả “trùng đáp án mô phỏng” chính xác hơn các nhãn rộng như “quyết định đúng” hoặc “phát hiện thiên kiến”.")
    normal(doc, "Bài học thứ hai là kết quả trong trường hợp AI đúng và AI sai cần được báo cáo song song. Một giao diện có thể đi kèm tỷ lệ đồng ý cao khi AI đúng nhưng vẫn không hỗ trợ người dùng trong tình huống mâu thuẫn. Cách báo cáo tách trạng thái như ở Chương 4 giúp nhìn rõ hơn sự khác biệt đó, dù chưa thay thế được đo lường trực tiếp về mô hình tinh thần hoặc mức tin cậy.")
    normal(doc, "Bài học thứ ba là quy tắc làm sạch phải được minh bạch hóa và, nếu có thể, xác định trước thu thập. Trong bộ dữ liệu hiện có, phép so sánh trước/sau làm sạch là một kiểm tra độ nhạy cần thiết, không phải sự thay thế hoàn toàn cho tiền đăng ký. Các đợt nghiên cứu sau nên thử nghiệm ngưỡng trong pilot, chốt quy tắc trước khi thu thập chính thức và lưu lại lý do của từng lựa chọn.")

    heading(doc, "5.5. Điều kiện để tái sử dụng quy trình", level=2)
    normal(doc, "Môi trường và quy trình của đề tài có thể được tái sử dụng cho các nghiên cứu HCI về hỗ trợ ra quyết định nếu giữ rõ ba lớp: dữ liệu kịch bản, giao diện thử nghiệm và quy tắc phân tích. Lớp kịch bản cần công bố trường dự báo AI, đáp án nhiệm vụ và dấu hiệu mâu thuẫn của từng tình huống. Lớp giao diện cần mô tả chính xác thành phần nào xuất hiện ở từng điều kiện. Lớp phân tích cần xác định đơn vị quan sát, tiêu chí giữ lại dữ liệu và cách tính mọi chỉ báo trước khi xem kết quả.")
    normal(doc, "Khi thay đổi miền ứng dụng, không nên sao chép nguyên các thuộc tính hay nhãn tín dụng của nghiên cứu này. Thay vào đó, nhà nghiên cứu cần xây dựng kịch bản phù hợp với nhiệm vụ, xác nhận chuẩn đánh giá với người có chuyên môn phù hợp và kiểm tra ngôn ngữ hiển thị với nhóm người dùng mục tiêu. Điều này đặc biệt quan trọng với các miền có hệ quả cao như y tế, tài chính hoặc tuyển dụng, nơi một đáp án mô phỏng chỉ có giá trị trong khuôn khổ đã được xác định.")
    normal(doc, "Về kỹ thuật, lưu vết quyết định theo hồ sơ và mã phiên là tối thiểu để có thể đối chiếu kết quả người dùng với trạng thái của AI. Telemetry chi tiết chỉ nên được thu thập khi phục vụ một câu hỏi nghiên cứu xác định, có giải thích rõ cho người tham gia và có kế hoạch bảo vệ dữ liệu. Những trường không dùng trong phân tích hoặc có nguy cơ nhận diện cá nhân cần được loại khỏi tệp công bố.")
    normal(doc, "Về khoa học, một lần triển khai kế tiếp nên thực hiện pilot nhỏ để phát hiện vấn đề thao tác, kiểm tra hiểu nút quyết định và điều chỉnh độ dài nhiệm vụ. Sau pilot, kịch bản, thứ tự trình bày, quy tắc làm sạch và kế hoạch phân tích cần được chốt. Các bước này giúp kết quả sau đó có sức thuyết phục cao hơn, đồng thời cho phép phân biệt rõ lỗi giao diện, lỗi đo lường và khác biệt hành vi thực sự.")

    doc.add_page_break()
    heading(doc, "TÀI LIỆU THAM KHẢO")
    refs = [
        "[1] R. Parasuraman and D. H. Manzey, “Complacency and bias in human use of automation: An attentional integration,” Human Factors, vol. 52, no. 3, pp. 381–410, 2010.",
        "[2] A. S. M. Muir, “Trust between humans and machines, and the design of decision aids,” International Journal of Man-Machine Studies, vol. 27, no. 5–6, pp. 527–539, 1987.",
        "[3] S. M. Lundberg and S.-I. Lee, “A unified approach to interpreting model predictions,” in Advances in Neural Information Processing Systems, 2017.",
        "[4] S. G. Hart and L. E. Staveland, “Development of NASA-TLX (Task Load Index): Results of empirical and theoretical research,” in Human Mental Workload, Amsterdam: North-Holland, 1988, pp. 139–183.",
        "[5] T. Miller, “Explanation in artificial intelligence: Insights from the social sciences,” Artificial Intelligence, vol. 267, pp. 1–38, 2019.",
        "[6] K. Siau and W. Wang, “Building trust in artificial intelligence, machine learning, and robotics,” Cutter Business Technology Journal, vol. 31, no. 2, pp. 47–53, 2018.",
        "[7] T. Kulesza, S. Stumpf, M. Burnett, S. Yang, I. Kwan, and W.-K. Wong, “Too much, too little, or just right? Ways explanations impact end users’ mental models,” in 2013 IEEE Symposium on Visual Languages and Human Centric Computing, 2013, pp. 3–10.",
        "[8] Khoa Công nghệ thông tin, Đại học Kinh tế Quốc dân, “Một số quy định về làm báo cáo khóa luận tốt nghiệp,” 2024. [Trực tuyến]. Available: https://fit.neu.edu.vn/post/mot-so-quy-dinh-viet-bao-cao-khoa-luan. [Truy cập: 26-09-2026].",
        "[9] R. Parasuraman and V. Riley, “Humans and automation: Use, misuse, disuse, abuse,” Human Factors, vol. 39, no. 2, pp. 230–253, 1997, doi: 10.1518/001872097778543886.",
        "[10] K. A. Hoff and M. Bashir, “Trust in automation: Integrating empirical evidence on factors that influence trust,” Human Factors, vol. 57, no. 3, pp. 407–434, 2015, doi: 10.1177/0018720814547570.",
        "[11] G. Bansal, B. Nushi, E. Kamar, W. S. Lasecki, D. S. Weld, and E. Horvitz, “Beyond accuracy: The role of mental models in human-AI team performance,” Proceedings of the AAAI Conference on Human Computation and Crowdsourcing, vol. 7, no. 1, pp. 2–11, 2019, doi: 10.1609/hcomp.v7i1.5285.",
        "[12] Z. Buçinca, M. B. Malaya, and K. Z. Gajos, “To trust or to think: Cognitive forcing functions can reduce overreliance on AI in AI-assisted decision-making,” Proceedings of the ACM on Human-Computer Interaction, vol. 5, CSCW1, 2021.",
        "[13] T. Kulesza, S. Stumpf, M. Burnett, S. Yang, I. Kwan, and W.-K. Wong, “Too much, too little, or just right? Ways explanations impact end users’ mental models,” in 2013 IEEE Symposium on Visual Languages and Human Centric Computing, 2013, pp. 3–10, doi: 10.1109/VLHCC.2013.6645235.",
        "[14] National Aeronautics and Space Administration, “NASA Task Load Index (TLX).” [Trực tuyến]. Available: https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/. [Truy cập: 22-09-2026].",
        "[15] T. Miller, “Explanation in artificial intelligence: Insights from the social sciences,” Artificial Intelligence, vol. 267, pp. 1–38, 2019, doi: 10.1016/j.artint.2018.07.007.",
    ]
    for ref in refs:
        p = normal(doc, ref, first_line=False)
        p.paragraph_format.left_indent = Cm(0.8)
        p.paragraph_format.first_line_indent = Cm(-0.8)

    doc.add_page_break()
    heading(doc, "PHỤ LỤC")
    heading(doc, "PHỤ LỤC A. CẤU TRÚC SẢN PHẨM VÀ DỮ LIỆU PHÂN TÍCH", level=2)
    normal(doc, "Phụ lục này mô tả các thành phần kỹ thuật dùng để tái lập môi trường thực nghiệm, phục vụ yêu cầu kèm mã nguồn và tài liệu hướng dẫn khi nộp sản phẩm. Nội dung phụ lục chỉ mô tả cấu trúc dự án, không công bố dữ liệu định danh hoặc nội dung phản hồi tự do của người tham gia.")
    table(doc, ["Thành phần", "Vị trí trong dự án", "Vai trò"], [["Giao diện và API", "src/", "Triển khai ba điều kiện giao diện, phiên thực nghiệm và ghi nhận phản hồi."], ["Kịch bản", "src/data/scenarios.json", "Lưu 20 hồ sơ mô phỏng, khuyến nghị AI và đáp án nhiệm vụ."], ["Cơ sở dữ liệu", "prisma/schema.prisma", "Định nghĩa User, ResponseLog và SurveyLog."], ["Tệp xuất phân tích", "data/2nd test/csv/", "Nguồn cho các thống kê mô tả tại Chương 4."], ["Mã phân tích", "docs/thesis/analyze_phase2.py", "Tái lập quy tắc làm sạch và các bảng số liệu."], ["Hướng dẫn dự án", "README.md", "Mô tả cài đặt, cấu trúc và cách chạy sản phẩm."]], widths=[3.5, 6.0, 7.0])
    caption(doc, "Bảng A.1. Thành phần được bàn giao cùng sản phẩm", "Nguồn: Tác giả tổng hợp từ cấu trúc dự án.")
    normal(doc, "Khi đóng gói để nộp, thư mục Source nên chỉ chứa mã nguồn cần thiết để chạy sản phẩm; các thư mục sinh ra tự động, tệp môi trường chứa khóa bí mật và các tệp phụ thuộc cài đặt lại được không nên đưa vào gói. File Readme.md cần được rà soát để người chấm có thể hiểu cấu trúc dự án, các bước cài đặt và cách khởi động môi trường thực nghiệm.")

    heading(doc, "PHỤ LỤC B. QUY TRÌNH TÁI LẬP CÁC BẢNG KẾT QUẢ", level=2)
    normal(doc, "Để tái lập các thống kê ở Chương 4, sử dụng ba tệp CSV User, ResponseLog và SurveyLog của đợt thực nghiệm giai đoạn 2; đối chiếu scenario_id với tệp scenarios.json; sau đó chạy mã analyze_phase2.py. Quy tắc giữ lại được áp dụng theo ngưỡng thời gian 2, 3 và 4 giây cho các nhóm A, B và C. Một phiên được giữ đến trước chuỗi đầu tiên gồm ba phản hồi liên tiếp dưới ngưỡng và phải còn ít nhất mười hồ sơ hợp lệ.")
    normal(doc, "Các tỷ lệ ở Bảng 4.2, Bảng 4.3 và Bảng 4.4 phải luôn được tính từ cùng tập phiên sau khi đã áp dụng quy tắc tương ứng. Khi tạo lại bảng, cần giữ cả tử số và mẫu số thay vì chỉ làm tròn tỷ lệ phần trăm. Lựa chọn này giúp người đọc kiểm tra được ảnh hưởng của các phiên bị giữ một phần và tránh nhầm lẫn giữa đơn vị người tham gia với đơn vị lượt phản hồi.")

    heading(doc, "PHỤ LỤC C. VỊ TRÍ ĐÍNH KÈM BÁO CÁO TURNITIN", level=2)
    normal(doc, "Báo cáo kiểm tra Turnitin của bản PDF cuối cùng sẽ được đính kèm tại phụ lục này trước khi nộp chính thức, theo quy định của Khoa Công nghệ thông tin. Kết quả phải được tạo từ đúng phiên bản báo cáo sẽ in và nộp; khóa luận không tạo hoặc diễn giải thay kết quả kiểm tra này.")

    # Reassert the final content section after all page-break insertions.
    content_section = doc.sections[-1]
    content_section.top_margin = Cm(2.5)
    content_section.bottom_margin = Cm(2.5)
    content_section.left_margin = Cm(3.5)
    content_section.right_margin = Cm(2.5)
    set_update_fields(doc)
    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
