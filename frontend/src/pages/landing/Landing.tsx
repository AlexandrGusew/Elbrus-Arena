import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getAssetUrl } from '../../utils/assetUrl';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const backgroundUrl = getAssetUrl('Landing/Landing_background.png');

  // Debug: проверяем URL фона
  console.log('[Landing] Background URL:', backgroundUrl);

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
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Можно отключить observer после первого показа
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Находим все элементы с классом scroll-reveal
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing">
      {/* Фиксированный фон на весь экран */}
      <div
        className="landing-background"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">Nightfall-Arena</div>
          <nav className="nav-menu">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Главная</a>
            <a href="#classes" onClick={(e) => { e.preventDefault(); scrollToSection('classes'); }}>Классы</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Возможности</a>
            <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>Галерея</a>
            <a href="#community" onClick={(e) => { e.preventDefault(); scrollToSection('community'); }}>Сообщество</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Судьба выбирает павших</h1>
          <p className="hero-subtitle">
            Шагните в Бездну и докажите, что только<br />
            павшие герои могут достичь бессмертия и силы
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleLoginClick}>
              НАЧАТЬ ПУТЬ БЕССМЕРТИЯ
            </button>
            <button className="btn btn-secondary">
              Смотреть трейлер
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
            <div className="class-icon">🗡️</div>
            <h3 className="class-title">Воин Призраков</h3>
            <p className="class-description">
              Мастер ближнего боя и защиты. Использует тяжелую броню
              и мощные атаки, чтобы сокрушить врагов на передовой.
            </p>
          </div>

          <div className="class-card featured scroll-reveal scale-in delay-2">
            <div className="class-icon">🔮</div>
            <h3 className="class-title">Маг Бездны</h3>
            <p className="class-description">
              Повелитель темной магии и стихий. Наносит
              разрушительный урон с дальних дистанций, контролируя
              поле боя заклинаниями.
            </p>
          </div>

          <div className="class-card scroll-reveal scale-in delay-3">
            <div className="class-icon">🗡️</div>
            <h3 className="class-title">Воин Рассекающего Щита</h3>
            <p className="class-description">
              Быстрый и смертоносный убийца. Наносит критические удары
              и использует скорость для уничтожения врагов.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-title-alt scroll-reveal fade-up">World Worthy of Falling</div>

        <div className="feature-block scroll-reveal slide-left">
          <div className="feature-content">
            <h3>Arena Battles</h3>
            <p>
              Сражайтесь с другими игроками арены в<br />
              напряженных PvP поединках. Докажите свою<br />
              силу в битвах на лучшего бойца Nightfall-Arena.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
          <div className="feature-image">
            <div className="arena-placeholder">🏛️ ARENA</div>
          </div>
        </div>

        <div className="feature-block reverse scroll-reveal slide-right">
          <div className="feature-image">
            <div className="dungeon-placeholder">🌑 ABYSS</div>
          </div>
          <div className="feature-content">
            <h3>Abyss Dungeons</h3>
            <p>
              Исследуйте темные подземелья, полные опасностей и<br />
              сокровищ. Каждое подземелье таит уникальные вызовы<br />
              и награды за храбрость.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
        </div>

        <div className="feature-block scroll-reveal slide-left">
          <div className="feature-content">
            <h3>Fate and Characteristics</h3>
            <p>
              Разработайте уникальный путь для персонажа через<br />
              систему судьбы. Каждый выбор открывает новые способности<br />
              и возможности для развития героя.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
          <div className="feature-image">
            <div className="fate-placeholder">🌳 FATE</div>
          </div>
        </div>

        <div className="feature-block reverse scroll-reveal slide-right">
          <div className="feature-image">
            <div className="items-placeholder">⚔️ ITEMS</div>
          </div>
          <div className="feature-content">
            <h3>Drop and Improvement</h3>
            <p>
              Находите и улучшайте легендарное оружие и<br />
              снаряжение. Каждый предмет имеет уникальные свойства<br />
              и может быть усилен до невероятных уровней.
            </p>
            <button className="btn btn-outline">Узнать Больше</button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section">
        <div className="section-title-alt scroll-reveal fade-up">Breath of Darkness</div>

        <div className="gallery-grid">
          <div className="gallery-item scroll-reveal scale-in delay-1">
            <div className="gallery-placeholder">🏰 Темные земли</div>
          </div>
          <div className="gallery-item scroll-reveal scale-in delay-2">
            <div className="gallery-placeholder">⚔️ Эпичные битвы</div>
          </div>
          <div className="gallery-item scroll-reveal scale-in delay-3">
            <div className="gallery-placeholder">✨ Магия бездны</div>
          </div>
        </div>

        <div className="social-links scroll-reveal fade-up delay-4">
          <a href="#" className="social-icon">Discord</a>
          <a href="#" className="social-icon">VK</a>
        </div>
      </section>

      {/* Parchment Section */}
      <section className="parchment-section">
        <div className="parchment scroll-reveal scale-in">
          <div className="parchment-content">
            <h2 className="parchment-title">📜 Легенда гласит...</h2>
            <p className="parchment-text">
              В древние времена, когда мир был молод, павшие герои получили<br />
              второй шанс от богов Бездны. Те, кто докажет свою силу и волю,<br />
              смогут вернуться в мир живых бессмертными воинами.<br />
              <br />
              Nightfall-Arena - это место, где решается судьба павших.<br />
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
              Эпическая RPG игра, где павшие<br />
              герои борются за бессмертие
            </p>
          </div>

          <div className="footer-column">
            <h4>Игра</h4>
            <ul>
              <li><a href="#classes">Классы</a></li>
              <li><a href="#features">Возможности</a></li>
              <li><a href="#gallery">Галерея</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Сообщество</h4>
            <ul>
              <li><a href="#">Discord</a></li>
              <li><a href="#">VK</a></li>
              <li><a href="#">Telegram</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Поддержка</h4>
            <ul>
              <li><a href="#">Правила</a></li>
              <li><a href="#">Помощь</a></li>
              <li><a href="#">Контакты разработчиков</a></li>
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
    </div>
  );
}
