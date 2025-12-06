import { Link } from 'react-router-dom';
import { dashboardColors, dashboardFonts, cornerOrnaments, cardStyle } from '../../styles/dashboard.styles';
import { getAssetUrl } from '../../utils/assetUrl';

interface NavigationButtonsProps {
  onInventoryClick: () => void;
  onForgeClick: () => void;
}

export function NavigationButtons({ onInventoryClick, onForgeClick }: NavigationButtonsProps) {

  return (
    <div className="flex flex-col gap-3 h-full items-center" style={{ width: '100%', height: '100%', overflow: 'hidden', padding: '0 4px' }}>
      {/* Arena */}
      <Link
        to="/pvp"
        className="flex items-center justify-center relative transition-all cursor-pointer group"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderGold}`,
          padding: '10px',
          overflow: 'visible',
          // чуть уменьшаем ширину, чтобы рамки были видны со всех сторон
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderBronze;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderGold;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img
          src={getAssetUrl('button-for-page/arena.png')}
          alt="Arena" 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </Link>

      {/* Dungeon */}
      <Link
        to="/dungeon"
        className="flex items-center justify-center relative transition-all cursor-pointer group"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderGold}`,
          padding: '10px',
          overflow: 'visible',
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderBronze;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderGold;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img
          src={getAssetUrl('button-for-page/dung.png')}
          alt="Dungeon" 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </Link>

      {/* Inventory - встроенный компонент */}
      <div
        onClick={onInventoryClick}
        className="flex items-center justify-center relative transition-all cursor-pointer group"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderGold}`,
          padding: '10px',
          overflow: 'visible',
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderBronze;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderGold;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img
          src={getAssetUrl('button-for-page/inventory.png')}
          alt="Inventory" 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* Forge - встроенный компонент */}
      <div
        onClick={onForgeClick}
        className="flex items-center justify-center relative transition-all cursor-pointer group"
        style={{ 
          minHeight: 0, 
          flex: '1 1 auto',
          ...cardStyle,
          border: `3px solid ${dashboardColors.borderGold}`,
          padding: '10px',
          overflow: 'visible',
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderBronze;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dashboardColors.borderGold;
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <img
          src={getAssetUrl('button-for-page/forge.png')}
          alt="Forge" 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </div>
  );
}
