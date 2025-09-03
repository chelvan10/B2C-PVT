// Git Integrator - Core Logic for GitHub & Bitbucket
// Created: 2025-01-28
// Purpose: Unified VCS interface with role-based access control
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { GitHubAdapter } from './github.adapter.js';
import { BitbucketAdapter } from './bitbucket.adapter.js';
import { VcsConfigValidator } from './vcs.config.validator.js';
export class VcsIntegrator {
    provider;
    config;
    adapter;
    userRole;
    constructor(provider, config, userRole) {
        this.provider = provider;
        this.config = config;
        this.userRole = userRole;
        this.adapter = provider === 'github'
            ? new GitHubAdapter(config)
            : new BitbucketAdapter(config);
    }
    static async init() {
        const provider = await this.detectProvider();
        const config = await this.loadConfig(provider);
        const userRole = await this.detectUserRole(config);
        VcsConfigValidator.validate(config);
        return new VcsIntegrator(provider, config, userRole);
    }
    static async detectProvider() {
        try {
            const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
            if (remoteUrl.includes('github.com'))
                return 'github';
            if (remoteUrl.includes('bitbucket.org'))
                return 'bitbucket';
            throw new Error('Unsupported VCS provider');
        }
        catch (error) {
            throw new Error(`Failed to detect VCS provider: ${error}`);
        }
    }
    static async loadConfig(provider) {
        const configPath = path.resolve(process.cwd(), `src/config/vcs/${provider}.config.json`);
        if (!existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }
        return JSON.parse(readFileSync(configPath, 'utf8'));
    }
    static async detectUserRole(config) {
        try {
            const gitUser = execSync('git config user.email', { encoding: 'utf8' }).trim();
            if (config.roles.reviewer.includes(gitUser))
                return 'reviewer';
            if (config.roles.creator.includes(gitUser))
                return 'creator';
            return 'creator'; // Default role
        }
        catch {
            return 'creator';
        }
    }
    async createFeatureBranch(name) {
        const branchName = this.generateBranchName(name);
        try {
            execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
            console.log(`✅ Created branch: ${branchName}`);
        }
        catch (error) {
            throw new Error(`Failed to create branch: ${error}`);
        }
    }
    async commitChanges(message) {
        try {
            execSync('git add .', { stdio: 'inherit' });
            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
            console.log(`✅ Committed changes: ${message}`);
        }
        catch (error) {
            throw new Error(`Failed to commit changes: ${error}`);
        }
    }
    async submitPullRequest(title, description) {
        if (this.userRole !== 'creator' && this.userRole !== 'reviewer') {
            throw new Error('Insufficient permissions to create PR/MR');
        }
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        // Push branch first
        try {
            execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
        }
        catch (error) {
            throw new Error(`Failed to push branch: ${error}`);
        }
        await this.adapter.createPullRequest({
            title: title || `feat: ${currentBranch}`,
            description: description || this.config.templates.prTemplate,
            sourceBranch: currentBranch,
            targetBranch: 'main'
        });
        console.log(`✅ ${this.provider === 'github' ? 'PR' : 'MR'} created successfully`);
    }
    async approveAndMerge(prNumber) {
        if (this.userRole !== 'reviewer') {
            throw new Error('Only reviewers can approve and merge');
        }
        await this.adapter.approveAndMerge(prNumber);
        console.log(`✅ ${this.provider === 'github' ? 'PR' : 'MR'} #${prNumber} approved and merged`);
    }
    generateBranchName(name) {
        const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const prefix = sanitized.includes('fix') ? 'fix' : 'feat';
        return `${prefix}/${sanitized}`;
    }
    getProvider() {
        return this.provider;
    }
    getUserRole() {
        return this.userRole;
    }
}
