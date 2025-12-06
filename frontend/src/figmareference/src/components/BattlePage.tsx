import { useState } from 'react';

interface BattlePageProps {
  onNavigate: (page: 'login' | 'create' | 'choose' | 'dashboard' | 'dungeon' | 'battle') => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export function BattlePage({ onNavigate, musicOn, onToggleMusic }: BattlePageProps) {
  const [activeChat, setActiveChat] = useState<'all' | 'privat' | 'banlist' | 'frindlist'>('all');

  // Player data
  const player = {
    class: 'WARRIOR',
    name: 'HERO',
    level: 10,
    hitPointCurrent: 850,
    hitPointMax: 1000
  };

  // Mob data
  const mob = {
    name: 'SKELETON',
    hitPointCurrent: 450,
    hitPointMax: 600
  };

  // Battle log entries
  const battleLog = [
    'Battle started! Level 1/5',
    'Player attacks for 150 damage!',
    'Skeleton counters for 80 damage!',
    'Player uses special ability!',
    'Critical hit! 250 damage!'
  ];

  const chatTabs = [
    { id: 'all' as const, label: 'ALL' },
    { id: 'privat' as const, label: 'PRIVAT' },
    { id: 'banlist' as const, label: 'BANLIST' },
    { id: 'frindlist' as const, label: 'FRINDLIST' }
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
          onClick={() => onNavigate('dungeon')}
          className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Back
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full h-full border-4 border-[#2C2D33] rounded-2xl bg-[#1A1B21] backdrop-blur-md shadow-2xl p-6 relative" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 2px 6px rgba(0,0,0,0.4)' }}>
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#B21E2C]"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#B21E2C]"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#B21E2C]"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#B21E2C]"></div>

        {/* Level Badge - Top Center */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 border-3 border-[#B21E2C] rounded-lg bg-[#1A1B21] px-8 py-2 shadow-lg" style={{ boxShadow: '0 0 20px rgba(178, 30, 44, 0.4), inset 0 2px 4px rgba(0,0,0,0.6)' }}>
          <span className="text-sm uppercase tracking-[0.2em] text-[#B21E2C]" style={{ fontFamily: 'serif' }}>
            LEVEL DANGE 1/5
          </span>
        </div>

        <div className="flex gap-6 h-full pt-12">
          {/* LEFT SIDE - Player + Chat */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Player Section */}
            <div className="flex-1 flex flex-col">
              {/* Player Info Bar */}
              <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] p-3 mb-3 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                <div className="flex justify-between text-xs text-[#E6E6E6] uppercase tracking-wider" style={{ fontFamily: 'serif' }}>
                  <span>CLASS: {player.class}</span>
                  <span>NAME: {player.name}</span>
                  <span>LVL: {player.level}</span>
                </div>
              </div>

              {/* Player HP Bar */}
              <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] p-2 mb-4 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                <div className="text-xs text-[#E6E6E6] uppercase tracking-wider mb-1 text-center" style={{ fontFamily: 'serif' }}>
                  HIT POINT
                </div>
                <div className="h-2 bg-[#2C2D33] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#B21E2C] to-[#B21E2C]/80 transition-all duration-500"
                    style={{ width: `${(player.hitPointCurrent / player.hitPointMax) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#E6E6E6]/70 text-center mt-1" style={{ fontFamily: 'monospace' }}>
                  {player.hitPointCurrent} / {player.hitPointMax}
                </div>
              </div>

              {/* Player Circle */}
              <div className="flex-1 flex items-center justify-center mb-4">
                <div className="w-64 h-64 rounded-full border-4 border-[#2C2D33] bg-gradient-to-br from-[#1A1B21] via-[#111215] to-[#111215] flex items-center justify-center relative overflow-hidden shadow-lg" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.8)' }}>
                  <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-[#B21E2C] blur-sm animate-pulse shadow-[0_0_15px_rgba(178,30,44,0.9)]"></div>
                  <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#B21E2C] blur-sm animate-pulse shadow-[0_0_15px_rgba(178,30,44,0.9)]" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-3xl text-[#E6E6E6] uppercase tracking-[0.2em]" style={{ fontFamily: 'serif' }}>PLAYER</span>
                </div>
              </div>

              {/* Defense Slots */}
              <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] p-3 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                <div className="text-xs text-[#E6E6E6] uppercase tracking-wider mb-2 text-center" style={{ fontFamily: 'serif' }}>
                  DEF
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((slot) => (
                    <div key={slot} className="aspect-square border-3 border-[#2C2D33] rounded bg-[#111215] hover:border-[#B21E2C]/60 transition-all cursor-pointer flex items-center justify-center shadow-md" style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }}>
                      <span className="text-xs text-[#E6E6E6]/30">{slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="border-4 border-[#2C2D33] rounded-lg bg-[#1A1B21] flex flex-col h-[240px] shadow-lg" style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-2xl uppercase tracking-[0.3em] text-[#E6E6E6]/20" style={{ fontFamily: 'serif' }}>
                  CHAT
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 p-3 border-t-2 border-[#2C2D33]">
                {chatTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChat(tab.id)}
                    className={`px-2 py-2 rounded text-xs uppercase tracking-wider transition-all shadow-md ${
                      activeChat === tab.id
                        ? 'border-3 border-[#B21E2C] bg-[#B21E2C]/10 text-[#E6E6E6]'
                        : 'border-2 border-[#2C2D33] bg-[#111215] text-[#E6E6E6]/60 hover:text-[#E6E6E6] hover:border-[#B21E2C]/40'
                    }`}
                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER - Battle Controls */}
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Timer */}
            <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] px-8 py-3 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
              <span className="text-sm uppercase tracking-[0.2em] text-[#E6E6E6]" style={{ fontFamily: 'serif' }}>
                TIMER
              </span>
            </div>

            {/* Fight Button */}
            <button className="border-4 border-[#B21E2C] rounded-lg bg-[#1A1B21] px-12 py-6 hover:bg-[#B21E2C]/10 hover:shadow-[0_0_30px_rgba(178,30,44,0.6)] transition-all group shadow-lg" style={{ boxShadow: '0 0 20px rgba(178, 30, 44, 0.4), inset 0 2px 6px rgba(0,0,0,0.6)' }}>
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-4 border-l-4 border-[#B21E2C]"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-4 border-r-4 border-[#B21E2C]"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-4 border-l-4 border-[#B21E2C]"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-4 border-r-4 border-[#B21E2C]"></div>
              
              <span className="text-2xl uppercase tracking-[0.3em] text-[#E6E6E6] group-hover:text-[#B21E2C] transition-colors" style={{ 
                fontFamily: 'serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}>
                FIGHT
              </span>
            </button>
          </div>

          {/* RIGHT SIDE - Mob + Battle Log */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Mob Section */}
            <div className="flex-1 flex flex-col">
              {/* Mob Info Bar */}
              <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] p-3 mb-3 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                <div className="text-xs text-[#E6E6E6] uppercase tracking-wider text-center" style={{ fontFamily: 'serif' }}>
                  {mob.name}
                </div>
              </div>

              {/* Mob HP Bar */}
              <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] p-2 mb-4 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                <div className="text-xs text-[#E6E6E6] uppercase tracking-wider mb-1 text-center" style={{ fontFamily: 'serif' }}>
                  HIT POINT
                </div>
                <div className="h-2 bg-[#2C2D33] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#B21E2C] to-[#B21E2C]/80 transition-all duration-500"
                    style={{ width: `${(mob.hitPointCurrent / mob.hitPointMax) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#E6E6E6]/70 text-center mt-1" style={{ fontFamily: 'monospace' }}>
                  {mob.hitPointCurrent} / {mob.hitPointMax}
                </div>
              </div>

              {/* Mob Circle */}
              <div className="flex-1 flex items-center justify-center mb-4">
                <div className="w-64 h-64 rounded-full border-4 border-[#2C2D33] bg-gradient-to-br from-[#1A1B21] via-[#111215] to-[#111215] flex items-center justify-center relative overflow-hidden shadow-lg" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.8)' }}>
                  <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-[#B21E2C] blur-sm animate-pulse shadow-[0_0_15px_rgba(178,30,44,0.9)]"></div>
                  <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#B21E2C] blur-sm animate-pulse shadow-[0_0_15px_rgba(178,30,44,0.9)]" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-3xl text-[#E6E6E6] uppercase tracking-[0.2em]" style={{ fontFamily: 'serif' }}>MOB</span>
                </div>
              </div>

              {/* Attack Slots */}
              <div className="border-3 border-[#2C2D33] rounded-lg bg-[#111215] p-3 shadow-md" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}>
                <div className="text-xs text-[#E6E6E6] uppercase tracking-wider mb-2 text-center" style={{ fontFamily: 'serif' }}>
                  ATTAKE
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((slot) => (
                    <div key={slot} className="aspect-square border-3 border-[#2C2D33] rounded bg-[#111215] hover:border-[#B21E2C]/60 transition-all cursor-pointer flex items-center justify-center shadow-md" style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }}>
                      <span className="text-xs text-[#E6E6E6]/30">{slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Log */}
            <div className="border-4 border-[#2C2D33] rounded-lg bg-[#1A1B21] flex flex-col h-[240px] shadow-lg" style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}>
              {/* Log Header */}
              <div className="border-b-2 border-[#2C2D33] p-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6] block text-center" style={{ fontFamily: 'serif' }}>
                  LOGA FIGHT
                </span>
              </div>

              {/* Log Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {battleLog.map((entry, index) => (
                  <div 
                    key={index} 
                    className="text-xs text-[#E6E6E6]/80 hover:text-[#B21E2C] transition-colors py-1 border-b border-[#2C2D33]/50"
                    style={{ fontFamily: 'serif' }}
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}