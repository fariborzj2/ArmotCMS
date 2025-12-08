
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, PenTool, Folder, Image as ImageIcon, Settings, HelpCircle, Save, X, Search as SearchIcon } from 'lucide-react';
import { BlogPost, BlogCategory } from '../../types';
import { MediaSelector } from '../../components/media/MediaSelector';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { TagInput } from '../../components/ui/TagInput';
import { PersianDatePicker } from '../../components/ui/PersianDatePicker';
import { formatDate } from '../../utils/date';
import { Pagination } from '../../components/ui/Pagination';

export const BlogManager = () => {
  const { t, posts, addPost, updatePost, deletePost, categories, addCategory, deleteCategory, user, lang } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Post Edit Tabs
  const [editTab, setEditTab] = useState<'content' | 'settings' | 'faqs'>('content');

  const [editPost, setEditPost] = useState<Partial<BlogPost>>({});
  const [editCategory, setEditCategory] = useState<Partial<BlogCategory>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Filter & Paginate
  const filteredPosts = posts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.slug.includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // --- POST LOGIC ---
  const startEditPost = (post?: BlogPost) => {
    setEditTab('content'); // Reset to content tab
    if (post) {
      setEditPost(JSON.parse(JSON.stringify(post))); // Deep copy to avoid mutating state directly via FAQs array reference
    } else {
      setEditPost({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        categoryId: categories[0]?.id || '',
        tags: [],
        status: 'draft',
        featuredImage: '',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        publishDate: new Date().toISOString(),
        faqs: [],
        schemaType: 'Article'
      });
    }
    setIsEditing(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPost.title || !editPost.slug) return;

    const postData: BlogPost = {
      id: editPost.id || Date.now().toString(),
      title: editPost.title!,
      slug: editPost.slug!.toLowerCase().replace(/\s+/g, '-'),
      content: editPost.content || '',
      excerpt: editPost.excerpt || '',
      author: editPost.author || user?.username || 'admin',
      categoryId: editPost.categoryId || categories[0]?.id || '',
      tags: editPost.tags || [],
      featuredImage: editPost.featuredImage || '',
      status: editPost.status as 'published' | 'draft',
      createdAt: editPost.publishDate || new Date().toISOString().split('T')[0],
      views: editPost.views || 0,
      // New Fields
      metaTitle: editPost.metaTitle,
      metaDescription: editPost.metaDescription,
      keywords: editPost.keywords,
      publishDate: editPost.publishDate,
      faqs: editPost.faqs,
      schemaType: editPost.schemaType || 'Article'
    };

    if (editPost.id) {
      updatePost(postData);
    } else {
      addPost(postData);
    }
    setIsEditing(false);
  };

  const handleDeletePost = (id: string) => {
    if (confirm(t('delete') + '?')) deletePost(id);
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...(editPost.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setEditPost({ ...editPost, faqs: newFaqs });
  };

  const addFAQ = () => {
    setEditPost({ ...editPost, faqs: [...(editPost.faqs || []), { question: '', answer: '' }] });
  };

  const removeFAQ = (index: number) => {
    const newFaqs = [...(editPost.faqs || [])];
    newFaqs.splice(index, 1);
    setEditPost({ ...editPost, faqs: newFaqs });
  };

  // --- CATEGORY LOGIC ---
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory.name) return;
    const slug = editCategory.slug || editCategory.name.toLowerCase().replace(/\s+/g, '-');
    addCategory({
      id: Date.now().toString(),
      name: editCategory.name,
      slug
    });
    setEditCategory({});
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold dark:text-white">{editPost.id ? t('edit') : t('add_post')}</h1>
             <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
        </div>

        {/* Edit Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-4 space-x-reverse overflow-x-auto">
             <button 
                onClick={() => setEditTab('content')}
                className={`pb-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${editTab === 'content' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}
             >
                <PenTool size={16} className="inline-block ml-2 rtl:mr-0 rtl:ml-2" />
                {t('content')}
             </button>
             <button 
                onClick={() => setEditTab('settings')}
                className={`pb-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${editTab === 'settings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}
             >
                <Settings size={16} className="inline-block ml-2 rtl:mr-0 rtl:ml-2" />
                {t('post_settings')}
             </button>
             <button 
                onClick={() => setEditTab('faqs')}
                className={`pb-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${editTab === 'faqs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}
             >
                <HelpCircle size={16} className="inline-block ml-2 rtl:mr-0 rtl:ml-2" />
                {t('faqs')}
             </button>
        </div>

        <Card>
          <form onSubmit={handleSavePost} className="space-y-6">
            
            {/* CONTENT TAB */}
            {editTab === 'content' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                            <input 
                                type="text" 
                                value={editPost.title}
                                onChange={e => setEditPost({...editPost, title: e.target.value})}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('slug')}</label>
                            <input 
                                type="text" 
                                value={editPost.slug}
                                onChange={e => setEditPost({...editPost, slug: e.target.value})}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                            <select 
                                value={editPost.categoryId}
                                onChange={e => setEditPost({...editPost, categoryId: e.target.value})}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                             <select 
                                value={editPost.status}
                                onChange={e => setEditPost({...editPost, status: e.target.value as any})}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                             >
                                <option value="draft">{t('draft')}</option>
                                <option value="published">{t('published')}</option>
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('featured_image')}</label>
                        <div className="flex gap-2">
                            <input 
                            type="text" 
                            value={editPost.featuredImage}
                            onChange={e => setEditPost({...editPost, featuredImage: e.target.value})}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                            />
                            <Button type="button" variant="secondary" onClick={() => setShowMediaModal(true)}>
                            <ImageIcon size={18} />
                            </Button>
                        </div>
                        {editPost.featuredImage && (
                            <img src={editPost.featuredImage} alt="preview" className="mt-2 h-20 w-auto rounded object-cover border border-gray-200" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('excerpt')}</label>
                        <textarea 
                            value={editPost.excerpt}
                            onChange={e => setEditPost({...editPost, excerpt: e.target.value})}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white h-20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content')}</label>
                        <RichTextEditor 
                            key={editPost.id || 'new'}
                            id="blog-content-editor"
                            value={editPost.content || ''}
                            onChange={(content) => setEditPost({...editPost, content})}
                            height={400}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tags')}</label>
                        <TagInput 
                           value={editPost.tags || []}
                           onChange={tags => setEditPost({...editPost, tags})}
                           placeholder={t('tags_placeholder')}
                        />
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {editTab === 'settings' && (
                <div className="space-y-4 animate-fadeIn">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_title')}</label>
                        <input 
                            type="text" 
                            value={editPost.metaTitle || ''}
                            onChange={e => setEditPost({...editPost, metaTitle: e.target.value})}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                            placeholder={editPost.title}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_desc')}</label>
                        <textarea 
                            value={editPost.metaDescription || ''}
                            onChange={e => setEditPost({...editPost, metaDescription: e.target.value})}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white h-20"
                            placeholder={editPost.excerpt}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('keywords')}</label>
                        <TagInput 
                           value={editPost.keywords || []}
                           onChange={keywords => setEditPost({...editPost, keywords})}
                           placeholder={t('keywords_hint')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schema_type')}</label>
                        <select 
                            value={editPost.schemaType || 'Article'}
                            onChange={e => setEditPost({...editPost, schemaType: e.target.value as any})}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                        >
                            <option value="Article">Article (Standard)</option>
                            <option value="NewsArticle">News Article (For News)</option>
                            <option value="BlogPosting">Blog Posting (Personal)</option>
                        </select>
                    </div>

                    <div>
                        <PersianDatePicker 
                            label={t('publish_date')}
                            value={editPost.publishDate}
                            onChange={isoDate => setEditPost({...editPost, publishDate: isoDate})}
                        />
                    </div>
                </div>
            )}

            {/* FAQS TAB */}
            {editTab === 'faqs' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold dark:text-white">{t('faqs')}</h3>
                        <Button type="button" size="sm" onClick={addFAQ}>
                            <Plus size={16} className="mr-2" /> {t('add_faq')}
                        </Button>
                    </div>

                    {(!editPost.faqs || editPost.faqs.length === 0) && (
                        <p className="text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                            No FAQs added yet.
                        </p>
                    )}

                    {editPost.faqs?.map((faq, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative group">
                            <button 
                                type="button" 
                                onClick={() => removeFAQ(index)}
                                className="absolute top-2 left-2 rtl:left-auto rtl:right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('question')}</label>
                                    <input 
                                        type="text" 
                                        value={faq.question}
                                        onChange={e => handleFAQChange(index, 'question', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm"
                                        placeholder="e.g. Is this compatible?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('answer')}</label>
                                    <textarea 
                                        value={faq.answer}
                                        onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm h-16"
                                        placeholder="Yes, it is..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button type="submit">
                 <Save size={18} className="mr-2" />
                 {t('save')}
              </Button>
            </div>
          </form>
        </Card>
        {showMediaModal && (
            <MediaSelector 
              context="blog"
              onClose={() => setShowMediaModal(false)}
              onSelect={(url) => {
                setEditPost(prev => ({ ...prev, featuredImage: url }));
              }}
            />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('blog')}</h1>
        <div className="flex gap-2">
            <Button variant={activeTab === 'posts' ? 'primary' : 'secondary'} onClick={() => setActiveTab('posts')}>
                <PenTool size={16} className="mr-2" /> {t('posts')}
            </Button>
            <Button variant={activeTab === 'categories' ? 'primary' : 'secondary'} onClick={() => setActiveTab('categories')}>
                <Folder size={16} className="mr-2" /> {t('categories')}
            </Button>
        </div>
      </div>

      {activeTab === 'posts' ? (
        <div className="space-y-4">
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
                <Button onClick={() => startEditPost()} size="sm">
                    <Plus size={16} className="mr-2" /> {t('add_post')}
                </Button>
            </div>

            <div className="md:bg-white md:dark:bg-gray-800 md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-700 overflow-hidden">
                <div className="">
                    <table className="w-full text-left rtl:text-right block md:table">
                        <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">{t('title')}</th>
                                <th className="px-6 py-3">{t('category')}</th>
                                <th className="px-6 py-3">{t('date')}</th>
                                <th className="px-6 py-3 text-right rtl:text-left">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="block md:table-row-group space-y-4 md:space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
                            {paginatedPosts.map(post => {
                                const cat = categories.find(c => c.id === post.categoryId);
                                return (
                                    <tr key={post.id} className="block md:table-row bg-white dark:bg-gray-800 md:bg-transparent rounded-xl shadow-sm md:shadow-none border border-gray-200 dark:border-gray-700 md:border-none p-4 md:p-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 font-bold dark:text-white flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                                            <span className="md:hidden text-gray-500 text-xs font-bold">{t('title')}</span>
                                            <div className="flex items-center gap-2">
                                                {post.title}
                                                {post.status === 'draft' && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">Draft</span>}
                                            </div>
                                        </td>
                                        <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-sm text-gray-500 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                                            <span className="md:hidden text-gray-500 text-xs font-bold">{t('category')}</span>
                                            {cat?.name || '-'}
                                        </td>
                                        <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-sm text-gray-500 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                                            <span className="md:hidden text-gray-500 text-xs font-bold">{t('date')}</span>
                                            {formatDate(post.publishDate || post.createdAt, lang)}
                                        </td>
                                        <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-right rtl:text-left flex justify-between items-center md:block">
                                            <span className="md:hidden text-gray-500 text-xs font-bold">{t('actions')}</span>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => startEditPost(post)} className="text-blue-500"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeletePost(post.id)} className="text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredPosts.length === 0 && (
                                <tr className="block md:table-row">
                                    <td colSpan={4} className="block md:table-cell text-center py-8 text-gray-500">
                                        {t('no_results')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination 
                totalItems={filteredPosts.length} 
                itemsPerPage={itemsPerPage} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
            />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h3 className="font-bold mb-4 dark:text-white">{t('add_category')}</h3>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder={t('title')}
                        value={editCategory.name || ''}
                        onChange={e => setEditCategory({...editCategory, name: e.target.value})}
                        className="w-full p-2 rounded border bg-transparent dark:text-white border-gray-300 dark:border-gray-700"
                        required
                    />
                    <input 
                        type="text" 
                        placeholder={t('slug')}
                        value={editCategory.slug || ''}
                        onChange={e => setEditCategory({...editCategory, slug: e.target.value})}
                        className="w-full p-2 rounded border bg-transparent dark:text-white border-gray-300 dark:border-gray-700"
                    />
                    <Button type="submit">{t('save')}</Button>
                </form>
            </Card>
            
            <div className="space-y-2">
                {categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div>
                            <span className="font-bold dark:text-white">{cat.name}</span>
                            <span className="text-xs text-gray-500 ml-2">/{cat.slug}</span>
                        </div>
                        <button onClick={() => deleteCategory(cat.id)} className="text-red-500"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
