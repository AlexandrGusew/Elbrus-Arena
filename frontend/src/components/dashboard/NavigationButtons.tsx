import { Link } from 'react-router-dom';
import { dashboardColors, dashboardFonts, cornerOrnaments, cardStyle } from '../../styles/dashboard.styles';

// Импорт изображений кнопок из асетов
import arenaImg from '../../assets/button-for-page/arena.png';
import dungImg from '../../assets/button-for-page/dung.png';
import inventoryImg from '../../assets/button-for-page/inventory.png';
import forgeImg from '../../assets/button-for-page/forge.png';

interface NavigationButtonsProps {
  onInventoryClick: () => void;
  onForgeClick: () => void;
}

export function NavigationButtons({ onInventoryClick, onForgeClick }: NavigationButtonsProps) {

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Arena */}
      <Link
        to="/pvp"
        className="flex items-center justify-center relative transition-all cursor-pointer group overflow-hidden"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderRed}`,
          padding: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRed;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img 
          src={arenaImg} 
          alt="Arena" 
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Dungeon */}
      <Link
        to="/dungeon"
        className="flex items-center justify-center relative transition-all cursor-pointer group overflow-hidden"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderRed}`,
          padding: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRed;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img 
          src={dungImg} 
          alt="Dungeon" 
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Inventory - встроенный компонент */}
      <div
        onClick={onInventoryClick}
        className="flex items-center justify-center relative transition-all cursor-pointer group overflow-hidden"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderRed}`,
          padding: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRed;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img 
          src={inventoryImg} 
          alt="Inventory" 
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Forge - встроенный компонент */}
      <div
        onClick={onForgeClick}
        className="flex items-center justify-center relative transition-all cursor-pointer group overflow-hidden"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderRed}`,
          padding: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderRed;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img 
          src={forgeImg} 
          alt="Forge" 
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
}
