import type { Character } from '../../types/api';
import { styles } from '../../pages/Dungeon.styles';

type CharacterStatsProps = {
  character: Character;
};

export const CharacterStats = ({ character }: CharacterStatsProps) => {
  const hpPercent = (character.currentHp / character.maxHp) * 100;

  return (
    <div style={styles.statsBlock}>
      <h3>{character.name}</h3>
      <div style={styles.statsGrid}>
        <div>💪 Сила: {character.strength}</div>
        <div>🏃 Ловкость: {character.agility}</div>
        <div>⚡ Выносливость: {character.stamina}</div>
        <div>💰 Золото: {character.gold}</div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={styles.hpBarContainer}>
          <span>❤️ HP</span>
          <span>{character.currentHp} / {character.maxHp}</span>
        </div>
        <div style={styles.hpBarOuter}>
          <div style={styles.hpBarInner(hpPercent)} />
        </div>
      </div>
    </div>
  );
};