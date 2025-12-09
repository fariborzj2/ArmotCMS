

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Palette, 
  Plug, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Globe,
  FileText,
  Image as ImageIcon,
  List,
  MessageSquare,
  Inbox as InboxIcon,
  PenTool,
  Activity,
  Server,
  ChevronDown,
  ChevronRight,
  Home,
  Sparkles
} from 'lucide-react';

type NavGroup = {
  id: string;
  label: string;
  items: {
    icon: any;
    label: string;
    path: string;
    roles: string[];
    badge?: number;
  }[];
};

export const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { t, logoutUser, themeMode, toggleThemeMode, lang, setLang, user, messages, plugins } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for collapsible groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    content: true,
    engagement: true,
    design: false,
    system: false
  });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // RBAC: Define permission levels
  const isAdmin = user?.role === 'admin';
  const unreadMessages = messages.filter(m => !m.read).length;
  
  // Check Active Plugins
  const isBlogActive = plugins.some(p => p.id === 'armot-blog' && p.active);
  const isSmartActive = plugins.some(p => p.id === 'smart-assistant' && p.active);

  // Grouped Navigation Structure
  const navGroups: (NavGroup | { type: 'single', item: any })[] = [
    {
      type: 'single',
      item: { icon: LayoutDashboard, label: 'dashboard', path: '/admin', roles: ['admin', 'editor', 'user'] }
    },
    {
      id: 'content',
      label: 'nav_content',
      items: [
        { icon: FileText, label: 'pages', path: '/admin/pages', roles: ['admin', 'editor'] },
        ...(isBlogActive ? [{ icon: PenTool, label: 'blog', path: '/admin/blog', roles: ['admin', 'editor'] }] : []),
        { icon: ImageIcon, label: 'media', path: '/admin/media', roles: ['admin', 'editor'] },
        ...(isSmartActive ? [{ icon: Sparkles, label: 'smart_assistant', path: '/admin/smart-assistant', roles: ['admin', 'editor'] }] : [])
      ]
    },
    {
      id: 'engagement',
      label: 'nav_engagement',
      items: [
        { icon: InboxIcon, label: 'inbox', path: '/admin/inbox', roles: ['admin', 'editor'], badge: unreadMessages },
        { icon: MessageSquare, label: 'comments', path: '/admin/comments', roles: ['admin', 'editor'] }
      ]
    },
    {
      id: 'design',
      label: 'nav_design',
      items: [
         { icon: Palette, label: 'theme_manager', path: '/admin/themes', roles: ['admin'] },
         { icon: List, label: 'menus', path: '/admin/menus', roles: ['admin'] },
      ]
    },
    {
      id: 'system',
      label: 'nav_system',
      items: [
         { icon: Users, label: 'users', path: '/admin/users', roles: ['admin'] },
         { icon: Plug, label: 'plugin_manager', path: '/admin/plugins', roles: ['admin'] },
         { icon: Server, label: 'tools', path: '/admin/tools', roles: ['admin'] },
         { icon: Activity, label: 'activity_log', path: '/admin/logs', roles: ['admin'] },
      ]
    }
  ];

  const renderNavItem = (item: any) => {
    if (user?.role && !item.roles.includes(user.role)) return null;
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon size={18} />
          <span>{t(item.label)}</span>
        </div>
        {item.badge && item.badge > 0 ? (
          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 z-30 w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col
        ${sidebarOpen ? (lang === 'fa' ? 'translate-x-0' : 'translate-x-0') : (lang === 'fa' ? 'translate-x-full' : '-translate-x-full')}
      `}>
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <Link to="/admin" onClick={() => setSidebarOpen(false)}>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Armot<span className="font-light text-gray-500">Cms</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-2">
          {navGroups.map((group: any, idx) => {
             // Handle Single Item (Dashboard)
             if (group.type === 'single') {
                return renderNavItem(group.item);
             }

             // Check permissions for entire group (hide group if no items accessible)
             const visibleItems = group.items.filter((item: any) => user?.role && item.roles.includes(user.role));
             if (visibleItems.length === 0) return null;

             const isOpen = openGroups[group.id];

             return (
               <div key={group.id} className="pt-2">
                 <button 
                   onClick={() => toggleGroup(group.id)}
                   className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                 >
                   <span>{t(group.label)}</span>
                   {isOpen ? <ChevronDown size={14} /> : (lang === 'fa' ? <ChevronDown size={14} className="rotate-90" /> : <ChevronRight size={14} />)}
                 </button>
                 
                 {isOpen && (
                   <div className="space-y-1 mt-1 ltr:ml-2 rtl:mr-2 border-l-2 rtl:border-l-0 rtl:border-r-2 border-gray-100 dark:border-gray-800 ltr:pl-2 rtl:pr-2">
                     {visibleItems.map((item: any) => renderNavItem(item))}
                   </div>
                 )}
               </div>
             );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
             <Link to="/admin/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 group flex-1 min-w-0 mr-2 rtl:mr-0 rtl:ml-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 flex items-center justify-center font-bold group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                </div>
             </Link>
             
             {isAdmin && (
               <Link 
                 to="/admin/settings" 
                 onClick={() => setSidebarOpen(false)}
                 className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 rounded-lg transition-colors"
                 title={t('settings')}
               >
                  <Settings size={20} />
               </Link>
             )}
          </div>

          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 mr-auto ml-0 rtl:ml-auto rtl:mr-0">
             {/* View Site - Home Button */}
             <Link 
               to="/"
               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors flex items-center gap-2"
               title={t('view_site')}
             >
               <Home size={20} />
               <span className="hidden md:inline text-sm font-medium">{t('view_site')}</span>
             </Link>

             {/* Language Switcher */}
             <button 
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors flex items-center gap-2"
              title="Change Language"
            >
              <Globe size={20} />
              <span className="text-sm font-medium uppercase">{lang}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleThemeMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
