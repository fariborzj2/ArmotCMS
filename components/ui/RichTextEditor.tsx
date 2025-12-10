import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Type } from 'lucide-react';

declare var tinymce: any;

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  id, 
  value, 
  onChange, 
  height = 400,
  placeholder 
}) => {
  const { themeMode, t } = useApp();
  const editorRef = useRef<any>(null);
  const [isBasicMode, setIsBasicMode] = useState(false);
  const [initError, setInitError] = useState(false);

  // Sync value updates from parent
  useEffect(() => {
    if (!isBasicMode && editorRef.current) {
       const currentContent = editorRef.current.getContent();
       if (value !== currentContent) {
          editorRef.current.setContent(value || '');
       }
    }
  }, [value, isBasicMode]);

  useEffect(() => {
    if (isBasicMode) {
      if (tinymce && tinymce.get(id)) tinymce.remove(`#${id}`);
      return;
    }

    if (typeof tinymce === 'undefined') {
      console.error('TinyMCE not loaded');
      setInitError(true);
      setIsBasicMode(true);
      return;
    }

    const isDark = themeMode === 'dark';

    // Cleanup previous instance
    if (tinymce.get(id)) {
      tinymce.remove(`#${id}`);
    }

    tinymce.init({
      selector: `#${id}`,
      height: height,
      menubar: true,
      directionality: 'rtl',
      skin: isDark ? 'oxide-dark' : 'oxide',
      content_css: isDark ? 'dark' : 'default',
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'directionality'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor backcolor | alignleft aligncenter ' +
        'alignright alignjustify | ltr rtl | bullist numlist outdent indent | ' +
        'link image | removeformat | help',
      content_style: `
        body { font-family: Estedad, Vazirmatn, Helvetica, Arial, sans-serif; font-size: 14px; }
        .dark body { background-color: #030712; color: #f9fafb; }
      `,
      setup: (editor: any) => {
        editorRef.current = editor;
        editor.on('Change KeyUp', () => {
          onChange(editor.getContent());
        });
        editor.on('init', () => {
            if (value) {
                editor.setContent(value);
            }
        });
      }
    }).catch((err: any) => {
        console.warn("TinyMCE initialization failed:", err);
        setInitError(true);
        setIsBasicMode(true);
    });

    return () => {
      try {
        if (tinymce) tinymce.remove(`#${id}`);
        editorRef.current = null;
      } catch (e) {
        console.error('Error removing editor', e);
      }
    };
  }, [id, themeMode, isBasicMode]);

  return (
    <div className="relative">
        <div className="flex justify-end mb-2">
            <button 
                type="button" 
                onClick={() => setIsBasicMode(!isBasicMode)}
                className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
                {isBasicMode ? <FileText size={14} /> : <Type size={14} />}
                {isBasicMode ? 'Switch to Visual Editor' : 'Switch to Text Editor'}
            </button>
        </div>

        {isBasicMode ? (
            <div className="animate-fadeIn">
                {initError && (
                    <div className="mb-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-900/50">
                        Visual editor failed to load (likely due to browser restrictions). Switched to text mode.
                    </div>
                )}
                <textarea
                    className="w-full p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed"
                    style={{ height: height }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
        ) : (
            <textarea 
                id={id} 
                style={{ visibility: 'hidden' }} 
                placeholder={placeholder}
            ></textarea>
        )}
    </div>
  );
};