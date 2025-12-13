
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, Edit2, Trash2, Search as SearchIcon, ShoppingBag, Save, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { StoreProduct } from '../../../types';
import { Pagination } from '../../../components/ui/Pagination';
import { MediaSelector } from '../../../components/media/MediaSelector';
import { storeUtils } from '../../../utils/store';

export const ProductManager = () => {
  const { t, storeProducts, addStoreProduct, updateStoreProduct, deleteStoreProduct, storeConfig } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<StoreProduct>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = storeProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startEdit = (p?: StoreProduct) => {
      if (p) setEditProduct(p);
      else setEditProduct({
          title: '', slug: '', sku: '', type: 'physical', priceModel: 'fixed', 
          basePrice: 0, stock: 0, isAvailable: true, hasSinglePage: true, status: 'draft',
          featuredImage: '', createdAt: new Date().toISOString()
      });
      setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editProduct.title || !editProduct.basePrice) return;
      
      const product = {
          ...editProduct,
          id: editProduct.id || Date.now().toString(),
          slug: editProduct.slug || editProduct.title?.toLowerCase().replace(/\s+/g, '-')
      } as StoreProduct;

      if (editProduct.id) updateStoreProduct(product);
      else addStoreProduct(product);
      setIsEditing(false);
  };

  // Styles
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase";

  if (isEditing) {
      return (
          <form onSubmit={handleSave} className="space-y-6 pb-20 animate-fadeIn">
              <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => setIsEditing(false)} className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ChevronLeft size={20} className="rtl:rotate-180" />
                </button>
                <h1 className="text-2xl font-bold dark:text-white">{editProduct.id ? t('edit') : t('add_product')}</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                      <Card>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                  <label className={labelClass}>{t('title')}</label>
                                  <input type="text" value={editProduct.title} onChange={e => setEditProduct({...editProduct, title: e.target.value})} className={inputClass} required />
                              </div>
                              <div>
                                  <label className={labelClass}>{t('sku')}</label>
                                  <input type="text" value={editProduct.sku} onChange={e => setEditProduct({...editProduct, sku: e.target.value})} className={inputClass} />
                              </div>
                          </div>
                          <div className="mb-4">
                              <label className={labelClass}>{t('slug')}</label>
                              <input type="text" value={editProduct.slug} onChange={e => setEditProduct({...editProduct, slug: e.target.value})} className={`${inputClass} font-mono text-sm`} />
                          </div>
                          <div>
                              <label className={labelClass}>{t('excerpt')}</label>
                              <textarea value={editProduct.excerpt} onChange={e => setEditProduct({...editProduct, excerpt: e.target.value})} className={`${inputClass} h-24 resize-none`} />
                          </div>
                      </Card>

                      <Card>
                          <h3 className="font-bold mb-4 dark:text-white">{t('price')} & {t('stock')}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                  <label className={labelClass}>{t('price_model')}</label>
                                  <select value={editProduct.priceModel} onChange={e => setEditProduct({...editProduct, priceModel: e.target.value as any})} className={inputClass}>
                                      <option value="fixed">{t('fixed')}</option>
                                      <option value="dollar_based">{t('dollar_based')}</option>
                                  </select>
                              </div>
                              <div>
                                  <label className={labelClass}>{t('base_price')} {editProduct.priceModel === 'dollar_based' ? '($)' : '(T)'}</label>
                                  <input type="number" value={editProduct.basePrice} onChange={e => setEditProduct({...editProduct, basePrice: parseInt(e.target.value)})} className={inputClass} required />
                              </div>
                          </div>
                          
                          {/* Real-time preview */}
                          {editProduct.priceModel === 'dollar_based' && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300 mb-4 font-bold flex justify-between">
                                  <span>{t('dollar_rate')}: {storeUtils.formatPrice(storeConfig.dollarRate)}</span>
                                  <span>{t('final_price')}: {storeUtils.formatPrice((editProduct.basePrice || 0) * storeConfig.dollarRate)}</span>
                              </div>
                          )}

                          <div>
                              <label className={labelClass}>{t('stock')}</label>
                              <input type="number" value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: parseInt(e.target.value)})} className={inputClass} />
                          </div>
                      </Card>
                  </div>

                  {/* Right: Settings */}
                  <div className="space-y-6">
                      <Card>
                          <h3 className="font-bold mb-4 dark:text-white">{t('status')}</h3>
                          <div className="space-y-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={editProduct.status === 'published'} onChange={e => setEditProduct({...editProduct, status: e.target.checked ? 'published' : 'draft'})} />
                                  <span className="text-sm dark:text-gray-300">{t('published')}</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={editProduct.isAvailable} onChange={e => setEditProduct({...editProduct, isAvailable: e.target.checked})} />
                                  <span className="text-sm dark:text-gray-300">{t('available')}</span>
                              </label>
                          </div>
                      </Card>

                      <Card>
                          <h3 className="font-bold mb-4 dark:text-white">SEO Settings</h3>
                          <div className="space-y-3">
                              <label className="flex items-center gap-2 cursor-pointer mb-2">
                                  <input type="checkbox" checked={editProduct.hasSinglePage} onChange={e => setEditProduct({...editProduct, hasSinglePage: e.target.checked})} />
                                  <span className="text-sm dark:text-gray-300">{t('has_single_page')}</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer mb-4">
                                  <input type="checkbox" checked={editProduct.noIndex} onChange={e => setEditProduct({...editProduct, noIndex: e.target.checked})} />
                                  <span className="text-sm dark:text-gray-300">{t('no_index')}</span>
                              </label>
                              <div>
                                  <label className={labelClass}>{t('meta_title')}</label>
                                  <input type="text" value={editProduct.metaTitle || ''} onChange={e => setEditProduct({...editProduct, metaTitle: e.target.value})} className={inputClass} />
                              </div>
                          </div>
                      </Card>

                      <Card>
                          <h3 className="font-bold mb-4 dark:text-white">{t('featured_image')}</h3>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-primary-500 overflow-hidden relative group" onClick={() => setShowMediaModal(true)}>
                              {editProduct.featuredImage ? (
                                  <img src={editProduct.featuredImage} className="w-full h-full object-cover" alt="product" />
                              ) : (
                                  <ImageIcon className="text-gray-400" size={32} />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                                  {t('select_media')}
                              </div>
                          </div>
                      </Card>

                      <Button type="submit" className="w-full justify-center rounded-xl shadow-lg">
                          <Save size={18} className="mr-2" /> {t('save')}
                      </Button>
                  </div>
              </div>
              {showMediaModal && <MediaSelector onSelect={(url) => setEditProduct({...editProduct, featuredImage: url})} onClose={() => setShowMediaModal(false)} />}
          </form>
      );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">{t('products')}</h1>
            <Button onClick={() => startEdit()}><Plus size={18} className="mr-2" />{t('add_product')}</Button>
        </div>

        <div className="relative">
            <input 
                type="text" 
                placeholder={t('search_placeholder_admin')} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginated.map(p => {
                const finalPrice = storeUtils.calculatePrice(p, storeConfig);
                return (
                    <Card key={p.id} className="p-0 overflow-hidden group hover:shadow-lg transition-all border-none">
                        <div className="h-48 bg-gray-100 dark:bg-gray-900 relative">
                            {p.featuredImage && <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" />}
                            <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold shadow-sm backdrop-blur-sm">
                                {p.priceModel === 'dollar_based' ? '$' : 'T'}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{p.title}</h3>
                            <p className="text-xs text-gray-500 mb-3">{p.sku}</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-primary-600">{storeUtils.formatPrice(finalPrice)}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => startEdit(p)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:text-primary-500"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteStoreProduct(p.id)} className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
        <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};
