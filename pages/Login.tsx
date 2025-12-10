import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { storage } from '../utils/storage';

export const Login = () => {
  const { t, loginUser, config } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
      username: '',
      password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate network delay for realistic effect
    setTimeout(() => {
      const user = storage.validateUser(formData.username, formData.password);
      
      if (user) {
          loginUser(user);
          navigate('/admin');
      } else {
          setError(t('invalid_credentials'));
          setLoading(false);
      }
    }, 1000);
  };

  const modernInputClass = "w-full pl-10 rtl:pl-3 rtl:pr-10 py-4 rounded-2xl border-none bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 shadow-inner dark:shadow-none";

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/20 dark:bg-primary-900/20 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 p-8 md:p-10 relative z-10 animate-fadeIn border border-white/20">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30 transform rotate-3">
             <ShieldCheck size={32} className="text-white" />
           </div>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{t('welcome')}</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('login_to')} <span className="font-bold text-primary-600">{config.siteName}</span></p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors z-10">
                  <User size={20} />
                </div>
                <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className={modernInputClass}
                    placeholder={t('username')}
                    required 
                />
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors z-10">
                  <Lock size={20} />
                </div>
                <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className={modernInputClass}
                    placeholder={t('password')}
                    required 
                />
              </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500 dark:text-gray-400 select-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded-md border-gray-300 text-primary-600 focus:ring-primary-500 bg-gray-100 dark:bg-gray-800 dark:border-gray-700" />
                  {t('remember_me')}
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">{t('forgot_password')}</a>
          </div>

          <Button 
            className="w-full justify-center py-4 text-base font-extrabold bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/30 rounded-2xl active:scale-[0.98]" 
            type="submit" 
            isLoading={loading}
          >
            {t('login')} <ArrowRight size={20} className="ml-2 rtl:rotate-180" />
          </Button>
        </form>

        <div className="mt-10 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t('view_site')}
            </Link>
        </div>
      </div>
    </div>
  );
};