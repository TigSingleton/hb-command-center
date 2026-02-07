import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Plus, Clock, User, Tag, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

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
}

export const TaskEngine: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hydrating, setHydrating] = useState(false);

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
        if (!input) return;
        setLoading(true);

        const { error } = await supabase
            .from('hq_tasks')
            .insert([{ title: input, status: 'todo', priority: 'medium' }]);

        if (!error) {
            setInput('');
            fetchTasks();
        }
        setLoading(false);
    };

    const handleHydrate = async () => {
        if (!input) return;
        setHydrating(true);

        // Simulate AI Hydration Protocol
        // In V2, this will call a Supabase Edge Function
        await new Promise(r => setTimeout(r, 2000));

        const hydratedTask = {
            title: `Finalize: ${input}`,
            description: "Automatically enriched by HBHQ Context Engine.",
            priority: 'high' as const,
            project_code: 'PR.HQ',
            assigned_to: 'Tiger',
            status: 'todo' as const,
            context_hints: ['supa-sync', 'agent-loop']
        };

        const { error } = await supabase
            .from('hq_tasks')
            .insert([hydratedTask]);

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

    return (
        <div className="flex-1 flex gap-8 min-h-0 animate-fade-in">
            {/* ─── LEFT COLUMN: QUICK CAPTURE ─── */}
            <div className="w-[38%] shrink-0 flex flex-col">
                <div className="glass-panel-elevated rounded-2xl p-8 flex flex-col bg-white/[0.01] border border-white/[0.05]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 rounded-full bg-[#FF64A6]" />
                        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#FF64A6]">Quick Capture</h2>
                    </div>

                    <div className="relative group mb-6">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full min-h-[120px] bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-light text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#FF64A6]/30 transition-all resize-none"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                                onClick={handleHydrate}
                                disabled={!input || hydrating}
                                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[#03BFAE] hover:bg-[#03BFAE]/10 transition-all flex items-center gap-2"
                                title="AI Hydrate"
                            >
                                {hydrating ? (
                                    <div className="w-4 h-4 border-2 border-[#03BFAE]/30 border-t-[#03BFAE] rounded-full animate-spin" />
                                ) : <Sparkles size={16} />}
                                <span className="text-[10px] font-bold uppercase tracking-widest">Hydrate</span>
                            </button>
                            <button
                                onClick={handleQuickCapture}
                                disabled={!input || loading}
                                className="p-2.5 rounded-lg bg-[#FF64A6] text-white hover:bg-[#FF64A6]/80 transition-all"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : <Plus size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[11px] text-white/30 leading-relaxed uppercase tracking-widest font-semibold flex items-center gap-2">
                            System Notice
                        </p>
                        <p className="text-[11px] text-white/20 mt-2 leading-relaxed">
                            Tasks are stored locally in Supabase and visible to all active agents.
                            Use "Hydrate" for automatic context linking.
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT COLUMN: TASK FEED ─── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="glass-panel-elevated rounded-2xl p-8 flex flex-col bg-white/[0.01] border border-white/[0.05] h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 rounded-full bg-[#03BFAE]" />
                            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#03BFAE]">Active Loop</h2>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-[11px] font-mono text-white/20 uppercase tracking-widest">
                                {tasks.length} open loops
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {tasks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20">
                                <Clock size={48} className="mb-4" />
                                <span className="text-[11px] uppercase tracking-[0.2em]">Silence is golden.</span>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <div
                                    key={task.id}
                                    className="group relative bg-white/[0.02] border border-white/[0.04] p-5 rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer"
                                    onClick={() => toggleStatus(task)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {task.status === 'done' ? (
                                                <CheckCircle2 color="#03BFAE" size={18} />
                                            ) : (
                                                <Circle className="text-white/20 group-hover:text-[#FF64A6]/50" size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-sm font-medium transition-all ${task.status === 'done' ? 'text-white/20 line-through' : 'text-white/80'}`}>
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-[12px] text-white/30 mt-1 line-clamp-2 font-light italic">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 mt-4">
                                                {task.project_code && (
                                                    <span className="flex items-center gap-1.5 text-[10px] bg-[#818CF8]/10 text-[#818CF8] px-2 py-0.5 rounded border border-[#818CF8]/20 font-mono">
                                                        <Tag size={10} /> {task.project_code}
                                                    </span>
                                                )}
                                                {task.assigned_to && (
                                                    <span className="flex items-center gap-1.5 text-[10px] text-white/30 truncate">
                                                        <User size={10} /> {task.assigned_to}
                                                    </span>
                                                )}
                                                {task.priority === 'high' || task.priority === 'urgent' ? (
                                                    <span className="text-[10px] text-[#FF64A6] uppercase tracking-widest font-black animate-pulse">
                                                        Priority
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-white/10 group-hover:text-white/40 transition-all" />
                                    </div>

                                    {/* CONTEXT HINTS */}
                                    {task.context_hints.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-white/[0.03]">
                                            {task.context_hints.map(hint => (
                                                <span key={hint} className="text-[9px] text-white/10 uppercase tracking-widest">
                                                    #{hint}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
