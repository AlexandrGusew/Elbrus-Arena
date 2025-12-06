import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAssetUrl } from '../../utils/assetUrl';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const backgroundVideoUrl = getAssetUrl('Landing/Landing_background.mp4');

  // Состояние для модального окна с портретом
  const [selectedPortrait, setSelectedPortrait] = useState<string | null>(null);

  // Состояние для модального окна с feature изображением
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Портреты классов
  const warriorPortrait = getAssetUrl('Landing/portrait-chars/War_port.png');
  const roguePortrait = getAssetUrl('Landing/portrait-chars/Rog_port.png');
  const magePortrait = getAssetUrl('Landing/portrait-chars/Mag_port.png');

  // Feature images - World Worthy of Falling
  const arenaImage = getAssetUrl('Landing/World Worthy of Falling/PvP.png');
  const abyssImage = getAssetUrl('Landing/World Worthy of Falling/PvE.png');
  const fateImage = getAssetUrl('Landing/World Worthy of Falling/Wood.png');
  const itemsImage = getAssetUrl('Landing/World Worthy of Falling/Item.png');

  // Gallery images - Breath of Darkness
  const darkLandsImage = getAssetUrl('Landing/Breath of Darkness/Enter.png');
  const epicBattlesImage = getAssetUrl('Landing/Breath of Darkness/Battl.png');
  const abyssMagicImage = getAssetUrl('Landing/Breath of Darkness/Abys.png');

  // Debug: проверяем URL фонового видео
  console.log('[Landing] Background Video URL:', backgroundVideoUrl);

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Intersection Observer для анимаций при прокрутке
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Можно отключить observer после первого показа
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Находим все элементы с классом scroll-reveal
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing">
      {/* Фиксированное видео на весь экран */}
      <video
        className="landing-background"
        autoPlay
        loop
        muted
        playsInline
        src={backgroundVideoUrl}
      />
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">Nightfall-Arena</div>
          <nav className="nav-menu">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
            >
              Главная
            </a>
            <a
              href="#classes"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('classes');
              }}
            >
              Классы
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              Возможности
            </a>
            <a
              href="#gallery"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('gallery');
              }}
            >
              Галерея
            </a>
            <a
              href="#community"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('community');
              }}
            >
              Сообщество
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Судьба выбирает павших</h1>
          <p className="hero-subtitle">
            Шагните в Бездну и докажите, что только
            <br />
            павшие герои могут достичь бессмертия и силы
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleLoginClick}>
              НАЧАТЬ ПУТЬ БЕССМЕРТИЯ
            </button>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section id="classes" className="classes-section">
        <div className="section-header scroll-reveal fade-up">
          <span className="section-icon">⚔</span>
          <h2 className="section-title">Выберите свой путь</h2>
          <span className="section-icon">⚔</span>
        </div>

        <div className="classes-grid">
          <div className="class-card scroll-reveal scale-in delay-1">
            <img
              src={roguePortrait}
              alt="Воин Призраков"
              className="class-icon"
              onClick={() => setSelectedPortrait(roguePortrait)}
            />
            <h3 className="class-title">Крадущийся в тени</h3>
            <p className="class-description">
              Никогда не знаешь, с какой стороны продкрадется смерть
            </p>
          </div>

          <div className="class-card featured scroll-reveal scale-in delay-2">
            <img
              src={magePortrait}
              alt="Маг Бездны"
              className="class-icon"
              onClick={() => setSelectedPortrait(magePortrait)}
            />
            <h3 className="class-title">Сраный колдун</h3>
            <p className="class-description">
              Повелитель сил бездны, продавший душу ради обретения могущества
            </p>
          </div>

          <div className="class-card scroll-reveal scale-in delay-3">
            <img
              src={warriorPortrait}
              alt="Воин Рассекающего Щита"
              className="class-icon"
              onClick={() => setSelectedPortrait(warriorPortrait)}
            />
            <h3 className="class-title">Воин из бездны</h3>
            <p className="class-description">
              Ничто не может противостоять силе и мощи этого бойца
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-title-alt scroll-reveal fade-up">
          World Worthy of Falling
        </div>

        <div className="feature-block scroll-reveal slide-left">
          <div className="feature-content">
            <h3>Arena Battles</h3>
            <p>
              Сражайтесь с другими игроками арены в<br />
              напряженных PvP поединках. Докажите свою
              <br />
              силу в битвах на лучшего бойца Nightfall-Arena.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
          <div className="feature-image">
            <img
              src={arenaImage}
              alt="Arena Battles"
              className="feature-img"
              onClick={() => setSelectedFeature(arenaImage)}
            />
          </div>
        </div>

        <div className="feature-block reverse scroll-reveal slide-right">
          <div className="feature-image">
            <img
              src={abyssImage}
              alt="Abyss Dungeons"
              className="feature-img"
              onClick={() => setSelectedFeature(abyssImage)}
            />
          </div>
          <div className="feature-content">
            <h3>Abyss Dungeons</h3>
            <p>
              Исследуйте темные подземелья, полные опасностей и<br />
              сокровищ. Каждое подземелье таит уникальные вызовы
              <br />и награды за храбрость.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
        </div>

        <div className="feature-block scroll-reveal slide-left">
          <div className="feature-content">
            <h3>Fate and Characteristics</h3>
            <p>
              Разработайте уникальный путь для персонажа через
              <br />
              систему судьбы. Каждый выбор открывает новые способности
              <br />и возможности для развития героя.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
          <div className="feature-image">
            <img
              src={fateImage}
              alt="Fate and Characteristics"
              className="feature-img"
              onClick={() => setSelectedFeature(fateImage)}
            />
          </div>
        </div>

        <div className="feature-block reverse scroll-reveal slide-right">
          <div className="feature-image">
            <img
              src={itemsImage}
              alt="Drop and Improvement"
              className="feature-img"
              onClick={() => setSelectedFeature(itemsImage)}
            />
          </div>
          <div className="feature-content">
            <h3>Drop and Improvement</h3>
            <p>
              Находите и улучшайте легендарное оружие и<br />
              снаряжение. Каждый предмет имеет уникальные свойства
              <br />и может быть усилен до невероятных уровней.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section">
        <div className="section-title-alt scroll-reveal fade-up">
          Breath of Darkness
        </div>

        <div className="gallery-grid">
          <div className="gallery-item scroll-reveal scale-in delay-1">
            <img
              src={darkLandsImage}
              alt="Темные земли"
              className="gallery-img"
            />
          </div>
          <div className="gallery-item scroll-reveal scale-in delay-2">
            <img
              src={epicBattlesImage}
              alt="Эпичные битвы"
              className="gallery-img"
            />
          </div>
          <div className="gallery-item scroll-reveal scale-in delay-3">
            <img
              src={abyssMagicImage}
              alt="Магия бездны"
              className="gallery-img"
            />
          </div>
        </div>

        <div className="social-links scroll-reveal fade-up delay-4">
          <a href="#" className="social-icon">
            Discord
          </a>
          <a href="#" className="social-icon">
            VK
          </a>
        </div>
      </section>

      {/* Parchment Section */}
      <section className="parchment-section">
        <div className="parchment scroll-reveal scale-in">
          <div className="parchment-content">
            <h2 className="parchment-title">📜 Легенда гласит...</h2>
            <p className="parchment-text">
              В древние времена, когда мир был молод, павшие герои получили
              <br />
              второй шанс от богов Бездны. Те, кто докажет свою силу и волю,
              <br />
              смогут вернуться в мир живых бессмертными воинами.
              <br />
              <br />
              Nightfall-Arena - это место, где решается судьба павших.
              <br />
              Примите вызов и станьте легендой!
            </p>
            <button className="btn btn-primary" onClick={handleLoginClick}>
              НАЧАТЬ ИГРУ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="community" className="landing-footer">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Nightfall-Arena</h4>
            <p>
              Эпическая RPG игра, где павшие
              <br />
              герои борются за бессмертие
            </p>
          </div>

          <div className="footer-column">
            <h4>Игра</h4>
            <ul>
              <li>
                <a href="#classes">Классы</a>
              </li>
              <li>
                <a href="#features">Возможности</a>
              </li>
              <li>
                <a href="#gallery">Галерея</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Сообщество</h4>
            <ul>
              <li>
                <a href="#">Discord</a>
              </li>
              <li>
                <a href="#">VK</a>
              </li>
              <li>
                <a href="#">Telegram</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Поддержка</h4>
            <ul>
              <li>
                <a href="#">Правила</a>
              </li>
              <li>
                <a href="#">Помощь</a>
              </li>
              <li>
                <a href="#">Контакты разработчиков</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Nightfall-Arena. Все права защищены.</p>
          <div className="footer-social">
            <a href="#">📱</a>
            <a href="#">🐦</a>
            <a href="#">📺</a>
            <a href="#">💬</a>
          </div>
        </div>
      </footer>

      {/* Модальное окно для полного портрета */}
      {selectedPortrait && (
        <div
          className="portrait-modal"
          onClick={() => setSelectedPortrait(null)}
        >
          <div className="portrait-modal-content">
            <img
              src={selectedPortrait}
              alt="Портрет персонажа"
              className="portrait-modal-img"
            />
          </div>
        </div>
      )}

      {/* Модальное окно для feature изображений */}
      {selectedFeature && (
        <div
          className="feature-modal"
          onClick={() => setSelectedFeature(null)}
        >
          <div className="feature-modal-content">
            <img
              src={selectedFeature}
              alt="Feature"
              className="feature-modal-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}
