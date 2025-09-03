# 📚 B2C PVT Demo - Documentation

This directory contains comprehensive documentation for the Mitre 10 B2C E-Commerce Test Automation Framework.

## 📁 Documentation Files

### 🔧 **Makefile**
- **Purpose**: Primary command reference with 80+ testing commands
- **Usage**: `make help` for complete command list
- **Features**: Setup, testing, reporting, CI/CD, maintenance commands

### 🚀 **Makefile.commands**
- **Purpose**: Complete NPM and Playwright command reference (150+ commands)
- **Usage**: `make -f docs/Makefile.commands help-commands`
- **Features**: All possible NPM scripts and Playwright execution options

### 📖 **FRAMEWORK_DOCUMENTATION.md**
- **Purpose**: Comprehensive framework documentation
- **Content**: Architecture, test strategy, configuration, performance metrics
- **Features**: Complete technical reference and usage guide

## 🎯 Quick Start

### Using Main Makefile
```bash
# From project root
make help                    # Show all commands
make install                 # Setup project
make test-smoke             # Run smoke tests
make report-allure          # Generate reports
```

### Using Commands Makefile
```bash
# From project root
make -f docs/Makefile.commands help-commands    # Show all NPM/Playwright commands
make -f docs/Makefile.commands npm-smoke        # NPM smoke tests
make -f docs/Makefile.commands npx-parallel-4   # Playwright parallel execution
```

### Reading Documentation
```bash
# View comprehensive documentation
cat docs/FRAMEWORK_DOCUMENTATION.md
```

## 📊 Documentation Overview

| File | Commands | Purpose |
|------|----------|---------|
| **Makefile** | 80+ | Primary testing workflow |
| **Makefile.commands** | 150+ | Complete command reference |
| **FRAMEWORK_DOCUMENTATION.md** | - | Technical documentation |

## 🔗 Quick Links

- **Setup**: `make install`
- **Test**: `make test-smoke`
- **Report**: `make report-allure`
- **Help**: `make help`
- **All Commands**: `make -f docs/Makefile.commands help-commands`

---

**🏆 World-Class Gold Standard Testing Framework Documentation**