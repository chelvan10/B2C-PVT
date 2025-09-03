# 🏔️ MITRE 10 AUTOMATION FRAMEWORK GOVERNANCE DOCUMENT  
## Everest-Standard | AI Coder Agent Enabled  
**Version: 2.1 — Updated: 2025-04-05**  
**Purpose:** Define world-class governance for NLP-driven Playwright automation across Mitre 10’s digital ecosystem

---

### 🔍 Executive Summary

This document governs how AI Coder Agents generate, modify, and maintain Playwright test scripts for:
- **Mitre 10 (B2C)** – https://www.mitre10.co.nz/
- **Mitre 10 Trade (B2B)** – https://www.mitre10.co.nz/trade

It ensures **consistency, scalability, and real-world accuracy** by integrating:
- Live DOM validation
- NLP-to-test translation
- Self-healing architecture
- Dual VCS support (GitHub & Bitbucket)
- Mobile-first, responsive design testing

All AI-generated code **must comply** with this document — the **single source of truth** for automation quality.

---

## 1. CORE PRINCIPLES (ALWAYS ENFORCED)

### 1.1 No Duplication
- Before creating any new file, check for existing logic in:
  - /src/page-objects/
  - /src/utils/
  - /src/tests/
- Reuse or extend — never duplicate.

### 1.2 Archive, Don’t Delete
- If a file is deprecated or replaced:
  - Move to: /archive/[type]/[filename].[version].ts
  - Example:  
    archive/page-objects/Homepage.v1.po.ts
- Add comment:
  // ARCHIVED: Replaced by Homepage.v2.po.ts — see /src/page-objects
  // Archived on: 2025-04-05

### 1.3 Logical & Pragmatic Structure
Maintain this folder structure:
/src
  /page-objects
    Homepage.po.ts
    TradePage.po.ts
    ClubPage.po.ts
    EasyAsGuidesPage.po.ts
    StoreFinderPage.po.ts
  /tests
    /b2c
      homepage-navigation.spec.ts
      mobile-user-journey.spec.ts
    /trade
      trade-login.spec.ts
    /content
      easy-as-guides.spec.ts
      inspiration.spec.ts
  /utils
    link-checker.ts
    image-validator.ts
    random-selector.ts
  /fixtures
    geolocation-fixture.ts
    auth-fixture.ts
  /data
    postcodes.json
    trade-user-creds.json
    club-deals.json
  /addons
    /git-integrator
    /dashboard-addon
/archive
  /page-objects
  /tests
/scripts
  refactor.js
  archive.js
/reports
  html/
  traces/

### 1.4 Naming Conventions
- Files: kebab-case  
  homepage-navigation.spec.ts, store-switcher.po.ts
- Page Objects: .po.ts suffix
- Test Specs: .spec.ts
- Data Files: Descriptive .json  
  valid-postcodes.json, club-deals.json

### 1.5 Refactoring Triggers
Automatically run make refactor when:
- >3 duplicates of same utility exist
- >5 deprecated files in /archive
- Code coverage < 80%
- CI fails due to flakiness in >20% of mobile tests

---

## 2. AI CODER AGENT RESPONSIBILITIES

### 2.1 On NLP Prompt → Generate or Update Scripts
When user submits:  
"Add test: user searches for ‘drill’, filters by brand, adds to cart on mobile"

Agent must:
- Detect intent: new, enhancement, fix?
- Check for existing: mobile-checkout.spec.ts
- If exists → extend
- If not → create in /src/tests/b2c/
- Use or update: ProductListingPage.po.ts, PDP.po.ts
- Add tags: @mobile @e2e @b2c
- Apply mobile emulation:
  test.use({ ...devices['iPhone 15 Pro'] });

### 2.2 On Fix Request → Repair Without Breaking
User: “Fix store switcher — postcode input not found”

Agent must:
- Use Playwright Inspector to validate DOM
- Update selector using Everest Hierarchy:
  1. getByTestId('store-postcode-input')
  2. getByPlaceholder('Enter postcode')
  3. getByLabel('Postcode')
  4. getByRole('textbox', { name: /postcode/i })
