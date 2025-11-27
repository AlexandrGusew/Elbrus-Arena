import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Импортируем видео и музыку
import backgroundVideo from '../assets/pvpArena/pvpArena2.mp4';
import backgroundMusic from '../assets/pvpArena/pvpArena.mp3';

const PvP = () => {
  const navigate = useNavigate();
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Управление музыкой
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((e) => console.log('Autoplay blocked:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleExit = () => {
    navigate('/dashboard');
  };

  const containerStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const musicButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    left: '30px',
    padding: '10px 20px',
    border: '2px solid #fff',
    background: isMusicPlaying ? 'rgba(255, 215, 0, 0.8)' : 'rgba(220, 38, 38, 0.8)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    zIndex: 10,
  };

  const exitButtonStyle: React.CSSProperties = {
    padding: '15px 40px',
    border: '3px solid #fff',
    background: 'rgba(220, 38, 38, 0.9)',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    zIndex: 10,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100px',
    fontSize: '64px',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  };

  return (
    <div style={containerStyle}>
      {/* Видео фон */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Фоновая музыка */}
      <audio ref={audioRef} loop>
        <source src={backgroundMusic} type="audio/mpeg" />
      </audio>

      {/* Кнопка управления музыкой */}
      <button onClick={toggleMusic} style={musicButtonStyle}>
        {isMusicPlaying ? '🔊 Музыка' : '🔇 Музыка'}
      </button>

      {/* Заголовок */}
      <h1 style={titleStyle}>PvP Arena</h1>

      {/* Кнопка выхода */}
      <button
        onClick={handleExit}
        style={exitButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 0, 0, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.6)';
        }}
      >
        🚪 ВЫЙТИ
      </button>
    </div>
  );
};

export default PvP;
