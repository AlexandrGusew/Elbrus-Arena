import { useState, useEffect } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useUnequipItemMutation } from '../../store/api/characterApi';
import { ItemIcon } from '../common/ItemIcon';
import { dashboardColors, dashboardFonts, dashboardEffects, cornerOrnaments, cardStyle, gradientTextStyle, dashboardBorders } from '../../styles/dashboard.styles';

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
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  // Функция для генерации блока характеристики
  const renderStatBlock = (label: string, value: number | string) => (
    <div style={{
      border: `1px solid ${dashboardColors.borderAmber}`,
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
          color: dashboardColors.textRedLight,
        }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
          style={{
            ...cardStyle,
            border: `3px solid ${dashboardColors.borderRed}`,
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = dashboardColors.borderRed;
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
            border: `3px solid ${!showForge ? dashboardColors.borderRedHover : dashboardColors.borderRed}`,
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
              e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
            }
          }}
          onMouseLeave={(e) => {
            if (showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderRed;
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
            border: `3px solid ${showForge ? dashboardColors.borderRedHover : dashboardColors.borderRed}`,
            padding: '14px 36px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            if (!showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderRedHover;
            }
          }}
          onMouseLeave={(e) => {
            if (!showForge) {
              e.currentTarget.style.borderColor = dashboardColors.borderRed;
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
        border: `2px solid ${dashboardColors.borderAmber}`,
        padding: '16px',
        display: 'flex',
        gap: '16px',
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
          borderTop: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderAmber}`,
          borderRight: `${dashboardBorders.cornerBorder} solid ${dashboardColors.borderAmber}`,
        }}></div>

        {/* Левая панель - изображение предмета */}
        <div style={{
          width: '150px',
          height: '150px',
          minWidth: '150px',
          border: `1px solid ${dashboardColors.borderAmber}`,
          borderRadius: '8px',
          background: dashboardColors.backgroundDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {selectedItem ? (
            <ItemIcon
              item={selectedItem.item}
              size="large"
              enhancement={selectedItem.enhancement}
            />
          ) : (
            <span style={{
              color: dashboardColors.textRed,
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
              border: `1px solid ${dashboardColors.borderAmber}`,
              borderRadius: '8px',
              background: dashboardColors.backgroundDark,
              padding: '20px 12px',
              textAlign: 'center',
            }}>
              <span style={{
                color: dashboardColors.textRed,
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
                border: `1px solid ${dashboardColors.borderAmber}`,
                borderRadius: '8px',
                background: dashboardColors.backgroundDark,
                padding: '10px 12px',
              }}>
                <span style={{
                  color: dashboardColors.textRed,
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
          border: `3px solid ${isInventoryDropZone ? 'rgba(34, 197, 94, 0.8)' : dashboardColors.borderRed}`,
          background: isInventoryDropZone ? 'rgba(20, 83, 45, 0.3)' : cardStyle.background,
          height: '560px',
          padding: '20px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div style={cornerOrnaments.topLeft}></div>
        <div style={cornerOrnaments.topRight}></div>
        <div style={cornerOrnaments.bottomLeft}></div>
        <div style={cornerOrnaments.bottomRight}></div>

        <div className="grid grid-cols-8 gap-3 overflow-y-auto h-full" style={{ maxHeight: '100%', paddingRight: '8px' }}>
          {unequippedItems.map((invItem) => (
            <div
              key={invItem.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, invItem)}
              onDragEnd={handleDragEnd}
              onClick={() => handleItemClick(invItem)}
              style={{
                border: `2px solid ${selectedItem?.id === invItem.id || forgeItemSlot?.id === invItem.id ? dashboardColors.borderRed : dashboardColors.borderAmber}`,
                borderRadius: '8px',
                background: cardStyle.background,
                transition: 'all 0.3s ease',
                cursor: 'move',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                padding: '4px',
                opacity: draggedItem?.id === invItem.id ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (selectedItem?.id !== invItem.id && forgeItemSlot?.id !== invItem.id) {
                  e.currentTarget.style.borderColor = dashboardColors.borderRed;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedItem?.id !== invItem.id && forgeItemSlot?.id !== invItem.id) {
                  e.currentTarget.style.borderColor = dashboardColors.borderAmber;
                }
              }}
              style={{ height: 'fit-content' }}
            >
              <ItemIcon
                item={invItem.item}
                size="small"
                enhancement={invItem.enhancement}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
