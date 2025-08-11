import React, { useState } from 'react';
import type { ResumeData, JobListing, TrackedJob } from '../types';
import { findJobs } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { ScoreCircle } from './ScoreCircle';
import { Briefcase, MapPin, PlusCircle, CheckCircle } from 'lucide-react';

interface JobFinderProps {
  resumeData: ResumeData;
  setTrackedJobs: React.Dispatch<React.SetStateAction<TrackedJob[]>>;
}

const JobFinder: React.FC<JobFinderProps> = ({ resumeData, setTrackedJobs }) => {
  const [jobTitle, setJobTitle] = useState('Project Manager');
  const [location, setLocation] = useState('New Delhi, India');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const handleFindJobs = async () => {
    if (!jobTitle.trim() || !location.trim()) {
      setError('Please provide a Job Title and Location.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setJobs([]);

    try {
      const results = await findJobs(resumeData, jobTitle, location);
      const jobsWithIds = results.map(job => ({ ...job, id: `job-listing-${Date.now()}-${Math.random()}` }));
      setJobs(jobsWithIds);
    } catch (err) {
      console.error("Failed to find jobs:", err);
      setError("Failed to find jobs. The AI model might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddToTracker = (job: JobListing) => {
    const newTrackedJob: TrackedJob = {
      id: `tracked-${job.id}`,
      company: job.company,
      title: job.title,
      date: new Date().toISOString().split('T')[0],
      status: 'Wishlist',
    };
    setTrackedJobs(prev => [newTrackedJob, ...prev]);
    setTrackedIds(prev => new Set(prev).add(job.id));
  };


  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Job Finder</h1>
        <p className="text-text-secondary mt-1">Discover opportunities tailored to your resume.</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer"
          />
          <Input 
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Bengaluru, India"
          />
        </div>
        <Button onClick={handleFindJobs} disabled={isLoading} className="w-full mt-4">
          {isLoading ? <Spinner /> : 'Find Matching Jobs'}
        </Button>
      </Card>
      
      {error && (
        <div className="p-4 text-center text-red-500 bg-red-500/10 rounded-2xl">
          {error}
        </div>
      )}

      {isLoading && jobs.length === 0 && (
         <div className="flex items-center justify-center p-10 text-text-secondary">
            <Spinner />
            <span className="ml-3">AI is searching for the best jobs for you...</span>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Recommended Jobs</h2>
          {jobs.map(job => (
            <Card key={job.id}>
               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 flex flex-col items-center justify-center text-center border-r border-border pr-4">
                      <ScoreCircle score={job.matchScore} />
                      <p className="text-xs mt-2 text-text-secondary">Match Score</p>
                  </div>
                  <div className="col-span-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-accent-light">{job.title}</h3>
                            <div className="flex items-center text-sm text-text-primary mt-1">
                                <Briefcase size={14} className="mr-2"/>
                                <span>{job.company}</span>
                            </div>
                            <div className="flex items-center text-sm text-text-secondary mt-1">
                                <MapPin size={14} className="mr-2"/>
                                <span>{job.location}</span>
                            </div>
                        </div>
                         <Button 
                            variant="secondary" 
                            className="!px-2 !py-1.5"
                            onClick={() => handleAddToTracker(job)}
                            disabled={trackedIds.has(job.id)}
                          >
                           {trackedIds.has(job.id) ? (
                              <CheckCircle size={16} className="text-green-400" />
                           ) : (
                              <PlusCircle size={16} />
                           )}
                           <span className="ml-2 text-xs">{trackedIds.has(job.id) ? 'Added' : 'Track'}</span>
                        </Button>
                    </div>
                     <p className="text-xs text-text-secondary mt-3 line-clamp-2">
                        {job.description}
                    </p>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default JobFinder;