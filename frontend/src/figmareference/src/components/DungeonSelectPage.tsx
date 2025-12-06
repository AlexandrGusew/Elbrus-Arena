import { useState } from 'react';

interface DungeonSelectPageProps {
  onNavigate: (page: 'login' | 'create' | 'choose' | 'dashboard' | 'dungeon' | 'battle') => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export function DungeonSelectPage({ onNavigate, musicOn, onToggleMusic }: DungeonSelectPageProps) {
  const [selectedDungeon, setSelectedDungeon] = useState<number | null>(null);

  const dungeons = [
    {
      id: 1,
      name: 'EASE DANGE 1 LVL',
      level: 1,
      difficulty: 'Easy',
      description: 'Beginner dungeon for new warriors'
    },
    {
      id: 2,
      name: 'MIDLE DANGE 2 LVL',
      level: 2,
      difficulty: 'Medium',
      description: 'Challenging trials for experienced fighters'
    },
    {
      id: 3,
      name: 'HARD DANGE 3 LVL',
      level: 3,
      difficulty: 'Hard',
      description: 'Deadly nightmare for true champions'
    }
  ];

  return (
    <div className="w-full h-full p-4 relative" style={{ backgroundColor: '#111215' }}>
      {/* Top Navigation */}
      <div className="absolute top-6 right-6 flex gap-2 z-30">
        <button
          onClick={onToggleMusic}
          className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Music
        </button>
        <button className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
          FAQ
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Back
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full h-full border-4 border-[#2C2D33] rounded-2xl bg-[#1A1B21] backdrop-blur-md shadow-2xl p-8 relative" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 2px 6px rgba(0,0,0,0.4)' }}>
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#B21E2C]"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#B21E2C]"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#B21E2C]"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#B21E2C]"></div>

        {/* Title */}
        <div className="text-center mb-12 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full text-center">
            <div className="inline-block px-8 py-1 border-t-2 border-b-2 border-[#2C2D33]">
              <span className="text-xs tracking-[0.3em] text-[#E6E6E6]/50 uppercase" style={{ fontFamily: 'serif' }}>
                Choose Your Path
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl tracking-[0.2em] uppercase text-[#E6E6E6] mt-4" style={{ 
            fontFamily: 'serif',
            textShadow: '0 0 20px rgba(178, 30, 44, 0.6), 0 2px 4px rgba(0,0,0,0.9)'
          }}>
            SELECT DUNGEON
          </h1>

          {/* Ornamental line */}
          <div className="flex items-center justify-center mt-6 gap-3">
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-[#B21E2C]/50"></div>
            <div className="w-2 h-2 rotate-45 border-2 border-[#B21E2C]"></div>
            <div className="w-32 h-[1px] bg-[#B21E2C]/30"></div>
            <div className="w-2 h-2 rotate-45 border-2 border-[#B21E2C]"></div>
            <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-[#B21E2C]/50"></div>
          </div>
        </div>

        {/* Dungeon List */}
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {dungeons.map((dungeon) => (
            <button
              key={dungeon.id}
              onClick={() => setSelectedDungeon(dungeon.id)}
              className={`w-full border-4 rounded-lg p-6 relative transition-all group shadow-lg ${
                selectedDungeon === dungeon.id
                  ? 'border-[#B21E2C] bg-[#1A1B21] shadow-[0_0_30px_rgba(178,30,44,0.4)]'
                  : 'border-[#2C2D33] bg-[#111215] hover:border-[#B21E2C]/60 hover:shadow-[0_0_20px_rgba(178,30,44,0.2)]'
              }`}
              style={{ 
                boxShadow: selectedDungeon === dungeon.id 
                  ? '0 0 30px rgba(178, 30, 44, 0.4), inset 0 2px 8px rgba(0,0,0,0.6)' 
                  : 'inset 0 2px 8px rgba(0,0,0,0.6)'
              }}
            >
              {/* Stone corner decorations */}
              <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 transition-all ${
                selectedDungeon === dungeon.id ? 'border-[#B21E2C]' : 'border-[#2C2D33] group-hover:border-[#B21E2C]/60'
              }`}></div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 transition-all ${
                selectedDungeon === dungeon.id ? 'border-[#B21E2C]' : 'border-[#2C2D33] group-hover:border-[#B21E2C]/60'
              }`}></div>
              <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 transition-all ${
                selectedDungeon === dungeon.id ? 'border-[#B21E2C]' : 'border-[#2C2D33] group-hover:border-[#B21E2C]/60'
              }`}></div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 transition-all ${
                selectedDungeon === dungeon.id ? 'border-[#B21E2C]' : 'border-[#2C2D33] group-hover:border-[#B21E2C]/60'
              }`}></div>

              <div className="flex items-center justify-between">
                {/* Left side - Dungeon name and level */}
                <div className="flex-1 text-left">
                  <h2 className={`text-2xl uppercase tracking-[0.2em] transition-colors ${
                    selectedDungeon === dungeon.id ? 'text-[#B21E2C]' : 'text-[#E6E6E6] group-hover:text-[#B21E2C]'
                  }`} style={{ 
                    fontFamily: 'serif',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {dungeon.name}
                  </h2>
                  <p className="text-sm text-[#E6E6E6]/60 mt-2 tracking-wide" style={{ fontFamily: 'serif' }}>
                    {dungeon.description}
                  </p>
                </div>

                {/* Right side - Difficulty badge */}
                <div className={`border-3 rounded px-6 py-3 ml-6 transition-all ${
                  selectedDungeon === dungeon.id
                    ? 'border-[#B21E2C] bg-[#B21E2C]/20'
                    : 'border-[#2C2D33] bg-[#111215]'
                }`} style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                  <span className={`text-sm uppercase tracking-wider transition-colors ${
                    selectedDungeon === dungeon.id ? 'text-[#B21E2C]' : 'text-[#E6E6E6]/70'
                  }`} style={{ fontFamily: 'serif' }}>
                    {dungeon.difficulty}
                  </span>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedDungeon === dungeon.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-[#B21E2C] shadow-[0_0_10px_rgba(178,30,44,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Enter Button */}
        <div className="flex justify-center">
          <button
            disabled={selectedDungeon === null}
            onClick={() => selectedDungeon !== null && onNavigate('battle')}
            className={`border-4 rounded-lg px-16 py-6 relative transition-all group shadow-lg ${
              selectedDungeon !== null
                ? 'border-[#B21E2C] bg-[#1A1B21] hover:bg-[#B21E2C]/10 hover:shadow-[0_0_40px_rgba(178,30,44,0.6)] cursor-pointer'
                : 'border-[#2C2D33] bg-[#111215] cursor-not-allowed opacity-50'
            }`}
            style={{ 
              boxShadow: selectedDungeon !== null 
                ? '0 0 30px rgba(178, 30, 44, 0.4), inset 0 2px 6px rgba(0,0,0,0.6)' 
                : 'inset 0 2px 6px rgba(0,0,0,0.6)'
            }}
          >
            {/* Stone corner decorations */}
            <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 transition-all ${
              selectedDungeon !== null ? 'border-[#B21E2C] group-hover:border-[#B21E2C]' : 'border-[#2C2D33]'
            }`}></div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 transition-all ${
              selectedDungeon !== null ? 'border-[#B21E2C] group-hover:border-[#B21E2C]' : 'border-[#2C2D33]'
            }`}></div>
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 transition-all ${
              selectedDungeon !== null ? 'border-[#B21E2C] group-hover:border-[#B21E2C]' : 'border-[#2C2D33]'
            }`}></div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 transition-all ${
              selectedDungeon !== null ? 'border-[#B21E2C] group-hover:border-[#B21E2C]' : 'border-[#2C2D33]'
            }`}></div>

            <span className={`text-3xl uppercase tracking-[0.3em] transition-colors ${
              selectedDungeon !== null ? 'text-[#E6E6E6] group-hover:text-[#B21E2C]' : 'text-[#E6E6E6]/30'
            }`} style={{ 
              fontFamily: 'serif',
              textShadow: selectedDungeon !== null ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
            }}>
              ENTER DANGE
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}