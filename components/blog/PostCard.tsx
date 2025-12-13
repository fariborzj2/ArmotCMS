import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { formatDate } from '../../utils/date';
import { User, Pin, ArrowRight, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../../types';

interface PostCardProps {
  post: BlogPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { t, lang, isRTL, categories } = useApp();
  const category = categories.find(c => c.id === post.categoryId);

  return (
    <Link to={`/blog/${category?.slug || 'uncategorized'}/${post.id}-${post.slug}`} className="group h-full block">
        <Card className={`h-full flex flex-col p-0 overflow-hidden border-2 transition-all relative bg-white dark:bg-gray-800 ${post.pinned ? 'border-primary-200 dark:border-primary-900 ring-2 ring-primary-100 dark:ring-primary-900/50' : 'border-transparent hover:border-primary-100 dark:hover:border-primary-900 hover:shadow-lg'}`}>
            
            {post.pinned && (
                <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Pin size={10} fill="currentColor" /> {t('pinned')}
                </div>
            )}

            {post.featuredImage && (
                <div className="h-48 overflow-hidden relative">
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-primary-600 mb-2">
                    <span className="bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded font-bold">
                        {category?.name || t('uncategorized')}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{formatDate(post.publishDate || post.createdAt, lang)}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
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
};