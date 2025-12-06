import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatTabBar } from './ChatTabBar';
import type { ChatMessage, ChatRoom } from '../hooks/useChat';

interface ChatWindowProps {
  characterId: number;
  characterName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow = ({ characterId, characterName, isOpen, onClose }: ChatWindowProps) => {
  const {
    chatState,
    joinGlobalChat,
    sendMessage,
    switchTab,
    closeTab,
    getUserChats,
    joinRoom,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getFriends,
    addFriend,
    removeFriend,
    sendPrivateMessageToUser,
    updateOnlineStatus,
  } = useChat(characterId);

  const [messageInput, setMessageInput] = useState('');
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    userId: number;
    userName: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Обновляем онлайн-статус персонажа при открытии/закрытии чата
  useEffect(() => {
    if (!characterId) return;

    if (isOpen) {
      updateOnlineStatus(true);
      return () => {
        updateOnlineStatus(false);
      };
    } else {
      updateOnlineStatus(false);
    }
  }, [isOpen, characterId, updateOnlineStatus]);

  // Автоматически присоединяемся к глобальному чату при открытии
  useEffect(() => {
    if (isOpen && characterId && chatState.isConnected && !chatState.globalRoomId) {
      joinGlobalChat();
      getUserChats();
      getFriends();
      getBlockedUsers();
    }
  }, [
    isOpen,
    characterId,
    chatState.isConnected,
    chatState.globalRoomId,
    joinGlobalChat,
    getUserChats,
    getFriends,
    getBlockedUsers,
  ]);

  // Периодически обновляем список чатов для получения новых приватных чатов
  useEffect(() => {
    if (!isOpen || !characterId || !chatState.isConnected) return;

    const interval = setInterval(() => {
      getUserChats();
    }, 5000); // Каждые 5 секунд

    return () => clearInterval(interval);
  }, [isOpen, characterId, chatState.isConnected, getUserChats]);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (messageInput.trim() && chatState.activeTabId) {
      sendMessage(messageInput, chatState.activeTabId);
      setMessageInput('');
    }
  };

  const handleTabClick = (roomId: string) => {
    switchTab(roomId);
    // Подгрузить сообщения для этой комнаты, если еще не подгружены
    joinRoom(roomId);
  };

