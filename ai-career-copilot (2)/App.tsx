
import React, { useState, useCallback, useEffect } from 'react';
import type { ResumeData, TrackedJob, Contact } from './types';
import { INITIAL_RESUME_DATA, INITIAL_TRACKED_JOBS, INITIAL_CONTACTS } from './constants';
import Sidebar, { ActiveView } from './components/Sidebar';
import ResumeBuilder from './components/ResumeBuilder';
import JobMatcher from './components/JobMatcher';
import ResumePreview from './components/ResumePreview';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import InterviewCopilot from './components/InterviewCopilot';
import LinkedInOptimizer from './components/LinkedInOptimizer';
import JobTracker from './components/JobTracker';
import JobFinder from './components/JobFinder';
import AutoApplyEngine from './components/AutoApplyEngine';
import ChatAssistant from './components/ChatAssistant';
import WelcomeScreen from './components/WelcomeScreen';
import Settings from './components/Settings';
import Footer from './components/Footer';
import NetworkingTracker from './components/NetworkingTracker';

const TRIAL_DURATION_DAYS = 15;

function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>(INITIAL_TRACKED_JOBS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeView, setActiveView] = useState<ActiveView>('builder');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  useEffect(() => {
    const trialStartDateStr = localStorage.getItem('trialStartDate');
    if (trialStartDateStr) {
      const startDate = new Date(trialStartDateStr);
      const today = new Date();
      const timeDiff = today.getTime() - startDate.getTime();
      const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
      const daysLeft = TRIAL_DURATION_DAYS - daysPassed;

      if (daysLeft > 0) {
        setIsTrialActive(true);
        setTrialDaysRemaining(daysLeft);
      } else {
        setIsTrialActive(false);
        setTrialDaysRemaining(0);
      }
    } else {
      // First time user, start the trial
      localStorage.setItem('trialStartDate', new Date().toISOString());
      setIsTrialActive(true);
      setTrialDaysRemaining(TRIAL_DURATION_DAYS);
    }
  }, []);


  const handleLogin = useCallback(() => setIsAuthenticated(true), []);
  const handleLogout = useCallback(() => {
      // Note: In a real app, you'd handle server-side logout here
      setIsAuthenticated(false)
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'builder':
        return <ResumeBuilder resumeData={resumeData} setResumeData={setResumeData} />;
      case 'matcher':
        return <JobMatcher resumeData={resumeData} setResumeData={setResumeData} />;
      case 'finder':
        return <JobFinder resumeData={resumeData} setTrackedJobs={setTrackedJobs} />;
      case 'tracker':
        return <JobTracker trackedJobs={trackedJobs} setTrackedJobs={setTrackedJobs} />;
      case 'letter':
        return <CoverLetterGenerator resumeData={resumeData} isTrialActive={isTrialActive} />;
      case 'copilot':
        return <InterviewCopilot resumeData={resumeData} isTrialActive={isTrialActive} />;
      case 'linkedin':
        return <LinkedInOptimizer resumeData={resumeData} isTrialActive={isTrialActive} />;
      case 'auto-apply':
        return <AutoApplyEngine resumeData={resumeData} isTrialActive={isTrialActive} />;
      case 'networking':
        return <NetworkingTracker contacts={contacts} setContacts={setContacts} resumeData={resumeData} />;
      case 'settings':
        return <Settings resumeData={resumeData} setResumeData={setResumeData} />;
      default:
        return <ResumeBuilder resumeData={resumeData} setResumeData={setResumeData} />;
    }
  };

  if (!isAuthenticated) {
    return <WelcomeScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout}
        isTrialActive={isTrialActive}
        trialDaysRemaining={trialDaysRemaining}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 xl:col-span-7">
            {renderActiveView()}
          </div>

          {/* Right Preview Column */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
             <ResumePreview resumeData={resumeData} />
          </div>

        </div>
        <Footer />
      </main>
      <ChatAssistant />
    </div>
  );
}

export default App;
