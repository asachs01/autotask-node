# Customer Onboarding Automation

A comprehensive customer onboarding automation system for Autotask PSA that streamlines the entire customer setup process from initial contact to service delivery.

## Features

### Core Workflow Automation
- **Complete Customer Setup**: Automated company, contact, and location creation
- **Service Activation**: Automatic contract generation and service configuration
- **Welcome Process**: Initial ticket creation and knowledge base setup
- **Notification System**: Email notifications and internal alerts
- **Progress Tracking**: Real-time workflow monitoring and reporting

### Advanced Capabilities
- **Multi-step Workflows**: Configurable workflow templates
- **Error Handling**: Robust error recovery and retry mechanisms
- **Metrics & Analytics**: Comprehensive onboarding performance metrics
- **Integration Ready**: Extensible for CRM and other system integrations
- **Scalable Architecture**: Production-ready with Docker support

## Quick Start

### Prerequisites
- Node.js 18+
- Valid Autotask PSA credentials
- PostgreSQL (optional, for persistence)
- Redis (optional, for background jobs)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd examples/customer-onboarding
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

### Docker Deployment

```bash
# Build the Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Or use Docker Compose
docker-compose up -d
```

## API Reference

### Start Onboarding Workflow
```http
POST /api/onboarding/start
Content-Type: application/json

{
  "companyName": "Acme Corporation",
  "companyType": 1,
  "primaryContact": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@acme.com",
    "phone": "+1-555-0123"
  },
  "locations": [{
    "name": "Main Office",
    "address1": "123 Business St",
    "city": "Business City",
    "state": "NY",
    "zipCode": "12345",
    "country": "USA",
    "isPrimary": true
  }],
  "services": [{
    "serviceType": "IT Support",
    "description": "24/7 IT support services",
    "priority": "High"
  }]
}
```

### Get Workflow Status
```http
GET /api/onboarding/workflow/{workflowId}
```

### List All Workflows
```http
GET /api/onboarding/workflows
```

### Get Metrics
```http
GET /api/onboarding/metrics
```

## Workflow Steps

The onboarding process follows these automated steps:

1. **Company Creation** - Creates the company record in Autotask
2. **Primary Contact** - Sets up the main point of contact
3. **Additional Contacts** - Adds any secondary contacts
4. **Location Setup** - Configures company locations
5. **Contract Creation** - Generates service contracts
6. **Welcome Tickets** - Creates initial service tickets
7. **Notifications** - Sends welcome emails and alerts
8. **Finalization** - Completes setup and generates reports

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTOTASK_USERNAME` | Autotask API username | Required |
| `AUTOTASK_SECRET` | Autotask API secret | Required |
| `AUTOTASK_INTEGRATION_CODE` | Integration code | Required |
| `PORT` | Application port | 3001 |
| `LOG_LEVEL` | Logging level | info |
| `API_KEY` | API authentication key | Required in production |

### Workflow Templates

Workflows can be customized using templates. See `src/services/OnboardingService.ts` for template configuration.

## Monitoring & Metrics

The application provides comprehensive metrics:

- **Completion Rates**: Success/failure rates by workflow
- **Performance Metrics**: Average completion times
- **Step Analysis**: Success rates per workflow step
- **Failure Analysis**: Common failure points and causes
- **Volume Trends**: Historical onboarding volumes

Access metrics via the `/api/onboarding/metrics` endpoint or the web dashboard.

## Integration Examples

### CRM Synchronization
```typescript
// Enable CRM sync in workflow
const workflow = await onboardingService.startOnboarding(customerData, {
  integrations: {
    crm: {
      enabled: true,
      syncAfterCompletion: true
    }
  }
});
```

### Webhook Notifications
```typescript
// Configure webhook endpoints
const config = {
  webhooks: {
    onComplete: 'https://your-system.com/webhook/onboarding-complete',
    onFailure: 'https://your-system.com/webhook/onboarding-failed'
  }
};
```

## Development

### Project Structure
```
src/
├── controllers/     # REST API controllers
├── services/        # Business logic services
├── types/          # TypeScript type definitions
├── workflows/      # Workflow templates
└── utils/          # Utility functions

config/             # Configuration files
tests/              # Test files
docs/               # Documentation
docker/             # Docker configuration
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Building for Production
```bash
# Build TypeScript
npm run build

# Build Docker image
npm run docker:build
```

## Production Deployment

### Docker Compose Example
```yaml
version: '3.8'
services:
  onboarding:
    image: autotask-customer-onboarding
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - AUTOTASK_USERNAME=${AUTOTASK_USERNAME}
      - AUTOTASK_SECRET=${AUTOTASK_SECRET}
      - API_KEY=${API_KEY}
    restart: unless-stopped
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: autotask_onboarding
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: customer-onboarding
spec:
  replicas: 3
  selector:
    matchLabels:
      app: customer-onboarding
  template:
    metadata:
      labels:
        app: customer-onboarding
    spec:
      containers:
      - name: onboarding
        image: autotask-customer-onboarding:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: AUTOTASK_USERNAME
          valueFrom:
            secretKeyRef:
              name: autotask-secrets
              key: username
```

## Security Considerations

- **API Authentication**: Required in production environments
- **Input Validation**: All input data is validated and sanitized
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Audit Logging**: All operations are logged for compliance
- **Secure Headers**: Security headers are set by default
- **Error Handling**: Sensitive information is not exposed in errors

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Autotask credentials
   - Check integration code validity
   - Ensure proper API permissions

2. **Workflow Failures**
   - Check application logs
   - Verify required Autotask entity fields
   - Ensure proper picklist values

3. **Performance Issues**
   - Monitor rate limits
   - Check database connections
   - Review workflow complexity

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Run with additional debugging
DEBUG=* npm run dev
```

## Support

- **Documentation**: See `/docs` directory for detailed guides
- **Examples**: Check `/examples` for usage examples  
- **Issues**: Report issues on the project repository
- **Community**: Join the Kaseya community forums

## License

MIT License - see LICENSE file for details.