import React, { useState } from 'react';
import { generateAgentResponse } from '../lib/ai';

/* ─── Agent Icon Components ─── */

const IconDirector: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" />
        <path d="M3 10h18" />
        <path d="M7 6l2-4" />
        <path d="M12 6l2-4" />
        <path d="M17 6l2-4" />
    </svg>
);

const IconAlchemist: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6" />
        <path d="M10 3v6.5L4 19a1 1 0 00.87 1.5h14.26A1 1 0 0020 19l-6-9.5V3" />
        <path d="M8.5 14h7" />
    </svg>
);

const IconMuse: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const IconProducer: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
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

const IconInterviewer: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
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
        name: 'Director',
        desc: 'Strategy',
        accentColor: '#818CF8',
        accentRgb: '129, 140, 248',
    },
    {
        id: 'ALCHEMIST',
        name: 'Alchemist',
        desc: 'Writing',
        accentColor: '#34D399',
        accentRgb: '52, 211, 153',
    },
    {
        id: 'MUSE',
        name: 'Muse',
        desc: 'Lyrics',
        accentColor: '#FF64A6',
        accentRgb: '255, 100, 166',
    },
    {
        id: 'PRODUCER',
        name: 'Producer',
        desc: 'Logistics',
        accentColor: '#FBBF24',
        accentRgb: '251, 191, 36',
    },
    {
        id: 'INTERVIEWER',
        name: 'Interviewer',
        desc: 'Depth',
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
        <div
            className="h-screen font-sans overflow-hidden flex flex-col"
            style={{
                background: 'linear-gradient(135deg, #0D1117 0%, #1A1F24 100%)',
                padding: '24px 28px 28px 28px',
            }}
        >
            {/* AMBIENT BACKGROUND GLOWS */}
            <div
                className="fixed top-[-30%] left-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255, 100, 166, 0.04) 0%, transparent 70%)' }}
            />
            <div
                className="fixed bottom-[-30%] right-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(3, 191, 174, 0.04) 0%, transparent 70%)' }}
            />

            {/* ─── HEADER ROW: Logo + Status ─── */}
            <div className="flex items-center justify-between relative z-20 shrink-0" style={{ marginBottom: '28px' }}>
                <div className="flex items-baseline gap-4">
                    <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '0.12em' }} className="gradient-text-brand">
                        HBHQ
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.6)' }}>
                        Command Center
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#03BFAE', boxShadow: '0 0 8px rgba(3, 191, 174, 0.4)' }}
                    />
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: '#6B6B6B' }}>
                        System Online
                    </span>
                </div>
            </div>

            {/* ─── AGENT TOOLBAR ─── */}
            <nav
                className="flex items-center gap-3 relative z-20 shrink-0" style={{ marginBottom: '28px' }}
                role="tablist"
                aria-label="AI Agents"
            >
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
                            className="group relative flex items-center rounded-xl transition-all duration-200"
                            style={{
                                padding: '12px 20px',
                                gap: '14px',
                                background: isActive ? `rgba(${agent.accentRgb}, 0.1)` : 'rgba(255, 255, 255, 0.02)',
                                border: isActive ? `1px solid rgba(${agent.accentRgb}, 0.2)` : '1px solid rgba(255, 255, 255, 0.04)',
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                                style={{
                                    background: isActive ? `rgba(${agent.accentRgb}, 0.15)` : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${isActive ? `rgba(${agent.accentRgb}, 0.25)` : 'rgba(255, 255, 255, 0.05)'}`,
                                }}
                            >
                                <Icon color={isActive ? agent.accentColor : 'rgba(255, 255, 255, 0.25)'} />
                            </div>

                            {/* Name + Desc - ALWAYS visible */}
                            <div className="text-left">
                                <div
                                    className="font-semibold tracking-[0.04em] transition-colors duration-200"
                                    style={{ fontSize: '13px', color: isActive ? '#F5F5F5' : 'rgba(255, 255, 255, 0.4)' }}
                                >
                                    {agent.name}
                                </div>
                                <div
                                    className="font-medium tracking-wide" style={{ fontSize: '10px', marginTop: '3px' }}
                                    style={{ color: isActive ? `rgba(${agent.accentRgb}, 0.7)` : 'rgba(255, 255, 255, 0.15)' }}
                                >
                                    {agent.desc}
                                </div>
                            </div>

                            {/* Active bottom bar */}
                            {isActive && (
                                <div
                                    className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full"
                                    style={{ background: `linear-gradient(to right, transparent, ${agent.accentColor}, transparent)` }}
                                />
                            )}

                            {/* Hover overlay */}
                            <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                style={{ background: `linear-gradient(135deg, rgba(${agent.accentRgb}, 0.05), transparent)` }}
                            />
                        </button>
                    );
                })}
            </nav>

            {/* ─── MAIN CONTENT: Two columns ─── */}
            <div className="flex-1 flex gap-8 min-h-0 relative z-10">

                {/* INPUT COLUMN - 38% */}
                <div className="w-[38%] shrink-0 flex flex-col animate-slide-in-up">
                    <div
                        className="glass-panel-elevated rounded-2xl relative overflow-hidden flex flex-col flex-1"
                        style={{ padding: '28px' }}
                    >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl" />

                        {/* Label row */}
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <label
                                className="text-[12px] font-bold tracking-[0.15em] uppercase flex items-center gap-2.5"
                                style={{ color: '#03BFAE' }}
                                htmlFor="agent-input"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: '#03BFAE', boxShadow: '0 0 6px rgba(3, 191, 174, 0.5)' }}
                                />
                                Input Protocol
                            </label>
                            <span className="text-[11px] font-mono" style={{ color: '#6B6B6B' }}>
                                {loading ? 'processing...' : 'ready'}
                            </span>
                        </div>

                        {/* Textarea - grows to fill */}
                        <textarea
                            id="agent-input"
                            className="w-full flex-1 min-h-[160px] rounded-xl text-sm font-light leading-relaxed resize-none transition-all duration-200 relative z-10"
                            style={{
                                padding: '20px',
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
                        <div className="flex justify-between items-center mt-6 relative z-10">
                            <div className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: '#6B6B6B' }}>
                                {input.length > 0 ? `${input.length} chars` : 'Awaiting input'}
                            </div>
                            <button
                                onClick={handleRun}
                                disabled={loading || !input}
                                className="btn-cta rounded-xl text-[12px] uppercase tracking-[0.1em] flex items-center gap-2"
                                style={{ padding: '12px 28px' }}
                                aria-label={loading ? 'Processing request' : 'Run protocol'}
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        Run Protocol
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* OUTPUT COLUMN - 62% */}
                <div className="flex-1 min-w-0 animate-slide-in-up delay-100">
                    {output ? (
                        <div className="animate-fade-in h-full">
                            <div
                                className="rounded-2xl h-full flex flex-col"
                                style={{
                                    padding: '28px',
                                    background: 'rgba(13, 17, 23, 0.9)',
                                    backdropFilter: 'blur(32px)',
                                    border: `1px solid rgba(${activeAgent.accentRgb}, 0.1)`,
                                }}
                            >
                                {/* Output header */}
                                <div
                                    className="flex justify-between items-center mb-6 pb-5 shrink-0"
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                                >
                                    <label className="text-[12px] font-bold tracking-[0.15em] uppercase flex items-center gap-2.5" style={{ color: '#FF64A6' }}>
                                        <span
                                            className="w-2 h-2 rounded-full animate-pulse"
                                            style={{ background: '#FF64A6', boxShadow: '0 0 6px rgba(255, 100, 166, 0.5)' }}
                                        />
                                        Output Stream
                                    </label>
                                    <button
                                        className="transition-all duration-200 rounded-lg"
                                        style={{ color: '#6B6B6B', padding: '8px' }}
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

                                {/* Output content - scrollable */}
                                <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm font-light leading-relaxed" style={{ color: 'rgba(245, 245, 245, 0.75)' }}>
                                    {output}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="h-full rounded-2xl flex flex-col items-center justify-center"
                            style={{
                                padding: '48px',
                                border: '1px dashed rgba(255, 255, 255, 0.06)',
                                background: 'rgba(255, 255, 255, 0.01)',
                            }}
                        >
                            <div
                                className="flex items-center justify-center mb-6"
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 100, 166, 0.05)',
                                    border: '1px solid rgba(255, 100, 166, 0.08)',
                                }}
                            >
                                <svg className="w-7 h-7" style={{ color: 'rgba(255, 100, 166, 0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="tracking-[0.15em] text-[12px] uppercase font-medium" style={{ color: '#6B6B6B' }}>
                                Awaiting Output
                            </p>
                            <p className="text-[11px] mt-2 font-light" style={{ color: 'rgba(255, 255, 255, 0.12)' }}>
                                Select an agent and run a protocol
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
