// storage.js — Управление данными пользователя
const Storage = {
  KEYS: {
    FAVORITES: 'gamehub_favorites',
    LIBRARY: 'gamehub_library',
    PROFILE: 'gamehub_profile',
    RECENT: 'gamehub_recent',
    THEME: 'gamehub_theme',
    SETTINGS: 'gamehub_settings',
    COMPARE: 'gamehub_compare'
  },

  // Избранное
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.FAVORITES)) || [];
    } catch { return []; }
  },

  saveFavorites(favorites) {
    localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
  },

  toggleFavorite(gameId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(gameId);
    if (index === -1) {
      favorites.push(gameId);
      this.saveFavorites(favorites);
      return true;
    } else {
      favorites.splice(index, 1);
      this.saveFavorites(favorites);
      return false;
    }
  },

  isFavorite(gameId) {
    return this.getFavorites().includes(gameId);
  },

  // Библиотека
  getLibrary() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.LIBRARY)) || [];
    } catch { return []; }
  },

  saveLibrary(library) {
    localStorage.setItem(this.KEYS.LIBRARY, JSON.stringify(library));
  },

  addToLibrary(gameId, status = 'want') {
    const library = this.getLibrary();
    const existing = library.find(item => item.id === gameId);
    if (existing) {
      existing.status = status;
      existing.addedAt = Date.now();
    } else {
      library.push({ id: gameId, status, addedAt: Date.now() });
    }
    this.saveLibrary(library);
  },

  removeFromLibrary(gameId) {
    const library = this.getLibrary().filter(item => item.id !== gameId);
    this.saveLibrary(library);
  },

  updateLibraryStatus(gameId, status) {
    const library = this.getLibrary();
    const item = library.find(i => i.id === gameId);
    if (item) {
      item.status = status;
      this.saveLibrary(library);
    }
  },

  getLibraryItem(gameId) {
    return this.getLibrary().find(item => item.id === gameId);
  },

  isInLibrary(gameId) {
    return this.getLibrary().some(item => item.id === gameId);
  },

  // Профиль
  getProfile() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PROFILE)) || {
        name: 'Игрок',
        avatar: '🎮',
        createdAt: Date.now()
      };
    } catch {
      return { name: 'Игрок', avatar: '🎮', createdAt: Date.now() };
    }
  },

  saveProfile(profile) {
    localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
  },

  updateProfile(data) {
    const profile = { ...this.getProfile(), ...data };
    this.saveProfile(profile);
    return profile;
  },

  // Недавно просмотренные
  getRecent() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.RECENT)) || [];
    } catch { return []; }
  },

  addRecent(gameId) {
    let recent = this.getRecent();
    recent = recent.filter(id => id !== gameId);
    recent.unshift(gameId);
    recent = recent.slice(0, 10);
    localStorage.setItem(this.KEYS.RECENT, JSON.stringify(recent));
  },

  // Тема
  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'purple';
  },

  setTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  },

  // Настройки
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || {};
    } catch { return {}; }
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Сравнение
  getCompareList() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.COMPARE)) || [];
    } catch { return []; }
  },

  saveCompareList(list) {
    localStorage.setItem(this.KEYS.COMPARE, JSON.stringify(list));
  },

  toggleCompare(gameId) {
    let list = this.getCompareList();
    const index = list.indexOf(gameId);
    if (index === -1) {
      if (list.length >= 3) {
        list.shift();
      }
      list.push(gameId);
    } else {
      list.splice(index, 1);
    }
    this.saveCompareList(list);
    return list;
  },

  clearCompare() {
    localStorage.setItem(this.KEYS.COMPARE, JSON.stringify([]));
  },

  // Статистика
  getStats() {
    const library = this.getLibrary();
    const favorites = this.getFavorites();
    return {
      totalLibrary: library.length,
      playing: library.filter(i => i.status === 'playing').length,
      completed: library.filter(i => i.status === 'completed').length,
      wantToPlay: library.filter(i => i.status === 'want').length,
      onHold: library.filter(i => i.status === 'onhold').length,
      favorites: favorites.length
    };
  }
};