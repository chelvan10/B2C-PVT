# 🏗️ Everest Framework Architecture - Production Ready

## 📁 Framework Structure

```
tests/
├── 📂 page-objects/          # Shared, reusable page components
│   ├── BasePage.ts           # Universal self-healing base class
│   └── AccountPage.ts        # Account-specific page object
├── 📂 data/                  # Centralized test data management
│   └── test-data.ts          # Environment-aware configuration
├── 📂 fixtures/              # Reusable test fixtures
│   └── test-fixtures.ts      # Authenticated sessions, page objects
├── 📂 utils/                 # Shared utilities & infrastructure
│   ├── smart-locators.ts     # Universal element finding
│   ├── browser-utils.ts      # Browser interaction utilities
│   ├── custom-reporter.ts    # Professional test reporting
│   ├── global-setup.ts       # Authentication & environment setup
│   └── global-teardown.ts    # Cleanup & summary generation
├── 📂 e2e/                   # Production test suites
│   ├── mitre10-production-suite.spec.ts     # Critical path tests
│   ├── mitre10-my-account-complete.spec.ts  # Account management
│   ├── mitre10-mobile-shopping-journey.spec.ts # Mobile experience
│   ├── mitre10-navigation-standard.spec.ts  # Navigation validation
│   ├── mitre10-search-plp-standard.spec.ts  # Search & PLP
│   └── archive/              # Non-production scripts
├── 📂 smoke/                 # Quick validation tests
│   ├── homepage-comprehensive.spec.ts       # Homepage validation
│   └── archive/              # Archived smoke tests
└── 📂 api/                   # API integration tests
    ├── mitre10-api-optimized.spec.ts        # API health checks
    └── archive/              # Archived API tests
```

## 🔧 Component Management Strategy

### 🌍 **Shared Components (Universal)**
- **Location**: `/page-objects/`, `/utils/`, `/data/`, `/fixtures/`
- **Usage**: Imported across all test suites
- **Examples**: `BasePage.ts`, `SmartLocators`, `TEST_CONFIG`
- **Lifecycle**: Created once, maintained centrally, versioned

### 🎯 **Unique Components (Test-Specific)**
- **Location**: Within individual test files as classes/functions
- **Usage**: Specific to single test suite requirements
- **Examples**: `MobileSearchLocator`, `AccountLocator`
- **Lifecycle**: Created per test needs, can be promoted to shared

### 🔄 **Component Promotion Strategy**
```
Unique → Used in 2+ tests → Refactor to shared → Move to utils/page-objects
```

## 🚀 Execution Management

### 📋 **Test Execution Order**
1. **Global Setup** → Authentication, environment preparation
2. **Smoke Tests** → Quick validation (homepage, critical paths)
3. **E2E Tests** → Complete user journeys (account, mobile, search)
4. **API Tests** → Integration validation
5. **Global Teardown** → Cleanup, reporting, archival

### ⚡ **Performance Optimization**
- **Parallel Execution**: 2-4 workers based on environment
- **Smart Retries**: 1 retry locally, 2 in CI
- **Timeout Management**: Graduated timeouts (element < action < test)
- **Resource Management**: Cleanup old artifacts, optimize screenshots

### 🛡️ **Self-Healing Architecture**

#### **Locator Strategy Hierarchy**
1. **`data-testid`** (Recommended for developers)
2. **Role-based** (`getByRole`, semantic)
3. **Text-based** (`getByText`, user-facing)
4. **CSS selectors** (structural fallback)
5. **XPath/complex** (last resort)

#### **Error Recovery Patterns**
```typescript
// Multi-strategy element finding
async findElement(strategies: string[]): Promise<Locator> {
  for (const strategy of strategies) {
    try {
      const element = page.locator(strategy);
      if (await element.isVisible({ timeout: 2000 })) {
        return element;
      }
    } catch (error) {
      continue; // Try next strategy
    }
  }
  throw new Error('Element not found with any strategy');
}
```

#### **Network Resilience**
```typescript
// Graceful network handling
try {
  await page.waitForLoadState('networkidle', { timeout: 10000 });
} catch {
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
}
```

## 📊 Reporting & Verification

### 📸 **Screenshot Strategy**
- **Key Steps Only**: Login, navigation, critical actions
- **Failure Capture**: Full page screenshots on test failure
- **Mobile Optimization**: Viewport-specific captures
- **Storage**: `test-results/steps/` with timestamp naming

### 🎥 **Video Recording**
- **Retain on Failure**: Videos saved only when tests fail
- **Performance Impact**: Minimal overhead with selective recording
- **Format**: WebM for optimal size/quality balance

### 📈 **HTML Reports**
- **Rich Visualization**: Test results with embedded media
- **Step-by-Step**: Detailed execution flow with screenshots
- **Performance Metrics**: Load times, execution duration
- **Cross-Browser**: Comparative results across projects

## 🔒 Security & Environment Management

### 🔐 **Credential Management**
```bash
# .env file (never committed)
TEST_EMAIL=user@example.com
TEST_PASSWORD=secure_password
BASE_URL=https://www.mitre10.co.nz
```

### 🌐 **Environment Configuration**
- **Development**: Local execution, detailed logging
- **CI/CD**: Parallel execution, minimal output
- **Production**: Performance monitoring, error alerting

## 🎯 Quality Gates

### ✅ **Success Criteria**
- **Smoke Tests**: 100% pass rate required
- **E2E Tests**: 95% pass rate acceptable
- **Performance**: Page loads < 5s, API responses < 3s
- **Mobile**: Touch targets ≥ 44px, responsive design validation

### 🔄 **Continuous Improvement**
- **Weekly Reviews**: Analyze flaky tests, optimize slow tests
- **Monthly Audits**: Update locators, refresh test data
- **Quarterly Upgrades**: Framework updates, new patterns

## 🚀 Deployment Strategy

### 📦 **Production Readiness Checklist**
- ✅ All tests use self-healing locators
- ✅ Performance budgets enforced
- ✅ Cross-browser compatibility validated
- ✅ Mobile-first responsive design tested
- ✅ Error handling with graceful degradation
- ✅ Comprehensive reporting with visual verification

### 🔧 **Maintenance Protocol**
1. **Archive non-production scripts** → `/archive/` folders
2. **Centralize shared components** → `/page-objects/`, `/utils/`
3. **Version control test data** → `/data/` with environment awareness
4. **Monitor execution metrics** → Performance dashboards
5. **Regular framework updates** → Playwright, dependencies, patterns

---

**🏆 Framework Principles**: *Resilient, Fast, Clear, Safe - No Duplication, No Overkill*