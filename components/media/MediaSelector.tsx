

import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Image, File, Upload, Folder } from 'lucide-react';
import { MediaFile, MediaContext } from '../../types';
import { generateMediaPath } from '../../utils/upload';
import { Button } from '../ui/Button';

interface MediaSelectorProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  context?: MediaContext;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ onSelect, onClose, context = 'general' }) => {
  const { media, t, addMedia } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mediaContext = context as MediaContext;
      const { path, folder } = generateMediaPath(file.name, mediaContext);
      
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file), // Mock URL
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleDateString(),
        folder: folder,
        context: mediaContext,
        path: path
      };
      
      addMedia(newFile);
      
      // Safely reset input value
      try {
        if(e.target) e.target.value = '';
      } catch(err) {
        // Ignore SecurityError
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
              <h3 className="font-bold text-lg dark:text-white">{t('select_media')}</h3>
              <p className="text-xs text-gray-500">Uploading to: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">/upload/images/{context}/...</span></p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex justify-end">
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpload}
                accept="image/*,application/pdf"
            />
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                {t('upload_file')}
            </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Image size={48} className="mx-auto mb-4 opacity-20" />
              <p>No media files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((file) => (
                <div 
                  key={file.id} 
                  onClick={() => {
                    if (file.type === 'image') {
                        onSelect(file.url);
                        onClose();
                    }
                  }}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all ${file.type !== 'image' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                    {file.type === 'image' ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <File size={32} className="text-gray-400" />
                    )}
                    {/* Folder Badge */}
                    {file.context && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded flex items-center gap-0.5">
                            <Folder size={8} /> {file.context}
                        </div>
                    )}
                  </div>
                  <div className="p-2 text-xs truncate bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
