import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useEnhanceItemMutation } from '../../store/api/characterApi';
import { ItemIcon } from '../common/ItemIcon';

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
  const [scrollInSlot, setScrollInSlot] = useState<any | null>(null); // TODO: добавить тип ScrollItem
  const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistoryEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [enhanceItem, { isLoading: isEnhancing }] = useEnhanceItemMutation();

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const itemData = e.dataTransfer.getData('inventory-item');
    if (itemData) {
      const item: InventoryItem = JSON.parse(itemData);
      onItemChange(item);
    }
  };

  const handleUpgrade = async () => {
    if (!itemInSlot || isEnhancing) return;

    try {
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
        ...prev.slice(0, 9), // Храним последние 10 записей
      ]);

      // Сбрасываем предмет из слота после улучшения
      onItemChange(null);
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
    <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-6 relative h-full flex flex-col">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

      <div className="flex flex-col gap-4 h-full">
        {/* Top Row - Name Item and Update Scroll */}
        <div className="grid grid-cols-2 gap-4">
          {/* Name Item */}
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2 flex items-center justify-center">
            <span className="text-amber-200 uppercase tracking-wider text-sm" style={{ fontFamily: 'serif' }}>
              {itemInSlot ? `${itemInSlot.item.name} +${itemInSlot.enhancement}` : 'name item'}
            </span>
          </div>
          {/* Update Scroll */}
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2 flex items-center justify-center">
            <span className="text-amber-200 uppercase tracking-wider text-sm" style={{ fontFamily: 'serif' }}>
              {scrollInSlot ? scrollInSlot.name : 'update scroll'}
            </span>
          </div>
        </div>

        {/* Middle Row - Item Slot and Scroll Slot */}
        <div className="grid grid-cols-2 gap-4">
          {/* Item Slot */}
          <div
            className={`aspect-square border-2 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all relative overflow-hidden cursor-pointer ${
              isDragOver ? 'border-green-500/80 bg-green-950/30' : 'border-amber-800/40'
            }`}
            onClick={() => onItemChange(null)} // Клик убирает предмет
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-amber-700/30 rounded-lg m-1">
                <span className="text-amber-300/40 text-xs text-center" style={{ fontFamily: 'serif' }}>
                  Drop Item<br/>Here
                </span>
              </div>
            )}
          </div>

          {/* Scroll Slot */}
          <div
            className="aspect-square border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all relative overflow-hidden cursor-pointer"
            onClick={() => setScrollInSlot(null)} // Временно - клик убирает свиток
          >
            {scrollInSlot ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <span className="text-amber-300 text-sm text-center" style={{ fontFamily: 'serif' }}>
                  {scrollInSlot.name}
                </span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-amber-700/30 rounded-lg m-1">
                <span className="text-amber-300/40 text-xs text-center" style={{ fontFamily: 'serif' }}>
                  Scroll Slot
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={!itemInSlot || isEnhancing}
          className={`border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 py-4 relative transition-all group ${
            !itemInSlot || isEnhancing ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-700/70 cursor-pointer'
          }`}
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

          <span className="text-3xl uppercase tracking-[0.3em]" style={{
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {isEnhancing ? 'Upgrading...' : 'Upgrade'}
          </span>
        </button>

        {/* History Section */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* History Header */}
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2">
            <h3 className="text-amber-200 uppercase tracking-wider text-center text-xs" style={{ fontFamily: 'serif' }}>
              История улучшений
            </h3>
          </div>

          {/* History List */}
          <div className="flex-1 border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 p-3 overflow-y-auto min-h-0">
            {upgradeHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-amber-200/40 text-xs" style={{ fontFamily: 'serif' }}>
                  История пуста
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upgradeHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`text-xs ${entry.success ? 'text-green-400' : 'text-red-400'}`}
                    style={{ fontFamily: 'serif' }}
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
