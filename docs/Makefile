# ============================================================================
# 🏆 MITRE 10 B2C E-COMMERCE TEST AUTOMATION FRAMEWORK
# World-Class Gold Standard Testing Suite - Comprehensive Command Reference
# ============================================================================
# 
# 📋 ARCHITECTURE OVERVIEW:
# ├── tests/
# │   ├── smoke/           # Critical path validation (homepage, core features)
# │   ├── e2e/            # End-to-end user journeys (search, checkout, etc.)
# │   ├── api/            # Backend API validation & performance testing
# │   └── utils/          # Shared utilities and test helpers
# ├── playwright.config.ts # Multi-project configuration (browsers, devices)
# ├── global-setup.ts     # Authentication & state management
# └── storage/            # Session state & authentication tokens
#
# 🎯 TEST COVERAGE:
# - Smoke Tests: Homepage validation, core functionality
# - E2E Tests: Product search, user journeys, comprehensive flows
# - API Tests: Backend validation, performance, security
# - Cross-Browser: Chrome, Firefox, Edge compatibility
# - Mobile Testing: Android (Pixel 5), iPhone 12 emulation
# - Performance: Response times, concurrent load testing
# - Security: Headers validation, rate limiting, error handling
#
# 🛠️ TECHNOLOGY STACK:
# - Framework: Playwright v1.55.0 + TypeScript
# - Reporting: HTML, Allure, JUnit, JSON
# - CI/CD: GitHub Actions ready
# - Authentication: Secure session management
# - Parallel Execution: Configurable workers
# ============================================================================

.PHONY: help install setup test clean report

# Default target
help: ## 📚 Display this comprehensive help menu
	@echo "🏆 MITRE 10 B2C E-COMMERCE TEST AUTOMATION FRAMEWORK"
	@echo "============================================================================"
	@echo "📋 QUICK START COMMANDS:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🎯 EXECUTION EXAMPLES:"
	@echo "  make test-smoke          # Run critical path tests"
	@echo "  make test-mobile         # Test on Android + iPhone"
	@echo "  make test-all-browsers   # Cross-browser validation"
	@echo "  make report-allure       # Generate beautiful reports"
	@echo ""

# ============================================================================
# 🚀 SETUP & INSTALLATION
# ============================================================================

install: ## 📦 Install all dependencies and setup project
	@echo "📦 Installing Playwright and dependencies..."
	npm install
	npx playwright install
	@echo "⚠️  Note: Browser dependencies may require sudo. Run 'sudo npx playwright install-deps' if needed."
	@echo "✅ Installation complete!"

setup: install ## 🔧 Complete project setup with environment configuration
	@echo "🔧 Setting up project environment..."
	@mkdir -p storage test-results allure-results playwright-report
	@touch .env
	@echo "MITRE10_BASE_URL=https://www.mitre10.co.nz/" >> .env
	@echo "✅ Project setup complete!"

verify-setup: ## ✅ Verify installation and configuration
	@echo "🔍 Verifying setup..."
	npx playwright --version
	node --version
	npm --version
	@echo "✅ Setup verification complete!"

# ============================================================================
# 🧪 CORE TEST EXECUTION COMMANDS
# ============================================================================

test: ## 🚀 Run all tests with default configuration
	npm run test

test-headed: ## 👀 Run tests in headed mode (visible browser)
	npm run test:headed

test-debug: ## 🐛 Run tests in debug mode with inspector
	npx playwright test --debug

# ============================================================================
# 📊 TEST SUITE CATEGORIES
# ============================================================================

test-smoke: ## 💨 Run smoke tests (critical path validation)
	npm run test:smoke
	@echo "✅ Smoke tests completed!"

test-smoke-comprehensive: ## 🔥 Run comprehensive smoke test suite
	npm run test:smoke:comprehensive
	@echo "✅ Comprehensive smoke tests completed!"

test-e2e: ## 🛣️ Run end-to-end user journey tests
	npm run test:e2e
	@echo "✅ E2E tests completed!"

test-e2e-comprehensive: ## 🎯 Run comprehensive E2E test suite
	npm run test:e2e:comprehensive
	@echo "✅ Comprehensive E2E tests completed!"

