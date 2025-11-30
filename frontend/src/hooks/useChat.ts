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
  type: 'GLOBAL' | 'PRIVATE' | 'BATTLE' | 'PARTY';
  name?: string; // Для командных чатов
  participants: Array<{
    characterId: number;
    characterName: string;
  }>;
  lastMessage?: ChatMessage;
  unreadCount?: number; // Количество непрочитанных сообщений
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

export interface OnlinePlayer {
  id: number;
  name: string;
}

export interface ChatState {
  isConnected: boolean;
  currentRoomId: string | null;
  currentRoomType: 'GLOBAL' | 'PRIVATE' | 'BATTLE' | 'PARTY' | null;
  messages: ChatMessage[];
  rooms: ChatRoom[];
  invitations: ChatInvitation[];
  globalRoomId: string | null;
  openTabs: string[]; // Массив ID открытых вкладок
  activeTabId: string | null; // ID активной вкладки
  blockedUsers: number[]; // Массив ID заблокированных пользователей
  onlinePlayers: OnlinePlayer[]; // Результат поиска онлайн игроков
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
    openTabs: [],
    activeTabId: null,
    blockedUsers: [],
    onlinePlayers: [],
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
        openTabs: [response.roomId], // Глобальный чат всегда первая вкладка
        activeTabId: response.roomId,
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

    // ========== НОВЫЕ СОБЫТИЯ ==========

    // Событие: создан командный чат
    newSocket.on('party_chat_created', (data: { roomId: string; partyId: string; name: string }) => {
      console.log('Party chat created:', data);
      // Добавить новую вкладку и переключиться на неё
      setChatState((prev) => ({
        ...prev,
        openTabs: [...prev.openTabs, data.roomId],
        activeTabId: data.roomId,
      }));
      // Присоединиться к комнате и получить список чатов
      newSocket.emit('join_room', { roomId: data.roomId, characterId });
      newSocket.emit('get_user_chats', { characterId });
    });

    // Событие: участник добавлен в командный чат
    newSocket.on('party_member_added', (data: { roomId: string; characterId: number }) => {
      console.log('Party member added:', data);
      // Обновить список чатов для получения обновленного списка участников
      newSocket.emit('get_user_chats', { characterId });
    });

    // Событие: участник удален из командного чата
    newSocket.on('party_member_removed', (data: { roomId: string; characterId: number }) => {
      console.log('Party member removed:', data);
      // Обновить список чатов для получения обновленного списка участников
      newSocket.emit('get_user_chats', { characterId });

      // Если удалили текущего пользователя, закрыть эту вкладку
      if (data.characterId === characterId) {
        setChatState((prev) => ({
          ...prev,
          openTabs: prev.openTabs.filter((id) => id !== data.roomId),
          activeTabId: prev.activeTabId === data.roomId ? prev.globalRoomId : prev.activeTabId,
        }));
      }
    });

    // Событие: пользователь заблокирован
    newSocket.on('user_blocked', (data: { blockedId: number }) => {
      setChatState((prev) => ({
        ...prev,
        blockedUsers: [...prev.blockedUsers, data.blockedId],
      }));
    });

    // Событие: пользователь разблокирован
    newSocket.on('user_unblocked', (data: { blockedId: number }) => {
      setChatState((prev) => ({
        ...prev,
        blockedUsers: prev.blockedUsers.filter((id) => id !== data.blockedId),
      }));
    });

    // Событие: список заблокированных пользователей
    newSocket.on('blocked_users_list', (blockedIds: number[]) => {
      setChatState((prev) => ({
        ...prev,
        blockedUsers: blockedIds,
      }));
    });

