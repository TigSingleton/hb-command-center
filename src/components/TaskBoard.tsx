import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Task, Agent, Project } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  agents: Agent[];
  projects: Project[];
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask?: (task: { title: string; description: string; priority: Task['priority']; assignedTo: string; projectId?: string }) => void;
  onDeleteTask?: (taskId: string) => void;
}

type FilterType = 'all' | 'tiger' | 'agents';

export function TaskBoard({ tasks, agents, projects, onUpdateTaskStatus, onUpdateTask, onCreateTask, onDeleteTask }: TaskBoardProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignedTo: 'tiger',
    projectId: '',
  });

  const filtered = tasks.filter(t => {
    if (filter === 'tiger' && t.assignedTo !== 'tiger') return false;
    if (filter === 'agents' && t.assignedTo === 'tiger') return false;
    if (projectFilter !== 'all') {
      if (projectFilter === 'none') return !t.projectId;
      return t.projectId === projectFilter;
    }
    return true;
  });

  const getSubTaskCount = (taskId: string) => tasks.filter(t => t.parentTaskId === taskId).length;
  const getParentTask = (task: Task) => task.parentTaskId ? tasks.find(t => t.id === task.parentTaskId) : null;

  const projectsWithTasks = projects.filter(p =>
    tasks.some(t => t.projectId === p.id)
  );

  const columns = [
    { key: 'pending', label: 'Pending', color: 'text-zinc-400', dropColor: 'border-zinc-400/50 bg-zinc-800/30' },
    { key: 'in_progress', label: 'In Progress', color: 'text-blue-400', dropColor: 'border-blue-400/50 bg-blue-500/5' },
    { key: 'review', label: 'Review', color: 'text-amber-400', dropColor: 'border-amber-400/50 bg-amber-500/5' },
    { key: 'completed', label: 'Completed', color: 'text-emerald-400', dropColor: 'border-emerald-400/50 bg-emerald-500/5' },
  ];

  const getAssigneeName = (id: string) => {
    if (id === 'tiger') return '🐯 Tiger';
    const agent = agents.find(a => a.id === id);
    return agent ? `${agent.emoji} ${agent.name}` : id;
  };

  const getAssignerName = (id: string) => {
    if (id === 'tiger') return 'Tiger';
    const agent = agents.find(a => a.id === id);
    return agent ? agent.name : id;
  };

  const startEdit = (taskId: string, field: string, currentValue: string) => {
    setEditingField({ taskId, field });
    setEditValue(currentValue);
  };

  const saveEdit = (taskId: string, field: string) => {
    if (!onUpdateTask) return;
    const updates: Partial<Task> = {};
    if (field === 'title') updates.title = editValue;
    if (field === 'description') updates.description = editValue;
    onUpdateTask(taskId, updates);
    setEditingField(null);
    setEditValue('');
  };

  const handlePriorityChange = (taskId: string, priority: Task['priority']) => {
    if (onUpdateTask) onUpdateTask(taskId, { priority });
  };

  const handleAssigneeChange = (taskId: string, assignedTo: string) => {
    if (onUpdateTask) onUpdateTask(taskId, { assignedTo });
  };

  const handleProjectChange = (taskId: string, projectId: string) => {
    if (onUpdateTask) {
      const project = projects.find(p => p.id === projectId);
      onUpdateTask(taskId, {
        projectId: projectId || undefined,
        projectName: project ? project.title.replace(/^PR\.\w+\s*\|\s*/, '') : undefined,
        projectShortCode: project?.shortCode || undefined,
      });
    }
  };

  const handleCreateTask = () => {
    if (!onCreateTask || !newTask.title.trim()) return;
    onCreateTask({
      title: newTask.title.trim(),
      description: newTask.description.trim() || newTask.title.trim(),
      priority: newTask.priority,
      assignedTo: newTask.assignedTo,
      projectId: newTask.projectId || undefined,
    });
    setNewTask({ title: '', description: '', priority: 'medium', assignedTo: 'tiger', projectId: '' });
    setShowCreateForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
      setConfirmDelete(null);
      setExpandedTask(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, field: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(taskId, field);
    }
    if (e.key === 'Escape') {
      setEditingField(null);
      setEditValue('');
    }
  };

  // ─── Drag and Drop handlers ───
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnKey);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're actually leaving the column (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        onUpdateTaskStatus(taskId, targetStatus as Task['status']);
      }
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, [tasks, onUpdateTaskStatus]);

  const priorityOptions: { value: Task['priority']; label: string; color: string }[] = [
    { value: 'critical', label: 'Critical', color: 'bg-red-400' },
    { value: 'high', label: 'High', color: 'bg-amber-400' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-400' },
    { value: 'low', label: 'Low', color: 'bg-zinc-500' },
  ];

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Task Board</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {tasks.filter(t => t.assignedTo === 'tiger' && t.status !== 'completed').length} tasks assigned to you ·
            {' '}{tasks.filter(t => t.assignedTo !== 'tiger' && t.status !== 'completed').length} delegated to agents
            {' '}· Drag cards between columns to update status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCreateTask && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={cn(
                'px-3 py-1.5 text-xs transition-all border',
                showCreateForm
                  ? 'bg-amber-500/25 text-amber-400 border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
              )}
            >
              + New Task
            </button>
          )}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-0.5">
            {(['all', 'tiger', 'agents'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs transition-all',
                  filter === f ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-400'
                )}
              >
                {f === 'all' ? 'All Tasks' : f === 'tiger' ? 'My Tasks' : 'Agent Tasks'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="mb-4 bg-zinc-900 border border-amber-500/20 p-4">
          <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-3">Create New Task</div>
          <div className="space-y-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title..."
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTask(); if (e.key === 'Escape') setShowCreateForm(false); }}
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-zinc-600"
            />
            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  className="bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  {priorityOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Assign to</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="tiger">Tiger</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Project</label>
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask(prev => ({ ...prev, projectId: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="">No project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.shortCode} — {p.title.replace(/^PR\.\w+\s*\|\s*/, '')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className={cn(
                  'px-3 py-1.5 text-xs transition-all border',
                  newTask.title.trim()
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-zinc-900 text-zinc-700 border-zinc-800 cursor-not-allowed'
                )}
              >
                Create Task
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-all"
              >
                Cancel
              </button>
              <span className="text-[10px] text-zinc-600 self-center ml-auto">Enter to save</span>
            </div>
          </div>
        </div>
      )}

      {/* Project filter row */}
      {projectsWithTasks.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Project:</span>
          <button
            onClick={() => setProjectFilter('all')}
            className={cn(
              'text-[10px] px-2 py-1 transition-all',
              projectFilter === 'all'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-400'
            )}
          >
            All
          </button>
          {projectsWithTasks.map(p => (
            <button
              key={p.id}
              onClick={() => setProjectFilter(projectFilter === p.id ? 'all' : p.id)}
              className={cn(
                'text-[10px] px-2 py-1 transition-all font-mono',
                projectFilter === p.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-400'
              )}
            >
              {p.shortCode}
            </button>
          ))}
          <button
            onClick={() => setProjectFilter(projectFilter === 'none' ? 'all' : 'none')}
            className={cn(
              'text-[10px] px-2 py-1 transition-all',
              projectFilter === 'none'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-400'
            )}
          >
            Unassigned
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-3 min-h-[500px]">
        {columns.map((col) => {
          const colTasks = filtered.filter(t => t.status === col.key);
          const isDropTarget = dragOverColumn === col.key && draggedTaskId !== null;
          // Don't highlight if dragging within same column
          const draggedTask = tasks.find(t => t.id === draggedTaskId);
          const isSameColumn = draggedTask?.status === col.key;

          return (
            <div
              key={col.key}
              className={cn(
                'border transition-all duration-150',
                isDropTarget && !isSameColumn
                  ? col.dropColor
                  : 'bg-zinc-900/50 border-zinc-800/50'
              )}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="px-3 py-2.5 border-b border-zinc-800/50 flex items-center justify-between">
                <span className={cn('text-xs font-medium', col.color)}>{col.label}</span>
                <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5">{colTasks.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[100px]">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={expandedTask !== task.id && editingField?.taskId !== task.id}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'bg-zinc-900 border border-zinc-800 p-3 transition-all hover:border-zinc-700',
                      expandedTask === task.id && 'border-zinc-600',
                      draggedTaskId === task.id && 'opacity-50',
                      expandedTask !== task.id && editingField?.taskId !== task.id && 'cursor-grab active:cursor-grabbing'
                    )}
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    {/* Project badge + sub-task indicators */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {task.projectShortCode && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-400/70">
                          {task.projectShortCode}
                        </span>
                      )}
                      {task.parentTaskId && (() => {
                        const parent = getParentTask(task);
                        return parent ? (
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500" title={`Sub-task of: ${parent.title}`}>
                            ↳ {parent.title.substring(0, 25)}{parent.title.length > 25 ? '...' : ''}
                          </span>
                        ) : null;
                      })()}
                      {getSubTaskCount(task.id) > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400/70">
                          {getSubTaskCount(task.id)} sub-task{getSubTaskCount(task.id) > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2 mb-1.5">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        task.priority === 'critical' && 'bg-red-400',
                        task.priority === 'high' && 'bg-amber-400',
                        task.priority === 'medium' && 'bg-blue-400',
                        task.priority === 'low' && 'bg-zinc-500',
                      )} />
                      {editingField?.taskId === task.id && editingField.field === 'title' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, task.id, 'title')}
                          onBlur={() => saveEdit(task.id, 'title')}
                          className="text-xs text-zinc-200 bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 w-full focus:outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="text-xs text-zinc-300 leading-snug hover:text-zinc-100 cursor-text"
                          onClick={(e) => { e.stopPropagation(); startEdit(task.id, 'title', task.title); }}
                          title="Click to edit"
                        >
                          {task.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-3.5">
                      <span className="text-[10px] text-zinc-500">{getAssigneeName(task.assignedTo)}</span>
                      {task.deadline && (
                        <span className="text-[10px] text-zinc-600">· {task.deadline}</span>
                      )}
                    </div>

                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 ml-3.5 flex-wrap">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500">{tag}</span>
                        ))}
                      </div>
                    )}

                    {expandedTask === task.id && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/50 ml-3.5 space-y-3" onClick={(e) => e.stopPropagation()}>
                        {/* Description */}
                        <div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Description</div>
                          {editingField?.taskId === task.id && editingField.field === 'description' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, task.id, 'description')}
                              onBlur={() => saveEdit(task.id, 'description')}
                              className="w-full text-[11px] text-zinc-300 bg-zinc-800 border border-zinc-600 px-2 py-1.5 resize-none focus:outline-none focus:border-amber-500/50"
                              rows={3}
                              autoFocus
                            />
                          ) : (
                            <p
                              className="text-[11px] text-zinc-400 leading-relaxed cursor-text hover:text-zinc-300 px-1.5 py-1 -mx-1.5 hover:bg-zinc-800/60 transition-colors"
                              onClick={() => startEdit(task.id, 'description', task.description)}
                              title="Click to edit"
                            >
                              {task.description || <span className="text-zinc-600 italic">Click to add description...</span>}
                            </p>
                          )}
                        </div>

                        {/* Priority selector */}
                        <div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Priority</div>
                          <div className="flex gap-1">
                            {priorityOptions.map(p => (
                              <button
                                key={p.value}
                                onClick={() => handlePriorityChange(task.id, p.value)}
                                className={cn(
                                  'text-[9px] px-2 py-0.5 transition-all border',
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

                        {/* Assignee selector */}
                        <div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Assigned to</div>
                          <select
                            value={task.assignedTo}
                            onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300 focus:outline-none"
                          >
                            <option value="tiger">Tiger</option>
                            {agents.map(a => (
                              <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Project selector */}
                        <div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Project</div>
                          <select
                            value={task.projectId || ''}
                            onChange={(e) => handleProjectChange(task.id, e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300 focus:outline-none"
                          >
                            <option value="">No project</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.shortCode} — {p.title.replace(/^PR\.\w+\s*\|\s*/, '')}</option>
                            ))}
                          </select>
                        </div>

                        {/* Parent task selector (sub-task support) */}
                        <div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Parent Task</div>
                          <select
                            value={task.parentTaskId || ''}
                            onChange={(e) => {
                              if (onUpdateTask) onUpdateTask(task.id, { parentTaskId: e.target.value || undefined } as any);
                            }}
                            className="bg-zinc-800 border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300 focus:outline-none"
                          >
                            <option value="">None (top-level task)</option>
                            {tasks.filter(t => t.id !== task.id && !t.parentTaskId).map(t => (
                              <option key={t.id} value={t.id}>{t.title.substring(0, 50)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Info row */}
                        <div className="text-[10px] text-zinc-600">
                          Assigned by: {getAssignerName(task.assignedBy)}
                        </div>

                        {/* Status + Delete actions */}
                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/50">
                          {task.status !== 'completed' && (
                            <>
                              {task.status === 'pending' && (
                                <button
                                  onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                                  className="text-[10px] px-2 py-1 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                                >
                                  Start Working
                                </button>
                              )}
                              {task.status === 'in_progress' && (
                                <button
                                  onClick={() => onUpdateTaskStatus(task.id, 'review')}
                                  className="text-[10px] px-2 py-1 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
                                >
                                  Submit for Review
                                </button>
                              )}
                              {task.status === 'review' && (
                                <button
                                  onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                                  className="text-[10px] px-2 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </>
                          )}

                          {onDeleteTask && (
                            <div className="ml-auto">
                              {confirmDelete === task.id ? (
                                <div className="flex gap-1 items-center">
                                  <span className="text-[9px] text-red-400">Delete?</span>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="text-[9px] px-1.5 py-0.5 text-zinc-500 hover:text-zinc-400"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(task.id)}
                                  className="text-[9px] px-2 py-0.5 text-zinc-600 hover:text-red-400 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className={cn(
                    'text-center py-8 text-xs border-2 border-dashed transition-all',
                    isDropTarget && !isSameColumn
                      ? 'border-zinc-600 text-zinc-500'
                      : 'border-transparent text-zinc-700'
                  )}>
                    {isDropTarget && !isSameColumn ? 'Drop here' : 'No tasks'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
