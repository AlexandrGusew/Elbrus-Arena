import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: 'login' | 'create' | 'choose') => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export function LoginPage({ onNavigate, musicOn, onToggleMusic }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('choose');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 py-8 relative">
      {/* Music Toggle */}
      <button
        onClick={onToggleMusic}
        className="absolute top-6 right-6 px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 transition-all flex items-center gap-2 text-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] backdrop-blur-sm"
      >
        {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        <span className="tracking-[0.2em] text-sm uppercase">Music {musicOn ? 'On' : 'Off'}</span>
      </button>

      {/* Decorative top element */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>

      {/* Title with ornate styling */}
      <div className="mb-12 relative">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-full text-center">
          <div className="inline-block px-8 py-1 border-t border-b border-amber-800/50">
            <span className="text-xs tracking-[0.3em] text-amber-600/70 uppercase">Welcome to the realm</span>
          </div>
        </div>
        
        <h1 className="text-6xl tracking-[0.15em] uppercase" style={{ 
          fontFamily: 'serif',
          textShadow: '0 0 20px rgba(217, 119, 6, 0.8), 0 0 40px rgba(217, 119, 6, 0.4), 2px 2px 4px rgba(0,0,0,0.8)',
          background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {isRegistering ? 'Registration' : 'Login Page'}
        </h1>
        
        {/* Ornamental line */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-amber-700/50"></div>
          <div className="w-2 h-2 rotate-45 border border-amber-600/50"></div>
          <div className="w-24 h-[1px] bg-amber-700/30"></div>
          <div className="w-2 h-2 rotate-45 border border-amber-600/50"></div>
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-amber-700/50"></div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative w-full max-w-[700px]">
        {/* Decorative frame */}
        <div className="absolute -inset-4 border-2 border-amber-900/30 rounded-lg pointer-events-none"></div>
        <div className="absolute -inset-2 border border-amber-800/20 rounded-lg pointer-events-none"></div>
        
        <div className="border-2 border-amber-700/60 rounded-lg p-10 bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_0_50px_rgba(0,0,0,0.5)] relative">
          {/* Corner ornaments */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-red-700/60 -translate-x-[2px] -translate-y-[2px]"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-red-700/60 translate-x-[2px] -translate-y-[2px]"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-red-700/60 -translate-x-[2px] translate-y-[2px]"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-red-700/60 translate-x-[2px] translate-y-[2px]"></div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 px-6 py-3 border-2 rounded transition-all tracking-[0.15em] uppercase text-sm relative overflow-hidden group ${
                isRegistering
                  ? 'border-red-700/80 bg-gradient-to-b from-red-950/80 to-red-900/80 text-amber-200 shadow-[0_0_20px_rgba(127,29,29,0.6)]'
                  : 'border-amber-800/40 bg-gradient-to-b from-stone-900/60 to-stone-950/60 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60'
              }`}
            >
              <span className="relative z-10">Register</span>
              {!isRegistering && <div className="absolute inset-0 bg-gradient-to-b from-amber-900/0 to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
            </button>
            <button
              className="flex-1 px-6 py-3 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-900/60 to-stone-950/60 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60 transition-all tracking-[0.15em] uppercase text-sm relative overflow-hidden group"
            >
              <span className="relative z-10">Telegram</span>
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/0 to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          <div className="text-center mb-6 relative">
            <div className="inline-block px-6 py-1 border-y border-amber-800/40">
              <h2 className="text-amber-400/90 tracking-[0.2em] uppercase text-xs" style={{ fontFamily: 'serif' }}>
                Enter the Game
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <input
                type="text"
                placeholder="LOGIN"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-6 py-3 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-amber-200 placeholder:text-amber-900/50 placeholder:tracking-[0.2em] focus:outline-none focus:border-amber-600/80 focus:shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all tracking-wider"
                style={{ fontFamily: 'serif' }}
              />
              <div className="absolute inset-0 rounded border border-red-900/0 group-focus-within:border-red-900/40 transition-all pointer-events-none"></div>
            </div>
            
            <div className="relative group">
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-3 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-amber-200 placeholder:text-amber-900/50 placeholder:tracking-[0.2em] focus:outline-none focus:border-amber-600/80 focus:shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all tracking-wider"
                style={{ fontFamily: 'serif' }}
              />
              <div className="absolute inset-0 rounded border border-red-900/0 group-focus-within:border-red-900/40 transition-all pointer-events-none"></div>
            </div>
            
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="relative px-20 py-4 border-2 border-red-800/80 rounded bg-gradient-to-b from-red-950/90 to-red-900/90 hover:from-red-900/90 hover:to-red-800/90 text-amber-200 transition-all tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(127,29,29,0.5)] hover:shadow-[0_0_40px_rgba(127,29,29,0.7)] group overflow-hidden"
                style={{ fontFamily: 'serif' }}
              >
                <span className="relative z-10">Enter</span>
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Decorative bottom element */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>
    </div>
  );
}