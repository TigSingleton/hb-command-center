# CEA Command Center — HeartBased.io

The CEA (Chief Executive Agent) Command Center is Tiger Singleton's operational dashboard for managing HeartBased.io through an AI-powered agent team. It's a single-page React app that compiles into one self-contained HTML file runnable from `file://` protocol — no server needed.

## Quick Start

### To run the dashboard
Open `cea-dashboard.html` in any browser. That's it. The file contains all HTML, CSS, and JS inline.

### To make changes and rebuild

```bash
# 1. Install dependencies (first time only)
pnpm install

# 2. Edit source files in src/

# 3. Build
npx vite build

# 4. Bundle into single HTML file
node bundle.cjs

# 5. Output: cea-dashboard.html (in this folder)
```

**Known issue**: `npm install` may timeout in some environments (Cowork sessions). If so, use `pnpm install` or copy `node_modules/` from a previous session.

## Architecture Overview

```
CEA Command Center/
├── src/
│   ├── App.tsx              # Root component — routing, state, API orchestration
│   ├── api.ts               # Supabase edge function client (all HTTP calls)
│   ├── types.ts             # TypeScript interfaces for all data models
│   ├── data.ts              # Fallback/mock data when API is unavailable
│   ├── main.tsx             # React entry point
│   ├── index.css            # Tailwind CSS imports
│   ├── lib/utils.ts         # cn() utility (shadcn/ui class merging)
│   ├── hooks/use-toast.ts   # Toast notification hook
│   └── components/
│       ├── Sidebar.tsx       # Left nav — view switching
│       ├── Dashboard.tsx     # Home view — KPIs, activity feed, agent status
│       ├── AgentHub.tsx      # Agent management — spawn, view, status
│       ├── TaskBoard.tsx     # Kanban board — drag-and-drop task management
│       ├── ProjectsView.tsx  # Project list/cards — filtering, sorting
│       ├── ProjectDetail.tsx # Single project dashboard — tasks, editing
│       ├── ChatInterface.tsx # Chat with The CEA (Claude Sonnet 4.5)
│       ├── Strategy.tsx      # Goals & strategy — progress tracking
│       └── ui/              # shadcn/ui primitives (button, card, dialog, etc.)
├── vite.config.ts           # Build config — IIFE format, inline imports
├── bundle.cjs               # Post-build script — inlines JS/CSS into one HTML
├── tailwind.config.js       # Tailwind theme config
├── cea-dashboard.html       # THE OUTPUT — single bundled file to open in browser
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── postcss.config.js
├── components.json          # shadcn/ui config
└── index.html               # Vite dev template
```

## Data Flow

```
Browser (file://) → App.tsx → api.ts → Supabase Edge Functions → PostgreSQL
                                              ↓
                                     cea-api (CRUD)
                                     cea-brain (AI Chat via Claude Sonnet 4.5)
```

### Supabase Backend
- **Project ID**: `gusdhnpsjmpueevnivsi`
- **Project Name**: HeartBased Media HQ
- **Edge Functions**:
  - `cea-api` — All CRUD operations (agents, tasks, projects, KPIs, goals, directives, activity)
  - `cea-brain` — Chat interface powered by Claude Sonnet 4.5, maintains thread context

### API Client (`src/api.ts`)
All API calls go through `apiFetch()` which hits `https://gusdhnpsjmpueevnivsi.supabase.co/functions/v1/cea-api` with an `?action=` query parameter. No auth tokens are required (edge functions are public). Actions include:

**Read**: `dashboard`, `agents`, `tasks`, `messages`, `kpis`, `goals`, `activity`
**Write**: `update-task`, `create-task`, `update-task-full`, `delete-task`, `spawn-agent`, `update-kpi`, `update-project`, `create-directive`, `update-goal`
**Chat**: `cea-brain` (POST with `{ message, thread_id }`)

### Data Mapping
Supabase returns raw database rows. `App.tsx` contains mapper functions that transform them into the TypeScript interfaces defined in `types.ts`:
- `mapAgent()` — maps `agent_personas` table rows to `Agent` interface
- `mapTask()` — maps `tasks` table rows to `Task` interface (resolves agent names, project codes)
- `mapProject()` — maps `projects` table rows to `Project` interface (resolves department names, task counts)
- `mapGoal()` — maps `goals` table rows to `Goal` interface (resolves owner names, initiatives)

## TypeScript Interfaces (`src/types.ts`)

| Interface | Key Fields | Used By |
|-----------|-----------|---------|
| `Agent` | id, name, role, emoji, status (`active`/`idle`/`working`/`error`/`spawning`) | AgentHub, Dashboard |
| `Task` | id, title, description, assignedTo, priority (`critical`/`high`/`medium`/`low`), status (`pending`/`in_progress`/`review`/`completed`), projectId | TaskBoard, ProjectDetail |
| `Project` | id, title, shortCode, status (`active`/`paused`/`completed`/`archived`), department, notes, targetDate | ProjectsView, ProjectDetail |
| `Goal` | id, title, progress (0-100), status (`on-track`/`at-risk`/`ahead`/`behind`), initiatives[] | Strategy |
| `KPI` | id, label, value, change, trend (`up`/`down`/`stable`) | Dashboard |
| `Message` | id, from, content, type (`message`/`directive`/`report`/`alert`/`system`) | ChatInterface |
| `ActivityItem` | id, agent, action, detail, type (`task`/`decision`/`report`/`spawn`/`alert`) | Dashboard |
| `ViewType` | `'dashboard'`/`'agents'`/`'tasks'`/`'projects'`/`'project-detail'`/`'chat'`/`'strategy'` | App, Sidebar |

