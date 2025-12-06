import { useState, useEffect } from 'react';
import type { Character } from '../types/api';

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; right: number };
  onUpdateName: (characterId: number, newName: string) => Promise<void>;
}

// Название класса
const getClassName = (classType: string): string => {
  const classLower = classType.toLowerCase();
  switch (classLower) {
    case 'warrior':
      return 'Воин';
    case 'rogue':
      return 'Разбойник';
    case 'mage':
      return 'Маг';
    default:
      return classType;
  }
};

export const CharacterModal = ({
  character,
  isOpen,
  onClose,
  position,
  onUpdateName,
}: CharacterModalProps) => {
  const [editedName, setEditedName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open'>('closed');

  useEffect(() => {
    if (isOpen && character) {
      setEditedName(character.name);
      setAnimationState('opening');
      setTimeout(() => setAnimationState('open'), 100);
    } else {
      setAnimationState('closed');
      setIsEditingName(false);
    }
  }, [isOpen, character]);

  const handleNameBlur = async () => {
    if (!character || editedName.trim() === character.name || !editedName.trim()) {
      setEditedName(character?.name || '');
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateName(character.id, editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditedName(character.name);
      setIsEditingName(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditedName(character?.name || '');
      setIsEditingName(false);
    }
  };

  if (!isOpen || !character || animationState === 'closed') {
    return null;
  }

  const isAnimating = animationState === 'opening';
  const hpPercentage = (character.currentHp / character.maxHp) * 100;
  const staminaPercentage = character.stamina;

  return (
    <>
      {/* Затемнение фона */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1001,
          cursor: 'pointer',
          opacity: isAnimating ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Модальное окно */}
      <div
        style={{
          position: 'fixed',
          right: `${position.right + 120}px`,
          top: `${position.top}px`,
          width: '400px',
          maxHeight: '600px',
          background: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '12px',
          border: '3px solid #ffd700',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
          padding: '20px',
          zIndex: 1002,
          transform: isAnimating ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок и кнопка закрытия */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #ffd700',
            paddingBottom: '10px',
            marginBottom: '10px',
          }}
        >
          <h2
            style={{
              margin: 0,
              color: '#ffd700',
              fontSize: '20px',
              fontWeight: 'bold',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            Информация о персонаже
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '5px 12px',
              background: '#f44336',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d32f2f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f44336';
            }}
          >
            ✕
          </button>
        </div>

        {/* Имя с возможностью редактирования */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#d4af37',
              marginBottom: '5px',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            Имя
          </label>
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyPress}
              disabled={isUpdating}
              autoFocus
              maxLength={20}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ffd700',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '2px solid #ffd700',
                borderRadius: '4px',
                outline: 'none',
                fontFamily: "'IM Fell English', serif",
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              style={{
                padding: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ffd700',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '2px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: "'IM Fell English', serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                e.currentTarget.style.borderColor = '#ffd700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {character.name}
            </div>
          )}
          {isUpdating && (
            <div
              style={{
                fontSize: '12px',
                color: '#888',
                marginTop: '5px',
              }}
            >
              Обновление...
            </div>
          )}
        </div>

        {/* Класс и уровень */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#d4af37',
                marginBottom: '5px',
                fontFamily: "'IM Fell English', serif",
              }}
            >
              Класс
            </label>
            <div
              style={{
                padding: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ffd700',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                fontFamily: "'IM Fell English', serif",
              }}
            >
              {getClassName(character.class)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#d4af37',
                marginBottom: '5px',
                fontFamily: "'IM Fell English', serif",
              }}
            >
              Уровень
            </label>
            <div
              style={{
                padding: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ffd700',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                fontFamily: "'IM Fell English', serif",
              }}
            >
              {character.level}
            </div>
          </div>
        </div>

        {/* HP */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#d4af37',
              marginBottom: '5px',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            Здоровье: {character.currentHp} / {character.maxHp}
          </label>
          <div
            style={{
              width: '100%',
              height: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid #333',
            }}
          >
            <div
              style={{
                width: `${hpPercentage}%`,
                height: '100%',
                background: hpPercentage > 50 ? '#4caf50' : hpPercentage > 25 ? '#ff9800' : '#f44336',
                transition: 'width 0.3s ease, background 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '5px',
                fontSize: '10px',
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              {hpPercentage > 20 && `${Math.round(hpPercentage)}%`}
            </div>
          </div>
        </div>

        {/* Выносливость */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#d4af37',
              marginBottom: '5px',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            Выносливость: {character.stamina} / 100
          </label>
          <div
            style={{
              width: '100%',
              height: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid #333',
            }}
          >
            <div
              style={{
                width: `${staminaPercentage}%`,
                height: '100%',
                background: staminaPercentage > 50 ? '#2196f3' : staminaPercentage > 25 ? '#ff9800' : '#f44336',
                transition: 'width 0.3s ease, background 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '5px',
                fontSize: '10px',
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              {staminaPercentage > 20 && `${staminaPercentage}%`}
            </div>
          </div>
        </div>

        {/* Характеристики */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#d4af37',
              marginBottom: '5px',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            Характеристики
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            <div
              style={{
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '5px',
                }}
              >
                Сила
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#ff6b6b',
                }}
              >
                {character.strength}
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '5px',
                }}
              >
                Ловкость
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#4ecdc4',
                }}
              >
                {character.agility}
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '5px',
                }}
              >
                Интеллект
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#95e1d3',
                }}
              >
                {character.intelligence}
              </div>
            </div>
          </div>
        </div>

        {/* Золото */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#d4af37',
              marginBottom: '5px',
              fontFamily: "'IM Fell English', serif",
            }}
          >
            Золото
          </label>
          <div
            style={{
              padding: '10px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ffd700',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              textAlign: 'center',
              fontFamily: "'IM Fell English', serif",
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            }}
          >
            💰 {character.gold}
          </div>
        </div>
      </div>
    </>
  );
};

