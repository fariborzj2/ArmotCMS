
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Sun, Moon, Menu, X, Search } from 'lucide-react';

export const PublicLayout = () => {
  const { t, lang, setLang, themeMode, toggleThemeMode, config, plugins, menus } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Get dynamic menu items
  const headerMenus = menus.filter(m => m.location === 'header').sort((a, b) => a.order - b.order);
  const footerMenus = menus.filter(m => m.location === 'footer').sort((a, b) => a.order - b.order);

  // Plugin System: Analytics Hook
  const hasAnalyticsPlugin = plugins.find(p => p.id === 'analytics-lite' && p.active);

  useEffect(() => {
    // Simulate Analytics Plugin
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

  // Helper to render links
  const renderLinks = (mobile = false) => {
    return headerMenus.map(item => (
      <Link 
        key={item.id} 
        to={item.url} 
        onClick={() => mobile && setIsOpen(false)}
        className={mobile 
          ? "block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
          : "hover:text-gray-300 text-sm font-medium uppercase tracking-wider"
        }
      >
        {item.label[lang]}
      </Link>
    ));
  };

  // Theme Variations for Navigation
  const renderNavigation = () => {
    switch (config.activeTheme) {
      case 'classic':
        return (
          <nav className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-400"
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  
                  <Link to="/" className="text-xl font-bold tracking-wide uppercase">
                    {config.siteName}
                  </Link>
                  <div className="hidden md:flex items-center space-x-6 space-x-reverse">
                    {renderLinks()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <form onSubmit={handleSearch} className="hidden md:block relative">
                     <input 
                        type="text" 
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-gray-800 text-sm rounded-full px-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-600 text-white w-48 placeholder-gray-500"
                     />
                     <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white rtl:right-auto rtl:left-3">
                        <Search size={14} />
                     </button>
                  </form>
                  <Link to="/login" className="bg-white text-gray-900 px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-100">{t('login')}</Link>
                  <div className="flex items-center gap-2 border-l border-gray-700 pl-4 ml-4 rtl:border-r rtl:border-l-0 rtl:pl-0 rtl:pr-4 rtl:ml-0 rtl:mr-4">
                     <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="text-sm font-bold">{lang.toUpperCase()}</button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        );

      case 'minimal':
        return (
          <nav className="bg-white dark:bg-gray-950 sticky top-0 z-50 border-b border-transparent transition-all">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="h-20 flex justify-between items-center relative">
                 
                 <div className="flex gap-2 items-center">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-gray-500"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    
                    <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white mb-1">
                        {config.siteName}.
                    </Link>
                 </div>
                 
                 <div className="hidden md:flex gap-6 text-sm text-gray-500 dark:text-gray-400 items-center absolute left-1/2 -translate-x-1/2">
                    {headerMenus.map(item => (
                       <Link key={item.id} to={item.url} className="hover:text-black dark:hover:text-white transition-colors">
                          {item.label[lang]}
                       </Link>
                    ))}
                    <button onClick={() => document.getElementById('search-modal')?.focus()} className="text-gray-400 hover:text-black dark:hover:text-white">
                       <Search size={16} />
                    </button>
                 </div>

                 <div className="flex gap-2 items-center">
                    <button onClick={toggleThemeMode} className="p-2 text-gray-400 hover:text-black dark:hover:text-white">
                      {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="p-2 text-gray-400 hover:text-black dark:hover:text-white uppercase text-xs font-bold">
                        {lang}
                    </button>
                    <Link to="/login" className="p-2 text-gray-400 hover:text-black dark:hover:text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </Link>
                 </div>
               </div>
             </div>
          </nav>
        );

      case 'modern':
      default:
        return (
          <nav className="border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                
                {/* Left Side (LTR) / Right Side (RTL) */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-500"
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  
                  <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    {config.siteName}
                  </Link>

                  <div className="hidden md:flex items-center space-x-8 space-x-reverse mr-6 rtl:mr-6 rtl:ml-0 ltr:ml-6">
                    {headerMenus.map(item => (
                        <Link 
                            key={item.id} 
                            to={item.url} 
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors"
                        >
                            {item.label[lang]}
                        </Link>
                    ))}
                  </div>
                </div>
                
                {/* Right Side (LTR) / Left Side (RTL) */}
                <div className="flex items-center gap-2">
                   {/* Search Bar */}
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

                  <Link to="/login" className="hidden md:block text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition-colors">{t('login')}</Link>

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
                </div>
              </div>
            </div>
          </nav>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
      {renderNavigation()}
      
      {/* Mobile Menu (Common) */}
      {isOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 p-4 space-y-2 bg-white dark:bg-gray-950 fixed w-full z-40 top-16 shadow-lg">
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
                <Link 
                  key={item.id} 
                  to={item.url} 
                  onClick={() => setIsOpen(false)} 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  {item.label[lang]}
                </Link>
            ))}
            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary-600">{t('login')}</Link>
          </div>
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className={`border-t py-12 ${config.activeTheme === 'classic' ? 'bg-gray-900 text-gray-400 border-gray-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex justify-center gap-6 mb-4 text-sm">
             {footerMenus.map(item => (
                <Link 
                  key={item.id} 
                  to={item.url} 
                  className="hover:text-primary-600 transition-colors"
                >
                  {item.label[lang]}
                </Link>
             ))}
           </div>
           <p className="opacity-75">© 2024 {config.siteName}. All rights reserved.</p>
           {hasAnalyticsPlugin && (
             <p className="text-xs mt-2 text-green-500 flex items-center justify-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               Analytics Active
             </p>
           )}
        </div>
      </footer>
    </div>
  );
};
