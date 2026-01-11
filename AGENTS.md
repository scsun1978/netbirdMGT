# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-10T22:30:50+08:00
**Commit:** 3ba93d5
**Branch:** main

## OVERVIEW

NetBird Web Management Platform - enterprise-grade dashboard for NetBird network management. NestJS backend + Next.js 16 frontend + PostgreSQL + Redis. Monorepo with separate `backend/` and `frontend/` packages.

## STRUCTURE

```
netbirdMGT/
├── .ai-rules/              # AI context docs (product.md, tech.md, structure.md)
├── backend/                # NestJS 11 API server
│   ├── src/
│   │   ├── entities/       # TypeORM entities (17 models)
│   │   ├── modules/        # Feature modules (10 domains)
│   │   ├── common/         # Guards, decorators, database config
│   │   └── migrations/     # TypeORM migrations
│   └── test/               # Jest tests
├── frontend/               # Next.js 16 App Router
│   └── src/
│       ├── app/            # Routes (dashboard, peers, topology, alerts...)
│       ├── components/     # UI components (shadcn/ui based)
│       ├── lib/            # API clients, stores, hooks
│       └── types/          # TypeScript definitions
├── specs/                  # Feature specifications
├── docker-compose.yml      # Full stack: postgres, redis, backend, frontend
└── .env.example            # Environment template
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new NetBird entity | `backend/src/entities/` | Follow TypeORM entity pattern |
| Add new backend module | `backend/src/modules/` | NestJS module structure |
| Add new frontend route | `frontend/src/app/` | Next.js App Router |
| Modify alerting logic | `backend/src/modules/alerts/` | Complex module - see alerts AGENTS.md |
| Add UI component | `frontend/src/components/ui/` | shadcn/ui components |
| State management | `frontend/src/lib/stores/` | Zustand stores |
| API integration | `frontend/src/lib/api/` | TanStack Query + axios |
| Database migrations | `backend/src/migrations/` | TypeORM migrations |

## CODE MAP

### Backend Entities (Domain Model)

| Entity | Purpose | Key Relations |
|--------|---------|---------------|
| `PlatformUser` | Platform admin users | Has sessions, audit logs |
| `NbAccount` | NetBird account config | Has peers, groups, policies |
| `NbPeer` | Synced NetBird peers | Belongs to groups |
| `NbGroup` | NetBird groups | Has peers |
| `NbPolicy` | NetBird policies | References groups |
| `AlertRule` | Alert definitions | Triggers alerts |
| `Alert` | Alert instances | Has notifications |
| `AuditLog` | Action audit trail | Links to users |
| `NotificationChannel` | Alert delivery config | Email, webhook, slack |

### Backend Modules

| Module | Endpoint | Purpose |
|--------|----------|---------|
| `NetBirdModule` | `/api/netbird/*` | NetBird API proxy |
| `PeersModule` | `/api/peers/*` | Peer management |
| `NetworksModule` | `/api/networks/*` | Network management |
| `AlertsModule` | `/api/alerts/*` | Alert rules & instances |
| `AuditModule` | `/api/audit/*` | Audit logging |
| `AuthModule` | `/api/auth/*` | JWT authentication |
| `WebsocketModule` | WebSocket | Real-time updates |

### Frontend Routes

| Route | Page | Features |
|-------|------|----------|
| `/` | Landing | Redirect to dashboard |
| `/dashboard` | Dashboard | Overview, metrics, charts |
| `/peers` | Peer List | Table, filters, actions |
| `/topology` | Network View | React Flow visualization |
| `/alerts` | Alerts | Rules, active alerts |
| `/audit` | Audit Log | Action history |

## CONVENTIONS

### Backend (NestJS)

- **ORM**: TypeORM (not Prisma despite .ai-rules docs)
- **Entities**: PascalCase with `.entity.ts` suffix
- **Modules**: Standard NestJS structure - module, controller, service
- **Validation**: class-validator with `ValidationPipe` (whitelist + transform)
- **API Docs**: Swagger at `/api`

### Frontend (Next.js)

- **Router**: App Router (not Pages)
- **State**: Zustand for client state, TanStack Query for server state
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Charts**: ECharts
- **Topology**: ReactFlow
- **Forms**: react-hook-form + zod

### Naming

- Files: kebab-case (except components: PascalCase)
- Types: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT** use Prisma - project uses TypeORM
- **DO NOT** put business logic in controllers - use services
- **DO NOT** create new entities without migrations
- **DO NOT** bypass `ValidationPipe` for DTOs
- **DO NOT** use Pages Router in frontend

## COMMANDS

```bash
# Backend
cd backend && npm run start:dev      # Dev server (port 3001)
cd backend && npm run build          # Build
cd backend && npm run migration:run  # Run migrations
cd backend && npm run test           # Jest tests

# Frontend
cd frontend && npm run dev           # Dev server (port 3000)
cd frontend && npm run build         # Build
cd frontend && npm run lint          # ESLint

# Full Stack
docker-compose up -d                 # All services
docker-compose down                  # Stop all
```

## NOTES

- NetBird API credentials in `.env` - see `.env.example`
- Backend runs on port 3001, frontend on 3000
- Swagger docs at `http://localhost:3001/api`
- `.ai-rules/` contains detailed product/tech context
- `specs/` for feature specifications
