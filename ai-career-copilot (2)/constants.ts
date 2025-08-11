import type { ResumeData, TrackedJob, Contact } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
  name: "Major Jai Dixit",
  email: "jai.dixit@example.com",
  phone: "+91-9876543210",
  summary: "Decorated military officer with over 15 years of experience in strategic planning, operations management, and team leadership. Transitioning to a corporate role in project management, leveraging a proven track record of executing complex missions under pressure and delivering results. Adept at risk assessment, resource allocation, and fostering cross-functional collaboration to achieve organizational goals.",
  experience: [
    {
      id: `exp-${Date.now()}`,
      role: "Company Commander",
      company: "Indian Army",
      startDate: "2015",
      endDate: "2023",
      responsibilities: "- Led a 120-soldier infantry company in high-stakes counter-insurgency operations.\n- Planned and executed over 50 strategic missions with a 100% success rate.\n- Managed logistics, training, and welfare for all personnel, improving operational readiness by 30%.\n- Coordinated with allied forces and local civil authorities to ensure regional stability."
    }
  ],
  education: [
    {
        id: `edu-${Date.now()}`,
        institution: 'National Defence Academy',
        degree: 'Bachelor of Science, Computer Science',
        date: '2004-2007'
    }
  ],
  projects: [],
  certifications: [
      {
          id: `cert-${Date.now()}`,
          name: 'Project Management Professional (PMP)',
          issuer: 'Project Management Institute',
          date: '2023'
      }
  ],
  links: [
      { id: `link-${Date.now()}-1`, label: 'LinkedIn', url: 'https://linkedin.com/in/jaidixit' },
      { id: `link-${Date.now()}-2`, label: 'GitHub', url: 'https://github.com/jaidixit' },
  ],
  skills: "Project Management (PMP), Leadership, Strategic Planning, Risk Management, Operations, Logistics, Cross-functional Team Leadership, Crisis Management, Python, SQL"
};

export const INITIAL_TRACKED_JOBS: TrackedJob[] = [
    {
        id: `job-${Date.now()}-1`,
        company: "Google",
        title: "Senior Project Manager",
        date: new Date().toISOString().split('T')[0],
        status: "Interviewing",
        url: 'https://careers.google.com'
    },
    {
        id: `job-${Date.now()}-2`,
        company: "Amazon",
        title: "Operations Lead",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "Applied",
        url: 'https://www.amazon.jobs/'
    },
    {
        id: `job-${Date.now()}-3`,
        company: "Microsoft",
        title: "Technical Program Manager",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "Wishlist",
        url: 'https://careers.microsoft.com/'
    },
];

export const INITIAL_CONTACTS: Contact[] = [
    {
        id: `contact-${Date.now()}-1`,
        name: 'Anya Sharma',
        company: 'Innovate Corp',
        role: 'Lead Recruiter',
        status: 'To Contact',
    },
    {
        id: `contact-${Date.now()}-2`,
        name: 'Rohan Verma',
        company: 'DataSolutions Inc.',
        role: 'Engineering Manager',
        status: 'Contacted',
    }
];
