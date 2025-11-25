import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface StatRowProps {
  icon: string;
  label: string;
  value: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  showControls?: boolean;
}

export function StatRow({ 
  icon, 
  label, 
  value, 
  onIncrease, 
  onDecrease,
  showControls = false 
}: StatRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[rgba(29,23,16,0.5)] border border-[#4a3d2a] rounded">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-[#b8a890] uppercase tracking-wider">{label}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {showControls && onDecrease && (
          <button
            onClick={onDecrease}
            className="w-8 h-8 flex items-center justify-center border border-[#8b4513] text-[#cd853f] hover:bg-[rgba(139,69,19,0.2)] transition-smooth rounded"
          >
            <Minus size={16} />
          </button>
        )}
        
        <span className="text-[#d4a574] min-w-[3rem] text-center text-lg font-semibold">
          {value}
        </span>
        
        {showControls && onIncrease && (
          <button
            onClick={onIncrease}
            className="w-8 h-8 flex items-center justify-center border border-[#6b8e23] text-[#8ba850] hover:bg-[rgba(107,142,35,0.2)] transition-smooth rounded"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}