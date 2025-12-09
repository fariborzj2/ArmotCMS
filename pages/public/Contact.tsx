
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSeo } from '../../hooks/useSeo';
import { ContactMessage } from '../../types';

export const Contact = () => {
  const { t, addMessage } = useApp();
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useSeo({
    title: t('contact_us'),
    description: 'Get in touch with us for support, sales, or any other inquiries.',
    type: 'website'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMessage: ContactMessage = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      message: formData.message,
      date: new Date().toISOString(),
      read: false
    };

    addMessage(newMessage);
    setSent(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4">
          {t('contact_us')}
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          We'd love to hear from you. Send us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
           <Card className="h-full">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg text-primary-600">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Email Us</h3>
                        <p className="text-gray-500">support@armotcms.com</p>
                        <p className="text-gray-500">sales@armotcms.com</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg text-primary-600">
                        <Phone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Call Us</h3>
                        <p className="text-gray-500">+1 (555) 123-4567</p>
                        <p className="text-gray-500">Mon-Fri from 8am to 5pm</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg text-primary-600">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Visit Us</h3>
                        <p className="text-gray-500">123 Innovation Dr.</p>
                        <p className="text-gray-500">Tech City, TC 90210</p>
                    </div>
                </div>
              </div>
           </Card>
        </div>

        <div>
           <Card>
             {sent ? (
                 <div className="text-center py-12">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Send size={32} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('success')}!</h3>
                     <p className="text-gray-500">Your message has been sent successfully.</p>
                     <Button variant="ghost" className="mt-4" onClick={() => setSent(false)}>Send Another</Button>
                 </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 dark:text-white"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                        <input 
                          type="email" 
                          required 
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 dark:text-white"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('message')}</label>
                        <textarea 
                          required 
                          rows={4} 
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 dark:text-white"
                          value={formData.message}
                          onChange={e => setFormData({...formData, message: e.target.value})}
                        ></textarea>
                    </div>
                    <Button type="submit" className="w-full justify-center py-3">
                        {t('send_message')}
                    </Button>
                </form>
             )}
           </Card>
        </div>
      </div>
    </div>
  );
};