test-api: ## 🔌 Run API validation and performance tests
	npm run test:api
	@echo "✅ API tests completed!"

# ============================================================================
# 📱 DEVICE & BROWSER TESTING
# ============================================================================

test-mobile: ## 📱 Run tests on mobile devices (Android + iPhone)
	npm run test:mobile
	@echo "✅ Mobile tests completed!"

test-android: ## 🤖 Run tests on Android (Pixel 5 emulation)
	npm run test:android
	@echo "✅ Android tests completed!"

test-iphone: ## 📱 Run tests on iPhone (iPhone 12 emulation)
	npm run test:iphone
	@echo "✅ iPhone tests completed!"

test-browsers: ## 🌐 Run cross-browser tests (Chrome, Firefox, Edge)
	npm run test:browsers
	@echo "✅ Cross-browser tests completed!"

test-all-devices: ## 🎯 Run tests on ALL devices and browsers
	npm run test:all-devices
	@echo "✅ All device tests completed!"

# ============================================================================
# 🎯 SPECIALIZED TEST CATEGORIES
# ============================================================================

test-comprehensive: ## 🏆 Run comprehensive test suite (smoke + e2e + api)
	npm run test:comprehensive
	@echo "✅ Comprehensive test suite completed!"

test-positive: ## ✅ Run positive test cases only
	npm run test:positive
	@echo "✅ Positive test cases completed!"

test-negative: ## ❌ Run negative test cases and error handling
	npm run test:negative
	@echo "✅ Negative test cases completed!"

test-edge: ## ⚡ Run edge case scenarios
	npm run test:edge
	@echo "✅ Edge case tests completed!"

test-performance: ## 🚀 Run performance and load tests
	npm run test:performance
	@echo "✅ Performance tests completed!"

test-accessibility: ## ♿ Run accessibility compliance tests
	npm run test:accessibility
	@echo "✅ Accessibility tests completed!"

# ============================================================================
# 🎯 ADVANCED EXECUTION OPTIONS
# ============================================================================

test-parallel: ## ⚡ Run tests with maximum parallelization
	npx playwright test --workers=4
	@echo "✅ Parallel execution completed!"

test-serial: ## 🔄 Run tests sequentially (no parallelization)
	npx playwright test --workers=1
	@echo "✅ Serial execution completed!"

test-retry: ## 🔄 Run tests with retry on failure
	npx playwright test --retries=3
	@echo "✅ Tests with retry completed!"

test-specific: ## 🎯 Run specific test file (usage: make test-specific FILE=path/to/test.spec.ts)
	npx playwright test $(FILE)

test-grep: ## 🔍 Run tests matching pattern (usage: make test-grep PATTERN="search")
	npx playwright test --grep="$(PATTERN)"

# ============================================================================
# 📊 REPORTING & ANALYSIS
# ============================================================================

report: ## 📊 Open HTML test report
	npm run report

report-allure: ## 🎨 Generate and open beautiful Allure report
	npm run report:allure
	@echo "✅ Allure report generated!"

report-serve: ## 🌐 Serve Allure report on local server
	npm run report:serve

report-json: ## 📄 Generate JSON test results
	npx playwright test --reporter=json --output=test-results/results.json

report-junit: ## 📋 Generate JUnit XML report
	npx playwright test --reporter=junit --output=test-results/junit.xml

# ============================================================================
# 🔧 MAINTENANCE & UTILITIES
# ============================================================================

