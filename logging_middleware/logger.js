const http = require('http');

const LOG_URL = 'http://4.224.186.213/evaluation-service/logs';

async function Log(stack, level, pkg, message) {
  const body = JSON.stringify({ stack, level, package: pkg, message });
  return new Promise((resolve) => {
    const options = {
      hostname: '4.224.186.213',
      port: 80,
      path: '/evaluation-service/logs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUTH_TOKEN}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[LOG] ${stack}/${pkg}/${level}: ${message}`);
        resolve(JSON.parse(data));
      });
    });
    req.on('error', (err) => {
      console.error('[Logger Error]', err.message);
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

module.exports = { Log };
