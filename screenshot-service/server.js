const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let browser = null;

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

// Screenshot endpoint
app.post('/api/screenshot', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const browser = await initBrowser();
    const page = await browser.newPage();

    // Navigate to URL with increased timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Determine content dimensions so we capture exactly the page content
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement || document.body;
      const width = Math.max(doc.scrollWidth, doc.clientWidth);
      const height = Math.max(doc.scrollHeight, doc.clientHeight);
      const dpr = window.devicePixelRatio || 1;
      return { width, height, dpr };
    });

    // Allow optional desired width from request (useful to match iframe width)
    const requestedWidth = (req.body && req.body.width) ? parseInt(req.body.width, 10) : null;
    const captureWidth = requestedWidth || Math.min(metrics.width, 1920);

    const captureHeight = Math.min(metrics.height, 20000); // clamp to avoid extremely huge sizes

    // Set viewport to match captured width/height (use CSS pixels)
    await page.setViewport({ width: captureWidth, height: captureHeight });

    // Give layout a moment to settle at new viewport
    await page.waitForTimeout(250);

    // Take screenshot of the full content area (not using fullPage to avoid blank footers)
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    await page.close();

    // Send screenshot as image
    res.type('image/png');
    res.send(screenshot);

  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ 
      error: 'Failed to capture screenshot',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Screenshot service is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Screenshot service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
