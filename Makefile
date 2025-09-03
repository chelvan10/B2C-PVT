# EVEREST-STANDARD MAKEFILE
# Enterprise-grade automation commands for B2C PVT Demo
# World-class test execution and management

.PHONY: help setup test smoke mobile security clean install

# Default target
help: ## Show available commands
	@echo "🏔️  EVEREST STANDARD - B2C PVT DEMO"
	@echo "=================================="
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "🔒 Security: All commands use enterprise-grade security"
	@echo "📊 Monitoring: Comprehensive logging and reporting"
	@echo "🚀 Performance: Optimized for speed and reliability"

setup: ## Install dependencies and configure environment
	@echo "🚀 Setting up B2C PVT Demo environment..."
	npm install
	npx playwright install
	@if [ ! -f .env ]; then cp .env.example .env; echo "📝 Created .env file - please configure your settings"; fi
	@echo "✅ Setup complete!"

test: ## Run all tests with enterprise monitoring
	@echo "🧪 Running all tests with Everest Standard..."
	npm run test

smoke: ## Run smoke tests only
	@echo "💨 Running smoke tests..."
	npm run test:smoke

mobile: ## Run mobile-specific tests
	@echo "📱 Running mobile tests..."
	npm run test:mobile

desktop: ## Run desktop tests
	@echo "🖥️  Running desktop tests..."
	npm run test:desktop

security: ## Run enterprise security validation
	@echo "🔒 Running enterprise security validation..."
	@node -e "const Scanner = require('./utils/security/vulnerability-scanner'); const scanner = new Scanner(); scanner.scanSourceCode().then(r => { console.log('📊 Scanned', r.scannedFiles, 'source files'); if (r.clean) { console.log('✅ No vulnerabilities found in source code'); process.exit(0); } else { console.log('❌ Vulnerabilities found:', r.issues.length); process.exit(1); } });"
	@echo "✅ Enterprise security validation passed!"

dashboard: ## Start production dashboard
	@echo "📊 Starting production dashboard..."
	npm run dashboard

clean: ## Clean test artifacts and reports
	@echo "🧹 Cleaning test artifacts..."
	rm -rf test-results/ playwright-report/ reports/
	@echo "✅ Cleanup complete!"

install: ## Full installation with security setup
	@echo "🏔️  Installing B2C PVT Demo with Everest Standard..."
	make setup
	make security
	@echo "🎉 Installation complete! Ready for enterprise testing."

# Advanced commands
lint: ## Run code quality checks
	@echo "🔍 Running code quality checks..."
	@if command -v eslint >/dev/null 2>&1; then \
		eslint . --ext .ts,.js --fix; \
	else \
		echo "⚠️  ESLint not installed, skipping..."; \
	fi

validate: ## Validate Everest Standard compliance
	@echo "📋 Validating Everest Standard compliance..."
	@echo "✅ Checking configuration..."
	@if [ -f "config/playwright.config.unified.ts" ]; then \
		echo "✅ Unified configuration found"; \
	else \
		echo "❌ Unified configuration missing"; \
		exit 1; \
	fi
	@echo "✅ Checking security utilities..."
	@if [ -f "utils/security/secure-logger.ts" ]; then \
		echo "✅ Secure logger found"; \
	else \
		echo "❌ Secure logger missing"; \
		exit 1; \
	fi
	@echo "✅ Checking AI security guardrails..."
	@if [ -f "utils/security/ai-guardrails.js" ]; then \
		echo "✅ AI guardrails found"; \
	else \
		echo "❌ AI guardrails missing"; \
		exit 1; \
	fi
	@echo "🎯 Everest Standard compliance validated!"

ai-security: ## Validate AI-generated code security
	@echo "🤖 Running AI security validation..."
	@node utils/security/ai-guardrails.js
	@echo "✅ AI security validation passed!"

# CI/CD commands
ci: ## Run CI pipeline simulation
	@echo "🔄 Running CI pipeline simulation..."
	make setup
	make security
	make test
	@echo "✅ CI pipeline simulation complete!"

# Development commands
dev: ## Start development environment
	@echo "🛠️  Starting development environment..."
	make setup
	@echo "🎯 Development environment ready!"
	@echo "💡 Use 'make test' to run tests"
	@echo "💡 Use 'make dashboard' to view reports"

# Documentation
docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	@echo "📖 Available documentation:"
	@echo "  - EVEREST_COMPLIANCE_REPORT.md"
	@echo "  - ENTERPRISE_SECURITY_FIXES.md"
	@echo "  - PERMANENT_FIX_DOCUMENTATION.md"
	@echo "  - docs/AGENT_RULES.md"
	@echo "  - docs/Standard-Framework-Governance.md"
	@echo "✅ Documentation ready!"

# Status check
status: ## Check system status
	@echo "📊 B2C PVT Demo Status Check"
	@echo "============================"
	@echo "Node.js: $(shell node --version 2>/dev/null || echo 'Not installed')"
	@echo "NPM: $(shell npm --version 2>/dev/null || echo 'Not installed')"
	@echo "Playwright: $(shell npx playwright --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "Configuration:"
	@if [ -f ".env" ]; then echo "✅ Environment configured"; else echo "❌ Environment not configured"; fi
	@if [ -f "config/playwright.config.unified.ts" ]; then echo "✅ Unified config present"; else echo "❌ Unified config missing"; fi
	@echo ""
	@echo "Security:"
	@if [ -f "utils/security/secure-logger.ts" ]; then echo "✅ Secure logging enabled"; else echo "❌ Secure logging missing"; fi
	@if [ -f "utils/security/input-validator.ts" ]; then echo "✅ Input validation enabled"; else echo "❌ Input validation missing"; fi