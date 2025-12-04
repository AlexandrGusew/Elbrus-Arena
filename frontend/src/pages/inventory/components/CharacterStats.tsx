import type { Character } from "../../../types/api";

interface CharacterStatsProps {
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
}

export function CharacterStats({ character, effectiveStats }: CharacterStatsProps) {
  return (
    <div
      className="border-3 border-[#2C2D33] rounded bg-[#111215] p-3 h-1/2 flex items-center justify-center shadow-md"
      style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)" }}
    >
      <div
        className="space-y-1 text-[11px] text-[#E6E6E6]"
        style={{ fontFamily: "monospace" }}
      >
        <div>
          HP..................{effectiveStats.currentHp}/{effectiveStats.maxHp}
        </div>
        <div>STAMINA.............{character.stamina}</div>
        <div>DAMAGE..............{effectiveStats.damage}</div>
        <div>ARMOR...............{effectiveStats.armor}</div>
        <div className="h-px bg-[#2C2D33] my-1"></div>
        <div>
          STR.................{character.strength}
          {effectiveStats.strength > character.strength && (
            <span className="text-[#4CAF50]">
              {" "}+{effectiveStats.strength - character.strength}
            </span>
          )}
        </div>
        <div>
          AGI.................{character.agility}
          {effectiveStats.agility > character.agility && (
            <span className="text-[#2196F3]">
              {" "}+{effectiveStats.agility - character.agility}
            </span>
          )}
        </div>
        <div>
          INT.................{character.intelligence}
          {effectiveStats.intelligence > character.intelligence && (
            <span className="text-[#9C27B0]">
              {" "}+{effectiveStats.intelligence - character.intelligence}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
