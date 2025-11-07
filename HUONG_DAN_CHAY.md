# Hướng Dẫn Chạy Project

## Yêu Cầu
- Java 17+
- Maven
- Docker Desktop (chưa cài thì tải tại: https://www.docker.com/products/docker-desktop)

---

## Bước 1: Khởi động Redis bằng Docker

**Lần đầu chạy Docker:**
1. Mở Docker Desktop và đợi nó khởi động hoàn toàn
2. Mở Terminal/PowerShell tại thư mục gốc project (có file `docker-compose.yml`)
3. Chạy lệnh:
   ```bash
   docker-compose up -d
   ```
4. Kiểm tra Redis đã chạy:
   ```bash
   docker ps
   ```
   (Nếu thấy container `redis-teacher-service` đang chạy là OK)

**Lần sau:** Chỉ cần mở Docker Desktop, Redis sẽ tự động chạy.

---

## Bước 2: Chạy các Service theo thứ tự

**Quan trọng:** Phải chạy đúng thứ tự sau:

### 1. Config Server (Port 8888)
- Mở IntelliJ
- Mở project `config-server`
- Chạy file `ConfigServerApplication.java`
- Đợi đến khi thấy log: `Started ConfigServerApplication`

### 2. Eureka Server (Port 8761)
- Mở project `eureka-server`
- Chạy file `EurekaServerApplication.java`
- Đợi đến khi thấy log: `Started EurekaServerApplication`
- Mở browser: http://localhost:8761 để xem dashboard

### 3. Teacher Service (Port 8002)
- Mở project `teacher-service`
- Chạy file `TeacherServiceApplication.java`
- Đợi đến khi thấy log: `Started TeacherServiceApplication`
- Kiểm tra trên Eureka: http://localhost:8761 (sẽ thấy teacher-service đã đăng ký)

### 4. Gateway (Port 8080)
- Mở project `gateway`
- Chạy file `GatewayApplication.java`
- Đợi đến khi thấy log: `Started GatewayApplication`
- Kiểm tra trên Eureka: http://localhost:8761 (sẽ thấy gateway đã đăng ký)

---

## Kiểm Tra

- **Eureka Dashboard:** http://localhost:8761
- **Gateway:** http://localhost:8080
- **Teacher Service:** http://localhost:8002
- **Config Server:** http://localhost:8888

---

## Dừng Services

1. **Dừng các service:** Nhấn `Stop` trong IntelliJ cho từng service
2. **Dừng Redis:**
   ```bash
   docker-compose down
   ```

---

## Lưu Ý

- Nếu lỗi kết nối Redis: Kiểm tra Docker Desktop đã chạy chưa
- Nếu lỗi port đã được sử dụng: Đóng các ứng dụng đang dùng port đó
- Nếu service không đăng ký được Eureka: Kiểm tra Eureka đã chạy chưa

