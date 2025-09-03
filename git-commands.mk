# Git Integrator Commands
.PHONY: vcs-init pr-create branch-create commit

vcs-init: ## 🔄 Initialize Git integrator
	@echo "🔄 Initializing Git Integrator..."
	@cd src/addons/git-integrator && node cli.js init

pr-create: ## 📝 Create Pull Request / Merge Request
	@echo "📝 Creating PR/MR..."
	@cd src/addons/git-integrator && node cli.js pr

branch-create: ## 🌿 Create feature branch (usage: make branch-create NAME=feature-name)
	@echo "🌿 Creating feature branch: $(NAME)"
	@cd src/addons/git-integrator && node cli.js branch $(NAME)

commit: ## 💾 Commit changes (usage: make commit MSG='commit message')
	@echo "💾 Committing changes..."
	@cd src/addons/git-integrator && node cli.js commit "$(MSG)"