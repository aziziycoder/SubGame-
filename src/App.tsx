import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminRoute } from './components/auth/AdminRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';

// Helper to auto-recover when a new Vercel deployment invalidates old chunk hashes
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: any }>
) {
  return lazy(async () => {
    try {
      const module = await factory();
      if ('default' in module) {
        return module as { default: T };
      }
      return { default: Object.values(module)[0] as T };
    } catch (error: any) {
      const msg = error?.message || '';
      const isChunkError =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('Loading chunk');

      if (isChunkError) {
        const key = 'subgame_chunk_reload_ts';
        const lastReload = parseInt(sessionStorage.getItem(key) || '0', 10);
        const now = Date.now();
        if (now - lastReload > 8000) {
          sessionStorage.setItem(key, now.toString());
          window.location.reload();
        }
      }
      throw error;
    }
  });
}

// Route-level Code Splitting for non-landing pages with deployment auto-retry
const loadGameDetailPage = () => import('./pages/GameDetailPage').then((m) => ({ default: m.GameDetailPage }));
const loadSuggestionsPage = () => import('./pages/SuggestionsPage').then((m) => ({ default: m.SuggestionsPage }));
const loadAboutPage = () => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }));
const loadFavoritesPage = () => import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage }));
const loadLauncherPage = () => import('./pages/LauncherPage').then((m) => ({ default: m.LauncherPage }));

const GameDetailPage = lazyWithRetry(loadGameDetailPage);
const SuggestionsPage = lazyWithRetry(loadSuggestionsPage);
const AboutPage = lazyWithRetry(loadAboutPage);
const FavoritesPage = lazyWithRetry(loadFavoritesPage);
const LauncherPage = lazyWithRetry(loadLauncherPage);
const ConnectLauncherPage = lazyWithRetry(() => import('./pages/ConnectLauncherPage').then((m) => ({ default: m.ConnectLauncherPage })));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-load heavy user modals only when triggered
const ReportIssueModal = lazyWithRetry(() => import('./components/home/ReportIssueModal').then((m) => ({ default: m.ReportIssueModal })));

/** The pages linked from the navbar, fetched while the browser is idle so opening them is instant. */
const PRELOADED_PAGES = [loadGameDetailPage, loadSuggestionsPage, loadLauncherPage, loadAboutPage, loadFavoritesPage];

function usePreloadPages() {
  useEffect(() => {
    const preload = () => {
      for (const load of PRELOADED_PAGES) {
        // A failure here only means the page loads on click instead, as before.
        load().catch(() => {});
      }
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preload, 2500);
    return () => clearTimeout(timer);
  }, []);
}

const AppContent: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const location = useLocation();
  usePreloadPages();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#A3E635] selection:text-[#0B0D12]">
      {/* Public Navbar: Hidden on Admin Panel */}
      {!isAdminRoute && <Navbar />}

      {/* Main Route Content */}
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<CatalogPage />} />
              <Route path="/games/:slug" element={<GameDetailPage />} />
              <Route path="/launcher" element={<LauncherPage />} />
              <Route path="/guide" element={<Navigate to="/launcher" replace />} />
              <Route path="/connect" element={<ConnectLauncherPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Public Footer: Hidden on Admin Panel */}
      {!isAdminRoute && (
        <Footer
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Public Global Modals (Lazy Loaded) */}
      {!isAdminRoute && (
        <Suspense fallback={null}>
          {isReportModalOpen && (
            <ReportIssueModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
            />
          )}
        </Suspense>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          {/*
            Without transitions a page that is still loading shows the loader at once. With them
            (the router's default) React kept the old page on screen while the URL had already
            changed, which looked like the site had frozen.
          */}
          <BrowserRouter useTransitions={false}>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
