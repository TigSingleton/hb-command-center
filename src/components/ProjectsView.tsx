import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Project, Task, Agent } from '../types';

// Inline editable text field — click to edit, Enter to save, Escape to cancel
function EditableField({ value, placeholder, onSave, multiline, className }: {
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = () => {
    if (draft !== value) onSave(draft);
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); }
    if (e.key === 'Escape') cancel();
  };

  if (!editing) {
    return (
      <div
        className={cn('cursor-text px-1.5 py-1 -mx-1.5 hover:bg-zinc-800/60 transition-colors', className)}
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Click to edit"
      >
        {value || <span className="text-zinc-600 italic">{placeholder}</span>}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={save}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        rows={3}
        className={cn('w-full bg-zinc-800 border border-zinc-600 px-2 py-1.5 text-zinc-200 resize-y focus:outline-none focus:border-amber-500/50 placeholder-zinc-600', className)}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={handleKey}
      onBlur={save}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
      className={cn('w-full bg-zinc-800 border border-zinc-600 px-2 py-1 text-zinc-200 focus:outline-none focus:border-amber-500/50 placeholder-zinc-600', className)}
    />
  );
}

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  agents: Agent[];
  onNavigateToTask: () => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onOpenProject?: (projectId: string) => void;
}

type ViewMode = 'cards' | 'list';
type SortField = 'name' | 'date' | 'progress' | 'department' | 'tasks';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS: Project['status'][] = ['active', 'paused', 'completed', 'archived'];
const ALL_STATUSES = 'all';

