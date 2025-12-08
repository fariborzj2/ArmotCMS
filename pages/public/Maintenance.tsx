import React from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, PenTool } from 'lucide-react';

export const Maintenance = () => {
  const { t, config } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 text-orange-600 dark:text-orange-500 animate-pulse">
        <PenTool size={48} />
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
        {t('maintenance_title')}
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg mb-8">
        {t('maintenance_desc')}
      </p>

      <div className="text-sm text-gray-400">
        &copy; {config.siteName}
      </div>
    </div>
  );
};