import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { KPI, Agent, Goal } from '../types';

interface StrategyProps {
  kpis: KPI[];
  agents: Agent[];
  goals: Goal[];
  onUpdateGoal?: (goalId: string, updates: Partial<Goal>) => void;
  onCreateGoal?: (data: { title: string; description?: string; ownerAgentId?: string; targetDate?: string }) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export function Strategy({ kpis, agents, goals, onUpdateGoal, onCreateGoal, onDeleteGoal }: StrategyProps) {
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [editingDesc, setEditingDesc] = useState<string | null>(null);
  const [descValue, setDescValue] = useState('');
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const createTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCreateForm && createTitleRef.current) {
      setTimeout(() => createTitleRef.current?.focus(), 50);
    }
  }, [showCreateForm]);

  const statusOptions = [
    { value: 'ahead', label: 'Ahead', color: 'bg-blue-500/15 text-blue-400' },
    { value: 'on-track', label: 'On Track', color: 'bg-emerald-500/15 text-emerald-400' },
    { value: 'at-risk', label: 'At Risk', color: 'bg-amber-500/15 text-amber-400' },
    { value: 'behind', label: 'Behind', color: 'bg-red-500/15 text-red-400' },
  ] as const;

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-blue-500';
      case 'on-track': return 'bg-emerald-500';
      case 'at-risk': return 'bg-amber-500';
      case 'behind': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreateGoal = () => {
    if (!newTitle.trim() || !onCreateGoal) return;
    onCreateGoal({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      ownerAgentId: newOwner || undefined,
      targetDate: newDate || undefined,
    });
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewOwner('');
    setShowCreateForm(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (onDeleteGoal) onDeleteGoal(goalId);
    setConfirmDelete(null);
  };

  const startTitleEdit = (goal: Goal) => {
    setEditingTitle(goal.id);
    setTitleValue(goal.title);
  };

  const saveTitleEdit = (goalId: string) => {
    if (onUpdateGoal && titleValue.trim()) {
      onUpdateGoal(goalId, { title: titleValue.trim() });
    }
    setEditingTitle(null);
  };

  const startDescEdit = (goal: Goal) => {
    setEditingDesc(goal.id);
    setDescValue((goal as any).description || '');
  };

  const saveDescEdit = (goalId: string) => {
    if (onUpdateGoal) {
      onUpdateGoal(goalId, { description: descValue.trim() } as any);
    }
    setEditingDesc(null);
  };

  const startDateEdit = (goal: Goal) => {
    setEditingDate(goal.id);
    setDateValue(goal.targetDate || '');
  };

  const saveDateEdit = (goalId: string) => {
    if (onUpdateGoal) {
      onUpdateGoal(goalId, { targetDate: dateValue || undefined });
    }
    setEditingDate(null);
  };

  const startProgressEdit = (goalId: string, currentProgress: number) => {
    setEditingProgress(goalId);
    setProgressValue(currentProgress);
  };

  const saveProgress = (goalId: string) => {
    if (onUpdateGoal) onUpdateGoal(goalId, { progress: progressValue });
    setEditingProgress(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Strategy & Goals</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Q1 2026 strategic objectives</p>
        </div>
        {onCreateGoal && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-500 text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Goal
          </button>
        )}
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <div className="mb-6 bg-zinc-900 border border-teal-500/30 p-5" style={{ animation: 'slideUp 0.2s ease-out' }}>
          <div className="text-[10px] text-teal-400 uppercase tracking-wider mb-3">New Strategic Goal</div>
          <input
            ref={createTitleRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateGoal(); } if (e.key === 'Escape') setShowCreateForm(false); }}
            placeholder="Goal title..."
            className="w-full bg-transparent text-zinc-100 text-base font-medium placeholder:text-zinc-600 outline-none border-none mb-3"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full bg-zinc-800/50 text-zinc-300 text-sm placeholder:text-zinc-600 outline-none border border-zinc-700/50 p-3 resize-none mb-3"
            rows={2}
          />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Target Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 outline-none focus:border-teal-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Owner</label>
              <select
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 outline-none focus:border-teal-500/50"
              >
                <option value="">Unassigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
            <button
              onClick={handleCreateGoal}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition-colors"
            >
              Create Goal
            </button>
          </div>
        </div>
      )}

      {/* Mission Statement */}
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-5">
        <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">HeartBased.io Mission</div>
        <p className="text-sm text-zinc-300 leading-relaxed italic">
          "Hold space for heart-based humans to explore their humanity and discover opportunities to open up, fear less, and love more — while building a sustainable, profitable business that supports Tiger and the community."
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-amber-400/70">— Codified by The CEA</span>
          <span className="text-[10px] text-zinc-700">|</span>
          <span className="text-[10px] text-zinc-600">All strategic decisions align to this mission</span>
        </div>
      </div>

      {/* Goals */}
      {goals.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500 mb-3">No goals yet.</p>
          {onCreateGoal && (
            <button onClick={() => setShowCreateForm(true)} className="text-sm text-teal-400 hover:text-teal-300">
              Create your first strategic goal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const isExpanded = expandedGoals.has(goal.id);
            return (
              <div key={goal.id} className="bg-zinc-900 border border-zinc-800 group/card">
                <div className="px-5 py-4 border-b border-zinc-800/50">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div className="flex-1 min-w-0">
                      {editingTitle === goal.id ? (
                        <input
                          value={titleValue}
                          onChange={(e) => setTitleValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveTitleEdit(goal.id); if (e.key === 'Escape') setEditingTitle(null); }}
                          onBlur={() => saveTitleEdit(goal.id)}
                          className="w-full bg-zinc-800 border border-zinc-600 px-2 py-1 text-sm font-medium text-zinc-200 outline-none"
                          autoFocus
                        />
                      ) : (
                        <h3
                          className="text-sm font-medium text-zinc-200 cursor-pointer hover:text-zinc-100"
                          onClick={() => toggleExpanded(goal.id)}
                        >
                          <span className="mr-2 text-zinc-600 text-xs">{isExpanded ? '▾' : '▸'}</span>
                          {goal.title}
                        </h3>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Status toggle buttons */}
                      {onUpdateGoal && (
                        <div className="flex gap-1">
                          {statusOptions.map(s => (
                            <button
                              key={s.value}
                              onClick={() => onUpdateGoal(goal.id, { status: s.value })}
                              className={cn(
                                'text-[9px] px-2 py-0.5 transition-all border',
                                goal.status === s.value
                                  ? `${s.color} border-current`
                                  : 'bg-zinc-800 text-zinc-600 border-zinc-700 hover:text-zinc-400'
                              )}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 h-1.5 bg-zinc-800 overflow-hidden cursor-pointer"
                      onClick={() => startProgressEdit(goal.id, goal.progress)}
                      title="Click to edit progress"
                    >
                      <div
                        className={cn('h-full transition-all duration-500', getProgressBarColor(goal.status))}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    {editingProgress === goal.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={progressValue}
                          onChange={(e) => setProgressValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-12 bg-zinc-800 border border-zinc-600 px-1 py-0.5 text-xs text-zinc-300 text-center focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveProgress(goal.id); if (e.key === 'Escape') setEditingProgress(null); }}
                        />
                        <span className="text-[10px] text-zinc-500">%</span>
                        <button onClick={() => saveProgress(goal.id)} className="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400">Save</button>
                        <button onClick={() => setEditingProgress(null)} className="text-[9px] px-1.5 py-0.5 text-zinc-500">Cancel</button>
                      </div>
                    ) : (
                      <span
                        className="text-xs text-zinc-400 w-10 text-right cursor-pointer hover:text-zinc-200"
                        onClick={() => startProgressEdit(goal.id, goal.progress)}
                        title="Click to edit"
                      >
                        {goal.progress}%
                      </span>
                    )}
                  </div>

                  {/* Owner + date */}
                  <div className="text-[10px] text-zinc-500 mt-2 flex items-center gap-2">
                    <span>Owned by {goal.ownerEmoji} {goal.ownerName}</span>
                    {editingDate === goal.id ? (
                      <span className="flex items-center gap-1">
                        <input
                          type="date"
                          value={dateValue}
                          onChange={(e) => setDateValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveDateEdit(goal.id); if (e.key === 'Escape') setEditingDate(null); }}
                          onBlur={() => saveDateEdit(goal.id)}
                          className="bg-zinc-800 border border-zinc-600 px-1 py-0.5 text-[10px] text-zinc-300 outline-none"
                          autoFocus
                        />
                      </span>
                    ) : (
                      <span
                        className="cursor-pointer hover:text-zinc-300"
                        onClick={() => startDateEdit(goal)}
                      >
                        {goal.targetDate ? `Target: ${goal.targetDate}` : '+ Add target date'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="px-5 py-3 space-y-3 border-b border-zinc-800/50 bg-zinc-900/50">
                    {/* Description edit */}
                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Description</div>
                      {editingDesc === goal.id ? (
                        <div>
                          <textarea
                            value={descValue}
                            onChange={(e) => setDescValue(e.target.value)}
                            className="w-full bg-zinc-800/50 text-zinc-300 text-sm outline-none border border-zinc-700/50 p-2 resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => saveDescEdit(goal.id)} className="text-[10px] px-2 py-0.5 bg-teal-600 text-white">Save</button>
                            <button onClick={() => setEditingDesc(null)} className="text-[10px] px-2 py-0.5 text-zinc-500">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-300"
                          onClick={() => startDescEdit(goal)}
                        >
                          {(goal as any).description || 'Click to add description...'}
                        </p>
                      )}
                    </div>

                    {/* Edit title button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startTitleEdit(goal)}
                        className="text-[10px] px-2 py-0.5 text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-600"
                      >
                        Edit Title
                      </button>
                      {onDeleteGoal && (
                        <>
                          {confirmDelete === goal.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-red-400">Delete this goal?</span>
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-[10px] px-2 py-0.5 text-zinc-500"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(goal.id)}
                              className="text-[10px] px-2 py-0.5 text-zinc-600 hover:text-red-400 border border-zinc-800 hover:border-red-500/30"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Initiatives */}
                {goal.initiatives.length > 0 && (
                  <div className="px-5 py-3">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Initiatives</div>
                    <div className="space-y-1.5">
                      {goal.initiatives.map((init, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              init.status === 'completed' && 'bg-emerald-400',
                              init.status === 'active' && 'bg-emerald-400',
                              init.status === 'in-progress' && 'bg-blue-400',
                              init.status === 'review' && 'bg-amber-400',
                              init.status === 'planned' && 'bg-zinc-600',
                            )} />
                            <span className="text-xs text-zinc-400">{init.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-600">{init.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Animation keyframe */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