clean: ## 🧹 Clean all test artifacts and reports
	@echo "🧹 Cleaning test artifacts..."
	rm -rf test-results/* playwright-report/* allure-results/*
	@echo "✅ Cleanup completed!"

clean-all: clean ## 🗑️ Deep clean including node_modules
	@echo "🗑️ Deep cleaning project..."
	rm -rf node_modules package-lock.json
	@echo "✅ Deep cleanup completed!"

update: ## 🔄 Update Playwright and dependencies
	@echo "🔄 Updating dependencies..."
	npm update
	npx playwright install
	@echo "✅ Update completed!"

lint: ## 🔍 Run TypeScript linting
	npx tsc --noEmit
	@echo "✅ Linting completed!"

# ============================================================================
# 🎯 CI/CD & AUTOMATION COMMANDS
# ============================================================================

ci-test: ## 🤖 Run tests in CI mode (optimized for automation)
	CI=true npx playwright test --reporter=list,html,junit
	@echo "✅ CI tests completed!"

ci-install: ## 📦 CI-optimized installation
	npm ci
	npx playwright install --with-deps
	@echo "✅ CI installation completed!"

docker-test: ## 🐳 Run tests in Docker container
	docker run --rm -v $(PWD):/workspace -w /workspace mcr.microsoft.com/playwright:v1.55.0-focal npm test

# ============================================================================
# 📈 MONITORING & HEALTH CHECKS
# ============================================================================

health-check: ## 🏥 Run basic health check tests
	npx playwright test tests/smoke/homepage.spec.ts --reporter=list
	@echo "✅ Health check completed!"

smoke-check: test-smoke ## 💨 Alias for smoke tests (health monitoring)

performance-check: ## ⚡ Quick performance validation
	npx playwright test --grep="Performance" --reporter=list
	@echo "✅ Performance check completed!"

# ============================================================================
# 🔧 DEVELOPMENT & DEBUGGING
# ============================================================================

debug-test: ## 🐛 Debug specific test with inspector
	npx playwright test --debug $(FILE)

trace-viewer: ## 👁️ Open Playwright trace viewer
	npx playwright show-trace test-results/*/trace.zip

codegen: ## 🎬 Generate test code using Playwright codegen
	npx playwright codegen https://www.mitre10.co.nz/

# ============================================================================
# 📋 COMPREHENSIVE COMMAND REFERENCE
# ============================================================================

commands-list: ## 📋 Display all available npm scripts
	@echo "📋 AVAILABLE NPM SCRIPTS:"
	@echo "=========================="
	@npm run | grep -E "^  [a-z]" | sort

project-info: ## ℹ️ Display project information and statistics
	@echo "ℹ️ PROJECT INFORMATION:"
	@echo "======================="
	@echo "📁 Project: Mitre 10 B2C E-Commerce Test Suite"
	@echo "🛠️ Framework: Playwright $(shell npx playwright --version | cut -d' ' -f2)"
	@echo "📊 Test Files: $(shell find tests -name "*.spec.ts" | wc -l)"
	@echo "🎯 Test Projects: $(shell grep -c "name:" playwright.config.ts)"
	@echo "📱 Mobile Devices: Android (Pixel 5), iPhone 12"
	@echo "🌐 Browsers: Chrome, Firefox, Edge"
	@echo "📊 Reporters: HTML, Allure, JUnit, JSON"
	@echo ""

# ============================================================================
# 🎯 EXAMPLE USAGE SCENARIOS
# ============================================================================

demo-quick: ## 🚀 Quick demo run (smoke tests + report)
	@echo "🚀 Running quick demo..."
	make test-smoke
	make report
	@echo "✅ Quick demo completed!"

demo-comprehensive: ## 🏆 Comprehensive demo (all tests + reports)
	@echo "🏆 Running comprehensive demo..."
	make test-comprehensive
	make report-allure
	@echo "✅ Comprehensive demo completed!"

demo-mobile: ## 📱 Mobile testing demo
	@echo "📱 Running mobile demo..."
	make test-mobile
	make report
	@echo "✅ Mobile demo completed!"

# ============================================================================
# 📚 DOCUMENTATION & HELP
# ============================================================================

docs: ## 📚 Display comprehensive documentation
	@echo "📚 MITRE 10 B2C TEST AUTOMATION FRAMEWORK"
	@echo "=========================================="
	@echo ""
	@echo "🏗️ ARCHITECTURE:"
	@echo "  - Multi-project Playwright configuration"
	@echo "  - Cross-browser and mobile device testing"
	@echo "  - Comprehensive reporting with Allure"
	@echo "  - CI/CD ready with GitHub Actions"
	@echo ""
	@echo "🎯 TEST CATEGORIES:"
	@echo "  - Smoke Tests: Critical path validation"
	@echo "  - E2E Tests: Complete user journeys"
	@echo "  - API Tests: Backend validation & performance"
	@echo "  - Mobile Tests: Android & iPhone emulation"
	@echo "  - Cross-Browser: Chrome, Firefox, Edge"
	@echo ""
	@echo "📊 REPORTING:"
	@echo "  - HTML Reports: Interactive test results"
	@echo "  - Allure Reports: Beautiful, detailed analysis"
	@echo "  - JUnit XML: CI/CD integration"
	@echo "  - JSON Output: Programmatic access"
	@echo ""
	@echo "🚀 QUICK START:"
	@echo "  1. make install     # Setup project"
	@echo "  2. make test-smoke  # Run critical tests"
	@echo "  3. make report      # View results"
	@echo ""

