# 🚀 Complete Test Execution & Dashboard Commands

## 📋 SMOKE TESTS (Quick Validation)

```bash
# All smoke tests across all projects
npm run test:smoke:all

# Desktop Chrome only
npm run test:smoke:desktop

# Mobile Android only  
npm run test:smoke:mobile

# Cross-platform (Desktop + Mobile)
npm run test:smoke:cross
```

## 🔄 REGRESSION TESTS (Comprehensive)

```bash
# All regression tests
npm run test:regression:all

# Desktop regression only
npm run test:regression:desktop

# Mobile regression only
npm run test:regression:mobile
```

## 🌐 BROWSER-SPECIFIC EXECUTION

```bash
# Chrome Desktop
npm run test:chrome

# Chrome Android
npm run test:android

# Chrome iPhone (Safari)
npm run test:iphone
```

## ☁️ BROWSERSTACK CLOUD TESTING

```bash
# All tests on BrowserStack devices
npm run test:browserstack

# Smoke tests on BrowserStack
npm run test:smoke:browserstack
```

## 🎯 INDIVIDUAL TEST EXECUTION

```bash
# Run specific test file
npm run test:individual B2C/tests/smoke/homepage-comprehensive.spec.ts

# Run with default test file
npm run test:individual
```

## 📊 DASHBOARD & REPORTING

```bash
# Generate dashboard from latest test data
npm run generate:dashboard

# Serve dashboard (auto-opens browser)
npm run serve:dashboard

# Generate + Serve in one command
npm run dashboard

# View Playwright HTML report
npx playwright show-report
```

## 🔧 ADVANCED COMMANDS

```bash
# Debug mode
npm run test:debug

# UI mode (interactive)
npm run test:ui

# Headed mode (visible browser)
npm run test:headed

# API tests only
npm run test:api
```

## 🎯 WHAT HAPPENS AFTER EACH TEST RUN:

1. **📊 Quick Summary** - Pass/fail counts, execution time
2. **🌐 HTML Report** - Auto-opens detailed Playwright report
3. **📈 Dashboard Generation** - Creates executive dashboard
4. **🔄 Port Management** - Intelligent port allocation/cleanup
5. **🎯 Dashboard URL** - Direct link to live dashboard

## 📁 GIT INTEGRATOR ADDON FILES

Located in: `/src/addons/git-integrator/`

### Core Files:
- `git.integrator.ts` - Main integrator logic
- `git.integrator.js` - Compiled JavaScript version
- `github.adapter.ts` - GitHub API integration
- `github.adapter.js` - Compiled GitHub adapter
- `bitbucket.adapter.ts` - Bitbucket API integration  
- `bitbucket.adapter.js` - Compiled Bitbucket adapter

### Configuration & Testing:
- `vcs.config.validator.ts` - Configuration validation
- `vcs.config.validator.js` - Compiled validator
- `integrator.test.ts` - Test suite
- `integrator.test.js` - Compiled tests

### CLI & Documentation:
- `cli.js` - Command-line interface
- `README.md` - Addon documentation
- `makefile-commands.txt` - Make commands reference

## 🎨 UNIQUE DASHBOARD FEATURES

### 💓 Quality Pulse Visualization
- **Animated pulse ring** showing overall health
- **Color-coded status**: Green (Healthy), Orange (Warning), Red (Critical)
- **Real-time metrics**: Tests/minute execution rhythm

### 🔥 Test Execution Heatmap
- **Visual grid** of test performance
- **Color coding**: 🟢 Fast (<2s), 🟡 Medium (2-10s), 🔴 Slow (>10s)
- **Interactive tooltips** with test names and durations

### ⚡ Performance Insights Panel
- **Three-tier metrics**: Fastest, Average, Slowest
- **Gradient backgrounds** for visual appeal
- **Velocity bar** showing execution efficiency

### 🎯 Executive Summary
- **AI-generated insights** in natural language
- **Status assessment** with actionable recommendations
- **Trend analysis** and quality scoring

## 🔄 AUTOMATIC FEATURES

### Port Management
- **Intelligent port detection** (starts from 8080)
- **Automatic cleanup** of existing servers
- **Port locking** to prevent conflicts
- **Graceful release** on dashboard close

### Report Integration
- **Auto-opens** Playwright HTML report
- **Generates** executive dashboard
- **Serves** on available port
- **Displays** direct URLs for access

### Data Intelligence
- **Smart file selection** (prioritizes files with actual test data)
- **Quality scoring** algorithm for metrics files
- **Comprehensive logging** of selection process
- **Fallback handling** for edge cases

## 🏆 PRODUCTION-READY FEATURES

✅ **Multi-project architecture** (B2C, B2B, 1Centre)  
✅ **Cross-platform testing** (Desktop, Mobile, Tablet)  
✅ **Cloud integration** (BrowserStack support)  
✅ **Intelligent reporting** (Executive + Technical views)  
✅ **Port management** (Automatic allocation/cleanup)  
✅ **Git integration** (Automated PR workflows)  
✅ **Performance monitoring** (Detailed metrics tracking)  
✅ **Visual analytics** (Unique dashboard visualizations)  

## 🎯 EXAMPLE WORKFLOW

```bash
# 1. Run comprehensive smoke tests
npm run test:smoke:cross

# 2. Dashboard auto-generates and opens
# 3. Review Quality Pulse and Heatmap
# 4. Check Performance Insights
# 5. Analyze failed tests in Defect Analysis
# 6. Take action based on recommendations

# For regression testing:
npm run test:regression:all

# For cloud testing:
npm run test:browserstack
```

**The framework now provides world-class test execution with intelligent dashboard analytics and seamless port management!** 🚀