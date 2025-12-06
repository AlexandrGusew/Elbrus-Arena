import { useState, useEffect } from 'react';
import type { Character, InventoryItem, Item, ItemType } from '../../types/api';
import { useUnequipItemMutation, useEquipItemMutation } from '../../store/api/characterApi';
import { ItemIcon } from '../common/ItemIcon';
import { dashboardColors, dashboardFonts, cornerOrnaments, cardStyle, gradientTextStyle, dashboardBorders } from '../../styles/dashboard.styles';
import { getAssetUrl } from '../../utils/assetUrl';

interface InventorySectionProps {
  character: Character;
  onNavigateToForge?: () => void;
  showForge?: boolean;
  onNavigateToInventory?: () => void;
  onBack?: () => void;
  forgeItemSlot?: InventoryItem | null;
  onForgeItemSelect?: (item: InventoryItem | null) => void;
  selectedItem?: InventoryItem | null;
  onItemSelect?: (item: InventoryItem | null) => void;
}

export function InventorySection({
  character,
  onNavigateToForge,
  showForge,
  onNavigateToInventory,
  onBack,
  forgeItemSlot,
  onForgeItemSelect,
  selectedItem: selectedItemProp,
  onItemSelect
}: InventorySectionProps) {
  // Используем переданный selectedItem или локальное состояние как fallback (для обратной совместимости)
  const [localSelectedItem, setLocalSelectedItem] = useState<InventoryItem | null>(null);
  // Если selectedItemProp передан (даже если null), используем его, иначе используем локальное состояние
  const selectedItem = selectedItemProp !== undefined ? selectedItemProp : localSelectedItem;
  const setSelectedItem = onItemSelect ? onItemSelect : setLocalSelectedItem;

  // Helper функция для применения бонуса от заточки
  // Формула: baseStat + (baseStat * enhancement * 0.1)
  // +1 = +10%, +2 = +20%, +3 = +30%
  const applyEnhancementBonus = (baseStat: number, enhancement: number): number => {
    if (enhancement === 0 || baseStat === 0) return baseStat;
    return Math.floor(baseStat + (baseStat * enhancement * 0.1));
  };
  
  // Отладка: логируем изменения selectedItem
  useEffect(() => {
    console.log('InventorySection: selectedItemProp =', selectedItemProp?.item?.name || 'null/undefined');
    console.log('InventorySection: selectedItem =', selectedItem?.item?.name || 'null');
    console.log('InventorySection: onItemSelect =', onItemSelect ? 'defined' : 'undefined');
  }, [selectedItemProp, selectedItem, onItemSelect]);
  
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [isInventoryDropZone, setIsInventoryDropZone] = useState(false);

  const [unequipItem] = useUnequipItemMutation();
  const [equipItem] = useEquipItemMutation();

  // Получаем items из инвентаря персонажа
  const inventoryItems = character.inventory?.items || [];

  // Фильтруем только не надетые предметы
  const unequippedItems = inventoryItems.filter(invItem => !invItem.isEquipped);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, invItem: InventoryItem) => {
    setDraggedItem(invItem);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('inventory-item', JSON.stringify(invItem));
    // Останавливаем всплытие события, чтобы клик не мешал drag & drop
    e.stopPropagation();
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleItemClick = (invItem: InventoryItem) => {
    // Игнорируем клик, если был drag (проверяем через draggedItem)
    if (draggedItem) {
      return;
    }
    setSelectedItem(invItem);
    // Если кузница открыта и есть callback - помещаем предмет в кузницу
    // НО: свитки НЕ помещаем в слот предмета (только через drag & drop в слот свитка)
    if (showForge && onForgeItemSelect && invItem.item.type !== 'scroll') {
      onForgeItemSelect(invItem);
    }
  };

  // Drop handlers для снятия экипировки
  const handleInventoryDragOver = (e: React.DragEvent) => {
    // Проверяем, что перетаскивается надетый предмет
    const equippedItemData = e.dataTransfer.types.includes('equipped-item');
    if (equippedItemData) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsInventoryDropZone(true);
    }
  };

  const handleInventoryDragLeave = (e: React.DragEvent) => {
    // Проверяем, что мы действительно покинули область инвентаря
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsInventoryDropZone(false);
    }
  };

  const handleInventoryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsInventoryDropZone(false);

    const equippedItemData = e.dataTransfer.getData('equipped-item');
    if (!equippedItemData) return;

    const item: InventoryItem = JSON.parse(equippedItemData);

    // Снимаем предмет
    try {
      await unequipItem({ characterId: character.id, itemId: item.id }).unwrap();
    } catch (error: unknown) {
      console.error('Error unequipping item:', error);
      const anyError = error as { data?: { message?: string }; message?: string } | undefined;
      const message = anyError?.data?.message || anyError?.message || 'Не удалось снять предмет';
      alert(message);
    }
  };

  // Функция для генерации блока характеристики
  const renderStatBlock = (label: string, value: number | string) => (
    <div style={{
      border: `1px solid ${dashboardColors.borderGold}`,
      borderRadius: '8px',
      background: dashboardColors.backgroundDark,
      padding: '10px 12px',
      minHeight: '40px',
    }}>
      <div style={{
        color: dashboardColors.textGold,
        fontSize: '12px',
        fontFamily: dashboardFonts.secondary,
        letterSpacing: '0.5px',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
      }}>
        <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ 
          flex: 1, 
          overflow: 'hidden',
          textAlign: 'center',
          padding: '0 4px',
          opacity: 0.6,
          fontSize: '14px',
          lineHeight: '12px',
          whiteSpace: 'nowrap',
        }}>{'.'.repeat(50)}</span>
        <span style={{ 
          whiteSpace: 'nowrap',
          fontSize: '18px',
          fontWeight: 'bold',
          color: dashboardColors.textGold,
        }}>{value}</span>
      </div>
    </div>
  );

  // Маппинг типов предметов на базовые иконки из assets/items
  const ITEM_TYPE_ART: Partial<Record<ItemType, string[]>> = {
    weapon: [
      'items/swords/sword1.png',
      'items/swords/sword2.png',
      'items/swords/sword3.png',
    ],
    helmet: [
      'items/helmets/helmet1.png',
      'items/helmets/helmet2.png',
      'items/helmets/helmet3.png',
    ],
    armor: [
      'items/armors/armor1.png',
      'items/armors/armor2.png',
      'items/armors/armor3.png',
    ],
    belt: [
      'items/belts/belts1.png',
      'items/belts/belts2.png',
      'items/belts/belts3.png',
    ],
    legs: [
      'items/legs/legs1.png',
      'items/legs/legs2.png',
      'items/legs/legs3.png',
    ],
    accessory: [
      'items/accessorys/ring1.png',
      'items/accessorys/ring2.png',
      'items/accessorys/ring3.png',
    ],
  };

  const getItemArtUrl = (item: Item): string | null => {
    if (item.imageUrl) {
      // если бэкенд уже прислал путь, пробуем использовать его
      if (item.imageUrl.startsWith('http')) return item.imageUrl;
      return getAssetUrl(item.imageUrl);
    }
    const list = ITEM_TYPE_ART[item.type];
    if (!list || list.length === 0) return null;
    const index = item.id % list.length;
    return getAssetUrl(list[index]);
  };

  const selectedItemArtUrl = selectedItem ? getItemArtUrl(selectedItem.item) : null;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header with Navigation */}
      <div
        className="flex items-center gap-4"
        style={{
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
          style={{
            ...cardStyle,
            border: `3px solid ${dashboardColors.borderGold}`,
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = dashboardColors.borderBronze;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = dashboardColors.borderGold;
          }}
          >
            <div style={cornerOrnaments.topLeft}></div>
            <div style={cornerOrnaments.topRight}></div>
            <div style={cornerOrnaments.bottomLeft}></div>
            <div style={cornerOrnaments.bottomRight}></div>

            <span style={{
              fontSize: '24px',
              ...gradientTextStyle,
            }}>←</span>
          </button>
        )}

        <button
          onClick={onNavigateToInventory}
          style={{
            ...cardStyle,
            border: `3px solid ${!showForge ? dashboardColors.borderBronze : dashboardColors.borderGold}`,
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            if (showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderBronze;
            }
          }}
          onMouseLeave={(e) => {
            if (showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderGold;
            }
          }}
        >
          <div style={cornerOrnaments.topLeft}></div>
          <div style={cornerOrnaments.topRight}></div>
          <div style={cornerOrnaments.bottomLeft}></div>
          <div style={cornerOrnaments.bottomRight}></div>

          <span style={{
            fontSize: '18px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            ...gradientTextStyle,
          }}>Inventory</span>
        </button>

        {onNavigateToForge && (
          <button
            onClick={onNavigateToForge}
          style={{
            ...cardStyle,
            border: `3px solid ${showForge ? dashboardColors.borderBronze : dashboardColors.borderGold}`,
            padding: '14px 36px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            if (!showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderBronze;
            }
          }}
          onMouseLeave={(e) => {
            if (!showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderGold;
            }
          }}
          >
            <div style={cornerOrnaments.topLeft}></div>
            <div style={cornerOrnaments.topRight}></div>
            <div style={cornerOrnaments.bottomLeft}></div>
            <div style={cornerOrnaments.bottomRight}></div>

            <span style={{
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              ...gradientTextStyle,
            }}>Forge</span>
          </button>
        )}
      </div>

      {/* Item Details Section - в стиле референса */}
      <div style={{
        ...cardStyle,
        border: `2px solid ${dashboardColors.borderGold}`,
        padding: '16px',
        display: 'flex',
        gap: '16px',
        width: 'calc(100% - 20px)',
        maxWidth: 'calc(100% - 20px)',
        boxSizing: 'border-box',
      }}>
        {/* Декоративные уголки */}
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: dashboardBorders.cornerSize,
          height: dashboardBorders.cornerSize,
          borderTop: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
          borderRight: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderGold}`,
        }}></div>

        {/* Левая панель - изображение предмета */}
        <div style={{
          width: '150px',
          height: '150px',
          minWidth: '150px',
          border: `1px solid ${dashboardColors.borderGold}`,
          borderRadius: '8px',
          background: dashboardColors.backgroundDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {selectedItem ? (
            selectedItemArtUrl ? (
              <img
                src={selectedItemArtUrl}
                alt={selectedItem.item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.85))',
                }}
              />
            ) : (
              <ItemIcon
                item={selectedItem.item}
                size="large"
                enhancement={selectedItem.enhancement}
              />
            )
          ) : (
            <span style={{
              color: dashboardColors.textGold,
              fontSize: '11px',
              textTransform: 'uppercase',
              textAlign: 'center',
              fontFamily: dashboardFonts.secondary,
              opacity: 0.4,
            }}>
              IMAGE<br/>ITEM
            </span>
          )}
        </div>

        {/* Правая панель - информация о предмете */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {!selectedItem ? (
            // Placeholder когда предмет не выбран
            <div style={{
              border: `1px solid ${dashboardColors.borderGold}`,
              borderRadius: '8px',
              background: dashboardColors.backgroundDark,
              padding: '20px 12px',
              textAlign: 'center',
            }}>
              <span style={{
                color: dashboardColors.textGold,
                fontSize: '13px',
                textTransform: 'uppercase',
                fontFamily: dashboardFonts.secondary,
                opacity: 0.5,
              }}>
                Выберите предмет
              </span>
            </div>
          ) : (
            <>
              {/* Название предмета - всегда показываем если предмет выбран */}
              <div style={{
                border: `1px solid ${dashboardColors.borderGold}`,
                borderRadius: '8px',
                background: dashboardColors.backgroundDark,
                padding: '10px 12px',
              }}>
                <span style={{
                  color: dashboardColors.textGold,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  fontFamily: dashboardFonts.secondary,
                }}>
                  {selectedItem.item.name}
                  {selectedItem.enhancement > 0 && ` +${selectedItem.enhancement}`}
                </span>
              </div>

              {/* Динамически генерируем блоки только для характеристик со значениями > 0 */}
              {selectedItem.item.damage > 0 && renderStatBlock('DAMAGE', applyEnhancementBonus(selectedItem.item.damage, selectedItem.enhancement))}
              {selectedItem.item.armor > 0 && renderStatBlock('ARMOR', applyEnhancementBonus(selectedItem.item.armor, selectedItem.enhancement))}
              {selectedItem.item.bonusStr > 0 && renderStatBlock('STR', `+${applyEnhancementBonus(selectedItem.item.bonusStr, selectedItem.enhancement)}`)}
              {selectedItem.item.bonusAgi > 0 && renderStatBlock('AGI', `+${applyEnhancementBonus(selectedItem.item.bonusAgi, selectedItem.enhancement)}`)}
              {selectedItem.item.bonusInt > 0 && renderStatBlock('INT', `+${applyEnhancementBonus(selectedItem.item.bonusInt, selectedItem.enhancement)}`)}

              {/* Уровень использования - показываем если minLevel > 1 */}
              {selectedItem.item.minLevel > 1 && renderStatBlock('LEVEL', selectedItem.item.minLevel)}

              {/* GOLD - всегда показываем если предмет выбран */}
              {renderStatBlock('GOLD', selectedItem.item.price)}

              {/* Кнопки "Надеть" / "Снять" */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {!selectedItem.isEquipped && (
                  <button
                    onClick={async () => {
                      try {
                        await equipItem({ characterId: character.id, itemId: selectedItem.id }).unwrap();
                      } catch (error: unknown) {
                        console.error('Error equipping item from details:', error);
                        const anyError = error as { data?: { message?: string }; message?: string } | undefined;
                        const message = anyError?.data?.message || anyError?.message || 'Не удалось надеть предмет';
                        alert(message);
                      }
                    }}
                    style={{
                      flex: 1,
                      border: `1px solid ${dashboardColors.borderGold}`,
                      borderRadius: '6px',
                      background: dashboardColors.gradientButton,
                      color: dashboardColors.textGold,
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      padding: '8px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Надеть
                  </button>
                )}
                {selectedItem.isEquipped && (
                  <button
                    onClick={async () => {
                      try {
                        await unequipItem({ characterId: character.id, itemId: selectedItem.id }).unwrap();
                      } catch (error: unknown) {
                        console.error('Error unequipping item from details:', error);
                        const anyError = error as { data?: { message?: string }; message?: string } | undefined;
                        const message = anyError?.data?.message || anyError?.message || 'Не удалось снять предмет';
                        alert(message);
                      }
                    }}
                    style={{
                      flex: 1,
                      border: `1px solid ${dashboardColors.borderBronze}`,
                      borderRadius: '6px',
                      background: 'linear-gradient(to bottom, #3b1a1a, #180808)',
                      color: dashboardColors.textGold,
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      padding: '8px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Снять
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inventory Grid */}
      <div
        onDragOver={handleInventoryDragOver}
        onDragLeave={handleInventoryDragLeave}
        onDrop={handleInventoryDrop}
        style={{ 
          ...cardStyle,
          border: `3px solid ${isInventoryDropZone ? 'rgba(34, 197, 94, 0.8)' : dashboardColors.borderGold}`,
          background: isInventoryDropZone ? 'rgba(20, 83, 45, 0.3)' : cardStyle.background,
          height: '560px',
          padding: '20px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          width: 'calc(100% - 20px)',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        {(() => {
          const totalSlots = character.inventory?.size ?? unequippedItems.length;
          const slots = Array.from({ length: totalSlots }, (_, index) => unequippedItems[index] || null);

          return (
            <div
              className="grid grid-cols-6 gap-4 overflow-y-auto h-full"
              style={{ maxHeight: '100%', paddingRight: '8px' }}
            >
              {slots.map((invItem, index) => {
                const artUrl = invItem ? getItemArtUrl(invItem.item) : null;
                const isSelected =
                  !!invItem && (selectedItem?.id === invItem.id || forgeItemSlot?.id === invItem.id);

                return (
                  <div
                    key={invItem ? `item-${invItem.id}` : `empty-${index}`}
                    draggable={!!invItem}
                    onDragStart={invItem ? (e) => handleDragStart(e, invItem) : undefined}
                    onDragEnd={invItem ? handleDragEnd : undefined}
                    onClick={invItem ? () => handleItemClick(invItem) : undefined}
                    style={{
                      borderRadius: '10px',
                      transition: 'all 0.15s ease-out',
                      cursor: invItem ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: invItem && draggedItem?.id === invItem.id ? 0.6 : 1,
                      border: invItem
                        ? `1px solid ${isSelected ? dashboardColors.borderGold : dashboardColors.borderMetal}`
                        : `1px solid rgba(255,255,255,0.04)`,
                      background: invItem
                        ? 'radial-gradient(circle at 50% 10%, rgba(201,168,106,0.18) 0, rgba(11,11,13,0.95) 55%, rgba(0,0,0,1) 100%)'
                        : 'rgba(11,11,13,0.6)',
                      boxShadow: invItem
                        ? '0 0 8px rgba(0,0,0,0.8)'
                        : '0 0 4px rgba(0,0,0,0.7) inset',
                    }}
                    onMouseEnter={(e) => {
                      if (!invItem) return;
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(-2px) scale(1.03)';
                      el.style.borderColor = dashboardColors.borderGold;
                      el.style.boxShadow = '0 0 14px rgba(201,168,106,0.45)';
                    }}
                    onMouseLeave={(e) => {
                      if (!invItem) return;
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(0) scale(1)';
                      el.style.borderColor = isSelected
                        ? dashboardColors.borderGold
                        : dashboardColors.borderMetal;
                      el.style.boxShadow = '0 0 8px rgba(0,0,0,0.8)';
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        filter: invItem && isSelected ? 'drop-shadow(0 0 10px rgba(201, 168, 106, 0.7))' : 'none',
                        opacity: invItem ? 1 : 0.15,
                      }}
                    >
                      {invItem && artUrl ? (
                        <img
                          src={artUrl}
                          alt={invItem.item.name}
                          style={{
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.8))',
                          }}
                        />
                      ) : invItem ? (
                        <ItemIcon
                          item={invItem.item}
                          size="small"
                          enhancement={invItem.enhancement}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
