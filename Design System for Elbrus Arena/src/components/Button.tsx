import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseStyles = "relative transition-smooth uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed rounded";
  
  const variantStyles = {
    primary: `
      bg-gradient-to-b from-[#4a3d2a] to-[#2d2419] 
      border-2 border-[#8b6f47] 
      text-[#e8dcc8] 
      hover:from-[#5a4d3a] hover:to-[#3d3020] 
      hover:border-[#d4a574] 
      hover:gold-glow
      active:scale-95
    `,
    secondary: `
      bg-[rgba(45,36,25,0.6)] 
      border border-[#4a3d2a] 
      text-[#b8a890] 
      hover:bg-[rgba(61,48,32,0.8)] 
      hover:border-[#6b5840] 
      hover:text-[#e8dcc8]
    `,
    danger: `
      bg-gradient-to-b from-[#5a3a2a] to-[#3d2419] 
      border-2 border-[#8b4513] 
      text-[#e8b8a8] 
      hover:border-[#cd853f] 
      hover:shadow-[0_0_12px_rgba(205,133,63,0.4)]
    `
  };
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}