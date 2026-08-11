# BÁO CÁO KIỂM SOÁT PHƯƠNG PHÁP LUẬN: TRÙNG KHỚP TUYỆT ĐỐI (PERFECT COLLINEARITY) GIỮA NHÓM TUỔI & HƯỚNG DẪN
*Dữ liệu thực tế thời gian thực từ Supabase: 19:39:19 10/8/2026 (Giờ Việt Nam)*

> [!WARNING]
> **Cảnh báo Thống kê Quan trọng (Perfect Confounding Warning)**:
> Trong mẫu thực tế hiện tại, **100% người dùng thuộc các nhóm tuổi ngoài 18-22 (<18, 23-30, 31-45, >45) đều được hướng dẫn ở Câu 1** ($n=0$ nhóm không hướng dẫn ở các độ tuổi này).
> Về mặt toán học thống kê, xảy ra tình trạng **Trùng khớp tuyệt đối (Perfect Collinearity / Perfect Confounding)**. Không thể tách biệt ảnh hưởng của "tuổi tác" ra khỏi ảnh hưởng của việc "được hướng dẫn trực tiếp".
> **Bắt buộc**: Loại bỏ mọi phát biểu so sánh tác động tuổi tác ngoài nhóm 18-22.

## 1. BẢNG PHÂN BỔ MẪU THỰC NGHỆM & KIỂM SOÁT ĐỐI CHỨNG

| Nhóm Tuổi | Được Hướng Dẫn (`is_explained = true`) | Tự Đọc & Tự Làm (`is_explained = false`) | Khả Năng So Sánh Thống Kê |
| :--- | :---: | :---: | :--- |
| **Nhóm 18-22** | 2 người | 34 người | ✓ **Hợp lệ để so sánh** (Có cả 2 nhóm: n=2 vs n=34) |
| **Nhóm 23-30** | 1 người | 0 người | 🔴 **Không thể so sánh** (n=0 ở nhóm đối chứng Tự làm) |
| **Nhóm 31-45** | 3 người | 0 người | 🔴 **Không thể so sánh** (n=0 ở nhóm đối chứng Tự làm) |
| **Nhóm < 18** | 3 người | 0 người | 🔴 **Không thể so sánh** (n=0 ở nhóm đối chứng Tự làm) |
| **Nhóm > 45** | 3 người | 0 người | 🔴 **Không thể so sánh** (n=0 ở nhóm đối chứng Tự làm) |

---

## 2. PHÂN TÍCH HỢP LỆ TRÊN NHÓM TUỔI 18-22 (NHÓM DUY NHẤT CÓ ĐỐI CHỨNG)

| Chỉ số Đo lường | Được Hướng Dẫn (`is_explained = true`) | Tự Đọc & Tự Làm (`is_explained = false`) | Đánh Giá Tác Động Hợp Lệ |
| :--- | :---: | :---: | :--- |
| **Số người đăng ký (n)** | **2 người** | **34 người** | Duy nhất có mẫu đối chứng |
| **Tỷ lệ Giữ chân Sạch (%)** | **100.0%** | **47.1%** | Tác động giữ chân của nghiên cứu viên |
| **Thời gian ra quyết định (Bỏ Q1)**| **20.63s** | **11.08s** | Đã loại bỏ thời gian Câu 1 |
| **Điểm Phát Hiện Bẫy AI (/4)** | **1.5 / 4 (38%)** | **1.5 / 4 (37%)** | **Bằng chứng trấn an 1.5 vs 1.5**: Lời dặn không mớm bẫy |

---

## 3. PHÂN BỔ CÁC NHÓM TUỔI KHÁC (GHI NHẬN MÔ TẢ — KHÔNG SO SÁNH)

| Nhóm Tuổi | Số người đăng ký (n) | Nhóm `is_explained` | Đánh Giá Kỹ Thuật |
| :--- | :---: | :---: | :--- |
| **Nhóm < 18** | 3 người | 100% `is_explained = true` | 🔴 Không so sánh do thiếu đối chứng (n=0 control) |
| **Nhóm 23-30** | 1 người | 100% `is_explained = true` | 🔴 Không so sánh do thiếu đối chứng (n=0 control) |
| **Nhóm 31-45** | 3 người | 100% `is_explained = true` | 🔴 Không so sánh do thiếu đối chứng (n=0 control) |
| **Nhóm > 45** | 3 người | 100% `is_explained = true` | 🔴 Không so sánh do thiếu đối chứng (n=0 control) |

---

### Ghi nhận Đóng góp & Tuyên bố về Vai trò của AI (AI Attribution Statement)
*   **Hỗ trợ kỹ thuật & Biên soạn**: Tài liệu này được biên soạn, thiết kế bảng phân tích thống kê và cấu trúc hóa ngôn ngữ với sự trợ giúp của trợ lý lập trình trí tuệ nhân tạo **Antigravity (Google DeepMind)**.
*   **Trách nhiệm khoa học & Ý tưởng chủ đạo**: Toàn bộ thiết kế thực nghiệm, định hướng nghiên cứu, thu thập dữ liệu thực tế, các phát hiện định tính về giao diện và việc chịu trách nhiệm khoa học hoàn toàn thuộc về tác giả khóa luận.
