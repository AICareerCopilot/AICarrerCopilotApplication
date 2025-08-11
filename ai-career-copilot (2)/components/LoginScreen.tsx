
import React, { useState } from 'react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { FileText, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('jai.dixit@example.com');
  const [password, setPassword] = useState('password'); // Dummy password

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-[#111320] p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-aqua to-purple rounded-2xl flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary">
                Career<span className="text-accent-light">Copilot</span>
            </h1>
            <p className="text-text-secondary mt-2">Your personal AI-powered career assistant.</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-text-primary">Welcome Back</h2>
            <Input 
              label="Email" 
              type="email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              required
            />
            <Input 
              label="Password" 
              type="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full">
              <LogIn size={18} className="mr-2"/>
              Sign In
            </Button>
            <p className="text-xs text-center text-text-secondary">
              This is a simulated login. Any email/password will work.
            </p>
          </form>
        </Card>

        <p className="text-xs text-center text-text-secondary mt-8">
          Created by Commandant Manish Kumar (0577-L), Indian Coast Guard.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