    // Событие: сообщения отмечены как прочитанные
    newSocket.on('marked_as_read', (data: { roomId: string }) => {
      setChatState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) =>
          room.id === data.roomId ? { ...room, unreadCount: 0 } : room
        ),
      }));
    });

    // Событие: количество непрочитанных
    newSocket.on('unread_count', (data: { roomId: string; count: number }) => {
      setChatState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) =>
          room.id === data.roomId ? { ...room, unreadCount: data.count } : room
        ),
      }));
    });

    // Событие: результаты поиска онлайн игроков
    newSocket.on('online_players_result', (players: OnlinePlayer[]) => {
      setChatState((prev) => ({
        ...prev,
        onlinePlayers: players,
      }));
    });

    // Событие: статус пользователя изменен
    newSocket.on('user_status_changed', (data: { characterId: number; isOnline: boolean }) => {
      console.log('User status changed:', data);
      // Можно обновить UI, показывая статус онлайн/офлайн
    });

    // Событие: создан чат боя
    newSocket.on('battle_chat_created', (data: { roomId: string; battleId: string }) => {
      console.log('Battle chat created:', data);
      setChatState((prev) => ({
        ...prev,
        openTabs: [...prev.openTabs, data.roomId],
      }));
      // Автоматически присоединиться к чату боя
      newSocket.emit('join_room', { roomId: data.roomId, characterId });
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

  // ========== НОВЫЕ МЕТОДЫ ==========

  // Создать командный чат
  const createPartyChat = useCallback((partyId: string, name: string) => {
    if (!socket || !characterId) return;
    socket.emit('create_party_chat', { partyId, name, creatorId: characterId });
  }, [socket, characterId]);

  // Добавить участника в командный чат
  const addPartyMember = useCallback((roomId: string, memberId: number) => {
    if (!socket) return;
    socket.emit('add_party_member', { roomId, characterId: memberId });
  }, [socket]);

  // Удалить участника из командного чата
  const removePartyMember = useCallback((roomId: string, memberId: number) => {
    if (!socket) return;
    socket.emit('remove_party_member', { roomId, characterId: memberId });
  }, [socket]);

  // Заблокировать пользователя
  const blockUser = useCallback((blockedId: number, reason?: string) => {
    if (!socket || !characterId) return;
    socket.emit('block_user', { blockerId: characterId, blockedId, reason });
  }, [socket, characterId]);

  // Разблокировать пользователя
  const unblockUser = useCallback((blockedId: number) => {
    if (!socket || !characterId) return;
    socket.emit('unblock_user', { blockerId: characterId, blockedId });
  }, [socket, characterId]);

  // Получить список заблокированных пользователей
  const getBlockedUsers = useCallback(() => {
    if (!socket || !characterId) return;
    socket.emit('get_blocked_users', { characterId });
  }, [socket, characterId]);

  // Отметить сообщения как прочитанные
  const markAsRead = useCallback((roomId: string) => {
    if (!socket || !characterId) return;
    socket.emit('mark_as_read', { roomId, characterId });
  }, [socket, characterId]);

  // Получить количество непрочитанных
  const getUnreadCount = useCallback((roomId: string) => {
    if (!socket || !characterId) return;
    socket.emit('get_unread_count', { roomId, characterId });
  }, [socket, characterId]);

  // Поиск онлайн игроков
  const searchOnlinePlayers = useCallback((query: string) => {
    if (!socket) return;
    socket.emit('search_online_players', { query });
  }, [socket]);

  // Обновить статус онлайн
  const updateOnlineStatus = useCallback((isOnline: boolean) => {
    if (!socket || !characterId) return;
    socket.emit('update_online_status', { characterId, isOnline });
  }, [socket, characterId]);

  // Открыть вкладку
  const openTab = useCallback((roomId: string) => {
    setChatState((prev) => ({
      ...prev,
      openTabs: prev.openTabs.includes(roomId) ? prev.openTabs : [...prev.openTabs, roomId],
      activeTabId: roomId,
    }));
  }, []);

  // Закрыть вкладку
  const closeTab = useCallback((roomId: string) => {
    setChatState((prev) => {
      const newOpenTabs = prev.openTabs.filter((id) => id !== roomId);
      const newActiveTabId = prev.activeTabId === roomId
        ? (newOpenTabs.length > 0 ? newOpenTabs[0] : prev.globalRoomId)
        : prev.activeTabId;

      return {
        ...prev,
        openTabs: newOpenTabs,
        activeTabId: newActiveTabId,
      };
    });
  }, []);

  // Переключить на вкладку
  const switchTab = useCallback((roomId: string) => {
    setChatState((prev) => ({
      ...prev,
      activeTabId: roomId,
      currentRoomId: roomId,
    }));
    // Отметить как прочитанное при переключении
    if (socket && characterId) {
      socket.emit('mark_as_read', { roomId, characterId });
    }
  }, [socket, characterId]);

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
    createPartyChat,
    addPartyMember,
    removePartyMember,
    blockUser,
    unblockUser,
    getBlockedUsers,
    markAsRead,
    getUnreadCount,
    searchOnlinePlayers,
    updateOnlineStatus,
    openTab,
    closeTab,
    switchTab,
    isConnected: socket?.connected || false,
  };
}
