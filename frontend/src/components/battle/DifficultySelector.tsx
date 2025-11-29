import { DUNGEON_DIFFICULTIES, type DungeonDifficulty } from '../../types/api';
import { getAssetUrl } from '../../utils/assetUrl';

const DIFFICULTY_INFO = {
  easy: { name: 'Легкий', desc: 'Для новичков', reward: '10-20 золота', badge: getAssetUrl('enterDungeon/dungeons/easy/easy-level.png') },
  medium: { name: 'Средний', desc: 'Для опытных воинов', reward: '25-40 золота', badge: getAssetUrl('enterDungeon/dungeons/medium/medium-level.png') },
  hard: { name: 'Сложный', desc: 'Для мастеров боя', reward: '50-100 золота', badge: getAssetUrl('enterDungeon/dungeons/hard/hard-level.png') },
};

type DifficultySelectorProps = {
  selectedDifficulty: DungeonDifficulty;
  onSelect: (difficulty: DungeonDifficulty) => void;
};

export const DifficultySelector = ({ selectedDifficulty, onSelect }: DifficultySelectorProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      alignItems: 'center',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#d4af37',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        margin: '0 0 30px 0',
        fontFamily: 'serif',
        background: 'linear-gradient(180deg, #ffd700 0%, #d4af37 50%, #8b6914 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))',
      }}>
        Выберите подземелье
      </h1>
      {DUNGEON_DIFFICULTIES.map((diff) => (
        <div
          key={diff}
          onClick={() => onSelect(diff)}
          style={{
            width: '700px',
            height: '150px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '10px',
            overflow: 'hidden',
            opacity: selectedDifficulty === diff ? 1 : 0.6,
            transform: selectedDifficulty === diff ? 'scale(1.1)' : 'scale(1)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (selectedDifficulty !== diff) {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedDifficulty !== diff) {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <img
            src={DIFFICULTY_INFO[diff].badge}
            alt={DIFFICULTY_INFO[diff].name}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
};