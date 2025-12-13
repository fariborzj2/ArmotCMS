
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { updateMetaTag, injectJsonLd } from '../utils/seo';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  schema?: any;
}

export const useSeo = ({ title, description, image, type = 'website', schema }: SeoProps) => {
  const { config, lang, plugins } = useApp();
  const location = useLocation();

  // Check if SEO plugin is active (Mock check)
  const isSeoPluginActive = plugins.some(p => p.id === 'seo-pro' && p.active);

  useEffect(() => {
    if (!isSeoPluginActive) return;

    const fullTitle = `${title} | ${config.siteName}`;
    const fullUrl = window.location.href;
    const metaDescription = description || config.siteDescription;
    const metaImage = image || 'https://via.placeholder.com/1200x630.png?text=ArmotCms';

    // 1. Update Title
    document.title = fullTitle;

    // 2. Standard Meta Tags
    updateMetaTag('description', metaDescription);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('robots', 'index, follow');

    // 3. Open Graph (Facebook/LinkedIn)
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', metaDescription, 'property');
    updateMetaTag('og:image', metaImage, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:locale', lang === 'fa' ? 'fa_IR' : 'en_US', 'property');
    updateMetaTag('og:site_name', config.siteName, 'property');

    // 4. Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', fullTitle, 'name');
    updateMetaTag('twitter:description', metaDescription, 'name');
    updateMetaTag('twitter:image', metaImage, 'name');

    // 5. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullUrl);

    // 6. JSON-LD (Structured Data)
    if (schema) {
      injectJsonLd(schema);
    } else {
      // Default WebSite Schema
      injectJsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": config.siteName,
        "url": window.location.origin,
        "description": config.siteDescription,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });
    }

  }, [title, description, image, type, schema, config, lang, location, isSeoPluginActive]);
};
