import { SEO } from '../components/common/SEO';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameBySlug } from '../services/gamesService';
import type { Game } from '../types/game';
import { SubtitleStatusBadge } from '../components/common/Badge';
import { Lightbox } from '../components/common/Lightbox';
import { ClickPaymentModal } from '../components/payment/ClickPaymentModal';
import { GameEasterEgg } from '../components/easter-eggs/GameEasterEgg';
import { LicenseEasterEgg } from '../components/easter-eggs/LicenseEasterEgg';
import { AmbientEasterEgg } from '../components/easter-eggs/AmbientEasterEgg';
import { GameDetailSkeleton } from '../components/game/GameDetailSkeleton';
import { useGameTitleFont } from '../components/easter-eggs/useGameTitleFont';
import { ClickLogo, ClickBadge, SteamLogo, EpicGamesLogo } from '../components/common/BrandLogos';
import { getGamePriceInfo, getDubbingPriceInfo } from '../services/paymentService';
import { fetchSingleGameLicenseStats, type GameLicenseCountStats } from '../services/licensesService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth, type LicenseEdition } from '../context/AuthContext';
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
  Info,
  KeyRound,
  ShieldCheck,
  Laptop,
  Tag,
  X,
  ShoppingCart,
  Users,
  Mic,
  FileText
} from 'lucide-react';

