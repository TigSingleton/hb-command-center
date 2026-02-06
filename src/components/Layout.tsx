import React, { useState } from 'react';
import { generateAgentResponse } from '../lib/ai';

const AGENTS = [
    { id: 'DIRECTOR', name: 'THE DIRECTOR', emoji: '🎬', desc: 'Orchestration & Strategy', color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
    { id: 'ALCHEMIST', name: 'THE ALCHEMIST', emoji: '⚗️', desc: 'Transmutation & Writing', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    { id: 'MUSE', name: 'THE MUSE', emoji: '⚡️', desc: 'Inspiration & Lyrics', color: 'text-pink-400', glow: 'shadow-pink-500/20' },
    { id: 'PRODUCER', name: 'THE PRODUCER', emoji: '🎙️', desc: 'Showrunner & Logistics', color: 'text-amber-400', glow: 'shadow-amber-500/20' },
    { id: 'INTERVIEWER', name: 'THE INTERVIEWER', emoji: '🎤', desc: 'Extraction & Depth', color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
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
        <div className="flex h-screen bg-[#050505] text-white/90 font-sans overflow-hidden selection:bg-teal-500/30">

            {/* DECORATIVE BACKGROUND ELEMENTS */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none" />

            {/* SIDEBAR */}
            <aside className="w-72 glass-panel border-r border-white/5 flex flex-col relative z-20">
                <div className="p-8 pb-4">
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400 drop-shadow-sm">
                        HBHQ<span className="font-thin text-white/30 ml-2">CMD</span>
                    </h1>
                    <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-6" />
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                    {AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => {
                                setActiveAgent(agent);
                                setOutput(null);
                            }}
                            className={`w-full group relative flex items-center p-4 rounded-xl transition-all duration-300 border border-transparent
                            ${activeAgent.id === agent.id
                                    ? 'bg-white/10 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)]'
                                    : 'hover:bg-white/5 hover:border-white/5'
                                }
                        `}
                        >
                            {/* Active Indicator Line */}
                            {activeAgent.id === agent.id && (
                                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-transparent via-${agent.color.split('-')[1]}-400 to-transparent`} />
                            )}

                            <span className={`text-2xl mr-4 transition-transform duration-300 group-hover:scale-110 ${activeAgent.id === agent.id ? 'scale-110' : 'opacity-50 group-hover:opacity-100'}`}>
                                {agent.emoji}
                            </span>
                            <div className="text-left">
                                <div className={`font-bold text-xs tracking-widest transition-colors ${activeAgent.id === agent.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                                    {agent.name}
                                </div>
                                <div className="text-[10px] text-white/30 font-medium tracking-wide mt-0.5">
                                    {agent.desc}
                                </div>
                            </div>

                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">System Operational</span>
                    </div>
                </div>
            </aside>

            {/* MAIN STAGE */}
            <main className="flex-1 flex flex-col relative z-10">

                {/* TOP BAR */}
                <header className="h-24 flex items-center px-10 justify-between">
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight text-white/90 drop-shadow-2xl flex items-center gap-4`}>
                            <span className="opacity-50 text-2xl font-normal text-white/20">AGENT //</span>
                            {activeAgent.name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-1.5 rounded-full bg-black/40 border border-white/5 text-[10px] text-white/40 tracking-widest font-mono">
                            ID: {activeAgent.id}_V2.4
                        </div>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto px-10 pb-10 flex gap-8">

                    {/* INPUT COLUMN */}
                    <div className="flex-1 max-w-2xl flex flex-col gap-6 animate-slide-in-up">
                        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">

                            {/* Subtle gradient background for card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="flex justify-between items-center mb-6">
                                <label className="text-xs font-bold text-teal-400 tracking-[0.2em] uppercase glow-text flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    Input Protocol
                                </label>
                                <span className="text-[10px] text-white/20 font-mono">waiting_for_signal...</span>
                            </div>

                            <textarea
                                className="w-full h-64 bg-black/30 rounded-xl p-6 text-base font-light leading-relaxed text-white/90 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:bg-black/50 transition-all resize-none placeholder:text-white/10"
                                placeholder={activeAgent.id === 'DIRECTOR' ? "Describe the seed idea to initiate the Waterfall...\nEx: 'I want to talk about how we sabotage our own success.'" : "Enter payload for processing..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />

                            <div className="flex justify-between items-center mt-6">
                                <div className="text-[10px] text-white/20 uppercase tracking-widest">
                                    {input.length > 0 ? `${input.length} chars` : 'Ready'}
                                </div>
                                <button
                                    onClick={handleRun}
                                    disabled={loading || !input}
                                    className={`
                                    relative overflow-hidden group/btn bg-white text-black font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-[0.15em] transition-all 
                                    ${!input ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.3)]'}
                                `}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {loading ? (
                                            <>Processing <span className="animate-pulse">...</span></>
                                        ) : (
                                            <>Initialize Protocol <span className="text-lg">→</span></>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* OUTPUT COLUMN */}
                    <div className="flex-1 animate-slide-in-up delay-[100ms]">
                        {output ? (
                            <div className="glass-panel rounded-3xl p-1 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />

                                <div className="bg-[#0A0A0C]/90 backdrop-blur-3xl rounded-[20px] p-8 h-full min-h-[400px]">
                                    <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-4">
                                        <label className="text-xs font-bold text-pink-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
                                            Data Stream
                                        </label>
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white" title="Copy">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-light prose-headings:tracking-wide prose-p:text-white/70 prose-strong:text-teal-300">
                                        <div className="whitespace-pre-wrap font-light leading-relaxed">
                                            {output}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 p-12">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <span className="text-2xl opacity-20">⚡️</span>
                                </div>
                                <p className="tracking-widest text-xs uppercase font-medium">Awaiting Output</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};
