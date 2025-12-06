import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { CreateCharacterPage } from './components/CreateCharacterPage';
import { ChooseCharacterPage } from './components/ChooseCharacterPage';
import { DashboardPage } from './components/DashboardPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'create' | 'choose' | 'dashboard'>('login');
  const [musicOn, setMusicOn] = useState(false);

  return (
    <div className="w-[1440px] h-[1080px] mx-auto bg-black relative overflow-hidden">
      {/* Dark Fantasy Background with texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/30 via-black to-black"></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)] opacity-60"></div>
      
      {/* Gothic pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l3.536 3.536L30 7.071l-3.536-3.535L30 0zm0 52.929l3.536 3.535L30 60l-3.536-3.536L30 52.929zM0 30l3.536-3.536L7.071 30l-3.535 3.536L0 30zm52.929 0l3.535-3.536L60 30l-3.536 3.536L52.929 30z' fill='%23b91c1c' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Animated fire particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(239, 68, 68, 0.6)' : 
                i % 3 === 1 ? 'rgba(251, 191, 36, 0.4)' : 
                'rgba(220, 38, 38, 0.5)'
              } 0%, transparent 70%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: `0 0 ${4 + Math.random() * 8}px ${
                i % 3 === 0 ? 'rgba(239, 68, 68, 0.8)' : 
                i % 3 === 1 ? 'rgba(251, 191, 36, 0.6)' : 
                'rgba(220, 38, 38, 0.7)'
              }`
            }}
          ></div>
        ))}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-amber-700/40 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-amber-700/40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-amber-700/40 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-amber-700/40 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full">
        {currentPage === 'login' && (
          <LoginPage 
            onNavigate={setCurrentPage}
            musicOn={musicOn}
            onToggleMusic={() => setMusicOn(!musicOn)}
          />
        )}
        {currentPage === 'create' && (
          <CreateCharacterPage 
            onNavigate={setCurrentPage}
            musicOn={musicOn}
            onToggleMusic={() => setMusicOn(!musicOn)}
          />
        )}
        {currentPage === 'choose' && (
          <ChooseCharacterPage 
            onNavigate={setCurrentPage}
            musicOn={musicOn}
            onToggleMusic={() => setMusicOn(!musicOn)}
          />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage 
            onNavigate={setCurrentPage}
            musicOn={musicOn}
            onToggleMusic={() => setMusicOn(!musicOn)}
          />
        )}
      </div>
    </div>
  );
}