import React, { useState } from 'react';
import { SEO } from '../components/common/SEO';
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
      <SEO
        title="SubGame — O‘zbekcha subtitrli videoo‘yinlar platformasi"
        description="Sevimli kompyuter o‘yinlarini o‘zbek tilida o‘ynang. Sifatli o‘zbekcha subtitrlar, rasmiy tarjimalar va maxsus SubGame Launcher dasturi."
        keywords="SubGame, o‘zbekcha subtitrlar, o‘yinlar o‘zbek tilida, stray o‘zbek tilida, kompyuter o‘yinlari o‘zbekcha, uzbekcha tarjima, o‘yinlar skachat"
        canonicalUrl="https://subgame.uz/"
        ogImage="https://subgame.uz/images/logo_doppi.png"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'SubGame',
          alternateName: 'SubGame O‘zbekcha O‘yinlar',
          url: 'https://subgame.uz/',
          description: 'O‘zbek geymerlari uchun videoo‘yinlarni ona tilida o‘ynash va hikoyasidan to‘liq bahramand bo‘lish imkonini yaratuvchi erkin jamoat platformasi.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://subgame.uz/games?search={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />
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
