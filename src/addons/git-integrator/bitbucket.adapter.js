// Bitbucket Adapter - Bitbucket-specific VCS operations
// Created: 2025-01-28
import { execSync } from 'child_process';
export class BitbucketAdapter {
    config;
    constructor(config) {
        this.config = config;
    }
    async createPullRequest(options) {
        try {
            // Try using Bitbucket CLI if available
            const cmd = [
                'bb pr create',
                `--title "${options.title}"`,
                `--description "${options.description}"`,
                `--source ${options.sourceBranch}`,
                `--destination ${options.targetBranch}`
            ].join(' ');
            execSync(cmd, { stdio: 'inherit' });
        }
        catch (error) {
            // Fallback to manual URL generation
            const repoUrl = `https://bitbucket.org/${this.config.owner}/${this.config.repository}`;
            const prUrl = `${repoUrl}/pull-requests/new?source=${options.sourceBranch}&dest=${options.targetBranch}`;
            console.log(`📝 Bitbucket CLI not available. Open MR manually:`);
            console.log(`🔗 ${prUrl}`);
            console.log(`📋 Title: ${options.title}`);
            console.log(`📄 Description: ${options.description}`);
        }
    }
    async approveAndMerge(prNumber) {
        try {
            // Approve and merge using Bitbucket CLI
            execSync(`bb pr approve ${prNumber}`, { stdio: 'inherit' });
            execSync(`bb pr merge ${prNumber} --delete-source-branch`, { stdio: 'inherit' });
        }
        catch (error) {
            const repoUrl = `https://bitbucket.org/${this.config.owner}/${this.config.repository}`;
            console.log(`📝 Bitbucket CLI not available. Approve/merge manually:`);
            console.log(`🔗 ${repoUrl}/pull-requests/${prNumber}`);
            throw new Error(`Manual approval required: ${error}`);
        }
    }
    async checkPermissions() {
        try {
            execSync(`bb repo info`, { stdio: 'pipe' });
            return true;
        }
        catch {
            return false;
        }
    }
}
