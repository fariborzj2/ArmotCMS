import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFound = () => {
  const { t } = useApp();
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-primary-200 dark:text-primary-900">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-6">{t('page_not_found')}</h2>
      <p className="text-gray-500 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button>
           <Home size={18} className="ltr:mr-2 rtl:ml-2" />
           {t('go_home')}
        </Button>
      </Link>
    </div>
  );
};