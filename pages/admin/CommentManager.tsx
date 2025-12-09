

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trash2, MessageSquare, ExternalLink, Check, XCircle, Reply, ShieldAlert, Search as SearchIcon, Sparkles, Smile, Frown, Meh, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import { Comment } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { aiService } from '../../utils/ai';

export const CommentManager = () => {
  const { t, comments, pages, deleteComment, updateComment, replyToComment, lang, user, posts, plugins, smartConfig } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('all');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // New States for AI
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedTone, setSelectedTone] = useState<'formal'|'friendly'|'humorous'>(smartConfig.replyTone || 'formal');
  const [dailyUsage, setDailyUsage] = useState(0); // Mock usage counter

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isSmartActive = plugins.some(p => p.id === 'smart-assistant' && p.active) && smartConfig.enableAutoReply;
  const isLimitReached = dailyUsage >= smartConfig.dailyReplyLimit;

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
    setAnalysisResult(null); // Reset analysis
    setReplyModalOpen(true);
    
    // Auto-analyze if AI is active and limit not reached
    if (isSmartActive && !isLimitReached) {
        const comment = comments.find(c => c.id === id);
        if (comment) performAnalysis(comment.content);
    }
  };

  const performAnalysis = async (content: string) => {
      if (isLimitReached) return;
      setAiLoading(true);
      try {
        const result = await aiService.analyzeComment(content, selectedTone, smartConfig.preferredModel);
        setAnalysisResult(result);
        // Pre-fill suggested reply if available and field is empty
        if (result?.suggestedReply && !replyContent) {
            setReplyContent(result.suggestedReply);
            setDailyUsage(prev => prev + 1); // Increment usage
        }
      } catch (e) {
        console.error(e);
      }
      setAiLoading(false);
  };

  // Re-generate reply with new tone
  const handleToneChange = async (tone: 'formal'|'friendly'|'humorous') => {
      setSelectedTone(tone);
      if (isLimitReached) {
          alert(t('daily_limit_reached'));
          return;
      }
      const comment = comments.find(c => c.id === activeCommentId);
      if (comment) {
          setAiLoading(true);
          const result = await aiService.analyzeComment(comment.content, tone, smartConfig.preferredModel);
          if (result?.suggestedReply) {
              setReplyContent(result.suggestedReply);
              setDailyUsage(prev => prev + 1);
          }
          setAiLoading(false);
      }
  };

  const submitReply = () => {
    if (!activeCommentId || !replyContent) return;
    const reply: Comment = {
        id: Date.now().toString(),
        pageId: '', 
        author: user?.username || 'Admin',
        content: replyContent,
        date: new Date().toISOString(),
        status: 'approved',
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

  const activeComment = comments.find(c => c.id === activeCommentId);

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
                        <span className="text-[10px] text-gray-400 mt-1">{formatDate(comment.date, lang)}</span>
                    </div>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 max-w-xs flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('message')}</span>
                    <div className="flex-1 text-right rtl:text-left md:text-left rtl:md:text-right overflow-hidden">
                        <p className="truncate w-full max-w-[15rem] inline-block align-bottom" title={comment.content}>{comment.content}</p>
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
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold dark:text-white">{t('reply')}</h3>
                    {isSmartActive && activeComment && (
                        <div className="flex items-center gap-2">
                            {/* Tone Selectors */}
                            {['formal', 'friendly', 'humorous'].map((tone) => (
                                <button
                                    key={tone}
                                    onClick={() => handleToneChange(tone as any)}
                                    disabled={isLimitReached}
                                    className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedTone === tone ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {t(`tone_${tone}`)}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
                 
                 {activeComment && (
                    <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 max-h-40 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm dark:text-white">{activeComment.author}</span>
                                <span className="text-xs text-gray-500">{formatDate(activeComment.date, lang)}</span>
                            </div>
                            
                            {/* Analysis Badges */}
                            {analysisResult && (
                                <div className="flex gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                        analysisResult.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                        analysisResult.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {analysisResult.sentiment === 'positive' ? <Smile size={10} /> : analysisResult.sentiment === 'negative' ? <Frown size={10} /> : <Meh size={10} />}
                                        {t(`sentiment_${analysisResult.sentiment}`)}
                                    </span>
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Tag size={10} />
                                        {t(`type_${analysisResult.type}`)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{activeComment.content}</p>
                    </div>
                 )}

                 <div className="relative">
                    <textarea 
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 dark:text-white h-32 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder={t('reply')}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                    {isSmartActive && aiLoading && (
                        <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-2 text-purple-600 text-xs animate-pulse">
                            <Sparkles size={12} /> {t('generating')}
                        </div>
                    )}
                    {isLimitReached && isSmartActive && (
                        <div className="absolute top-2 right-2 text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                            <ShieldAlert size={10} />
                            {t('daily_limit_reached')} ({smartConfig.dailyReplyLimit})
                        </div>
                    )}
                 </div>
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
