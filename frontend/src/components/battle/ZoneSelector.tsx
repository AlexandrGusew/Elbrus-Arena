import type { Zone } from '../../hooks/useBattle';
import { styles } from '../../pages/Dungeon.styles';

const ZONE_NAMES: Record<Zone, string> = {
  head: '🧠 Голова',
  body: '🛡️ Тело',
  legs: '🦵 Ноги',
  arms: '💪 Руки',
};

type ZoneSelectorProps = {
  type: 'attack' | 'defense';
  zones: Zone[];
  selectedZones: Zone[];
  maxSelections: number;
  onToggle: (zone: Zone) => void;
};

export const ZoneSelector = ({ type, zones, selectedZones, maxSelections, onToggle }: ZoneSelectorProps) => {
  const selectedColor = type === 'attack' ? '#4CAF50' : '#2196F3';
  const label = type === 'attack' ? 'атаки' : 'защиты';

  return (
    <div style={styles.statsBlock}>
      <h4>Выберите {maxSelections} {maxSelections === 2 ? 'зоны' : 'зон'} для {label} ({selectedZones.length}/{maxSelections}):</h4>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => onToggle(zone)}
            style={{
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px solid',
              borderColor: selectedZones.includes(zone) ? selectedColor : '#555',
              background: selectedZones.includes(zone) ? selectedColor : '#333',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {ZONE_NAMES[zone]}
          </button>
        ))}
      </div>
    </div>
  );
};