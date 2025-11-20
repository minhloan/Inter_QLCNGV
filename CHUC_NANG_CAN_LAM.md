# TỔNG HỢP CHỨC NĂNG HỆ THỐNG

## I. CHỨC NĂNG CHO ADMIN

### 1. Teacher Management (Quản lý Giảng viên)

#### 1.1. CRUD Giảng viên
- **Create:** Tạo mới giảng viên
  - Thông tin cơ bản: họ tên, email, số điện thoại, địa chỉ
  - Thông tin tài khoản: username, password, role
  - Thông tin giảng viên: mã giảng viên (teacher_code), trạng thái (ACTIVE/INACTIVE)
  - Validation: email hợp lệ, username unique, password mạnh
  
- **Read:** Xem danh sách và chi tiết giảng viên
  - Danh sách tất cả giảng viên
  - Xem chi tiết thông tin giảng viên
  - Xem lịch sử hoạt động
  
- **Update:** Cập nhật thông tin giảng viên
  - Cập nhật thông tin cá nhân
  - Cập nhật thông tin tài khoản
  - Cập nhật trạng thái giảng viên
  
- **Delete:** Xóa giảng viên (soft delete hoặc hard delete)

#### 1.2. Tìm kiếm + Lọc + Phân trang
- Tìm kiếm theo: tên, email, mã giảng viên, username
- Lọc theo:
  - Trạng thái (ACTIVE/INACTIVE)
  - Role (ADMIN/TEACHER)
  - Trạng thái giảng viên (ACTIVE/INACTIVE)
- Phân trang: số lượng bản ghi/trang, số trang

#### 1.3. Kích hoạt / Vô hiệu hóa
- Kích hoạt tài khoản giảng viên
- Vô hiệu hóa tài khoản giảng viên
- Cập nhật trạng thái teacher_status

#### 1.4. Liên kết user_id
- Liên kết giảng viên với user_id trong hệ thống
- Quản lý mối quan hệ User ↔ Teacher

#### 1.5. Validation thông tin
- Email format validation
- Username uniqueness check
- Password strength validation
- Required fields validation
- Teacher code uniqueness check

---

### 2. Subject Management (Quản lý Môn học)

#### 2.1. CRUD Môn học
- **Create:** Tạo mới môn học
  - Mã môn học (subject_code) - unique
  - Tên môn học (subject_name)
  - Số tín chỉ (credit)
  - Mô tả (description)
  - Hệ thống (system): APTECH hoặc ARENA
  - Trạng thái active (is_active)
  
- **Read:** Xem danh sách và chi tiết môn học
  - Danh sách tất cả môn học
  - Xem chi tiết môn học
  - Xem lịch sử thay đổi
  
- **Update:** Cập nhật thông tin môn học
  - Cập nhật tên, tín chỉ, mô tả
  - Cập nhật trạng thái active/inactive
  
- **Delete:** Xóa môn học (soft delete)

#### 2.2. Tín chỉ, Mô tả
- Quản lý số tín chỉ cho từng môn
- Quản lý mô tả chi tiết môn học

#### 2.3. Active/Inactive
- Kích hoạt môn học (is_active = true)
- Vô hiệu hóa môn học (is_active = false)
- Lọc môn học theo trạng thái

#### 2.4. Tìm kiếm môn học
- Tìm kiếm theo: mã môn, tên môn
- Lọc theo: hệ thống (APTECH/ARENA), trạng thái active
- Phân trang kết quả

---

### 3. Subject Registration (Đăng ký Môn học)

#### 3.1. Đăng ký môn theo năm – quý
- Tạo đăng ký môn học cho giảng viên
- Chọn năm (year) và quý (quarter)
- Chọn môn học từ danh sách môn active
- Lưu trạng thái: REGISTERED

#### 3.2. Kiểm tra tối thiểu 4 môn/năm
- Validation: Mỗi giảng viên phải đăng ký tối thiểu 4 môn trong 1 năm
- Cảnh báo nếu chưa đủ 4 môn
- Hiển thị số môn đã đăng ký trong năm

