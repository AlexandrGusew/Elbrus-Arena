import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useEnhanceOffhandMutation } from '../store/api/characterApi';
import type { InventoryItem } from '../types/api';

const ClassMentor = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');
  const [message, setMessage] = useState<string | null>(null);

  const { data: character, isLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const [enhanceOffhand, { isLoading: isEnhancing }] = useEnhanceOffhandMutation();

  const handleEnhanceOffhand = async () => {
    if (!character) return;

    if (character.superPoints < 1) {
      setMessage('Недостаточно супер-поинтов! Требуется: 1');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!character.specialization) {
      setMessage('У вас нет специализации!');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const result = await enhanceOffhand(Number(characterId)).unwrap();

      // Формируем сообщение в зависимости от типа бонуса
      let bonusMessage = '';
      if (result.bonusType === 'enhancement') {
        bonusMessage = `Enhancement +${result.bonusValue}`;
      } else {
        bonusMessage = `+${result.bonusValue} к ${result.bonusType}`;
      }

      setMessage(
        `✨ Успешно! ${result.itemName} получил улучшение: ${bonusMessage}! Потрачено: 1 супер-поинт`
      );
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage(error.data?.message || 'Ошибка улучшения');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  // Найти экипированный offhand предмет
  const offhandItem = character.inventory.items.find(
    (invItem: InventoryItem) =>
      invItem.isEquipped && (invItem.item.type === 'offhand' || invItem.item.type === 'shield')
  );

  const hasSpecialization = !!character.specialization;
  const hasSuperPoints = character.superPoints >= 1;
  const hasOffhand = !!offhandItem;
  const hasRequiredLevel = character.level >= 15;

  const canEnhance = hasRequiredLevel && hasSpecialization && hasSuperPoints && hasOffhand;

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  };

  const backLinkStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid #ffd700',
    borderRadius: '12px',
    color: '#ffd700',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    marginBottom: '30px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '40px',
    background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
    animation: 'glow 2s ease-in-out infinite alternate',
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes glow {
            from {
              filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
            }
            to {
              filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.8));
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}
      </style>

      <Link
        to="/dashboard"
        style={backLinkStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
          e.currentTarget.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        ← Назад
      </Link>

      <h1 style={titleStyle}>⚔️ Классовый наставник ⚔️</h1>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto 30px',
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', lineHeight: '1.6' }}>
          💫 Классовый наставник может усилить ваш offhand предмет за супер-поинты.
        </p>
        <div style={{
          fontSize: '15px',
          color: '#e0e0e0',
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          lineHeight: '1.8',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#ffd700' }}>Бонусы по классам:</div>
          <div>⚔️ <strong>Разбойник</strong> (яд): ×2 урон</div>
          <div>🔮 <strong>Маг</strong> (элементаль/бес): ×2 урон питомца</div>
          <div>🛡️ <strong>Воин</strong> (щит): ×2 броня</div>
          <div>⚔️ <strong>Воин</strong> (оружие): ×2 урон</div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '20px',
        }}>
          <div style={{
            padding: '15px',
            background: 'rgba(255, 215, 0, 0.15)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 215, 0, 0.3)',
          }}>
            <div style={{ fontSize: '14px', color: '#ffd700', marginBottom: '5px' }}>💰 Стоимость</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>1 супер-поинт</div>
          </div>
          <div style={{
            padding: '15px',
            background: 'rgba(76, 175, 80, 0.15)',
            borderRadius: '12px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          }}>
            <div style={{ fontSize: '14px', color: '#4caf50', marginBottom: '5px' }}>✨ У вас</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{character.superPoints} SP</div>
          </div>
          {character.specialization && (
            <div style={{
              padding: '15px',
              background: 'rgba(156, 39, 176, 0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(156, 39, 176, 0.3)',
            }}>
              <div style={{ fontSize: '14px', color: '#9c27b0', marginBottom: '5px' }}>🎯 Специализация</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ce93d8' }}>{character.specialization.branch}</div>
            </div>
          )}
        </div>
      </div>

      {/* Сообщение */}
      {message && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 30px',
          padding: '20px 30px',
          background: message.includes('Успешно')
            ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
            : 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          animation: 'pulse 1s ease-in-out',
        }}>
          {message}
        </div>
      )}

      {/* Условия доступа */}
      {character.level < 15 && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 30px',
          padding: '30px',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
          border: '2px solid #ff9800',
          borderRadius: '20px',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
          <div>Классовый наставник доступен с 15 уровня</div>
          <div style={{ fontSize: '16px', marginTop: '10px', color: '#ffb74d' }}>Приходите позже!</div>
        </div>
      )}

      {character.level >= 15 && !hasSpecialization && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 30px',
          padding: '30px',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
          border: '2px solid #ff9800',
          borderRadius: '20px',
          textAlign: 'center',
          fontSize: '18px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Нужна специализация!</div>
          <div style={{ fontSize: '16px', color: '#ffb74d' }}>Доступна с 10 уровня</div>
        </div>
      )}

      {character.level >= 15 && !hasSuperPoints && hasSpecialization && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 30px',
          padding: '30px',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
          border: '2px solid #ff9800',
          borderRadius: '20px',
          textAlign: 'center',
          fontSize: '18px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💎</div>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Нет супер-поинтов</div>
          <div style={{ fontSize: '16px', color: '#ffb74d' }}>
            Начисляются каждые 5 уровней после 15-го (20, 25, 30...)
          </div>
        </div>
      )}

      {!hasOffhand && hasSpecialization && character.level >= 15 && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 30px',
          padding: '30px',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
          border: '2px solid #ff9800',
          borderRadius: '20px',
          textAlign: 'center',
          fontSize: '18px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛡️</div>
          <div style={{ fontWeight: 'bold' }}>Нет экипированного offhand предмета</div>
        </div>
      )}

      {/* Информация о текущем offhand */}
      {offhandItem && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '30px',
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(101, 67, 33, 0.15) 100%)',
          border: '3px solid #cd853f',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(205, 133, 63, 0.3)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {offhandItem.item.name}
            </h3>
            <div
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.5)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              +{offhandItem.enhancement}
            </div>
          </div>

          <div style={{
            fontSize: '16px',
            color: '#e0e0e0',
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            borderLeft: '4px solid #ffd700',
          }}>
            {offhandItem.item.description}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '20px',
          }}>
            {offhandItem.item.damage > 0 && (
              <div style={{
                padding: '15px',
                background: 'rgba(244, 67, 54, 0.2)',
                border: '2px solid #f44336',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '14px', color: '#ff8a80', marginBottom: '5px' }}>⚔️ Урон</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>+{offhandItem.item.damage}</div>
              </div>
            )}
            {offhandItem.item.armor > 0 && (
              <div style={{
                padding: '15px',
                background: 'rgba(96, 125, 139, 0.2)',
                border: '2px solid #607d8b',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '14px', color: '#b0bec5', marginBottom: '5px' }}>🛡️ Броня</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#90a4ae' }}>+{offhandItem.item.armor}</div>
              </div>
            )}
            {offhandItem.item.intelligence > 0 && (
              <div style={{
                padding: '15px',
                background: 'rgba(33, 150, 243, 0.2)',
                border: '2px solid #2196f3',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '14px', color: '#90caf9', marginBottom: '5px' }}>🧠 Интеллект</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#42a5f5' }}>+{offhandItem.item.intelligence}</div>
              </div>
            )}
          </div>

          {offhandItem.enhancement > 0 && (
            <div
              style={{
                marginBottom: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
              }}
            >
              ✨ Бонус за заточку: +{offhandItem.enhancement * 10}% к характеристикам
            </div>
          )}

          <button
            onClick={handleEnhanceOffhand}
            disabled={!canEnhance || isEnhancing}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '20px',
              fontWeight: 'bold',
              background: canEnhance && !isEnhancing
                ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)'
                : '#555',
              color: canEnhance && !isEnhancing ? '#000' : '#999',
              border: 'none',
              borderRadius: '16px',
              cursor: !canEnhance || isEnhancing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: canEnhance && !isEnhancing
                ? '0 8px 25px rgba(255, 215, 0, 0.5)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (canEnhance && !isEnhancing) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 215, 0, 0.7)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = canEnhance && !isEnhancing
                ? '0 8px 25px rgba(255, 215, 0, 0.5)'
                : 'none';
            }}
          >
            {isEnhancing
              ? '⚡ Улучшение...'
              : `⚔️ Улучшить за 1 супер-поинт (до +${offhandItem.enhancement + 1})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassMentor;
