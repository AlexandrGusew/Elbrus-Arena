import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/landing'
import Login from './pages/Login'
import CreateCharacter from './pages/CreateCharacter'
import Dashboard from './pages/Dashboard'
import PvP from './pages/PvP'
import Dungeon from './pages/Dungeon'
import Blacksmith from './pages/Blacksmith'
import Inventory from './pages/Inventory'
import LevelUp from './pages/LevelUp'
import Specialization from './pages/Specialization'
import ClassMentor from './pages/ClassMentor'
import { registerServiceWorker, precacheCriticalAssets } from './utils/serviceWorker'
import { getAssetUrl } from './utils/assetUrl'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/auth',
    element: <Login />
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: '/pvp',
        element: <ProtectedRoute><PvP /></ProtectedRoute>
      },
      {
        path: '/dungeon',
        element: <ProtectedRoute><Dungeon /></ProtectedRoute>
      },
      {
        path: '/blacksmith',
        element: <ProtectedRoute><Blacksmith /></ProtectedRoute>
      },
      {
        path: '/inventory',
        element: <ProtectedRoute><Inventory /></ProtectedRoute>
      },
      {
        path: '/levelup',
        element: <ProtectedRoute><LevelUp /></ProtectedRoute>
      },
      {
        path: '/specialization',
        element: <ProtectedRoute><Specialization /></ProtectedRoute>
      },
      {
        path: '/class-mentor',
        element: <ProtectedRoute><ClassMentor /></ProtectedRoute>
      }
    ]
  },
  {
    path: "*",
    element: <div style={{ padding: '50px', textAlign: 'center' }}>404 - Page Not Found</div>
  }
]);

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
)

// Регистрация Service Worker для кэширования медиа
registerServiceWorker({
  onSuccess: () => {
    console.log('[App] Service Worker active, precaching critical assets');

    // Список критических ресурсов для предзагрузки
    const criticalAssets = [
      // Landing страница
      getAssetUrl('Landing/Landing_background.mp4'),

      // Login/CreateCharacter страницы
      getAssetUrl('createCharacter/animatedBackground.mp4'),
      getAssetUrl('createCharacter/backgroundIntro.mp3'),
      getAssetUrl('createCharacter/fonModal.png'),
      getAssetUrl('createCharacter/inputName.png'),
      getAssetUrl('createCharacter/buttonEnter.png'),
      getAssetUrl('createCharacter/music.png'),

      // Персонажи
      getAssetUrl('createCharacter/warrior (1).png'),
      getAssetUrl('createCharacter/mage (1).png'),
      getAssetUrl('createCharacter/rogue (1).png'),

      // Dashboard
      getAssetUrl('dashboard/mainCity.mp3'),
      getAssetUrl('dashboard/mainCityBackground.mp4'),

      // Dungeon
      getAssetUrl('dungeon/battle/PvE-arena.png'),
      getAssetUrl('dungeon/battle/warrior_character.png'),
      getAssetUrl('dungeon/battle/mage_character.png'),
      getAssetUrl('dungeon/battle/rogue_character.png'),

      // Dungeon 1 mobs
      getAssetUrl('dungeon/mobs/mob-1-skeleton.png'),
      getAssetUrl('dungeon/mobs/mob-2-archer.png'),
      getAssetUrl('dungeon/mobs/mob-3-spear.png'),
      getAssetUrl('dungeon/mobs/mob-4-mage.png'),
      getAssetUrl('dungeon/mobs/mob-5-boss.png'),
    ];

    // Предзагружаем критические ресурсы
    precacheCriticalAssets(criticalAssets);
  },
  onUpdate: (registration) => {
    console.log('[App] New version available, please reload');
    // Можно показать уведомление пользователю
    if (confirm('Доступна новая версия приложения. Обновить?')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onError: (error) => {
    console.error('[App] Service Worker error:', error);
  },
});
