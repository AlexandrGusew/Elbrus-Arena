import React from "react";
import {
  SatyrIdle,
  SatyrWalk,
  SatyrAttack,
  SatyrDead
} from "./index";

export function SatyrAnimationsDemo() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      padding: "20px",
      backgroundColor: "#1a1a2e",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Ожидание</h3>
        <SatyrIdle />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Ходьба</h3>
        <SatyrWalk />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Атака копьем</h3>
        <SatyrAttack />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Смерть</h3>
        <SatyrDead />
      </div>
    </div>
  );
}
