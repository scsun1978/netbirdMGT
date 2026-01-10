# NetBird Web Management Platform - Project Structure & Conventions

## 📁 Project Directory Structure

```
netbirdMGT/
├── .ai-rules/                    # AI Assistant Context Files
│   ├── product.md               # Product Vision & Requirements
│   ├── tech.md                  # Technology Stack & Architecture
│   └── structure.md             # This file - Project Structure
│
├── .github/                     # GitHub Configuration
│   ├── workflows/               # CI/CD Pipelines
│   │   ├── ci.yml              # Continuous Integration
│   │   ├── deploy.yml          # Deployment Pipeline
│   │   └── security.yml        # Security Scanning
│   ├── ISSUE_TEMPLATE/         # Issue Templates
│   └── PULL_REQUEST_TEMPLATE.md # PR Template
│
├── docs/                        # Documentation
│   ├── api/                    # API Documentation
│   ├── deployment/             # Deployment Guides
│   ├── development/            # Development Guides
│   └── user-guide/             # User Documentation
│
├── frontend/                    # Next.js Frontend Application
│   ├── public/                 # Static Assets
│   │   ├── icons/             # Favicon, App Icons
│   │   └── images/            # Static Images
│   ├── src/
│   │   ├── app/               # App Router Pages
│   │   │   ├── (auth)/        # Auth Route Group
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/   # Dashboard Route Group
│   │   │   │   ├── dashboard/
│   │   │   │   ├── topology/
│   │   │   │   ├── peers/
│   │   │   │   ├── networks/
│   │   │   │   ├── users/
│   │   │   │   ├── tokens/
│   │   │   │   ├── setup-keys/
│   │   │   │   ├── alerts/
│   │   │   │   ├── settings/
│   │   │   │   └── audit/
│   │   │   ├── api/           # API Routes
│   │   │   │   └── auth/
│   │   │   ├── globals.css    # Global Styles
│   │   │   ├── layout.tsx     # Root Layout
│   │   │   └── page.tsx       # Home Page
│   │   ├── components/        # Reusable Components
│   │   │   ├── ui/           # shadcn/ui Components
│   │   │   ├── layout/       # Layout Components
│   │   │   ├── charts/       # Chart Components
│   │   │   ├── forms/        # Form Components
│   │   │   └── features/     # Feature-Specific Components
│   │   ├── lib/              # Utility Libraries
│   │   │   ├── api/          # API Client
│   │   │   ├── auth/         # Authentication
│   │   │   ├── utils/        # Helper Functions
│   │   │   └── validations/  # Zod Schemas
│   │   ├── hooks/            # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useNetBird.ts
│   │   │   └── useAlerts.ts
│   │   ├── stores/           # Zustand Stores
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── netBirdStore.ts
│   │   └── types/            # TypeScript Type Definitions
│   │       ├── api.ts
│   │       ├── netbird.ts
│   │       └── alerts.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .env.local.example
│
├── backend/                     # NestJS Backend Application
│   ├── src/
│   │   ├── auth/              # Authentication Module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/
│   │   ├── netbird/          # NetBird Integration Module
│   │   │   ├── netbird.module.ts
│   │   │   ├── netbird.controller.ts
│   │   │   ├── netbird.service.ts
│   │   │   └── client/
│   │   ├── alerts/           # Alerting System Module
│   │   │   ├── alerts.module.ts
│   │   │   ├── alerts.controller.ts
│   │   │   ├── alerts.service.ts
│   │   │   └── rules/
│   │   ├── audit/            # Audit Logging Module
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.controller.ts
│   │   │   └── audit.service.ts
│   │   ├── dashboard/        # Dashboard Module
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── dashboard.service.ts
│   │   ├── database/         # Database Configuration
│   │   │   ├── prisma.service.ts
│   │   │   └── migrations/
│   │   ├── common/           # Shared Components
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── config/           # Configuration Files
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   └── netbird.config.ts
│   │   ├── main.ts           # Application Entry Point
│   │   └── app.module.ts     # Root Module
│   ├── prisma/               # Prisma ORM
│   │   ├── schema.prisma     # Database Schema
│   │   ├── migrations/       # Database Migrations
│   │   └── seed.ts          # Database Seeding
│   ├── test/                # Test Files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
├── infrastructure/             # Infrastructure as Code
│   ├── docker/              # Docker Configuration
│   │   ├── frontend.Dockerfile
│   │   ├── backend.Dockerfile
│   │   └── nginx.Dockerfile
│   ├── docker-compose.yml   # Development Environment
│   ├── docker-compose.prod.yml # Production Environment
│   └── kubernetes/          # K8s Manifests (Optional)
│
├── scripts/                    # Utility Scripts
│   ├── setup.sh             # Development Setup
│   ├── build.sh             # Build Script
│   ├── deploy.sh            # Deployment Script
│   └── backup.sh            # Database Backup
│
├── specs/                      # Feature Specifications (Generated by AI)
│   └── [feature-name]/
│       ├── requirements.md   # User Stories & Acceptance Criteria
│       ├── design.md         # Technical Design
│       └── tasks.md          # Implementation Tasks
│
├── .env.example               # Environment Variables Template
├── .gitignore                 # Git Ignore Rules
├── README.md                  # Project Documentation
├── LICENSE                    # Open Source License
└── package.json               # Root Package Configuration
```

