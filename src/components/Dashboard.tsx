import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { KPI, ActivityItem, Task, Agent, Project } from '../types';

interface DashboardProps {
  kpis: KPI[];
  activity: ActivityItem[];
  tasks: Task[];
  agents: Agent[];
  projects: Project[];
  onNavigate: (view: string) => void;
}

export function Dashboard({ kpis, activity, tasks, agents, projects, onNavigate }: DashboardProps) {
  const tigerTasks = tasks.filter(t => t.assignedTo === 'tiger');
  const pendingTiger = tigerTasks.filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'review');
  const completedToday = tigerTasks.filter(t => t.status === 'completed').length;
  const ceaAgent = agents.find(a => a.id === 'cea');

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Command Center</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Saturday, February 14, 2026 · Valentine's Day</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider">CEA Uptime</div>
            <div className="text-sm text-zinc-400 font-mono">{ceaAgent?.uptime || '—'}</div>
          </div>
        </div>
      </div>

      {/* CEA Briefing Banner */}
      <div className="mb-6 bg-zinc-900 border border-zinc-800 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-500/15 flex items-center justify-center text-lg shrink-0 mt-0.5" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            🧠
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-amber-400">CEA Morning Briefing</span>
              <span className="text-[10px] text-zinc-600">8:00 AM</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Good morning, Tiger. Revenue is up 12.5% this month — meditation content is the driver.
              You have <button onClick={() => onNavigate('tasks')} className="text-amber-400 hover:underline font-medium">{pendingTiger.length} tasks</button> requiring
              your personal touch. Priority: the pricing strategy decision is blocking Q1 targets.
              All {agents.filter(a => a.id !== 'cea').length} sub-agents are operational.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {kpis.slice(0, 4).map((kpi) => (
          <div key={kpi.id} className="bg-zinc-900 border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{kpi.label}</div>
            <div className="text-2xl font-semibold text-zinc-100 mb-1">{kpi.value}</div>
            <div className={cn(
              'text-xs flex items-center gap-1',
              kpi.trend === 'up' && 'text-emerald-400',
              kpi.trend === 'down' && 'text-red-400',
              kpi.trend === 'stable' && 'text-zinc-500',
            )}>
              <span>{kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}</span>
              <span>{Math.abs(kpi.change)}% vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Projects Summary */}
      {projects.length > 0 && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-200">Active Projects</h2>
            <button onClick={() => onNavigate('projects')} className="text-[10px] text-amber-400 hover:underline">View all →</button>
          </div>
          <div className="grid grid-cols-4 gap-0 divide-x divide-zinc-800/50">
            {projects.filter(p => p.status === 'active').slice(0, 4).map((project) => {
              const progress = project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0;
              return (
                <div key={project.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-400/70">{project.shortCode}</span>
                  </div>
                  <div className="text-xs text-zinc-300 truncate mb-1">{project.title.replace(/^PR\.\w+\s*\|\s*/, '')}</div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-1 flex-1" />
                    <span className="text-[10px] text-zinc-500">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-200">Agent Activity</h2>
            <span className="text-[10px] text-zinc-600">Live</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {activity.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-zinc-800/20 transition-colors">
                <span className="text-base mt-0.5">{item.agentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-300">{item.agent}</span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5',
                      item.type === 'task' && 'bg-blue-500/15 text-blue-400',
                      item.type === 'decision' && 'bg-amber-500/15 text-amber-400',
                      item.type === 'report' && 'bg-emerald-500/15 text-emerald-400',
                      item.type === 'spawn' && 'bg-purple-500/15 text-purple-400',
                      item.type === 'alert' && 'bg-red-500/15 text-red-400',
                    )}>
                      {item.action}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.detail}</p>
                </div>
                <span className="text-[10px] text-zinc-600 whitespace-nowrap">{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Tiger's Priority Tasks */}
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-200">Your Priorities</h2>
              <button onClick={() => onNavigate('tasks')} className="text-[10px] text-amber-400 hover:underline">View all →</button>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {pendingTiger.slice(0, 4).map((task) => (
                <div key={task.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      task.priority === 'critical' && 'bg-red-400',
                      task.priority === 'high' && 'bg-amber-400',
                      task.priority === 'medium' && 'bg-blue-400',
                      task.priority === 'low' && 'bg-zinc-500',
                    )} />
                    <span className="text-xs text-zinc-300 truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-3.5">
                    {task.projectShortCode && (
                      <span className="text-[9px] font-mono px-1 py-0.5 bg-amber-500/10 text-amber-400/60">{task.projectShortCode}</span>
                    )}
                    {task.deadline && (
                      <span className="text-[10px] text-zinc-600">Due {task.deadline}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance Summary */}
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-200">Agent Performance</h2>
            </div>
            <div className="p-4 space-y-3">
              {agents.filter(a => a.id !== 'cea').map((agent) => (
                <div key={agent.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <span>{agent.emoji}</span> {agent.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">{agent.tasksCompleted} done</span>
                  </div>
                  <Progress value={Math.min((agent.tasksCompleted / 70) * 100, 100)} className="h-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick KPIs */}
          <div className="bg-zinc-900 border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-3">Secondary Metrics</div>
            <div className="space-y-2">
              {kpis.slice(4).map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{kpi.label}</span>
                  <span className="text-xs text-zinc-200 font-medium">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
