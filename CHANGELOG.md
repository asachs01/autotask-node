# Autotask API Wrapper Release Notes

## 1.0.0 release notes

**January 20, 2025** — We're excited to announce the first stable release of the Autotask API Wrapper! This comprehensive TypeScript/Node.js client library provides complete integration with the Autotask REST API, featuring revolutionary query capabilities, robust error handling, and excellent developer experience.

**IMPORTANT:**

- This is a major release that establishes the foundational API and behavior patterns. Future releases will maintain backward compatibility within the 1.x series.
- The `region` parameter has been removed from configuration. The client now automatically detects the correct API zone using Autotask's zone detection endpoint.
- All entity operations support the new Query Builder system for advanced filtering and data retrieval.

**NEW FEATURES:**

**Complete Autotask API Integration:**

- **Automatic Zone Detection**: Client automatically discovers the correct API endpoint using provided credentials, eliminating manual region configuration.
- **Full Entity Support**: Comprehensive CRUD operations for all major Autotask entities including Tickets, Accounts, Contacts, Projects, Tasks, Time Entries, Contracts, Invoices, Quotes, Purchase Orders, and more.
- **Advanced Request Handling**: Built-in retry logic with exponential backoff, intelligent rate limiting, and comprehensive error handling.
- **TypeScript First**: Complete type definitions for all entities, API responses, and query operations with full IntelliSense support.

**Revolutionary Query Builder System (Phase 3.1):**

- **Type-Safe Fluent API**: Build complex queries with full TypeScript validation and compile-time error checking.
- **Comprehensive Operators**: Support for all comparison operators including `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `contains`, `startsWith`, `endsWith`, `in`, `notIn`, `isNull`, `isNotNull`, and `between`.
- **Logical Grouping**: Complex AND/OR operations with unlimited nesting capabilities for sophisticated query construction.
- **Advanced Sorting**: Multi-field sorting with ascending/descending directions and chainable sort operations.
- **Field Selection**: Performance optimization through selective field retrieval using `select()` operations.
- **Related Entity Includes**: Fetch related data in single queries with field specification using `include()` operations.
- **Flexible Pagination**: Both offset-based and cursor-based pagination support with automatic page traversal.
- **Query Execution Methods**: Multiple execution patterns including `execute()`, `first()`, `count()`, and `exists()`.
- **Query Utilities**: Developer-friendly utilities including `clone()`, `reset()`, and `toQuerySpec()` for debugging.

**Enhanced Entity System:**

- **QueryableEntity Base Class**: Extensible foundation allowing all entities to inherit advanced query capabilities.
- **Enhanced Tickets Entity**: Fully integrated query builder with 20+ specialized query methods for common ticket operations.
- **Standardized CRUD Operations**: Consistent interface patterns across all entity types with full error handling.

**Command Line Interface:**

- **Complete CLI Tool**: Full-featured command-line interface supporting all entities with CRUD operations.
- **Interactive Mode**: User-friendly prompts for creating and updating entities with input validation.
- **Flexible Output**: Support for JSON output and formatted table display of results.
- **Environment Integration**: Seamless integration with environment variables and configuration files.

**IMPROVEMENTS:**

**Developer Experience:**

- **Comprehensive Testing**: 460 total tests with 100% pass rate, including 46 query builder tests and full integration test suite.
- **Integration Test Infrastructure**: Complete test framework for validating against real Autotask API endpoints.
- **Custom Jest Matchers**: Specialized test assertions for Autotask entity validation and API response testing.
- **Performance Monitoring**: Built-in performance tracking with detailed metrics and optimization utilities.
- **Memory Management**: Advanced pagination handling and memory optimization for large dataset operations.

**API Robustness:**

- **Intelligent Error Handling**: Comprehensive error types and recovery strategies for all API scenarios including rate limiting, authentication failures, and network issues.
- **Rate Limiting Respect**: Built-in throttling and backoff strategies that respect Autotask API rate limits automatically.
- **Connection Resilience**: Automatic retry mechanisms with exponential backoff for transient failures.
- **Request Optimization**: Intelligent batching and caching strategies for improved performance.

**Documentation and Tooling:**

- **Complete API Documentation**: Comprehensive guides with practical examples for all features and entity operations.
- **Query Builder Guide**: Detailed documentation with usage patterns and best practices for the query system.
- **Integration Setup**: Step-by-step guides for integrating with various development environments and CI/CD systems.
- **TypeScript Definitions**: Full type coverage enabling excellent IDE support and compile-time validation.

**SECURITY:**

- **Secure Authentication**: Robust credential handling with support for environment variables and secure configuration storage.
- **Token Management**: Automatic token refresh and secure storage of authentication credentials.
- **Request Validation**: Input validation and sanitization for all API operations to prevent injection attacks.
- **Error Information Protection**: Careful handling of sensitive information in error messages and logs.

**FIXES:**

**Build and Configuration:**

- **Jest Configuration**: Resolved TypeScript compilation issues and module resolution problems in test environments.
- **Winston Logger Setup**: Fixed console noise in test environments with proper logger configuration.
- **Type System Compatibility**: Resolved all TypeScript compilation errors across entity classes and utility functions.
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

## 0.1.0 release notes

**December 2024** — Initial development release establishing the project foundation and core API client implementation.

**NEW FEATURES:**

- **Basic API Client**: Initial implementation of Autotask REST API client with authentication support.
- **Core Entity Classes**: Foundation classes for major Autotask objects including basic CRUD operations.
- **Request Handling**: Initial retry logic and error handling for API requests.
- **TypeScript Support**: Basic type definitions and TypeScript compilation support.

**IMPROVEMENTS:**

- **Project Structure**: Established modular project organization with separation of concerns.
- **Error Handling**: Basic error types and logging infrastructure using Winston.
- **Test Infrastructure**: Initial unit test setup with Jest and basic test utilities.

**FIXES:**

- **Initial Build Issues**: Resolved basic TypeScript compilation and dependency management issues.
- **Test Configuration**: Fixed initial Jest setup and test discovery problems.

---

_For more information about the Autotask API Wrapper, visit our [GitHub repository](https://github.com/your-org/autotask-api-wrapper) or read our [documentation](./docs/)._

_To report issues or request features, please [open an issue](https://github.com/your-org/autotask-api-wrapper/issues) on GitHub._
