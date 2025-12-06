import { useState } from 'react';

type TabType = 'ALL' | 'PRIVAT' | 'BANLIST' | 'FRINDLIST';

export const ChatStub = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const tabs: TabType[] = ['ALL', 'PRIVAT', 'BANLIST', 'FRINDLIST'];

  return (
    <div style={{
      border: '4px solid #2C2D33',
      borderRadius: '10px',
      background: '#1A1B21',
      height: '240px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
    }}>
      {/* Основная область */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '24px',
          color: 'rgba(230, 230, 230, 0.2)',
          fontFamily: 'serif',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          CHAT
        </span>
      </div>

      {/* Вкладки */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        padding: '12px',
        borderTop: '2px solid #2C2D33',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px',
              border: activeTab === tab ? '2px solid #B21E2C' : '2px solid #2C2D33',
              borderRadius: '6px',
              background: activeTab === tab ? 'rgba(178, 30, 44, 0.2)' : '#111215',
              color: activeTab === tab ? '#E6E6E6' : 'rgba(230, 230, 230, 0.5)',
              cursor: 'pointer',
              fontFamily: 'serif',
              fontSize: '12px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab ? 'inset 0 2px 4px rgba(0,0,0,0.6)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#1A1B21';
                e.currentTarget.style.color = 'rgba(230, 230, 230, 0.7)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#111215';
                e.currentTarget.style.color = 'rgba(230, 230, 230, 0.5)';
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

