/**
 * Character Service - API методы для работы с персонажами
 */

import { api } from './api'
import type { Character, CreateCharacterRequest } from '../types/character'

/**
 * API Response для создания персонажа
 */
interface CreateCharacterResponse {
  success: boolean
  character: Character
}

/**
 * Character Service
 */
export const characterService = {
  /**
   * Создать персонажа
   *
   * @param data - данные для создания (имя и класс)
   * @returns созданный персонаж
   *
   * @example
   * ```ts
   * const character = await characterService.createCharacter({
   *   name: 'Артур',
   *   class: 'WARRIOR'
   * })
   * ```
   */
  createCharacter: async (
    data: CreateCharacterRequest
  ): Promise<Character> => {
    console.log('📤 Отправка запроса на создание персонажа:', data)

    const response = await api.post<CreateCharacterResponse>(
      '/characters/create',
      data
    )

    console.log('✅ Персонаж создан:', response.data.character)
    return response.data.character
  },

  /**
   * Получить данные текущего персонажа
   *
   * @returns данные персонажа
   *
   * @example
   * ```ts
   * const character = await characterService.getMyCharacter()
   * ```
   */
  getMyCharacter: async (): Promise<Character | null> => {
    try {
      const response = await api.get<{ character: Character }>(
        '/characters/me'
      )
      return response.data.character
    } catch (error) {
      console.log('ℹ️ Персонаж не найден')
      return null
    }
  }
}
