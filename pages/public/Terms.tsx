import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { ScrollText } from 'lucide-react';

export const Terms = () => {
  const { t, config } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
            <ScrollText size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('terms_conditions')}
            </h1>
            <p className="text-gray-500">{t('last_updated')}: Oct 24, 2024</p>
        </div>
      </div>

      <Card className="prose prose-lg dark:prose-invert max-w-none p-8">
        <h3>1. Introduction</h3>
        <p>
          Welcome to {config.siteName}. By accessing our website and using our services, you agree to be bound by the following terms and conditions. 
          Please read them carefully.
        </p>

        <h3>2. Use of License</h3>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on {config.siteName}'s website for personal, 
          non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>

        <h3>3. User Accounts</h3>
        <p>
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. 
          Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>

        <h3>4. Content</h3>
        <p>
          Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. 
          You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
        </p>

        <h3>5. Termination</h3>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation 
          if you breach the Terms.
        </p>

        <h3>6. Changes</h3>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 
          30 days notice prior to any new terms taking effect.
        </p>
      </Card>
    </div>
  );
};