#### 3.3. Kiểm tra tối thiểu 1 môn/quý
- Validation: Mỗi giảng viên phải đăng ký tối thiểu 1 môn trong 1 quý
- Cảnh báo nếu quý chưa có môn nào
- Hiển thị số môn đã đăng ký trong quý

#### 3.4. Dời môn sang năm khác + lý do
- Chức năng dời môn (carry over)
- Chọn môn cần dời
- Chọn năm/quý mới
- Nhập lý do dời môn (reason_for_carry_over)
- Liên kết với đăng ký gốc (carried_from_id)
- Cập nhật trạng thái đăng ký cũ

#### 3.5. Status Management
- **REGISTERED:** Mới đăng ký, chưa hoàn thành
- **COMPLETED:** Đã hoàn thành (đã thi, đã dạy thử, đã có minh chứng)
- **NOT_COMPLETED:** Không hoàn thành (thi trượt, dạy thử trượt, thiếu minh chứng)

#### 3.6. Xem lịch sử đăng ký
- Xem tất cả đăng ký của một giảng viên
- Xem đăng ký theo năm/quý
- Xem lịch sử dời môn
- Xem trạng thái từng đăng ký

---

### 4. Aptech Exam Management (Quản lý Kỳ thi Aptech)

#### 4.1. Tạo kỳ thi Aptech (Toàn)
- Tạo phiên thi (AptechExamSession)
  - Ngày thi (exam_date)
  - Giờ thi (exam_time)
  - Phòng thi (room)
  - Ghi chú (note)
  
- Tạo kỳ thi cho giảng viên (AptechExam)
  - Chọn phiên thi
  - Chọn giảng viên
  - Chọn môn học
  - Số lần thi (attempt)
  - Ngày thi (exam_date)

#### 4.2. Quản lý attempt (lần thi) (Toàn)
- Theo dõi số lần thi của giảng viên cho mỗi môn
- Tự động tăng attempt khi tạo kỳ thi mới
- Validation: Không cho phép thi lại nếu đã PASS
- Hiển thị lịch sử các lần thi

#### 4.3. Tính PASS/FAIL (Toàn)
- Nhập điểm thi (score)
- Tự động tính kết quả:
  - **PASS:** Điểm >= điểm chuẩn (ví dụ: >= 70)
  - **FAIL:** Điểm < điểm chuẩn
- Cập nhật trạng thái result (PASS/FAIL)

#### 4.4. Điều kiện thi lại (Toàn)
- Kiểm tra điều kiện thi lại:
  - Chỉ được thi lại nếu lần trước FAIL
  - Giới hạn số lần thi (nếu có)
- Hiển thị thông báo nếu không đủ điều kiện

#### 4.5. Upload certificate (Toàn)
- Upload file chứng chỉ (certificate_file_id)
- Liên kết file với kỳ thi
- Xem và tải certificate
- Validation: Chỉ upload khi đã PASS

---

### 5. Trial Teaching (Giảng thử)

#### 5.1. Tạo lịch giảng thử
- Tạo buổi giảng thử (TrialTeaching)
  - Chọn giảng viên
  - Chọn môn học
  - Chọn ngày giảng (teaching_date)
  - Địa điểm (location)
  - Ghi chú (note)
  - Liên kết với Aptech exam (nếu có)
  - Trạng thái: PENDING

#### 5.2. Upload biên bản
- Upload file biên bản giảng thử
- Liên kết file với TrialEvaluation
- Quản lý file biên bản

#### 5.3. Chấm điểm giảng thử
- Tạo đánh giá (TrialEvaluation)
  - Điểm số (score)
  - Nhận xét (comments)
  - Kết luận (conclusion): PASS/FAIL
  - Upload file báo cáo (file_report_id)
- Cập nhật trạng thái trial: PENDING → REVIEWED

#### 5.4. Kết luận PASS/FAIL
- Đánh giá và kết luận:
  - **PASS:** Đạt yêu cầu
  - **FAIL:** Không đạt yêu cầu
- Lưu kết luận vào TrialEvaluation

#### 5.5. Liên kết với Aptech exam
- Liên kết trial với kỳ thi Aptech (aptech_exam_id)
- Xem thông tin kỳ thi liên quan
- Quản lý mối quan hệ Trial ↔ AptechExam

