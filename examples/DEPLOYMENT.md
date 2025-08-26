# Deployment Guide for Autotask Example Applications

This guide provides comprehensive deployment instructions for all Autotask example applications across different environments and platforms.

## 🚀 Quick Start Deployment

### Local Development

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd autotask-node/examples
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d

   # Start with monitoring
   docker-compose --profile monitoring up -d

   # Start with development tools
   docker-compose --profile development up -d
   ```

3. **Access Applications**
   - Customer Onboarding: http://localhost:3001
   - Ticket Dashboard: http://localhost:3002
   - Grafana (monitoring): http://localhost:3000
   - pgAdmin (database): http://localhost:5050

### Individual Application Deployment

Each application can be deployed independently:

```bash
cd examples/{application-name}
npm install
cp .env.example .env
# Configure .env
npm run dev  # Development
npm run build && npm start  # Production
```

## 🏗️ Production Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- SSL certificates (for HTTPS)
- Load balancer (for high availability)

### Environment Configuration

Create production environment files:

```bash
# Production environment
cp .env.example .env.production

# Edit production values
nano .env.production
```

Key production settings:
```bash
NODE_ENV=production
API_KEY=your-secure-production-api-key
DATABASE_URL=postgresql://user:pass@prod-db:5432/autotask
REDIS_URL=redis://prod-redis:6379
SSL_ENABLED=true
CORS_ORIGINS=https://yourdomain.com
```

### Docker Production Deployment

1. **Build Production Images**
   ```bash
   # Build all images
   docker-compose -f docker-compose.prod.yml build

   # Or build specific application
   cd customer-onboarding
   docker build -t autotask-onboarding:prod .
   ```

2. **Deploy with Production Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Health Check and Monitoring**
   ```bash
   # Check application health
   curl https://yourdomain.com/health

   # View logs
   docker-compose logs -f customer-onboarding
   ```

### Kubernetes Deployment

1. **Create Kubernetes Manifests**
   ```yaml
   # customer-onboarding-deployment.yaml
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
         - name: app
           image: autotask-onboarding:latest
           ports:
           - containerPort: 3001
           env:
           - name: AUTOTASK_USERNAME
             valueFrom:
               secretKeyRef:
                 name: autotask-secrets
                 key: username
           - name: AUTOTASK_SECRET
             valueFrom:
               secretKeyRef:
                 name: autotask-secrets
                 key: secret
           - name: DATABASE_URL
             valueFrom:
               secretKeyRef:
                 name: db-secrets
                 key: url
           livenessProbe:
             httpGet:
               path: /health
               port: 3001
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /health
               port: 3001
             initialDelaySeconds: 5
             periodSeconds: 5
   ```

2. **Deploy to Kubernetes**
   ```bash
   # Create secrets
   kubectl create secret generic autotask-secrets \
     --from-literal=username=$AUTOTASK_USERNAME \
     --from-literal=secret=$AUTOTASK_SECRET \
     --from-literal=integration-code=$AUTOTASK_INTEGRATION_CODE

   kubectl create secret generic db-secrets \
     --from-literal=url=$DATABASE_URL

   # Deploy application
   kubectl apply -f k8s/
   ```

3. **Create Services and Ingress**
   ```yaml
   # service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: customer-onboarding-service
   spec:
     selector:
       app: customer-onboarding
     ports:
     - protocol: TCP
       port: 80
       targetPort: 3001

   ---
   # ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: autotask-ingress
     annotations:
       cert-manager.io/cluster-issuer: letsencrypt-prod
   spec:
     tls:
     - hosts:
       - onboarding.yourdomain.com
       secretName: onboarding-tls
     rules:
     - host: onboarding.yourdomain.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: customer-onboarding-service
               port:
                 number: 80
   ```

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### ECS (Elastic Container Service)

1. **Create Task Definition**
   ```json
   {
     "family": "autotask-onboarding",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "onboarding",
         "image": "your-account.dkr.ecr.region.amazonaws.com/autotask-onboarding:latest",
         "portMappings": [
           {
             "containerPort": 3001,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "AUTOTASK_USERNAME",
             "valueFrom": "arn:aws:ssm:region:account:parameter/autotask/username"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/autotask-onboarding",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

2. **Deploy with CDK/CloudFormation**
   ```typescript
   import * as ecs from '@aws-cdk/aws-ecs';
   import * as ec2 from '@aws-cdk/aws-ec2';

   const cluster = new ecs.Cluster(this, 'AutotaskCluster');
   
   const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
     memoryLimitMiB: 1024,
     cpu: 512,
   });

   const container = taskDefinition.addContainer('onboarding', {
     image: ecs.ContainerImage.fromRegistry('your-image'),
     environment: {
       NODE_ENV: 'production',
     },
     secrets: {
       AUTOTASK_USERNAME: ecs.Secret.fromSsmParameter(autotaskUsername),
     },
   });

   container.addPortMappings({
     containerPort: 3001,
   });

   new ecs.FargateService(this, 'Service', {
     cluster,
     taskDefinition,
     desiredCount: 2,
   });
   ```

#### Lambda Deployment (Serverless)

1. **Serverless Framework Configuration**
   ```yaml
   # serverless.yml
   service: autotask-examples

   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       NODE_ENV: production
       AUTOTASK_USERNAME: ${ssm:/autotask/username}
       AUTOTASK_SECRET: ${ssm:/autotask/secret}

   functions:
     onboarding:
       handler: dist/lambda.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
             cors: true
       timeout: 30
       memorySize: 1024

   plugins:
     - serverless-offline
     - serverless-webpack
   ```

### Azure Deployment

#### Container Instances

```bash
# Create resource group
az group create --name autotask-rg --location eastus

# Deploy container
az container create \
  --resource-group autotask-rg \
  --name onboarding-app \
  --image your-registry/autotask-onboarding:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3001 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables \
    AUTOTASK_USERNAME=$AUTOTASK_USERNAME \
    AUTOTASK_SECRET=$AUTOTASK_SECRET \
  --dns-name-label onboarding-app
```

#### App Service

```bash
# Create App Service plan
az appservice plan create \
  --name autotask-plan \
  --resource-group autotask-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group autotask-rg \
  --plan autotask-plan \
  --name autotask-onboarding \
  --deployment-container-image-name your-registry/autotask-onboarding:latest

# Configure app settings
az webapp config appsettings set \
  --resource-group autotask-rg \
  --name autotask-onboarding \
  --settings \
    NODE_ENV=production \
    AUTOTASK_USERNAME=$AUTOTASK_USERNAME \
    AUTOTASK_SECRET=$AUTOTASK_SECRET
```

### Google Cloud Platform

#### Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy autotask-onboarding \
  --image gcr.io/your-project/autotask-onboarding:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets AUTOTASK_USERNAME=autotask-username:latest,AUTOTASK_SECRET=autotask-secret:latest \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 80 \
  --max-instances 10
```

#### GKE (Google Kubernetes Engine)

```bash
# Create GKE cluster
gcloud container clusters create autotask-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials autotask-cluster --zone us-central1-a

# Deploy using kubectl
kubectl apply -f k8s/
```

## 🔧 Infrastructure as Code

### Terraform Configuration

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "autotask-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier = "autotask-db"
  
  engine         = "postgres"
  engine_version = "13.7"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "07:00-09:00"
  maintenance_window     = "Sun:09:00-Sun:11:00"
  
  skip_final_snapshot = true
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "autotask-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "autotask-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "autotask-cluster"
  
  capacity_providers = ["FARGATE"]
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
  }
}

# Load Balancer
resource "aws_lb" "main" {
  name               = "autotask-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = false
}
```

### Ansible Playbook

```yaml
# deploy.yml
---
- name: Deploy Autotask Applications
  hosts: production
  become: yes
  vars:
    app_version: "{{ lookup('env', 'APP_VERSION') | default('latest') }}"
    
  tasks:
    - name: Install Docker
      apt:
        name: docker.io
        state: present
        
    - name: Install Docker Compose
      pip:
        name: docker-compose
        
    - name: Create application directory
      file:
        path: /opt/autotask
        state: directory
        mode: '0755'
        
    - name: Copy Docker Compose file
      template:
        src: docker-compose.prod.yml.j2
        dest: /opt/autotask/docker-compose.yml
        
    - name: Copy environment file
      template:
        src: .env.prod.j2
        dest: /opt/autotask/.env
        mode: '0600'
        
    - name: Pull latest images
      docker_compose:
        project_src: /opt/autotask
        pull: yes
        
    - name: Start services
      docker_compose:
        project_src: /opt/autotask
        state: present
        recreate: smart
```

## 📊 Monitoring and Observability

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'customer-onboarding'
    static_configs:
      - targets: ['customer-onboarding:3001']
    metrics_path: '/metrics'
    
  - job_name: 'ticket-dashboard'
    static_configs:
      - targets: ['ticket-dashboard:3002']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Autotask Applications",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Let's Encrypt with Certbot**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx

   # Obtain certificate
   sudo certbot --nginx -d yourdomain.com

   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Nginx SSL Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
       ssl_prefer_server_ciphers off;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

### Firewall Configuration

```bash
# UFW (Ubuntu Firewall)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp  # Block direct access to apps
sudo ufw deny 3002/tcp
```

### Secret Management

1. **AWS Secrets Manager**
   ```typescript
   import { SecretsManager } from 'aws-sdk';
   
   const secretsManager = new SecretsManager();
   
   async function getSecret(secretName: string) {
     const result = await secretsManager.getSecretValue({
       SecretId: secretName
     }).promise();
     
     return JSON.parse(result.SecretString!);
   }
   ```

2. **HashiCorp Vault**
   ```bash
   # Store secrets
   vault kv put secret/autotask \
     username="your_username" \
     secret="your_secret"
   
   # Retrieve in application
   vault kv get -field=username secret/autotask
   ```

## 🚨 Backup and Disaster Recovery

### Database Backup

```bash
# Automated PostgreSQL backup
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE="autotask_examples"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U postgres $DATABASE | \
  gzip > $BACKUP_DIR/backup_${DATABASE}_${DATE}.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_${DATABASE}_*.sql.gz" -mtime +7 -delete
```

### Application State Backup

```bash
# Docker volumes backup
docker run --rm -v autotask_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data

docker run --rm -v autotask_redis_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/redis_backup_$(date +%Y%m%d).tar.gz /data
```

### Disaster Recovery Plan

1. **Recovery Time Objective (RTO)**: 4 hours
2. **Recovery Point Objective (RPO)**: 1 hour
3. **Backup Frequency**: 
   - Database: Every 6 hours
   - Application state: Daily
   - Configuration: On change

## 📈 Performance Optimization

### Caching Strategy

```yaml
# Redis cache configuration
redis:
  cache:
    ttl: 300  # 5 minutes
    maxMemory: 256mb
    evictionPolicy: allkeys-lru
  
  sessions:
    ttl: 1800  # 30 minutes
    keyPrefix: "sess:"
    
  queues:
    defaultJobOptions:
      removeOnComplete: 10
      removeOnFail: 5
      attempts: 3
```

### Database Optimization

```sql
-- Database indexes for performance
CREATE INDEX CONCURRENTLY idx_tickets_company_status 
ON tickets(company_id, status) WHERE status != 5;

CREATE INDEX CONCURRENTLY idx_tickets_assigned_created 
ON tickets(assigned_resource_id, created_date_time);

CREATE INDEX CONCURRENTLY idx_time_entries_ticket_date 
ON time_entries(ticket_id, date_worked);
```

### Load Balancing

```nginx
upstream autotask_onboarding {
    least_conn;
    server onboarding1:3001 max_fails=3 fail_timeout=30s;
    server onboarding2:3001 max_fails=3 fail_timeout=30s;
    server onboarding3:3001 max_fails=3 fail_timeout=30s;
}

server {
    location / {
        proxy_pass http://autotask_onboarding;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🧪 Testing in Production

### Health Checks

```bash
# Application health check
curl -f http://localhost:3001/health || exit 1

# Database connectivity check
pg_isready -h localhost -p 5432 -U postgres || exit 1

# Redis connectivity check
redis-cli ping || exit 1
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/onboarding/metrics

# Using wrk
wrk -t12 -c400 -d30s --latency http://localhost:3001/

# Using k6
k6 run --vus 50 --duration 30s load-test.js
```

### Smoke Tests

```bash
#!/bin/bash
# Post-deployment smoke tests

echo "Running smoke tests..."

# Test health endpoints
curl -f http://localhost:3001/health
curl -f http://localhost:3002/health

# Test authentication
curl -H "X-API-Key: $API_KEY" http://localhost:3001/api/onboarding/metrics

# Test database connectivity
psql $DATABASE_URL -c "SELECT 1"

echo "Smoke tests completed successfully"
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Build and push Docker image
        run: |
          docker build -t autotask-onboarding:${{ github.sha }} .
          docker tag autotask-onboarding:${{ github.sha }} \
            ${{ secrets.ECR_REGISTRY }}/autotask-onboarding:latest
          docker push ${{ secrets.ECR_REGISTRY }}/autotask-onboarding:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster autotask-cluster \
            --service autotask-onboarding \
            --force-new-deployment
```

## 📋 Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] SSL certificates installed and valid
- [ ] Database migrations tested
- [ ] Backup systems verified
- [ ] Monitoring configured
- [ ] Load balancer configured
- [ ] DNS records updated
- [ ] Security groups configured
- [ ] Health checks working
- [ ] Logging configured

### Post-deployment

- [ ] Applications responding to health checks
- [ ] Database connectivity verified
- [ ] Cache functionality working
- [ ] WebSocket connections stable (for dashboard)
- [ ] Email notifications working
- [ ] Background jobs processing
- [ ] Metrics collection active
- [ ] Alerts configured and working
- [ ] Performance within acceptable limits
- [ ] Security scans passed

### Rollback Plan

1. **Immediate Rollback**
   ```bash
   # Docker rollback
   docker-compose down
   docker-compose -f docker-compose.previous.yml up -d
   
   # Kubernetes rollback
   kubectl rollout undo deployment/autotask-onboarding
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   pg_restore -h localhost -U postgres -d autotask_examples \
     /backups/postgres/backup_autotask_examples_20231201.sql.gz
   ```

3. **Traffic Rerouting**
   ```bash
   # Update load balancer to previous version
   aws elbv2 modify-target-group --target-group-arn <arn> \
     --health-check-path /health-old
   ```

This deployment guide provides comprehensive coverage for deploying Autotask example applications across various environments and platforms, ensuring reliable, scalable, and secure deployments.