import React from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26, 20, 16, 0.9)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md relative"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#d4a574] hover:text-[#f5d7a1] transition-smooth"
        >
          <X size={24} />
        </button>
        
        {/* Header */}
        {title && (
          <div className="mb-6 pb-4 border-b-2 border-[#6b5840]">
            <h2>{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className="mb-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="pt-4 border-t-2 border-[#6b5840] flex justify-end gap-4">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}