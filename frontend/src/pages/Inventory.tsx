import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useEquipItemMutation, useUnequipItemMutation, useSellItemMutation } from '../store/api/characterApi';
import type { InventoryItem } from '../types/api';
import type { ItemType } from '../../../shared/types/enums';
import { styles } from './Inventory.styles';
import { StatsCalculator } from '../utils/statsCalculator';

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

const Inventory = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const { data: character, isLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const [equipItem] = useEquipItemMutation();
  const [unequipItem] = useUnequipItemMutation();
  const [sellItem] = useSellItemMutation();

  const handleEquip = async (invItem: InventoryItem) => {
    if (!character) return;

    try {
      if (invItem.isEquipped) {
        await unequipItem({ characterId: character.id, itemId: invItem.id }).unwrap();
      } else {
        await equipItem({ characterId: character.id, itemId: invItem.id }).unwrap();
      }
    } catch (err: any) {
      console.error('Error equipping item:', err);
    }
  };

  const handleSell = async (invItem: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!character) return;

    const sellPrice = Math.floor(invItem.item.price * 0.5);

    if (!confirm(`Продать ${invItem.item.name} за ${sellPrice} золота?`)) {
      return;
    }

    try {
      const result = await sellItem({ characterId: character.id, itemId: invItem.id }).unwrap();
      alert(`${result.itemName} продан за ${result.goldReceived} золота!`);
    } catch (err: any) {
      alert(`Ошибка продажи: ${err.data?.message || 'Неизвестная ошибка'}`);
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

  const equippedItems = character.inventory.items.filter(item => item.isEquipped);
  const unequippedItems = character.inventory.items.filter(item => !item.isEquipped);

  const getEquippedItemByType = (type: ItemType): InventoryItem | undefined => {
    return equippedItems.find(item => item.item.type === type);
  };

  const slots: ItemType[] = ['weapon', 'helmet', 'armor', 'belt', 'legs', 'accessory'];

  const effectiveStats = StatsCalculator.calculateEffectiveStats(character);

  return (
    <div style={styles.container}>
      <h1>Инвентарь</h1>

      <div style={styles.mainLayout}>
        <div style={styles.equipmentSection}>
          <h2>Экипировка персонажа</h2>
          <div style={styles.characterInfo}>
            <div style={styles.characterName}>{character.name}</div>
            <div style={styles.characterClass}>Уровень {character.level} • {character.class}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '15px',
            border: '2px solid #4a4a6a'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>Характеристики</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#aaa' }}>Сила:</div>
                <div style={{ color: '#4CAF50', fontSize: '16px', fontWeight: 'bold' }}>
                  {character.strength}
                  {effectiveStats.strength > character.strength && (
                    <span style={{ color: '#66BB6A' }}> (+{effectiveStats.strength - character.strength})</span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ color: '#aaa' }}>Ловкость:</div>
                <div style={{ color: '#2196F3', fontSize: '16px', fontWeight: 'bold' }}>
                  {character.agility}
                  {effectiveStats.agility > character.agility && (
                    <span style={{ color: '#64B5F6' }}> (+{effectiveStats.agility - character.agility})</span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ color: '#aaa' }}>Интеллект:</div>
                <div style={{ color: '#9C27B0', fontSize: '16px', fontWeight: 'bold' }}>
                  {character.intelligence}
                  {effectiveStats.intelligence > character.intelligence && (
                    <span style={{ color: '#BA68C8' }}> (+{effectiveStats.intelligence - character.intelligence})</span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ color: '#aaa' }}>Урон:</div>
                <div style={{ color: '#f44336', fontSize: '18px', fontWeight: 'bold' }}>
                  {effectiveStats.damage}
                </div>
              </div>
              <div>
                <div style={{ color: '#aaa' }}>Броня:</div>
                <div style={{ color: '#FF9800', fontSize: '18px', fontWeight: 'bold' }}>
                  {effectiveStats.armor}
                </div>
              </div>
              <div>
                <div style={{ color: '#aaa' }}>HP:</div>
                <div style={{ color: '#E91E63', fontSize: '18px', fontWeight: 'bold' }}>
                  {effectiveStats.currentHp} / {effectiveStats.maxHp}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.equipmentSlots}>
            {slots.map(slotType => {
              const equippedItem = getEquippedItemByType(slotType);
              return (
                <div key={slotType} style={styles.equipmentSlot}>
                  <div style={styles.slotIcon}>{SLOT_ICONS[slotType]}</div>
                  <div style={styles.slotContent}>
                    <div style={styles.slotName}>{SLOT_NAMES[slotType]}</div>
                    {equippedItem ? (
                      <div
                        style={styles.slotItem}
                        onClick={() => handleEquip(equippedItem)}
                      >
                        <div style={styles.slotItemName}>
                          {equippedItem.item.name}
                          {equippedItem.enhancement > 0 && ` +${equippedItem.enhancement}`}
                        </div>
                        <div style={styles.slotItemStats}>
                          {equippedItem.item.damage > 0 && `Урон: ${equippedItem.item.damage} `}
                          {equippedItem.item.armor > 0 && `Броня: ${equippedItem.item.armor}`}
                        </div>
                      </div>
                    ) : (
                      <div style={styles.slotEmpty}>Пусто</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.inventorySection}>
          <h2>Предметы ({unequippedItems.length} / {character.inventory.size})</h2>

          {unequippedItems.length === 0 ? (
            <div style={styles.inventoryEmpty}>
              Инвентарь пуст. Пройдите подземелье, чтобы получить предметы!
            </div>
          ) : (
            <div style={styles.inventoryGrid}>
              {unequippedItems.map((invItem) => {
                const sellPrice = Math.floor(invItem.item.price * 0.5);
                return (
                  <div
                    key={invItem.id}
                    style={styles.inventoryItem}
                  >
                    <div style={styles.itemHeader}>
                      <div style={styles.itemIcon}>{SLOT_ICONS[invItem.item.type]}</div>
                      <div style={styles.itemBadge}>{SLOT_NAMES[invItem.item.type]}</div>
                    </div>

                    <div style={styles.itemName}>
                      {invItem.item.name}
                      {invItem.enhancement > 0 && <span style={styles.enhancement}> +{invItem.enhancement}</span>}
                    </div>

                    <div style={styles.itemStats}>
                      {invItem.item.damage > 0 && <div>Урон: {invItem.item.damage}</div>}
                      {invItem.item.armor > 0 && <div>Броня: {invItem.item.armor}</div>}
                      {invItem.item.bonusStr > 0 && <div>Сила: +{invItem.item.bonusStr}</div>}
                      {invItem.item.bonusAgi > 0 && <div>Ловк: +{invItem.item.bonusAgi}</div>}
                      {invItem.item.bonusInt > 0 && <div>Инт: +{invItem.item.bonusInt}</div>}
                      {(invItem.item.minLevel > 1 || invItem.item.minStrength > 0 || invItem.item.minAgility > 0 || invItem.item.minIntelligence > 0) && (
                        <div style={{ color: '#f44336', marginTop: '5px', fontSize: '11px', borderTop: '1px solid #444', paddingTop: '5px' }}>
                          <div style={{ fontWeight: 'bold' }}>Требования:</div>
                          {invItem.item.minLevel > 1 && <div>Уровень: {invItem.item.minLevel}</div>}
                          {invItem.item.minStrength > 0 && <div>Сила: {invItem.item.minStrength}</div>}
                          {invItem.item.minAgility > 0 && <div>Ловкость: {invItem.item.minAgility}</div>}
                          {invItem.item.minIntelligence > 0 && <div>Интеллект: {invItem.item.minIntelligence}</div>}
                        </div>
                      )}
                    </div>

                    <div style={styles.sellPrice as CSSProperties}>
                      Продажа: {sellPrice} золота
                    </div>

                    <div style={styles.buttonContainer as CSSProperties}>
                      <button
                        style={styles.equipButton}
                        onClick={() => handleEquip(invItem)}
                      >
                        Надеть
                      </button>
                      <button
                        style={styles.sellButton}
                        onClick={(e) => handleSell(invItem, e)}
                      >
                        Продать
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Link to="/dashboard" style={styles.backLink}>
        <button style={styles.backButton}>← Вернуться на базу</button>
      </Link>
    </div>
  );
};

export default Inventory;