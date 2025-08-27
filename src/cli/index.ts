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

// Entities that support DELETE operations
const DELETABLE_ENTITIES = new Set([
  'timeEntries',
  'serviceCalls',
  'contractServices',
  'contractBlocks',
  'contractServiceAdjustments',
  'contractExclusionSets',
]);

function printUsage() {
  console.log(`Usage:
  autotask-node <entity> <create|get|update|delete|list> [args]

Entities:
  tickets, companies, contacts, projects, timeEntries, configurationItems, 
  serviceCalls, tasks, resources, contracts, contractServices, contractBlocks,
  contractServiceAdjustments, contractExclusionSets, invoices, quotes

Operations:
  - create, get, update, list: Available for all entities
  - delete: Only available for timeEntries, serviceCalls, contractServices, contractBlocks, contractServiceAdjustments, contractExclusionSets

Env vars required:
  AUTOTASK_USERNAME
  AUTOTASK_INTEGRATION_CODE
  AUTOTASK_SECRET

Environment variables can be set in a .env file in the current directory.
`);
}

async function main() {
  const [, , entity, command, ...args] = process.argv;
  if (!entity || !command) return printUsage();

  // Check if delete operation is requested for an entity that doesn't support it
  if (command === 'delete' && !DELETABLE_ENTITIES.has(entity)) {
    console.error(
      `Error: Entity '${entity}' does not support DELETE operations.`
    );
    console.error(
      `DELETE is only supported for: ${Array.from(DELETABLE_ENTITIES).join(', ')}`
    );
    return printUsage();
  }

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
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.tickets.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'companies') {
      switch (command) {
        case 'create': {
          const company = JSON.parse(args[0] || '{}');
          const res = await client.companies.create(company);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.companies.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const company = JSON.parse(args[1] || '{}');
          const res = await client.companies.update(id, company);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.companies.list(query);
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
          const res = await client.configurationItems.update(
            id,
            configurationItem
          );
          return console.log(JSON.stringify(res, null, 2));
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
    } else if (entity === 'contractServiceAdjustments') {
      switch (command) {
        case 'create': {
          const contractServiceAdjustment = JSON.parse(args[0] || '{}');
          const res = await client.contractServiceAdjustments.create(
            contractServiceAdjustment
          );
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contractServiceAdjustments.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contractServiceAdjustment = JSON.parse(args[1] || '{}');
          const res = await client.contractServiceAdjustments.update(
            id,
            contractServiceAdjustment
          );
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contractServiceAdjustments.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contractServiceAdjustments.list(query);
          return console.log(JSON.stringify(res, null, 2));
        }
        default:
          return printUsage();
      }
    } else if (entity === 'contractExclusionSets') {
      switch (command) {
        case 'create': {
          const contractExclusionSet = JSON.parse(args[0] || '{}');
          const res =
            await client.contractExclusionSets.create(contractExclusionSet);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'get': {
          const id = Number(args[0]);
          const res = await client.contractExclusionSets.get(id);
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'update': {
          const id = Number(args[0]);
          const contractExclusionSet = JSON.parse(args[1] || '{}');
          const res = await client.contractExclusionSets.update(
            id,
            contractExclusionSet
          );
          return console.log(JSON.stringify(res, null, 2));
        }
        case 'delete': {
          const id = Number(args[0]);
          await client.contractExclusionSets.delete(id);
          return console.log('Deleted');
        }
        case 'list': {
          const query = args[0] ? JSON.parse(args[0]) : {};
          const res = await client.contractExclusionSets.list(query);
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
