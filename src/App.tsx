import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminRoute } from './components/auth/AdminRoute';

// Route-level Code Splitting for optimal performance
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const GameDetailPage = lazy(() => import('./pages/GameDetailPage').then((m) => ({ default: m.GameDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const LauncherPage = lazy(() => import('./pages/LauncherPage').then((m) => ({ default: m.LauncherPage })));
const ConnectLauncherPage = lazy(() => import('./pages/ConnectLauncherPage').then((m) => ({ default: m.ConnectLauncherPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-load heavy user modals only when triggered
const SuggestGameModal = lazy(() => import('./components/home/SuggestGameModal').then((m) => ({ default: m.SuggestGameModal })));
const ReportIssueModal = lazy(() => import('./components/home/ReportIssueModal').then((m) => ({ default: m.ReportIssueModal })));

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
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
