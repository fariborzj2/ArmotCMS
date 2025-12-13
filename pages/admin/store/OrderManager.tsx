
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ShoppingCart, Check, X, Truck, Search as SearchIcon, Trash2, Clock } from 'lucide-react';
import { storeUtils } from '../../../utils/store';
import { formatDate } from '../../../utils/date';
import { Pagination } from '../../../components/ui/Pagination';

export const OrderManager = () => {
  const { t, storeOrders, updateOrder, deleteOrder, lang } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredOrders = storeOrders.filter(o => 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
      const styles = {
          pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          shipped: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          canceled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      };
      // @ts-ignore
      return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.pending}`}>{t(status)}</span>;
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <ShoppingCart className="text-primary-500" />
                {t('orders')}
            </h1>
        </div>

        <div className="relative max-w-md">
            <input 
                type="text" 
                placeholder={t('search_placeholder_admin')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right">
                    <thead className="text-[10px] font-bold text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 tracking-wider">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">{t('customer')}</th>
                            <th className="px-6 py-4">{t('items')}</th>
                            <th className="px-6 py-4">{t('total')}</th>
                            <th className="px-6 py-4">{t('date')}</th>
                            <th className="px-6 py-4">{t('status')}</th>
                            <th className="px-6 py-4 text-right rtl:text-left">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginatedOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{order.id}</td>
                                <td className="px-6 py-4 font-bold dark:text-white">{order.customerName}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{order.items.length} items</td>
                                <td className="px-6 py-4 font-bold text-primary-600">{storeUtils.formatPrice(order.totalPrice)}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{formatDate(order.date, lang)}</td>
                                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                <td className="px-6 py-4 text-right rtl:text-left flex gap-1 justify-end">
                                    <button 
                                        onClick={() => updateOrder({...order, status: 'shipped'})} 
                                        className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" 
                                        title={t('shipped')}
                                        disabled={order.status === 'shipped'}
                                    >
                                        <Truck size={16} />
                                    </button>
                                    <button 
                                        onClick={() => updateOrder({...order, status: 'canceled'})} 
                                        className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100" 
                                        title={t('canceled')}
                                        disabled={order.status === 'canceled'}
                                    >
                                        <X size={16} />
                                    </button>
                                    <button onClick={() => deleteOrder(order.id)} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
        <Pagination totalItems={filteredOrders.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};
