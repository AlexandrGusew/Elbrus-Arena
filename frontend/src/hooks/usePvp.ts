import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Zone, RoundActions } from '../../../shared/types/battle.types';

export interface PvpState {
  status: 'idle' | 'searching' | 'match_found' | 'in_battle' | 'finished';
  queuePosition?: number;
  matchId?: string;
  opponentCharacterId?: number;
  yourHp: number;
  opponentHp: number;
  maxHp: number;
  roundNumber: number;
  winner?: number;
  youWon?: boolean;
  lastRoundResult?: {
    roundNumber: number;
    player1: {
      hp: number;
      maxHp: number;
      damage: number;
      actions: { attacks: Zone[]; defenses: Zone[] };
    };
    player2: {
      hp: number;
      maxHp: number;
      damage: number;
      actions: { attacks: Zone[]; defenses: Zone[] };
    };
  };
}

export function usePvp(characterId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pvpState, setPvpState] = useState<PvpState>({
    status: 'idle',
    yourHp: 0,
    opponentHp: 0,
    maxHp: 0,
    roundNumber: 1,
  });

  // Подключение к WebSocket
  useEffect(() => {
    if (!characterId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

    // Подключаемся к pvp namespace
    const newSocket = io(`${wsUrl}/pvp`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('PvP connected');
    });

    // Событие: поставлен в очередь
    newSocket.on('queue_status', (data: { status: string; position: number }) => {
      setPvpState((prev) => ({
        ...prev,
        status: 'searching',
        queuePosition: data.position,
      }));
    });

    // Событие: матч найден
    newSocket.on('match_found', (data: {
      matchId: string;
      opponent: { characterId: number };
      yourHp: number;
      opponentHp: number;
    }) => {
      setPvpState({
        status: 'match_found',
        matchId: data.matchId,
        opponentCharacterId: data.opponent.characterId,
        yourHp: data.yourHp,
        opponentHp: data.opponentHp,
        maxHp: data.yourHp,
        roundNumber: 1,
      });

      // Автоматически переходим к бою через секунду
      setTimeout(() => {
        setPvpState((prev) => ({ ...prev, status: 'in_battle' }));
      }, 1000);
    });

    // Событие: результат раунда
    newSocket.on('round_result', (data: {
      roundNumber: number;
      yourHp: number;
      opponentHp: number;
      matchFinished?: boolean;
      winner?: number;
      youWon?: boolean;
      player1: any;
      player2: any;
    }) => {
      setPvpState((prev) => ({
        ...prev,
        yourHp: data.yourHp,
        opponentHp: data.opponentHp,
        roundNumber: data.roundNumber + 1,
        status: data.matchFinished ? 'finished' : 'in_battle',
        winner: data.winner,
        youWon: data.youWon,
        lastRoundResult: {
          roundNumber: data.roundNumber,
          player1: data.player1,
          player2: data.player2,
        },
      }));
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('PvP error:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('PvP disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [characterId]);

  // Присоединиться к очереди
  const joinQueue = useCallback(() => {
    if (!socket || !characterId) {
      console.log('joinQueue: socket or characterId missing', { socket: !!socket, characterId });
      return;
    }

    console.log('Sending join_queue event', { characterId });
    socket.emit('join_queue', { characterId });
    setPvpState((prev) => ({ ...prev, status: 'searching' }));
  }, [socket, characterId]);

  // Покинуть очередь
  const leaveQueue = useCallback(() => {
    if (!socket || !characterId) return;

    console.log('Sending leave_queue event', { characterId });
    socket.emit('leave_queue', { characterId });
    setPvpState({
      status: 'idle',
      yourHp: 0,
      opponentHp: 0,
      maxHp: 0,
      roundNumber: 1,
    });
  }, [socket, characterId]);

  // Отправить действия раунда
  const submitActions = useCallback((actions: RoundActions) => {
    if (!socket || !characterId) {
      console.log('submitActions: socket or characterId missing', { socket: !!socket, characterId });
      return;
    }

    console.log('Sending submit_actions event', { characterId, actions });
    socket.emit('submit_actions', {
      characterId,
      actions,
    });
  }, [socket, characterId]);

  return {
    pvpState,
    joinQueue,
    leaveQueue,
    submitActions,
    isConnected: socket?.connected || false,
  };
}