#### 5.6. Quản lý người tham dự
- Thêm người tham dự (TrialAttendee)
  - Chọn user hoặc nhập tên
  - Vai trò: CHU_TOA, THU_KY, THANH_VIEN
- Xem danh sách người tham dự

---

### 6. Evidence & OCR (Minh chứng & OCR)

#### 6.1. Upload file minh chứng
- Upload file minh chứng (Evidence)
  - Chọn giảng viên
  - Chọn môn học
  - Upload file (file_id)
  - Ngày nộp (submitted_date)
  - Trạng thái: PENDING

#### 6.2. OCR tự động
- Tự động chạy OCR khi upload file
- Trích xuất thông tin:
  - Tên đầy đủ (ocr_full_name)
  - Người đánh giá (ocr_evaluator)
  - Kết quả (ocr_result): PASS/FAIL
  - Toàn bộ text (ocr_text)

#### 6.3. Lưu text OCR
- Lưu kết quả OCR vào database
- Hiển thị text đã OCR
- Cho phép chỉnh sửa nếu cần

#### 6.4. Liên kết Evidence ↔ Subject
- Liên kết minh chứng với môn học
- Xem tất cả minh chứng của một môn
- Xem tất cả minh chứng của một giảng viên

#### 6.5. Xác minh minh chứng
- Xác minh minh chứng (verified_by, verified_at)
- Cập nhật trạng thái:
  - **PENDING:** Chờ xác minh
  - **VERIFIED:** Đã xác minh
  - **REJECTED:** Bị từ chối
- Thêm ghi chú nếu từ chối

#### 6.6. Xem lịch sử minh chứng
- Xem tất cả minh chứng của giảng viên
- Xem minh chứng theo môn học
- Xem minh chứng theo trạng thái
- Xem lịch sử xác minh

---

### 7. Teaching Assignment (Phân công Giảng dạy)

#### 7.1. Check eligibility (registration + exam + trial)
- Kiểm tra điều kiện phân công:
  - Đã đăng ký môn (SubjectRegistration với status COMPLETED)
  - Đã thi Aptech và PASS (AptechExam với result PASS)
  - Đã dạy thử và PASS (TrialEvaluation với conclusion PASS)
  - Có minh chứng đã xác minh (Evidence với status VERIFIED)
- Hiển thị danh sách điều kiện còn thiếu

#### 7.2. Phân công giảng viên vào môn
- Tạo phân công (TeachingAssignment)
  - Chọn giảng viên
  - Chọn môn học
  - Chọn năm (year) và quý (quarter)
  - Người phân công (assigned_by)
  - Thời gian phân công (assigned_at)
  - Trạng thái: ASSIGNED
  - Ghi chú (notes)

#### 7.3. Update COMPLETED / NOT_COMPLETED
- Cập nhật trạng thái phân công:
  - **ASSIGNED:** Đã phân công, chưa hoàn thành
  - **COMPLETED:** Đã hoàn thành giảng dạy
  - **NOT_COMPLETED:** Chưa hoàn thành
  - **FAILED:** Phân công thất bại (không đủ điều kiện)
- Cập nhật thời gian hoàn thành (completed_at)

#### 7.4. Notify khi phân công thất bại
- Gửi thông báo (Notification) khi phân công thất bại
- Nội dung thông báo: Lý do thất bại, điều kiện còn thiếu
- Cập nhật trạng thái: FAILED
- Lưu lý do thất bại (failure_reason)

---

### 8. Reporting & Export (Báo cáo & Xuất file)

#### 8.1. Báo cáo theo quý, năm, exam, trial
- Tạo báo cáo (Report) theo:
  - **QUARTER:** Báo cáo theo quý
  - **YEAR:** Báo cáo theo năm
  - **APTECH:** Báo cáo kỳ thi Aptech
  - **TRIAL:** Báo cáo giảng thử
- Tham số báo cáo (params_json)
- Trạng thái: GENERATED / FAILED

#### 8.2. Tổng hợp evidence + exam + trial + assignment
- Tổng hợp dữ liệu:
  - Số lượng minh chứng
  - Số lượng kỳ thi (PASS/FAIL)
  - Số lượng giảng thử (PASS/FAIL)
  - Số lượng phân công (COMPLETED/NOT_COMPLETED)
