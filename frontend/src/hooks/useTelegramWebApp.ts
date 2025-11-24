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

    // Отладочные логи
    console.log('🔍 Environment check:')
    console.log('  - VITE_DEV_MODE:', devModeEnv, '(type:', typeof devModeEnv, ')')
    console.log('  - devMode:', devMode)
    console.log('  - Telegram WebApp exists:', !!tg)

    if (tg && tg.initDataUnsafe?.user) {
      // ========================================
      // РЕАЛЬНЫЙ TELEGRAM (с данными пользователя)
      // ========================================
      console.log('🚀 Initializing Telegram WebApp...')

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

      console.log('✅ Telegram WebApp initialized successfully')
      console.log('📱 Platform:', tg.platform)
      console.log('🎨 Color Scheme:', tg.colorScheme)
      console.log('📏 Viewport Height:', tg.viewportHeight)
      console.log('👤 User:', telegramUser)
      console.log('🔐 Init Data:', telegramInitData ? '(received)' : '(empty)')

      // Настройка темы приложения под Telegram
      if (tg.themeParams) {
        console.log('🎨 Theme Params:', tg.themeParams)
      }

    } else if (devMode) {
      // ========================================
      // DEV MODE (Локальная разработка)
      // ========================================
      console.warn('⚠️ Telegram WebApp not found')
      console.log('🔧 Running in DEV MODE with mock data')

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
          setText: (text: string) => console.log('Mock MainButton.setText:', text),
          onClick: (callback: () => void) => console.log('Mock MainButton.onClick:', callback),
          offClick: (callback: () => void) => console.log('Mock MainButton.offClick:', callback),
          show: () => console.log('Mock MainButton.show'),
          hide: () => console.log('Mock MainButton.hide'),
          enable: () => console.log('Mock MainButton.enable'),
          disable: () => console.log('Mock MainButton.disable'),
          showProgress: () => console.log('Mock MainButton.showProgress'),
          hideProgress: () => console.log('Mock MainButton.hideProgress'),
          setParams: (params: any) => console.log('Mock MainButton.setParams:', params)
        },
        BackButton: {
          isVisible: false,
          onClick: (callback: () => void) => console.log('Mock BackButton.onClick:', callback),
          offClick: (callback: () => void) => console.log('Mock BackButton.offClick:', callback),
          show: () => console.log('Mock BackButton.show'),
          hide: () => console.log('Mock BackButton.hide')
        },
        HapticFeedback: {
          impactOccurred: (style: string) => console.log('Mock HapticFeedback.impactOccurred:', style),
          notificationOccurred: (type: string) => console.log('Mock HapticFeedback.notificationOccurred:', type),
          selectionChanged: () => console.log('Mock HapticFeedback.selectionChanged')
        },
        ready: () => console.log('Mock WebApp.ready'),
        expand: () => console.log('Mock WebApp.expand'),
        close: () => console.log('Mock WebApp.close'),
        showAlert: (message: string) => console.log('Mock WebApp.showAlert:', message),
        showConfirm: (message: string) => console.log('Mock WebApp.showConfirm:', message),
        showPopup: (params: any) => console.log('Mock WebApp.showPopup:', params),
        openLink: (url: string) => console.log('Mock WebApp.openLink:', url),
        openTelegramLink: (url: string) => console.log('Mock WebApp.openTelegramLink:', url)
      }

      setWebApp(mockWebApp as TelegramWebApp)
      setUser(mockUser)
      setInitData('dev_mode_mock_init_data')
      setIsDevMode(true)
      setIsReady(true)

      console.log('✅ DEV MODE initialized')
      console.log('👤 Mock User:', mockUser)
      console.log('⚡ All Telegram API calls will be mocked')

    } else {
      // ========================================
      // ОШИБКА: нет Telegram и dev mode выключен
      // ========================================
      console.error('❌ Telegram WebApp not found and DEV MODE is disabled')
      console.error('💡 To enable dev mode, set VITE_DEV_MODE=true in .env file')

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
