# AI Session Reference — CEA Command Center

This document is for AI assistants (Claude, etc.) working on this project. It contains everything you need to make changes without re-reading every file.

## Critical Constraints

1. **IIFE build format** — This app runs from `file://` protocol. ES modules break. Vite config uses `format: 'iife'` and `inlineDynamicImports: true`.

2. **Single HTML output** — After building, `node bundle.cjs` inlines all JS/CSS into `cea-dashboard.html`. This one file IS the deliverable.

3. **No npm install in Cowork** — npm/pnpm install often timeout in Cowork sessions. If `node_modules/` exists, use it. If not, try `pnpm install` with a long timeout. All solutions must work with what's already installed.

4. **Zero external runtime deps** — Everything must be bundled. No CDN links, no dynamic imports, no lazy loading. Markdown rendering in ChatInterface is hand-rolled (no marked/remark).

5. **Supabase project**: `gusdhnpsjmpueevnivsi` (HeartBased Media HQ). Edge functions `cea-api` and `cea-brain` are public (no auth token needed).

## File-by-File Reference

### src/types.ts
All data interfaces. When adding new fields, update both the interface here AND the mapper function in App.tsx.

Key enums embedded in types:
- Agent.status: `'active' | 'idle' | 'working' | 'error' | 'spawning'`
- Task.priority: `'critical' | 'high' | 'medium' | 'low'`
- Task.status: `'pending' | 'in_progress' | 'review' | 'completed'`
- Project.status: `'active' | 'paused' | 'completed' | 'archived'`
- Goal.status: `'on-track' | 'at-risk' | 'ahead' | 'behind'`
- FeatureRequest.status: `'new' | 'acknowledged' | 'in_progress' | 'done' | 'dismissed'`
- FeatureRequest.priority: `'low' | 'medium' | 'high' | 'critical'`
- ViewType: `'dashboard' | 'agents' | 'agent-detail' | 'tasks' | 'projects' | 'project-detail' | 'chat' | 'strategy' | 'ideas'`

### src/api.ts
Thin HTTP client. Every function calls `apiFetch()` which hits the Supabase edge function URL with query params. Pattern:

```typescript
// Read:  GET  cea-api?action=tasks
// Write: POST cea-api?action=update-task  { body: JSON }
// Chat:  POST cea-brain                   { message, thread_id }
```

Feature request endpoints: `feature-requests` (GET), `create-feature-request`, `update-feature-request`, `delete-feature-request` (POST).
Agent profile endpoint: `update-agent` (POST) — updates system_prompt, functional_name, tool_access, is_active.

### src/App.tsx
The "brain" of the app. ~690 lines. Contains:

**Data loading** (lines ~85-170): `loadLiveData()` fetches agents, tasks, projects, goals from Supabase in parallel. Falls back to mock data on failure.

**Mapper functions** (lines ~15-82): `mapAgent()`, `mapTask()`, `mapProject()`, `mapGoal()` transform Supabase rows into TypeScript interfaces.

**Handler functions** (lines ~170-380): Every write operation has a `handleX` function that:
1. Updates local state optimistically
2. Calls the API in background
3. Catches errors silently (logs to console)

Key handlers:
- `handleUpdateTaskStatus(taskId, status)` — updates task status
- `handleUpdateTask(taskId, updates)` — updates task title/description/priority/assignee/project
- `handleCreateTask({title, description, priority, assignedTo, projectId})` — creates new task
- `handleDeleteTask(taskId)` — deletes task
- `handleUpdateProject(projectId, updates)` — updates project fields
- `handleUpdateGoal(goalId, updates)` — updates goal progress/status
- `handleSendMessage(content)` — sends message to CEA brain, gets response
- `handleSpawnAgent(name, role, prompt)` — spawns new agent persona
- `handleCreateFeatureRequest(data)` — creates idea/feature request
- `handleUpdateFeatureRequest(id, updates)` — updates feature request status/priority/title
- `handleDeleteFeatureRequest(id)` — deletes feature request
- `handleUpdateAgent(agentId, updates)` — updates agent profile (prompt, name, tools, active state)

**Global UI**: IdeaFAB (floating action button, bottom-right) and IdeaCaptureModal always rendered. Cmd+I toggles modal.

**View routing** (lines ~590-685): Renders Sidebar + current view. `project-detail` uses `selectedProjectId`, `agent-detail` uses `selectedAgentId`.

