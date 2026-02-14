import { useState, useEffect, useRef, useCallback } from 'react';
import { FeatureRequest } from '../types';

interface IdeaCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description?: string; screenshotUrl?: string; sourceView?: string; priority?: string }) => void;
    currentView: string;
}

export function IdeaCaptureModal({ isOpen, onClose, onSubmit, currentView }: IdeaCaptureModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [pastedImage, setPastedImage] = useState<string | null>(null);
    const [priority, setPriority] = useState<string>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && titleRef.current) {
            setTimeout(() => titleRef.current?.focus(), 50);
        }
        if (!isOpen) {
            setTitle('');
            setDescription('');
            setShowDescription(false);
            setPastedImage(null);
            setPriority('medium');
        }
    }, [isOpen]);

    // Handle paste for screenshots
    const handlePaste = useCallback((e: ClipboardEvent) => {
        if (!isOpen) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setPastedImage(event.target?.result as string);
                    };
                    reader.readAsDataURL(blob);
                    e.preventDefault();
                    break;
                }
            }
        }
    }, [isOpen]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    // Handle keyboard shortcut to open (Cmd+I)
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
                description: description.trim() || undefined,
                screenshotUrl: pastedImage || undefined,
                sourceView: currentView,
                priority,
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

    const viewLabel = currentView.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative z-10 w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden"
                style={{ animation: 'slideUp 0.2s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-pink-500/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-200">Quick Idea</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{viewLabel}</span>
                        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                    {/* Title */}
                    <input
                        ref={titleRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What could be better?"
                        className="w-full bg-transparent text-zinc-100 text-lg font-medium placeholder:text-zinc-600 outline-none border-none"
                        autoComplete="off"
                    />

                    {/* Description toggle & input */}
                    {!showDescription ? (
                        <button
                            onClick={() => setShowDescription(true)}
                            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add details
                        </button>
                    ) : (
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="More context..."
                            className="w-full bg-zinc-800/50 text-zinc-300 text-sm placeholder:text-zinc-600 outline-none border border-zinc-700/50 rounded-lg p-3 resize-none min-h-[80px]"
                            rows={3}
                            autoFocus
                        />
                    )}

                    {/* Pasted Screenshot Preview */}
                    {pastedImage && (
                        <div className="relative group">
                            <img
                                src={pastedImage}
                                alt="Screenshot"
                                className="w-full max-h-48 object-contain rounded-lg border border-zinc-700/50 bg-zinc-800"
                            />
                            <button
                                onClick={() => setPastedImage(null)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Paste hint */}
                    {!pastedImage && (
                        <div className="text-xs text-zinc-600 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Paste a screenshot with Cmd+V
                        </div>
                    )}
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
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Save
                                <kbd className="text-[10px] px-1 py-0.5 rounded bg-teal-700/50 text-teal-200">↵</kbd>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Animation keyframe */}
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
}

// Floating Action Button component
interface IdeaFABProps {
    onClick: () => void;
    ideaCount?: number;
}

export function IdeaFAB({ onClick, ideaCount }: IdeaFABProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 group"
            title="Quick Idea (Cmd+I)"
        >
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {ideaCount !== undefined && ideaCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                        {ideaCount > 99 ? '99+' : ideaCount}
                    </span>
                )}
            </div>
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                Quick Idea <kbd className="ml-1 px-1 py-0.5 rounded bg-zinc-700 text-zinc-400 text-[10px]">⌘I</kbd>
            </span>
        </button>
    );
}
