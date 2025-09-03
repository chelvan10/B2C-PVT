#!/bin/bash
# Simple installation script for B2C PVT Demo Framework

echo "🚀 Installing B2C PVT Demo Test Framework..."

# Install NPM dependencies
echo "📦 Installing NPM packages..."
npm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

# Try to install system dependencies (optional)
echo "🔧 Installing system dependencies..."
if command -v sudo >/dev/null 2>&1; then
    echo "⚠️  System dependencies require sudo privileges."
    echo "   Run: sudo npx playwright install-deps"
    echo "   Or continue without system dependencies."
else
    echo "ℹ️  Sudo not available, skipping system dependencies."
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p storage test-results allure-results playwright-report

# Set up environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    echo "MITRE10_BASE_URL=https://www.mitre10.co.nz/" > .env
fi

echo "✅ Installation complete!"
echo ""
echo "🎯 Quick Start:"
echo "  make test-smoke    # Run smoke tests"
echo "  make report        # View results"
echo "  make help          # Show all commands"