import { useEffect, useState } from 'react'
import type { TelegramWebApp, TelegramUser } from '../types/telegram'

interface UseTelegramWebAppReturn {
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  initData: string
  isReady: boolean
  isDevMode: boolean
}

/**
 * Хук для работы с Telegram WebApp SDK
 *
 * Возможности:
 * - Инициализация Telegram WebApp
 * - Получение данных пользователя
 * - Dev mode для локальной разработки без Telegram
 *
 * @example
 * ```tsx
 * function App() {
 *   const { webApp, user, isReady, isDevMode } = useTelegramWebApp()
 *
 *   if (!isReady) return <div>Загрузка...</div>
 *
 *   return (
 *     <div>
 *       {isDevMode && <div>⚠️ DEV MODE</div>}
 *       <h1>Привет, {user?.first_name}!</h1>
 *     </div>
 *   )
 * }
 * ```
 */
export const useTelegramWebApp = (): UseTelegramWebAppReturn => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [initData, setInitData] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    // Проверяем переменную окружения (более надежная проверка)
    const devModeEnv = import.meta.env.VITE_DEV_MODE
    const devMode = devModeEnv === 'true' || devModeEnv === true

    if (tg && tg.initDataUnsafe?.user) {
      // ========================================
      // РЕАЛЬНЫЙ TELEGRAM (с данными пользователя)
      // ========================================
      // Сообщаем Telegram, что приложение готово
      tg.ready()

      // Разворачиваем на весь экран
      tg.expand()

      // Получаем данные
      const telegramUser = tg.initDataUnsafe.user
      const telegramInitData = tg.initData

      setWebApp(tg)
      setUser(telegramUser)
      setInitData(telegramInitData)
      setIsDevMode(false)
      setIsReady(true)

    } else if (devMode) {
      // ========================================
      // DEV MODE (Локальная разработка)
      // ========================================
      // Создаем фейкового пользователя для разработки
      const mockUser: TelegramUser = {
        id: 999999999,
        first_name: 'Dev',
        last_name: 'User',
        username: 'dev_user',
        language_code: 'ru',
        is_premium: false
      }

      // Создаем mock WebApp объект
      const mockWebApp: Partial<TelegramWebApp> = {
        version: '7.0',
        platform: 'unknown',
        colorScheme: 'dark',
        isExpanded: true,
        viewportHeight: 600,
        viewportStableHeight: 600,
        headerColor: '#17161c',
        backgroundColor: '#0b0b0f',
        initData: 'dev_mode_mock_init_data',
        initDataUnsafe: {
          user: mockUser,
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'dev_mode_mock_hash'
        },
        themeParams: {
          bg_color: '#0b0b0f',
          text_color: '#eae6dd',
          hint_color: '#8b2c2f',
          link_color: '#d4af37',
          button_color: '#8b2c2f',
          button_text_color: '#eae6dd',
          secondary_bg_color: '#17161c'
        },
        MainButton: {
          text: '',
          color: '#8b2c2f',
          textColor: '#eae6dd',
          isVisible: false,
          isActive: true,
          isProgressVisible: false,
          setText: (text: string) => {},
          onClick: (callback: () => void) => {},
          offClick: (callback: () => void) => {},
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {},
          showProgress: () => {},
          hideProgress: () => {},
          setParams: (params: any) => {}
        },
        BackButton: {
          isVisible: false,
          onClick: (callback: () => void) => {},
          offClick: (callback: () => void) => {},
          show: () => {},
          hide: () => {}
        },
        HapticFeedback: {
          impactOccurred: (style: string) => {},
          notificationOccurred: (type: string) => {},
          selectionChanged: () => {}
        },
        ready: () => {},
        expand: () => {},
        close: () => {},
        showAlert: (message: string) => {},
        showConfirm: (message: string) => {},
        showPopup: (params: any) => {},
        openLink: (url: string) => {},
        openTelegramLink: (url: string) => {}
      }

      setWebApp(mockWebApp as TelegramWebApp)
      setUser(mockUser)
      setInitData('dev_mode_mock_init_data')
      setIsDevMode(true)
      setIsReady(true)

    } else {
      // ========================================
      // ОШИБКА: нет Telegram и dev mode выключен
      // ========================================
      setIsReady(true) // Все равно помечаем как готово, чтобы показать ошибку
    }
  }, [])

  return {
    webApp,
    user,
    initData,
    isReady,
    isDevMode
  }
}
