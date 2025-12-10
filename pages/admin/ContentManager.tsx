import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, Eye, FileText, Check, X, Image as ImageIcon, Search as SearchIcon, PenTool, Settings, HelpCircle, Save, ChevronLeft } from 'lucide-react';
import { Page } from '../../types';
import { MediaSelector } from '../../components/media/MediaSelector';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Pagination } from '../../components/ui/Pagination';
import { TagInput } from '../../components/ui/TagInput';
import { PersianDatePicker } from '../../components/ui/PersianDatePicker';
import { Link } from 'react-router-dom';

export const ContentManager = () => {
  const { t, pages, addPage, updatePage, deletePage, config, isRTL } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Page>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editTab, setEditTab] = useState<'content' | 'settings' | 'faqs'>('content');

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredPages = pages.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const paginatedPages = filteredPages.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const startEdit = (page?: Page) => {
    setEditTab('content');
    if (page) {
      setEditForm(JSON.parse(JSON.stringify(page)));
    } else {
      setEditForm({
        title: '',
        slug: '',
        content: '',
        status: 'draft',
        featuredImage: '',
        excerpt: '',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        publishDate: new Date().toISOString(),
        faqs: [],
        schemaType: 'WebPage'
      });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.slug) return;

    const pageData: Page = {
      id: editForm.id || Date.now().toString(),
      title: editForm.title,
      slug: editForm.slug.toLowerCase().replace(/\s+/g, '-'),
      content: editForm.content || '',
      status: editForm.status as 'published' | 'draft',
      createdAt: editForm.publishDate || new Date().toISOString().split('T')[0],
      featuredImage: editForm.featuredImage,
      excerpt: editForm.excerpt,
      metaTitle: editForm.metaTitle,
      metaDescription: editForm.metaDescription,
      keywords: editForm.keywords,
      publishDate: editForm.publishDate,
      faqs: editForm.faqs,
      schemaType: editForm.schemaType
    };

    if (editForm.id) {
      updatePage(pageData);
    } else {
      addPage(pageData);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('delete') + '?')) {
      deletePage(id);
    }
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...(editForm.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setEditForm({ ...editForm, faqs: newFaqs });
  };

  const addFAQ = () => {
    setEditForm({ ...editForm, faqs: [...(editForm.faqs || []), { question: '', answer: '' }] });
  };

  const removeFAQ = (index: number) => {
    const newFaqs = [...(editForm.faqs || [])];
    newFaqs.splice(index, 1);
    setEditForm({ ...editForm, faqs: newFaqs });
  };

  // Modern Input Styles
  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:bg-white hover:border-gray-200 dark:hover:bg-gray-900 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-300 text-sm font-medium";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 ml-1";

  if (isEditing) {
    return (
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4">
            <button onClick={() => setIsEditing(false)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronLeft size={24} className="rtl:rotate-180" />
            </button>
            <h1 className="text-2xl font-black dark:text-white">
                {editForm.id ? t('edit') : t('add_page')}
            </h1>
        </div>

        {/* Modern Segmented Control Tabs */}
        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl flex relative overflow-hidden w-full md:w-auto">
             {['content', 'settings', 'faqs'].map((tab) => (
                 <button
                    key={tab}
                    onClick={() => setEditTab(tab as any)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${
                        editTab === tab 
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                 >
                    {t(tab === 'content' ? 'content' : tab === 'settings' ? 'post_settings' : 'faqs')}
                 </button>
             ))}
        </div>

        <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
            {editTab === 'content' && (
                <>
                    <Card className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('title')}</label>
                                <input 
                                    type="text" 
                                    value={editForm.title}
                                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                                    className={inputClass}
                                    placeholder={t('example_title')}
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('slug')}</label>
                                <input 
                                    type="text" 
                                    value={editForm.slug}
                                    onChange={e => setEditForm({...editForm, slug: e.target.value})}
                                    className={inputClass}
                                    placeholder={t('example_slug')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('status')}</label>
                                <div className="relative">
                                    <select 
                                        value={editForm.status}
                                        onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        <option value="draft">{t('draft')}</option>
                                        <option value="published">{t('published')}</option>
                                    </select>
                                    <div className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>{t('featured_image')}</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={editForm.featuredImage || ''}
                                        onChange={e => setEditForm({...editForm, featuredImage: e.target.value})}
                                        className={inputClass}
                                        placeholder="https://..."
                                    />
                                    <Button type="button" variant="secondary" size="icon" onClick={() => setShowMediaModal(true)} className="rounded-2xl shrink-0">
                                        <ImageIcon size={20} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {editForm.featuredImage && (
                            <div className="relative rounded-3xl overflow-hidden h-48 w-full md:w-80 border-4 border-gray-100 dark:border-gray-800 shadow-md">
                                <img src={editForm.featuredImage} alt="Preview" className="h-full w-full object-cover" />
                                <button 
                                    type="button" 
                                    onClick={() => setEditForm({...editForm, featuredImage: ''})}
                                    className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>{t('excerpt')}</label>
                            <textarea 
                                value={editForm.excerpt || ''}
                                onChange={e => setEditForm({...editForm, excerpt: e.target.value})}
                                className={`${inputClass} h-32 resize-none`}
                            />
                        </div>
                    </Card>
                    
                    <Card className="p-6 shadow-md">
                        <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                            <label className={labelClass}>{t('content')}</label>
                        </div>
                        <div className="min-h-[500px]">
                            <RichTextEditor 
                                key={editForm.id || 'new'}
                                id="page-content-editor"
                                value={editForm.content || ''}
                                onChange={(content) => setEditForm({...editForm, content})}
                                height={500}
                            />
                        </div>
                    </Card>
                </>
            )}

            {editTab === 'settings' && (
                <div className="space-y-6">
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">{t('serp_preview')}</h3>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm max-w-xl">
                            <div className="flex flex-col font-sans ltr text-left">
                                <span className="text-sm text-[#202124] flex items-center gap-2 mb-1">
                                    <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
                                        {config.siteName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-sm text-[#202124] leading-tight">{config.siteName}</span>
                                       <span className="text-xs text-gray-500 leading-tight">{window.location.host} › {editForm.slug || 'page-slug'}</span>
                                    </div>
                                </span>
                                <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-medium mt-1">
                                    {editForm.metaTitle || editForm.title || 'Page Title'}
                                </h3>
                                <p className="text-sm text-[#4d5156] line-clamp-2 mt-1">
                                    {editForm.metaDescription || editForm.excerpt || t('meta_desc_placeholder')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Card className="space-y-6">
                        <div>
                            <label className={labelClass}>{t('meta_title')}</label>
                            <input 
                                type="text" 
                                value={editForm.metaTitle || ''}
                                onChange={e => setEditForm({...editForm, metaTitle: e.target.value})}
                                className={inputClass}
                                placeholder={editForm.title}
                            />
                        </div>
                        
                        <div>
                            <label className={labelClass}>{t('meta_desc')}</label>
                            <textarea 
                                value={editForm.metaDescription || ''}
                                onChange={e => setEditForm({...editForm, metaDescription: e.target.value})}
                                className={`${inputClass} h-24 resize-none`}
                                placeholder={editForm.excerpt}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('keywords')}</label>
                            <TagInput 
                            value={editForm.keywords || []}
                            onChange={keywords => setEditForm({...editForm, keywords})}
                            placeholder={t('keywords_hint')}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('schema_type')}</label>
                            <div className="relative">
                                <select 
                                    value={editForm.schemaType || 'WebPage'}
                                    onChange={e => setEditForm({...editForm, schemaType: e.target.value as any})}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    <option value="WebPage">WebPage</option>
                                    <option value="AboutPage">AboutPage</option>
                                    <option value="ContactPage">ContactPage</option>
                                    <option value="LandingPage">LandingPage</option>
                                </select>
                                <div className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronLeft size={16} className="-rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <PersianDatePicker 
                                label={t('publish_date')}
                                value={editForm.publishDate}
                                onChange={isoDate => setEditForm({...editForm, publishDate: isoDate})}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {editTab === 'faqs' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold dark:text-white px-2 text-lg">{t('faqs')}</h3>
                    </div>

                    {(!editForm.faqs || editForm.faqs.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <HelpCircle size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">No FAQs added yet.</p>
                            <Button type="button" variant="ghost" size="sm" onClick={addFAQ} className="mt-4 text-primary-600 bg-white shadow-sm">
                                {t('add_faq')}
                            </Button>
                        </div>
                    )}

                    {editForm.faqs?.map((faq, index) => (
                        <Card key={index} className="relative group !p-6 border-l-4 border-l-primary-500">
                            <button 
                                type="button" 
                                onClick={() => removeFAQ(index)}
                                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                            >
                                <X size={18} />
                            </button>
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className={labelClass}>{t('question')}</label>
                                    <input 
                                        type="text" 
                                        value={faq.question}
                                        onChange={e => handleFAQChange(index, 'question', e.target.value)}
                                        className={inputClass}
                                        placeholder={t('example_question')}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>{t('answer')}</label>
                                    <textarea 
                                        value={faq.answer}
                                        onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                                        className={`${inputClass} h-24 resize-none`}
                                        placeholder={t('example_answer')}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                    
                    {editForm.faqs && editForm.faqs.length > 0 && (
                        <Button type="button" variant="secondary" onClick={addFAQ} className="w-full rounded-2xl border-dashed border-2 py-4 justify-center">
                            <Plus size={20} className="mr-2" /> {t('add_faq')}
                        </Button>
                    )}
                </div>
            )}

            {/* Sticky Mobile Action Bar */}
            <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 md:bottom-12 flex justify-end z-30 pointer-events-none">
                <Button 
                    onClick={handleSave} 
                    size="lg" 
                    className="shadow-2xl shadow-primary-600/40 rounded-full px-8 pointer-events-auto transform hover:scale-105 transition-all"
                >
                    <Save size={20} className="mr-2" />
                    {t('save')}
                </Button>
            </div>
        </form>
        
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

  // --- List View ---
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black dark:text-white">{t('pages')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
              <input 
                  type="text" 
                  placeholder={t('search_placeholder_admin')}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-3.5 rounded-2xl border-none bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-4">
                  <SearchIcon size={20} />
              </div>
          </div>
          <Button onClick={() => startEdit()} size="lg" className="rounded-2xl">
            <Plus size={20} className="mr-2" />
            {t('add_page')}
          </Button>
      </div>

      {/* Modern Card List for Mobile / Table for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
          {paginatedPages.map((page) => (
              <div key={page.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-transparent dark:border-gray-700/50 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                              {page.featuredImage ? (
                                  <img src={page.featuredImage} alt="" className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                  <FileText size={24} />
                              )}
                          </div>
                          <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{page.title}</h3>
                              <p className="text-xs text-gray-500 font-mono">/{page.slug}</p>
                          </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                          ${page.status === 'published' 
                              ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                              : 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                          }`}>
                          {t(page.status)}
                      </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="text-xs text-gray-400">
                          {new Date(page.createdAt).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US')}
                      </div>
                      <div className="flex gap-2">
                          <Link to={`/${page.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                              <Eye size={18} />
                          </Link>
                          <button onClick={() => startEdit(page)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                              <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(page.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {filteredPages.length === 0 && (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">{t('no_results')}</p>
          </div>
      )}

      <Pagination 
            totalItems={filteredPages.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
      />
    </div>
  );
};