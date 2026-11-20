// app.js — Главная логика GameHub
(function() {
  'use strict';

  // Состояние приложения
  const state = {
    currentView: 'home',
    currentGame: null,
    filters: {
      genre: '',
      year: '',
      platform: '',
      rating: '',
      developer: '',
      search: ''
    },
    sort: 'popularity',
    viewMode: 'grid',
    libraryFilter: 'all'
  };

  // Инициализация
  function init() {
    applyTheme(Storage.getTheme());
    renderNavigation();
    renderHome();
    setupEventListeners();
    setupScrollEffects();
    setupIntersectionObserver();
    showToast('Добро пожаловать в GameHub!', 'info');
  }

  // Применение темы
  function applyTheme(themeName) {
    const theme = THEMES[themeName] || THEMES.purple;
    document.documentElement.style.setProperty('--accent', theme.primary);
    document.documentElement.style.setProperty('--accent-secondary', theme.secondary);
    document.documentElement.style.setProperty('--accent-glow', theme.primary + '40');
    Storage.setTheme(themeName);
  }

  // Навигация
  function renderNavigation() {
    const header = document.getElementById('header');
    const profile = Storage.getProfile();
    const stats = Storage.getStats();

    header.innerHTML = `
      <div class="header-content">
        <div class="logo" onclick="window.app.navigateTo('home')">
          <div class="logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="11" cy="16" r="2" fill="currentColor"/>
              <circle cx="21" cy="16" r="2" fill="currentColor"/>
              <path d="M14 16h4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="logo-text">Game<span class="accent">Hub</span></span>
        </div>

        <nav class="main-nav">
          <a class="nav-link" data-view="home">Главная</a>
          <a class="nav-link" data-view="catalog">Каталог</a>
          <a class="nav-link" data-view="popular">Популярное</a>
          <a class="nav-link" data-view="favorites">Избранное <span class="badge">${stats.favorites}</span></a>
          <a class="nav-link" data-view="library">Библиотека</a>
        </nav>

        <div class="header-actions">
          <button class="icon-btn" id="searchBtn" title="Поиск">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button class="icon-btn" id="themeBtn" title="Сменить тему">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          </button>
          <button class="icon-btn notification-btn" id="notifBtn" title="Уведомления">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <span class="notif-dot"></span>
          </button>
          <button class="avatar-btn" id="profileBtn">
            <span class="avatar-emoji">${profile.avatar}</span>
          </button>
          <button class="mobile-menu-btn" id="mobileMenuBtn">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    `;

    // Активная ссылка
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === state.currentView) {
        link.classList.add('active');
      }
    });
  }

  // Главная страница
  function renderHome() {
    const main = document.getElementById('main');
    const popularGames = [...GAMES].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
    const topRated = [...GAMES].sort((a, b) => b.rating - a.rating).slice(0, 6);
    const newGames = [...GAMES].sort((a, b) => b.year - a.year).slice(0, 6);
    const editorChoice = [...GAMES].sort((a, b) => b.rating - a.rating).slice(0, 4);

    main.innerHTML = `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-badge animate-fade-up">🎮 Игровой портал нового поколения</div>
          <h1 class="hero-title animate-fade-up delay-1">Открой свой следующий<br><span class="gradient-text">игровой мир</span></h1>
          <p class="hero-description animate-fade-up delay-2">Тысячи игр, персональные рекомендации, удобная библиотека и сообщество геймеров. Всё в одном месте.</p>
          <div class="hero-buttons animate-fade-up delay-3">
            <button class="btn btn-primary btn-lg" onclick="window.app.navigateTo('catalog')">
              Исследовать игры
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button class="btn btn-ghost btn-lg" onclick="window.app.navigateTo('popular')">
              Популярные игры
            </button>
          </div>
          <div class="hero-stats animate-fade-up delay-4">
            <div class="hero-stat">
              <div class="stat-number">${GAMES.length}+</div>
              <div class="stat-label">Игр в каталоге</div>
            </div>
            <div class="hero-stat">
              <div class="stat-number">10</div>
              <div class="stat-label">Жанров</div>
            </div>
            <div class="hero-stat">
              <div class="stat-number">4</div>
              <div class="stat-label">Платформы</div>
            </div>
          </div>
        </div>
        <div class="scroll-indicator">
          <span>Прокрутите вниз</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </div>
      </section>

      <!-- Категории -->
      <section class="section reveal-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Категории игр</h2>
              <p class="section-subtitle">Выберите жанр по вашему вкусу</p>
            </div>
          </div>
          <div class="categories-grid">
            ${CATEGORIES.map(cat => `
              <div class="category-card" data-category="${cat.name}" style="background: ${cat.gradient}">
                <div class="category-icon">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
                <div class="category-count">${GAMES.filter(g => g.genre.includes(cat.name)).length} игр</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Популярные -->
      <section class="section reveal-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">🔥 Популярные сейчас</h2>
              <p class="section-subtitle">Самые востребованные игры этой недели</p>
            </div>
            <button class="btn btn-ghost" onclick="window.app.navigateTo('popular')">Смотреть все</button>
          </div>
          <div class="games-grid">
            ${popularGames.map(game => renderGameCard(game)).join('')}
          </div>
        </div>
      </section>

      <!-- Лучшие -->
      <section class="section reveal-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">⭐ Лучшие игры</h2>
              <p class="section-subtitle">Игры с наивысшими оценками</p>
            </div>
          </div>
          <div class="games-grid">
            ${topRated.map(game => renderGameCard(game)).join('')}
          </div>
        </div>
      </section>

      <!-- Новинки -->
      <section class="section reveal-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">✨ Недавно вышедшие</h2>
              <p class="section-subtitle">Свежие релизы, которые стоит попробовать</p>
            </div>
          </div>
          <div class="games-grid">
            ${newGames.map(game => renderGameCard(game, true)).join('')}
          </div>
        </div>
      </section>

      <!-- Выбор редакции -->
      <section class="section reveal-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">🏆 Выбор редакции</h2>
              <p class="section-subtitle">Рекомендации нашей команды</p>
            </div>
          </div>
          <div class="editor-choice-grid">
            ${editorChoice.map(game => renderEditorChoiceCard(game)).join('')}
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section cta-section reveal-section">
        <div class="container">
          <div class="cta-card">
            <div class="cta-content">
              <h2 class="cta-title">Не знаете, во что поиграть?</h2>
              <p class="cta-description">Доверьтесь нашему алгоритму — мы выберем игру специально для вас!</p>
              <button class="btn btn-primary btn-lg" onclick="window.app.randomGame()">
                🎲 Выбери игру за меня
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Карточка игры
  function renderGameCard(game, showNewBadge = false) {
    const isFav = Storage.isFavorite(game.id);
    const isNew = showNewBadge || (game.year >= 2024);
    return `
      <div class="game-card" data-game-id="${game.id}">
        <div class="game-cover" style="background: ${game.gradient}">
          <div class="game-cover-title">${game.title}</div>
          ${isNew ? '<span class="new-badge">NEW</span>' : ''}
          <button class="favorite-btn ${isFav ? 'active' : ''}" data-game-id="${game.id}" title="В избранное">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <div class="game-rating-badge">⭐ ${game.rating}</div>
        </div>
        <div class="game-info">
          <h3 class="game-title">${game.title}</h3>
          <div class="game-meta">
            <span class="game-genre">${game.genre[0]}</span>
            <span class="game-year">${game.year}</span>
          </div>
          <p class="game-description">${game.description}</p>
          <div class="game-platforms">
            ${game.platforms.slice(0, 3).map(p => `<span class="platform-tag">${p}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Карточка выбора редакции
  function renderEditorChoiceCard(game) {
    return `
      <div class="editor-card" data-game-id="${game.id}">
        <div class="editor-card-bg" style="background: ${game.gradient}"></div>
        <div class="editor-card-content">
          <div class="editor-badge">🏆 Выбор редакции</div>
          <h3 class="editor-title">${game.title}</h3>
          <p class="editor-description">${game.description}</p>
          <div class="editor-meta">
            <span class="game-rating-badge">⭐ ${game.rating}</span>
            <span>${game.genre.join(', ')}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Каталог
  function renderCatalog() {
    const main = document.getElementById('main');
    const allGenres = [...new Set(GAMES.flatMap(g => g.genre))].sort();
    const allYears = [...new Set(GAMES.map(g => g.year))].sort((a, b) => b - a);
    const allPlatforms = [...new Set(GAMES.flatMap(g => g.platforms))].sort();
    const allDevelopers = [...new Set(GAMES.map(g => g.developer))].sort();

    main.innerHTML = `
      <section class="catalog-section">
        <div class="container">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Каталог игр</h1>
              <p class="page-subtitle">Найдено: <span id="gamesCount">${GAMES.length}</span> игр</p>
            </div>
            <div class="catalog-controls">
              <div class="view-toggle">
                <button class="view-btn ${state.viewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Сетка">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </button>
                <button class="view-btn ${state.viewMode === 'list' ? 'active' : ''}" data-view="list" title="Список">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
              <select class="sort-select" id="sortSelect">
                <option value="popularity">По популярности</option>
                <option value="rating">По рейтингу</option>
                <option value="title">По названию</option>
                <option value="year-desc">Сначала новые</option>
                <option value="year-asc">Сначала старые</option>
              </select>
              <button class="btn btn-ghost" id="compareBtn">
                📊 Сравнить (<span id="compareCount">${Storage.getCompareList().length}</span>)
              </button>
            </div>
          </div>

          <div class="catalog-layout">
            <aside class="filters-sidebar">
              <div class="filters-header">
                <h3>Фильтры</h3>
                <button class="btn btn-text" id="resetFilters">Сбросить</button>
              </div>

              <div class="filter-group">
                <label class="filter-label">Жанр</label>
                <select class="filter-select" data-filter="genre">
                  <option value="">Все жанры</option>
                  ${allGenres.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Год выпуска</label>
                <select class="filter-select" data-filter="year">
                  <option value="">Все годы</option>
                  ${allYears.map(y => `<option value="${y}">${y}</option>`).join('')}
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Платформа</label>
                <select class="filter-select" data-filter="platform">
                  <option value="">Все платформы</option>
                  ${allPlatforms.map(p => `<option value="${p}">${p}</option>`).join('')}
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Рейтинг</label>
                <select class="filter-select" data-filter="rating">
                  <option value="">Любой</option>
                  <option value="9">9+ (Выдающиеся)</option>
                  <option value="8">8+ (Отличные)</option>
                  <option value="7">7+ (Хорошие)</option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Разработчик</label>
                <select class="filter-select" data-filter="developer">
                  <option value="">Все разработчики</option>
                  ${allDevelopers.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
            </aside>

            <div class="catalog-content">
              <div class="search-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" id="searchInput" placeholder="Поиск игр..." value="${state.filters.search}">
                <button class="clear-search" id="clearSearch" style="display: ${state.filters.search ? 'block' : 'none'}">×</button>
              </div>
              <div class="games-grid ${state.viewMode === 'list' ? 'list-view' : ''}" id="gamesGrid">
                ${renderFilteredGames()}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    document.getElementById('sortSelect').value = state.sort;
    document.querySelectorAll('.filter-select').forEach(select => {
      select.value = state.filters[select.dataset.filter] || '';
    });
  }

  function renderFilteredGames() {
    let filtered = [...GAMES];

    // Фильтры
    if (state.filters.genre) {
      filtered = filtered.filter(g => g.genre.includes(state.filters.genre));
    }
    if (state.filters.year) {
      filtered = filtered.filter(g => g.year === parseInt(state.filters.year));
    }
    if (state.filters.platform) {
      filtered = filtered.filter(g => g.platforms.includes(state.filters.platform));
    }
    if (state.filters.rating) {
      filtered = filtered.filter(g => g.rating >= parseFloat(state.filters.rating));
    }
    if (state.filters.developer) {
      filtered = filtered.filter(g => g.developer === state.filters.developer);
    }
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.genre.some(genre => genre.toLowerCase().includes(q))
      );
    }

    // Сортировка
    switch (state.sort) {
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'title': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'year-desc': filtered.sort((a, b) => b.year - a.year); break;
      case 'year-asc': filtered.sort((a, b) => a.year - b.year); break;
      default: filtered.sort((a, b) => b.popularity - a.popularity);
    }

    const countEl = document.getElementById('gamesCount');
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      `;
    }

    return filtered.map(game => renderGameCard(game)).join('');
  }

  // Популярные
  function renderPopular() {
    const main = document.getElementById('main');
    const sorted = [...GAMES].sort((a, b) => b.popularity - a.popularity);

    main.innerHTML = `
      <section class="page-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">🔥 Популярные игры</h1>
            <p class="page-subtitle">Самые востребованные игры по мнению сообщества</p>
          </div>
          <div class="games-grid">
            ${sorted.map(game => renderGameCard(game)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // Избранное
  function renderFavorites() {
    const main = document.getElementById('main');
    const favIds = Storage.getFavorites();
    const games = GAMES.filter(g => favIds.includes(g.id));

    main.innerHTML = `
      <section class="page-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">❤️ Избранное</h1>
            <p class="page-subtitle">Ваши любимые игры</p>
          </div>
          ${games.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">💔</div>
              <h3>Пока пусто</h3>
              <p>Добавьте игры в избранное, нажав на сердечко</p>
              <button class="btn btn-primary" onclick="window.app.navigateTo('catalog')">Перейти в каталог</button>
            </div>
          ` : `
            <div class="games-grid">
              ${games.map(game => renderGameCard(game)).join('')}
            </div>
          `}
        </div>
      </section>
    `;
  }

  // Библиотека
  function renderLibrary() {
    const main = document.getElementById('main');
    const library = Storage.getLibrary();
    const stats = Storage.getStats();

    const statusLabels = {
      want: 'Хочу сыграть',
      playing: 'Играю',
      completed: 'Пройдено',
      onhold: 'Отложено'
    };

    const filtered = state.libraryFilter === 'all'
      ? library
      : library.filter(item => item.status === state.libraryFilter);

    const games = filtered.map(item => {
      const game = GAMES.find(g => g.id === item.id);
      return { ...game, status: item.status };
    }).filter(g => g);

    main.innerHTML = `
      <section class="page-section">
        <div class="container">
          <div class="page-header">
            <h1 class="page-title">📚 Моя библиотека</h1>
            <p class="page-subtitle">Управляйте своей коллекцией игр</p>
          </div>

          <div class="library-stats">
            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div class="stat-value">${stats.totalLibrary}</div>
              <div class="stat-label">Всего игр</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎮</div>
              <div class="stat-value">${stats.playing}</div>
              <div class="stat-label">Играю сейчас</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-value">${stats.completed}</div>
              <div class="stat-label">Пройдено</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">${stats.wantToPlay}</div>
              <div class="stat-label">Хочу сыграть</div>
            </div>
          </div>

          <div class="library-tabs">
            <button class="library-tab ${state.libraryFilter === 'all' ? 'active' : ''}" data-filter="all">Все (${stats.totalLibrary})</button>
            <button class="library-tab ${state.libraryFilter === 'want' ? 'active' : ''}" data-filter="want">Хочу сыграть (${stats.wantToPlay})</button>
            <button class="library-tab ${state.libraryFilter === 'playing' ? 'active' : ''}" data-filter="playing">Играю (${stats.playing})</button>
            <button class="library-tab ${state.libraryFilter === 'completed' ? 'active' : ''}" data-filter="completed">Пройдено (${stats.completed})</button>
            <button class="library-tab ${state.libraryFilter === 'onhold' ? 'active' : ''}" data-filter="onhold">Отложено (${stats.onHold})</button>
          </div>

          ${library.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📚</div>
              <h3>Ваша библиотека пуста</h3>
              <p>Добавьте игры из каталога, чтобы создать свою коллекцию</p>
              <button class="btn btn-primary" onclick="window.app.navigateTo('catalog')">Перейти в каталог</button>
            </div>
          ` : games.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>Нет игр в этой категории</h3>
              <p>Попробуйте выбрать другой фильтр</p>
            </div>
          ` : `
            <div class="library-grid">
              ${games.map(game => renderLibraryCard(game, statusLabels)).join('')}
            </div>
          `}
        </div>
      </section>
    `;
  }

  function renderLibraryCard(game, statusLabels) {
    return `
      <div class="library-card" data-game-id="${game.id}">
        <div class="library-card-cover" style="background: ${game.gradient}">
          <div class="game-cover-title">${game.title}</div>
        </div>
        <div class="library-card-info">
          <h3 class="game-title">${game.title}</h3>
          <div class="library-status-badge status-${game.status}">${statusLabels[game.status]}</div>
          <div class="game-meta">
            <span class="game-genre">${game.genre[0]}</span>
            <span class="game-rating-badge">⭐ ${game.rating}</span>
          </div>
          <div class="library-actions">
            <select class="status-select" data-game-id="${game.id}">
              <option value="want" ${game.status === 'want' ? 'selected' : ''}>Хочу сыграть</option>
              <option value="playing" ${game.status === 'playing' ? 'selected' : ''}>Играю</option>
              <option value="completed" ${game.status === 'completed' ? 'selected' : ''}>Пройдено</option>
              <option value="onhold" ${game.status === 'onhold' ? 'selected' : ''}>Отложено</option>
            </select>
            <button class="btn-icon danger" data-remove="${game.id}" title="Удалить">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Детальная страница игры
  function renderGameDetail(gameId) {
    const game = GAMES.find(g => g.id === parseInt(gameId));
    if (!game) {
      showToast('Игра не найдена', 'error');
      return;
    }

    state.currentGame = game;
    Storage.addRecent(game.id);

    const main = document.getElementById('main');
    const isFav = Storage.isFavorite(game.id);
    const inLib = Storage.isInLibrary(game.id);
    const libItem = Storage.getLibraryItem(game.id);
    const similar = GAMES.filter(g => g.id !== game.id && g.genre.some(genre => game.genre.includes(genre))).slice(0, 4);
    const sameDev = GAMES.filter(g => g.id !== game.id && g.developer === game.developer).slice(0, 3);

    main.innerHTML = `
      <section class="game-detail">
        <div class="game-detail-hero" style="background: ${game.gradient}">
          <div class="game-detail-overlay"></div>
          <div class="container">
            <button class="back-btn" onclick="window.app.goBack()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              Назад
            </button>
            <div class="game-detail-header">
              <div class="game-detail-cover" style="background: ${game.gradient}">
                <div class="game-cover-title large">${game.title}</div>
              </div>
              <div class="game-detail-info">
                <div class="game-detail-badges">
                  ${game.genre.map(g => `<span class="genre-badge">${g}</span>`).join('')}
                </div>
                <h1 class="game-detail-title">${game.title}</h1>
                <div class="game-detail-meta">
                  <span class="meta-item">📅 ${game.year}</span>
                  <span class="meta-item">⭐ ${game.rating}/10</span>
                  <span class="meta-item">🎂 ${game.age}</span>
                </div>
                <p class="game-detail-description">${game.description}</p>
                <div class="game-detail-actions">
                  <button class="btn ${isFav ? 'btn-primary' : 'btn-ghost'}" id="favBtn" data-game-id="${game.id}">
                    <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    ${isFav ? 'В избранном' : 'В избранное'}
                  </button>
                  <button class="btn ${inLib ? 'btn-primary' : 'btn-ghost'}" id="libBtn" data-game-id="${game.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    ${inLib ? 'В библиотеке' : 'В библиотеку'}
                  </button>
                  <button class="btn btn-ghost" id="trailerBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Трейлер
                  </button>
                  <button class="btn btn-ghost" id="compareBtn2" data-game-id="${game.id}">
                    📊 Сравнить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <div class="game-detail-body">
            <div class="game-detail-main">
              <div class="detail-section">
                <h2>Об игре</h2>
                <p class="detail-text">${game.fullDescription}</p>
              </div>

              <div class="detail-section">
                <h2>Скриншоты</h2>
                <div class="screenshots-grid">
                  ${game.screenshots.map((color, i) => `
                    <div class="screenshot" style="background: linear-gradient(135deg, ${color}, ${game.screenshots[(i+1)%3]})" data-index="${i}">
                      <div class="screenshot-label">Скриншот ${i + 1}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              ${similar.length > 0 ? `
                <div class="detail-section">
                  <h2>Похожие игры</h2>
                  <div class="games-grid small">
                    ${similar.map(g => renderGameCard(g)).join('')}
                  </div>
                </div>
              ` : ''}

              ${sameDev.length > 0 ? `
                <div class="detail-section">
                  <h2>Другие игры ${game.developer}</h2>
                  <div class="games-grid small">
                    ${sameDev.map(g => renderGameCard(g)).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <aside class="game-detail-sidebar">
              <div class="info-card">
                <h3>Информация</h3>
                <div class="info-row"><span>Разработчик</span><strong>${game.developer}</strong></div>
                <div class="info-row"><span>Издатель</span><strong>${game.publisher}</strong></div>
                <div class="info-row"><span>Дата выхода</span><strong>${game.year}</strong></div>
                <div class="info-row"><span>Возраст</span><strong>${game.age}</strong></div>
                <div class="info-row"><span>Жанры</span><strong>${game.genre.join(', ')}</strong></div>
              </div>

              <div class="info-card">
                <h3>Платформы</h3>
                <div class="platforms-list">
                  ${game.platforms.map(p => `<div class="platform-item">🎮 ${p}</div>`).join('')}
                </div>
              </div>

              <div class="info-card">
                <h3>Системные требования</h3>
                <div class="info-row"><span>ОС</span><strong>${game.systemReq.os}</strong></div>
                <div class="info-row"><span>Процессор</span><strong>${game.systemReq.cpu}</strong></div>
                <div class="info-row"><span>Память</span><strong>${game.systemReq.ram}</strong></div>
                <div class="info-row"><span>Видеокарта</span><strong>${game.systemReq.gpu}</strong></div>
                <div class="info-row"><span>Место</span><strong>${game.systemReq.storage}</strong></div>
              </div>

              ${libItem ? `
                <div class="info-card">
                  <h3>Статус в библиотеке</h3>
                  <select class="status-select" data-game-id="${game.id}" id="detailStatusSelect">
                    <option value="want" ${libItem.status === 'want' ? 'selected' : ''}>Хочу сыграть</option>
                    <option value="playing" ${libItem.status === 'playing' ? 'selected' : ''}>Играю</option>
                    <option value="completed" ${libItem.status === 'completed' ? 'selected' : ''}>Пройдено</option>
                    <option value="onhold" ${libItem.status === 'onhold' ? 'selected' : ''}>Отложено</option>
                  </select>
                </div>
              ` : ''}
            </aside>
          </div>
        </div>
      </section>
    `;
  }

  // Профиль
  function renderProfile() {
    const profile = Storage.getProfile();
    const stats = Storage.getStats();
    const recent = Storage.getRecent().slice(0, 6).map(id => GAMES.find(g => g.id === id)).filter(g => g);

    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="modal-content profile-modal">
        <button class="modal-close" onclick="window.app.closeModal()">×</button>
        <div class="profile-header">
          <div class="profile-avatar" id="profileAvatar">${profile.avatar}</div>
          <button class="btn btn-ghost btn-sm" id="changeAvatarBtn">Сменить аватар</button>
        </div>
        <h2 class="profile-name" id="profileName">${profile.name}</h2>
        <p class="profile-since">Участник с ${new Date(profile.createdAt).toLocaleDateString('ru-RU')}</p>

        <div class="profile-form">
          <label>Имя пользователя</label>
          <input type="text" id="profileNameInput" value="${profile.name}" maxlength="30">
          <button class="btn btn-primary" id="saveProfileBtn">Сохранить</button>
        </div>

        <div class="profile-stats">
          <div class="profile-stat">
            <div class="stat-value">${stats.totalLibrary}</div>
            <div class="stat-label">Игр в библиотеке</div>
          </div>
          <div class="profile-stat">
            <div class="stat-value">${stats.favorites}</div>
            <div class="stat-label">В избранном</div>
          </div>
          <div class="profile-stat">
            <div class="stat-value">${stats.completed}</div>
            <div class="stat-label">Пройдено</div>
          </div>
        </div>

        ${recent.length > 0 ? `
          <div class="profile-section">
            <h3>Недавно просмотренные</h3>
            <div class="recent-games">
              ${recent.map(g => `
                <div class="recent-game" data-game-id="${g.id}" style="background: ${g.gradient}">
                  <div class="recent-game-title">${g.title}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="profile-section">
          <h3>Тема оформления</h3>
          <div class="theme-picker">
            ${Object.entries(THEMES).map(([key, theme]) => `
              <button class="theme-option ${Storage.getTheme() === key ? 'active' : ''}" data-theme="${key}" style="background: ${theme.primary}">
                ${theme.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    openModal();
  }

  // Модалки
  function openModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Модальное окно игры
  function openGameModal(gameId) {
    const game = GAMES.find(g => g.id === parseInt(gameId));
    if (!game) return;

    // На мобильных — переход на страницу, на десктопе — модалка
    if (window.innerWidth < 1024) {
      navigateTo('game', gameId);
      return;
    }

    const modal = document.getElementById('modal');
    const isFav = Storage.isFavorite(game.id);
    const inLib = Storage.isInLibrary(game.id);

    modal.innerHTML = `
      <div class="modal-content game-modal">
        <button class="modal-close" onclick="window.app.closeModal()">×</button>
        <div class="game-modal-hero" style="background: ${game.gradient}">
          <div class="game-cover-title large">${game.title}</div>
        </div>
        <div class="game-modal-body">
          <div class="game-modal-badges">
            ${game.genre.map(g => `<span class="genre-badge">${g}</span>`).join('')}
            <span class="game-rating-badge">⭐ ${game.rating}</span>
          </div>
          <h2>${game.title}</h2>
          <p class="game-modal-meta">${game.year} • ${game.developer} • ${game.age}</p>
          <p>${game.fullDescription}</p>
          <div class="game-modal-actions">
            <button class="btn ${isFav ? 'btn-primary' : 'btn-ghost'}" data-fav="${game.id}">
              ${isFav ? '❤️ В избранном' : '🤍 В избранное'}
            </button>
            <button class="btn ${inLib ? 'btn-primary' : 'btn-ghost'}" data-lib="${game.id}">
              ${inLib ? '📚 В библиотеке' : '📖 В библиотеку'}
            </button>
            <button class="btn btn-ghost" onclick="window.app.closeModal(); window.app.navigateTo('game', ${game.id})">
              Подробнее →
            </button>
          </div>
        </div>
      </div>
    `;
    openModal();
  }

  // Модалка выбора аватара
  function openAvatarPicker() {
    const profile = Storage.getProfile();
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="modal-content small">
        <button class="modal-close" onclick="window.app.closeModal()">×</button>
        <h2>Выберите аватар</h2>
        <div class="avatar-grid">
          ${AVATARS.map(a => `
            <button class="avatar-option ${profile.avatar === a ? 'active' : ''}" data-avatar="${a}">
              ${a}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    openModal();
  }

  // Модалка трейлера
  function openTrailer(game) {
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="modal-content trailer-modal">
        <button class="modal-close" onclick="window.app.closeModal()">×</button>
        <h2>Трейлер: ${game.title}</h2>
        <div class="trailer-container">
          <iframe src="${game.trailer}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
    openModal();
  }

  // Модалка сравнения
  function openCompareModal() {
    const compareList = Storage.getCompareList();
    if (compareList.length < 2) {
      showToast('Выберите минимум 2 игры для сравнения', 'warning');
      return;
    }

    const games = compareList.map(id => GAMES.find(g => g.id === id)).filter(g => g);
    const modal = document.getElementById('modal');

    modal.innerHTML = `
      <div class="modal-content compare-modal">
        <button class="modal-close" onclick="window.app.closeModal()">×</button>
        <h2>Сравнение игр</h2>
        <div class="compare-grid">
          ${games.map(game => `
            <div class="compare-card">
              <div class="compare-cover" style="background: ${game.gradient}">
                <div class="game-cover-title">${game.title}</div>
              </div>
              <h3>${game.title}</h3>
              <div class="compare-row"><span>Жанр</span><strong>${game.genre.join(', ')}</strong></div>
              <div class="compare-row"><span>Год</span><strong>${game.year}</strong></div>
              <div class="compare-row"><span>Рейтинг</span><strong>⭐ ${game.rating}</strong></div>
              <div class="compare-row"><span>Разработчик</span><strong>${game.developer}</strong></div>
              <div class="compare-row"><span>Платформы</span><strong>${game.platforms.join(', ')}</strong></div>
              <div class="compare-row"><span>Возраст</span><strong>${game.age}</strong></div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost" onclick="window.app.clearCompare()">Очистить сравнение</button>
      </div>
    `;
    openModal();
  }

  // Поиск
  function openSearch() {
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="modal-content search-modal">
        <button class="modal-close" onclick="window.app.closeModal()">×</button>
        <h2>Поиск игр</h2>
        <div class="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="globalSearchInput" placeholder="Начните вводить название..." autofocus>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>
    `;
    openModal();
    setTimeout(() => document.getElementById('globalSearchInput').focus(), 100);
  }

  function performSearch(query) {
    const results = document.getElementById('searchResults');
    if (!query) {
      results.innerHTML = '<p class="search-hint">Введите название игры</p>';
      return;
    }
    const q = query.toLowerCase();
    const matches = GAMES.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.genre.some(genre => genre.toLowerCase().includes(q))
    ).slice(0, 8);

    if (matches.length === 0) {
      results.innerHTML = '<p class="search-hint">Ничего не найдено</p>';
      return;
    }

    results.innerHTML = matches.map(game => `
      <div class="search-result" data-game-id="${game.id}">
        <div class="search-result-cover" style="background: ${game.gradient}"></div>
        <div class="search-result-info">
          <h4>${game.title}</h4>
          <p>${game.genre.join(', ')} • ${game.year} • ⭐ ${game.rating}</p>
        </div>
      </div>
    `).join('');
  }

  // Toast уведомления
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Навигация
  function navigateTo(view, param) {
    state.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (view) {
      case 'home': renderHome(); break;
      case 'catalog': renderCatalog(); break;
      case 'popular': renderPopular(); break;
      case 'favorites': renderFavorites(); break;
      case 'library': renderLibrary(); break;
      case 'game': renderGameDetail(param); break;
    }
    renderNavigation();
    setupIntersectionObserver();
  }

  function goBack() {
    if (state.previousView) {
      navigateTo(state.previousView);
    } else {
      navigateTo('home');
    }
  }

  // Случайная игра
  function randomGame() {
    const game = GAMES[Math.floor(Math.random() * GAMES.length)];
    showToast(`Вам выпала: ${game.title}`, 'success');
    setTimeout(() => openGameModal(game.id), 500);
  }

  // Очистка сравнения
  function clearCompare() {
    Storage.clearCompare();
    const countEl = document.getElementById('compareCount');
    if (countEl) countEl.textContent = '0';
    closeModal();
    showToast('Сравнение очищено', 'info');
  }

  // События
  function setupEventListeners() {
    // Делегирование событий
    document.addEventListener('click', (e) => {
      // Навигация
      const navLink = e.target.closest('.nav-link');
      if (navLink) {
        e.preventDefault();
        state.previousView = state.currentView;
        navigateTo(navLink.dataset.view);
        return;
      }

      // Карточка игры
      const gameCard = e.target.closest('[data-game-id]');
      if (gameCard && !e.target.closest('.favorite-btn, .status-select, [data-remove], [data-fav], [data-lib]')) {
        openGameModal(gameCard.dataset.gameId);
        return;
      }

      // Избранное
      const favBtn = e.target.closest('.favorite-btn, [data-fav]');
      if (favBtn) {
        e.stopPropagation();
        const gameId = parseInt(favBtn.dataset.gameId || favBtn.dataset.fav);
        const added = Storage.toggleFavorite(gameId);
        const game = GAMES.find(g => g.id === gameId);
        showToast(added ? `${game.title} добавлена в избранное ❤️` : `Удалено из избранного`, added ? 'success' : 'info');
        favBtn.classList.toggle('active');
        renderNavigation();
        if (state.currentView === 'favorites') renderFavorites();
        return;
      }

      // В библиотеку
      const libBtn = e.target.closest('[data-lib]');
      if (libBtn) {
        e.stopPropagation();
        const gameId = parseInt(libBtn.dataset.lib);
        const game = GAMES.find(g => g.id === gameId);
        Storage.addToLibrary(gameId, 'want');
        showToast(`${game.title} добавлена в библиотеку 📚`, 'success');
        renderNavigation();
        if (state.currentView === 'library') renderLibrary();
        return;
      }

      // Удалить из библиотеки
      const removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) {
        e.stopPropagation();
        const gameId = parseInt(removeBtn.dataset.remove);
        const game = GAMES.find(g => g.id === gameId);
        if (confirm(`Удалить "${game.title}" из библиотеки?`)) {
          Storage.removeFromLibrary(gameId);
          showToast('Игра удалена из библиотеки', 'info');
          renderLibrary();
          renderNavigation();
        }
        return;
      }

      // Категории
      const categoryCard = e.target.closest('.category-card');
      if (categoryCard) {
        state.filters.genre = categoryCard.dataset.category;
        navigateTo('catalog');
        return;
      }

      // View toggle
      const viewBtn = e.target.closest('.view-btn');
      if (viewBtn) {
        state.viewMode = viewBtn.dataset.view;
        renderCatalog();
        return;
      }

      // Library tabs
      const libTab = e.target.closest('.library-tab');
      if (libTab) {
        state.libraryFilter = libTab.dataset.filter;
        renderLibrary();
        return;
      }

      // Theme
      const themeOption = e.target.closest('.theme-option');
      if (themeOption) {
        applyTheme(themeOption.dataset.theme);
        document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
        themeOption.classList.add('active');
        showToast('Тема изменена', 'success');
        return;
      }

      // Avatar
      const avatarOption = e.target.closest('.avatar-option');
      if (avatarOption) {
        Storage.updateProfile({ avatar: avatarOption.dataset.avatar });
        document.getElementById('profileAvatar').textContent = avatarOption.dataset.avatar;
        document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('active'));
        avatarOption.classList.add('active');
        renderNavigation();
        showToast('Аватар обновлён', 'success');
        return;
      }

      // Search result
      const searchResult = e.target.closest('.search-result');
      if (searchResult) {
        closeModal();
        openGameModal(searchResult.dataset.gameId);
        return;
      }

      // Recent game
      const recentGame = e.target.closest('.recent-game');
      if (recentGame) {
        closeModal();
        openGameModal(recentGame.dataset.gameId);
        return;
      }

      // Editor card
      const editorCard = e.target.closest('.editor-card');
      if (editorCard) {
        openGameModal(editorCard.dataset.gameId);
        return;
      }

      // Mobile menu
      if (e.target.closest('#mobileMenuBtn')) {
        document.body.classList.toggle('mobile-menu-open');
        return;
      }

      // Клик вне мобильного меню
      if (document.body.classList.contains('mobile-menu-open') && !e.target.closest('.main-nav, #mobileMenuBtn')) {
        document.body.classList.remove('mobile-menu-open');
      }
    });

    // Изменение статуса в библиотеке
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-select')) {
        const gameId = parseInt(e.target.dataset.gameId);
        const status = e.target.value;
        Storage.updateLibraryStatus(gameId, status);
        const labels = { want: 'Хочу сыграть', playing: 'Играю', completed: 'Пройдено', onhold: 'Отложено' };
        showToast(`Статус изменён: ${labels[status]}`, 'success');
        if (state.currentView === 'library') renderLibrary();
      }

      // Фильтры
      if (e.target.classList.contains('filter-select')) {
        state.filters[e.target.dataset.filter] = e.target.value;
        const grid = document.getElementById('gamesGrid');
        if (grid) grid.innerHTML = renderFilteredGames();
      }

      // Сортировка
      if (e.target.id === 'sortSelect') {
        state.sort = e.target.value;
        const grid = document.getElementById('gamesGrid');
        if (grid) grid.innerHTML = renderFilteredGames();
      }
    });

    // Поиск
    document.addEventListener('input', (e) => {
      if (e.target.id === 'searchInput') {
        state.filters.search = e.target.value;
        const grid = document.getElementById('gamesGrid');
        if (grid) grid.innerHTML = renderFilteredGames();
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) clearBtn.style.display = e.target.value ? 'block' : 'none';
      }
      if (e.target.id === 'globalSearchInput') {
        performSearch(e.target.value);
      }
    });

    // Кнопки
    document.addEventListener('click', (e) => {
      if (e.target.id === 'searchBtn') openSearch();
      if (e.target.id === 'themeBtn') {
        const themes = Object.keys(THEMES);
        const current = Storage.getTheme();
        const next = themes[(themes.indexOf(current) + 1) % themes.length];
        applyTheme(next);
        showToast(`Тема: ${THEMES[next].name}`, 'success');
      }
      if (e.target.id === 'notifBtn') showToast('У вас нет новых уведомлений', 'info');
      if (e.target.id === 'profileBtn' || e.target.closest('#profileBtn')) renderProfile();
      if (e.target.id === 'resetFilters') {
        state.filters = { genre: '', year: '', platform: '', rating: '', developer: '', search: '' };
        renderCatalog();
        showToast('Фильтры сброшены', 'info');
      }
      if (e.target.id === 'clearSearch') {
        state.filters.search = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('gamesGrid').innerHTML = renderFilteredGames();
        e.target.style.display = 'none';
      }
      if (e.target.id === 'compareBtn' || e.target.id === 'compareBtn2') {
        const gameId = e.target.dataset.gameId;
        if (gameId) {
          Storage.toggleCompare(parseInt(gameId));
          const count = Storage.getCompareList().length;
          const countEl = document.getElementById('compareCount');
          if (countEl) countEl.textContent = count;
          showToast(count >= 2 ? 'Можно сравнивать!' : 'Добавьте ещё одну игру', 'info');
        } else {
          openCompareModal();
        }
      }
      if (e.target.id === 'changeAvatarBtn') openAvatarPicker();
      if (e.target.id === 'saveProfileBtn') {
        const name = document.getElementById('profileNameInput').value.trim();
        if (name) {
          Storage.updateProfile({ name });
          document.getElementById('profileName').textContent = name;
          renderNavigation();
          showToast('Профиль сохранён', 'success');
        }
      }
      if (e.target.id === 'trailerBtn' && state.currentGame) {
        openTrailer(state.currentGame);
      }
      // Клик вне модалки
      if (e.target.classList.contains('modal-overlay') || e.target.id === 'modal') {
        closeModal();
      }
    });

    // ESC для закрытия
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Эффекты прокрутки
  function setupScrollEffects() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const header = document.getElementById('header');
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    });
  }

  // Intersection Observer для анимаций
  function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-section, .game-card, .category-card').forEach(el => {
      observer.observe(el);
    });
  }

  // Публичный API
  window.app = {
    navigateTo,
    goBack,
    closeModal,
    randomGame,
    clearCompare
  };

  // Запуск
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();