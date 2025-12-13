
import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { storeUtils } from '../../utils/store';
import { Button } from '../ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { t, cart, storeProducts, storeConfig, updateCartQuantity, removeFromCart } = useApp();

  const cartItems = cart.map(item => {
      const product = storeProducts.find(p => p.id === item.productId);
      return { ...item, product };
  }).filter(item => item.product);

  const total = cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = storeUtils.calculatePrice(item.product, storeConfig);
      return sum + (price * item.quantity);
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className={`fixed inset-y-0 right-0 rtl:left-0 rtl:right-auto z-[70] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'} flex flex-col`}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <ShoppingBag size={20} />
                  {t('cart')} <span className="text-sm bg-primary-100 dark:bg-primary-900/50 text-primary-600 px-2 py-0.5 rounded-full">{cart.length}</span>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ShoppingBag size={64} className="mb-4 opacity-20" />
                      <p>{t('empty_cart')}</p>
                  </div>
              ) : (
                  cartItems.map(({ product, quantity }) => {
                      if (!product) return null;
                      const price = storeUtils.calculatePrice(product, storeConfig);
                      return (
                          <div key={product.id} className="flex gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-lg shrink-0 overflow-hidden">
                                  {product.featuredImage ? (
                                      <img src={product.featuredImage} alt={product.title} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={20} /></div>
                                  )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{product.title}</h4>
                                      <p className="text-xs text-primary-600 font-bold mt-1">{storeUtils.formatPrice(price)}</p>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 shadow-sm border border-gray-100 dark:border-gray-700">
                                          <button onClick={() => updateCartQuantity(product.id, quantity - 1)} className="p-0.5 hover:text-red-500 transition-colors"><Minus size={14} /></button>
                                          <span className="text-sm font-bold w-4 text-center dark:text-white">{quantity}</span>
                                          <button onClick={() => updateCartQuantity(product.id, quantity + 1)} className="p-0.5 hover:text-green-500 transition-colors"><Plus size={14} /></button>
                                      </div>
                                      <button onClick={() => removeFromCart(product.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      );
                  })
              )}
          </div>

          {cartItems.length > 0 && (
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="flex justify-between items-center mb-4 text-lg font-bold">
                      <span className="text-gray-600 dark:text-gray-300">{t('total')}</span>
                      <span className="text-primary-600">{storeUtils.formatPrice(total)}</span>
                  </div>
                  <Button className="w-full justify-center py-3.5 rounded-xl shadow-lg shadow-primary-500/20" onClick={() => alert("Checkout Mock")}>
                      {t('checkout')}
                  </Button>
              </div>
          )}
      </div>
    </>
  );
};
