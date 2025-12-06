import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useEquipItemMutation, useUnequipItemMutation, useGetCharacterQuery, useGetLevelProgressQuery } from '../../store/api/characterApi';
import { StatsCalculator } from '../../utils/statsCalculator';
import { getAssetUrl } from '../../utils/assetUrl';
import { dashboardColors, dashboardFonts, dashboardEffects, cornerOrnaments, cardStyle } from '../../styles/dashboard.styles';

// Импорт изображений для слотов
import weaponImg from '../../assets/inventory-pers/weapon.png';
import helmetImg from '../../assets/inventory-pers/helmet.png';
import armorImg from '../../assets/inventory-pers/armor.png';
import beltsImg from '../../assets/inventory-pers/belt.png';
import bootsImg from '../../assets/inventory-pers/boots.png';
import ringImg from '../../assets/inventory-pers/ring.png';

interface CharacterCardProps {
  character: Character;
  onEquipmentClick?: (slotType: string) => void;
  onItemSelect?: (item: InventoryItem | null) => void;
  selectedItem?: InventoryItem | null;
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

export function CharacterCard({ character: characterProp, onEquipmentClick, onItemSelect }: CharacterCardProps) {
  const [equipItem] = useEquipItemMutation();
  const [unequipItem] = useUnequipItemMutation();
  const [clickedSlot, setClickedSlot] = useState<ItemSlotType | null>(null);

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

  const handleSlotClick = (slotType: ItemSlotType, item?: InventoryItem) => {
    // Переключаем увеличение слота при клике
    if (clickedSlot === slotType) {
      setClickedSlot(null);
    } else {
      setClickedSlot(slotType);
    }
    
    // Если есть надетый предмет - выбираем его для просмотра
    if (item && onItemSelect) {
      onItemSelect(item);
    }
    // Если слота пуст - вызываем onEquipmentClick (если есть)
    else if (!item && onEquipmentClick) {
      onEquipmentClick(slotType);
    }
  };

  // Вычисляем эффективные характеристики персонажа
  const effectiveStats = StatsCalculator.calculateEffectiveStats(character);

  // Drag & Drop handlers для экипировки
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    // Обработка ухода курсора при drag
  };

  const handleDrop = async (e: React.DragEvent, slotType: ItemSlotType) => {
    e.preventDefault();

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

  const handleUnequip = async (item: InventoryItem) => {
    try {
      await unequipItem({ characterId: character.id, itemId: item.id }).unwrap();
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  // Маппинг изображений для слотов
  const slotBackgrounds: Record<ItemSlotType, string> = {
    WEAPON: weaponImg,
    HELMET: helmetImg,
    ARMOR: armorImg,
    BOOTS: bootsImg,
    BELT: beltsImg,
    RING: ringImg,
  };

  // Рендер слота экипировки
  const renderEquipmentSlot = (slotType: ItemSlotType, equippedItem?: InventoryItem) => {
    const isClicked = clickedSlot === slotType;
    // Лёгкий эффект увеличения при клике
    const scale = isClicked ? 1.25 : 1;
    const zIndex = isClicked ? 50 : 1;

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slotType)}
        onClick={() => handleSlotClick(slotType, equippedItem)}
        onDoubleClick={(e) => {
          // Двойной клик - снимаем предмет
          if (equippedItem) {
            e.stopPropagation();
            handleUnequip(equippedItem);
          }
        }}
        className="rounded flex items-center justify-center transition-all cursor-pointer w-full aspect-square"
        style={{
          backgroundImage: `url(${slotBackgrounds[slotType]})`,
          // Увеличиваем видимый размер картинки примерно в 1.5 раза,
          // масштабируя фон по ширине с сохранением пропорций
          backgroundSize: '150% auto',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          position: 'relative',
          transform: `scale(${scale})`,
          zIndex: zIndex,
          transition: 'transform 0.3s ease',
        }}
      />
    );
  };

