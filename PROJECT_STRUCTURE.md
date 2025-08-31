# Autotask Node SDK - Project Structure

## Directory Layout

```
autotask-node/
├── src/                      # Source code
│   ├── client/              # Main client and sub-clients
│   │   ├── AutotaskClient.ts
│   │   └── sub-clients/     # Category-based sub-clients
│   ├── entities/            # 215+ entity implementations
│   ├── errors/              # Error handling classes
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── validation/          # Validation framework
│
├── dist/                    # Compiled JavaScript (generated)
│
├── test/                    # Test suites
│   ├── unit tests          # Individual entity tests
│   ├── integration/        # Integration tests
│   └── authentication/     # Auth-specific tests
│
├── examples/               # Usage examples
│   ├── live-test.js       # Live API test
│   └── mock-test.js       # Structure verification
│
├── docs/                   # Documentation
│   ├── API.md             # API reference
│   ├── ENTITIES.md        # Entity documentation
│   ├── EXAMPLES.md        # Code examples
│   └── MIGRATION.md       # PSA migration guide
│
├── scripts/               # Build and utility scripts
│
├── .taskmaster/          # Task Master integration
│
├── package.json          # NPM configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest test configuration
├── .env.example          # Environment variables template
├── README.md             # Project documentation
├── CHANGELOG.md          # Version history
└── LICENSE               # MIT License
```

## Key Files

### Configuration
- `.env.example` - Template for API credentials
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler settings
- `jest.config.js` - Test runner configuration

### Documentation
- `README.md` - Getting started guide
- `CHANGELOG.md` - Release notes
- `API.md` - Complete API reference
- `ENTITIES.md` - Entity documentation

### Entry Points
- `src/index.ts` - Main SDK exports
- `src/client/AutotaskClient.ts` - Primary client class

## Environment Variables

Required for API access (set in `.env` file):
- `AUTOTASK_API_INTEGRATION_CODE` - Your integration code
- `AUTOTASK_API_USERNAME` - API user email
- `AUTOTASK_API_SECRET` - API password

## NPM Scripts

```bash
npm run build        # Compile TypeScript to JavaScript
npm test            # Run test suite
npm run lint        # Check code style
npm run format      # Auto-format code
npm run clean       # Remove build artifacts
```

## Testing

```bash
# Run all tests
npm test

# Run structure verification (no credentials needed)
node examples/mock-test.js

# Run live API test (requires credentials)
node examples/live-test.js
```

## Features

- ✅ 215+ Autotask entities supported
- ✅ TypeScript with full type definitions
- ✅ Organized sub-clients by category
- ✅ Comprehensive error handling
- ✅ Request retry logic
- ✅ Validation framework
- ✅ Performance monitoring
- ✅ Environment-based configuration
- ✅ Extensive documentation
- ✅ Production ready