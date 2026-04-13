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

### Astrana Plum Theme (April 2026)
- New `[data-theme="plum"]` block in `src/tokens/tokens.css`. Primary palette anchored at `#6C0C46` (primary-300) with deep-plum chrome for the sidebar (`#2A0519` / `#4A0A30`). Neutral, secondary (orange), and status tokens inherit from `:root`.
- Registered as `'plum'` in `THEME_VALUES`, the `index.html` inline-script allowlist, and `ThemePicker` OPTIONS (label "Astrana Plum", crown-star icon).

### Blue Theme + Chat Settings Table Polish (April 2026)
- **Blue theme** — new `[data-theme="blue"]` block in `src/tokens/tokens.css` with a full parallel primary palette anchored at `#007BFF` (primary-300). Sidebar chrome retinted to dark navy for cohesion; secondary (orange), neutral, and status tokens inherit from `:root`.
- **ThemePicker** gains a "Blue" option (palette icon). `THEME_VALUES` in `src/lib/theme.js` extended, inline script in `index.html` updated to pass new theme values through, and `getResolvedTheme` returns any named palette as-is. Adding future palettes is append-only: new entry in `THEME_VALUES` + `OPTIONS` + a matching `[data-theme="<name>"]` block.
- **ChatSettingsPanel table** — row `borderBottom` and action-menu divider moved from literal `#EAECF0` to `var(--neutral-100)`; Location and Last Updated columns now use `var(--neutral-400)` + `13px` so they match the other columns (previously faint gray at `var(--neutral-200)`/`12px`).

### Theme Picker → Dropdown + Calendar Theme Sync + Stray-Hex Fixes (April 2026)
- **ThemePicker is now a dropdown** (`src/components/ThemePicker`) instead of a segmented Light/Dark/System row. Designed for future themes — append to `OPTIONS` and add a matching `[data-theme="<name>"]` block in `tokens.css`.
- **schedule-x calendar follows app theme** — `CalendarView.jsx` reads `resolvedTheme` from `useAppStore`, passes `isDark` at init, and calls `calendarApp.setTheme()` on theme flips.
- **Primary button text** (TopBar `.btnPrimary`) reverted from `var(--neutral-0)` (which inverts) to literal `#fff`. Text on `var(--primary-300)` purple should be white in BOTH themes.
- **`var(--neutral-900, #16181d)` regressions fixed** (`AccountPanel.module.css` ×3 + `CallQueueDrawer.module.css` ×1) — `--neutral-900` doesn't exist; fallback `#16181d` was making titles ("Administrative Role", "Roles", agent name, etc.) invisible on dark surfaces. Replaced with `var(--neutral-500)`.
- **SystemHealthStrip** background tokenized: `#fafbff` → `var(--neutral-50)`.

### Dark-Mode Tokenization Sweep — Forms, Bars, Toasts, Calendar, Drawers & Goals (April 2026)
- **Shared form primitives** (`Input`, `Select`, `Checkbox`) — replaced hardcoded `bg-white` / `background: #fff` with `var(--neutral-0)` so triggers, dropdowns, and unchecked checkboxes flip with the theme everywhere they're consumed.
- **BulkBar** (`BulkBar.module.css`) — surface and inner buttons now use `var(--neutral-0)`; no more white slab on a dark page.
- **Toasts** (`AppLayout.jsx`) — default toast text moved to `var(--neutral-0)` (inverts cleanly with `var(--neutral-500)` background); success toast switched from literal `#059669` to `var(--status-success)` (theme-aware brighter green in dark).
- **Calendar** (`CalendarView.module.css`) — schedule-x `--sx-color-surface` now points at `var(--neutral-0)`; user-picker trigger and dropdown tokenized; past-day overlay gets a dark-tinted variant under `[data-theme="dark"]`.
- **Preferences (User Profile) Drawer** — warm-cream gradient on the `editHeader` is overridden to a solid dark surface in dark mode (titles read clearly); avatar-upload border tokenized; verified-check icon swapped to `var(--status-success)`.
- **GoalsPanel** — every `background: #fff` (cards, stat boxes, drawer steps, wizard, form inputs) replaced with `var(--neutral-0)`, fixing the white-on-white "Passed / Failed" stats in dark mode.
- **Settings panels sweep** — `AgentsTable`, `CreateAgentDrawer`, `EmbeddedComponents`, `AccountPanel`, `BusinessHoursDrawer`, `ChatSettingsPanel`, `ComponentWizardDrawer`, `EscalationPolicyPanel`, `FeatureTogglesPanel`, `GroupDetailDrawer`, `KnowledgeBasePanel`, `PracticeConfigPanel`, `AgentRulesDrawer` — all literal `#fff` backgrounds and stray neutral/status hexes converted to design tokens; info-box copy colors (`#1E40AF`/`#92400E`/`#B45309`/`#065F46`) mapped to their `var(--status-*)` counterparts.

