import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Layout, Check, Palette, Monitor, Smartphone, Type, Grid, Square } from 'lucide-react';
import { LayoutTheme } from '../../types';

export const ThemeManager = () => {
  const { t, config, updateConfig } = useApp();
  const [selectedRadius, setSelectedRadius] = useState(config.uiRadius || 'md');
  const [selectedFont, setSelectedFont] = useState(config.uiFont || 'estedad');
  const [layoutDensity, setLayoutDensity] = useState(config.uiDensity || 'comfortable');

  const themes: {id: LayoutTheme, name: string, color: string}[] = [
    { id: 'modern', name: 'Armot Modern', color: 'bg-indigo-500' },
    { id: 'minimal', name: 'Clean Slate', color: 'bg-gray-500' },
    { id: 'classic', name: 'Classic Enterprise', color: 'bg-blue-600' },
  ];

  const handleSave = () => {
    updateConfig({
        uiRadius: selectedRadius as any,
        uiFont: selectedFont as any,
        uiDensity: layoutDensity as any
    });
    alert(t('success'));
  };

  // Visual component for theme preview
  const ThemePreview = ({ themeId }: { themeId: string }) => {
      const isModern = themeId === 'modern';
      const isClassic = themeId === 'classic';
      const isMinimal = themeId === 'minimal';

      return (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-900 relative p-3 flex gap-2 overflow-hidden pointer-events-none select-none">
              {/* Sidebar (Modern only) */}
              {isModern && (
                  <div className="w-1/4 h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col gap-2 p-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-2"></div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
              )}

              <div className="flex-1 flex flex-col gap-3 h-full">
                  {/* Header */}
                  <div className={`w-full h-8 rounded-lg shadow-sm flex items-center px-2 justify-between ${isClassic ? 'bg-blue-600' : 'bg-white dark:bg-gray-800'}`}>
                      {!isClassic && <div className="w-1/3 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>}
                      {isClassic && (
                          <div className="flex gap-2">
                              <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                              <div className="w-16 h-2 bg-white/20 rounded"></div>
                          </div>
                      )}
                      <div className="flex gap-1">
                          <div className={`w-4 h-4 rounded-full ${isClassic ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                      </div>
                  </div>

                  {/* Content Area */}
                  {isMinimal ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-4">
                          <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                  ) : (
                      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
                          <div className="flex gap-3 mb-3">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"></div>
                              <div className="flex-1 flex flex-col justify-center gap-2">
                                  <div className="w-1/3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                  <div className="w-1/4 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <div className="w-full h-2 bg-gray-100 dark:bg-gray-900 rounded"></div>
                              <div className="w-full h-2 bg-gray-100 dark:bg-gray-900 rounded"></div>
                              <div className="w-2/3 h-2 bg-gray-100 dark:bg-gray-900 rounded"></div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold dark:text-white mb-2">{t('theme_manager')}</h1>
        <p className="text-gray-500">{t('frontend_theme')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div 
            key={theme.id}
            onClick={() => updateConfig({ activeTheme: theme.id })}
            className={`cursor-pointer group relative rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white dark:bg-gray-900 ${
              config.activeTheme === theme.id 
                ? 'border-primary-500 shadow-lg ring-2 ring-primary-200 dark:ring-primary-900' 
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Visual Preview */}
            <div className="h-48 relative border-b border-gray-100 dark:border-gray-800">
               <ThemePreview themeId={theme.id} />
               
               {config.activeTheme === theme.id && (
                 <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center animate-fadeIn">
                    <div className="bg-primary-500 text-white rounded-full p-2 shadow-lg">
                       <Check size={24} />
                    </div>
                 </div>
               )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  {theme.name}
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 font-normal">v1.0</span>
              </h3>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-8 border-t-4 border-t-primary-500">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-lg">
                <Palette size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold dark:text-white">{t('customize_styles')}</h3>
                <p className="text-sm text-gray-500">{t('customize_desc')}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary Color */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{t('primary_color')}</label>
                <div className="flex gap-3 flex-wrap">
                    {[
                        { name: 'blue', class: 'bg-blue-500' },
                        { name: 'indigo', class: 'bg-indigo-500' },
                        { name: 'purple', class: 'bg-purple-500' },
                        { name: 'rose', class: 'bg-rose-500' },
                        { name: 'amber', class: 'bg-amber-500' },
                        { name: 'emerald', class: 'bg-emerald-500' },
                    ].map((c) => (
                        <button 
                            key={c.name} 
                            className={`${c.class} w-10 h-10 rounded-xl ring-2 ring-offset-2 ring-transparent hover:ring-gray-300 dark:ring-offset-gray-900 transition-all shadow-sm focus:outline-none focus:ring-primary-500`}
                            aria-label={c.name}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Border Radius */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Square size={16} className="text-gray-400" />
                    {t('border_radius')}
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {['sm', 'md', 'lg', 'full'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setSelectedRadius(r)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                selectedRadius === r 
                                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {t(`radius_${r}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Family */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Type size={16} className="text-gray-400" />
                    {t('font_family')}
                </label>
                <div className="space-y-2">
                    {['estedad', 'vazir', 'inter'].map((f) => (
                        <div 
                            key={f} 
                            onClick={() => setSelectedFont(f)}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedFont === f 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <span className="text-sm font-medium">{t(`font_${f}`)}</span>
                            {selectedFont === f && <Check size={16} className="text-primary-500" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Layout Density */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Grid size={16} className="text-gray-400" />
                    {t('layout_density')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['compact', 'comfortable'].map((d) => (
                        <button
                            key={d}
                            onClick={() => setLayoutDensity(d)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                layoutDensity === d 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            {t(`density_${d}`)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button 
                onClick={handleSave}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
            >
                <Check size={18} />
                {t('apply_changes')}
            </button>
        </div>
      </Card>
    </div>
  );
};