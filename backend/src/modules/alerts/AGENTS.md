# ALERTS MODULE KNOWLEDGE BASE

## OVERVIEW

Complex alerting system: rules engine, evaluators, notifications, WebSocket gateway, scheduled evaluation, analytics.

## STRUCTURE

```
alerts/
├── alerts.module.ts           # Module registration
├── alerts.service.ts          # Core alert CRUD & logic
├── alerts.gateway.ts          # WebSocket gateway for real-time
├── alerts.scheduler.ts        # Cron-based rule evaluation
├── rules-engine.service.ts    # Rule condition evaluation
├── notification.service.ts    # Multi-channel notifications
├── analytics.service.ts       # Alert analytics & trends
├── controllers/               # REST endpoints
├── dto/                       # Request/response DTOs
├── evaluators/                # Rule type evaluators (7 types)
├── interfaces/                # TypeScript interfaces
├── seeders/                   # Default rule templates
├── templates/                 # Notification templates
├── tests/                     # Unit tests
└── utils/                     # Helper functions
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new rule type | `evaluators/` | Implement BaseEvaluator |
| Modify notification | `notification.service.ts` | Email, webhook, slack |
| Change evaluation schedule | `alerts.scheduler.ts` | @Cron decorator |
| WebSocket events | `alerts.gateway.ts` | Socket.io events |
| Alert analytics | `analytics.service.ts` | Metrics, trends |
| Add REST endpoint | `controllers/` | AlertsController, RulesController |

## CONVENTIONS

### Evaluator Pattern

```typescript
// All evaluators extend base class
export class PeerStatusEvaluator extends BaseEvaluator {
  async evaluate(rule: AlertRule): Promise<EvaluationResult> {
    // Return { triggered: boolean, details: object }
  }
}
```

### Rule Types (in evaluators/)

| Type | File | Evaluates |
|------|------|-----------|
| `peer_offline` | `peer-offline.evaluator.ts` | Peer connection status |
| `peer_count` | `peer-count.evaluator.ts` | Total peer threshold |
| `connection_quality` | `connection-quality.evaluator.ts` | Network quality |
| `group_membership` | `group-membership.evaluator.ts` | Group changes |
| `policy_violation` | `policy-violation.evaluator.ts` | Policy breaches |
| `system_metric` | `system-metric.evaluator.ts` | CPU/memory/disk |
| `custom` | `custom.evaluator.ts` | User-defined conditions |

### Notification Channels

```typescript
// notification.service.ts handles:
- Email (SMTP)
- Webhook (HTTP POST)
- Slack (API)
```

## ANTI-PATTERNS

- **NO** direct alert creation without rule trigger
- **NO** blocking operations in evaluators
- **NO** skipping NotificationChannel config validation
- **NO** WebSocket broadcast without room filtering

## COMMANDS

```bash
# Test alerts module
npm run test -- --testPathPattern=alerts
```

## NOTES

- Scheduler runs every minute by default
- WebSocket uses rooms per user for isolation
- Notification templates support Handlebars syntax
- Analytics aggregates by hour/day/week
