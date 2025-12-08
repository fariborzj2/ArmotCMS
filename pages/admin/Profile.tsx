
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Lock, Save } from 'lucide-react';

export const Profile = () => {
  const { t, user, loginUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert(t('error') + ': Passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          username: formData.username,
          email: formData.email
        };
        loginUser(updatedUser);
        alert(t('success'));
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">{t('profile')}</h1>

      <form onSubmit={handleSave}>
        <Card className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
             <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600">
               <span className="text-3xl font-bold">{formData.username.charAt(0).toUpperCase()}</span>
             </div>
             <div>
               <h3 className="text-lg font-bold dark:text-white">{formData.username}</h3>
               <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs px-2 py-1 rounded capitalize">
                 {user?.role}
               </span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('change_password')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={16} />
                    </div>
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 rtl:pl-3 rtl:pr-10 p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password')}</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  />
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <Button type="submit" isLoading={loading}>
               <Save size={18} className="mr-2" />
               {t('update_profile')}
             </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
