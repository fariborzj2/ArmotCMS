
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { User, MessageSquare, Reply } from 'lucide-react';
import { Comment } from '../../types';
import { formatDate } from '../../utils/date';

interface CommentSectionProps {
  pageId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ pageId }) => {
  const { t, plugins, comments, addComment, lang } = useApp();
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Plugin Check
  const isPluginActive = plugins.some(p => p.id === 'comments-plus' && p.active);
  if (!isPluginActive) return null;

  // Filter approved comments
  const pageComments = comments.filter(c => c.pageId === pageId && c.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      pageId,
      author,
      email,
      content,
      date: new Date().toLocaleDateString(),
      status: 'pending', // Default to pending for moderation
      replies: []
    };

    addComment(newComment);
    setAuthor('');
    setEmail('');
    setContent('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-lg">
           <MessageSquare size={20} />
        </div>
        <h3 className="text-2xl font-bold dark:text-white">{t('comments')} ({pageComments.length})</h3>
      </div>

      <div className="space-y-6 mb-10">
        {pageComments.length === 0 ? (
          <p className="text-gray-500 italic">{t('no_comments')}</p>
        ) : (
          pageComments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
               <div className="flex items-center gap-3 mb-3">
                 {comment.avatar ? (
                    <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User size={18} className="text-gray-500" />
                    </div>
                 )}
                 <div>
                    <span className="font-bold text-sm dark:text-white block">{comment.author}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.date, lang)}</span>
                 </div>
               </div>
               
               <p className="text-gray-700 dark:text-gray-300 text-sm ml-14 rtl:mr-14 rtl:ml-0 leading-relaxed">
                  {comment.content}
               </p>

               {/* Replies */}
               {comment.replies && comment.replies.length > 0 && (
                   <div className="mt-4 mr-14 rtl:mr-0 rtl:ml-14 space-y-4">
                       {comment.replies.map(reply => (
                           <div key={reply.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-primary-500">
                               <div className="flex items-center gap-2 mb-2">
                                   <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-full p-1">
                                       <Reply size={12} />
                                   </div>
                                   <span className="font-bold text-xs dark:text-white">{reply.author}</span>
                                   <span className="text-[10px] text-gray-400">{formatDate(reply.date, lang)}</span>
                               </div>
                               <p className="text-gray-600 dark:text-gray-400 text-sm">{reply.content}</p>
                           </div>
                       ))}
                   </div>
               )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
         <h4 className="font-bold mb-4 dark:text-white">{t('leave_comment')}</h4>
         {submitted ? (
             <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 text-sm">
                 {t('comment_moderation_msg')}
             </div>
         ) : (
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input 
                            type="text" 
                            placeholder={t('name')}
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input 
                            type="email" 
                            placeholder={t('email')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                        />
                    </div>
                </div>
                <div>
                <textarea 
                    placeholder={t('message')}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24"
                    required
                />
                </div>
                <Button type="submit">{t('submit')}</Button>
            </div>
         )}
      </form>
    </div>
  );
};
