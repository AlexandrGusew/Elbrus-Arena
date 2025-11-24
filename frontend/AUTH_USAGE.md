# 🔐 Использование системы авторизации

## Обзор созданных файлов

### 1. Типы
- `src/types/auth.ts` - TypeScript интерфейсы для авторизации

### 2. Сервисы
- `src/services/api.ts` - HTTP клиент с автоматическим добавлением JWT токена
- `src/services/auth.service.ts` - Сервис авторизации (login, checkAuth, logout)

### 3. Redux
- `src/store/index.ts` - Redux store
- `src/store/authSlice.ts` - Redux slice для управления состоянием авторизации

### 4. Хуки
- `src/hooks/useRedux.ts` - Типизированные хуки для Redux

---

## Примеры использования

### 1. Подключение Redux Store в приложение

**В `src/main.tsx`:**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' // Импортируем Provider
import { store } from './store' // Импортируем store
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>  {/* Оборачиваем приложение */}
      <App />
    </Provider>
  </StrictMode>
)
```

---

### 2. Авторизация при запуске приложения

**В компоненте App.tsx:**

```typescript
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './hooks/useRedux'
import { loginWithTelegram, checkAuth } from './store/authSlice'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, loading, error } = useAppSelector(state => state.auth)
  const { initData } = useTelegramWebApp()

  useEffect(() => {
    // При загрузке проверяем авторизацию
    if (initData) {
      // Если есть initData от Telegram - авторизуемся
      dispatch(loginWithTelegram(initData))
    } else {
      // Если нет - проверяем есть ли сохраненный токен
      dispatch(checkAuth())
    }
  }, [dispatch, initData])

  // Показываем loader во время авторизации
  if (loading) {
    return <div>Загрузка...</div>
  }

  // Показываем ошибку
  if (error) {
    return <div>Ошибка: {error}</div>
  }

  // Пользователь авторизован
  if (isAuthenticated && user) {
    return (
      <div>
        <h1>Привет, {user.firstName}!</h1>
        <p>Telegram ID: {user.telegramId}</p>
      </div>
    )
  }

  // Не авторизован
  return <div>Вход...</div>
}
```

---

### 3. Проверка авторизации в компонентах

**Простая проверка:**

```typescript
import { useAppSelector } from './hooks/useRedux'
import { Navigate } from 'react-router-dom'

function Dashboard() {
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Если не авторизован - редирект на /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" />
  }

  return <div>Dashboard content...</div>
}
```

---

### 4. Защищенные роуты (ProtectedRoute)

**Создайте компонент `src/components/ProtectedRoute.tsx`:**

```typescript
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/useRedux'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth)

  // Показываем loader во время проверки
  if (loading) {
    return <div>Проверка авторизации...</div>
  }

  // Если не авторизован - редирект
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // Авторизован - показываем контент
  return <>{children}</>
}
```

**Использование в роутинге:**

```typescript
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import CharacterCreation from './pages/CharacterCreation'

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/character-creation',
    element: (
      <ProtectedRoute>
        <CharacterCreation />
      </ProtectedRoute>
    )
  }
])
```

---

### 5. Выход из системы

**В компоненте навигации:**

```typescript
import { useAppDispatch } from './hooks/useRedux'
import { logout } from './store/authSlice'
import { useNavigate } from 'react-router-dom'

function Navigation() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/auth')
  }

  return (
    <nav>
      <button onClick={handleLogout}>Выход</button>
    </nav>
  )
}
```

---

### 6. Отправка запросов на backend

**Простой запрос:**

```typescript
import { api } from './services/api'

// GET запрос (токен добавляется автоматически через interceptor)
const getCharacter = async () => {
  try {
    const response = await api.get('/characters/me')
    console.log('Character:', response.data)
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

// POST запрос
const createCharacter = async (name: string, classType: string) => {
  try {
    const response = await api.post('/characters/create', {
      name,
      class: classType
    })
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

### 7. Проверка токена при загрузке приложения

**В корневом компоненте:**

```typescript
import { useEffect } from 'react'
import { useAppDispatch } from './hooks/useRedux'
import { checkAuth } from './store/authSlice'
import { authService } from './services/auth.service'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Проверяем есть ли токен при загрузке
    if (authService.hasToken()) {
      dispatch(checkAuth())
    }
  }, [dispatch])

  return <div>App content...</div>
}
```

---

### 8. Отображение данных пользователя

**В любом компоненте:**

```typescript
import { useAppSelector } from './hooks/useRedux'

function UserProfile() {
  const { user } = useAppSelector(state => state.auth)

  if (!user) {
    return <div>Загрузка профиля...</div>
  }

  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>@{user.username}</p>
      <p>Telegram ID: {user.telegramId}</p>
      {user.isPremium && <span>⭐ Premium</span>}
      <p>Язык: {user.languageCode}</p>
      <p>Регистрация: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  )
}
```

---

### 9. Обработка ошибок авторизации

**С отображением toast/уведомлений:**

```typescript
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from './hooks/useRedux'
import { clearError } from './store/authSlice'

function AuthErrorHandler() {
  const { error } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (error) {
      // Показываем уведомление об ошибке
      alert(`Ошибка авторизации: ${error}`)

      // Очищаем ошибку через 5 секунд
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  return null
}
```

---

## Проверка работы

### Проверка в браузере:

1. **localStorage:** DevTools → Application → Local Storage → видите `auth_token`
2. **Network:** DevTools → Network → Headers запросов → видите `Authorization: Bearer ...`
3. **Redux:** Redux DevTools → State → видите `auth.isAuthenticated = true`
4. **Console:** Видите логи авторизации

---

## Что дальше?

После интеграции с backend (Story 1.3 полностью работает):
- ✅ Story 2.1 - Создание персонажа (с привязкой к пользователю)
- ✅ Story 3.1 - Dashboard (отображение данных персонажа пользователя)
- ✅ Защищенные роуты работают

---

**Story 1.3 готова к использованию! 🎉**
