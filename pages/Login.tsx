import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock } from 'lucide-react';

export const Login = () => {
  const { t, loginUser, config } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      loginUser({ username: 'Admin', email: 'admin@armot.com', role: 'admin' });
      navigate('/admin');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
             <Lock size={24} />
           </div>
           <h2 className="text-2xl font-bold dark:text-white">{t('login')}</h2>
           <p className="text-gray-500">{config.siteName} Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
            <input type="email" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
            <input type="password" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 dark:text-white" required />
          </div>

          <Button className="w-full justify-center" type="submit" isLoading={loading}>
            {t('login')}
          </Button>
        </form>
      </Card>
    </div>
  );
};