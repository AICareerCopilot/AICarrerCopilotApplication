import { Type } from "@google/genai";
import type { ResumeData, JobAnalysis, CoverLetterTone, CustomizationSuggestion, LinkedInAnalysis, JobListing, AutoApplyLog, Contact, SuggestedAnswer, InterviewTurn, OptimizationPayload } from '../types';

// Helper function to abstract API calls for non-streaming content.
async function callApi(args: any): Promise<any> {
  const payload = { isStream: false, args };
  let response;

  if (window.electronAPI) {
    // We are in the Electron app.
    const responseText = await window.electronAPI.callGemini(payload);
    response = JSON.parse(responseText);
  } else {
    // We are on the web.
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'API request to web backend failed');
    }
    response = await res.json();
  }
  
  return response;
}


const getResumeAsText = (resumeData: ResumeData): string => {
  return `
    Name: ${resumeData.name}
    Contact: ${resumeData.email}, ${resumeData.phone}
    Links: ${resumeData.links.map(l => `${l.label}: ${l.url}`).join(' | ')}
    
    Professional Summary:
    ${resumeData.summary}
    
    Skills:
    ${resumeData.skills}
    
    Work Experience:
    ${resumeData.experience.map(exp => `
      - Role: ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})
        Responsibilities:
        ${exp.responsibilities.split('\n').map(r => `  ${r}`).join('\n')}
    `).join('\n')}
    
    Education:
    ${resumeData.education.map(edu => `
      - ${edu.degree} from ${edu.institution} (${edu.date})
    `).join('\n')}

    Projects:
    ${resumeData.projects.map(proj => `
      - Project: ${proj.name} ${proj.url ? `(${proj.url})` : ''}
        Description: ${proj.description}
    `).join('\n')}

    Certifications:
    ${resumeData.certifications.map(cert => `
      - ${cert.name} from ${cert.issuer} (${cert.date})
    `).join('\n')}
  `;
}

// Function to safely parse JSON from the AI response's text property
function parseJsonResponse(responseText: string | undefined | null): any {
    if (!responseText) {
        throw new Error("AI model returned an empty response.");
    }
    try {
        // The response text might be wrapped in markdown backticks
        const cleanedText = responseText.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("AI model returned invalid JSON.");
    }
}

export async function generateResumeBullets(role: string, existingText?: string): Promise<string> {
  const prompt = `
    You are an expert resume writer. Your task is to generate 3-5 concise, action-oriented, and quantifiable bullet points for a resume's work experience section.
    Role: ${role}
    ${existingText ? `Current Draft / Notes:\n${existingText}` : ''}
    Instructions:
    - Start each bullet point with a strong action verb.
    - Quantify achievements with metrics where possible (e.g., "Increased efficiency by 20%", "Managed a team of 5", "Reduced costs by $10k").
    - Focus on accomplishments, not just duties.
    - Format the output as a list of bullet points, each starting with '- '.
    - Do not add any introductory or concluding text, only the bullet points.
  `;

  const response = await callApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { temperature: 0.7 },
  });

  return response.text.trim();
}

export async function analyzeResumeAgainstJob(resumeData: ResumeData, jobDescription: string): Promise<JobAnalysis> {
  const resumeText = getResumeAsText(resumeData);
  const prompt = `Analyze the following resume against the job description and provide a detailed analysis.

<Resume>
${resumeText}
</Resume>

<JobDescription>
${jobDescription}
</JobDescription>

Provide your response in JSON format. The JSON object should have the following structure:
- "matchScore": An integer between 0 and 100 representing the percentage match.
- "strengths": A paragraph explaining what makes the candidate a strong fit.
- "weaknesses": A paragraph explaining the key areas where the resume is lacking for this specific role.
- "suggestions": An array of 3-5 specific, actionable suggestions for improving the resume to better match the job description.`;

  const response = await callApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER, description: "Resume match score from 0-100." },
          strengths: { type: Type.STRING, description: "Strengths of the resume against the job." },
          weaknesses: { type: Type.STRING, description: "Weaknesses of the resume against the job." },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for improvement." },
        },
        required: ["matchScore", "strengths", "weaknesses", "suggestions"],
      },
    }
  });
  
  return parseJsonResponse(response.text);
}

