import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, PenTool, Folder, Image as ImageIcon, Settings, HelpCircle, Save, X, Search as SearchIcon, Sparkles, Tag, Pin, ArrowUp, ArrowDown, Eye, MessageSquare, ChevronLeft, FileText, CornerDownRight, GripVertical } from 'lucide-react';
import { BlogPost, BlogCategory, BlogTag } from '../../types';
import { MediaSelector } from '../../components/media/MediaSelector';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { TagInput } from '../../components/ui/TagInput';
import { PersianDatePicker } from '../../components/ui/PersianDatePicker';
import { formatDate } from '../../utils/date';
import { Pagination } from '../../components/ui/Pagination';
import { aiService } from '../../utils/ai';
import { Link } from 'react-router-dom';

export const BlogManager = () => {
  const { t, posts, addPost, updatePost, deletePost, categories, addCategory, updateCategory, deleteCategory, reorderCategories, tags, addTag, deleteTag, user, lang, config, plugins, smartConfig, comments, isRTL } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'tags'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  // Post Edit Tabs
  const [editTab, setEditTab] = useState<'content' | 'settings' | 'faqs'>('content');

  const [editPost, setEditPost] = useState<Partial<BlogPost>>({});
  const [editCategory, setEditCategory] = useState<Partial<BlogCategory>>({});
  const [newTagName, setNewTagName] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // DnD State for Categories
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);

  const isSmartActive = plugins.some(p => p.id === 'smart-assistant' && p.active) && smartConfig.enableContentGen;

  // Helper to count comments for a post
  const getCommentCount = (postId: string) => comments.filter(c => c.pageId === postId).length;

  // Filter & Paginate & Sort Posts
  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof BlogPost];
        let bValue: any = b[sortConfig.key as keyof BlogPost];

        if (sortConfig.key === 'commentCount') {
            aValue = getCommentCount(a.id);
            bValue = getCommentCount(b.id);
        } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'publishDate') {
             if (sortConfig.key === 'createdAt' || sortConfig.key === 'publishDate') {
                 if (a.pinned && !b.pinned) return -1;
                 if (!a.pinned && b.pinned) return 1;
             }
             aValue = new Date(aValue || 0).getTime();
             bValue = new Date(bValue || 0).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  
  const paginatedPosts = filteredPosts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
      setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
      }));
  };

  // Modern Minimal Inputs
  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:bg-white hover:border-gray-200 dark:hover:bg-gray-900 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-300 text-sm font-medium";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 ml-1";

  // --- POST LOGIC ---
  const startEditPost = (post?: BlogPost) => {
    setEditTab('content');
    if (post) {
      setEditPost(JSON.parse(JSON.stringify(post)));
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
        schemaType: 'Article',
        pinned: false,
        views: 0
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
      metaTitle: editPost.metaTitle,
      metaDescription: editPost.metaDescription,
      keywords: editPost.keywords,
      publishDate: editPost.publishDate,
      faqs: editPost.faqs,
      schemaType: editPost.schemaType || 'Article',
      pinned: editPost.pinned || false
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

  const handleAiRewrite = async () => {
      if(!editPost.content) return;
      setAiLoading(true);
      try {
          const rewritten = await aiService.rewriteContent(editPost.content, smartConfig.preferredModel);
          if (rewritten) setEditPost({ ...editPost, content: rewritten });
      } catch (e) {
          alert('AI Error');
      }
      setAiLoading(false);
  };

  const handleAiGenerate = async () => {
      if(!editPost.title) return alert('Please enter a title first.');
      setAiLoading(true);
      const existingPostsContext = posts.map(p => ({ title: p.title, slug: `${p.id}-${p.slug}` }));
      const allowedTagNames = tags.map(t => t.name);

      try {
          const result = await aiService.generatePost(editPost.title, smartConfig.preferredModel, existingPostsContext, allowedTagNames);
          
          let generatedImage = editPost.featuredImage;
          if (smartConfig.enableImageGen && result.title) {
              const imageBase64 = await aiService.generateBlogImage(result.title);
              if (imageBase64) generatedImage = imageBase64;
          }

          if(result) {
              setEditPost({
                  ...editPost,
                  title: result.title || editPost.title,
                  slug: result.slug || editPost.slug,
                  content: result.content,
                  excerpt: result.excerpt,
                  tags: result.tags,
                  featuredImage: generatedImage
              });
          }
      } catch (e) {
          alert('AI Generation Failed');
      }
      setAiLoading(false);
  };

  // --- CATEGORY LOGIC ---
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory.name) return;
    
    if (editCategory.id) {
        updateCategory(editCategory as BlogCategory);
    } else {
        const slug = editCategory.slug || editCategory.name.toLowerCase().replace(/\s+/g, '-');
        addCategory({
          id: Date.now().toString(),
          name: editCategory.name,
          slug,
          parentId: editCategory.parentId || null,
          order: categories.length + 1
        });
    }
    setEditCategory({});
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
      setDraggedCatId(id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetId: string, parentId: string | null) => {
      e.preventDefault();
      if (!draggedCatId || draggedCatId === targetId) return;

      const siblings = categories
        .filter(c => c.parentId === (parentId || null))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const fromIndex = siblings.findIndex(c => c.id === draggedCatId);
      const toIndex = siblings.findIndex(c => c.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return;

      const updatedSiblings = [...siblings];
      const [movedItem] = updatedSiblings.splice(fromIndex, 1);
      updatedSiblings.splice(toIndex, 0, movedItem);

      const batchUpdate = updatedSiblings.map((cat, idx) => ({
          ...cat,
          order: idx + 1
      }));

      reorderCategories(batchUpdate);
      setDraggedCatId(null);
  };

  // --- TAG LOGIC ---
  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    addTag({
      id: Date.now().toString(),
      name: newTagName.trim()
    });
    setNewTagName('');
  };

  // --- RENDER HELPERS ---
  const renderCategoryTree = (parentId: string | null = null, depth = 0) => {
      const items = categories
        .filter(c => c.parentId === (parentId || null))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (items.length === 0) return null;

      return items.map((cat) => (
          <React.Fragment key={cat.id}>
              <div 
                className={`flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-2 transition-all duration-200 ${draggedCatId === cat.id ? 'opacity-50' : 'opacity-100'}`}
                style={{ marginRight: `${depth * 20}px` }} // RTL Indent
                draggable
                onDragStart={(e) => handleDragStart(e, cat.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cat.id, parentId)}
              >
                  <div className="flex items-center gap-3">
                      <div className="cursor-move text-gray-300 hover:text-gray-500">
                          <GripVertical size={16} />
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 dark:bg-orange-900/30`}>
                          <Folder size={18} />
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                              {depth > 0 && <CornerDownRight size={12} className="text-gray-400" />}
                              <span className="font-bold dark:text-white block text-sm">{cat.name}</span>
                          </div>
                          {cat.slug && <span className="text-[10px] text-gray-400 font-mono">/{cat.slug}</span>}
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setEditCategory(cat)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                          <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                          <Trash2 size={16} />
                      </button>
                  </div>
              </div>
              {renderCategoryTree(cat.id, depth + 1)}
          </React.Fragment>
      ));
  };

  if (isEditing) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
             <button onClick={() => setIsEditing(false)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronLeft size={24} className="rtl:rotate-180" />
            </button>
             <h1 className="text-2xl font-black dark:text-white">{editPost.id ? t('edit') : t('add_post')}</h1>
        </div>

        {/* Segmented Control */}
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

        <form onSubmit={handleSavePost} className="space-y-6 animate-fadeIn">
            {editTab === 'content' && (
                <>
                    <Card className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex items-end gap-3">
                                 <div className="flex-1">
                                    <label className={labelClass}>{t('title')}</label>
                                    <input 
                                        type="text" 
                                        value={editPost.title}
                                        onChange={e => setEditPost({...editPost, title: e.target.value})}
                                        className={inputClass}
                                        required
                                    />
                                 </div>
                                 {isSmartActive && (
                                    <Button type="button" onClick={handleAiGenerate} isLoading={aiLoading} className="mb-0.5 h-[52px] w-[52px] rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/30 p-0 flex items-center justify-center" title={t('generate_post')}>
                                       <Sparkles size={20} />
                                    </Button>
                                 )}
                            </div>
                            <div>
                                <label className={labelClass}>{t('slug')}</label>
                                <input 
                                    type="text" 
                                    value={editPost.slug}
                                    onChange={e => setEditPost({...editPost, slug: e.target.value})}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('category')}</label>
                                <div className="relative">
                                    <select 
                                        value={editPost.categoryId}
                                        onChange={e => setEditPost({...editPost, categoryId: e.target.value})}
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <div className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={labelClass}>{t('status')}</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <select 
                                            value={editPost.status}
                                            onChange={e => setEditPost({...editPost, status: e.target.value as any})}
                                            className={`${inputClass} appearance-none cursor-pointer`}
                                        >
                                            <option value="draft">{t('draft')}</option>
                                            <option value="published">{t('published')}</option>
                                        </select>
                                        <div className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronLeft size={16} className="-rotate-90" />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 px-4 py-3.5 rounded-2xl border-2 border-transparent transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={editPost.pinned || false}
                                            onChange={e => setEditPost({...editPost, pinned: e.target.checked})}
                                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{t('pin_post')}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>{t('featured_image')}</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={editPost.featuredImage}
                                    onChange={e => setEditPost({...editPost, featuredImage: e.target.value})}
                                    className={inputClass}
                                />
                                <Button type="button" variant="secondary" size="icon" onClick={() => setShowMediaModal(true)} className="rounded-2xl shrink-0">
                                    <ImageIcon size={20} />
                                </Button>
                            </div>
                            {editPost.featuredImage && (
                                <img src={editPost.featuredImage} alt="preview" className="mt-4 h-40 w-full md:w-80 object-cover rounded-3xl border-4 border-gray-50 dark:border-gray-800 shadow-md" />
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>{t('excerpt')}</label>
                            <textarea 
                                value={editPost.excerpt}
                                onChange={e => setEditPost({...editPost, excerpt: e.target.value})}
                                className={`${inputClass} h-32 resize-none`}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('tags')}</label>
                            <TagInput 
                               value={editPost.tags || []}
                               onChange={tags => setEditPost({...editPost, tags})}
                               placeholder={t('tags_placeholder')}
                            />
                        </div>
                    </Card>

                    <Card className="p-6 shadow-md">
                        <div className="pb-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 mb-4">
                            <label className={labelClass}>{t('content')}</label>
                            {isSmartActive && (
                                <button type="button" onClick={handleAiRewrite} className="text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-purple-100 transition-colors" disabled={aiLoading}>
                                    <Sparkles size={14} /> {t('rewrite')}
                                </button>
                            )}
                        </div>
                        <div className="min-h-[500px]">
                            <RichTextEditor 
                                key={editPost.id || 'new'}
                                id="blog-content-editor"
                                value={editPost.content || ''}
                                onChange={(content) => setEditPost({...editPost, content})}
                                height={500}
                            />
                        </div>
                    </Card>
                </>
            )}
            
            {editTab === 'settings' && (
                <Card className="space-y-6">
                    <div>
                        <label className={labelClass}>{t('meta_title')}</label>
                        <input 
                            type="text" 
                            value={editPost.metaTitle || ''}
                            onChange={e => setEditPost({...editPost, metaTitle: e.target.value})}
                            className={inputClass}
                            placeholder={editPost.title}
                        />
                    </div>
                    
                    <div>
                        <label className={labelClass}>{t('meta_desc')}</label>
                        <textarea 
                            value={editPost.metaDescription || ''}
                            onChange={e => setEditPost({...editPost, metaDescription: e.target.value})}
                            className={`${inputClass} h-32 resize-none`}
                            placeholder={editPost.excerpt}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>{t('keywords')}</label>
                        <TagInput 
                           value={editPost.keywords || []}
                           onChange={keywords => setEditPost({...editPost, keywords})}
                           placeholder={t('keywords_hint')}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>{t('schema_type')}</label>
                        <div className="relative">
                            <select 
                                value={editPost.schemaType || 'Article'}
                                onChange={e => setEditPost({...editPost, schemaType: e.target.value as any})}
                                className={`${inputClass} appearance-none cursor-pointer`}
                            >
                                <option value="Article">Article (Standard)</option>
                                <option value="NewsArticle">News Article (For News)</option>
                                <option value="BlogPosting">Blog Posting (Personal)</option>
                            </select>
                            <div className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronLeft size={16} className="-rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <PersianDatePicker 
                            label={t('publish_date')}
                            value={editPost.publishDate}
                            onChange={isoDate => setEditPost({...editPost, publishDate: isoDate})}
                        />
                    </div>
                </Card>
            )}

            {editTab === 'faqs' && (
                <div className="space-y-4 animate-fadeIn">
                    {(!editPost.faqs || editPost.faqs.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <HelpCircle size={40} className="text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">No FAQs added yet.</p>
                            <Button type="button" variant="ghost" size="sm" onClick={addFAQ} className="mt-4 text-primary-600 bg-white shadow-sm">
                                {t('add_faq')}
                            </Button>
                        </div>
                    )}

                    {editPost.faqs?.map((faq, index) => (
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
                                        placeholder="e.g. Is this compatible?"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>{t('answer')}</label>
                                    <textarea 
                                        value={faq.answer}
                                        onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                                        className={`${inputClass} h-24 resize-none`}
                                        placeholder="Yes, it is..."
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                    
                    {editPost.faqs && editPost.faqs.length > 0 && (
                        <Button type="button" variant="secondary" onClick={addFAQ} className="w-full rounded-2xl border-dashed border-2 py-4 justify-center">
                            <Plus size={20} className="mr-2" /> {t('add_faq')}
                        </Button>
                    )}
                </div>
            )}

            {/* Inline Action Bar */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <Button 
                    onClick={handleSavePost} 
                    size="lg"
                    className="shadow-2xl shadow-primary-600/40 rounded-full px-8 transform hover:scale-105 transition-all"
                >
                    <Save size={20} className="mr-2" />
                    {t('save')}
                </Button>
            </div>
        </form>

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

  // --- HEADER & LIST VIEW ---
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black dark:text-white">{t('blog')}</h1>
        <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex gap-1">
            <button onClick={() => setActiveTab('posts')} className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'posts' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('posts')}</button>
            <button onClick={() => setActiveTab('categories')} className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'categories' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('categories')}</button>
            <button onClick={() => setActiveTab('tags')} className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'tags' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white scale-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('tags')}</button>
        </div>
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-6">
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
                <Button onClick={() => startEditPost()} size="lg" className="rounded-2xl">
                    <Plus size={20} className="mr-2" /> {t('add_post')}
                </Button>
            </div>

            {/* Mobile Sort Controls */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider">{t('sort_by')}</span>
                {['title', 'views', 'commentCount', 'createdAt'].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleSort(key)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                            sortConfig.key === key 
                            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' 
                            : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'
                        }`}
                    >
                        {t(key === 'createdAt' ? 'date' : key === 'commentCount' ? 'comments_count' : key)}
                        {sortConfig.key === key && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                    </button>
                ))}
            </div>

            {/* Modern Grid/List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {paginatedPosts.map(post => {
                    const commentCount = getCommentCount(post.id);
                    const cat = categories.find(c => c.id === post.categoryId);
                    
                    return (
                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-transparent dark:border-gray-700/50 hover:shadow-md transition-all relative overflow-hidden group">
                            {post.pinned && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400 to-transparent opacity-20 pointer-events-none rounded-tr-3xl"></div>}
                            
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-900 shrink-0 overflow-hidden relative">
                                    {post.featuredImage ? (
                                        <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <FileText size={24} />
                                        </div>
                                    )}
                                    {post.pinned && <div className="absolute top-1 right-1 text-orange-500 bg-white dark:bg-gray-800 rounded-full p-0.5"><Pin size={10} fill="currentColor" /></div>}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-lg truncate max-w-[80px]">
                                            {cat?.name || 'Uncategorized'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                            post.status === 'published' ? 'text-green-600 border-green-100 dark:border-green-900/30' : 'text-yellow-600 border-yellow-100 dark:border-yellow-900/30'
                                        }`}>
                                            {t(post.status)}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1" title={post.title}>{post.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {commentCount}</span>
                                        <span className="truncate">{formatDate(post.createdAt, lang)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <Link to={`/blog/${cat?.slug}/${post.id}-${post.slug}`} target="_blank" className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                                    <Eye size={18} />
                                </Link>
                                <button onClick={() => startEditPost(post)} className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDeletePost(post.id)} className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500 font-medium">{t('no_results')}</p>
                </div>
            )}

            <Pagination 
                totalItems={filteredPosts.length} 
                itemsPerPage={itemsPerPage} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
            />
        </div>
      )}

      {/* Categories Tab with Nesting */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h3 className="font-bold mb-4 dark:text-white text-lg">{editCategory.id ? t('edit') : t('add_category')}</h3>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder={t('title')}
                        value={editCategory.name || ''}
                        onChange={e => setEditCategory({...editCategory, name: e.target.value})}
                        className={inputClass}
                        required
                    />
                    <input 
                        type="text" 
                        placeholder={t('slug')}
                        value={editCategory.slug || ''}
                        onChange={e => setEditCategory({...editCategory, slug: e.target.value})}
                        className={inputClass}
                    />
                    
                    {/* Parent Selector */}
                    <div>
                        <label className={labelClass}>{t('parent_category')}</label>
                        <select 
                            value={editCategory.parentId || ''}
                            onChange={e => setEditCategory({...editCategory, parentId: e.target.value === '' ? null : e.target.value})}
                            className={inputClass}
                        >
                            <option value="">{t('no_parent')}</option>
                            {categories.filter(c => c.id !== editCategory.id).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        {editCategory.id && (
                            <Button type="button" variant="ghost" onClick={() => setEditCategory({})} className="flex-1 rounded-xl">
                                {t('cancel')}
                            </Button>
                        )}
                        <Button type="submit" className="flex-1 justify-center rounded-xl">{t('save')}</Button>
                    </div>
                </form>
            </Card>
            
            <div className="space-y-2">
                {renderCategoryTree(null)}
                {categories.length === 0 && <p className="text-gray-500 text-center py-4">{t('no_results')}</p>}
            </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h3 className="font-bold mb-4 dark:text-white text-lg">{t('add_tag')}</h3>
                <form onSubmit={handleSaveTag} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder={t('tag_name')}
                        value={newTagName}
                        onChange={e => setNewTagName(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <Button type="submit" className="w-full justify-center rounded-xl">{t('save')}</Button>
                </form>
            </Card>
            
            <div className="space-y-3">
                {tags.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                                <Tag size={16} />
                            </div>
                            <div>
                                <span className="font-bold dark:text-white block">{item.name}</span>
                            </div>
                        </div>
                        <button onClick={() => deleteTag(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};