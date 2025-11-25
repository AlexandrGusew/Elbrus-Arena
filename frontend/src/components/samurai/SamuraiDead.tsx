import { useState } from "react";
import "./samurai-animations.css";

export function SamuraiDead() {
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
          "samurai-animation samurai-dead " +
          (isDead ? "samurai-dead--playing" : "")
        }
      />
      <button onClick={handleDeath} style={{ marginTop: 16 }}>
        Смерть
      </button>
    </div>
  );
}
