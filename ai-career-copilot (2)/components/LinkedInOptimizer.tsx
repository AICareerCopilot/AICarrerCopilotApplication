
import React, { useState } from 'react';
import type { ResumeData, LinkedInAnalysis } from '../types';
import { analyzeLinkedInProfile } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { ScoreCircle } from './ScoreCircle';
import { Link, Award, BookUser, Briefcase, Wrench, GraduationCap, BadgeCheck, ClipboardCopy, Check, Star } from 'lucide-react';

interface LinkedInOptimizerProps {
  resumeData: ResumeData;
  isTrialActive: boolean;
}

const SuggestionCard: React.FC<{ title: string; icon: React.ReactNode; suggestion: string }> = ({ title, icon, suggestion }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(suggestion);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Card title={title} icon={icon}>
            <div className="relative">
                <p className="text-text-secondary whitespace-pre-wrap font-sans pr-16">{suggestion}</p>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  className="absolute top-0 right-0 !py-1 !px-2 text-xs"
                  title="Copy Suggestion"
                >
                  {hasCopied ? <Check size={14} className="text-green-400" /> : <ClipboardCopy size={14} />}
                  <span className="ml-1.5 hidden sm:inline">{hasCopied ? 'Copied!' : 'Copy'}</span>
                </Button>
            </div>
        </Card>
    );
};


const LinkedInOptimizer: React.FC<LinkedInOptimizerProps> = ({ resumeData, isTrialActive }) => {
  const [linkedInUrl, setLinkedInUrl] = useState(`https://www.linkedin.com/in/${resumeData.name.toLowerCase().replace(/\s+/g, '-')}`);
  const [targetRole, setTargetRole] = useState(resumeData.experience[0]?.role || 'Project Manager');
  const [analysis, setAnalysis] = useState<LinkedInAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!linkedInUrl.trim() || !targetRole.trim()) {
      setError('Please provide your LinkedIn Profile URL and a Target Role.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeLinkedInProfile(resumeData, linkedInUrl, targetRole);
      setAnalysis(result);
    } catch (err) {
      console.error("LinkedIn analysis failed:", err);
      setError("Failed to analyze the LinkedIn profile. The AI model might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">LinkedIn Optimizer</h1>
        <p className="text-text-secondary mt-1">Enhance your profile for recruiter visibility and professional branding.</p>
      </div>

       {!isTrialActive && (
         <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 border border-border text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="text-yellow-400"/>
                  <h3 className="text-lg font-bold text-white">This is a PRO Feature</h3>
              </div>
              <p className="text-text-secondary mb-4">Get an AI-powered analysis of your profile with actionable suggestions to attract recruiters.</p>
              <Button>Upgrade to PRO</Button>
          </div>
       )}

      <Card>
        <div className={`space-y-4 ${!isTrialActive ? 'opacity-40 pointer-events-none' : ''}`}>
          <Input
            label="Your LinkedIn Profile URL"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            disabled={!isTrialActive}
          />
          <Input
            label="Your Target Role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Product Manager"
            disabled={!isTrialActive}
          />
          <Button onClick={handleAnalyze} disabled={!isTrialActive || isLoading} className="w-full">
            {isLoading ? <Spinner /> : 'Analyze My Profile'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-4 text-center text-red-500 bg-red-500/10 rounded-2xl">
          {error}
        </div>
      )}
      
      {isLoading && !analysis && (
         <div className="flex items-center justify-center p-10 text-text-secondary">
            <Spinner />
            <span className="ml-3">AI is analyzing your profile against top performers...</span>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <Card title="Profile Strength Score">
            <div className="flex flex-col items-center justify-center p-6">
              <ScoreCircle score={analysis.score} />
              <p className="mt-4 text-lg font-medium text-text-secondary">
                Your profile strength for a <span className="font-bold text-accent">{targetRole}</span> role is {analysis.score}/100.
              </p>
            </div>
          </Card>
          
          <SuggestionCard title="Headline Suggestion" icon={<Award className="text-blue-400" />} suggestion={analysis.headlineSuggestion} />
          <SuggestionCard title="Summary (About Section) Suggestion" icon={<BookUser className="text-green-400" />} suggestion={analysis.summarySuggestion} />
          <SuggestionCard title="Work Experience Suggestion" icon={<Briefcase className="text-purple-400" />} suggestion={analysis.experienceSuggestion} />
          <SuggestionCard title="Skills Suggestion" icon={<Wrench className="text-orange-400" />} suggestion={analysis.skillsSuggestion} />
          <SuggestionCard title="Education Section Suggestion" icon={<GraduationCap className="text-indigo-400" />} suggestion={analysis.educationSuggestion} />
          <SuggestionCard title="Certifications Suggestion" icon={<BadgeCheck className="text-pink-400" />} suggestion={analysis.certificationsSuggestion} />
        </div>
      )}
    </div>
  );
};

export default LinkedInOptimizer;