  return (
    <div 
      style={{
        ...cardStyle,
        border: `3px solid ${dashboardColors.borderGold}`,
        padding: '20px',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={cornerOrnaments.topLeft}></div>
      <div style={cornerOrnaments.topRight}></div>
      <div style={cornerOrnaments.bottomLeft}></div>
      <div style={cornerOrnaments.bottomRight}></div>

      <div className="grid grid-cols-2 gap-4 h-full" style={{ overflow: 'hidden' }}>
        {/* Left Half - Character */}
        <div className="flex flex-col gap-2 h-full">
          {/* Class */}
          <div 
            style={{
              ...cardStyle,
              padding: '12px 18px',
              textAlign: 'center',
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: dashboardFonts.primary,
              color: dashboardColors.textGold,
              textShadow: dashboardEffects.textShadow,
              overflow: 'hidden',
            }}
          >
            {character.class}
          </div>

          {/* Name */}
          <div 
            style={{
              ...cardStyle,
              padding: '12px 18px',
              textAlign: 'center',
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: dashboardFonts.primary,
              color: dashboardColors.textGold,
              textShadow: dashboardEffects.textShadow,
              overflow: 'hidden',
            }}
          >
            {character.name}
          </div>

          {/* Character Circle - Takes remaining space */}
          <div 
            className="flex-1 w-full rounded-full flex items-center justify-center relative"
            style={{
              border: `3px solid ${dashboardColors.borderGold}`,
              background: 'linear-gradient(to bottom right, rgba(139, 0, 0, 0.6) 0%, rgba(30, 30, 30, 0.9) 50%, rgba(0, 0, 0, 1) 100%)',
              boxShadow: dashboardEffects.insetShadow,
              overflow: 'hidden',
            }}
          >
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
              onError={() => {
                console.error(`Video failed to load for ${character.class}:`, getClassVideo(character.class));
              }}
            >
              <source src={getClassVideo(character.class)} type="video/mp4" />
            </video>
          </div>

          {/* Level Bar at the bottom */}
          <div 
            style={{
              ...cardStyle,
              padding: 0,
              overflow: 'hidden',
              position: 'relative',
              minHeight: '40px',
              marginTop: '8px',
            }}
          >
            {/* Background */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: 'rgba(0, 0, 0, 0.6)',
              position: 'absolute',
              minHeight: '36px',
            }}></div>

            {/* Progress Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                background: 'linear-gradient(to right, #C9A86A 0%, #A07938 50%, #6B542E 100%)',
                width: `${progressPercentage}%`,
                transition: 'width 0.3s ease',
                minHeight: '40px',
                boxShadow: '0 0 10px rgba(201, 168, 106, 0.4)',
              }}
            ></div>

            {/* Text Label */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              zIndex: 2,
            }}>
              <span style={{
                color: '#000',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
                textShadow: '0 0 3px rgba(255, 255, 255, 0.6)',
              }}>
                LVL {character.level}
              </span>
            </div>
          </div>
        </div>

        {/* Right Half - Split between Stats and Equipment */}
        <div className="flex flex-col gap-4 h-full" style={{ overflow: 'hidden' }}>
          {/* Stats Box - верхняя часть (делаем крупнее, как на примере) */}
          <div 
            style={{
              ...cardStyle,
              padding: '18px',
              height: '40%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
              overflow: 'hidden',
            }}
          >
            {/* HIT POINT */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>HIT POINT</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.maxHp}</span>
            </div>

            {/* CURRENT HP */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>CURRENT HP</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.currentHp}</span>
            </div>

            {/* DAMAGE */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>DAMAGE</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.damage}</span>
            </div>

            {/* ARMOR */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>ARMOR</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.armor}</span>
            </div>

            {/* STR */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>STR</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.strength}</span>
            </div>

            {/* AGI */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>AGI</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.agility}</span>
            </div>

            {/* INT */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>INT</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{effectiveStats.intelligence}</span>
            </div>

            {/* GOLD */}
            <div 
              style={{
                ...cardStyle,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: dashboardFonts.primary,
              }}>GOLD</span>
              <span style={{
                fontSize: '11px',
                color: dashboardColors.textGold,
                fontWeight: 'bold',
                fontFamily: dashboardFonts.primary,
              }}>{character.gold}</span>
            </div>
          </div>

          {/* Equipment Grid - Bottom Half */}
          <div
            className="grid grid-cols-2 grid-rows-3 gap-2 p-0 place-items-stretch"
            style={{ overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}
          >
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
