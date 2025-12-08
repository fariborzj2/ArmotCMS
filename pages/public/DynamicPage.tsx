
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';
import { useSeo } from '../../hooks/useSeo';
import { CommentSection } from '../../components/plugins/CommentSection';
import { formatDate } from '../../utils/date';

export const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { pages, t, config, lang } = useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const foundPage = pages.find(p => p.slug === slug && p.status === 'published');
    if (foundPage) {
      setPage(foundPage);
    } else {
      // Redirect to 404 if not found
      navigate('/404', { replace: true });
    }
  }, [slug, pages, navigate]);

  // Extract text preview for SEO description
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const seoDescription = page ? stripHtml(page.content).substring(0, 160) + '...' : '';

  useSeo({
    title: page?.title || 'Page Not Found',
    description: seoDescription,
    type: 'article',
    schema: page ? {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": page.title,
      "datePublished": page.createdAt,
      "author": {
         "@type": "Organization",
         "name": config.siteName
      },
      "publisher": {
         "@type": "Organization",
         "name": config.siteName
      }
    } : undefined
  });

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
           {t('last_updated')}: {formatDate(page.createdAt, lang)}
        </p>
      </div>

      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
      
      {/* Plugin Injection Point: Comments */}
      <CommentSection pageId={page.id} />
    </div>
  );
};
