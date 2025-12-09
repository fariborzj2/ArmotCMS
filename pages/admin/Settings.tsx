

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Save, Server, Globe, Power, Code, Search, Mail, Phone, MapPin, Layers } from 'lucide-react';
import { generateSitemap } from '../../utils/seo';

// Reusable Setting Field with Hint
const SettingField = ({ label, hint, children }: { label: string, hint: string, children?: React.ReactNode }) => (
  <div className="mb-6 last:mb-0">
    <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
      {label}
    </label>
    {children}
    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 inline-block"></span>
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

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
        activeTab === id 
          ? 'border-primary-600 text-primary-600' 
          : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('settings')}</h1>
        <Button onClick={handleSave} isLoading={saving}>
          <Save size={18} className="mr-2" />
          {t('save')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-lg px-2 shadow-sm">
        <TabButton id="general" label={t('tab_general')} icon={Globe} />
        <TabButton id="contact" label={t('tab_contact')} icon={Mail} />
        <TabButton id="seo" label={t('tab_seo')} icon={Search} />
        <TabButton id="advanced" label={t('tab_advanced')} icon={Server} />
      </div>

      <div className="animate-fadeIn">
        {activeTab === 'general' && (
          <Card>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              <Globe size={20} className="text-primary-500" />
              {t('general_settings')}
            </h3>
            
            <SettingField label={t('site_name')} hint={t('hint_site_name')}>
              <input 
                type="text" 
                value={localConfig.siteName}
                onChange={(e) => setLocalConfig({...localConfig, siteName: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-shadow"
              />
            </SettingField>

            <SettingField label={t('site_desc')} hint={t('hint_site_desc')}>
              <textarea 
                value={localConfig.siteDescription}
                onChange={(e) => setLocalConfig({...localConfig, siteDescription: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white h-24 focus:ring-2 focus:ring-primary-500 transition-shadow"
              />
            </SettingField>

            <SettingField label={t('maintenance_mode')} hint={t('hint_maintenance_mode')}>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setLocalConfig({...localConfig, maintenanceMode: !localConfig.maintenanceMode})}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${localConfig.maintenanceMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${localConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className={`text-sm font-medium ${localConfig.maintenanceMode ? 'text-orange-600' : 'text-gray-500'}`}>
                  {localConfig.maintenanceMode ? t('active') : t('inactive')}
                </span>
              </div>
            </SettingField>
          </Card>
        )}

        {activeTab === 'contact' && (
          <Card>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              <Mail size={20} className="text-blue-500" />
              {t('tab_contact')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField label={t('contact_email')} hint={t('hint_contact_email')}>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400">
                     <Mail size={16} />
                   </div>
                   <input 
                    type="email" 
                    value={localConfig.contactEmail || ''}
                    onChange={(e) => setLocalConfig({...localConfig, contactEmail: e.target.value})}
                    className="w-full pl-10 rtl:pl-3 rtl:pr-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                   />
                 </div>
              </SettingField>

              <SettingField label={t('contact_phone')} hint={t('hint_contact_phone')}>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400">
                     <Phone size={16} />
                   </div>
                   <input 
                    type="text" 
                    value={localConfig.contactPhone || ''}
                    onChange={(e) => setLocalConfig({...localConfig, contactPhone: e.target.value})}
                    className="w-full pl-10 rtl:pl-3 rtl:pr-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                   />
                 </div>
              </SettingField>
            </div>

            <SettingField label={t('contact_address')} hint={t('hint_contact_address')}>
              <div className="relative">
                 <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={16} />
                 </div>
                 <textarea 
                  value={localConfig.contactAddress || ''}
                  onChange={(e) => setLocalConfig({...localConfig, contactAddress: e.target.value})}
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white h-20"
                 />
              </div>
            </SettingField>
          </Card>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
             <Card>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                   <Search size={20} className="text-purple-500" />
                   {t('tab_seo')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SettingField label={t('seo_separator')} hint={t('hint_seo_separator')}>
                      <select 
                        value={localConfig.seoTitleSeparator || '|'}
                        onChange={(e) => setLocalConfig({...localConfig, seoTitleSeparator: e.target.value})}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                      >
                         <option value="|">| (Pipe)</option>
                         <option value="-">- (Dash)</option>
                         <option value="•">• (Bullet)</option>
                      </select>
                   </SettingField>

                   <SettingField label={t('enable_sitemap')} hint={t('hint_enable_sitemap')}>
                      <div className="flex items-center gap-4 mt-2">
                        <button 
                          onClick={() => setLocalConfig({...localConfig, enableSitemap: !localConfig.enableSitemap})}
                          className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${localConfig.enableSitemap ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${localConfig.enableSitemap ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                   </SettingField>
                </div>
             </Card>

             <Card>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                  <Code size={20} className="text-gray-500" />
                  XML Sitemap
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 flex items-center justify-between">
                    <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      https://your-site.com/sitemap.xml
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setShowSitemap(!showSitemap)}>
                      {showSitemap ? 'Hide XML' : t('view_sitemap')}
                    </Button>
                </div>

                {showSitemap && (
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-gray-700">
                      <pre>{sitemapXml}</pre>
                    </div>
                )}
             </Card>
          </div>
        )}

        {activeTab === 'advanced' && (
          <Card>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              <Server size={20} className="text-red-500" />
              {t('tab_advanced')}
            </h3>

            <SettingField label={t('cache_driver')} hint={t('hint_cache_driver')}>
              <select 
                value={localConfig.cacheDriver}
                onChange={(e) => setLocalConfig({...localConfig, cacheDriver: e.target.value as any})}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
              >
                <option value="memory">Memory (RAM - Safe)</option>
                <option value="file">File System (LocalStorage)</option>
                <option value="redis">Redis (High Performance)</option>
                <option value="memcached">Memcached</option>
              </select>
            </SettingField>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-lg mb-6 border border-blue-100 dark:border-blue-900/50">
               <strong>System Status:</strong> Cache is currently Active using the <u>{localConfig.cacheDriver}</u> driver.
            </div>

            <hr className="my-6 border-gray-100 dark:border-gray-800" />

            <div className="flex justify-between items-center">
               <div>
                  <h4 className="font-bold text-red-600 dark:text-red-400">{t('clear_cache')}</h4>
                  <p className="text-xs text-gray-500">{t('hint_clear_cache')}</p>
               </div>
               <Button variant="danger" size="sm">
                  <Power size={16} className="mr-2" />
                  {t('clear_cache')}
               </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};