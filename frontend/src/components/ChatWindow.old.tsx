import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import type { ChatMessage } from '../hooks/useChat';

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
    joinRoom,
    sendMessage,
    sendInvitation,
    respondToInvitation,
    getUserChats,
    getInvitations,
    returnToGlobalChat,
  } = useChat(characterId);

  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'private' | 'invitations'>('global');
  const [invitePlayerId, setInvitePlayerId] = useState('');
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

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleSendInvitation = () => {
    const playerId = parseInt(invitePlayerId);
    if (!isNaN(playerId)) {
      sendInvitation(playerId);
      setInvitePlayerId('');
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessages = () => (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {chatState.messages.map((msg: ChatMessage) => (
        <div
          key={msg.id}
          style={{
            background: msg.senderId === characterId
              ? 'rgba(76, 175, 80, 0.2)'
              : 'rgba(0, 0, 0, 0.3)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px',
          }}>
            <span style={{
              color: '#ffd700',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              {msg.senderName}
            </span>
            <span style={{
              color: '#aaa',
              fontSize: '12px',
            }}>
              {formatTime(msg.createdAt)}
            </span>
          </div>
          <div style={{
            color: '#fff',
            fontSize: '14px',
            wordWrap: 'break-word',
          }}>
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderGlobalChat = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '15px',
        borderBottom: '2px solid #ffd700',
        background: 'rgba(0, 0, 0, 0.5)',
      }}>
        <h3 style={{ margin: 0, color: '#ffd700', fontSize: '18px' }}>
          Глобальный чат
        </h3>
      </div>
      {renderMessages()}
      <div style={{
        padding: '15px',
        borderTop: '2px solid #ffd700',
        background: 'rgba(0, 0, 0, 0.5)',
      }}>
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
    </div>
  );

  const renderPrivateChats = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '15px',
        borderBottom: '2px solid #ffd700',
        background: 'rgba(0, 0, 0, 0.5)',
      }}>
        <h3 style={{ margin: 0, color: '#ffd700', fontSize: '18px', marginBottom: '10px' }}>
          Приватные чаты
        </h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input
            type="number"
            value={invitePlayerId}
            onChange={(e) => setInvitePlayerId(e.target.value)}
            placeholder="ID игрока"
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid #ffd700',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleSendInvitation}
            style={{
              padding: '8px 15px',
              background: '#2196F3',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Пригласить
          </button>
        </div>
      </div>

      {chatState.currentRoomType === 'PRIVATE' ? (
        <>
          <div style={{
            padding: '10px 15px',
            background: 'rgba(33, 150, 243, 0.2)',
            borderBottom: '1px solid #ffd700',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '14px' }}>
              Активный чат
            </span>
            <button
              onClick={returnToGlobalChat}
              style={{
                padding: '5px 10px',
                background: '#666',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Назад к списку
            </button>
          </div>
          {renderMessages()}
          <div style={{
            padding: '15px',
            borderTop: '2px solid #ffd700',
            background: 'rgba(0, 0, 0, 0.5)',
          }}>
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
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
        }}>
          {chatState.rooms.filter(room => room.type === 'PRIVATE').length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#aaa',
              marginTop: '50px',
            }}>
              Нет приватных чатов
            </div>
          ) : (
            chatState.rooms
              .filter(room => room.type === 'PRIVATE')
              .map((room) => (
                <div
                  key={room.id}
                  onClick={() => joinRoom(room.id)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '15px',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ffd700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(33, 150, 243, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <div style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: '5px' }}>
                    {room.participants
                      .filter(p => p.characterId !== characterId)
                      .map(p => p.characterName)
                      .join(', ')}
                  </div>
                  {room.lastMessage && (
                    <div style={{ color: '#aaa', fontSize: '12px' }}>
                      {room.lastMessage.senderName}: {room.lastMessage.content.substring(0, 30)}
                      {room.lastMessage.content.length > 30 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );

  const renderInvitations = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '15px',
        borderBottom: '2px solid #ffd700',
        background: 'rgba(0, 0, 0, 0.5)',
      }}>
        <h3 style={{ margin: 0, color: '#ffd700', fontSize: '18px' }}>
          Приглашения
        </h3>
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
      }}>
        {chatState.invitations.filter(inv => inv.status === 'pending').length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#aaa',
            marginTop: '50px',
          }}>
            Нет активных приглашений
          </div>
        ) : (
          chatState.invitations
            .filter(inv => inv.status === 'pending')
            .map((invitation) => (
              <div
                key={invitation.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ffd700',
                }}
              >
                <div style={{ color: '#fff', marginBottom: '10px' }}>
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                    {invitation.senderId === characterId ? invitation.receiverName : invitation.senderName}
                  </span>
                  {invitation.senderId === characterId ? (
                    <span> (отправлено вами)</span>
                  ) : (
                    <span> приглашает вас в приватный чат</span>
                  )}
                </div>
                {invitation.receiverId === characterId && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => respondToInvitation(invitation.id, true)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#4CAF50',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
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
                        padding: '8px',
                        background: '#f44336',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
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

  return (
    <div style={{
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
    }}>
      <div style={{
        width: '600px',
        height: '700px',
        background: 'rgba(20, 20, 20, 0.95)',
        borderRadius: '12px',
        border: '3px solid #ffd700',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Заголовок и кнопка закрытия */}
        <div style={{
          padding: '15px',
          borderBottom: '3px solid #ffd700',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, color: '#ffd700', fontSize: '24px' }}>Чат</h2>
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

        {/* Табы */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #ffd700',
          background: 'rgba(0, 0, 0, 0.5)',
        }}>
          <button
            onClick={() => {
              setActiveTab('global');
              returnToGlobalChat();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'global' ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'global' ? '3px solid #ffd700' : 'none',
              color: activeTab === 'global' ? '#ffd700' : '#aaa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Глобальный
          </button>
          <button
            onClick={() => {
              setActiveTab('private');
              getUserChats();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'private' ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'private' ? '3px solid #ffd700' : 'none',
              color: activeTab === 'private' ? '#ffd700' : '#aaa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Приватные
          </button>
          <button
            onClick={() => {
              setActiveTab('invitations');
              getInvitations();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'invitations' ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'invitations' ? '3px solid #ffd700' : 'none',
              color: activeTab === 'invitations' ? '#ffd700' : '#aaa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              position: 'relative',
            }}
          >
            Приглашения
            {chatState.invitations.filter(inv => inv.status === 'pending' && inv.receiverId === characterId).length > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: '#f44336',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#fff',
              }}>
                {chatState.invitations.filter(inv => inv.status === 'pending' && inv.receiverId === characterId).length}
              </span>
            )}
          </button>
        </div>

        {/* Контент */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'global' && renderGlobalChat()}
          {activeTab === 'private' && renderPrivateChats()}
          {activeTab === 'invitations' && renderInvitations()}
        </div>

        {/* Статус подключения */}
        {!chatState.isConnected && (
          <div style={{
            padding: '10px',
            background: '#f44336',
            color: '#fff',
            textAlign: 'center',
            fontSize: '12px',
          }}>
            Подключение к чату...
          </div>
        )}
      </div>
    </div>
  );
};
