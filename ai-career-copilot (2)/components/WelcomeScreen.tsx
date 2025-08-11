
import React, { useState } from 'react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { FileText, LogIn, Mail, Phone, SearchCheck, Mic, Send, Eye, EyeOff } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: () => void;
}

type AuthMethod = 'email' | 'phone';

const FeatureHighlight: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-brand-cyan" />
        </div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-white/70 mt-1">{children}</p>
        </div>
    </div>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin }) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        onLogin();
    }, 1500);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    setTimeout(() => {
        setOtpSent(true);
        setIsLoading(false);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        onLogin();
    }, 1500);
  };
  
  const resetFormState = (method: AuthMethod) => {
      setAuthMethod(method);
      setEmail('');
      setPassword('');
      setPhone('');
      setOtp('');
      setOtpSent(false);
  }

  const PasswordInput: React.FC = () => (
    <div className="relative">
        <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
        />
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-text-secondary hover:text-text-primary transition-colors"
        >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 bg-card/50 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-black/30 w-full max-w-6xl mx-auto overflow-hidden border border-border">
           
            {/* Left side - Branding & Graphics */}
            <div className="md:col-span-7 bg-gradient-to-br from-brand-violet to-brand-cyan p-8 md:p-12 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                         <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">CareerCopilot</h1>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 animate-in fade-in slide-in-from-top-5 duration-700">
                        Welcome to your ultimate AI Career Copilot.
                    </h2>
                    <p className="text-white/80 text-lg mb-12 animate-in fade-in slide-in-from-top-5 duration-700 [animation-delay:200ms]">
                        The smart way to build resumes, optimize LinkedIn, prepare for interviews, and land your dream job!
                    </p>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 [animation-delay:400ms]">
                        <FeatureHighlight icon={FileText} title="FAANG-Ready Resumes">
                            Optimize your resume against any job description with one click.
                        </FeatureHighlight>
                        <FeatureHighlight icon={SearchCheck} title="AI Job Matcher">
                            Discover your match score for any role and get improvement suggestions.
                        </FeatureHighlight>
                        <FeatureHighlight icon={Mic} title="Live Interview Copilot">
                            Get real-time, AI-powered talking points during live interviews.
                        </FeatureHighlight>
                    </div>
                </div>

                <p className="text-sm text-white/60 mt-12">
                    Created by Commandant Manish Kumar (0577-L), Indian Coast Guard.
                </p>
            </div>

            {/* Right side - Login Form */}
            <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center animate-in fade-in duration-700 [animation-delay:600ms]">
                 <h3 className="text-3xl font-bold text-text-primary mb-2">Get Started</h3>
                 <p className="text-text-secondary mb-8">Sign in or create an account to continue.</p>
                
                 <div className="grid grid-cols-2 gap-2 bg-background/50 p-1.5 rounded-xl mb-6">
                     <button onClick={() => resetFormState('email')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${authMethod === 'email' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-text-secondary hover:bg-card'}`}>Email & Password</button>
                     <button onClick={() => resetFormState('phone')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${authMethod === 'phone' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-text-secondary hover:bg-card'}`}>Phone & OTP</button>
                 </div>

                 {authMethod === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-5 animate-in fade-in duration-300">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                        <PasswordInput />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Spinner /> : <LogIn size={18} className="mr-2" />}
                            Sign In
                        </Button>
                    </form>
                 )}

                 {authMethod === 'phone' && !otpSent && (
                     <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in duration-300">
                        <Input
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            required
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Spinner /> : <Send size={18} className="mr-2" />}
                            Send OTP
                        </Button>
                     </form>
                 )}
                 
                 {authMethod === 'phone' && otpSent && (
                     <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-500">
                        <p className="text-sm text-text-secondary text-center">
                            An OTP has been sent to <span className="font-semibold text-text-primary">{phone}</span>.
                        </p>
                        <Input
                            label="One-Time Password (OTP)"
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit code"
                            required
                            maxLength={6}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Spinner /> : <LogIn size={18} className="mr-2" />}
                            Verify & Login
                        </Button>
                     </form>
                 )}
                 
                <p className="text-xs text-center text-text-secondary/50 mt-8">
                    This is a simulated login. Any valid-looking input will work.
                </p>
            </div>
        </div>
    </div>
  );
};

export default WelcomeScreen;
