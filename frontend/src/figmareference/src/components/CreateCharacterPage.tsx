import { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, ArrowLeft, Skull, Flame, Zap, Shield, Swords, Brain } from 'lucide-react';

interface CreateCharacterPageProps {
  onNavigate: (page: 'login' | 'create' | 'choose') => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

interface CharacterClass {
  name: string;
  icon: string;
  description: string;
  stats: {
    hp: number;
    str: number;
    agi: number;
    int: number;
    damage: number;
    armor: number;
  };
}

const classes: CharacterClass[] = [
  {
    name: 'Warrior',
    icon: '⚔️',
    description: 'Master of melee combat',
    stats: { hp: 150, str: 15, agi: 8, int: 5, damage: 20, armor: 15 }
  },
  {
    name: 'Mage',
    icon: '🔮',
    description: 'Wielder of arcane magic',
    stats: { hp: 100, str: 5, agi: 10, int: 20, damage: 25, armor: 5 }
  },
  {
    name: 'Rogue',
    icon: '🗡️',
    description: 'Swift shadow assassin',
    stats: { hp: 120, str: 10, agi: 18, int: 8, damage: 18, armor: 8 }
  }
];

export function CreateCharacterPage({ onNavigate, musicOn, onToggleMusic }: CreateCharacterPageProps) {
  const [characterName, setCharacterName] = useState('');
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);

  const currentClass = classes[selectedClassIndex];

  const handlePrevClass = () => {
    setSelectedClassIndex((prev) => (prev === 0 ? classes.length - 1 : prev - 1));
  };

  const handleNextClass = () => {
    setSelectedClassIndex((prev) => (prev === classes.length - 1 ? 0 : prev + 1));
  };

