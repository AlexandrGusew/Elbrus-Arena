/**
 * Типы для авторизации и пользователя
 */

/**
 * Данные пользователя из backend
 */
export interface User {
  id: string // UUID пользователя в БД
  telegramId: number // Telegram User ID
  username?: string // @username из Telegram
  firstName: string // Имя из Telegram
  lastName?: string // Фамилия из Telegram
  languageCode?: string // Язык (ru, en, и т.д.)
  isPremium?: boolean // Telegram Premium
  createdAt: string // Дата регистрации
  updatedAt: string // Дата последнего обновления
}

/**
 * Ответ от backend при авторизации
 */
export interface AuthResponse {
  success: boolean
  token: string // JWT токен
  user: User // Данные пользователя
}

/**
 * Запрос на авторизацию через Telegram
 */
export interface TelegramAuthRequest {
  initData: string // Зашифрованная строка от Telegram WebApp
}

/**
 * Состояние авторизации в Redux
 */
export interface AuthState {
  isAuthenticated: boolean // Авторизован ли пользователь
  user: User | null // Данные пользователя
  loading: boolean // Идет ли процесс авторизации
  error: string | null // Ошибка авторизации
}
