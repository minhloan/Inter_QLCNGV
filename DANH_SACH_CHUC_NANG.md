# Danh Sách Chức Năng Hiện Có

## Tổng Quan
Hệ thống quản lý giáo viên sử dụng kiến trúc microservices với các service:
- **Config Server** (Port 8888): Quản lý cấu hình tập trung
- **Eureka Server** (Port 8761): Service discovery
- **Teacher Service** (Port 8002): Service chính xử lý business logic
- **Gateway** (Port 8080): API Gateway với JWT authentication
- **Redis**: Cache và session management

---

## 1. Chức Năng Xác Thực (Authentication) - `/v1/teacher/auth`

### 1.1. Đăng Nhập
- **Endpoint**: `POST /v1/teacher/auth/login`
- **Mô tả**: Đăng nhập bằng email và password
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `TokenDto` (chứa JWT token)
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/controller/AuthController.java`
  - `teacher-service/src/main/java/com/example/teacherservice/request/auth/LoginRequest.java`
  - `teacher-service/src/main/java/com/example/teacherservice/dto/auth/TokenDto.java`
  - `teacher-service/src/main/java/com/example/teacherservice/service/auth/AuthService.java`

### 1.2. Đăng Nhập Với Role
- **Endpoint**: `POST /v1/teacher/auth/login/role?role=TEACHER`
- **Mô tả**: Đăng nhập và chọn role cụ thể
- **Request Body**: Giống như đăng nhập
- **Query Parameter**: `role` (TEACHER, ADMIN, etc.)
- **Response**: `TokenDto`

### 1.3. Đăng Ký
- **Endpoint**: `POST /v1/teacher/auth/register`
- **Mô tả**: Đăng ký tài khoản mới
- **Request Body**:
  ```json
  {
    "username": "username123",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Validation**:
  - Username: tối thiểu 6 ký tự
  - Email: phải đúng định dạng email
  - Password: tối thiểu 8 ký tự, có ít nhất 1 chữ cái và 1 số
- **Response**: `RegisterDto`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/request/auth/RegisterRequest.java`
  - `teacher-service/src/main/java/com/example/teacherservice/dto/auth/RegisterDto.java`

### 1.4. Quên Mật Khẩu
- **Endpoint**: `POST /v1/teacher/auth/forgotPassword`
- **Mô tả**: Gửi OTP đến email để reset mật khẩu
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "ok": true,
    "message": "OTP sent to your email"
  }
  ```
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/auth/ForgotPassword.java`
  - `teacher-service/src/main/java/com/example/teacherservice/service/auth/EmailService.java`

### 1.5. Xác Thực OTP
- **Endpoint**: `POST /v1/teacher/auth/verifyOtp`
- **Mô tả**: Xác thực mã OTP đã gửi qua email
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**: 
  ```json
  {
    "ok": true,
    "message": "OTP verified successfully"
  }
  ```
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/auth/VerifyOtp.java`

### 1.6. Cập Nhật Mật Khẩu
- **Endpoint**: `POST /v1/teacher/auth/updatePassword`
- **Mô tả**: Cập nhật mật khẩu sau khi xác thực OTP
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newPassword123"
  }
  ```
- **Response**: 
  ```json
  {
    "ok": true,
    "message": "Password updated successfully"
  }
  ```
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/request/auth/UpdatePasswordRequest.java`

---

## 2. Chức Năng Quản Lý User - `/v1/teacher/user`

### 2.1. Lấy Thông Tin User Hiện Tại
- **Endpoint**: `GET /v1/teacher/user/information`
- **Mô tả**: Lấy thông tin user đang đăng nhập (từ JWT token)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `UserInformationDto`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/UserInformationDto.java`
  - `teacher-service/src/main/java/com/example/teacherservice/jwt/JwtUtil.java`

### 2.2. Tạo User Mới
- **Endpoint**: `POST /v1/teacher/user/save`
- **Mô tả**: Tạo user mới (tương tự đăng ký)
- **Request Body**: `RegisterRequest`
- **Response**: `UserDto`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/UserDto.java`
  - `teacher-service/src/main/java/com/example/teacherservice/service/user/UserService.java`

