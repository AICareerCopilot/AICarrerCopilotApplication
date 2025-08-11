
import React, { useState, useCallback, useRef } from 'react';
import type { ResumeData, Experience, OptimizationPayload } from '../types';
import { generateResumeBullets, parseAndOptimizeResumeFile, analyzeAndOptimizeResume } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { ScoreCircle } from './ScoreCircle';
import { Plus, Trash2, Wand2, UploadCloud, X, ArrowRight } from 'lucide-react';

interface ResumeBuilderProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

type ArrayFields = 'experience' | 'education' | 'projects' | 'certifications' | 'links';

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resumeData, setResumeData }) => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [analysisResult, setAnalysisResult] = useState<OptimizationPayload | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAiWorking = isParsing || isOptimizing;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({ ...prev, [name]: value }));
  }, [setResumeData]);

  const handleArrayChange = useCallback((field: ArrayFields, id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any) => 
        item.id === id ? { ...item, [name]: value } : item
      )
    }));
  }, [setResumeData]);
  
  const addArrayItem = (field: ArrayFields) => {
    const newItem = {
        experience: { id: `exp-${Date.now()}`, role: '', company: '', startDate: '', endDate: '', responsibilities: '' },
        education: { id: `edu-${Date.now()}`, institution: '', degree: '', date: '' },
        projects: { id: `proj-${Date.now()}`, name: '', description: '', url: '' },
        certifications: { id: `cert-${Date.now()}`, name: '', issuer: '', date: '' },
        links: { id: `link-${Date.now()}`, label: '', url: '' },
    }[field];
    
    setResumeData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const removeArrayItem = (field: ArrayFields, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].filter((item: any) => item.id !== id)
    }));
  };

  const handleGenerateBullets = async (exp: Experience) => {
    if (!exp.role) {
      alert("Please enter a role first to generate suggestions.");
      return;
    }
    setIsGenerating(exp.id);
    try {
      const rawBullets = await generateResumeBullets(exp.role, exp.responsibilities);
      
      // Clean up AI response to ensure each bullet point is on a new line
      // and remove any introductory text.
      const formatBullets = (text: string): string => {
        // Handles cases where bullets are not on new lines, e.g., "- item1 - item2"
        const withNewlines = text.replace(/(?!^)\s*-\s/g, '\n- ');

        // Process line by line to remove any non-bullet point text
        return withNewlines
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-')) // Only keep actual bullet points
          .join('\n');
      };

      const finalBullets = formatBullets(rawBullets);

      setResumeData(prev => ({
        ...prev,
        experience: prev.experience.map(e => 
          e.id === exp.id ? { ...e, responsibilities: finalBullets || rawBullets } : e // Fallback if cleaning removes everything
        )
      }));
    } catch (error) {
      console.error("Error generating bullets:", error);
      alert("Failed to generate suggestions. Please check the console for details.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const dataUrl = e.target?.result as string;
            const base64 = dataUrl.split(',')[1];
            if (!base64) throw new Error("Could not read file data.");
            
            const optimizedData = await parseAndOptimizeResumeFile(base64, file.type, jobDescription);
            setResumeData(optimizedData);
            setError(null);

        } catch (error) {
            console.error("Error parsing and optimizing resume:", error);
            setError("Failed to parse and optimize resume. The AI may have had an issue with the file, or it may be busy. Please try again.");
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.onerror = () => {
        setIsParsing(false);
        setError("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };
  
  const handleOneClickOptimize = async () => {
    if (!jobDescription.trim()) {
      setError("Please provide a job description for targeted optimization.");
      return;
    }
    setIsOptimizing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeAndOptimizeResume(resumeData, jobDescription);
      setResumeData(result.optimizedResume);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error optimizing resume:", error);
      setError("Failed to optimize resume. The AI might be busy or there was an issue with your data.");
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      const skillToAdd = newSkill.trim();
      if (!resumeData.skills.split(',').map(s => s.trim().toLowerCase()).includes(skillToAdd.toLowerCase())) {
          setResumeData(prev => ({
              ...prev,
              skills: prev.skills ? `${prev.skills}, ${skillToAdd}` : skillToAdd
          }));
      }
      setNewSkill('');
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
      setResumeData(prev => ({
          ...prev,
          skills: prev.skills.split(',').map(s => s.trim()).filter(s => s.toLowerCase() !== skillToRemove.toLowerCase()).join(', ')
      }));
  }


  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Resume Builder</h1>
            <p className="text-text-secondary mt-1">Craft your professional story, or use AI to build it from an existing resume.</p>
          </div>
        </div>
      
      <Card>
        <h2 className="text-xl font-bold text-text-primary mb-4">AI Optimization Hub</h2>
        <div className="space-y-4">
            <Textarea 
                label="Job Description (for Optimization)"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste a job description here, then click an optimization button below."
            />
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt"
              />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Button onClick={handleUploadClick} disabled={isAiWorking}>
                    {isParsing ? <Spinner size="sm"/> : <UploadCloud size={16} className="mr-2"/>}
                    {isParsing ? 'Parsing...' : 'Upload & Optimize Resume'}
                 </Button>
                <Button onClick={handleOneClickOptimize} disabled={isAiWorking || !jobDescription.trim()} variant="primary">
                    {isOptimizing ? <Spinner size="sm"/> : <Wand2 size={16} className="mr-2"/>}
                    {isOptimizing ? 'Optimizing...' : 'One-Click Optimize'}
                 </Button>
            </div>
        </div>
      </Card>
        
      {error && <div className="p-3 my-4 text-center text-sm text-red-500 bg-red-500/10 rounded-xl">{error}</div>}

      {analysisResult && (
        <Card title="Optimization Analysis">
          <div className="flex justify-around items-center p-4">
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <h4 className="font-semibold text-text-secondary mb-3">Before Score</h4>
              <ScoreCircle score={analysisResult.beforeScore} />
            </div>
            <div className="text-accent-light animate-in fade-in duration-500 [animation-delay:200ms]">
                <ArrowRight size={40} />
            </div>
            <div className="text-center animate-in fade-in zoom-in-95 duration-500 [animation-delay:400ms]">
              <h4 className="font-semibold text-text-secondary mb-3">After Score</h4>
              <ScoreCircle score={analysisResult.afterScore} />
            </div>
          </div>
           <p className="text-center text-sm text-text-secondary mt-2">
                Your resume was optimized, increasing your match score by <span className="font-bold text-mint">{analysisResult.afterScore - analysisResult.beforeScore}</span> points!
            </p>
        </Card>
      )}

      <Card title="Personal Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" value={resumeData.name} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={resumeData.email} onChange={handleChange} />
          <Input label="Phone" name="phone" value={resumeData.phone} onChange={handleChange} />
        </div>
      </Card>

      <Card title="Professional Summary">
        <Textarea label="Summary" name="summary" value={resumeData.summary} onChange={handleChange} rows={5} />
      </Card>
      
      <Card title="Work Experience">
        <div className="space-y-6">
          {resumeData.experience.map((exp) => (
            <div key={exp.id} className="p-4 bg-background/50 rounded-xl space-y-4 relative">
               <button onClick={() => removeArrayItem('experience', exp.id)} className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-pink rounded-full transition-colors">
                  <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Role / Title" name="role" value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, e)} />
                <Input label="Company" name="company" value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, e)} />
                <Input label="Start Date" name="startDate" value={exp.startDate} onChange={(e) => handleArrayChange('experience', exp.id, e)} />
                <Input label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleArrayChange('experience', exp.id, e)} />
              </div>
              <div className="relative">
                <Textarea label="Responsibilities / Achievements" name="responsibilities" value={exp.responsibilities} onChange={(e) => handleArrayChange('experience', exp.id, e)} rows={6} />
                 <Button 
                  onClick={() => handleGenerateBullets(exp)} 
                  disabled={isGenerating === exp.id}
                  className="absolute bottom-3 right-3 !py-1.5 !px-2.5 text-xs"
                  variant="secondary"
                  title="Generate with AI"
                  >
                  {isGenerating === exp.id ? <Spinner size="sm" /> : <Wand2 size={16} />}
                </Button>
              </div>
            </div>
          ))}
           <Button onClick={() => addArrayItem('experience')} variant="outline" className="w-full">
             <Plus size={16} className="mr-2"/> Add Experience
           </Button>
        </div>
      </Card>

      <Card title="Education">
        <div className="space-y-6">
          {resumeData.education.map((edu) => (
              <div key={edu.id} className="p-4 bg-background/50 rounded-xl space-y-4 relative">
                  <button onClick={() => removeArrayItem('education', edu.id)} className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-pink rounded-full transition-colors">
                      <Trash2 size={16} />
                  </button>
                  <Input label="Institution" name="institution" value={edu.institution} onChange={(e) => handleArrayChange('education', edu.id, e)} />
                  <Input label="Degree / Field of Study" name="degree" value={edu.degree} onChange={(e) => handleArrayChange('education', edu.id, e)} />
                  <Input label="Date" name="date" value={edu.date} onChange={(e) => handleArrayChange('education', edu.id, e)} placeholder="e.g., 2018 - 2022" />
              </div>
          ))}
          <Button onClick={() => addArrayItem('education')} variant="outline" className="w-full">
             <Plus size={16} className="mr-2"/> Add Education
          </Button>
        </div>
      </Card>

      <Card title="Projects">
          <div className="space-y-6">
          {resumeData.projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-background/50 rounded-xl space-y-4 relative">
                  <button onClick={() => removeArrayItem('projects', proj.id)} className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-pink rounded-full transition-colors">
                      <Trash2 size={16} />
                  </button>
                  <Input label="Project Name" name="name" value={proj.name} onChange={(e) => handleArrayChange('projects', proj.id, e)} />
                  <Input label="Project URL (Optional)" name="url" value={proj.url} onChange={(e) => handleArrayChange('projects', proj.id, e)} />
                  <Textarea label="Description" name="description" value={proj.description} onChange={(e) => handleArrayChange('projects', proj.id, e)} rows={4} />
              </div>
          ))}
          <Button onClick={() => addArrayItem('projects')} variant="outline" className="w-full">
              <Plus size={16} className="mr-2"/> Add Project
          </Button>
          </div>
      </Card>

      <Card title="Certifications">
          <div className="space-y-6">
          {resumeData.certifications.map((cert) => (
              <div key={cert.id} className="p-4 bg-background/50 rounded-xl space-y-4 relative">
                  <button onClick={() => removeArrayItem('certifications', cert.id)} className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-pink rounded-full transition-colors">
                      <Trash2 size={16} />
                  </button>
                  <Input label="Certification Name" name="name" value={cert.name} onChange={(e) => handleArrayChange('certifications', cert.id, e)} />
                  <Input label="Issuing Organization" name="issuer" value={cert.issuer} onChange={(e) => handleArrayChange('certifications', cert.id, e)} />
                  <Input label="Date Issued" name="date" value={cert.date} onChange={(e) => handleArrayChange('certifications', cert.id, e)} />
              </div>
          ))}
          <Button onClick={() => addArrayItem('certifications')} variant="outline" className="w-full">
              <Plus size={16} className="mr-2"/> Add Certification
          </Button>
          </div>
      </Card>

      <Card title="Links">
        <div className="space-y-6">
            {resumeData.links.map((link) => (
            <div key={link.id} className="p-4 bg-background/50 rounded-xl space-y-4 relative">
                <button onClick={() => removeArrayItem('links', link.id)} className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-pink rounded-full transition-colors">
                    <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Label" name="label" value={link.label} onChange={(e) => handleArrayChange('links', link.id, e)} placeholder="e.g., LinkedIn, GitHub, Portfolio" />
                    <Input label="URL" name="url" value={link.url} onChange={(e) => handleArrayChange('links', link.id, e)} />
                </div>
            </div>
            ))}
            <Button onClick={() => addArrayItem('links')} variant="outline" className="w-full">
                <Plus size={16} className="mr-2"/> Add Link
            </Button>
        </div>
      </Card>
      
      <Card title="Skills">
        <div className="flex flex-wrap gap-2 mb-4">
          {resumeData.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
              <div key={skill} className="flex items-center gap-2 bg-accent/20 text-accent-light rounded-full px-3 py-1.5 text-sm font-semibold animate-in fade-in zoom-in-95 duration-300">
              <span>{skill}</span>
              <button 
                  onClick={() => handleRemoveSkill(skill)} 
                  className="text-accent-light/70 hover:text-white transition-colors"
                  aria-label={`Remove ${skill}`}
              >
                  <X size={16} />
              </button>
              </div>
          ))}
        </div>
        <div className="relative">
            <Input 
              label="Add Skills"
              name="skills_input"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type a skill and press Enter"
            />
        </div>
        <p className="text-xs text-text-secondary mt-2">Add relevant skills one by one. They will be saved as a comma-separated list.</p>
      </Card>
    </div>
  );
};

export default ResumeBuilder;
