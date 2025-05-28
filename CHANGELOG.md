# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-05-28

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
  - Service Desk entities: Ticket Categories, Statuses, Priorities, Sources
- **Advanced Request Handling**: Robust retry logic with exponential backoff, rate limiting, and error handling
- **TypeScript Support**: Full type definitions for all entities and API responses
- **CLI Tool**: Command-line interface for all supported entities with CRUD operations
- **Comprehensive Testing**: 460 tests total including unit tests and integration tests with real API validation

**🚀 Revolutionary Query Builder System (Phase 3.1):**

- **Type-Safe Fluent API**: Build complex queries with full TypeScript intellisense and compile-time validation
- **Comprehensive Operators**: All comparison operators (eq, ne, gt, gte, lt, lte, contains, startsWith, endsWith, in, notIn, isNull, isNotNull, between)
- **Logical Grouping**: Complex AND/OR operations with unlimited nesting
- **Advanced Sorting**: Multi-field sorting with ascending/descending directions
- **Field Selection**: Optimize performance by selecting only needed fields
- **Related Entity Includes**: Fetch related data in a single query with field specification
- **Comprehensive Pagination**: Both offset-based and cursor-based pagination support
- **Query Execution Methods**: execute(), first(), count(), exists()
- **Query Utilities**: clone(), reset(), toQuerySpec() for debugging
- **QueryableEntity Base Class**: Extensible foundation for entities to inherit query capabilities
- **Enhanced Tickets Entity**: Demonstrates full query builder integration with 20+ specialized methods

**Developer Experience:**

- **Integration Testing Infrastructure**: Complete test suite for validating against real Autotask API
- **Custom Jest Matchers**: Specialized assertions for Autotask entity validation
- **Test Helpers**: Utilities for creating test data and managing test environments
- **CI/CD Ready**: Automatic test skipping when credentials are unavailable
- **Logging & Monitoring**: Winston-based logging with configurable levels
- **Memory Optimization**: PaginationHandler and memory management utilities
- **Performance Monitoring**: Built-in performance tracking and optimization

**API Features:**

- **Automatic Zone Detection**: No manual region configuration required
- **Rate Limiting**: Built-in respect for API rate limits with intelligent retry
- **Error Handling**: Comprehensive error types and handling for all API scenarios
- **Pagination Support**: Automatic handling of paginated responses
- **Advanced Querying**: Revolutionary query builder with type-safe filters and complex operations

**Documentation:**

- Complete API documentation with examples
- Query Builder documentation with comprehensive usage examples
- Integration test documentation and setup guides
- CLI usage documentation
- TypeScript type definitions for all entities

**Test Coverage:**

- **460 total tests** with 100% passing rate
- **46 query builder tests** covering all functionality
- **30 enhanced tickets entity tests**
- **384 entity and utility tests** for comprehensive coverage
- Full TypeScript compilation success
- Integration testing with mock API responses

This release provides a production-ready foundation for building applications that integrate with the Autotask platform, with robust error handling, comprehensive testing, revolutionary query capabilities, and excellent developer experience.

### Changed

- BREAKING: Removed the `region` parameter from configuration and CLI usage. The client now automatically detects the correct API zone using the `/zoneInformation` endpoint and the provided credentials.
- Updated documentation and CLI usage accordingly.
- Enhanced CLI usage message to include all supported entities including contracts, invoices, and quotes
- CLI support for invoices and quotes entities with full CRUD operations
- Updated Jest configuration to properly separate unit and integration tests
- Enhanced test helpers with proper mock setup for unit tests

### Fixed

- Jest configuration for proper TypeScript support
- Winston logger configuration in tests to prevent console noise
- Unit test timeout issues caused by retry logic in RequestHandler
- Jest configuration issues with module name mapping
- TypeScript compilation errors in test files
- All TypeScript compilation errors in entity and utility tests
- Jest type system compatibility issues

## [0.1.0] - 2024-01-XX

### Added

- Initial project structure
- Basic Autotask API client implementation
- Entity classes for major Autotask objects
- Request handling with retry logic
- Error handling and logging
- TypeScript support
- Unit test infrastructure
