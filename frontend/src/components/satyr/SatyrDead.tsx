import { useState } from "react";
import "./satyr-animations.css";

export function SatyrDead() {
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    if (isDead) return;
    setIsDead(true);
    setTimeout(() => setIsDead(false), 800);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "satyr-animation satyr-dead " +
          (isDead ? "satyr-dead--playing" : "")
        }
      />
      <button onClick={handleDeath} style={{ marginTop: 16 }}>
        Смерть
      </button>
    </div>
  );
}
