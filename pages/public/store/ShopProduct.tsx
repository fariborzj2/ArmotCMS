
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useSeo } from '../../../hooks/useSeo';
import { storeUtils } from '../../../utils/store';
import { Button } from '../../../components/ui/Button';
import { ShoppingCart, Check, XCircle, Share2, ShieldCheck, Truck } from 'lucide-react';

export const ShopProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, storeProducts, storeConfig, config, addToCart } = useApp();

  const product = storeProducts.find(p => p.slug === slug);

  const seoTitle = product?.metaTitle || product?.title || 'Product Not Found';
  const seoDesc = product?.metaDescription || product?.excerpt || '';

  // Generate Schema
  const schema = product ? storeUtils.generateProductSchema(product, storeConfig, config.siteName) : undefined;

  useSeo({
    title: seoTitle,
    description: seoDesc,
    image: product?.featuredImage,
    type: 'product',
    schema
  });

  if (!product || product.status !== 'published') return <Navigate to="/404" />;

  const finalPrice = storeUtils.calculatePrice(product, storeConfig);

  const handleAddToCart = () => {
      addToCart(product);
      alert(t('success')); // Optional feedback
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
           {/* Left: Images */}
           <div className="space-y-4">
               <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                   {product.featuredImage ? (
                       <img src={product.featuredImage} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                   )}
                   {!product.isAvailable && (
                       <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                           <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xl transform -rotate-12 shadow-lg">{t('out_of_stock')}</span>
                       </div>
                   )}
               </div>
               {/* Gallery Mock */}
               <div className="grid grid-cols-4 gap-4">
                   {[1,2,3,4].map(i => (
                       <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:ring-2 ring-primary-500 transition-all opacity-50 hover:opacity-100"></div>
                   ))}
               </div>
           </div>

           {/* Right: Info */}
           <div className="flex flex-col">
               <div className="mb-6">
                   <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{product.title}</h1>
                   <div className="flex items-center gap-4 text-sm text-gray-500">
                       <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">SKU: {product.sku || 'N/A'}</span>
                       {product.isAvailable ? (
                           <span className="text-green-600 flex items-center gap-1 font-bold"><Check size={16} /> {t('available')}</span>
                       ) : (
                           <span className="text-red-600 flex items-center gap-1 font-bold"><XCircle size={16} /> {t('unavailable')}</span>
                       )}
                   </div>
               </div>

               <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                   {product.excerpt}
               </p>

               <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8">
                   <div className="flex items-end gap-3 mb-2">
                       <span className="text-4xl font-black text-primary-600">{storeUtils.formatPrice(finalPrice)}</span>
                       {product.priceModel === 'dollar_based' && (
                           <span className="text-sm text-gray-400 mb-1.5 font-mono">({product.basePrice}$)</span>
                       )}
                   </div>
                   <p className="text-xs text-gray-400">Includes all taxes and fees if applicable.</p>
               </div>

               <div className="flex gap-4 mb-8">
                   <Button 
                        size="lg" 
                        onClick={handleAddToCart} 
                        disabled={!product.isAvailable}
                        className="flex-1 rounded-2xl h-14 text-lg shadow-lg shadow-primary-500/30"
                   >
                       <ShoppingCart className="mr-2 rtl:ml-2" />
                       {t('add_to_cart')}
                   </Button>
                   <Button variant="secondary" size="lg" className="rounded-2xl h-14 w-14 p-0 flex items-center justify-center">
                       <Share2 size={20} />
                   </Button>
               </div>

               {/* Trust Badges */}
               <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300">
                       <ShieldCheck size={24} />
                       <div className="text-sm font-bold">Secure Payment</div>
                   </div>
                   <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300">
                       <Truck size={24} />
                       <div className="text-sm font-bold">Instant Delivery</div>
                   </div>
               </div>
           </div>
       </div>

       {/* Tabs / Details */}
       <div className="mt-16">
           <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
               <button className="px-8 py-4 border-b-2 border-primary-500 text-primary-600 font-bold text-lg">{t('details')}</button>
               <button className="px-8 py-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 font-medium text-lg">Reviews (0)</button>
           </div>
           
           <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
               {product.description ? (
                   <div dangerouslySetInnerHTML={{__html: product.description}} />
               ) : (
                   <p>No detailed description available for this product.</p>
               )}
           </div>
       </div>
    </div>
  );
};
