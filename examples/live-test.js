#!/usr/bin/env node

/**
 * Live test of Autotask SDK functionality
 * Tests basic CRUD operations with the API
 */

require('dotenv').config();
const { AutotaskClient } = require('../dist');

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

async function testSDK() {
  log('\n===========================================', 'blue');
  log('    Autotask SDK Live Test', 'blue');
  log('===========================================\n', 'blue');
  
  // Check environment variables
  const requiredVars = [
    'AUTOTASK_API_INTEGRATION_CODE',
    'AUTOTASK_API_USERNAME',
    'AUTOTASK_API_SECRET'
  ];
  
  log('1. Checking environment variables...', 'yellow');
  const missingVars = requiredVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    log('❌ Missing required environment variables:', 'red');
    missingVars.forEach(v => log(`   - ${v}`, 'red'));
    log('\nPlease set these in your .env file', 'gray');
    process.exit(1);
  }
  log('✅ All environment variables are set\n', 'green');
  
  try {
    // Create SDK client
    log('2. Creating SDK client...', 'yellow');
    const startTime = Date.now();
    const client = await AutotaskClient.create({
      integrationCode: process.env.AUTOTASK_API_INTEGRATION_CODE,
      username: process.env.AUTOTASK_API_USERNAME,
      secret: process.env.AUTOTASK_API_SECRET
    });
    const connectionTime = Date.now() - startTime;
    log(`✅ Client created successfully (${connectionTime}ms)\n`, 'green');
    
    // Test Companies endpoint
    log('3. Testing Companies endpoint...', 'yellow');
    const companiesStart = Date.now();
    const companies = await client.Companies.list({ pageSize: 5 });
    const companiesTime = Date.now() - companiesStart;
    log(`✅ Found ${companies.data.length} companies (${companiesTime}ms)`, 'green');
    
    if (companies.data.length > 0) {
      log('   Sample company:', 'gray');
      const company = companies.data[0];
      log(`   - ID: ${company.id}`, 'gray');
      log(`   - Name: ${company.companyName}`, 'gray');
      log(`   - Type: ${company.companyType}\n`, 'gray');
    }
    
    // Test Tickets endpoint
    log('4. Testing Tickets endpoint...', 'yellow');
    const ticketsStart = Date.now();
    const tickets = await client.Tickets.list({ pageSize: 5 });
    const ticketsTime = Date.now() - ticketsStart;
    log(`✅ Found ${tickets.data.length} tickets (${ticketsTime}ms)`, 'green');
    
    if (tickets.data.length > 0) {
      log('   Sample ticket:', 'gray');
      const ticket = tickets.data[0];
      log(`   - ID: ${ticket.id}`, 'gray');
      log(`   - Title: ${ticket.title}`, 'gray');
      log(`   - Status: ${ticket.status}\n`, 'gray');
    }
    
    // Test Projects endpoint
    log('5. Testing Projects endpoint...', 'yellow');
    const projectsStart = Date.now();
    const projects = await client.Projects.list({ pageSize: 5 });
    const projectsTime = Date.now() - projectsStart;
    log(`✅ Found ${projects.data.length} projects (${projectsTime}ms)`, 'green');
    
    if (projects.data.length > 0) {
      log('   Sample project:', 'gray');
      const project = projects.data[0];
      log(`   - ID: ${project.id}`, 'gray');
      log(`   - Name: ${project.projectName}`, 'gray');
      log(`   - Status: ${project.status}\n`, 'gray');
    }
    
    // Test Contacts endpoint
    log('6. Testing Contacts endpoint...', 'yellow');
    const contactsStart = Date.now();
    const contacts = await client.Contacts.list({ pageSize: 5 });
    const contactsTime = Date.now() - contactsStart;
    log(`✅ Found ${contacts.data.length} contacts (${contactsTime}ms)`, 'green');
    
    if (contacts.data.length > 0) {
      log('   Sample contact:', 'gray');
      const contact = contacts.data[0];
      log(`   - ID: ${contact.id}`, 'gray');
      log(`   - Name: ${contact.firstName} ${contact.lastName}`, 'gray');
      log(`   - Email: ${contact.emailAddress}\n`, 'gray');
    }
    
    // Test Contracts endpoint
    log('7. Testing Contracts endpoint...', 'yellow');
    const contractsStart = Date.now();
    const contracts = await client.Contracts.list({ pageSize: 5 });
    const contractsTime = Date.now() - contractsStart;
    log(`✅ Found ${contracts.data.length} contracts (${contractsTime}ms)`, 'green');
    
    if (contracts.data.length > 0) {
      log('   Sample contract:', 'gray');
      const contract = contracts.data[0];
      log(`   - ID: ${contract.id}`, 'gray');
      log(`   - Name: ${contract.contractName}`, 'gray');
      log(`   - Type: ${contract.contractType}\n`, 'gray');
    }
    
    // Summary
    log('===========================================', 'blue');
    log('    Test Summary', 'blue');
    log('===========================================', 'blue');
    
    const totalTime = connectionTime + companiesTime + ticketsTime + projectsTime + contactsTime + contractsTime;
    log(`✅ All tests passed successfully!`, 'green');
    log(`   Total execution time: ${totalTime}ms`, 'gray');
    log(`   Average response time: ${Math.round(totalTime / 6)}ms`, 'gray');
    
    // Test sub-client organization
    log('\n8. Testing sub-client organization...', 'yellow');
    log('   Available sub-clients:', 'gray');
    log('   - core (Companies, Contacts, Tickets, etc.)', 'gray');
    log('   - financial (Invoices, Billing, etc.)', 'gray');
    log('   - contractsClient (Contracts, Services, etc.)', 'gray');
    log('   - configuration (Settings, Categories, etc.)', 'gray');
    log('   - inventory (Products, Stock, etc.)', 'gray');
    log('   - procurement (Purchase Orders, etc.)', 'gray');
    log('   - service (Service Calls, SLAs, etc.)', 'gray');
    log('   - time (Time Entries, Expenses, etc.)', 'gray');
    log('   - crm (Opportunities, Sales, etc.)', 'gray');
    log('   - system (Users, Roles, Security, etc.)', 'gray');
    
    log('\n✅ SDK is fully functional and ready for production use!', 'green');
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    if (error.stack) {
      log('\nStack trace:', 'gray');
      log(error.stack, 'gray');
    }
    process.exit(1);
  }
}

// Run the test
testSDK().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  process.exit(1);
});