import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  type?: 'hp' | 'exp' | 'stamina';
  showText?: boolean;
  className?: string;
}

export function ProgressBar({ 
  current, 
  max, 
  type = 'hp',
  showText = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  const typeStyles = {
    hp: {
      gradient: 'from-[#8b4513] to-[#cd6147]',
      glow: 'rgba(139, 69, 19, 0.4)',
      border: '#8b4513'
    },
    exp: {
      gradient: 'from-[#4682b4] to-[#6ba3d4]',
      glow: 'rgba(70, 130, 180, 0.4)',
      border: '#4682b4'
    },
    stamina: {
      gradient: 'from-[#6b8e23] to-[#8ba850]',
      glow: 'rgba(107, 142, 35, 0.4)',
      border: '#6b8e23'
    }
  };
  
  const style = typeStyles[type];
  
  return (
    <div className={`relative w-full ${className}`}>
      <div 
        className="h-6 bg-[rgba(29,23,16,0.8)] border-2 rounded overflow-hidden"
        style={{ borderColor: style.border }}
      >
        <div
          className={`h-full bg-gradient-to-r ${style.gradient} transition-all duration-500`}
          style={{ 
            width: `${percentage}%`,
            boxShadow: `0 0 8px ${style.glow}`
          }}
        />
      </div>
      {showText && (
        <div 
          className="absolute inset-0 flex items-center justify-center text-[#e8dcc8] text-xs uppercase tracking-wider font-semibold"
          style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)' }}
        >
          {current} / {max}
        </div>
      )}
    </div>
  );
}