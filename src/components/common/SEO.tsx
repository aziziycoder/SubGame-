import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description?: string;
  keywords?: string | string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video.other';
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  noIndex?: boolean;
}

const DEFAULT_DESCRIPTION =
  'Sevimli videoo‘yinlaringizni o‘zbekcha subtitrlar bilan o‘ynang. SubGame — kompyuter o‘yinlariga sifatli o‘zbekcha subtitrlar va tarjimalar platformasi.';
const DEFAULT_IMAGE = 'https://subgame.uz/images/logo_doppi.png';
const SITE_NAME = 'SubGame';
const BASE_URL = 'https://subgame.uz';

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(data: Record<string, any> | Array<Record<string, any>> | undefined) {
  const scriptId = 'subgame-seo-schema';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  
  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  structuredData,
  noIndex = false,
}) => {
  useEffect(() => {
    // 1. Document title
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // 2. Standard Meta Description
    setMetaTag('name', 'description', description);

    // 3. Keywords
    if (keywords) {
      const kwString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      setMetaTag('name', 'keywords', kwString);
    }

    // 4. Robots
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');
    }

    // 5. Canonical URL
    const finalCanonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
    setCanonicalUrl(finalCanonical);

    // 6. OpenGraph tags (Facebook, Telegram, Discord, etc.)
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', finalCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:locale', 'uz_UZ');

    // 7. Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 8. Structured Data (JSON-LD)
    setJsonLd(structuredData);

    return () => {
      // Cleanup structured data on page unmount
      setJsonLd(undefined);
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData, noIndex]);

  return null;
};
