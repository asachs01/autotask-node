#!/usr/bin/env node
import { AutotaskClient } from '../client/AutotaskClient';
import { AutotaskAuth } from '../types';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config();

// Also try to load from .env file in current working directory
const cwdEnvPath = resolve(process.cwd(), '.env');
dotenv.config({ path: cwdEnvPath });

function printUsage() {
  console.log(`Usage:
  autotask-node <entity> <create|get|update|delete|list> [args]

Entities:
  tickets, accounts, contacts, projects, timeEntries, configurationItems, 
  serviceCalls, tasks, resources, notes, attachments, contracts,
  contractServices, contractBlocks, contractAdjustments, contractExclusions,
  invoices, quotes

Env vars required:
  AUTOTASK_USERNAME
  AUTOTASK_INTEGRATION_CODE
  AUTOTASK_SECRET

Environment variables can be set in a .env file in the current directory.
`);
}

async function main() {
  const [,, entity, command, ...args] = process.argv;
  if (!entity || !command) return printUsage();

  const auth: AutotaskAuth = {
    username: process.env.AUTOTASK_USERNAME!,
    integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
    secret: process.env.AUTOTASK_SECRET!,
  };
  if (!auth.username || !auth.integrationCode || !auth.secret) {
    console.error('Missing required environment variables.');
    return printUsage();
  }
  let client;
  try {
    client = await AutotaskClient.create(auth);
  } catch (err) {
    console.error('Failed to initialize Autotask client:', err);
    process.exit(1);
  }

  try {
    if (entity === 'tickets') {
      switch (command) {
        case 'create': {
          const ticket = JSON.parse(args[0] || '{}');
          const res = await client.tickets.create(ticket);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.tickets.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const ticket = JSON.parse(args[1] || '{}');
          const res = await client.tickets.update(id, ticket);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.tickets.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.tickets.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'accounts') {
      switch (command) {
        case 'create': {
          const account = JSON.parse(args[0] || '{}');
          const res = await client.accounts.create(account);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.accounts.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const account = JSON.parse(args[1] || '{}');
          const res = await client.accounts.update(id, account);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.accounts.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.accounts.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contacts') {
      switch (command) {
        case 'create': {
          const contact = JSON.parse(args[0] || '{}');
          const res = await client.contacts.create(contact);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contacts.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contact = JSON.parse(args[1] || '{}');
          const res = await client.contacts.update(id, contact);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contacts.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contacts.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'projects') {
      switch (command) {
        case 'create': {
          const project = JSON.parse(args[0] || '{}');
          const res = await client.projects.create(project);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.projects.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const project = JSON.parse(args[1] || '{}');
          const res = await client.projects.update(id, project);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.projects.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.projects.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'timeEntries') {
      switch (command) {
        case 'create': {
          const timeEntry = JSON.parse(args[0] || '{}');
          const res = await client.timeEntries.create(timeEntry);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.timeEntries.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const timeEntry = JSON.parse(args[1] || '{}');
          const res = await client.timeEntries.update(id, timeEntry);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.timeEntries.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.timeEntries.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'configurationItems') {
      switch (command) {
        case 'create': {
          const configurationItem = JSON.parse(args[0] || '{}');
          const res = await client.configurationItems.create(configurationItem);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.configurationItems.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const configurationItem = JSON.parse(args[1] || '{}');
          const res = await client.configurationItems.update(id, configurationItem);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.configurationItems.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.configurationItems.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'serviceCalls') {
      switch (command) {
        case 'create': {
          const serviceCall = JSON.parse(args[0] || '{}');
          const res = await client.serviceCalls.create(serviceCall);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.serviceCalls.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const serviceCall = JSON.parse(args[1] || '{}');
          const res = await client.serviceCalls.update(id, serviceCall);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.serviceCalls.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.serviceCalls.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contracts') {
      switch (command) {
        case 'create': {
          const contract = JSON.parse(args[0] || '{}');
          const res = await client.contracts.create(contract);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contracts.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contract = JSON.parse(args[1] || '{}');
          const res = await client.contracts.update(id, contract);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contracts.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contracts.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contractServices') {
      switch (command) {
        case 'create': {
          const contractService = JSON.parse(args[0] || '{}');
          const res = await client.contractServices.create(contractService);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contractServices.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contractService = JSON.parse(args[1] || '{}');
          const res = await client.contractServices.update(id, contractService);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contractServices.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contractServices.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contractBlocks') {
      switch (command) {
        case 'create': {
          const contractBlock = JSON.parse(args[0] || '{}');
          const res = await client.contractBlocks.create(contractBlock);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contractBlocks.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contractBlock = JSON.parse(args[1] || '{}');
          const res = await client.contractBlocks.update(id, contractBlock);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contractBlocks.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contractBlocks.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contractAdjustments') {
      switch (command) {
        case 'create': {
          const contractAdjustment = JSON.parse(args[0] || '{}');
          const res = await client.contractAdjustments.create(contractAdjustment);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contractAdjustments.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contractAdjustment = JSON.parse(args[1] || '{}');
          const res = await client.contractAdjustments.update(id, contractAdjustment);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contractAdjustments.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contractAdjustments.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contractExclusions') {
      switch (command) {
        case 'create': {
          const contractExclusion = JSON.parse(args[0] || '{}');
          const res = await client.contractExclusions.create(contractExclusion);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contractExclusions.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contractExclusion = JSON.parse(args[1] || '{}');
          const res = await client.contractExclusions.update(id, contractExclusion);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contractExclusions.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contractExclusions.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'invoices') {
      switch (command) {
        case 'create': {
          const invoice = JSON.parse(args[0] || '{}');
          const res = await client.invoices.create(invoice);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.invoices.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const invoice = JSON.parse(args[1] || '{}');
          const res = await client.invoices.update(id, invoice);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.invoices.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.invoices.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'quotes') {
      switch (command) {
        case 'create': {
          const quote = JSON.parse(args[0] || '{}');
          const res = await client.quotes.create(quote);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.quotes.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const quote = JSON.parse(args[1] || '{}');
          const res = await client.quotes.update(id, quote);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.quotes.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.quotes.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else {
      printUsage();
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main(); 