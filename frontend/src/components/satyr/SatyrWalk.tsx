import { useState } from "react";
import "./satyr-animations.css";

export function SatyrWalk() {
  const [isWalking, setIsWalking] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "satyr-animation satyr-walk " +
          (isWalking ? "satyr-walk--playing" : "")
        }
      />
      <button onClick={() => setIsWalking(!isWalking)} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
