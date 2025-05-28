# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-27

### Added

**🎉 Initial Release - Comprehensive Autotask API Wrapper**

This is the first stable release of the Autotask API wrapper, providing a complete TypeScript/Node.js client library for interacting with the Autotask REST API.

**Core Features:**

- **Complete API Client**: Full-featured client with automatic zone detection and authentication
- **Entity Support**: Comprehensive CRUD operations for all major Autotask entities including:
  - Tickets, Accounts, Contacts, Projects, Tasks, Time Entries
  - Contracts, Contract Services, Contract Blocks, Contract Adjustments, Contract Exclusions
  - Invoices, Quotes, Purchase Orders, Expenses
  - Configuration Items, Attachments, Notes
- **Advanced Request Handling**: Robust retry logic with exponential backoff, rate limiting, and error handling
- **TypeScript Support**: Full type definitions for all entities and API responses
- **CLI Tool**: Command-line interface for all supported entities with CRUD operations
- **Comprehensive Testing**: Both unit tests (121 tests) and integration tests with real API validation

**Developer Experience:**

- **Integration Testing Infrastructure**: Complete test suite for validating against real Autotask API
- **Custom Jest Matchers**: Specialized assertions for Autotask entity validation
- **Test Helpers**: Utilities for creating test data and managing test environments
- **CI/CD Ready**: Automatic test skipping when credentials are unavailable
- **Logging & Monitoring**: Winston-based logging with configurable levels

**API Features:**

- **Automatic Zone Detection**: No manual region configuration required
- **Rate Limiting**: Built-in respect for API rate limits with intelligent retry
- **Error Handling**: Comprehensive error types and handling for all API scenarios
- **Pagination Support**: Automatic handling of paginated responses
- **Filtering & Querying**: Advanced query capabilities with type-safe filters

**Documentation:**

- Complete API documentation with examples
- Integration test documentation and setup guides
- CLI usage documentation
- TypeScript type definitions for all entities

This release provides a production-ready foundation for building applications that integrate with the Autotask platform, with robust error handling, comprehensive testing, and excellent developer experience.

## [Unreleased]

### Added

- Complete Contracts entity implementation with full CRUD operations
- Contracts support in CLI with create, get, update, delete, and list commands
- Contracts test suite with Jest
- TypeScript type definitions for Contract interface
- AI-aware metadata for all contract operations
- Comprehensive integration testing infrastructure
  - Global setup and teardown for integration tests
  - Integration test helpers with CRUD operations and test data factories
  - Custom Jest matchers for Autotask entity validation
  - Separate Jest configuration for integration tests
  - Skip mechanisms for CI/CD environments without API credentials
  - Real API connectivity testing with proper error handling
  - Rate limiting and retry logic validation
  - Zone detection verification
  - Performance testing capabilities

**Phase 2.1 - Contract-Related Entities:**

- ContractServices entity with full CRUD operations and contract-specific queries
- ContractBlocks entity for time/cost block management with date range filtering
- ContractAdjustments entity for contract modifications with active status filtering
- ContractExclusions entity for excluded items/services with active status filtering
- CLI support for all contract-related entities (contractServices, contractBlocks, contractAdjustments, contractExclusions)
- Complete test suites for all contract-related entities
- Enhanced error handling and retry logic using new RequestHandler infrastructure

**Phase 2.2 - Billing & Finance Entities:**

- Invoices entity with comprehensive billing support including unpaid/overdue tracking
- Quotes entity for sales quotes/estimates with expiration and opportunity tracking
- PurchaseOrders entity for vendor management
- Expenses entity for expense tracking and reimbursement

**Phase 2.3 - Service Desk Enhancement:**

- TicketCategories entity for ticket categorization
- TicketStatuses entity for custom status management
- TicketPriorities entity for priority level management
- TicketSources entity for ticket origin tracking

### Changed

- BREAKING: Removed the `region` parameter from configuration and CLI usage. The client now automatically detects the correct API zone using the `/zoneInformation` endpoint and the provided credentials.
- Updated documentation and CLI usage accordingly.
- Enhanced CLI usage message to include all supported entities including contracts, invoices, and quotes
- CLI support for invoices and quotes entities with full CRUD operations
- Updated Jest configuration to properly separate unit and integration tests
- Enhanced test helpers with proper mock setup for unit tests
- Fixed TypeScript errors in integration test files

### Fixed

- Jest configuration for proper TypeScript support
- Winston logger configuration in tests to prevent console noise
- Unit test timeout issues caused by retry logic in RequestHandler
- Jest configuration issues with module name mapping
- TypeScript compilation errors in test files

## [0.1.0] - 2024-01-XX

### Added

- Initial project structure
- Basic Autotask API client implementation
- Entity classes for major Autotask objects
- Request handling with retry logic
- Error handling and logging
- TypeScript support
- Unit test infrastructure
