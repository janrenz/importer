const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Check if certificates exist
  const keyPath = path.join(__dirname, '.certificates/localhost-key.pem');
  const certPath = path.join(__dirname, '.certificates/localhost.pem');
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('❌ HTTPS certificates not found!');
    console.log('📋 Run these commands to set up HTTPS:');
    console.log('   brew install mkcert');
    console.log('   mkcert -install');
    console.log('   mkcert -key-file .certificates/localhost-key.pem -cert-file .certificates/localhost.pem localhost 127.0.0.1 ::1');
    process.exit(1);
  }

  // HTTPS options
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  // Create HTTPS server
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🔒 Ready on https://${hostname}:${port}`);
    });
});