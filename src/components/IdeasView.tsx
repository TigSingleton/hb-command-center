import { useState } from 'react';
import { FeatureRequest } from '../types';

interface IdeasViewProps {
    featureRequests: FeatureRequest[];
    onUpdateFeatureRequest: (id: string, updates: { status?: string; priority?: string; title?: string; description?: string }) => void;
    onDeleteFeatureRequest: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: 'New', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    acknowledged: { label: 'Acknowledged', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    in_progress: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    dismissed: { label: 'Dismissed', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/20' },
};

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
    critical: { label: 'Critical', color: 'text-red-400', dot: 'bg-red-400' },
    high: { label: 'High', color: 'text-orange-400', dot: 'bg-orange-400' },
    medium: { label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
    low: { label: 'Low', color: 'text-zinc-400', dot: 'bg-zinc-500' },
};

export function IdeasView({ featureRequests, onUpdateFeatureRequest, onDeleteFeatureRequest }: IdeasViewProps) {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const filtered = filterStatus === 'all'
        ? featureRequests
        : featureRequests.filter(fr => fr.status === filterStatus);

    const statusCounts = featureRequests.reduce((acc, fr) => {
        acc[fr.status] = (acc[fr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const startEdit = (id: string, field: string, value: string) => {
        setEditingField({ id, field });
        setEditValue(value);
    };

    const saveEdit = (id: string) => {
        if (!editingField) return;
        onUpdateFeatureRequest(id, { [editingField.field]: editValue });
        setEditingField(null);
        setEditValue('');
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">Ideas & Feature Requests</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">{featureRequests.length} ideas captured</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-6 py-3 border-b border-zinc-800/50 overflow-x-auto">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`text-xs px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${filterStatus === 'all'
                            ? 'bg-zinc-700 text-zinc-200'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                >
                    All ({featureRequests.length})
                </button>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${filterStatus === key
                                ? `${cfg.bg} ${cfg.color} border`
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                            }`}
                    >
                        {cfg.label} ({statusCounts[key] || 0})
                    </button>
                ))}
            </div>

            {/* Ideas list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                        <svg className="w-12 h-12 mb-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-sm">No ideas here yet</p>
                        <p className="text-xs mt-1 text-zinc-700">Use the floating button or Cmd+I to capture ideas</p>
                    </div>
                ) : (
                    filtered.map((fr) => {
                        const isExpanded = expandedId === fr.id;
                        const sc = statusConfig[fr.status];
                        const pc = priorityConfig[fr.priority];

                        return (
                            <div
                                key={fr.id}
                                className={`rounded-lg border transition-all ${isExpanded
                                        ? 'bg-zinc-800/50 border-zinc-700'
                                        : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-800/30'
                                    }`}
                            >
                                {/* Row */}
                                <div
                                    className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : fr.id)}
                                >
                                    {/* Priority dot */}
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${pc.dot}`} />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {editingField?.id === fr.id && editingField.field === 'title' ? (
                                            <input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit(fr.id);
                                                    if (e.key === 'Escape') setEditingField(null);
                                                }}
                                                onBlur={() => saveEdit(fr.id)}
                                                className="w-full bg-transparent text-zinc-200 text-sm font-medium outline-none border-b border-teal-500/50"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-zinc-200 truncate">{fr.title}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${sc.bg} ${sc.color} border`}>
                                                {sc.label}
                                            </span>
                                            {fr.sourceView && (
                                                <span className="text-[10px] text-zinc-600">
                                                    from {fr.sourceView.replace(/-/g, ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-[10px] text-zinc-600 whitespace-nowrap mt-1">{formatDate(fr.createdAt)}</span>

                                    {/* Expand arrow */}
                                    <svg
                                        className={`w-4 h-4 text-zinc-600 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {/* Expanded panel */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-zinc-800/50 space-y-3">
                                        {/* Description */}
                                        {fr.description && (
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Details</span>
                                                {editingField?.id === fr.id && editingField.field === 'description' ? (
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(fr.id); }
                                                            if (e.key === 'Escape') setEditingField(null);
                                                        }}
                                                        onBlur={() => saveEdit(fr.id)}
                                                        className="w-full bg-zinc-800 text-zinc-300 text-sm rounded-md p-2 outline-none border border-zinc-700 resize-none"
                                                        rows={3}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <p
                                                        className="text-sm text-zinc-400 cursor-text hover:text-zinc-300 transition-colors"
                                                        onClick={() => startEdit(fr.id, 'description', fr.description || '')}
                                                    >
                                                        {fr.description}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Screenshot */}
                                        {fr.screenshotUrl && (
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Screenshot</span>
                                                <img
                                                    src={fr.screenshotUrl}
                                                    alt="Screenshot reference"
                                                    className="max-h-56 rounded-lg border border-zinc-700/50 bg-zinc-800 object-contain"
                                                />
                                            </div>
                                        )}

                                        {/* Status actions */}
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1.5">Status</span>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => onUpdateFeatureRequest(fr.id, { status: key })}
                                                        className={`text-xs px-2.5 py-1 rounded-md border transition-all ${fr.status === key
                                                                ? `${cfg.bg} ${cfg.color}`
                                                                : 'border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                                            }`}
                                                    >
                                                        {cfg.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Priority actions */}
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1.5">Priority</span>
                                            <div className="flex gap-1">
                                                {Object.entries(priorityConfig).map(([key, cfg]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => onUpdateFeatureRequest(fr.id, { priority: key })}
                                                        className={`text-xs px-2.5 py-1 rounded-md border transition-all ${fr.priority === key
                                                                ? `${cfg.color} bg-zinc-800 border-zinc-600`
                                                                : 'border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                                            }`}
                                                    >
                                                        {cfg.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions row */}
                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                            <button
                                                onClick={() => startEdit(fr.id, 'title', fr.title)}
                                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Edit title
                                            </button>

                                            {confirmDelete === fr.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-red-400">Delete?</span>
                                                    <button
                                                        onClick={() => { onDeleteFeatureRequest(fr.id); setConfirmDelete(null); setExpandedId(null); }}
                                                        className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-500 transition-colors"
                                                    >
                                                        Yes
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDelete(fr.id)}
                                                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