- Thống kê theo giảng viên, môn học, năm, quý

#### 8.3. Export Word / Excel / PDF
- Xuất báo cáo ra file:
  - **Word (.docx):** Báo cáo chi tiết
  - **Excel (.xlsx):** Bảng dữ liệu
  - **PDF (.pdf):** Báo cáo in ấn
- Lưu file vào Report (file_id)
- Tải file báo cáo

#### 8.4. Dashboard thống kê
- Dashboard tổng quan:
  - Tổng số giảng viên (ACTIVE/INACTIVE)
  - Tổng số môn học (ACTIVE/INACTIVE)
  - Số đăng ký môn theo năm/quý
  - Số kỳ thi (PASS/FAIL)
  - Số giảng thử (PASS/FAIL)
  - Số phân công (COMPLETED/NOT_COMPLETED)
  - Tỷ lệ hoàn thành
- Biểu đồ, bảng thống kê
- Lọc theo năm, quý

---

## II. CHỨC NĂNG CHO TEACHER

### 1. Profile (Hồ sơ cá nhân)

#### 1.1. Xem thông tin giảng viên
- Xem thông tin cá nhân:
  - Họ tên, email, số điện thoại, địa chỉ
  - Mã giảng viên (teacher_code)
  - Trạng thái (teacher_status)
  - Avatar
- Xem thông tin tài khoản:
  - Username
  - Role
  - Trạng thái active
  - Lần đăng nhập cuối (last_login)

#### 1.2. Cập nhật thông tin cá nhân
- Cập nhật thông tin:
  - Họ tên
  - Email
  - Số điện thoại
  - Địa chỉ
  - Avatar (upload file)
- Validation thông tin
- Lưu lịch sử thay đổi

#### 1.3. Đổi mật khẩu
- Đổi mật khẩu:
  - Nhập mật khẩu cũ
  - Nhập mật khẩu mới
  - Xác nhận mật khẩu mới
- Validation: Mật khẩu mới phải khác mật khẩu cũ, độ dài tối thiểu
- Bảo mật: Hash password trước khi lưu

---

### 2. Đăng ký môn

#### 2.1. Xem môn được phép đăng ký
- Xem danh sách môn học active
- Lọc theo hệ thống (APTECH/ARENA)
- Tìm kiếm môn học
- Xem thông tin chi tiết môn học

#### 2.2. Đăng ký môn theo quý/năm
- Tạo đăng ký môn học:
  - Chọn môn học
  - Chọn năm (year)
  - Chọn quý (quarter)
  - Trạng thái: REGISTERED
- Validation:
  - Kiểm tra tối thiểu 4 môn/năm
  - Kiểm tra tối thiểu 1 môn/quý
  - Không trùng đăng ký

#### 2.3. Xem trạng thái đăng ký
- Xem trạng thái đăng ký:
  - **REGISTERED:** Đã đăng ký, chưa hoàn thành
  - **COMPLETED:** Đã hoàn thành
  - **NOT_COMPLETED:** Không hoàn thành
- Xem chi tiết từng đăng ký

#### 2.4. Xem lịch sử đăng ký
- Xem tất cả đăng ký của bản thân
- Xem đăng ký theo năm/quý
- Xem lịch sử thay đổi trạng thái
- Xem đăng ký đã dời (carry over)

#### 2.5. Xem lý do bị dời môn
- Xem lý do dời môn (reason_for_carry_over)
- Xem thông tin đăng ký gốc và đăng ký mới
- Xem người dời môn và thời gian

---

### 3. Thi Aptech

#### 3.1. Xem kỳ thi (Toàn)
- Xem danh sách kỳ thi Aptech:
  - Phiên thi (session): ngày, giờ, phòng
  - Môn thi
  - Số lần thi (attempt)
  - Trạng thái
- Xem chi tiết kỳ thi
- Lọc theo môn học, năm

#### 3.2. Xem kết quả PASS/FAIL (Toàn)
- Xem kết quả thi:
  - Điểm số (score)
  - Kết quả (result): PASS/FAIL
  - Ngày thi (exam_date)
- Xem lịch sử các lần thi
- Xem điều kiện thi lại

