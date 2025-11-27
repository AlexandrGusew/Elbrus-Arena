import { DUNGEON_DIFFICULTIES, type DungeonDifficulty } from '../../types/api';
import { styles } from '../../pages/Dungeon.styles';

// Импортируем badge изображения
import easyBadge from '../../assets/enterDungeon/dungeons/easy/easy_level_badge.png';
import mediumBadge from '../../assets/enterDungeon/dungeons/medium/medium_level_badge.png';
import hardBadge from '../../assets/enterDungeon/dungeons/hard/hard_level_badge.png';

const DIFFICULTY_INFO = {
  easy: { name: 'Легкий', desc: 'Для новичков', reward: '10-20 золота', badge: easyBadge },
  medium: { name: 'Средний', desc: 'Для опытных воинов', reward: '25-40 золота', badge: mediumBadge },
  hard: { name: 'Сложный', desc: 'Для мастеров боя', reward: '50-100 золота', badge: hardBadge },
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
      {DUNGEON_DIFFICULTIES.map((diff) => (
        <div
          key={diff}
          onClick={() => onSelect(diff)}
          style={{
            width: '700px',
            height: '150px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: selectedDifficulty === diff ? '4px solid #ffd700' : '2px solid transparent',
            borderRadius: '10px',
            overflow: 'hidden',
            opacity: selectedDifficulty === diff ? 1 : 0.6,
            transform: selectedDifficulty === diff ? 'scale(1.05)' : 'scale(1)',
            boxShadow: selectedDifficulty === diff ? '0 0 30px rgba(255, 215, 0, 0.6)' : 'none',
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
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
};