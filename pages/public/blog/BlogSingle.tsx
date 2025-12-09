

import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useSeo } from '../../../hooks/useSeo';
import { CommentSection } from '../../../components/plugins/CommentSection';
import { User, Calendar, Tag, Folder, ChevronDown, ChevronUp, HelpCircle, Sparkles, Lightbulb } from 'lucide-react';
import { formatDate } from '../../../utils/date';
import { aiService } from '../../../utils/ai';

export const BlogSingle = () => {
  const { category, idSlug } = useParams<{ category: string, idSlug: string }>();
  const { posts, categories, t, config, lang, plugins, smartConfig } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [summary, setSummary] = useState<string>('');
  const [highlights, setHighlights] = useState<string>('');
  const [summarizing, setSummarizing] = useState(false);
  const [highlighting, setHighlighting] = useState(false);

  // Parse ID from "{id}-{slug}"
  const postId = idSlug?.split('-')[0];
  const post = posts.find(p => p.id === postId && p.status === 'published');
  
  const isSmartActive = plugins.some(p => p.id === 'smart-assistant' && p.active) && smartConfig.enableSummary;

  // Basic Validation
  const postCategory = categories.find(c => c.id === post?.categoryId);
  
  if (!post) return <Navigate to="/404" />;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSummarize = async () => {
      if (summary) return; // Already loaded
      setSummarizing(true);
      try {
          const result = await aiService.summarize(post.content, smartConfig.preferredModel);
          if (result) setSummary(result);
      } catch (e) {
          // Ignore
      }
      setSummarizing(false);
  };

  const handleHighlights = async () => {
      if (highlights) return; // Already loaded
      setHighlighting(true);
      try {
          const result = await aiService.extractHighlights(post.content, smartConfig.preferredModel);
          if (result) setHighlights(result);
      } catch (e) {
          // Ignore
      }
      setHighlighting(false);
  };
  
  // Build Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "BlogPosting",
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.featuredImage,
    "author": {
        "@type": "Person",
        "name": post.author
    },
    "publisher": {
        "@type": "Organization",
        "name": config.siteName
    },
    "datePublished": post.publishDate || post.createdAt
  };

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
        }
    }))
  } : undefined;

  // SEO Hook
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSeo({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage,
    type: 'article',
    schema: faqSchema ? [articleSchema, faqSchema] : articleSchema
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
       <style>{`
          .article-content { line-height: 1.9; font-size: 1.05rem; color: #374151; }
          .dark .article-content { color: #d1d5db; }
          
          .article-content h1, .article-content h2, .article-content h3, .article-content h4 {
            color: #111827; font-weight: 800; margin-top: 2.5em; margin-bottom: 1em; line-height: 1.4;
          }
          .dark .article-content h1, .dark .article-content h2, .dark .article-content h3 { color: #f3f4f6; }
          
          .article-content h2 { font-size: 1.75em; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.3em; }
          .dark .article-content h2 { border-color: #374151; }
          
          .article-content h3 { font-size: 1.4em; position: relative; padding-right: 1rem; }
          .article-content h3::before { content: ''; position: absolute; right: 0; top: 0.3em; bottom: 0.3em; width: 4px; background: #0ea5e9; border-radius: 2px; }
          
          .article-content p { margin-bottom: 1.5em; text-align: justify; }
          
          .article-content ul, .article-content ol { margin-bottom: 2em; padding-right: 1.5em; }
          .article-content ul { list-style-type: disc; }
          .article-content ol { list-style-type: decimal; }
          .article-content li { margin-bottom: 0.7em; padding-left: 0.5em; }
          .article-content li::marker { color: #0ea5e9; font-weight: bold; }
          
          .article-content img { border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); margin: 2.5em auto; display: block; max-width: 100%; height: auto; }
          
          .article-content blockquote { 
            border-right: 4px solid #0ea5e9; 
            background: rgba(14, 165, 233, 0.05); 
            padding: 1.5rem 2rem; 
            margin: 2.5rem 0; 
            border-radius: 0.5rem 0 0 0.5rem; 
            font-style: italic; 
            color: #4b5563; 
            font-size: 1.1em;
            position: relative;
          }
          .dark .article-content blockquote { background: rgba(14, 165, 233, 0.1); color: #9ca3af; }
          
          .article-content table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 2.5em 0; font-size: 0.95em; overflow: hidden; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
          .dark .article-content table { border-color: #374151; }
          
          .article-content th { background-color: #f9fafb; font-weight: 800; text-align: right; padding: 1rem; border-bottom: 2px solid #e5e7eb; color: #111827; }
          .dark .article-content th { background-color: #1f2937; border-color: #374151; color: #e5e7eb; }
          
          .article-content td { padding: 1rem; border-bottom: 1px solid #e5e7eb; }
          .dark .article-content td { border-color: #374151; }
          .article-content tr:last-child td { border-bottom: none; }
          .article-content tr:nth-child(even) { background-color: rgba(0,0,0,0.02); }
          .dark .article-content tr:nth-child(even) { background-color: rgba(255,255,255,0.02); }
          
          .article-content a { color: #0ea5e9; text-decoration: none; border-bottom: 1px dotted #0ea5e9; transition: all 0.2s; font-weight: 500; }
          .article-content a:hover { color: #0284c7; border-bottom-style: solid; background: rgba(14, 165, 233, 0.1); }
          
          .article-content strong { font-weight: 800; color: #111827; }
          .dark .article-content strong { color: #f9fafb; }
          
          .article-content pre { direction: ltr; text-align: left; background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 0.75rem; overflow-x: auto; margin: 2em 0; font-family: 'Fira Code', monospace; font-size: 0.9em; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2); }
          
          .article-content code { font-family: monospace; background: rgba(0,0,0,0.05); padding: 0.2em 0.4em; rounded: 0.25rem; font-size: 0.9em; color: #db2777; border: 1px solid rgba(0,0,0,0.05); }
          .dark .article-content code { background: rgba(255,255,255,0.1); color: #f472b6; border-color: rgba(255,255,255,0.1); }
       `}</style>

       {/* Breadcrumb could go here */}
       
       <div className="mb-8">
          {post.featuredImage && (
              <img src={post.featuredImage} alt={post.title} className="w-full h-64 md:h-[500px] object-cover rounded-2xl mb-8 shadow-xl" />
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 justify-center">
             <Link to={`/blog/${postCategory?.slug}`} className="flex items-center gap-1 hover:text-primary-600 transition-colors bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <Folder size={14} /> {postCategory?.name}
             </Link>
             <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <User size={14} /> <Link to={`/blog/${post.author}`} className="hover:text-primary-600">{post.author}</Link>
             </span>
             <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <Calendar size={14} /> {formatDate(post.publishDate || post.createdAt, lang)}
             </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white text-center mb-8 leading-tight">
              {post.title}
          </h1>
       </div>

       {isSmartActive && (
          <div className="flex flex-wrap items-start gap-4 mb-12">
              {/* Summary Button */}
              <button 
                onClick={handleSummarize} 
                disabled={summarizing || !!summary}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border
                    ${summary 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 cursor-default' 
                        : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 shadow-sm'
                    }
                `}
              >
                  <Sparkles size={16} className={summarizing ? 'animate-pulse' : ''} />
                  {summarizing ? 'در حال تحلیل...' : (summary ? 'خلاصه مطلب' : t('summarize'))}
              </button>

              {/* Highlights Button */}
              <button 
                onClick={handleHighlights} 
                disabled={highlighting || !!highlights}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border
                    ${highlights 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 cursor-default' 
                        : 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/10 shadow-sm'
                    }
                `}
              >
                  <Lightbulb size={16} className={highlighting ? 'animate-pulse' : ''} />
                  {highlighting ? 'در حال استخراج...' : (highlights ? 'نکات کلیدی' : t('highlights'))}
              </button>

              {/* Results Display */}
              {(summary || highlights) && (
                  <div className="w-full mt-4 space-y-4 animate-fadeIn">
                      {summary && (
                          <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                              <div className="prose prose-sm dark:prose-invert prose-purple article-content !text-sm !m-0" dangerouslySetInnerHTML={{ __html: summary }} />
                          </div>
                      )}
                      {highlights && (
                          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                              <div className="prose prose-sm dark:prose-invert prose-amber article-content !text-sm !m-0" dangerouslySetInnerHTML={{ __html: highlights }} />
                          </div>
                      )}
                  </div>
              )}
          </div>
       )}

       <div 
         className="article-content max-w-none mx-auto"
         dangerouslySetInnerHTML={{ __html: post.content }}
       />

       {/* FAQs Section */}
       {post.faqs && post.faqs.length > 0 && (
         <div className="mt-16 bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-primary-600">
                  <HelpCircle size={28} />
               </div>
               <h3 className="text-2xl font-bold dark:text-white">{t('faqs')}</h3>
            </div>
            <div className="space-y-4">
                {post.faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border transition-all duration-300 ${
                            openFaqIndex === index ? 'border-primary-500 shadow-md ring-1 ring-primary-100 dark:ring-primary-900' : 'border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800'
                        }`}
                    >
                        <button
                            onClick={() => toggleFaq(index)}
                            className="w-full flex justify-between items-center p-5 text-right rtl:text-right ltr:text-left focus:outline-none"
                        >
                            <span className={`font-bold text-lg leading-snug ${openFaqIndex === index ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                                {faq.question}
                            </span>
                            <div className={`p-1 rounded-full transition-colors ${openFaqIndex === index ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-400'}`}>
                                {openFaqIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                        <div 
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="p-6 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed text-justify border-t border-dashed border-gray-100 dark:border-gray-800 mt-2 pt-4">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
       )}

       {/* Tags */}
       {post.tags && post.tags.length > 0 && (
           <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-3 flex-wrap">
                   <div className="flex items-center gap-2 text-gray-500 font-bold">
                       <Tag size={20} />
                       {t('tags')}:
                   </div>
                   {post.tags.map(tag => (
                       <Link 
                         key={tag} 
                         to={`/blog/tags/${tag}`} 
                         className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600 transition-all shadow-sm"
                       >
                           #{tag}
                       </Link>
                   ))}
               </div>
           </div>
       )}

       <CommentSection pageId={post.id} />
    </div>
  );
};