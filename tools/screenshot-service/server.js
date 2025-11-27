const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url parameter');

  try {
    // Allow optional width/height query params so the caller can request a screenshot sized
    // to the iframe container in the frontend.
    const width = parseInt(req.query.width, 10) || 1280;
    const height = parseInt(req.query.height, 10) || 800;
    const waitMs = parseInt(req.query.waitMs, 10) || 500;

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Optional short delay to allow any dynamic content in the embedded page to render
    if (waitMs > 0) await page.waitForTimeout(waitMs);

    // Capture viewport-sized screenshot (not fullPage) so it matches the caller's iframe box
    const buffer = await page.screenshot({ fullPage: false, type: 'png' });
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'attachment; filename="screenshot.png"');
    res.send(buffer);
  } catch (err) {
    console.error('Screenshot error:', err);
    res.status(500).send('Failed to capture screenshot');
  }
});

// Improve visibility on unhandled errors so service stays up longer for debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in screenshot-service:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in screenshot-service:', reason);
});

app.listen(PORT, () => {
  console.log(`Screenshot service listening on http://localhost:${PORT}`);
});
