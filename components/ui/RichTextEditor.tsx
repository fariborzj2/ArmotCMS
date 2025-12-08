import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

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
  const { themeMode } = useApp();
  const editorRef = useRef<any>(null);

  // Sync value updates from parent if editor is ready and content is different
  useEffect(() => {
    if (editorRef.current) {
       const currentContent = editorRef.current.getContent();
       // Only set content if it's strictly different to avoid cursor jumping
       // and loops. 
       if (value !== currentContent) {
          // Check if the editor is focused to avoid disrupting user typing
          // Only update if value is externally changed (e.g. loading data)
          // For simplicity in this CMS, we trust the key prop in parent to handle
          // major state changes (switching pages) and this effect handles 
          // initial load latency.
          editorRef.current.setContent(value || '');
       }
    }
  }, [value]);

  useEffect(() => {
    if (typeof tinymce === 'undefined') {
      console.error('TinyMCE not loaded');
      return;
    }

    const isDark = themeMode === 'dark';

    // Ensure any previous instance is removed before initializing
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
    });

    return () => {
      try {
        if (tinymce) tinymce.remove(`#${id}`);
        editorRef.current = null;
      } catch (e) {
        console.error('Error removing editor', e);
      }
    };
  }, [id, themeMode]); // Re-init if ID or Theme changes

  return (
    <textarea 
      id={id} 
      // Do not use defaultValue/value here to avoid React warnings vs TinyMCE DOM manipulation
      style={{ visibility: 'visible' }} 
      placeholder={placeholder}
    ></textarea>
  );
};