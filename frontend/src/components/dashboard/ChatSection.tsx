import { useState } from 'react';

interface ChatSectionProps {
  characterId: number;
  characterName: string;
}

type ChatTab = 'all' | 'private' | 'banlist' | 'friendlist';

export function ChatSection({ characterId, characterName }: ChatSectionProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>('all');

  return (
    <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex flex-col relative h-full">
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
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
            activeTab === 'all'
              ? 'border-2 border-red-700/60 bg-gradient-to-b from-red-950/60 to-red-900/60 text-amber-200 shadow-inner'
              : 'border border-amber-800/40 bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={`px-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
            activeTab === 'private'
              ? 'border-2 border-red-700/60 bg-gradient-to-b from-red-950/60 to-red-900/60 text-amber-200 shadow-inner'
              : 'border border-amber-800/40 bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60'
          }`}
        >
          Private
        </button>
        <button
          onClick={() => setActiveTab('banlist')}
          className={`px-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
            activeTab === 'banlist'
              ? 'border-2 border-red-700/60 bg-gradient-to-b from-red-950/60 to-red-900/60 text-amber-200 shadow-inner'
              : 'border border-amber-800/40 bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60'
          }`}
        >
          Banlist
        </button>
        <button
          onClick={() => setActiveTab('friendlist')}
          className={`px-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
            activeTab === 'friendlist'
              ? 'border-2 border-red-700/60 bg-gradient-to-b from-red-950/60 to-red-900/60 text-amber-200 shadow-inner'
              : 'border border-amber-800/40 bg-stone-950/40 text-amber-300/60 hover:text-amber-200 hover:border-amber-700/60'
          }`}
        >
          Friendlist
        </button>
      </div>
    </div>
  );
}
