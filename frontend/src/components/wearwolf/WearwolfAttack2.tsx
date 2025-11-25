import { useState } from "react";
import "./wearwolf-animations.css";

export function WearwolfAttack2() {
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 600);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wearwolf-animation wearwolf-attack2 " +
          (isAttacking ? "wearwolf-attack2--playing" : "")
        }
      />
      <button onClick={handleAttack} style={{ marginTop: 16 }}>
        Атака 2
      </button>
    </div>
  );
}
