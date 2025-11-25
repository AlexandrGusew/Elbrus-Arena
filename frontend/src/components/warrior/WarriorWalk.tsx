import { useState } from "react";
import "./warrior-animations.css";

export function WarriorWalk() {
  const [isWalking, setIsWalking] = useState(false);

  const toggleWalk = () => {
    setIsWalking(!isWalking);
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "warrior-animation warrior-walk " + 
          (isWalking ? "warrior-walk--playing" : "")
        }
      />
      <button onClick={toggleWalk} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить ходьбу" : "Начать ходьбу"}
      </button>
    </div>
  );
}
