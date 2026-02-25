/**
 * Image Optimization Utilities
 * - Lazy loading support
 * - WebP format detection
 * - Image compression
 * - Responsive image sizing
 */

/**
 * Generate optimized image URL for Unsplash
 * @param {string} url - Original image URL
 * @param {number} width - Desired width
 * @param {number} quality - Quality (1-100)
 * @returns {string} Optimized URL
 */
export const optimizeUnsplashImage = (url, width = 800, quality = 70) => {
  if (!url) return '';
  
  // If it's already an Unsplash URL, add optimization params
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=${quality}&auto=format&fit=max`;
  }
  
  // For local images, return as is
  return url;
};

/**
 * Generate srcSet for responsive images
 * @param {string} url - Base image URL
 * @returns {string} srcSet string
 */
export const generateSrcSet = (url) => {
  if (!url) return '';
  
  const sizes = [320, 640, 960, 1280, 1600];
  return sizes
    .map(size => `${optimizeUnsplashImage(url, size, 70)} ${size}w`)
    .join(', ');
};

/**
 * Lazy Loading Image Component Props
 * @param {string} src - Image source
 * @param {string} alt - Alt text (important for SEO!)
 * @param {string} className - CSS classes
 * @returns {object} Image props for optimal loading
 */
export const lazyImageProps = (src, alt = '', className = '') => {
  return {
    src: optimizeUnsplashImage(src, 100), // Placeholder
    alt: alt || 'Image',
    loading: 'lazy',
    decoding: 'async',
    className: className,
    // Use data-src for lazy loading with IntersectionObserver
    'data-src': optimizeUnsplashImage(src, 800, 70),
  };
};

/**
 * Create a Lazy Loading Image with IntersectionObserver
 * Perfect for gallery and sports images
 */
export const createLazyImageObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          // Remove old background image
          img.style.backgroundImage = 'none';
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px', // Start loading 50px before visible
  });

  return observer;
};

/**
 * Image optimization hook for React components
 * Automatically applies lazy loading and responsive sizing
 */
export const useImageOptimization = (src, alt = '') => {
  return {
    src: optimizeUnsplashImage(src, 100, 50), // Low-quality placeholder
    alt: alt,
    loading: 'lazy',
    decoding: 'async',
    srcSet: generateSrcSet(src),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
};

/**
 * Preload critical images for above-the-fold content
 * Call this for hero images only
 */
export const preloadCriticalImage = (src, alt = '') => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizeUnsplashImage(src, 1200, 80);
  link.imagesrcset = generateSrcSet(src);
  link.imagesizes = '100vw';
  
  document.head.appendChild(link);
};

/**
 * Progressive Image Loading (Blur-up effect compatible)
 * @param {string} src - Main image source
 * @param {string} blurredSrc - Blurred/placeholder source
 * @returns {object} Preview and main image data
 */
export const progressiveImage = (src, blurredSrc) => {
  return {
    preview: optimizeUnsplashImage(blurredSrc || src, 100, 30),
    main: optimizeUnsplashImage(src, 800, 70),
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check WebP support
 */
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
};

/**
 * Get image URL with format selection based on browser support
 */
export const getOptimalImageUrl = (webpUrl, fallbackUrl, width = 800, quality = 70) => {
  const url = supportsWebP() ? webpUrl : fallbackUrl;
  return optimizeUnsplashImage(url, width, quality);
};
