import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ResumeData, InterviewTurn, SuggestedAnswer } from '../types';
import { streamAnswer } from '../services/geminiService';
import { Card } from './Card';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Mic, Zap, Redo, Download, BrainCircuit, MessageSquare, AlertTriangle, Star, Lightbulb, Video, CameraOff } from 'lucide-react';

interface InterviewCopilotProps {
  resumeData: ResumeData;
  isTrialActive: boolean;
}

type InterviewMode = 'setup' | 'live';

const BlinkingCursor = () => <span className="w-0.5 h-5 bg-accent inline-block animate-pulse" />;

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const InterviewCopilot: React.FC<InterviewCopilotProps> = ({ resumeData, isTrialActive }) => {
  const [mode, setMode] = useState<InterviewMode>('setup');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingTurnId, setStreamingTurnId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interviewLog, setInterviewLog] = useState<InterviewTurn[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const recognitionRef = useRef<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);


  const processStream = useCallback(async (question: string, turnId: string) => {
    setIsStreaming(true);
    setStreamingTurnId(turnId);

    try {
        const stream = await streamAnswer(resumeData, jobDescription, question, interviewLog.slice(0, 3));
        let fullResponseText = '';
        
        for await (const chunk of stream) {
            const text = chunk.text;
            fullResponseText += text;
            setInterviewLog(prev => prev.map(t => 
                t.id === turnId ? { ...t, suggestion: { ...t.suggestion, answer: fullResponseText } } : t
            ));
        }

        const answerMatch = fullResponseText.match(/<ANSWER>([\s\S]*?)<\/ANSWER>/);
        const keyPointsMatch = fullResponseText.match(/<KEYPOINTS>([\s\S]*?)<\/KEYPOINTS>/);
        const proTipMatch = fullResponseText.match(/<PROTIP>([\s\S]*?)<\/PROTIP>/);

        const finalSuggestion: SuggestedAnswer = {
            answer: answerMatch ? answerMatch[1].trim() : "Sorry, I couldn't structure the answer correctly.",
            keyPoints: keyPointsMatch ? keyPointsMatch[1].trim().split(/-\s+/).filter(Boolean) : [],
            proTip: proTipMatch ? proTipMatch[1].trim() : ''
        };

        setInterviewLog(prev => prev.map(t => 
            t.id === turnId ? { ...t, suggestion: finalSuggestion } : t
        ));

    } catch (err) {
        console.error("Failed to stream suggestions:", err);
        setError("Failed to generate suggestions. The AI model might be busy.");
         setInterviewLog(prev => prev.map(t => 
            t.id === turnId ? { ...t, suggestion: { ...t.suggestion, answer: "Error: Could not generate answer." } } : t
        ));
    } finally {
        setIsStreaming(false);
        setStreamingTurnId(null);
    }
  }, [resumeData, jobDescription, interviewLog]);


  const handleRegenerateAnswer = useCallback(async () => {
    if (isStreaming || interviewLog.length === 0) return;
    const latestTurn = interviewLog[0];
    const turnId = `turn-${Date.now()}`;
    setInterviewLog(prev => [{ ...latestTurn, id: turnId, suggestion: { answer: '', keyPoints: [], proTip: ''} }, ...prev.slice(1)]);
    processStream(latestTurn.question, turnId);
  }, [isStreaming, interviewLog, processStream]);


  const handleAnalyzeQuestion = useCallback(async (question: string) => {
    if (!question.trim() || isStreaming) return;
    const turnId = `turn-${Date.now()}`;
    const newTurn: InterviewTurn = {
        id: turnId,
        question: question.trim(),
        suggestion: { answer: '', keyPoints: [], proTip: '' },
        timestamp: new Date().toLocaleTimeString(),
    };
    setInterviewLog(prev => [{...newTurn},...prev.filter(t => t.question.toLowerCase() !== question.trim().toLowerCase())]);
    processStream(question.trim(), turnId);
  }, [isStreaming, processStream]);


  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      setLiveTranscript(finalTranscript);
    };
    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}.`);
      setIsListening(false);
    }
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      if(liveTranscript.trim()){
        handleAnalyzeQuestion(liveTranscript.trim());
      }
    } else {
      setLiveTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStartSession = async () => {
    if (!jobRole.trim()) {
      setError("Please provide a Job Role to start.");
      return;
    }
    if (!isTrialActive) return;
    
    setError(null);
    setCameraError(null);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        setMode('live');
    } catch (err) {
        console.error("Camera access denied:", err);
        setCameraError("Camera access denied. Please grant permission and try again.");
    }
  };
  
  const handleReset = () => {
    videoStream?.getTracks().forEach(track => track.stop());
    setVideoStream(null);
    setMode('setup');
    setInterviewLog([]);
    setJobRole('');
    setJobDescription('');
    setError(null);
    setCameraError(null);
    setIsStreaming(false);
    if(isListening) recognitionRef.current.stop();
  };
  
  const downloadLog = () => {
    let content = `Interview Copilot Log for ${jobRole}\nDate: ${new Date().toLocaleString()}\n\n`;
    [...interviewLog].reverse().forEach(turn => {
        content += `--------------------------------------------------\n`;
        content += `[${turn.timestamp}] Question:\n${turn.question}\n\n`;
        content += `AI Suggested Answer:\n${turn.suggestion.answer}\n\n`;
        content += `Key Points:\n`;
        turn.suggestion.keyPoints.forEach(sugg => { content += `- ${sugg}\n`; });
        content += `\nPro-Tip: ${turn.suggestion.proTip}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-log-${jobRole.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = 0;
  }, [interviewLog]);
  
  useEffect(() => {
    if (mode === 'live' && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [mode, videoStream]);

  if (mode === 'setup') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Live Interview Copilot</h1>
        <p className="text-text-secondary mt-1">Practice with live video and get real-time AI assistance.</p>
        
        {!isTrialActive && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 border border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-2"><Star className="text-yellow-400"/><h3 className="text-lg font-bold text-white">This is a PRO Feature</h3></div>
                <p className="text-text-secondary mb-4">Unlock video practice, real-time suggestions, and post-interview analysis.</p>
                <Button>Upgrade to PRO</Button>
            </div>
        )}

        <Card>
          <div className={`space-y-4 ${!isTrialActive ? 'opacity-40 pointer-events-none' : ''}`}>
            <Input label="Job Role / Title" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g., Senior Software Engineer" required disabled={!isTrialActive}/>
            <Textarea label="Job Description (Optional, for better results)" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} placeholder="Paste the job description here..." disabled={!isTrialActive}/>
            <Button onClick={handleStartSession} className="w-full" disabled={!isTrialActive}><Video size={16} className="mr-2"/> Start Live Session</Button>
            {cameraError && <div className="p-3 text-center text-sm text-red-400 bg-red-500/10 rounded-xl flex items-center justify-center gap-2"><CameraOff size={16}/> {cameraError}</div>}
            {error && <div className="p-3 text-center text-sm text-yellow-400 bg-yellow-500/10 rounded-xl flex items-center justify-center gap-2"><AlertTriangle size={16}/> {error}</div>}
          </div>
        </Card>
      </div>
    );
  }

  const latestTurn = interviewLog[0];
  const isCurrentlyStreaming = streamingTurnId === latestTurn?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Copilot is Live</h1>
          <p className="text-text-secondary">Assisting for: <span className="font-semibold text-accent-light">{jobRole}</span></p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={downloadLog} variant="outline" disabled={interviewLog.length === 0}><Download size={16} className="mr-2"/> Log</Button>
           <Button onClick={handleReset} variant="outline"><Redo size={16} className="mr-2"/> Reset</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-text-secondary">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-lg transform -scale-x-100" />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card>
              <Button onClick={handleToggleListening} disabled={isStreaming} className={`w-full !py-3 text-base ${isListening ? 'bg-red-500/80 hover:bg-red-500 text-white' : ''}`}><Mic size={20} className="mr-2"/>{isListening ? 'Listening... (Click to Stop)' : 'Listen for Question'}</Button>
              {isListening && <p className="text-center text-xs text-text-secondary animate-pulse mt-2">Capturing audio from your microphone...</p>}
          </Card>
          
          <div className="space-y-4 h-[calc(100vh-18rem)] overflow-y-auto">
            <Card title="AI Suggestions" icon={<BrainCircuit className="text-accent"/>}>
                <div className="max-h-[40vh] overflow-y-auto pr-2">
                {isStreaming && !latestTurn ? (
                    <div className="flex items-center justify-center p-8 text-text-secondary h-full"><Spinner /><span className="ml-3">Generating answer...</span></div>
                ) : latestTurn ? (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-text-primary mb-2">Suggested Answer</h4>
                            <p className="text-text-secondary whitespace-pre-wrap font-sans bg-background/50 p-3 rounded-lg leading-relaxed">{latestTurn.suggestion.answer}{isCurrentlyStreaming && <BlinkingCursor />}</p>
                        </div>
                        {!isCurrentlyStreaming && latestTurn.suggestion.keyPoints.length > 0 && (
                             <div><h4 className="font-semibold text-text-primary mb-2">Key Talking Points</h4><ul className="space-y-2">{latestTurn.suggestion.keyPoints.map((point, i) => (<li key={i} className="flex items-start gap-3 text-text-secondary"><Zap size={16} className="text-yellow-400 mt-1 flex-shrink-0"/><span>{point}</span></li>))}</ul></div>
                        )}
                        {!isCurrentlyStreaming && latestTurn.suggestion.proTip && (
                             <div><h4 className="font-semibold text-text-primary mb-2">Pro Tip</h4><div className="flex items-start gap-3 text-text-secondary bg-background/50 p-3 rounded-lg"><Lightbulb size={20} className="text-aqua mt-0.5 flex-shrink-0"/><p className="text-sm italic">{latestTurn.suggestion.proTip}</p></div></div>
                        )}
                        <div className="pt-4 border-t border-border/50 text-center">
                            <Button onClick={handleRegenerateAnswer} variant="outline" disabled={isStreaming}>{isStreaming && latestTurn.id === streamingTurnId ? <Spinner size="sm"/> : <Redo size={14} className="mr-2"/>} Regenerate</Button>
                        </div>
                    </div>
                ) : (<div className="text-center p-8 text-text-secondary flex flex-col items-center justify-center h-full"><p>Click "Listen for Question" to start.</p></div>)}
                </div>
            </Card>

            <Card title="Interview Log" icon={<MessageSquare className="text-aqua"/>}>
              <div ref={logContainerRef} className="max-h-[30vh] overflow-y-auto pr-2 space-y-6">
                {interviewLog.length > 0 ? interviewLog.map(turn => (
                    <div key={turn.id} className="p-4 bg-background/50 rounded-xl animate-in fade-in duration-500">
                        <p className="font-semibold text-text-primary border-b border-border pb-2 mb-2"><span className="text-xs text-text-secondary mr-2">[{turn.timestamp}]</span> Question</p><p className="text-text-secondary italic">"{turn.question}"</p>
                    </div>
                )) : (<div className="text-center p-8 text-text-secondary flex flex-col items-center justify-center h-full"><p>Your captured questions will appear here.</p></div>)}
              </div>
           </Card>
          </div>
        </div>
      </div>
       {error && (<div className="p-3 mt-4 text-center text-sm text-yellow-400 bg-yellow-500/10 rounded-xl flex items-center justify-center gap-2"><AlertTriangle size={16}/> {error}</div>)}
    </div>
  );
};

export default InterviewCopilot;