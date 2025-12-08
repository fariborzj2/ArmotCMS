
import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const AccessDenied = () => {
  const { t } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-gray-900">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 text-red-600">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('access_denied')}</h1>
      <p className="text-gray-500 mb-8">{t('access_denied_msg')}</p>
      
      <Button onClick={() => navigate('/admin')}>
        <ArrowLeft className="mr-2 rtl:rotate-180" size={18} />
        {t('dashboard')}
      </Button>
    </div>
  );
};
