export function ForgeSection() {
  // Mock history data
  const upgradeHistory = [
    'успешное улучшение предмет меч+4 заменен на меч+5',
    'успешное улучшение предмет меч+5 заменен на меч+6',
    'неудача, улучшение не удалось предмет меч+6 сгорел'
  ];

  return (
    <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-6 relative h-full flex flex-col">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

      <div className="flex flex-col gap-4 h-full">
        {/* Top Row - Name Item and Update Scroll */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2 flex items-center justify-center">
            <span className="text-amber-200 uppercase tracking-wider text-sm" style={{ fontFamily: 'serif' }}>
              name item
            </span>
          </div>
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2 flex items-center justify-center">
            <span className="text-amber-200 uppercase tracking-wider text-sm" style={{ fontFamily: 'serif' }}>
              update scroll
            </span>
          </div>
        </div>

        {/* Middle Row - Item Slots */}
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all cursor-pointer flex items-center justify-center">
            <span className="text-amber-300/40 text-xs" style={{ fontFamily: 'serif' }}>Item Slot</span>
          </div>
          <div className="aspect-square border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all cursor-pointer flex items-center justify-center">
            <span className="text-amber-300/40 text-xs" style={{ fontFamily: 'serif' }}>Scroll Slot</span>
          </div>
        </div>

        {/* Upgrade Button */}
        <button className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 py-4 relative hover:border-red-700/70 transition-all group">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          
          <span className="text-3xl uppercase tracking-[0.3em]" style={{ 
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Upgrade</span>
        </button>

        {/* History Section */}
        <div className="flex-1 flex flex-col gap-2">
          {/* History Header */}
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2">
            <h3 className="text-amber-200 uppercase tracking-wider text-center text-xs" style={{ fontFamily: 'serif' }}>
              History of Improvement
            </h3>
          </div>

          {/* History List */}
          <div className="flex-1 border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 p-3 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {upgradeHistory.map((entry, index) => (
                <div key={index} className="text-amber-200/80 text-xs" style={{ fontFamily: 'serif' }}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
