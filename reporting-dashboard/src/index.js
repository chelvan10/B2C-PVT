const path = require('path');
const fs = require('fs');

class ReportingDashboard {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.componentRoot = path.join(__dirname, '..');
    this.outputDir = options.outputDir || path.join(this.projectRoot, 'dashboard-output');
    this.dataDir = options.dataDir || path.join(this.projectRoot, 'dashboard-data');
  }

  install() {
    // Copy reporters to project
    const srcDir = path.join(this.componentRoot, 'src');
    const targetDir = path.join(this.projectRoot, 'tests', 'utils');
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy reporter files
    const reporters = ['dashboard-reporter.ts', 'custom-reporter.ts'];
    reporters.forEach(file => {
      const src = path.join(srcDir, file);
      const dest = path.join(targetDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file} to ${dest}`);
      }
    });

    // Copy dashboard templates
    const templatesDir = path.join(this.componentRoot, 'templates');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const templates = fs.readdirSync(templatesDir);
    templates.forEach(file => {
      const src = path.join(templatesDir, file);
      const dest = path.join(this.outputDir, file);
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${file} to ${dest}`);
    });

    console.log('🚀 Reporting Dashboard installed successfully!');
    console.log(`📊 Dashboard will be available at: ${this.outputDir}`);
  }

  generate() {
    const DashboardGenerator = require('../scripts/generate-dashboard.js');
    const generator = new DashboardGenerator({
      projectRoot: this.projectRoot,
      outputDir: this.outputDir,
      dataDir: this.dataDir
    });
    return generator.generate();
  }

  getPlaywrightConfig() {
    return {
      reporter: [
        ['./tests/utils/custom-reporter.ts'],
        ['./tests/utils/dashboard-reporter.ts']
      ]
    };
  }
}

module.exports = ReportingDashboard;