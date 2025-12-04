import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetCharacterQuery,
  useEquipItemMutation,
  useUnequipItemMutation,
  useSellItemMutation,
} from "../store/api/characterApi";
import type { InventoryItem } from "../types/api";
import { StatsCalculator } from "../utils/statsCalculator";

const InventoryNew = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem("characterId") || "1";

  const { data: character, isLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: false } // Временно всегда загружаем
  );

  const [equipItem] = useEquipItemMutation();
  const [unequipItem] = useUnequipItemMutation();
  const [sellItem] = useSellItemMutation();

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Handlers
  const handleEquipToggle = async (invItem: InventoryItem) => {
    try {
      if (invItem.isEquipped) {
        await unequipItem({
          characterId: mockCharacter.id,
          itemId: invItem.id,
        }).unwrap();
      } else {
        await equipItem({
          characterId: mockCharacter.id,
          itemId: invItem.id,
        }).unwrap();
      }
    } catch (err: any) {
      console.error("Error equipping item:", err);
    }
  };

  if (isLoading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: "#111215" }}
      >
        <div className="text-[#E6E6E6] text-xl">Загрузка...</div>
      </div>
    );
  }

  // Временные mock-данные для просмотра
  const mockCharacter = character || {
    id: 1,
    name: "Test Hero",
    class: "WARRIOR",
    level: 10,
    experience: 500,
    strength: 20,
    agility: 15,
    intelligence: 10,
    freePoints: 5,
    maxHp: 200,
    currentHp: 200,
    armor: 50,
    gold: 5000,
    stamina: 100,
    rating: 1500,
    superPoints: 3,
    inventory: {
      id: 1,
      characterId: 1,
      size: 40,
      items: [
        {
          id: 1,
          inventoryId: 1,
          itemId: 1,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 1,
            name: 'Ржавый меч',
            type: 'weapon' as const,
            description: '',
            damage: 5,
            armor: 0,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 10,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 1,
          }
        },
        {
          id: 2,
          inventoryId: 1,
          itemId: 2,
          quantity: 1,
          enhancement: 3,
          isEquipped: false,
          item: {
            id: 2,
            name: 'Стальной меч',
            type: 'weapon' as const,
            description: '',
            damage: 10,
            armor: 0,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 50,
            minStrength: 10,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 3,
          }
        },
        {
          id: 3,
          inventoryId: 1,
          itemId: 3,
          quantity: 1,
          enhancement: 0,
          isEquipped: true,
          item: {
            id: 3,
            name: 'Меч героя',
            type: 'weapon' as const,
            description: '',
            damage: 20,
            armor: 0,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 200,
            minStrength: 20,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 10,
          }
        },
        {
          id: 4,
          inventoryId: 1,
          itemId: 4,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 4,
            name: 'Кожанка',
            type: 'armor' as const,
            description: '',
            damage: 0,
            armor: 5,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 15,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 1,
          }
        },
        {
          id: 5,
          inventoryId: 1,
          itemId: 5,
          quantity: 1,
          enhancement: 5,
          isEquipped: true,
          item: {
            id: 5,
            name: 'Кольчуга',
            type: 'armor' as const,
            description: '',
            damage: 0,
            armor: 10,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 60,
            minStrength: 15,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 5,
          }
        },
        {
          id: 6,
          inventoryId: 1,
          itemId: 6,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 6,
            name: 'Шапка',
            type: 'helmet' as const,
            description: '',
            damage: 0,
            armor: 2,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 5,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 1,
          }
        },
        {
          id: 7,
          inventoryId: 1,
          itemId: 7,
          quantity: 1,
          enhancement: 2,
          isEquipped: true,
          item: {
            id: 7,
            name: 'Шлем',
            type: 'helmet' as const,
            description: '',
            damage: 0,
            armor: 5,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 25,
            minStrength: 10,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 3,
          }
        },
        {
          id: 8,
          inventoryId: 1,
          itemId: 8,
          quantity: 1,
          enhancement: 0,
          isEquipped: true,
          item: {
            id: 8,
            name: 'Сапоги',
            type: 'legs' as const,
            description: '',
            damage: 0,
            armor: 3,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 10,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 1,
          }
        },
        {
          id: 9,
          inventoryId: 1,
          itemId: 9,
          quantity: 1,
          enhancement: 1,
          isEquipped: true,
          item: {
            id: 9,
            name: 'Пояс',
            type: 'belt' as const,
            description: '',
            damage: 0,
            armor: 2,
            bonusStr: 1,
            bonusAgi: 0,
            bonusInt: 0,
            price: 20,
            minStrength: 5,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 2,
          }
        },
        {
          id: 10,
          inventoryId: 1,
          itemId: 10,
          quantity: 3,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 10,
            name: 'Зелье HP',
            type: 'potion' as const,
            description: '',
            damage: 0,
            armor: 0,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 20,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 1,
          }
        },
        {
          id: 11,
          inventoryId: 1,
          itemId: 11,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 11,
            name: 'Деревянный щит',
            type: 'shield' as const,
            description: 'Базовый щит для паладина',
            damage: 0,
            armor: 5,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 0,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 1,
          }
        },
        {
          id: 12,
          inventoryId: 1,
          itemId: 12,
          quantity: 1,
          enhancement: 0,
          isEquipped: true,
          item: {
            id: 12,
            name: 'Кольцо силы',
            type: 'accessory' as const,
            description: 'Увеличивает силу',
            damage: 0,
            armor: 0,
            bonusStr: 3,
            bonusAgi: 0,
            bonusInt: 0,
            price: 100,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 5,
          }
        },
        // Дополнительные предметы в инвентаре
        {
          id: 13,
          inventoryId: 1,
          itemId: 13,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 13,
            name: 'Легендарный шлем',
            type: 'helmet' as const,
            description: 'Tier 3 шлем',
            damage: 0,
            armor: 15,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 500,
            minStrength: 25,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 15,
          }
        },
        {
          id: 14,
          inventoryId: 1,
          itemId: 14,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 14,
            name: 'Легендарная броня',
            type: 'armor' as const,
            description: 'Tier 3 броня',
            damage: 0,
            armor: 25,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 0,
            price: 800,
            minStrength: 30,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 20,
          }
        },
        {
          id: 15,
          inventoryId: 1,
          itemId: 15,
          quantity: 1,
          enhancement: 7,
          isEquipped: false,
          item: {
            id: 15,
            name: 'Улучшенные сапоги',
            type: 'legs' as const,
            description: 'Tier 2 сапоги',
            damage: 0,
            armor: 8,
            bonusStr: 0,
            bonusAgi: 2,
            bonusInt: 0,
            price: 120,
            minStrength: 0,
            minAgility: 15,
            minIntelligence: 0,
            minLevel: 8,
          }
        },
        {
          id: 16,
          inventoryId: 1,
          itemId: 16,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 16,
            name: 'Легендарные сапоги',
            type: 'legs' as const,
            description: 'Tier 3 сапоги',
            damage: 0,
            armor: 12,
            bonusStr: 0,
            bonusAgi: 5,
            bonusInt: 0,
            price: 350,
            minStrength: 0,
            minAgility: 25,
            minIntelligence: 0,
            minLevel: 15,
          }
        },
        {
          id: 17,
          inventoryId: 1,
          itemId: 17,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 17,
            name: 'Легендарный пояс',
            type: 'belt' as const,
            description: 'Tier 3 пояс',
            damage: 0,
            armor: 6,
            bonusStr: 5,
            bonusAgi: 0,
            bonusInt: 0,
            price: 300,
            minStrength: 20,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 12,
          }
        },
        {
          id: 18,
          inventoryId: 1,
          itemId: 18,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 18,
            name: 'Магическое кольцо',
            type: 'accessory' as const,
            description: 'Tier 2 кольцо',
            damage: 0,
            armor: 0,
            bonusStr: 0,
            bonusAgi: 0,
            bonusInt: 5,
            price: 200,
            minStrength: 0,
            minAgility: 0,
            minIntelligence: 15,
            minLevel: 10,
          }
        },
        {
          id: 19,
          inventoryId: 1,
          itemId: 19,
          quantity: 1,
          enhancement: 0,
          isEquipped: false,
          item: {
            id: 19,
            name: 'Легендарное кольцо',
            type: 'accessory' as const,
            description: 'Tier 3 кольцо',
            damage: 0,
            armor: 0,
            bonusStr: 8,
            bonusAgi: 0,
            bonusInt: 0,
            price: 600,
            minStrength: 25,
            minAgility: 0,
            minIntelligence: 0,
            minLevel: 18,
          }
        },
      ]
    }
  };

  const effectiveStats = StatsCalculator.calculateEffectiveStats(mockCharacter);
  const equippedItems = mockCharacter.inventory.items.filter(i => i.isEquipped);
  const unequippedItems = mockCharacter.inventory.items.filter(i => !i.isEquipped);

  // Маппинг иконок предметов
  const getItemIcon = (itemName: string, type: string) => {
    const iconMap: Record<string, string> = {
      'Ржавый меч': '/src/items/swords/asset_x5S2FVC5yfzrScNSwi4r8Vbn_Dark fantasy RPG inventory item. Steel sword. TIER 1. Simple medieval blade, rough steel, scratches, no glow, basic hilt. No background, perfect 1×1 icon._txt2img_1764877478-Photoroom.png',
      'Стальной меч': '/src/items/swords/asset_wPsi9oUUsaTqoNQ3VoeAuQ5x_Remove the background, leave only the sword._txt2img_1764877705-Photoroom.png',
      'Меч героя': '/src/items/swords/asset_nsguMDF79wUGJvA6u95Nze6f_Dark fantasy RPG inventory item. Cursed legendary sword. TIER 3. Ornate dark-metal blade, glowing red runes, detailed engravings, strong magical aura, dramatic reflections. No bac (1).png',
      'Шапка': '/src/items/helmets/asset_ygKb5mXpz5onL7BBMCdn5xq8_Dark fantasy RPG inventory item. Steel helmet. TIER 1. Simple medieval helmet, rough steel, scratches, no glow, basic hilt. No background, perfect 1×1 icon. Without frame._txt2img (1).png',
      'Шлем': '/src/items/helmets/asset_rSaG5nCUR2WzHCTeaJ3k6snw_Dark fantasy RPG inventory item_ helmet, Tier 2. Refined polished helmet with faint runes, improved guard, and a subtle magical glow. No background, square icon. No background, no (1).png',
      'Легендарный шлем': '/src/items/helmets/asset_521mQw42sH9y1j1FvhY6b75N_Dark fantasy RPG inventory item. Cursed legendary helmet. TIER 3. Ornate dark-metal helmet, glowing red runes, detailed engravings, strong magical aura, dramatic reflections. No b (1).png',
      'Кожанка': '/src/items/armors/asset_kYERmmUbgdV4ZQ9L2uoidhW7_Dark fantasy RPG inventory item_ Steel armor, Tier 1. Simple medieval armor made of rough steel, featuring scratches and no glowing effect, with a basic hilt. No background and no (1).png',
      'Кольчуга': '/src/items/armors/asset_G6uv1qWoN8U6QYZcvB8jkSzP_Dark fantasy RPG inventory item. Armor. TIER 2. Refined polished armor, faint runes, improved guard, subtle magical glow. No background, square icon. No background and frames._txt (1).png',
      'Легендарная броня': '/src/items/armors/asset_VLzZZ1zJbnizuJSEsoEyiA6y_Dark fantasy RPG inventory item. Cursed legendary armor. TIER 3._Ornate dark-metal armor, glowing red runes, detailed engravings, strong magical aura, dramatic reflections. No bac (1).png',
      'Пояс': '/src/items/belts/asset_kHBUWwWFmJkL4c486ssfFZ5L_Dark fantasy RPG inventory item. Belt. TIER 2. Refined polished belt, faint runes, improved guard, subtle magical glow. No background, square icon. Without background and borders. (1).png',
      'Легендарный пояс': '/src/items/belts/asset_34yPNfR29411YZS18jBVEFka_Dark fantasy RPG inventory item. Cursed legendary belt. TIER 3. Ornate dark-metal belt, glowing red runes, detailed engravings, strong magical aura, dramatic reflections. No backg (1).png',
      'Сапоги': '/src/items/legs/asset_HhiL8wUBYAusmE7EDEmWNSmU_Dark fantasy RPG inventory item. Steel legs. TIER 1._Simple medieval legs, rough steel, scratches, no glow, basic hilt. No background, perfect 1×1 icon._txt2img_1764879840-Photoroom.png',
      'Улучшенные сапоги': '/src/items/legs/asset_y4wLE18tbPRS8rMVBSVoWGMb_Dark fantasy RPG inventory item_ legs. TIER 2. Refined polished legs, faint runes, improved guard, subtle magical glow. No background, square icon. No background, borders, or text (1).png',
      'Легендарные сапоги': '/src/items/legs/asset_s8DzVUq3QDn3iqvRFcvokJpz_Remove everything except the boots and the glow from the boots, remove the rest._txt2img_1764880715-Photoroom.png',
      'Кольцо силы': '/src/items/accessorys/asset_DxWj22gkqoxnGgYuvYRebwNq_Dark fantasy RPG inventory item_ Steel ring. TIER 1. Simple medieval ringmade of rough steel with scratches, no glow, and a basic hilt. No background, perfect 1×1 icon. No backgro (1).png',
      'Магическое кольцо': '/src/items/accessorys/asset_8Em2NrWGZkHU1Gqu2r7C8akG_Dark fantasy RPG inventory item_ ring. TIER 2._Refined polished ring, faint runes, improved guard, subtle magical glow. No background, square icon. No background, only the ring._t (1).png',
      'Легендарное кольцо': '/src/items/accessorys/asset_3AXCY6vWt4dtz3qDKuyjuwhL_Remove the frame, leave only the ring._txt2img_1764883181-Photoroom.png',
    };
    return iconMap[itemName] || '';
  };

  return (
    <div className="w-full h-screen overflow-hidden p-4" style={{ backgroundColor: "#111215", maxWidth: "1440px", maxHeight: "1080px", margin: "0 auto" }}>
      {/* Top Navigation */}
      <div className="absolute top-3 right-3 flex gap-2 z-30">
        <button className="px-3 py-1 border-2 border-[#2C2D33] rounded bg-[#1A1B21] text-[#E6E6E6] text-sm">
          MUSIC
        </button>
        <button className="px-3 py-1 border-2 border-[#2C2D33] rounded bg-[#1A1B21] text-[#E6E6E6] text-sm">
          FAQ
        </button>
        <button onClick={() => navigate("/dashboard")} className="px-3 py-1 border-2 border-[#2C2D33] rounded bg-[#1A1B21] text-[#E6E6E6] text-sm">
          BACK
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)]">
        {/* LEFT SIDE - Character Info */}
        <div className="flex flex-col gap-4">
          {/* Character Card */}
          <div className="border-2 border-[#2C2D33] rounded-lg bg-[#1A1B21] p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-[#888] mb-1">CLASS</div>
                <div className="border border-[#2C2D33] rounded px-2 py-1 text-sm text-[#E6E6E6]">
                  {mockCharacter.class}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#888] mb-1">NAME</div>
                <div className="border border-[#2C2D33] rounded px-2 py-1 text-sm text-[#E6E6E6]">
                  {mockCharacter.name}
                </div>
              </div>
            </div>

            {/* Avatar Circle */}
            <div className="flex justify-center mb-4">
              <div className="w-40 h-40 border-4 border-[#2C2D33] rounded-full bg-[#0A0B0E] flex items-center justify-center">
                <span className="text-2xl text-[#444]">IMG</span>
              </div>
            </div>

            {/* Level Bar */}
            <div className="mb-4">
              <div className="bg-[#0A0B0E] border border-[#2C2D33] rounded-full h-6 flex items-center px-2">
                <div className="bg-[#B21E2C] h-4 rounded-full" style={{ width: '30%' }}></div>
                <span className="ml-2 text-xs text-[#E6E6E6]">LVL {mockCharacter.level}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="border border-[#2C2D33] rounded p-3 mb-4">
              <div className="grid grid-cols-2 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888]">HIT POINT:</span>
                  <span className="text-[#E6E6E6]">{mockCharacter.currentHp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">ENDURANCE:</span>
                  <span className="text-[#E6E6E6]">{mockCharacter.stamina}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">DAMAGE:</span>
                  <span className="text-[#E6E6E6]">{effectiveStats.damage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">ARMOR:</span>
                  <span className="text-[#E6E6E6]">{effectiveStats.armor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">STR:</span>
                  <span className="text-[#E6E6E6]">{effectiveStats.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">AGI:</span>
                  <span className="text-[#E6E6E6]">{effectiveStats.agility}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-[#888]">GOLD:</span>
                  <span className="text-[#FFD700]">{mockCharacter.gold}</span>
                </div>
              </div>
            </div>

            {/* Equipped Items */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {equippedItems.slice(0, 6).map((invItem) => (
                <button
                  key={invItem.id}
                  onClick={() => setSelectedItem(invItem)}
                  className="border border-[#2C2D33] rounded p-2 bg-[#0A0B0E] hover:border-[#B21E2C] transition-colors h-16 flex items-center justify-center overflow-hidden relative"
                >
                  {getItemIcon(invItem.item.name, invItem.item.type) ? (
                    <>
                      <img
                        src={getItemIcon(invItem.item.name, invItem.item.type)}
                        alt={invItem.item.name}
                        className="h-full object-contain"
                      />
                      {invItem.enhancement > 0 && (
                        <div className="absolute top-0 right-0 bg-[#4CAF50] text-white text-[9px] px-1 rounded-bl">
                          +{invItem.enhancement}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-[#E6E6E6] truncate">{invItem.item.name}</div>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button className="border border-[#2C2D33] rounded py-2 text-xs text-[#E6E6E6] bg-[#0A0B0E] hover:border-[#B21E2C]">
                TUNIC
              </button>
              <button className="border border-[#2C2D33] rounded py-2 text-xs text-[#E6E6E6] bg-[#0A0B0E] hover:border-[#B21E2C]">
                WORLD
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="border-2 border-[#2C2D33] rounded-lg bg-[#1A1B21] p-4 flex-1">
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-1 border border-[#2C2D33] rounded text-xs text-[#E6E6E6] bg-[#0A0B0E]">
                ALL
              </button>
              <button className="px-3 py-1 border border-[#2C2D33] rounded text-xs text-[#888]">
                PRIVAT
              </button>
              <button className="px-3 py-1 border border-[#2C2D33] rounded text-xs text-[#888]">
                RAINLIST
              </button>
              <button className="px-3 py-1 border border-[#2C2D33] rounded text-xs text-[#888]">
                FRIENDLIST
              </button>
            </div>
            <div className="text-center text-2xl text-[#444] py-8">CHAT</div>
          </div>
        </div>

        {/* RIGHT SIDE - Inventory */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex gap-4">
            <button className="flex-1 border-2 border-[#2C2D33] rounded-lg bg-[#1A1B21] py-3 text-xl text-[#E6E6E6]">
              INVENTORY
            </button>
            <button onClick={() => navigate("/blacksmith")} className="flex-1 border-2 border-[#2C2D33] rounded-lg bg-[#1A1B21] py-3 text-xl text-[#E6E6E6] hover:border-[#B21E2C]">
              FORGE →
            </button>
          </div>

          {/* Selected Item Info */}
          <div className="border-2 border-[#2C2D33] rounded-lg bg-[#1A1B21] p-4">
            <div className="flex gap-4">
              {/* Item Image */}
              <div className="w-24 h-24 border-2 border-[#2C2D33] rounded bg-[#0A0B0E] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedItem && getItemIcon(selectedItem.item.name, selectedItem.item.type) ? (
                  <img
                    src={getItemIcon(selectedItem.item.name, selectedItem.item.type)}
                    alt={selectedItem.item.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-[#444] text-center">IMAGE<br/>ITEM</span>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                {selectedItem ? (
                  <>
                    <div className="mb-2">
                      <div className="text-xs text-[#888] mb-1">NAME ITEM</div>
                      <div className="border border-[#2C2D33] rounded px-2 py-1 text-sm text-[#E6E6E6]">
                        {selectedItem.item.name} {selectedItem.enhancement > 0 && `+${selectedItem.enhancement}`}
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="text-xs text-[#888]">
                        ARMOR: <span className="text-[#E6E6E6]">{selectedItem.item.armor}</span>
                      </div>
                      <div className="text-xs text-[#888]">
                        DAMAGE: <span className="text-[#E6E6E6]">{selectedItem.item.damage}</span>
                      </div>
                    </div>
                    <div className="text-xs text-[#FFD700]">
                      GOLD: {Math.floor(selectedItem.item.price * 0.5)}
                    </div>
                    <button
                      onClick={() => handleEquipToggle(selectedItem)}
                      className="mt-2 w-full border border-[#2C2D33] rounded py-1 text-xs text-[#E6E6E6] bg-[#0A0B0E] hover:border-[#B21E2C]"
                    >
                      {selectedItem.isEquipped ? 'СНЯТЬ' : 'НАДЕТЬ'}
                    </button>
                  </>
                ) : (
                  <div className="text-center text-[#444] py-6">
                    Выберите предмет
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="border-2 border-[#2C2D33] rounded-lg bg-[#1A1B21] p-4 flex-1 overflow-auto">
            <div className="grid grid-cols-4 gap-3">
              {unequippedItems.map((invItem) => (
                <button
                  key={invItem.id}
                  onClick={() => setSelectedItem(invItem)}
                  className={`aspect-square border-2 rounded-lg bg-[#0A0B0E] flex flex-col items-center justify-center hover:border-[#B21E2C] transition-colors relative overflow-hidden ${
                    selectedItem?.id === invItem.id ? 'border-[#B21E2C]' : 'border-[#2C2D33]'
                  }`}
                >
                  {getItemIcon(invItem.item.name, invItem.item.type) ? (
                    <img
                      src={getItemIcon(invItem.item.name, invItem.item.type)}
                      alt={invItem.item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-xs text-[#E6E6E6] truncate px-1">
                      {invItem.item.name}
                    </div>
                  )}
                  {invItem.enhancement > 0 && (
                    <div className="absolute top-0 right-0 bg-[#4CAF50] text-white text-[10px] px-1 rounded-bl">
                      +{invItem.enhancement}
                    </div>
                  )}
                  {invItem.quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-[#1A1B21] text-[#E6E6E6] text-[10px] px-1 rounded-tl">
                      x{invItem.quantity}
                    </div>
                  )}
                </button>
              ))}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 12 - unequippedItems.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square border-2 border-[#2C2D33] rounded-lg bg-[#0A0B0E]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryNew;
