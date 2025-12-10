import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Calendar, Settings, FileText, CheckCircle, Clock, Link as LinkIcon, Edit3, Globe, List, Plus, Trash2, AlertCircle } from 'lucide-react';
import { aiService } from '../../../utils/ai';
import { ScheduleSlot, BlogPost, CrawlerSource } from '../../../types';

export const SmartAssistant = () => {
  const { t, smartConfig, updateSmartConfig, posts, addPost, crawlerSources, addCrawlerSource, deleteCrawlerSource, tags } = useApp();
  const [activeTab, setActiveTab] = useState<'factory' | 'scheduler' | 'sources' | 'settings'>('factory');
  
  // Factory State
  const [mode, setMode] = useState<'topic' | 'crawler'>('topic');
  const [input, setInput] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState<Partial<BlogPost> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Scheduler State
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Sources State
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');

  // --- Factory Handlers ---
  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    setGeneratedDraft(null);
    setErrorMsg('');
    
    // Prepare internal linking context and allowed tags
    const existingPosts = posts.map(p => ({ title: p.title, slug: `${p.id}-${p.slug}` }));
    const allowedTagNames = tags.map(t => t.name);

    try {
      let result;
      // 1. Generate Text Content
      if (mode === 'topic') {
        result = await aiService.generatePost(input, smartConfig.preferredModel, existingPosts, allowedTagNames);
      } else {
        result = await aiService.crawlAndRewrite(input, smartConfig.preferredModel, existingPosts, allowedTagNames);
      }
      
      // 2. Generate Image (Separate Try-Catch)
      if (smartConfig.enableImageGen && result.title) {
          try {
            const imageBase64 = await aiService.generateBlogImage(result.title);
            if (imageBase64) {
                result.featuredImage = imageBase64;
            }
          } catch (imgError: any) {
            console.error(imgError);
            setErrorMsg(t('ai_error') + " (Image quota exceeded, but text was generated)");
          }
      }

      setGeneratedDraft(result);
    } catch (e: any) {
      setErrorMsg(e.message || t('ai_error'));
    }
    setLoading(false);
  };

  const saveDraft = () => {
    if (generatedDraft && generatedDraft.title) {
      addPost({
        ...generatedDraft,
        id: Date.now().toString(),
        status: 'draft',
        author: 'AI Assistant',
        createdAt: new Date().toISOString(),
        categoryId: 'cat1', // Default
        views: 0
      } as BlogPost);
      alert(t('draft_saved'));
      setGeneratedDraft(null);
      setInput('');
    }
  };

  // --- Scheduler Handlers ---
  const handleOptimizeSchedule = async () => {
    setScheduleLoading(true);
    setErrorMsg('');
    const dates = posts.map(p => p.publishDate || p.createdAt);
    try {
        const slots = await aiService.optimizeSchedule(dates, smartConfig.preferredModel);
        setScheduleSlots(slots);
    } catch (e: any) {
        setErrorMsg(e.message || t('ai_error'));
    }
    setScheduleLoading(false);
  };

  // --- Sources Handlers ---
  const handleAddSource = () => {
      if(!newSourceUrl || !newSourceName) return;
      const newSource: CrawlerSource = {
          id: Date.now().toString(),
          name: newSourceName,
          url: newSourceUrl,
          status: 'active',
          lastCrawled: '-'
      };
      addCrawlerSource(newSource);
      setNewSourceUrl('');
      setNewSourceName('');
  };

  const ToggleSetting = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-colors">
      <span className="font-medium dark:text-white text-sm">{label}</span>
      <button 
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}></span>
      </button>
    </div>
  );

  // Styles
  const inputClass = "w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:bg-white hover:border-gray-200 dark:hover:bg-gray-900 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-300 text-sm font-medium";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl text-purple-600">
           <Sparkles size={32} />
        </div>
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('smart_assistant')}</h1>
           <p className="text-gray-500 text-xs mt-1">{t('smart_assistant_desc')}</p>
        </div>
      </div>

      {/* Modern Tabs - Horizontal Scroll with Hidden Scrollbar */}
      <div 
        className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl flex gap-1 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
         <button 
            onClick={() => setActiveTab('factory')} 
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'factory' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md scale-100 ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
         >
            <FileText size={16} /> {t('content_factory')}
         </button>
         <button 
            onClick={() => setActiveTab('scheduler')} 
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'scheduler' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md scale-100 ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
         >
            <Calendar size={16} /> {t('scheduler')}
         </button>
         <button 
            onClick={() => setActiveTab('sources')} 
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'sources' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md scale-100 ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
         >
            <List size={16} /> {t('crawler_sources')}
         </button>
         <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md scale-100 ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
         >
            <Settings size={16} /> {t('ai_settings')}
         </button>
      </div>

      {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-800">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{errorMsg}</p>
          </div>
      )}

      {/* --- FACTORY TAB --- */}
      {activeTab === 'factory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card>
              <div className="flex bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl mb-6">
                  <button 
                    onClick={() => { setMode('topic'); setInput(''); setErrorMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'topic' ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-500'}`}
                  >
                      <Edit3 size={16} />
                      {t('generator_mode')}
                  </button>
                  <button 
                    onClick={() => { setMode('crawler'); setInput(''); setErrorMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'crawler' ? 'bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 shadow-sm' : 'text-gray-500'}`}
                  >
                      <LinkIcon size={16} />
                      {t('crawler_mode')}
                  </button>
              </div>

              <div className="space-y-4">
                 <div className="relative">
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mode === 'topic' ? t('topic_prompt') : t('crawler_prompt')}
                        className={`${inputClass} h-48 focus:ring-primary-500 resize-none`}
                    />
                    {mode === 'crawler' && (
                        <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2">
                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                                <Globe size={12} /> {t('support_url_text')}
                            </span>
                        </div>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-2 text-xs text-gray-500 font-medium px-2">
                    <CheckCircle size={14} className="text-green-500" />
                    {mode === 'crawler' ? t('journalistic_tone') : t('seo_optimized')}
                 </div>

                 <Button onClick={handleGenerate} isLoading={loading} className="w-full justify-center py-4 rounded-2xl shadow-lg shadow-primary-500/20">
                    <Sparkles size={18} className="mr-2" />
                    {mode === 'crawler' ? t('analyze_rewrite') : t('generate_post')}
                 </Button>
              </div>
           </Card>

           {/* Preview Result */}
           {generatedDraft ? (
             <Card className="bg-white dark:bg-gray-800 border-2 border-green-500/20">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        {t('draft_preview')}
                    </h3>
                    <Button size="sm" onClick={saveDraft} className="rounded-xl px-4">{t('save_as_draft')}</Button>
                </div>
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                   <div>
                       <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{t('title')}</span>
                       <p className="font-bold text-lg text-gray-900 dark:text-white">{generatedDraft.title}</p>
                   </div>
                   {generatedDraft.featuredImage && (
                       <div className="my-2">
                           <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{t('featured_image')}</span>
                           <img src={generatedDraft.featuredImage} alt="AI Generated" className="h-32 w-full rounded-xl object-cover shadow-sm" />
                       </div>
                   )}
                   <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{t('slug')}</span>
                            <span className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 block truncate">{generatedDraft.slug}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{t('faqs')}</span>
                            <span className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 block">{generatedDraft.faqs?.length || 0} items</span>
                        </div>
                   </div>
                   
                   {generatedDraft.tags && (
                        <div className="flex gap-1 flex-wrap">
                            {generatedDraft.tags.map(t => <span key={t} className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-bold">#{t}</span>)}
                        </div>
                   )}
                   <div>
                       <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{t('excerpt')}</span>
                       <p className="italic text-gray-600 dark:text-gray-400">{generatedDraft.excerpt}</p>
                   </div>
                </div>
             </Card>
           ) : (
             <div className="flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-gray-400 h-full min-h-[300px] bg-gray-50/50 dark:bg-gray-900/20">
                 <div className="text-center">
                     {loading ? (
                         <div className="animate-pulse">
                             <Sparkles size={48} className="mx-auto mb-4 text-purple-400" />
                             <p className="font-bold">{t('processing')}</p>
                             {smartConfig.enableImageGen && <p className="text-xs mt-2 text-purple-500">{t('generating_image')}</p>}
                         </div>
                     ) : (
                         <>
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium opacity-50">{t('generated_content_here')}</p>
                         </>
                     )}
                 </div>
             </div>
           )}
        </div>
      )}

      {/* --- SCHEDULER TAB --- */}
      {activeTab === 'scheduler' && (
          <div className="space-y-6">
              <Card className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-none">
                  <div className="flex items-center gap-5">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl text-blue-600 shadow-sm">
                          <Calendar size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl dark:text-white mb-1">{t('calendar_view')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('calendar_desc')}</p>
                      </div>
                  </div>
                  <Button onClick={handleOptimizeSchedule} isLoading={scheduleLoading} className="rounded-2xl px-6 py-3 shadow-lg shadow-blue-500/20">
                      <Clock size={18} className="mr-2" />
                      {t('suggest_schedule')}
                  </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {scheduleSlots.length > 0 ? (
                      scheduleSlots.map((slot, idx) => {
                          const slotDate = new Date(slot.date);
                          if (isNaN(slotDate.getTime())) return null;

                          return (
                            <Card key={idx} className="relative overflow-hidden border-t-4 border-t-green-500 hover:shadow-xl transition-all group">
                                <div className="mb-4 flex justify-between items-start">
                                    <div>
                                        <span className="font-black text-2xl dark:text-white block tracking-tight">{slot.bestTime}</span>
                                        <span className="text-xs text-gray-500 uppercase font-bold">{slotDate.toLocaleDateString('fa-IR', { weekday: 'long' })}</span>
                                    </div>
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full font-mono text-gray-500">{slotDate.toLocaleDateString('fa-IR')}</span>
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                    <h4 className="font-bold text-primary-700 dark:text-primary-400 text-[10px] mb-1 uppercase tracking-wider">{t('topic_idea')}:</h4>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">{slot.topic}</p>
                                </div>
                                
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-6 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                                    <span className="truncate">{slot.reason}</span>
                                </div>
                                
                                <Button size="sm" variant="secondary" className="w-full text-xs rounded-xl" onClick={() => {
                                    setInput(slot.topic);
                                    setActiveTab('factory');
                                    setMode('topic');
                                }}>
                                    {t('create_draft')}
                                </Button>
                            </Card>
                          );
                      })
                  ) : (
                      <div className="col-span-3 text-center py-20 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                          <p className="mb-4 text-lg font-medium">{t('no_suggestions')}</p>
                          <p className="text-sm opacity-70">{t('click_suggest')}</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- SOURCES TAB --- */}
      {activeTab === 'sources' && (
          <div className="space-y-6">
              <Card>
                  <h3 className="font-bold text-lg mb-6 dark:text-white flex items-center gap-2">
                      <Plus className="bg-primary-100 text-primary-600 rounded-lg p-1" size={24} />
                      {t('add_source')}
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4">
                      <input 
                          type="text" 
                          placeholder={t('source_name')}
                          value={newSourceName}
                          onChange={e => setNewSourceName(e.target.value)}
                          className={`${inputClass} md:w-1/3`}
                      />
                      <input 
                          type="text" 
                          placeholder={t('source_url')}
                          value={newSourceUrl}
                          onChange={e => setNewSourceUrl(e.target.value)}
                          className={`${inputClass} md:flex-1 font-mono text-xs`}
                      />
                      <Button onClick={handleAddSource} className="w-full md:w-auto rounded-2xl px-6">
                          <Plus size={20} />
                      </Button>
                  </div>
              </Card>

              <Card className="p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="text-[10px] font-bold text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">{t('name')}</th>
                                <th className="px-6 py-4">{t('url')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4 text-right rtl:text-left">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {crawlerSources.map(source => (
                                <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold dark:text-white">{source.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs font-mono">{source.url}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full uppercase tracking-wide">{source.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right rtl:text-left">
                                        <button onClick={() => deleteCrawlerSource(source.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {crawlerSources.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-400 font-medium italic">{t('no_sources')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </Card>
          </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
         <Card className="max-w-2xl mx-auto">
            <h3 className="font-bold text-xl mb-8 pb-4 border-b border-gray-100 dark:border-gray-700 dark:text-white">{t('config_title')}</h3>
            <div className="space-y-8">
               {/* Model */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5">{t('preferred_model')}</label>
                  <select 
                    value={smartConfig.preferredModel}
                    onChange={(e) => updateSmartConfig({ preferredModel: e.target.value as any })}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                     <option value="gemini-2.5-flash">Gemini 2.5 Flash ({t('model_fast')})</option>
                     <option value="gemini-3-pro-preview">Gemini 3.0 Pro ({t('model_high')})</option>
                  </select>
               </div>

               {/* Tone */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{t('default_tone')}</label>
                  <div className="flex gap-3">
                      {['formal', 'friendly', 'humorous'].map(tone => (
                          <button
                            key={tone}
                            onClick={() => updateSmartConfig({ replyTone: tone as any })}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all border-2 ${
                                smartConfig.replyTone === tone 
                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                              {t(`tone_${tone}`)}
                          </button>
                      ))}
                  </div>
               </div>

                {/* Limits */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5">{t('reply_limit')}</label>
                  <input 
                    type="number" 
                    value={smartConfig.dailyReplyLimit}
                    onChange={(e) => updateSmartConfig({ dailyReplyLimit: parseInt(e.target.value) })}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-2 ml-1">{t('reply_limit_desc')}</p>
               </div>

               <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                   <ToggleSetting 
                      label={t('enable_auto_reply')} 
                      value={smartConfig.enableAutoReply} 
                      onChange={(v: boolean) => updateSmartConfig({ enableAutoReply: v })}
                   />
                   <ToggleSetting 
                      label={t('enable_scheduler')} 
                      value={smartConfig.enableScheduler} 
                      onChange={(v: boolean) => updateSmartConfig({ enableScheduler: v })}
                   />
                   <ToggleSetting 
                      label={t('enable_summary')} 
                      value={smartConfig.enableSummary} 
                      onChange={(v: boolean) => updateSmartConfig({ enableSummary: v })}
                   />
                   <ToggleSetting 
                      label={t('enable_image_gen')} 
                      value={smartConfig.enableImageGen} 
                      onChange={(v: boolean) => updateSmartConfig({ enableImageGen: v })}
                   />
               </div>
            </div>
         </Card>
      )}
    </div>
  );
};