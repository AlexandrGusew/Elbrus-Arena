import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useUnequipItemMutation } from '../../store/api/characterApi';
import { ItemIcon } from '../common/ItemIcon';

interface InventorySectionProps {
  character: Character;
  onNavigateToForge?: () => void;
  showForge?: boolean;
  onNavigateToInventory?: () => void;
  onBack?: () => void;
  forgeItemSlot?: InventoryItem | null;
  onForgeItemSelect?: (item: InventoryItem | null) => void;
}

export function InventorySection({
  character,
  onNavigateToForge,
  showForge,
  onNavigateToInventory,
  onBack,
  forgeItemSlot,
  onForgeItemSelect
}: InventorySectionProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
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
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleItemClick = (invItem: InventoryItem) => {
    setSelectedItem(invItem);
    // Если кузница открыта и есть callback - помещаем предмет в кузницу
    if (showForge && onForgeItemSelect) {
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
      border: '1px solid rgba(139, 69, 19, 0.8)',
      borderRadius: '8px',
      background: 'rgba(10, 10, 10, 0.5)',
      padding: '10px 12px',
      minHeight: '40px',
    }}>
      <div style={{
        color: '#d4af37',
        fontSize: '12px',
        fontFamily: "'Courier New', monospace",
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
        <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
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
            className="border-3 rounded-xl bg-gradient-to-b from-stone-950/50 to-black/50 px-6 py-4 relative transition-all group flex items-center gap-2 border-amber-700/60 hover:border-red-700/70"
          >
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

            <span className="text-2xl" style={{
              fontFamily: 'serif',
              textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
              background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>←</span>
          </button>
        )}

        <button
          onClick={onNavigateToInventory}
          className={`border-3 rounded-xl bg-gradient-to-b from-stone-950/50 to-black/50 px-6 py-4 relative transition-all group flex items-center gap-2 ${
            !showForge ? 'border-red-700/60' : 'border-amber-700/60 hover:border-red-700/70'
          }`}
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

          <span className="text-xl uppercase tracking-[0.2em]" style={{
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Inventory</span>
        </button>

        {onNavigateToForge && (
          <button
            onClick={onNavigateToForge}
            className={`border-3 rounded-xl bg-gradient-to-b from-stone-950/50 to-black/50 px-8 py-4 relative transition-all group ${
              showForge ? 'border-red-700/60' : 'border-amber-700/60 hover:border-red-700/70'
            }`}
          >
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

            <span className="text-xl uppercase tracking-[0.2em]" style={{
              fontFamily: 'serif',
              textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
              background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Forge</span>
          </button>
        )}
      </div>

      {/* Item Details Section - в стиле референса */}
      <div style={{
        border: '1px solid rgba(139, 69, 19, 0.8)',
        borderRadius: '8px',
        background: 'rgba(20, 20, 20, 0.5)',
        padding: '16px',
        display: 'flex',
        gap: '16px',
        position: 'relative',
      }}>
        {/* Декоративные уголки */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '24px',
          height: '24px',
          borderTop: '2px solid rgba(220, 38, 38, 0.8)',
          borderLeft: '2px solid rgba(220, 38, 38, 0.8)',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '24px',
          height: '24px',
          borderBottom: '2px solid rgba(220, 38, 38, 0.8)',
          borderLeft: '2px solid rgba(220, 38, 38, 0.8)',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '24px',
          height: '24px',
          borderBottom: '2px solid rgba(220, 38, 38, 0.8)',
          borderRight: '2px solid rgba(220, 38, 38, 0.8)',
        }}></div>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '24px',
          height: '24px',
          borderTop: '2px solid rgba(139, 69, 19, 0.8)',
          borderRight: '2px solid rgba(139, 69, 19, 0.8)',
        }}></div>

        {/* Левая панель - изображение предмета */}
        <div style={{
          width: '150px',
          height: '150px',
          minWidth: '150px',
          border: '1px solid rgba(139, 69, 19, 0.8)',
          borderRadius: '8px',
          background: 'rgba(10, 10, 10, 0.5)',
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
              color: '#d4af37',
              fontSize: '11px',
              textTransform: 'uppercase',
              textAlign: 'center',
              fontFamily: "'IM Fell English', serif",
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
              border: '1px solid rgba(139, 69, 19, 0.8)',
              borderRadius: '8px',
              background: 'rgba(10, 10, 10, 0.5)',
              padding: '20px 12px',
              textAlign: 'center',
            }}>
              <span style={{
                color: '#d4af37',
                fontSize: '13px',
                textTransform: 'uppercase',
                fontFamily: "'IM Fell English', serif",
                opacity: 0.5,
              }}>
                Выберите предмет
              </span>
            </div>
          ) : (
            <>
              {/* Название предмета - всегда показываем если предмет выбран */}
              <div style={{
                border: '1px solid rgba(139, 69, 19, 0.8)',
                borderRadius: '8px',
                background: 'rgba(10, 10, 10, 0.5)',
                padding: '10px 12px',
              }}>
                <span style={{
                  color: '#d4af37',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  fontFamily: "'IM Fell English', serif",
                }}>
                  {selectedItem.item.name}
                  {selectedItem.enhancement > 0 && ` +${selectedItem.enhancement}`}
                </span>
              </div>

              {/* Динамически генерируем блоки только для характеристик со значениями > 0 */}
              {selectedItem.item.damage > 0 && renderStatBlock('DAMAGE', selectedItem.item.damage)}
              {selectedItem.item.armor > 0 && renderStatBlock('ARMOR', selectedItem.item.armor)}
              {selectedItem.item.bonusStr > 0 && renderStatBlock('STR', `+${selectedItem.item.bonusStr}`)}
              {selectedItem.item.bonusAgi > 0 && renderStatBlock('AGI', `+${selectedItem.item.bonusAgi}`)}
              {selectedItem.item.bonusInt > 0 && renderStatBlock('INT', `+${selectedItem.item.bonusInt}`)}

              {/* GOLD - всегда показываем если предмет выбран */}
              {renderStatBlock('GOLD', selectedItem.item.price)}
            </>
          )}
        </div>
      </div>

      {/* Inventory Grid */}
      <div
        className={`flex-1 border-3 rounded-xl bg-gradient-to-b from-stone-950/50 to-black/50 p-6 relative transition-all ${
          isInventoryDropZone ? 'border-green-500/80 bg-green-950/30' : 'border-amber-700/60'
        }`}
        onDragOver={handleInventoryDragOver}
        onDragLeave={handleInventoryDragLeave}
        onDrop={handleInventoryDrop}
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

        <div className="grid grid-cols-4 gap-4 h-full content-start">
          {unequippedItems.map((invItem) => (
            <div
              key={invItem.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, invItem)}
              onDragEnd={handleDragEnd}
              onClick={() => handleItemClick(invItem)}
              className={`border-2 rounded-lg bg-gradient-to-b from-stone-950/50 to-black/50 hover:border-amber-600/60 transition-all cursor-move flex flex-col items-center justify-center aspect-square p-2 ${
                selectedItem?.id === invItem.id || forgeItemSlot?.id === invItem.id ? 'border-red-700/80' : 'border-amber-800/40'
              } ${draggedItem?.id === invItem.id ? 'opacity-50' : ''}`}
            >
              <ItemIcon
                item={invItem.item}
                size="small"
                enhancement={invItem.enhancement}
              />
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 12 - unequippedItems.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center aspect-square"
            >
              <span className="text-amber-300/20 text-sm">{unequippedItems.length + index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
