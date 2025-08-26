# Ticket Management Dashboard

A comprehensive real-time ticket management dashboard for Autotask PSA with advanced SLA tracking, automated escalations, and performance analytics.

## Features

### Real-time Monitoring
- **Live Ticket Updates**: WebSocket-powered real-time ticket status updates
- **SLA Tracking**: Visual SLA compliance monitoring with breach alerts
- **Queue Analytics**: Real-time queue performance and workload distribution
- **Resource Utilization**: Technician workload and performance tracking
- **System Health**: Application and service health monitoring

### Advanced Analytics
- **Performance Metrics**: Response times, resolution times, and throughput
- **Trend Analysis**: Historical data trends and forecasting
- **Escalation Management**: Automated escalation rules and notifications
- **Alert System**: Configurable alerts for critical events
- **Custom Dashboards**: Role-based dashboard customization

### Automation Features
- **Smart Escalations**: Rule-based automatic ticket escalation
- **SLA Monitoring**: Proactive SLA breach prevention
- **Performance Alerts**: Automated alerts for performance degradation
- **Resource Optimization**: Workload balancing recommendations
- **Batch Operations**: Bulk ticket updates and management

## Quick Start

### Prerequisites
- Node.js 18+
- Valid Autotask PSA credentials
- Redis (optional, for enhanced performance)
- Modern web browser with WebSocket support

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd examples/ticket-dashboard
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

4. **Access the Dashboard**
   Open your browser to `http://localhost:3002`

### Docker Deployment

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use Docker Compose for full stack
docker-compose up -d
```

## Dashboard Interface

### Main Dashboard
- **Overview Cards**: Key metrics at a glance
- **Ticket Grid**: Filterable and sortable ticket list
- **SLA Status**: Visual SLA compliance indicators
- **Performance Charts**: Real-time performance visualizations
- **Alert Panel**: Active alerts and notifications

### Real-time Features
- **Live Updates**: Automatic refresh of ticket data
- **Push Notifications**: Browser notifications for critical events
- **WebSocket Status**: Connection health indicator
- **Auto-refresh Toggle**: User-controlled refresh settings

## API Reference

### Dashboard Metrics
```http
GET /api/dashboard/metrics

Response:
{
  "success": true,
  "data": {
    "overview": {
      "totalTickets": 1250,
      "openTickets": 87,
      "newTickets": 12,
      "slaComplianceRate": 94.2
    },
    "priority": {
      "critical": 3,
      "high": 15,
      "medium": 42,
      "low": 27
    },
    "queues": [...],
    "resources": [...],
    "trends": {...}
  }
}
```

### Get Tickets with Filtering
```http
GET /api/dashboard/tickets?priorities=1,2&showClosed=false&page=1&pageSize=50

Query Parameters:
- priorities: Comma-separated priority IDs (1=Critical, 2=High, etc.)
- statuses: Comma-separated status IDs
- queues: Comma-separated queue IDs  
- resources: Comma-separated resource IDs
- companies: Comma-separated company IDs
- searchText: Text search in title/description
- showClosed: Include closed tickets (default: false)
- page: Page number (default: 1)
- pageSize: Items per page (default: 50, max: 100)
```

### SLA Violations
```http
GET /api/dashboard/sla/violations

Response:
{
  "success": true,
  "data": {
    "atRisk": [
      {
        "id": 12345,
        "title": "Critical server issue",
        "priority": 1,
        "responseTimeRemaining": 15,
        "resolutionTimeRemaining": 180
      }
    ],
    "breached": [...]
  }
}
```

### Update Ticket
```http
PATCH /api/dashboard/tickets/12345
Content-Type: application/json

{
  "Status": 2,
  "AssignedResourceID": 67,
  "Priority": 1
}
```

### Alerts Management
```http
# Get active alerts
GET /api/dashboard/alerts

# Acknowledge alert
POST /api/dashboard/alerts/{alertId}/acknowledge
{
  "acknowledgedBy": "John Doe"
}

# Resolve alert
POST /api/dashboard/alerts/{alertId}/resolve
{
  "resolvedBy": "Jane Smith"
}
```

## WebSocket Events

### Client to Server Events

```javascript
// Register user
socket.emit('register', {
  name: 'John Doe',
  email: 'john@company.com',
  role: 'manager'
});

// Subscribe to updates
socket.emit('subscribe', ['metrics', 'alerts', 'ticket-updates']);

// Update ticket
socket.emit('updateTicket', {
  ticketId: 12345,
  updates: { Status: 2 }
});

// Acknowledge alert
socket.emit('acknowledgeAlert', {
  alertId: 'alert_123',
  acknowledgedBy: 'John Doe'
});
```

### Server to Client Events

```javascript
// Initial data on connection
socket.on('initialData', (data) => {
  console.log('Metrics:', data.metrics);
  console.log('Alerts:', data.alerts);
});

// Real-time updates
socket.on('message', (message) => {
  switch(message.type) {
    case 'ticket_update':
      updateTicketInUI(message.data);
      break;
    case 'alert':
      showAlert(message.data);
      break;
    case 'metrics_update':
      updateDashboardMetrics(message.data);
      break;
  }
});

