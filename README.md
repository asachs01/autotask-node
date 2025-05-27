# Autotask API Wrapper

A feature-complete, production-ready NodeJS client library for the Kaseya Autotask PSA REST API. Designed for automation, AI agent integration (MCP), and modern developer experience.

## Features
- Full CRUD for all Autotask REST API entities (Tickets, Accounts, Projects, Contracts, etc.)
- Automatic API zone detection (no region configuration needed)
- Filtering, sorting, pagination, batch operations
- Programmatic metadata for AI/automation
- Observability (Winston)
- Structured errors, debug logs, retry/backoff
- TypeScript typings
- ESM + CJS support
- CLI for npx usage

## Installation

```sh
npm install autotask-node
# or use npx for CLI
```

## Usage (Library)

```ts
import { AutotaskClient } from 'autotask-node';

const client = await AutotaskClient.create({
  username: 'user@example.com',
  integrationCode: 'YOUR_INTEGRATION_CODE',
  secret: 'YOUR_SECRET',
  // API URL is automatically detected
});

const ticket = await client.tickets.create({ title: 'Test', ... });
const contract = await client.contracts.create({ accountId: 123, contractType: 'Service' });
```

## Usage (CLI)

```sh
# List tickets with status filter
npx autotask-node tickets list '{"status":4}'

# Create a new contract
npx autotask-node contracts create '{"accountId":123,"contractType":"Service"}'

# Get contract by ID
npx autotask-node contracts get 456
```

## Environment Variables

- `AUTOTASK_USERNAME`: Your Autotask API username
- `AUTOTASK_INTEGRATION_CODE`: Your Autotask API integration code
- `AUTOTASK_SECRET`: Your Autotask API secret
- `AUTOTASK_API_URL`: (Optional) Override the API URL

> The client will automatically detect the correct API zone for your account using your credentials. You do not need to specify a region.

### Using .env Files

You can store your environment variables in a `.env` file:

```
AUTOTASK_USERNAME=user@example.com
AUTOTASK_INTEGRATION_CODE=YOUR_INTEGRATION_CODE
AUTOTASK_SECRET=YOUR_SECRET
```

Place this file:
- In the root of your project when using the library
- In the directory where you run the CLI command

The library will automatically load these variables when the client is created.

## Development

- Build: `npm run build`