export function ProjectsView({ projects, tasks, agents, onNavigateToTask, onUpdateProject, onOpenProject }: ProjectsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>(ALL_STATUSES);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('department');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const departments = useMemo(() => [...new Set(projects.map(p => p.department))].sort(), [projects]);

  const getProjectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

  const getAssigneeName = (id: string) => {
    if (id === 'tiger') return 'Tiger';
    const agent = agents.find(a => a.id === id);
    return agent ? `${agent.emoji} ${agent.name}` : id;
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (deptFilter !== ALL_STATUSES) {
      result = result.filter(p => p.department === deptFilter);
    }
    if (statusFilter !== ALL_STATUSES) {
      result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [projects, deptFilter, statusFilter]);

  // Sorted projects
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'date': {
          const da = a.targetDate || '9999-12-31';
          const db = b.targetDate || '9999-12-31';
          cmp = da.localeCompare(db);
          break;
        }
        case 'progress': {
          const pa = getProjectTasks(a.id);
          const pb = getProjectTasks(b.id);
          const progA = pa.length > 0 ? pa.filter(t => t.status === 'completed').length / pa.length : 0;
          const progB = pb.length > 0 ? pb.filter(t => t.status === 'completed').length / pb.length : 0;
          cmp = progA - progB;
          break;
        }
        case 'department':
          cmp = a.department.localeCompare(b.department);
          if (cmp === 0) cmp = a.title.localeCompare(b.title);
          break;
        case 'tasks': {
          const ta = getProjectTasks(a.id).length;
          const tb = getProjectTasks(b.id).length;
          cmp = ta - tb;
          break;
        }
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [filteredProjects, sortField, sortDir, tasks]);

  // Stats
  const totalTasks = tasks.filter(t => t.projectId).length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [projects]);

  const handleStatusChange = (projectId: string, newStatus: Project['status']) => {
    onUpdateProject(projectId, { status: newStatus });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ─── List row renderer ───
  const renderListRow = (project: Project) => {
    const projectTasks = getProjectTasks(project.id);
    const doneTasks = projectTasks.filter(t => t.status === 'completed');
    const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;

    return (
      <div
        key={project.id}
        className="flex items-center gap-4 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors"
        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
        onDoubleClick={() => onOpenProject?.(project.id)}
      >
        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/15 text-amber-400 shrink-0 w-14 text-center">
          {project.shortCode}
        </span>
        <span className="text-sm text-zinc-200 flex-1 truncate">{project.title.replace(/^PR\.\w+\s*\|\s*/, '')}</span>
        <span className="text-[10px] text-zinc-500 w-20 text-right shrink-0">{project.department}</span>
        <div className="w-24 shrink-0 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-zinc-800 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] text-zinc-500 w-8 text-right">{progress}%</span>
        </div>
        <span className="text-[10px] text-zinc-500 w-12 text-right shrink-0">
          {doneTasks.length}/{projectTasks.length}
        </span>
        <span className={cn(
          'text-[10px] px-2 py-0.5 shrink-0 w-20 text-center',
          project.status === 'active' && 'bg-emerald-500/15 text-emerald-400',
          project.status === 'paused' && 'bg-zinc-700 text-zinc-400',
          project.status === 'completed' && 'bg-blue-500/15 text-blue-400',
          project.status === 'archived' && 'bg-zinc-800 text-zinc-600',
        )}>
          {project.status}
        </span>
        {onOpenProject && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenProject(project.id); }}
            className="text-[10px] px-2 py-0.5 text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 transition-colors shrink-0"
          >
            Open
          </button>
        )}
      </div>
    );
  };

  // ─── Card renderer ───
  const renderProjectCard = (project: Project) => {
    const projectTasks = getProjectTasks(project.id);
    const pendingTasks = projectTasks.filter(t => t.status !== 'completed');
    const doneTasks = projectTasks.filter(t => t.status === 'completed');
    const isExpanded = expandedProject === project.id;

    return (
      <div
        key={project.id}
        className={cn(
          'bg-zinc-900 border border-zinc-800 transition-all',
          isExpanded && 'border-zinc-600'
        )}
      >
        <div
          className="p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
          onClick={() => setExpandedProject(isExpanded ? null : project.id)}
          onDoubleClick={() => onOpenProject?.(project.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/15 text-amber-400">
                {project.shortCode}
              </span>
              <h3 className="text-sm font-medium text-zinc-200">
                {project.title.replace(/^PR\.\w+\s*\|\s*/, '')}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {onOpenProject && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenProject(project.id); }}
                  className="text-[10px] px-2 py-0.5 text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  Open
                </button>
              )}
              <span className={cn(
                'text-[10px] px-2 py-0.5',
                project.status === 'active' && 'bg-emerald-500/15 text-emerald-400',
                project.status === 'paused' && 'bg-zinc-700 text-zinc-400',
                project.status === 'completed' && 'bg-blue-500/15 text-blue-400',
                project.status === 'archived' && 'bg-zinc-800 text-zinc-600',
              )}>
                {project.status}
              </span>
              <span className="text-zinc-600 text-xs">{isExpanded ? '▾' : '▸'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1">
              {projectTasks.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(doneTasks.length / projectTasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 w-16 text-right">
                    {doneTasks.length}/{projectTasks.length} done
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-zinc-600">No tasks tracked</span>
              )}
            </div>
          </div>

          {pendingTasks.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-amber-400/80">
                {pendingTasks.length} active task{pendingTasks.length !== 1 ? 's' : ''}
              </span>
              {pendingTasks.some(t => t.priority === 'critical') && (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/15 text-red-400">critical</span>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="border-t border-zinc-800/50">
            {/* Status selector */}
            <div className="px-4 py-3 border-b border-zinc-800/30">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Status</div>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(project.id, s); }}
                    className={cn(
                      'text-[11px] px-3 py-1.5 transition-all',
                      project.status === s
                        ? s === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : s === 'paused' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : s === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-zinc-700 text-zinc-300 border border-zinc-600'
                        : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-3 border-b border-zinc-800/30">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Description</div>
              <EditableField
                value={project.description || ''}
                placeholder="Click to add description..."
                onSave={(val) => onUpdateProject(project.id, { description: val })}
                multiline
                className="text-xs text-zinc-400 leading-relaxed"
              />
            </div>

            {/* Notes */}
            <div className="px-4 py-3 border-b border-zinc-800/30">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Notes / Updates</div>
              <EditableField
                value={project.notes || ''}
                placeholder="Click to add notes..."
                onSave={(val) => onUpdateProject(project.id, { notes: val })}
                multiline
                className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap"
              />
            </div>

            {/* Target Date */}
            <div className="px-4 py-3 border-b border-zinc-800/30">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Target Date</div>
              <EditableField
                value={project.targetDate || ''}
                placeholder="Click to set date (YYYY-MM-DD)..."
                onSave={(val) => onUpdateProject(project.id, { targetDate: val })}
                className="text-xs text-zinc-300"
              />
            </div>

            {/* Tasks list */}
            <div className="px-4 py-3">
              {projectTasks.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Tasks</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigateToTask(); }}
                      className="text-[10px] text-amber-400/60 hover:text-amber-400"
                    >
                      Manage tasks
                    </button>
                  </div>
                  {projectTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          task.priority === 'critical' && 'bg-red-400',
                          task.priority === 'high' && 'bg-amber-400',
                          task.priority === 'medium' && 'bg-blue-400',
                          task.priority === 'low' && 'bg-zinc-500',
                        )} />
                        <span className={cn(
                          'text-xs',
                          task.status === 'completed' ? 'text-zinc-600 line-through' : 'text-zinc-300'
                        )}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">{getAssigneeName(task.assignedTo)}</span>
                        <span className={cn(
                          'text-[9px] px-1.5 py-0.5',
                          task.status === 'pending' && 'bg-zinc-800 text-zinc-400',
                          task.status === 'in_progress' && 'bg-blue-500/15 text-blue-400',
                          task.status === 'review' && 'bg-amber-500/15 text-amber-400',
                          task.status === 'completed' && 'bg-emerald-500/15 text-emerald-400',
                        )}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-600">No tasks assigned to this project yet</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateToTask(); }}
                    className="text-[10px] text-amber-400/60 hover:text-amber-400 mt-1"
                  >
                    Go to Task Board
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Projects</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {projects.length} projects · {totalTasks} tasks assigned · {completedTasks} completed
          </p>
        </div>
        {/* View toggle */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              'px-3 py-1.5 text-xs transition-all',
              viewMode === 'cards' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
            )}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 text-xs transition-all',
              viewMode === 'list' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
            )}
          >
            List
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        {/* Department filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Dept</span>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-0.5">
            <button
              onClick={() => setDeptFilter(ALL_STATUSES)}
              className={cn(
                'px-2 py-1 text-[11px] transition-all',
                deptFilter === ALL_STATUSES ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
              )}
            >
              All
            </button>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={cn(
                  'px-2 py-1 text-[11px] transition-all',
                  deptFilter === dept ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Status</span>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-0.5">
            <button
              onClick={() => setStatusFilter(ALL_STATUSES)}
              className={cn(
                'px-2 py-1 text-[11px] transition-all',
                statusFilter === ALL_STATUSES ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
              )}
            >
              All {projects.length > 0 && <span className="text-zinc-600 ml-0.5">{projects.length}</span>}
            </button>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2 py-1 text-[11px] transition-all',
                  statusFilter === s ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
                )}
              >
                {s} {(statusCounts[s] || 0) > 0 && <span className="text-zinc-600 ml-0.5">{statusCounts[s]}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Sort</span>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-0.5">
            {([
              { field: 'name' as SortField, label: 'Name' },
              { field: 'department' as SortField, label: 'Dept' },
              { field: 'progress' as SortField, label: 'Progress' },
              { field: 'tasks' as SortField, label: 'Tasks' },
              { field: 'date' as SortField, label: 'Date' },
            ]).map(s => (
              <button
                key={s.field}
                onClick={() => toggleSort(s.field)}
                className={cn(
                  'px-2 py-1 text-[11px] transition-all',
                  sortField === s.field ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
                )}
              >
                {s.label}
                {sortField === s.field && (
                  <span className="ml-0.5 text-amber-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {departments.map((dept) => {
          const deptProjects = projects.filter(p => p.department === dept);
          const deptTasks = tasks.filter(t => {
            const project = projects.find(p => p.id === t.projectId);
            return project?.department === dept;
          });
          const deptDone = deptTasks.filter(t => t.status === 'completed').length;
          const isActive = deptFilter === dept;

          return (
            <div
              key={dept}
              className={cn(
                'bg-zinc-900 border p-4 cursor-pointer transition-all hover:border-zinc-600',
                isActive ? 'border-amber-500/40' : 'border-zinc-800'
              )}
              onClick={() => setDeptFilter(isActive ? ALL_STATUSES : dept)}
            >
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{dept}</div>
              <div className="text-lg font-semibold text-zinc-100 mb-0.5">{deptProjects.length}</div>
              <div className="text-[10px] text-zinc-600">
                {deptTasks.length} tasks · {deptDone} done
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedProjects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500">No projects match current filters.</p>
          <button
            onClick={() => { setDeptFilter(ALL_STATUSES); setStatusFilter(ALL_STATUSES); }}
            className="text-xs text-amber-400/70 hover:text-amber-400 mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* ─── List View ─── */
        <div>
          {/* List header */}
          <div className="flex items-center gap-4 px-4 py-2 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
            <span className="w-14 text-center">Code</span>
            <span className="flex-1">Project</span>
            <span className="w-20 text-right">Dept</span>
            <span className="w-24 text-right">Progress</span>
            <span className="w-12 text-right">Tasks</span>
            <span className="w-20 text-center">Status</span>
          </div>
          <div className="space-y-1 mt-1">
            {sortedProjects.map(renderListRow)}
          </div>

          {/* Expanded detail below list row */}
          {expandedProject && sortedProjects.find(p => p.id === expandedProject) && (
            <div className="mt-2 bg-zinc-900 border border-zinc-700">
              {renderProjectCard(sortedProjects.find(p => p.id === expandedProject)!)}
            </div>
          )}
        </div>
      ) : (
        /* ─── Card View ─── */
        <div className="grid grid-cols-2 gap-3">
          {sortedProjects.map(renderProjectCard)}
        </div>
      )}
    </div>
  );
}
