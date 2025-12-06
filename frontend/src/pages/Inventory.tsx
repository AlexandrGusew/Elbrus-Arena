import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useEquipItemMutation, useUnequipItemMutation, useSellItemMutation } from '../store/api/characterApi';
import type { InventoryItem } from '../types/api';
import type { ItemType } from '../../../shared/types/enums';
import { styles } from './Inventory.styles';
import { StatsCalculator } from '../utils/statsCalculator';

// Импорт изображений для слотов
import weaponImg from '../assets/inventory-pers/weapon.png';
import helmetImg from '../assets/inventory-pers/helmet.png';
import armorImg from '../assets/inventory-pers/armor.png';
import beltsImg from '../assets/inventory-pers/belt.png';
import bootsImg from '../assets/inventory-pers/boots.png';
import ringImg from '../assets/inventory-pers/ring.png';

const SLOT_BACKGROUNDS: Record<ItemType, string> = {
  weapon: weaponImg,
  helmet: helmetImg,
  armor: armorImg,
  belt: beltsImg,
  legs: bootsImg,
  accessory: ringImg,
  potion: ringImg, // используем ring как заглушку
  shield: weaponImg, // используем weapon как заглушку
  offhand: weaponImg, // используем weapon как заглушку
  scroll: ringImg // используем ring как заглушку
};

const SLOT_ICONS: Record<ItemType, string> = {
  weapon: '⚔️',
  helmet: '🪖',
  armor: '🛡️',
  belt: '🔗',
  legs: '👖',
  accessory: '💍',
  shield: '🛡️',
  offhand: '🗡️',
  scroll: '📜'
};

