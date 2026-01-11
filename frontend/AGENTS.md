# FRONTEND KNOWLEDGE BASE

## OVERVIEW

Next.js 16 App Router with TailwindCSS 4, shadcn/ui, Zustand, TanStack Query. Dashboard for NetBird management with topology visualization.

## STRUCTURE

```
frontend/src/
├── app/                    # App Router routes
│   ├── (auth)/             # Auth route group (login, register)
│   ├── dashboard/          # Main dashboard with charts
│   ├── peers/              # Peer list & management
│   ├── topology/           # ReactFlow network visualization
│   ├── alerts/             # Alert rules & instances
│   ├── networks/           # Network management
│   ├── users/              # User management
│   ├── tokens/             # Access tokens
│   ├── setup-keys/         # Setup key management
│   ├── audit/              # Audit log viewer
│   ├── settings/           # Platform settings
│   ├── layout.tsx          # Root layout with providers
│   ├── globals.css         # TailwindCSS globals
│   └── page.tsx            # Landing/redirect
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Shell, sidebar, header
│   ├── providers/          # QueryProvider, etc.
│   ├── charts/             # ECharts wrappers
│   └── forms/              # Form components
├── lib/
│   ├── api/                # API client (axios + endpoints)
│   ├── stores/             # Zustand stores
│   ├── hooks/              # Custom React hooks
│   └── utils.ts            # cn() helper
└── types/                  # TypeScript definitions
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new page | `src/app/[route]/page.tsx` | App Router convention |
| Add UI component | `src/components/ui/` | shadcn/ui pattern |
| Add API call | `src/lib/api/` | TanStack Query hooks |
| Add global state | `src/lib/stores/` | Zustand store |
| Add chart | `src/components/charts/` | ECharts wrapper |
| Modify layout | `src/components/layout/` | Shell, sidebar |
| Add types | `src/types/` | TypeScript definitions |

## CONVENTIONS

### Page Structure

```tsx
// src/app/feature/page.tsx
export default function FeaturePage() {
  return (
    <DashboardShell>
      <PageHeader title="Feature" />
      <PageContent />
    </DashboardShell>
  );
}
```

### API Hook Pattern

```tsx
// TanStack Query pattern
export function usePeers() {
  return useQuery({
    queryKey: ['peers'],
    queryFn: () => api.get('/peers'),
  });
}
```

### Zustand Store Pattern

```tsx
// Simple, flat stores
export const useStore = create<State>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
```

### shadcn/ui Components

```tsx
// Import from @/components/ui
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
```

## ANTI-PATTERNS

- **NO** Pages Router - use App Router only
- **NO** CSS modules - use TailwindCSS
- **NO** Redux - use Zustand + TanStack Query
- **NO** direct fetch() - use api client with axios
- **NO** inline styles - use Tailwind classes

## COMMANDS

```bash
npm run dev              # Dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript check
```

## NOTES

- Layout uses QueryProvider for TanStack Query
- Geist font configured in layout
- `cn()` helper in `lib/utils.ts` for class merging
- husky + lint-staged for pre-commit hooks
- ReactFlow for topology (uses dagre for layout)
