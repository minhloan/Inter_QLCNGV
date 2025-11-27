Screenshot service

This small service captures a screenshot of a provided `url` using Puppeteer and returns a PNG.

Quick start (Windows PowerShell):

```powershell
cd tools/screenshot-service
npm install
npm start
```

The server will run on `http://localhost:3001` by default. Example request:

`http://localhost:3001/screenshot?url=https://aptrack.asia`

Note: Puppeteer will download a Chromium binary on first `npm install`. Ensure your environment allows that download and that you have at least ~200MB free disk space.
