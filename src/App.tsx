import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { GuidePage } from './pages/GuidePage';
import { AboutPage } from './pages/AboutPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { LauncherPage } from './pages/LauncherPage';
import { ConnectLauncherPage } from './pages/ConnectLauncherPage';
import { AdminPage } from './pages/AdminPage';
import { AdminRoute } from './components/auth/AdminRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { SuggestGameModal } from './components/home/SuggestGameModal';
import { ReportIssueModal } from './components/home/ReportIssueModal';

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<CatalogPage />} />
          <Route path="/games/:slug" element={<GameDetailPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/launcher" element={<LauncherPage />} />
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
      </main>

      {/* Public Footer: Hidden on Admin Panel */}
      {!isAdminRoute && (
        <Footer
          onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Public Global Modals: Hidden on Admin Panel */}
      {!isAdminRoute && (
        <>
          <SuggestGameModal
            isOpen={isSuggestModalOpen}
            onClose={() => setIsSuggestModalOpen(false)}
          />

          <ReportIssueModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
          />
        </>
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
