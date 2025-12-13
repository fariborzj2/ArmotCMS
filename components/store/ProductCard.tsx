
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { ShoppingCart, Heart } from 'lucide-react';
import { StoreProduct } from '../../types';
import { storeUtils } from '../../utils/store';

interface ProductCardProps {
  product: StoreProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, storeConfig, storeCategories } = useApp();
  const finalPrice = storeUtils.calculatePrice(product, storeConfig);
  const category = storeCategories.find(c => c.id === product.categoryId);

  return (
    <Link to={`/shop/product/${product.slug}`} className="group h-full block">
        <Card className="h-full flex flex-col p-0 overflow-hidden border transition-all duration-300 relative bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:-translate-y-1">
            {/* Image Container */}
            <div className="h-56 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {product.featuredImage ? (
                    <img 
                        src={product.featuredImage} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={48} />
                    </div>
                )}
                
                {/* Overlay Buttons */}
                <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                    </button>
                </div>

                {/* Tags */}
                <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex gap-1">
                    {!product.isAvailable && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            {t('out_of_stock')}
                        </span>
                    )}
                    {product.type === 'digital' && (
                        <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            Download
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-gray-500 mb-2 font-medium">
                    {category?.name || t('uncategorized')}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-lg group-hover:text-primary-600 transition-colors">
                    {product.title}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-primary-600">
                            {storeUtils.formatPrice(finalPrice)}
                        </span>
                        {product.priceModel === 'dollar_based' && (
                            <span className="text-[10px] text-gray-400">
                                {t('dollar_based')} (${product.basePrice})
                            </span>
                        )}
                    </div>
                    <button 
                        className={`p-2.5 rounded-xl transition-all shadow-sm ${
                            product.isAvailable 
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-600 hover:text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                        title={t('add_to_cart')}
                        disabled={!product.isAvailable}
                        onClick={(e) => {
                            e.preventDefault();
                            if(product.isAvailable) alert("Added to cart (Mock)");
                        }}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </Card>
    </Link>
  );
};

const ShoppingBag = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
