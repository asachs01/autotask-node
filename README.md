# Autotask API Wrapper

A feature-complete, production-ready NodeJS client library for the Kaseya Autotask PSA REST API. Designed for automation, AI agent integration (MCP), and modern developer experience.

## Features
- Full CRUD for all Autotask REST API entities (Tickets, Accounts, Projects, etc.)
- Region-based API URL auto-detection
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

const client = new AutotaskClient({
  username: 'user@example.com',
  integrationCode: 'YOUR_INTEGRATION_CODE',
  secret: 'YOUR_SECRET',
  region: 'NA', // or EU, AU, etc.
});

const ticket = await client.tickets.create({ title: 'Test', ... });
```

## Usage (CLI)

```sh
npx autotask-api tickets list --filter '{"status":4}'
```

## Development

- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Project Structure
- `src/` - Core client and entity modules
- `cli/` - CLI entry point
- `test/` - Unit tests
- `plans/` - Planning docs and ERD
- `prompt_logs/` - Daily prompt logs (gitignored)

## License
MIT 