# Hướng dẫn sửa lỗi "invalid block type" khi xuất file Word

## Nguyên nhân lỗi

Lỗi `java.util.zip.ZipException: invalid block type` xảy ra khi:
1. **File template Word (.docx) bị hỏng hoặc corrupt**: File template không phải là file ZIP hợp lệ (vì .docx thực chất là file ZIP nén)
2. **File template không tồn tại**: File template không có trong thư mục `src/main/resources/templates/`
3. **File template đang được sử dụng**: File đang mở trong Microsoft Word hoặc ứng dụng khác
4. **File template bị lỗi trong quá trình build**: File không được copy đúng vào JAR file khi build

## Cách kiểm tra và sửa lỗi

### Bước 1: Kiểm tra file template có tồn tại

Đảm bảo các file sau tồn tại trong thư mục:
```
teacher-service/src/main/resources/templates/
├── BM06.35-template.docx
└── BM06.36-template.docx
```

### Bước 2: Kiểm tra file template có hợp lệ

1. **Mở file template bằng Microsoft Word**:
   - Nếu file mở được bình thường → File hợp lệ
   - Nếu Word báo lỗi "File bị hỏng" → File bị corrupt, cần thay thế

2. **Kiểm tra file có đang được sử dụng**:
   - Đóng tất cả ứng dụng đang mở file template (Word, Excel, etc.)
   - Thử lại chức năng xuất file

### Bước 3: Thay thế file template nếu bị hỏng

Nếu file template bị corrupt:

1. **Lấy file template gốc** từ:
   - Thư mục root: `BM06.35-template.docx`, `BM06.36-template.docx`
   - Hoặc từ backup/version control

2. **Copy file vào đúng vị trí**:
   ```bash
   # Copy từ root vào resources
   cp BM06.35-template.docx teacher-service/src/main/resources/templates/
   cp BM06.36-template.docx teacher-service/src/main/resources/templates/
   ```

3. **Rebuild project**:
   ```bash
   cd teacher-service
   mvn clean install
   ```

### Bước 4: Kiểm tra file template sau khi build

Sau khi build, kiểm tra file template có trong JAR:
```bash
# Kiểm tra file có trong JAR
jar -tf teacher-service/target/teacher-service-*.jar | grep BM06
```

Nếu không thấy file template trong JAR, kiểm tra:
- File có trong `src/main/resources/templates/` không?
- File có bị ignore trong `.gitignore` không?
- Có lỗi trong quá trình build không?

## Cách phòng tránh

1. **Luôn backup file template gốc** trước khi chỉnh sửa
2. **Không mở file template trong Word** khi đang chạy ứng dụng
3. **Kiểm tra file template** sau mỗi lần chỉnh sửa bằng cách:
   - Mở file trong Word
   - Lưu lại file
   - Rebuild project

## Thông báo lỗi mới

Sau khi cập nhật code, hệ thống sẽ hiển thị thông báo lỗi rõ ràng hơn:

- **File không tồn tại**: "Không tìm thấy file template BM06.XX-template.docx trong thư mục resources/templates..."
- **File bị hỏng**: "File template BM06.XX-template.docx bị hỏng hoặc không hợp lệ..."
- **File không phải Word**: "File template BM06.XX-template.docx không phải là file Word hợp lệ..."

## Liên hệ hỗ trợ

Nếu vẫn gặp lỗi sau khi thực hiện các bước trên, vui lòng:
1. Kiểm tra log chi tiết trong console
2. Chụp ảnh thông báo lỗi
3. Kiểm tra version của Apache POI trong `pom.xml`