// System status updates
socket.on('systemStatus', (status) => {
  updateSystemHealthIndicator(status);
});
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Application port | 3002 |
| `AUTOTASK_USERNAME` | Autotask API username | Required |
| `AUTOTASK_SECRET` | Autotask API secret | Required |
| `AUTOTASK_INTEGRATION_CODE` | Integration code | Required |
| `API_KEY` | API authentication key | Required in production |
| `LOG_LEVEL` | Logging level | info |
| `REDIS_HOST` | Redis host for caching | localhost |
| `CORS_ORIGINS` | Allowed CORS origins | * |

### SLA Configuration

Default SLA targets can be customized:

```javascript
// Response time targets (hours)
const responseTargets = {
  1: 1,  // Critical: 1 hour
  2: 4,  // High: 4 hours
  3: 8,  // Medium: 8 hours
  4: 24  // Low: 24 hours
};

// Resolution time targets (hours)
const resolutionTargets = {
  1: 4,   // Critical: 4 hours
  2: 8,   // High: 8 hours
  3: 24,  // Medium: 24 hours
  4: 72   // Low: 72 hours
};
```

### Escalation Rules

```javascript
const escalationRule = {
  name: 'Critical Ticket Response Escalation',
  priority: [1], // Critical only
  conditions: [{
    type: 'response_overdue',
    value: 30 // 30 minutes
  }],
  actions: [{
    type: 'notify',
    parameters: {
      emailAddress: 'manager@company.com'
    }
  }]
};
```

## Customization

### Dashboard Themes
- Light and dark theme support
- Customizable color schemes
- Responsive design for mobile devices
- Accessibility compliance (WCAG 2.1)

### Role-based Access
- **Admin**: Full dashboard access and configuration
- **Manager**: Team oversight and escalation management
- **Technician**: Assigned ticket focus and updates
- **Viewer**: Read-only dashboard access

### Custom Widgets
Add custom dashboard widgets:

```javascript
const customWidget = {
  id: 'customer-satisfaction',
  title: 'Customer Satisfaction',
  type: 'chart',
  dataSource: '/api/dashboard/satisfaction',
  refreshInterval: 300 // 5 minutes
};
```

## Performance Optimization

### Caching Strategy
- Redis caching for frequently accessed data
- Client-side caching for static resources
- WebSocket message compression
- Database query optimization

### Scaling Considerations
- Horizontal scaling with load balancers
- Database read replicas for reporting
- CDN integration for static assets
- WebSocket scaling with Redis adapter

## Monitoring & Observability

### Application Metrics
- Response time monitoring
- Error rate tracking
- WebSocket connection health
- Database performance metrics

### Business Metrics
- SLA compliance rates
- Ticket resolution times
- Customer satisfaction scores
- Resource utilization rates

### Alerting
- Performance degradation alerts
- SLA breach notifications
- System health alerts
- Custom business rule alerts

## Development

### Project Structure
```
src/
├── controllers/     # REST API controllers
├── services/        # Business logic services
├── websocket/       # WebSocket server
├── types/          # TypeScript definitions
└── middleware/     # Custom middleware

public/             # Dashboard UI assets
config/             # Configuration files
tests/              # Test suites
docs/               # Additional documentation
```

### Adding Custom Features

1. **Create Service**
   ```typescript
   export class CustomService {
     async getCustomData(): Promise<any> {
       // Implementation
     }
   }
   ```

2. **Add Controller**
   ```typescript
   export class CustomController {
     getCustomData = asyncHandler(async (req, res) => {
       const data = await this.customService.getCustomData();
       return sendSuccess(res, data);
     });
   }
   ```

3. **Register Route**
   ```typescript
   apiRouter.get('/custom/data', controller.getCustomData);
   ```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run in watch mode
npm run test:watch
```

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] Redis server configured
- [ ] Monitoring setup (APM, logs)
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] CDN setup for assets

### Docker Compose Production
```yaml
version: '3.8'
services:
  dashboard:
    image: autotask-ticket-dashboard:latest
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - dashboard
    restart: unless-stopped

volumes:
  redis_data:
```

## Security

### Authentication & Authorization
- API key authentication for production
- Role-based access control (RBAC)
- JWT session management
- IP whitelisting support

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers
- CSRF protection
- Rate limiting

### Network Security
- HTTPS enforcement
- Secure WebSocket connections (WSS)
- CORS configuration
- Security headers (CSP, HSTS, etc.)

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check firewall settings
   - Verify CORS configuration
   - Ensure WebSocket transport is enabled

2. **High Memory Usage**
   - Check for memory leaks in WebSocket connections
   - Review ticket cache size limits
   - Monitor Redis memory usage

3. **SLA Calculation Errors**
   - Verify system timezone settings
   - Check business hours configuration
   - Review escalation rule logic

### Debug Mode
```bash
# Enable debug logging
DEBUG=dashboard:* npm run dev

# WebSocket debugging
DEBUG=socket.io:* npm run dev

# Full debug output
DEBUG=* npm run dev
```

### Performance Tuning
```bash
# Monitor WebSocket connections
curl http://localhost:3002/health

# Check metrics endpoint performance
time curl http://localhost:3002/api/dashboard/metrics

# Monitor memory usage
node --inspect src/index.ts
```

## Support

- **Documentation**: Complete API documentation available at `/docs`
- **Examples**: Sample implementations in `/examples` directory
- **Community**: Join the Autotask developer community
- **Issues**: Report bugs via GitHub issues

## License

MIT License - see LICENSE file for details.