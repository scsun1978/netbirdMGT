# NetBird Web Management Platform - Technical Design

## 📋 Design Overview

**Feature**: netbird-management-platform  
**Version**: 1.0.0  
**Status**: Technical Design Phase  
**Created**: 2026-01-10  
**Based on**: requirements.md v1.0.0

## 🏗️ System Architecture

### High-Level Architecture Diagram
```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end
    
    subgraph "Frontend Layer"
        NEXT[Next.js App Router]
        REACT[React Components]
        STATE[TanStack Query + Zustand]
    end
    
    subgraph "Backend Layer"
        NEST[NestJS API Gateway]
        AUTH[Authentication Service]
        NETBIRD[NetBird Client Service]
        ALERTS[Alerting Engine]
        AUDIT[Audit Service]
        DASH[Dashboard Service]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end
    
    subgraph "External Services"
        NBAPI[NetBird API]
        EMAIL[Email Service]
        WEBHOOK[Webhook Service]
    end
    
    WEB --> NEXT
    MOBILE --> NEXT
    NEXT --> REACT
    REACT --> STATE
    STATE --> NEST
    
    NEST --> AUTH
    NEST --> NETBIRD
    NEST --> ALERTS
    NEST --> AUDIT
    NEST --> DASH
    
    NETBIRD --> NBAPI
    ALERTS --> EMAIL
    ALERTS --> WEBHOOK
    
    AUTH --> PG
    NETBIRD --> REDIS
    ALERTS --> PG
    AUDIT --> PG
    DASH --> REDIS
```

### Microservices Architecture
```mermaid
graph LR
    subgraph "API Gateway"
        GW[NestJS Gateway]
    end
    
    subgraph "Core Services"
        AUTH_SVC[Auth Service]
        NETBIRD_SVC[NetBird Service]
        ALERT_SVC[Alert Service]
        AUDIT_SVC[Audit Service]
        DASH_SVC[Dashboard Service]
    end
    
    subgraph "Data Services"
        USER_SVC[User Service]
        PEER_SVC[Peer Service]
        RULE_SVC[Rule Service]
        EVENT_SVC[Event Service]
    end
    
    GW --> AUTH_SVC
    GW --> NETBIRD_SVC
    GW --> ALERT_SVC
    GW --> AUDIT_SVC
    GW --> DASH_SVC
    
    AUTH_SVC --> USER_SVC
    NETBIRD_SVC --> PEER_SVC
    ALERT_SVC --> RULE_SVC
    ALERT_SVC --> EVENT_SVC
    AUDIT_SVC --> EVENT_SVC
    DASH_SVC --> PEER_SVC
```

## 🗄️ Database Design

### PostgreSQL Schema
```sql
-- Users and Authentication
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'network_admin', 'viewer');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved', 'suppressed');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    password_hash VARCHAR(255),
    netbird_user_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NetBird Account Integration
CREATE TABLE netbird_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    api_token_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert Rules Configuration
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_type VARCHAR(100) NOT NULL, -- 'peer_count', 'peer_offline', 'network_event'
    condition_config JSONB NOT NULL,
    severity alert_severity NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    notification_config JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert Instances
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
    status alert_status NOT NULL DEFAULT 'open',
    severity alert_severity NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    triggered_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_message TEXT,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolved_message TEXT,
    suppressed_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert Notifications
CREATE TABLE alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL, -- 'email', 'webhook', 'slack'
    channel_config JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_alert_rules_enabled ON alert_rules(is_enabled);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_system_metrics_name_timestamp ON system_metrics(metric_name, timestamp DESC);
```

