

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Tag } from 'lucide-react';

export const BlogTags = () => {
  const { tag } = useParams<{ tag: string }>();
  const { posts, t } = useApp();

  if (tag) {
      // Single Tag View
      const tagPosts = posts
        .filter(p => p.tags?.includes(tag) && p.status === 'published')
        .sort((a, b) => new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime());

      return (
          <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                      <Tag size={32} />
                  </div>
                  <h1 className="text-3xl font-bold dark:text-white">{t('tags')}: {tag}</h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tagPosts.map(post => (
                    <Link key={post.id} to={`/blog/post/${post.id}-${post.slug}`} className="group">
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <h3 className="font-bold text-lg dark:text-white group-hover:text-primary-600 mb-2">{post.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3">{post.excerpt}</p>
                        </Card>
                    </Link>
                ))}
                {tagPosts.length === 0 && <p className="col-span-3 text-center text-gray-500">{t('no_results')}</p>}
              </div>
          </div>
      );
  }

  // All Tags Cloud
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
       <h1 className="text-3xl font-bold dark:text-white mb-8 text-center">{t('tags')}</h1>
       <div className="flex flex-wrap gap-4 justify-center">
          {allTags.map(t => (
              <Link 
                key={t} 
                to={`/blog/tags/${t}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-full text-lg hover:bg-primary-500 hover:text-white transition-all shadow-sm"
              >
                  {t}
              </Link>
          ))}
       </div>
    </div>
  );
};