### src/data.ts
Mock/fallback data. Used when Supabase is unreachable. Contains realistic sample agents, tasks, projects, messages, KPIs, activity items matching HeartBased.io's actual structure. Departments: Executive Office, Engineering & Systems, Growth & Revenue, Media Production.

### src/components/Sidebar.tsx
Navigation. Maps `ViewType` values to nav items with icons. Highlights current view. Shows badge counts for agents, tasks, and new ideas (violet badge).

### src/components/Dashboard.tsx
Read-only overview. Four sections: KPI cards, activity feed, agent status cards, recent tasks. No write operations.

### src/components/TaskBoard.tsx
Kanban with 4 columns. Key implementation details:

**Drag and drop**: Uses `draggedTaskId` and `dragOverColumn` state. Handlers: `handleDragStart`, `handleDragEnd`, `handleDragOver`, `handleDragLeave`, `handleDrop`. Cards have `draggable` attribute (disabled when expanded or editing). Columns highlight with status-colored borders during drag.

**Editing**: Click title or description text to edit inline. `editingField` state tracks `{ taskId, field }`. `editValue` holds the draft. Enter saves, Escape cancels, onBlur saves. No "Edit" button.

**Create form**: Toggle with "+ New Task" button. Title, description, priority dropdown, assignee dropdown, project dropdown. Enter to create.

### src/components/ProjectsView.tsx
Two view modes (cards/list), filter bar (department + status), sort bar (name/dept/progress/tasks/date).

**EditableField component** (defined at top of file): Click-to-edit pattern matching ProjectDetail's EditableText. Used for description, notes, target date in expanded project cards.

**List rows**: Show shortCode, title, department, progress bar, task count, status badge, "Open" button. Double-click also opens project detail.

**Card view**: Expandable cards with status selector, editable description/notes/date, task list.

### src/components/ProjectDetail.tsx
Dedicated project view. Entered via "Open" on ProjectsView.

**EditableText component** (defined at top of file): The canonical click-to-edit implementation. Properties: `value`, `placeholder`, `onSave`, `multiline?`, `className?`. Auto-focuses on edit, Enter saves (Shift+Enter for newline in multiline), Escape cancels, onBlur saves.

**TaskRow sub-component** (defined at bottom of file): Individual task row for the task list. Expandable with inline editing via EditableText, priority toggles, assignee dropdown, status action button, delete with confirmation.

**Layout**: Sticky top bar (back button, shortCode, title, status), stats row (5 cards), two-column grid (1/3 info + 2/3 tasks).

### src/components/ChatInterface.tsx
Chat with The CEA. Renders markdown inline using regex replacements (bold, italic, headers, code blocks, lists, links). No external markdown library.

Thread management: `threadId` state persists across messages in a conversation. Sent with each request so CEA brain maintains context.

### src/components/Strategy.tsx
Goals view. Progress bars are clickable to edit (input appears inline, Enter saves). Status toggles are button groups. Initiatives listed under each goal.

### src/components/AgentDetail.tsx
Agent profile page. Entered via "View" on AgentHub. 4 tabs: Identity, Brain, Tools, Activity.
- **Identity**: Basic info, editable functional name (Enter to save), metrics grid
- **Brain**: Editable system prompt (click to edit, Save/Cancel buttons), behavioral notes placeholder
- **Tools**: Add/edit tool access (one per line), workflows placeholder
- **Activity**: Placeholder for future activity logging
- Activate/Deactivate toggle button in header

### src/components/IdeaCaptureModal.tsx
Exports two components:
- **IdeaCaptureModal**: Slide-up modal for quick idea capture. Title field (Enter to submit), expandable description, screenshot paste (Cmd+V), priority selector (low/medium/high/critical). Escape closes.
- **IdeaFAB**: Floating action button (bottom-right). Shows badge with count of "new" ideas. Tooltip shows Cmd+I shortcut.

### src/components/IdeasView.tsx
Feature request list with status filter tabs (All/New/Acknowledged/In Progress/Done/Dismissed). Each idea card is expandable with:
- Click-to-edit title and description (Enter saves, onBlur saves)
- Status buttons to change workflow state
- Priority buttons to re-prioritize
- Delete with confirmation
- Screenshot preview if attached
- Source view label and relative timestamps

### vite.config.ts
Key settings: `format: 'iife'`, `inlineDynamicImports: true`, `cssCodeSplit: false`, `assetsInlineLimit: 100000000` (inline all assets), `@` alias to `./src`.

### bundle.cjs
CommonJS script (NOT ESM — package.json has `"type": "module"` so this must be `.cjs`). Reads `dist/index.html`, finds all JS/CSS in `dist/assets/`, inlines them into one HTML file. Outputs to `./cea-dashboard.html`.