### Redis Data Structures
```typescript
// Session Management
interface RedisSessionData {
  userId: string
  sessionId: string
  role: UserRole
  permissions: string[]
  lastActivity: number
  expiresAt: number
}

// NetBird Data Caching
interface NetBirdCacheData {
  peers: {
    data: NetBirdPeer[]
    lastUpdate: number
    ttl: number
  }
  users: {
    data: NetBirdUser[]
    lastUpdate: number
    ttl: number
  }
  groups: {
    data: NetBirdGroup[]
    lastUpdate: number
    ttl: number
  }
}

// Real-time State
interface RealTimeState {
  onlinePeers: Set<string>
  offlinePeers: Set<string>
  activeAlerts: Set<string>
  systemStatus: {
    lastSync: number
    apiStatus: 'healthy' | 'degraded' | 'down'
    errorCount: number
  }
}

// Alert Processing
interface AlertProcessingState {
  ruleStates: Map<string, {
    lastEvaluation: number
    lastTrigger: number
    triggerCount: number
    isSuppressed: boolean
    suppressedUntil: number
  }>
  activeAlerts: Map<string, Alert>
  alertQueue: string[] // Alert IDs for processing
}
```

## 🔌 API Design

### Backend API Specification
```typescript
// API Endpoints Structure
interface ApiEndpoints {
  // Authentication
  auth: {
    'POST /api/auth/login': LoginRequest => AuthResponse
    'POST /api/auth/logout': void => void
    'POST /api/auth/refresh': RefreshRequest => AuthResponse
    'GET /api/auth/profile': void => UserProfile
  }

  // NetBird Integration
  netbird: {
    'GET /api/netbird/account': void => NetBirdAccount
    'GET /api/netbird/peers': PeersQuery => NetBirdPeer[]
    'GET /api/netbird/users': void => NetBirdUser[]
    'GET /api/netbird/groups': void => NetBirdGroup[]
    'GET /api/netbird/policies': void => NetBirdPolicy[]
    'GET /api/netbird/events': EventsQuery => NetBirdEvent[]
    'GET /api/netbird/setup-keys': void => NetBirdSetupKey[]
    'GET /api/netbird/networks': void => NetBirdNetwork[]
  }

  // Alerting System
  alerts: {
    'GET /api/alerts/rules': AlertRulesQuery => AlertRule[]
    'POST /api/alerts/rules': CreateAlertRule => AlertRule
    'PUT /api/alerts/rules/:id': UpdateAlertRule => AlertRule
    'DELETE /api/alerts/rules/:id': void => void
    'GET /api/alerts': AlertsQuery => Alert[]
    'POST /api/alerts/:id/acknowledge': AcknowledgeAlert => Alert
    'POST /api/alerts/:id/resolve': ResolveAlert => Alert
    'POST /api/alerts/:id/suppress': SuppressAlert => Alert
    'GET /api/alerts/:id/history': void => AlertHistory[]
  }

  // Dashboard
  dashboard: {
    'GET /api/dashboard/overview': void => DashboardOverview
    'GET /api/dashboard/metrics': MetricsQuery => DashboardMetrics
    'GET /api/dashboard/trends': TrendsQuery => TrendData[]
    'GET /api/dashboard/topology': void => TopologyData
  }

  // Audit
  audit: {
    'GET /api/audit/logs': AuditQuery => AuditLog[]
    'GET /api/audit/summary': SummaryQuery => AuditSummary
    'GET /api/audit/export': ExportQuery => ExportResponse
  }

  // Users (Platform)
  users: {
    'GET /api/users': UsersQuery => PlatformUser[]
    'POST /api/users': CreateUser => PlatformUser
    'PUT /api/users/:id': UpdateUser => PlatformUser
    'DELETE /api/users/:id': void => void
  }
}

// Request/Response Types
interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

interface AuthResponse {
  user: UserProfile
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface NetBirdPeer {
  id: string
  name: string
  ip: string
  connectionIp: string
  location: {
    country: string
    city: string
  }
  status: 'online' | 'offline'
  lastSeen: string
  os: string
  version: string
  groups: string[]
  dnsEnabled: boolean
  firewallEnabled: boolean
}

interface CreateAlertRule {
  name: string
  description?: string
  conditionType: 'peer_count' | 'peer_offline' | 'network_event' | 'custom_metric'
  conditionConfig: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  notificationConfig: {
    email?: {
      enabled: boolean
      recipients: string[]
    }
    webhook?: {
      enabled: boolean
      url: string
      headers?: Record<string, string>
    }
    slack?: {
      enabled: boolean
      webhook: string
      channel: string
    }
  }
}

interface Alert {
  id: string
  ruleId: string
  ruleName: string
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  details: Record<string, any>
  triggeredAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  suppressedUntil?: string
}

interface DashboardOverview {
  totalPeers: number
  onlinePeers: number
  offlinePeers: number
  totalUsers: number
  activeUsers: number
  totalGroups: number
  totalPolicies: number
  recentAlerts: Alert[]
  systemHealth: {
    apiStatus: 'healthy' | 'degraded' | 'down'
    lastSync: string
    errorCount: number
  }
  networkTrends: {
    peerGrowth: number
    uptime: number
    alertRate: number
  }
}
```

