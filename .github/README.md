# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD, releases, and dependency management.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push to `main`/`develop` branches, Pull Requests

**Purpose:** Continuous Integration testing across multiple Node.js versions and operating systems

**Features:**

- **Multi-platform testing**: Ubuntu, Windows, macOS
- **Multi-version testing**: Node.js 18.x, 20.x, 22.x
- **Comprehensive testing**: Unit tests, integration tests (if credentials available)
- **Security checks**: npm audit signatures
- **Code quality**: Linting (if configured)
- **Coverage reporting**: Codecov integration

### 2. Release Workflow (`.github/workflows/release.yml`)

**Triggers:** Push to `main` branch

**Purpose:** Automated semantic versioning and publishing using semantic-release

**Features:**

- **Semantic versioning**: Automatic version bumping based on conventional commits
- **Changelog generation**: Automatic CHANGELOG.md updates
- **GitHub releases**: Automatic GitHub release creation with release notes
- **NPM publishing**: Automatic package publishing to npm registry
- **Provenance**: NPM package provenance for supply chain security

### 3. Manual Release Workflow (`.github/workflows/manual-release.yml`)

**Triggers:** Manual dispatch from GitHub Actions UI

**Purpose:** Manual release control with dry-run capability

**Features:**

- **Manual control**: Trigger releases manually when needed
- **Dry run mode**: Test release process without actually releasing
- **Release type selection**: Choose patch, minor, or major release
- **Full testing**: Runs complete test suite before release

## Setup Instructions

### 1. Repository Secrets

Configure the following secrets in your GitHub repository settings:

#### Required for Releases:

- `NPM_TOKEN`: NPM access token for publishing packages
  - Go to [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens
  - Create a "Granular Access Token" with publish permissions
  - Add as repository secret

#### Optional for Integration Tests:

- `AUTOTASK_USERNAME`: Your Autotask username
- `AUTOTASK_INTEGRATION_CODE`: Your Autotask integration code
- `AUTOTASK_SECRET`: Your Autotask secret key
- `TEST_ACCOUNT_ID`: Test account ID for integration tests
- `TEST_CONTACT_ID`: Test contact ID for integration tests
- `TEST_PROJECT_ID`: Test project ID for integration tests

#### Optional for Coverage:

- `CODECOV_TOKEN`: Codecov token for coverage reporting

### 2. Branch Protection

Configure branch protection rules for `main` branch:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Select the CI workflow checks
   - Require pull request reviews before merging

### 3. Semantic Release Configuration

The project uses conventional commits for semantic versioning:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)
- `docs:`, `style:`, `test:`, `chore:` → No version bump

### 4. Package.json Configuration

Ensure your `package.json` includes:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/your-repo.git"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

## Dependabot Configuration

The `.github/dependabot.yml` file configures automatic dependency updates:

- **NPM dependencies**: Weekly updates on Mondays
- **GitHub Actions**: Weekly updates on Mondays
- **Auto-assignment**: Assigns PRs to specified reviewers
- **Labeling**: Adds appropriate labels for easy filtering

## Usage

### Automatic Releases

1. Make changes using conventional commit messages
2. Push to `main` branch or merge PR
3. Release workflow automatically:
   - Determines next version
   - Updates CHANGELOG.md
   - Creates GitHub release
   - Publishes to npm

### Manual Releases

1. Go to Actions → Manual Release
2. Click "Run workflow"
3. Choose release type and dry-run option
4. Click "Run workflow"

### Integration Tests

Integration tests run automatically if Autotask credentials are configured as secrets. If credentials are missing, tests are automatically skipped.

## Troubleshooting

### Release Workflow Fails

1. **NPM Token Issues**: Verify `NPM_TOKEN` secret is valid and has publish permissions
2. **Permission Issues**: Ensure workflow has `contents: write` permission
3. **Branch Protection**: Verify branch protection rules allow the workflow to push

### Integration Tests Fail

1. **Missing Credentials**: Add Autotask credentials as repository secrets
2. **API Limits**: Integration tests may hit rate limits; they include retry logic
3. **Test Data**: Verify test account/contact/project IDs exist in your Autotask instance

### CI Workflow Issues

1. **Node Version**: Ensure your code is compatible with Node.js 18+
2. **Dependencies**: Run `npm audit` locally to check for vulnerabilities
3. **Tests**: Ensure all tests pass locally before pushing

## Security Considerations

- **Secrets**: Never commit secrets to the repository
- **Permissions**: Workflows use minimal required permissions
- **Provenance**: NPM packages include provenance for supply chain security
- **Audit**: Dependencies are automatically audited for vulnerabilities
