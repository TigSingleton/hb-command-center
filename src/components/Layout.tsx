import React, { useState } from 'react';
import { generateAgentResponse } from '../lib/ai';

const AGENTS = [
    {
        id: 'DIRECTOR',
        name: 'THE DIRECTOR',
        desc: 'Orchestration & Strategy',
        accentColor: '#818CF8',
        accentRgb: '129, 140, 248',
    },
    {
        id: 'ALCHEMIST',
        name: 'THE ALCHEMIST',
        desc: 'Transmutation & Writing',
        accentColor: '#34D399',
        accentRgb: '52, 211, 153',
    },
    {
        id: 'MUSE',
        name: 'THE MUSE',
        desc: 'Inspiration & Lyrics',
        accentColor: '#FF64A6',
        accentRgb: '255, 100, 166',
    },
    {
        id: 'PRODUCER',
        name: 'THE PRODUCER',
        desc: 'Showrunner & Logistics',
        accentColor: '#FBBF24',
        accentRgb: '251, 191, 36',
    },
    {
        id: 'INTERVIEWER',
        name: 'THE INTERVIEWER',
        desc: 'Extraction & Depth',
        accentColor: '#22D3EE',
        accentRgb: '34, 211, 238',
    },
];

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
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1A1F24 100%)' }}>

            {/* AMBIENT BACKGROUND GLOWS */}
            <div
                className="fixed top-[-30%] left-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255, 100, 166, 0.04) 0%, transparent 70%)' }}
            />
            <div
                className="fixed bottom-[-30%] right-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(3, 191, 174, 0.04) 0%, transparent 70%)' }}
            />

            {/* ─── SIDEBAR ─── */}
            <aside
                className="w-72 flex flex-col relative z-20"
                style={{
                    background: 'rgba(13, 17, 23, 0.8)',
                    backdropFilter: 'blur(24px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                }}
                role="navigation"
                aria-label="Agent Selection"
            >
                {/* Logo */}
                <div className="p-8 pb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-[0.15em] gradient-text-brand">
                            HBHQ
                        </span>
                        <span className="text-lg font-extralight tracking-[0.2em]" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                            CMD
                        </span>
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-[0.25em] uppercase" style={{ color: '#6B6B6B' }}>
                        Command Center
                    </div>
                    <div
                        className="mt-6 h-px w-full"
                        style={{ background: 'linear-gradient(to right, rgba(255, 100, 166, 0.2), rgba(3, 191, 174, 0.2), transparent)' }}
                    />
                </div>

                {/* Agent List */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2" aria-label="AI Agents">
                    {AGENTS.map(agent => {
                        const isActive = activeAgent.id === agent.id;
                        return (
                            <button
                                key={agent.id}
                                onClick={() => {
                                    setActiveAgent(agent);
                                    setOutput(null);
                                }}
                                className="w-full group relative flex items-center p-4 rounded-xl transition-all duration-200"
                                style={{
                                    background: isActive ? `rgba(${agent.accentRgb}, 0.08)` : 'transparent',
                                    border: isActive ? `1px solid rgba(${agent.accentRgb}, 0.15)` : '1px solid transparent',
                                }}
                                aria-current={isActive ? 'page' : undefined}
                                aria-label={`${agent.name} - ${agent.desc}`}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                                        style={{ background: `linear-gradient(to bottom, transparent, ${agent.accentColor}, transparent)` }}
                                    />
                                )}

                                {/* Agent icon dot */}
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center mr-3.5 transition-all duration-200 shrink-0"
                                    style={{
                                        background: isActive ? `rgba(${agent.accentRgb}, 0.15)` : 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${isActive ? `rgba(${agent.accentRgb}, 0.2)` : 'rgba(255, 255, 255, 0.04)'}`,
                                    }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full transition-all duration-200"
                                        style={{
                                            background: isActive ? agent.accentColor : 'rgba(255, 255, 255, 0.15)',
                                            boxShadow: isActive ? `0 0 8px rgba(${agent.accentRgb}, 0.4)` : 'none',
                                        }}
                                    />
                                </div>

                                <div className="text-left min-w-0">
                                    <div
                                        className="font-semibold text-[11px] tracking-[0.12em] uppercase transition-colors duration-200 truncate"
                                        style={{ color: isActive ? '#F5F5F5' : 'rgba(255, 255, 255, 0.4)' }}
                                    >
                                        {agent.name}
                                    </div>
                                    <div
                                        className="text-[10px] font-medium tracking-wide mt-0.5 truncate"
                                        style={{ color: isActive ? `rgba(${agent.accentRgb}, 0.7)` : 'rgba(255, 255, 255, 0.15)' }}
                                    >
                                        {agent.desc}
                                    </div>
                                </div>

                                {/* Hover overlay */}
                                <div
                                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                    style={{ background: `linear-gradient(135deg, rgba(${agent.accentRgb}, 0.03), transparent)` }}
                                />
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div className="flex items-center gap-3 group cursor-default">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: '#03BFAE', boxShadow: '0 0 8px rgba(3, 191, 174, 0.4)' }}
                        />
                        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: '#6B6B6B' }}>
                            System Online
                        </span>
                    </div>
                </div>
            </aside>

            {/* ─── MAIN STAGE ─── */}
            <main className="flex-1 flex flex-col relative z-10" role="main">

                {/* TOP HEADER BAR */}
                <header
                    className="h-20 flex items-center px-10 justify-between shrink-0"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-light tracking-[0.15em] uppercase" style={{ color: '#6B6B6B' }}>
                            Agent //
                        </span>
                        <h2
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: activeAgent.accentColor }}
                        >
                            {activeAgent.name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="px-4 py-1.5 rounded-full text-[10px] tracking-[0.1em] font-mono"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                color: '#6B6B6B',
                            }}
                        >
                            {activeAgent.id}_V2.4
                        </div>
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{
                                background: `rgba(${activeAgent.accentRgb}, 0.1)`,
                                border: `1px solid rgba(${activeAgent.accentRgb}, 0.15)`,
                            }}
                        >
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    background: activeAgent.accentColor,
                                    boxShadow: `0 0 6px rgba(${activeAgent.accentRgb}, 0.5)`,
                                }}
                            />
                        </div>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto px-10 pb-10 pt-6 flex gap-8">

                    {/* INPUT COLUMN */}
                    <div className="flex-1 max-w-2xl flex flex-col gap-6 animate-slide-in-up">
                        <div
                            className="glass-panel-elevated rounded-2xl p-8 relative overflow-hidden group"
                        >
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

                            {/* Textarea */}
                            <textarea
                                id="agent-input"
                                className="w-full h-60 rounded-xl p-5 text-sm font-light leading-relaxed resize-none transition-all duration-200 relative z-10"
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
                                    aria-label={loading ? 'Processing request' : 'Initialize protocol'}
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

                    {/* OUTPUT COLUMN */}
                    <div className="flex-1 animate-slide-in-up delay-100">
                        {output ? (
                            <div className="relative rounded-2xl overflow-hidden animate-fade-in">
                                {/* Gradient border effect */}
                                <div
                                    className="absolute inset-0 rounded-2xl pointer-events-none"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(${activeAgent.accentRgb}, 0.15), rgba(3, 191, 174, 0.05))`,
                                        padding: '1px',
                                    }}
                                />

                                <div
                                    className="relative rounded-2xl p-8 min-h-[400px]"
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
                                    <div className="whitespace-pre-wrap text-sm font-light leading-relaxed" style={{ color: 'rgba(245, 245, 245, 0.75)' }}>
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
