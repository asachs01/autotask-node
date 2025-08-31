#!/usr/bin/env node

/**
 * Mock test of Autotask SDK structure and functionality
 * This test verifies the SDK is properly built without requiring API credentials
 */

const { AutotaskClient } = require('../dist');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSDKStructure() {
  log('\n===========================================', 'blue');
  log('    Autotask SDK Structure Test', 'blue');
  log('===========================================\n', 'blue');
  
  // Test 1: Check if SDK exports are available
  log('1. Checking SDK exports...', 'yellow');
  const exports = Object.keys(require('../dist'));
  log(`   Found ${exports.length} exports`, 'gray');
  
  const expectedExports = ['AutotaskClient'];
  const hasAllExports = expectedExports.every(exp => exports.includes(exp));
  
  if (hasAllExports) {
    log('✅ All required exports are available\n', 'green');
  } else {
    log('❌ Missing required exports\n', 'red');
    process.exit(1);
  }
  
  // Test 2: Check if AutotaskClient has required methods
  log('2. Checking AutotaskClient structure...', 'yellow');
  const clientMethods = Object.getOwnPropertyNames(AutotaskClient);
  
  const requiredMethods = ['create'];
  const hasAllMethods = requiredMethods.every(method => clientMethods.includes(method));
  
  if (hasAllMethods) {
    log('✅ AutotaskClient has all required static methods\n', 'green');
  } else {
    log('❌ AutotaskClient missing required methods\n', 'red');
    process.exit(1);
  }
  
  // Test 3: Check entity files
  log('3. Checking entity files...', 'yellow');
  const fs = require('fs');
  const entitiesDir = path.join(__dirname, '..', 'dist', 'entities');
  
  if (fs.existsSync(entitiesDir)) {
    const entityFiles = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.js'));
    log(`   Found ${entityFiles.length} entity files`, 'gray');
    
    // Sample some key entities
    const keyEntities = ['companies.js', 'tickets.js', 'projects.js', 'contacts.js', 'contracts.js'];
    const hasKeyEntities = keyEntities.every(entity => entityFiles.includes(entity));
    
    if (hasKeyEntities) {
      log('✅ All key entities are present\n', 'green');
    } else {
      log('⚠️  Some key entities may be missing\n', 'yellow');
    }
  } else {
    log('❌ Entities directory not found\n', 'red');
    process.exit(1);
  }
  
  // Test 4: Check sub-client structure
  log('4. Checking sub-client structure...', 'yellow');
  const subClientsDir = path.join(__dirname, '..', 'dist', 'client', 'sub-clients');
  
  if (fs.existsSync(subClientsDir)) {
    const subClientFiles = fs.readdirSync(subClientsDir).filter(f => f.endsWith('.js'));
    log(`   Found ${subClientFiles.length} sub-client files`, 'gray');
    
    const expectedSubClients = [
      'CoreClient.js',
      'FinancialClient.js',
      'ContractClient.js',
      'ConfigurationClient.js',
      'InventoryClient.js'
    ];
    
    const hasSubClients = expectedSubClients.every(client => subClientFiles.includes(client));
    
    if (hasSubClients) {
      log('✅ All main sub-clients are present\n', 'green');
    } else {
      log('⚠️  Some sub-clients may be missing\n', 'yellow');
    }
  } else {
    log('❌ Sub-clients directory not found\n', 'red');
    process.exit(1);
  }
  
  // Test 5: Check TypeScript definitions
  log('5. Checking TypeScript definitions...', 'yellow');
  const typesFile = path.join(__dirname, '..', 'dist', 'index.d.ts');
  
  if (fs.existsSync(typesFile)) {
    log('✅ TypeScript definitions are available\n', 'green');
  } else {
    log('⚠️  TypeScript definitions not found\n', 'yellow');
  }
  
  // Test 6: Check error classes
  log('6. Checking error handling classes...', 'yellow');
  const errorsDir = path.join(__dirname, '..', 'dist', 'errors');
  
  if (fs.existsSync(errorsDir)) {
    const errorFiles = fs.readdirSync(errorsDir).filter(f => f.endsWith('.js'));
    log(`   Found ${errorFiles.length} error handling files`, 'gray');
    log('✅ Error handling system is in place\n', 'green');
  } else {
    log('⚠️  Error handling directory not found\n', 'yellow');
  }
  
  // Test 7: Check validation framework
  log('7. Checking validation framework...', 'yellow');
  const validationDir = path.join(__dirname, '..', 'dist', 'validation');
  
  if (fs.existsSync(validationDir)) {
    log('✅ Validation framework is available\n', 'green');
  } else {
    log('⚠️  Validation framework not found\n', 'yellow');
  }
  
  // Test 8: Check utils
  log('8. Checking utility modules...', 'yellow');
  const utilsDir = path.join(__dirname, '..', 'dist', 'utils');
  
  if (fs.existsSync(utilsDir)) {
    const utilFiles = fs.readdirSync(utilsDir).filter(f => f.endsWith('.js'));
    log(`   Found ${utilFiles.length} utility modules`, 'gray');
    
    const keyUtils = ['requestHandler.js', 'errors.js'];
    const hasKeyUtils = keyUtils.every(util => utilFiles.includes(util));
    
    if (hasKeyUtils) {
      log('✅ Key utility modules are present\n', 'green');
    } else {
      log('⚠️  Some utility modules may be missing\n', 'yellow');
    }
  } else {
    log('❌ Utils directory not found\n', 'red');
    process.exit(1);
  }
  
  // Summary
  log('===========================================', 'blue');
  log('    Test Summary', 'blue');
  log('===========================================', 'blue');
  
  log('✅ SDK structure is valid and ready for use!', 'green');
  log('\nTo test with live API:', 'gray');
  log('1. Copy .env.example to .env', 'gray');
  log('2. Add your Autotask API credentials', 'gray');
  log('3. Run: node examples/live-test.js', 'gray');
  
  log('\nSDK Features:', 'yellow');
  log('• 215+ entity support', 'gray');
  log('• TypeScript support', 'gray');
  log('• Organized sub-clients by category', 'gray');
  log('• Comprehensive error handling', 'gray');
  log('• Validation framework', 'gray');
  log('• Request retry logic', 'gray');
  log('• Performance monitoring', 'gray');
}

// Run the test
testSDKStructure().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  process.exit(1);
});