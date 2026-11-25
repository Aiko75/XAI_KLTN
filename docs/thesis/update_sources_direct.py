from copy import deepcopy
from docx import Document

PATH = r"D:\Download\KLTN.docx"
doc = Document(PATH)

def nearest_caption(paragraphs, index):
    for prev in range(index - 1, -1, -1):
        text = paragraphs[prev].text.strip()
        if text.startswith("Bảng ") or text.startswith("Hình "):
            return text
        if text.startswith("CHƯƠNG") or text.startswith("PHỤ LỤC"):
            break
    return ""

for index, paragraph in enumerate(doc.paragraphs):
    if not paragraph.text.strip().startswith("Nguồn:"):
        continue
    caption = nearest_caption(doc.paragraphs, index)
    if caption.startswith("Bảng "):
        replacement = "Nguồn: Tác giả phân tích và tổng hợp."
    elif caption.startswith("Hình 3.10") or caption.startswith("Hình 3.11") or caption.startswith("Hình 3.12") or caption.startswith("Hình 3.13"):
        replacement = "Nguồn: Tác giả đề xuất."
    else:
        replacement = "Nguồn: Tác giả thiết kế."
    style = deepcopy(paragraph.runs[0]._r.rPr) if paragraph.runs else None
    paragraph.clear()
    run = paragraph.add_run(replacement)
    if style is not None:
        run._r.get_or_add_rPr().append(style)

doc.save(PATH)
print(PATH)
