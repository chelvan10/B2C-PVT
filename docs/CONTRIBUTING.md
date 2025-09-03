# 🛠️ Contributing to the Mitre 10 Playwright Automation Framework

Welcome! This document outlines how you can contribute to the test automation framework used to validate mitre10.co.nz.

Whether you're a human tester or an AI Coder Agent, your contributions must follow this guide and the [AGENT_RULES.md](./AGENT_RULES.md) to ensure consistency, reliability, and world-class quality.

---

## 🧑‍💼 Roles & Responsibilities

| Role | Who It Is | Key Responsibilities |
|------|---------|-----------------------|
| Creator (Tester) | QA Engineers, Automation Testers | Write tests via NLP prompts, run locally, submit PR/MR, respond to feedback |
| Reviewer (Lead) | QA Leads, Automation Architects | Review changes, enforce standards, approve, and merge |

> 🔐 All contributors must have access to the repository (GitHub/Bitbucket) with appropriate permissions.

---

## 📦 Prerequisites

Before contributing, ensure:

- ✅ The repository is hosted on GitHub or Bitbucket
- ✅ Git is installed locally: git --version
- ✅ You’ve cloned the repo:  
  git clone https://github.com/your-org/mitre10-automation.git
- ✅ The main branch is protected — requires PR/MR reviews before merging
- ✅ You have read access to:
  - AGENT_RULES.md
  - Makefile
  - README.md

---

## 🧭 Contribution Workflow

Follow this standard flow for all contributions:

### 1. Create a Feature Branch
git checkout -b feat/search-improvement
# or
git checkout -b fix/mobile-store-switcher

✅ Use prefixes: feat/, fix/, refactor/, hotfix/

### 2. Make Your Changes
You can contribute in two ways:

#### Option A: Human Tester (NLP Prompt + Terminal)
- Open VS Code
- Type a natural language prompt in a comment:
  // Add test: user searches for "drill", filters by brand, adds to cart on mobile
- Press Ctrl+Enter to invoke the AI Coder Agent
- The agent will generate compliant code using AGENT_RULES.md

#### Option B: Direct Code (Advanced)
- Manually write or update:
  - Test specs in /src/tests/
  - Page objects in /src/page-objects/
  - Utilities in /src/utils/
- Follow all rules in AGENT_RULES.md

### 3. Validate & Test
Run locally before pushing:
make smoke           # Fast smoke tests
make mobile          # Mobile-specific suite
make test            # Full regression

Ensure:
- No lint errors: make lint
- No type errors: make typecheck
- All tests pass

### 4. Commit & Push
git add .
git commit -m "feat: add mobile search and filter test"
git push origin feat/search-improvement

### 5. Submit Pull Request (GitHub) or Merge Request (Bitbucket)
The AI agent or human submits a request to merge into main.

> The system auto-detects your VCS provider and applies correct workflow.

#### On GitHub:
- Go to Pull Requests → Create new PR
- Assign to a Reviewer (Lead)

#### On Bitbucket:
- Go to Merge Requests → Create new MR
- Set required approver

### 6. Review & Feedback
The Reviewer (Lead) will:
- Check for correctness, locator stability, performance
- Ensure compliance with AGENT_RULES.md
- Approve or request changes

### 7. Merge
Once approved:
- The change is merged into main
- CI pipeline runs full test suite
- Reports are archived

---

## 🤖 AI Coder Agent Rules (Summary)

All AI-generated contributions must follow AGENT_RULES.md, which enforces:

| Rule | Enforcement |
|------|-------------|
| No duplication | Reuse existing page objects, utils |
| Archive, don’t delete | Move obsolete files to /archive |
| Stable locators first | Prefer data-testid, getByRole, getByText |
| Mobile-first waits | Use expect(locator).toBeVisible() with timeout |
| Tag tests | Use @smoke, @mobile, @e2e, @regression |
| Refactor on triggers | Auto-clean when duplicates grow |
| Preserve wiring | Update imports if files are moved |

> 🚫 AI agents must never overwrite or break existing integrations.

---

## 🧼 Refactoring & Codebase Hygiene

To maintain Everest-Standard cleanliness:

### When to Refactor
Run make refactor when:
- More than 3 duplicate utility functions exist
- Over 5 deprecated files in /archive
- CI fails due to flakiness in >20% of mobile tests
- Code coverage drops below 80%

### How It Works
make refactor
Automatically:
- Detects duplicates
- Archives outdated files
- Fixes lint/format issues
- Updates imports
- Preserves backward compatibility

---

## 🗂️ File & Folder Structure

Keep the project organized:

/src
  /page-objects       → Reusable page classes (.po.ts)
  /tests
    /smoke            → Critical path
    /mobile           → Device-specific flows
    /regression       → Full coverage
  /utils              → Shared helpers
  /fixtures           → Custom Playwright fixtures
  /data               → JSON test data
  /addons
    /git-integrator   → GitHub & Bitbucket automation
    /dashboard-addon  → Reporting UI
/archive
  /page-objects       → Old versions
  /tests              → Obsolete specs

> All new files must follow kebab-case.ts naming: homepage-navigation.spec.ts

---

## 🔄 Version Control Integration

This framework supports both:

| Platform | CI/CD | Configuration File |
|--------|------|---------------------|
| GitHub | GitHub Actions | .github/workflows/ci.yml |
| Bitbucket | Bitbucket Pipelines | bitbucket-pipelines.yml |

The framework auto-detects your VCS provider and loads:
- /src/config/vcs/github.config.json
- or /src/config/vcs/bitbucket.config.json

Includes:
- Branch protection rules
- Required reviewers
- PR/MR templates
- Role-based permissions

---

## 🛠️ Useful Commands (via Makefile)

| Command | Purpose |
|-------|--------|
| make setup | Install deps + auto-configure VCS |
| make test | Run all tests |
| make smoke | Run smoke suite |
| make mobile | Run mobile emulation |
| make refactor | Clean duplicates, archive old |
| make open-report | View HTML report |
| make debug | Run in PWDEBUG=1 mode |
| make ci | Simulate full CI run |

> 💡 Testers only need to use these commands — no deep Git knowledge required.

---

## 📄 Pull Request / Merge Request Template

When submitting a PR/MR, include:

## Changes
<!-- Briefly describe what was added or fixed -->

## Test Plan
- [ ] Ran locally with make test
- [ ] Verified screenshots/traces
- [ ] Checked for broken imports

## Related Tickets
Closes: #123

## Screenshots (if applicable)
![test-passed](./test-results/screenshot.png)

✅ Template is auto-loaded from PULL_REQUEST_TEMPLATE.md or MERGE_REQUEST_TEMPLATE.md

---

## 🧠 Tips for Success

- 🗣️ Use clear NLP prompts — specific > vague
- 🧹 Always run make refactor after major changes
- 📁 Never create duplicate folders or files
- 🔄 Use the Git Integrator Add-On for safe branch/PR creation
- 📊 Check reports at /reports/html/index.html

---

## 📚 Related Documents

| Document | Purpose |
|--------|--------|
| AGENT_RULES.md | Full AI agent governance |
| README.md | Getting started guide |
| Makefile | Automation command center |
| playwright.config.ts | Browser, device, reporter settings |

---

## 🙌 Thank You!

Your contributions help ensure the Mitre 10 digital experience is reliable, fast, and user-friendly across all devices.

Together, we’re building automation at Everest-Standard.

---

Document Version: 2.0 — Updated: 2025-04-05  
For support, contact: automation-team@mitre10.co.nz