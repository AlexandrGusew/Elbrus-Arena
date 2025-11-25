import React from 'react';
import { Button } from '../components/Button';
import { Send } from 'lucide-react';

interface AuthPageProps {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-12 max-w-md w-full">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="animate-pulse-gold">
            ELBRUS ARENA
          </h1>
          <p className="text-[#b8a890] tracking-[0.2em] text-xs uppercase font-cinzel">
            Dark Fantasy MMO
          </p>
        </div>
        
        {/* Decorative Line */}
        <div className="ornate-divider" />
        
        {/* Auth Button */}
        <div className="space-y-6">
          <div className="text-[#d4a574] text-xs uppercase tracking-widest">
            Enter the Realm of Legends
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={onAuth}
            className="w-full animate-pulse-gold"
          >
            <div className="flex items-center justify-center gap-3">
              <Send size={20} />
              <span>Login via Telegram</span>
            </div>
          </Button>
        </div>
        
        {/* Version Info */}
        <div className="text-[#7a6d5a] text-xs tracking-wider">
          v1.0.0 | ALPHA BUILD
        </div>
      </div>
    </div>
  );
}