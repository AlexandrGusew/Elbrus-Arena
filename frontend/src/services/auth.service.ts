/**
 * Сервис авторизации
 *
 * Отвечает за:
 * - Авторизацию через Telegram
 * - Проверку статуса авторизации
 * - Выход из системы
 * - Управление JWT токеном
 */

import { api } from './api'
import type { AuthResponse, TelegramAuthRequest, User } from '../types/auth'

/**
 * Ключ для хранения токена в localStorage
 */
const TOKEN_KEY = 'auth_token'

/**
 * Auth Service
 */
class AuthService {
  /**
   * Авторизация через Telegram
   *
   * @param initData - зашифрованная строка от Telegram WebApp
   * @returns Promise с токеном и данными пользователя
   *
   * @example
   * ```ts
   * const { token, user } = await authService.loginWithTelegram(initData)
   * console.log('Авторизован:', user.firstName)
   * ```
   */
  async loginWithTelegram(initData: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Авторизация через Telegram...')

      // Отправляем initData на backend
      const response = await api.post<AuthResponse>('/auth/telegram', {
        initData
      } as TelegramAuthRequest)

      const { token, user } = response.data

      // Сохраняем токен в localStorage
      this.setToken(token)

      console.log('✅ Авторизация успешна:', {
        userId: user.id,
        username: user.username,
        firstName: user.firstName
      })

      return response.data
    } catch (error: any) {
      console.error('❌ Ошибка авторизации:', error.response?.data || error.message)

      // Обрабатываем специфичные ошибки
      if (error.response?.status === 401) {
        throw new Error('Невалидные данные от Telegram')
      } else if (error.response?.status === 500) {
        throw new Error('Ошибка сервера. Попробуйте позже')
      } else if (!error.response) {
        throw new Error('Нет связи с сервером')
      }

      throw error
    }
  }

  /**
   * Проверка текущей авторизации
   *
   * @returns Promise с данными пользователя или null
   *
   * @example
   * ```ts
   * const user = await authService.checkAuth()
   * if (user) {
   *   console.log('Пользователь авторизован:', user.firstName)
   * } else {
   *   console.log('Пользователь не авторизован')
   * }
   * ```
   */
  async checkAuth(): Promise<User | null> {
    try {
      // Проверяем есть ли токен
      const token = this.getToken()

      if (!token) {
        console.log('🔓 Токен отсутствует')
        return null
      }

      console.log('🔍 Проверка авторизации...')

      // Проверяем валидность токена на backend
      const response = await api.get<{ user: User }>('/auth/me')

      console.log('✅ Пользователь авторизован:', response.data.user.firstName)

      return response.data.user
    } catch (error: any) {
      console.warn('⚠️ Проверка авторизации не удалась:', error.message)

      // Токен невалиден - удаляем
      if (error.response?.status === 401) {
        this.removeToken()
      }

      return null
    }
  }

  /**
   * Выход из системы
   *
   * Удаляет токен из localStorage
   *
   * @example
   * ```ts
   * authService.logout()
   * console.log('Пользователь вышел из системы')
   * ```
   */
  logout(): void {
    console.log('👋 Выход из системы...')
    this.removeToken()
  }

  /**
   * Получить JWT токен из localStorage
   *
   * @returns токен или null
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  /**
   * Сохранить JWT токен в localStorage
   *
   * @param token - JWT токен
   */
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
    console.log('💾 Токен сохранен в localStorage')
  }

  /**
   * Удалить JWT токен из localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    console.log('🗑️ Токен удален из localStorage')
  }

  /**
   * Проверить есть ли токен (быстрая проверка без запроса на сервер)
   *
   * @returns true если токен есть
   *
   * @example
   * ```ts
   * if (authService.hasToken()) {
   *   console.log('Токен найден в localStorage')
   * }
   * ```
   */
  hasToken(): boolean {
    return !!this.getToken()
  }
}

/**
 * Экспортируем singleton экземпляр сервиса
 *
 * Использование:
 *
 * import { authService } from './services/auth.service'
 *
 * // Авторизация
 * const { token, user } = await authService.loginWithTelegram(initData)
 *
 * // Проверка авторизации
 * const user = await authService.checkAuth()
 *
 * // Выход
 * authService.logout()
 */
export const authService = new AuthService()

export default authService
