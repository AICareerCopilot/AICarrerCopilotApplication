import React, { useCallback } from 'react';
import type { ResumeData } from '../types';
import { Card } from './Card';
import { Input } from './Input';
import { User, Info } from 'lucide-react';

interface SettingsProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const Settings: React.FC<SettingsProps> = ({ resumeData, setResumeData }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({ ...prev, [name]: value }));
  }, [setResumeData]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your profile and application settings.</p>
      </div>

      <Card title="User Profile" icon={<User className="text-accent" />}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">This information is used to populate your resume and other generated documents.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              name="name" 
              value={resumeData.name} 
              onChange={handleChange} 
            />
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              value={resumeData.email} 
              onChange={handleChange} 
            />
          </div>
          <Input 
            label="Phone Number" 
            name="phone" 
            value={resumeData.phone} 
            onChange={handleChange} 
          />
        </div>
      </Card>
      
      <Card title="About" icon={<Info className="text-aqua" />}>
          <div className="space-y-3 text-text-secondary">
            <p>
              AI Career Copilot is a comprehensive, AI-powered assistant designed to help you navigate your career path with confidence. From building FAANG-ready resumes to acing interviews, we provide the tools you need to succeed.
            </p>
          </div>
      </Card>
    </div>
  );
};

export default Settings;