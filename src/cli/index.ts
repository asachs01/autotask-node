#!/usr/bin/env node
import { AutotaskClient } from '../src/client/AutotaskClient';
import { AutotaskAuth } from '../src/types';

function printUsage() {
  console.log(`Usage:
  autotask-api tickets <create|get|update|delete|list> [args]

Env vars required:
  AUTOTASK_USERNAME
  AUTOTASK_INTEGRATION_CODE
  AUTOTASK_SECRET
  AUTOTASK_REGION (optional, default: NA)
`);
}

async function main() {
  const [,, entity, command, ...args] = process.argv;
  if (!entity || !command) return printUsage();

  const auth: AutotaskAuth = {
    username: process.env.AUTOTASK_USERNAME!,
    integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
    secret: process.env.AUTOTASK_SECRET!,
    region: (process.env.AUTOTASK_REGION as any) || 'NA',
  };
  if (!auth.username || !auth.integrationCode || !auth.secret) {
    console.error('Missing required environment variables.');
    return printUsage();
  }
  const client = new AutotaskClient(auth);

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
    } else {
      printUsage();
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main(); 