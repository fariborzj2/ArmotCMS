
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, Layers, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';

export const Home = () => {
  const { t, isRTL, config } = useApp();
  const navigate = useNavigate();

  useSeo({
    title: t('welcome'),
    description: config.siteDescription,
    type: 'website'
  });

  const Feature = ({ icon: Icon, title, desc }: any) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center md:text-start">
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-600 mb-4 mx-auto md:mx-0">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-950 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            {t('hero_title')} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{config.siteName}</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10">
            {t('hero_subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/login')} className="px-8 py-3 text-lg h-auto">
              {t('get_started')} {isRTL ? <ArrowLeft className="mr-2" /> : <ArrowRight className="ml-2" />}
            </Button>
            <Button variant="secondary" className="px-8 py-3 text-lg h-auto">
              {t('documentation')}
            </Button>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Feature 
                icon={Layers} 
                title={t('modular_design')} 
                desc={t('modular_desc')}
              />
              <Feature 
                icon={Shield} 
                title={t('enterprise_security')} 
                desc={t('security_desc')}
              />
              <Feature 
                icon={Zap} 
                title={t('lightning_fast')} 
                desc={t('fast_desc')}
              />
           </div>
        </div>
      </div>
    </div>
  );
};
