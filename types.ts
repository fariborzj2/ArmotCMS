

export type Language = 'fa' | 'en';
export type ThemeMode = 'light' | 'dark';
export type LayoutTheme = 'modern' | 'classic' | 'minimal';
export type MediaContext = 'blog' | 'user' | 'page' | 'general';

export interface User {
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  // New Fields
  fullName?: string;
  mobile?: string;
  bio?: string;
  avatar?: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  active: boolean;
  installed: boolean;
  type: 'core' | 'extension';
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: string;
  date: string;
  // New Fields for Folder Structure
  folder?: string;
  context?: MediaContext;
  path?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string; // The text part of the URL
  content: string;
  excerpt: string;
  author: string; // username
  categoryId: string;
  tags: string[];
  featuredImage?: string;
  status: 'published' | 'draft';
  createdAt: string;
  views: number;
  
  // New Fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  publishDate?: string; // ISO Date String
  faqs?: FAQItem[];
  schemaType?: 'Article' | 'NewsArticle' | 'BlogPosting';
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  pageId: string; // Can be Page ID or Blog Post ID
  author: string;
  email?: string;
  content: string;
  date: string;
  status: 'approved' | 'pending' | 'spam';
  replies?: Comment[];
  avatar?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export interface MenuItem {
  id: string;
  label: { fa: string; en: string };
  url: string;
  order: number;
  location: 'header' | 'footer';
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string; // e.g., 'create_page', 'login', 'delete_plugin'
  details: string;
  ip: string;
  timestamp: string;
}

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  dbHost?: string;
  dbName?: string;
  dbUser?: string;
  installed: boolean;
  maintenanceMode: boolean;
  activeTheme: LayoutTheme;
  adminTheme: LayoutTheme;
  cacheDriver: 'file' | 'redis' | 'memcached';
  
  // New Fields
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  seoTitleSeparator?: string;
  enableSitemap?: boolean;
}

export interface Translation {
  [key: string]: {
    fa: string;
    en: string;
  };
}