  const handleCreate = () => {
    if (characterName.trim()) {
      onNavigate('choose');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-12 py-6 relative">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
        <button
          onClick={() => onNavigate('choose')}
          className="px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 text-amber-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)] backdrop-blur-sm tracking-wider text-sm uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>
        <button
          onClick={onToggleMusic}
          className="px-5 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/80 to-black/90 hover:from-stone-800/80 hover:to-stone-900/90 text-amber-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)] backdrop-blur-sm tracking-wider text-sm uppercase"
        >
          {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>Music {musicOn ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Title */}
      <div className="mb-6 relative">
        <h1 className="text-5xl tracking-[0.15em] uppercase" style={{ 
          fontFamily: 'serif',
          textShadow: '0 0 20px rgba(217, 119, 6, 0.8), 0 0 40px rgba(217, 119, 6, 0.4)',
          background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Create Character
        </h1>
        <div className="flex items-center justify-center mt-2 gap-2">
          <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-amber-700/50"></div>
          <div className="w-1 h-1 rotate-45 border border-amber-600/50"></div>
          <div className="w-16 h-[1px] bg-amber-700/30"></div>
          <div className="w-1 h-1 rotate-45 border border-amber-600/50"></div>
          <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-amber-700/50"></div>
        </div>
      </div>

      {/* Character Creation Form */}
      <div className="relative w-full max-w-[1100px]">
        <div className="absolute -inset-3 border-2 border-amber-900/30 rounded-lg pointer-events-none"></div>
        <div className="absolute -inset-1 border border-amber-800/20 rounded-lg pointer-events-none"></div>
        
        <div className="border-2 border-amber-700/60 rounded-lg p-6 bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.9)] relative">
          {/* Corner ornaments */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-red-700/60"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-red-700/60"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-red-700/60"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-red-700/60"></div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Side - Hero Display */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-56 h-56 rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center mb-4 relative overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] group">
                {/* Glowing eyes */}
                <div className="absolute top-20 left-16 w-5 h-5 rounded-full bg-red-600 blur-[2px] animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.9)]"></div>
                <div className="absolute top-20 right-16 w-5 h-5 rounded-full bg-red-600 blur-[2px] animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.9)]" style={{ animationDelay: '0.5s' }}></div>
                
                <span className="text-7xl filter drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">{currentClass.icon}</span>
                
                {/* Animated border glow */}
                <div className="absolute inset-2 rounded-full border border-amber-500/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border border-red-900/30"></div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl text-amber-200 tracking-[0.15em] uppercase mb-2" style={{ fontFamily: 'serif' }}>Hero</div>
                <div className="text-xs text-amber-600/70 tracking-[0.2em] uppercase italic">{currentClass.description}</div>
              </div>
            </div>

            {/* Right Side - Stats */}
            <div className="flex flex-col justify-center space-y-2">
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-stone-950/80 to-stone-950/40 border-l-2 border-amber-900/40 group hover:border-red-700/60 hover:bg-gradient-to-r hover:from-stone-900/80 hover:to-stone-950/60 transition-all">
                <span className="flex items-center gap-3 text-amber-200 tracking-wider">
                  <Skull className="w-4 h-4 text-red-600" />
                  <span className="uppercase text-sm">HP</span>
                </span>
                <span className="text-amber-400 tracking-[0.15em] font-mono">{currentClass.stats.hp}</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-stone-950/80 to-stone-950/40 border-l-2 border-amber-900/40 group hover:border-red-700/60 hover:bg-gradient-to-r hover:from-stone-900/80 hover:to-stone-950/60 transition-all">
                <span className="flex items-center gap-3 text-amber-200 tracking-wider">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="uppercase text-sm">Strength</span>
                </span>
                <span className="text-amber-400 tracking-[0.15em] font-mono">{currentClass.stats.str}</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-stone-950/80 to-stone-950/40 border-l-2 border-amber-900/40 group hover:border-red-700/60 hover:bg-gradient-to-r hover:from-stone-900/80 hover:to-stone-950/60 transition-all">
                <span className="flex items-center gap-3 text-amber-200 tracking-wider">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="uppercase text-sm">Agility</span>
                </span>
                <span className="text-amber-400 tracking-[0.15em] font-mono">{currentClass.stats.agi}</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-stone-950/80 to-stone-950/40 border-l-2 border-amber-900/40 group hover:border-red-700/60 hover:bg-gradient-to-r hover:from-stone-900/80 hover:to-stone-950/60 transition-all">
                <span className="flex items-center gap-3 text-amber-200 tracking-wider">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span className="uppercase text-sm">Intelligence</span>
                </span>
                <span className="text-amber-400 tracking-[0.15em] font-mono">{currentClass.stats.int}</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-stone-950/80 to-stone-950/40 border-l-2 border-amber-900/40 group hover:border-red-700/60 hover:bg-gradient-to-r hover:from-stone-900/80 hover:to-stone-950/60 transition-all">
                <span className="flex items-center gap-3 text-amber-200 tracking-wider">
                  <Swords className="w-4 h-4 text-red-500" />
                  <span className="uppercase text-sm">Damage</span>
                </span>
                <span className="text-amber-400 tracking-[0.15em] font-mono">{currentClass.stats.damage}</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-stone-950/80 to-stone-950/40 border-l-2 border-amber-900/40 group hover:border-red-700/60 hover:bg-gradient-to-r hover:from-stone-900/80 hover:to-stone-950/60 transition-all">
                <span className="flex items-center gap-3 text-amber-200 tracking-wider">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="uppercase text-sm">Armor</span>
                </span>
                <span className="text-amber-400 tracking-[0.15em] font-mono">{currentClass.stats.armor}</span>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="mt-6 mb-4 relative">
            <div className="absolute -inset-1 border border-amber-900/20 rounded pointer-events-none"></div>
            <input
              type="text"
              placeholder="ENTER CHARACTER NAME"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full px-6 py-3 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-amber-200 placeholder:text-amber-900/40 placeholder:tracking-[0.15em] text-center text-xl focus:outline-none focus:border-amber-600/80 focus:shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all tracking-[0.15em] uppercase"
              style={{ fontFamily: 'serif' }}
            />
          </div>

          {/* Class Selection */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <button
              onClick={handlePrevClass}
              className="p-2 border-2 border-amber-800/40 rounded-full bg-gradient-to-b from-stone-900/60 to-black/80 hover:from-stone-800/70 hover:to-stone-900/90 hover:border-amber-700/60 text-amber-300 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <div className="absolute -inset-1 border border-amber-900/30 rounded pointer-events-none"></div>
              <div className="px-10 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 min-w-[220px] text-center text-amber-200 tracking-[0.2em] uppercase shadow-inner" style={{ fontFamily: 'serif' }}>
                {currentClass.name}
              </div>
            </div>
            
            <button
              onClick={handleNextClass}
              className="p-2 border-2 border-amber-800/40 rounded-full bg-gradient-to-b from-stone-900/60 to-black/80 hover:from-stone-800/70 hover:to-stone-900/90 hover:border-amber-700/60 text-amber-300 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Create Button */}
          <div className="flex justify-center">
            <button
              onClick={handleCreate}
              disabled={!characterName.trim()}
              className="relative px-16 py-3 border-2 border-red-800/80 rounded bg-gradient-to-b from-red-950/90 to-red-900/90 hover:from-red-900/90 hover:to-red-800/90 text-amber-200 transition-all tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(127,29,29,0.5)] hover:shadow-[0_0_40px_rgba(127,29,29,0.7)] group overflow-hidden"
              style={{ fontFamily: 'serif' }}
            >
              <span className="relative z-10">Create</span>
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}