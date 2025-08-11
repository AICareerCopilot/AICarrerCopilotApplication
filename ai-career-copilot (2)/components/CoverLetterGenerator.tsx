import React, { useState } from 'react';
import type { ResumeData, CoverLetterTone } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { ClipboardCopy, MailPlus, Check, Star } from 'lucide-react';

interface CoverLetterGeneratorProps {
  resumeData: ResumeData;
  isTrialActive: boolean;
}

const TONES: { id: CoverLetterTone; label: string }[] = [
  { id: 'Formal', label: 'Formal' },
  { id: 'Conversational', label: 'Conversational' },
  { id: 'Confident', label: 'Confident' },
];

const FREE_TIER_LIMIT = 3;

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ resumeData, isTrialActive }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [manager, setManager] = useState('');
  const [tone, setTone] = useState<CoverLetterTone>('Formal');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const isLimitReached = !isTrialActive && usageCount >= FREE_TIER_LIMIT;

  const handleGenerate = async () => {
    if (isLimitReached) {
        setError("You've reached your free limit for cover letter generations.");
        return;
    }
    if (!company.trim() || !role.trim()) {
      setError('Please provide at least a Company Name and Job Role.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedLetter('');

    try {
      const letter = await generateCoverLetter(resumeData, company, role, tone, manager);
      setGeneratedLetter(letter);
      if (!isTrialActive) {
        setUsageCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Cover letter generation failed:", err);
      setError("Failed to generate the cover letter. The AI model might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">AI Cover Letter Generator</h1>
        <p className="text-text-secondary mt-1">Craft personalized cover letters in seconds.</p>
        
        <Card>
            {!isTrialActive && (
                <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-text-secondary">Free Generations Remaining: <span className="font-bold text-accent">{FREE_TIER_LIMIT - usageCount}</span></p>
                    <Button variant="secondary" className="!py-1 !px-3 !text-xs"><Star size={14} className="mr-2"/>Upgrade for Unlimited</Button>
                </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google"
                  required
                />
                <Input
                  label="Job Role / Title"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Product Manager"
                  required
                />
              </div>
              <Input
                label="Hiring Manager Name (Optional)"
                name="manager"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="e.g., Sundar Pichai"
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Select Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <Button
                      key={t.id}
                      variant={tone === t.id ? 'secondary' : 'outline'}
                      onClick={() => setTone(t.id)}
                      className="!text-sm"
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleGenerate} disabled={isLoading || isLimitReached} className="w-full">
                {isLoading ? <Spinner /> : isLimitReached ? 'Daily Limit Reached' : 'Generate Cover Letter'}
              </Button>
              {error && (
                <div className="p-3 text-center text-sm text-red-500 bg-red-500/10 rounded-xl">
                  {error}
                </div>
              )}
            </div>
        </Card>

      {generatedLetter && (
        <Card title="Your Generated Cover Letter">
          <div className="relative">
            <pre className="p-4 bg-background/50 rounded-xl text-sm whitespace-pre-wrap font-sans text-text-secondary leading-relaxed">
              {generatedLetter}
            </pre>
            <Button
              onClick={handleCopy}
              variant="secondary"
              className="absolute top-2 right-2 !py-1 !px-2 text-xs"
            >
              {hasCopied ? <Check size={14} className="text-green-400" /> : <ClipboardCopy size={14} />}
              <span className="ml-1.5">{hasCopied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CoverLetterGenerator;