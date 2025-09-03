/**
 * REPORT SECURITY WRAPPER
 * Adds security headers to HTML reports
 */

const fs = require('fs').promises;
const path = require('path');

class ReportSecurity {
  static async secureHtmlReport() {
    const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
    
    try {
      let content = await fs.readFile(reportPath, 'utf8');
      
      // Add Content Security Policy
      const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">`;
      
      if (!content.includes('Content-Security-Policy')) {
        content = content.replace('<head>', `<head>\n${csp}`);
        await fs.writeFile(reportPath, content);
        console.log('✅ HTML report secured with CSP');
      }
    } catch (error) {
      // Report file doesn't exist yet - will be secured on next generation
    }
  }
}

module.exports = ReportSecurity;