# 🎯 VSCode Integration Guide

## 📋 **Command Line Usage**

### **Universal Test Runner**
```bash
# Run specific test file
node scripts/universal-test-runner.js B2C/tests/smoke/homepage-comprehensive.spec.ts

# Run entire smoke test directory
node scripts/universal-test-runner.js B2C/tests/smoke/

# Run with specific browser
node scripts/universal-test-runner.js B2C/tests/smoke/ --browser=chrome
node scripts/universal-test-runner.js B2C/tests/smoke/ --browser=android

# Run with coverage
node scripts/universal-test-runner.js B2C/tests/smoke/ --coverage

# Debug mode
node scripts/universal-test-runner.js B2C/tests/smoke/ --debug

# Headed mode (visible browser)
node scripts/universal-test-runner.js B2C/tests/smoke/ --headed
```

### **NPM Shortcuts**
```bash
# Quick smoke tests
npm run test:smoke:all

# Desktop/Mobile specific
npm run test:smoke:desktop
npm run test:smoke:mobile

# Other test types
npm run test:regression:all
npm run test:e2e:all
npm run test:api:all

# Browser specific
npm run test:chrome
npm run test:android

# Special modes
npm run test:coverage
npm run test:debug
npm run test:headed
```

## 🖱️ **VSCode Right-Click Integration**

### **Setup Required Extensions**
Install these VSCode extensions (auto-recommended):
- `ms-playwright.playwright` - Playwright Test for VSCode
- `ms-vscode.test-adapter-converter` - Test Explorer
- `hbenl.vscode-test-explorer` - Test Explorer UI

### **Right-Click Options Available**

#### **On Test Files (.spec.ts)**
1. **Right-click** on any `.spec.ts` file
2. **Select** from context menu:
   - `Tasks: Run Task` → `Run Test File`
   - `Tasks: Run Task` → `Run Test File with Coverage`
   - `Tasks: Run Task` → `Debug Test File`
   - `Tasks: Run Task` → `Run Test File (Headed)`

#### **On Test Directories**
1. **Right-click** on `smoke/`, `e2e/`, `regression/` folders
2. **Select** from context menu:
   - `Tasks: Run Task` → `Run Test Directory`

#### **Using Command Palette**
1. **Press** `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. **Type** `Tasks: Run Task`
3. **Select** desired test task

### **Test Explorer Integration**
With Playwright extension installed:
1. **Test Explorer** panel appears in sidebar
2. **Browse** test files in tree view
3. **Click** play button next to individual tests
4. **View** test results inline

## 🎯 **What Happens When You Run Tests**

### **Automatic Workflow:**
1. ✅ **Test Execution** - Runs selected tests
2. 📊 **Quick Summary** - Shows pass/fail counts
3. 🌐 **HTML Report** - Auto-opens Playwright report
4. 📈 **Dashboard Generation** - Creates executive dashboard
5. 🔄 **Port Management** - Smart port allocation
6. 🎯 **Dashboard URL** - Direct link displayed

### **Output Locations:**
- **Playwright Report**: `playwright-report/index.html`
- **Dashboard**: `dashboard-output/index.html`
- **Test Results**: Terminal output + VSCode Test Explorer

## 🔧 **VSCode Configuration Files**

### **`.vscode/settings.json`**
```json
{
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true,
  "playwright.enableCodeLens": true,
  "files.associations": {
    "*.spec.ts": "typescript"
  }
}
```

### **`.vscode/tasks.json`**
Defines right-click tasks:
- Run Test File
- Run Test File with Coverage  
- Debug Test File
- Run Test File (Headed)
- Run Test Directory

### **`.vscode/extensions.json`**
Auto-recommends essential extensions for team consistency.

## 🚀 **Quick Start Examples**

### **Command Line**
```bash
# Target B2C smoke tests specifically
npm run test:smoke:all

# Or use universal runner directly
node scripts/universal-test-runner.js B2C/tests/smoke/
```

### **VSCode Right-Click**
1. Navigate to `B2C/tests/smoke/homepage-comprehensive.spec.ts`
2. Right-click → `Tasks: Run Task` → `Run Test File`
3. Watch automatic workflow execute

### **VSCode Test Explorer**
1. Open Test Explorer panel
2. Expand `B2C/tests/smoke/`
3. Click play button next to specific test
4. View results inline

## 🎯 **Pro Tips**

✅ **Use Test Explorer** for quick individual test runs  
✅ **Use Right-Click Tasks** for full workflow (report + dashboard)  
✅ **Use Command Line** for CI/CD and advanced options  
✅ **Use Debug Mode** for troubleshooting failing tests  
✅ **Use Coverage Mode** for quality analysis  

**The framework now provides seamless VSCode integration with right-click test execution and automatic dashboard generation!** 🚀