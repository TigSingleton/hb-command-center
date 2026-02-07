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

export const ContentEngine: React.FC = () => {
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
        <div className="flex flex-col flex-1 min-h-0">
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
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                                style={{
                                    background: isActive ? `rgba(${agent.accentRgb}, 0.15)` : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${isActive ? `rgba(${agent.accentRgb}, 0.25)` : 'rgba(255, 255, 255, 0.05)'}`,
                                }}
                            >
                                <Icon color={isActive ? agent.accentColor : 'rgba(255, 255, 255, 0.25)'} />
                            </div>
                            <div className="text-left">
                                <div
                                    className="font-semibold tracking-[0.04em] transition-colors duration-200"
                                    style={{ fontSize: '13px', color: isActive ? '#F5F5F5' : 'rgba(255, 255, 255, 0.4)' }}
                                >
                                    {agent.name}
                                </div>
                                <div
                                    className="font-medium tracking-wide"
                                    style={{ fontSize: '10px', marginTop: '3px', color: isActive ? `rgba(${agent.accentRgb}, 0.7)` : 'rgba(255, 255, 255, 0.15)' }}
                                >
                                    {agent.desc}
                                </div>
                            </div>
                            {isActive && (
                                <div
                                    className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full"
                                    style={{ background: `linear-gradient(to right, transparent, ${agent.accentColor}, transparent)` }}
                                />
                            )}
                            <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                style={{ background: `linear-gradient(135deg, rgba(${agent.accentRgb}, 0.05), transparent)` }}
                            />
                        </button>
                    );
                })}
            </nav>

            {/* ─── MAIN CONTENT ─── */}
            <div className="flex-1 flex gap-8 min-h-0 relative z-10">
                <div className="w-[38%] shrink-0 flex flex-col animate-slide-in-up">
                    <div
                        className="glass-panel-elevated rounded-2xl relative overflow-hidden flex flex-col flex-1"
                        style={{ padding: '28px' }}
                    >
                        <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl" />
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
                            placeholder={
                                activeAgent.id === 'DIRECTOR'
                                    ? "Describe the seed idea to initiate the Waterfall..."
                                    : "Enter payload for processing..."
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-6 relative z-10">
                            <div className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: '#6B6B6B' }}>
                                {input.length > 0 ? `${input.length} chars` : 'Awaiting input'}
                            </div>
                            <button
                                onClick={handleRun}
                                disabled={loading || !input}
                                className="btn-cta rounded-xl text-[12px] uppercase tracking-[0.1em] flex items-center gap-2"
                                style={{ padding: '12px 28px' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        Run Protocol
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

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
                                </div>
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
                            <p className="tracking-[0.15em] text-[12px] uppercase font-medium" style={{ color: '#6B6B6B' }}>
                                Awaiting Output
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
