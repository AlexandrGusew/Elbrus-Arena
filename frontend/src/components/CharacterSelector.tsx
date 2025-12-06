import { useState, useEffect } from 'react';
import type { Character, CharacterClass } from '../types/api';
import { getAssetUrl } from '../utils/assetUrl';
import { useGetLevelProgressQuery } from '../store/api/characterApi';

interface CharacterSelectorProps {
  characters: Character[]; // Массив персонажей пользователя
  selectedCharacterId: number | null;
  onSelectCharacter: (characterId: number) => void;
  onOpenModal?: (character: Character, position: { top: number; right: number }) => void;
  onUpdateName?: (characterId: number, newName: string) => Promise<void>;
}

// Классы в порядке отображения
const CHARACTER_CLASSES_ORDER: Array<'warrior' | 'rogue' | 'mage'> = ['warrior', 'rogue', 'mage'];

// Получение изображения класса (принимает класс в любом регистре)
const getClassImage = (classType: string): string => {
  const classLower = classType.toLowerCase();
  // Используем изображения персонажей из боевой системы
  switch (classLower) {
    case 'warrior':
      return getAssetUrl('dungeon/battle/warrior_character.png');
    case 'rogue':
      return getAssetUrl('dungeon/battle/rogue_character.png');
    case 'mage':
      return getAssetUrl('dungeon/battle/mage_character.png');
    default:
      return getAssetUrl('dungeon/battle/warrior_character.png');
  }
};

// Получение видео класса (принимает класс в любом регистре)
const getClassVideo = (classType: string): string => {
  const classLower = classType.toLowerCase();
  switch (classLower) {
    case 'warrior':
      return getAssetUrl('dashboard/warrior.mp4');
    case 'rogue':
      return getAssetUrl('dashboard/sin.mp4');
    case 'mage':
      return getAssetUrl('dashboard/mag.mp4');
    default:
      return getAssetUrl('dashboard/warrior.mp4');
  }
};

// Названия классов
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
      return '';
  }
};

