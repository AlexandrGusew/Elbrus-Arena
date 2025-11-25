import { useState } from "react";
import "./wearwolf-animations.css";

export function WearwolfAttack3() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 800);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wearwolf-animation wearwolf-attack3 " +
          (isAttacking ? "wearwolf-attack3--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 3
      </button>
    </div>
  );
}
