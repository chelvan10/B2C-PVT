// GitHub Adapter - GitHub-specific VCS operations
// Created: 2025-01-28
import { execSync } from 'child_process';
export class GitHubAdapter {
    config;
    constructor(config) {
        this.config = config;
    }
    async createPullRequest(options) {
        try {
            // Check if GitHub CLI is available
            execSync('gh --version', { stdio: 'pipe' });
            const cmd = [
                'gh pr create',
                `--title "${options.title}"`,
                `--body "${options.description}"`,
                `--base ${options.targetBranch}`,
                `--head ${options.sourceBranch}`
            ].join(' ');
            execSync(cmd, { stdio: 'inherit' });
        }
        catch (error) {
            // Fallback to manual URL generation
            const repoUrl = `https://github.com/${this.config.owner}/${this.config.repository}`;
            const prUrl = `${repoUrl}/compare/${options.targetBranch}...${options.sourceBranch}?expand=1`;
            console.log(`📝 GitHub CLI not available. Open PR manually:`);
            console.log(`🔗 ${prUrl}`);
            console.log(`📋 Title: ${options.title}`);
            console.log(`📄 Description: ${options.description}`);
        }
    }
    async approveAndMerge(prNumber) {
        try {
            // Approve PR
            execSync(`gh pr review ${prNumber} --approve`, { stdio: 'inherit' });
            // Merge PR
            execSync(`gh pr merge ${prNumber} --squash --delete-branch`, { stdio: 'inherit' });
        }
        catch (error) {
            const repoUrl = `https://github.com/${this.config.owner}/${this.config.repository}`;
            console.log(`📝 GitHub CLI not available. Approve/merge manually:`);
            console.log(`🔗 ${repoUrl}/pull/${prNumber}`);
            throw new Error(`Manual approval required: ${error}`);
        }
    }
    async checkPermissions() {
        try {
            execSync(`gh api repos/${this.config.owner}/${this.config.repository}/collaborators`, { stdio: 'pipe' });
            return true;
        }
        catch {
            return false;
        }
    }
}
