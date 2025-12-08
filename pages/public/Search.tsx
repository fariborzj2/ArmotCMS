
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search as SearchIcon, FileText } from 'lucide-react';
import { useSeo } from '../../hooks/useSeo';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t, pages } = useApp();

  useSeo({
    title: `${t('search_results')}: ${query}`,
    description: `Search results for ${query}`,
  });

  const results = pages.filter(page => 
    page.status === 'published' && 
    (page.title.toLowerCase().includes(query.toLowerCase()) || 
     page.content.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-lg">
          <SearchIcon size={32} />
        </div>
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
             {t('search_results')}
           </h1>
           <p className="text-gray-500">"{query}"</p>
        </div>
      </div>

      <div className="space-y-6">
        {results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
             <p className="text-gray-500 text-lg">{t('no_results')}</p>
          </div>
        ) : (
          results.map(page => (
            <Link key={page.id} to={`/${page.slug}`} className="block group">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group-hover:border-primary-200 dark:group-hover:border-primary-800">
                <div className="flex items-center gap-2 mb-2">
                   <FileText size={16} className="text-primary-500" />
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                     {page.title}
                   </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                   {page.content.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};