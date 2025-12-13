import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Installer } from './pages/installer/Installer';
import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { PluginManager } from './pages/admin/PluginManager';
import { ThemeManager } from './pages/admin/ThemeManager';
import { UserManager } from './pages/admin/UserManager';
import { ContentManager } from './pages/admin/ContentManager';
import { MediaManager } from './pages/admin/MediaManager';
import { MenuManager } from './pages/admin/MenuManager';
import { CommentManager } from './pages/admin/CommentManager';
import { BlogManager } from './pages/admin/BlogManager';
import { Inbox } from './pages/admin/Inbox';
import { Profile } from './pages/admin/Profile';
import { Settings } from './pages/admin/Settings';
import { ActivityLogs } from './pages/admin/ActivityLogs';
import { Tools } from './pages/admin/Tools';
import { SmartAssistant } from './pages/admin/plugins/SmartAssistant';
import { ProductManager } from './pages/admin/store/ProductManager';
import { StoreSettings } from './pages/admin/store/StoreSettings';
import { OrderManager } from './pages/admin/store/OrderManager'; // New
import { ShopHome } from './pages/public/store/ShopHome';
import { ShopCategory } from './pages/public/store/ShopCategory';
import { ShopProduct } from './pages/public/store/ShopProduct';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { FAQ } from './pages/public/FAQ';
import { Terms } from './pages/public/Terms';
import { Search } from './pages/public/Search';
import { DynamicPage } from './pages/public/DynamicPage';
import { Maintenance } from './pages/public/Maintenance';
import { BlogHome } from './pages/public/blog/BlogHome';
import { BlogSingle } from './pages/public/blog/BlogSingle';
import { BlogResolver } from './pages/public/blog/BlogResolver';
import { BlogTags } from './pages/public/blog/BlogTags';
import { BlogSearch } from './pages/public/blog/BlogSearch';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { AccessDenied } from './pages/AccessDenied';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const AppRoutes = () => {
  const { config, user, plugins } = useApp();

  // --- Dynamic Theme Application ---
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Fonts
    const fontMap: Record<string, string> = {
      'estedad': 'Estedad',
      'vazir': 'Vazirmatn',
      'inter': 'Inter'
    };
    const selectedFont = fontMap[config.uiFont || 'estedad'] || 'Estedad';
    root.style.setProperty('--font-primary', selectedFont);

    // 2. Border Radius (Controlled via single base variable in index.html config)
    const radiusSettings = {
        'sm': '0.5rem',   // 8px (Small/Sharp)
        'md': '1rem',     // 16px (Medium/Standard)
        'lg': '1.5rem',   // 24px (Large/Round)
        'full': '2rem'    // 32px (Very Round)
    };
    const currentRadius = radiusSettings[config.uiRadius || 'md'];
    root.style.setProperty('--radius-base', currentRadius);

    // 3. Gap Spacing
    const gapSettings = {
        'compact': '1rem',  // 16px
        'normal': '1.5rem', // 24px
        'wide': '2rem'      // 32px
    };
    const currentGap = gapSettings[config.uiGap || 'normal'];
    root.style.setProperty('--app-gap', currentGap);

    // 4. Density (Experimental scaling)
    if (config.uiDensity === 'compact') {
        root.style.fontSize = '14px'; // Slightly smaller base
    } else {
        root.style.fontSize = '16px'; // Default
    }

    // 5. Primary Color
    const colorPalettes: Record<string, any> = {
      sky: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
      blue: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      indigo: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
      purple: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
      rose: { 50: '#fff1f2', 100: '#ffe4e6', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
      amber: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
      emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' },
    };
    const activeColor = colorPalettes[config.uiPrimaryColor || 'sky'];
    if (activeColor) {
        root.style.setProperty('--color-primary-50', activeColor[50]);
        root.style.setProperty('--color-primary-100', activeColor[100]);
        root.style.setProperty('--color-primary-500', activeColor[500]);
        root.style.setProperty('--color-primary-600', activeColor[600]);
        root.style.setProperty('--color-primary-700', activeColor[700]);
    }

  }, [config]);

  // If not installed, force redirect to installer
  if (!config.installed) {
     return (
       <Routes>
         <Route path="/install" element={<Installer />} />
         <Route path="*" element={<Navigate to="/install" replace />} />
       </Routes>
     );
  }

  // If in Maintenance Mode and NOT logged in (and not already on login or maintenance page)
  const isMaintenance = config.maintenanceMode && !user;

  // Check Plugin Status
  const isBlogActive = plugins.some(p => p.id === 'armot-blog' && p.active);
  const isSmartActive = plugins.some(p => p.id === 'smart-assistant' && p.active);
  const isStoreActive = plugins.some(p => p.id === 'armot-store' && p.active);

  return (
    <Routes>
      {/* Special Routes */}
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/login" element={user ? <Navigate to="/admin" /> : <Login />} />
      <Route path="/install" element={<Navigate to="/admin" replace />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Public Routes - Guarded by Maintenance Mode */}
      <Route element={isMaintenance ? <Navigate to="/maintenance" /> : <PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/search" element={<Search />} />
        
        {/* Blog Routes (Plugin Based) */}
        {isBlogActive && (
          <Route path="/blog">
             <Route index element={<BlogHome />} />
             <Route path="tags" element={<BlogTags />} />
             <Route path="tags/:tag" element={<BlogTags />} />
             <Route path="search=:query" element={<BlogSearch />} /> {/* Specific Request */}
             <Route path="search" element={<BlogSearch />} /> {/* Fallback standard */}
             <Route path=":category/:idSlug" element={<BlogSingle />} />
             <Route path=":slug" element={<BlogResolver />} />
          </Route>
        )}

        {/* Store Routes (Plugin Based) */}
        {isStoreActive && (
          <Route path="/shop">
             <Route index element={<ShopHome />} />
             <Route path="category/:slug" element={<ShopCategory />} />
             <Route path="product/:slug" element={<ShopProduct />} />
          </Route>
        )}

        <Route path="/404" element={<NotFound />} />
        {/* Dynamic Route for CMS Pages - Must be last */}
        <Route path="/:slug" element={<DynamicPage />} />
      </Route>

      {/* Admin Routes - Protected by RBAC */}
      <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
         
         {/* General Access (Admin, Editor, User) */}
         <Route element={<ProtectedRoute />}>
             <Route index element={<Dashboard />} />
             <Route path="profile" element={<Profile />} />
         </Route>

         {/* Editor & Admin Access */}
         <Route element={<ProtectedRoute allowedRoles={['admin', 'editor']} />}>
             <Route path="inbox" element={<Inbox />} />
             <Route path="pages" element={<ContentManager />} />
             {isBlogActive && <Route path="blog" element={<BlogManager />} />}
             <Route path="comments" element={<CommentManager />} />
             <Route path="media" element={<MediaManager />} />
             {isSmartActive && <Route path="smart-assistant" element={<SmartAssistant />} />}
             {isStoreActive && <Route path="store/products" element={<ProductManager />} />}
             {isStoreActive && <Route path="store/orders" element={<OrderManager />} />}
         </Route>

         {/* Admin Only Access */}
         <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
             <Route path="menus" element={<MenuManager />} />
             <Route path="plugins" element={<PluginManager />} />
             <Route path="themes" element={<ThemeManager />} />
             <Route path="users" element={<UserManager />} />
             <Route path="settings" element={<Settings />} />
             <Route path="logs" element={<ActivityLogs />} />
             <Route path="tools" element={<Tools />} />
             {isStoreActive && <Route path="store/settings" element={<StoreSettings />} />}
         </Route>

         <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;