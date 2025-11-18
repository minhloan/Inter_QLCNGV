# Hướng Dẫn Cấu Hình Domain và Triển Khai

Tài liệu này hướng dẫn cách cấu hình domain cho cả backend và frontend, cho phép thay đổi domain dễ dàng mà không cần build lại ứng dụng.

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Hình Domain Giả (Local Development)](#cấu-hình-domain-giả-local-development)
3. [Cấu Hình Backend (Gateway)](#cấu-hình-backend-gateway)
4. [Cấu Hình Frontend](#cấu-hình-frontend)
5. [Triển Khai Production](#triển-khai-production)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan

Hệ thống được thiết kế để dễ dàng thay đổi domain thông qua:

- **Backend**: Environment variable `CORS_ALLOWED_ORIGINS` trong Gateway
- **Frontend**: File `public/config.json` (có thể thay đổi mà không cần build lại)

### Domain Giả Mẫu

- **API Gateway**: `api.qlcngv.local:8080`
- **Frontend App**: `app.qlcngv.local:5173`

---

## 🖥️ Cấu Hình Domain Giả (Local Development)

### Windows

1. Mở Notepad với quyền **Administrator**
2. Mở file: `C:\Windows\System32\drivers\etc\hosts`
3. Thêm các dòng sau:

```
127.0.0.1    api.qlcngv.local
127.0.0.1    app.qlcngv.local
```

4. Lưu file

### Linux / Mac

1. Mở terminal và chạy:
```bash
sudo nano /etc/hosts
```

2. Thêm các dòng sau:
```
127.0.0.1    api.qlcngv.local
127.0.0.1    app.qlcngv.local
```

3. Lưu file (Ctrl+O, Enter, Ctrl+X)

### Kiểm Tra

Sau khi cấu hình, bạn có thể truy cập:
- `http://api.qlcngv.local:8080` - API Gateway
- `http://app.qlcngv.local:5173` - Frontend App

---

## 🔧 Cấu Hình Backend (Gateway)

### Cách 1: Environment Variable (Khuyến nghị)

#### Windows (PowerShell)

```powershell
# Development với domain giả
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://app.qlcngv.local:5173"

# Production
$env:CORS_ALLOWED_ORIGINS="https://app.yourdomain.com,https://www.yourdomain.com"
```

#### Linux / Mac

```bash
# Development với domain giả
export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://app.qlcngv.local:5173"

# Production
export CORS_ALLOWED_ORIGINS="https://app.yourdomain.com,https://www.yourdomain.com"
```

### Cách 2: File .env

Tạo file `gateway/.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://app.qlcngv.local:5173
```

**Lưu ý**: Spring Boot không tự động load file `.env`. Bạn cần:
- Sử dụng thư viện như `dotenv-java`, hoặc
- Export environment variable trước khi chạy ứng dụng

### Cách 3: application.yml (Không khuyến nghị)

Nếu không set environment variable, hệ thống sẽ dùng giá trị mặc định trong `application.yml`:

```yaml
allowedOrigins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

### Chạy Gateway

```bash
cd gateway

# Windows (PowerShell)
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://app.qlcngv.local:5173"
mvn spring-boot:run

# Linux/Mac
export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://app.qlcngv.local:5173"
mvn spring-boot:run
```

---

## 🎨 Cấu Hình Frontend

### File Config: `my-app/public/config.json`

File này có thể được thay đổi **mà không cần build lại** ứng dụng. Frontend sẽ tự động load lại khi refresh trang.

#### Development (Domain Giả)

```json
{
  "apiUrl": "http://api.qlcngv.local:8080",
  "wsUrl": "http://api.qlcngv.local:8080/ws",
  "environment": "development"
}
```

#### Development (Localhost)

```json
{
  "apiUrl": "http://localhost:8080",
  "wsUrl": "http://localhost:8080/ws",
  "environment": "development"
}
```

#### Production

```json
{
  "apiUrl": "https://api.yourdomain.com",
  "wsUrl": "wss://api.yourdomain.com/ws",
  "environment": "production"
}
```

### Cấu Hình Vite: `my-app/vite.config.js`

Nếu dùng domain giả, đảm bảo proxy trỏ đúng:

```javascript
proxy: {
  '/v1': {
    target: 'http://api.qlcngv.local:8080', // Hoặc http://localhost:8080
    changeOrigin: true,
    secure: false,
  },
  '/ws': {
    target: 'http://api.qlcngv.local:8080', // Hoặc http://localhost:8080
    ws: true,
    changeOrigin: true,
    secure: false,
  }
}
```

### Chạy Frontend

```bash
cd my-app
npm run dev
```

Truy cập: `http://app.qlcngv.local:5173` hoặc `http://localhost:5173`

---

## 🚀 Triển Khai Production

### 1. Cấu Hình Backend

Set environment variable trên server:

```bash
export CORS_ALLOWED_ORIGINS="https://app.yourdomain.com,https://www.yourdomain.com"
```

Hoặc trong file systemd service (`/etc/systemd/system/gateway.service`):

```ini
[Service]
Environment="CORS_ALLOWED_ORIGINS=https://app.yourdomain.com,https://www.yourdomain.com"
```

### 2. Cấu Hình Frontend

#### Bước 1: Cập nhật `my-app/public/config.json`

```json
{
  "apiUrl": "https://api.yourdomain.com",
  "wsUrl": "wss://api.yourdomain.com/ws",
  "environment": "production"
}
```

#### Bước 2: Build ứng dụng

```bash
cd my-app
npm run build
```

#### Bước 3: Deploy

Copy folder `my-app/dist/` lên web server (Nginx, Apache, etc.)

**Lưu ý**: File `config.json` sẽ được copy vào `dist/config.json` khi build. Bạn có thể thay đổi file này sau khi deploy mà không cần build lại.

### 3. Cấu Hình Nginx (Nếu có)

```nginx
# Frontend
server {
    listen 80;
    server_name app.yourdomain.com;
    
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Serve config.json với no-cache
    location /config.json {
        root /var/www/frontend/dist;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}

# Backend API Gateway
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket upgrade
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

---

## 🔍 Troubleshooting

### Lỗi CORS

**Triệu chứng**: Browser console hiển thị lỗi CORS

**Giải pháp**:
1. Kiểm tra `CORS_ALLOWED_ORIGINS` trong Gateway có chứa domain frontend không
2. Đảm bảo format đúng: `http://domain:port` (không có dấu `/` cuối)
3. Restart Gateway sau khi thay đổi environment variable

### WebSocket Không Kết Nối

**Triệu chứng**: WebSocket không connect, notification không hoạt động

**Giải pháp**:
1. Kiểm tra `config.json` có đúng URL không
2. Kiểm tra Gateway có chạy không
3. Kiểm tra CORS đã cấu hình đúng chưa
4. Mở Browser DevTools > Network > WS để xem lỗi chi tiết

### Domain Giả Không Hoạt Động

**Triệu chứng**: Không thể truy cập `api.qlcngv.local`

**Giải pháp**:
1. Kiểm tra file `hosts` đã được lưu đúng chưa
2. Flush DNS cache:
   - Windows: `ipconfig /flushdns`
   - Linux/Mac: `sudo systemd-resolve --flush-caches` hoặc restart network service
3. Đảm bảo không có firewall chặn

### Config.json Không Load

**Triệu chứng**: Frontend vẫn dùng URL cũ sau khi thay đổi `config.json`

**Giải pháp**:
1. Hard refresh browser (Ctrl+Shift+R hoặc Cmd+Shift+R)
2. Clear browser cache
3. Kiểm tra file `config.json` có syntax JSON đúng không
4. Kiểm tra console có lỗi khi load config không

---

## 📝 Checklist Triển Khai

### Development

- [ ] Đã cấu hình file `hosts` với domain giả
- [ ] Đã set `CORS_ALLOWED_ORIGINS` cho Gateway
- [ ] Đã cập nhật `my-app/public/config.json`
- [ ] Đã cập nhật `my-app/vite.config.js` (nếu dùng domain giả)
- [ ] Gateway đang chạy và có thể truy cập
- [ ] Frontend đang chạy và có thể truy cập
- [ ] WebSocket kết nối thành công

### Production

- [ ] Đã set `CORS_ALLOWED_ORIGINS` trên production server
- [ ] Đã cập nhật `my-app/public/config.json` với production URLs
- [ ] Đã build frontend (`npm run build`)
- [ ] Đã deploy frontend lên web server
- [ ] Đã cấu hình SSL/HTTPS (nếu cần)
- [ ] Đã cấu hình Nginx/reverse proxy (nếu có)
- [ ] Đã test WebSocket trong production
- [ ] Đã test tất cả API endpoints

---

## 💡 Tips

1. **Cache Busting**: File `config.json` được load với timestamp để tránh cache. Nếu thay đổi config, user chỉ cần refresh trang.

2. **Fallback**: Nếu không load được `config.json`, hệ thống sẽ dùng default config dựa trên `import.meta.env`.

3. **Multiple Environments**: Bạn có thể tạo nhiều file config:
   - `config.development.json`
   - `config.production.json`
   - Và load theo environment

4. **Security**: Trong production, đảm bảo:
   - Sử dụng HTTPS/WSS
   - Validate CORS origins
   - Không expose sensitive data trong `config.json`

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Browser Console (F12)
2. Gateway logs
3. Network tab trong DevTools
4. File `config.json` có đúng format JSON không

---

**Cập nhật lần cuối**: 2024

