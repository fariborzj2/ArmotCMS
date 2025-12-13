import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Link } from 'react-router-dom';
import { useSeo } from '../../../hooks/useSeo';
import { Search, Folder } from 'lucide-react';
import { PostCard } from '../../../components/blog/PostCard';

export const BlogHome = () => {
  const { t, posts, categories, config } = useApp();
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
        <div 
            className="flex flex-nowrap overflow-x-auto gap-3 animate-fadeIn pb-2 w-full justify-start md:justify-center [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {categories
                .sort((a,b) => (a.order || 0) - (b.order || 0))
                .map(cat => (
                <Link 
                    key={cat.id} 
                    to={`/blog/${cat.slug}`}
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
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
            {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-lg">{t('no_results')}</p>
        </div>
      )}
    </div>
  );
};