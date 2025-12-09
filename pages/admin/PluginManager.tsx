
import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Box, Download, Trash2, ToggleRight, ToggleLeft, ShieldCheck, Zap } from 'lucide-react';
import { Plugin } from '../../types';

export const PluginManager = () => {
  const { t, plugins, togglePlugin, installPlugin, deletePlugin } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate plugin upload/installation
      alert(`${t('plugin_uploaded')}: ${file.name}`);
      
      // In a real app, you would parse the file and add it to the plugins list here.
      // For demo, we just clear the input.
      if (e.target) e.target.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (plugin: Plugin) => {
    // Simulate generating a full installation package with source files
    const packageData = {
      meta: {
        generatedAt: new Date().toISOString(),
        cmsVersion: '2.0.0'
      },
      manifest: {
        ...plugin,
        permissions: ['read_posts', 'write_settings']
      },
      files: {
        'package.json': JSON.stringify({
          name: plugin.id,
          version: plugin.version,
          description: plugin.description,
          author: plugin.author,
          main: "index.js"
        }, null, 2),
        'index.js': `/**\n * ${plugin.name} - v${plugin.version}\n * Author: ${plugin.author}\n */\n\nexport default function init(context) {\n  console.log("Plugin ${plugin.id} initialized successfully.");\n  // Plugin logic goes here\n}`,
        'README.md': `# ${plugin.name}\n\n${plugin.description}\n\n## Installation\nGo to Admin > Plugins > Upload Plugin and select this package.\n\n## Usage\nEnable the plugin from the manager.`,
        'assets/style.css': `.plugin-${plugin.id} { display: block; padding: 10px; border: 1px solid #ccc; }`
      },
      checksum: `sha256-mock-${Date.now()}-${plugin.id}`
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packageData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${plugin.id}-v${plugin.version}-package.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('plugin_manager')}</h1>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpload}
                accept=".zip,.json"
            />
            <Button variant="primary" onClick={triggerUpload}>
            <Box size={18} className="mr-2" />
            {t('upload_plugin')}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="flex flex-col h-full relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${plugin.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${plugin.type === 'core' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                    {plugin.type === 'core' ? <ShieldCheck size={24} /> : <Zap size={24} />}
                 </div>
                 <div>
                   <h3 className="font-bold text-lg dark:text-white">{plugin.name}</h3>
                   <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">v{plugin.version}</span>
                 </div>
               </div>
               
               {plugin.installed && (
                 <button 
                  onClick={() => togglePlugin(plugin.id)}
                  className={`text-2xl transition-colors ${plugin.active ? 'text-green-500' : 'text-gray-400'}`}
                 >
                   {plugin.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                 </button>
               )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 mb-6">
              {plugin.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
               <span className="text-xs text-gray-400">{plugin.author}</span>
               
               <div className="flex gap-2">
                 {!plugin.installed ? (
                   <Button size="sm" onClick={() => installPlugin(plugin.id)} className="text-xs py-1.5 h-auto">
                     <Download size={14} className="mr-1" /> {t('install')}
                   </Button>
                 ) : (
                   <>
                     <Button 
                        variant="secondary" 
                        className="text-xs py-1.5 h-auto px-2"
                        onClick={() => handleDownload(plugin)}
                        title={t('download')}
                     >
                       <Download size={14} />
                     </Button>
                     <Button 
                      variant="danger" 
                      className="text-xs py-1.5 h-auto px-2"
                      onClick={() => deletePlugin(plugin.id)}
                      disabled={plugin.type === 'core'} // Prevent deleting core plugins
                      title={plugin.type === 'core' ? "Cannot delete core plugins" : t('delete')}
                     >
                       <Trash2 size={14} />
                     </Button>
                   </>
                 )}
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
