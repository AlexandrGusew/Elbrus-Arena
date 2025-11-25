import { useState } from "react";
import "./wearwolf-animations.css";

export function WearwolfAttack1() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 900);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wearwolf-animation wearwolf-attack1 " +
          (isAttacking ? "wearwolf-attack1--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 1
      </button>
    </div>
  );
}
