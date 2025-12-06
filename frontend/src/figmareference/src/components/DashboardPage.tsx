import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { InventorySection } from './InventorySection';
import { ForgeSection } from './ForgeSection';

interface DashboardPageProps {
  onNavigate: (page: 'login' | 'create' | 'choose' | 'dashboard') => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export function DashboardPage({ onNavigate, musicOn, onToggleMusic }: DashboardPageProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'inventory' | 'forge'>('main');
  const [showForge, setShowForge] = useState(false); // New state for forge window

  const character = {
    name: 'Darkmoon',
    class: 'Warrior',
    level: 3,
    stats: {
      hitPoint: 200,
      endurance: 200,
      damage: 27,
      armor: 23,
      str: 18,
      agi: 15,
      int: 8
    }
  };

  return (
    <div className="w-full h-full p-4 relative">
      {/* Top Navigation */}
      <div className="absolute top-6 right-6 flex gap-2 z-30">
        <button
          onClick={onToggleMusic}
          className="px-4 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/90 to-black/95 hover:from-stone-800/90 hover:to-stone-900/95 text-amber-300 transition-all text-xs uppercase tracking-[0.15em] shadow-lg shadow-black/50 flex items-center gap-2"
        >
          {musicOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          Music
        </button>
        <button className="px-4 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/90 to-black/95 hover:from-stone-800/90 hover:to-stone-900/95 text-amber-300 transition-all text-xs uppercase tracking-[0.15em] shadow-lg shadow-black/50">
          FAQ
        </button>
        <button
          onClick={() => onNavigate('choose')}
          className="px-4 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/90 to-black/95 hover:from-stone-800/90 hover:to-stone-900/95 text-amber-300 transition-all text-xs uppercase tracking-[0.15em] shadow-lg shadow-black/50"
        >
          Back
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full h-full border-4 border-amber-700/60 rounded-2xl bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md shadow-2xl shadow-black/80 p-6 relative">
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-red-700/60"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-red-700/60"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-red-700/60"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-red-700/60"></div>

        <div className="grid grid-cols-[45%_55%] gap-6 h-full">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 h-full">
            {/* Character Info Card OR Forge Section - 2/3 of height */}
            {showForge ? (
              <ForgeSection />
            ) : (
              <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-4 relative h-[66%]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Left Half - Character */}
                  <div className="flex flex-col gap-2 h-full">
                    {/* Class */}
                    <div className="px-4 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-center text-amber-200 tracking-wider uppercase text-sm" style={{ fontFamily: 'serif' }}>
                      {character.class}
                    </div>

                    {/* Name */}
                    <div className="px-4 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 text-center text-amber-200 tracking-wider uppercase text-sm" style={{ fontFamily: 'serif' }}>
                      {character.name}
                    </div>

                    {/* Character Circle - Takes remaining space */}
                    <div className="flex-1 w-full rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                      <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]"></div>
                      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]" style={{ animationDelay: '0.5s' }}></div>
                      <span className="text-4xl text-amber-200 tracking-wider" style={{ fontFamily: 'serif' }}>CHAR</span>
                    </div>

                    {/* Level Bar at the bottom */}
                    <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 overflow-hidden">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-3 py-1">
                          <span className="text-black text-sm uppercase tracking-wider" style={{ fontFamily: 'serif' }}>LVL {character.level}</span>
                        </div>
                        <div className="flex-1 h-full bg-black/40"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Half - Split between Stats and Equipment */}
                  <div className="flex flex-col gap-3 h-full">
                    {/* Stats Box - Top Half */}
                    <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/80 to-black/90 p-3 h-1/2 flex items-center justify-center">
                      <div className="space-y-1 text-[11px] text-amber-200" style={{ fontFamily: 'monospace' }}>
                        <div>HIT POINT...........{character.stats.hitPoint}</div>
                        <div>ENDURANCE...........{character.stats.endurance}</div>
                        <div>DAMAGE..............{character.stats.damage}</div>
                        <div>ARMOR...............{character.stats.armor}</div>
                        <div className="h-px bg-amber-800/30 my-1"></div>
                        <div>STR.................{character.stats.str}</div>
                        <div>AGI.................{character.stats.agi}</div>
                        <div>INT.................{character.stats.int}</div>
                      </div>
                    </div>

                    {/* Equipment Grid - Bottom Half */}
                    <div className="grid grid-cols-2 gap-3 h-1/2 p-5 place-items-center">
                      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20">
                        МЕЧ
                      </div>
                      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20">
                        ШЛЕМ
                      </div>
                      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20">
                        БРОНЯ
                      </div>
                      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20">
                        САПОГИ
                      </div>
                      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20">
                        ПОЯС
                      </div>
                      <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20">
                        КОЛЬЦО
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Section - 1/3 of height */}
            <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex flex-col relative h-[33%]">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

              {/* Chat Area */}
              <div className="flex-1 flex items-center justify-center p-6">
                <h3 className="text-4xl uppercase tracking-[0.3em] text-amber-300/40" style={{ fontFamily: 'serif' }}>
                  CHAT
                </h3>
              </div>

              {/* Chat Tabs - 4 equal buttons at the bottom */}
              <div className="grid grid-cols-4 gap-2 p-3 border-t border-amber-800/40">
                <button className="px-2 py-2 border-2 border-red-700/60 rounded bg-gradient-to-b from-red-950/60 to-red-900/60 text-amber-200 text-xs uppercase tracking-wider shadow-inner">
                  All
                </button>
                <button className="px-2 py-2 border border-amber-800/40 rounded bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60 transition-all text-xs uppercase tracking-wider">
                  Privat
                </button>
                <button className="px-2 py-2 border border-amber-800/40 rounded bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60 transition-all text-xs uppercase tracking-wider">
                  Banlist
                </button>
                <button className="px-2 py-2 border border-amber-800/40 rounded bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60 transition-all text-xs uppercase tracking-wider">
                  Frendlist
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 4 Equal Buttons or Active Section */}
          {activeSection === 'main' ? (
            <div className="grid grid-rows-4 gap-4 h-full">
              {/* Arena */}
              <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                
                <h3 className="text-3xl uppercase tracking-[0.3em]" style={{ 
                  fontFamily: 'serif',
                  textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
                  background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Arena</h3>
              </div>

              {/* Dange */}
              <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                
                <h3 className="text-3xl uppercase tracking-[0.3em]" style={{ 
                  fontFamily: 'serif',
                  textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
                  background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Dange</h3>
              </div>

              {/* Inventory */}
              <div 
                onClick={() => setActiveSection('inventory')}
                className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
              >
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                
                <h3 className="text-3xl uppercase tracking-[0.3em]" style={{ 
                  fontFamily: 'serif',
                  textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
                  background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Inventory</h3>
              </div>

              {/* Forge */}
              <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
                
                <h3 className="text-3xl uppercase tracking-[0.3em]" style={{ 
                  fontFamily: 'serif',
                  textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
                  background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Forge</h3>
              </div>
            </div>
          ) : activeSection === 'inventory' ? (
            <InventorySection 
              onNavigateToForge={() => setShowForge(true)}
              showForge={showForge}
              onNavigateToInventory={() => setShowForge(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}