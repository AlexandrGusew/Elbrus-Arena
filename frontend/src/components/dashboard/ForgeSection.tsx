import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useEnhanceItemMutation, useEnhanceItemWithScrollMutation } from '../../store/api/characterApi';
import { ItemIcon } from '../common/ItemIcon';
import { dashboardColors, dashboardFonts, dashboardEffects, cornerOrnaments, cardStyle, gradientTextStyle } from '../../styles/dashboard.styles';

interface ForgeSectionProps {
  character: Character;
  onClose?: () => void;
  itemInSlot: InventoryItem | null;
  onItemChange: (item: InventoryItem | null) => void;
}

interface UpgradeHistoryEntry {
  id: number;
  timestamp: Date;
  message: string;
  success: boolean;
}

export function ForgeSection({ character, onClose, itemInSlot, onItemChange }: ForgeSectionProps) {
  const [scrollInSlot, setScrollInSlot] = useState<InventoryItem | null>(null);
  const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistoryEntry[]>([]);
  const [isDragOverItem, setIsDragOverItem] = useState(false);
  const [isDragOverScroll, setIsDragOverScroll] = useState(false);

  const [enhanceItem, { isLoading: isEnhancing }] = useEnhanceItemMutation();
  const [enhanceItemWithScroll, { isLoading: isEnhancingWithScroll }] = useEnhanceItemWithScrollMutation();

  // Drag & Drop handlers для слота предмета
  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverItem(true);
  };

  const handleItemDragLeave = () => {
    setIsDragOverItem(false);
  };

  const handleItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverItem(false);

    const itemData = e.dataTransfer.getData('inventory-item');
    if (itemData) {
      const item: InventoryItem = JSON.parse(itemData);
      // Не позволяем класть свитки в слот предмета
      if (item.item.type !== 'scroll') {
        onItemChange(item);
      }
    }
  };

  // Drag & Drop handlers для слота свитка
  const handleScrollDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverScroll(true);
  };

  const handleScrollDragLeave = () => {
    setIsDragOverScroll(false);
  };

  const handleScrollDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverScroll(false);

    const itemData = e.dataTransfer.getData('inventory-item');
    if (itemData) {
      const item: InventoryItem = JSON.parse(itemData);
      // Только свитки можно класть в слот свитка
      if (item.item.type === 'scroll') {
        setScrollInSlot(item);
      }
    }
  };

  const handleUpgrade = async () => {
    if (!itemInSlot || isEnhancing || isEnhancingWithScroll) return;

    try {
      // Если есть свиток - используем его (гарантированный успех)
      if (scrollInSlot) {
        const result = await enhanceItemWithScroll({
          characterId: character.id,
          inventoryItemId: itemInSlot.id,
          scrollItemId: scrollInSlot.id,
        }).unwrap();

        const message = `Успешное улучшение со свитком: ${result.itemName}+${itemInSlot.enhancement} → +${result.newEnhancementLevel}`;

        setUpgradeHistory(prev => [
          {
            id: Date.now(),
            timestamp: new Date(),
            message,
            success: true,
          },
          ...prev.slice(0, 9),
        ]);

        // Сбрасываем предмет и свиток из слотов после улучшения
        onItemChange(null);
        setScrollInSlot(null);
      } else {
        // Если нет свитка - используем обычное улучшение за золото (20% шанс)
        const result = await enhanceItem({
          characterId: character.id,
          itemId: itemInSlot.id,
        }).unwrap();

        const message = result.success
          ? `Успешное улучшение: ${itemInSlot.item.name}+${itemInSlot.enhancement} → +${result.newEnhancement}`
          : `Неудача: ${itemInSlot.item.name}+${itemInSlot.enhancement} не удалось улучшить`;

        setUpgradeHistory(prev => [
          {
            id: Date.now(),
            timestamp: new Date(),
            message,
            success: result.success,
          },
          ...prev.slice(0, 9),
        ]);

        // Сбрасываем предмет из слота после улучшения
        onItemChange(null);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Ошибка улучшения предмета';
      setUpgradeHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          message: `Ошибка: ${errorMessage}`,
          success: false,
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  return (
    <div 
      style={{
        ...cardStyle,
        border: `3px solid ${dashboardColors.borderGold}`,
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={cornerOrnaments.topLeft}></div>
      <div style={cornerOrnaments.topRight}></div>
      <div style={cornerOrnaments.bottomLeft}></div>
      <div style={cornerOrnaments.bottomRight}></div>

      <div className="flex flex-col gap-4 h-full">
        {/* Top Row - Name Item and Update Scroll */}
        <div className="grid grid-cols-2 gap-5" style={{ overflow: 'hidden' }}>
          {/* Name Item */}
          <div 
            style={{
              ...cardStyle,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              color: dashboardColors.textGold,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '13px',
              fontFamily: dashboardFonts.primary,
            }}>
              {itemInSlot ? `${itemInSlot.item.name} +${itemInSlot.enhancement}` : 'name item'}
            </span>
          </div>
          {/* Update Scroll */}
          <div 
            style={{
              ...cardStyle,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <span style={{
              color: dashboardColors.textGold,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '13px',
              fontFamily: dashboardFonts.primary,
            }}>
              {scrollInSlot ? scrollInSlot.item.name : 'update scroll'}
            </span>
          </div>
        </div>

        {/* Middle Row - Item Slot and Scroll Slot */}
        <div className="grid grid-cols-2 gap-5" style={{ overflow: 'hidden' }}>
          {/* Item Slot */}
          <div
            style={{
              aspectRatio: '1',
              border: `2px solid ${isDragOverItem ? 'rgba(34, 197, 94, 0.8)' : dashboardColors.borderAmber}`,
              borderRadius: '8px',
              background: isDragOverItem ? 'rgba(20, 83, 45, 0.3)' : cardStyle.background,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isDragOverItem) {
                e.currentTarget.style.borderColor = dashboardColors.borderGold;
              }
            }}
            onMouseLeave={(e) => {
              if (!isDragOverItem) {
                e.currentTarget.style.borderColor = dashboardColors.borderAmber;
              }
            }}
            onClick={() => onItemChange(null)} // Клик убирает предмет
            onDragOver={handleItemDragOver}
            onDragLeave={handleItemDragLeave}
            onDrop={handleItemDrop}
          >
            {itemInSlot ? (
              <div className="w-full h-full flex items-center justify-center p-2">
                <ItemIcon
                  item={itemInSlot.item}
                  size="medium"
                  showName={true}
                  enhancement={itemInSlot.enhancement}
                />
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${dashboardColors.borderGold}`,
                borderRadius: '8px',
                margin: '4px',
                opacity: 0.3,
              }}>
                <span style={{
                  color: dashboardColors.textGold,
                  fontSize: '11px',
                  textAlign: 'center',
                  fontFamily: dashboardFonts.primary,
                }}>
                  Drop Item<br/>Here
                </span>
              </div>
            )}
          </div>

          {/* Scroll Slot */}
          <div
            style={{
              aspectRatio: '1',
              border: `2px solid ${isDragOverScroll ? 'rgba(34, 197, 94, 0.8)' : dashboardColors.borderAmber}`,
              borderRadius: '8px',
              background: isDragOverScroll ? 'rgba(20, 83, 45, 0.3)' : cardStyle.background,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isDragOverScroll) {
                e.currentTarget.style.borderColor = dashboardColors.borderGold;
              }
            }}
            onMouseLeave={(e) => {
              if (!isDragOverScroll) {
                e.currentTarget.style.borderColor = dashboardColors.borderAmber;
              }
            }}
            onClick={() => setScrollInSlot(null)} // Клик убирает свиток
            onDragOver={handleScrollDragOver}
            onDragLeave={handleScrollDragLeave}
            onDrop={handleScrollDrop}
          >
            {scrollInSlot ? (
              <div className="w-full h-full flex items-center justify-center p-2">
                <ItemIcon
                  item={scrollInSlot.item}
                  size="medium"
                  showName={true}
                  enhancement={scrollInSlot.enhancement}
                />
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${dashboardColors.borderGold}`,
                borderRadius: '8px',
                margin: '4px',
                opacity: 0.3,
              }}>
                <span style={{
                  color: dashboardColors.textGold,
                  fontSize: '11px',
                  textAlign: 'center',
                  fontFamily: dashboardFonts.primary,
                }}>
                  Drop Scroll<br/>Here
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={!itemInSlot || isEnhancing || isEnhancingWithScroll}
          style={{
            ...cardStyle,
            border: `3px solid ${dashboardColors.borderGold}`,
            padding: '18px',
            position: 'relative',
            transition: 'all 0.3s ease',
            opacity: (!itemInSlot || isEnhancing || isEnhancingWithScroll) ? 0.5 : 1,
            cursor: (!itemInSlot || isEnhancing || isEnhancingWithScroll) ? 'not-allowed' : 'pointer',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            if (itemInSlot && !isEnhancing && !isEnhancingWithScroll) {
              e.currentTarget.style.borderColor = dashboardColors.borderBronze;
            }
          }}
          onMouseLeave={(e) => {
            if (itemInSlot && !isEnhancing && !isEnhancingWithScroll) {
              e.currentTarget.style.borderColor = dashboardColors.borderGold;
            }
          }}
        >
          <div style={cornerOrnaments.topLeft}></div>
          <div style={cornerOrnaments.topRight}></div>
          <div style={cornerOrnaments.bottomLeft}></div>
          <div style={cornerOrnaments.bottomRight}></div>

          <span style={{
            fontSize: '28px',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            ...gradientTextStyle,
          }}>
            {isEnhancing || isEnhancingWithScroll ? 'Upgrading...' : 'Upgrade'}
          </span>
        </button>

        {/* History Section */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* History Header */}
          <div 
            style={{
              ...cardStyle,
              padding: '12px 18px',
              overflow: 'hidden',
            }}
          >
            <h3 style={{
              color: dashboardColors.textGold,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textAlign: 'center',
              fontSize: '11px',
              fontFamily: dashboardFonts.primary,
            }}>
              История улучшений
            </h3>
          </div>

          {/* History List */}
          <div 
            style={{
              ...cardStyle,
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {upgradeHistory.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
                <span style={{
                  color: dashboardColors.textGold,
                  opacity: 0.4,
                  fontSize: '11px',
                  fontFamily: dashboardFonts.primary,
                }}>
                  История пуста
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {upgradeHistory.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      fontSize: '11px',
                      color: entry.success ? '#4ade80' : '#f87171',
                      fontFamily: dashboardFonts.primary,
                    }}
                  >
                    {entry.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
