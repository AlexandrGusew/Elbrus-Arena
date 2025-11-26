import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useGetStaminaInfoQuery } from '../store/api/characterApi';
import { styles } from './Dashboard.styles';

const Dashboard = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const { data: character, isLoading, error } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: staminaInfo } = useGetStaminaInfoQuery(
    Number(characterId),
    {
      skip: !characterId,
      pollingInterval: 1000,
    }
  );

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

  return (
    <div style={styles.container}>
      <h1>{character.name}</h1>
      <div style={styles.header}>
        Уровень {character.level} • {character.class}
      </div>

      {/* Статы */}
      <div style={styles.statsBlock}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Характеристики</h3>
          {character.freePoints > 0 && (
            <Link to="/levelup" style={styles.linkButton}>
              <button style={{ ...styles.buttonDungeon, padding: '5px 15px', fontSize: '12px' }}>
                Прокачка ({character.freePoints})
              </button>
            </Link>
          )}
        </div>
        <div style={styles.statsGrid}>
          <div>Сила: {character.strength}</div>
          <div>Ловкость: {character.agility}</div>
          <div>Интеллект: {character.intelligence}</div>
          <div>Свободных очков: {character.freePoints}</div>
        </div>
      </div>

      {/* HP Bar */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>HP</span>
          <span>{character.currentHp} / {character.maxHp}</span>
        </div>
        <div style={styles.hpBarOuter}>
          <div style={styles.hpBarInner(hpPercent)} />
        </div>
      </div>

      {/* Stamina Bar */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>Выносливость</span>
          <span>{currentStamina} / {maxStamina}</span>
        </div>
        <div style={styles.hpBarOuter}>
          <div style={styles.staminaBarInner(staminaPercent)} />
        </div>
        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
          Восстанавливается: 1/сек
          {staminaInfo?.secondsToFull && staminaInfo.secondsToFull > 0 && (
            <span> • Полная через {Math.ceil(staminaInfo.secondsToFull)}с</span>
          )}
        </div>
      </div>

      {/* Gold */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>Золото</span>
          <span style={styles.resourceValue}>{character.gold}</span>
        </div>
      </div>

      {/* Инвентарь */}
      <div style={styles.statsBlock}>
        <h3>Инвентарь ({character.inventory.items.length} / {character.inventory.size})</h3>
        <p style={{ fontSize: '14px', color: '#aaa' }}>
          Предметы: {character.inventory.items.length} / {character.inventory.size}
        </p>
      </div>

      {/* Навигация */}
      <div style={styles.navigationGrid}>
        <Link to="/dungeon" style={styles.linkButton}>
          <button style={styles.buttonDungeon}>
            Подземелье
          </button>
        </Link>
        <Link to="/inventory" style={styles.linkButton}>
          <button style={styles.buttonInventory}>
            Инвентарь
          </button>
        </Link>
        <Link to="/blacksmith" style={styles.linkButton}>
          <button style={styles.buttonBlacksmith}>
            Кузница
          </button>
        </Link>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={() => {
          localStorage.removeItem('characterId');
          navigate('/');
        }}
        style={{
          ...styles.buttonDungeon,
          background: '#f44336',
          marginTop: '20px',
          width: '100%',
        }}
      >
        🚪 Выйти
      </button>
    </div>
  );
};

export default Dashboard;