#### 3.3. Tải certificate (Toàn)
- Tải file chứng chỉ (certificate_file_id)
- Xem thông tin chứng chỉ
- Chỉ hiển thị khi đã PASS

#### 3.4. Xem điều kiện thi lại (Toàn)
- Xem điều kiện thi lại:
  - Chỉ được thi lại nếu lần trước FAIL
  - Số lần thi hiện tại
  - Giới hạn số lần thi (nếu có)
- Thông báo nếu không đủ điều kiện

---

### 4. Giảng thử (Trial)

#### 4.1. Xem lịch giảng thử
- Xem danh sách giảng thử:
  - Môn học
  - Ngày giảng (teaching_date)
  - Địa điểm (location)
  - Trạng thái (PENDING/REVIEWED)
- Xem chi tiết buổi giảng thử
- Lọc theo môn học, năm

#### 4.2. Xem kết quả chấm
- Xem kết quả đánh giá:
  - Điểm số (score)
  - Nhận xét (comments)
  - Kết luận (conclusion): PASS/FAIL
- Xem người đánh giá
- Xem thời gian đánh giá

#### 4.3. Xem biên bản giảng thử
- Xem file biên bản (file_report_id)
- Tải file biên bản
- Xem nội dung biên bản

#### 4.4. Xem kết luận PASS/FAIL
- Xem kết luận:
  - **PASS:** Đạt yêu cầu
  - **FAIL:** Không đạt yêu cầu
- Xem chi tiết đánh giá
- Xem liên kết với Aptech exam (nếu có)

#### 4.5. Xem người tham dự
- Xem danh sách người tham dự:
  - Tên người tham dự
  - Vai trò: CHU_TOA, THU_KY, THANH_VIEN

---

### 5. Evidence (Minh chứng)

#### 5.1. Upload minh chứng (nếu được quyền)
- Upload file minh chứng:
  - Chọn môn học
  - Upload file
  - Ngày nộp (submitted_date)
  - Trạng thái: PENDING
- Validation: Chỉ upload file hợp lệ
- Kiểm tra quyền upload

#### 5.2. Xem OCR
- Xem kết quả OCR:
  - Tên đầy đủ (ocr_full_name)
  - Người đánh giá (ocr_evaluator)
  - Kết quả (ocr_result): PASS/FAIL
  - Toàn bộ text (ocr_text)
- Xem file gốc

#### 5.3. Xem lịch sử minh chứng
- Xem tất cả minh chứng đã nộp:
  - Môn học
  - Ngày nộp
  - Trạng thái: PENDING/VERIFIED/REJECTED
  - Người xác minh
  - Thời gian xác minh
- Xem chi tiết từng minh chứng
- Lọc theo môn học, trạng thái

---

### 6. Phân công giảng dạy

#### 6.1. Xem môn được phân công
- Xem danh sách phân công:
  - Môn học
  - Năm (year) và quý (quarter)
  - Trạng thái: ASSIGNED/COMPLETED/NOT_COMPLETED/FAILED
  - Thời gian phân công (assigned_at)
- Xem chi tiết phân công
- Lọc theo năm, quý, trạng thái

#### 6.2. Xem trạng thái COMPLETED / NOT_COMPLETED
- Xem trạng thái phân công:
  - **ASSIGNED:** Đã phân công, chưa hoàn thành
  - **COMPLETED:** Đã hoàn thành giảng dạy
  - **NOT_COMPLETED:** Chưa hoàn thành
  - **FAILED:** Phân công thất bại
- Xem thời gian hoàn thành (completed_at)

#### 6.3. Nhận thông báo phân công thất bại
- Xem thông báo (Notification):
  - Tiêu đề, nội dung
  - Lý do thất bại (failure_reason)
  - Điều kiện còn thiếu
- Đánh dấu đã đọc
- Xem chi tiết phân công thất bại

#### 6.4. Xem yêu cầu còn thiếu
- Xem danh sách yêu cầu còn thiếu:
  - Đăng ký môn (chưa COMPLETED)
  - Thi Aptech (chưa PASS)
  - Dạy thử (chưa PASS)
  - Minh chứng (chưa VERIFIED)
