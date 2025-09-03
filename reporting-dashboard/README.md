# 🏆 Universal Reporting Dashboard Component

A plug-and-play Microsoft-inspired dashboard component for any Playwright test framework.

## 🚀 Quick Integration

### 1. Install Component
```bash
# Copy component to your project
cp -r reporting-dashboard /path/to/your/project/

# Install dependencies
cd reporting-dashboard && npm install
```

### 2. Setup in Your Framework
```javascript
// In your project root
const ReportingDashboard = require('./reporting-dashboard/src/index.js');

const dashboard = new ReportingDashboard({
  projectRoot: __dirname,
  outputDir: './dashboard-output',
  dataDir: './dashboard-data'
});

// Install reporters and templates
dashboard.install();
```

### 3. Update Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['./tests/utils/custom-reporter.ts'],
    ['./tests/utils/dashboard-reporter.ts'],
    // ... your other reporters
  ],
  // ... rest of config
});
```

### 4. Generate Dashboard
```bash
# Run tests
npx playwright test

# Generate dashboard
node reporting-dashboard/scripts/generate-dashboard.js

# Serve dashboard
npx http-server dashboard-output -p 8080 -o
```

## 📁 Component Structure

```
reporting-dashboard/
├── src/
│   ├── index.js              # Main component API
│   ├── dashboard-reporter.ts # Playwright metrics reporter
│   └── custom-reporter.ts    # Professional test reporter
├── templates/
│   ├── index.html           # Dashboard interface
│   └── dashboard.js         # Chart logic
├── scripts/
│   ├── install.js           # Component installer
│   └── generate-dashboard.js # Dashboard generator
├── docs/
│   └── README-DASHBOARD.md  # Detailed documentation
└── package.json             # Component dependencies
```

## 🔧 API Usage

```javascript
const ReportingDashboard = require('./reporting-dashboard/src/index.js');

// Initialize with custom options
const dashboard = new ReportingDashboard({
  projectRoot: '/path/to/project',
  outputDir: './custom-dashboard',
  dataDir: './custom-data'
});

// Install component
dashboard.install();

// Generate dashboard
dashboard.generate();

// Get Playwright config snippet
const config = dashboard.getPlaywrightConfig();
```

## 📊 Features

- **Executive Summary** with AI-generated insights
- **Test Execution Metrics** (velocity, pass rate, coverage)
- **Quality & Stability** (flaky tests, framework health)
- **Performance Analytics** (duration trends, bottlenecks)
- **Cross-Platform Coverage** (browsers, devices)
- **Microsoft Design Language** (Fluent UI inspired)

## 🎯 Framework Compatibility

Works with any Playwright-based framework:
- ✅ Standard Playwright projects
- ✅ Custom test frameworks
- ✅ Multi-project configurations
- ✅ CI/CD pipelines
- ✅ Docker environments

## 🔄 Integration Examples

### Next.js Project
```javascript
// next.config.js
const ReportingDashboard = require('./reporting-dashboard/src/index.js');
const dashboard = new ReportingDashboard();
dashboard.install();
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
- name: Setup Dashboard
  run: |
    cd reporting-dashboard && npm install
    node scripts/install.js

- name: Run Tests & Generate Dashboard
  run: |
    npx playwright test
    node reporting-dashboard/scripts/generate-dashboard.js
```

### Custom Framework
```typescript
// your-framework/setup.ts
import { ReportingDashboard } from './reporting-dashboard/src/index.js';

export function setupDashboard() {
  const dashboard = new ReportingDashboard({
    projectRoot: __dirname,
    outputDir: './reports/dashboard'
  });
  
  dashboard.install();
  return dashboard.getPlaywrightConfig();
}
```

## 🛠️ Customization

### Custom Metrics
```typescript
// Extend dashboard-reporter.ts
export class CustomDashboardReporter extends DashboardReporter {
  onTestEnd(test: TestCase, result: TestResult) {
    super.onTestEnd(test, result);
    
    // Add custom metrics
    this.metrics.customData = {
      apiCalls: this.countApiCalls(result),
      pageLoads: this.countPageLoads(result)
    };
  }
}
```

### Custom Styling
```css
/* Override in templates/index.html */
:root {
  --primary-color: #your-brand-color;
  --success-color: #your-success-color;
}
```

## 📋 Requirements

- Node.js 16+
- Playwright 1.40+
- Modern browser for dashboard viewing

---

**Universal Quality Engineering Component** 🚀

*Drop-in dashboard solution for any Playwright framework*