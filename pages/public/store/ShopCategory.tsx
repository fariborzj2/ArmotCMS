
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useSeo } from '../../../hooks/useSeo';
import { ProductCard } from '../../../components/store/ProductCard';
import { Folder } from 'lucide-react';

export const ShopCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, storeProducts, storeCategories, config } = useApp();

  const category = storeCategories.find(c => c.slug === slug);
  const isAll = slug === 'all';

  if (!category && !isAll) return <Navigate to="/404" />;

  const products = storeProducts.filter(p => 
    p.status === 'published' && 
    (isAll || p.categoryId === category?.id)
  );

  useSeo({
    title: isAll ? t('products') : category?.name || '',
    description: `Browse ${category?.name || 'products'} at ${config.siteName}`,
    type: 'website'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
       {/* Header */}
       <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-8 md:p-12 mb-12 flex items-center justify-between">
           <div>
               <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm font-bold uppercase tracking-wide">
                   <Folder size={16} /> {t('store')} / {t('category')}
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">
                   {isAll ? t('products') : category?.name}
               </h1>
           </div>
           {/* Abstract Decoration */}
           <div className="hidden md:block w-24 h-24 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-full opacity-20 blur-2xl"></div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Sidebar Filters (Mock) */}
           <div className="lg:col-span-1 space-y-6">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                   <h3 className="font-bold text-lg mb-4 dark:text-white">{t('categories')}</h3>
                   <ul className="space-y-2">
                       {storeCategories.map(cat => (
                           <li key={cat.id}>
                               <a 
                                 href={`#/shop/category/${cat.slug}`} 
                                 className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${cat.slug === slug ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                               >
                                   {cat.name}
                               </a>
                           </li>
                       ))}
                   </ul>
                   
                   <div className="my-6 border-t border-gray-100 dark:border-gray-700"></div>
                   <h3 className="font-bold text-lg mb-4 dark:text-white">{t('price')}</h3>
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                       <span>Low</span>
                       <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                       <span>High</span>
                   </div>
               </div>
           </div>

           {/* Products Grid */}
           <div className="lg:col-span-3">
               {products.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {products.map(product => (
                           <ProductCard key={product.id} product={product} />
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                       <p className="text-gray-500">{t('no_results')}</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};
