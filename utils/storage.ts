
import { SiteConfig, Plugin, User, Page, Comment, MediaFile, MenuItem, ContactMessage, BlogPost, BlogCategory, ActivityLog } from '../types';
import { MOCK_PLUGINS, INITIAL_CONFIG, MOCK_PAGES, MOCK_COMMENTS, MOCK_MEDIA, MOCK_MENUS, MOCK_MESSAGES, MOCK_POSTS, MOCK_CATEGORIES } from '../constants';

const KEYS = {
  CONFIG: 'armot_config',
  PLUGINS: 'armot_plugins',
  USER: 'armot_user',
  TOKEN: 'armot_token',
  PAGES: 'armot_pages',
  POSTS: 'armot_posts',
  CATEGORIES: 'armot_categories',
  COMMENTS: 'armot_comments',
  MEDIA: 'armot_media',
  MENUS: 'armot_menus',
  MESSAGES: 'armot_messages',
  LOGS: 'armot_logs',
};

// Safe Storage Wrapper to handle 'SecurityError: The operation is insecure' in restricted iframes
const safeStorage = {
  getItem: (key: string) => {
    try {
      // Accessing window.localStorage can throw SecurityError in restricted iframes
      const storage = window.localStorage;
      return storage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      const storage = window.localStorage;
      storage.setItem(key, value);
    } catch (e) {
      // Silently fail
    }
  },
  removeItem: (key: string) => {
    try {
      const storage = window.localStorage;
      storage.removeItem(key);
    } catch (e) {
      // Silently fail
    }
  },
  clear: () => {
    try {
      const storage = window.localStorage;
      storage.clear();
    } catch (e) {
      // Silently fail
    }
  }
};

export const storage = {
  getConfig: (): SiteConfig => {
    const data = safeStorage.getItem(KEYS.CONFIG);
    return data ? { ...INITIAL_CONFIG, ...JSON.parse(data) } : INITIAL_CONFIG;
  },
  
  saveConfig: (config: SiteConfig) => {
    safeStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getPlugins: (): Plugin[] => {
    const data = safeStorage.getItem(KEYS.PLUGINS);
    return data ? JSON.parse(data) : MOCK_PLUGINS;
  },

  savePlugins: (plugins: Plugin[]) => {
    safeStorage.setItem(KEYS.PLUGINS, JSON.stringify(plugins));
  },

  getPages: (): Page[] => {
    const data = safeStorage.getItem(KEYS.PAGES);
    return data ? JSON.parse(data) : MOCK_PAGES;
  },

  savePages: (pages: Page[]) => {
    safeStorage.setItem(KEYS.PAGES, JSON.stringify(pages));
  },

  getPosts: (): BlogPost[] => {
    const data = safeStorage.getItem(KEYS.POSTS);
    return data ? JSON.parse(data) : MOCK_POSTS;
  },

  savePosts: (posts: BlogPost[]) => {
    safeStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  getCategories: (): BlogCategory[] => {
    const data = safeStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : MOCK_CATEGORIES;
  },

  saveCategories: (categories: BlogCategory[]) => {
    safeStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getComments: (): Comment[] => {
    const data = safeStorage.getItem(KEYS.COMMENTS);
    return data ? JSON.parse(data) : MOCK_COMMENTS;
  },

  saveComments: (comments: Comment[]) => {
    safeStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  },

  getMessages: (): ContactMessage[] => {
    const data = safeStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : MOCK_MESSAGES;
  },

  saveMessages: (messages: ContactMessage[]) => {
    safeStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  getMedia: (): MediaFile[] => {
    const data = safeStorage.getItem(KEYS.MEDIA);
    return data ? JSON.parse(data) : MOCK_MEDIA;
  },

  saveMedia: (media: MediaFile[]) => {
    safeStorage.setItem(KEYS.MEDIA, JSON.stringify(media));
  },

  getMenus: (): MenuItem[] => {
    const data = safeStorage.getItem(KEYS.MENUS);
    return data ? JSON.parse(data) : MOCK_MENUS;
  },

  saveMenus: (menus: MenuItem[]) => {
    safeStorage.setItem(KEYS.MENUS, JSON.stringify(menus));
  },

  getLogs: (): ActivityLog[] => {
    const data = safeStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },

  saveLogs: (logs: ActivityLog[]) => {
    safeStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  getUser: (): User | null => {
    const data = safeStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    safeStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!safeStorage.getItem(KEYS.TOKEN);
  },

  login: (token: string) => {
    safeStorage.setItem(KEYS.TOKEN, token);
  },

  logout: () => {
    safeStorage.removeItem(KEYS.TOKEN);
    safeStorage.removeItem(KEYS.USER);
  },

  reset: () => {
    safeStorage.clear();
    window.location.reload();
  },

  // Export all data for backup
  createBackup: () => {
    const backup: any = {};
    Object.entries(KEYS).forEach(([key, storageKey]) => {
      if (storageKey !== KEYS.TOKEN) { // Don't backup auth token
        const data = safeStorage.getItem(storageKey);
        if (data) backup[key] = JSON.parse(data);
      }
    });
    return JSON.stringify(backup, null, 2);
  },

  restoreBackup: (jsonString: string) => {
    try {
      const backup = JSON.parse(jsonString);
      Object.entries(backup).forEach(([key, value]) => {
        const storageKey = KEYS[key as keyof typeof KEYS];
        if (storageKey) {
          safeStorage.setItem(storageKey, JSON.stringify(value));
        }
      });
      return true;
    } catch (e) {
      console.error("Restore failed", e);
      return false;
    }
  }
};
