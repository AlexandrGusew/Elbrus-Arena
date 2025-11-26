import type { Zone } from '../../hooks/useBattle';
import { styles } from '../../pages/Dungeon.styles';

const ZONE_NAMES: Record<Zone, string> = {
  head: 'Голова',
  body: 'Тело',
  legs: 'Ноги',
  arms: 'Руки',
};

type ZoneSelectorProps = {
  type: 'attack' | 'defense';
  zones: Zone[];
  selectedZones: Zone[];
  maxSelections: number;
  onToggle: (zone: Zone) => void;
  // Результаты последнего раунда для подсветки
  lastRoundHits?: Zone[];
  lastRoundMisses?: Zone[];
  lastRoundBlocked?: Zone[];
};

export const ZoneSelector = ({
  type,
  zones,
  selectedZones,
  maxSelections,
  onToggle,
  lastRoundHits = [],
  lastRoundMisses = [],
  lastRoundBlocked = [],
}: ZoneSelectorProps) => {
  const selectedColor = type === 'attack' ? '#4CAF50' : '#2196F3';
  const label = type === 'attack' ? 'атаки' : 'защиты';

  const getZoneBorderColor = (zone: Zone) => {
    if (selectedZones.includes(zone)) return selectedColor;

    // Показываем результаты предыдущего раунда
    if (type === 'attack') {
      if (lastRoundHits.includes(zone)) return '#4CAF50'; // Зелёный - попадание
      if (lastRoundMisses.includes(zone)) return '#f44336'; // Красный - промах (монстр заблокировал)
    } else {
      if (lastRoundBlocked.includes(zone)) return '#2196F3'; // Синий - успешная защита
      if (lastRoundMisses.includes(zone)) return '#f44336'; // Красный - монстр попал (не защитили)
    }

    return '#555';
  };

  const getZoneBorderWidth = (zone: Zone) => {
    // Если зона была активна в прошлом раунде - толстый бордер
    if (lastRoundHits.includes(zone) || lastRoundMisses.includes(zone) || lastRoundBlocked.includes(zone)) {
      return '4px';
    }
    return '2px';
  };

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
              border: 'solid',
              borderWidth: getZoneBorderWidth(zone),
              borderColor: getZoneBorderColor(zone),
              background: selectedZones.includes(zone) ? selectedColor : '#333',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {ZONE_NAMES[zone]}
          </button>
        ))}
      </div>
    </div>
  );
};