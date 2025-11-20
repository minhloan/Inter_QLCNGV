# Test Images for OCR

## Format ảnh mẫu để test OCR

Để test chức năng OCR, bạn cần một tấm ảnh hoặc PDF có format như sau:

### Nội dung cần có trong ảnh:

1. **Tiêu đề**: "PHIẾU ĐÁNH GIÁ GIẢNG DẠY" hoặc tương tự
2. **Họ tên**: "Họ tên: [Tên giáo viên]" (ví dụ: "Họ tên: Nguyễn Văn A")
3. **Người đánh giá**: "Người đánh giá: [Tên]" hoặc "Evaluator: [Tên]" (ví dụ: "Người đánh giá: Trần Thị B")
4. **Kết quả**: "Kết quả: PASS" hoặc "Kết quả: FAIL" hoặc "Result: PASS/FAIL"

### Ví dụ format:

```
PHIẾU ĐÁNH GIÁ GIẢNG DẠY

Họ tên: Nguyễn Văn A
Môn học: Elementary Programming
Người đánh giá: Trần Thị B
Kết quả: PASS
Ngày: 15/01/2024
```

### Yêu cầu chất lượng ảnh:

- Độ phân giải tối thiểu: 300 DPI
- Định dạng: JPG, JPEG, PNG hoặc PDF
- Chữ rõ ràng, không bị mờ
- Nền trắng hoặc nền sáng
- Chữ đen hoặc chữ tối màu

### Cách tạo ảnh mẫu để test:

**Cách 1: Sử dụng template HTML có sẵn (Khuyến nghị)**

1. Mở file `sample-evidence-template.html` (PASS) hoặc `sample-evidence-fail-template.html` (FAIL) trong trình duyệt
2. Nhấn `Ctrl+P` (Windows) hoặc `Cmd+P` (Mac) để in
3. Chọn "Save as PDF" hoặc in ra giấy rồi chụp ảnh
4. Upload file PDF hoặc ảnh qua API để test OCR

**Cách 2: Chụp ảnh thực tế**

1. Chụp ảnh hoặc scan một phiếu đánh giá thực tế
2. Đảm bảo ảnh có đủ thông tin: Họ tên, Người đánh giá, Kết quả
3. Upload qua API: `POST /v1/teacher/evidence/upload`

### Cách test OCR:

1. Upload file qua API: `POST /v1/teacher/evidence/upload`
   ```json
   {
     "file": "[file PDF hoặc Image]",
     "teacherId": "teacher-uuid",
     "subjectId": "subject-uuid" (optional),
     "submittedDate": "2024-01-15" (optional)
   }
   ```

2. Kiểm tra kết quả OCR trong response:
   - `ocrText`: Toàn bộ text được trích xuất
   - `ocrFullName`: Tên giáo viên được trích xuất
   - `ocrEvaluator`: Tên người đánh giá được trích xuất
   - `ocrResult`: Kết quả PASS/FAIL được trích xuất

3. Nếu OCR chưa chính xác, có thể:
   - Chỉnh sửa thủ công: `PUT /v1/teacher/evidence/{id}/ocr-text`
   - Reprocess OCR: `POST /v1/teacher/evidence/{id}/reprocess-ocr`

### Lưu ý:

- OCR có thể không chính xác 100%, đặc biệt với chữ viết tay
- Nếu OCR không chính xác, admin có thể chỉnh sửa thủ công qua API `PUT /v1/teacher/evidence/{id}/ocr-text`
- Có thể reprocess OCR nếu cần: `POST /v1/teacher/evidence/{id}/reprocess-ocr`

