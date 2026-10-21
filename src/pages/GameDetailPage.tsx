import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GAMES_DATA } from '../data/games';
import { SubtitleStatusBadge } from '../components/common/Badge';
import { Lightbox } from '../components/common/Lightbox';
import { ReportIssueModal } from '../components/home/ReportIssueModal';
import { useFavorites } from '../context/FavoritesContext';
import {
  Download,
  ExternalLink,
  Heart,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Copy,
  Check,
  ArrowLeft,
  Share2,
  Sparkles,
  Play,
  Info
} from 'lucide-react';

export const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const game = GAMES_DATA.find((g) => g.slug === slug);

  const { isFavorite, toggleFavorite } = useFavorites();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  if (!game) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 bg-[#0B0D12]">
        <div className="w-16 h-16 rounded-2xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">O‘yin topilmadi</h1>
        <p className="text-gray-400 mb-6 max-w-md text-sm">
          Siz qidirayotgan o‘yin sahifasi mavjud emas yoki manzili o‘zgargan bo‘lishi mumkin.
        </p>
        <Link
          to="/games"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Katalogga qaytish</span>
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(game.id);

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${game.title} - O‘zbekcha subtitr | SubGame`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      {/* A. Hero Section with Backdrop Artwork */}
      <section className="relative min-h-[460px] sm:min-h-[560px] flex items-end pt-24 sm:pt-32 pb-8 sm:pb-12 overflow-hidden border-b border-[#2A3245]">
        {/* Backdrop Image extending behind navbar */}
        <div className="absolute inset-0 z-0">
          <img
            src={game.heroImage}
            alt={game.title}
            className="w-full h-full object-cover object-center filter brightness-[0.55] sm:brightness-[0.65] contrast-110 scale-105"
          />
          {/* Smooth bottom blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/60 to-transparent" />
          {/* Left gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/95 via-[#0B0D12]/60 to-transparent" />
          {/* Top subtle shade behind navbar */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0B0D12]/80 via-[#0B0D12]/30 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
            <span>/</span>
            <Link to="/games" className="hover:text-white transition-colors">O‘yinlar</Link>
            <span>/</span>
            <span className="text-[#A3E635] font-medium">{game.title}</span>
          </div>

          {/* Hero Content: Mobile & Desktop Layout */}
          <div className="flex flex-col sm:flex-row gap-5 lg:gap-8 items-start sm:items-end">
            {/* Poster Thumbnail (Shown on both Mobile and Desktop) */}
            <div className="w-24 sm:w-36 lg:w-48 shrink-0 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#2A3245] shadow-2xl bg-[#141821]">
              <img
                src={game.cover}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Main Info */}
            <div className="space-y-3.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
                <span className="text-xs font-mono text-gray-300 bg-[#141821] px-2.5 py-0.5 rounded-full border border-[#2A3245]">
                  {game.releaseYear}
                </span>
                <span className="text-xs text-gray-400 bg-[#141821] px-2.5 py-0.5 rounded-full border border-[#2A3245]">
                  {game.developer}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {game.title}
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed max-w-3xl line-clamp-3 sm:line-clamp-none">
                {game.shortDescription}
              </p>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#141821] text-gray-300 border border-[#2A3245]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Primary Action Buttons Bar */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {game.subtitleStatus === 'Tayyor' ? (
                  <>
                    <Link
                      to="/launcher"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-extrabold text-sm sm:text-base hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>Launcherni yuklab olish (.exe)</span>
                    </Link>
                    <a
                      href={`subgame://open?game=${game.slug}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#141821] hover:bg-[#1A1F2A] text-[#A3E635] border border-[#A3E635]/40 hover:border-[#A3E635] font-bold text-sm sm:text-base transition-all"
                    >
                      <Play className="w-4 h-4 fill-current text-[#A3E635]" />
                      <span>Launcherda ochish</span>
                    </a>
                  </>
                ) : (
                  <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Subtitr tayyorlanmoqda ({game.subtitleStatus})</span>
                  </div>
                )}

                {/* Torrent Igruha Fast Download Button */}
                {game.torrentUrl && (
                  <a
                    href={game.torrentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-sm sm:text-base transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>O‘yinni yuklab olish (Torrent Igruha)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Gameplay Video Quick Link Button */}
                {game.gameplayVideoUrl && (
                  <a
                    href="#gameplay-video"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 hover:border-red-500/60 font-bold text-sm sm:text-base transition-all"
                  >
                    <Play className="w-4 h-4 fill-red-400" />
                    <span>Geympley videosi</span>
                  </a>
                )}

                <div className="flex items-center gap-2.5">
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(game.id)}
                    aria-label="Sevimlilar"
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                      favorited
                        ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                        : 'bg-[#141821] text-gray-300 hover:text-white border-[#2A3245] hover:border-gray-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500' : ''}`} />
                    <span className="sm:hidden text-xs font-semibold">Sevimlilar</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    aria-label="Ulashish"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 sm:p-3.5 rounded-xl bg-[#141821] border border-[#2A3245] text-gray-300 hover:text-white hover:border-gray-500 transition-colors cursor-pointer"
                  >
                    {shared ? <Check className="w-5 h-5 text-[#A3E635]" /> : <Share2 className="w-5 h-5" />}
                    <span className="sm:hidden text-xs font-semibold">{shared ? 'Nusxalandi' : 'Ulashish'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Body (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-12">
            {/* B. About the Game */}
            <section className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245]">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                O‘yin haqida
              </h2>
              <div className="text-sm sm:text-base text-gray-300 leading-relaxed space-y-4">
                <p>{game.fullDescription}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-[#2A3245]/60 text-xs text-gray-400">
                  <div>
                    <span className="block text-gray-500">Ishlab chiquvchi</span>
                    <strong className="text-white text-sm">{game.developer}</strong>
                  </div>
                  <div>
                    <span className="block text-gray-500">Nashriyotchi</span>
                    <strong className="text-white text-sm">{game.publisher}</strong>
                  </div>
                  <div>
                    <span className="block text-gray-500">Chiqarilgan sana</span>
                    <strong className="text-white text-sm">{game.releaseYear}-yil</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Gameplay Video Section */}
            {game.gameplayVideoUrl && (
              <section id="gameplay-video" className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245] space-y-4 scroll-mt-24 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                      <Play className="w-3.5 h-3.5 fill-red-400" />
                      <span>Eksklyuziv Gameplay</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      O‘zbekcha tildagi geympley
                    </h2>
                  </div>
                  <a
                    href="https://youtu.be/L9M9aAjH02Y?si=SnEluyKMpHpDnBlX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 transition-all w-fit"
                  >
                    <span>YouTube’da ko‘rish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#2A3245] bg-black shadow-2xl">
                  <iframe
                    src={game.gameplayVideoUrl}
                    title={`${game.title} O‘zbekcha tildagi geympley`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </section>
            )}

            {/* C. Screenshots Gallery (2x2 on mobile for compact viewing) */}
            <section className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    O‘yin skrinshotlari
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Kattalashtirib ko‘rish uchun rasm ustiga bosing
                  </p>
                </div>
                <span className="text-xs font-mono text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-1 rounded border border-[#A3E635]/20">
                  {game.screenshots.length} ta rasm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {game.screenshots.map((src, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setActiveImageIndex(index);
                      setLightboxOpen(true);
                    }}
                    className="group relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer border border-[#2A3245] hover:border-[#A3E635] transition-all duration-300"
                  >
                    <img
                      src={src}
                      alt={`${game.title} skrinshot ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[11px] sm:text-xs font-bold text-white bg-black/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/20 backdrop-blur-sm">
                        Kattalashtirish
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* E. Uzbek Subtitle In-Depth Details */}
            <section className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  O‘zbekcha subtitr haqida
                </h2>
                <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                    Subtitr tili
                  </span>
                  <strong className="text-sm text-white font-medium">
                    {game.subtitleLanguage}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                    Tarjima turi
                  </span>
                  <strong className="text-sm text-[#A3E635] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    {game.subtitleTranslationType}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                    Versiya va Sana
                  </span>
                  <strong className="text-sm text-white font-medium">
                    {game.subtitleVersion} ({game.subtitleLastUpdated})
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                    Fayl formati va Hajmi
                  </span>
                  <strong className="text-sm text-white font-medium">
                    {game.subtitleFormat} • {game.subtitleSize || 'Kichik'}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1F2A] border border-[#2A3245] space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                  <span>Moslik (Compatibility)</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300">
                  {game.subtitleCompatibility}
                </p>
              </div>

              {game.knownIssues && game.knownIssues.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ma‘lum xatolar va cheklovlar</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                    {game.knownIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* G. Step-by-Step Installation Guide */}
            <section className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    O‘rnatish qo‘llanmasi
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Fayllarni to‘g‘ri joylashtirish bo‘yicha bosqichma-bosqich yo‘riqnoma
                  </p>
                </div>
                <FolderOpen className="w-6 h-6 text-[#A3E635] shrink-0" />
              </div>

              <div className="space-y-4 sm:space-y-6">
                {game.installationGuide.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-xl bg-[#0B0D12] border border-[#2A3245]"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border border-[#A3E635]/40">
                      {step.step}
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {step.description}
                      </p>

                      {step.pathOrCommand && (
                        <div className="mt-2 flex items-center justify-between bg-[#141821] p-2.5 rounded-lg border border-[#2A3245] text-xs font-mono text-gray-300 min-w-0">
                          <code className="truncate mr-2 text-[11px] sm:text-xs select-all">{step.pathOrCommand}</code>
                          <button
                            onClick={() => handleCopyPath(step.pathOrCommand!)}
                            className="p-1.5 rounded hover:bg-[#1A1F2A] text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                            title="Nusxa olish"
                          >
                            {copiedPath === step.pathOrCommand ? (
                              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {step.note && (
                        <p className="text-xs text-amber-400/90 italic pt-0.5">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-[#2A3245]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-gray-400">
                  O‘rnatishda xatolik yuz berdimi?
                </span>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Xatolik haqida xabar bering</span>
                </button>
              </div>
            </section>

            {/* D. Verified System Requirements */}
            <section className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Tizim talablari (PC)
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Rasmiy tekshirilgan texnik ma‘lumotlar
                  </p>
                </div>
                <Monitor className="w-6 h-6 text-gray-400 shrink-0" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Minimum */}
                <div className="bg-[#0B0D12] p-4 sm:p-5 rounded-xl border border-[#2A3245] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#2A3245] pb-2">
                    <h3 className="font-bold text-white text-sm">Minimal talablar</h3>
                    <span className="text-[11px] text-gray-400">720p / 30 FPS</span>
                  </div>

                  <div className="text-xs space-y-2.5">
                    <div>
                      <span className="text-gray-500 block">Operatsion tizim</span>
                      <span className="text-gray-200">{game.minimumRequirements.os}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Protsessor</span>
                      <span className="text-gray-200">{game.minimumRequirements.processor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Operativ xotira (RAM)</span>
                      <span className="text-gray-200">{game.minimumRequirements.memory}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Videokarta (GPU)</span>
                      <span className="text-gray-200">{game.minimumRequirements.graphics}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">DirectX</span>
                      <span className="text-gray-200">{game.minimumRequirements.directX}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bo‘sh disk maydoni</span>
                      <span className="text-gray-200">{game.minimumRequirements.storage}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended */}
                <div className="bg-[#0B0D12] p-4 sm:p-5 rounded-xl border border-[#A3E635]/30 space-y-3 shadow-accent-glow">
                  <div className="flex items-center justify-between border-b border-[#2A3245] pb-2">
                    <h3 className="font-bold text-[#A3E635] text-sm">Tavsiya etilgan</h3>
                    <span className="text-[11px] text-[#A3E635]">1080p / 60 FPS</span>
                  </div>

                  <div className="text-xs space-y-2.5">
                    <div>
                      <span className="text-gray-500 block">Operatsion tizim</span>
                      <span className="text-gray-200">{game.recommendedRequirements.os}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Protsessor</span>
                      <span className="text-gray-200">{game.recommendedRequirements.processor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Operativ xotira (RAM)</span>
                      <span className="text-gray-200">{game.recommendedRequirements.memory}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Videokarta (GPU)</span>
                      <span className="text-gray-200">{game.recommendedRequirements.graphics}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">DirectX</span>
                      <span className="text-gray-200">{game.recommendedRequirements.directX}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bo‘sh disk maydoni</span>
                      <span className="text-gray-200">{game.recommendedRequirements.storage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Store & Actions (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            {/* SubGame Launcher Integration Card */}
            <div className="bg-gradient-to-b from-[#1A1F2A] to-[#141821] rounded-2xl p-5 sm:p-6 border-2 border-[#A3E635]/50 shadow-card-glow space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" />
                  SubGame Launcher
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] font-bold">
                  {game.subtitlePrice}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white">
                Launcher orqali o‘ynash
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Subtitrlar xavfsiz va qulay tarzda faqat <strong>SubGame Launcher</strong> orqali avtomatik o‘rnatiladi va ishga tushiriladi. Qo‘lda fayl ko‘chirib yurish shart emas!
              </p>

              {game.subtitleStatus === 'Tayyor' ? (
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    to="/launcher"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Launcherni yuklab olish (.exe)</span>
                  </Link>

                  <a
                    href={`subgame://open?game=${game.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B0D12] hover:bg-white/5 text-gray-200 border border-[#2A3245] text-xs font-semibold transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-[#A3E635] fill-current" />
                    <span>Launcherda ochish (subgame://)</span>
                  </a>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>
                    {game.subtitleStatus === 'Tez kunda'
                      ? 'Tez kunda taqdim etiladi'
                      : game.subtitleStatus === 'Jarayonda'
                      ? 'Tarjima jarayonda'
                      : 'Hozircha tekshirilmoqda'}
                  </span>
                </button>
              )}

              <div className="text-[11px] text-gray-400 text-center">
                SubGame Launcher virus va zararlardan toza tekshirilgan.
              </div>
            </div>

            {/* Torrent Igruha Download Card */}
            {game.torrentUrl && (
              <div className="bg-gradient-to-b from-[#141821] to-[#0B0D12] rounded-2xl p-5 sm:p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Bepul Torrent
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                    Torrent Igruha
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white">
                  O‘yinni yuklab olish (Torrent)
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  O‘yin kompyuteringizda bo‘lmasa, uni Torrent Igruha orqali bepul torrent repack shaklida yuklab olishingiz mumkin.
                </p>

                <a
                  href={game.torrentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0B0D12] font-black text-sm transition-all shadow-md hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  <span>Torrent Igruhadan yuklab olish</span>
                  <ExternalLink className="w-4 h-4 ml-0.5" />
                </a>

                <div className="text-[11px] text-gray-400 text-center">
                  O‘yinni o‘rnatgach, SubGame o‘zbekcha subtitr paketini o‘rnating.
                </div>
              </div>
            )}

            {/* Official Store Purchase Card */}
            <div className="bg-[#141821] rounded-2xl p-5 sm:p-6 border border-[#2A3245] space-y-4">
              <h3 className="text-base font-bold text-white">
                O‘yinni sotib olish (Litsenziya)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Subtitrdan foydalanish uchun o‘yinning o‘zi kompyuteringizda o‘rnatilgan bo‘lishi lozim. O‘yinni rasmiy do‘konlardan xarid qilishingiz mumkin:
              </p>

              <div className="space-y-2.5">
                {game.officialStoreLinks.map((store) => (
                  <a
                    key={store.name}
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D12] border border-[#2A3245] hover:border-gray-400 text-gray-200 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <span>{store.name} rasmiy sahifasi</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>

              <div className="text-[11px] text-gray-500 pt-2 border-t border-[#2A3245]/60 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>O‘yin narxi do‘konda rasmiy valyutada belgilanadi.</span>
              </div>
            </div>

            {/* Support and Report Card */}
            <div className="bg-[#141821] rounded-2xl p-5 sm:p-6 border border-[#2A3245] space-y-3">
              <h4 className="text-sm font-bold text-white">
                Yordam kerakmi?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Subtitrni o‘rnatishda qiyinchilik bo‘lsa yoki matnda xato topsangiz, bizga xabar bering.
              </p>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1A1F2A] hover:bg-[#222938] text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Xatolik haqida xabar berish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for Screenshots */}
      <Lightbox
        isOpen={lightboxOpen}
        images={game.screenshots}
        currentIndex={activeImageIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setActiveImageIndex((prev) => (prev + 1) % game.screenshots.length)}
        onPrev={() => setActiveImageIndex((prev) => (prev - 1 + game.screenshots.length) % game.screenshots.length)}
        onSelectIndex={(idx) => setActiveImageIndex(idx)}
        title={game.title}
      />

      {/* Report Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        preselectedGameId={game.id}
      />


    </div>
  );
};
