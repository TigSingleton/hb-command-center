import React, { useState } from 'react';
import { generateAgentResponse } from '../lib/ai';

/* ─── Agent Icon Components ─── */

const IconDirector: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" />
        <path d="M3 10h18" />
        <path d="M7 6l2-4" />
        <path d="M12 6l2-4" />
        <path d="M17 6l2-4" />
    </svg>
);

const IconAlchemist: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6" />
        <path d="M10 3v6.5L4 19a1 1 0 00.87 1.5h14.26A1 1 0 0020 19l-6-9.5V3" />
        <path d="M8.5 14h7" />
    </svg>
);

const IconMuse: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const IconProducer: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
);

const IconInterviewer: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const AGENT_ICONS: Record<string, React.FC<{ color: string; size?: number }>> = {
    DIRECTOR: IconDirector,
    ALCHEMIST: IconAlchemist,
    MUSE: IconMuse,
    PRODUCER: IconProducer,
    INTERVIEWER: IconInterviewer,
};

/* ─── Agent Definitions ─── */

const AGENTS = [
    {
        id: 'DIRECTOR',
        name: 'THE DIRECTOR',
        shortName: 'Director',
        desc: 'Orchestration & Strategy',
        accentColor: '#818CF8',
        accentRgb: '129, 140, 248',
    },
    {
        id: 'ALCHEMIST',
        name: 'THE ALCHEMIST',
        shortName: 'Alchemist',
        desc: 'Transmutation & Writing',
        accentColor: '#34D399',
        accentRgb: '52, 211, 153',
    },
    {
        id: 'MUSE',
        name: 'THE MUSE',
        shortName: 'Muse',
        desc: 'Inspiration & Lyrics',
        accentColor: '#FF64A6',
        accentRgb: '255, 100, 166',
    },
    {
        id: 'PRODUCER',
        name: 'THE PRODUCER',
        shortName: 'Producer',
        desc: 'Showrunner & Logistics',
        accentColor: '#FBBF24',
        accentRgb: '251, 191, 36',
    },
    {
        id: 'INTERVIEWER',
        name: 'THE INTERVIEWER',
        shortName: 'Interviewer',
        desc: 'Extraction & Depth',
        accentColor: '#22D3EE',
        accentRgb: '34, 211, 238',
    },
];

/* ─── Layout Component ─── */

