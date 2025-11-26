import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { authApi } from './store/api/authApi'
import './index.css'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import CreateCharacter from './pages/CreateCharacter'
import Dashboard from './pages/Dashboard'
import PvP from './pages/PvP'
import Dungeon from './pages/Dungeon'
import Blacksmith from './pages/Blacksmith'
import Inventory from './pages/Inventory'
import LevelUp from './pages/LevelUp'

// Автоматическая авторизация при старте
async function initAuth() {
  try {
    // Получаем telegramId из Telegram WebApp или используем тестовый
    const telegramId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 123456789;

    // Всегда получаем свежий токен при загрузке
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ telegramId })
    );

    if ('data' in result && result.data) {
      console.log('JWT токен получен и сохранён');
    } else {
      console.error('Не удалось получить токен');
    }
  } catch (err) {
    console.error('Ошибка авторизации:', err);
  }
}

initAuth();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <CreateCharacter />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'pvp',
        element: <ProtectedRoute><PvP /></ProtectedRoute>
      },
      {
        path: 'dungeon',
        element: <ProtectedRoute><Dungeon /></ProtectedRoute>
      },
      {
        path: 'blacksmith',
        element: <ProtectedRoute><Blacksmith /></ProtectedRoute>
      },
      {
        path: 'inventory',
        element: <ProtectedRoute><Inventory /></ProtectedRoute>
      },
      {
        path: 'levelup',
        element: <ProtectedRoute><LevelUp /></ProtectedRoute>
      }
    ]
  },
  {
    path: "*",
    element: <div style={{ padding: '50px', textAlign: 'center' }}>404 - Page Not Found</div>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)