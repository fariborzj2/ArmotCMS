

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';
import { useSeo } from '../../hooks/useSeo';
import { CommentSection } from '../../components/plugins/CommentSection';
import { formatDate } from '../../utils/date';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { pages, t, config, lang } = useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const foundPage = pages.find(p => p.slug === slug && p.status === 'published');
    if (foundPage) {
      setPage(foundPage);
    } else {
      // Redirect to 404 if not found
      navigate('/404', { replace: true });
    }
  }, [slug, pages, navigate]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const seoTitle = page?.metaTitle || page?.title || 'Page Not Found';
  const seoDescription = page?.metaDescription || page?.excerpt || (page ? page.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : '');

  useSeo({
    title: seoTitle,
    description: seoDescription,
    type: 'article',
    schema: page ? {
      "@context": "https://schema.org",
      "@type": page.schemaType || "WebPage",
      "headline": seoTitle,
      "datePublished": page.publishDate || page.createdAt,
      "author": {
         "@type": "Organization",
         "name": config.siteName
      },
      "publisher": {
         "@type": "Organization",
         "name": config.siteName
      },
      ...(page.faqs && page.faqs.length > 0 ? {
        "mainEntity": page.faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
            }
        }))
      } : {})
    } : undefined
  });

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-fadeIn">
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

      <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white sm:text-5xl mb-4 leading-tight">
          {page.title}
        </h1>
        {page.featuredImage && (
            <img src={page.featuredImage} alt={page.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-6 shadow-lg" />
        )}
        <p className="mt-2 text-sm text-gray-400 font-bold">
           {t('last_updated')}: {formatDate(page.publishDate || page.createdAt, lang)}
        </p>
      </div>

      <div 
        className="article-content max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

       {/* FAQs Section */}
       {page.faqs && page.faqs.length > 0 && (
         <div className="mt-16 bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-primary-600">
                  <HelpCircle size={28} />
               </div>
               <h3 className="text-2xl font-bold dark:text-white">{t('faqs')}</h3>
            </div>
            <div className="space-y-4">
                {page.faqs.map((faq, index) => (
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
      
      {/* Plugin Injection Point: Comments */}
      <CommentSection pageId={page.id} />
    </div>
  );
};
