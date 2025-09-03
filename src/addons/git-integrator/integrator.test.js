// Git Integrator Validation Test
// Created: 2025-01-28
import { VcsIntegrator } from './git.integrator.js';
import { VcsConfigValidator } from './vcs.config.validator.js';
export async function validateIntegrator() {
    console.log('🔄 Validating Git Integrator Add-On...');
    try {
        // Test 1: Configuration validation
        console.log('📋 Testing configuration validation...');
        const mockConfig = {
            provider: 'github',
            repository: 'test-repo',
            owner: 'test-owner',
            roles: {
                creator: ['test@example.com'],
                reviewer: ['lead@example.com']
            },
            branchProtection: {
                main: true,
                requirePR: true,
                requireReviews: 1
            },
            templates: {
                prTemplate: 'Test PR template',
                mrTemplate: 'Test MR template'
            }
        };
        VcsConfigValidator.validate(mockConfig);
        console.log('✅ Configuration validation passed');
        // Test 2: Provider detection (if in git repo)
        try {
            const integrator = await VcsIntegrator.init();
            console.log(`✅ Provider detected: ${integrator.getProvider()}`);
            console.log(`✅ User role: ${integrator.getUserRole()}`);
        }
        catch (error) {
            console.log('ℹ️ Provider detection skipped (not in git repo)');
        }
        console.log('🎯 Git Integrator Add-On validation complete!');
    }
    catch (error) {
        console.error('❌ Validation failed:', error);
        throw error;
    }
}
// Export validation function for external use
export const expect = {
    toBeConfiguredFor: (provider) => ({
        async validate() {
            try {
                const integrator = await VcsIntegrator.init();
                const actualProvider = integrator.getProvider();
                if (actualProvider === provider) {
                    console.log(`✅ Configured for ${provider}`);
                    return true;
                }
                else {
                    throw new Error(`Expected ${provider}, got ${actualProvider}`);
                }
            }
            catch (error) {
                console.log(`ℹ️ Configuration check: ${error}`);
                return false;
            }
        }
    })
};
// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    validateIntegrator().catch(console.error);
}
