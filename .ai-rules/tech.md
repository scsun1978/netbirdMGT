# NetBird Web Management Platform - Technology Stack

## 🏗️ Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   NetBird API   │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   PostgreSQL    │              │
         └──────────────►│   (Business)    │◄─────────────┘
                        └─────────────────┘
                        ┌─────────────────┐
                        │     Redis       │
                        │   (Cache/State) │
                        └─────────────────┘
```

## 🎯 Frontend Technology Stack

### Core Framework
- **Next.js 14+**: App Router with Server Components
- **TypeScript 5+**: Strict mode with comprehensive type safety
- **React 18+**: Concurrent features and Suspense

### UI & Styling
- **TailwindCSS 3+**: Utility-first CSS framework
- **shadcn/ui**: Component library with Radix UI primitives
- **Lucide React**: Icon library
- **Framer Motion**: Animation library for micro-interactions

### State Management
- **TanStack Query (React Query)**: Server state management and caching
- **Zustand**: Client state management for UI state
- **React Hook Form**: Form state management with Zod validation

### Data Visualization
- **React Flow**: Network topology visualization
- **ECharts**: Trending charts and analytics
- **Recharts**: Complementary charting library

### Development Tools
- **ESLint**: Code linting with Next.js and TypeScript configs
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit quality checks
- **Lint-staged**: Run linters on staged files

### Testing
- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking for testing

## 🔧 Backend Technology Stack

### Core Framework
- **Node.js 20+**: LTS runtime with security updates
- **NestJS 10+**: Progressive Node.js framework
- **TypeScript 5+**: Full-stack type safety

### API & Communication
- **Express**: HTTP server framework (NestJS foundation)
- **Fastify**: Alternative high-performance HTTP server
- **Socket.io**: Real-time WebSocket connections
- **Axios**: HTTP client for NetBird API communication

### Database & ORM
- **PostgreSQL 15+**: Primary database for business data
- **Prisma**: Type-safe database ORM and query builder
- **Redis 7+**: Caching, session storage, and real-time state

### Authentication & Security
- **Passport.js**: Authentication middleware
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing

### Monitoring & Logging
- **Winston**: Structured logging
- **Morgan**: HTTP request logging
- **Prometheus**: Metrics collection
- **Grafana**: Visualization (optional)

### Background Jobs
- **Bull Queue**: Redis-based job queue
- **node-cron**: Scheduled task execution

## 🗄️ Database Architecture

### PostgreSQL Schema Design
```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- NetBird Integration
CREATE TABLE netbird_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    domain VARCHAR(255) NOT NULL,
    api_token_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerting System
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_json JSONB NOT NULL,
    severity alert_severity NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES alert_rules(id),
    status alert_status NOT NULL DEFAULT 'open',
    message TEXT NOT NULL,
    details_json JSONB,
    triggered_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id)
);

