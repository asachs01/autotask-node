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

**Phase 1.3 - Missing Unit Tests (COMPLETE):**

- Added comprehensive unit tests for all missing entities:
  - Expenses entity with full CRUD and business logic testing
  - Purchase Orders entity with validation and error handling
  - Ticket Categories with activation/deactivation and filtering
  - Ticket Statuses with system vs custom status management
  - Ticket Priorities with priority level ordering and validation
  - Ticket Sources with system vs custom source management
- Added memory optimization utility tests with comprehensive coverage
- Fixed all TypeScript compilation issues and Jest type mismatches
- Total test coverage: 384 tests passing

**Phase 3.1 - Advanced Query & Filtering System (COMPLETE):**

- **Revolutionary Query Builder Implementation:**
  - Type-safe fluent API for building complex queries
  - Support for all comparison operators (eq, ne, gt, gte, lt, lte, contains, startsWith, endsWith, in, notIn, isNull, isNotNull, between)
  - Logical grouping with AND/OR operations and nested conditions
  - Advanced sorting with multiple fields and directions
  - Field selection for optimized data retrieval
  - Related entity includes with field specification and aliases
  - Comprehensive pagination support (offset-based and cursor-based)
  - Query execution methods: execute(), first(), count(), exists()
  - Query utility methods: clone(), reset(), toQuerySpec()
  - Robust error handling and value formatting
- **QueryableEntity Base Class:**
  - Extensible base class for entities to inherit query capabilities
  - Seamless integration with existing CRUD operations
  - Convenience methods for common query patterns
- **Enhanced Tickets Entity (TicketsEnhanced):**
  - Demonstrates full query builder integration
  - 20+ specialized query methods for common ticket operations
  - Advanced features like ticket statistics and complex filtering
  - Backward compatibility with traditional CRUD operations
- **Comprehensive Test Coverage:**
  - 46 query builder tests covering all functionality
  - 30 enhanced tickets entity tests
  - Total test suite: 460 tests passing (76 new tests added)
  - 100% TypeScript compilation success
  - Full integration testing with mock API responses

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