### Frontend API Client
```typescript
// API Client Architecture
class ApiClient {
  private baseURL: string
  private wsURL: string
  private accessToken: string | null = null

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL
    this.wsURL = config.wsURL
  }

  // HTTP Client with interceptors
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new ApiError(response.status, await response.text())
    }

    return response.json()
  }

  // WebSocket Client for real-time updates
  public connectWebSocket(): WebSocket {
    const ws = new WebSocket(`${this.wsURL}/ws`)
    
    ws.onopen = () => {
      if (this.accessToken) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: this.accessToken
        }))
      }
    }

    return ws
  }

  // API Methods
  public auth = {
    login: (credentials: LoginRequest) =>
      this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    logout: () =>
      this.request('/api/auth/logout', { method: 'POST' }),
    
    refresh: (refreshToken: string) =>
      this.request<AuthResponse>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    
    profile: () =>
      this.request<UserProfile>('/api/auth/profile'),
  }

  public netbird = {
    getAccount: () =>
      this.request<NetBirdAccount>('/api/netbird/account'),
    
    getPeers: (query?: PeersQuery) =>
      this.request<NetBirdPeer[]>('/api/netbird/peers', {
        method: 'GET',
        body: JSON.stringify(query),
      }),
    
    getUsers: () =>
      this.request<NetBirdUser[]>('/api/netbird/users'),
    
    getGroups: () =>
      this.request<NetBirdGroup[]>('/api/netbird/groups'),
    
    getPolicies: () =>
      this.request<NetBirdPolicy[]>('/api/netbird/policies'),
    
    getEvents: (query?: EventsQuery) =>
      this.request<NetBirdEvent[]>('/api/netbird/events', {
        method: 'GET',
        body: JSON.stringify(query),
      }),
  }

  public alerts = {
    getRules: (query?: AlertRulesQuery) =>
      this.request<AlertRule[]>('/api/alerts/rules'),
    
    createRule: (rule: CreateAlertRule) =>
      this.request<AlertRule>('/api/alerts/rules', {
        method: 'POST',
        body: JSON.stringify(rule),
      }),
    
    updateRule: (id: string, rule: UpdateAlertRule) =>
      this.request<AlertRule>(`/api/alerts/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(rule),
      }),
    
    deleteRule: (id: string) =>
      this.request(`/api/alerts/rules/${id}`, { method: 'DELETE' }),
    
    getAlerts: (query?: AlertsQuery) =>
      this.request<Alert[]>('/api/alerts'),
    
    acknowledgeAlert: (id: string, message?: string) =>
      this.request<Alert>(`/api/alerts/${id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    
    resolveAlert: (id: string, message?: string) =>
      this.request<Alert>(`/api/alerts/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    
    suppressAlert: (id: string, until: string) =>
      this.request<Alert>(`/api/alerts/${id}/suppress`, {
        method: 'POST',
        body: JSON.stringify({ until }),
      }),
  }

  public dashboard = {
    getOverview: () =>
      this.request<DashboardOverview>('/api/dashboard/overview'),
    
    getMetrics: (query: MetricsQuery) =>
      this.request<DashboardMetrics>('/api/dashboard/metrics', {
        method: 'POST',
        body: JSON.stringify(query),
      }),
    
    getTrends: (query: TrendsQuery) =>
      this.request<TrendData[]>('/api/dashboard/trends', {
        method: 'POST',
        body: JSON.stringify(query),
      }),
    
    getTopology: () =>
      this.request<TopologyData>('/api/dashboard/topology'),
  }
}
```

## 🎨 Frontend Architecture

### Component Structure
```typescript
// Component Hierarchy
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── OverviewCards.tsx
│   │   │       ├── RecentAlerts.tsx
│   │   │       └── SystemHealth.tsx
│   │   ├── topology/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── TopologyCanvas.tsx
│   │   │       ├── PeerNode.tsx
│   │   │       └── TopologyControls.tsx
│   │   ├── peers/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── PeerList.tsx
│   │   │       ├── PeerCard.tsx
│   │   │       └── PeerFilters.tsx
│   │   ├── alerts/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── AlertList.tsx
│   │   │       ├── AlertCard.tsx
│   │   │       ├── AlertRules.tsx
│   │   │       └── AlertForm.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── charts/
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   └── features/
│       ├── auth/
│       ├── alerts/
│       ├── topology/
│       └── peers/
├── hooks/
│   ├── useAuth.ts
│   ├── useNetBird.ts
│   ├── useAlerts.ts
│   ├── useWebSocket.ts
│   └── useLocalStorage.ts
├── stores/
│   ├── authStore.ts
│   ├── uiStore.ts
│   ├── netBirdStore.ts
│   └── alertStore.ts
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── netbird.ts
│   │   └── alerts.ts
│   ├── auth/
│   │   ├── config.ts
│   │   └── utils.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── validations/
│       ├── auth.ts
│       ├── alerts.ts
│       └── netbird.ts
└── types/
    ├── api.ts
    ├── netbird.ts
    ├── alerts.ts
    └── dashboard.ts
