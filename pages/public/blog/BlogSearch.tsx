import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { PostCard } from '../../../components/blog/PostCard';

export const BlogSearch = () => {
  // Support both /blog/search?q=query and /blog/search=:query
  const [searchParams] = useSearchParams();
  const { query: pathQuery } = useParams<{ query: string }>(); // for search=:query
  
  const query = pathQuery?.replace('=', '') || searchParams.get('q') || '';
  
  const { posts, t } = useApp();

  const results = posts.filter(p => 
      p.status === 'published' && 
      (p.title.toLowerCase().includes(query.toLowerCase()) || p.content.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
       <div className="text-center mb-12">
           <h1 className="text-3xl font-bold dark:text-white mb-2">{t('search_results')}</h1>
           <p className="text-gray-500 text-xl">"{decodeURIComponent(query)}"</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {results.map(post => (
               <PostCard key={post.id} post={post} />
           ))}
           {results.length === 0 && <p className="col-span-3 text-center text-gray-500">{t('no_results')}</p>}
       </div>
    </div>
  );
};