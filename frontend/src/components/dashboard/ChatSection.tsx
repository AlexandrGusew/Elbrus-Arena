import { useState } from 'react';
import { dashboardColors, dashboardFonts, dashboardEffects, cornerOrnaments, cardStyle } from '../../styles/dashboard.styles';

interface ChatSectionProps {
  characterId: number;
  characterName: string;
}

type ChatTab = 'all' | 'private' | 'banlist' | 'friendlist';

export function ChatSection({ characterId, characterName }: ChatSectionProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>('all');

  return (
    <div 
      style={{
        ...cardStyle,
        border: `3px solid ${dashboardColors.borderGold}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      <div style={cornerOrnaments.topLeft}></div>
      <div style={cornerOrnaments.topRight}></div>
      <div style={cornerOrnaments.bottomLeft}></div>
      <div style={cornerOrnaments.bottomRight}></div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
      }}>
        <h3 style={{
          fontSize: '36px',
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: dashboardColors.textGold,
          opacity: 0.4,
          fontFamily: dashboardFonts.primary,
          textShadow: dashboardEffects.textShadow,
        }}>
          CHAT
        </h3>
      </div>

      {/* Chat Tabs - 4 equal buttons at the bottom */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        padding: '12px',
        borderTop: `1px solid ${dashboardColors.borderAmber}`,
      }}>
        {(['all', 'private', 'banlist', 'friendlist'] as ChatTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
              fontFamily: dashboardFonts.primary,
              border: activeTab === tab 
                ? `2px solid ${dashboardColors.borderGold}` 
                : `1px solid ${dashboardColors.borderAmber}`,
              background: activeTab === tab
                ? 'linear-gradient(to bottom, rgba(139, 0, 0, 0.6) 0%, rgba(139, 0, 0, 0.9) 100%)'
                : dashboardColors.backgroundMedium,
              color: activeTab === tab 
                ? dashboardColors.textGold 
                : dashboardColors.textMuted,
              boxShadow: activeTab === tab ? 'inset 0 2px 4px rgba(0, 0, 0, 0.5)' : 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.color = dashboardColors.textGold;
                e.currentTarget.style.borderColor = dashboardColors.borderGold;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.color = dashboardColors.textMuted;
                e.currentTarget.style.borderColor = dashboardColors.borderAmber;
              }
            }}
          >
            {tab === 'all' ? 'All' : tab === 'private' ? 'Private' : tab === 'banlist' ? 'Banlist' : 'Friendlist'}
          </button>
        ))}
      </div>
    </div>
  );
}
