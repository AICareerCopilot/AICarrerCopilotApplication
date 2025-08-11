import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ResumeData, AutoApplyLog, AutoApplyStatus } from '../types';
import { simulateAutoApplyCycle } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Rocket, CheckCircle, XCircle, Info, Play, Pause, Star } from 'lucide-react';

interface AutoApplyEngineProps {
  resumeData: ResumeData;
  isTrialActive: boolean;
}

const STATUS_ICONS: Record<AutoApplyStatus, React.ReactNode> = {
  Info: <Info size={14} className="text-blue-400" />,
  Success: <CheckCircle size={14} className="text-green-400" />,
  Failure: <XCircle size={14} className="text-red-400" />,
};

const AutoApplyEngine: React.FC<AutoApplyEngineProps> = ({ resumeData, isTrialActive }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [jobTitle, setJobTitle] = useState('Project Manager');
  const [location, setLocation] = useState('Remote');
  const [dailyLimit, setDailyLimit] = useState(50);
  const [logs, setLogs] = useState<AutoApplyLog[]>([]);
  const [stats, setStats] = useState({ sent: 0, success: 0, failure: 0 });
  const [error, setError] = useState<string | null>(null);

  const logsContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const addLog = useCallback((log: Omit<AutoApplyLog, 'timestamp'>) => {
    setLogs(prev => [...prev, { ...log, timestamp: new Date().toLocaleTimeString() }]);
    if (log.status === 'Success') {
      setStats(prev => ({ ...prev, sent: prev.sent + 1, success: prev.success + 1 }));
    } else if (log.status === 'Failure') {
      setStats(prev => ({ ...prev, sent: prev.sent + 1, failure: prev.failure + 1 }));
    }
  }, []);

  const runSimulation = useCallback(async () => {
    if (!jobTitle || !location) {
      addLog({ message: 'Job Title and Location must be set. Pausing.', status: 'Failure' });
      setIsRunning(false);
      return;
    }
    
    try {
      setError(null);
      const newLogs = await simulateAutoApplyCycle(resumeData, jobTitle, location);
      
      let i = 0;
      const processNextLog = () => {
        if (i < newLogs.length && isRunning && isEnabled) {
          addLog(newLogs[i]);
          i++;
          timeoutRef.current = window.setTimeout(processNextLog, Math.random() * 1500 + 500); // Realistic delay
        } else if(isRunning && isEnabled) {
           // Cycle finished, loop again
           timeoutRef.current = window.setTimeout(runSimulation, 3000);
        }
      };
      processNextLog();

    } catch (err) {
      console.error("Auto Apply simulation failed:", err);
      setError("Failed to run simulation. The AI model might be busy. Please try again.");
      addLog({ message: 'AI simulation failed. Pausing.', status: 'Failure' });
      setIsRunning(false);
    }
  }, [resumeData, jobTitle, location, addLog, isRunning, isEnabled]);


  useEffect(() => {
    if (isRunning && isEnabled) {
      runSimulation();
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [isRunning, isEnabled, runSimulation]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleToggleEngine = () => {
    if (!isTrialActive) return;
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    if (!nextState) {
      setIsRunning(false); // If disabling, also stop running
    }
  };

  const handleToggleRunning = () => {
      if (!isTrialActive) return;
      setIsRunning(!isRunning);
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Auto Apply Engine</h1>
        <p className="text-text-secondary mt-1">Your personal AI copilot for automated job applications.</p>
      </div>
      
      {!isTrialActive && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 border border-border text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="text-yellow-400"/>
                <h3 className="text-lg font-bold text-white">This is a PRO Feature</h3>
            </div>
            <p className="text-text-secondary mb-4">Let our AI apply to hundreds of jobs for you while you sleep.</p>
            <Button>Upgrade to PRO</Button>
        </div>
      )}

      {/* Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!isTrialActive ? 'opacity-40' : ''}`}>
        <Card>
            <h4 className="text-sm font-medium text-text-secondary">Applications Sent</h4>
            <p className="text-3xl font-bold text-text-primary">{stats.sent}</p>
        </Card>
        <Card>
            <h4 className="text-sm font-medium text-text-secondary">Successes</h4>
            <p className="text-3xl font-bold text-green-400">{stats.success}</p>
        </Card>
        <Card>
            <h4 className="text-sm font-medium text-text-secondary">Failures</h4>
            <p className="text-3xl font-bold text-red-400">{stats.failure}</p>
        </Card>
      </div>

      {/* Configuration */}
      <Card title="Configuration" icon={<Rocket className="text-accent" />}>
        <div className={`space-y-4 ${!isTrialActive ? 'opacity-40 pointer-events-none' : ''}`}>
           <div className="flex items-center justify-between">
              <label htmlFor="engine-toggle" className="font-semibold text-text-primary">
                Auto Apply Engine
              </label>
              <button
                id="engine-toggle"
                onClick={handleToggleEngine}
                disabled={!isTrialActive}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${isEnabled ? 'bg-accent' : 'bg-background'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
           </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Target Job Title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} disabled={!isTrialActive}/>
            <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} disabled={!isTrialActive}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Daily Application Limit</label>
            <div className="flex items-center space-x-3">
              <input type="range" min="10" max="100" step="5" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-accent" disabled={!isTrialActive} />
              <span className="font-semibold text-text-primary w-12 text-center">{dailyLimit}</span>
            </div>
          </div>
           <Button onClick={handleToggleRunning} disabled={!isEnabled || !isTrialActive} className="w-full">
            {isRunning ? <><Pause size={16} className="mr-2" /> Pause Applying</> : <><Play size={16} className="mr-2" /> Start Applying</>}
          </Button>
        </div>
      </Card>

      {/* Activity Log */}
      <Card title="Live Activity Log">
         <div ref={logsContainerRef} className="h-64 overflow-y-auto bg-background p-3 rounded-xl border border-border">
           <ul className="space-y-2.5">
             {logs.map((log, index) => (
               <li key={index} className="flex items-start text-sm">
                 <span className="mt-0.5 mr-2">{STATUS_ICONS[log.status]}</span>
                 <span className="font-mono text-xs text-text-secondary/50 mr-3">{log.timestamp}</span>
                 <span className="flex-1 text-text-secondary">{log.message}</span>
               </li>
             ))}
             {!logs.length && (
                <div className="flex items-center justify-center h-full text-text-secondary/70">
                    {isTrialActive ? 'Engine is idle. Enable and start to see logs.' : 'Upgrade to Pro to enable Auto Apply.'}
                </div>
             )}
           </ul>
         </div>
         {error && (
            <div className="p-3 mt-3 text-center text-sm text-red-500 bg-red-500/10 rounded-xl">
              {error}
            </div>
          )}
      </Card>
    </div>
  );
};

export default AutoApplyEngine;