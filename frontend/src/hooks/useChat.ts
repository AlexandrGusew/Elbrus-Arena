import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: number;
  roomId: string;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  type: 'GLOBAL' | 'PRIVATE' | 'BATTLE';
  participants: Array<{
    characterId: number;
    characterName: string;
  }>;
  lastMessage?: ChatMessage;
}

export interface ChatInvitation {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  status: string;
  createdAt: Date;
}

export interface ChatState {
  isConnected: boolean;
  currentRoomId: string | null;
  currentRoomType: 'GLOBAL' | 'PRIVATE' | 'BATTLE' | null;
  messages: ChatMessage[];
  rooms: ChatRoom[];
  invitations: ChatInvitation[];
  globalRoomId: string | null;
}

export function useChat(characterId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    isConnected: false,
    currentRoomId: null,
    currentRoomType: null,
    messages: [],
    rooms: [],
    invitations: [],
    globalRoomId: null,
  });

  // Подключение к WebSocket
  useEffect(() => {
    if (!characterId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || (
      import.meta.env.PROD
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3000'
    );

    if (import.meta.env.PROD && !import.meta.env.VITE_WS_URL) {
      console.warn('[useChat] VITE_WS_URL not set, using current host:', wsUrl);
    }

    // Подключаемся к chat namespace
    const newSocket = io(`${wsUrl}/chat`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Chat connected');
      setChatState((prev) => ({ ...prev, isConnected: true }));
    });

    newSocket.on('disconnect', () => {
      console.log('Chat disconnected');
      setChatState((prev) => ({ ...prev, isConnected: false }));
    });

    // Событие: получена история сообщений
    newSocket.on('messages', (data: { messages: ChatMessage[] }) => {
      setChatState((prev) => ({
        ...prev,
        messages: data.messages,
      }));
    });

    // Событие: новое сообщение
    newSocket.on('new_message', (message: ChatMessage) => {
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    // Событие: список чатов
    newSocket.on('user_chats', (rooms: ChatRoom[]) => {
      setChatState((prev) => ({
        ...prev,
        rooms: rooms,
      }));
    });

    // Событие: новое приглашение (получено от другого игрока)
    newSocket.on('chat_invitation_received', (invitation: ChatInvitation) => {
      setChatState((prev) => ({
        ...prev,
        invitations: [...prev.invitations, invitation],
      }));
    });

    // Событие: приглашение отправлено (подтверждение)
    newSocket.on('invitation_sent', (invitation: ChatInvitation) => {
      // Можно добавить уведомление об успешной отправке
      console.log('Invitation sent:', invitation);
    });

    // Событие: приглашение принято - создан новый чат
    newSocket.on('invitation_accepted', (room: ChatRoom) => {
      setChatState((prev) => ({
        ...prev,
        rooms: [...prev.rooms, room],
        invitations: prev.invitations.filter((inv) =>
          !(inv.senderId === room.participants[0]?.characterId &&
            inv.receiverId === room.participants[1]?.characterId)
        ),
      }));
    });

    // Событие: присоединился к глобальному чату
    newSocket.on('joined_global_chat', (response: { roomId: string; messages: ChatMessage[] }) => {
      setChatState((prev) => ({
        ...prev,
        currentRoomId: response.roomId,
        currentRoomType: 'GLOBAL',
        globalRoomId: response.roomId,
        messages: response.messages,
      }));
    });

    // Событие: присоединился к комнате
    newSocket.on('joined_room', (response: { roomId: string; messages: ChatMessage[] }) => {
      setChatState((prev) => {
        const room = prev.rooms.find((r) => r.id === response.roomId);
        return {
          ...prev,
          currentRoomId: response.roomId,
          currentRoomType: room?.type || 'PRIVATE',
          messages: response.messages,
        };
      });
    });

    // Событие: список приглашений (исправлено название события)
    newSocket.on('invitations_list', (invitations: ChatInvitation[]) => {
      setChatState((prev) => ({
        ...prev,
        invitations: invitations,
      }));
    });

    // Событие: ошибка
    newSocket.on('error', (error: { message: string } | string) => {
      const errorMessage = typeof error === 'string' ? error : error?.message || JSON.stringify(error);
      console.error('Chat error:', errorMessage);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [characterId]);

  // Присоединиться к глобальному чату
  const joinGlobalChat = useCallback(() => {
    if (!socket || !characterId) return;
    socket.emit('join_global_chat', { characterId });
  }, [socket, characterId]);

  // Присоединиться к комнате (приватный чат или чат боя)
  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !characterId) return;
    socket.emit('join_room', { roomId, characterId });
  }, [socket, characterId]);

  // Отправить сообщение
  const sendMessage = useCallback((content: string, roomId?: string) => {
    if (!socket || !characterId || !content.trim()) return;

    const targetRoomId = roomId || chatState.currentRoomId;
    if (!targetRoomId) return;

    socket.emit('send_message', { content, roomId: targetRoomId, characterId });
  }, [socket, characterId, chatState.currentRoomId]);

  // Отправить приглашение в приватный чат
  const sendInvitation = useCallback((receiverId: number) => {
    if (!socket || !characterId) return;

    socket.emit('invite_to_private_chat', { receiverId, senderId: characterId });
  }, [socket, characterId]);

  // Ответить на приглашение
  const respondToInvitation = useCallback((invitationId: number, accept: boolean) => {
    if (!socket || !characterId) return;

    socket.emit('respond_to_invitation', { invitationId, accept, characterId });
  }, [socket, characterId]);

  // Получить список чатов пользователя
  const getUserChats = useCallback(() => {
    if (!socket || !characterId) return;

    socket.emit('get_user_chats', { characterId });
  }, [socket, characterId]);

  // Получить приглашения
  const getInvitations = useCallback(() => {
    if (!socket || !characterId) return;

    socket.emit('get_invitations', { characterId });
  }, [socket, characterId]);

  // Вернуться к глобальному чату
  const returnToGlobalChat = useCallback(() => {
    if (chatState.globalRoomId && socket && characterId) {
      setChatState((prev) => ({
        ...prev,
        currentRoomId: chatState.globalRoomId,
        currentRoomType: 'GLOBAL',
      }));
      // Запросить историю глобального чата
      socket.emit('join_room', { roomId: chatState.globalRoomId, characterId });
    }
  }, [chatState.globalRoomId, socket, characterId]);

  return {
    chatState,
    joinGlobalChat,
    joinRoom,
    sendMessage,
    sendInvitation,
    respondToInvitation,
    getUserChats,
    getInvitations,
    returnToGlobalChat,
    isConnected: socket?.connected || false,
  };
}