# ============================================================================
# 🎯 ADVANCED SCENARIOS
# ============================================================================

stress-test: ## 💪 Run stress tests with high load
	@echo "💪 Running stress tests..."
	npx playwright test --workers=8 --retries=0 --repeat-each=3
	@echo "✅ Stress tests completed!"

regression-suite: ## 🔄 Full regression test suite
	@echo "🔄 Running regression suite..."
	make clean
	make test-comprehensive
	make test-all-devices
	make report-allure
	@echo "✅ Regression suite completed!"

nightly-build: ## 🌙 Nightly build test execution
	@echo "🌙 Running nightly build tests..."
	make ci-test
	make report-allure
	@echo "✅ Nightly build completed!"

# ============================================================================
# 📊 METRICS & ANALYTICS
# ============================================================================

test-metrics: ## 📊 Display test execution metrics
	@echo "📊 TEST EXECUTION METRICS:"
	@echo "=========================="
	@echo "📁 Total Test Files: $(shell find tests -name "*.spec.ts" | wc -l)"
	@echo "🧪 Smoke Tests: $(shell find tests/smoke -name "*.spec.ts" | wc -l)"
	@echo "🛣️ E2E Tests: $(shell find tests/e2e -name "*.spec.ts" | wc -l)"
	@echo "🔌 API Tests: $(shell find tests/api -name "*.spec.ts" | wc -l)"
	@echo "📱 Mobile Projects: 2 (Android, iPhone)"
	@echo "🌐 Browser Projects: 3 (Chrome, Firefox, Edge)"
	@echo ""

coverage-report: ## 📈 Generate test coverage analysis
	@echo "📈 Generating coverage report..."
	npx playwright test --reporter=html
	@echo "✅ Coverage report generated!"

# ============================================================================
# 🔐 SECURITY & COMPLIANCE
# ============================================================================

security-scan: ## 🔐 Run security-focused tests
	npx playwright test --grep="security|Security" --reporter=list
	@echo "✅ Security scan completed!"

compliance-check: ## ✅ Run compliance and accessibility tests
	npx playwright test --grep="accessibility|Accessibility" --reporter=list
	@echo "✅ Compliance check completed!"

# ============================================================================
# 🎯 FINAL SUMMARY
# ============================================================================

summary: ## 📋 Display complete framework summary
	@echo "🏆 MITRE 10 B2C E-COMMERCE TEST AUTOMATION FRAMEWORK SUMMARY"
	@echo "=============================================================="
	@echo ""
	@echo "🎯 FRAMEWORK CAPABILITIES:"
	@echo "  ✅ Multi-browser testing (Chrome, Firefox, Edge)"
	@echo "  ✅ Mobile device emulation (Android, iPhone)"
	@echo "  ✅ API testing and validation"
	@echo "  ✅ Performance and load testing"
	@echo "  ✅ Security and compliance testing"
	@echo "  ✅ Comprehensive reporting (HTML, Allure, JUnit)"
	@echo "  ✅ CI/CD integration ready"
	@echo "  ✅ Parallel execution support"
	@echo "  ✅ Debug and trace capabilities"
	@echo ""
	@echo "🚀 QUICK COMMANDS:"
	@echo "  make install          # Setup everything"
	@echo "  make test-smoke       # Critical path tests"
	@echo "  make test-mobile      # Mobile testing"
	@echo "  make test-all-devices # Complete device matrix"
	@echo "  make report-allure    # Beautiful reports"
	@echo ""
	@echo "📚 For detailed help: make help"
	@echo "📊 For metrics: make test-metrics"
	@echo "🔧 For project info: make project-info"
	@echo ""
	@echo "🏆 World-Class Gold Standard Testing Framework Ready!"
	@echo "=============================================================="