### 2.3. Lấy Tất Cả Users (Admin)
- **Endpoint**: `GET /v1/teacher/user/getAll`
- **Mô tả**: Lấy danh sách tất cả users (dành cho admin)
- **Response**: `List<UserAdminDto>`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/UserAdminDto.java`

### 2.4. Lấy User Theo ID (Admin)
- **Endpoint**: `GET /v1/teacher/user/getUserForAdminByUserId/{id}`
- **Mô tả**: Lấy thông tin chi tiết user theo ID (dành cho admin)
- **Path Variable**: `id` (String)
- **Response**: `UserAdminDto`

### 2.5. Lấy User Theo ID
- **Endpoint**: `GET /v1/teacher/user/getUserById/{id}`
- **Mô tả**: Lấy thông tin user theo ID
- **Path Variable**: `id` (String)
- **Response**: `UserDto`

### 2.6. Lấy User Theo Email
- **Endpoint**: `GET /v1/teacher/user/getUserByEmail?email=user@example.com`
- **Mô tả**: Lấy thông tin user theo email
- **Query Parameter**: `email` (String)
- **Response**: `AuthUserDto`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/auth/AuthUserDto.java`

### 2.7. Lấy User Theo Username
- **Endpoint**: `GET /v1/teacher/user/getUserByUsername/{username}`
- **Mô tả**: Lấy thông tin user theo username
- **Path Variable**: `username` (String)
- **Response**: `AuthUserDto`

### 2.8. Cập Nhật User
- **Endpoint**: `PUT /v1/teacher/user/update`
- **Mô tả**: Cập nhật thông tin user (có thể upload ảnh)
- **Content-Type**: `multipart/form-data`
- **Request Parts**:
  - `request`: `UserUpdateRequest` (JSON string)
  - `file`: MultipartFile (optional - ảnh đại diện)
- **Response**: `UserAdminDto`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/request/user/UserUpdateRequest.java`
  - `teacher-service/src/main/java/com/example/teacherservice/model/UserDetails.java`

### 2.9. Xóa User
- **Endpoint**: `DELETE /v1/teacher/user/deleteUserById/{id}`
- **Mô tả**: Xóa user theo ID
- **Path Variable**: `id` (String)
- **Response**: `204 No Content`

### 2.10. Cập Nhật Mật Khẩu User
- **Endpoint**: `POST /v1/teacher/user/update-password`
- **Mô tả**: Cập nhật mật khẩu cho user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "newPassword123"
  }
  ```
