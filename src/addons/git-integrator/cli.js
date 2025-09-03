#!/usr/bin/env node
// Git Integrator CLI - Simple command interface
import { VcsIntegrator } from './git.integrator.js';

const command = process.argv[2];
const arg = process.argv[3];

async function main() {
  try {
    const vcs = await VcsIntegrator.init();
    
    switch (command) {
      case 'init':
        console.log(`✅ Git integrator initialized for: ${vcs.getProvider()}`);
        console.log(`✅ User role: ${vcs.getUserRole()}`);
        break;
        
      case 'branch':
        if (!arg) throw new Error('Branch name required: node cli.js branch feature-name');
        await vcs.createFeatureBranch(arg);
        break;
        
      case 'commit':
        if (!arg) throw new Error('Commit message required: node cli.js commit "message"');
        await vcs.commitChanges(arg);
        break;
        
      case 'pr':
        await vcs.submitPullRequest();
        break;
        
      default:
        console.log('Usage: node cli.js [init|branch|commit|pr] [args]');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();