```

### State Management Architecture
```typescript
// Zustand Store Structure
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
}

interface NetBirdState {
  peers: NetBirdPeer[]
  users: NetBirdUser[]
  groups: NetBirdGroup[]
  policies: NetBirdPolicy[]
  events: NetBirdEvent[]
  lastSync: Date | null
  isRealTimeEnabled: boolean
  syncData: () => Promise<void>
  enableRealTime: () => void
  disableRealTime: () => void
  updatePeerStatus: (peerId: string, status: 'online' | 'offline') => void
}

interface AlertState {
  rules: AlertRule[]
  alerts: Alert[]
  activeAlerts: Alert[]
  isLoading: boolean
  createRule: (rule: CreateAlertRule) => Promise<void>
  updateRule: (id: string, rule: UpdateAlertRule) => Promise<void>
  deleteRule: (id: string) => Promise<void>
  acknowledgeAlert: (id: string, message?: string) => Promise<void>
  resolveAlert: (id: string, message?: string) => Promise<void>
  suppressAlert: (id: string, until: Date) => Promise<void>
}

// TanStack Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

// Custom Hooks
const useNetBirdData = () => {
  return useQuery({
    queryKey: ['netbird', 'peers'],
    queryFn: () => apiClient.netbird.getPeers(),
    staleTime: 15 * 1000, // 15 seconds for real-time data
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  })
}

const useAlertRules = () => {
  return useQuery({
    queryKey: ['alerts', 'rules'],
    queryFn: () => apiClient.alerts.getRules(),
    staleTime: 5 * 60 * 1000, // 5 minutes for configuration data
  })
}

