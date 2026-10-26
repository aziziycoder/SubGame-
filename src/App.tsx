import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminRoute } from './components/auth/AdminRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

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
const GameDetailPage = lazyWithRetry(() => import('./pages/GameDetailPage').then((m) => ({ default: m.GameDetailPage })));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FavoritesPage = lazyWithRetry(() => import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const LauncherPage = lazyWithRetry(() => import('./pages/LauncherPage').then((m) => ({ default: m.LauncherPage })));
const ConnectLauncherPage = lazyWithRetry(() => import('./pages/ConnectLauncherPage').then((m) => ({ default: m.ConnectLauncherPage })));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-load heavy user modals only when triggered
const SuggestGameModal = lazyWithRetry(() => import('./components/home/SuggestGameModal').then((m) => ({ default: m.SuggestGameModal })));
const ReportIssueModal = lazyWithRetry(() => import('./components/home/ReportIssueModal').then((m) => ({ default: m.ReportIssueModal })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[#2A3245] border-t-[#A3E635] animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const location = useLocation();

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
          onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Public Global Modals (Lazy Loaded) */}
      {!isAdminRoute && (
        <Suspense fallback={null}>
          {isSuggestModalOpen && (
            <SuggestGameModal
              isOpen={isSuggestModalOpen}
              onClose={() => setIsSuggestModalOpen(false)}
            />
          )}

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
          <BrowserRouter>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
