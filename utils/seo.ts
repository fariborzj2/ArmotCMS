
import { Page, SiteConfig } from '../types';

export const generateSitemap = (pages: Page[], baseUrl: string = 'https://example.com'): string => {
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/terms'
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static Routes
  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Dynamic Pages
  pages.filter(p => p.status === 'published').forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${page.createdAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
};

export const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export const injectJsonLd = (data: any) => {
  const id = 'armot-json-ld';
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement('script');
    element.setAttribute('id', id);
    element.setAttribute('type', 'application/ld+json');
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
};
