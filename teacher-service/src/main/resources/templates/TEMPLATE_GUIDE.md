# Hướng dẫn tạo Template Word cho XDocReport (Freemarker)

## Cú pháp cơ bản (Freemarker syntax)

### 1. Thay thế text đơn giản
Trong template Word, sử dụng `${variableName}`:
```
Ngày: ${date}
Thời gian: ${time}
Địa điểm: ${location}
```

### 2. Loop qua danh sách
Sử dụng `<#list>` và `</#list>`:
```
<#list attendees as attendee>
${attendee.stt} | ${attendee.name} | ${attendee.position} | ${attendee.workTask}
</#list>
```

### 3. Conditional rendering
```
<#if conclusion??>
Kết luận: ${conclusion}
</#if>
```

### 4. Loop trong table
Trong Word table, đặt loop ở dòng đầu tiên của data row:
```
| STT | HỌ TÊN | CHỨC VỤ | CÔNG VIỆC |
|-----|--------|---------|-----------|
<#list attendees as attendee>
| ${attendee.stt} | ${attendee.name} | ${attendee.position} | ${attendee.workTask} |
</#list>
```

## Ví dụ Template cho BM06.39

### Header (căn trái):
```
TRUNG TÂM CÔNG NGHỆ PHẦN MỀM ĐẠI HỌC CẦN THƠ
CANTHO UNIVERSITY SOFTWARE CENTER
Khu III, Đại học Cần Thơ, 01 Lý Tự Trọng, TP. Cần Thơ - Tel: 0292.3731072 & Fax: 0292.3731071 - Email: cusc@ctu.edu.vn
```

### Title (căn giữa):
```
BẢNG PHÂN CÔNG
ĐÁNH GIÁ GIÁO VIÊN GIẢNG THỬ
```

### Thông tin chung:
```
1. Thông tin chung:
Ngày: ${date}
Thời gian: ${time}
Địa điểm: ${location}
```

### Table thành phần tham dự:
Tạo table trong Word với 4 cột, dòng đầu là header, các dòng sau:
```
<#list attendees as attendee>
${attendee.stt} | ${attendee.name} | ${attendee.position} | ${attendee.workTask}
</#list>
```

## Lưu ý

1. **File template phải là .docx** (không phải .doc)
2. **Placeholder phải match với tên field trong Context class**
3. **Table rows sẽ tự động duplicate** khi loop
4. **Formatting trong Word sẽ được giữ nguyên** (font, size, bold, etc.)

## Cách test

1. Tạo file template Word với các placeholder
2. Đặt vào `src/main/resources/templates/`
3. Gọi method trong service
4. Kiểm tra output

