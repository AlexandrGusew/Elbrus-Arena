# Стили для RPG игры - Character Select Screen

## 🎨 Цветовая палитра

### Основные цвета
- **Background Dark**: `#1a1410` - основной темный фон
- **Background Medium**: `#2d2419` - вторичный фон для панелей
- **Background Light**: `#3d3020` - светлые акценты фона

### Акцентные цвета
- **Gold Primary**: `#d4a574` - основной золотой (заголовки, рамки)
- **Gold Dark**: `#8b6f47` - темное золото (тени)
- **Gold Light**: `#f5d7a1` - светлое золото (highlights)

### Текст
- **Text Primary**: `#e8dcc8` - основной текст
- **Text Secondary**: `#b8a890` - вторичный текст
- **Text Dim**: `#7a6d5a` - приглушенный текст
- **Text Highlight**: `#ffffff` - яркие акценты

### UI элементы
- **Border Dark**: `#4a3d2a` - темные границы
- **Border Light**: `#6b5840` - светлые границы
- **Button Background**: `rgba(45, 36, 25, 0.8)` - фон кнопок
- **Button Hover**: `rgba(61, 48, 32, 0.9)` - ховер состояние
- **Selection**: `#8b6f47` - выделение


---

## 📝 Типографика

### Заголовки
**Character Select (H1)**
```
Font: Cinzel / TrajanPro / Morfeus (альтернативы)
Size: 36-48px
Weight: Bold
Color: #d4a574 (Gold Primary)
Letter-spacing: 4px
Text-transform: uppercase
Text-shadow: 0 2px 8px rgba(0,0,0,0.8)
```

**Panel Headers (H2)**
```
Font: Cinzel / TrajanPro
Size: 18-24px
Weight: SemiBold
Color: #e8dcc8 (Text Primary)
Letter-spacing: 2px
```

### Основной текст
**Labels (характеристики)**
```
Font: Roboto / Open Sans / PT Sans
Size: 14-16px
Weight: Regular
Color: #b8a890 (Text Secondary)
```

**Values (числа)**
```
Font: Roboto / Open Sans
Size: 14-16px
Weight: Bold
Color: #e8dcc8 (Text Primary)
```

---

## 🔲 Компоненты UI

### Панель персонажа (Character Card)
```css
background: linear-gradient(135deg, rgba(45,36,25,0.95) 0%, rgba(29,23,16,0.95) 100%)
border: 2px solid #6b5840
border-radius: 4px
padding: 16px
backdrop-filter: blur(4px)

/* Внутренняя рамка */
box-shadow: 
  inset 0 1px 0 rgba(212,165,116,0.3),
  0 4px 12px rgba(0,0,0,0.6)
```

### Кнопки
**Primary Button**
```css
background: linear-gradient(180deg, #4a3d2a 0%, #2d2419 100%)
border: 2px solid #8b6f47
border-radius: 4px
padding: 12px 24px
color: #e8dcc8
font-weight: 600
text-transform: uppercase
letter-spacing: 1px

/* Hover */
background: linear-gradient(180deg, #5a4d3a 0%, #3d3020 100%)
border-color: #d4a574
box-shadow: 0 0 12px rgba(212,165,116,0.4)
```

**Secondary Button (Выбор сервера, Удалить персонажа)**
```css
background: rgba(45,36,25,0.6)
border: 1px solid #4a3d2a
padding: 10px 20px
color: #b8a890

/* Hover */
background: rgba(61,48,32,0.8)
border-color: #6b5840
color: #e8dcc8
```

### Таблица характеристик
```css
/* Row */
display: flex
justify-content: space-between
padding: 8px 12px
border-bottom: 1px solid rgba(74,61,42,0.4)

/* Label */
color: #b8a890
font-size: 14px

/* Value */
color: #e8dcc8
font-weight: 600
font-size: 14px
```

### Иконки классов (Class Icons)
```css
width: 48px
height: 48px
border: 2px solid #6b5840
border-radius: 4px
background: rgba(29,23,16,0.8)

/* Selected */
border-color: #d4a574
box-shadow: 0 0 16px rgba(212,165,116,0.6)

/* Hover */
border-color: #8b6f47
transform: scale(1.05)
```

---

## ✨ Эффекты и декорации

### Свечение (Glow)
```css
/* Для выделенных элементов */
box-shadow: 
  0 0 8px rgba(212,165,116,0.3),
  0 0 16px rgba(212,165,116,0.2),
  inset 0 1px 0 rgba(255,255,255,0.1)
```

### Тени
```css
/* Глубокая тень для панелей */
box-shadow: 
  0 8px 24px rgba(0,0,0,0.8),
  0 2px 8px rgba(0,0,0,0.6)

/* Легкая тень для текста */
text-shadow: 0 2px 4px rgba(0,0,0,0.8)
```

### Градиенты
```css
/* Фон панелей */
background: linear-gradient(135deg, 
  rgba(45,36,25,0.95) 0%, 
  rgba(29,23,16,0.95) 100%
)

/* Металлические рамки */
border-image: linear-gradient(
  180deg,
  #d4a574 0%,
  #8b6f47 50%,
  #4a3d2a 100%
) 1
```

---

## 🎭 Декоративные элементы

### Угловые орнаменты
- Используй SVG с готическими узорами
- Цвет: #8b6f47 с opacity 0.4-0.6
- Расположение: углы панелей

### Разделители
```css
width: 100%
height: 1px
background: linear-gradient(
  90deg,
  transparent 0%,
  #8b6f47 50%,
  transparent 100%
)
margin: 16px 0
```

---

## 📱 Адаптивность

### Desktop (1920x1080)
- Панели персонажей: 340px ширина
- Основной контент: центр экрана
- Кнопки внизу: фиксированная позиция

### Tablet/Mobile
- Панели персонажей: стек вертикально
- Font-size: -2px от desktop версии
- Padding: -4px от desktop версии

---

## 🔤 Рекомендуемые шрифты

**Для заголовков (fantasy стиль):**
1. Cinzel (Google Fonts) - лучший вариант
2. TrajanPro 
3. Morpheus
4. Immortal

**Для UI текста:**
1. Roboto (Google Fonts)
2. Open Sans
3. PT Sans
4. Lato

---

## 💡 Советы по реализации

1. **Используй CSS Custom Properties** для цветов:
```css
:root {
  --bg-dark: #1a1410;
  --gold-primary: #d4a574;
  --text-primary: #e8dcc8;
}
```

2. **Анимации для интерактивности:**
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

3. **Backdrop filter** для стеклянного эффекта:
```css
backdrop-filter: blur(8px);
```

4. **Layer blur** для глубины:
- Задний план: blur(2px)
- Средний план: без blur
- Передний план: sharpen

