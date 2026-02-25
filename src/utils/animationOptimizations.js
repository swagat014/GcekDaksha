/**
 * Framer Motion Animation Optimizations
 * - Lazy animation loading
 * - Reduced motion support
 * - Performance-optimized variants
 * - Mobile-friendly animations
 */

import { useReducedMotion } from 'framer-motion';

/**
 * Check if device prefers reduced motion (accessibility)
 * Returns true if user has enabled "Reduce motion" in system settings
 */
export const useAccessibleMotion = () => {
  return useReducedMotion();
};

/**
 * Mobile-optimized animation variants
 * Reduces animation complexity on low-end devices
 */
export const createMobileOptimizedVariants = (isMobile = false, isLowEnd = false) => {
  if (isLowEnd) {
    // Minimal animations for low-end devices
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };
  }

  if (isMobile) {
    // Reduced complexity for mobile
    return {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
      exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };
  }

  // Full animations for desktop
  return {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -60, transition: { duration: 0.5 } },
  };
};

/**
 * Reduced motion variants (for accessibility)
 * Used when user has enabled "Reduce motion" in OS
 */
export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/**
 * Stagger container (optimized for mobile)
 */
export const createStaggerContainer = (isMobile = false, isLowEnd = false) => {
  if (isLowEnd) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
      },
    };
  }

  if (isMobile) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
      },
    };
  }

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };
};

/**
 * Optimized scroll animation
 * Prevents jank on low-end devices
 */
export const useOptimizedScroll = () => {
  return {
    // Use passive event listeners
    options: { passive: true },
    // Throttle scroll updates on mobile
    throttle: true,
    throttleDelay: 16, // ~60fps
  };
};

/**
 * Detect device capability
 * Returns animation complexity level
 */
export const getDeviceAnimationLevel = () => {
  if (typeof window === 'undefined') return 'high';

  // Mobile detection
  const isMobile = window.innerWidth < 768;

  if (!isMobile) return 'high';

  // Low-end mobile detection (older devices)
  const isLowEnd = () => {
    // Check device memory
    if ('deviceMemory' in navigator && navigator.deviceMemory <= 2) {
      return true;
    }

    // Check connection type
    if ('connection' in navigator) {
      const conn = navigator.connection;
      if (conn && conn.effectiveType && conn.effectiveType !== '4g') {
        return true;
      }
    }

    // Check GPU/CPU detection (basic)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return !ctx;
  };

  return isLowEnd() ? 'low' : 'medium';
};

/**
 * Disable animations based on user preference
 */
export const shouldAnimateContent = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const deviceLevel = getDeviceAnimationLevel();

  if (prefersReducedMotion) return false;
  if (deviceLevel === 'low') return false; // Skip animations on low-end

  return true;
};

/**
 * Optimized spring animation (performs better on mobile)
 */
export const mobileOptimizedSpring = {
  stiffness: 60,
  damping: 20,
  mass: 1,
  velocity: 0,
};

/**
 * Easing functions optimized for performance
 */
export const performanceEasings = {
  easeOut: [0.4, 0, 0.2, 1], // Faster easeOut
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  cubic: [0.25, 0.46, 0.45, 0.94],
};

/**
 * Viewport detection hook
 * Triggers animations only when element is in view
 */
export const useInViewAnimation = () => {
  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: false, amount: 0.3 }, // Trigger when 30% visible
  };
};

/**
 * Disable heavy animations on scroll
 * Prevents jank when scrolling
 */
export const optimizeScrollAnimations = (referenceElement) => {
  if (typeof window === 'undefined') return { enabled: false };

  let isScrolling = false;
  let scrollTimeout;

  const handleScroll = () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150); // Debounce scroll
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return {
    enabled: !isScrolling,
    cleanup: () => window.removeEventListener('scroll', handleScroll),
  };
};

/**
 * Layer animation optimization
 * Separates layers to prevent repaint
 */
export const useWillChangeOptimization = (animate = true) => {
  return {
    style: animate ? { willChange: 'transform, opacity' } : {},
  };
};

/**
 * Batch animations together
 * Reduces number of animation frames
 */
export const batchAnimations = (animations = [], stagger = 0.1) => {
  return {
    variants: {
      hidden: animations.map(() => ({ opacity: 0 })),
      visible: animations.map((_, i) => ({
        opacity: 1,
        transition: { delay: i * stagger },
      })),
    },
  };
};
