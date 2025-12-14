
import { SiteConfig, Plugin, User, Page, Comment, MediaFile, MenuItem, ContactMessage, BlogPost, BlogCategory, ActivityLog, SmartAssistantConfig, CrawlerSource, BlogTag } from '../types';
import { MOCK_PLUGINS, INITIAL_CONFIG, MOCK_PAGES, MOCK_COMMENTS, MOCK_MEDIA, MOCK_MENUS, MOCK_MESSAGES, MOCK_POSTS, MOCK_CATEGORIES, MOCK_TAGS, INITIAL_SMART_CONFIG } from '../constants';

const KEYS = {
  CONFIG: 'armot_config',
  PLUGINS: 'armot_plugins',
  USER: 'armot_user',
  TOKEN: 'armot_token',
  PAGES: 'armot_pages',
  POSTS: 'armot_posts',
  CATEGORIES: 'armot_categories',
  TAGS: 'armot_tags',
  COMMENTS: 'armot_comments',
  MEDIA: 'armot_media',
  MENUS: 'armot_menus',
  MESSAGES: 'armot_messages',
  LOGS: 'armot_logs',
  SMART_CONFIG: 'armot_smart_config',
  CRAWLER_SOURCES: 'armot_crawler_sources',
  AUTH_DB: 'armot_auth_db', // Simulating a users table
};

// In-Memory Fallback for restricted environments (e.g. sandboxed iframes)
const memoryStorage: Record<string, string> = {};

// Feature detection to check if LocalStorage is actually usable
let isStorageAvailable = false;
try {
  if (typeof window !== 'undefined') {
    const storage = window.localStorage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    isStorageAvailable = true;
  }
} catch (e) {
  isStorageAvailable = false;
}

// Safe Storage Wrapper to handle 'SecurityError: The operation is insecure'
const safeStorage = {
  getItem: (key: string) => {
    try {
      if (isStorageAvailable) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (isStorageAvailable) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string) => {
    try {
      if (isStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch (e) {
      delete memoryStorage[key];
    }
  },
  clear: () => {
    try {
      if (isStorageAvailable) {
        window.localStorage.clear();
      }
      for (const key in memoryStorage) delete memoryStorage[key];
    } catch (e) {
      for (const key in memoryStorage) delete memoryStorage[key];
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
    if (!data) return MOCK_PLUGINS;

    const storedPlugins: Plugin[] = JSON.parse(data);
    // Merge Strategy: Add new mock plugins that are missing from storage
    // This ensures new features appear even for existing users
    const merged = [...storedPlugins];
    MOCK_PLUGINS.forEach(mockP => {
        if (!storedPlugins.find(p => p.id === mockP.id)) {
            merged.push(mockP);
        }
    });
    return merged;
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

  getTags: (): BlogTag[] => {
    const data = safeStorage.getItem(KEYS.TAGS);
    return data ? JSON.parse(data) : MOCK_TAGS;
  },

  saveTags: (tags: BlogTag[]) => {
    safeStorage.setItem(KEYS.TAGS, JSON.stringify(tags));
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
    if (!data) return MOCK_MENUS;

    const storedMenus: MenuItem[] = JSON.parse(data);
    // Merge Strategy: Add new mock menus that are missing from storage
    const merged = [...storedMenus];
    MOCK_MENUS.forEach(mockM => {
        if (!storedMenus.find(m => m.id === mockM.id)) {
            merged.push(mockM);
        }
    });
    return merged;
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

  getSmartConfig: (): SmartAssistantConfig => {
    const data = safeStorage.getItem(KEYS.SMART_CONFIG);
    return data ? JSON.parse(data) : INITIAL_SMART_CONFIG;
  },

  saveSmartConfig: (config: SmartAssistantConfig) => {
    safeStorage.setItem(KEYS.SMART_CONFIG, JSON.stringify(config));
  },

  getCrawlerSources: (): CrawlerSource[] => {
    const data = safeStorage.getItem(KEYS.CRAWLER_SOURCES);
    return data ? JSON.parse(data) : [];
  },

  saveCrawlerSources: (sources: CrawlerSource[]) => {
    safeStorage.setItem(KEYS.CRAWLER_SOURCES, JSON.stringify(sources));
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

  // --- Auth Simulation ---
  registerUser: (user: User, pass: string) => {
    const authDb = safeStorage.getItem(KEYS.AUTH_DB) ? JSON.parse(safeStorage.getItem(KEYS.AUTH_DB)!) : [];
    // Remove existing user with same email if exists (update)
    const filteredDb = authDb.filter((u: any) => u.email !== user.email);
    filteredDb.push({ ...user, password: pass }); 
    safeStorage.setItem(KEYS.AUTH_DB, JSON.stringify(filteredDb));
  },

  validateUser: (identifier: string, pass: string): User | null => {
    const authDb = safeStorage.getItem(KEYS.AUTH_DB) ? JSON.parse(safeStorage.getItem(KEYS.AUTH_DB)!) : [];
    
    // Fallback for demo if no users exist but site is installed
    if (authDb.length === 0 && identifier.toLowerCase() === 'admin' && pass === 'admin') {
       return { username: 'Admin', email: 'admin@example.com', role: 'admin' };
    }

    const found = authDb.find((u: any) => (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) && u.password === pass);
    
    if (found) {
        const { password, ...userWithoutPass } = found;
        return userWithoutPass;
    }
    return null;
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
