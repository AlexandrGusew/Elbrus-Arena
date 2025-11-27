import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useEnhanceOffhandMutation } from '../store/api/characterApi';
import type { InventoryItem } from '../types/api';
import { styles } from './Blacksmith.styles';

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
      setMessage(
        `Успешно! ${result.itemName} улучшен до +${result.newEnhancementLevel}. Потрачено: 1 супер-поинт`
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

  const canEnhance = hasSpecialization && hasSuperPoints && hasOffhand;

  return (
    <div style={styles.container}>
      <Link to="/dashboard" style={styles.backLink}>
        ← Назад
      </Link>

      <h1 style={styles.title}>Классовый наставник</h1>

      <div style={styles.infoBlock}>
        <p>
          Классовый наставник может улучшить ваш offhand предмет за супер-поинты.
          Улучшение гарантировано успешно и увеличивает enhancement на +1.
        </p>
        <p style={{ marginTop: '10px' }}>
          <strong>Стоимость:</strong> 1 супер-поинт
        </p>
        <p>
          <strong>У вас:</strong> {character.superPoints} супер-поинтов
        </p>
        {character.specialization && (
          <p>
            <strong>Специализация:</strong> {character.specialization.branch}
          </p>
        )}
      </div>

      {/* Сообщение */}
      {message && (
        <div
          style={{
            padding: '15px',
            background: message.includes('Успешно') ? '#4caf50' : '#f44336',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      {/* Условия доступа */}
      {!hasSpecialization && (
        <div style={{ ...styles.infoBlock, background: '#ff9800', color: '#fff' }}>
          ⚠️ Для доступа к классовому наставнику нужна специализация (доступна с 10 уровня)
        </div>
      )}

      {!hasSuperPoints && hasSpecialization && (
        <div style={{ ...styles.infoBlock, background: '#ff9800', color: '#fff' }}>
          ⚠️ У вас нет супер-поинтов. Они начисляются каждые 5 уровней после 15-го (20, 25, 30...)
        </div>
      )}

      {!hasOffhand && hasSpecialization && (
        <div style={{ ...styles.infoBlock, background: '#ff9800', color: '#fff' }}>
          ⚠️ У вас нет экипированного offhand предмета
        </div>
      )}

      {/* Информация о текущем offhand */}
      {offhandItem && (
        <div style={styles.itemCard}>
          <div style={styles.itemHeader}>
            <h3>{offhandItem.item.name}</h3>
            <div
              style={{
                background: '#4caf50',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              +{offhandItem.enhancement}
            </div>
          </div>

          <div style={styles.itemDescription}>{offhandItem.item.description}</div>

          <div style={styles.statsGrid}>
            {offhandItem.item.damage > 0 && <div>Урон: +{offhandItem.item.damage}</div>}
            {offhandItem.item.armor > 0 && <div>Броня: +{offhandItem.item.armor}</div>}
            {offhandItem.item.intelligence > 0 && (
              <div>Интеллект: +{offhandItem.item.intelligence}</div>
            )}
          </div>

          {offhandItem.enhancement > 0 && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                background: '#4caf50',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              Бонус за enhancement: +{offhandItem.enhancement * 10}% к характеристикам
            </div>
          )}

          <button
            onClick={handleEnhanceOffhand}
            disabled={!canEnhance || isEnhancing}
            style={{
              ...styles.buttonEnhance,
              opacity: !canEnhance || isEnhancing ? 0.5 : 1,
              cursor: !canEnhance || isEnhancing ? 'not-allowed' : 'pointer',
              marginTop: '15px',
            }}
          >
            {isEnhancing
              ? 'Улучшение...'
              : `Улучшить за 1 супер-поинт (до +${offhandItem.enhancement + 1})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassMentor;
