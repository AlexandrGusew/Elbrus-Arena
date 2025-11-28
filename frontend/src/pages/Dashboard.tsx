import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useGetStaminaInfoQuery, useTestLevelBoostMutation } from '../store/api/characterApi';
import { styles } from './Dashboard.styles';
import { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assetUrl';

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
    if (classLower === 'warrior') return getAssetUrl('choosePlayer/warrior (1).png');
    if (classLower === 'mage') return getAssetUrl('choosePlayer/mage (1).png');
    if (classLower === 'rogue') return getAssetUrl('choosePlayer/rogue (1).png');
    return getAssetUrl('choosePlayer/warrior (1).png'); // fallback
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
        <source src={getAssetUrl('mainCity/mainCityBackground.mp4')} type="video/mp4" />
      </video>

      {/* Фоновая музыка - два трека для crossfade */}
      <audio ref={audioRef}>
        <source src={getAssetUrl('mainCity/mainCity.mp3')} type="audio/mpeg" />
      </audio>
      <audio ref={audioRef2}>
        <source src={getAssetUrl('mainCity/mainCity.mp3')} type="audio/mpeg" />
      </audio>

      {/* Левый нижний угол - кнопки одинакового размера */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        left: '40px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000,
      }}>
        {/* Кнопка управления музыкой */}
        <button
          onClick={toggleMusic}
          style={{
            padding: '10px',
            border: '2px solid #fff',
            background: isMusicPlaying ? 'rgba(255, 215, 0, 0.8)' : 'rgba(220, 38, 38, 0.8)',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isMusicPlaying ? '🔊' : '🔇'}
        </button>

        {/* Кнопка выхода */}
        <button
          onClick={() => {
            localStorage.removeItem('characterId');
            navigate('/');
          }}
          style={{
            padding: '10px',
            border: '2px solid #fff',
            background: 'rgba(220, 38, 38, 0.8)',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🚪
        </button>

        {/* Кнопка теста */}
        <button
          onClick={handleLevelBoost}
          disabled={isBoostLoading}
          style={{
            padding: '10px',
            border: '2px solid #fff',
            background: isBoostLoading ? 'rgba(128, 128, 128, 0.8)' : 'rgba(255, 152, 0, 0.8)',
            color: '#fff',
            fontSize: '20px',
            cursor: isBoostLoading ? 'not-allowed' : 'pointer',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🚀
        </button>
      </div>

      {/* Навигационные кнопки - в ряд снизу по центру */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '5px',
        zIndex: 1000,
      }}>
        <Link to="/dungeon" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('mainCity/dungeons.png')}
            alt="Подземелье"
            style={{
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/inventory" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('mainCity/inventory.png')}
            alt="Инвентарь"
            style={{
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/blacksmith" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('mainCity/blacksmith.png')}
            alt="Кузница"
            style={{
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/pvp" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('mainCity/pvp.png')}
            alt="PvP"
            style={{
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        {character.level >= 10 && (
          <Link to="/specialization" style={{ display: 'block' }}>
            <button style={{
              width: '450px',
              height: '240px',
              background: '#673ab7',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '8px',
              fontSize: '32px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}>
              Специализация
            </button>
          </Link>
        )}
        {character.level >= 15 && (
          <Link to="/class-mentor" style={{ display: 'block' }}>
            <button style={{
              width: '450px',
              height: '240px',
              background: '#ff9800',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '8px',
              fontSize: '32px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}>
              Наставник {character.superPoints > 0 && `(${character.superPoints})`}
            </button>
          </Link>
        )}
      </div>

      {/* Портрет героя - левый верхний угол */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '40px',
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
      </div>

      {/* Имя персонажа под портретом */}
      <div style={{
        position: 'fixed',
        top: '285px', // 80px (top) + 200px (height) + 5px (gap)
        left: '40px',
        width: '150px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '5px',
        textAlign: 'center',
        color: '#000',
        fontSize: '14px',
        fontWeight: 'bold',
        borderRadius: '5px',
        zIndex: 1000,
      }}>
        {character.name}
      </div>

      {/* Кнопка Level Up - появляется только когда есть свободные очки */}
      {character.freePoints > 0 && (
        <Link to="/inventory" style={{
          position: 'fixed',
          top: '310px', // Сразу под именем
          left: '40px',
          width: '150px',
          height: '60px',
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'block',
        }}>
          <img
            src={getAssetUrl('mainCity/lvlup.png')}
            alt="Level Up"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
      )}

      {/* HP и Stamina бары - справа от портрета */}
      <div style={{
        position: 'fixed',
        top: '100px',
        left: '205px', // 40px (left) + 150px (width) + 15px (gap)
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
        <h1>{character.class}</h1>

      {boostMessage && (
        <div style={{
          marginTop: '10px',
          marginBottom: '20px',
          padding: '10px',
          background: '#4caf50',
          borderRadius: '4px',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          {boostMessage}
        </div>
      )}

      {/* Объединённый блок: Золото + Характеристики - слева под портретом */}
      <div style={{
        position: 'fixed',
        top: character.freePoints > 0 ? '380px' : '310px', // Под кнопкой lvlup или под именем
        left: '40px',
        width: '300px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #ffd700',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
      }}>
        {/* Золото */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid #ffd700',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#aaa',
            marginBottom: '5px',
          }}>
            Золото
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}>
            {character.gold.toLocaleString()}
          </div>
        </div>

        {/* Характеристики */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h3 style={{
              margin: 0,
              color: '#ffd700',
              fontSize: '16px',
            }}>
              Характеристики
            </h3>
            {character.freePoints > 0 && (
              <Link to="/levelup" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '4px 12px',
                  fontSize: '11px',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}>
                  Прокачка ({character.freePoints})
                </button>
              </Link>
            )}
          </div>
          <div style={{
            display: 'grid',
            gap: '8px',
            color: '#fff',
            fontSize: '14px',
          }}>
            <div>Сила: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{character.strength}</span></div>
            <div>Ловкость: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{character.agility}</span></div>
            <div>Интеллект: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{character.intelligence}</span></div>
            {character.freePoints > 0 && (
              <div style={{
                marginTop: '4px',
                padding: '6px',
                background: 'rgba(76, 175, 80, 0.2)',
                borderRadius: '4px',
                textAlign: 'center',
              }}>
                Свободных очков: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{character.freePoints}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Dashboard;