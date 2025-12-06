import type { Zone } from '../../hooks/useBattle';

const ZONE_LABELS: Record<Zone, string> = {
  head: 'HEAD',
  body: 'BODY',
  legs: 'LEGS',
  arms: 'ARMS',
  back: 'BACK',
};

const ZONE_NUMBERS: Record<Zone, number> = {
  head: 1,
  body: 2,
  legs: 3,
  arms: 4,
  back: 5,
};

type LastRoundResult = {
  defendedSuccessfully?: Zone[];
  notAttacked?: Zone[];
  playerHits?: Zone[]; // игрок попал (монстр не защитил)
  playerMisses?: Zone[]; // игрок промахнулся (монстр защитил)
};

type ZoneBlocksProps = {
  type: 'defense' | 'attack';
  zones: Zone[];
  selectedZones: Zone[];
  lastRoundResult?: LastRoundResult;
  onToggle?: (zone: Zone) => void;
  waitingForResult: boolean;
};

export const ZoneBlocks = ({
  type,
  zones,
  selectedZones,
  lastRoundResult,
  onToggle,
  waitingForResult,
}: ZoneBlocksProps) => {
  // Фильтруем только первые 4 зоны (head, body, legs, arms) для отображения
  const displayZones = zones.filter(z => z !== 'back').slice(0, 4) as Zone[];

  const getBlockStyle = (zone: Zone) => {
    const baseStyle: React.CSSProperties = {
      width: 'calc((100% - 24px) / 4)', // Равномерно распределены по ширине (4 блока с gap 8px)
      aspectRatio: '1', // Сохраняем квадратную форму
      border: '3px solid #2C2D33',
      borderRadius: '8px',
      background: '#111215',
      cursor: !waitingForResult && onToggle ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
    };

    if (waitingForResult && lastRoundResult) {
      // Показываем результаты раунда
      if (type === 'defense') {
        // Для защиты
        if (lastRoundResult.defendedSuccessfully?.includes(zone)) {
          // Успешная защита - зеленая подсветка
          return {
            ...baseStyle,
            border: '3px solid #4CAF50',
            background: 'rgba(76, 175, 80, 0.3)',
          };
        }
        if (lastRoundResult.notAttacked?.includes(zone)) {
          // Не атаковали эту зону - обычное состояние
          return baseStyle;
        }
        // Не защитили (монстр атаковал, но зона не была защищена) - нет подсветки
        return baseStyle;
      } else {
        // Для атаки - показываем результаты атак ИГРОКА
        if (lastRoundResult.playerHits?.includes(zone)) {
          // Игрок попал - красная подсветка + анимация подъема
          return {
            ...baseStyle,
            border: '3px solid #f44336',
            background: 'rgba(244, 67, 54, 0.3)',
            transform: 'translateY(-8px)',
          };
        }
        if (lastRoundResult.playerMisses?.includes(zone)) {
          // Игрок промахнулся (монстр защитил) - серая подсветка
          return {
            ...baseStyle,
            border: '3px solid #9E9E9E',
            background: 'rgba(158, 158, 158, 0.3)',
          };
        }
      }
    } else if (!waitingForResult) {
      // До атаки - показываем выбор
      if (selectedZones.includes(zone)) {
        // Для атак используем другой цвет (красный), для защиты - зеленый
        const selectedColor = type === 'attack' ? '#f44336' : '#4CAF50';
        return {
          ...baseStyle,
          border: `3px solid ${selectedColor}`,
          background: type === 'attack' 
            ? 'rgba(244, 67, 54, 0.2)' 
            : 'rgba(76, 175, 80, 0.2)',
        };
      }
    }

    return baseStyle;
  };

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      width: '100%',
      justifyContent: 'center',
    }}>
      {displayZones.map((zone) => (
        <div
          key={zone}
          onClick={() => {
            if (onToggle && !waitingForResult) {
              onToggle(zone);
            }
          }}
          style={getBlockStyle(zone)}
        >
          <div style={{
            fontSize: 'clamp(16px, 3vw, 24px)', // Адаптивный размер шрифта
            fontWeight: 'bold',
            color: '#E6E6E6',
            fontFamily: 'serif',
          }}>
            {ZONE_NUMBERS[zone]}
          </div>
          <div style={{
            fontSize: 'clamp(8px, 1.2vw, 12px)', // Адаптивный размер шрифта
            color: 'rgba(230, 230, 230, 0.6)',
            marginTop: '4px',
            fontFamily: 'serif',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {ZONE_LABELS[zone]}
          </div>
        </div>
      ))}
    </div>
  );
};

