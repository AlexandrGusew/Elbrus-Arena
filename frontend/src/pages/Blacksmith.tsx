import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCharacter } from '../hooks/useCharacter';
import type { Character, InventoryItem } from '../types/api';
import { styles } from './Blacksmith.styles';

const Blacksmith = () => {
  const { character, setCharacter, loading } = useCharacter();

  const handleEquip = async (invItem: InventoryItem) => {
    if (!character) return;

    try {
      const endpoint = invItem.isEquipped
        ? `/character/${character.id}/unequip/${invItem.id}`
        : `/character/${character.id}/equip/${invItem.id}`;

      const { data: updatedCharacter } = await api.put<Character>(endpoint);

      setCharacter(updatedCharacter);
    } catch (err: any) {
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  return (
    <div style={styles.container}>
      <h1>🔨 Кузница</h1>

      <div style={styles.statsBlock}>
        <h3>{character.name}</h3>
        <p>Здесь ты можешь экипировать предметы из своего инвентаря</p>
      </div>

      <div style={styles.statsBlock}>
        <h3>🎒 Инвентарь ({character.inventory.items.length} / {character.inventory.size})</h3>

        {character.inventory.items.length === 0 ? (
          <p style={styles.inventoryEmpty}>
            Инвентарь пуст. Отправляйся в подземелье чтобы добыть снаряжение!
          </p>
        ) : (
          <div style={styles.inventoryGrid}>
            {character.inventory.items.map((invItem) => (
              <div
                key={invItem.id}
                style={invItem.isEquipped ? styles.inventoryItemEquipped : styles.inventoryItem}
              >
                <div style={styles.itemHeader}>
                  <div style={styles.itemName}>{invItem.item.name}</div>
                  {invItem.isEquipped && (
                    <div style={styles.itemBadge}>Надето</div>
                  )}
                </div>

                <div style={styles.itemStats}>
                  📦 {invItem.item.type} | 💰 Цена: {invItem.item.price}
                </div>

                <div style={styles.itemStats}>
                  ⚔️ Урон: {invItem.item.damage} | 🛡️ Броня: {invItem.item.armor}
                  {invItem.enhancement > 0 && ` | ✨ Улучшение: +${invItem.enhancement}`}
                </div>

                {invItem.item.description && (
                  <div style={{ ...styles.itemStats, fontStyle: 'italic', marginTop: '8px' }}>
                    "{invItem.item.description}"
                  </div>
                )}

                <button
                  onClick={() => handleEquip(invItem)}
                  style={{
                    ...styles.itemButton,
                    ...(invItem.isEquipped ? styles.unequipButton : styles.equipButton),
                  }}
                >
                  {invItem.isEquipped ? 'Снять' : 'Надеть'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <button style={styles.backButton}>
          ← Вернуться на базу
        </button>
      </Link>
    </div>
  );
};

export default Blacksmith;