### Dark Theme + Extensible Color Theming System (April 2026)
- **Dark mode**: full dark palette added as a `[data-theme="dark"]` override in `src/tokens/tokens.css`. Redefines every neutral, primary, secondary, and status token for dark surfaces; inverts text colors; keeps the Sidebar as theme-invariant dark chrome.
- **Theme picker in profile popover**: new `ThemePicker` segmented control (Light / Dark / System) between Switch Account and Log Out. System mode live-follows OS `prefers-color-scheme`.
- **Pure-module theme system** at `src/lib/theme.js`: `applyTheme()`, `getResolvedTheme()`, `getStoredTheme()`, `subscribeToSystem()`, `initTheme()`. Theme persisted to `localStorage['theme']`; first-visit default is Light.
- **Zero-flash initial paint**: inline blocking script in `index.html` reads localStorage and sets `<html data-theme="...">` + `.dark` class BEFORE React mounts.
- **Store integration**: `useAppStore` gains `theme`, `resolvedTheme`, `setTheme`, and a `matchMedia`-backed subscription for System mode.
- **Smooth 200ms cross-fade** on theme flips (background/color/border/fill/stroke/box-shadow), scoped on body + `*`, with `prefers-reduced-motion` honored.
- **Tailwind v4 `@custom-variant dark`** registered so `dark:` utility prefix works; shadcn primitives flip automatically because their semantic tokens map to design tokens.
- **Deep color cleanup**: ~150 hardcoded hex, rgba, and brand-literal color values across `src/` replaced with design tokens (`var(--*)`) or `color-mix()` derivatives of existing tokens, so the entire platform transitions cohesively in both themes.
- **New tokens** added to support theming: `--shadow-popover / drawer / card`, `--status-success-bright`, `--button-danger-bg`, `--button-info-bg`, `--surface-overlay`, `--sidebar-bg / fg / fg-muted / hover-bg / active-bg / active-border / active-overlay / active-overlay-border`.

### Agent Call Queue Drawer + Updated Agent Actions (April 2026)
- Redesigned agent listing action buttons: **Call Queue**, **Call Analytics**, **Edit Agent** (pencil icon), **More Options**
- All action buttons now show tooltips on hover
- New **CallQueueDrawer** component with 3 tabs: Ongoing Call, In Queue, Call Log
- **Ongoing Call tab**: shows active calls with member info, live call duration (green), Live Transcript button, listen icon, and more options
- **In Queue tab**: shows queued members with priority ordering, Call Order reorder buttons (up/down arrows), remove from queue, and more options
- Agent banner in drawer shows agent name/role with Edit Configuration and Stop buttons
- Tab bar includes refresh, filter, and search action buttons

### Audit Log Across All Settings + Widget Ordering (April 2026)
- Audit log support added to **Agents**, **Goals**, and **Chat Settings** tables
- All CRUD operations (create, update, delete) automatically logged to `audit_logs` table
- Audit Log button (history icon) in table actions for all entity types
- Rich diff display: status badges (Enabled→Disabled), text strikethrough (old→new)
- Widget Card placement: sortable widget list shows existing widgets in selected tab
- Tab widgets data from patient profile Excel (11 tabs, 50+ widgets)
- User's full name (from Supabase auth metadata) shown in audit entries
- "(Current User)" label for entries matching the logged-in user

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
