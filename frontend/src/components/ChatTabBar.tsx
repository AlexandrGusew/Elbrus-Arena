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

  // Цвет вкладки в зависимости от типа чата
  const getTabColor = (room: ChatRoom): string => {
    switch (room.type) {
      case 'GLOBAL':
        return '#4CAF50'; // Зеленый для глобального
      case 'BATTLE':
        return '#f44336'; // Красный для PvP
      case 'PARTY':
        return '#9C27B0'; // Фиолетовый для группового
      case 'PRIVATE':
        return '#2196F3'; // Синий для приватного
      default:
        return '#666';
    }
  };

  // Название вкладки
  const getTabLabel = (room: ChatRoom): string => {
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
        return otherParticipant?.characterName || 'Приват';
      default:
        return 'Чат';
    }
  };

  // Анимация мигания для непрочитанных
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkingTabs((prev) => {
        const newSet = new Set(prev);
        rooms.forEach((room) => {
          if (
            room.unreadCount &&
            room.unreadCount > 0 &&
            room.id !== activeTabId
          ) {
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
    }, 500);

    return () => clearInterval(interval);
  }, [rooms, activeTabId]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 10px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderBottom: '2px solid #ffd700',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onTabClick(room.id)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            paddingRight: room.id === globalRoomId ? '12px' : '32px',
            background:
              room.id === activeTabId
                ? getTabColor(room)
                : `${getTabColor(room)}40`,
            border: `2px solid ${getTabColor(room)}`,
            borderRadius: '6px',
            cursor: 'pointer',
            minWidth: '100px',
            transition: 'all 0.2s',
            opacity: blinkingTabs.has(room.id) ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (room.id !== activeTabId) {
              e.currentTarget.style.background = `${getTabColor(room)}80`;
            }
          }}
          onMouseLeave={(e) => {
            if (room.id !== activeTabId) {
              e.currentTarget.style.background = `${getTabColor(room)}40`;
            }
          }}
        >
          <span
            style={{
              color: '#fff',
              fontWeight: room.id === activeTabId ? 'bold' : 'normal',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            {getTabLabel(room)}
          </span>

          {room.unreadCount && room.unreadCount > 0 && room.id !== activeTabId && (
            <span
              style={{
                background: '#f44336',
                color: '#fff',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 'bold',
                minWidth: '18px',
                textAlign: 'center',
              }}
            >
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          )}

          {/* Кнопка закрытия (только не для глобального чата) */}
          {room.id !== globalRoomId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(room.id);
              }}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                padding: 0,
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f44336';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
