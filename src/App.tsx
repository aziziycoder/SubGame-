import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { NotFoundPage } from './pages/NotFoundPage';
import { SuggestGameModal } from './components/home/SuggestGameModal';
import { ReportIssueModal } from './components/home/ReportIssueModal';

export const App: React.FC = () => {
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#A3E635] selection:text-[#0B0D12]">
          {/* Main Top Navigation */}
          <Navbar />

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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer
            onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />

          {/* Global Modals triggered from footer or navbar */}
          <SuggestGameModal
            isOpen={isSuggestModalOpen}
            onClose={() => setIsSuggestModalOpen(false)}
          />

          <ReportIssueModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
          />
        </div>
      </BrowserRouter>
    </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
