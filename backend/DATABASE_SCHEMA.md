# NetBird Web Management Platform - Database Schema Documentation

## 📋 Overview

This comprehensive PostgreSQL schema supports all features of the NetBird Web Management Platform including alerting, audit logging, real-time monitoring, and data management capabilities.

## 🏗️ Architecture

### Core Design Principles
- **Scalability**: Time-series partitioning for audit logs and metrics
- **Performance**: Strategic indexing and JSONB columns for flexible data storage
- **Auditability**: Complete audit trail with automatic triggers
- **Security**: Row-level security and encrypted sensitive data
- **Reliability**: Foreign key constraints and data integrity

## 📊 Entity Relationships

```
platform_users
├── nb_accounts (1:N)
│   ├── nb_peers (1:N)
│   ├── nb_groups (1:N)
│   ├── nb_policies (1:N)
│   └── nb_setup_keys (1:N)
├── alert_rules (1:N)
│   └── alerts (1:N)
│       └── alert_notifications (1:N)
├── user_sessions (1:N)
├── audit_logs (1:N)
├── api_integrations (1:N)
└── platform_settings (1:N)

system_metrics (Time-series)
```

## 🗃️ Table Descriptions

### Core Platform Tables

#### `platform_users`
Primary user accounts for accessing the management interface.

**Key Fields:**
- `id`: UUID primary key
- `email`: Unique email address
- `password_hash`: Bcrypt encrypted password
- `role`: admin/operator/viewer
- `netbird_user_id`: Optional link to NetBird user

**Indexes:**
- `idx_platform_users_email` (unique)
- `idx_platform_users_netbird_user_id`

#### `nb_accounts`
NetBird account integrations for managing multiple NetBird instances.

**Key Fields:**
- `id`: UUID primary key
- `user_id`: Foreign key to platform_users
- `domain`: NetBird domain name
- `api_token_encrypted`: Encrypted API token

**Security:** API tokens are encrypted at rest using application-level encryption.

### NetBird Data Tables

#### `nb_peers`
Cached NetBird peer information with historical tracking.

**Key Features:**
- Real-time status tracking
- Location data
- Historical uptime tracking
- Connection metadata

**Indexes:**
- Status, last_seen, location, account_id

#### `nb_groups`, `nb_policies`, `nb_setup_keys`
Cached NetBird configuration data for offline analysis and historical tracking.

### Alert System Tables

#### `alert_rules`
Configurable alert rules with flexible conditions.

**Rule Types:**
- `peer_offline`: Peer connectivity monitoring
- `peer_flapping`: Rapid connection changes
- `group_health`: Group-level monitoring
- `network_status`: Network-wide metrics
- `system_error`: System-level errors

**Conditions:** JSON-based flexible condition system

#### `alerts`
Individual alert instances with full lifecycle management.

**Status Flow:**
1. `open` → `acknowledged` → `resolved`
2. `open` → `suppressed` → `resolved`

#### `alert_notifications`
Delivery tracking for alert notifications.

**Channels:**
- Email
- Webhook
- Slack
- Custom integrations

### Audit & Monitoring Tables

#### `audit_logs` (Partitioned)
Complete audit trail with partitioning by month.

**Features:**
- Automatic triggers on all critical tables
- Change tracking with old/new values
- JSONB field storage for flexible metadata
- Time-series partitioning for performance

**Partitioning:**
- Monthly partitions automatically created
- 2-year retention policy
- Auto-cleanup of old partitions

#### `system_metrics` (Partitioned)
Time-series metrics for system monitoring.

**Metric Types:**
- `counter`: Cumulative values
- `gauge`: Point-in-time values
- `histogram`: Distribution data

### Configuration Tables

#### `platform_settings`
Key-value configuration with categorization.

**Categories:**
- `general`: Platform-wide settings
- `alerts`: Alert system configuration
- `notifications`: Delivery settings
- `ui`: User interface preferences
- `security`: Security policies
- `integrations`: Third-party integrations

#### `api_integrations`
Third-party service integrations for notifications and data exchange.

## 🔧 Performance Optimizations

### Indexing Strategy
1. **Primary Indexes**: All primary keys are UUIDs with B-tree indexes
2. **Foreign Key Indexes**: All foreign keys are indexed
3. **Query Indexes**: Composite indexes for common query patterns
4. **JSONB Indexes**: GIN indexes on all JSONB columns
5. **Time-series Indexes**: Timestamp-based indexes for partitioned tables

