import { styles } from '../../pages/Dungeon.styles';

type BattleStatsProps = {
  playerHp: number;
  monsterHp: number;
};

export const BattleStats = ({ playerHp, monsterHp }: BattleStatsProps) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
      <div style={styles.statsBlock}>
        <h3>Игрок</h3>
        <div style={{ fontSize: '24px', margin: '10px 0' }}>
          ❤️ {playerHp}
        </div>
      </div>
      <div style={styles.statsBlock}>
        <h3>Монстр</h3>
        <div style={{ fontSize: '24px', margin: '10px 0' }}>
          💀 {monsterHp}
        </div>
      </div>
    </div>
  );
};