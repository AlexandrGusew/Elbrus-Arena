import { useState, useEffect } from 'react';
import type { ChatRoom } from '../hooks/useChat';

interface ChatTabBarProps {
  rooms: ChatRoom[];
  activeTabId: string | null;
  globalRoomId: string | null;
  characterId: number;
  onTabClick: (roomId: string) => void;
  onTabClose: (roomId: string) => void;
}

export const ChatTabBar = ({
  rooms,
  activeTabId,
  globalRoomId,
  characterId,
  onTabClick,
  onTabClose,
}: ChatTabBarProps) => {
  const [blinkingTabs, setBlinkingTabs] = useState<Set<string>>(new Set());

  // Функция для получения названия вкладки
  const getTabName = (room: ChatRoom): string => {
    switch (room.type) {
      case 'GLOBAL':
        return 'Глобальный';
      case 'BATTLE':
        return 'Бой';
      case 'PARTY':
        return room.name || 'Группа';
      case 'PRIVATE':
        const otherParticipant = room.participants.find(
          (p) => p.characterId !== characterId
        );
        return otherParticipant?.characterName || 'Приватный';
      default:
        return 'Чат';
    }
  };

  // Функция для получения цвета вкладки
  const getTabColor = (room: ChatRoom): string => {
    switch (room.type) {
      case 'GLOBAL':
        return '#4CAF50';
      case 'BATTLE':
        return '#f44336';
      case 'PARTY':
        return '#9C27B0';
      case 'PRIVATE':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  // Эффект мигания для вкладок с непрочитанными сообщениями
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkingTabs((prev) => {
        const newSet = new Set(prev);
        rooms.forEach((room) => {
          if (room.unreadCount && room.unreadCount > 0 && room.id !== activeTabId) {
            if (newSet.has(room.id)) {
              newSet.delete(room.id);
            } else {
              newSet.add(room.id);
            }
          } else {
            newSet.delete(room.id);
          }
        });
        return newSet;
      });
    }, 500); // Мигание каждые 500мс

    return () => clearInterval(interval);
  }, [rooms, activeTabId]);

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '2px solid #ffd700',
        background: 'rgba(0, 0, 0, 0.5)',
        overflowX: 'auto',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {rooms.map((room) => {
        const isActive = room.id === activeTabId;
        const hasUnread = room.unreadCount && room.unreadCount > 0;
        const isBlinking = blinkingTabs.has(room.id);
        const isGlobal = room.id === globalRoomId;
        const tabColor = getTabColor(room);

        return (
          <div
            key={room.id}
            onClick={() => onTabClick(room.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: isActive
                ? `rgba(${parseInt(tabColor.slice(1, 3), 16)}, ${parseInt(tabColor.slice(3, 5), 16)}, ${parseInt(tabColor.slice(5, 7), 16)}, 0.3)`
                : isBlinking
                ? `rgba(${parseInt(tabColor.slice(1, 3), 16)}, ${parseInt(tabColor.slice(3, 5), 16)}, ${parseInt(tabColor.slice(5, 7), 16)}, 0.5)`
                : 'transparent',
              borderBottom: isActive ? `3px solid ${tabColor}` : 'none',
              color: isActive ? tabColor : '#aaa',
              fontWeight: isActive ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              borderRight: '1px solid rgba(255, 215, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = `rgba(${parseInt(tabColor.slice(1, 3), 16)}, ${parseInt(tabColor.slice(3, 5), 16)}, ${parseInt(tabColor.slice(5, 7), 16)}, 0.2)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isBlinking) {
                e.currentTarget.style.background = 'transparent';
              } else if (!isActive && isBlinking) {
                e.currentTarget.style.background = `rgba(${parseInt(tabColor.slice(1, 3), 16)}, ${parseInt(tabColor.slice(3, 5), 16)}, ${parseInt(tabColor.slice(5, 7), 16)}, 0.5)`;
              }
            }}
          >
            <span>{getTabName(room)}</span>

            {/* Бейдж с количеством непрочитанных */}
            {hasUnread && (
              <span
                style={{
                  background: '#f44336',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '0 5px',
                }}
              >
                {room.unreadCount}
              </span>
            )}

            {/* Кнопка закрытия (не для глобального чата) */}
            {!isGlobal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(room.id);
                }}
                style={{
                  background: 'rgba(244, 67, 54, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f44336';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 67, 54, 0.8)';
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
