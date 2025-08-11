import React, { useState } from 'react';
import type { ResumeData, JobAnalysis, CustomizationSuggestion } from '../types';
import { analyzeResumeAgainstJob, autoCustomizeResume } from '../services/geminiService';
import { Card } from './Card';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { ScoreCircle } from './ScoreCircle';
import { Lightbulb, ThumbsDown, ThumbsUp, Sparkles, Check } from 'lucide-react';

interface JobMatcherProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const JobMatcher: React.FC<JobMatcherProps> = ({ resumeData, setResumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customization, setCustomization] = useState<CustomizationSuggestion | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCustomization(null); // Reset customization on new analysis
    try {
      const result = await analyzeResumeAgainstJob(resumeData, jobDescription);
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the job description. The AI model might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = async () => {
    setIsCustomizing(true);
    setError(null);
    try {
      const result = await autoCustomizeResume(resumeData, jobDescription);
      setCustomization(result);
    } catch (err) {
      console.error("Customization failed:", err);
      setError("Failed to generate customizations. The AI model might be busy. Please try again.");
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleAcceptChange = (field: keyof CustomizationSuggestion, value: any, id?: string) => {
    if (field === 'summary' && typeof value === 'string') {
      setResumeData(prev => ({ ...prev, summary: value }));
    } else if (field === 'skills' && typeof value === 'string') {
      setResumeData(prev => ({ ...prev, skills: value }));
    } else if (field === 'experience' && id && typeof value === 'string') {
      setResumeData(prev => ({
        ...prev,
        experience: prev.experience.map(exp => exp.id === id ? { ...exp, responsibilities: value } : exp)
      }));
    }

    setCustomization(prev => {
      if (!prev) return null;
      const newCustomization = { ...prev };
      if (field === 'experience') {
        newCustomization.experience = newCustomization.experience?.filter(exp => exp.id !== id);
      } else {
        delete newCustomization[field];
      }
      if (Object.values(newCustomization).every(v => v === undefined || (Array.isArray(v) && v.length === 0))) {
        return null;
      }
      return newCustomization;
    });
  };


  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Resume-Job Fit Analyzer</h1>
        <p className="text-text-secondary mt-1">See how your resume stacks up against a job description.</p>
      <Card>
        <div className="space-y-4">
          <Textarea
            label="Paste Job Description Here"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="e.g., Senior Product Manager at Google..."
          />
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
            {isLoading ? <Spinner /> : 'Analyze Match Score'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-4 text-center text-red-500 bg-red-500/10 rounded-2xl">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <Card title="Match Score">
            <div className="flex flex-col items-center justify-center p-6">
              <ScoreCircle score={analysis.matchScore} />
              <p className="mt-4 text-lg font-medium text-text-secondary">
                Your resume is a {analysis.matchScore}% match for this role.
              </p>
            </div>
          </Card>

          <Card title="Strengths" icon={<ThumbsUp className="text-green-400" />}>
            <p className="mt-2 text-text-secondary">{analysis.strengths}</p>
          </Card>
          
          <Card title="Weaknesses" icon={<ThumbsDown className="text-orange-400" />}>
            <p className="mt-2 text-text-secondary">{analysis.weaknesses}</p>
          </Card>

          <Card title="Improvement Suggestions" icon={<Lightbulb className="text-yellow-400" />}>
            <ul className="space-y-3 list-disc list-inside text-text-secondary">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </Card>
          
          {/* Customization Section */}
          {!isCustomizing && !customization && (
            <div className="text-center pt-2">
              <Button onClick={handleCustomize} disabled={isCustomizing}>
                {isCustomizing ? <Spinner /> : <Sparkles className="mr-2" size={18} />}
                Auto-Customize Resume For This Job
              </Button>
            </div>
          )}

          {isCustomizing && (
            <div className="flex items-center justify-center p-6 text-text-secondary">
              <Spinner />
              <span className="ml-3">AI is tailoring your resume...</span>
            </div>
          )}

          {customization && (customization.summary || customization.skills || (customization.experience && customization.experience.length > 0)) && (
            <Card title="AI Customization Suggestions" icon={<Sparkles className="text-yellow-400" />}>
              <div className="space-y-6">
                {customization.summary && (
                  <div>
                    <h4 className="font-semibold text-md text-text-primary mb-2">Suggested Professional Summary</h4>
                    <div className="p-3 bg-background/50 rounded-lg text-sm text-text-secondary whitespace-pre-wrap font-sans">
                      {customization.summary}
                    </div>
                    <Button onClick={() => handleAcceptChange('summary', customization.summary)} className="mt-2 !text-xs !py-1" variant="secondary">
                      <Check size={14} className="mr-1.5"/> Accept Summary
                    </Button>
                  </div>
                )}

                {customization.experience?.map(expSuggestion => {
                    const originalExp = resumeData.experience.find(e => e.id === expSuggestion.id);
                    if (!originalExp) return null;
                    return (
                        <div key={expSuggestion.id}>
                            <h4 className="font-semibold text-md text-text-primary mb-2">Suggested Updates for "{originalExp.role}"</h4>
                            <div className="p-3 bg-background/50 rounded-lg text-sm text-text-secondary whitespace-pre-wrap font-sans">
                              {expSuggestion.responsibilities}
                            </div>
                            <Button onClick={() => handleAcceptChange('experience', expSuggestion.responsibilities, expSuggestion.id)} className="mt-2 !text-xs !py-1" variant="secondary">
                               <Check size={14} className="mr-1.5"/> Accept Bullets
                            </Button>
                        </div>
                    )
                })}

                {customization.skills && (
                  <div>
                    <h4 className="font-semibold text-md text-text-primary mb-2">Suggested Skills</h4>
                    <div className="p-3 bg-background/50 rounded-lg text-sm text-text-secondary">
                      {customization.skills}
                    </div>
                    <Button onClick={() => handleAcceptChange('skills', customization.skills)} className="mt-2 !text-xs !py-1" variant="secondary">
                       <Check size={14} className="mr-1.5"/> Accept Skills
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  );
};

export default JobMatcher;