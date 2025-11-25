import { Link } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { styles, getHpBarInnerStyle } from './Dashboard.styles';

const Dashboard = () => {
  const { character, loading, error } = useCharacter();

  if (loading) {
    return <div style={styles.loadingContainer}>Загрузка...</div>;
  }

  if (error || !character) {
    return (
      <div style={styles.errorContainer}>
        Ошибка: {error || 'Персонаж не найден'}
        <br />
        <Link to="/">Создать персонажа</Link>
      </div>
    );
  }

  const hpPercent = (character.currentHp / character.maxHp) * 100;

  return (
    <div style={styles.container}>
      <h1>{character.name}</h1>
      <div style={styles.header}>
        Уровень {character.level} • {character.class}
      </div>

      {/* Статы */}
      <div style={styles.statsBlock}>
        <h3>Характеристики</h3>
        <div style={styles.statsGrid}>
          <div>💪 Сила: {character.strength}</div>
          <div>🏃 Ловкость: {character.agility}</div>
          <div>🧠 Интеллект: {character.intelligence}</div>
          <div>⭐ Свободных очков: {character.freePoints}</div>
        </div>
      </div>

      {/* HP Bar */}
      <div style={styles.statsBlock}>
        <div style={styles.hpBarContainer}>
          <span>❤️ HP</span>
          <span>{character.currentHp} / {character.maxHp}</span>
        </div>
        <div style={styles.hpBarOuter}>
          <div style={getHpBarInnerStyle(hpPercent)} />
        </div>
      </div>

      {/* Stamina & Gold */}
      <div style={styles.resourcesGrid}>
        <div style={styles.resourceCard}>
          <div>⚡ Выносливость</div>
          <div style={styles.resourceValue}>{character.stamina}</div>
        </div>
        <div style={styles.resourceCard}>
          <div>💰 Золото</div>
          <div style={styles.resourceValue}>{character.gold}</div>
        </div>
      </div>

      {/* Инвентарь */}
      <div style={styles.statsBlock}>
        <h3>🎒 Инвентарь ({character.inventory.items.length} / {character.inventory.size})</h3>
        {character.inventory.items.length === 0 ? (
          <p style={styles.inventoryEmpty}>Инвентарь пуст</p>
        ) : (
          <div style={styles.inventoryGrid}>
            {character.inventory.items.map((invItem) => (
              <div
                key={invItem.id}
                style={invItem.isEquipped ? styles.inventoryItemEquipped : styles.inventoryItem}
              >
                <div style={styles.itemName}>
                  {invItem.item.name} {invItem.isEquipped && '(Надето)'}
                </div>
                <div style={styles.itemStats}>
                  {invItem.item.type} • Урон: {invItem.item.damage} • Броня: {invItem.item.armor}
                  {invItem.enhancement > 0 && ` • +${invItem.enhancement}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Навигация */}
      <div style={styles.navigationGrid}>
        <Link to="/dungeon" style={styles.linkButton}>
          <button style={styles.buttonDungeon}>
            ⚔️ Подземелье
          </button>
        </Link>
        <Link to="/blacksmith" style={styles.linkButton}>
          <button style={styles.buttonBlacksmith}>
            🔨 Кузнец
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;