const SLOT_NAMES: Record<ItemType, string> = {
  weapon: 'Оружие',
  helmet: 'Шлем',
  armor: 'Броня',
  belt: 'Пояс',
  legs: 'Штаны',
  accessory: 'Аксессуар',
  shield: 'Щит',
  offhand: 'Левая рука',
  scroll: 'Свиток'
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

  // Drag & Drop состояние
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<ItemType | null>(null);

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

  // Drag & Drop обработчики
  const handleDragStart = (e: React.DragEvent, invItem: InventoryItem) => {
    setDraggedItem(invItem);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotType: ItemType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotType);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, slotType: ItemType) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedItem || !character) return;

    // Проверка: можно ли поместить предмет в этот слот
    const isOffhandSlot = slotType === 'shield' || slotType === 'offhand';
    const itemType = draggedItem.item.type;

    // Для offhand слота принимаем shield и offhand
    if (isOffhandSlot) {
      if (itemType !== 'shield' && itemType !== 'offhand') {
        alert('Этот предмет не может быть экипирован в offhand слот');
        return;
      }
    } else if (itemType !== slotType) {
      // Для обычных слотов проверяем соответствие типа
      alert(`Этот предмет не может быть экипирован в слот ${SLOT_NAMES[slotType]}`);
      return;
    }

    // Экипируем предмет
    await handleEquip(draggedItem);
    setDraggedItem(null);
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
              const isHighlighted = dragOverSlot === slotType;

              return (
                <div
                  key={slotType}
                  style={{
                    ...styles.equipmentSlot,
                    backgroundImage: `url(${SLOT_BACKGROUNDS[slotType]})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    minHeight: '100px',
                    position: 'relative',
                    ...(isHighlighted && {
                      border: '2px solid #4CAF50',
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease'
                    })
                  }}
                  onDragOver={(e) => handleDragOver(e, slotType)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, slotType)}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    gap: '12px'
                  }}>
                    <div style={{...styles.slotIcon, textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>{SLOT_ICONS[slotType]}</div>
                    <div style={styles.slotContent}>
                      <div style={{...styles.slotName, textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{SLOT_NAMES[slotType]}</div>
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
                        <div style={{...styles.slotEmpty, textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Пусто</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offhand слот - специальный слот для специализаций */}
          <div style={{
            background: 'linear-gradient(135deg, #3a2a4e 0%, #2a1a3e 100%)',
            padding: '15px',
            borderRadius: '10px',
            marginTop: '15px',
            border: '2px solid #6a4a8a'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '14px' }}>
              Offhand слот {character.specialization ? '(разблокирован)' : '(требуется Tier 1 специализация)'}
            </h3>
            {(() => {
              const offhandItem = getEquippedItemByType('shield') || getEquippedItemByType('offhand');
              const offhandSlotType: ItemType = 'offhand';
              const isOffhandHighlighted = dragOverSlot === offhandSlotType;

              return (
                <div
                  style={{
                    ...styles.equipmentSlot,
                    backgroundImage: `url(${SLOT_BACKGROUNDS[offhandSlotType]})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    minHeight: '100px',
                    position: 'relative',
                    ...(isOffhandHighlighted && {
                      border: '2px solid #9C27B0',
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease'
                    })
                  }}
                  onDragOver={(e) => handleDragOver(e, offhandSlotType)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, offhandSlotType)}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    gap: '12px'
                  }}>
                    <div style={{...styles.slotIcon, textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                      {offhandItem ? SLOT_ICONS[offhandItem.item.type] : '🔒'}
                    </div>
                    <div style={styles.slotContent}>
                      <div style={{...styles.slotName, textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                        {offhandItem ? SLOT_NAMES[offhandItem.item.type] : 'Левая рука'}
                      </div>
                      {offhandItem ? (
                        <div
                          style={styles.slotItem}
                          onClick={() => handleEquip(offhandItem)}
                        >
                          <div style={styles.slotItemName}>
                            {offhandItem.item.name}
                            {offhandItem.enhancement > 0 && ` +${offhandItem.enhancement}`}
                          </div>
                          <div style={styles.slotItemStats}>
                            {offhandItem.item.damage > 0 && `Урон: ${offhandItem.item.damage} `}
                            {offhandItem.item.armor > 0 && `Броня: ${offhandItem.item.armor}`}
                          </div>
                        </div>
                      ) : (
                        <div style={{...styles.slotEmpty, textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                          {character.specialization ? 'Пусто' : 'Заблокирован'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
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
              {(() => {
                // Группируем предметы по названию, типу и уровню заточки
                const groupedItems = unequippedItems.reduce((acc, invItem) => {
                  const key = `${invItem.item.name}_${invItem.item.type}_${invItem.enhancement || 0}`;
                  
                  if (!acc[key]) {
                    acc[key] = {
                      items: [invItem],
                      firstItem: invItem,
                    };
                  } else {
                    acc[key].items.push(invItem);
                  }
                  
                  return acc;
                }, {} as Record<string, { items: InventoryItem[]; firstItem: InventoryItem }>);

                // Преобразуем объект в массив для отображения
                const itemsArray = Object.values(groupedItems);
                
                // Отладка: выводим информацию о группировке
                console.log('📦 Группировка предметов:', {
                  totalItems: unequippedItems.length,
                  groupedItems: itemsArray.length,
                  groups: itemsArray.map(g => ({
                    name: g.firstItem.item.name,
                    count: g.items.length,
                    enhancement: g.firstItem.enhancement
                  }))
                });

                return itemsArray.map((group, index) => {
                  const invItem = group.firstItem;
                  const sellPrice = Math.floor(invItem.item.price * 0.5);
                  
                  return (
                    <div
                      key={`${invItem.item.name}_${invItem.item.type}_${invItem.enhancement || 0}_${index}`}
                      style={{
                        ...styles.inventoryItem,
                        position: 'relative',
                        ...(draggedItem?.id === invItem.id && {
                          opacity: 0.5,
                          transform: 'scale(0.95)',
                        })
                      }}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, invItem)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Счетчик количества в верхнем правом углу */}
                      {group.items.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                          color: '#000',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '2px solid #ffd700',
                          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.5)',
                          zIndex: 100,
                          minWidth: '32px',
                          textAlign: 'center',
                          lineHeight: '1',
                        }}>
                          ×{group.items.length}
                        </div>
                      )}

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
                });
              })()}
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