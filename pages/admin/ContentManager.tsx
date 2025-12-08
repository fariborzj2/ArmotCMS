
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, Eye, FileText, Check, X, Image as ImageIcon, Search as SearchIcon } from 'lucide-react';
import { Page } from '../../types';
import { MediaSelector } from '../../components/media/MediaSelector';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Pagination } from '../../components/ui/Pagination';

export const ContentManager = () => {
  const { t, pages, addPage, updatePage, deletePage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Page>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPages = pages.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const paginatedPages = filteredPages.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const startEdit = (page?: Page) => {
    if (page) {
      setEditForm(page);
    } else {
      setEditForm({
        title: '',
        slug: '',
        content: '',
        status: 'draft',
        featuredImage: ''
      });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.slug) return;

    if (editForm.id) {
      updatePage(editForm as Page);
    } else {
      const newPage: Page = {
        id: Date.now().toString(),
        title: editForm.title!,
        slug: editForm.slug!.toLowerCase().replace(/\s+/g, '-'),
        content: editForm.content || '',
        status: editForm.status as 'published' | 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        featuredImage: editForm.featuredImage
      };
      addPage(newPage);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('delete') + '?')) {
      deletePage(id);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">
          {editForm.id ? t('edit') : t('add_page')}
        </h1>
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('slug')}</label>
                <input 
                  type="text" 
                  value={editForm.slug}
                  onChange={e => setEditForm({...editForm, slug: e.target.value})}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('featured_image')}</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={editForm.featuredImage || ''}
                  onChange={e => setEditForm({...editForm, featuredImage: e.target.value})}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaModal(true)}>
                  <ImageIcon size={18} />
                </Button>
              </div>
              {editForm.featuredImage && (
                <img src={editForm.featuredImage} alt="Preview" className="h-20 w-auto object-cover rounded mt-2 border border-gray-200 dark:border-gray-700" />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content')}</label>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <RichTextEditor 
                  key={editForm.id || 'new'}
                  id="page-content-editor"
                  value={editForm.content || ''}
                  onChange={(content) => setEditForm({...editForm, content})}
                  height={500}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
              <select 
                value={editForm.status}
                onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
              >
                <option value="draft">{t('draft')}</option>
                <option value="published">{t('published')}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </form>
        </Card>
        
        {showMediaModal && (
            <MediaSelector 
              context="page"
              onClose={() => setShowMediaModal(false)}
              onSelect={(url) => {
                setEditForm(prev => ({ ...prev, featuredImage: url }));
              }}
            />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('pages')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative">
              <input 
                  type="text" 
                  placeholder={t('search_placeholder_admin')}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white w-full md:w-64"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Button onClick={() => startEdit()}>
            <Plus size={18} className="mr-2" />
            {t('add_page')}
          </Button>
      </div>

      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-700 overflow-hidden">
        <div className="">
          <table className="w-full text-left rtl:text-right block md:table">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">{t('title')}</th>
                <th className="px-6 py-3">{t('slug')}</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3 text-right rtl:text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedPages.map((page) => (
                <tr key={page.id} className="block md:table-row bg-white dark:bg-gray-800 md:bg-transparent rounded-xl shadow-sm md:shadow-none border border-gray-200 dark:border-gray-700 md:border-none p-4 md:p-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 font-medium dark:text-white flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('title')}</span>
                    <div className="flex items-center gap-2">
                       <FileText size={16} className="text-primary-500" />
                       {page.title}
                       {page.featuredImage && <ImageIcon size={14} className="text-gray-400" />}
                    </div>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 font-mono text-xs flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold font-sans">{t('slug')}</span>
                    /{page.slug}
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('status')}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${page.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {page.status === 'published' ? <Check size={10} /> : <X size={10} />}
                      {t(page.status)}
                    </span>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-right rtl:text-left flex justify-between items-center md:block">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('actions')}</span>
                    <div className="flex items-center justify-end gap-2">
                      <a href={`#/${page.slug}`} target="_blank" className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                        <Eye size={16} />
                      </a>
                      <button onClick={() => startEdit(page)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPages.length === 0 && (
                <tr className="block md:table-row">
                  <td colSpan={4} className="block md:table-cell px-6 py-8 text-center text-gray-500">
                    {t('no_results')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination 
            totalItems={filteredPages.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
      />
    </div>
  );
};
