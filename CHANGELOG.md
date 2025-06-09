# Autotask API Wrapper Release Notes

## 1.0.0 release notes

**June 9, 2025** — First stable release of the Autotask API Wrapper, a TypeScript/Node.js client library for the Autotask REST API.

**IMPORTANT:**

- This is a major release that establishes the foundational API and behavior patterns. Future releases will maintain backward compatibility within the 1.x series.
- The `region` parameter has been removed from configuration. The client now automatically detects the correct API zone using Autotask's zone detection endpoint.
- All entity operations support the Query Builder system for filtering and data retrieval.

**NEW FEATURES:**

**Autotask API Integration:**

- **Automatic Zone Detection**: Client automatically discovers the correct API endpoint using provided credentials, eliminating manual region configuration.
- **Entity Support**: CRUD operations for major Autotask entities including Tickets, Accounts, Contacts, Projects, Tasks, Time Entries, Contracts, Invoices, Quotes, Purchase Orders, and others.
- **Request Handling**: Built-in retry logic with exponential backoff, rate limiting, and error handling.
- **TypeScript Support**: Type definitions for entities, API responses, and query operations with IntelliSense support.

**Query Builder System:**

- **Type-Safe Fluent API**: Build queries with TypeScript validation and compile-time error checking.
- **Comparison Operators**: Support for `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `contains`, `startsWith`, `endsWith`, `in`, `notIn`, `isNull`, `isNotNull`, and `between`.
- **Logical Grouping**: AND/OR operations with nesting capabilities for complex query construction.
- **Sorting**: Multi-field sorting with ascending/descending directions and chainable sort operations.
- **Field Selection**: Selective field retrieval using `select()` operations for performance optimization.
- **Related Entity Includes**: Fetch related data in single queries with field specification using `include()` operations.
- **Pagination**: Both offset-based and cursor-based pagination support with automatic page traversal.
- **Query Execution Methods**: Multiple execution patterns including `execute()`, `first()`, `count()`, and `exists()`.
- **Query Utilities**: Utilities including `clone()`, `reset()`, and `toQuerySpec()` for debugging.

**Enhanced Entity System:**

- **QueryableEntity Base Class**: Base class allowing entities to inherit query capabilities.
- **Enhanced Tickets Entity**: Integrated query builder with specialized query methods for common ticket operations.
- **Standardized CRUD Operations**: Consistent interface patterns across entity types with error handling.

**Command Line Interface:**

- **CLI Tool**: Command-line interface supporting entities with CRUD operations.
- **Interactive Mode**: Prompts for creating and updating entities with input validation.
- **Output Options**: Support for JSON output and formatted table display of results.
- **Environment Integration**: Integration with environment variables and configuration files.

**IMPROVEMENTS:**

**Developer Experience:**

- **Testing**: 460 unit tests with 100% pass rate, including 46 query builder tests and optimized integration test suite (11 tests).
- **Integration Test Infrastructure**: Test framework for validating against real Autotask API endpoints, optimized to respect API rate limits.
- **Custom Jest Matchers**: Test assertions for Autotask entity validation and API response testing.
- **Performance Monitoring**: Built-in performance tracking with metrics and optimization utilities.
- **Memory Management**: Pagination handling and memory optimization for large dataset operations.

**API Robustness:**

- **Error Handling**: Error types and recovery strategies for API scenarios including rate limiting, authentication failures, and network issues.
- **Rate Limiting**: Throttling and backoff strategies that respect Autotask API rate limits.
- **Connection Resilience**: Automatic retry mechanisms with exponential backoff for transient failures.
- **Request Optimization**: Batching and caching strategies for improved performance.

**Documentation and Tooling:**

- **API Documentation**: Guides with examples for features and entity operations.
- **Query Builder Guide**: Documentation with usage patterns and best practices for the query system.
- **Integration Setup**: Guides for integrating with development environments and CI/CD systems.
- **TypeScript Definitions**: Type coverage enabling IDE support and compile-time validation.

**SECURITY:**

- **Secure Authentication**: Credential handling with support for environment variables and secure configuration storage.
- **Token Management**: Automatic token refresh and secure storage of authentication credentials.
- **Request Validation**: Input validation and sanitization for API operations to prevent injection attacks.
- **Error Information Protection**: Handling of sensitive information in error messages and logs.

**FIXES:**

**Build and Configuration:**

- **Jest Configuration**: Resolved TypeScript compilation issues and module resolution problems in test environments.
- **Winston Logger Setup**: Fixed console noise in test environments with proper logger configuration.
- **Type System Compatibility**: Resolved TypeScript compilation errors across entity classes and utility functions.
- **Module Dependencies**: Fixed import/export issues and circular dependency problems.

**Test Infrastructure:**

- **Unit Test Timeouts**: Resolved timeout issues caused by retry logic in RequestHandler during test execution.
- **Mock System Integration**: Fixed Jest mock compatibility issues with TypeScript and Winston logger.
- **Integration Test Stability**: Improved test reliability with better error handling and API limitation detection.
- **Test Coverage Reporting**: Fixed coverage calculation and reporting for both unit and integration tests.

**Query System:**

- **Type Inference**: Resolved TypeScript type inference issues in complex query chains and method chaining.
- **Runtime Validation**: Fixed validation of query parameters and operator combinations.
- **Error Handling**: Improved error messages for invalid query construction and execution failures.

---

_For more information about the Autotask API Wrapper, visit our [GitHub repository](https://github.com/your-org/autotask-api-wrapper) or read our [documentation](./docs/)._

_To report issues or request features, please [open an issue](https://github.com/your-org/autotask-api-wrapper/issues) on GitHub._
