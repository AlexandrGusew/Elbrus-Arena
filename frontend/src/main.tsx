import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/app',
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
      },
      {
        path: 'specialization',
        element: <ProtectedRoute><Specialization /></ProtectedRoute>
      },
      {
        path: 'class-mentor',
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
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)