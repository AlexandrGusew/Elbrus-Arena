import React from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'password';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
}

export function Input({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  label
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#d4a574] uppercase tracking-wider text-xs font-cinzel">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          bg-[rgba(29,23,16,0.8)] 
          border-2 border-[#6b5840] 
          text-[#e8dcc8] 
          px-4 py-3 
          rounded
          outline-none 
          transition-smooth
          placeholder:text-[#7a6d5a]
          focus:border-[#d4a574]
          focus:gold-glow
          ${className}
        `}
      />
    </div>
  );
}