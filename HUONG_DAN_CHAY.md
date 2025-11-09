# Hướng Dẫn Chạy Project

## Yêu Cầu
- Java 17+
- Maven
- Docker Desktop (chưa cài thì tải tại: https://www.docker.com/products/docker-desktop)
- Node.js 18+ và npm (chưa cài thì tải tại: https://nodejs.org/)

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

### 5. Frontend - my-app (Port 5173)
- Mở Terminal/PowerShell tại thư mục `my-app`
- **Lần đầu chạy:** Cài đặt dependencies:
  ```bash
  npm install
  ```
- Chạy development server:
  ```bash
  npm run dev
  ```
- Đợi đến khi thấy log: `Local: http://localhost:5173`
- Mở browser: http://localhost:5173 để xem ứng dụng

**Lưu ý:** 
- Frontend sẽ tự động reload khi có thay đổi code
- Để dừng frontend: Nhấn `Ctrl + C` trong terminal

---

## Kiểm Tra

- **Eureka Dashboard:** http://localhost:8761
- **Gateway:** http://localhost:8080
- **Teacher Service:** http://localhost:8000
- **Config Server:** http://localhost:8888
- **Frontend (my-app):** http://localhost:5173

---

## Dừng Services

1. **Dừng Frontend:** Nhấn `Ctrl + C` trong terminal đang chạy `npm run dev`
2. **Dừng các service:** Nhấn `Stop` trong IntelliJ cho từng service
3. **Dừng Redis:**
   ```bash
   docker-compose down
   ```

---

## Lưu Ý

- Nếu lỗi kết nối Redis: Kiểm tra Docker Desktop đã chạy chưa
- Nếu lỗi port đã được sử dụng: Đóng các ứng dụng đang dùng port đó
- Nếu service không đăng ký được Eureka: Kiểm tra Eureka đã chạy chưa
- Nếu frontend không kết nối được API: 
  - Kiểm tra Gateway đã chạy chưa (http://localhost:8080)
  - Kiểm tra file `my-app/src/config.js` có cấu hình đúng API URL chưa
  - Có thể cần cấu hình proxy trong `vite.config.js` nếu gặp lỗi CORS

---