const useRealTimeAlerts = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const ws = apiClient.connectWebSocket()
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'alert_triggered':
          queryClient.setQueryData(['alerts'], (old: Alert[]) => [
            data.alert,
            ...(old || []).filter(a => a.id !== data.alert.id)
          ])
          break
        case 'alert_updated':
          queryClient.setQueryData(['alerts'], (old: Alert[]) =>
            (old || []).map(a => a.id === data.alert.id ? data.alert : a)
          )
          break
        case 'peer_status_changed':
          queryClient.setQueryData(['netbird', 'peers'], (old: NetBirdPeer[]) =>
            (old || []).map(p => p.id === data.peerId ? { ...p, status: data.status } : p)
          )
          break
      }
    }
    
    return () => ws.close()
  }, [queryClient])
  
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.alerts.getAlerts(),
    staleTime: 0, // Always fresh for real-time data
  })
}
```

## 🔧 Backend Architecture

### NestJS Module Structure
```typescript
// Core Module Configuration
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, netbirdConfig],
    }),
    
    // Database
    DatabaseModule,
    
    // Authentication
    AuthModule,
    
    // Core Services
    NetBirdModule,
    AlertsModule,
    AuditModule,
    DashboardModule,
    
    // API Documentation
    SwaggerModule,
  ],
  controllers: [AppController],
  providers: [
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

// NetBird Service Implementation
@Injectable()
export class NetBirdService {
  private readonly client: NetBirdClient
  private readonly cache: RedisService
  private readonly logger = new Logger(NetBirdService.name)

  constructor(
    @Inject('NETBIRD_CLIENT') client: NetBirdClient,
    private readonly redisService: RedisService,
  ) {
    this.client = client
  }

  async getPeers(forceRefresh = false): Promise<NetBirdPeer[]> {
    const cacheKey = 'netbird:peers'
    
    if (!forceRefresh) {
      const cached = await this.redisService.get<NetBirdPeer[]>(cacheKey)
      if (cached) {
        this.logger.debug('Returning cached peers data')
        return cached
      }
    }

    try {
      const peers = await this.client.getPeers()
      
      // Cache for 30 seconds
      await this.redisService.set(cacheKey, peers, { ttl: 30 })
      
      // Update real-time state
      await this.updateRealTimeState(peers)
      
      return peers
    } catch (error) {
      this.logger.error('Failed to fetch peers from NetBird API', error)
      throw new ServiceUnavailableException('NetBird API unavailable')
    }
  }

  async syncAllData(): Promise<void> {
    const promises = [
      this.getPeers(true),
      this.getUsers(true),
      this.getGroups(true),
      this.getPolicies(true),
      this.getEvents(true),
    ]

    try {
      await Promise.all(promises)
      this.logger.log('Successfully synced all NetBird data')
    } catch (error) {
      this.logger.error('Failed to sync NetBird data', error)
      throw error
    }
  }

  private async updateRealTimeState(peers: NetBirdPeer[]): Promise<void> {
    const onlinePeers = peers.filter(p => p.status === 'online').map(p => p.id)
    const offlinePeers = peers.filter(p => p.status === 'offline').map(p => p.id)

    await Promise.all([
      this.redisService.sadd('netbird:online_peers', ...onlinePeers),
      this.redisService.sadd('netbird:offline_peers', ...offlinePeers),
      this.redisService.set('netbird:last_sync', new Date().toISOString()),
    ])
  }
}

// Alerting Engine Implementation
@Injectable()
export class AlertEngineService {
  private readonly logger = new Logger(AlertEngineService.name)
  private readonly ruleStates = new Map<string, RuleState>()

  constructor(
    private readonly alertsService: AlertsService,
    private readonly notificationService: NotificationService,
    private readonly netBirdService: NetBirdService,
  ) {}

  async evaluateRules(): Promise<void> {
    const rules = await this.alertsService.getActiveRules()
    
    for (const rule of rules) {
      try {
        await this.evaluateRule(rule)
      } catch (error) {
        this.logger.error(`Failed to evaluate rule ${rule.id}`, error)
      }
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<void> {
    const ruleState = this.getRuleState(rule.id)
    const now = Date.now()

    // Check if rule is suppressed
    if (ruleState.isSuppressed && now < ruleState.suppressedUntil) {
      return
    }

    // Reset suppression if expired
    if (ruleState.isSuppressed && now >= ruleState.suppressedUntil) {
      ruleState.isSuppressed = false
      ruleState.suppressedUntil = 0
    }

    const isTriggered = await this.checkCondition(rule)
    
    if (isTriggered && !ruleState.isTriggered) {
      // Rule just triggered
      await this.triggerAlert(rule)
      ruleState.isTriggered = true
      ruleState.lastTrigger = now
      ruleState.triggerCount++
    } else if (!isTriggered && ruleState.isTriggered) {
      // Rule just recovered
      ruleState.isTriggered = false
    }

    ruleState.lastEvaluation = now
  }

  private async checkCondition(rule: AlertRule): Promise<boolean> {
    switch (rule.conditionType) {
      case 'peer_count':
        return await this.checkPeerCountCondition(rule)
      case 'peer_offline':
        return await this.checkPeerOfflineCondition(rule)
      case 'network_event':
        return await this.checkNetworkEventCondition(rule)
      default:
        return false
    }
  }

  private async checkPeerCountCondition(rule: AlertRule): Promise<boolean> {
    const peers = await this.netBirdService.getPeers()
    const { operator, threshold } = rule.conditionConfig
    
    switch (operator) {
      case 'greater_than':
        return peers.length > threshold
      case 'less_than':
        return peers.length < threshold
      case 'equals':
        return peers.length === threshold
      default:
        return false
    }
  }

  private async checkPeerOfflineCondition(rule: AlertRule): Promise<boolean> {
    const peers = await this.netBirdService.getPeers()
    const offlinePeers = peers.filter(p => p.status === 'offline')
    const { threshold, duration } = rule.conditionConfig
    
    // Check peers offline for longer than duration
    const longOfflinePeers = offlinePeers.filter(peer => {
      const lastSeen = new Date(peer.lastSeen).getTime()
      const now = Date.now()
      return (now - lastSeen) > (duration * 60 * 1000) // duration in minutes
    })

    return longOfflinePeers.length >= threshold
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alert = await this.alertsService.createAlert({
      ruleId: rule.id,
      title: `Alert: ${rule.name}`,
      message: this.generateAlertMessage(rule),
      severity: rule.severity,
      details: await this.generateAlertDetails(rule),
    })

    // Send notifications
    await this.notificationService.sendNotifications(alert, rule.notificationConfig)
    
    this.logger.log(`Triggered alert for rule ${rule.id}: ${alert.id}`)
  }

  private getRuleState(ruleId: string): RuleState {
    if (!this.ruleStates.has(ruleId)) {
      this.ruleStates.set(ruleId, {
        lastEvaluation: 0,
        lastTrigger: 0,
        triggerCount: 0,
        isTriggered: false,
        isSuppressed: false,
        suppressedUntil: 0,
      })
    }
    return this.ruleStates.get(ruleId)!
  }
}
```

## 🔒 Security Architecture

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant NB as NetBird API

    U->>F: Login Request
    F->>B: POST /api/auth/login
    B->>DB: Validate User Credentials
    DB-->>B: User Data
    B->>B: Generate JWT Tokens
    B->>DB: Store Session
    B-->>F: Auth Response (JWT)
    F->>F: Store Tokens Securely
    
    Note over F,B: Subsequent API Calls
    F->>B: API Request + JWT
    B->>B: Validate JWT
    B->>NB: NetBird API Call (if needed)
    NB-->>B: Response
    B->>DB: Log Action (Audit)
    B-->>F: Processed Response
```

### Security Implementation
```typescript
// JWT Authentication Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    
    if (!token) {
      throw new UnauthorizedException('JWT token missing')
    }

    return super.canActivate(context)
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}

// Role-based Access Control
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user.role?.includes(role))
  }
}

// Security Middleware
export const securityMiddleware = (app: INestApplication) => {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }))

  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  }))

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
  }))
}
```

## 📊 Monitoring & Observability

### Metrics Collection
```typescript
// Prometheus Metrics
import { Counter, Histogram, Gauge } from 'prom-client'

export const metrics = {
  // HTTP Request Metrics
  httpRequestsTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  }),

  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),

  // NetBird API Metrics
  netBirdApiRequests: new Counter({
    name: 'netbird_api_requests_total',
    help: 'Total number of NetBird API requests',
    labelNames: ['endpoint', 'status'],
  }),

  netBirdApiDuration: new Histogram({
    name: 'netbird_api_duration_seconds',
    help: 'Duration of NetBird API requests in seconds',
    labelNames: ['endpoint'],
    buckets: [0.5, 1, 2, 5, 10],
  }),

  // Alert Metrics
  alertsTriggered: new Counter({
    name: 'alerts_triggered_total',
    help: 'Total number of alerts triggered',
    labelNames: ['rule_id', 'severity'],
  }),

  activeAlerts: new Gauge({
    name: 'active_alerts_count',
    help: 'Number of currently active alerts',
  }),

  // System Metrics
  activeUsers: new Gauge({
    name: 'active_users_count',
    help: 'Number of currently active users',
  }),

  databaseConnections: new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
  }),
}

// Metrics Interceptor
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now()
    const request = context.switchToHttp().getRequest()

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000
        const route = request.route?.path || request.path
        
        metrics.httpRequestsTotal
          .labels(request.method, route, '200')
          .inc()
        
        metrics.httpRequestDuration
          .labels(request.method, route)
          .observe(duration)
      }),
      catchError((error) => {
        const duration = (Date.now() - start) / 1000
        const route = request.route?.path || request.path
        const statusCode = error.status || '500'
        
        metrics.httpRequestsTotal
          .labels(request.method, route, statusCode)
          .inc()
        
        metrics.httpRequestDuration
          .labels(request.method, route)
          .observe(duration)
        
        throw error
      })
    )
  }
}
```

### Structured Logging
```typescript
// Winston Logger Configuration
export const logger = WinstonModule.createLogger({
  format: Winston.format.combine(
    Winston.format.timestamp(),
    Winston.format.errors({ stack: true }),
    Winston.format.json(),
  ),
  defaultMeta: {
    service: 'netbird-management-platform',
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    new Winston.transports.Console({
      format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.simple(),
      ),
    }),
    new Winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new Winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
})

// Audit Logging Service
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(
    @InjectModel(AuditLog) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async logAction(params: {
    userId?: string
    action: string
    resourceType: string
    resourceId?: string
    oldValues?: any
    newValues?: any
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const auditLog = new this.auditLogModel({
      ...params,
      timestamp: new Date(),
    })

    await auditLog.save()

    // Also log to application logger for immediate visibility
    this.logger.log(`AUDIT: ${params.action} on ${params.resourceType}${params.resourceId ? `:${params.resourceId}` : ''} by user ${params.userId}`)
  }
}
```

## 🚀 Deployment Architecture

### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```dockerfile
# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
      - NEXT_PUBLIC_WS_URL=ws://backend:3001
    depends_on:
      - backend
    restart: unless-stopped

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/netbirdmgt
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - NETBIRD_API_URL=${NETBIRD_API_URL}
      - NETBIRD_API_TOKEN=${NETBIRD_API_TOKEN}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=netbirdmgt
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Nginx (Production)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment (Optional)
```yaml
# Frontend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: netbird-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: netbird-frontend
  template:
    metadata:
      labels:
        app: netbird-frontend
    spec:
      containers:
      - name: frontend
        image: netbird-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://netbird-backend:3001"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: netbird-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: netbird-backend
  template:
    metadata:
      labels:
        app: netbird-backend
    spec:
      containers:
      - name: backend
        image: netbird-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: netbird-secrets
              key: database-url
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📈 Performance Optimization

### Frontend Optimization
```typescript
// Code Splitting and Lazy Loading
const TopologyPage = lazy(() => import('./app/(dashboard)/topology/page'))
const AlertsPage = lazy(() => import('./app/(dashboard)/alerts/page'))

// Image Optimization
export const optimizedImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  return `https://example.com/${src}?w=${width}&q=${quality || 75}`
}

// Bundle Size Optimization
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@shadcn/ui', 'lucide-react'],
  },
  images: {
    domains: ['example.com'],
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }
    return config
  },
}
```

### Backend Optimization
```typescript
// Database Connection Pooling
export const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production',
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development',
}

// Redis Caching Strategy
@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(key: string, value: any, options?: { ttl?: number }): Promise<void> {
    const serialized = JSON.stringify(value)
    if (options?.ttl) {
      await this.redis.setex(key, options.ttl, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}

// API Rate Limiting
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter = new Map<string, { count: number; resetTime: number }>()

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const clientId = this.getClientId(request)
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 100

    const clientData = this.limiter.get(clientId)

    if (!clientData || now > clientData.resetTime) {
      this.limiter.set(clientId, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (clientData.count >= maxRequests) {
      throw new ThrottlerException('Too many requests')
    }

    clientData.count++
    return true
  }

  private getClientId(request: Request): string {
    return request.ip || 'unknown'
  }
}
```

---

**Technical Design Status**: ✅ Complete  
**Next Phase**: Implementation Tasks  
**Approval Required**: Technical Lead, Architecture Review Board