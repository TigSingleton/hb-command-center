import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Project, Task, Agent } from '../types';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  agents: Agent[];
  onBack: () => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: { title: string; description: string; priority: Task['priority']; assignedTo: string; projectId?: string }) => void;
  onDeleteTask: (taskId: string) => void;
}

const STATUS_OPTIONS: Project['status'][] = ['active', 'paused', 'completed', 'archived'];
const PRIORITY_OPTIONS: { value: Task['priority']; label: string; dot: string }[] = [
  { value: 'critical', label: 'Critical', dot: 'bg-red-400' },
  { value: 'high', label: 'High', dot: 'bg-amber-400' },
  { value: 'medium', label: 'Medium', dot: 'bg-blue-400' },
  { value: 'low', label: 'Low', dot: 'bg-zinc-500' },
];

// Inline editable text field — click to edit, Enter to save, Escape to cancel
function EditableText({ value, placeholder, onSave, multiline, className }: {
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
        className={cn('cursor-text rounded px-1.5 py-1 -mx-1.5 hover:bg-zinc-800/60 transition-colors', className)}
        onClick={() => setEditing(true)}
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
        placeholder={placeholder}
        rows={3}
        className={cn('w-full bg-zinc-800 border border-zinc-600 px-2 py-1.5 text-zinc-200 resize-y focus:outline-none focus:border-amber-500/50 placeholder-zinc-600 rounded', className)}
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
      placeholder={placeholder}
      className={cn('w-full bg-zinc-800 border border-zinc-600 px-2 py-1 text-zinc-200 focus:outline-none focus:border-amber-500/50 placeholder-zinc-600 rounded', className)}
    />
  );
}