- Hướng dẫn hoàn thành yêu cầu

---

### 7. Báo cáo cá nhân

#### 7.1. Xem và tải báo cáo cá nhân
- Xem danh sách báo cáo:
  - Loại báo cáo (QUARTER/YEAR/APTECH/TRIAL)
  - Năm, quý
  - Trạng thái (GENERATED/FAILED)
  - Thời gian tạo
- Tải file báo cáo (Word/Excel/PDF)
- Xem chi tiết báo cáo

#### 7.2. Báo cáo môn dạy
- Báo cáo các môn đã dạy:
  - Danh sách môn đã phân công
  - Trạng thái hoàn thành
  - Số lượng môn theo năm/quý
- Thống kê theo năm, quý

#### 7.3. Tỷ lệ pass
- Thống kê tỷ lệ:
  - Tỷ lệ pass thi Aptech
  - Tỷ lệ pass dạy thử
  - Tỷ lệ hoàn thành phân công
- Biểu đồ, bảng thống kê

#### 7.4. Minh chứng cá nhân
- Thống kê minh chứng:
  - Số lượng minh chứng đã nộp
  - Số lượng đã xác minh (VERIFIED)
  - Số lượng bị từ chối (REJECTED)
  - Số lượng chờ xác minh (PENDING)
- Thống kê theo môn học

#### 7.5. Kỳ thi và trial đã tham gia
- Thống kê kỳ thi:
  - Số lượng kỳ thi đã tham gia
  - Số lượng PASS/FAIL
  - Điểm trung bình
- Thống kê giảng thử:
  - Số lượng giảng thử đã tham gia
  - Số lượng PASS/FAIL
  - Điểm trung bình
- Biểu đồ, bảng thống kê

---

## III. YÊU CẦU CHUNG

### 1. Authentication & Authorization
- Đăng nhập/Đăng xuất
- Phân quyền theo role (ADMIN/TEACHER)
- JWT token authentication
- Session management

### 2. Validation
- Validation dữ liệu đầu vào
- Validation business rules
- Error handling và thông báo lỗi rõ ràng

### 3. Notification System
- Thông báo real-time (nếu có)
- Thông báo trong hệ thống (Notification)
- Email notification (nếu cần)

### 4. Audit Log
- Ghi log tất cả thao tác quan trọng
- Lưu thông tin: người thực hiện, hành động, entity, thời gian
- Xem lịch sử thay đổi

### 5. File Management
- Upload file (chứng chỉ, biên bản, minh chứng)
- Download file
- Quản lý file (xóa, cập nhật)
- OCR integration

### 6. Search & Filter
- Tìm kiếm toàn văn
- Lọc theo nhiều tiêu chí
- Sắp xếp kết quả
- Phân trang

### 7. Export & Report
- Export dữ liệu ra Word/Excel/PDF
- Tạo báo cáo tự động
- Dashboard thống kê

### 8. UI/UX
- Giao diện thân thiện, dễ sử dụng
- Responsive design
- Loading states
- Error states
- Success notifications

---

## IV. PRIORITY IMPLEMENTATION

### Phase 1: Core Features (Ưu tiên cao)
1. Authentication & Authorization
2. Teacher Management (CRUD cơ bản)
3. Subject Management (CRUD cơ bản)
4. Subject Registration (Đăng ký môn)
5. Profile Management

### Phase 2: Exam & Trial (Ưu tiên trung bình)
1. Aptech Exam Management
2. Trial Teaching Management
3. Evidence & OCR

### Phase 3: Assignment & Reporting (Ưu tiên thấp)
1. Teaching Assignment
2. Reporting & Export
3. Dashboard

### Phase 4: Enhancement (Tối ưu)
1. Notification System
2. Audit Log
3. Advanced Search & Filter
4. Performance Optimization





Dùng cái này để loading trang
import Loading from '../components/Common/Loading';

if (isLoading) {
  return <Loading fullscreen={true} message="Đang xử lý..." />;
}

// Hoặc inline loading
<Loading fullscreen={false} message="Đang tải dữ liệu..." />




Khi đăng ký thi, duyệt xong -> check Valid pass -> 
Đăng ký thi thử 
Thi thử -> 