### scripts/inline-build.mjs
ESM alternative build bundler. Reads `dist/assets/` and produces standalone HTML. Usage: `node scripts/inline-build.mjs cea-dashboard.html`. Either this or bundle.cjs works — they produce identical output.

### tailwind.config.js
Extends default theme. Uses zinc scale for dark theme. Custom animations defined for loading states.

## Supabase Database Schema

The edge function `cea-api` queries these tables (based on the mapper functions in App.tsx):

### agent_personas
- `id` (uuid), `handle` (text, e.g. "@CEA"), `functional_name` (text), `system_prompt` (text), `is_active` (bool), `tool_access` (jsonb array), `created_at`

### tasks
- `id` (uuid), `description` (text), `priority` (int 1-5), `status` (text: "todo"/"in_progress"/"done"/"failed"), `assigned_to` (uuid FK to agent_personas), `project_id` (uuid FK to projects), `completed_at`, `created_at`

### projects
- `id` (uuid), `title` (text, format "PR.CODE | Name"), `description` (text), `status` (text), `dept_id` (uuid FK to departments), `lead_agent_id` (uuid), `target_date` (date), `metadata` (jsonb, contains `notes`), `created_at`

### departments
- `id` (uuid), `name` (text)

### cea_goals
- `id` (uuid), `title` (text), `progress` (int 0-100), `status` (text: "ahead"/"on-track"/"at-risk"/"behind"/"completed"), `owner_agent_id` (uuid), `target_date` (date), `initiatives` (jsonb array), `created_at`

### feature_requests
- `id` (uuid), `title` (text), `description` (text, nullable), `screenshot_url` (text, nullable), `source_view` (text, nullable), `status` (text: "new"/"acknowledged"/"in_progress"/"done"/"dismissed"), `priority` (text: "low"/"medium"/"high"/"critical"), `created_at`, `updated_at`

### cea_kpis
- `id` (uuid), `label` (text), `value` (text), `numeric_value` (float), `change_percent` (float), `trend` (text), `category` (text), `period` (text)

### activity_log
- `id` (uuid), `agent_id` (uuid), `action` (text), `detail` (text), `event_type` (text), `created_at`

### messages / threads
- Used by `cea-brain` for chat history. Thread ID maintains conversation context.

## Priority Mapping
Supabase uses integers 1-5. Frontend uses strings:
```
1 → critical
2 → high
3 → medium
4 → low
5 → low
```

## Status Mapping (Tasks)
Supabase uses different names than the frontend:
```
todo        → pending
in_progress → in_progress
done        → completed
failed      → review
```

## Common Gotchas

1. **Project shortCode parsing**: Project titles follow the format `PR.CODE | Display Name`. The shortCode is extracted with regex: `title.match(/^PR\.(\w+)/)?.[1]`. Display name is: `title.replace(/^PR\.\w+\s*\|\s*/, '')`.

2. **bundle.cjs output path**: Currently outputs to `./cea-dashboard.html` (same folder). If you move the project, this works anywhere.

3. **No CSS file in build**: Tailwind CSS is bundled into the JS file by Vite. The bundle script checks for CSS files but there usually aren't any separate ones.

4. **Agent emoji mapping**: Hardcoded in `App.tsx` `mapAgent()`. If new agents are added to Supabase, add their emoji mapping there.

5. **Fallback data**: If Supabase is down, the app renders with mock data from `data.ts`. The `isLive` flag in App.tsx shows whether data is live.

6. **EditableText vs EditableField**: Two implementations of the same pattern exist — `EditableText` in ProjectDetail.tsx and `EditableField` in ProjectsView.tsx. They're functionally identical. A future refactor could extract one to a shared location.

## Build & Deploy Checklist

```
1. Make changes to src/ files
2. npx vite build
3. node scripts/inline-build.mjs cea-dashboard.html  (or: node bundle.cjs)
4. Open cea-dashboard.html in browser to verify
5. git add . && git commit -m "description of changes"
```

**Cowork session note**: If build fails with `Cannot find module @rollup/rollup-linux-arm64-gnu`, run `npm install @rollup/rollup-linux-arm64-gnu --no-save` first. The node_modules were likely installed on macOS.

## Edge Function Version History

- **v1-v3**: Original CRUD (agents, tasks, projects, messages, KPIs, goals, activity, directives, spawns)
- **v4** (current): Added feature_requests CRUD, update-agent profile, update-task-full, delete-task, update-goal
