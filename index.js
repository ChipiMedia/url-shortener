require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Enable CORS for cross-origin access
app.use(cors({ optionsSuccessStatus: 200 }));

// Middleware for parsing POST data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// In-memory storage for URLs
const urlDatabase = {};
let urlCounter = 1;

// Serve the main landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST endpoint to create a short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    // Validate URL structure
    const parsedUrl = new URL(originalUrl);
    const hostname = parsedUrl.hostname;

    // Validate hostname using DNS
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Store the URL and generate a short URL
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    });
  } catch (error) {
    // Catch invalid URL errors
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  // Redirect to the original URL
  res.redirect(originalUrl);
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App is running and listening on port ${PORT}`);
});

