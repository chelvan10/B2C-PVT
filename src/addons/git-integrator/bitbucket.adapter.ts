// Bitbucket Adapter - Bitbucket-specific VCS operations
// Created: 2025-01-28

import { execSync } from 'child_process';
import type { VcsConfig } from './git.integrator.js';

export interface PullRequestOptions {
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
}

export class BitbucketAdapter {
  private config: VcsConfig;

  constructor(config: VcsConfig) {
    this.config = config;
  }

  async createPullRequest(options: PullRequestOptions): Promise<void> {
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
    } catch (error) {
      // Fallback to manual URL generation
      const repoUrl = `https://bitbucket.org/${this.config.owner}/${this.config.repository}`;
      const prUrl = `${repoUrl}/pull-requests/new?source=${options.sourceBranch}&dest=${options.targetBranch}`;
      
      console.log(`📝 Bitbucket CLI not available. Open MR manually:`);
      console.log(`🔗 ${prUrl}`);
      console.log(`📋 Title: ${options.title}`);
      console.log(`📄 Description: ${options.description}`);
    }
  }

  async approveAndMerge(prNumber: number): Promise<void> {
    try {
      // Approve and merge using Bitbucket CLI
      execSync(`bb pr approve ${prNumber}`, { stdio: 'inherit' });
      execSync(`bb pr merge ${prNumber} --delete-source-branch`, { stdio: 'inherit' });
    } catch (error) {
      const repoUrl = `https://bitbucket.org/${this.config.owner}/${this.config.repository}`;
      console.log(`📝 Bitbucket CLI not available. Approve/merge manually:`);
      console.log(`🔗 ${repoUrl}/pull-requests/${prNumber}`);
      throw new Error(`Manual approval required: ${error}`);
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      execSync(`bb repo info`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}