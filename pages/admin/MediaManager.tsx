
import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Upload, Trash2, File, Image, Folder, ChevronRight, Home, Search as SearchIcon } from 'lucide-react';
import { MediaFile } from '../../types';
import { formatDate } from '../../utils/date';
import { generateMediaPath } from '../../utils/upload';
import { Pagination } from '../../components/ui/Pagination';

export const MediaManager = () => {
  const { t, media, addMedia, deleteMedia, lang } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeContext, setActiveContext] = useState<'all' | 'blog' | 'user' | 'page' | 'general'>('all');

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generate standard folder structure based on available contexts
  const folders = [
      { id: 'all', label: t('folder_all'), icon: Home },
      { id: 'general', label: t('folder_general'), icon: Folder },
      { id: 'blog', label: t('folder_blog'), icon: Folder },
      { id: 'user', label: t('folder_user'), icon: Folder },
      { id: 'page', label: t('folder_page'), icon: Folder },
  ];

  const filteredMedia = media.filter(m => {
      const contextMatch = activeContext === 'all' || m.context === activeContext;
      const searchMatch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return contextMatch && searchMatch;
  });

  const paginatedMedia = filteredMedia.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // If 'all' is selected, default to 'general', otherwise use active context
      const uploadContext = activeContext === 'all' ? 'general' : activeContext;
      const { path, folder } = generateMediaPath(file.name, uploadContext);

      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file), // Local blob for demo
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toISOString(),
        folder: folder,
        context: uploadContext,
        path: path
      };
      addMedia(newFile);
      
      // Safely reset input to allow re-uploading same file
      try {
        if(e.target) e.target.value = '';
      } catch (err) {
        // Ignore security error
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('media')}</h1>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpload}
                accept="image/*,application/pdf"
            />
            <Button onClick={triggerUpload}>
            <Upload size={18} className="mr-2" />
            {t('upload_file')}
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <Card className="w-full md:w-64 p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
            <h3 className="font-bold text-gray-500 text-xs uppercase mb-2">{t('category')}</h3>
            {folders.map(f => (
                <button
                    key={f.id}
                    onClick={() => { setActiveContext(f.id as any); setCurrentPage(1); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeContext === f.id 
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <f.icon size={18} className={activeContext === f.id ? 'text-primary-500' : 'text-gray-400'} />
                    {f.label}
                    {f.id !== 'all' && (
                        <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-1.5 rounded-full text-gray-500">
                           {media.filter(m => m.context === f.id).length}
                        </span>
                    )}
                </button>
            ))}
        </Card>

        {/* Browser */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded flex items-center gap-1 w-full md:w-auto">
                    <Folder size={12} />
                    {activeContext === 'all' ? t('root_folder') : `${t('path_upload')} / ${t(`folder_${activeContext}`)}`}
                </div>
                <div className="relative w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder={t('search_placeholder_admin')}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-4 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white w-full md:w-48"
                    />
                    <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {paginatedMedia.map((file) => (
                    <Card key={file.id} className="p-0 overflow-hidden group relative border-none">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {file.type === 'image' ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                            <File size={48} className="text-gray-400" />
                        )}
                        </div>
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="danger" size="sm" onClick={() => deleteMedia(file.id)}>
                            <Trash2 size={16} />
                        </Button>
                        </div>

                        <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-medium truncate dark:text-white" title={file.name}>{file.name}</p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] text-gray-500">{file.size}</p>
                            {file.folder && <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-500 truncate max-w-[50%]">{file.folder.split('/')[1]}</span>}
                        </div>
                        </div>
                    </Card>
                    ))}
                </div>

                {filteredMedia.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Image size={32} />
                    </div>
                    <p className="text-gray-500">{t('no_files')}</p>
                    <Button variant="ghost" onClick={triggerUpload} className="mt-4">
                        {t('upload_to')} {activeContext === 'all' ? t('folder_general') : t(`folder_${activeContext}`)}
                    </Button>
                    </div>
                )}

                 <Pagination 
                    totalItems={filteredMedia.length} 
                    itemsPerPage={itemsPerPage} 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                />
            </div>
        </div>
      </div>
    </div>
  );
};