export async function generateCoverLetter(resumeData: ResumeData, company: string, role: string, tone: CoverLetterTone, manager?: string): Promise<string> {
    const resumeText = getResumeAsText(resumeData);
    const prompt = `Generate a compelling cover letter based on the provided resume and job details.

Tone: ${tone}
Company: ${company}
Job Role: ${role}
${manager ? `Hiring Manager: ${manager}` : ''}

Resume:
${resumeText}

Instructions:
1.  Address the letter to the hiring manager if their name is provided, otherwise use a generic greeting.
2.  Craft a strong opening paragraph that grabs attention and states the desired position.
3.  In the body, highlight 2-3 key experiences or skills from the resume that are most relevant to the role.
4.  Maintain the specified tone throughout the letter.
5.  Conclude with a strong call to action.
6.  Keep the letter concise, around 3-4 paragraphs.
7.  Do not include placeholders like "[Your Name]" or "[Date]". The letter should be ready to use.`;

    const response = await callApi({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.8 },
    });

    return response.text.trim();
}

export async function autoCustomizeResume(resumeData: ResumeData, jobDescription: string): Promise<CustomizationSuggestion> {
  const resumeText = getResumeAsText(resumeData);
  const prompt = `Analyze the provided resume and job description. Suggest specific, targeted modifications to the resume to make it a stronger fit for the job. Only suggest changes for the summary, the most recent experience section, and the skills section.

<Resume>
${JSON.stringify(resumeData, null, 2)}
</Resume>

<JobDescription>
${jobDescription}
</JobDescription>

Return a JSON object with optional keys: "summary", "experience", "skills".
- "summary": A re-written professional summary.
- "experience": An array containing objects with "id" and "responsibilities" for the ONE experience entry you are updating. The 'id' MUST match an ID from the input resume. 'responsibilities' should be a string with new bullet points.
- "skills": A new comma-separated string of skills.
Your suggestions should be subtle and maintain the candidate's voice.`;
  
  const response = await callApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "New summary text." },
            experience: { 
              type: Type.ARRAY, 
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  responsibilities: { type: Type.STRING }
                },
                required: ["id", "responsibilities"]
              }
            },
            skills: { type: Type.STRING, description: "New skills string." }
          }
        },
    }
  });

  return parseJsonResponse(response.text);
}

export async function parseAndOptimizeResumeFile(base64File: string, mimeType: string, jobDescription?: string): Promise<ResumeData> {
  const prompt = `Parse the provided resume file and structure it into a JSON object matching the ResumeData format. If a job description is provided, optimize the content (summary, latest experience, skills) to align with it.

Job Description (if any):
${jobDescription || 'N/A'}

Return ONLY the JSON object. Do not include any other text or markdown. The JSON should conform to the schema.`;
  const filePart = { inlineData: { data: base64File, mimeType: mimeType } };
  const textPart = { text: prompt };

  const response = await callApi({
      model: 'gemini-2.5-flash',
      contents: { parts: [filePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: { /* Same as OptimizationPayload.optimizedResume */ type: Type.OBJECT, properties: { name: {type: Type.STRING}, email: {type: Type.STRING}, phone: {type: Type.STRING}, summary: {type: Type.STRING}, experience: {type: Type.ARRAY, items: {type: Type.OBJECT, properties:{id:{type:Type.STRING}, role:{type:Type.STRING}, company:{type:Type.STRING}, startDate:{type:Type.STRING}, endDate:{type:Type.STRING}, responsibilities:{type:Type.STRING}}}}, education: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, institution:{type:Type.STRING}, degree:{type:Type.STRING}, date:{type:Type.STRING}}}}, projects: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, name:{type:Type.STRING}, description:{type:Type.STRING}, url:{type:Type.STRING}}}}, certifications: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, name:{type:Type.STRING}, issuer:{type:Type.STRING}, date:{type:Type.STRING}}}}, links: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, label:{type:Type.STRING}, url:{type:Type.STRING}}}}, skills: {type:Type.STRING}}}
      }
  });

  return parseJsonResponse(response.text);
}