## 🎯 Naming Conventions

### File Naming
- **Components**: PascalCase (e.g., `UserProfile.tsx`, `AlertCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `calculateMetrics.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`, `ALERT_SEVERITY.ts`)
- **Types**: PascalCase with descriptive suffix (e.g., `UserTypes.ts`, `AlertInterfaces.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useNetBirdData.ts`, `useAlertRules.ts`)

### Directory Naming
- **Features**: kebab-case (e.g., `user-management/`, `alert-system/`)
- **Modules**: kebab-case (e.g., `netbird-client/`, `audit-logging/`)
- **Pages**: kebab-case (e.g., `peer-management/`, `topology-view/`)

### Variable Naming
```typescript
// Constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_ATTEMPTS = 3

// Functions
const fetchNetBirdPeers = async () => { /* ... */ }
const validateAlertRule = (rule: AlertRule) => { /* ... */ }

// Variables
const currentUser = await getCurrentUser()
const alertRules = await getAlertRules()

// Interfaces/Types
interface NetBirdPeer {
  id: string
  name: string
  status: PeerStatus
}

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
```

## 🏗️ Component Architecture Patterns

### Atomic Design Hierarchy
```
atoms/          # Smallest reusable units (Button, Input, Icon)
├── Button.tsx
├── Input.tsx
└── Badge.tsx

molecules/      # Simple combinations of atoms
├── SearchBar.tsx      # Input + Button
├── UserCard.tsx       # Avatar + Name + Badge
└── AlertItem.tsx      # Badge + Text + Actions

organisms/       # Complex sections of UI
├── Header.tsx         # Logo + Navigation + UserMenu
├── Sidebar.tsx        # Navigation + UserSection
└── AlertPanel.tsx     # AlertList + Filters

templates/       # Page-level layouts
├── DashboardLayout.tsx
├── AuthLayout.tsx
└── SettingsLayout.tsx

pages/          # Route components
├── DashboardPage.tsx
├── PeersPage.tsx
└── AlertsPage.tsx
```

### Component Structure Template
```typescript
// Component: FeatureCard.tsx
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FeatureCardProps {
  title: string
  description: string
  status: 'active' | 'inactive'
  actions?: React.ReactNode
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  status,
  actions
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        {actions && <div className="flex gap-2">{actions}</div>}
      </CardContent>
    </Card>
  )
}
```

## 🔧 Backend Module Structure

### NestJS Module Template
```typescript
// src/alerts/alerts.module.ts
import { Module } from '@nestjs/common'
import { AlertsController } from './alerts.controller'
import { AlertsService } from './alerts.service'
import { AlertsRepository } from './alerts.repository'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
  exports: [AlertsService]
})
export class AlertsModule {}
```

### Service Structure Template
```typescript
// src/alerts/alerts.service.ts
import { Injectable } from '@nestjs/common'
import { AlertsRepository } from './alerts.repository'
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto'
import { AlertRule } from './entities/alert-rule.entity'

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  async createAlertRule(createAlertRuleDto: CreateAlertRuleDto): Promise<AlertRule> {
    // Implementation
  }

  async getAlertRules(): Promise<AlertRule[]> {
    // Implementation
  }

  async updateAlertRule(id: string, updateData: Partial<AlertRule>): Promise<AlertRule> {
    // Implementation
  }

  async deleteAlertRule(id: string): Promise<void> {
    // Implementation
  }
}
```

## 📝 Documentation Standards

### Code Documentation
```typescript
/**
 * Fetches NetBird peers from the API with caching
 * 
 * @param options - Configuration options for the request
 * @param options.forceRefresh - Skip cache and fetch fresh data
 * @param options.timeout - Request timeout in milliseconds (default: 10000)
 * 
 * @returns Promise<NetBirdPeer[]> Array of NetBird peers
 * 
 * @throws {ApiError} When the API request fails
 * @throws {ValidationError} When response data is invalid
 * 
 * @example
 * ```typescript
 * const peers = await fetchNetBirdPeers({ forceRefresh: true })
 * console.log(`Found ${peers.length} peers`)
 * ```
 */
