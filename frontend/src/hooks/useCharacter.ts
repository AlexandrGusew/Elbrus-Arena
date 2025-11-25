import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Character } from '../types/api';
import { useAsync } from './useAsync';

/**
 * Хук для работы с персонажем
 * Загружает персонажа по ID из localStorage
 */
export function useCharacter() {
  const navigate = useNavigate();

  // Функция загрузки персонажа
  const loadCharacter = useCallback(async (): Promise<Character> => {
    const characterId = localStorage.getItem('characterId');

    if (!characterId) {
      navigate('/');
      throw new Error('Character ID not found');
    }

    const response = await api.get<Character>(`/character/${characterId}`);
    const character = response.data;

    if (!character) {
      localStorage.removeItem('characterId');
      navigate('/');
      throw new Error('Character not found');
    }

    return character;
  }, [navigate]);

  // Используем useAsync для управления состоянием
  const { data: character, loading, error, execute: refetch, setData: setCharacter } = useAsync<Character>(
    loadCharacter,
    true // загружаем сразу при монтировании
  );

  return {
    character,
    loading,
    error,
    refetch,
    setCharacter,
  };
}