## Component Guide

### App.tsx (Root)
Manages all application state and passes handlers down as props. Key state:
- `currentView` — which page is showing (ViewType)
- `agents`, `tasks`, `projects`, `goals`, `kpis`, `activity`, `messages` — data arrays
- `selectedProjectId` — for project-detail view routing
- `isLive` — whether data loaded from Supabase (vs fallback)
- `chatThread` — current chat thread ID

On mount, calls `loadLiveData()` which fetches everything from Supabase in parallel. If any call fails, falls back to mock data from `data.ts`.

### Sidebar.tsx
Left navigation panel. Highlights current view. Shows agent count and task count badges. Fixed width.

### Dashboard.tsx
Home view with four sections: KPI cards (top), activity feed (left), agent status grid (right), recent tasks. Read-only overview.

### TaskBoard.tsx
Kanban board with 4 columns: Pending, In Progress, Review, Completed.

**Key features**:
- HTML5 native drag-and-drop between columns (no library)
- Click task title or description to edit inline (Enter to save, Escape to cancel)
- Expand card for full editing: priority toggles, assignee dropdown, project selector, delete
- Filter by: All/My Tasks/Agent Tasks, and by project
- Create new tasks inline (Enter to save)

### ProjectsView.tsx
Two view modes: Cards and List. Both support:
- Filter by department and status
- Sort by name, department, progress, tasks, date
- "Open" button or double-click to enter ProjectDetail view
- Expand cards for inline editing (click-to-edit fields)

### ProjectDetail.tsx
Dedicated project dashboard. Two-column layout:
- Left (1/3): Status toggles, description, notes, target date — all click-to-edit with `EditableText` component
- Right (2/3): Task list with filter tabs, inline task creation, expandable task rows with full editing

### ChatInterface.tsx
Chat with The CEA (Claude Sonnet 4.5). Renders markdown inline (bold, italic, headers, code blocks, lists) without external dependencies. Maintains thread context via `thread_id`.

### Strategy.tsx
Strategic goals view. Shows mission statement, goal cards with progress bars, status toggle buttons, initiative lists. Click progress bar or percentage to edit. Connected to live `goals` table in Supabase.

## Build System

### Why IIFE?
The dashboard runs from `file://` protocol (double-click to open, no server). ES modules don't work over `file://`, so Vite is configured to output IIFE format:

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      format: 'iife',
      inlineDynamicImports: true,
    },
  },
}
```

### Bundle Process
After `npx vite build` creates `dist/assets/index-*.js` (and optionally `.css`), `bundle.cjs` reads those files and inlines them into a single HTML file. This produces `cea-dashboard.html` — one file, zero dependencies, works offline (except API calls).

## UX Patterns

### Click-to-Edit (EditableText / EditableField)
Used across ProjectDetail, ProjectsView, and TaskBoard. The pattern:
1. Non-editing state: text is displayed, `cursor-text`, subtle hover highlight
2. Click the text to enter edit mode
3. Input/textarea appears with current value, auto-focused
4. **Enter** saves (for single-line; Shift+Enter for newline in multiline)
5. **Escape** cancels
6. **onBlur** saves (clicking away also saves)
7. No "Edit" or "Save" buttons needed

### Drag and Drop (TaskBoard)
Native HTML5 DnD. Cards are `draggable` (disabled when expanded/editing). Columns highlight with status-colored borders when a card hovers over them. Drop triggers `onUpdateTaskStatus()`.

### Optimistic Updates
All writes update local state immediately, then fire the API call in the background. If the API fails, the UI will be stale until next refresh (acceptable tradeoff for responsiveness).

## Brand & Design Rules

- **Warm Charcoal**: #1A1614 (backgrounds)
- **Sage/Teal**: #5FB8A8 (accents)
- **Pink**: #FF64A6 (highlights)
- **Off-White**: #FAF7F5 (text on dark)
- Dark theme throughout (zinc-900/950 backgrounds, zinc-200/300/400 text)
- No emojis in user-facing content (emojis only used for agent identifiers in code)
- No spiritual jargon
- Minimal, functional UI — no decorative elements

## Working With Tiger

Tiger is a 2/4 Generator with Sacral authority:
- Ask binary Yes/No questions, not open-ended ones
- "Flow over Force" — low syntax patience, prefers action over planning
- Show working results, don't describe what you're going to do
- Keep explanations short and direct

## Common Tasks for AI Sessions

### Adding a new view/page
1. Create component in `src/components/YourView.tsx`
2. Add the view name to `ViewType` in `src/types.ts`
3. Import and render it in `App.tsx` (follow the pattern of existing views)
4. Add a nav item in `Sidebar.tsx`
5. Build and bundle

### Adding a new API action
1. Add the function in `src/api.ts` following the existing pattern
2. Add the handler in `App.tsx` (create a `handleX` callback, pass it down as props)
3. The edge function `cea-api` on Supabase needs a matching action handler

### Modifying the Supabase edge function
The edge functions are deployed to Supabase project `gusdhnpsjmpueevnivsi`. Use the Supabase MCP tools or CLI to view/deploy:
```
supabase functions deploy cea-api --project-ref gusdhnpsjmpueevnivsi
```

### Changing styles
Tailwind classes are used inline. The theme is configured in `tailwind.config.js`. shadcn/ui components are in `src/components/ui/` and can be customized there.

### Rebuilding after changes
```bash
npx vite build && node bundle.cjs
```
Output: `cea-dashboard.html` in this folder. That single file is the deliverable.
