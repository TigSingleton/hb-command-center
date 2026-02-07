import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Plus, CheckCircle2, Circle, ChevronRight,
    MoreHorizontal, Filter, Clock, Zap, AlertTriangle,
} from 'lucide-react';

/* ─── Types ─── */

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done' | 'archived' | 'skipped';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string | null;
    assigned_to: string;
    project_code: string;
    context_hints: string[];
    created_at: string;
}

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done';

/* ─── Agent Color Map ─── */

const AGENT_COLORS: Record<string, { color: string; rgb: string }> = {
    DIRECTOR: { color: '#818CF8', rgb: '129, 140, 248' },
    ALCHEMIST: { color: '#34D399', rgb: '52, 211, 153' },
    MUSE: { color: '#FF64A6', rgb: '255, 100, 166' },
    PRODUCER: { color: '#FBBF24', rgb: '251, 191, 36' },
    INTERVIEWER: { color: '#22D3EE', rgb: '34, 211, 238' },
    Tiger: { color: '#FF64A6', rgb: '255, 100, 166' },
};

const PRIORITY_COLORS: Record<string, string> = {
    urgent: '#FF4757',
    high: '#FF64A6',
    medium: '#818CF8',
    low: '#6B6B6B',
};

/* ─── Agent Avatar ─── */

const AgentAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 28 }) => {
    const agent = AGENT_COLORS[name] || { color: '#6B6B6B', rgb: '107, 107, 107' };
    const initials = name.slice(0, 2).toUpperCase();
    return (
        <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
                width: size,
                height: size,
                background: `rgba(${agent.rgb}, 0.15)`,
                border: `1px solid rgba(${agent.rgb}, 0.3)`,
                boxShadow: `0 0 12px rgba(${agent.rgb}, 0.1)`,
            }}
        >
            <span
                className="font-bold tracking-wide"
                style={{ fontSize: size * 0.35, color: agent.color }}
            >
                {initials}
            </span>
        </div>
    );
};

/* ─── Radial Chart (Project Status) ─── */

const RadialChart: React.FC<{ value: number; max: number; label: string; color: string; rgb: string }> = ({
    value, max, label, color, rgb,
}) => {
    const pct = max > 0 ? value / max : 0;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="5"
                    />
                    <motion.circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        transform="rotate(-90 40 40)"
                        style={{ filter: `drop-shadow(0 0 6px rgba(${rgb}, 0.4))` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {Math.round(pct * 100)}%
                    </span>
                </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-medium">{label}</span>
        </div>
    );
};

/* ─── Mini Sparkline ─── */

const Sparkline: React.FC<{ data: number[]; color: string; rgb: string }> = ({ data, color, rgb }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 140;
    const h = 40;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs>
                <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
                style={{ filter: `drop-shadow(0 0 4px rgba(${rgb}, 0.4))` }}
            />
            <polygon
                fill={`url(#sparkGrad-${color.replace('#', '')})`}
                points={`0,${h} ${points} ${w},${h}`}
            />
        </svg>
    );
};

/* ─── Workload Bar ─── */

