interface InventorySectionProps {
  onNavigateToForge?: () => void;
  showForge?: boolean;
  onNavigateToInventory?: () => void;
}

export function InventorySection({ onNavigateToForge, showForge, onNavigateToInventory }: InventorySectionProps) {
  // Mock data for selected item
  const selectedItem = {
    name: 'Ancient Sword',
    type: 'SWORD',
    armor: 15,
    gold: 22
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onNavigateToInventory}
          className={`border-3 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 px-6 py-4 relative transition-all group flex items-center gap-2 ${
            !showForge ? 'border-red-700/60' : 'border-amber-700/60 hover:border-red-700/70'
          }`}
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          
          <span className="text-2xl" style={{ 
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>←</span>
          <span className="text-xl uppercase tracking-[0.2em]" style={{ 
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Inventory</span>
        </button>

        <button 
          onClick={onNavigateToForge}
          className={`border-3 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 px-8 py-4 relative transition-all group ${
            showForge ? 'border-red-700/60' : 'border-amber-700/60 hover:border-red-700/70'
          }`}
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          
          <span className="text-xl uppercase tracking-[0.2em]" style={{ 
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Forge</span>
        </button>
      </div>

      {/* Item Details Section - Compact */}
      <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-6 relative">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

        <div className="flex gap-6">
          {/* Image Item */}
          <div className="w-32 h-32 border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-300/40 text-xs uppercase tracking-wider text-center" style={{ fontFamily: 'serif' }}>
              Image<br/>Item
            </span>
          </div>

          {/* Item Info */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2.5">
              <span className="text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>
                Name Item
              </span>
            </div>
            <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2.5">
              <span className="text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>
                {selectedItem.type}
              </span>
            </div>
            <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2.5">
              <span className="text-amber-200 tracking-wider" style={{ fontFamily: 'monospace' }}>
                ARMOR.........................{selectedItem.armor}
              </span>
            </div>
            <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2.5">
              <span className="text-amber-200 tracking-wider" style={{ fontFamily: 'monospace' }}>
                GOLD...........................{selectedItem.gold}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid - Fixed height, cells pinned to bottom */}
      <div className="flex-1 border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-6 relative">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

        <div className="grid grid-cols-4 gap-4 h-full content-end">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index}
              className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all cursor-pointer flex items-center justify-center aspect-square"
            >
              <span className="text-amber-300/20 text-sm">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}