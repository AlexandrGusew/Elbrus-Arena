import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'info' | 'stat';
  glow?: 'gold' | 'none';
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({
  children,
  variant = 'default',
  glow = 'none',
  className = '',
  onClick,
  selected = false
}: CardProps) {
  const baseStyles = "relative panel-bg transition-smooth rounded";

  const variantStyles = {
    default: "ornate-border p-6",
    info: "border-l-4 border-l-[#d4a574] border border-[#4a3d2a] p-4",
    stat: "border-2 border-[#6b5840] p-4"
  };

  const glowStyles = {
    gold: selected ? "gold-glow-strong border-[#d4a574]" : "",
    none: ""
  };

  const hoverStyles = onClick ? "cursor-pointer hover:border-[#d4a574] hover:gold-glow" : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${glowStyles[glow]} ${hoverStyles} ${className}`}
    >
      {/* Corner decorations for default variant */}
      {variant === 'default' && (
        <>
          <div
            className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d4a574] opacity-60"
          />
          <div
            className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d4a574] opacity-60"
          />
        </>
      )}
      {children}
    </div>
  );
}
