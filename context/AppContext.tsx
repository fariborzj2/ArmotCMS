

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, ThemeMode, SiteConfig, Plugin, User, LayoutTheme, Page, Comment, MediaFile, MenuItem, ContactMessage, BlogPost, BlogCategory, BlogTag, ActivityLog, SmartAssistantConfig, CrawlerSource } from '../types';
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
  updateCategory: (category: BlogCategory) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: BlogCategory[]) => void;
  tags: BlogTag[];
  addTag: (tag: BlogTag) => void;
  deleteTag: (id: string) => void;
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
  reorderMenus: (items: MenuItem[]) => void;
  deleteMenuItem: (id: string) => void;
  logs: ActivityLog[];
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  isRTL: boolean;
  cacheSystem: typeof cache;
  restoreBackup: (data: string) => boolean;
  
  // Smart Assistant
  smartConfig: SmartAssistantConfig;
  updateSmartConfig: (updates: Partial<SmartAssistantConfig>) => void;
  crawlerSources: CrawlerSource[];
  addCrawlerSource: (source: CrawlerSource) => void;
  deleteCrawlerSource: (id: string) => void;
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
  const [tags, setTags] = useState<BlogTag[]>(storage.getTags());
  const [comments, setComments] = useState<Comment[]>(storage.getComments());
  const [messages, setMessages] = useState<ContactMessage[]>(storage.getMessages());
  const [media, setMedia] = useState<MediaFile[]>(storage.getMedia());
  const [menus, setMenus] = useState<MenuItem[]>(storage.getMenus());
  const [logs, setLogs] = useState<ActivityLog[]>(storage.getLogs());
  const [user, setUser] = useState<User | null>(storage.getUser());
  
  // Smart Assistant State
  const [smartConfig, setSmartConfig] = useState<SmartAssistantConfig>(storage.getSmartConfig());
  const [crawlerSources, setCrawlerSources] = useState<CrawlerSource[]>(storage.getCrawlerSources());

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
  useEffect(() => { storage.saveTags(tags); }, [tags]);
  useEffect(() => { storage.saveComments(comments); }, [comments]);
  useEffect(() => { storage.saveMessages(messages); }, [messages]);
  useEffect(() => { storage.saveMedia(media); }, [media]);
  useEffect(() => { storage.saveMenus(menus); }, [menus]);
  useEffect(() => { storage.saveLogs(logs); }, [logs]);
  useEffect(() => { storage.saveSmartConfig(smartConfig); }, [smartConfig]);
  useEffect(() => { storage.saveCrawlerSources(crawlerSources); }, [crawlerSources]);

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
  const updateCategory = (updatedCategory: BlogCategory) => {
    setCategories((prev) => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    logActivity('update_category', `Updated category: ${updatedCategory.name}`);
  };
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter(c => c.id !== id));
    logActivity('delete_category', `Deleted category ID: ${id}`);
  };
  const reorderCategories = (newCategories: BlogCategory[]) => {
    // We only update the ones passed in to avoid overwriting unrelated state, but for simplicity here we replace
    // In a real DB sync you'd batch update order
    setCategories(prev => {
        // Map over previous, if found in new, use new, else keep previous
        // OR better: if newCategories contains ALL, just set it.
        // Assuming newCategories is the full list or a significant subset that dictates order/parenting
        const lookup = new Map(newCategories.map(c => [c.id, c]));
        return prev.map(c => lookup.get(c.id) || c);
    });
    logActivity('reorder_categories', 'Categories reordered');
  };

  const addTag = (tag: BlogTag) => {
    setTags((prev) => [...prev, tag]);
    logActivity('create_tag', `Created tag: ${tag.name}`);
  };
  const deleteTag = (id: string) => {
    setTags((prev) => prev.filter(t => t.id !== id));
    logActivity('delete_tag', `Deleted tag ID: ${id}`);
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
  const reorderMenus = (items: MenuItem[]) => {
      // Merge reordered items into existing state
      setMenus(prev => {
          const others = prev.filter(p => !items.find(i => i.id === p.id));
          return [...others, ...items];
      });
      logActivity('reorder_menus', 'Reordered menu items');
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
  
  const updateSmartConfig = (updates: Partial<SmartAssistantConfig>) => {
    setSmartConfig(prev => ({ ...prev, ...updates }));
    if(user) logActivity('update_smart_config', 'Updated AI configuration');
  };

  const addCrawlerSource = (source: CrawlerSource) => {
    setCrawlerSources(prev => [...prev, source]);
    logActivity('add_crawler_source', `Added crawler source: ${source.name}`);
  };

  const deleteCrawlerSource = (id: string) => {
    setCrawlerSources(prev => prev.filter(s => s.id !== id));
    logActivity('delete_crawler_source', `Deleted crawler source ID: ${id}`);
  };

  const value = {
    lang, setLang, t,
    themeMode, toggleThemeMode,
    config, updateConfig,
    plugins, togglePlugin, installPlugin, deletePlugin,
    pages, addPage, updatePage, deletePage,
    posts, addPost, updatePost, deletePost,
    categories, addCategory, updateCategory, deleteCategory, reorderCategories,
    tags, addTag, deleteTag,
    comments, addComment, deleteComment, updateComment, replyToComment,
    messages, addMessage, deleteMessage, markMessageRead,
    media, addMedia, deleteMedia,
    menus, addMenuItem, updateMenuItem, reorderMenus, deleteMenuItem,
    logs,
    user, loginUser, logoutUser,
    isRTL: lang === 'fa',
    cacheSystem: cache,
    restoreBackup,
    smartConfig, updateSmartConfig,
    crawlerSources, addCrawlerSource, deleteCrawlerSource
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};