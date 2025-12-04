import { Link } from 'react-router-dom';

interface NavigationButtonsProps {
  onInventoryClick: () => void;
  onForgeClick: () => void;
}

export function NavigationButtons({ onInventoryClick, onForgeClick }: NavigationButtonsProps) {
  const buttonStyle = {
    fontFamily: 'serif',
    textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
    background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  return (
    <div className="grid grid-rows-4 gap-4 h-full">
      {/* Arena */}
      <Link
        to="/pvp"
        className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

        <h3 className="text-3xl uppercase tracking-[0.3em]" style={buttonStyle}>Arena</h3>
      </Link>

      {/* Dungeon */}
      <Link
        to="/dungeon"
        className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

        <h3 className="text-3xl uppercase tracking-[0.3em]" style={buttonStyle}>Dungeon</h3>
      </Link>

      {/* Inventory - встроенный компонент */}
      <div
        onClick={onInventoryClick}
        className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

        <h3 className="text-3xl uppercase tracking-[0.3em]" style={buttonStyle}>Inventory</h3>
      </div>

      {/* Forge - встроенный компонент */}
      <div
        onClick={onForgeClick}
        className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

        <h3 className="text-3xl uppercase tracking-[0.3em]" style={buttonStyle}>Forge</h3>
      </div>
    </div>
  );
}
