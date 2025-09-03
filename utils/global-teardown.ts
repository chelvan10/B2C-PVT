import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up temporary files if needed
  const tempFiles = [
    path.join(process.cwd(), 'temp'),
    path.join(process.cwd(), '.tmp')
  ];
  
  for (const tempPath of tempFiles) {
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
  }
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;