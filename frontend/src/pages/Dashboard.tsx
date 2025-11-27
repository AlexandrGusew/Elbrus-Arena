import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useGetStaminaInfoQuery, useTestLevelBoostMutation } from '../store/api/characterApi';
import { styles } from './Dashboard.styles';
import { useState, useEffect, useRef } from 'react';

// Импортируем видео и музыку
import backgroundVideo from '../assets/mainCity/mainCityBackground.mp4';
import backgroundMusic from '../assets/mainCity/mainCity.mp3';

// Импортируем изображения героев
import warriorImg from '../assets/choosePlayer/warrior (1).png';
import mageImg from '../assets/choosePlayer/mage (1).png';
import rogueImg from '../assets/choosePlayer/rogue (1).png';

const Dashboard = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);

  const { data: character, isLoading, error } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: staminaInfo } = useGetStaminaInfoQuery(
    Number(characterId),
    {
      skip: !characterId || !character || !!error,
      pollingInterval: 1000,
    }
  );

  const [testLevelBoost, { isLoading: isBoostLoading }] = useTestLevelBoostMutation();

  // Управление музыкой с crossfade
  useEffect(() => {
    const audio1 = audioRef.current;
    const audio2 = audioRef2.current;
    if (!audio1 || !audio2) return;

    let currentAudio = audio1;
    let nextAudio = audio2;
    const FADE_DURATION = 2; // 2 секунды для crossfade
    const LOOP_START = 5;
    const LOOP_END = 25;

    const setupAudio = (audio: HTMLAudioElement) => {
      audio.currentTime = LOOP_START;
      audio.volume = 0;
    };

    setupAudio(audio2);
    audio1.currentTime = LOOP_START;
    audio1.volume = isMusicPlaying ? 1 : 0;

    if (isMusicPlaying) {
      audio1.play().catch((e) => console.log('Autoplay blocked:', e));
    }

    const handleTimeUpdate = () => {
      const currentTime = currentAudio.currentTime;

      // За FADE_DURATION секунд до конца начинаем crossfade
      if (currentTime >= LOOP_END - FADE_DURATION) {
        const fadeProgress = (currentTime - (LOOP_END - FADE_DURATION)) / FADE_DURATION;

        if (nextAudio.paused && isMusicPlaying) {
          nextAudio.currentTime = LOOP_START;
          nextAudio.play().catch((e) => console.log('Play blocked:', e));
        }

        // Плавное затухание текущего трека и нарастание следующего
        currentAudio.volume = isMusicPlaying ? (1 - fadeProgress) : 0;
        nextAudio.volume = isMusicPlaying ? fadeProgress : 0;
      }

      // Когда достигли конца, меняем треки местами
      if (currentTime >= LOOP_END) {
        currentAudio.pause();
        currentAudio.currentTime = LOOP_START;
        currentAudio.volume = 0;

        // Меняем местами
        const temp = currentAudio;
        currentAudio = nextAudio;
        nextAudio = temp;
      }
    };

    audio1.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio1.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isMusicPlaying]);

  // Управление play/pause при переключении музыки
  useEffect(() => {
    if (audioRef.current && audioRef2.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((e) => console.log('Autoplay blocked:', e));
      } else {
        audioRef.current.pause();
        audioRef2.current.pause();
        audioRef.current.volume = 0;
        audioRef2.current.volume = 0;
      }
    }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleLevelBoost = async () => {
    if (!characterId) return;
    try {
      const result = await testLevelBoost(Number(characterId)).unwrap();
      setBoostMessage(result.message);
      setTimeout(() => setBoostMessage(null), 5000);
    } catch (error: any) {
      setBoostMessage(error?.data?.message || 'Ошибка');
      setTimeout(() => setBoostMessage(null), 5000);
    }
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <div style={styles.loadingContainer}>Загрузка...</div>;
  }

  if (error || !character) {
    return (
      <div style={styles.errorContainer}>
        Ошибка: {error ? 'error' in error ? error.error : 'Ошибка загрузки' : 'Персонаж не найден'}
        <br />
        <Link to="/">Создать персонажа</Link>
      </div>
    );
  }

  const hpPercent = (character.currentHp / character.maxHp) * 100;

  const currentStamina = staminaInfo?.currentStamina ?? character.stamina;
  const maxStamina = staminaInfo?.maxStamina ?? 100;
  const staminaPercent = (currentStamina / maxStamina) * 100; // Максимум стамины 100

  // Выбор изображения героя по классу
  const getHeroImage = () => {
    const classLower = character.class.toLowerCase();
    if (classLower === 'warrior') return warriorImg;
    if (classLower === 'mage') return mageImg;
    if (classLower === 'rogue') return rogueImg;
    return warriorImg; // fallback
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
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

      {/* Фоновая музыка - два трека для crossfade */}
      <audio ref={audioRef}>
        <source src={backgroundMusic} type="audio/mpeg" />
      </audio>
      <audio ref={audioRef2}>
        <source src={backgroundMusic} type="audio/mpeg" />
      </audio>

      {/* Кнопка управления музыкой */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          border: '2px solid #fff',
          background: isMusicPlaying ? 'rgba(255, 215, 0, 0.8)' : 'rgba(220, 38, 38, 0.8)',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          zIndex: 1000,
        }}
      >
        {isMusicPlaying ? '🔊 Музыка' : '🔇 Музыка'}
      </button>

      {/* Портрет героя - левый верхний угол */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '20px',
        width: '150px',
        height: '200px',
        borderRadius: '10px',
        overflow: 'hidden',
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
      }}>
        {/* Уровень - в верхнем правом углу портрета */}
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(255, 215, 0, 0.9)',
          color: '#000',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          border: '2px solid #000',
          zIndex: 2,
        }}>
          Ур. {character.level}
        </div>
        <img
          src={getHeroImage()}
          alt={character.class}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '5px',
          textAlign: 'center',
          color: '#ffd700',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>
          {character.name}
        </div>
      </div>

      {/* HP и Stamina бары - справа от портрета */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '185px', // 20px (left) + 150px (width) + 15px (gap)
        width: '300px',
        zIndex: 1000,
      }}>
        {/* HP Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>HP</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #555',
          }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff4444, #cc0000)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Stamina Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Выносливость</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              {currentStamina} / {maxStamina}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #555',
          }}>
            <div style={{
              width: `${staminaPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
            Восстанавливается: 1/сек
            {staminaInfo?.secondsToFull && staminaInfo.secondsToFull > 0 && (
              <span> • Полная через {Math.ceil(staminaInfo.secondsToFull)}с</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ ...styles.container, position: 'relative', zIndex: 2, height: '100vh', overflowY: 'auto' }}>
        <h1>{character.name}</h1>
      <div style={styles.header}>
        Уровень {character.level} • {character.class}
      </div>

      {/* Тестовая кнопка апгрейда */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={handleLevelBoost}
          disabled={isBoostLoading}
          style={{
            ...styles.buttonDungeon,
            background: '#ff9800',
            padding: '10px 20px',
            fontSize: '14px',
          }}
        >
          {isBoostLoading ? 'Прокачка...' : '🚀 ТЕСТ: +20000 опыта'}
        </button>
        {boostMessage && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#4caf50',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
            {boostMessage}
          </div>
        )}
      </div>

      {/* Статы */}
      <div style={styles.statsBlock}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Характеристики</h3>
          {character.freePoints > 0 && (
            <Link to="/levelup" style={styles.linkButton}>
              <button style={{ ...styles.buttonDungeon, padding: '5px 15px', fontSize: '12px' }}>
                Прокачка ({character.freePoints})
              </button>
            </Link>
          )}
        </div>
        <div style={styles.statsGrid}>
          <div>Сила: {character.strength}</div>
          <div>Ловкость: {character.agility}</div>
          <div>Интеллект: {character.intelligence}</div>
          <div>Свободных очков: {character.freePoints}</div>
        </div>
      </div>

      {/* HP Bar */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>HP</span>
          <span>{character.currentHp} / {character.maxHp}</span>
        </div>
        <div style={styles.hpBarOuter}>
          <div style={styles.hpBarInner(hpPercent)} />
        </div>
      </div>

      {/* Stamina Bar */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>Выносливость</span>
          <span>{currentStamina} / {maxStamina}</span>
        </div>
        <div style={styles.hpBarOuter}>
          <div style={styles.staminaBarInner(staminaPercent)} />
        </div>
        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
          Восстанавливается: 1/сек
          {staminaInfo?.secondsToFull && staminaInfo.secondsToFull > 0 && (
            <span> • Полная через {Math.ceil(staminaInfo.secondsToFull)}с</span>
          )}
        </div>
      </div>

      {/* Gold */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>Золото</span>
          <span style={styles.resourceValue}>{character.gold}</span>
        </div>
      </div>

      {/* Инвентарь */}
      <div style={styles.statsBlock}>
        <h3>Инвентарь ({character.inventory.items.length} / {character.inventory.size})</h3>
        <p style={{ fontSize: '14px', color: '#aaa' }}>
          Предметы: {character.inventory.items.length} / {character.inventory.size}
        </p>
      </div>

      {/* Навигация */}
      <div style={styles.navigationGrid}>
        <Link to="/dungeon" style={styles.linkButton}>
          <button style={styles.buttonDungeon}>
            Подземелье
          </button>
        </Link>
        <Link to="/inventory" style={styles.linkButton}>
          <button style={styles.buttonInventory}>
            Инвентарь
          </button>
        </Link>
        <Link to="/blacksmith" style={styles.linkButton}>
          <button style={styles.buttonBlacksmith}>
            Кузница
          </button>
        </Link>
        <Link to="/pvp" style={styles.linkButton}>
          <button style={{ ...styles.buttonDungeon, background: '#e91e63' }}>
            ⚔️ PvP Arena
          </button>
        </Link>
        {character.level >= 10 && (
          <Link to="/specialization" style={styles.linkButton}>
            <button style={{ ...styles.buttonDungeon, background: '#673ab7' }}>
              Специализация
            </button>
          </Link>
        )}
        {character.level >= 15 && (
          <Link to="/class-mentor" style={styles.linkButton}>
            <button style={{ ...styles.buttonDungeon, background: '#ff9800' }}>
              Классовый наставник {character.superPoints > 0 && `(${character.superPoints})`}
            </button>
          </Link>
        )}
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={() => {
          localStorage.removeItem('characterId');
          navigate('/');
        }}
        style={{
          ...styles.buttonDungeon,
          background: '#f44336',
          marginTop: '20px',
          width: '100%',
        }}
      >
        🚪 Выйти
      </button>
      </div>
    </div>
  );
};

export default Dashboard;