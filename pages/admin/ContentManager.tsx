import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, Eye, FileText, Check, X, Image as ImageIcon, Search as SearchIcon, PenTool, Settings, HelpCircle, Save, ChevronLeft, Globe, Link as LinkIcon } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginatedPages = filteredPages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startEdit = (page?: Page) => {
    if (page) {
      setEditForm(JSON.parse(JSON.stringify(page)));
    } else {
      setEditForm({
        title: '', slug: '', content: '', status: 'draft', featuredImage: '',
        excerpt: '', metaTitle: '', metaDescription: '', keywords: [],
        publishDate: new Date().toISOString(), faqs: [], schemaType: 'WebPage'
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
    if (editForm.id) updatePage(pageData);
    else addPage(pageData);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => { if (confirm(t('delete') + '?')) deletePage(id); };
  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...(editForm.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setEditForm({ ...editForm, faqs: newFaqs });
  };
  const addFAQ = () => { setEditForm({ ...editForm, faqs: [...(editForm.faqs || []), { question: '', answer: '' }] }); };
  const removeFAQ = (index: number) => {
    const newFaqs = [...(editForm.faqs || [])];
    newFaqs.splice(index, 1);
    setEditForm({ ...editForm, faqs: newFaqs });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-200 text-sm font-medium h-11";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="pb-12 animate-fadeIn">
        <div className="flex items-center gap-4 mb-6">
            <button type="button" onClick={() => setIsEditing(false)} className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronLeft size={20} className="rtl:rotate-180" />
            </button>
            <h1 className="text-2xl font-bold dark:text-white">{editForm.id ? t('edit') : t('add_page')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
                <Card>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>{t('title')}</label>
                            <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={`${inputClass} text-lg font-bold`} placeholder={t('example_title')} required />
                        </div>
                        <div>
                            <label className={labelClass}>{t('slug')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 rtl:pl-0 rtl:right-0 rtl:pr-3.5 flex items-center pointer-events-none text-gray-400"><Globe size={16} /></div>
                                <input type="text" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} className={`${inputClass} pl-10 rtl:pl-4 rtl:pr-10 font-mono text-xs`} placeholder={t('example_slug')} required />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <label className={labelClass}>{t('content')}</label>
                    </div>
                    <div className="flex-1">
                        <RichTextEditor key={editForm.id || 'new'} id="page-content-editor" value={editForm.content || ''} onChange={(content) => setEditForm({...editForm, content})} height={500} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                        <Settings size={18} className="text-primary-500" />
                        <h3 className="font-bold dark:text-white">{t('tab_seo')}</h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
                        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase">{t('serp_preview')}</h3>
                        <div className="bg-white p-4 rounded-xl shadow-sm max-w-lg border border-gray-100">
                            <div className="flex flex-col font-sans ltr text-left">
                                <span className="text-xs text-gray-500 truncate mb-1">{window.location.host} › {editForm.slug || 'slug'}</span>
                                <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">{editForm.metaTitle || editForm.title || 'Page Title'}</h3>
                                <p className="text-xs text-[#4d5156] line-clamp-2">{editForm.metaDescription || editForm.excerpt || t('meta_desc_placeholder')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>{t('excerpt')}</label>
                            <textarea value={editForm.excerpt || ''} onChange={e => setEditForm({...editForm, excerpt: e.target.value})} className={`${inputClass} h-24 py-3 resize-none`} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('meta_title')}</label>
                                <input type="text" value={editForm.metaTitle || ''} onChange={e => setEditForm({...editForm, metaTitle: e.target.value})} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t('meta_desc')}</label>
                                <input type="text" value={editForm.metaDescription || ''} onChange={e => setEditForm({...editForm, metaDescription: e.target.value})} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>{t('schema_type')}</label>
                            <select value={editForm.schemaType || 'WebPage'} onChange={e => setEditForm({...editForm, schemaType: e.target.value as any})} className={inputClass}>
                                <option value="WebPage">WebPage</option>
                                <option value="AboutPage">AboutPage</option>
                                <option value="ContactPage">ContactPage</option>
                                <option value="LandingPage">LandingPage</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={18} className="text-primary-500" />
                            <h3 className="font-bold dark:text-white">{t('faqs')}</h3>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={addFAQ} className="rounded-xl"><Plus size={16} /></Button>
                    </div>
                    <div className="space-y-3">
                        {editForm.faqs?.map((faq, index) => (
                            <div key={index} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                                <div className="flex-1 grid grid-cols-1 gap-2">
                                    <input type="text" value={faq.question} onChange={e => handleFAQChange(index, 'question', e.target.value)} className={inputClass} placeholder={t('question')} />
                                    <textarea value={faq.answer} onChange={e => handleFAQChange(index, 'answer', e.target.value)} className={`${inputClass} h-20 py-3 resize-none`} placeholder={t('answer')} />
                                </div>
                                <button type="button" onClick={() => removeFAQ(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><X size={16} /></button>
                            </div>
                        ))}
                        {(!editForm.faqs || editForm.faqs.length === 0) && <p className="text-center text-gray-400 text-sm py-4">{t('no_results')}</p>}
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <Card className="border-t-4 border-t-primary-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold dark:text-white text-lg">{t('status')}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${editForm.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t(editForm.status || 'draft')}</span>
                    </div>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className={labelClass}>{t('status')}</label>
                            <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className={inputClass}>
                                <option value="draft">{t('draft')}</option>
                                <option value="published">{t('published')}</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>{t('publish_date')}</label>
                            <PersianDatePicker value={editForm.publishDate} onChange={isoDate => setEditForm({...editForm, publishDate: isoDate})} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full justify-center rounded-xl shadow-md"><Save size={18} className="mr-2" />{t('save')}</Button>
                </Card>

                <Card>
                    <h3 className="font-bold dark:text-white mb-4">{t('featured_image')}</h3>
                    <div className="space-y-3">
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 transition-colors group cursor-pointer" onClick={() => setShowMediaModal(true)}>
                            {editForm.featuredImage ? <img src={editForm.featuredImage} alt="Featured" className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"><ImageIcon size={32} /><span className="text-xs mt-2">{t('select_media')}</span></div>}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white font-bold text-sm">{t('edit')}</span></div>
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={editForm.featuredImage || ''} onChange={e => setEditForm({...editForm, featuredImage: e.target.value})} className={`${inputClass} text-xs`} placeholder="URL..." />
                            {editForm.featuredImage && <button type="button" onClick={() => setEditForm({...editForm, featuredImage: ''})} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-100"><Trash2 size={16} /></button>}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        
        {showMediaModal && <MediaSelector context="page" onClose={() => setShowMediaModal(false)} onSelect={(url) => { setEditForm(prev => ({ ...prev, featuredImage: url })); }} />}
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('pages')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
              <input type="text" placeholder={t('search_placeholder_admin')} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-2.5 h-11 rounded-xl border-none bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-4"><SearchIcon size={18} /></div>
          </div>
          <Button onClick={() => startEdit()} className="rounded-xl"><Plus size={18} className="mr-2" />{t('add_page')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedPages.map((page) => (
              <div key={page.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-transparent dark:border-gray-700/50 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                              {page.featuredImage ? <img src={page.featuredImage} alt="" className="w-full h-full object-cover rounded-xl" /> : <FileText size={24} />}
                          </div>
                          <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 text-sm">{page.title}</h3>
                              <p className="text-xs text-gray-500 font-mono">/{page.slug}</p>
                          </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${page.status === 'published' ? 'bg-green-50 text-green-600 border-green-100 dark:border-green-900/30' : 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:border-yellow-900/30'}`}>{t(page.status)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="text-xs text-gray-400">{new Date(page.createdAt).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US')}</div>
                      <div className="flex gap-2">
                          <Link to={`/${page.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"><Eye size={16} /></Link>
                          <button onClick={() => startEdit(page)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(page.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
      {filteredPages.length === 0 && <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"><p className="text-gray-500 font-medium">{t('no_results')}</p></div>}
      <Pagination totalItems={filteredPages.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};