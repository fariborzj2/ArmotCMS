
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trash2, MessageSquare, ExternalLink, Check, XCircle, Reply, ShieldAlert, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import { Comment } from '../../types';
import { Pagination } from '../../components/ui/Pagination';

export const CommentManager = () => {
  const { t, comments, pages, deleteComment, updateComment, replyToComment, lang, user, posts } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('all');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getPageTitle = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) return page.title;
    const post = posts.find(p => p.id === pageId);
    return post ? post.title : 'Unknown Page';
  };

  const getPageSlug = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) return page.slug;
    const post = posts.find(p => p.id === pageId);
    return post ? `blog/post/${post.id}-${post.slug}` : '#';
  };

  const handleDelete = (id: string) => {
    if (confirm(t('delete') + '?')) {
      deleteComment(id);
    }
  };

  const handleStatusChange = (comment: Comment, status: 'approved' | 'pending' | 'spam') => {
    updateComment({ ...comment, status });
  };

  const openReplyModal = (id: string) => {
    setActiveCommentId(id);
    setReplyContent('');
    setReplyModalOpen(true);
  };

  const submitReply = () => {
    if (!activeCommentId || !replyContent) return;
    const reply: Comment = {
        id: Date.now().toString(),
        pageId: '', // Parent ID suffices for context
        author: user?.username || 'Admin',
        content: replyContent,
        date: new Date().toLocaleDateString(),
        status: 'approved', // Admin replies auto-approved
        avatar: user?.avatar
    };
    replyToComment(activeCommentId, reply);
    setReplyModalOpen(false);
  };

  const filteredComments = comments.filter(c => {
    const statusMatch = filter === 'all' || c.status === filter;
    const searchMatch = 
        c.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.author.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const paginatedComments = filteredComments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('comments_manager')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-4 space-x-reverse overflow-x-auto">
            {['all', 'pending', 'approved', 'spam'].map((f) => (
                <button
                    key={f}
                    onClick={() => { setFilter(f as any); setCurrentPage(1); }}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 capitalize whitespace-nowrap ${
                        filter === f ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
                    }`}
                >
                    {t(f as any)}
                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">
                        {comments.filter(c => f === 'all' ? true : c.status === f).length}
                    </span>
                </button>
            ))}
        </div>
        
        {/* Search */}
        <div className="relative">
            <input 
                type="text" 
                placeholder={t('search_placeholder_admin')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white w-full md:w-64"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-700 overflow-hidden">
        <div className="">
          <table className="w-full text-left rtl:text-right block md:table">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">{t('author')}</th>
                <th className="px-6 py-3">{t('message')}</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3">{t('on_page')}</th>
                <th className="px-6 py-3">{t('date')}</th>
                <th className="px-6 py-3 text-right rtl:text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedComments.map((comment) => (
                <tr key={comment.id} className="block md:table-row bg-white dark:bg-gray-800 md:bg-transparent rounded-xl shadow-sm md:shadow-none border border-gray-200 dark:border-gray-700 md:border-none p-4 md:p-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 font-medium dark:text-white flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('author')}</span>
                    <div className="flex flex-col">
                        <span>{comment.author}</span>
                        <span className="text-xs text-gray-400">{comment.email}</span>
                    </div>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 max-w-xs flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('message')}</span>
                    <div className="flex-1 text-right rtl:text-left md:text-left rtl:md:text-right">
                        <p className="truncate">{comment.content}</p>
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-1 text-xs text-blue-500 flex items-center gap-1">
                                <Reply size={10} /> {comment.replies.length} {t('reply')}
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                     <span className="md:hidden text-gray-500 text-xs font-bold">{t('status')}</span>
                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${comment.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {comment.status === 'approved' && <Check size={10} />}
                        {comment.status === 'pending' && <ClockIcon size={10} />}
                        {comment.status === 'spam' && <ShieldAlert size={10} />}
                        {t(comment.status)}
                     </span>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('on_page')}</span>
                    <Link to={`/${getPageSlug(comment.pageId)}`} target="_blank" className="flex items-center gap-1 text-primary-600 hover:underline text-sm">
                      {getPageTitle(comment.pageId)}
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 text-sm flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('date')}</span>
                    {formatDate(comment.date, lang)}
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-right rtl:text-left flex justify-between items-center md:block">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('actions')}</span>
                    <div className="flex items-center justify-end gap-1">
                        {comment.status !== 'approved' && (
                            <button 
                                onClick={() => handleStatusChange(comment, 'approved')} 
                                className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" 
                                title={t('approve')}
                            >
                                <Check size={16} />
                            </button>
                        )}
                        {comment.status === 'approved' && (
                            <button 
                                onClick={() => handleStatusChange(comment, 'pending')} 
                                className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded" 
                                title={t('unapprove')}
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                        <button 
                            onClick={() => openReplyModal(comment.id)} 
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" 
                            title={t('reply')}
                        >
                            <Reply size={16} />
                        </button>
                        {comment.status !== 'spam' && (
                             <button 
                                onClick={() => handleStatusChange(comment, 'spam')} 
                                className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded" 
                                title={t('spam')}
                            >
                                <ShieldAlert size={16} />
                            </button>
                        )}
                        <button 
                            onClick={() => handleDelete(comment.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title={t('delete')}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComments.length === 0 && (
                <tr className="block md:table-row">
                  <td colSpan={6} className="block md:table-cell px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <MessageSquare size={32} className="text-gray-300" />
                        <span>{t('no_comments')}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
            totalItems={filteredComments.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
      />

      {/* Reply Modal */}
      {replyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg shadow-2xl p-6">
                 <h3 className="text-lg font-bold mb-4 dark:text-white">{t('reply')}</h3>
                 <textarea 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 dark:text-white h-32"
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                 />
                 <div className="flex justify-end gap-2 mt-4">
                     <Button variant="ghost" onClick={() => setReplyModalOpen(false)}>{t('cancel')}</Button>
                     <Button onClick={submitReply}>{t('submit')}</Button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

const ClockIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
