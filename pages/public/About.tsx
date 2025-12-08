
import React from 'react';
import { useApp } from '../../context/AppContext';
import { useSeo } from '../../hooks/useSeo';

export const About = () => {
  const { t, config } = useApp();

  useSeo({
    title: t('about_us'),
    description: t('about_desc'),
    type: 'website'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4">
          {t('about_us')}
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          {t('about_desc')}
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert mx-auto">
        <p>
            {config.siteName} یک پلتفرم قدرتمند است که برای ساده‌سازی مدیریت محتوای دیجیتال طراحی شده است. 
            ماموریت ما توانمندسازی توسعه‌دهندگان و تولیدکنندگان محتوا با ابزارهایی است که هم پیشرفته و هم ساده باشند.
        </p>
        <p>
            سیستم ما بر اساس اصول ماژولار بودن و سرعت بنا شده است و به شما اجازه می‌دهد تا بدون کاهش عملکرد، قابلیت‌ها را گسترش دهید.
        </p>
        <h3>ارزش‌های ما</h3>
        <ul>
            <li><strong>نوآوری:</strong> همیشه مرزهای تکنولوژی وب را جابجا می‌کنیم.</li>
            <li><strong>سادگی:</strong> ابزارهای قدرتمند را برای همه در دسترس قرار می‌دهیم.</li>
            <li><strong>جامعه:</strong> ساختن با هم در یک اکوسیستم پویا.</li>
        </ul>
      </div>
    </div>
  );
};
