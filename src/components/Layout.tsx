import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { ContentEngine } from './ContentEngine';
import { TaskEngine } from './TaskEngine';

/* ─── Navigation Icons ─── */

const IconDashboard: React.FC<{ color: string }> = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const IconContent: React.FC<{ color: string }> = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
    </svg>
);

const IconTasks: React.FC<{ color: string }> = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
);

/* ─── Module Definitions ─── */

const MODULES = [
    { id: 'dashboard', name: 'Dashboard', icon: IconDashboard, color: '#818CF8' },
    { id: 'content', name: 'Content Engine', icon: IconContent, color: '#34D399' },
    { id: 'tasks', name: 'Task Engine', icon: IconTasks, color: '#FF64A6' },
];

export const Layout: React.FC = () => {
    const [activeModule, setActiveModule] = useState('dashboard');

    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard': return <Dashboard />;
            case 'content': return <ContentEngine />;
            case 'tasks': return <TaskEngine />;
            default: return <Dashboard />;
        }
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

            {/* ─── HEADER ROW ─── */}
            <div className="flex items-center justify-between relative z-20 shrink-0" style={{ marginBottom: '28px' }}>
                <div className="flex items-baseline gap-4">
                    <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '0.12em' }} className="gradient-text-brand">
                        HBHQ
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.6)' }}>
                        Command Center
                    </span>
                </div>

                {/* ─── MODULE NAVIGATION ─── */}
                <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                    {MODULES.map(module => {
                        const isActive = activeModule === module.id;
                        const Icon = module.icon;
                        return (
                            <button
                                key={module.id}
                                onClick={() => setActiveModule(module.id)}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 group"
                                style={{
                                    background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                }}
                            >
                                <Icon color={isActive ? module.color : 'rgba(255, 255, 255, 0.4)'} />
                                <span
                                    className="text-[13px] font-medium tracking-wide transition-colors"
                                    style={{ color: isActive ? '#F5F5F5' : 'rgba(255, 255, 255, 0.4)' }}
                                >
                                    {module.name}
                                </span>
                            </button>
                        );
                    })}
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

            {/* ─── MODULE CONTENT ─── */}
            <div className="flex-1 min-h-0 relative z-10 flex flex-col">
                {renderModule()}
            </div>
        </div>
    );
};
