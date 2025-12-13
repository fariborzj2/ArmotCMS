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
  Sparkles,
  User as UserIcon,
  ChevronRight,
  Search,
  ShoppingBag,
  ShoppingCart
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
  const { t, logoutUser, themeMode, toggleThemeMode, user, lang, setLang, messages, comments, isRTL, plugins } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadMessages = messages.filter(m => !m.read).length;
  const pendingComments = comments.filter(c => c.status === 'pending').length;
  const isStoreActive = plugins.some(p => p.id === 'armot-store' && p.active);

  const navGroups: NavGroup[] = [
    {
      id: 'main',
      label: 'nav_main',
      items: [
        { icon: LayoutDashboard, label: 'dashboard', path: '/admin', roles: ['admin', 'editor', 'user'] },
        { icon: UserIcon, label: 'profile', path: '/admin/profile', roles: ['admin', 'editor', 'user'] },
      ]
    },
    {
        id: 'content',
        label: 'nav_content',
        items: [
            { icon: FileText, label: 'pages', path: '/admin/pages', roles: ['admin', 'editor'] },
            { icon: PenTool, label: 'blog', path: '/admin/blog', roles: ['admin', 'editor'] },
            { icon: Sparkles, label: 'smart_assistant', path: '/admin/smart-assistant', roles: ['admin', 'editor'] },
            { icon: ImageIcon, label: 'media', path: '/admin/media', roles: ['admin', 'editor'] },
        ]
    },
    ...(isStoreActive ? [{
        id: 'store',
        label: 'nav_store',
        items: [
            { icon: ShoppingBag, label: 'products', path: '/admin/store/products', roles: ['admin', 'editor'] },
            { icon: Settings, label: 'store_settings', path: '/admin/store/settings', roles: ['admin'] },
        ]
    }] : []),
    {
        id: 'engagement',
        label: 'nav_engagement',
        items: [
            { icon: MessageSquare, label: 'comments', path: '/admin/comments', roles: ['admin', 'editor'], badge: pendingComments },
            { icon: InboxIcon, label: 'inbox', path: '/admin/inbox', roles: ['admin', 'editor'], badge: unreadMessages },
        ]
    },
    {
        id: 'design',
        label: 'nav_design',
        items: [
            { icon: List, label: 'menus', path: '/admin/menus', roles: ['admin'] },
            { icon: Palette, label: 'theme_manager', path: '/admin/themes', roles: ['admin'] },
        ]
    },
    {
        id: 'system',
        label: 'nav_system',
        items: [
            { icon: Users, label: 'users', path: '/admin/users', roles: ['admin'] },
            { icon: Plug, label: 'plugins', path: '/admin/plugins', roles: ['admin'] },
            { icon: Server, label: 'tools', path: '/admin/tools', roles: ['admin'] },
            { icon: Activity, label: 'activity_log', path: '/admin/logs', roles: ['admin'] },
            { icon: Settings, label: 'settings', path: '/admin/settings', roles: ['admin'] },
        ]
    }
  ];

  const handleLogout = () => {
      logoutUser();
      navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          navigate('/admin/blog'); 
      }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F19] flex transition-colors duration-300 font-sans overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 z-50 h-screen w-[280px] 
        bg-white dark:bg-[#111827] 
        transition-transform duration-300 ease-in-out transform
        flex flex-col border-r border-gray-100 dark:border-gray-800 lg:border-none shadow-xl lg:shadow-none
        ${isRTL ? 'right-0' : 'left-0'}
        ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0
      `}>
         
         {/* Logo */}
         <div className="h-20 flex items-center px-8 relative border-b border-gray-50 dark:border-gray-800/50 lg:border-none">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                    <span className="font-bold text-xl">A</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">Armot</span>
                    <span className="text-xs text-gray-400 font-medium tracking-wider">{t('dashboard')}</span>
                </div>
            </Link>
            
            {/* Close Button */}
            <button 
                onClick={() => setSidebarOpen(false)} 
                className={`lg:hidden absolute top-6 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
            >
                <X size={20} />
            </button>
         </div>

         {/* Navigation */}
         <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
            {navGroups.map(group => {
                const visibleItems = group.items.filter(item => !item.roles || (user && item.roles.includes(user.role)));
                if (visibleItems.length === 0) return null;

                return (
                    <div key={group.id}>
                        {group.id !== 'main' && (
                            <h3 className="px-4 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                                {t(group.label)}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {visibleItems.map(item => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link 
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                            flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                            ${isActive 
                                                ? 'bg-primary-600 text-white shadow-sm' 
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{t(item.label)}</span>
                                        </div>
                                        {item.badge ? (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-primary-600' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
         </div>

         {/* User Profile */}
         <div className="p-4 mx-4 mb-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-primary-600 font-bold text-lg shadow-sm">
                     {user?.username.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.username}</p>
                     <p className="text-xs text-gray-500 truncate capitalize">{t(user?.role || 'user')}</p>
                 </div>
                 <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm">
                     <LogOut size={16} />
                 </button>
             </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Topbar */}
          <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-[#F3F4F6] dark:bg-[#0B0F19]">
              <div className="flex items-center gap-4">
                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Menu size={20} />
                  </button>
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                      <span className="font-medium">Admin</span> 
                      <ChevronRight size={14} />
                      <span className="font-bold text-gray-800 dark:text-white capitalize">{location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}</span>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  {/* Search Bar */}
                  <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center bg-white dark:bg-[#111827] px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-64 group focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                      <Search size={18} className="text-gray-400 group-focus-within:text-primary-500" />
                      <input 
                        type="text" 
                        placeholder={t('search_placeholder_admin')} 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 h-6" 
                      />
                  </form>

                  <Link to="/" target="_blank" className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 bg-white dark:bg-[#111827] px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                      <Globe size={18} />
                      {t('view_site')}
                  </Link>

                  <div className="flex items-center gap-2 bg-white dark:bg-[#111827] p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-xs"
                    >
                        {lang === 'fa' ? 'EN' : 'FA'}
                    </button>

                    <button 
                        onClick={toggleThemeMode}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                  </div>
              </div>
          </header>

          {/* Page Content Scrollable Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 pb-20">
              <div className="max-w-[1600px] mx-auto animate-fadeIn">
                  {children}
              </div>
          </main>
      </div>
    </div>
  );
};