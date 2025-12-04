import { StoneCornerDecorations } from "./StoneCornerDecorations";
import { CharacterAvatar } from "./CharacterAvatar";
import { CharacterStats } from "./CharacterStats";
import { EquipmentGrid } from "./EquipmentGrid";
import type { Character, ItemType } from "../../../types/api";

interface CharacterInfoCardProps {
  character: Character;
  effectiveStats: {
    strength: number;
    agility: number;
    intelligence: number;
    damage: number;
    armor: number;
    maxHp: number;
    currentHp: number;
  };
  dragOverSlot?: ItemType | null;
  onDragOver?: (e: React.DragEvent, slotType: ItemType) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, slotType: ItemType) => void;
  onEquip?: (item: any) => void;
}

export function CharacterInfoCard({
  character,
  effectiveStats,
  dragOverSlot,
  onDragOver,
  onDragLeave,
  onDrop,
  onEquip,
}: CharacterInfoCardProps) {
  return (
    <div
      className="border-4 border-[#2C2D33] rounded-lg bg-[#1A1B21] p-4 relative h-[66%] shadow-lg"
      style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)" }}
    >
      <StoneCornerDecorations size="small" />

      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Left Half - Character */}
        <div className="flex flex-col gap-2 h-full">
          {/* Class */}
          <div
            className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#111215] text-center text-[#E6E6E6] tracking-wider uppercase text-sm shadow-md"
            style={{
              fontFamily: "serif",
              boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            {character.class}
          </div>

          {/* Name */}
          <div
            className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#111215] text-center text-[#B21E2C] tracking-wider uppercase text-sm shadow-md"
            style={{
              fontFamily: "serif",
              boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            {character.name}
          </div>

          {/* Character Circle */}
          <CharacterAvatar />

          {/* Level Bar */}
          <div
            className="border-3 border-[#2C2D33] rounded bg-[#111215] overflow-hidden shadow-md"
            style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)" }}
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-[#B21E2C] to-[#B21E2C]/80 px-3 py-1">
                <span
                  className="text-[#E6E6E6] text-sm uppercase tracking-wider"
                  style={{ fontFamily: "serif" }}
                >
                  LVL {character.level}
                </span>
              </div>
              <div className="flex-1 h-full bg-[#111215]"></div>
            </div>
          </div>
        </div>

        {/* Right Half - Stats and Equipment */}
        <div className="flex flex-col gap-3 h-full">
          <CharacterStats
            character={character}
            effectiveStats={effectiveStats}
          />
          <EquipmentGrid
            character={character}
            dragOverSlot={dragOverSlot}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onEquip={onEquip}
          />
        </div>
      </div>
    </div>
  );
}