-- Audit Logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details_json JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Caching and Performance
CREATE TABLE cached_data (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Data Structures
```typescript
// Session Management
user:session:{userId} -> {sessionId, lastActivity, permissions}

// Real-time State
netbird:peers -> Set<PeerData>
netbird:status -> {lastUpdate, onlineCount, offlineCount}

// Alerting
alerts:active -> Set<alertId>
alerts:rules:{ruleId} -> {lastTriggered, count}

// API Caching
cache:api:{endpoint}:{params} -> {data, expiresAt}
```

## 🔌 API Design

### Backend API Endpoints
```typescript
// Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/profile

// NetBird Integration
GET    /api/netbird/account
GET    /api/netbird/peers
GET    /api/netbird/users
GET    /api/netbird/groups
GET    /api/netbird/policies
GET    /api/netbird/events

// Alerting
GET    /api/alerts/rules
POST   /api/alerts/rules
PUT    /api/alerts/rules/:id
DELETE /api/alerts/rules/:id
GET    /api/alerts
POST   /api/alerts/:id/acknowledge
POST   /api/alerts/:id/resolve

// Dashboard
GET    /api/dashboard/overview
GET    /api/dashboard/metrics
GET    /api/dashboard/trends

// Audit
GET    /api/audit/logs
GET    /api/audit/summary
```

### Frontend API Client
```typescript
// NetBird API Client (Backend)
class NetBirdClient {
  async getPeers(): Promise<Peer[]>
  async getUsers(): Promise<User[]>
  async getGroups(): Promise<Group[]>
  // ... other methods
}

// Internal API Client (Frontend)
class ApiClient {
  async getAlerts(): Promise<Alert[]>
  async createAlertRule(rule: CreateAlertRule): Promise<AlertRule>
  // ... other methods
}
```

## 🐳 Container Architecture

### Docker Compose Services
```yaml
services:
  # Frontend
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001

  # Backend
  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/netbirdmgt
      - REDIS_URL=redis://redis:6379
      - NETBIRD_API_URL=https://netbird.scsun.qzz.io
      - NETBIRD_API_TOKEN=${NETBIRD_API_TOKEN}

  # PostgreSQL
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=netbirdmgt
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes: ["postgres_data:/var/lib/postgresql/data"]

  # Redis
  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]

  # Nginx (Production)
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
```

## 🔒 Security Architecture

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant N as NetBird API

    U->>F: Login Request
    F->>B: POST /api/auth/login
    B->>B: Validate Credentials
    B->>B: Generate JWT
    B->>F: JWT Token
    F->>F: Store Token (Secure)
    
    Note over F,B: Subsequent API Calls
    F->>B: API Request + JWT
    B->>B: Validate JWT
    B->>N: NetBird API Call
    N->>B: Response
    B->>F: Processed Response
```

### Security Layers
1. **Network Security**: HTTPS, TLS 1.3, HSTS
2. **Authentication**: JWT with refresh tokens
3. **Authorization**: Role-based access control (RBAC)
4. **Data Protection**: Encrypted sensitive data at rest
5. **API Security**: Rate limiting, CORS, input validation
6. **Audit Logging**: Complete action traceability

## 📊 Monitoring & Observability

### Application Metrics
- **Performance**: Response times, throughput, error rates
- **Business**: User activity, feature usage, alert effectiveness
- **Infrastructure**: CPU, memory, disk, network utilization

### Health Checks
```typescript
// Backend Health Endpoints
GET /api/health          // Basic health status
GET /api/health/detailed // Detailed system status
GET /api/health/netbird  // NetBird API connectivity
```

### Logging Strategy
- **Structured Logging**: JSON format with consistent fields
- **Log Levels**: Error, Warn, Info, Debug
- **Correlation IDs**: Request tracking across services
- **Sensitive Data**: Automatic redaction of secrets and PII

## 🚀 Deployment Architecture

### Environment Strategy
- **Development**: Local Docker Compose
- **Staging**: Cloud-hosted with production-like data
- **Production**: High-availability with load balancing

### CI/CD Pipeline
```yaml
# GitHub Actions Workflow
name: Build and Deploy
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install, test, lint]

  build:
    needs: test
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install, build, docker-build]

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps: [deploy-to-production]
```

## 🔄 Data Flow Architecture

### Real-time Data Updates
```typescript
// WebSocket Events
interface SocketEvents {
  'peer:status': { peerId: string; status: 'online' | 'offline' }
  'alert:triggered': { alert: Alert }
  'system:metrics': { metrics: SystemMetrics }
}

// Server-Sent Events (Alternative)
const eventSource = new EventSource('/api/events/stream')
eventSource.addEventListener('peer-update', (event) => {
  const peer = JSON.parse(event.data)
  updatePeerInState(peer)
})
```

### Caching Strategy
- **L1 Cache**: Frontend React Query cache (5min TTL)
- **L2 Cache**: Backend Redis cache (15min TTL)
- **L3 Cache**: Database query cache (1hr TTL)
- **Cache Invalidation**: Event-driven on NetBird changes