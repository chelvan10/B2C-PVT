// Git Integrator - Core Logic for GitHub & Bitbucket
// Created: 2025-01-28
// Purpose: Unified VCS interface with role-based access control

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { GitHubAdapter } from './github.adapter.js';
import { BitbucketAdapter } from './bitbucket.adapter.js';
import { VcsConfigValidator } from './vcs.config.validator.js';

export type VcsProvider = 'github' | 'bitbucket';
export type UserRole = 'creator' | 'reviewer';

export interface VcsConfig {
  provider: VcsProvider;
  repository: string;
  owner: string;
  roles: {
    creator: string[];
    reviewer: string[];
  };
  branchProtection: {
    main: boolean;
    requirePR: boolean;
    requireReviews: number;
  };
  templates: {
    prTemplate: string;
    mrTemplate: string;
  };
}

export class VcsIntegrator {
  private provider: VcsProvider;
  private config: VcsConfig;
  private adapter: GitHubAdapter | BitbucketAdapter;
  private userRole: UserRole;

  private constructor(provider: VcsProvider, config: VcsConfig, userRole: UserRole) {
    this.provider = provider;
    this.config = config;
    this.userRole = userRole;
    this.adapter = provider === 'github' 
      ? new GitHubAdapter(config) 
      : new BitbucketAdapter(config);
  }

  static async init(): Promise<VcsIntegrator> {
    const provider = await this.detectProvider();
    const config = await this.loadConfig(provider);
    const userRole = await this.detectUserRole(config);
    
    VcsConfigValidator.validate(config);
    
    return new VcsIntegrator(provider, config, userRole);
  }

  private static async detectProvider(): Promise<VcsProvider> {
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      
      if (remoteUrl.includes('github.com')) return 'github';
      if (remoteUrl.includes('bitbucket.org')) return 'bitbucket';
      
      throw new Error('Unsupported VCS provider');
    } catch (error) {
      throw new Error(`Failed to detect VCS provider: ${error}`);
    }
  }

  private static async loadConfig(provider: VcsProvider): Promise<VcsConfig> {
    const configPath = path.resolve(process.cwd(), `src/config/vcs/${provider}.config.json`);
    
    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    
    return JSON.parse(readFileSync(configPath, 'utf8'));
  }

  private static async detectUserRole(config: VcsConfig): Promise<UserRole> {
    try {
      const gitUser = execSync('git config user.email', { encoding: 'utf8' }).trim();
      
      if (config.roles.reviewer.includes(gitUser)) return 'reviewer';
      if (config.roles.creator.includes(gitUser)) return 'creator';
      
      return 'creator'; // Default role
    } catch {
      return 'creator';
    }
  }

  async createFeatureBranch(name: string): Promise<void> {
    const branchName = this.generateBranchName(name);
    
    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      console.log(`✅ Created branch: ${branchName}`);
    } catch (error) {
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  async commitChanges(message: string): Promise<void> {
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      console.log(`✅ Committed changes: ${message}`);
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error}`);
    }
  }

  async submitPullRequest(title?: string, description?: string): Promise<void> {
    if (this.userRole !== 'creator' && this.userRole !== 'reviewer') {
      throw new Error('Insufficient permissions to create PR/MR');
    }

    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const projectContext = this.detectProjectContext();
    
    // Push branch first
    try {
      execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Failed to push branch: ${error}`);
    }

    await this.adapter.createPullRequest({
      title: title || `${projectContext}feat: ${currentBranch}`,
      description: description || this.config.templates.prTemplate,
      sourceBranch: currentBranch,
      targetBranch: 'main'
    });

    console.log(`✅ ${this.provider === 'github' ? 'PR' : 'MR'} created successfully`);
  }

  private detectProjectContext(): string {
    try {
      const changedFiles = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' }).trim();
      
      if (changedFiles.includes('B2C/')) return '[B2C] ';
      if (changedFiles.includes('B2B/')) return '[B2B] ';
      if (changedFiles.includes('1Centre/')) return '[1Centre] ';
      
      return '';
    } catch {
      return '';
    }
  }

  async approveAndMerge(prNumber: number): Promise<void> {
    if (this.userRole !== 'reviewer') {
      throw new Error('Only reviewers can approve and merge');
    }

    await this.adapter.approveAndMerge(prNumber);
    console.log(`✅ ${this.provider === 'github' ? 'PR' : 'MR'} #${prNumber} approved and merged`);
  }

  private generateBranchName(name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const prefix = sanitized.includes('fix') ? 'fix' : 'feat';
    return `${prefix}/${sanitized}`;
  }

  getProvider(): VcsProvider {
    return this.provider;
  }

  getUserRole(): UserRole {
    return this.userRole;
  }
}