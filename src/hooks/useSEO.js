import { useEffect } from 'react';

/**
 * SEO Optimization Hook
 * Handles meta tags, Open Graph, and structured data
 */
export const useSEO = ({
  title = 'Daksha - Inter College Sports Tournament',
  description = 'Daksha a Championship: A thrilling 3-day multi-sport event',
  keywords = 'sports, championship, athletics, team spirit, competition, inter-college, daksha, gcek',
  image = 'https://dakshagcek.netlify.app/og-image.png',
  url = 'https://dakshagcek.netlify.app/',
  type = 'website',
  author = 'Daksha Championship',
  twitterHandle = '@daksha_championship',
  canonicalUrl = null,
} = {}) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to set meta tag
    const setMeta = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        const isProp = name.startsWith('og:') || name.startsWith('twitter:');
        if (isProp) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Standard meta tags
    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('author', author);
    setMeta('robots', 'index, follow, max-image-preview:large');

    // Open Graph tags
    setMeta('og:type', type);
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:url', url);
    setMeta('og:site_name', 'Daksha Championship');

    // Twitter tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setMeta('twitter:creator', twitterHandle);

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Return cleanup function
    return () => {
      // Optionally reset meta tags
    };
  }, [title, description, keywords, image, url, type, author, twitterHandle, canonicalUrl]);
};

/**
 * Add JSON-LD Structured Data
 */
export const useStructuredData = (data) => {
  useEffect(() => {
    if (!data) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);
};

/**
 * Event Structured Data Helper
 */
export const createEventSchema = ({
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
  image,
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    image,
    startDate,
    endDate,
    location: {
      '@type': 'Place',
      name: location.name,
      address: {
        '@type': 'PostalAddress',
        addressCountry: location.country || 'IN',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: organizer.name,
      url: organizer.url || 'https://dakshagcek.netlify.app/',
    },
  };
};

/**
 * Organization Structured Data Helper
 */
export const createOrganizationSchema = ({
  name,
  url,
  logo,
  description,
  sameAs = [],
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
  };
};

export default useSEO;
