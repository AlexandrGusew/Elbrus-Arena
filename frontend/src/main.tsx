import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import CreateCharacter from './pages/CreateCharacter'
import Dashboard from './pages/Dashboard'
import PvP from './pages/PvP'
import Dungeon from './pages/Dungeon'
import Blacksmith from './pages/Blacksmith'

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
        element: <Dashboard />
      },
      {
        path: 'pvp',
        element: <PvP />
      },
      {
        path: 'dungeon',
        element: <Dungeon />
      },
      {
        path: 'blacksmith',
        element: <Blacksmith />
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
    <RouterProvider router={router} />
  </StrictMode>,
)