export async function analyzeLinkedInProfile(resumeData: ResumeData, linkedInUrl: string, targetRole: string): Promise<LinkedInAnalysis> {
  const resumeText = getResumeAsText(resumeData);
  const prompt = `Analyze the user's career profile based on their resume and target role. Provide suggestions to optimize a LinkedIn profile. The LinkedIn URL is for context but you can't access it. Base your analysis on the provided resume.

Resume:
${resumeText}

Target Role: ${targetRole}

Return a JSON object with suggestions for a LinkedIn profile.`;
  
  const response = await callApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.OBJECT, properties: { score: {type: Type.INTEGER}, headlineSuggestion: {type: Type.STRING}, summarySuggestion: {type: Type.STRING}, experienceSuggestion: {type: Type.STRING}, skillsSuggestion: {type: Type.STRING}, educationSuggestion: {type: Type.STRING}, certificationsSuggestion: {type: Type.STRING} } }
    }
  });

  return parseJsonResponse(response.text);
}

export async function findJobs(resumeData: ResumeData, jobTitle: string, location: string): Promise<JobListing[]> {
  const resumeSummary = `Summary: ${resumeData.summary}\nSkills: ${resumeData.skills}`;
  const prompt = `Based on the provided resume summary and search criteria, generate a realistic list of 5 job listings.

Resume Highlights:
${resumeSummary}

Search Criteria:
Job Title: ${jobTitle}
Location: ${location}

For each job, provide a title, company, location, a short description, and a "matchScore" from 70-95. Return as a JSON array.`;

  const response = await callApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: {type:Type.STRING}, title: {type:Type.STRING}, company: {type:Type.STRING}, location: {type:Type.STRING}, description: {type:Type.STRING}, matchScore: {type:Type.INTEGER} } } }
    }
  });
  
  return parseJsonResponse(response.text);
}

export async function simulateAutoApplyCycle(resumeData: ResumeData, jobTitle: string, location: string): Promise<Omit<AutoApplyLog, 'timestamp'>[]> {
  const prompt = `Simulate an auto-apply job cycle for a user with the target role "${jobTitle}" in "${location}". Generate a sequence of 5-7 log entries representing the process.

Return a JSON array of log objects. Each object should have "message" (string) and "status" ('Info', 'Success', or 'Failure').`;
  
  const response = await callApi({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: 'application/json',
          responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { message: {type:Type.STRING}, status: {type:Type.STRING, enum: ['Info', 'Success', 'Failure'] } } } }
      }
  });
  
  return parseJsonResponse(response.text);
}

export async function getChatbotResponse(userInput: string): Promise<string> {
    const prompt = `You are a friendly and helpful career assistant chatbot. Provide a concise and encouraging response to the user's query. User: "${userInput}"`;

    const response = await callApi({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
            maxOutputTokens: 150,
        },
    });

    return response.text.trim();
}

export async function generateOutreachMessage(resumeData: ResumeData, contact: Contact): Promise<string> {
    const prompt = `Generate a concise and professional networking outreach message for LinkedIn. The message should be based on the user's profile and the contact's details.

User's Role: ${resumeData.experience[0]?.role || 'Professional'}
Contact Name: ${contact.name}
Contact Role: ${contact.role}
Contact Company: ${contact.company}

Keep it brief, under 100 words.`;

    const response = await callApi({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.8 },
    });

    return response.text.trim();
}

