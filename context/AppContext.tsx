
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, ThemeMode, SiteConfig, Plugin, User, LayoutTheme, Page, Comment, MediaFile, MenuItem, ContactMessage, BlogPost, BlogCategory, ActivityLog } from '../types';
import { TRANSLATIONS } from '../constants';
import { storage } from '../utils/storage';
import { cache } from '../utils/cache';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  plugins: Plugin[];
  togglePlugin: (id: string) => void;
  installPlugin: (id: string) => void;
  deletePlugin: (id: string) => void;
  pages: Page[];
  addPage: (page: Page) => void;
  updatePage: (page: Page) => void;
  deletePage: (id: string) => void;
  posts: BlogPost[];
  addPost: (post: BlogPost) => void;
  updatePost: (post: BlogPost) => void;
  deletePost: (id: string) => void;
  categories: BlogCategory[];
  addCategory: (category: BlogCategory) => void;
  deleteCategory: (id: string) => void;
  comments: Comment[];
  addComment: (comment: Comment) => void;
  deleteComment: (id: string) => void;
  updateComment: (comment: Comment) => void;
  replyToComment: (parentId: string, reply: Comment) => void;
  messages: ContactMessage[];
  addMessage: (message: ContactMessage) => void;
  deleteMessage: (id: string) => void;
  markMessageRead: (id: string) => void;
  media: MediaFile[];
  addMedia: (file: MediaFile) => void;
  deleteMedia: (id: string) => void;
  menus: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  logs: ActivityLog[];
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  isRTL: boolean;
  cacheSystem: typeof cache;
  restoreBackup: (data: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  // Language State
  const [lang, setLang] = useState<Language>('fa');
  
  // Theme State
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  
  // CMS State
  const [config, setConfig] = useState<SiteConfig>(storage.getConfig());
  const [plugins, setPlugins] = useState<Plugin[]>(storage.getPlugins());
  const [pages, setPages] = useState<Page[]>(storage.getPages());
  const [posts, setPosts] = useState<BlogPost[]>(storage.getPosts());
  const [categories, setCategories] = useState<BlogCategory[]>(storage.getCategories());
  const [comments, setComments] = useState<Comment[]>(storage.getComments());
  const [messages, setMessages] = useState<ContactMessage[]>(storage.getMessages());
  const [media, setMedia] = useState<MediaFile[]>(storage.getMedia());
  const [menus, setMenus] = useState<MenuItem[]>(storage.getMenus());
  const [logs, setLogs] = useState<ActivityLog[]>(storage.getLogs());
  const [user, setUser] = useState<User | null>(storage.getUser());

  // Initialize Cache Driver
  useEffect(() => {
    cache.setDriver(config.cacheDriver);
  }, [config.cacheDriver]);

  // Effects for HTML attributes
  useEffect(() => {
    const html = document.documentElement;
    const isRTL = lang === 'fa';
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [lang]);

  // Dark Mode Handling
  useEffect(() => {
    const html = document.documentElement;
    if (themeMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [themeMode]);

  // Active Theme Handling (Modern, Classic, Minimal)
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', config.activeTheme);
  }, [config.activeTheme]);

  // Persist Updates
  useEffect(() => { storage.saveConfig(config); }, [config]);
  useEffect(() => { storage.savePlugins(plugins); }, [plugins]);
  useEffect(() => { storage.savePages(pages); }, [pages]);
  useEffect(() => { storage.savePosts(posts); }, [posts]);
  useEffect(() => { storage.saveCategories(categories); }, [categories]);
  useEffect(() => { storage.saveComments(comments); }, [comments]);
  useEffect(() => { storage.saveMessages(messages); }, [messages]);
  useEffect(() => { storage.saveMedia(media); }, [media]);
  useEffect(() => { storage.saveMenus(menus); }, [menus]);
  useEffect(() => { storage.saveLogs(logs); }, [logs]);

  // Helper: Log Activity
  const logActivity = (action: string, details: string) => {
    if (!user) return; // Only log authenticated actions (except login which handles itself)
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      user: user.username,
      action,
      details,
      ip: '127.0.0.1', // Mock IP
      timestamp: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Actions
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[lang] || key;
  };

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const updateConfig = (updates: Partial<SiteConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    if(user) logActivity('update_settings', 'Updated system configuration');
  };

  const togglePlugin = (id: string) => {
    setPlugins((prev) => 
      prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
    );
    logActivity('toggle_plugin', `Toggled plugin ${id}`);
  };

  const installPlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map(p => p.id === id ? { ...p, installed: true } : p)
    );
    logActivity('install_plugin', `Installed plugin ${id}`);
  };

  const deletePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map(p => p.id === id ? { ...p, installed: false, active: false } : p)
    );
    logActivity('delete_plugin', `Deleted plugin ${id}`);
  };

  // Page Actions
  const addPage = (page: Page) => {
    setPages((prev) => [...prev, page]);
    logActivity('create_page', `Created page: ${page.title}`);
  };
  const updatePage = (updatedPage: Page) => {
    setPages((prev) => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
    logActivity('update_page', `Updated page: ${updatedPage.title}`);
  };
  const deletePage = (id: string) => {
    setPages((prev) => prev.filter(p => p.id !== id));
    logActivity('delete_page', `Deleted page ID: ${id}`);
  };

  // Blog Actions
  const addPost = (post: BlogPost) => {
    setPosts((prev) => [...prev, post]);
    logActivity('create_post', `Created post: ${post.title}`);
  };
  const updatePost = (updatedPost: BlogPost) => {
    setPosts((prev) => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    logActivity('update_post', `Updated post: ${updatedPost.title}`);
  };
  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter(p => p.id !== id));
    logActivity('delete_post', `Deleted post ID: ${id}`);
  };
  const addCategory = (category: BlogCategory) => {
    setCategories((prev) => [...prev, category]);
    logActivity('create_category', `Created category: ${category.name}`);
  };
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter(c => c.id !== id));
    logActivity('delete_category', `Deleted category ID: ${id}`);
  };

  // Comment Actions
  const addComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  };
  const updateComment = (updatedComment: Comment) => {
    setComments((prev) => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
    logActivity('update_comment', `Updated comment ID: ${updatedComment.id} status to ${updatedComment.status}`);
  };
  const replyToComment = (parentId: string, reply: Comment) => {
    setComments((prev) => prev.map(c => {
        if (c.id === parentId) {
            return {
                ...c,
                replies: [...(c.replies || []), reply]
            };
        }
        return c;
    }));
    logActivity('reply_comment', `Replied to comment ID: ${parentId}`);
  };
  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter(c => c.id !== id));
    logActivity('delete_comment', `Deleted comment ID: ${id}`);
  };

  // Message Actions
  const addMessage = (message: ContactMessage) => {
    setMessages((prev) => [message, ...prev]);
  };
  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter(m => m.id !== id));
    logActivity('delete_message', `Deleted message ID: ${id}`);
  };
  const markMessageRead = (id: string) => {
    setMessages((prev) => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  // Media Actions
  const addMedia = (file: MediaFile) => {
    setMedia((prev) => [file, ...prev]);
    logActivity('upload_media', `Uploaded file: ${file.name}`);
  };
  const deleteMedia = (id: string) => {
    setMedia((prev) => prev.filter(m => m.id !== id));
    logActivity('delete_media', `Deleted file ID: ${id}`);
  };

  // Menu Actions
  const addMenuItem = (item: MenuItem) => {
    setMenus((prev) => [...prev, item]);
    logActivity('create_menu_item', `Added menu item: ${item.label.en}`);
  };
  const updateMenuItem = (item: MenuItem) => {
    setMenus((prev) => prev.map(m => m.id === item.id ? item : m));
    logActivity('update_menu_item', `Updated menu item: ${item.label.en}`);
  };
  const deleteMenuItem = (id: string) => {
    setMenus((prev) => prev.filter(m => m.id !== id));
    logActivity('delete_menu_item', `Deleted menu item ID: ${id}`);
  };

  const loginUser = (newUser: User) => {
    setUser(newUser);
    storage.saveUser(newUser);
    storage.login('mock-jwt-token');
    // Manual log since 'user' state might not update immediately for logActivity usage
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      user: newUser.username,
      action: 'login',
      details: 'User logged in',
      ip: '127.0.0.1',
      timestamp: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const logoutUser = () => {
    if(user) logActivity('logout', 'User logged out');
    setUser(null);
    storage.logout();
  };

  const restoreBackup = (jsonString: string) => {
    const success = storage.restoreBackup(jsonString);
    if (success) {
      window.location.reload();
      return true;
    }
    return false;
  };

  const value = {
    lang, setLang, t,
    themeMode, toggleThemeMode,
    config, updateConfig,
    plugins, togglePlugin, installPlugin, deletePlugin,
    pages, addPage, updatePage, deletePage,
    posts, addPost, updatePost, deletePost,
    categories, addCategory, deleteCategory,
    comments, addComment, deleteComment, updateComment, replyToComment,
    messages, addMessage, deleteMessage, markMessageRead,
    media, addMedia, deleteMedia,
    menus, addMenuItem, updateMenuItem, deleteMenuItem,
    logs,
    user, loginUser, logoutUser,
    isRTL: lang === 'fa',
    cacheSystem: cache,
    restoreBackup
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
