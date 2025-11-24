/**
 * Типы для Telegram WebApp SDK
 * Документация: https://core.telegram.org/bots/webapps
 */

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

export interface TelegramWebAppInitData {
  query_id?: string
  user?: TelegramUser
  receiver?: TelegramUser
  chat?: {
    id: number
    type: string
    title?: string
    username?: string
    photo_url?: string
  }
  chat_type?: string
  chat_instance?: string
  start_param?: string
  can_send_after?: number
  auth_date: number
  hash: string
}

export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
}

export interface TelegramWebApp {
  /**
   * Версия Telegram WebApp API
   */
  version: string

  /**
   * Платформа (android, ios, macos, tdesktop, weba, web, etc.)
   */
  platform: string

  /**
   * Цветовая схема (light или dark)
   */
  colorScheme: 'light' | 'dark'

  /**
   * Параметры темы
   */
  themeParams: TelegramThemeParams

  /**
   * Приложение развернуто на весь экран
   */
  isExpanded: boolean

  /**
   * Высота viewport в px
   */
  viewportHeight: number

  /**
   * Устойчивая высота viewport в px
   */
  viewportStableHeight: number

  /**
   * Высота header в px
   */
  headerColor: string

  /**
   * Цвет фона
   */
  backgroundColor: string

  /**
   * Инициализационные данные (зашифрованные)
   */
  initData: string

  /**
   * Инициализационные данные (расшифрованные)
   */
  initDataUnsafe: TelegramWebAppInitData

  /**
   * Главная кнопка внизу экрана
   */
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
  }

  /**
   * Кнопка "Назад"
   */
  BackButton: {
    isVisible: boolean
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
  }

  /**
   * Тактильная обратная связь (вибрация)
   */
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }

  /**
   * Сообщает Telegram, что приложение готово к отображению
   */
  ready(): void

  /**
   * Разворачивает WebApp на весь доступный экран
   */
  expand(): void

  /**
   * Закрывает WebApp
   */
  close(): void

  /**
   * Показывает всплывающее уведомление
   */
  showAlert(message: string, callback?: () => void): void

  /**
   * Показывает диалог подтверждения
   */
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void

  /**
   * Показывает всплывающее окно
   */
  showPopup(
    params: {
      title?: string
      message: string
      buttons?: Array<{
        id?: string
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
        text?: string
      }>
    },
    callback?: (buttonId: string) => void
  ): void

  /**
   * Показывает сканер QR кода
   */
  showScanQrPopup(
    params: { text?: string },
    callback?: (text: string) => boolean | void
  ): void

  /**
   * Закрывает сканер QR кода
   */
  closeScanQrPopup(): void

  /**
   * Запрашивает доступ для отправки сообщений от имени пользователя
   */
  requestWriteAccess(callback?: (granted: boolean) => void): void

  /**
   * Запрашивает номер телефона пользователя
   */
  requestContact(callback?: (granted: boolean) => void): void

  /**
   * Открывает ссылку
   */
  openLink(url: string, options?: { try_instant_view?: boolean }): void

  /**
   * Открывает Telegram-ссылку
   */
  openTelegramLink(url: string): void

  /**
   * Открывает invoice
   */
  openInvoice(url: string, callback?: (status: string) => void): void
}

// Расширяем глобальный Window интерфейс
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export {}
