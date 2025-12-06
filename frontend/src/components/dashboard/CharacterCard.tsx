import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useEquipItemMutation, useUnequipItemMutation, useGetCharacterQuery, useGetLevelProgressQuery } from '../../store/api/characterApi';
import { StatsCalculator } from '../../utils/statsCalculator';
import { getAssetUrl } from '../../utils/assetUrl';
import { ItemIcon } from '../common/ItemIcon';

interface CharacterCardProps {
  character: Character;
  onEquipmentClick?: (slotType: string) => void;
  onItemSelect?: (item: InventoryItem | null) => void;
  selectedItem?: InventoryItem | null;
  onLevelBarClick?: () => void;
}

type ItemSlotType = 'WEAPON' | 'HELMET' | 'ARMOR' | 'BOOTS' | 'BELT' | 'RING';

// Маппинг типов предметов из API (lowercase) к слотам (UPPERCASE)
const itemTypeToSlot = (itemType: string): ItemSlotType | null => {
  const typeMap: Record<string, ItemSlotType> = {
    'weapon': 'WEAPON',
    'helmet': 'HELMET',
    'armor': 'ARMOR',
    'legs': 'BOOTS',
    'belt': 'BELT',
    'accessory': 'RING',
  };
  return typeMap[itemType.toLowerCase()] || null;
};

// Получение видео класса персонажа
const getClassVideo = (classType: string): string => {
  const classLower = classType.toLowerCase();
  switch (classLower) {
    case 'warrior':
      return getAssetUrl('dashboard/warrior.mp4');
    case 'rogue':
      return getAssetUrl('dashboard/sin.mp4');
    case 'mage':
      return getAssetUrl('dashboard/mag.mp4');
    default:
      return getAssetUrl('dashboard/warrior.mp4');
  }
};

