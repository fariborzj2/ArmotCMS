
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { useSeo } from '../../../hooks/useSeo';
import { User, Calendar, Tag, ArrowRight, ArrowLeft, Search, Pin, Folder } from 'lucide-react';
import { formatDate } from '../../../utils/date';

export const BlogHome = () => {
  const { t, posts, categories, isRTL, config, lang } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  useSeo({
    title: t('blog'),
    description: `Latest news and articles from ${config.siteName}`,
    type: 'website'
  });

  const publishedPosts = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => {
        // Priority to pinned posts
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Then by date
        const dateA = new Date(a.publishDate || a.createdAt).getTime();
        const dateB = new Date(b.publishDate || b.createdAt).getTime();
        return dateB - dateA;
    });
  
  const filteredPosts = publishedPosts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to count posts in category
  const getCategoryCount = (catId: string) => publishedPosts.filter(p => p.categoryId === catId).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">{t('blog')}</h1>
        
        {/* Search Input */}
        <div className="max-w-md mx-auto relative group mb-8">
            <input 
                type="text" 
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
        </div>

        {/* Categories List */}
        <div className="flex flex-wrap justify-center gap-3 animate-fadeIn">
            {categories
                .sort((a,b) => (a.order || 0) - (b.order || 0))
                .map(cat => (
                <Link 
                    key={cat.id} 
                    to={`/blog/${cat.slug}`}
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <Folder size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    {cat.name}
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] px-2 py-0.5 rounded-md ml-1 rtl:mr-1 rtl:ml-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 transition-colors">
                        {getCategoryCount(cat.id)}
                    </span>
                </Link>
            ))}
        </div>
      </div>
      
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => {
                const category = categories.find(c => c.id === post.categoryId);
                return (
                    <Link key={post.id} to={`/blog/${category?.slug || 'uncategorized'}/${post.id}-${post.slug}`} className="group h-full">
                        <Card className={`h-full flex flex-col p-0 overflow-hidden border-2 transition-all relative ${post.pinned ? 'border-primary-200 dark:border-primary-900 ring-2 ring-primary-100 dark:ring-primary-900/50' : 'border-transparent hover:border-primary-100 dark:hover:border-primary-900'}`}>
                            
                            {post.pinned && (
                                <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                    <Pin size={10} fill="currentColor" /> {t('pinned')}
                                </div>
                            )}

                            {post.featuredImage && (
                                <div className="h-48 overflow-hidden">
                                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs text-primary-600 mb-2">
                                    <span className="bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded font-bold">
                                        {category?.name}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">{formatDate(post.publishDate || post.createdAt, lang)}</span>
                                </div>
                                <h2 className="text-xl font-bold mb-3 dark:text-white group-hover:text-primary-600 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <User size={14} /> {post.author}
                                    </div>
                                    <span className="text-primary-600 font-bold flex items-center">
                                        {t('read_more')} {isRTL ? <ArrowLeft size={14} className="mr-1" /> : <ArrowRight size={14} className="ml-1" />}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                );
            })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-lg">{t('no_results')}</p>
        </div>
      )}
    </div>
  );
};
