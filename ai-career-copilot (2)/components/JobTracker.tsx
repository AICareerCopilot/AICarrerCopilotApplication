import React, { useState } from 'react';
import type { TrackedJob, JobStatus } from '../types';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Plus, Trash2, MoreVertical, ExternalLink } from 'lucide-react';

interface JobTrackerProps {
  trackedJobs: TrackedJob[];
  setTrackedJobs: React.Dispatch<React.SetStateAction<TrackedJob[]>>;
}

const STATUS_OPTIONS: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

const STATUS_STYLES: Record<JobStatus, { border: string; text: string; bg: string; shadow: string }> = {
    Wishlist: { border: 'border-slate-400/30', text: 'text-slate-300', bg: 'bg-slate-800/20', shadow: 'shadow-slate-500/10' },
    Applied: { border: 'border-brand-cyan/30', text: 'text-brand-cyan', bg: 'bg-brand-cyan/10', shadow: 'shadow-brand-cyan/10' },
    Interviewing: { border: 'border-brand-violet/30', text: 'text-brand-violet', bg: 'bg-brand-violet/10', shadow: 'shadow-brand-violet/10' },
    Offer: { border: 'border-mint/30', text: 'text-mint', bg: 'bg-mint/10', shadow: 'shadow-mint/10' },
    Rejected: { border: 'border-coral/30', text: 'text-coral', bg: 'bg-coral/10', shadow: 'shadow-coral/10' },
};


const JobTracker: React.FC<JobTrackerProps> = ({ trackedJobs, setTrackedJobs }) => {
  const [newJob, setNewJob] = useState({ company: '', title: '', url: '' });

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.company || !newJob.title) return;
    const newEntry: TrackedJob = {
      id: `job-${Date.now()}`,
      company: newJob.company,
      title: newJob.title,
      date: new Date().toISOString().split('T')[0],
      status: 'Wishlist',
      url: newJob.url,
    };
    setTrackedJobs(prev => [newEntry, ...prev]);
    setNewJob({ company: '', title: '', url: '' });
  };

  const handleUpdateStatus = (id: string, status: JobStatus) => {
    setTrackedJobs(prev => 
      prev.map(job => job.id === id ? { ...job, status, date: new Date().toISOString().split('T')[0] } : job)
    );
  };
  
  const handleDeleteJob = (id: string) => {
    setTrackedJobs(prev => prev.filter(job => job.id !== id));
  };


  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Job Application Tracker</h1>
        <p className="text-text-secondary mt-1">Manage your job search pipeline with a Kanban board.</p>
      </div>

      <Card>
        <form onSubmit={handleAddJob} className="space-y-4">
          <h3 className="font-semibold text-lg text-text-primary">Add New Application</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Company Name"
              value={newJob.company}
              onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
              placeholder="e.g., Tesla"
            />
            <Input 
              label="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Robotics Engineer"
            />
          </div>
           <Input 
              label="Job Posting URL (Optional)"
              value={newJob.url}
              onChange={(e) => setNewJob(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          <Button type="submit" className="w-full">
            <Plus size={16} className="mr-2"/> Add to Tracker
          </Button>
        </form>
      </Card>
      
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
        {STATUS_OPTIONS.map(status => {
            const jobsInStatus = trackedJobs.filter(j => j.status === status);
            const styles = STATUS_STYLES[status];
            return (
                <div key={status} className={`w-80 flex-shrink-0 rounded-2xl ${styles.bg} border border-border`}>
                    <div className={`p-3 border-b-2 ${styles.border} shadow-sm ${styles.shadow}`}>
                        <h3 className={`font-semibold ${styles.text}`}>{status} <span className="text-sm font-normal text-text-secondary/60">({jobsInStatus.length})</span></h3>
                    </div>
                    <div className="p-3 space-y-3 h-[60vh] overflow-y-auto">
                        {jobsInStatus.map(job => (
                             <div key={job.id} className="bg-card/90 p-3 rounded-lg shadow-md border border-border/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-text-primary">{job.title}</p>
                                        <p className="text-sm text-text-secondary">{job.company}</p>
                                    </div>
                                    <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 text-text-secondary/50 hover:text-pink rounded-full transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <select 
                                        value={job.status}
                                        onChange={(e) => handleUpdateStatus(job.id, e.target.value as JobStatus)}
                                        className="text-xs bg-background border border-border rounded-md px-2 py-1 focus:ring-accent focus:border-accent"
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    
                                    {job.url && (
                                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-secondary/50 hover:text-accent rounded-full transition-colors">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                             </div>
                        ))}
                         {jobsInStatus.length === 0 && (
                            <div className="flex items-center justify-center h-full text-center text-sm text-text-secondary/50 p-4">
                                Drag cards here or add new jobs to this stage.
                            </div>
                         )}
                    </div>
                </div>
            )
        })}
      </div>

    </div>
  );
};

export default JobTracker;