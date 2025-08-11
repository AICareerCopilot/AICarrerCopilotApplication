export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    date: string;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

export interface Link {
  id: string;
  label: string;
  url:string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  links: Link[];
  skills: string;
}

export interface JobAnalysis {
  matchScore: number;
  strengths: string;
  weaknesses: string;
  suggestions: string[];
}

export type CoverLetterTone = 'Formal' | 'Conversational' | 'Confident';

export interface CustomizationSuggestion {
  summary?: string;
  experience?: {
    id: string;
    responsibilities: string;
  }[];
  skills?: string;
}

export interface LinkedInAnalysis {
  score: number;
  headlineSuggestion: string;
  summarySuggestion: string;
  experienceSuggestion: string;
  skillsSuggestion: string;
  educationSuggestion: string;
  certificationsSuggestion: string;
}

export type JobStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface TrackedJob {
    id: string;
    company: string;
    title: string;
    date: string;
    status: JobStatus;
    url?: string;
}

export interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    matchScore: number;
}

export type AutoApplyStatus = 'Info' | 'Success' | 'Failure';

export interface AutoApplyLog {
  timestamp: string;
  message: string;
  status: AutoApplyStatus;
}

export interface ChatbotMessage {
  role: 'user' | 'ai';
  content: string;
}

export type ContactStatus = 'To Contact' | 'Contacted' | 'Follow-up' | 'Connected';

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  status: ContactStatus;
}

export interface SuggestedAnswer {
    answer: string;
    keyPoints: string[];
    proTip: string;
}

export interface InterviewTurn {
  id: string;
  question: string;
  suggestion: SuggestedAnswer;
  timestamp: string;
}

// Types for Clickable Keyword ATS Optimizer
export interface Highlight {
  keyword: string;
  reason: string;
}

export interface OptimizationPayload {
  beforeScore: number;
  afterScore: number;
  highlights: Highlight[];
  optimizedResume: ResumeData;
}