export const Layout: React.FC = () => {
    const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string | null>(null);

    const handleRun = async () => {
        if (!input) return;
        setLoading(true);
        const response = await generateAgentResponse(activeAgent.id, input);
        setOutput(response.markdown);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen font-sans overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1A1F24 100%)' }}>

            {/* AMBIENT BACKGROUND GLOWS */}
            <div
                className="fixed top-[-30%] left-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255, 100, 166, 0.04) 0%, transparent 70%)' }}
            />
            <div
                className="fixed bottom-[-30%] right-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(3, 191, 174, 0.04) 0%, transparent 70%)' }}
            />

            {/* ─── TOP BAR: Logo + Agent Toolbar ─── */}
            <header
                className="relative z-20 shrink-0 px-8 pt-6 pb-5"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-baseline gap-1.5 shrink-0">
                        <span className="text-xl font-black tracking-[0.15em] gradient-text-brand">
                            HBHQ
                        </span>
                        <span className="text-sm font-extralight tracking-[0.2em]" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                            CMD
                        </span>
                    </div>

                    {/* Agent Toolbar */}
                    <nav className="flex items-center gap-2" role="tablist" aria-label="AI Agents">
                        {AGENTS.map(agent => {
                            const isActive = activeAgent.id === agent.id;
                            const Icon = AGENT_ICONS[agent.id];
                            return (
                                <button
                                    key={agent.id}
                                    onClick={() => {
                                        setActiveAgent(agent);
                                        setOutput(null);
                                    }}
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-label={`${agent.name} - ${agent.desc}`}
                                    className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200"
                                    style={{
                                        background: isActive ? `rgba(${agent.accentRgb}, 0.1)` : 'transparent',
                                        border: isActive ? `1px solid rgba(${agent.accentRgb}, 0.2)` : '1px solid transparent',
                                    }}
                                >
                                    {/* Icon */}
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                                        style={{
                                            background: isActive ? `rgba(${agent.accentRgb}, 0.15)` : 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${isActive ? `rgba(${agent.accentRgb}, 0.25)` : 'rgba(255, 255, 255, 0.04)'}`,
                                        }}
                                    >
                                        <Icon color={isActive ? agent.accentColor : 'rgba(255, 255, 255, 0.2)'} size={15} />
                                    </div>

                                    {/* Name + Desc */}
                                    <div className="text-left hidden lg:block">
                                        <div
                                            className="text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200"
                                            style={{ color: isActive ? '#F5F5F5' : 'rgba(255, 255, 255, 0.35)' }}
                                        >
                                            {agent.shortName}
                                        </div>
                                        <div
                                            className="text-[9px] font-medium tracking-wide mt-0.5"
                                            style={{ color: isActive ? `rgba(${agent.accentRgb}, 0.6)` : 'rgba(255, 255, 255, 0.12)' }}
                                        >
                                            {agent.desc}
                                        </div>
                                    </div>

                                    {/* Active bottom indicator */}
                                    {isActive && (
                                        <div
                                            className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                                            style={{ background: `linear-gradient(to right, transparent, ${agent.accentColor}, transparent)` }}
                                        />
                                    )}

                                    {/* Hover overlay */}
                                    <div
                                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                        style={{ background: `linear-gradient(135deg, rgba(${agent.accentRgb}, 0.04), transparent)` }}
                                    />
                                </button>
                            );
                        })}
                    </nav>

                    {/* Status */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: '#03BFAE', boxShadow: '0 0 8px rgba(3, 191, 174, 0.4)' }}
                        />
                        <span className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ color: '#6B6B6B' }}>
                            Online
                        </span>
                    </div>
                </div>
            </header>

            {/* ─── MAIN CONTENT: Input + Output ─── */}
            <main className="flex-1 flex flex-col min-h-0 relative z-10" role="main">

                {/* Content Area - full width, two columns */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6 flex gap-8">

                    {/* INPUT COLUMN - 40% */}
                    <div className="w-[40%] shrink-0 flex flex-col gap-5 animate-slide-in-up">
                        <div className="glass-panel-elevated rounded-2xl p-7 relative overflow-hidden group flex flex-col flex-1">
                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl" />

                            {/* Label row */}
                            <div className="flex justify-between items-center mb-5 relative z-10">
                                <label
                                    className="text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-2.5"
                                    style={{ color: '#03BFAE' }}
                                    htmlFor="agent-input"
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: '#03BFAE', boxShadow: '0 0 6px rgba(3, 191, 174, 0.5)' }}
                                    />
                                    Input Protocol
                                </label>
                                <span className="text-[10px] font-mono" style={{ color: '#6B6B6B' }}>
                                    {loading ? 'processing...' : 'ready'}
                                </span>
                            </div>

                            {/* Textarea - grows to fill */}
                            <textarea
                                id="agent-input"
                                className="w-full flex-1 min-h-[180px] rounded-xl p-5 text-sm font-light leading-relaxed resize-none transition-all duration-200 relative z-10"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    color: '#F5F5F5',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(3, 191, 174, 0.3)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(3, 191, 174, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                placeholder={
                                    activeAgent.id === 'DIRECTOR'
                                        ? "Describe the seed idea to initiate the Waterfall..."
                                        : "Enter payload for processing..."
                                }
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                aria-label="Agent input text"
                            />

                            {/* Footer row */}
                            <div className="flex justify-between items-center mt-5 relative z-10">
                                <div className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: '#6B6B6B' }}>
                                    {input.length > 0 ? `${input.length} chars` : 'Awaiting input'}
                                </div>
                                <button
                                    onClick={handleRun}
                                    disabled={loading || !input}
                                    className="btn-cta py-3 px-7 rounded-xl text-xs uppercase tracking-[0.12em] flex items-center gap-2"
                                    aria-label={loading ? 'Processing request' : 'Run protocol'}
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing
                                        </>
                                    ) : (
                                        <>
                                            Run Protocol
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* OUTPUT COLUMN - 60% */}
                    <div className="flex-1 min-w-0 animate-slide-in-up delay-100">
                        {output ? (
                            <div className="relative rounded-2xl overflow-hidden animate-fade-in h-full">
                                <div
                                    className="relative rounded-2xl p-8 h-full"
                                    style={{
                                        background: 'rgba(13, 17, 23, 0.9)',
                                        backdropFilter: 'blur(32px)',
                                        border: `1px solid rgba(${activeAgent.accentRgb}, 0.1)`,
                                    }}
                                >
                                    {/* Output header */}
                                    <div
                                        className="flex justify-between items-center mb-6 pb-4"
                                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                                    >
                                        <label className="text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-2.5" style={{ color: '#FF64A6' }}>
                                            <span
                                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                style={{ background: '#FF64A6', boxShadow: '0 0 6px rgba(255, 100, 166, 0.5)' }}
                                            />
                                            Output Stream
                                        </label>
                                        <button
                                            className="p-2 rounded-lg transition-all duration-200"
                                            style={{ color: '#6B6B6B' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.color = '#F5F5F5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#6B6B6B';
                                            }}
                                            aria-label="Copy output"
                                            title="Copy to clipboard"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Output content */}
                                    <div className="whitespace-pre-wrap text-sm font-light leading-relaxed overflow-y-auto" style={{ color: 'rgba(245, 245, 245, 0.75)' }}>
                                        {output}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="h-full rounded-2xl flex flex-col items-center justify-center p-12"
                                style={{
                                    border: '1px dashed rgba(255, 255, 255, 0.05)',
                                    background: 'rgba(255, 255, 255, 0.01)',
                                }}
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                                    style={{
                                        background: 'rgba(255, 100, 166, 0.05)',
                                        border: '1px solid rgba(255, 100, 166, 0.08)',
                                    }}
                                >
                                    <svg className="w-6 h-6" style={{ color: 'rgba(255, 100, 166, 0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="tracking-[0.15em] text-[11px] uppercase font-medium" style={{ color: '#6B6B6B' }}>
                                    Awaiting Output
                                </p>
                                <p className="text-[10px] mt-2 font-light" style={{ color: 'rgba(255, 255, 255, 0.1)' }}>
                                    Select an agent and run a protocol
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};