- **Response**: `204 No Content`
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/dto/auth/UpdatePassword.java`

---

## 3. Chức Năng Quản Lý File - `/v1/teacher/file`

### 3.1. Upload Ảnh
- **Endpoint**: `POST /v1/teacher/file/upload`
- **Mô tả**: Upload ảnh lên hệ thống
- **Content-Type**: `multipart/form-data`
- **Request Part**: `image` (MultipartFile)
- **Response**: String (file ID hoặc URL)
- **File liên quan**:
  - `teacher-service/src/main/java/com/example/teacherservice/service/file/FileService.java`
  - `teacher-service/src/main/java/com/example/teacherservice/model/File.java`

### 3.2. Download Ảnh
- **Endpoint**: `GET /v1/teacher/file/download/{id}`
- **Mô tả**: Tải ảnh từ hệ thống
- **Path Variable**: `id` (String - file ID)
- **Response**: Image file (PNG)
- **Content-Type**: `image/png`

### 3.3. Lấy Ảnh Theo ID
- **Endpoint**: `GET /v1/teacher/file/get/{id}`
- **Mô tả**: Lấy ảnh theo ID với đúng content-type
- **Path Variable**: `id` (String)
- **Response**: Image file với content-type phù hợp

### 3.4. Xóa Ảnh
- **Endpoint**: `DELETE /v1/teacher/file/delete/{id}`
- **Mô tả**: Xóa ảnh khỏi hệ thống
- **Path Variable**: `id` (String)
- **Response**: `200 OK`

---

## 4. Cấu Trúc Dữ Liệu

### 4.1. User Model
- **File**: `teacher-service/src/main/java/com/example/teacherservice/model/User.java`
- **Các trường**:
  - `id`: String (UUID)
  - `username`: String (required)
  - `password`: String (required, encoded)
  - `email`: String (required, unique)
  - `primaryRole`: Role enum (TEACHER, ADMIN, etc.)
  - `roles`: Set<Role> (nhiều roles)
  - `active`: Active enum (ACTIVE, INACTIVE)
  - `userDetails`: UserDetails (embedded)

### 4.2. UserDetails Model
- **File**: `teacher-service/src/main/java/com/example/teacherservice/model/UserDetails.java`
- **Các trường**:
  - `firstName`: String
  - `lastName`: String
  - `phoneNumber`: String
  - `gender`: Gender enum
  - `aboutMe`: String
  - `birthDate`: Date
  - `imageUrl`: String

### 4.3. Enums
- **Role**: `teacher-service/src/main/java/com/example/teacherservice/enums/Role.java`
- **Gender**: `teacher-service/src/main/java/com/example/teacherservice/enums/Gender.java`
- **Active**: `teacher-service/src/main/java/com/example/teacherservice/enums/Active.java`

---

## 5. Bảo Mật

### 5.1. JWT Authentication
- **File**: 
  - `teacher-service/src/main/java/com/example/teacherservice/jwt/JwtUtil.java`
  - `gateway/src/main/java/com/example/gateway/filter/JwtAuthenticationFilter.java`
- **Cách hoạt động**: Gateway kiểm tra JWT token trong header `Authorization: Bearer <token>`

### 5.2. Security Config
- **File**: `teacher-service/src/main/java/com/example/teacherservice/config/SecurityConfig.java`
- **Mô tả**: Cấu hình Spring Security, password encoder, authentication filters

---

## 6. Gateway Routes

### 6.1. Teacher Service Route
- **Path Pattern**: `/v1/teacher/**`
- **Target**: `lb://teacher-service`
- **Filter**: JWT Authentication Filter
- **File**: `gateway/src/main/java/com/example/gateway/config/GatewayConfig.java`

---

## 7. Cấu Hình

### 7.1. Redis
- **Mục đích**: Cache và session management
- **Port**: 6379
- **Docker Compose**: `docker-compose.yml`
- **Config**: `teacher-service/src/main/java/com/example/teacherservice/config/RedisConfig.java`

### 7.2. Eureka Discovery
- **Port**: 8761
- **Dashboard**: http://localhost:8761
- **Mục đích**: Service discovery và load balancing

---

## 8. Exception Handling

### 8.1. Global Exception Handler
- **File**: `teacher-service/src/main/java/com/example/teacherservice/exception/GlobalExceptionHandler.java`
- **File**: `teacher-service/src/main/java/com/example/teacherservice/exception/GeneralExceptionHandler.java`

### 8.2. Custom Exceptions
- `NotFoundException`: Khi không tìm thấy resource
- `UnauthorizedException`: Khi không có quyền truy cập
- `ValidationException`: Khi dữ liệu không hợp lệ
- `WrongCredentialsException`: Khi thông tin đăng nhập sai

---

## 9. Các File Quan Trọng Khác

### 9.1. Repository
- `teacher-service/src/main/java/com/example/teacherservice/repository/UserRepository.java`
- `teacher-service/src/main/java/com/example/teacherservice/repository/FileRepository.java`

### 9.2. Service
- `teacher-service/src/main/java/com/example/teacherservice/service/user/UserService.java`
- `teacher-service/src/main/java/com/example/teacherservice/service/user/UserServiceImpl.java`
- `teacher-service/src/main/java/com/example/teacherservice/service/auth/AuthService.java`
- `teacher-service/src/main/java/com/example/teacherservice/service/file/FileService.java`

### 9.3. Base Entity
- `teacher-service/src/main/java/com/example/teacherservice/model/BaseEntity.java`
- Chứa các trường chung: `id`, `createdAt`, `updatedAt`

---

## Ghi Chú

- Tất cả các endpoint đều được route qua Gateway tại port 8080
- Các endpoint yêu cầu authentication cần có JWT token trong header
- Base URL khi qua Gateway: `http://localhost:8080`
- Base URL trực tiếp đến Teacher Service: `http://localhost:8002`

