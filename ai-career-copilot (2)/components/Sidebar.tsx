import React from 'react';
import { FileText, SearchCheck, Mail, Mic, Linkedin, Settings, LogOut, Briefcase, ClipboardList, Rocket, Users, Star } from 'lucide-react';
import { Button } from './Button';

export type ActiveView = 'builder' | 'matcher' | 'finder' | 'tracker' | 'letter' | 'copilot' | 'linkedin' | 'auto-apply' | 'networking' | 'settings';

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    onLogout: () => void;
    isTrialActive: boolean;
    trialDaysRemaining: number;
}

const TABS: { id: ActiveView; label: string; icon: React.ElementType, isPro?: boolean }[] = [
    { id: 'builder', label: 'Resume Builder', icon: FileText },
    { id: 'matcher', label: 'Job Matcher', icon: SearchCheck },
    { id: 'finder', label: 'Job Finder', icon: Briefcase },
    { id: 'tracker', label: 'Job Tracker', icon: ClipboardList },
    { id: 'networking', label: 'Networking CRM', icon: Users },
    { id: 'letter', label: 'Cover Letter', icon: Mail },
    { id: 'auto-apply', label: 'Auto Apply', icon: Rocket, isPro: true },
    { id: 'copilot', label: 'Interview Copilot', icon: Mic, isPro: true },
    { id: 'linkedin', label: 'LinkedIn Optimizer', icon: Linkedin, isPro: true },
];

const ProBadge = () => (
    <div className="ml-auto text-xs font-bold bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-md">
        PRO
    </div>
)

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isTrialActive, trialDaysRemaining }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-card/60 backdrop-blur-xl border-r border-border flex flex-col">
            <div className="p-5 border-b border-border">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-violet rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-text-primary">
                        AI<span className="text-accent-light">Copilot</span>
                    </h1>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {TABS.map((tab) => {
                    const isActive = activeView === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveView(tab.id)}
                            className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-background relative ${
                                isActive
                                    ? 'text-white shadow-lg shadow-brand-violet/30 bg-gradient-to-r from-brand-violet to-brand-cyan'
                                    : 'text-text-secondary hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {isActive && <div className="absolute -left-1.5 w-1 h-6 bg-white rounded-r-full shadow-lg shadow-cyan-300/50 animate-in fade-in duration-500"></div>}
                            <tab.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                            <span>{tab.label}</span>
                            {tab.isPro && !isTrialActive && <ProBadge />}
                        </button>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-border mt-auto space-y-4">
                {isTrialActive ? (
                     <Button variant="secondary" className="w-full !cursor-default" title={`Your Pro trial is active for ${trialDaysRemaining} more days.`}>
                        <Star size={16} className="mr-2 text-yellow-400"/>
                        Pro Trial: {trialDaysRemaining} days
                    </Button>
                ) : (
                    <Button className="w-full">
                        <Star size={16} className="mr-2" />
                        Upgrade to Pro
                    </Button>
                )}
                 <div className="space-y-2">
                     <button 
                        onClick={() => setActiveView('settings')}
                        className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-background relative ${activeView === 'settings' ? 'text-white shadow-md shadow-accent/10 bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/10'}`}
                      >
                         <Settings className={`h-5 w-5 transition-transform duration-300 ${activeView === 'settings' ? '' : 'group-hover:scale-110'}`} />
                         <span>Settings</span>
                     </button>
                      <button
                        onClick={onLogout}
                        className="group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                      >
                          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                          <span>Logout</span>
                      </button>
                 </div>
            </div>
        </aside>
    );
};

export default Sidebar;