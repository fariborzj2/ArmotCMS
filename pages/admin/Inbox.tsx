
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Mail, CheckCircle, Trash2, MailOpen } from 'lucide-react';
import { formatDate } from '../../utils/date';

export const Inbox = () => {
  const { t, messages, markMessageRead, deleteMessage, lang } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('inbox')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {messages.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MailOpen size={48} className="mb-4 opacity-20" />
            <p>{t('no_messages')}</p>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id} className={`transition-all duration-200 ${!msg.read ? 'border-primary-500 ring-1 ring-primary-100 dark:ring-primary-900' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!msg.read ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      <Mail size={18} />
                   </div>
                   <div>
                      <h3 className={`font-bold ${!msg.read ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {msg.name}
                      </h3>
                      <p className="text-xs text-gray-500">{msg.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 md:self-start">
                   <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                     {formatDate(msg.date, lang)}
                   </span>
                   <div className="flex gap-1">
                      {!msg.read && (
                        <button 
                          onClick={() => markMessageRead(msg.id)}
                          className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          title={t('mark_read')}
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                           if(confirm(t('delete') + '?')) deleteMessage(msg.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title={t('delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                {msg.message}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
