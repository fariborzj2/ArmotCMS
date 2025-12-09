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
import { SmartAssistant } from './pages/admin/plugins/SmartAssistant'; // New Plugin Route
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

    // 2. Border Radius
    // Mapping config values to CSS variable values
    const radiusSettings = {
        'sm': { sm: '0.125rem', md: '0.25rem', lg: '0.375rem' },
        'md': { sm: '0.125rem', md: '0.375rem', lg: '0.5rem' }, // Default
        'lg': { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
        'full': { sm: '0.5rem', md: '1rem', lg: '1.5rem' }
    };
    const currentRadius = radiusSettings[config.uiRadius || 'md'];
    root.style.setProperty('--radius-sm', currentRadius.sm);
    root.style.setProperty('--radius-md', currentRadius.md);
    root.style.setProperty('--radius-lg', currentRadius.lg);

    // 3. Density (Experimental scaling)
    if (config.uiDensity === 'compact') {
        root.style.fontSize = '14px'; // Slightly smaller base
    } else {
        root.style.fontSize = '16px'; // Default
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