type BattleStatsProps = {
  playerHp: number;
  monsterHp: number;
  playerMaxHp?: number;
  monsterMaxHp?: number;
};

export const BattleStats = ({ playerHp, monsterHp, playerMaxHp = 100, monsterMaxHp = 100 }: BattleStatsProps) => {
  const playerHpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const monsterHpPercent = Math.max(0, Math.min(100, (monsterHp / monsterMaxHp) * 100));

  return (
    <div style={{
      display: 'flex',
      gap: '40px',
      alignItems: 'center',
      width: '100%',
      maxWidth: '1200px',
    }}>
      {/* HP бар игрока */}
      <div style={{
        flex: 1,
        position: 'relative',
      }}>
        <div style={{
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4CAF50',
            textShadow: '0 0 10px rgba(76, 175, 80, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8)',
            fontFamily: 'serif',
            letterSpacing: '1px',
          }}>
            ⚔️ ГЕРОЙ
          </div>
        </div>

        {/* Внешняя рамка HP бара */}
        <div style={{
          position: 'relative',
          height: '50px',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)',
          padding: '4px',
          border: '3px solid #d4af37',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.8)',
        }}>
          {/* Фон HP бара */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            right: '4px',
            bottom: '4px',
            background: 'rgba(20, 20, 20, 0.9)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* Заполнение HP бара */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${playerHpPercent}%`,
              background: playerHpPercent > 50
                ? 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #4CAF50 100%)'
                : playerHpPercent > 25
                ? 'linear-gradient(90deg, #FFA726 0%, #FFB74D 50%, #FFA726 100%)'
                : 'linear-gradient(90deg, #f44336 0%, #EF5350 50%, #f44336 100%)',
              boxShadow: playerHpPercent > 0
                ? `0 0 20px ${playerHpPercent > 50 ? 'rgba(76, 175, 80, 0.6)' : playerHpPercent > 25 ? 'rgba(255, 167, 38, 0.6)' : 'rgba(244, 67, 54, 0.6)'}`
                : 'none',
              transition: 'width 0.5s ease, background 0.3s ease',
              overflow: 'hidden',
            }}>
              {/* Анимированный блеск */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                animation: 'shine 3s infinite',
              }} />
              {/* Текстура */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
              }} />
            </div>
          </div>

          {/* Текст HP */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 10px rgba(0, 0, 0, 0.8)',
            zIndex: 2,
            fontFamily: 'serif',
            letterSpacing: '1px',
          }}>
            {playerHp} / {playerMaxHp}
          </div>
        </div>
      </div>

      {/* HP бар монстра */}
      <div style={{
        flex: 1,
        position: 'relative',
      }}>
        <div style={{
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#dc143c',
            textShadow: '0 0 10px rgba(220, 20, 60, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8)',
            fontFamily: 'serif',
            letterSpacing: '1px',
          }}>
            👹 МОНСТР
          </div>
        </div>

        {/* Внешняя рамка HP бара */}
        <div style={{
          position: 'relative',
          height: '50px',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)',
          borderRadius: '12px',
          padding: '4px',
          border: '3px solid #dc143c',
          boxShadow: '0 0 20px rgba(220, 20, 60, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.8)',
        }}>
          {/* Фон HP бара */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            right: '4px',
            bottom: '4px',
            background: 'rgba(20, 20, 20, 0.9)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* Заполнение HP бара */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${monsterHpPercent}%`,
              background: 'linear-gradient(90deg, #8b0000 0%, #dc143c 50%, #8b0000 100%)',
              boxShadow: monsterHpPercent > 0 ? '0 0 20px rgba(220, 20, 60, 0.6)' : 'none',
              transition: 'width 0.5s ease',
              overflow: 'hidden',
            }}>
              {/* Анимированный блеск */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                animation: 'shine 3s infinite',
              }} />
              {/* Текстура */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
              }} />
            </div>
          </div>

          {/* Текст HP */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 10px rgba(0, 0, 0, 0.8)',
            zIndex: 2,
            fontFamily: 'serif',
            letterSpacing: '1px',
          }}>
            {monsterHp} / {monsterMaxHp}
          </div>
        </div>
      </div>

      {/* CSS для анимации */}
      <style>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          20%, 100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};
