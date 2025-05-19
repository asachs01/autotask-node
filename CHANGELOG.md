# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Initial project scaffolding and planning
### Changed
- BREAKING: Removed the `region` parameter from configuration and CLI usage. The client now automatically detects the correct API zone using the `/zoneInformation` endpoint and the provided credentials.
- Updated documentation and CLI usage accordingly. 