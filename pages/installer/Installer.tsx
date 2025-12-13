import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Database, UserCheck, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { storage } from '../../utils/storage';

export const Installer = () => {
  const { t, lang, setLang, updateConfig, loginUser } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [dbConfig, setDbConfig] = useState({ host: 'localhost', name: 'armot_db', user: 'root', pass: '' });
  const [adminConfig, setAdminConfig] = useState({ username: 'admin', email: 'admin@example.com', password: '' });

  const nextStep = async () => {
    if (step === 2 && (!adminConfig.username || !adminConfig.password || !adminConfig.email)) {
        alert(t('error') + ': Please fill all fields.');
        return;
    }

    setIsLoading(true);
    // Simulate connection/processing delay
    setTimeout(() => {
      setIsLoading(false);
      setStep(prev => prev + 1);
    }, 1500);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const finishInstall = async () => {
    setIsLoading(true);
    setTimeout(() => {
      // 1. Save Config
      updateConfig({ 
        installed: true, 
        dbHost: dbConfig.host, 
        dbName: dbConfig.name 
      });
      
      // 2. Create User & Register in Auth DB
      const newUser = { username: adminConfig.username, email: adminConfig.email, role: 'admin' as const };
      storage.registerUser(newUser, adminConfig.password);
      
      // 3. Login
      loginUser(newUser);

      // 4. Redirect
      navigate('/');
      setIsLoading(false);
    }, 2000);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-primary-600' : 'text-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= i ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
            {i}
          </div>
          {i < 3 && <div className={`w-12 h-0.5 ${step > i ? 'bg-primary-600' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
          Armot<span className="font-light">Cms</span>
        </h1>
        <p className="text-gray-500">{t('installer_title')}</p>
      </div>

      <Card className="w-full max-w-lg">
        <StepIndicator />

        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Database className="text-primary-500" />
              {t('step_db')}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('db_host')}</label>
              <input 
                type="text" 
                value={dbConfig.host}
                onChange={e => setDbConfig({...dbConfig, host: e.target.value})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('db_name')}</label>
              <input 
                type="text" 
                value={dbConfig.name}
                onChange={e => setDbConfig({...dbConfig, name: e.target.value})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('db_user')}</label>
                <input 
                  type="text" 
                  value={dbConfig.user}
                  onChange={e => setDbConfig({...dbConfig, user: e.target.value})}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                />
               </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('db_pass')}</label>
                <input 
                  type="password" 
                  value={dbConfig.pass}
                  onChange={e => setDbConfig({...dbConfig, pass: e.target.value})}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                />
               </div>
             </div>

             <div className="pt-4 flex justify-between items-center">
                <button onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')} className="text-sm text-gray-500 hover:underline">
                  {lang === 'fa' ? 'English' : 'فارسی'}
                </button>
                <Button onClick={nextStep} isLoading={isLoading}>
                  {t('connect')} <ArrowRight size={16} className="rtl:rotate-180" />
                </Button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <UserCheck className="text-primary-500" />
              {t('step_admin')}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
              <input 
                type="text" 
                value={adminConfig.username}
                onChange={e => setAdminConfig({...adminConfig, username: e.target.value})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
              <input 
                type="email" 
                value={adminConfig.email}
                onChange={e => setAdminConfig({...adminConfig, email: e.target.value})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
              <input 
                type="password" 
                value={adminConfig.password}
                onChange={e => setAdminConfig({...adminConfig, password: e.target.value})}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="secondary" onClick={prevStep}>
                <ArrowLeft size={16} className="rtl:rotate-180" /> {t('back')}
              </Button>
              <Button onClick={nextStep} isLoading={isLoading}>
                 {t('continue')} <ArrowRight size={16} className="rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('success')}!</h2>
              <p className="text-gray-500 dark:text-gray-400">ArmotCms is ready to rock.</p>
            </div>
            
            <Button onClick={finishInstall} isLoading={isLoading} className="w-full justify-center">
              {t('step_finish')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};