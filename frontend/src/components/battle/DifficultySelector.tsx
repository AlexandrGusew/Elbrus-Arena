import { DUNGEON_DIFFICULTIES, type DungeonDifficulty } from '../../types/api';
import { styles } from '../../pages/Dungeon.styles';

const DIFFICULTY_INFO = {
  easy: { name: 'Легкий', desc: 'Для новичков', reward: '10-20 золота' },
  medium: { name: 'Средний', desc: 'Для опытных воинов', reward: '25-40 золота' },
  hard: { name: 'Сложный', desc: 'Для мастеров боя', reward: '50-100 золота' },
};

type DifficultySelectorProps = {
  selectedDifficulty: DungeonDifficulty;
  onSelect: (difficulty: DungeonDifficulty) => void;
};

export const DifficultySelector = ({ selectedDifficulty, onSelect }: DifficultySelectorProps) => {
  return (
    <>
      <h3>Выберите сложность:</h3>
      <div style={styles.difficultyGrid}>
        {DUNGEON_DIFFICULTIES.map((diff) => (
          <div
            key={diff}
            onClick={() => onSelect(diff)}
            style={{
              ...styles.difficultyCard,
              ...(selectedDifficulty === diff ? styles.difficultyCardSelected : styles.difficultyCardDefault),
            }}
          >
            <div style={styles.difficultyName}>{DIFFICULTY_INFO[diff].name}</div>
            <div style={styles.difficultyDesc}>{DIFFICULTY_INFO[diff].desc}</div>
            <div style={styles.difficultyReward}>Награда: {DIFFICULTY_INFO[diff].reward}</div>
          </div>
        ))}
      </div>
    </>
  );
};