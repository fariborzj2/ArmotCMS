import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Layout, Check, Palette } from 'lucide-react';
import { LayoutTheme } from '../../types';

export const ThemeManager = () => {
  const { t, config, updateConfig } = useApp();

  const themes: {id: LayoutTheme, name: string, color: string}[] = [
    { id: 'modern', name: 'Armot Modern', color: 'bg-indigo-500' },
    { id: 'minimal', name: 'Clean Slate', color: 'bg-gray-500' },
    { id: 'classic', name: 'Classic Enterprise', color: 'bg-blue-600' },
  ];

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
            className={`cursor-pointer group relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              config.activeTheme === theme.id 
                ? 'border-primary-500 shadow-lg ring-2 ring-primary-200 dark:ring-primary-900' 
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Fake Preview */}
            <div className="bg-gray-100 dark:bg-gray-800 h-40 relative">
               <div className={`absolute top-0 left-0 w-full h-2 ${theme.color}`}></div>
               <div className="p-4 space-y-2 opacity-50">
                  <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
               </div>
               
               <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-900 p-2 rounded shadow">
                  <Layout size={20} className="text-gray-400" />
               </div>

               {config.activeTheme === theme.id && (
                 <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                    <div className="bg-primary-500 text-white rounded-full p-2">
                       <Check size={24} />
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{theme.name}</h3>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-8">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <Palette size={20} />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Customize Styles</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
            In a real application, this section would allow changing primary colors, fonts, and border radius via CSS variables injection.
        </p>

        <div className="flex gap-4">
            {['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'].map((color, idx) => (
                <button key={idx} className={`${color} w-8 h-8 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-gray-300 dark:ring-offset-gray-900 transition-all`}></button>
            ))}
        </div>
      </Card>
    </div>
  );
};