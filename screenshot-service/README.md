# Screenshot Service

Dịch vụ Node.js sử dụng Puppeteer để chụp ảnh các trang web.

## Cài đặt

```bash
cd screenshot-service
npm install
```

## Chạy service

```bash
npm start
```

Service sẽ chạy trên port `3001` (mặc định)

## Endpoints

### POST /api/screenshot
Chụp ảnh của một URL

**Request:**
```json
{
  "url": "https://aptrack.asia/"
}
```

Optional parameter:

```json
{
  "url": "https://aptrack.asia/",
  "width": 1200
}
```

If `width` is provided the service will use that width (in CSS pixels) to render the page before capturing so the resulting image width will match the provided size (useful to match an embedded iframe width).

**Response:**
- `image/png` - Ảnh PNG

**Ví dụ:**
```bash
curl -X POST http://localhost:3001/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url":"https://aptrack.asia/"}' \
  -o screenshot.png
```

### GET /api/health
Kiểm tra trạng thái service

**Response:**
```json
{
  "status": "OK",
  "message": "Screenshot service is running"
}
```

## Lưu ý


## Running inside IntelliJ / as a JVM process

This service is implemented in Node.js (Puppeteer) so it cannot be run with `mvn` directly like the other Spring Boot services. You have a few options to run it from IntelliJ:

- Run as a Node.js run configuration: IntelliJ IDEA Ultimate/WebStorm provide "Node.js" run configurations — set `server.js` as the script and run.
- Add an `npm` run configuration in IntelliJ that runs `npm start` in `screenshot-service`.
- Run via Docker (recommended for parity): `docker-compose up screenshot-service` (requires Dockerfile in this folder)

If you prefer the service to be runnable via `mvn` / as a Spring Boot application in IntelliJ, consider creating a small Spring Boot module that uses Playwright Java or Selenium to implement the same endpoint. I can scaffold a minimal Spring Boot `screenshot-service` module that depends on `com.microsoft.playwright:playwright` and exposes the same `/api/screenshot` endpoint — tell me if you want me to do that and I will add it.