export const CharacterSelector = ({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onOpenModal,
  onUpdateName,
}: CharacterSelectorProps) => {
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  // Получаем прогресс опыта для выбранного персонажа
  const { data: levelProgress } = useGetLevelProgressQuery(
    selectedCharacterId || 0,
    { skip: !selectedCharacterId }
  );

  useEffect(() => {
    if (selectedCharacter) {
      setEditedName(selectedCharacter.name);
    }
  }, [selectedCharacter]);

  const handleIconClick = (character: Character | null) => {
    if (character) {
      onSelectCharacter(character.id);
      // Если передана функция onOpenModal, вызываем её для обратной совместимости
      if (onOpenModal && !selectedCharacterId) {
        const rect = document.querySelector(`[data-character-id="${character.id}"]`)?.getBoundingClientRect();
        if (rect) {
          onOpenModal(character, {
            top: rect.top,
            right: window.innerWidth - rect.right,
          });
        }
      }
    }
  };

  const handleNameBlur = async () => {
    if (!selectedCharacter || editedName.trim() === selectedCharacter.name || !editedName.trim() || !onUpdateName) {
      setEditedName(selectedCharacter?.name || '');
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateName(selectedCharacter.id, editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditedName(selectedCharacter.name);
      setIsEditingName(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditedName(selectedCharacter?.name || '');
      setIsEditingName(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: '10px',
        top: '120px',
        bottom: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 1000,
        padding: '20px 0',
        gap: '10px',
      }}
    >
      {CHARACTER_CLASSES_ORDER.map((classType) => {
        const character = characters.find(
          (c) => c.class.toLowerCase() === classType.toLowerCase()
        );
        const isSelected = selectedCharacterId === character?.id;
        const isHovered = hoveredClass === classType;
        const exists = !!character;

        // Ширина контейнера зависит от того, развернут ли персонаж
        const containerWidth = isSelected ? '950px' : '180px';
        const iconWidth = isSelected ? '250px' : '180px';
        const infoPanelWidth = isSelected ? '680px' : '0px';

        return (
          <div
            key={classType}
            data-character-id={character?.id}
            style={{
              position: 'relative',
              width: containerWidth,
              height: '180px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              transition: 'width 0.4s ease',
              overflow: 'hidden',
            }}
          >
            {/* Иконка персонажа */}
            <button
              onClick={() => handleIconClick(character || null)}
              onMouseEnter={() => setHoveredClass(classType)}
              onMouseLeave={() => setHoveredClass(null)}
              disabled={!exists}
              style={{
                position: 'relative',
                width: iconWidth,
                height: '180px',
                border: 'none',
                borderRadius: isSelected ? '8px 0 0 8px' : '8px',
                background: exists
                  ? 'rgba(0, 0, 0, 0.6)'
                  : 'rgba(0, 0, 0, 0.5)',
                cursor: exists ? 'pointer' : 'not-allowed',
                overflow: 'hidden',
                transition: 'all 0.4s ease',
                opacity: exists ? 1 : 0.5,
                transform: isHovered && !isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                  : isHovered
                  ? '0 2px 6px rgba(0, 0, 0, 0.2)'
                  : 'none',
                flexShrink: 0,
              }}
            >
              {isSelected && exists && character ? (
                <video
                  key={`${character.id}-${classType}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    console.error(`Video failed to load for ${classType}:`, getClassVideo(classType));
                  }}
                >
                  <source src={getClassVideo(classType)} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={getClassImage(classType)}
                  alt={getClassName(classType)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: exists ? 'brightness(1)' : 'grayscale(100%) brightness(0.5)',
                  }}
                />
              )}
              {!exists && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '18px',
                    color: '#888',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {getClassName(classType)}
                  <br />
                  <span style={{ fontSize: '14px' }}>Не создан</span>
                </div>
              )}
              {exists && character && !isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '6px',
                    right: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  <span>{character.name}</span>
                  <span>Lv.{character.level}</span>
                </div>
              )}
            </button>

            {/* Панель информации - появляется справа при развертывании */}
            {isSelected && character && (
              <div
                style={{
                  width: infoPanelWidth,
                  height: '100%',
                  marginLeft: '0',
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '0 8px 8px 0',
                  border: 'none',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  overflow: 'hidden',
                  transition: 'width 0.4s ease, opacity 0.4s ease',
                  opacity: isSelected ? 1 : 0,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  fontSize: '10px',
                }}
              >
                {/* Столбец 1: Имя, Уровень, Класс, Золото */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-start', padding: '0' }}>
                  {/* Имя */}
                  {isEditingName ? (
                    <div
                      style={{
                        padding: '6px 8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#d4af37',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        Имя
                      </span>
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
                          width: '60%',
                          padding: '3px 6px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#fff',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '3px',
                          outline: 'none',
                          fontFamily: "'IM Fell English', serif",
                          boxSizing: 'border-box',
                        }}
                      />
                      {isUpdating && (
                        <span
                          style={{
                            fontSize: '8px',
                            color: '#d4af37',
                            marginLeft: '5px',
                          }}
                        >
                          Обновление...
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingName(true)}
                      style={{
                        padding: '6px 8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#d4af37',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        Имя
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#fff',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        {character.name}
                      </span>
                    </div>
                  )}

                  {/* Уровень */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      Уровень
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#fff',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      {character.level}
                    </span>
                  </div>

                  {/* Класс */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      Класс
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#fff',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      {getClassName(character.class)}
                    </span>
                  </div>

                  {/* Золото */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      Золото
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#ffd700',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      💰 {character.gold.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Столбец 2: HP, Выносливость, Опыт */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-start', padding: '0' }}>
                  {/* HP */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#d4af37',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        HP
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#fff',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        {character.currentHp}/{character.maxHp}
                      </span>
                    </div>
                    {/* Прогресс-бар HP */}
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (character.currentHp / character.maxHp) * 100)}%`,
                          background: (character.currentHp / character.maxHp) > 0.5 
                            ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)' 
                            : (character.currentHp / character.maxHp) > 0.25
                            ? 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)'
                            : 'linear-gradient(90deg, #f44336 0%, #e91e63 100%)',
                          transition: 'width 0.3s ease',
                          boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                          borderRadius: '5px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Выносливость */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#d4af37',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        Выносливость
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#fff',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        {character.stamina}/100
                      </span>
                    </div>
                    {/* Прогресс-бар выносливости */}
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (character.stamina / 100) * 100)}%`,
                          background: (character.stamina / 100) > 0.5 
                            ? 'linear-gradient(90deg, #3498db 0%, #5dade2 100%)' 
                            : (character.stamina / 100) > 0.25
                            ? 'linear-gradient(90deg, #e67e22 0%, #f39c12 100%)'
                            : 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
                          transition: 'width 0.3s ease',
                          boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                          borderRadius: '5px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Прогресс опыта */}
                  {levelProgress && (
                    <div
                      style={{
                        padding: '6px 8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#d4af37',
                            fontFamily: "'IM Fell English', serif",
                          }}
                        >
                          Опыт
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#fff',
                            fontFamily: "'IM Fell English', serif",
                          }}
                        >
                          {levelProgress.currentExp.toLocaleString()} / {levelProgress.expForNextLevel.toLocaleString()}
                        </span>
                      </div>
                      {/* Прогресс-бар опыта */}
                      <div
                        style={{
                          width: '100%',
                          height: '10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, (levelProgress.currentExp / levelProgress.expForNextLevel) * 100)}%`,
                            background: 'linear-gradient(90deg, #e0e0e0 0%, #ffffff 100%)',
                            transition: 'width 0.3s ease',
                            boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                            borderRadius: '5px',
                          }}
                        />
                      </div>
                      {/* Осталось до следующего уровня */}
                      <div
                        style={{
                          fontSize: '8px',
                          color: '#aaa',
                          textAlign: 'right',
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        Осталось: {(levelProgress.expForNextLevel - levelProgress.currentExp).toLocaleString()} опыта
                      </div>
                    </div>
                  )}
                </div>

                {/* Столбец 3: Сила, Ловкость, Интеллект */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-start', padding: '0' }}>
                  {/* Сила */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      Сила
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#c62828',
                      }}
                    >
                      {character.strength}
                    </span>
                  </div>

                  {/* Ловкость */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      Ловкость
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#00695c',
                      }}
                    >
                      {character.agility}
                    </span>
                  </div>

                  {/* Интеллект */}
                  <div
                    style={{
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      Интеллект
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#0277bd',
                      }}
                    >
                      {character.intelligence}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
