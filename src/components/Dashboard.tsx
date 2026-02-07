import React from 'react';

export const Dashboard: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col animate-slide-in-up">
            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-panel rounded-2xl p-6 h-32 flex flex-col justify-between border border-white/5 bg-white/[0.02]">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">System Metric {i}</span>
                        <span className="text-2xl font-light text-white/80">Online</span>
                    </div>
                ))}
            </div>
            <div className="mt-8 glass-panel-elevated rounded-2xl p-8 flex-1 border border-white/5 bg-white/[0.01]">
                <h1 className="text-3xl font-light text-white/90 mb-4 italic">Welcome Home, Tiger.</h1>
                <p className="text-sm text-white/40 max-w-xl leading-relaxed">
                    The command center is synchronized with Supabase. All systems operational.
                    Select a module from the navigation to begin.
                </p>
            </div>
        </div>
    );
};
