
import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, Upload, Server, Database, AlertTriangle } from 'lucide-react';
import { storage } from '../../utils/storage';

export const Tools = () => {
  const { t, restoreBackup } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    const json = storage.createBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `armot_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            if (confirm('Are you sure? This will overwrite all current data!')) {
                restoreBackup(event.target.result as string);
            }
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <Server className="text-primary-500" />
          {t('system_tools')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
                  <Database size={20} className="text-blue-500" />
                  {t('backup_restore')}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                  Create a full JSON backup of your database, including pages, posts, settings, and users.
              </p>
              
              <div className="flex flex-col gap-4">
                  <Button onClick={handleDownloadBackup} className="w-full justify-center">
                      <Download size={18} className="mr-2" />
                      {t('download_backup')}
                  </Button>
                  
                  <div className="relative">
                      <input 
                        type="file" 
                        ref={fileRef}
                        onChange={handleRestoreBackup}
                        accept="application/json"
                        className="hidden"
                      />
                      <Button variant="secondary" onClick={() => fileRef.current?.click()} className="w-full justify-center">
                          <Upload size={18} className="mr-2" />
                          {t('restore_backup')}
                      </Button>
                  </div>
              </div>
          </Card>

          <Card>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
                  <AlertTriangle size={20} className="text-orange-500" />
                  System Health
              </h3>
              <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">React Version</span>
                      <span className="font-mono dark:text-white">19.2.1</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">CMS Version</span>
                      <span className="font-mono dark:text-white">2.0.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Storage Used</span>
                      <span className="font-mono dark:text-white">~2.4 MB</span>
                  </div>
                  <div className="flex justify-between py-2">
                      <span className="text-gray-500">Status</span>
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">Healthy</span>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};