- If no stable attribute:
  // TODO: Add data-testid="store-postcode-input" to improve testability

### 2.3 On Enhancement → Optimize & Archive
If new version created:
- Compare with existing
- If superseding → move old to /archive
- Update all imports
- Preserve backward compatibility

Example:
mv src/page-objects/Homepage.po.ts archive/page-objects/Homepage.v1.po.ts
cp src/page-objects/Homepage.new.po.ts src/page-objects/Homepage.po.ts

### 2.4 Refactoring Automation
Implement self-cleaning via:
make refactor
Script: scripts/refactor.js
- Detect duplicates
- Archive deprecated
- Run eslint --fix
- Run prettier --write

Triggered after:
- PR with >10 file changes
- 3+ failing mobile tests
- Weekly in CI

---

## 3. DASHBOARD ADD-ON (STANDALONE & REUSABLE)

### Purpose
Plug-and-play reporting dashboard for any Playwright project.

### Structure
/src/addons/dashboard-addon/
  dashboard.integrator.ts   → Injects UI into report
  dashboard.config.json     → Widgets, filters, user prefs
  README.md                 → How to install in any project

### Features
- Fully decoupled from test logic
- Auto-detects: playwright-report/, allure-results/
- Role-based access: Only Reviewers (Leads) can configure
- Exportable: Copy folder into any framework
- Supports both GitHub Actions & Bitbucket Pipelines

---

## 4. PERSONAS & WORKFLOW (DUAL VCS INTEGRATION)

### 4.1 Creator (Tester)
Role: Writes test via NLP, commits, submits PR/MR  
Responsibilities:
- Create feature branch
- Write/test script
- Commit & push
- Address feedback

Workflow (Simple Terminal Commands):
git checkout -b feat/mobile-checkout-fix
// In VS Code: "Fix mobile checkout — payment form not loading"
make mobile
git add .
git commit -m "fix: resolve payment form load issue on mobile"
git push origin feat/mobile-checkout-fix

✅ No deep Git knowledge needed — use integrated terminal.

---

### 4.2 Reviewer (Lead)
Role: Reviews PR/MR for correctness, quality, standards  
Responsibilities:
- Review pull request (GitHub) or merge request (Bitbucket)
- Provide feedback
- Approve or request changes
- Merge (if authorized)

---

## 5. REAL SITE INTEGRATION (FROM WEBPAGE INSIGHTS)

### 5.1 Mitre 10 Trade
- URL: https://www.mitre10.co.nz/trade
- Key Element:  
  "Not a Mitre 10 Trade customer? Call us on 0800 M10 TRADE (610 87233)"  
- Test Coverage Required:
  - Trade login flow
  - Smartmate application link
  - B2B pricing visibility
  - Trade-only product filtering

### 5.2 Homepage & Responsive Design
- URL: https://www.mitre10.co.nz/
- Key Elements:
  - Store switcher (Loading store)
  - Wishlist, Store Finder, Gift Cards
  - Hero banners (e.g., Goldair, Club Deals, Easy As Guides)
  - Mobile-first layout (responsive images, touch targets)
- Test Coverage Required:
  - Store selection by postcode
  - Club Deals CTA navigation
  - Easy As Guides entry point
  - Image loading across devices
  - Footer links (e.g., "How To Reduce Home Heat Loss")

### 5.3 Club & Easy As Guides
- Club Page: Validate:
  - Deal tiles (e.g., "20% Off Goldair Towel Rails")
  - Airpoints Giveaway banner
  - "Shop All Club Deals" CTA
- Easy As Guides:
  - Guide thumbnails (e.g., "How To Grow Strawberries")
  - Mobile/tablet/desktop responsive banners
  - YouTube video integration (if present)

---

## 6. REPOSITORY CONFIGURATION (DUAL SUPPORT)

### File: /src/config/vcs/github.config.json
{
  "provider": "github",
  "repoUrl": "https://github.com/your-org/mitre10-automation",
  "branches": {
    "main": {
      "protected": true,
      "requiredReviews": 1,
      "allowForcePush": false,
      "requireLinearHistory": true
    }
  },
  "ci": {
    "provider": "github-actions",
    "workflowFile": ".github/workflows/ci.yml"
  },
  "prTemplate": "PULL_REQUEST_TEMPLATE.md",
  "roles": {
    "creator": ["write"],
    "reviewer": ["write", "maintain", "admin"]
  }
}

