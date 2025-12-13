

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Sun, Moon, Menu, X, Search, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../../types';
import { DynamicIcon } from '../ui/DynamicIcon';
import { CartDrawer } from '../store/CartDrawer';

// Define recursive type for menu items with children
interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

export const PublicLayout = () => {
  const { t, lang, setLang, themeMode, toggleThemeMode, config, plugins, menus, cart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // For Mobile Accordion
  const location = useLocation();
  const navigate = useNavigate();

  const isStoreActive = plugins.some(p => p.id === 'armot-store' && p.active);

  // Helper: Build Tree Structure
  const buildMenuTree = (items: MenuItem[]): MenuItemWithChildren[] => {
      const map: Record<string, MenuItemWithChildren> = {};
      const roots: MenuItemWithChildren[] = [];
      
      // Initialize Map
      items.forEach(item => {
          map[item.id] = { ...item, children: [] };
      });

      // Connect Parents
      items.forEach(item => {
          if (item.parentId && map[item.parentId]) {
              map[item.parentId].children.push(map[item.id]);
          } else {
              roots.push(map[item.id]);
          }
      });
      
      // Sort
      const sort = (nodes: MenuItemWithChildren[]) => nodes.sort((a, b) => a.order - b.order).forEach(n => sort(n.children));
      sort(roots);
      
      return roots;
  };

  const headerMenus = buildMenuTree(menus.filter(m => m.location === 'header'));
  const footerMenus = buildMenuTree(menus.filter(m => m.location === 'footer'));

  // Plugin System: Analytics Hook
  const hasAnalyticsPlugin = plugins.find(p => p.id === 'analytics-lite' && p.active);

  useEffect(() => {
    if (hasAnalyticsPlugin) {
      console.log(`[Simple Analytics] Tracking page view: ${location.pathname}`);
    }
  }, [location, hasAnalyticsPlugin]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // --- Recursive Menu Renderer (Desktop) ---
  const DesktopMenuItem: React.FC<{ item: MenuItemWithChildren }> = ({ item }) => {
      const hasChildren = item.children.length > 0;

      return (
          <div className="relative group">
              <Link 
                to={item.url} 
                className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors"
              >
                 {item.icon && <DynamicIcon name={item.icon} size={16} />}
                 {item.label[lang]}
                 {hasChildren && <ChevronDown size={14} className="opacity-50" />}
              </Link>
              
              {/* Dropdown */}
              {hasChildren && (
                  <div className="absolute top-full right-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                      <div className="py-1">
                          {item.children.map(child => (
                              <Link 
                                key={child.id} 
                                to={child.url}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600"
                              >
                                  {child.icon && <DynamicIcon name={child.icon} size={14} />}
                                  {child.label[lang]}
                              </Link>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // --- Recursive Menu Renderer (Mobile) ---
  const MobileMenuItem: React.FC<{ item: MenuItemWithChildren, depth?: number }> = ({ item, depth = 0 }) => {
      const hasChildren = item.children.length > 0;
      const isOpen = activeDropdown === item.id;

      const toggleDropdown = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setActiveDropdown(isOpen ? null : item.id);
      };

      return (
          <div className="mb-1">
              <div className="flex items-center justify-between">
                <Link 
                    to={item.url} 
                    onClick={() => !hasChildren && setIsOpen(false)}
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                    style={{ paddingRight: depth > 0 && lang === 'fa' ? `${depth * 1.5}rem` : undefined, paddingLeft: depth > 0 && lang === 'en' ? `${depth * 1.5}rem` : undefined }}
                >
                    {item.icon && <DynamicIcon name={item.icon} size={18} />}
                    {item.label[lang]}
                </Link>
                {hasChildren && (
                    <button onClick={toggleDropdown} className="p-2 text-gray-500">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
              </div>
              
              {hasChildren && isOpen && (
                  <div className="border-r-2 rtl:border-r-2 rtl:border-l-0 ltr:border-l-2 ltr:border-r-0 border-gray-100 dark:border-gray-800 mr-4 rtl:mr-4 rtl:ml-0 ltr:ml-4 ltr:mr-0">
                      {item.children.map(child => (
                          <MobileMenuItem key={child.id} item={child} depth={depth + 1} />
                      ))}
                  </div>
              )}
          </div>
      );
  };

  const renderNavigation = () => {
    return (
        <nav className="border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
            
            <div className="flex items-center gap-4">
                
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    {config.siteName}
                </Link>

                <div className="hidden md:flex items-center space-x-4 space-x-reverse mr-6 rtl:mr-6 rtl:ml-0 ltr:ml-6">
                    {headerMenus.map(item => (
                        <DesktopMenuItem key={item.id} item={item} />
                    ))}
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="hidden lg:block relative mx-2">
                    <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-900 text-sm rounded-lg px-3 pl-8 rtl:pl-3 rtl:pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white w-48 transition-all focus:w-64"
                    />
                    <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 rtl:left-auto rtl:right-2">
                    <Search size={16} />
                    </button>
                </form>

                {isStoreActive && (
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative transition-colors"
                    >
                        <ShoppingBag size={20} />
                        {cart.length > 0 && (
                            <span className="absolute top-0 right-0 rtl:right-auto rtl:left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </button>
                )}

                <Link to="/login" className="hidden md:block text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors text-sm">{t('login')}</Link>

                <button 
                onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} 
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center gap-1"
                >
                    <Globe size={20} />
                </button>
                <button 
                onClick={toggleThemeMode}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-500"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            </div>
        </div>
        </nav>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
      {renderNavigation()}
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Menu */}
      {isOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 p-4 space-y-2 bg-white dark:bg-gray-950 fixed w-full z-40 top-16 shadow-lg h-[calc(100vh-64px)] overflow-y-auto">
             <form onSubmit={handleSearch} className="mb-4 relative">
                 <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                 />
                 <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3">
                    <Search size={18} />
                 </button>
             </form>
            
            {headerMenus.map(item => (
                <MobileMenuItem key={item.id} item={item} />
            ))}

            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
                {t('login')}
            </Link>
          </div>
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className={`border-t py-12 ${config.activeTheme === 'classic' ? 'bg-gray-900 text-gray-400 border-gray-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
             {footerMenus.map(item => (
                <Link 
                  key={item.id} 
                  to={item.url} 
                  className="hover:text-primary-600 transition-colors flex items-center gap-1"
                >
                  {item.icon && <DynamicIcon name={item.icon} size={14} />}
                  {item.label[lang]}
                </Link>
             ))}
           </div>
           <p className="opacity-75">© 2024 {config.siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
