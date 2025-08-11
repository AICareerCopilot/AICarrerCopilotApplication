
import React from 'react';
import type { ResumeData } from '../types';
import { Mail, Phone, Linkedin, Github, Globe, Download } from 'lucide-react';
import { Button } from './Button';
import html2pdf from 'html2pdf.js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ExternalHyperlink,
  UnderlineType,
} from 'docx';


const generateDocx = (resumeData: ResumeData) => {
    const formatLink = (label: string, url: string) => {
        return new ExternalHyperlink({
            children: [
                new TextRun({
                    text: label,
                    style: "Hyperlink",
                }),
            ],
            link: url,
        });
    }

    const doc = new Document({
        styles: {
            paragraphStyles: [
                { id: "Name", name: "Name", basedOn: "Normal", next: "Normal", run: { size: 48, bold: true, font: "Calibri" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 120 } } },
                { id: "SectionHeading", name: "Section Heading", basedOn: "Normal", next: "Normal", run: { size: 24, bold: true, font: "Calibri" }, paragraph: { spacing: { before: 240, after: 120 }, border: { bottom: { color: "auto", style: "single", size: 6 } } } },
                { id: "Contact", name: "Contact", basedOn: "Normal", run: { size: 20, font: "Calibri", color: "595959" }, paragraph: { alignment: AlignmentType.CENTER } },
                { id: "JobTitle", name: "Job Title", basedOn: "Normal", run: { size: 22, bold: true, font: "Calibri" } },
                { id: "JobCompany", name: "Job Company", basedOn: "Normal", run: { size: 22, italics: true, font: "Calibri" } },
                { id: "JobDate", name: "Job Date", basedOn: "Normal", run: { size: 20, italics: true, font: "Calibri", color: "595959" } },
            ]
        },
        sections: [{
            children: [
                // Header
                new Paragraph({ text: resumeData.name, style: "Name" }),
                new Paragraph({
                    style: "Contact",
                    children: [
                        new TextRun(resumeData.email),
                        new TextRun(" | "),
                        new TextRun(resumeData.phone),
                        ...resumeData.links.flatMap(link => [
                            new TextRun(" | "),
                            formatLink(link.label, link.url)
                        ])
                    ],
                }),
                
                // Summary
                new Paragraph({ text: "Professional Summary", style: "SectionHeading" }),
                new Paragraph({ text: resumeData.summary, style: "Normal" }),

                // Skills
                new Paragraph({ text: "Skills", style: "SectionHeading" }),
                ...resumeData.skills.split('|').map(categoryBlock => {
                    const [category, skills] = categoryBlock.split(':');
                    return new Paragraph({
                        children: [
                            new TextRun({ text: `${category?.trim()}: `, bold: true }),
                            new TextRun(skills?.trim() || ''),
                        ],
                        style: "Normal",
                    });
                }),

                // Experience
                new Paragraph({ text: "Work Experience", style: "SectionHeading" }),
                ...resumeData.experience.flatMap(exp => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: exp.role, style: "JobTitle" }),
                            new TextRun({ text: ` at ${exp.company}`, style: "JobCompany" }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${exp.startDate} - ${exp.endDate}`, style: "JobDate" }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: -300 },
                    }),
                    ...exp.responsibilities.split('\n').filter(line => line.trim()).map(line => new Paragraph({
                        text: line.replace(/^- /, ''),
                        bullet: { level: 0 },
                        style: "Normal",
                        spacing: { after: 100 }
                    })),
                ]),
                
                // Education
                new Paragraph({ text: "Education", style: "SectionHeading" }),
                 ...resumeData.education.flatMap(edu => [
                    new Paragraph({
                         children: [
                            new TextRun({ text: edu.institution, bold: true, size: 22, font: "Calibri" }),
                         ],
                    }),
                     new Paragraph({
                         children: [
                            new TextRun({ text: edu.date, style: "JobDate" }),
                         ],
                         alignment: AlignmentType.RIGHT,
                         spacing: { before: -300 },
                    }),
                    new Paragraph({ text: edu.degree, style: "Normal", spacing: { after: 200 } }),
                ]),

                // Projects
                ...(resumeData.projects.length > 0 ? [
                    new Paragraph({ text: "Projects", style: "SectionHeading" }),
                    ...resumeData.projects.flatMap(proj => [
                        new Paragraph({
                            children: [ new TextRun({ text: proj.name, bold: true, size: 22, font: "Calibri" }), ...(proj.url ? [ new TextRun(" | "), formatLink("View Project", proj.url) ] : []) ]
                        }),
                        new Paragraph({ text: proj.description, style: "Normal", spacing: { after: 200 } })
                    ]),
                ] : []),
                
                // Certifications
                ...(resumeData.certifications.length > 0 ? [
                    new Paragraph({ text: "Certifications", style: "SectionHeading" }),
                    ...resumeData.certifications.flatMap(cert => [
                        new Paragraph({
                             children: [
                                new TextRun({ text: cert.name, bold: true, size: 22, font: "Calibri" }),
                                new TextRun({ text: ` from ${cert.issuer}`, italics: true, size: 20, font: "Calibri" }),
                             ],
                             spacing: { after: 200 }
                        }),
                    ]),
                ] : [])
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resumeData.name.replace(' ', '_')}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }).catch(error => {
        console.error("Error generating DOCX file:", error);
        alert("Sorry, there was an error creating the DOCX file. Please check the console for details.");
    });
};

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumeSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4 border-b border-gray-300 pb-1.5">
            {title}
        </h3>
        {children}
    </div>
);

const getLinkIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('linkedin')) return <Linkedin size={14} className="mr-2" />;
    if (lowerLabel.includes('github')) return <Github size={14} className="mr-2" />;
    return <Globe size={14} className="mr-2" />;
};

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-content');
    const opt = {
      margin:       0.5,
      filename:     `${resumeData.name.replace(/\s/g, '_')}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleDownloadDOCX = () => {
    generateDocx(resumeData);
  };

  return (
    <div className="bg-[#FEFEFE] shadow-2xl shadow-black/20 rounded-lg overflow-hidden ring-1 ring-white/10">
      <div className="p-4 sm:p-3 border-b border-gray-200 flex justify-end items-center gap-3 bg-gray-50/50">
          <Button onClick={handleDownloadPDF} variant="secondary" className="!text-xs !py-1.5 !px-3 !text-gray-700 !bg-gray-100 hover:!bg-gray-200 !border-gray-300">
            <Download size={14} className="mr-2" />
            PDF
          </Button>
          <Button onClick={handleDownloadDOCX} variant="secondary" className="!text-xs !py-1.5 !px-3 !text-gray-700 !bg-gray-100 hover:!bg-gray-200 !border-gray-300">
            <Download size={14} className="mr-2" />
            DOCX
          </Button>
      </div>
      <div id="resume-content" className="p-8 sm:p-10 text-gray-800 font-sans">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{resumeData.name || 'Your Name'}</h2>
          <div className="flex justify-center items-center flex-wrap gap-x-5 gap-y-1 mt-4 text-xs text-gray-500">
            <a href={`mailto:${resumeData.email}`} className="flex items-center hover:text-accent transition-colors">
                <Mail size={14} className="mr-1.5" />{resumeData.email || 'your.email@example.com'}
            </a>
            <span className="flex items-center">
                <Phone size={14} className="mr-1.5" />{resumeData.phone || 'Your Phone'}
            </span>
            {resumeData.links.map(link => (
                 <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-accent transition-colors">
                    {getLinkIcon(link.label)}{link.label}
                </a>
            ))}
          </div>
        </div>

        {/* Summary */}
        <ResumeSection title="Summary">
          <p className="text-sm leading-relaxed text-gray-600">{resumeData.summary || 'A brief summary about you.'}</p>
        </ResumeSection>

        {/* Experience */}
        {resumeData.experience && resumeData.experience.length > 0 && (
            <ResumeSection title="Experience">
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className={index < resumeData.experience.length - 1 ? 'pb-6 border-b border-gray-200' : ''}>
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-base font-semibold text-gray-800">{exp.role || 'Role'}</h4>
                            <span className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-2">{exp.company || 'Company'}</p>
                        <ul className="list-disc list-outside ml-5 text-sm space-y-1 text-gray-700">
                            {exp.responsibilities.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                        </ul>
                    </div>
                ))}
              </div>
            </ResumeSection>
        )}
        
        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && (
            <ResumeSection title="Education">
              <div className="space-y-6">
                {resumeData.education.map((edu, index) => (
                     <div key={edu.id} className={index < resumeData.education.length - 1 ? 'pb-6 border-b border-gray-200' : ''}>
                        <div className="flex justify-between items-baseline">
                            <h4 className="text-base font-semibold text-gray-800">{edu.institution}</h4>
                            <span className="text-xs font-medium text-gray-500">{edu.date}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">{edu.degree}</p>
                    </div>
                ))}
              </div>
            </ResumeSection>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.length > 0 && (
             <ResumeSection title="Projects">
                {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="mb-5 last:mb-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-base font-semibold text-gray-800">{proj.name}</h4>
                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-accent hover:underline">View Project</a>}
                        </div>
                        <p className="text-sm text-gray-700">{proj.description}</p>
                    </div>
                ))}
            </ResumeSection>
        )}

        {/* Skills */}
        <ResumeSection title="Skills">
           <div className="space-y-2">
            {resumeData.skills.split('|').map(categoryBlock => {
                const parts = categoryBlock.split(':');
                const category = parts[0]?.trim();
                const skills = parts[1]?.trim();
                if (!category || !skills) {
                    // Handle case where there's no category, just list skills
                    if (categoryBlock.trim()) {
                        return (
                            <div key={categoryBlock} className="flex items-baseline text-sm">
                                <p className="text-gray-600">{categoryBlock.trim()}</p>
                            </div>
                        )
                    }
                    return null;
                };
                return (
                    <div key={category} className="flex flex-col sm:flex-row sm:items-baseline text-sm">
                        <p className="w-full sm:w-40 font-semibold text-gray-700 flex-shrink-0 mb-1 sm:mb-0">{category}:</p>
                        <p className="text-gray-600">{skills}</p>
                    </div>
                )
            })}
        </div>
        </ResumeSection>

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
            <ResumeSection title="Certifications">
                 {resumeData.certifications.map(cert => (
                     <div key={cert.id} className="mb-2 last:mb-0">
                        <div className="flex justify-between items-baseline">
                             <h4 className="text-base font-semibold text-gray-800">{cert.name}</h4>
                            <span className="text-xs font-medium text-gray-500">{cert.date}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">{cert.issuer}</p>
                    </div>
                ))}
            </ResumeSection>
        )}

      </div>
    </div>
  );
};

export default ResumePreview;