export const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // Called before the loading return below, as hooks must run on every render.
  const titleFont = useGameTitleFont(slug);
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      setLoading(true);
      getGameBySlug(slug)
        .then((res) => {
          if (isMounted) {
            setGame(res);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, isAdmin, isLicenseClaimed, claimLicense, getGameLicense, signInWithGoogle } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [isClickModalOpen, setIsClickModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<LicenseEdition>('subtitle');
  const [claimedStats, setClaimedStats] = useState<GameLicenseCountStats>({ total: 0, bound: 0 });

  useEffect(() => {
    if (game?.id) {
      fetchSingleGameLicenseStats(game.id, game.slug)
        .then((stats) => setClaimedStats(stats))
        .catch(() => {});
    }
  }, [game?.id, game?.slug]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      // Clean URL params immediately to prevent replay or URL manipulation
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('orderId');
      url.searchParams.delete('payment_status');
      url.searchParams.delete('payment_id');
      window.history.replaceState({}, '', url.toString());

      setClaimSuccess(true);
      if (game?.id) {
        fetchSingleGameLicenseStats(game.id, game.slug)
          .then((stats) => setClaimedStats(stats))
          .catch(() => {});
      }
      setTimeout(() => setClaimSuccess(false), 8000);
    }
  }, [game?.id, game?.slug]);

  if (loading) {
    return <GameDetailSkeleton />;
  }

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
  const hasSubLicense = isAdmin || isLicenseClaimed(game.id, 'subtitle');
  const hasDubLicense = game.hasDubbing ? (isAdmin || isLicenseClaimed(game.id, 'dubbing')) : false;
  const priceInfo = getGamePriceInfo(game);
  const dubPriceInfo = game.hasDubbing ? getDubbingPriceInfo(game) : null;
  const activeEdition: LicenseEdition = game.hasDubbing ? selectedEdition : 'subtitle';
  const activePriceInfo = activeEdition === 'dubbing' && dubPriceInfo ? dubPriceInfo : priceInfo;
  const hasLicense = activeEdition === 'dubbing' ? hasDubLicense : hasSubLicense;
  const license = getGameLicense(game.id, activeEdition);

  const handleClaimLicense = async (editionOverride?: LicenseEdition) => {
    const ed = editionOverride || activeEdition;
    setIsClaiming(true);
    try {
      const res = await claimLicense(game.id, game.title, game.slug, ed);
      // Agar dublyaj tanlansa, subtitrlar ham qo'shib beriladi
      if (res.success && ed === 'dubbing' && !hasSubLicense) {
        await claimLicense(game.id, game.title, game.slug, 'subtitle');
      }
      if (res.success) {
        setClaimSuccess(true);
        setIsPackageModalOpen(false);
        setClaimedStats((prev) => ({ ...prev, total: prev.total + 1 }));
        setTimeout(() => setClaimSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(false);
    }
  };

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


  const seoTitle = `${game.title} o‘zbek tilida — O‘zbekcha subtitr va tarjima`;
  const seoDescription = `${game.title} o‘yini to‘liq o‘zbek tilida. ${
    game.shortDescription || game.fullDescription?.slice(0, 150) || ''
  } SubGame orqali o‘zbekcha subtitrlarni o‘rnatish, yuklab olish va o‘ynash.`.trim();
  const seoKeywords = [
    `${game.title} o‘zbek tilida`,
    `${game.title} o‘zbekcha subtitr`,
    `${game.title} uzbek tilida`,
    `${game.title} o‘zbekcha tarjima`,
    `${game.title} o‘yini o‘zbek tilida`,
    `${game.title} skachat o‘zbekcha`,
    `${game.title} yuklab olish`,
    `${game.title} subtitr`,
    `${game.title} o‘zbekcha`,
    'SubGame',
    'o‘zbekcha subtitrlar',
    'o‘zbekcha video o‘yinlar',
    'kompyuter o‘yinlari o‘zbek tilida',
    ...(game.genres || [])
  ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: game.title,
      alternateName: `${game.title} o‘zbek tilida`,
      description: game.shortDescription || game.fullDescription,
      genre: game.genres,
      gamePlatform: ['PC', 'Windows'],
      inLanguage: 'uz',
      operatingSystem: 'Windows 10, Windows 11',
      author: {
        '@type': 'Organization',
        name: game.developer || 'SubGame',
      },
      publisher: {
        '@type': 'Organization',
        name: game.publisher || 'SubGame',
      },
      image: game.cardImage || game.heroImage || game.cover,
      url: `https://subgame.uz/games/${game.slug}`,
      offers: {
        '@type': 'Offer',
        price: priceInfo.isPaid ? '10000' : '0',
        priceCurrency: 'UZS',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Bosh sahifa',
          item: 'https://subgame.uz/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'O‘yinlar katalogi',
          item: 'https://subgame.uz/games',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${game.title} o‘zbek tilida`,
          item: `https://subgame.uz/games/${game.slug}`,
        },
      ],
    },
  ];

  const heroBackdrop = game.heroImage || game.cardImage || (game.screenshots && game.screenshots.length > 0 ? game.screenshots[0] : '') || game.cover;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={`https://subgame.uz/games/${game.slug}`}
        ogImage={game.cardImage || game.heroImage || game.cover}
        ogType="article"
        structuredData={structuredData}
      />
      {/* A. Hero Section with Backdrop Artwork */}
      <section className="relative min-h-[460px] sm:min-h-[560px] flex items-end pt-24 sm:pt-32 pb-8 sm:pb-12 overflow-hidden border-b border-[#2A3245]">
        {/* Backdrop Image extending behind navbar */}
        <div className="absolute inset-0 z-0">
          {heroBackdrop ? (
            <img
              src={heroBackdrop}
              alt={game.title}
              className="w-full h-full object-cover object-center filter brightness-[0.80] sm:brightness-[0.85] contrast-[1.05] scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A1F2A] via-[#12161F] to-[#0B0D12]" />
          )}
          {/* Smooth bottom blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-transparent" />
          {/* Left gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/80 via-[#0B0D12]/30 to-transparent" />
          {/* Top subtle shade behind navbar */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0B0D12]/70 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Hero Content: Mobile & Desktop Layout */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start sm:items-end">
            {/* Top Row on Mobile: Poster + Title & Core Badges side-by-side */}
            <div className="flex items-start gap-3.5 sm:gap-0 w-full sm:w-auto">
              {/* Poster Thumbnail */}
              <GameEasterEgg slug={game.slug}>
                <div className="w-28 sm:w-36 lg:w-48 shrink-0 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#2A3245] shadow-2xl bg-[#141821]">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </GameEasterEgg>

              {/* Title & Badges on Mobile (only visible on mobile next to poster) */}
              <div className="flex-1 min-w-0 sm:hidden space-y-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {game.subtitleStatus !== 'Tayyor' && (
                    <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
                  )}

                  {/* Claim count on Mobile */}
                  {claimedStats.total > 0 && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-sm"
                      title={`${claimedStats.total} ta olingan`}
                    >
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>{claimedStats.total} ta olingan</span>
                    </span>
                  )}
                </div>

                {/* Three lines: a two-line title plus the subtitle line under it. */}
                <h1 className="text-xl font-black text-white tracking-tight leading-tight line-clamp-3">
                  <span style={titleFont}>{game.title}</span>
                  <span className="block text-xs font-semibold text-[#A3E635] mt-0.5 tracking-normal">
                    O‘zbek tilida (O‘zbekcha subtitr)
                  </span>
                </h1>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="font-mono bg-[#141821] px-2 py-0.5 rounded border border-[#2A3245]">
                    {game.releaseYear}
                  </span>
                  <span className="truncate max-w-[120px] bg-[#141821] px-2 py-0.5 rounded border border-[#2A3245]">
                    {game.developer}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Info */}
            <div className="space-y-3 sm:space-y-3.5 flex-1 min-w-0 w-full">
              {/* Desktop Badges (hidden on mobile) */}
              <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3">
                {game.subtitleStatus !== 'Tayyor' && (
                  <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
                )}

                {/* Claimed count */}
                {claimedStats.total > 0 && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-sm"
                    title={`${claimedStats.total} ta subtitr foydalanuvchilar tomonidan olingan`}
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{claimedStats.total} ta olingan</span>
                  </div>
                )}

                <span className="text-xs font-mono text-gray-300 bg-[#141821] px-2.5 py-0.5 rounded-full border border-[#2A3245]">
                  {game.releaseYear}
                </span>
                <span className="text-xs text-gray-400 bg-[#141821] px-2.5 py-0.5 rounded-full border border-[#2A3245]">
                  {game.developer}
                </span>
              </div>

              {/* Desktop Title (hidden on mobile) */}
              <h1
                className="hidden sm:block text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
                style={titleFont}
              >
                {game.title}
              </h1>

              {/* Short Description */}
              <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed max-w-3xl line-clamp-3 sm:line-clamp-none">
                {game.shortDescription}
              </p>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] sm:text-xs px-2.5 py-1 rounded-lg bg-[#141821] text-gray-300 border border-[#2A3245]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Primary Action Buttons Bar */}
              <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                {/* Main Action Button */}
                <div className="w-full sm:w-auto">
                  {game.subtitleStatus === 'Tayyor' ? (
                    game.hasDubbing && !(hasSubLicense && hasDubLicense) ? (
                      <button
                        onClick={() => setIsPackageModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#84CC16] text-[#0B0D12] font-extrabold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer whitespace-nowrap h-11 sm:h-10.5"
                      >
                        <ShoppingCart className="w-4 h-4 shrink-0" />
                        <span>Sotib olish</span>
                      </button>
                    ) : !user ? (
                      <button
                        onClick={signInWithGoogle}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#0B0D12] font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-md cursor-pointer whitespace-nowrap h-11 sm:h-10.5"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Google orqali litsenziya olish</span>
                      </button>
                    ) : !hasLicense ? (
                      activePriceInfo.isPaid ? (
                        <button
                          onClick={() => setIsClickModalOpen(true)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#0065FF] hover:bg-[#0052cc] text-white font-extrabold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25 cursor-pointer whitespace-nowrap h-11 sm:h-10.5"
                        >
                          <ClickLogo variant="icon" className="w-4 h-4 text-white shrink-0" />
                          <span>Click orqali sotib olish ({activePriceInfo.text})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaimLicense('subtitle')}
                          disabled={isClaiming}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-xs sm:text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer disabled:opacity-60 whitespace-nowrap h-11 sm:h-10.5"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>{isClaiming ? 'Biriktirilmoqda...' : 'Litsenziyani biriktirish (Bepul)'}</span>
                        </button>
                      )
                    ) : (
                      <Link
                        to="/launcher"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-xs sm:text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer whitespace-nowrap h-11 sm:h-10.5"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isAdmin ? 'Launcherda o‘ynash (VIP Admin)' : 'Launcherni ochish'}</span>
                      </Link>
                    )
                  ) : (
                    <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-3 sm:py-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold whitespace-nowrap h-11 sm:h-10.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Subtitr tayyorlanmoqda ({game.subtitleStatus})</span>
                    </div>
                  )}
                </div>

                {/* Secondary Action Buttons (Geympley, Sevimlilar, Ulashish) */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Gameplay Video Quick Link Button */}
                  {game.gameplayVideoUrl && (
                    <a
                      href="#gameplay-video"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1A202C] text-gray-200 hover:text-white border border-[#2A3245] hover:border-red-500/50 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap h-11"
                    >
                      <Play className="w-3.5 h-3.5 fill-red-400 text-red-400 shrink-0" />
                      <span>Geympley</span>
                    </a>
                  )}

                  {/* Favorite & Share Buttons */}
                  <button
                    onClick={() => toggleFavorite(game.id)}
                    aria-label="Sevimlilar"
                    title="Sevimlilarga qo'shish"
                    className={`flex-1 sm:flex-initial h-11 sm:w-11 px-3 sm:px-0 flex items-center justify-center gap-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      favorited
                        ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                        : 'bg-[#141821] text-gray-300 hover:text-white border-[#2A3245] hover:border-gray-500 hover:bg-[#1A202C]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 shrink-0 ${favorited ? 'fill-rose-500' : ''}`} />
                    <span className="text-xs sm:hidden">Sevimli</span>
                  </button>

                  <button
                    onClick={handleShare}
                    aria-label="Ulashish"
                    title="Ulashish"
                    className="flex-1 sm:flex-initial h-11 sm:w-11 px-3 sm:px-0 flex items-center justify-center gap-1.5 rounded-xl bg-[#141821] border border-[#2A3245] text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#1A202C] transition-colors cursor-pointer shrink-0"
                  >
                    {shared ? <Check className="w-4 h-4 text-[#A3E635] shrink-0" /> : <Share2 className="w-4 h-4 shrink-0" />}
                    <span className="text-xs sm:hidden">Ulashish</span>
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
                    href={game.gameplayVideoUrl.replace('/embed/', '/watch?v=')}
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
                {game.subtitleStatus !== 'Tayyor' && (
                  <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
                )}
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

                {/* Dubbing Info Card - Only shown if game has dubbing */}
                {game.hasDubbing && dubPriceInfo && (
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/35 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-violet-300 uppercase tracking-wider font-bold flex items-center gap-1.5 mb-1">
                        <Mic className="w-3.5 h-3.5 text-violet-400" />
                        <span>O‘zbekcha Dublyaj</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-200 font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/20 border border-violet-400/30 text-violet-200">
                          {game.dubbingType || 'AI Dublyaj'}
                        </span>
                        <span className="text-gray-400 font-normal">
                          • Versiya: {game.dubbingVersion || 'v1.0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#0B0D12] text-violet-300 border border-violet-500/30">
                        {game.dubbingSize || '—'}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-black border ${
                        dubPriceInfo.isPaid
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                          : 'bg-violet-500/20 text-violet-200 border-violet-400/40'
                      }`}>
                        <Tag className="w-4 h-4" />
                        <span>{dubPriceInfo.text}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Subtitle License Price - Only shown if game is ready */}
                {game.subtitleStatus === 'Tayyor' && (
                  <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245] sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block mb-0.5">
                        Subtitr Litsenziya Narxi
                      </span>
                      <span className="text-xs text-gray-400">
                        1 ta kompyuter uchun rasmiy faollashtirish
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-black border ${
                        priceInfo.isPaid
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/20'
                          : 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/40 shadow-sm shadow-lime-500/20'
                      }`}>
                        <Tag className="w-4 h-4" />
                        <span>{priceInfo.text}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Claimed Players Stat */}
                {claimedStats.total > 0 && (
                  <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245] sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block mb-0.5">
                        O‘yinchilar statistikasi
                      </span>
                      <span className="text-xs text-gray-400">
                        Subtitrni olgan faol foydalanuvchilar soni
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>{claimedStats.total} ta {claimedStats.bound > 0 ? `(${claimedStats.bound} ta PC da)` : ''}</span>
                      </span>
                    </div>
                  </div>
                )}
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
                <div className="flex items-center gap-2">
                  <Link
                    to="/launcher#video-guide"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all shrink-0"
                    title="Launcherni o'rnatish va ishlatish bo'yicha video qo'llanma"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Video qo‘llanma</span>
                  </Link>
                  <FolderOpen className="hidden sm:block w-5 h-5 text-[#A3E635] shrink-0" />
                </div>
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

              </section>

            {/* D. Verified System Requirements */}
            {Boolean(
              (game.minimumRequirements && Object.values(game.minimumRequirements).some((v) => typeof v === 'string' && v.trim())) ||
              (game.recommendedRequirements && Object.values(game.recommendedRequirements).some((v) => typeof v === 'string' && v.trim()))
            ) && (
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
                    <div className="border-b border-[#2A3245] pb-2">
                      <h3 className="font-bold text-white text-sm">Minimal talablar</h3>
                    </div>

                    <div className="text-xs space-y-2.5">
                      <div>
                        <span className="text-gray-500 block">Operatsion tizim</span>
                        <span className="text-gray-200">{game.minimumRequirements?.os || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Protsessor</span>
                        <span className="text-gray-200">{game.minimumRequirements?.processor || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Operativ xotira (RAM)</span>
                        <span className="text-gray-200">{game.minimumRequirements?.memory || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Videokarta (GPU)</span>
                        <span className="text-gray-200">{game.minimumRequirements?.graphics || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">DirectX</span>
                        <span className="text-gray-200">{game.minimumRequirements?.directX || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Bo‘sh disk maydoni</span>
                        <span className="text-gray-200">{game.minimumRequirements?.storage || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended */}
                  <div className="bg-[#0B0D12] p-4 sm:p-5 rounded-xl border border-[#A3E635]/30 space-y-3 shadow-accent-glow">
                    <div className="border-b border-[#2A3245] pb-2">
                      <h3 className="font-bold text-[#A3E635] text-sm">Tavsiya etilgan</h3>
                    </div>

                    <div className="text-xs space-y-2.5">
                      <div>
                        <span className="text-gray-500 block">Operatsion tizim</span>
                        <span className="text-gray-200">{game.recommendedRequirements?.os || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Protsessor</span>
                        <span className="text-gray-200">{game.recommendedRequirements?.processor || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Operativ xotira (RAM)</span>
                        <span className="text-gray-200">{game.recommendedRequirements?.memory || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Videokarta (GPU)</span>
                        <span className="text-gray-200">{game.recommendedRequirements?.graphics || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">DirectX</span>
                        <span className="text-gray-200">{game.recommendedRequirements?.directX || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Bo‘sh disk maydoni</span>
                        <span className="text-gray-200">{game.recommendedRequirements?.storage || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar: Store & Actions (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            {/* SubGame Launcher Integration Card */}
            <div className="bg-gradient-to-b from-[#1A1F2A] to-[#141821] rounded-2xl p-5 sm:p-6 border-2 border-[#A3E635]/50 shadow-card-glow space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  DRM Himoyalangan Litsenziya
                </span>
              </div>

              {/* Admin badge only (Subtitle license price box removed per design) */}
              {isAdmin && (
                <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#A3E635]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#A3E635] block font-bold">Admin hisobi:</span>
                    <span className="text-[10px] text-gray-400">Barcha o‘yinlarga to‘liq bepul kirish</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md font-black bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/40">
                    ADMIN
                  </span>
                </div>
              )}

              <h3 className="text-base sm:text-lg font-bold text-white">
                1 Akkaunt = 1 Qurilma
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Subtitrlar xavfsiz va faqat sizning Google akkauntingiz orqali <strong>1 ta kompyuterga</strong> avtomatik bog‘lanadi. Boshqa kompyuterlarga nusxalashdan himoyalangan.
              </p>

              {claimedStats.total > 0 && (
                <div className="p-3 rounded-xl bg-[#0B0D12] border border-cyan-500/30 flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Olingan litsenziyalar:
                  </span>
                  <span className="font-bold text-cyan-300">
                    {claimedStats.total} ta {claimedStats.bound > 0 ? `(${claimedStats.bound} ta kompyuterda)` : ''}
                  </span>
                </div>
              )}

              {game.subtitleStatus === 'Tayyor' ? (
                <div className="space-y-3 pt-1">
                  {!user ? (
                    <button
                      onClick={signInWithGoogle}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#0B0D12] font-extrabold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Google bilan kirish va litsenziya olish</span>
                    </button>
                  ) : game.hasDubbing && !(hasSubLicense && hasDubLicense) ? (
                    <button
                      onClick={() => setIsPackageModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#A3E635] text-[#0B0D12] font-extrabold text-xs sm:text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 shrink-0" />
                      <span>Sotib olish</span>
                    </button>
                  ) : !hasLicense ? (
                    priceInfo.isPaid ? (
                      <button
                        onClick={() => setIsClickModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0065FF] hover:bg-[#0052cc] text-white font-extrabold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25 cursor-pointer"
                      >
                        <ClickLogo variant="icon" className="w-4 h-4 text-white shrink-0" />
                        <span>Click orqali sotib olish ({priceInfo.text})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaimLicense('subtitle')}
                        disabled={isClaiming}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-xs hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer disabled:opacity-60"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{isClaiming ? 'Biriktirilmoqda...' : 'Bepul litsenziyani faollashtirish'}</span>
                      </button>
                    )
                  ) : (
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#2A3245] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Holat:</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {isAdmin ? 'Admin ruxsati (To‘liq kirish)' : 'Akkauntga biriktirilgan'}
                          </span>
                        </div>
                        {!isAdmin && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Qurilma (HWID):</span>
                            <span className="text-gray-300 font-mono text-[11px]">
                              {license?.hwid ? (
                                <span className="text-[#A3E635] flex items-center gap-1">
                                  <Laptop className="w-3 h-3" />
                                  {license.boundDeviceName || `${license.hwid.substring(0, 10)}...`}
                                </span>
                              ) : (
                                <span className="text-amber-400">Launcherni kuting</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/launcher"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-xs hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isAdmin ? 'Launcherda o‘ynash (VIP Admin)' : 'Launcherni yuklab olish (.exe)'}</span>
                      </Link>
                    </div>
                  )}
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
            {game.officialStoreLinks && game.officialStoreLinks.length > 0 && (
              <div className="bg-[#141821] rounded-2xl p-5 sm:p-6 border border-[#2A3245] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#A3E635]" />
                  <span>O‘yinni sotib olish (Litsenziya)</span>
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Subtitrdan foydalanish uchun o‘yinning o‘zi kompyuteringizda o‘rnatilgan bo‘lishi lozim. O‘yinni rasmiy do‘konlardan xarid qilishingiz mumkin:
                </p>

                <div className="space-y-2.5">
                  {game.officialStoreLinks.map((store) => {
                    const nameLower = store.name.toLowerCase();
                    const isSteam = nameLower.includes('steam');
                    const isEpic = nameLower.includes('epic');

                    return (
                      <a
                        key={store.name + store.url}
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] hover:border-[#A3E635]/60 hover:bg-[#141821] text-gray-200 hover:text-white transition-all text-xs sm:text-sm group"
                      >
                        <div className="flex items-center gap-2.5 font-bold">
                          {isSteam && <SteamLogo className="w-5 h-5 shrink-0" />}
                          {isEpic && <EpicGamesLogo className="w-5 h-5 shrink-0" />}
                          {!isSteam && !isEpic && <ExternalLink className="w-4 h-4 text-[#A3E635] shrink-0" />}
                          <span>{store.name} rasmiy sahifasi</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#A3E635] transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>

                <div className="text-[11px] text-gray-500 pt-2 border-t border-[#2A3245]/60 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>O‘yin narxi do‘konda rasmiy valyutada belgilanadi.</span>
                </div>
              </div>
            )}

            
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

      

      <LicenseEasterEgg slug={game.slug} active={claimSuccess} />
      <AmbientEasterEgg slug={game.slug} />

      {/* Floating Corner Toast Notification */}
      {claimSuccess && (
        <div className="fixed top-20 sm:top-24 left-3 right-3 sm:left-auto sm:right-8 z-50 sm:max-w-sm p-3.5 sm:p-4 rounded-2xl bg-[#141821]/95 backdrop-blur-md border border-[#A3E635]/60 shadow-2xl shadow-black/90 flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              Litsenziya faollashtirildi!
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 leading-relaxed">
              <strong>{game.title}</strong> o‘yini akkauntingizga biriktirildi. Launcher orqali o‘ynashingiz mumkin.
            </p>
          </div>
          <button
            onClick={() => setClaimSuccess(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Package Selection Modal (Subtitr vs Dublyaj + Subtitr) */}
      {isPackageModalOpen && game.hasDubbing && dubPriceInfo && (() => {
        const chosenPrice = selectedEdition === 'dubbing' ? dubPriceInfo : priceInfo;
        const anyPaid = priceInfo.isPaid || dubPriceInfo.isPaid;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0 cursor-pointer" onClick={() => setIsPackageModalOpen(false)} aria-hidden="true" />
            <div className="relative w-full max-w-md bg-[#121620] border-t sm:border border-[#2A3245] rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[95vh]">
              {/* Mobile top pull indicator */}
              <div className="sm:hidden w-12 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 shrink-0" />

              {/* Header with Game Image banner */}
              <div className="relative h-28 sm:h-36 w-full bg-[#0B0D12] overflow-hidden shrink-0">
                <img
                  src={game.cardImage || game.cover}
                  alt={game.title}
                  className="w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-[#121620]/60 to-transparent" />

                <button
                  onClick={() => setIsPackageModalOpen(false)}
                  aria-label="Yopish"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white transition-all cursor-pointer backdrop-blur-sm shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-4 right-4 sm:left-5 sm:right-5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#A3E635] tracking-wider block">
                      Rasmiy Litsenziya
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                      {game.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-gray-400 block font-medium">Litsenziya narxi:</span>
                    <span className="text-base sm:text-lg font-black text-[#A3E635] drop-shadow-[0_0_12px_rgba(163,230,53,0.35)]">
                      {chosenPrice.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
                {/* Package options */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEdition('subtitle')}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedEdition === 'subtitle'
                        ? 'bg-[#A3E635]/15 border-[#A3E635] shadow-md shadow-[#A3E635]/10'
                        : 'bg-[#0B0D12]/80 border-[#2A3245] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A3E635]" />
                        <span className="font-bold text-sm text-white">Faqat Subtitr</span>
                        {hasSubLicense && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635]">
                            Olingan
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-[#A3E635]">{priceInfo.text}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                      <span>O‘zbekcha matn tarjimasi</span>
                      <span className="font-mono">{game.subtitleSize || 'Kichik'}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedEdition('dubbing')}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedEdition === 'dubbing'
                        ? 'bg-violet-500/20 border-violet-400 shadow-md shadow-violet-500/15'
                        : 'bg-[#0B0D12]/80 border-[#2A3245] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-violet-400" />
                        <span className="font-bold text-sm text-white">Dublyaj + Subtitr</span>
                        {hasDubLicense && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/25 text-violet-200">
                            Olingan
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-violet-300">{dubPriceInfo.text}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-300">
                      <span>{game.dubbingType || 'AI Dublyaj'} • Subtitr qo‘shib beriladi</span>
                      <span className="font-mono text-violet-300">{game.dubbingSize || '1.16 GB'}</span>
                    </div>
                  </button>
                </div>

                {/* DRM Notice */}
                <div className="p-3 rounded-2xl bg-[#0B0D12]/80 border border-[#2A3245] space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-[#A3E635] shrink-0" />
                    <span>SubGame 1-Qurilma (DRM) Himoyasi</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
                    Litsenziya olingandan so‘ng <strong className="text-gray-200">{user?.email || 'hisobingiz'}</strong>ga biriktiriladi va SubGame Launcherda ushbu kompyuteringiz uchun avtomatik faollashadi.
                  </p>
                </div>

                {/* Click Payment Provider Info (Uzcard / Humo) */}
                {(chosenPrice.isPaid || anyPaid) && (
                  <div className="p-3 rounded-2xl bg-[#0065FF]/10 border border-[#0065FF]/25 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ClickBadge size="md" />
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-black text-white block truncate">
                          Click Up / Click Merchant
                        </span>
                        <span className="text-[11px] text-sky-300 block truncate">
                          Click ilovasi yoki Uzcard / Humo karta
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 text-[10px] font-extrabold whitespace-nowrap shrink-0">
                      0% Komissiya
                    </span>
                  </div>
                )}

                {/* Action Button */}
                <div className="space-y-2 pt-1">
                  {!user ? (
                    <button
                      onClick={signInWithGoogle}
                      className="w-full h-12 flex items-center justify-center gap-2.5 rounded-2xl bg-white hover:bg-gray-100 text-[#0B0D12] font-extrabold text-sm transition-all cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Google orqali kirish va olish</span>
                    </button>
                  ) : ((selectedEdition === 'subtitle' && hasSubLicense) || (selectedEdition === 'dubbing' && hasDubLicense)) ? (
                    <Link
                      to="/launcher"
                      onClick={() => setIsPackageModalOpen(false)}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#A3E635] hover:bg-[#84CC16] text-[#0B0D12] font-extrabold text-sm transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launcherni ochish</span>
                    </Link>
                  ) : chosenPrice.isPaid ? (
                    <button
                      onClick={() => {
                        setIsPackageModalOpen(false);
                        setIsClickModalOpen(true);
                      }}
                      className="w-full h-12 flex items-center justify-center gap-2.5 px-4 rounded-2xl bg-[#0065FF] hover:bg-[#0052cc] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <ClickLogo variant="icon" className="w-5 h-5 text-white shrink-0" />
                      <span>Click orqali to‘lov qilish ({chosenPrice.text})</span>
                      <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaimLicense(selectedEdition)}
                      disabled={isClaiming}
                      className={`w-full h-12 flex items-center justify-center gap-2 rounded-2xl font-extrabold text-sm transition-all cursor-pointer disabled:opacity-60 ${
                        selectedEdition === 'dubbing'
                          ? 'bg-violet-500 hover:bg-violet-400 text-white'
                          : 'bg-[#A3E635] hover:bg-[#84CC16] text-[#0B0D12]'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>
                        {isClaiming
                          ? 'Biriktirilmoqda...'
                          : selectedEdition === 'dubbing'
                            ? 'Dublyaj + Subtitrni olish (Bepul)'
                            : 'Subtitrni olish (Bepul)'}
                      </span>
                    </button>
                  )}

                  {/* Card payment hint */}
                  <p className="text-[11px] text-gray-400 text-center leading-relaxed px-1">
                    Pullik paketlarda Click ilovasi shart emas: to‘lov sahifasida <span className="text-white font-semibold">«Оплата картой»</span> ni tanlab, Uzcard yoki Humo karta ma’lumotlarini kiriting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Click Payment Modal */}
      {isClickModalOpen && user && !isAdmin && (
        <ClickPaymentModal
          game={game}
          user={user}
          edition={activeEdition}
          onClose={() => setIsClickModalOpen(false)}
          onSuccess={() => {
            setIsClickModalOpen(false);
            setClaimSuccess(true);
            setTimeout(() => setClaimSuccess(false), 8000);
          }}
        />
      )}

    </div>
  );
};