export function ProjectDetail({
  project, tasks, agents, onBack,
  onUpdateProject, onUpdateTaskStatus, onUpdateTask, onCreateTask, onDeleteTask,
}: ProjectDetailProps) {
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newAssignee, setNewAssignee] = useState('tiger');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const newTaskRef = useRef<HTMLInputElement>(null);

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const filteredTasks = taskFilter === 'all' ? projectTasks : projectTasks.filter(t => t.status === taskFilter);
  const doneTasks = projectTasks.filter(t => t.status === 'completed');
  const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;

  const getAssigneeName = (id: string) => {
    if (id === 'tiger') return 'Tiger';
    const agent = agents.find(a => a.id === id);
    return agent ? `${agent.emoji} ${agent.name}` : id;
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    onCreateTask({
      title: newTitle.trim(),
      description: newTitle.trim(),
      priority: newPriority,
      assignedTo: newAssignee,
      projectId: project.id,
    });
    setNewTitle('');
    setNewPriority('medium');
    setNewAssignee('tiger');
    setShowNewTask(false);
  };

  const statusCounts: Record<string, number> = {};
  projectTasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  return (
    <div className="flex-1 overflow-auto bg-zinc-950">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 hover:bg-zinc-800/50 rounded">
          ← Projects
        </button>
        <span className="text-zinc-700">|</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/15 text-amber-400">{project.shortCode}</span>
        <h1 className="text-sm font-medium text-zinc-200">{project.title.replace(/^PR\.\w+\s*\|\s*/, '')}</h1>
        <span className={cn(
          'text-[10px] px-2 py-0.5 ml-auto',
          project.status === 'active' && 'bg-emerald-500/15 text-emerald-400',
          project.status === 'paused' && 'bg-zinc-700 text-zinc-400',
          project.status === 'completed' && 'bg-blue-500/15 text-blue-400',
          project.status === 'archived' && 'bg-zinc-800 text-zinc-600',
        )}>
          {project.status}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Progress</div>
            <div className="text-lg font-semibold text-zinc-100">{progress}%</div>
            <div className="h-1 bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Tasks</div>
            <div className="text-lg font-semibold text-zinc-100">{projectTasks.length}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Completed</div>
            <div className="text-lg font-semibold text-emerald-400">{doneTasks.length}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">In Progress</div>
            <div className="text-lg font-semibold text-blue-400">{statusCounts['in_progress'] || 0}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Department</div>
            <div className="text-sm font-medium text-zinc-200 mt-1">{project.department}</div>
          </div>
        </div>

        {/* Two-column layout: Info + Tasks */}
        <div className="grid grid-cols-3 gap-6">

          {/* Left column — Project info (click-to-edit) */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Status</div>
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => onUpdateProject(project.id, { status: s })}
                    className={cn(
                      'text-[11px] px-3 py-1.5 transition-all border',
                      project.status === s
                        ? s === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : s === 'paused' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : s === 'completed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-zinc-700 text-zinc-300 border-zinc-600'
                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-800 hover:text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Description</div>
              <EditableText
                value={project.description || ''}
                placeholder="Click to add description..."
                onSave={(val) => onUpdateProject(project.id, { description: val })}
                multiline
                className="text-xs text-zinc-400 leading-relaxed"
              />
            </div>

            {/* Notes */}
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Notes / Updates</div>
              <EditableText
                value={project.notes || ''}
                placeholder="Click to add notes..."
                onSave={(val) => onUpdateProject(project.id, { notes: val })}
                multiline
                className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap"
              />
            </div>

            {/* Target Date */}
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Target Date</div>
              <EditableText
                value={project.targetDate || ''}
                placeholder="Click to set date (YYYY-MM-DD)..."
                onSave={(val) => onUpdateProject(project.id, { targetDate: val })}
                className="text-xs text-zinc-300"
              />
            </div>
          </div>

          {/* Right column — Tasks (2/3 width) */}
          <div className="col-span-2">
            <div className="bg-zinc-900 border border-zinc-800">
              {/* Tasks header */}
              <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-200">Tasks</span>
                  <div className="flex gap-1 bg-zinc-800/50 p-0.5 rounded">
                    {[
                      { key: 'all', label: 'All', count: projectTasks.length },
                      { key: 'pending', label: 'Pending', count: statusCounts['pending'] || 0 },
                      { key: 'in_progress', label: 'Active', count: statusCounts['in_progress'] || 0 },
                      { key: 'review', label: 'Review', count: statusCounts['review'] || 0 },
                      { key: 'completed', label: 'Done', count: doneTasks.length },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setTaskFilter(f.key)}
                        className={cn(
                          'px-2 py-0.5 text-[10px] rounded transition-all',
                          taskFilter === f.key ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
                        )}
                      >
                        {f.label} {f.count > 0 && <span className="text-zinc-600 ml-0.5">{f.count}</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { setShowNewTask(!showNewTask); setTimeout(() => newTaskRef.current?.focus(), 50); }}
                  className={cn(
                    'text-[10px] px-2.5 py-1 transition-all border rounded',
                    showNewTask
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'text-zinc-400 border-zinc-700 hover:text-zinc-300 hover:border-zinc-600'
                  )}
                >
                  + Add Task
                </button>
              </div>

              {/* New task inline form */}
              {showNewTask && (
                <div className="px-4 py-3 border-b border-amber-500/15 bg-amber-500/[0.02]">
                  <div className="flex gap-2 items-center">
                    <input
                      ref={newTaskRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTask();
                        if (e.key === 'Escape') { setShowNewTask(false); setNewTitle(''); }
                      }}
                      placeholder="Task title — Enter to create"
                      className="flex-1 bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 rounded"
                    />
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                      className="bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none rounded"
                    >
                      {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <select
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none rounded"
                    >
                      <option value="tiger">Tiger</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
                    </select>
                    <button
                      onClick={handleCreateTask}
                      disabled={!newTitle.trim()}
                      className={cn(
                        'text-[10px] px-3 py-1.5 rounded transition-all',
                        newTitle.trim() ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'text-zinc-700 cursor-not-allowed'
                      )}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Task list */}
              <div className="divide-y divide-zinc-800/30">
                {filteredTasks.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-xs text-zinc-600">{projectTasks.length === 0 ? 'No tasks yet. Click "+ Add Task" to get started.' : 'No tasks match this filter.'}</p>
                  </div>
                ) : filteredTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    agents={agents}
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    getAssigneeName={getAssigneeName}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual task row with inline editing
function TaskRow({ task, agents, onUpdateTaskStatus, onUpdateTask, onDeleteTask, confirmDelete, setConfirmDelete, getAssigneeName }: {
  task: Task;
  agents: Agent[];
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  getAssigneeName: (id: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusActions: Record<string, { next: Task['status']; label: string; color: string }> = {
    pending: { next: 'in_progress', label: 'Start', color: 'text-blue-400 bg-blue-500/15 hover:bg-blue-500/25' },
    in_progress: { next: 'review', label: 'Review', color: 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25' },
    review: { next: 'completed', label: 'Complete', color: 'text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25' },
  };

  const action = statusActions[task.status];

  return (
    <div className={cn('transition-colors', expanded && 'bg-zinc-800/20')}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Priority dot */}
        <span className={cn(
          'w-2 h-2 rounded-full shrink-0',
          task.priority === 'critical' && 'bg-red-400',
          task.priority === 'high' && 'bg-amber-400',
          task.priority === 'medium' && 'bg-blue-400',
          task.priority === 'low' && 'bg-zinc-500',
        )} />

        {/* Title */}
        <span className={cn(
          'text-xs flex-1',
          task.status === 'completed' ? 'text-zinc-600 line-through' : 'text-zinc-300'
        )}>
          {task.title}
        </span>

        {/* Assignee */}
        <span className="text-[10px] text-zinc-500 w-24 text-right shrink-0">{getAssigneeName(task.assignedTo)}</span>

        {/* Status badge */}
        <span className={cn(
          'text-[9px] px-2 py-0.5 w-20 text-center shrink-0',
          task.status === 'pending' && 'bg-zinc-800 text-zinc-400',
          task.status === 'in_progress' && 'bg-blue-500/15 text-blue-400',
          task.status === 'review' && 'bg-amber-500/15 text-amber-400',
          task.status === 'completed' && 'bg-emerald-500/15 text-emerald-400',
        )}>
          {task.status.replace('_', ' ')}
        </span>

        {/* Quick action */}
        {action && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateTaskStatus(task.id, action.next); }}
            className={cn('text-[9px] px-2 py-0.5 transition-all shrink-0 rounded', action.color)}
          >
            {action.label}
          </button>
        )}

        <span className="text-zinc-700 text-[10px] shrink-0">{expanded ? '▾' : '▸'}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-3 pl-9 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Title edit */}
          <div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Title</div>
            <EditableText
              value={task.title}
              placeholder="Task title..."
              onSave={(val) => onUpdateTask(task.id, { title: val })}
              className="text-xs text-zinc-300"
            />
          </div>

          {/* Description edit */}
          <div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Description</div>
            <EditableText
              value={task.description}
              placeholder="Click to add description..."
              onSave={(val) => onUpdateTask(task.id, { description: val })}
              multiline
              className="text-[11px] text-zinc-400 leading-relaxed"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Priority */}
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Priority</div>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => onUpdateTask(task.id, { priority: p.value })}
                    className={cn(
                      'text-[9px] px-2 py-0.5 transition-all border rounded',
                      task.priority === p.value
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-400'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Assignee</div>
              <select
                value={task.assignedTo}
                onChange={(e) => onUpdateTask(task.id, { assignedTo: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300 focus:outline-none rounded"
              >
                <option value="tiger">Tiger</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
              </select>
            </div>

            {/* Delete */}
            <div className="ml-auto">
              {confirmDelete === task.id ? (
                <div className="flex gap-1 items-center">
                  <span className="text-[9px] text-red-400">Delete?</span>
                  <button onClick={() => { onDeleteTask(task.id); setConfirmDelete(null); }} className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Yes</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-[9px] px-1.5 py-0.5 text-zinc-500 hover:text-zinc-400">No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(task.id)} className="text-[9px] px-2 py-0.5 text-zinc-600 hover:text-red-400 transition-colors">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