const WorkloadBar: React.FC<{ name: string; value: number; max: number; color: string; rgb: string }> = ({
    name, value, max, color, rgb,
}) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex items-center gap-3">
            <AgentAvatar name={name} size={22} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-white/50 truncate">{name}</span>
                    <span
                        className="text-[10px] font-bold"
                        style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        {value}
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${color}, rgba(${rgb}, 0.6))`,
                            boxShadow: `0 0 8px rgba(${rgb}, 0.3)`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </div>
    );
};

/* ─── Circuit Board Background ─── */

const CircuitBackground: React.FC = () => (
    <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 10 10 L 10 30 L 30 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 50 10 L 50 50 L 90 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 70 10 L 70 30 L 90 30 L 90 70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 10 60 L 30 60 L 30 90" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 50 70 L 50 90" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.5" />
                <circle cx="30" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
                <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.5" />
                <circle cx="90" cy="50" r="1.5" fill="currentColor" opacity="0.4" />
                <circle cx="70" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
                <circle cx="90" cy="70" r="2" fill="currentColor" opacity="0.5" />
                <circle cx="30" cy="90" r="1.5" fill="currentColor" opacity="0.4" />
                <circle cx="50" cy="70" r="1.5" fill="currentColor" opacity="0.4" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════
   TASK ENGINE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export const TaskEngine: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hydrating, setHydrating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('hq_tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setTasks(data);
        if (error) console.error('Error fetching tasks:', error);
    };

    const handleQuickCapture = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const { error } = await supabase
            .from('hq_tasks')
            .insert([{ title: input.trim(), status: 'todo', priority: 'medium' }]);
        if (!error) {
            setInput('');
            fetchTasks();
        }
        setLoading(false);
    };

    const handleHydrate = async () => {
        if (!input.trim()) return;
        setHydrating(true);
        // Mock hydration — replace with Supabase Edge Function in V2
        await new Promise(r => setTimeout(r, 2000));
        const hydratedTask = {
            title: `Finalize: ${input.trim()}`,
            description: 'Automatically enriched by HBHQ Context Engine.',
            priority: 'high' as const,
            project_code: 'PR.HQ',
            assigned_to: 'Tiger',
            status: 'todo' as const,
            context_hints: ['supa-sync', 'agent-loop'],
        };
        const { error } = await supabase.from('hq_tasks').insert([hydratedTask]);
        if (!error) {
            setInput('');
            fetchTasks();
        }
        setHydrating(false);
    };

    const toggleStatus = async (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        const { error } = await supabase
            .from('hq_tasks')
            .update({ status: newStatus })
            .eq('id', task.id);
        if (!error) fetchTasks();
    };

    /* ─── Derived Data ─── */

    const filteredTasks = useMemo(() => {
        if (statusFilter === 'all') return tasks.filter(t => t.status !== 'archived');
        return tasks.filter(t => t.status === statusFilter);
    }, [tasks, statusFilter]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const todo = tasks.filter(t => t.status === 'todo').length;
        const urgent = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

        const byAgent: Record<string, number> = {};
        tasks.filter(t => t.status !== 'done' && t.status !== 'archived').forEach(t => {
            const agent = t.assigned_to || 'Unassigned';
            byAgent[agent] = (byAgent[agent] || 0) + 1;
        });

        const byProject: Record<string, { total: number; done: number }> = {};
        tasks.forEach(t => {
            const code = t.project_code || 'Uncoded';
            if (!byProject[code]) byProject[code] = { total: 0, done: 0 };
            byProject[code].total++;
            if (t.status === 'done') byProject[code].done++;
        });

        return { total, done, inProgress, todo, urgent, byAgent, byProject };
    }, [tasks]);

    const sparklineData = useMemo(() => {
        const days = 7;
        const counts = new Array(days).fill(0);
        const now = Date.now();
        tasks.forEach(t => {
            if (!t.created_at) return;
            const age = Math.floor((now - new Date(t.created_at).getTime()) / 86400000);
            if (age >= 0 && age < days) counts[days - 1 - age]++;
        });
        return counts;
    }, [tasks]);

    const maxWorkload = Math.max(...Object.values(stats.byAgent), 1);

    const topProjects = useMemo(() => {
        return Object.entries(stats.byProject)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 3);
    }, [stats.byProject]);

    /* ─── Filter Tabs ─── */

    const FILTERS: { id: StatusFilter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'todo', label: 'To Do' },
        { id: 'in_progress', label: 'Active' },
        { id: 'done', label: 'Done' },
    ];

    /* ─── Render ─── */

    return (
        <div className="flex-1 flex gap-6 min-h-0 relative">
            <CircuitBackground />

            {/* ═══════ LEFT COLUMN: ACTIVE TASKS ═══════ */}
            <div className="w-[55%] shrink-0 flex flex-col gap-5 relative z-10">

                {/* Quick Capture */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel rounded-2xl p-5 relative overflow-hidden"
                >
                    <div
                        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255, 100, 166, 0.12) 0%, transparent 70%)' }}
                    />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Zap size={14} className="text-[#FF64A6]" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#FF64A6]">
                                Quick Capture
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleQuickCapture()}
                                placeholder="What needs to be done?"
                                className="flex-1 bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-light text-white/90 placeholder:text-white/15 focus:outline-none focus:border-[#FF64A6]/30 transition-all"
                            />
                            <button
                                onClick={handleHydrate}
                                disabled={!input.trim() || hydrating}
                                className="px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-[#03BFAE] hover:border-[#03BFAE]/30 hover:bg-[#03BFAE]/5 transition-all flex items-center gap-1.5 disabled:opacity-30"
                                title="AI Hydrate"
                            >
                                {hydrating ? (
                                    <div className="w-4 h-4 border-2 border-[#03BFAE]/30 border-t-[#03BFAE] rounded-full animate-spin" />
                                ) : <Sparkles size={14} />}
                                <span className="text-[9px] font-bold uppercase tracking-widest">Hydrate</span>
                            </button>
                            <button
                                onClick={handleQuickCapture}
                                disabled={!input.trim() || loading}
                                className="p-3 rounded-xl bg-[#FF64A6] text-white hover:bg-[#FF64A6]/80 transition-all glow-pink disabled:opacity-30"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : <Plus size={16} />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Active Tasks Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel-elevated rounded-2xl p-6 flex-1 flex flex-col min-h-0 relative overflow-hidden"
                >
                    {/* Ambient glows */}
                    <div
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[60%] h-24 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(255, 100, 166, 0.08) 0%, transparent 70%)' }}
                    />
                    <div
                        className="absolute -bottom-12 right-0 w-40 h-40 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(3, 191, 174, 0.06) 0%, transparent 70%)' }}
                    />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 rounded-full bg-[#FF64A6]" />
                            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
                                Active Tasks
                            </h2>
                            <MoreHorizontal size={14} className="text-white/15 ml-1" />
                        </div>
                        <div className="flex items-center gap-1 bg-white/[0.02] rounded-lg p-0.5 border border-white/[0.04]">
                            {FILTERS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id)}
                                    className="px-3 py-1 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all"
                                    style={{
                                        color: statusFilter === f.id ? '#F5F5F5' : 'rgba(255,255,255,0.25)',
                                        background: statusFilter === f.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                            <Filter size={12} className="text-white/15 ml-1 mr-1" />
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 relative z-10">
                        <AnimatePresence mode="popLayout">
                            {filteredTasks.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center"
                                >
                                    <Clock size={36} className="text-white/10 mb-3" />
                                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/15">
                                        {statusFilter === 'all' ? 'No active tasks' : `No ${statusFilter} tasks`}
                                    </span>
                                </motion.div>
                            ) : (
                                filteredTasks.map((task, i) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                        transition={{ duration: 0.35, delay: i * 0.04 }}
                                        className="group relative bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer"
                                        style={{
                                            padding: '16px 18px',
                                            boxShadow: task.priority === 'urgent'
                                                ? '0 0 20px rgba(255, 71, 87, 0.06)'
                                                : undefined,
                                        }}
                                        onClick={() => toggleStatus(task)}
                                    >
                                        {/* Priority accent line */}
                                        <div
                                            className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                                            style={{
                                                background: PRIORITY_COLORS[task.priority] || '#6B6B6B',
                                                opacity: 0.6,
                                            }}
                                        />

                                        <div className="flex items-start gap-3.5 pl-2">
                                            <div className="mt-0.5">
                                                {task.status === 'done' ? (
                                                    <CheckCircle2 color="#03BFAE" size={16} />
                                                ) : (
                                                    <Circle className="text-white/15 group-hover:text-[#FF64A6]/40 transition-colors" size={16} />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Project Code */}
                                                {task.project_code && (
                                                    <span
                                                        className="text-[10px] font-bold tracking-[0.08em] mb-1 block"
                                                        style={{
                                                            color: '#818CF8',
                                                            fontFamily: "'JetBrains Mono', monospace",
                                                        }}
                                                    >
                                                        {task.project_code}:
                                                    </span>
                                                )}

                                                <h3
                                                    className={`text-[13px] font-medium leading-snug transition-all ${
                                                        task.status === 'done'
                                                            ? 'text-white/20 line-through'
                                                            : 'text-white/85'
                                                    }`}
                                                >
                                                    {task.title}
                                                </h3>

                                                {task.description && (
                                                    <p className="text-[11px] text-white/25 mt-1 line-clamp-1 font-light">
                                                        {task.description}
                                                    </p>
                                                )}

                                                {/* Meta row */}
                                                <div className="flex items-center gap-3 mt-3">
                                                    {task.assigned_to && (
                                                        <div className="flex items-center gap-1.5">
                                                            <AgentAvatar name={task.assigned_to} size={18} />
                                                            <span className="text-[10px] text-white/30">
                                                                {task.assigned_to}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {(task.priority === 'high' || task.priority === 'urgent') && (
                                                        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold"
                                                            style={{ color: PRIORITY_COLORS[task.priority] }}
                                                        >
                                                            <AlertTriangle size={10} />
                                                            {task.priority}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Context Hints */}
                                                {task.context_hints && task.context_hints.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.03]">
                                                        {task.context_hints.map(hint => (
                                                            <span
                                                                key={hint}
                                                                className="text-[9px] text-white/10 uppercase tracking-widest"
                                                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                            >
                                                                #{hint}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <ChevronRight
                                                size={14}
                                                className="text-white/[0.06] group-hover:text-white/20 transition-all mt-1"
                                            />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* ═══════ RIGHT COLUMN: STATUS + WORKLOAD ═══════ */}
            <div className="flex-1 flex flex-col gap-5 min-h-0 relative z-10">

                {/* Project Status Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="glass-panel rounded-2xl p-6 relative overflow-hidden"
                >
                    <div
                        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(3, 191, 174, 0.08) 0%, transparent 70%)' }}
                    />

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-1.5 h-5 rounded-full bg-[#03BFAE]" />
                        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
                            Project Status
                        </h2>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        {/* Radial Charts */}
                        <div className="flex gap-4">
                            {topProjects.length > 0 ? (
                                topProjects.map(([code, data], i) => {
                                    const colors = [
                                        { color: '#03BFAE', rgb: '3, 191, 174' },
                                        { color: '#FF64A6', rgb: '255, 100, 166' },
                                        { color: '#818CF8', rgb: '129, 140, 248' },
                                    ];
                                    const c = colors[i % colors.length];
                                    return (
                                        <RadialChart
                                            key={code}
                                            value={data.done}
                                            max={data.total}
                                            label={code}
                                            color={c.color}
                                            rgb={c.rgb}
                                        />
                                    );
                                })
                            ) : (
                                <RadialChart value={0} max={1} label="No Data" color="#6B6B6B" rgb="107,107,107" />
                            )}
                        </div>

                        {/* Sparkline */}
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-white/20 font-medium">
                                7-Day Activity
                            </span>
                            <Sparkline data={sparklineData} color="#03BFAE" rgb="3, 191, 174" />
                        </div>
                    </div>

                    {/* Summary Stats Row */}
                    <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.04]">
                        {[
                            { label: 'Total', value: stats.total, color: '#F5F5F5' },
                            { label: 'To Do', value: stats.todo, color: '#818CF8' },
                            { label: 'Active', value: stats.inProgress, color: '#FBBF24' },
                            { label: 'Done', value: stats.done, color: '#03BFAE' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                    {s.value}
                                </div>
                                <div className="text-[9px] uppercase tracking-[0.15em] text-white/20 mt-0.5">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Team Workload Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="glass-panel rounded-2xl p-6 flex-1 flex flex-col min-h-0 relative overflow-hidden"
                >
                    <div
                        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(129, 140, 248, 0.06) 0%, transparent 70%)' }}
                    />

                    <div className="flex items-center gap-3 mb-5 shrink-0">
                        <div className="w-1.5 h-5 rounded-full bg-[#818CF8]" />
                        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
                            Team Workload
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {Object.keys(stats.byAgent).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <span className="text-[11px] uppercase tracking-[0.15em]">No active assignments</span>
                            </div>
                        ) : (
                            Object.entries(stats.byAgent)
                                .sort((a, b) => b[1] - a[1])
                                .map(([agent, count]) => {
                                    const ac = AGENT_COLORS[agent] || { color: '#6B6B6B', rgb: '107, 107, 107' };
                                    return (
                                        <WorkloadBar
                                            key={agent}
                                            name={agent}
                                            value={count}
                                            max={maxWorkload}
                                            color={ac.color}
                                            rgb={ac.rgb}
                                        />
                                    );
                                })
                        )}
                    </div>

                    {/* Urgent Indicator */}
                    {stats.urgent > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/[0.04] shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#FF4757] animate-pulse" />
                                <span className="text-[10px] uppercase tracking-[0.12em] text-[#FF4757] font-bold">
                                    {stats.urgent} high-priority task{stats.urgent !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
