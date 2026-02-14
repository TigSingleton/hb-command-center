import { useState } from 'react';
import { cn } from '@/lib/utils';
import { KPI, Agent, Goal } from '../types';

interface StrategyProps {
  kpis: KPI[];
  agents: Agent[];
  goals: Goal[];
  onUpdateGoal?: (goalId: string, updates: Partial<Goal>) => void;
}

export function Strategy({ kpis, agents, goals, onUpdateGoal }: StrategyProps) {
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const statusOptions = [
    { value: 'ahead', label: 'Ahead', color: 'bg-blue-500/15 text-blue-400' },
    { value: 'on-track', label: 'On Track', color: 'bg-emerald-500/15 text-emerald-400' },
    { value: 'at-risk', label: 'At Risk', color: 'bg-amber-500/15 text-amber-400' },
    { value: 'behind', label: 'Behind', color: 'bg-red-500/15 text-red-400' },
  ] as const;

  const handleStatusChange = (goalId: string, status: Goal['status']) => {
    if (onUpdateGoal) onUpdateGoal(goalId, { status });
  };

  const startProgressEdit = (goalId: string, currentProgress: number) => {
    setEditingProgress(goalId);
    setProgressValue(currentProgress);
  };

  const saveProgress = (goalId: string) => {
    if (onUpdateGoal) onUpdateGoal(goalId, { progress: progressValue });
    setEditingProgress(null);
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-blue-500';
      case 'on-track': return 'bg-emerald-500';
      case 'at-risk': return 'bg-amber-500';
      case 'behind': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Strategy & Goals</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Q1 2026 strategic objectives · Managed by The CEA</p>
      </div>

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
          <p className="text-sm text-zinc-500">No goals loaded. Connect to Supabase to see live strategic goals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-zinc-900 border border-zinc-800">
              <div className="px-5 py-4 border-b border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-zinc-200">{goal.title}</h3>
                  {/* Status toggle buttons */}
                  {onUpdateGoal ? (
                    <div className="flex gap-1">
                      {statusOptions.map(s => (
                        <button
                          key={s.value}
                          onClick={() => handleStatusChange(goal.id, s.value)}
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
                  ) : (
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 font-medium',
                      goal.status === 'on-track' && 'bg-emerald-500/15 text-emerald-400',
                      goal.status === 'at-risk' && 'bg-amber-500/15 text-amber-400',
                      goal.status === 'ahead' && 'bg-blue-500/15 text-blue-400',
                      goal.status === 'behind' && 'bg-red-500/15 text-red-400',
                    )}>
                      {goal.status.replace('-', ' ').toUpperCase()}
                    </span>
                  )}
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
                <div className="text-[10px] text-zinc-500 mt-2">
                  Owned by {goal.ownerEmoji} {goal.ownerName}
                  {goal.targetDate && <> · Target: {goal.targetDate}</>}
                </div>
              </div>
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
          ))}
        </div>
      )}

      {/* CEA Strategic Notes */}
      <div className="mt-6 bg-zinc-900 border border-amber-500/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🧠</span>
          <span className="text-xs font-medium text-amber-400">CEA Strategic Assessment</span>
        </div>
        <div className="text-sm text-zinc-400 leading-relaxed space-y-2">
          <p>
            Overall trajectory is positive. Revenue growth is strong at 12.5%, driven primarily by meditation content
            and consultation bookings. The biggest lever right now is the pricing strategy — moving to tiers could
            unlock an additional $2,400/month based on Meridian's analysis.
          </p>
          <p>
            Content pipeline is the risk area. Sage is keeping up with newsletters but blog output needs Tiger's
            input on 3 pending drafts. I've flagged this as a priority in the task board.
          </p>
          <p>
            Recommendation: Tiger should focus on (1) approving the pricing strategy, (2) reviewing blog drafts,
            and (3) the upcoming broadcast. I'll handle everything else through the sub-agents.
          </p>
        </div>
      </div>
    </div>
  );
}
