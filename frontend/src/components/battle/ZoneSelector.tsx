import type { Zone } from '../../hooks/useBattle';
import { styles } from '../../pages/Dungeon.styles';
import { getAssetUrl } from '../../utils/assetUrl';

const ZONE_NAMES: Record<Zone, string> = {
  head: 'Голова',
  body: 'Тело',
  legs: 'Ноги',
  arms: 'Руки',
};

const ZONE_IMAGES: Record<Zone, string> = {
  head: getAssetUrl('dungeon/battle/head (1).png'),
  body: getAssetUrl('dungeon/battle/chest (1).png'),
  legs: getAssetUrl('dungeon/battle/legs (1).png'),
  arms: getAssetUrl('dungeon/battle/arms (1).png'),
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

  const title = type === 'attack' ? 'ATTACK' : 'DEFENCE';

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '12px',
      padding: '15px 20px',
      border: `3px solid ${selectedColor}33`,
    }}>
      <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: selectedColor, marginBottom: '10px', textAlign: 'center' }}>
        {title} - {selectedZones.length}/{maxSelections}
      </h4>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        {zones.map(zone => (
          <div
            key={zone}
            onClick={() => onToggle(zone)}
            style={{
              width: '120px',
              height: '120px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: 'solid',
              borderWidth: getZoneBorderWidth(zone),
              borderColor: getZoneBorderColor(zone),
              borderRadius: '8px',
              overflow: 'hidden',
              background: selectedZones.includes(zone) ? `${selectedColor}33` : 'transparent',
              opacity: selectedZones.includes(zone) ? 1 : 0.7,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = selectedZones.includes(zone) ? '1' : '0.7';
            }}
          >
            <img
              src={ZONE_IMAGES[zone]}
              alt={ZONE_NAMES[zone]}
              style={{
                width: '120%',
                height: '120%',
                objectFit: 'cover',
                pointerEvents: 'none',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            {/* Подпись под картинкой */}
            <div style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}>
              {ZONE_NAMES[zone]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};