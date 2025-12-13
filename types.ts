

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

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  status: 'published' | 'draft';
  createdAt: string;
  
  // Advanced Fields
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  publishDate?: string; // ISO Date String
  faqs?: FAQItem[];
  schemaType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'LandingPage';
}

export interface BlogTag {
  id: string;
  name: string;
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
  pinned?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null; // For Nested Categories
  order?: number;           // For Drag & Drop Sorting
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
  parentId?: string; // For Nested Menus
  icon?: string;     // Lucide Icon Name
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
  cacheDriver: 'file' | 'redis' | 'memcached' | 'memory';
  
  // New Fields
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  seoTitleSeparator?: string;
  enableSitemap?: boolean;

  // UI Customization
  uiRadius?: 'sm' | 'md' | 'lg' | 'full';
  uiFont?: 'estedad' | 'vazir' | 'inter';
  uiDensity?: 'compact' | 'comfortable';
  uiGap?: 'compact' | 'normal' | 'wide';
  uiPrimaryColor?: 'blue' | 'indigo' | 'purple' | 'rose' | 'amber' | 'emerald' | 'sky';
}

export interface SmartAssistantConfig {
  enableContentGen: boolean;
  enableScheduler: boolean;
  enableAutoReply: boolean;
  enableSummary: boolean;
  enableImageGen: boolean; // New
  preferredModel: 'gemini-2.5-flash' | 'gemini-3-pro-preview';
  replyTone: 'formal' | 'friendly' | 'humorous';
  dailyReplyLimit: number;
}

export interface CrawlerSource {
  id: string;
  name: string;
  url: string;
  lastCrawled?: string;
  status: 'active' | 'inactive';
}

export interface ContentTask {
  id: string;
  sourceUrl?: string;
  topic?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: BlogPost;
  createdAt: string;
}

export interface ScheduleSlot {
  date: string; // ISO
  topic: string;
  reason: string; // Why AI picked this
  bestTime: string; // HH:mm
}

export interface CommentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  type: 'question' | 'critique' | 'suggestion' | 'general';
  suggestedReply: string;
}

export interface Translation {
  [key: string]: {
    fa: string;
    en: string;
  };
}

// --- E-COMMERCE TYPES ---

export type ProductType = 'physical' | 'digital' | 'service';
export type PricingModel = 'fixed' | 'dollar_based';

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  order?: number;
}

export interface StoreProduct {
  id: string;
  title: string;
  slug: string;
  sku: string;
  type: ProductType;
  categoryId?: string; // Link to StoreCategory
  
  // Pricing
  priceModel: PricingModel;
  basePrice: number; // If dollar_based, this is in USD. If fixed, in Toman.
  salePrice?: number;
  
  // Inventory
  stock: number;
  isAvailable: boolean;
  
  // Content
  excerpt?: string;
  description?: string;
  featuredImage?: string;
  gallery?: string[];
  
  // SEO
  hasSinglePage: boolean; // If false, no detail page, just add to cart/list view
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
  
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
}

export interface StoreConfig {
  currency: 'IRT' | 'IRR' | 'USD';
  dollarRate: number; // Current exchange rate
  lastRateUpdate: string;
  enableTax: boolean;
  taxRate: number;
}

export interface StoreOrder {
  id: string;
  customerName: string;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'canceled';
  date: string;
  items: Array<{ productId: string; quantity: number; priceAtPurchase: number }>;
}