import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import './App.css'

function App() {
  const { webApp, user, initData, isReady, isDevMode } = useTelegramWebApp()

  // Показываем загрузку, пока Telegram инициализируется
  if (!isReady) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Загрузка...</h2>
        <p>Инициализация Telegram WebApp</p>
      </div>
    )
  }

  // Если нет Telegram и dev mode выключен
  if (!webApp || !user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Ошибка</h2>
        <p>Приложение должно запускаться через Telegram</p>
        <p>Или включите DEV MODE в .env файле</p>
      </div>
    )
  }

  // Тестируем функции Telegram
  const handleVibrate = () => {
    webApp.HapticFeedback.impactOccurred('medium')
  }

  const handleShowAlert = () => {
    webApp.showAlert('Привет из Telegram WebApp!')
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Dev Mode Индикатор */}
      {isDevMode && (
        <div
          style={{
            background: '#f59e0b',
            color: '#000',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          ⚠️ DEV MODE - Используются моковые данные
        </div>
      )}

      {/* Информация о пользователе */}
      <div style={{ marginBottom: '30px' }}>
        <h1>Elbrus Arena</h1>
        <h2>Привет, {user.first_name}!</h2>
        {user.username && <p>@{user.username}</p>}
      </div>

      {/* Telegram данные */}
      <div
        style={{
          background: '#17161c',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <h3>📱 Telegram Info</h3>
        <p>
          <strong>Platform:</strong> {webApp.platform}
        </p>
        <p>
          <strong>Version:</strong> {webApp.version}
        </p>
        <p>
          <strong>Color Scheme:</strong> {webApp.colorScheme}
        </p>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Language:</strong> {user.language_code || 'не указан'}
        </p>
        {user.is_premium && (
          <p>
            <strong>Premium:</strong> ⭐ Да
          </p>
        )}
      </div>

      {/* Init Data (для отправки на backend) */}
      <div
        style={{
          background: '#17161c',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <h3>🔐 Init Data (для backend авторизации)</h3>
        <div
          style={{
            background: '#0b0b0f',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}
        >
          {initData ? initData : '(empty)'}
        </div>
        <p style={{ fontSize: '14px', marginTop: '10px', color: '#888' }}>
          Эта строка отправляется на backend для проверки подлинности пользователя
        </p>
      </div>

      {/* Тестирование функций Telegram */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🧪 Тест функций Telegram</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleVibrate}
            style={{
              background: '#8b2c2f',
              color: '#eae6dd',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Вибрация
          </button>
          <button
            onClick={handleShowAlert}
            style={{
              background: '#8b2c2f',
              color: '#eae6dd',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Показать Alert
          </button>
        </div>
        <p style={{ fontSize: '14px', marginTop: '10px', color: '#888' }}>
          {isDevMode
            ? 'В dev mode кнопки выводят в консоль (реальные функции не работают)'
            : 'В Telegram эти кнопки будут работать реально'}
        </p>
      </div>

      {/* Инструкция */}
      <div
        style={{
          background: '#17161c',
          padding: '15px',
          borderRadius: '8px'
        }}
      >
        <h3>📝 Следующие шаги</h3>
        <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Story 1.2 ✅ выполнена - Telegram интеграция работает</li>
          <li>
            Откройте консоль браузера (F12) чтобы увидеть детальные логи
          </li>
          <li>
            Для теста в реальном Telegram нужно настроить бота и использовать ngrok
          </li>
          <li>Story 1.3 - создание API сервисов и авторизации на backend</li>
        </ol>
      </div>
    </div>
  )
}

export default App
