import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCharacterQuery } from '../store/api/characterApi';
import { usePvp } from '../hooks/usePvp';
import { BattleArena } from '../components/battle/BattleArena';
import type { Zone, RoundActions } from '../hooks/useBattle';
import { getAssetUrl } from '../utils/assetUrl';

const PvP = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: character } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { pvpState, joinQueue, leaveQueue, submitActions, isConnected } = usePvp(
    characterId ? Number(characterId) : null
  );

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

  const bottomButtonsContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    zIndex: 10,
  };

  const musicButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: '2px solid #fff',
    background: isMusicPlaying ? 'rgba(255, 215, 0, 0.8)' : 'rgba(220, 38, 38, 0.8)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  };

  const exitButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: '2px solid #fff',
    background: 'rgba(100, 100, 100, 0.8)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    width: '100%',
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

  // Если нет персонажа - редирект
  useEffect(() => {
    if (!characterId) {
      navigate('/dashboard');
    }
  }, [characterId, navigate]);

  if (!characterId || !character) {
    return null;
  }

  // Если идет бой - показываем BattleArena
  if (pvpState.status === 'in_battle' || pvpState.status === 'finished') {
    // Преобразуем PvP state в формат BattleState для BattleArena
    const battleState = {
      roundNumber: pvpState.roundNumber,
      playerHp: pvpState.yourHp,
      monsterHp: pvpState.opponentHp,
      status: pvpState.status === 'finished'
        ? (pvpState.youWon ? 'won' : 'lost') as 'won' | 'lost'
        : 'active' as 'active',
      currentMonster: 1,
      totalMonsters: 1,
      lastRoundResult: pvpState.lastRoundResult ? {
        playerActions: pvpState.lastRoundResult.player1.actions,
        monsterActions: pvpState.lastRoundResult.player2.actions,
        playerDamage: pvpState.lastRoundResult.player2.damage,
        monsterDamage: pvpState.lastRoundResult.player1.damage,
        playerHp: pvpState.lastRoundResult.player1.hp,
        monsterHp: pvpState.lastRoundResult.player2.hp,
      } : undefined,
      goldGained: pvpState.youWon ? 75 : 0,
    };

    return (
      <BattleArena
        character={character}
        battleState={battleState}
        isConnected={isConnected}
        onSubmitActions={submitActions}
        onReset={leaveQueue}
      />
    );
  }

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
        <source src={getAssetUrl('pvpArena/pvpArena2.mp4')} type="video/mp4" />
      </video>

      {/* Фоновая музыка */}
      <audio ref={audioRef} loop>
        <source src={getAssetUrl('pvpArena/pvpArena.mp3')} type="audio/mpeg" />
      </audio>

      {/* Кнопки в левом нижнем углу */}
      <div style={bottomButtonsContainerStyle}>
        {/* Кнопка управления музыкой */}
        <button onClick={toggleMusic} style={musicButtonStyle}>
          {isMusicPlaying ? '🔊 Музыка' : '🔇 Музыка'}
        </button>

        {/* Кнопка выхода */}
        <button onClick={handleExit} style={exitButtonStyle}>
          ← Вернуться на базу
        </button>
      </div>

      {/* Заголовок */}
      <h1 style={titleStyle}>PvP Arena</h1>

      {/* Индикатор подключения */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        padding: '10px 20px',
        background: isConnected ? 'rgba(76, 175, 80, 0.8)' : 'rgba(220, 38, 38, 0.8)',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '16px',
        zIndex: 10,
      }}>
        {isConnected ? '🟢 Подключено' : '🔴 Не подключено'}
      </div>

      {/* Контент по центру - зависит от статуса */}
      <div style={{
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
      }}>
        {pvpState.status === 'searching' && (
          <>
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '40px 60px',
              borderRadius: '15px',
              border: '3px solid #ffd700',
              textAlign: 'center',
            }}>
              <h2 style={{ fontSize: '32px', color: '#ffd700', marginBottom: '20px' }}>
                Поиск противника...
              </h2>
              <div style={{ fontSize: '18px', color: '#fff' }}>
                Игроков в очереди: {pvpState.queuePosition || 0}
              </div>
              <div style={{
                marginTop: '30px',
                fontSize: '48px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                ⚔️
              </div>
            </div>

            <button
              onClick={leaveQueue}
              style={{
                padding: '15px 40px',
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'rgba(220, 38, 38, 0.9)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Отменить поиск
            </button>
          </>
        )}

        {pvpState.status === 'match_found' && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '40px 60px',
            borderRadius: '15px',
            border: '3px solid #4CAF50',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '36px', color: '#4CAF50', marginBottom: '20px' }}>
              Противник найден!
            </h2>
            <div style={{ fontSize: '20px', color: '#fff' }}>
              Подготовка к бою...
            </div>
            <div style={{ marginTop: '20px', fontSize: '64px' }}>
              ⚔️
            </div>
          </div>
        )}

        {!['searching', 'match_found'].includes(pvpState.status) && (
          <button
            onClick={joinQueue}
            style={{
              padding: '20px 60px',
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'rgba(255, 215, 0, 0.9)',
              color: '#000',
              border: '3px solid #fff',
              borderRadius: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
            }}
          >
            Найти противника
          </button>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default PvP;
