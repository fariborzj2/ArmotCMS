
import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { useSeo } from '../../../hooks/useSeo';
import { User, Calendar, Tag, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../../utils/date';

export const BlogHome = () => {
  const { t, posts, categories, isRTL, config, lang } = useApp();

  useSeo({
    title: t('blog'),
    description: `Latest news and articles from ${config.siteName}`,
    type: 'website'
  });

  const publishedPosts = posts.filter(p => p.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">{t('blog')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {publishedPosts.map(post => {
            const category = categories.find(c => c.id === post.categoryId);
            return (
                <Link key={post.id} to={`/blog/${category?.slug || 'uncategorized'}/${post.id}-${post.slug}`} className="group h-full">
                    <Card className="h-full flex flex-col p-0 overflow-hidden border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900 transition-all">
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
    </div>
  );
};
