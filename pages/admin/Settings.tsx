import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Save, Server, Globe, Power, Code, Search, Mail, Phone, MapPin } from 'lucide-react';
import { generateSitemap } from '../../utils/seo';

// Reusable Setting Field with Hint
const SettingField = ({ label, hint, children }: { label: string, hint: string, children?: React.ReactNode }) => (
  <div className="mb-8 last:mb-0">
    <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200 mb-3">
      {label}
    </label>
    {children}
    <p className="mt-2.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 opacity-80 font-medium">
      <span className="w-1 h-1 rounded-full bg-primary-500 inline-block"></span>
      {hint}
    </p>
  </div>
);

export const Settings = () => {
  const { t, config, updateConfig, pages } = useApp();
  const [localConfig, setLocalConfig] = useState(config);
  const [saving, setSaving] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo' | 'advanced'>('general');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateConfig(localConfig);
      setSaving(false);
    }, 800);
  };

  const sitemapXml = generateSitemap(pages);

  // Modern Minimal Input Style
  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:bg-white hover:border-gray-200 dark:hover:bg-gray-900 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-300 text-sm font-medium";

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex-1 md:flex-none whitespace-nowrap ${
        activeTab === id 
          ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md scale-100 ring-1 ring-black/5 dark:ring-white/5' 
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon size={18} strokeWidth={2.5} />
      {label}
    </button>
  );

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black dark:text-white">{t('settings')}</h1>
      </div>

      {/* Modern Segmented Tabs - Scrollable */}
      <div 
        className="p-1.5 bg-gray-200 dark:bg-gray-800 rounded-2xl flex gap-1 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <TabButton id="general" label={t('tab_general')} icon={Globe} />
        <TabButton id="contact" label={t('tab_contact')} icon={Mail} />
        <TabButton id="seo" label={t('tab_seo')} icon={Search} />
        <TabButton id="advanced" label={t('tab_advanced')} icon={Server} />
      </div>

      <div className="animate-fadeIn space-y-6">
        {activeTab === 'general' && (
          <Card>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                    <Globe size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-xl font-bold dark:text-white">{t('general_settings')}</h3>
                    <p className="text-gray-500 text-xs mt-1">Core site identification and status</p>
                </div>
            </div>
            
            <SettingField label={t('site_name')} hint={t('hint_site_name')}>
              <input 
                type="text" 
                value={localConfig.siteName}
                onChange={(e) => setLocalConfig({...localConfig, siteName: e.target.value})}
                className={inputClass}
              />
            </SettingField>

            <SettingField label={t('site_desc')} hint={t('hint_site_desc')}>
              <textarea 
                value={localConfig.siteDescription}
                onChange={(e) => setLocalConfig({...localConfig, siteDescription: e.target.value})}
                className={`${inputClass} h-32 resize-none`}
              />
            </SettingField>

            <SettingField label={t('maintenance_mode')} hint={t('hint_maintenance_mode')}>
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-colors">
                 <span className={`text-sm font-bold ${localConfig.maintenanceMode ? 'text-orange-600' : 'text-gray-500'}`}>
                  {localConfig.maintenanceMode ? t('active') : t('inactive')}
                </span>
                 <button 
                  onClick={() => setLocalConfig({...localConfig, maintenanceMode: !localConfig.maintenanceMode})}
                  className={`relative w-16 h-9 rounded-full transition-colors duration-300 focus:outline-none ${localConfig.maintenanceMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-300 ${localConfig.maintenanceMode ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </SettingField>
          </Card>
        )}

        {activeTab === 'contact' && (
          <Card>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                    <Mail size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-xl font-bold dark:text-white">{t('tab_contact')}</h3>
                    <p className="text-gray-500 text-xs mt-1">How users can reach you</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField label={t('contact_email')} hint={t('hint_contact_email')}>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 rtl:pl-0 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                     <Mail size={18} />
                   </div>
                   <input 
                    type="email" 
                    value={localConfig.contactEmail || ''}
                    onChange={(e) => setLocalConfig({...localConfig, contactEmail: e.target.value})}
                    className={`${inputClass} pl-12 rtl:pl-4 rtl:pr-12`}
                   />
                 </div>
              </SettingField>

              <SettingField label={t('contact_phone')} hint={t('hint_contact_phone')}>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 rtl:pl-0 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                     <Phone size={18} />
                   </div>
                   <input 
                    type="text" 
                    value={localConfig.contactPhone || ''}
                    onChange={(e) => setLocalConfig({...localConfig, contactPhone: e.target.value})}
                    className={`${inputClass} pl-12 rtl:pl-4 rtl:pr-12`}
                   />
                 </div>
              </SettingField>
            </div>

            <SettingField label={t('contact_address')} hint={t('hint_contact_address')}>
              <div className="relative group">
                 <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <MapPin size={18} />
                 </div>
                 <textarea 
                  value={localConfig.contactAddress || ''}
                  onChange={(e) => setLocalConfig({...localConfig, contactAddress: e.target.value})}
                  className={`${inputClass} pl-12 rtl:pl-4 rtl:pr-12 h-32 pt-4 resize-none`}
                 />
              </div>
            </SettingField>
          </Card>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
             <Card>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <Search size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold dark:text-white">{t('tab_seo')}</h3>
                        <p className="text-gray-500 text-xs mt-1">Search Engine Optimization settings</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SettingField label={t('seo_separator')} hint={t('hint_seo_separator')}>
                      <select 
                        value={localConfig.seoTitleSeparator || '|'}
                        onChange={(e) => setLocalConfig({...localConfig, seoTitleSeparator: e.target.value})}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                         <option value="|">| (Pipe)</option>
                         <option value="-">- (Dash)</option>
                         <option value="•">• (Bullet)</option>
                      </select>
                   </SettingField>

                   <SettingField label={t('enable_sitemap')} hint={t('hint_enable_sitemap')}>
                      <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-colors">
                        <span className={`text-sm font-bold ${localConfig.enableSitemap ? 'text-green-600' : 'text-gray-500'}`}>
                            {localConfig.enableSitemap ? t('active') : t('inactive')}
                        </span>
                        <button 
                          onClick={() => setLocalConfig({...localConfig, enableSitemap: !localConfig.enableSitemap})}
                          className={`relative w-16 h-9 rounded-full transition-colors duration-300 focus:outline-none ${localConfig.enableSitemap ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <span className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-300 ${localConfig.enableSitemap ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>
                   </SettingField>
                </div>
             </Card>

             <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2 dark:text-white">
                        <Code size={20} className="text-gray-400" />
                        XML Sitemap
                    </h3>
                    <Button size="sm" variant="secondary" onClick={() => setShowSitemap(!showSitemap)}>
                        {showSitemap ? t('hide') : t('view_sitemap')}
                    </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center justify-between border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="text-xs font-mono text-gray-500">
                      https://your-site.com/sitemap.xml
                    </div>
                </div>

                {showSitemap && (
                    <div className="mt-4 bg-gray-900 text-gray-300 p-6 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner">
                      <pre>{sitemapXml}</pre>
                    </div>
                )}
             </Card>
          </div>
        )}

        {activeTab === 'advanced' && (
          <Card>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                    <Server size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-xl font-bold dark:text-white">{t('tab_advanced')}</h3>
                    <p className="text-gray-500 text-xs mt-1">Performance and system controls</p>
                </div>
            </div>

            <SettingField label={t('cache_driver')} hint={t('hint_cache_driver')}>
              <select 
                value={localConfig.cacheDriver}
                onChange={(e) => setLocalConfig({...localConfig, cacheDriver: e.target.value as any})}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="memory">{t('driver_memory')}</option>
                <option value="file">{t('driver_file')}</option>
                <option value="redis">{t('driver_redis')}</option>
                <option value="memcached">{t('driver_memcached')}</option>
              </select>
            </SettingField>

            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-2xl mb-8 border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
               <div>
                   <strong>{t('system_status')}:</strong> {t('active')} ({t('driver')}: <u className="font-bold">{localConfig.cacheDriver}</u>)
               </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
               <div>
                  <h4 className="font-bold text-red-600 dark:text-red-400">{t('clear_cache')}</h4>
                  <p className="text-xs text-gray-500 mt-1">{t('hint_clear_cache')}</p>
               </div>
               <Button variant="danger" size="sm" className="rounded-xl">
                  <Power size={16} className="mr-2" />
                  {t('clear_cache')}
               </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 md:bottom-12 flex justify-end z-30 pointer-events-none">
        <Button 
            onClick={handleSave} 
            isLoading={saving}
            size="lg"
            className="shadow-2xl shadow-primary-600/40 rounded-full px-8 pointer-events-auto transform hover:scale-105 transition-all"
        >
            <Save size={20} className="mr-2" />
            {t('save')}
        </Button>
      </div>
    </div>
  );
};