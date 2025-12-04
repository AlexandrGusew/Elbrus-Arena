import { EquipmentSlot } from "./EquipmentSlot";
import type { Character, ItemType } from "../../../types/api";

const EQUIPMENT_SLOTS: ItemType[] = [
  "weapon",
  "helmet",
  "armor",
  "legs",
  "belt",
  "accessory",
];

interface EquipmentGridProps {
  character: Character;
  dragOverSlot?: ItemType | null;
  onDragOver?: (e: React.DragEvent, slotType: ItemType) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, slotType: ItemType) => void;
  onEquip?: (item: any) => void;
}

export function EquipmentGrid({
  character,
  dragOverSlot,
  onDragOver,
  onDragLeave,
  onDrop,
  onEquip,
}: EquipmentGridProps) {
  const getEquippedItemByType = (type: ItemType) => {
    return character.inventory.items.find(
      (item) => item.isEquipped && item.item.type === type
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 h-1/2 p-5 place-items-center">
      {EQUIPMENT_SLOTS.map((slotType) => {
        const equippedItem = getEquippedItemByType(slotType);
        const isDragOver = dragOverSlot === slotType;

        return (
          <EquipmentSlot
            key={slotType}
            slotType={slotType}
            equippedItem={equippedItem}
            isDragOver={isDragOver}
            onDragOver={(e) => onDragOver?.(e, slotType)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop?.(e, slotType)}
            onClick={() => equippedItem && onEquip?.(equippedItem)}
          />
        );
      })}
    </div>
  );
}
