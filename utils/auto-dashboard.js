const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

class AutoDashboard {
  constructor() {
    this.port = 3000;
    this.server = null;
  }

  async findAvailablePort(startPort) {
    return new Promise((resolve) => {
      const server = http.createServer();
      
      server.listen(startPort, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      
      server.on('error', () => {
        this.findAvailablePort(startPort + 1).then(resolve);
      });
    });
  }

  async startDashboard() {
    try {
      // Find available port
      this.port = await this.findAvailablePort(3000);
      
      // Start dashboard server
      const dashboardPath = path.join(process.cwd(), 'scripts', 'production-dashboard.js');
      
      this.server = spawn('node', [dashboardPath], {
        env: { ...process.env, PORT: this.port },
        detached: true,
        stdio: 'ignore'
      });
      
      this.server.unref();
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Display URLs
      console.log('\n🌐 DASHBOARD ACCESS:');
      console.log('─'.repeat(40));
      console.log(`📊 Dashboard URL: http://localhost:${this.port}`);
      console.log(`🔗 Direct Link: http://127.0.0.1:${this.port}`);
      console.log(`🚀 Launch Command: npm run dashboard`);
      console.log('─'.repeat(40));
      
      return this.port;
      
    } catch (error) {
      console.log('⚠️ Dashboard auto-start failed. Use: npm run dashboard');
      return null;
    }
  }
}

module.exports = AutoDashboard;