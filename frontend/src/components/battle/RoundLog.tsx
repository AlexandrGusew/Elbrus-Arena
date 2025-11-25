import type { RoundResult } from '../../hooks/useBattle';
import { styles } from '../../pages/Dungeon.styles';

type RoundLogProps = {
  roundResult: RoundResult;
};

export const RoundLog = ({ roundResult }: RoundLogProps) => {
  return (
    <div style={{ ...styles.statsBlock, marginBottom: '20px' }}>
      <h4>Результат раунда {roundResult.roundNumber}:</h4>
      <div style={{ fontSize: '14px' }}>
        <div>🗡️ Вы нанесли: {roundResult.monsterDamage} урона</div>
        <div>💥 Вы получили: {roundResult.playerDamage} урона</div>
        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
          Ваши атаки: {roundResult.playerActions.attacks.join(', ')}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Ваши защиты: {roundResult.playerActions.defenses.join(', ')}
        </div>
      </div>
    </div>
  );
};