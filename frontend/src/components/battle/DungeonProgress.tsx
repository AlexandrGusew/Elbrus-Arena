import { styles } from '../../pages/Dungeon.styles';

type DungeonProgressProps = {
  currentMonster: number;
  totalMonsters: number;
};

export const DungeonProgress = ({ currentMonster, totalMonsters }: DungeonProgressProps) => {
  const percentage = (currentMonster / totalMonsters) * 100;

  return (
    <div style={{ ...styles.statsBlock, marginBottom: '20px' }}>
      <h4>Прогресс подземелья</h4>
      <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        Монстр {currentMonster} / {totalMonsters}
      </div>
      <div
        style={{
          marginTop: '10px',
          width: '100%',
          height: '20px',
          backgroundColor: '#333',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid #555',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};