export function CharacterCard({ character: characterProp, onEquipmentClick, onItemSelect, selectedItem, onLevelBarClick }: CharacterCardProps) {
  const [equipItem] = useEquipItemMutation();
  const [unequipItem] = useUnequipItemMutation();
  const [dragOverSlot, setDragOverSlot] = useState<ItemSlotType | null>(null);

  // Получаем актуальные данные персонажа через RTK Query для автоматического обновления
  const { data: characterData } = useGetCharacterQuery(characterProp.id, {
    skip: !characterProp.id,
  });

  // Получаем прогресс уровня для прогресс-бара
  const { data: levelProgress } = useGetLevelProgressQuery(characterProp.id, {
    skip: !characterProp.id,
  });

  // Используем актуальные данные, если они есть, иначе используем пропс
  const character = characterData || characterProp;

  // Вычисляем процент заполнения прогресс-бара
  const progressPercentage = levelProgress
    ? Math.min(100, (levelProgress.currentExp / levelProgress.expForNextLevel) * 100)
    : 0;

  // Получаем надетую экипировку
  const equippedItems = character.inventory?.items?.filter(item => item.isEquipped) || [];

  // Группируем экипировку по слотам с учётом маппинга типов
  const equipmentSlots = {
    WEAPON: equippedItems.find(item => itemTypeToSlot(item.item.type) === 'WEAPON'),
    HELMET: equippedItems.find(item => itemTypeToSlot(item.item.type) === 'HELMET'),
    ARMOR: equippedItems.find(item => itemTypeToSlot(item.item.type) === 'ARMOR'),
    BOOTS: equippedItems.find(item => itemTypeToSlot(item.item.type) === 'BOOTS'),
    BELT: equippedItems.find(item => itemTypeToSlot(item.item.type) === 'BELT'),
    RING: equippedItems.find(item => itemTypeToSlot(item.item.type) === 'RING'),
  };

  const handleSlotClick = (slotType: string, item?: InventoryItem) => {
    // Если есть надетый предмет - клик обрабатывается внутри предмета
    // Если слота пуст - вызываем onEquipmentClick (если есть)
    if (!item && onEquipmentClick) {
      onEquipmentClick(slotType);
    }
  };

  // Вычисляем эффективные характеристики персонажа
  const effectiveStats = StatsCalculator.calculateEffectiveStats(character);

  // Drag & Drop handlers для экипировки
  const handleDragOver = (e: React.DragEvent, slotType: ItemSlotType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotType);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, slotType: ItemSlotType) => {
    e.preventDefault();
    setDragOverSlot(null);

    const itemData = e.dataTransfer.getData('inventory-item');
    if (!itemData) return;

    const item: InventoryItem = JSON.parse(itemData);

    // Преобразуем тип предмета к слоту и проверяем соответствие
    const itemSlot = itemTypeToSlot(item.item.type);
    if (itemSlot !== slotType) {
      console.warn(`Cannot equip ${item.item.type} (slot: ${itemSlot}) into ${slotType} slot`);
      return;
    }

    try {
      // Бэкенд автоматически снимает все предметы того же типа перед экипировкой нового
      // Поэтому просто экипируем новый предмет
      await equipItem({ characterId: character.id, itemId: item.id }).unwrap();
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  // Drag handlers для снятия предмета
  const handleItemDragStart = (e: React.DragEvent, item: InventoryItem) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('equipped-item', JSON.stringify(item));
  };

  const handleUnequip = async (item: InventoryItem) => {
    try {
      await unequipItem({ characterId: character.id, itemId: item.id }).unwrap();
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  // Маппинг названий слотов
  const slotNames: Record<ItemSlotType, string> = {
    WEAPON: 'МЕЧ',
    HELMET: 'ШЛЕМ',
    ARMOR: 'БРОНЯ',
    BOOTS: 'САПОГИ',
    BELT: 'ПОЯС',
    RING: 'КОЛЬЦО',
  };

  // Рендер слота экипировки
  const renderEquipmentSlot = (slotType: ItemSlotType, equippedItem?: InventoryItem) => {
    const isHighlighted = dragOverSlot === slotType;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, slotType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slotType)}
        onClick={() => handleSlotClick(slotType, equippedItem)}
        className={`border-2 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider transition-all cursor-pointer aspect-square w-20 h-20 ${
          isHighlighted ? 'border-green-500/80 bg-green-950/30' : 'border-amber-800/40 hover:border-amber-600/60'
        }`}
      >
        {equippedItem ? (
          <div
            draggable={true}
            onDragStart={(e) => handleItemDragStart(e, equippedItem)}
            onClick={(e) => {
              // Одинарный клик - выбираем предмет для просмотра
              e.stopPropagation();
              e.preventDefault();
              if (onItemSelect) {
                console.log('Selecting item:', equippedItem.item.name);
                onItemSelect(equippedItem);
              } else {
                console.warn('onItemSelect is not defined');
              }
            }}
            onDoubleClick={(e) => {
              // Двойной клик - снимаем предмет
              e.stopPropagation();
              handleUnequip(equippedItem);
            }}
            className={`text-center cursor-pointer w-full h-full flex items-center justify-center p-1 ${
              selectedItem?.id === equippedItem.id ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <ItemIcon
              item={equippedItem.item}
              size="small"
              enhancement={equippedItem.enhancement}
            />
          </div>
        ) : (
          slotNames[slotType]
        )}
      </div>
    );
  };

  return (
    <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/50 to-black/50 p-4 relative h-full">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Left Half - Character */}
        <div className="flex flex-col gap-2 h-full">
          {/* Class */}
          <div className="px-4 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 text-center text-amber-200 tracking-wider uppercase text-sm" style={{ fontFamily: 'serif' }}>
            {character.class}
          </div>

          {/* Name */}
          <div className="px-4 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 text-center text-amber-200 tracking-wider uppercase text-sm" style={{ fontFamily: 'serif' }}>
            {character.name}
          </div>

          {/* Character Circle - Takes remaining space */}
          <div className="flex-1 w-full rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
            <video
              key={character.class}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                console.error(`Video failed to load for ${character.class}:`, getClassVideo(character.class));
              }}
            >
              <source src={getClassVideo(character.class)} type="video/mp4" />
            </video>
          </div>

          {/* Level Bar at the bottom */}
          <div 
            className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 overflow-hidden relative cursor-pointer hover:border-amber-600/60 transition-all"
            onClick={onLevelBarClick}
            style={{ minHeight: '32px' }}
            title="Нажмите для распределения очков"
          >
            {/* Background */}
            <div className="w-full h-full bg-black/40" style={{ minHeight: '32px' }}></div>

            {/* Progress Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>

            {/* Text Label */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center px-3">
              <span className="text-black text-sm uppercase tracking-wider font-bold relative z-10" style={{ fontFamily: 'serif', textShadow: '0 0 2px rgba(255,255,255,0.5)' }}>
                LVL {character.level}
              </span>
            </div>
          </div>
        </div>

        {/* Right Half - Split between Stats and Equipment */}
        <div className="flex flex-col gap-3 h-full">
          {/* Stats Box - Top Half */}
          <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 p-2 h-1/2 flex flex-col justify-between">
            {/* HIT POINT */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>HIT POINT</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.maxHp}</span>
            </div>

            {/* CURRENT HP */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>CURRENT HP</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.currentHp}</span>
            </div>

            {/* DAMAGE */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>DAMAGE</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.damage}</span>
            </div>

            {/* ARMOR */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>ARMOR</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.armor}</span>
            </div>

            {/* STR */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>STR</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.strength}</span>
            </div>

            {/* AGI */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>AGI</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.agility}</span>
            </div>

            {/* INT */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>INT</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{effectiveStats.intelligence}</span>
            </div>

            {/* GOLD */}
            <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-amber-200 uppercase tracking-wider" style={{ fontFamily: 'serif' }}>GOLD</span>
              <span className="text-[11px] text-amber-200 font-bold" style={{ fontFamily: 'serif' }}>{character.gold}</span>
            </div>
          </div>

          {/* Equipment Grid - Bottom Half */}
          <div className="grid grid-cols-2 gap-3 h-1/2 p-5 place-items-center">
            {renderEquipmentSlot('WEAPON', equipmentSlots.WEAPON)}
            {renderEquipmentSlot('HELMET', equipmentSlots.HELMET)}
            {renderEquipmentSlot('ARMOR', equipmentSlots.ARMOR)}
            {renderEquipmentSlot('BOOTS', equipmentSlots.BOOTS)}
            {renderEquipmentSlot('BELT', equipmentSlots.BELT)}
            {renderEquipmentSlot('RING', equipmentSlots.RING)}
          </div>
        </div>
      </div>
    </div>
  );
}
