import { useState } from "react";
import "./minotaur-animations.css";

export function MinotaurDead() {
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    if (isDead) return;
    setIsDead(true);
    setTimeout(() => setIsDead(false), 1000);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "minotaur-animation minotaur-dead " +
          (isDead ? "minotaur-dead--playing" : "")
        }
      />
      <button onClick={handleDeath} style={{ marginTop: 16 }}>
        Смерть
      </button>
    </div>
  );
}
