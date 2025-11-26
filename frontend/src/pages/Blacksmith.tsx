import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useEnhanceItemMutation } from '../store/api/characterApi';
import type { InventoryItem } from '../types/api';
import type { ItemType } from '../../../shared/types/enums';
import { styles } from './Blacksmith.styles';

const SLOT_ICONS: Record<ItemType, string> = {
  weapon: '⚔️',
  helmet: '🪖',
  armor: '🛡️',
  belt: '🔗',
  legs: '👖',
  accessory: '💍',
  potion: '🧪'
};

const SLOT_NAMES: Record<ItemType, string> = {
  weapon: 'Оружие',
  helmet: 'Шлем',
  armor: 'Броня',
  belt: 'Пояс',
  legs: 'Штаны',
  accessory: 'Аксессуар',
  potion: 'Зелье'
};

const ENHANCEMENT_COST_BASE = 100;

const calculateEnhancementCost = (enhancement: number): number => {
  return ENHANCEMENT_COST_BASE * (enhancement + 1) * (enhancement + 1);
};

const Blacksmith = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const { data: character, isLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const [enhanceItem, { isLoading: isEnhancing }] = useEnhanceItemMutation();

  const handleEnhance = async (invItem: InventoryItem) => {
    if (!character) return;

    const cost = calculateEnhancementCost(invItem.enhancement);

    if (character.gold < cost) {
      alert(`Недостаточно золота! Требуется: ${cost}, у вас: ${character.gold}`);
      return;
    }

    try {
      const result = await enhanceItem({
        characterId: Number(characterId),
        itemId: invItem.id,
      }).unwrap();

      alert(`Успешно улучшено до +${result.newEnhancement}! Потрачено: ${result.cost} золота`);
    } catch (error: any) {
      alert(`Ошибка заточки: ${error.data?.message || 'Неизвестная ошибка'}`);
    }
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  const equippedItems = character.inventory.items.filter(item => item.isEquipped && item.item.type !== 'potion');

  return (
    <div style={styles.container}>
      <h1>🔨 Кузница</h1>

      <div style={styles.blacksmithHeader}>
        <div style={styles.blacksmithTitle}>
          <div>Добро пожаловать в кузницу!</div>
          <div style={styles.blacksmithSubtitle}>Здесь вы можете улучшить своё снаряжение за золото</div>
        </div>
        <div style={styles.goldDisplay}>
          💰 Золото: <span style={styles.goldAmount}>{character.gold}</span>
        </div>
      </div>

      {equippedItems.length === 0 ? (
        <div style={styles.emptyMessage}>
          У вас нет надетых предметов для улучшения. Наденьте снаряжение в инвентаре!
        </div>
      ) : (
        <div style={styles.itemsGrid}>
          {equippedItems.map((invItem) => {
            const enhancementCost = calculateEnhancementCost(invItem.enhancement);
            const canAfford = character.gold >= enhancementCost;

            return (
              <div
                key={invItem.id}
                style={{
                  ...styles.blacksmithItem,
                  ...(selectedItem?.id === invItem.id ? styles.blacksmithItemSelected : {})
                }}
                onClick={() => setSelectedItem(invItem)}
              >
                <div style={styles.itemHeader}>
                  <div style={styles.itemIcon}>{SLOT_ICONS[invItem.item.type]}</div>
                  <div style={styles.itemBadge}>{SLOT_NAMES[invItem.item.type]}</div>
                </div>

                <div style={styles.itemName}>
                  {invItem.item.name}
                  {invItem.enhancement > 0 && <span style={styles.enhancement}> +{invItem.enhancement}</span>}
                </div>

                {invItem.isEquipped && <div style={styles.equippedBadge}>Надето</div>}

                <div style={styles.itemStats}>
                  {invItem.item.damage > 0 && <div>⚔️ Урон: {invItem.item.damage}</div>}
                  {invItem.item.armor > 0 && <div>🛡️ Броня: {invItem.item.armor}</div>}
                </div>

                <div style={styles.enhancementInfo}>
                  <div style={styles.currentEnhancement}>
                    Заточка: +{invItem.enhancement}
                  </div>
                  <div style={styles.nextEnhancement}>
                    Следующий уровень: +{invItem.enhancement + 1}
                  </div>
                </div>

                <div style={styles.costInfo}>
                  <div>Стоимость улучшения:</div>
                  <div style={{...styles.costAmount, ...(canAfford ? styles.costCanAfford : styles.costCannotAfford)}}>
                    💰 {enhancementCost}
                  </div>
                </div>

                <button
                  style={{
                    ...styles.enhanceButton,
                    ...(canAfford ? styles.enhanceButtonEnabled : styles.enhanceButtonDisabled)
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnhance(invItem);
                  }}
                  disabled={!canAfford}
                >
                  {canAfford ? '⚒️ Улучшить' : '❌ Недостаточно золота'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Link to="/dashboard" style={styles.backLink}>
        <button style={styles.backButton}>← Вернуться на базу</button>
      </Link>
    </div>
  );
};

export default Blacksmith;