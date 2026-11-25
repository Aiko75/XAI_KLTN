# Kế hoạch mở rộng khóa luận XAI

## Mục tiêu

Mở rộng phần nội dung chính của khóa luận “Nghiên cứu tác động của giao diện trí tuệ nhân tạo có thể giải thích đối với thiên kiến tự động hóa trong hỗ trợ ra quyết định tín dụng” lên tối thiểu 50 trang, tính từ Mở đầu đến hết Kết luận. Mục tiêu vận hành là 52 trang sau khi render để có biên an toàn cho phân trang.

## Ràng buộc nội dung

- Chỉ sử dụng thông tin có thể truy vết trong mã nguồn, cấu trúc cơ sở dữ liệu, ảnh giao diện, tệp CSV và tài liệu học thuật được trích dẫn.
- Không tạo số liệu, kiểm định thống kê, tính năng hoặc kết luận nhân quả không có bằng chứng.
- Số liệu kết quả được tính từ các tệp xuất thực nghiệm; mọi phân tích phải ghi rõ quy tắc lọc và giới hạn mẫu.
- Phụ lục không được dùng để đạt chỉ tiêu 50 trang nội dung chính.

## Cấu trúc đích

| Phần | Số trang đích | Nội dung mở rộng chính |
| --- | ---: | --- |
| Mở đầu | 2 | Tên đề tài, mục tiêu, phương pháp, kết quả chính và bố cục |
| Chương 1 | 6 | Bối cảnh tín dụng, hỗ trợ AI, automation bias, vấn đề nghiên cứu và đóng góp |
| Chương 2 | 12 | XAI, SHAP/logit, niềm tin, tải nhận thức, tổng quan nghiên cứu và khung nghiên cứu |
| Chương 3 | 17 | Kiến trúc, mô hình dữ liệu, giao diện, event logging, quy trình và phương pháp xử lý |
| Chương 4 | 13 | Mẫu, kết quả theo kịch bản, quyết định, thời gian, telemetry, khảo sát và thảo luận |
| Chương 5 | 2 | Kết luận, giới hạn và định hướng |
| Tổng | 52 | Không bao gồm bìa, danh mục, tài liệu tham khảo và phụ lục |

## Artefact và dữ liệu nguồn

- `prisma/schema.prisma`: mô hình dữ liệu và các trường phục vụ thực nghiệm.
- `data/2nd test/csv/*.csv`: đăng ký, quyết định, telemetry và khảo sát giai đoạn 2.
- `docs/thesis/assets/chapter3/*.png`: ảnh giao diện các điều kiện A, B, C và biểu mẫu hậu nghiệm.
- Mã nguồn ứng dụng: luồng phân điều kiện, hiển thị XAI, ghi nhận log và API.
- Tài liệu học thuật được đưa vào danh mục tham khảo theo IEEE.

## Các đợt triển khai

1. Chuẩn hóa định dạng: tiêu đề chương 18pt, caption bảng đặt phía trên, bìa/gáy theo thông tin đã xác nhận và trường mục lục tự động.
2. Mở rộng Chương 1–2 bằng cơ sở lý thuyết có trích dẫn.
3. Mở rộng Chương 3 bằng mô tả kỹ thuật và quy trình thực nghiệm từ repository.
4. Tính lại các bảng, biểu đồ và mở rộng Chương 4 từ dữ liệu CSV thực.
5. Hoàn thiện Chương 5, phụ lục, tài liệu tham khảo, kiểm tra đối chiếu hình/bảng và render toàn văn.

## Kiểm tra chấp nhận

- Render DOCX và đếm số trang từ Mở đầu đến hết Kết luận đạt ít nhất 50.
- Các số liệu ở Chương 4 có thể tái lập từ tệp CSV.
- Mọi bảng/hình được nhắc đến trong nội dung, đánh số theo chương và có nguồn.
- Không còn placeholder trên bìa/gáy, ngoại trừ vị trí ký tay của sinh viên và giảng viên hướng dẫn.
- Times New Roman 13, giãn dòng 1.3, lề thân bài 2.5–2.5–3.5–2.5 cm; tiêu đề chương 18pt.
