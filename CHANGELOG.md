# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete Contracts entity implementation with full CRUD operations
- Contracts support in CLI with create, get, update, delete, and list commands
- Contracts test suite with Jest
- TypeScript type definitions for Contract interface
- AI-aware metadata for all contract operations

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

### Fixed
- Jest configuration for proper TypeScript support
- Winston logger configuration in tests to prevent console noise 