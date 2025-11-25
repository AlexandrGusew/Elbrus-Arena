import React from "react";
import { 
  WarriorIdle, 
  WarriorWalk, 
  WarriorAttack1, 
  WarriorAttack2, 
  WarriorAttack3, 
  WarriorDead 
} from ".";

export function WarriorAnimationsDemo() {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
      gap: "20px",
      padding: "20px",
      backgroundColor: "#1a1a1a",
      minHeight: "100vh"
    }}>
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "white", marginBottom: "16px" }}>Простой</h3>
        <WarriorIdle />
      </div>
      
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "white", marginBottom: "16px" }}>Ходьба</h3>
        <WarriorWalk />
      </div>
      
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "white", marginBottom: "16px" }}>Атака 1</h3>
        <WarriorAttack1 />
      </div>
      
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "white", marginBottom: "16px" }}>Атака 2</h3>
        <WarriorAttack2 />
      </div>
      
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "white", marginBottom: "16px" }}>Атака 3</h3>
        <WarriorAttack3 />
      </div>
      
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "white", marginBottom: "16px" }}>Смерть</h3>
        <WarriorDead />
      </div>
    </div>
  );
}
