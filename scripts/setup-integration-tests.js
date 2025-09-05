#!/usr/bin/env node

/**
 * Setup script for Autotask API Integration Tests
 * Helps users configure and validate their integration test environment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Autotask API Integration Test Setup');
  console.log('=' .repeat(50));
  console.log();

  // Check if .env.test already exists
  const envTestPath = path.join(process.cwd(), '.env.test');
  const envExamplePath = path.join(process.cwd(), 'env.test.example');

  if (fs.existsSync(envTestPath)) {
    console.log('⚠️ .env.test already exists.');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ env.test.example not found. Make sure you are in the project root directory.');
    process.exit(1);
  }

  console.log('📄 Setting up integration test configuration...');
  console.log();

  // Gather configuration
  console.log('🔑 Autotask API Credentials:');
  const username = await question('Username (email): ');
  const integrationCode = await question('Integration Code: ');
  const secret = await question('Secret: ');
  const apiUrl = await question('API URL (optional, leave blank for auto-detection): ');

  console.log();
  console.log('🏠 Environment Configuration:');
  console.log('1. production-readonly (safest, read-only operations)');
  console.log('2. staging (read-only, for staging environments)');
  console.log('3. sandbox (full CRUD, for sandbox environments)');
  const envChoice = await question('Choose environment type (1-3) [1]: ') || '1';

  const environments = {
    '1': 'production-readonly',
    '2': 'staging',
    '3': 'sandbox'
  };
  const environment = environments[envChoice] || 'production-readonly';

  console.log();
  console.log('📋 Test Data (use existing IDs from your Autotask instance):');
  const accountId = await question('Test Account ID [1]: ') || '1';
  const contactId = await question('Test Contact ID [1]: ') || '1';
  const projectId = await question('Test Project ID [1]: ') || '1';
  const resourceId = await question('Test Resource ID [1]: ') || '1';

  console.log();
  console.log('🔍 Advanced Options:');
  const debugEnabled = await question('Enable debug logging? (y/N): ');
  const performanceLogs = await question('Enable performance logging? (y/N): ');

  // Generate .env.test content
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Replace values
  envContent = envContent.replace('SKIP_INTEGRATION_TESTS=false', 'SKIP_INTEGRATION_TESTS=false');
  envContent = envContent.replace('TEST_ENVIRONMENT=production-readonly', `TEST_ENVIRONMENT=${environment}`);
  envContent = envContent.replace('AUTOTASK_USERNAME=your-username@company.com', `AUTOTASK_USERNAME=${username}`);
  envContent = envContent.replace('AUTOTASK_INTEGRATION_CODE=your-integration-code', `AUTOTASK_INTEGRATION_CODE=${integrationCode}`);
  envContent = envContent.replace('AUTOTASK_SECRET=your-secret-key', `AUTOTASK_SECRET=${secret}`);
  
  if (apiUrl) {
    envContent = envContent.replace('# AUTOTASK_API_URL=https://webservicesX.autotask.net/ATServicesRest', `AUTOTASK_API_URL=${apiUrl}`);
  }
  
  envContent = envContent.replace('TEST_ACCOUNT_ID=1', `TEST_ACCOUNT_ID=${accountId}`);
  envContent = envContent.replace('TEST_CONTACT_ID=1', `TEST_CONTACT_ID=${contactId}`);
  envContent = envContent.replace('TEST_PROJECT_ID=1', `TEST_PROJECT_ID=${projectId}`);
  envContent = envContent.replace('TEST_RESOURCE_ID=1', `TEST_RESOURCE_ID=${resourceId}`);
  
  envContent = envContent.replace('DEBUG_INTEGRATION_TESTS=false', `DEBUG_INTEGRATION_TESTS=${debugEnabled.toLowerCase() === 'y' ? 'true' : 'false'}`);
  envContent = envContent.replace('ENABLE_PERFORMANCE_LOGS=false', `ENABLE_PERFORMANCE_LOGS=${performanceLogs.toLowerCase() === 'y' ? 'true' : 'false'}`);

  // Write .env.test file
  fs.writeFileSync(envTestPath, envContent);
  
  console.log();
  console.log('✅ Configuration saved to .env.test');
  console.log();

  // Display summary
  console.log('📋 Configuration Summary:');
  console.log(`  Environment: ${environment}`);
  console.log(`  Username: ${username}`);
  console.log(`  API URL: ${apiUrl || 'auto-detect'}`);
  console.log(`  Debug Mode: ${debugEnabled.toLowerCase() === 'y' ? 'enabled' : 'disabled'}`);
  console.log(`  Performance Logs: ${performanceLogs.toLowerCase() === 'y' ? 'enabled' : 'disabled'}`);
  console.log();

  // Test connection option
  const testConnection = await question('Test API connection now? (Y/n): ');
  if (testConnection.toLowerCase() !== 'n') {
    console.log('🔗 Testing API connection...');
    
    try {
      // Use child_process to run a simple test
      const { exec } = require('child_process');
      
      await new Promise((resolve, reject) => {
        exec('npm run test:integration:enhanced -- --testNamePattern="should authenticate and perform basic list operation"', 
          { timeout: 30000 }, 
          (error, stdout, stderr) => {
            if (error && !stdout.includes('PASS')) {
              console.log('❌ Connection test failed:');
              console.log(stderr || error.message);
              reject(error);
            } else {
              console.log('✅ API connection successful!');
              resolve();
            }
          }
        );
      });
    } catch {
      console.log('⚠️ Connection test encountered issues. You can run tests manually with:');
      console.log('  npm run test:integration:enhanced');
    }
  }

  console.log();
  console.log('🎉 Setup complete! You can now run integration tests with:');
  console.log();
  console.log('  # Run enhanced integration tests');
  console.log('  npm run test:integration:enhanced');
  console.log();
  console.log('  # Run with debug output');
  console.log('  npm run test:integration:enhanced:debug');
  console.log();
  console.log('  # Run all tests (unit + integration)');
  console.log('  npm run test:all:enhanced');
  console.log();
  
  if (environment === 'production-readonly') {
    console.log('🔒 Safety Note: Your tests will run in read-only mode to protect production data.');
    console.log('   For full CRUD testing, use a sandbox environment.');
  }
  
  console.log();
  console.log('📚 For more information, see: test/integration/README-Enhanced.md');
  
  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error.message);
  process.exit(1);
});
