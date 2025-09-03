# 🔄 Git Integrator Add-On

Unified VCS interface for GitHub and Bitbucket with role-based access control and automated workflows.

## 🚀 Quick Start

### Installation
```bash
# Auto-detect and initialize
make vcs-init
```

### Basic Usage
```bash
# Create feature branch
make branch-create NAME=mobile-checkout-fix

# Commit changes
make commit MSG="feat: add mobile checkout validation"

# Submit PR/MR
make pr-create
```

## 👥 Role-Based Access

| Role | Permissions | GitHub Mapping | Bitbucket Mapping |
|------|-------------|----------------|-------------------|
| **Creator (Tester)** | Create branches, commit, submit PR/MR | `contributor` | `developer` |
| **Reviewer (Lead)** | Approve, merge, configure CI | `admin` | `admin` |

## 🔧 Configuration

### Auto-Detection
The integrator automatically detects your VCS provider:
- **GitHub**: `git remote -v` contains `github.com`
- **Bitbucket**: `git remote -v` contains `bitbucket.org`

### Config Files
- **GitHub**: `/src/config/vcs/github.config.json`
- **Bitbucket**: `/src/config/vcs/bitbucket.config.json`

### Example Config
```json
{
  "provider": "github",
  "repository": "mitre10-automation",
  "owner": "your-org",
  "roles": {
    "creator": ["tester@company.com"],
    "reviewer": ["lead@company.com"]
  },
  "branchProtection": {
    "main": true,
    "requirePR": true,
    "requireReviews": 1
  }
}
```

## 🌿 Branch Naming

Automatic branch naming based on content:
- `feat/mobile-checkout-fix` (feature)
- `fix/search-bug-resolution` (bugfix)

## 📝 PR/MR Templates

Auto-populated templates include:
- **Changes**: Description section
- **Test Plan**: Checklist for validation
- **Related Tickets**: Issue linking
- **Screenshots**: Visual evidence

## 🔄 Workflows

### Tester Workflow (Creator)
```bash
# 1. Create feature branch
make branch-create NAME=search-improvement

# 2. Make changes to tests
# ... edit files ...

# 3. Commit changes
make commit MSG="feat: add search filter validation"

# 4. Submit for review
make pr-create
```

### Lead Workflow (Reviewer)
```typescript
// Approve and merge via CLI or web interface
const vcs = await VcsIntegrator.init();
await vcs.approveAndMerge(123); // PR/MR number
```

## 🧪 Integration with Testing

### CI/CD Compatibility
- **GitHub Actions**: `.github/workflows/ci.yml`
- **Bitbucket Pipelines**: `bitbucket-pipelines.yml`

### Test Execution Triggers
- **Push**: Runs smoke tests
- **PR/MR**: Runs full test suite
- **Merge**: Deploys to staging

## 🎯 NLP to Git Mapping

Natural language prompts map to Git commands:

| NLP Prompt | Git Command | Make Command |
|------------|-------------|--------------|
| "Create branch for mobile fix" | `git checkout -b feat/mobile-fix` | `make branch-create NAME=mobile-fix` |
| "Commit my changes" | `git add . && git commit` | `make commit MSG="description"` |
| "Submit for review" | Create PR/MR | `make pr-create` |

## 🔒 Security Features

- **Role validation** via email mapping
- **Branch protection** enforcement
- **Required reviews** before merge
- **Audit logging** of all actions

## 🛠️ CLI Requirements

### GitHub
```bash
# Install GitHub CLI (optional but recommended)
gh --version
```

### Bitbucket
```bash
# Install Bitbucket CLI (optional)
bb --version
```

**Note**: CLI tools are optional. Manual URLs are provided as fallback.

## 🚨 Troubleshooting

### Common Issues

**Config not found**
```bash
# Ensure config exists
ls src/config/vcs/
```

**Permission denied**
```bash
# Check user role in config
git config user.email
```

**Remote not detected**
```bash
# Verify git remote
git remote -v
```

## 📊 Usage Examples

### Complete Workflow
```bash
# Initialize (one-time setup)
make vcs-init

# Development cycle
make branch-create NAME=mobile-search-fix
# ... make changes ...
make commit MSG="feat: improve mobile search UX"
make pr-create

# Review cycle (Lead only)
# Approve via web interface or CLI
```

### Programmatic Usage
```typescript
import { VcsIntegrator } from './src/addons/git-integrator/git.integrator.js';

const vcs = await VcsIntegrator.init();
console.log(`Provider: ${vcs.getProvider()}`);
console.log(`Role: ${vcs.getUserRole()}`);

await vcs.createFeatureBranch('api-validation-enhancement');
await vcs.commitChanges('feat: add API response validation');
await vcs.submitPullRequest('API Validation Enhancement', 'Adds comprehensive API response validation');
```

## 🎯 Benefits

- **Unified Interface**: Same commands for GitHub/Bitbucket
- **Role Enforcement**: Automatic permission validation
- **Template Consistency**: Standardized PR/MR format
- **CI Integration**: Seamless pipeline triggers
- **Audit Trail**: Complete change tracking

---

**🔄 Git Integrator Add-On - Streamlining VCS workflows for test automation teams**