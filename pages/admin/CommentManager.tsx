import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trash2, MessageSquare, ExternalLink, Check, XCircle, Reply, ShieldAlert, Search as SearchIcon, Sparkles, Smile, Frown, Meh, Tag, User as UserIcon, Clock } from 'lucide-react';
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

  // Modern Input Style matching other admin pages
  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:bg-white hover:border-gray-200 dark:hover:bg-gray-900 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-300 text-sm font-medium";

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
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black dark:text-white">{t('comments_manager')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Modern Segmented Tabs - Scrollable on mobile without scrollbar */}
        <div 
            className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl flex overflow-x-auto w-full md:w-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {['all', 'pending', 'approved', 'spam'].map((f) => (
                <button
                    key={f}
                    onClick={() => { setFilter(f as any); setCurrentPage(1); }}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative whitespace-nowrap ${
                        filter === f 
                        ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md scale-100 ring-1 ring-black/5 dark:ring-white/5' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {t(f as any)}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filter === f ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                            {comments.filter(c => f === 'all' ? true : c.status === f).length}
                        </span>
                    </span>
                </button>
            ))}
        </div>
        
        <div className="relative flex-1 md:max-w-xs">
            <input 
                type="text" 
                placeholder={t('search_placeholder_admin')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className={inputClass}
            />
            <div className="absolute top-1/2 left-4 rtl:left-auto rtl:right-4 -translate-y-1/2 text-gray-400 pointer-events-none">
                <SearchIcon size={20} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {paginatedComments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-transparent dark:border-gray-700/50 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar & Info */}
                    <div className="flex items-start gap-4 md:w-1/4 min-w-[200px]">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                             {comment.avatar ? <img src={comment.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : <UserIcon className="text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{comment.author}</h4>
                            <p className="text-xs text-gray-500 truncate">{comment.email}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg w-fit">
                                <Clock size={10} />
                                {formatDate(comment.date, lang)}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border
                                ${comment.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 
                                  comment.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30' : 
                                  'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'}`}>
                                {comment.status === 'approved' && <Check size={10} />}
                                {comment.status === 'pending' && <Clock size={10} />}
                                {comment.status === 'spam' && <ShieldAlert size={10} />}
                                {t(comment.status)}
                            </span>
                            <Link to={`/${getPageSlug(comment.pageId)}`} target="_blank" className="text-xs text-primary-600 hover:underline flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">
                                {t('on_page')}: {getPageTitle(comment.pageId)} <ExternalLink size={10} />
                            </Link>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {comment.content}
                        </p>

                        {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-4 rtl:ml-0 rtl:mr-4 pl-4 rtl:pl-0 rtl:pr-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-gray-200 dark:border-gray-700 space-y-2">
                                {comment.replies.map(r => (
                                    <div key={r.id} className="text-xs text-gray-500">
                                        <span className="font-bold text-primary-600">@{r.author}:</span> {r.content}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 md:w-32 shrink-0 border-t md:border-t-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-4 rtl:md:pl-0 rtl:md:pr-4 justify-center">
                        {comment.status !== 'approved' && (
                            <button onClick={() => handleStatusChange(comment, 'approved')} className="flex-1 md:flex-none py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <Check size={14} /> {t('approve')}
                            </button>
                        )}
                        {comment.status === 'approved' && (
                            <button onClick={() => handleStatusChange(comment, 'pending')} className="flex-1 md:flex-none py-2 px-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <XCircle size={14} /> {t('unapprove')}
                            </button>
                        )}
                        <button onClick={() => openReplyModal(comment.id)} className="flex-1 md:flex-none py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                            <Reply size={14} /> {t('reply')}
                        </button>
                        <button onClick={() => handleDelete(comment.id)} className="flex-1 md:flex-none py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={14} /> {t('delete')}
                        </button>
                    </div>
                </div>
            </div>
          ))}
      </div>

      <Pagination 
            totalItems={filteredComments.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
      />

      {/* Reply Modal */}
      {replyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-lg shadow-2xl p-8 border border-white/20">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
                        <Reply size={24} className="text-primary-500" />
                        {t('reply')}
                    </h3>
                    {isSmartActive && activeComment && (
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            {['formal', 'friendly', 'humorous'].map((tone) => (
                                <button
                                    key={tone}
                                    onClick={() => handleToneChange(tone as any)}
                                    disabled={isLimitReached}
                                    className={`text-[10px] px-2 py-1.5 rounded-lg transition-all font-bold ${selectedTone === tone ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {t(`tone_${tone}`)}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
                 
                 {activeComment && (
                    <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 max-h-40 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                                    {activeComment.author.charAt(0)}
                                </div>
                                <span className="font-bold text-sm dark:text-white">{activeComment.author}</span>
                            </div>
                            
                            {analysisResult && (
                                <div className="flex gap-2">
                                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold flex items-center gap-1 ${
                                        analysisResult.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                        analysisResult.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {analysisResult.sentiment === 'positive' ? <Smile size={12} /> : analysisResult.sentiment === 'negative' ? <Frown size={12} /> : <Meh size={12} />}
                                        {t(`sentiment_${analysisResult.sentiment}`)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">"{activeComment.content}"</p>
                    </div>
                 )}

                 <div className="relative">
                    <textarea 
                        className={`${inputClass} h-32 resize-none`}
                        placeholder={t('reply')}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                    {isSmartActive && aiLoading && (
                        <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2 text-purple-600 text-xs font-bold animate-pulse bg-purple-50 px-2 py-1 rounded-lg">
                            <Sparkles size={12} /> {t('generating')}
                        </div>
                    )}
                 </div>
                 
                 <div className="flex justify-end gap-3 mt-6">
                     <Button variant="ghost" onClick={() => setReplyModalOpen(false)} className="rounded-xl">{t('cancel')}</Button>
                     <Button onClick={submitReply} className="rounded-xl px-8 shadow-lg shadow-primary-500/30">{t('submit')}</Button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};