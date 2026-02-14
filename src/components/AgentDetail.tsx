import { useState } from 'react';
import type { Agent } from '../types';
import { cn } from '@/lib/utils';

interface AgentDetailProps {
    agent: Agent;
    onBack: () => void;
    onUpdateAgent: (agentId: string, updates: { system_prompt?: string; functional_name?: string; tool_access?: string[]; is_active?: boolean }) => void;
}

type TabType = 'identity' | 'brain' | 'tools' | 'activity';

export function AgentDetail({ agent, onBack, onUpdateAgent }: AgentDetailProps) {
    const [activeTab, setActiveTab] = useState<TabType>('identity');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const startEdit = (field: string, value: string) => {
        setEditingField(field);
        setEditValue(value);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = async (field: string) => {
        setIsSaving(true);
        try {
            const updates: Record<string, any> = {};
            if (field === 'functional_name') updates.functional_name = editValue;
            if (field === 'system_prompt') updates.system_prompt = editValue;
            if (field === 'tool_access') {
                updates.tool_access = editValue.split('\n').map(s => s.trim()).filter(Boolean);
            }
            await onUpdateAgent(agent.id, updates);
            cancelEdit();
        } finally {
            setIsSaving(false);
        }
    };

    const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: 'identity', label: 'Identity', icon: '🪪' },
        { key: 'brain', label: 'Brain', icon: '🧠' },
        { key: 'tools', label: 'Tools', icon: '🔧' },
        { key: 'activity', label: 'Activity', icon: '📊' },
    ];

    const statusColors: Record<string, { text: string; bg: string; dot: string }> = {
        active: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
        working: { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400 animate-pulse' },
        idle: { text: 'text-zinc-500', bg: 'bg-zinc-500/10', dot: 'bg-zinc-600' },
        spawning: { text: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400 animate-pulse' },
        error: { text: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
    };

    const sc = statusColors[agent.status] || statusColors.idle;

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800">
                <button
                    onClick={onBack}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 mb-3"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Agent Hub
                </button>

                <div className="flex items-start gap-4">
                    <div className={cn(
                        'w-16 h-16 rounded-xl flex items-center justify-center text-3xl',
                        agent.id === 'cea' ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-zinc-800 border border-zinc-700'
                    )}>
                        {agent.emoji}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-semibold text-zinc-100">{agent.name}</h1>
                            <span className={cn('flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                                <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                                {agent.status}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500">{agent.role}</p>
                        {agent.currentTask && (
                            <div className="mt-2 text-xs text-zinc-400 bg-zinc-800/50 px-3 py-1.5 rounded-md inline-block">
                                <span className="text-zinc-600">Working on: </span>{agent.currentTask}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => onUpdateAgent(agent.id, { is_active: agent.status === 'idle' })}
                        className={cn(
                            'text-xs px-3 py-1.5 rounded-md border transition-all',
                            agent.status === 'idle'
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-zinc-600 text-zinc-400 hover:bg-zinc-800'
                        )}
                    >
                        {agent.status === 'idle' ? 'Activate' : 'Deactivate'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'flex items-center gap-1.5 px-5 py-3 text-sm transition-all border-b-2',
                            activeTab === tab.key
                                ? 'text-zinc-200 border-teal-500'
                                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700'
                        )}
                    >
                        <span className="text-xs">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'identity' && (
                    <div className="space-y-6 max-w-2xl">
                        {/* Basic Info */}
                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Basic Information</h2>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
                                <InfoRow label="Display Name" value={agent.name} />
                                <InfoRow
                                    label="Functional Name"
                                    value={agent.role}
                                    editable
                                    isEditing={editingField === 'functional_name'}
                                    editValue={editValue}
                                    onEdit={() => startEdit('functional_name', agent.role)}
                                    onEditChange={setEditValue}
                                    onSave={() => saveEdit('functional_name')}
                                    onCancel={cancelEdit}
                                    isSaving={isSaving}
                                />
                                <InfoRow label="Agent ID" value={agent.id} mono />
                                <InfoRow label="Status" value={agent.status} />
                                <InfoRow label="Uptime" value={agent.uptime} />
                            </div>
                        </section>

                        {/* Description */}
                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Description</h2>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <p className="text-sm text-zinc-300 leading-relaxed">{agent.description}</p>
                            </div>
                        </section>

                        {/* Metrics */}
                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Performance Metrics</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(agent.metrics).map(([key, val]) => (
                                    <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                        <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="text-lg font-semibold text-zinc-200">
                                            {typeof val === 'number' ? val.toLocaleString() : val}
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Tasks Completed</div>
                                    <div className="text-lg font-semibold text-zinc-200">{agent.tasksCompleted}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'brain' && (
                    <div className="space-y-6 max-w-2xl">
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs uppercase tracking-wider text-zinc-600">System Prompt</h2>
                                {editingField !== 'system_prompt' && (
                                    <button
                                        onClick={() => startEdit('system_prompt', agent.description)}
                                        className="text-xs text-teal-400/70 hover:text-teal-400 transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                            </div>
                            {editingField === 'system_prompt' ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full bg-zinc-900 text-zinc-300 text-sm font-mono border border-teal-500/30 rounded-lg p-4 outline-none resize-none min-h-[300px] leading-relaxed"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2 justify-end">
                                        <button
                                            onClick={cancelEdit}
                                            className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => saveEdit('system_prompt')}
                                            disabled={isSaving}
                                            className="text-xs px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => startEdit('system_prompt', agent.description)}>
                                    <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{agent.description}</pre>
                                    <div className="mt-3 text-[10px] text-zinc-600 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Click to edit
                                    </div>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Behavioral Notes</h2>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-500 italic">
                                No behavioral notes configured. Edit the system prompt above to define agent behavior.
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="space-y-6 max-w-2xl">
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs uppercase tracking-wider text-zinc-600">Tool Access</h2>
                                {editingField !== 'tool_access' && (
                                    <button
                                        onClick={() => startEdit('tool_access', '')}
                                        className="text-xs text-teal-400/70 hover:text-teal-400 transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Tool
                                    </button>
                                )}
                            </div>

                            {editingField === 'tool_access' ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        placeholder="One tool per line, e.g.&#10;supabase&#10;todoist&#10;notion"
                                        className="w-full bg-zinc-900 text-zinc-300 text-sm font-mono border border-teal-500/30 rounded-lg p-4 outline-none resize-none min-h-[150px]"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2 justify-end">
                                        <button onClick={cancelEdit} className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-md transition-colors">Cancel</button>
                                        <button
                                            onClick={() => saveEdit('tool_access')}
                                            disabled={isSaving}
                                            className="text-xs px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-zinc-500 italic">
                                        No tools explicitly configured. The agent inherits default system tools.
                                    </p>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Workflows</h2>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <p className="text-sm text-zinc-500 italic">
                                    No custom workflows configured for this agent.
                                </p>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="space-y-6 max-w-2xl">
                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Recent Activity</h2>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                                <div className="text-3xl mb-2">📊</div>
                                <p className="text-sm text-zinc-500">Activity log coming soon</p>
                                <p className="text-xs text-zinc-600 mt-1">Agent activity will appear here as operations are tracked</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xs uppercase tracking-wider text-zinc-600 mb-3">Statistics Summary</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Tasks Completed</div>
                                    <div className="text-2xl font-bold text-zinc-200">{agent.tasksCompleted}</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Total Uptime</div>
                                    <div className="text-2xl font-bold text-zinc-200">{agent.uptime}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

// Info row helper
function InfoRow({
    label,
    value,
    mono,
    editable,
    isEditing,
    editValue,
    onEdit,
    onEditChange,
    onSave,
    onCancel,
    isSaving,
}: {
    label: string;
    value: string;
    mono?: boolean;
    editable?: boolean;
    isEditing?: boolean;
    editValue?: string;
    onEdit?: () => void;
    onEditChange?: (val: string) => void;
    onSave?: () => void;
    onCancel?: () => void;
    isSaving?: boolean;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-zinc-500">{label}</span>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        value={editValue}
                        onChange={(e) => onEditChange?.(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSave?.();
                            if (e.key === 'Escape') onCancel?.();
                        }}
                        className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded border border-teal-500/30 outline-none w-48"
                        autoFocus
                    />
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="text-xs text-teal-400 hover:text-teal-300"
                    >
                        {isSaving ? '...' : '✓'}
                    </button>
                    <button onClick={onCancel} className="text-xs text-zinc-500 hover:text-zinc-300">✕</button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className={cn('text-sm', mono ? 'font-mono text-zinc-400' : 'text-zinc-200')}>
                        {value}
                    </span>
                    {editable && (
                        <button onClick={onEdit} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
