

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Calendar, Settings, FileText, CheckCircle, Clock, Link as LinkIcon, Edit3, Globe, List, Plus, Trash2 } from 'lucide-react';
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
    
    // Prepare internal linking context and allowed tags
    const existingPosts = posts.map(p => ({ title: p.title, slug: `${p.id}-${p.slug}` }));
    const allowedTagNames = tags.map(t => t.name);

    try {
      let result;
      if (mode === 'topic') {
        result = await aiService.generatePost(input, smartConfig.preferredModel, existingPosts, allowedTagNames);
      } else {
        // Crawler Mode
        result = await aiService.crawlAndRewrite(input, smartConfig.preferredModel, existingPosts, allowedTagNames);
      }
      
      // Generate Image if enabled
      if (smartConfig.enableImageGen && result.title) {
          const imageBase64 = await aiService.generateBlogImage(result.title);
          if (imageBase64) {
              result.featuredImage = imageBase64;
          }
      }

      setGeneratedDraft(result);
    } catch (e) {
      alert(t('ai_error'));
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
    const dates = posts.map(p => p.publishDate || p.createdAt);
    try {
        const slots = await aiService.optimizeSchedule(dates, smartConfig.preferredModel);
        setScheduleSlots(slots);
    } catch (e) {
        alert(t('ai_error'));
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
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
      <span className="font-medium dark:text-white">{label}</span>
      <button 
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`}></span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl text-purple-600">
           <Sparkles size={32} />
        </div>
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('smart_assistant')}</h1>
           <p className="text-gray-500">{t('smart_assistant_desc')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-4 space-x-reverse overflow-x-auto">
         <button onClick={() => setActiveTab('factory')} className={`pb-3 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'factory' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>
            <FileText size={16} /> {t('content_factory')}
         </button>
         <button onClick={() => setActiveTab('scheduler')} className={`pb-3 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'scheduler' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>
            <Calendar size={16} /> {t('scheduler')}
         </button>
         <button onClick={() => setActiveTab('sources')} className={`pb-3 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'sources' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>
            <List size={16} /> {t('crawler_sources')}
         </button>
         <button onClick={() => setActiveTab('settings')} className={`pb-3 px-4 font-medium border-b-2 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'settings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>
            <Settings size={16} /> {t('ai_settings')}
         </button>
      </div>

      {/* --- FACTORY TAB --- */}
      {activeTab === 'factory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card>
              <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => { setMode('topic'); setInput(''); }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${mode === 'topic' ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                  >
                      <Edit3 size={16} />
                      {t('generator_mode')}
                  </button>
                  <button 
                    onClick={() => { setMode('crawler'); setInput(''); }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${mode === 'crawler' ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}
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
                        className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white h-48 focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    />
                    {mode === 'crawler' && (
                        <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2">
                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-1 rounded flex items-center gap-1">
                                <Globe size={12} /> {t('support_url_text')}
                            </span>
                        </div>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700">
                    <CheckCircle size={14} className="text-green-500" />
                    {mode === 'crawler' ? t('journalistic_tone') : t('seo_optimized')}
                 </div>

                 <Button onClick={handleGenerate} isLoading={loading} className="w-full justify-center py-3">
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
                    <Button size="sm" onClick={saveDraft}>{t('save_as_draft')}</Button>
                </div>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                   <div>
                       <span className="font-bold text-gray-900 dark:text-white block mb-1">{t('title')}:</span>
                       {generatedDraft.title}
                   </div>
                   {generatedDraft.featuredImage && (
                       <div className="my-2">
                           <span className="font-bold text-gray-900 dark:text-white block mb-1">{t('featured_image')}:</span>
                           <img src={generatedDraft.featuredImage} alt="AI Generated" className="h-32 rounded object-cover" />
                       </div>
                   )}
                   <div>
                       <span className="font-bold text-gray-900 dark:text-white block mb-1">{t('slug')}:</span>
                       <span className="font-mono text-xs text-gray-500">{generatedDraft.slug}</span>
                   </div>
                   {generatedDraft.tags && (
                        <div className="flex gap-1 flex-wrap">
                            {generatedDraft.tags.map(t => <span key={t} className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">#{t}</span>)}
                        </div>
                   )}
                   <div>
                       <span className="font-bold text-gray-900 dark:text-white block mb-1">{t('excerpt')}:</span>
                       {generatedDraft.excerpt}
                   </div>
                   {generatedDraft.faqs && (
                       <div>
                           <span className="font-bold text-gray-900 dark:text-white block mb-1">{t('faqs')}:</span>
                           {generatedDraft.faqs.length} items
                       </div>
                   )}
                </div>
             </Card>
           ) : (
             <div className="flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 h-full min-h-[300px]">
                 <div className="text-center">
                     {loading ? (
                         <div className="animate-pulse">
                             <Sparkles size={48} className="mx-auto mb-2 text-purple-400" />
                             <p>{t('processing')}</p>
                             {smartConfig.enableImageGen && <p className="text-xs mt-1 text-purple-500">{t('generating_image')}</p>}
                         </div>
                     ) : (
                         <>
                            <FileText size={48} className="mx-auto mb-2 opacity-20" />
                            <p>{t('generated_content_here')}</p>
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
              <Card className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-full text-blue-600 shadow-sm">
                          <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg dark:text-white">{t('calendar_view')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('calendar_desc')}</p>
                      </div>
                  </div>
                  <Button onClick={handleOptimizeSchedule} isLoading={scheduleLoading}>
                      <Clock size={18} className="mr-2" />
                      {t('suggest_schedule')}
                  </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {scheduleSlots.length > 0 ? (
                      scheduleSlots.map((slot, idx) => {
                          const slotDate = new Date(slot.date);
                          // Ensure valid date
                          if (isNaN(slotDate.getTime())) return null;

                          return (
                            <Card key={idx} className="relative overflow-hidden border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
                                <div className="mb-4 flex justify-between items-start">
                                    <div>
                                        <span className="font-bold text-xl dark:text-white block">{slot.bestTime}</span>
                                        <span className="text-xs text-gray-500 uppercase font-bold">{slotDate.toLocaleDateString('fa-IR', { weekday: 'long' })}</span>
                                    </div>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">{slotDate.toLocaleDateString('fa-IR')}</span>
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                                    <h4 className="font-bold text-primary-700 dark:text-primary-400 text-xs mb-1 uppercase">{t('topic_idea')}:</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{slot.topic}</p>
                                </div>
                                
                                <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                                    <CheckCircle size={12} className="text-green-500" />
                                    {slot.reason}
                                </div>
                                
                                <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => {
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
                      <div className="col-span-3 text-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="mb-4">{t('no_suggestions')}</p>
                          <p className="text-sm">{t('click_suggest')}</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- SOURCES TAB --- */}
      {activeTab === 'sources' && (
          <div className="space-y-6">
              <Card>
                  <h3 className="font-bold text-lg mb-4 dark:text-white">{t('add_source')}</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                      <input 
                          type="text" 
                          placeholder={t('source_name')}
                          value={newSourceName}
                          onChange={e => setNewSourceName(e.target.value)}
                          className="w-full md:flex-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                      />
                      <input 
                          type="text" 
                          placeholder={t('source_url')}
                          value={newSourceUrl}
                          onChange={e => setNewSourceUrl(e.target.value)}
                          className="w-full md:flex-[2] p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                      />
                      <Button onClick={handleAddSource} className="w-full md:w-auto">
                          <Plus size={18} />
                      </Button>
                  </div>
              </Card>

              <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-2">{t('name')}</th>
                                <th className="px-4 py-2">{t('url')}</th>
                                <th className="px-4 py-2">{t('status')}</th>
                                <th className="px-4 py-2">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {crawlerSources.map(source => (
                                <tr key={source.id}>
                                    <td className="px-4 py-3 font-medium dark:text-white">{source.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{source.url}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{source.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => deleteCrawlerSource(source.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {crawlerSources.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">{t('no_sources')}</td>
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
            <h3 className="font-bold text-lg mb-6 pb-2 border-b border-gray-100 dark:border-gray-700 dark:text-white">{t('config_title')}</h3>
            <div className="space-y-6">
               {/* Model */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('preferred_model')}</label>
                  <select 
                    value={smartConfig.preferredModel}
                    onChange={(e) => updateSmartConfig({ preferredModel: e.target.value as any })}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                  >
                     <option value="gemini-2.5-flash">Gemini 2.5 Flash ({t('model_fast')})</option>
                     <option value="gemini-3-pro-preview">Gemini 3.0 Pro ({t('model_high')})</option>
                  </select>
               </div>

               {/* Tone */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('default_tone')}</label>
                  <div className="flex gap-2">
                      {['formal', 'friendly', 'humorous'].map(tone => (
                          <button
                            key={tone}
                            onClick={() => updateSmartConfig({ replyTone: tone as any })}
                            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors border ${smartConfig.replyTone === tone ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                          >
                              {t(`tone_${tone}`)}
                          </button>
                      ))}
                  </div>
               </div>

                {/* Limits */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('reply_limit')}</label>
                  <input 
                    type="number" 
                    value={smartConfig.dailyReplyLimit}
                    onChange={(e) => updateSmartConfig({ dailyReplyLimit: parseInt(e.target.value) })}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('reply_limit_desc')}</p>
               </div>

               <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
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