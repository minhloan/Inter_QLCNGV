# Template Word Documents

Thư mục này chứa các template Word (.docx) được sử dụng để generate các biểu mẫu đánh giá giảng thử.

## Các Template

1. **BM06.39-template.docx**: Phân công đánh giá giáo viên giảng thử
2. **BM06.41-template.docx**: Biên bản đánh giá giảng thử

## Cách Generate Template

Template được tạo tự động bằng class `TemplateGenerator`. Để generate template:

### Cách 1: Chạy main method (đã config trong pom.xml)
```bash
cd teacher-service
mvn compile exec:java
```

**Lưu ý cho Windows PowerShell:**
- Không dùng `&&` để nối lệnh, chạy từng lệnh riêng:
```powershell
cd teacher-service
mvn compile exec:java
```

### Cách 2: Chạy test (nếu có)
```bash
cd teacher-service
mvn test -Dtest=TemplateGeneratorTest
```

Template sẽ được tạo tại: `src/main/resources/templates/`

## Cách Template Hoạt Động

Template sử dụng **XDocReport** với **Freemarker** engine để fill data vào Word document.

### Cú pháp Freemarker trong Template

1. **Simple variable**: `${variableName}`
   - Ví dụ: `${date}`, `${teacherName}`

2. **List loop trong table**:
   ```
   Cell 1: <#list items as item>${item.field1}
   Cell 2: ${item.field2}
   Cell 3: ${item.field3}</#list>
   ```
   - `<#list>` đặt ở cell đầu tiên
   - `</#list>` đặt ở cell cuối cùng

3. **List loop trong paragraph**:
   ```
   <#list comments as comment>${comment}\n</#list>
   ```

4. **Conditional**:
   ```
   <#if condition??>${value}<#else>default</#if>
   ```

## Data Context

Template nhận data từ `TrialEvaluationExportServiceWithTemplate`:

### BM06.39 Context:
- `date`: Ngày (String)
- `time`: Thời gian (String)
- `location`: Địa điểm (String)
- `teacherName`: Tên giáo viên (String)
- `subjectName`: Tên môn học (String)
- `teachingTime`: Thời gian giảng dạy (String)
- `attendees`: List of `AttendeeContext`
  - `stt`: Số thứ tự (String)
  - `name`: Họ tên (String)
  - `position`: Chức vụ (String)
  - `workTask`: Công việc (String)

### BM06.41 Context:
- Tất cả fields từ BM06.39, thêm:
- `comments`: List of String (nhận xét)
- `conclusion`: Kết luận (String: "ĐẠT" hoặc "KHÔNG ĐẠT")

## Lưu ý

1. Sau khi generate template, có thể mở file trong Word để chỉnh sửa format (font, size, alignment, etc.)
2. **KHÔNG** xóa hoặc sửa các placeholder Freemarker (${...}, <#list>, etc.)
3. Nếu cần thay đổi cấu trúc template, sửa code trong `TemplateGenerator` và generate lại
