import { useState, useEffect, useRef } from 'react';
import { Task, Agent, Project } from '../types';

interface TaskCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; priority: Task['priority']; assignedTo: string; projectId?: string }) => void;
  agents: Agent[];
  projects: Project[];
}

export function TaskCaptureModal({ isOpen, onClose, onSubmit, agents, projects }: TaskCaptureModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState('tiger');
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setTitle('');
      setPriority('medium');
      setAssignedTo('tiger');
      setProjectId('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: title.trim(),
        priority,
        assignedTo,
        projectId: projectId || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const priorityColors: Record<string, string> = {
    low: 'bg-zinc-600 text-zinc-300',
    medium: 'bg-amber-900/50 text-amber-400',
    high: 'bg-orange-900/50 text-orange-400',
    critical: 'bg-red-900/50 text-red-400',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden"
        style={{ animation: 'taskSlideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-200">Quick Task</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to get done?"
            className="w-full bg-transparent text-zinc-100 text-lg font-medium placeholder:text-zinc-600 outline-none border-none"
            autoComplete="off"
          />

          {/* Assign + Project row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Assign to</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 rounded-md outline-none focus:border-amber-500/50"
              >
                <option value="tiger">Tiger</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 rounded-md outline-none focus:border-amber-500/50"
              >
                <option value="">No project</option>
                {projects.filter(p => p.status === 'active').map(p => (
                  <option key={p.id} value={p.id}>{p.shortCode} — {p.title.replace(/^PR\.\w+\s*\|\s*/, '')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
          {/* Priority selector */}
          <div className="flex items-center gap-1">
            {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`text-xs px-2 py-1 rounded-md transition-all ${priority === p
                  ? priorityColors[p]
                  : 'text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Add Task
                <kbd className="text-[10px] px-1 py-0.5 rounded bg-amber-700/50 text-amber-200">↵</kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes taskSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// Floating Action Button for Quick Task
interface TaskFABProps {
  onClick: () => void;
  taskCount?: number;
}

export function TaskFAB({ onClick, taskCount }: TaskFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-24 z-50 group"
      title="Quick Task (Cmd+T)"
    >
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        {taskCount !== undefined && taskCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
            {taskCount > 99 ? '99+' : taskCount}
          </span>
        )}
      </div>
      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Quick Task <kbd className="ml-1 px-1 py-0.5 rounded bg-zinc-700 text-zinc-400 text-[10px]">⌘T</kbd>
      </span>
    </button>
  );
}