export async function analyzeAndOptimizeResume(resumeData: ResumeData, jobDescription: string): Promise<OptimizationPayload> {
  const resumeText = getResumeAsText(resumeData);
  const prompt = `Analyze the provided resume against the job description. Then, create an optimized version of the resume.

<Resume>
${resumeText}
</Resume>

<JobDescription>
${jobDescription}
</JobDescription>

Return a JSON object with the following structure:
- "beforeScore": An integer score (0-100) of the original resume.
- "afterScore": An integer score (0-100) of the new, optimized resume.
- "highlights": An array of objects, each with "keyword" and "reason" for the changes.
- "optimizedResume": The full, optimized resume data in the same JSON format as the input.`;
  
  const response = await callApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: { /* Same as OptimizationPayload */ type: Type.OBJECT, properties: { beforeScore: {type: Type.INTEGER}, afterScore: {type: Type.INTEGER}, highlights: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {keyword: {type:Type.STRING}, reason:{type:Type.STRING}}}}, optimizedResume: {type:Type.OBJECT, properties: { name: {type: Type.STRING}, email: {type: Type.STRING}, phone: {type: Type.STRING}, summary: {type: Type.STRING}, experience: {type: Type.ARRAY, items: {type: Type.OBJECT, properties:{id:{type:Type.STRING}, role:{type:Type.STRING}, company:{type:Type.STRING}, startDate:{type:Type.STRING}, endDate:{type:Type.STRING}, responsibilities:{type:Type.STRING}}}}, education: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, institution:{type:Type.STRING}, degree:{type:Type.STRING}, date:{type:Type.STRING}}}}, projects: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, name:{type:Type.STRING}, description:{type:Type.STRING}, url:{type:Type.STRING}}}}, certifications: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, name:{type:Type.STRING}, issuer:{type:Type.STRING}, date:{type:Type.STRING}}}}, links: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id:{type:Type.STRING}, label:{type:Type.STRING}, url:{type:Type.STRING}}}}, skills: {type:Type.STRING}}}}}
    }
  });

  return parseJsonResponse(response.text);
}


// Special handling for the streaming function
export async function streamAnswer(resumeData: ResumeData, jobDescription: string, question: string, history: InterviewTurn[]) {
    const resumeText = getResumeAsText(resumeData);
    const historyText = history.map(turn => `Q: ${turn.question}\nA: ${turn.suggestion.answer}`).join('\n\n');
    const prompt = `You are a live interview coach. The user is in an interview for a ${jobDescription ? jobDescription : 'new role'}. Based on their resume and the interview question, provide a structured, high-quality answer.

<Resume>
${resumeText}
</Resume>

<InterviewHistory>
${historyText}
</InterviewHistory>

<LatestQuestion>
${question}
</LatestQuestion>

Instructions:
1.  Generate a concise, well-structured answer to the question.
2.  Use the STAR (Situation, Task, Action, Result) method where appropriate.
3.  Tailor the answer to the user's experience shown in their resume.
4.  Provide 3-4 key talking points as a bulleted list.
5.  Offer a "Pro Tip" for delivering the answer effectively.
6.  Format your response EXACTLY as follows, with these specific tags:
<ANSWER>
[Your suggested answer here]
</ANSWER>
<KEYPOINTS>
- [Key Point 1]
- [Key Point 2]
- [Key Point 3]
</KEYPOINTS>
<PROTIP>
[Your pro tip here]
</PROTIP>`;

    const args = {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.7 },
    };
    const payload = { isStream: true, args };

    if (window.electronAPI) {
        const fullResponseText = await window.electronAPI.callGemini(payload);
        const fullResponse = JSON.parse(fullResponseText);
        
        // Simulate a stream with one chunk for the desktop app to maintain component logic.
        // The "typing" effect is lost, but the content is delivered.
        async function* fakeStream() {
            yield fullResponse;
        }
        return fakeStream();
    } else {
        // For the web, we get a real stream from our serverless function.
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok || !response.body) {
            throw new Error('Streaming connection failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Transform the byte stream into an async iterator of JSON objects
        return (async function*() {
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                // Process newline-delimited JSON chunks
                const chunks = buffer.split('\n');
                buffer = chunks.pop() || '';

                for (const chunk of chunks) {
                    if (chunk) yield JSON.parse(chunk);
                }
            }
            if (buffer) yield JSON.parse(buffer); // Process any remaining data
        })();
    }
}