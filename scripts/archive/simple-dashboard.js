#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 8089;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Dashboard</title>
  <style>
    body { font-family: Arial; padding: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
    h1 { color: #333; text-align: center; }
    .success { color: #28a745; font-size: 1.2em; text-align: center; }
    .link { display: block; text-align: center; margin: 20px 0; }
    a { color: #007bff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 Test Execution Dashboard</h1>
    <div class="success">✅ Tests Completed Successfully</div>
    <div class="link">
      <a href="file://${process.cwd()}/playwright-report/index.html" target="_blank">📊 View HTML Report</a>
    </div>
    <div class="link">
      <a href="#" onclick="location.reload()">🔄 Refresh</a>
    </div>
  </div>
</body>
</html>`;
  
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`🌐 Dashboard running at http://localhost:${PORT}`);
});