
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DollarSign, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { storeUtils } from '../../../utils/store';

export const StoreSettings = () => {
  const { t, storeConfig, updateStoreConfig } = useApp();
  const [rate, setRate] = useState(storeConfig.dollarRate);
  
  const handleUpdate = () => {
      updateStoreConfig({ 
          dollarRate: rate,
          lastRateUpdate: new Date().toISOString()
      });
      alert(t('success'));
  };

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <DollarSign className="text-primary-500" />
            {t('store_settings')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white">{t('dollar_rate')}</h3>
                    <span className="text-xs text-gray-500">
                        {t('last_updated')}: {new Date(storeConfig.lastRateUpdate).toLocaleString('fa-IR')}
                    </span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm text-blue-700 dark:text-blue-300">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>Pricing changes here will instantly affect all products using "Dollar Based" model.</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('dollar_rate')} (Toman)</label>
                        <input 
                            type="number" 
                            value={rate} 
                            onChange={(e) => setRate(parseInt(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none text-lg font-bold"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleUpdate} size="lg" className="rounded-xl px-8">
                        <Save size={18} className="mr-2" /> {t('update_rate')}
                    </Button>
                </div>
            </Card>

            <Card>
                <h3 className="font-bold text-lg dark:text-white mb-6">Currency Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Base Currency</label>
                        <select 
                            value={storeConfig.currency}
                            onChange={(e) => updateStoreConfig({ currency: e.target.value as any })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer"
                        >
                            <option value="IRT">{t('toman')}</option>
                            <option value="IRR">Rial</option>
                            <option value="USD">{t('usd')}</option>
                        </select>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
