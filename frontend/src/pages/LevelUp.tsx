import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetCharacterQuery,
  useGetLevelProgressQuery,
  useDistributeStatsMutation,
} from '../store/api/characterApi';
import { styles } from './Dashboard.styles';
import { StatsCalculator } from '../utils/statsCalculator';

const LevelUp = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const { data: character, isLoading: charLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: levelProgress } = useGetLevelProgressQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const [distributeStats, { isLoading: isDistributing }] = useDistributeStatsMutation();

  const [pendingStr, setPendingStr] = useState(0);
  const [pendingAgi, setPendingAgi] = useState(0);
  const [pendingInt, setPendingInt] = useState(0);

  if (!characterId) {
    navigate('/');
    return null;
  }

  if (charLoading || !character || !levelProgress) {
    return <div style={styles.loadingContainer}>Загрузка...</div>;
  }

  const pointsUsed = pendingStr + pendingAgi + pendingInt;
  const pointsRemaining = levelProgress.freePoints - pointsUsed;

  const currentStats = StatsCalculator.calculateEffectiveStats(character);
  const newStats = StatsCalculator.calculateStatsWithBonus(character, pendingStr, pendingAgi, pendingInt);

  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (pointsRemaining > 0) {
      setter((prev) => prev + 1);
    }
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number
  ) => {
    if (current > 0) {
      setter((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setPendingStr(0);
    setPendingAgi(0);
    setPendingInt(0);
  };

  const handleApply = async () => {
    if (pointsUsed === 0) {
      alert('Распределите хотя бы одно очко!');
      return;
    }

    try {
      await distributeStats({
        characterId: Number(characterId),
        strength: pendingStr,
        agility: pendingAgi,
        intelligence: pendingInt,
      }).unwrap();

      setPendingStr(0);
      setPendingAgi(0);
      setPendingInt(0);

      alert('Характеристики успешно улучшены!');
    } catch (error: any) {
      alert(`Ошибка: ${error.data?.message || 'Не удалось распределить очки'}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Прокачка персонажа</h1>
      <div style={styles.header}>{character.name} - Уровень {levelProgress.currentLevel}</div>

      <div style={styles.statsBlock}>
        <h3>Опыт</h3>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
          {levelProgress.currentExp} / {levelProgress.expForNextLevel}
        </div>
        <div style={styles.hpBarOuter}>
          <div
            style={styles.expBarInner(
              (levelProgress.currentExp / levelProgress.expForNextLevel) * 100
            )}
          />
        </div>
      </div>

      <div style={styles.statsBlock}>
        <h3>Свободных очков: {pointsRemaining}</h3>
        {levelProgress.freePoints === 0 && (
          <p style={{ color: '#888', fontSize: '14px' }}>
            Получайте опыт в подземельях для повышения уровня!
          </p>
        )}
      </div>

      {levelProgress.freePoints > 0 && (
        <>
          <div style={styles.statsBlock}>
            <h3>Распределение характеристик</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  💪 Сила: {character.strength}
                  {pendingStr > 0 && <span style={{ color: '#4CAF50' }}> +{pendingStr}</span>}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleDecrement(setPendingStr, pendingStr)}
                    disabled={pendingStr === 0}
                    style={{
                      ...styles.buttonDungeon,
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      opacity: pendingStr === 0 ? 0.5 : 1,
                    }}
                  >
                    -
                  </button>
                  <div style={{ width: '40px', textAlign: 'center', lineHeight: '40px' }}>
                    {pendingStr}
                  </div>
                  <button
                    onClick={() => handleIncrement(setPendingStr)}
                    disabled={pointsRemaining === 0}
                    style={{
                      ...styles.buttonDungeon,
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      opacity: pointsRemaining === 0 ? 0.5 : 1,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  🏃 Ловкость: {character.agility}
                  {pendingAgi > 0 && <span style={{ color: '#4CAF50' }}> +{pendingAgi}</span>}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleDecrement(setPendingAgi, pendingAgi)}
                    disabled={pendingAgi === 0}
                    style={{
                      ...styles.buttonDungeon,
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      opacity: pendingAgi === 0 ? 0.5 : 1,
                    }}
                  >
                    -
                  </button>
                  <div style={{ width: '40px', textAlign: 'center', lineHeight: '40px' }}>
                    {pendingAgi}
                  </div>
                  <button
                    onClick={() => handleIncrement(setPendingAgi)}
                    disabled={pointsRemaining === 0}
                    style={{
                      ...styles.buttonDungeon,
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      opacity: pointsRemaining === 0 ? 0.5 : 1,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  🧠 Интеллект: {character.intelligence}
                  {pendingInt > 0 && <span style={{ color: '#4CAF50' }}> +{pendingInt}</span>}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleDecrement(setPendingInt, pendingInt)}
                    disabled={pendingInt === 0}
                    style={{
                      ...styles.buttonDungeon,
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      opacity: pendingInt === 0 ? 0.5 : 1,
                    }}
                  >
                    -
                  </button>
                  <div style={{ width: '40px', textAlign: 'center', lineHeight: '40px' }}>
                    {pendingInt}
                  </div>
                  <button
                    onClick={() => handleIncrement(setPendingInt)}
                    disabled={pointsRemaining === 0}
                    style={{
                      ...styles.buttonDungeon,
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      opacity: pointsRemaining === 0 ? 0.5 : 1,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {pointsUsed > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'linear-gradient(135deg, #1a3a1a 0%, #0d1f0d 100%)',
                borderRadius: '10px',
                border: '2px solid #4CAF50'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>💡 Предпросмотр изменений</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#aaa' }}>⚔️ Урон:</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {currentStats.damage}
                      {newStats.damage > currentStats.damage && (
                        <span style={{ color: '#4CAF50' }}> → {newStats.damage} (+{newStats.damage - currentStats.damage})</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#aaa' }}>🛡️ Броня:</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {currentStats.armor}
                      {newStats.armor > currentStats.armor && (
                        <span style={{ color: '#4CAF50' }}> → {newStats.armor} (+{newStats.armor - currentStats.armor})</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#66BB6A' }}>
                  {pendingStr > 0 && <div>• Сила влияет на урон напрямую</div>}
                  {pendingAgi > 0 && <div>• Ловкость влияет на урон (50% от значения)</div>}
                  {pendingInt > 0 && <div>• Интеллект пока не влияет на характеристики</div>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleReset}
                disabled={pointsUsed === 0}
                style={{
                  ...styles.buttonDungeon,
                  background: '#666',
                  flex: 1,
                  opacity: pointsUsed === 0 ? 0.5 : 1,
                }}
              >
                Сбросить
              </button>
              <button
                onClick={handleApply}
                disabled={pointsUsed === 0 || isDistributing}
                style={{
                  ...styles.buttonDungeon,
                  background: '#4CAF50',
                  flex: 1,
                  opacity: pointsUsed === 0 || isDistributing ? 0.5 : 1,
                }}
              >
                {isDistributing ? 'Применение...' : 'Применить'}
              </button>
            </div>
          </div>
        </>
      )}

      <Link to="/dashboard" style={styles.linkButton}>
        <button style={{ ...styles.buttonDungeon, width: '100%', marginTop: '20px' }}>
          ← Назад в Dashboard
        </button>
      </Link>
    </div>
  );
};

export default LevelUp;