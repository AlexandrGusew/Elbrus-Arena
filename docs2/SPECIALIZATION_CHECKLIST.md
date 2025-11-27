# СПЕЦИАЛИЗАЦИЯ - КРАТКАЯ ДЕКОМПОЗИЦИЯ

## ПРОБЛЕМА
У варвара разблокировались все 3 тира, но offhand слот не отображается на фронте.

## ПРИЧИНА
В типе `Character` нет поля `specialization`, поэтому фронтенд не знает о специализации.

---

## ЗАДАЧИ

### 1. ✅ BACKEND - Автовыдача offhand предметов
- [x] Щит для PALADIN
- [x] Яд для POISONER
- [x] Пусто для BARBARIAN/SHADOW_DANCER
- [x] Пет для FROST_MAGE/WARLOCK

### 2. ✅ ТИПЫ - Добавить specialization в Character
- [x] Добавить поле `specialization` в `shared/types/character.types.ts`
- [x] Backend включает specialization в ответ GET /character/:id
- [x] Frontend получает и отображает specialization

### 3. ✅ FRONTEND - UI для offhand слота
- [x] Иконки для shield/offhand
- [x] Отдельная секция для offhand
- [x] Проверка specialization работает

### 4. ✅ BACKEND - Валидация экипировки offhand
- [x] PALADIN может только щиты
- [x] BARBARIAN может только оружие
- [x] POISONER не может снять яд
- [x] FROST_MAGE/WARLOCK не могут снять пета
- [x] Тесты для валидации (26/26 passed)

### 5. ✅ TIER 1 - Реализация всех способностей
- [x] PALADIN - щит (автовыдача)
- [x] BARBARIAN - разблокировка слота
- [x] POISONER - яд (автовыдача)
- [x] SHADOW_DANCER - 5 зон атаки (добавлена зона 'back')
- [x] FROST_MAGE - водный элементаль (автовыдача)
- [x] WARLOCK - бес (автовыдача)

### 6. ✅ ТЕСТИРОВАНИЕ - 5 зон атаки SHADOW_DANCER
- [x] BattleService тесты - валидация зоны "back" (18/18 passed)
- [x] MonsterAI тесты - разделение атаки/защиты (12/12 passed)
- [x] Компиляция backend (0 errors)
- [x] Компиляция frontend (0 errors)

---

## ТЕКУЩИЙ ПРОГРЕСС
- ✅ У рога и воина offhand слот работает!
- ✅ У мага пет добавлен в БД и автоматически выдается
- ✅ SHADOW_DANCER может атаковать в 5 зон (backend + frontend)
- ✅ Монстры могут защищать зону 'back'
- ✅ Все тесты проходят успешно (30/30 passed)

## СЛЕДУЮЩИЙ ШАГ
**П.4 - Валидация экипировки offhand по специализации**
