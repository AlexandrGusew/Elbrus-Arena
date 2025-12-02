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
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);

  // Подключение к WebSocket
  useEffect(() => {
    if (!battleId) return;

    // Получаем WebSocket URL из переменной окружения
    const wsUrl = import.meta.env.VITE_WS_URL || (
      import.meta.env.PROD
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3000'
    );

    if (import.meta.env.PROD && !import.meta.env.VITE_WS_URL) {
      console.warn('[useBattle] VITE_WS_URL not set, using current host:', wsUrl);
    }

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
      dungeonId: number;
    }) => {
      // Отладка - выводим данные из события в консоль
      console.log('📡 round-start event received:', data);
      console.log('🏰 dungeonId from server:', data.dungeonId);

      setBattleState((prev) => {
        // Обновляем HP только если:
        // 1. Это начало нового боя (раунд 1)
        // 2. Или сменился моб (currentMonster изменился)
        // Иначе сохраняем текущее HP, чтобы не перезаписывать урон от предыдущего раунда
        const shouldUpdateHp = data.roundNumber === 1 || 
          (prev.currentMonster !== undefined && prev.currentMonster !== data.currentMonster);
        
        return {
          roundNumber: data.roundNumber,
          playerHp: shouldUpdateHp ? data.playerHp : prev.playerHp,
          monsterHp: data.monsterHp, // HP моба всегда обновляем, так как это новый моб или новый раунд
          status: 'active',
          currentMonster: data.currentMonster,
          totalMonsters: data.totalMonsters,
          dungeonId: data.dungeonId,
        };
      });
      // Сбрасываем историю при начале нового боя (раунд 1)
      if (data.roundNumber === 1) {
        setRoundHistory([]);
      }
    });

    newSocket.on('round-complete', (result: RoundResult) => {
      setBattleState((prev) => ({
        ...prev,
        playerHp: result.playerHp,
        monsterHp: result.monsterHp,
        lastRoundResult: result,
      }));
      // Добавляем результат раунда в историю, избегая дубликатов
      setRoundHistory((prev) => {
        // Проверяем, нет ли уже такого раунда в истории
        const exists = prev.some(r => r.roundNumber === result.roundNumber);
        if (exists) {
          console.warn(`⚠️ Раунд ${result.roundNumber} уже есть в истории, пропускаем дубликат`);
          return prev;
        }
        return [...prev, result];
      });
    });

    newSocket.on('battle-end', (data: {
      status: 'won' | 'lost';
      lootedItems?: any[];
      expGained?: number;
      goldGained?: number;
    }) => {
      setBattleState((prev) => ({
        ...prev,
        status: data.status,
        lootedItems: data.lootedItems,
        expGained: data.expGained,
        goldGained: data.goldGained,
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
    roundHistory,
    sendRoundActions,
    isConnected: socket?.connected || false,
  };
}