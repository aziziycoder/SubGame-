import React, { useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedGames } from '../components/home/FeaturedGames';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { CommunitySection } from '../components/home/CommunitySection';
import { FaqSection } from '../components/home/FaqSection';
const ReportIssueModal = React.lazy(() => import('../components/home/ReportIssueModal').then((m) => ({ default: m.ReportIssueModal })));

export const HomePage: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Cinematic Hero */}
      <HeroSection />

      {/* 2. Featured Games with Subtitles */}
      <FeaturedGames />

      {/* 3. Why Our Platform */}
      <WhyUsSection />

      {/* 4. How Subtitles Work (3-step process) */}
      <HowItWorksSection />

      {/* 5. Frequently Asked Questions */}
      <FaqSection />

      {/* 6. Community Section */}
      <CommunitySection />

      {/* Modals */}
      <React.Suspense fallback={null}>
        {isReportModalOpen && (
          <ReportIssueModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
};
