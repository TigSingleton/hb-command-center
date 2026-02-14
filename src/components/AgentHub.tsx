import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Agent } from '../types';
import { spawnableAgents } from '../data';

interface AgentHubProps {
  agents: Agent[];
  onSpawnAgent: (name: string, emoji: string, role: string, description: string) => void;
}

export function AgentHub({ agents, onSpawnAgent }: AgentHubProps) {
  const [showSpawn, setShowSpawn] = useState(false);
  const [selectedSpawn, setSelectedSpawn] = useState<typeof spawnableAgents[0] | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const handleSpawn = () => {
    if (selectedSpawn) {
      onSpawnAgent(selectedSpawn.name.replace(' Agent', ''), selectedSpawn.emoji, selectedSpawn.role, selectedSpawn.description);
      setShowSpawn(false);
      setSelectedSpawn(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Agent Hub</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{agents.length} agents deployed · {agents.filter(a => a.status === 'working' || a.status === 'active').length} active</p>
        </div>
        <Button
          onClick={() => setShowSpawn(true)}
          className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 text-sm"
        >
          + Spawn New Agent
        </Button>
      </div>

      {/* CEA Card - Featured */}
      <div className="mb-6 bg-zinc-900 border border-amber-500/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-amber-500/15 flex items-center justify-center text-2xl shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            🧠
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-base font-semibold text-zinc-100">The CEA</h2>
              <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px]">Chief Executive Agent</Badge>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              Oversees all operations for HeartBased.io. Manages Tiger as Employee #1.
              Cannot fire Tiger — must optimize, motivate, and delegate to maximize impact.
            </p>
            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-zinc-600">Decisions Made</span>
                <div className="text-zinc-200 font-medium">{agents.find(a => a.id === 'cea')?.metrics.decisions || 0}</div>
              </div>
              <div>
                <span className="text-zinc-600">Tasks Delegated</span>
                <div className="text-zinc-200 font-medium">{agents.find(a => a.id === 'cea')?.metrics.delegations || 0}</div>
              </div>
              <div>
                <span className="text-zinc-600">Sub-Agents Spawned</span>
                <div className="text-zinc-200 font-medium">{agents.filter(a => a.id !== 'cea').length}</div>
              </div>
              <div>
                <span className="text-zinc-600">Uptime</span>
                <div className="text-zinc-200 font-medium">{agents.find(a => a.id === 'cea')?.uptime || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Agents Grid */}
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-3">Sub-Agents</div>
      <div className="grid grid-cols-2 gap-3">
        {agents.filter(a => a.id !== 'cea').map((agent) => (
          <div
            key={agent.id}
            className={cn(
              'bg-zinc-900 border border-zinc-800 p-4 cursor-pointer transition-all hover:border-zinc-700',
              expandedAgent === agent.id && 'border-zinc-600'
            )}
            onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-zinc-200">{agent.name}</h3>
                  <span className={cn(
                    'flex items-center gap-1 text-[10px]',
                    agent.status === 'active' && 'text-emerald-400',
                    agent.status === 'working' && 'text-amber-400',
                    agent.status === 'idle' && 'text-zinc-500',
                    agent.status === 'spawning' && 'text-blue-400',
                  )}>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      agent.status === 'active' && 'bg-emerald-400',
                      agent.status === 'working' && 'bg-amber-400 animate-pulse',
                      agent.status === 'idle' && 'bg-zinc-600',
                      agent.status === 'spawning' && 'bg-blue-400 animate-pulse',
                    )} />
                    {agent.status}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mb-2">{agent.role}</div>

                {agent.currentTask && (
                  <div className="text-xs text-zinc-400 bg-zinc-800/50 px-2 py-1.5 mb-2">
                    <span className="text-zinc-600">Current: </span>{agent.currentTask}
                  </div>
                )}

                {expandedAgent === agent.id && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/50 space-y-2">
                    <p className="text-xs text-zinc-500">{agent.description}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {Object.entries(agent.metrics).map(([key, val]) => (
                        <div key={key}>
                          <div className="text-[10px] text-zinc-600">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-xs text-zinc-300 font-medium">{typeof val === 'number' ? val.toLocaleString() : val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-2">
                      Tasks completed: {agent.tasksCompleted} · Uptime: {agent.uptime}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spawn Dialog */}
      <Dialog open={showSpawn} onOpenChange={setShowSpawn}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Spawn New Agent</DialogTitle>
            <DialogDescription className="text-zinc-400">
              The CEA will deploy a new sub-agent to handle a specific domain. Select an agent type below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-4">
            {spawnableAgents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => setSelectedSpawn(agent)}
                className={cn(
                  'w-full text-left p-3 border transition-all flex items-start gap-3',
                  selectedSpawn?.name === agent.name
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/30'
                )}
              >
                <span className="text-xl mt-0.5">{agent.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-zinc-200">{agent.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{agent.description}</div>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSpawn(false)} className="text-zinc-400">Cancel</Button>
            <Button
              onClick={handleSpawn}
              disabled={!selectedSpawn}
              className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
            >
              Deploy Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
