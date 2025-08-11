import React from 'react';

interface ScoreCircleProps {
  score: number;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
       <svg className="w-40 h-40">
         <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle
          className="text-border"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className={`transition-all duration-1000 ease-in-out`}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="url(#scoreGradient)"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
          transform="rotate(-90 80 80)"
        />
      </svg>
      <span className="absolute text-4xl font-bold text-text-primary">
        {score}
      </span>
    </div>
  );
};