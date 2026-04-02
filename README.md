# Fold Health — TOC Worklist Platform

A comprehensive healthcare operations platform for Transitional Care Organizations (TCOs), built to coordinate multi-agent patient outreach, track care management goals, monitor population health analytics, and manage AI-powered care workflows.

## Overview

This is a **production-grade prototype** of Fold Health's care coordination platform. It provides clinicians, care managers, and administrators with tools to manage post-discharge follow-ups, chronic disease programs, quality measure tracking, and AI agent orchestration — all from a single unified interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| State | Zustand 5 |
| Routing | Custom hash-based router |
| Styling | Tailwind CSS 4 + CSS Modules |
| UI Primitives | Radix UI |
| Icons | Solar (via Iconify) |
| Charts | Recharts |
| Flow Editor | XYFlow |
| Database | Supabase (PostgreSQL) |
| Analytics | Vercel Analytics + Speed Insights |

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Navigate to `/#/population/worklist` (default) or use the sidebar to explore other sections.

## Application Structure

```
src/
  components/       # Shared UI components (Button, Input, Switch, Drawer, Badge, etc.)
  features/         # Feature modules
    worklist/       # Patient worklist management
    queue/          # Agent assignment queue
    analytics/      # 15+ analytics dashboard views
    agent-builder/  # Visual workflow designer
    settings/       # Admin configuration panels
  store/            # Zustand state management
  lib/              # Router, Supabase client, data mappers
  data/             # Mock/fallback data
  tokens/           # Design tokens (colors, spacing, typography)
```

## Features

### Population Management
- **Worklist** — Master patient roster grouped by status (Ongoing Call, In Queue, Scheduled, Needs Attention, Enrolled)
- **Queue** — Prioritized agent work queue with KPI summary bar
- Search, multi-filter, bulk selection, pagination
- TCPA compliance tracking, recording consent, identity verification

### Analytics (15 Views)
Executive, Population, Financial, Risk, Quality, Utilization, Care Coordination, Network, Shared Savings, ROI Simulator, Tool Usage, Platform Ops, AI Analytics, SDOH, Action Rules — each with period selection, practice filtering, and drill-down capabilities.

### Agent Builder
- Visual node-based workflow designer (XYFlow)
- Conversation nodes, conditional branching, tool integration
- Agent testing/preview via chat panel
- Version history and workflow persistence

### Settings — Agents
- **Agents Table** — List, create, duplicate, delete AI agents with voice configuration
- **Goals** — Multi-step care program goals (TCM, Outreach, Onboarding, Preventive, Billing) with weighted scoring, completion tracking, and a 4-step creation wizard
- **Knowledge Base** — FAQ management for agent training
- **Compliance Policies** — Escalation rules and policy configuration
- **Test Cases / Feature Toggles** — QA and feature flag management

### Settings — Embedded Components
- **Domain Registry** — Whitelist domains for embedded iFrame components with HIPAA compliance tracking, enable/disable toggle, and per-domain audit log
- **Component Library** — Configure embedded UI components (Prior Auth, Risk Dashboard, HEDIS Tracker, etc.) with surface placement (Fold Web, Sidecar, Mobile), JWT context scoping, and a 4-step creation wizard (Identity, Surfaces, Context, Preview)
- **Audit Log Drawer** — Per-entity timeline-based activity history with color-coded action types, month grouping, and filter pills

### Settings — Messages
- Chat group configuration with agent routing rules
- Business hours management per group
- Agent rules drawer for conversation flow control

### Real-Time Features
- Active call monitoring with transfer flows
- System health strip (EHR, Retell, Redis, Supabase status)
- Degraded service banners
- Toast notifications

## Design System

The platform follows the **Fold Health design system** with strict adherence to:

- **Typography** — Inter font family, weights 400/500/600
- **Colors** — Primary purple (#8C5AE2), neutral grey scale, semantic status colors
- **Spacing** — 4px base unit grid
- **Components** — Shared library: Button (8 variants), Input, Switch, Badge, ActionButton, Drawer (700px floating panel), Select (Radix-based popover)
- **Tables** — Edge-to-edge with sticky headers, 12px row padding, hover states
- **Drawers** — All use the shared Drawer component (700px, 8px inset, 16px radius)

## Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Button` | `src/components/Button/` | Primary, secondary, ghost, danger variants (S/L/XL) |
| `Input` | `src/components/Input/` | Text input matching Figma spec (32px, 0.5px border, 6px radius) |
| `Switch` | `src/components/Switch/` | Toggle control matching Figma spec |
| `Badge` | `src/components/Badge/` | Status and category indicators |
| `ActionButton` | `src/components/ActionButton/` | Icon-only toolbar buttons with tooltip |
| `Drawer` | `src/components/Drawer/` | Floating right-side panel (700px) |
| `Select` | `src/components/ui/select.jsx` | Radix-based dropdown with popover |
| `Icon` | `src/components/Icon/` | Solar icon wrapper via Iconify |
| `ConfirmDialog` | `src/components/Modal/` | Destructive action confirmation |
| `Pagination` | `src/components/Pagination/` | Table pagination controls |

## Data Flow

- **Supabase** is the primary data source (PostgreSQL + real-time)
- **Fallback data** in `src/data/` seeds empty tables on first load
- **Mappers** in `src/lib/` transform DB rows to app objects
- **Zustand store** centralizes all state with session persistence
- **Hash router** syncs URL with store state bidirectionally

## Key Routes

```
/#/population/worklist          — Patient worklist (default)
/#/population/queue             — Agent queue
/#/analytics                    — Executive dashboard
/#/analytics/{view}             — Specific analytics view
/#/builder                      — Agent workflow builder
/#/settings/agents              — Agent management
/#/settings/agents/goals        — Goal management
/#/settings/agents/goals/new    — Goal creation wizard
/#/settings/messages            — Chat/message settings
/#/settings/embedded-components — Domain registry & component library
```

## Recent Changes

### Supabase Persistence for Embedded Components (April 2026)
- **New tables**: `embed_domains`, `embed_components`, `audit_logs` with full Supabase CRUD
- All domain and component operations (create, update, delete, toggle, duplicate) persist to PostgreSQL
- Every action automatically logged to `audit_logs` table with entity tracking
- Audit Log Drawer fetches real data from DB with filter support
- Tab-level action buttons changed from primary to secondary variant (visual hierarchy fix)
- Data mapper (`embedMapper.js`) for snake_case/camelCase DB↔JS conversion
- Auto-seeding of embed tables with fallback data on first load

### Embedded Components Admin (April 2026)
- Domain Registry with enable/disable switch, audit log, CRUD modals
- Component Library table with 3-dot more menu (Edit, Audit Log, Duplicate, Delete)
- Component Wizard (4-step: Identity, Surfaces, Context, Preview) using shared Drawer
- Audit Log Drawer with Figma-matching timeline layout
- All native `<select>` replaced with Radix Select popover dropdowns
- Shared Input component created for platform-wide consistency
- Dismissible info/warning banners
- Routing support for `/#/settings/embedded-components/*`

## License

Proprietary — Fold Health, Inc.
