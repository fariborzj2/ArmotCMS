
import React from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { Search } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

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
    <div className="max-w-4xl mx-auto px-4 py-12">
       <div className="text-center mb-12">
           <h1 className="text-3xl font-bold dark:text-white mb-2">{t('search_results')}</h1>
           <p className="text-gray-500 text-xl">"{decodeURIComponent(query)}"</p>
       </div>

       <div className="space-y-6">
           {results.map(post => (
               <Link key={post.id} to={`/blog/post/${post.id}-${post.slug}`}>
                   <Card className="hover:border-primary-500 transition-colors">
                       <h3 className="text-xl font-bold dark:text-white mb-2">{post.title}</h3>
                       <p className="text-gray-500">{post.excerpt}</p>
                   </Card>
               </Link>
           ))}
           {results.length === 0 && <p className="text-center text-gray-500">{t('no_results')}</p>}
       </div>
    </div>
  );
};