  const handleTabClose = (roomId: string) => {
    closeTab(roomId);
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getActiveRoom = (): ChatRoom | undefined => {
    return chatState.rooms.find((room) => room.id === chatState.activeTabId);
  };

  const openContextMenuForUser = (
    event: React.MouseEvent,
    userId: number,
    userName: string,
  ) => {
    if (!activeRoom || activeRoom.type !== 'GLOBAL') return;
    if (userId === characterId) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      userId,
      userName,
    });
  };

  const promptPrivateMessage = (targetId: number, targetName: string) => {
    const message = prompt(`Сообщение для ${targetName}:`);
    if (message && message.trim()) {
      sendPrivateMessageToUser(targetId, message.trim());
    }
  };

  const activeRoom = getActiveRoom();

  const renderFriendsPanel = () => (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        width: '320px',
        maxHeight: '450px',
        background: 'rgba(20, 20, 20, 0.98)',
        borderRadius: '8px',
        border: '2px solid #ffd700',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: '2px solid #ffd700',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: 0, color: '#ffd700', fontSize: '16px' }}>
          Мои друзья
        </h4>
        <button
          onClick={() => setShowFriends(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f44336',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {chatState.friends.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '20px', fontSize: '13px' }}>
            Список друзей пуст
          </div>
        ) : (
          chatState.friends.map((friend) => (
            <div
              key={friend.id}
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '10px',
                marginBottom: '6px',
                borderRadius: '6px',
                border: '1px solid #4CAF50',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                onClick={() => {
                  promptPrivateMessage(friend.id, friend.name);
                  setShowFriends(false);
                }}
              >
                {friend.name}
              </div>
              <button
                onClick={() => {
                  if (confirm(`Удалить ${friend.name} из друзей?`)) {
                    removeFriend(friend.id);
                  }
                }}
                style={{
                  padding: '4px 10px',
                  background: '#f44336',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Удалить
              </button>
            </div>
          ))
        )}
      </div>
      <div
        style={{
          padding: '10px',
          borderTop: '1px solid rgba(255, 215, 0, 0.3)',
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ color: '#aaa', fontSize: '11px', lineHeight: '1.4' }}>
          Нажмите на имя друга, чтобы отправить приватное сообщение, видимое только ему.
        </div>
      </div>
    </div>
  );

  const renderMessages = () => {
    const visibleMessages = chatState.messages
      .filter((msg) => msg.roomId === chatState.activeTabId)
      .filter(
        (msg) =>
          msg.senderId === characterId ||
          !chatState.blockedUsers.includes(msg.senderId),
      );

    return (
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {visibleMessages.map((msg: ChatMessage) => {
          const isOwnMessage = msg.senderId === characterId;

          return (
            <div
              key={msg.id}
              style={{
                background: isOwnMessage
                  ? 'rgba(76, 175, 80, 0.2)'
                  : 'rgba(0, 0, 0, 0.3)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '5px',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: '#ffd700',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor:
                      !isOwnMessage && activeRoom?.type === 'GLOBAL'
                        ? 'context-menu'
                        : 'default',
                  }}
                  onContextMenu={(event) =>
                    openContextMenuForUser(event, msg.senderId, msg.senderName)
                  }
                >
                  {msg.senderName}
                </span>
                <span
                  style={{
                    color: '#aaa',
                    fontSize: '12px',
                  }}
                >
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              <div
                style={{
                  color: '#fff',
                  fontSize: '14px',
                  wordWrap: 'break-word',
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const renderBlockedUsersPanel = () => (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        width: '320px',
        maxHeight: '450px',
        background: 'rgba(20, 20, 20, 0.98)',
        borderRadius: '8px',
        border: '2px solid #ffd700',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: '2px solid #ffd700',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: 0, color: '#ffd700', fontSize: '16px' }}>
          Заблокированные пользователи
        </h4>
        <button
          onClick={() => setShowBlockedUsers(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f44336',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {chatState.blockedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '20px', fontSize: '13px' }}>
            Нет заблокированных пользователей
          </div>
        ) : (
          chatState.blockedUsers.map((blockedId) => {
            // Найти имя заблокированного пользователя в комнатах
            const blockedUser = chatState.rooms
              .flatMap((room) => room.participants)
              .find((p) => p.characterId === blockedId);

            return (
              <div
                key={blockedId}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '10px',
                  marginBottom: '6px',
                  borderRadius: '6px',
                  border: '1px solid #f44336',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px' }}>
                    {blockedUser?.characterName || `ID: ${blockedId}`}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '11px', marginTop: '2px' }}>
                    Заблокирован
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Разблокировать пользователя?`)) {
                      unblockUser(blockedId);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#4CAF50',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Разблокировать
                </button>
              </div>
            );
          })
        )}
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255, 215, 0, 0.3)', background: 'rgba(0, 0, 0, 0.5)' }}>
        <div style={{ color: '#aaa', fontSize: '11px', lineHeight: '1.4' }}>
          Заблокированные пользователи не смогут отправлять вам сообщения в чатах, где вы находитесь.
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '800px',
          height: '700px',
          background: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '12px',
          border: '3px solid #ffd700',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Заголовок и кнопки */}
        <div
          style={{
            padding: '15px',
            borderBottom: '3px solid #ffd700',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, color: '#ffd700', fontSize: '24px' }}>Чат</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                const next = !showFriends;
                setShowFriends(next);
                setShowBlockedUsers(false);
                if (!showFriends) {
                  getFriends();
                }
              }}
              style={{
                padding: '8px 15px',
                background: '#2196F3',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Мои друзья
            </button>
            <button
              onClick={() => {
                const next = !showBlockedUsers;
                setShowBlockedUsers(next);
                setShowFriends(false);
                if (!showBlockedUsers) {
                  getBlockedUsers();
                }
              }}
              style={{
                padding: '8px 15px',
                background: '#FF5722',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Заблокированные
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 15px',
                background: '#f44336',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Закрыть
            </button>
          </div>
        </div>

        {/* Панели */}
        {showFriends && renderFriendsPanel()}
        {showBlockedUsers && renderBlockedUsersPanel()}

        {/* Вкладки */}
        <ChatTabBar
          rooms={chatState.rooms.filter((room) => chatState.openTabs.includes(room.id))}
          activeTabId={chatState.activeTabId}
          globalRoomId={chatState.globalRoomId}
          characterId={characterId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
        />

        {/* Контент активной вкладки */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeRoom && (
            <>
              <div
                style={{
                  padding: '12px 15px',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                  background: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px' }}>
                  {activeRoom.type === 'GLOBAL' && 'Глобальный чат'}
                  {activeRoom.type === 'BATTLE' && 'Чат боя'}
                  {activeRoom.type === 'PARTY' && (activeRoom.name || 'Групповой чат')}
                  {activeRoom.type === 'PRIVATE' &&
                    `Приватный чат с ${
                      activeRoom.participants.find((p) => p.characterId !== characterId)
                        ?.characterName || 'игроком'
                    }`}
                </div>
                <div style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>
                  {activeRoom.participants.length} участник(ов)
                </div>
              </div>
              {renderMessages()}
              <div
                style={{
                  padding: '15px',
                  borderTop: '2px solid #ffd700',
                  background: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Введите сообщение..."
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: '1px solid #ffd700',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      padding: '10px 20px',
                      background: '#4CAF50',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Статус подключения */}
        {!chatState.isConnected && (
          <div
            style={{
              padding: '10px',
              background: '#f44336',
              color: '#fff',
              textAlign: 'center',
              fontSize: '12px',
            }}
          >
            Подключение к чату...
          </div>
        )}

        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid #ffd700',
              borderRadius: '6px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 20000,
              minWidth: '190px',
            }}
          >
            <button
              onClick={() => {
                addFriend(contextMenu.userId);
                setContextMenu(null);
              }}
              disabled={chatState.friends.some((f) => f.id === contextMenu.userId)}
              style={{
                padding: '6px 10px',
                background: '#2196F3',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: chatState.friends.some((f) => f.id === contextMenu.userId)
                  ? 'not-allowed'
                  : 'pointer',
                opacity: chatState.friends.some((f) => f.id === contextMenu.userId) ? 0.6 : 1,
              }}
            >
              Добавить в друзья
            </button>
            <button
              onClick={() => {
                promptPrivateMessage(contextMenu.userId, contextMenu.userName);
                setContextMenu(null);
              }}
              style={{
                padding: '6px 10px',
                background: '#4CAF50',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Приватное сообщение
            </button>
            <button
              onClick={() => {
                if (confirm(`Заблокировать пользователя ${contextMenu.userName}?`)) {
                  blockUser(contextMenu.userId);
                }
                setContextMenu(null);
              }}
              style={{
                padding: '6px 10px',
                background: '#f44336',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Заблокировать
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