### Partitioning
- **Audit Logs**: Monthly partitions with auto-creation
- **System Metrics**: Monthly partitions with retention policy
- **Automatic Maintenance**: Cron jobs for partition management

### Connection Pooling
```typescript
// Database configuration
{
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,    // Idle timeout
  connectionTimeoutMillis: 2000, // Connection timeout
}
```

## 🔒 Security Features

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **Token Encryption**: Application-level encryption for API tokens
- **Session Management**: Secure token storage with expiration
- **Audit Logging**: Complete action traceability

### Access Control
- **Role-Based Access**: admin/operator/viewer roles
- **Row-Level Security**: User-scoped data access
- **API Rate Limiting**: Prevent abuse
- **Input Validation**: Comprehensive input sanitization

## 📈 Monitoring & Health

### Database Health Checks
1. **Connection Status**: Database connectivity
2. **Migration Status**: Schema up-to-date
3. **Partition Health**: Time-series partition status
4. **Performance Metrics**: Slow queries, optimization needs
5. **Extension Status**: Required PostgreSQL extensions

### Automated Maintenance
1. **Partition Creation**: Monthly auto-creation
2. **Old Data Cleanup**: Automatic retention enforcement
3. **Table Optimization**: Auto-vacuum and analyze
4. **Session Cleanup**: Expired session removal

## 🚀 Deployment Guide

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=netbird_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=netbird_mgt
NODE_ENV=development
```

### Setup Commands
```bash
# Install dependencies
npm install

# Run database setup
npm run setup:db

# Manual migration
npm run migration:run

# Seed initial data
npm run seed:run

# Verify setup
npm run db:verify

# Check health
npm run db:health
```

### Production Checklist
- [ ] PostgreSQL 15+ installed
- [ ] Required extensions enabled (uuid-ossp, pg_stat_statements, pg_trgm)
- [ ] Connection pooling configured
- [ ] SSL enabled for connections
- [ ] Regular backup schedule configured
- [ ] Monitoring and alerting configured
- [ ] Log rotation configured

## 📊 Performance Benchmarks

### Expected Performance
- **Query Response**: <100ms for indexed queries
- **Audit Log Writes**: <10ms with partitioning
- **Alert Processing**: <50ms rule evaluation
- **Concurrent Users**: 100+ with connection pool

### Scaling Recommendations
1. **Database Sizing**: Start with 2CPU/4GB, scale based on user count
2. **Storage**: SSD recommended for time-series data
3. **Memory**: 1GB per 1000 active users
4. **Backup**: Daily full backups + WAL archiving

## 🔍 Troubleshooting

### Common Issues

#### Migration Failures
```bash
# Check current migration status
npm run migration:show

# Revert last migration if needed
npm run migration:revert
```

#### Performance Issues
```bash
# Check slow queries
npm run db:slow-queries

# Optimize tables
npm run db:optimize
```

#### Partition Issues
```bash
# Check partition status
npm run db:partitions

# Create missing partitions
npm run db:create-partitions
```

### Health Check Codes
- **healthy**: All systems operational
- **degraded**: Functional but with warnings
- **unhealthy**: Critical issues requiring attention

## 📝 Schema Versioning

### Current Version: v1.0.0
- Initial schema implementation
- Complete feature set
- Production-ready

### Migration History
- `1712345678900`: Platform users table
- `1712345678901`: NetBird data tables
- `1712345678902`: Alert system tables
- `1712345678903`: Audit and system tables
- `1712345678904`: JSONB indexes and audit triggers
- `1712345678905`: Database views
- `1712345678906`: Time-series partitioning
- `1712345678907`: Initial seed data

## 📚 API Reference

### Entity Relationships
All entities are properly mapped with TypeORM decorators and include:
- Primary keys with UUID generation
- Foreign key relationships
- Indexes for performance
- Validation constraints
- Timestamp tracking

### Database Service API
```typescript
// Health monitoring
await databaseService.getDatabaseInfo();
await databaseHealthService.performHealthCheck();

// Maintenance
await databaseService.optimizeTable(tableName);
await databaseService.cleanupOldSessions();

// Raw queries
await databaseService.executeRawQuery(query, params);
```

---

This comprehensive database schema provides a solid foundation for the NetBird Web Management Platform with enterprise-grade features for security, performance, and scalability.