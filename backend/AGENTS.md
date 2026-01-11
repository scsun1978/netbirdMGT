# BACKEND KNOWLEDGE BASE

## OVERVIEW

NestJS 11 API server with TypeORM, PostgreSQL, Redis. Handles NetBird API proxy, alerting engine, and real-time WebSocket updates.

## STRUCTURE

```
backend/src/
├── entities/           # 17 TypeORM entities
├── modules/
│   ├── alerts/         # Complex alerting system (own AGENTS.md)
│   ├── auth/           # JWT + Passport authentication
│   ├── netbird/        # NetBird API client & proxy
│   ├── peers/          # Peer management
│   ├── networks/       # Network management
│   ├── users/          # User management
│   ├── tokens/         # Access token management
│   ├── setup-keys/     # NetBird setup keys
│   ├── audit/          # Audit logging
│   └── websocket/      # Real-time updates
├── common/             # Shared guards, decorators, database module
├── config/             # App & database configuration
├── migrations/         # TypeORM migrations
└── main.ts             # Bootstrap with Swagger, CORS, Helmet
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add TypeORM entity | `src/entities/` | Export from `index.ts` |
| Add new module | `src/modules/` | Register in `app.module.ts` |
| Database config | `src/config/database.config.ts` | TypeORM DataSource |
| Global guards | `src/common/guards/` | JWT guard, etc. |
| NetBird API client | `src/modules/netbird/netbird.service.ts` | Axios-based |
| WebSocket gateway | `src/modules/websocket/` | Socket.io gateway |

## CONVENTIONS

### Module Pattern

```typescript
// Each module has: module.ts, controller.ts, service.ts
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

### Entity Pattern

```typescript
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  field: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### DTO Validation

```typescript
// Always use class-validator decorators
export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

## ANTI-PATTERNS

- **NO** direct SQL queries - use TypeORM Repository
- **NO** logic in controllers - delegate to services
- **NO** skipping DTO validation
- **NO** hardcoded secrets - use ConfigService

## COMMANDS

```bash
npm run start:dev          # Dev with watch
npm run build              # Production build
npm run migration:generate # Generate migration
npm run migration:run      # Apply migrations
npm run test               # Run tests
npm run seed:run           # Seed database
```

## NOTES

- Bootstrap adds: Helmet, CORS, ValidationPipe, Swagger
- Swagger at `/api` endpoint
- Schedule module enabled for cron jobs
- Bull queue ready but not heavily used
