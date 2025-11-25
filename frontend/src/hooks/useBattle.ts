import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Zone, RoundActions, RoundResult, BattleState } from '../../../shared/types/battle.types';

// Экспортируем типы для использования в компонентах
export type { Zone, RoundActions, RoundResult, BattleState };

/**
 * Хук для работы с боевой системой через WebSocket
 */
export function useBattle(battleId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [battleState, setBattleState] = useState<BattleState>({
    roundNumber: 0,
    playerHp: 0,
    monsterHp: 0,
    status: 'waiting',
    currentMonster: 1,
    totalMonsters: 1,
  });

  // Подключение к WebSocket
  useEffect(() => {
    if (!battleId) return;

    // Получаем WebSocket URL из переменной окружения
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

    // Создаем подключение
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      // Присоединяемся к бою
      newSocket.emit('join-battle', { battleId });
    });

    // Слушаем события от сервера
    newSocket.on('round-start', (data: {
      roundNumber: number;
      playerHp: number;
      monsterHp: number;
      currentMonster: number;
      totalMonsters: number;
    }) => {
      setBattleState({
        roundNumber: data.roundNumber,
        playerHp: data.playerHp,
        monsterHp: data.monsterHp,
        status: 'active',
        currentMonster: data.currentMonster,
        totalMonsters: data.totalMonsters,
      });
    });

    newSocket.on('round-complete', (result: RoundResult) => {
      setBattleState((prev) => ({
        ...prev,
        playerHp: result.playerHp,
        monsterHp: result.monsterHp,
        lastRoundResult: result,
      }));
    });

    newSocket.on('battle-end', (data: { status: 'won' | 'lost' }) => {
      setBattleState((prev) => ({
        ...prev,
        status: data.status,
      }));
    });

    newSocket.on('error', (error: { message: string }) => {
    });

    newSocket.on('disconnect', () => {
    });

    setSocket(newSocket);

    // Очистка при размонтировании
    return () => {
      newSocket.close();
    };
  }, [battleId]);

  // Отправить действия раунда
  const sendRoundActions = useCallback((actions: RoundActions) => {
    if (!socket || !battleId) {
      return;
    }

    socket.emit('round-actions', {
      battleId,
      actions,
    });
  }, [socket, battleId]);

  return {
    battleState,
    sendRoundActions,
    isConnected: socket?.connected || false,
  };
}