import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { Send, ArrowUp, Shield, Sparkles, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenSuggestModal?: () => void;
  onOpenReportModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSuggestModal,
  onOpenReportModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0D12] border-t border-[#2A3245] text-gray-400 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2A3245]/60">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/images/logo_doppi.png"
                alt="SubGame Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(163,230,53,0.35)] group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-xl font-extrabold tracking-tight text-white">
                Sub<span className="text-[#A3E635]">Game</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              O‘zbek geymerlari uchun sevimli videoo‘yinlarni ona tilida o‘ynash va hikoyasidan to‘liq bahramand bo‘lish imkonini yaratuvchi erkin jamoat platformasi.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>Telegram kanalimiz</span>
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Navigatsiya
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#A3E635] transition-colors">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link to="/games" className="hover:text-[#A3E635] transition-colors">
                  O‘yinlar katalogi
                </Link>
              </li>
              <li>
                <Link to="/launcher" className="hover:text-[#A3E635] transition-colors">
                  SubGame Launcher
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#A3E635] transition-colors">
                  Loyiha haqida
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-[#A3E635] transition-colors">
                  Sevimlilar
                </Link>
              </li>
            </ul>
          </div>

          {/* Subtitles & Games */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Mavjud Subtitrlar
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/games/a-plague-tale-requiem"
                  className="hover:text-[#A3E635] transition-colors flex items-center justify-between"
                >
                  <span>A Plague Tale: Requiem</span>
                  <span className="text-[10px] text-[#A3E635] bg-[#A3E635]/15 px-1.5 py-0.5 rounded">
                    v1.0
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/games/a-plague-tale-innocence"
                  className="hover:text-[#A3E635] transition-colors flex items-center justify-between"
                >
                  <span>A Plague Tale: Innocence</span>
                  <span className="text-[10px] text-[#A3E635] bg-[#A3E635]/15 px-1.5 py-0.5 rounded">
                    v1.2
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Hamjamiyat va Yordam
            </h4>
            <ul className="space-y-2.5 text-sm">
              {onOpenSuggestModal && (
                <li>
                  <button
                    onClick={onOpenSuggestModal}
                    className="hover:text-[#A3E635] transition-colors text-left flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Subtitr taklif qilish</span>
                  </button>
                </li>
              )}
              {onOpenReportModal && (
                <li>
                  <button
                    onClick={onOpenReportModal}
                    className="hover:text-[#A3E635] transition-colors text-left flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xatolik haqida xabar</span>
                  </button>
                </li>
              )}
              <li>
                <a
                  href={SITE_CONFIG.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors"
                >
                  Telegram guruh / Chat
                </a>
              </li>
              <li>
                <Link to="/about#faq" className="hover:text-[#A3E635] transition-colors">
                  Ko‘p beriladigan savollar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-start gap-2.5 max-w-3xl">
            <Shield className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {SITE_CONFIG.disclaimer}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <span>© {new Date().getFullYear()} SubGame. Barcha huquqlar himoyalangan.</span>
            <button
              onClick={scrollToTop}
              title="Yuqoriga qaytish"
              className="p-2 rounded-xl bg-[#141821] border border-[#2A3245] text-gray-300 hover:text-white hover:border-[#A3E635] transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
