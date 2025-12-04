import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetCharacterQuery,
  useEquipItemMutation,
  useUnequipItemMutation,
  useSellItemMutation,
} from "../../store/api/characterApi";
import type { InventoryItem } from "../../types/api";
import type { ItemType } from "../../../../shared/types/enums";
import { StatsCalculator } from "../../utils/statsCalculator";
import { InventorySection } from "./InventorySection";
import { ForgeSection } from "./ForgeSection";
import {
  TopNavigation,
  CharacterInfoCard,
  ChatSection,
  MainMenu,
  StoneCornerDecorations,
} from "./components";

interface DashboardPageProps {
  onNavigate: (page: "login" | "create" | "choose" | "dashboard") => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export function DashboardPage({
  onNavigate,
  musicOn,
  onToggleMusic,
}: DashboardPageProps) {
  const navigate = useNavigate();
  const characterId = localStorage.getItem("characterId");

  const { data: character, isLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const [equipItem] = useEquipItemMutation();
  const [unequipItem] = useUnequipItemMutation();
  const [sellItem] = useSellItemMutation();

  const [activeSection, setActiveSection] = useState<
    "main" | "inventory" | "forge"
  >("main");
  const [showForge, setShowForge] = useState(false);

  // Drag & Drop state
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<ItemType | null>(null);

  // Handlers
  const handleEquip = async (invItem: InventoryItem) => {
    if (!character) return;

    try {
      if (invItem.isEquipped) {
        await unequipItem({ characterId: character.id, itemId: invItem.id }).unwrap();
      } else {
        await equipItem({ characterId: character.id, itemId: invItem.id }).unwrap();
      }
    } catch (err: any) {
      console.error("Error equipping item:", err);
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
      const result = await sellItem({
        characterId: character.id,
        itemId: invItem.id,
      }).unwrap();
      alert(`${result.itemName} продан за ${result.goldReceived} золота!`);
    } catch (err: any) {
      alert(`Ошибка продажи: ${err.data?.message || "Неизвестная ошибка"}`);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, invItem: InventoryItem) => {
    setDraggedItem(invItem);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotType: ItemType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSlot(slotType);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, slotType: ItemType) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedItem || !character) return;

    const isOffhandSlot = slotType === "shield" || slotType === "offhand";
    const itemType = draggedItem.item.type;

    if (isOffhandSlot) {
      if (itemType !== "shield" && itemType !== "offhand") {
        alert("Этот предмет не может быть экипирован в offhand слот");
        return;
      }
    } else if (itemType !== slotType) {
      alert(`Этот предмет не может быть экипирован в этот слот`);
      return;
    }

    await handleEquip(draggedItem);
    setDraggedItem(null);
  };

  if (!characterId) {
    navigate("/");
    return null;
  }

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

  if (!character) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: "#111215" }}
      >
        <div className="text-[#E6E6E6] text-xl">Персонаж не найден</div>
      </div>
    );
  }

  const effectiveStats = StatsCalculator.calculateEffectiveStats(character);

  return (
    <div
      className="w-full h-full p-4 relative"
      style={{ backgroundColor: "#111215" }}
    >
      <TopNavigation
        musicOn={musicOn}
        onToggleMusic={onToggleMusic}
        onNavigate={onNavigate}
      />

      {/* Main Container */}
      <div
        className="w-full h-full border-4 border-[#2C2D33] rounded-2xl bg-[#1A1B21] backdrop-blur-md shadow-2xl p-6 relative"
        style={{
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.8), inset 0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        <StoneCornerDecorations size="large" color="#B21E2C" />

        <div className="grid grid-cols-[45%_55%] gap-6 h-full">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 h-full">
            {showForge ? (
              <ForgeSection />
            ) : (
              <CharacterInfoCard
                character={character}
                effectiveStats={effectiveStats}
                dragOverSlot={dragOverSlot}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onEquip={handleEquip}
              />
            )}
            <ChatSection />
          </div>

          {/* RIGHT COLUMN */}
          {activeSection === "main" ? (
            <MainMenu onInventoryClick={() => setActiveSection("inventory")} />
          ) : activeSection === "inventory" ? (
            <InventorySection
              character={character}
              draggedItem={draggedItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onEquip={handleEquip}
              onSell={handleSell}
              onNavigateToForge={() => setShowForge(true)}
              showForge={showForge}
              onNavigateToInventory={() => setShowForge(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