export const fetchNetBirdPeers = async (
  options: {
    forceRefresh?: boolean
    timeout?: number
  } = {}
): Promise<NetBirdPeer[]> => {
  // Implementation
}
```

### API Documentation
```typescript
// API Endpoint Documentation
/**
 * @swagger
 * /api/alerts/rules:
 *   get:
 *     summary: Retrieve all alert rules
 *     description: Returns a list of all configured alert rules for the current user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of alert rules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AlertRule'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
```

## 🧪 Testing Standards

### Frontend Testing Structure
```
frontend/src/
├── __tests__/              # Test Utilities
├── components/
│   └── ui/
│       └── Button.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── lib/
    └── api.test.ts
```

### Backend Testing Structure
```
backend/src/
├── test/
│   ├── unit/
│   │   ├── alerts.service.spec.ts
│   │   └── netbird.service.spec.ts
│   ├── integration/
│   │   ├── alerts.e2e-spec.ts
│   │   └── auth.e2e-spec.ts
│   └── fixtures/
│       ├── users.json
│       └── alerts.json
```

### Test Templates
```typescript
// Frontend Component Test
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

```typescript
// Backend Service Test
import { Test } from '@nestjs/testing'
import { AlertsService } from '../alerts.service'
import { AlertsRepository } from '../alerts.repository'

describe('AlertsService', () => {
  let alertsService: AlertsService
  let alertsRepository: jest.Mocked<AlertsRepository>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: AlertsRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    alertsService = module.get<AlertsService>(AlertsService)
    alertsRepository = module.get(AlertsRepository)
  })

  describe('createAlertRule', () => {
    it('should create an alert rule successfully', async () => {
      const createDto = { name: 'Test Rule', condition: 'peer_count > 5' }
      const expectedRule = { id: '123', ...createDto }

      alertsRepository.create.mockResolvedValue(expectedRule)

      const result = await alertsService.createAlertRule(createDto)

      expect(alertsRepository.create).toHaveBeenCalledWith(createDto)
      expect(result).toEqual(expectedRule)
    })
  })
})
```

## 🔄 Git Workflow Standards

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Production hotfixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation updates

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(alerts): add real-time alert notifications

- Implement WebSocket connection for live alerts
- Add alert toast notifications
- Update alert store with real-time updates

Closes #123
```

```
fix(auth): resolve JWT token refresh issue

The token refresh was failing due to incorrect header format.
This fix ensures proper token refresh flow.

Fixes #456
```

## 🚀 Environment Configuration

### Environment Variables
```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_VERSION=1.0.0

# .env (Backend)
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/netbirdmgt
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
NETBIRD_API_URL=https://netbird.scsun.qzz.io
NETBIRD_API_TOKEN=nbp_F9CuUREK2wo5POWkslQ6rNHmhpAmpm02JnH1
```

### Configuration Management
```typescript
// src/config/app.config.ts
import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
}))
```

## 📊 Performance Standards

### Frontend Performance
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Backend Performance
- **API Response Time**: <200ms (95th percentile)
- **Database Query Time**: <100ms (average)
- **Memory Usage**: <512MB (per instance)
- **CPU Usage**: <70% (under load)

### Code Quality Standards
- **Test Coverage**: >90% for critical paths
- **TypeScript Strict Mode**: Enabled
- **ESLint Rules**: No warnings
- **Bundle Size**: <500KB (gzipped) for frontend

This structure provides a solid foundation for building a scalable, maintainable NetBird management platform while following industry best practices and conventions.