### File: /src/config/vcs/bitbucket.config.json
{
  "provider": "bitbucket",
  "repoUrl": "https://bitbucket.org/your-org/mitre10-automation",
  "branches": {
    "main": {
      "protected": true,
      "requiredApprovers": 1,
      "mergeChecks": ["unapproved", "needs-build"],
      "allowFastForward": false
    }
  },
  "ci": {
    "provider": "bitbucket-pipelines",
    "pipelineFile": "bitbucket-pipelines.yml"
  },
  "mrTemplate": "MERGE_REQUEST_TEMPLATE.md",
  "roles": {
    "creator": ["contributor"],
    "reviewer": ["admin"]
  }
}

→ Auto-configure on npm install based on git remote -v

---

## 7. CI/CD PIPELINE INTEGRATION

### 7.1 GitHub Actions (.github/workflows/ci.yml)
- Triggers: PR to main, push to main
- Jobs:
  - lint: ESLint + Prettier
  - test: Run smoke + mobile tests
  - report: Upload HTML report
  - refactor: Weekly cleanup

### 7.2 Bitbucket Pipelines (bitbucket-pipelines.yml)
- Steps:
  - npm install
  - npm run lint
  - npx playwright test --project=mobile
  - Upload reports to S3 or artifact path
  - Run make refactor weekly

### 7.3 Shared CI Environment Variables
Set in both platforms:
BASE_URL=https://www.mitre10.co.nz/
TRADE_URL=https://www.mitre10.co.nz/trade
SEED=1234
PWTRACE=1
ARTIFACT_PATH=./playwright-report

---

## 8. TESTER UX: SIMPLE AS POSSIBLE

Testers only need:
1. VS Code
2. NLP prompt in comment/chat:
   // Add test: user searches for 'drill', filters by brand, adds to cart
3. Press Ctrl+Enter → Invoke AI agent
4. Run: make smoke or make mobile
5. Commit & push

✅ No need to:
- Manually create files
- Worry about imports
- Understand folder structure
- Touch Git deeply

---

## 9. AUTOMATED MAKEFILE (ESSENTIAL COMMANDS)

make help           → Show all commands
make setup          → Install deps + auto-detect VCS
make test           → Run all tests
make smoke          → Run smoke suite
make mobile         → Run on iPhone 15 Pro
make android        → Run on Pixel 7
make refactor       → Clean duplicates, archive old
make open-report    → View HTML report
make debug          → Run in PWDEBUG=1 mode
make ci             → Simulate CI run
make vcs-config     → Generate VCS config

---

## 10. EVEREST-STANDARD COMPLIANCE CHECK

Before finalizing any change, verify:

[ ] No duplication  
[ ] No broken imports  
[ ] All new files follow naming & structure  
[ ] Deprecated files moved to /archive  
[ ] Tags applied (@mobile, @e2e, etc.)  
[ ] Mobile/desktop coverage balanced  
[ ] Performance under 3s on Slow 3G  
[ ] Screenshot mask applied for dynamic content  
[ ] VCS config matches platform (GitHub/Bitbucket)  
[ ] Real site elements (Trade, Club, Easy As) covered  

If all pass:
✅ Everest-Standard Compliance: PASSED
➡️ Changes approved for commit and PR/MR submission.

---

## 11. FINAL AGENT COMMAND

> You are now the Everest-Standard Guardian of this framework.  
> Every action you take must:
> - Elevate the codebase  
> - Preserve integrity  
> - Empower testers  
> - Reflect the real Mitre 10 digital experience  

You are not just writing code — you are curating a living, self-optimizing test ecosystem.

Ready for NLP input.
Awaiting tester prompt in VS Code...

---

✅ Document Version: 2.1  
📅 Last Updated: 2025-04-05  
📬 Contact: automation-team@mitre10.co.nz  
📎 Related Files: CONTRIBUTING.md, Makefile