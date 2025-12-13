
import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useSeo } from '../../../hooks/useSeo';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ProductCard } from '../../../components/store/ProductCard';
import { ShoppingBag, ArrowLeft, ArrowRight, Tag, Zap } from 'lucide-react';

export const ShopHome = () => {
  const { t, config, storeProducts, storeCategories, isRTL } = useApp();

  useSeo({
    title: t('store'),
    description: `Shop the latest products at ${config.siteName}. Digital assets, services, and more.`,
    type: 'website'
  });

  const featuredProducts = storeProducts
    .filter(p => p.status === 'published' && p.isAvailable)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-start">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        {t('welcome')} <br/>
                        <span className="text-primary-400">{t('store')}</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto md:mx-0">
                        {config.siteDescription}. Find the best digital tools and services to grow your business.
                    </p>
                    <div className="flex gap-4 justify-center md:justify-start">
                        <Button className="px-8 py-3 h-auto rounded-2xl text-lg">
                            {t('buy_now')} {isRTL ? <ArrowLeft className="mr-2" /> : <ArrowRight className="ml-2" />}
                        </Button>
                        <Button variant="secondary" className="px-8 py-3 h-auto rounded-2xl text-lg bg-white/10 text-white hover:bg-white/20 border-transparent">
                            {t('view_site')}
                        </Button>
                    </div>
                </div>
                <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
                        <ShoppingBag size={200} className="text-white relative z-10 drop-shadow-2xl" strokeWidth={1} />
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-20">
            {/* Categories */}
            <section>
                <div className="flex items-center gap-2 mb-8">
                    <Tag className="text-primary-500" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('shop_by_category')}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {storeCategories.sort((a,b) => (a.order||0) - (b.order||0)).map(cat => (
                        <Link key={cat.id} to={`/shop/category/${cat.slug}`} className="group block">
                            <div className="relative h-40 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all">
                                <img src={cat.image || 'https://via.placeholder.com/300'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                                <div className="absolute bottom-4 right-4 rtl:right-4 rtl:left-auto text-white font-bold text-lg">
                                    {cat.name}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-primary-600 font-bold mb-1">
                            <Zap size={18} /> <span>Best Offers</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{t('featured_products')}</h2>
                    </div>
                    <Link to="/shop/category/all" className="hidden md:flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
                        {t('view_all_comments')} {isRTL ? <ArrowLeft size={16} className="mr-1" /> : <ArrowRight size={16} className="ml-1" />}
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                
                {featuredProducts.length === 0 && (
                    <p className="text-center text-gray-500 py-12">No products available yet.</p>
                )}
            </section>
        </div>
    </div>
  );
};
