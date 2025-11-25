import { useState } from "react";
import "./wearwolf-animations.css";

export function WearwolfDead() {
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    if (isDead) return;
    setIsDead(true);
    setTimeout(() => setIsDead(false), 400);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wearwolf-animation wearwolf-dead " +
          (isDead ? "wearwolf-dead--playing" : "")
        }
      />
      <button onClick={handleDeath} style={{ marginTop: 16 }}>
        Смерть
      </button>
    </div>
  );
}
