/**
 * Lazy Loading Utilities for React Components
 * - Code splitting for pages
 * - Route-based lazy loading
 * - Image lazy loading
 */

import { lazy, Suspense } from 'react';

/**
 * Loading placeholder component
 * Shown while lazy components load
 */
const LoadingFallback = () => (
  <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
      <p className="text-white/60 text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Lazy load page components with code splitting
 * Reduces initial bundle size by splitting pages into separate chunks
 */
export const lazyPages = {
  Home: lazy(() => import('../pages/Home')),
  Register: lazy(() => import('../pages/Register')),
  Sports: lazy(() => import('../pages/Sports')),
  AccommodationForm: lazy(() => import('../pages/AccommodationForm')),
  AdminLogin: lazy(() => import('../pages/AdminLogin')),
  AdminDashboard: lazy(() => import('../pages/AdminDashboard')),
  AdminAccommodation: lazy(() => import('../pages/AdminAccommodation')),
};

/**
 * Wrap lazy component with Suspense
 * @param {React.Component} Component - Lazy loaded component
 * @returns {JSX.Element} Component wrapped with Suspense
 */
export const withLazySuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

/**
 * Preload a lazy component before navigation
 * Useful for prefetching on hover or scroll
 */
export const preloadLazyComponent = async (componentPath) => {
  try {
    await import(`../pages/${componentPath}`);
  } catch (error) {
    console.warn(`Failed to preload component: ${componentPath}`, error);
  }
};

/**
 * Dynamic import with retry logic
 * Retries failed imports
 */
export const dynamicImportWithRetry = (
  importStatement,
  retries = 3
) => {
  return new Promise((resolve, reject) => {
    let retriesLeft = retries;

    const attemptImport = () => {
      importStatement()
        .then(resolve)
        .catch((error) => {
          retriesLeft -= 1;
          if (retriesLeft > 0) {
            setTimeout(attemptImport, 1000);
          } else {
            reject(error);
          }
        });
    };

    attemptImport();
  });
};

export default withLazySuspense;
