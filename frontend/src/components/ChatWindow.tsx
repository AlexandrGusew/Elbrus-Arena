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
    searchOnlinePlayers,
    sendInvitation,
    respondToInvitation,
    getInvitations,
    getUserChats,
    joinRoom,
    createPartyChat,
    addPartyMember,
    removePartyMember,
    openTab,
  } = useChat(characterId);

  const [messageInput, setMessageInput] = useState('');
  const [showInvitations, setShowInvitations] = useState(false);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [showPartyMembers, setShowPartyMembers] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматически присоединяемся к глобальному чату при открытии
  useEffect(() => {
    if (isOpen && characterId && chatState.isConnected && !chatState.globalRoomId) {
      joinGlobalChat();
      getUserChats();
      getInvitations();
    }
  }, [isOpen, characterId, chatState.isConnected, chatState.globalRoomId, joinGlobalChat, getUserChats, getInvitations]);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Поиск игроков при изменении запроса (приватный чат)
  useEffect(() => {
    if (playerSearchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        searchOnlinePlayers(playerSearchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [playerSearchQuery, searchOnlinePlayers]);

  // Поиск игроков для добавления в группу
  useEffect(() => {
    if (partySearchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        searchOnlinePlayers(partySearchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [partySearchQuery, searchOnlinePlayers]);

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

  const renderMessages = () => (
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
      {chatState.messages
        .filter((msg) => msg.roomId === chatState.activeTabId)
        .map((msg: ChatMessage) => (
          <div
            key={msg.id}
            style={{
              background:
                msg.senderId === characterId
                  ? 'rgba(76, 175, 80, 0.2)'
                  : 'rgba(0, 0, 0, 0.3)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
              }}
            >
              <span
                style={{
                  color: '#ffd700',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
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
        ))}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderInvitationsPanel = () => (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        width: '300px',
        maxHeight: '400px',
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
          Приглашения
        </h4>
        <button
          onClick={() => setShowInvitations(false)}
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
        {chatState.invitations.filter((inv) => inv.status === 'pending').length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '20px' }}>
            Нет приглашений
          </div>
        ) : (
          chatState.invitations
            .filter((inv) => inv.status === 'pending')
            .map((invitation) => (
              <div
                key={invitation.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ffd700',
                }}
              >
                <div style={{ color: '#fff', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                    {invitation.senderId === characterId
                      ? invitation.receiverName
                      : invitation.senderName}
                  </span>
                  {invitation.senderId === characterId ? (
                    <span> (отправлено)</span>
                  ) : (
                    <span> приглашает в чат</span>
                  )}
                </div>
                {invitation.receiverId === characterId && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => respondToInvitation(invitation.id, true)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: '#4CAF50',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Принять
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, false)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: '#f44336',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );

  const renderPlayerSearchPanel = () => (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        width: '300px',
        maxHeight: '400px',
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
          Поиск игроков
        </h4>
        <button
          onClick={() => setShowPlayerSearch(false)}
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
      <div style={{ padding: '10px' }}>
        <input
          type="text"
          value={playerSearchQuery}
          onChange={(e) => setPlayerSearchQuery(e.target.value)}
          placeholder="Введите имя игрока..."
          style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid #ffd700',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
        {chatState.onlinePlayers.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '20px', fontSize: '13px' }}>
            {playerSearchQuery.length >= 2 ? 'Игроки не найдены' : 'Введите имя для поиска'}
          </div>
        ) : (
          chatState.onlinePlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => {
                sendInvitation(player.id);
                setShowPlayerSearch(false);
                setPlayerSearchQuery('');
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '10px',
                marginBottom: '6px',
                borderRadius: '6px',
                border: '1px solid #ffd700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(33, 150, 243, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px' }}>
                {player.name}
              </div>
              <div style={{ color: '#4CAF50', fontSize: '11px', marginTop: '2px' }}>
                🟢 Онлайн
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleCreateParty = () => {
    if (partyName.trim()) {
      const partyId = `party-${Date.now()}`; // Генерируем уникальный ID группы
      createPartyChat(partyId, partyName.trim());
      setPartyName('');
      setShowCreateParty(false);
    }
  };

  const renderCreatePartyPanel = () => (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        width: '300px',
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
          Создать группу
        </h4>
        <button
          onClick={() => setShowCreateParty(false)}
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
      <div style={{ padding: '15px' }}>
        <label style={{ color: '#ffd700', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Название группы:
        </label>
        <input
          type="text"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateParty()}
          placeholder="Введите название..."
          maxLength={30}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid #ffd700',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px',
            boxSizing: 'border-box',
            marginBottom: '15px',
          }}
        />
        <button
          onClick={handleCreateParty}
          disabled={!partyName.trim()}
          style={{
            width: '100%',
            padding: '10px',
            background: partyName.trim() ? '#9C27B0' : '#666',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: partyName.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Создать
        </button>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa', lineHeight: '1.5' }}>
          Групповой чат позволяет общаться с несколькими игроками одновременно.
          После создания вы сможете пригласить участников.
        </div>
      </div>
    </div>
  );

  const renderPartyMembersPanel = () => {
    const activeRoom = getActiveRoom();
    if (!activeRoom || activeRoom.type !== 'PARTY') return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '10px',
          width: '350px',
          maxHeight: '500px',
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
            Участники группы
          </h4>
          <button
            onClick={() => setShowPartyMembers(false)}
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

        {/* Текущие участники */}
        <div style={{ padding: '10px', borderBottom: '1px solid rgba(255, 215, 0, 0.3)' }}>
          <div style={{ color: '#ffd700', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
            Текущие участники ({activeRoom.participants.length}):
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {activeRoom.participants.map((participant) => (
              <div
                key={participant.characterId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                }}
              >
                <span style={{ color: '#fff', fontSize: '13px' }}>
                  {participant.characterName}
                  {participant.characterId === characterId && ' (вы)'}
                </span>
                {participant.characterId !== characterId && (
                  <button
                    onClick={() => {
                      if (confirm(`Удалить ${participant.characterName} из группы?`)) {
                        removePartyMember(activeRoom.id, participant.characterId);
                      }
                    }}
                    style={{
                      padding: '2px 8px',
                      background: '#f44336',
                      border: 'none',
                      borderRadius: '3px',
                      color: '#fff',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Добавить нового участника */}
        <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#ffd700', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
            Добавить участника:
          </div>
          <input
            type="text"
            value={partySearchQuery}
            onChange={(e) => setPartySearchQuery(e.target.value)}
            placeholder="Введите имя игрока..."
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid #ffd700',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              boxSizing: 'border-box',
              marginBottom: '8px',
            }}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {partySearchQuery.length < 2 ? (
              <div style={{ textAlign: 'center', color: '#aaa', marginTop: '15px', fontSize: '12px' }}>
                Введите имя для поиска
              </div>
            ) : chatState.onlinePlayers.filter(
              (player) => !activeRoom.participants.some((p) => p.characterId === player.id)
            ).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#aaa', marginTop: '15px', fontSize: '12px' }}>
                Игроки не найдены
              </div>
            ) : (
              chatState.onlinePlayers
                .filter((player) => !activeRoom.participants.some((p) => p.characterId === player.id))
                .map((player) => (
                  <div
                    key={player.id}
                    onClick={() => {
                      addPartyMember(activeRoom.id, player.id);
                      setPartySearchQuery('');
                    }}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      padding: '8px',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      border: '1px solid #9C27B0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(156, 39, 176, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    }}
                  >
                    <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '13px' }}>
                      {player.name}
                    </div>
                    <div style={{ color: '#4CAF50', fontSize: '11px', marginTop: '2px' }}>
                      🟢 Онлайн
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const activeRoom = getActiveRoom();
  const pendingInvitationsCount = chatState.invitations.filter(
    (inv) => inv.status === 'pending' && inv.receiverId === characterId
  ).length;

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
                setShowCreateParty(!showCreateParty);
                setShowInvitations(false);
                setShowPlayerSearch(false);
                setShowPartyMembers(false);
              }}
              style={{
                padding: '8px 15px',
                background: '#9C27B0',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Создать группу
            </button>
            {activeRoom && activeRoom.type === 'PARTY' && (
              <button
                onClick={() => {
                  setShowPartyMembers(!showPartyMembers);
                  setShowInvitations(false);
                  setShowPlayerSearch(false);
                  setShowCreateParty(false);
                }}
                style={{
                  padding: '8px 15px',
                  background: '#9C27B0',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Участники ({activeRoom.participants.length})
              </button>
            )}
            <button
              onClick={() => {
                setShowPlayerSearch(!showPlayerSearch);
                setShowInvitations(false);
                setShowCreateParty(false);
                setShowPartyMembers(false);
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
              Найти игрока
            </button>
            <button
              onClick={() => {
                setShowInvitations(!showInvitations);
                setShowPlayerSearch(false);
                setShowCreateParty(false);
                setShowPartyMembers(false);
                getInvitations();
              }}
              style={{
                padding: '8px 15px',
                background: '#9C27B0',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                position: 'relative',
              }}
            >
              Приглашения
              {pendingInvitationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#f44336',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  {pendingInvitationsCount}
                </span>
              )}
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
        {showInvitations && renderInvitationsPanel()}
        {showPlayerSearch && renderPlayerSearchPanel()}
        {showCreateParty && renderCreatePartyPanel()}
        {showPartyMembers && renderPartyMembersPanel()}

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
      </div>
    </div>
  );
};
