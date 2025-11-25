import { useState } from "react";
import "./yuokai-animations.css";

export function YuokaiDead() {
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    if (isDead) return;
    setIsDead(true);
    setTimeout(() => setIsDead(false), 1200);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "yuokai-animation yuokai-dead " +
          (isDead ? "yuokai-dead--playing" : "")
        }
      />
      <button onClick={handleDeath} style={{ marginTop: 16 }}>
        Смерть
      </button>
    </div>
  );
}
