import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery } from '../store/api/characterApi';
import { useGetDungeonsQuery, useStartBattleMutation } from '../store/api/battleApi';
import type { DungeonDifficulty } from '../types/api';
import { useBattle } from '../hooks/useBattle';
import { styles } from './Dungeon.styles';
import { CharacterStats } from '../components/battle/CharacterStats';
import { DifficultySelector } from '../components/battle/DifficultySelector';
import { BattleArena } from '../components/battle/BattleArena';

// Импортируем ресурсы для enterDungeon
import enterDungeonMusic from '../assets/enterDungeon/enterDungeonMusic.mp3';
import enterDungeonButton from '../assets/enterDungeon/enterDungeonButton.png';
import enterDungeonBackground from '../assets/enterDungeon/enterDungeonBackground.mp4';

// Импортируем фоновые изображения для каждого уровня сложности
import easyBackground from '../assets/enterDungeon/dungeons/easy/easy_level_background.png';
import mediumBackground from '../assets/enterDungeon/dungeons/medium/medium_level_background.png';
import hardBackground from '../assets/enterDungeon/dungeons/hard/hard_level_background.png';

const DIFFICULTY_BACKGROUNDS: Record<DungeonDifficulty, string> = {
  easy: easyBackground,
  medium: mediumBackground,
  hard: hardBackground,
};

const Dungeon = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const [selectedDifficulty, setSelectedDifficulty] = useState<DungeonDifficulty>('easy');
  const [battleId, setBattleId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: character, isLoading: characterLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: dungeons = [], isLoading: dungeonsLoading } = useGetDungeonsQuery();
  const [startBattleMutation] = useStartBattleMutation();

  const { battleState, sendRoundActions, isConnected } = useBattle(battleId);

  const selectedDungeon = dungeons.find(d => d.difficulty === selectedDifficulty);
  const requiredStamina = selectedDungeon?.staminaCost || 20;

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

  const startBattle = async () => {
    if (!character) return;

    if (!selectedDungeon) {
      alert('Выберите подземелье');
      return;
    }

    if (character.stamina < requiredStamina) {
      alert(`Недостаточно выносливости! Требуется: ${requiredStamina}, доступно: ${character.stamina}`);
      return;
    }

    try {
      const result = await startBattleMutation({
        characterId: character.id,
        dungeonId: selectedDungeon.id,
      }).unwrap();

      setBattleId(result.id);
    } catch (err: any) {
      alert('Ошибка при создании боя: ' + (err?.data?.message || err.message || 'Неизвестная ошибка'));
    }
  };

  const resetBattle = () => {
    setBattleId(null);
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  const loading = characterLoading || dungeonsLoading;

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  if (!battleId) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Видео фон для экрана выбора */}
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
          <source src={enterDungeonBackground} type="video/mp4" />
        </video>

        {/* Фоновая музыка */}
        <audio ref={audioRef} loop>
          <source src={enterDungeonMusic} type="audio/mpeg" />
        </audio>

        {/* Кнопки в левом нижнем углу */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          zIndex: 10,
        }}>
          {/* Кнопка управления музыкой */}
          <button onClick={toggleMusic} style={{
            padding: '10px 20px',
            border: '2px solid #fff',
            background: isMusicPlaying ? 'rgba(255, 215, 0, 0.8)' : 'rgba(220, 38, 38, 0.8)',
            color: '#fff',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}>
            {isMusicPlaying ? '🔊 Музыка' : '🔇 Музыка'}
          </button>

          {/* Кнопка "Вернуться назад" */}
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
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
            }}>
              ← Вернуться на базу
            </button>
          </Link>
        </div>

        {/* Контент без фона - только элементы */}
        <div style={{
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}>
          {/* Выбор сложности */}
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelect={setSelectedDifficulty}
          />

          {/* Кнопка "Начать бой" заменена на изображение */}
          {character.stamina >= requiredStamina ? (
            <div
              onClick={startBattle}
              style={{
                width: '700px',
                height: '360px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <img
                src={enterDungeonButton}
                alt="Начать бой"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : (
            <div style={{
              padding: '20px 40px',
              background: 'rgba(220, 38, 38, 0.8)',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              Недостаточно выносливости ({requiredStamina})
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BattleArena
      character={character}
      battleState={battleState}
      isConnected={isConnected}
      onSubmitActions={sendRoundActions}
      onReset={resetBattle}
      backgroundImage={DIFFICULTY_BACKGROUNDS[selectedDifficulty]}
    />
  );
};

export default Dungeon;