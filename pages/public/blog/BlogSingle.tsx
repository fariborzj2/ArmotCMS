
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useSeo } from '../../../hooks/useSeo';
import { CommentSection } from '../../../components/plugins/CommentSection';
import { User, Calendar, Tag, Folder, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { formatDate } from '../../../utils/date';

export const BlogSingle = () => {
  const { category, idSlug } = useParams<{ category: string, idSlug: string }>();
  const { posts, categories, t, config, lang } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Parse ID from "{id}-{slug}"
  const postId = idSlug?.split('-')[0];
  const post = posts.find(p => p.id === postId && p.status === 'published');
  
  // Basic Validation
  const postCategory = categories.find(c => c.id === post?.categoryId);
  
  if (!post) return <Navigate to="/404" />;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
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
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
       {/* Breadcrumb could go here */}
       
       <div className="mb-8">
          {post.featuredImage && (
              <img src={post.featuredImage} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8 shadow-lg" />
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 justify-center">
             <Link to={`/blog/${postCategory?.slug}`} className="flex items-center gap-1 hover:text-primary-600">
                <Folder size={16} /> {postCategory?.name}
             </Link>
             <span className="flex items-center gap-1">
                <User size={16} /> <Link to={`/blog/${post.author}`} className="hover:text-primary-600">{post.author}</Link>
             </span>
             <span className="flex items-center gap-1">
                <Calendar size={16} /> {formatDate(post.publishDate || post.createdAt, lang)}
             </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
              {post.title}
          </h1>
       </div>

       <div 
         className="prose prose-lg dark:prose-invert max-w-none mx-auto"
         dangerouslySetInnerHTML={{ __html: post.content }}
       />

       {/* FAQs Section */}
       {post.faqs && post.faqs.length > 0 && (
         <div className="mt-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
               <HelpCircle className="text-primary-600" size={24} />
               <h3 className="text-2xl font-bold dark:text-white">{t('faqs')}</h3>
            </div>
            <div className="space-y-4">
                {post.faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden border transition-colors duration-200 ${
                            openFaqIndex === index ? 'border-primary-500 ring-1 ring-primary-100 dark:ring-primary-900' : 'border-gray-200 dark:border-gray-800'
                        }`}
                    >
                        <button
                            onClick={() => toggleFaq(index)}
                            className="w-full flex justify-between items-center p-5 text-right rtl:text-right ltr:text-left focus:outline-none"
                        >
                            <span className={`font-bold text-lg ${openFaqIndex === index ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                                {faq.question}
                            </span>
                            {openFaqIndex === index ? <ChevronUp className="text-primary-500" /> : <ChevronDown className="text-gray-400" />}
                        </button>
                        <div 
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="p-5 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed">
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
           <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2 flex-wrap">
                   <Tag size={18} className="text-gray-400" />
                   {post.tags.map(tag => (
                       <Link 
                         key={tag} 
                         to={`/blog/tags/${tag}`} 
                         className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-primary-100 hover:text-primary-600 transition-colors"
                       >
                           {tag}
                       </Link>
                   ))}
               </div>
           </div>
       )}

       <CommentSection pageId={post.id} />
    </div>
  );
};
