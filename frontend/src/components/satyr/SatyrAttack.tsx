import { useState } from "react";
import "./satyr-animations.css";

export function SatyrAttack() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 1200);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "satyr-animation satyr-attack " +
          (isAttacking ? "satyr-attack--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака копьем
      </button>
    </div>
  );
}
