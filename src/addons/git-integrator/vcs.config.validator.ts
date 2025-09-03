// VCS Config Validator - Ensures configuration integrity
// Created: 2025-01-28

import type { VcsConfig } from './git.integrator.js';

export class VcsConfigValidator {
  static validate(config: VcsConfig): void {
    this.validateRequired(config);
    this.validateRoles(config);
    this.validateBranchProtection(config);
    this.validateTemplates(config);
  }

  private static validateRequired(config: VcsConfig): void {
    const required = ['provider', 'repository', 'owner'];
    
    for (const field of required) {
      if (!config[field as keyof VcsConfig]) {
        throw new Error(`Missing required config field: ${field}`);
      }
    }

    if (!['github', 'bitbucket'].includes(config.provider)) {
      throw new Error(`Invalid provider: ${config.provider}`);
    }
  }

  private static validateRoles(config: VcsConfig): void {
    if (!config.roles || !config.roles.creator || !config.roles.reviewer) {
      throw new Error('Missing roles configuration');
    }

    if (!Array.isArray(config.roles.creator) || !Array.isArray(config.roles.reviewer)) {
      throw new Error('Roles must be arrays of email addresses');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allUsers = [...config.roles.creator, ...config.roles.reviewer];
    
    for (const email of allUsers) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }
    }
  }

  private static validateBranchProtection(config: VcsConfig): void {
    if (!config.branchProtection) {
      throw new Error('Missing branch protection configuration');
    }

    const { main, requirePR, requireReviews } = config.branchProtection;
    
    if (typeof main !== 'boolean' || typeof requirePR !== 'boolean') {
      throw new Error('Branch protection flags must be boolean');
    }

    if (typeof requireReviews !== 'number' || requireReviews < 0 || requireReviews > 10) {
      throw new Error('requireReviews must be a number between 0-10');
    }
  }

  private static validateTemplates(config: VcsConfig): void {
    if (!config.templates) {
      throw new Error('Missing templates configuration');
    }

    const { prTemplate, mrTemplate } = config.templates;
    
    if (typeof prTemplate !== 'string' || typeof mrTemplate !== 'string') {
      throw new Error('Templates must be strings');
    }

    if (prTemplate.length === 0 || mrTemplate.length === 0) {
      throw new Error('Templates cannot be empty');
    }
  }
}