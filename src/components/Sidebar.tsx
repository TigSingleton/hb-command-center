import { cn } from '@/lib/utils';
import { ViewType, Agent } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  agents: Agent[];
  pendingTaskCount: number;
  projectCount: number;
}

const navItems: { id: ViewType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Command Center', icon: '◉' },
  { id: 'projects', label: 'Projects', icon: '◫' },
  { id: 'agents', label: 'Agent Hub', icon: '◎' },
  { id: 'tasks', label: 'Task Board', icon: '☰' },
  { id: 'chat', label: 'Talk to CEA', icon: '◈' },
  { id: 'strategy', label: 'Strategy', icon: '△' },
];

export function Sidebar({ currentView, onViewChange, agents, pendingTaskCount, projectCount }: SidebarProps) {
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'working').length;

  return (
    <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col h-full border-r border-zinc-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            C
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100 tracking-wide">CEA</div>
            <div className="text-[10px] text-zinc-500 tracking-widest uppercase">HeartBased.io</div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">System Status</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">Operational</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] mt-1.5">
          <span className="text-zinc-500">Active Agents</span>
          <span className="text-zinc-300">{activeAgents} / {agents.length}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150',
              currentView === item.id
                ? 'bg-zinc-800/80 text-zinc-100 border-l-2 border-amber-500'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border-l-2 border-transparent'
            )}
          >
            <span className="text-base opacity-70">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'tasks' && pendingTaskCount > 0 && (
              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-sm font-medium">
                {pendingTaskCount}
              </span>
            )}
            {item.id === 'projects' && projectCount > 0 && (
              <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-sm font-medium">
                {projectCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Agent quick status */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2.5">Agent Status</div>
        <div className="space-y-2">
          {agents.slice(0, 5).map((agent) => (
            <div key={agent.id} className="flex items-center gap-2 text-[11px]">
              <span>{agent.emoji}</span>
              <span className="text-zinc-400 truncate flex-1">{agent.name}</span>
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                agent.status === 'active' && 'bg-emerald-400',
                agent.status === 'working' && 'bg-amber-400 animate-pulse',
                agent.status === 'idle' && 'bg-zinc-600',
                agent.status === 'error' && 'bg-red-400',
                agent.status === 'spawning' && 'bg-blue-400 animate-pulse',
              )} />
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm">
            🐯
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-300">Tiger Singleton</div>
            <div className="text-[10px] text-zinc-600">Founder · Employee #1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
