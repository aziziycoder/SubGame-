import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Gamepad2,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  X,
  Save,
  AlertCircle,
  FileCode,
  HardDrive,
  ArrowLeft,
  Layers,
  Users,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import {
  getGames,
  createGame,
  updateGame,
  deleteGame,
  syncInitialGames
} from '../services/gamesService';
import type { Game, SubtitleStatus } from '../types/game';
import { useAuth } from '../context/AuthContext';
import { SliderManager } from '../components/admin/SliderManager';
import { UserManager } from '../components/admin/UserManager';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'games' | 'sliders' | 'users'>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Barchasi');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleSubtitleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const gameSlug = (formData.slug?.trim().toLowerCase() || 'general').replace(/[^a-z0-9-]+/g, '-');
    setUploadingFile(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const fileRef = ref(storage, `subtitles/${gameSlug}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadError('Faylni yuklashda xatolik yuz berdi: ' + error.message);
          setUploadingFile(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const formattedSize =
            file.size >= 1048576
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${(file.size / 1024).toFixed(1)} KB`;

          setFormData((prev) => ({
            ...prev,
            targetFileName: prev.targetFileName || file.name,
            subtitleSize: formattedSize,
            subtitleDownloadUrl: downloadUrl,
          }));
          setUploadedFileName(file.name);
          setUploadingFile(false);
          setUploadProgress(100);
        }
      );
    } catch (err: any) {
      setUploadError(err.message || 'Yuklashda xatolik');
      setUploadingFile(false);
    }
  };

  // Form State
  const initialFormState: Partial<Game> = {
    title: '',
    slug: '',
    cover: '',
    cardImage: '',
    heroImage: '',
    gameplayVideoUrl: '',
    torrentUrl: '',
    screenshots: [],
    shortDescription: '',
    fullDescription: '',
    releaseYear: new Date().getFullYear(),
    developer: '',
    publisher: '',
    genres: ['Sarguzasht', 'Action'],
    platforms: ['PC'],
    price: 'Tekin',
    priceNote: 'O‘yin va o‘zbekcha subtitr SubGame platformasida bepul taqdim etiladi.',
    subtitleStatus: 'Tayyor',
    subtitleLanguage: 'O‘zbekcha (Lotin)',
    subtitleVersion: 'v1.0.0',
    subtitleLastUpdated: new Date().toISOString().split('T')[0],
    subtitleCompatibility: 'Steam va Epic Games nashrlari',
    subtitleFormat: 'SubGame Launcher himoyalangan lokalizatsiyasi',
    subtitleSize: '1.5 MB',
    subtitleDownloadUrl: '/launcher',
    subtitlePrice: 'Bepul',
    subtitleTranslationType: 'To‘liq adabiy o‘zbekcha tarjima',
    isFeatured: true,
    tags: ['O‘zbekcha subtitr'],
    // Launcher fields
    defaultExeName: '',
    targetFileName: 'tt01.pc',
    targetRelativeDir: 'TRTEXT',
    keyPrefix: 'SUB-GAME',
  };

  const [formData, setFormData] = useState<Partial<Game>>(initialFormState);
  const [genresInput, setGenresInput] = useState('Sarguzasht, Action');
  const [screenshotsInput, setScreenshotsInput] = useState('');

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await getGames();
      setGames(data);
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    setGenresInput('Sarguzasht, Action');
    setScreenshotsInput('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (game: Game) => {
    setIsEditing(true);
    setEditingId(game.id);
    setFormData({ ...game });
    setGenresInput(game.genres ? game.genres.join(', ') : '');
    setScreenshotsInput(game.screenshots ? game.screenshots.join('\n') : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSyncInitial = async () => {
    if (!window.confirm('Boshlang‘ich o‘yinlar (Innocence, Requiem, Outward 2, Level Devil) bazaga yuklansinmi? Mavjud o‘yinlaringiz sozlamalari saqlanadi.')) {
      return;
    }
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncInitialGames();
      if (res.success) {
        setSyncMessage(`Muvaffaqiyatli! ${res.count} ta yangi o‘yin Firestore bazasiga qo‘shildi.`);
        await loadGames();
      } else {
        setSyncMessage(`Xatolik: ${res.error}`);
      }
    } catch (err: any) {
      setSyncMessage(`Xatolik yuz berdi: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Haqiqatan ham "${title}" o‘yinini o‘chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await deleteGame(id);
      if (res.success) {
        await loadGames();
      } else {
        alert(`O‘chirishda xatolik: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title || !formData.slug) {
      setFormError('O‘yin nomi va slug (URL kaliti) kiritilishi shart!');
      return;
    }

    setSubmitting(true);

    const parsedGenres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const parsedScreenshots = screenshotsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const isUpcoming = formData.subtitleStatus === 'Jarayonda' || formData.subtitleStatus === 'Tez kunda';
    const computedPrice = isUpcoming ? (formData.price && formData.price !== 'Tekin' ? formData.price : 'Tez kunda') : (formData.price || 'Tekin');
    const computedSubtitlePrice: 'Bepul' | 'Pullik' | 'Tez kunda' = isUpcoming
      ? (formData.subtitlePrice && formData.subtitlePrice !== 'Bepul' ? formData.subtitlePrice : 'Tez kunda')
      : (formData.subtitlePrice || 'Bepul');
    const computedPriceNote = isUpcoming ? 'O‘yin subtitrlari tayyorlanmoqda, narxi tez kunda e’lon qilinadi.' : (formData.priceNote || 'O‘yin va o‘zbekcha subtitr SubGame platformasida bepul taqdim etiladi.');

    const payload: Game = {
      ...initialFormState,
      ...formData,
      heroImage: formData.heroImage || formData.cardImage || (parsedScreenshots.length > 0 ? parsedScreenshots[0] : '') || formData.cover || '',
      price: computedPrice,
      subtitlePrice: computedSubtitlePrice,
      priceNote: computedPriceNote,
      id: editingId || formData.slug!,
      slug: formData.slug!.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-'),
      genres: parsedGenres.length > 0 ? parsedGenres : ['Sarguzasht'],
      screenshots: parsedScreenshots,
      installationGuide: formData.installationGuide || [
        {
          step: 1,
          title: 'SubGame Launcherni oching',
          description: 'SubGame Launcher ilovasini ishga tushiring.'
        },
        {
          step: 2,
          title: 'O‘yin ijro faylini (.exe) tanlang',
          description: `O‘rnatilgan papkadagi ${formData.defaultExeName || 'o‘yin fayli'}ni ko‘rsating.`
        },
        {
          step: 3,
          title: 'O‘yinni boshlash',
          description: 'O‘yinni boshlash tugmasini bosing. Subtitrlar avtomatik ulanadi.'
        }
      ],
      minimumRequirements: formData.minimumRequirements || {
        os: 'Windows 10 (64-bit)',
        processor: 'Intel Core i5 / AMD Ryzen 5',
        memory: '8 GB RAM',
        graphics: 'GeForce GTX 1060 / Radeon RX 580',
        directX: 'Versiya 11',
        storage: '30 GB bo‘sh joy'
      },
      recommendedRequirements: formData.recommendedRequirements || {
        os: 'Windows 10/11 (64-bit)',
        processor: 'Intel Core i7 / AMD Ryzen 7',
        memory: '16 GB RAM',
        graphics: 'GeForce RTX 2060 / Radeon RX 5700',
        directX: 'Versiya 12',
        storage: 'SSD (30 GB)'
      },
      officialStoreLinks: formData.officialStoreLinks || [],
    } as Game;

    try {
      if (isEditing && editingId) {
        const res = await updateGame(editingId, payload);
        if (res.success) {
          setIsModalOpen(false);
          await loadGames();
        } else {
          setFormError(res.error || 'Yangilashda xatolik yuz berdi');
        }
      } else {
        const res = await createGame(payload);
        if (res.success) {
          setIsModalOpen(false);
          await loadGames();
        } else {
          setFormError(res.error || 'Qo‘shishda xatolik yuz berdi');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered games
  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Barchasi' || g.subtitleStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGames = games.length;
  const readyGames = games.filter((g) => g.subtitleStatus === 'Tayyor').length;
  const inProgressGames = games.filter((g) => g.subtitleStatus === 'Jarayonda').length;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] pb-24">
      {/* Dedicated Admin Header (Replaces public navbar on /admin) */}
      <header className="border-b border-[#2A3245] bg-[#141821] sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/images/logo_doppi.png"
                alt="SubGame"
                className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(163,230,53,0.35)] group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-black text-white group-hover:text-[#A3E635] transition-colors">
                Sub<span className="text-[#A3E635]">Game</span>
              </span>
            </Link>

            <span className="h-6 w-px bg-[#2A3245]" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center font-bold">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-white leading-none">
                  Admin Panel
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                  BOSHQARUV
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0D12] border border-[#2A3245] text-xs text-gray-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
              {user?.email}
            </span>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0D12] hover:bg-[#1A202C] text-gray-200 hover:text-white border border-[#2A3245] hover:border-[#A3E635]/50 text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Saytga qaytish</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Jami O‘yinlar</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{totalGames}</span>
              <Gamepad2 className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141821] border border-emerald-500/20 space-y-2">
            <span className="text-xs text-emerald-400 uppercase tracking-wider block">Tayyor Subtitrlar</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-400">{readyGames}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141821] border border-amber-500/20 space-y-2">
            <span className="text-xs text-amber-400 uppercase tracking-wider block">Jarayonda</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-400">{inProgressGames}</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141821] border border-[#A3E635]/20 space-y-2">
            <span className="text-xs text-[#A3E635] uppercase tracking-wider block">Launcher Integratsiyasi</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-300 font-mono">Dinamik Firestore</span>
              <Sparkles className="w-5 h-5 text-[#A3E635]" />
            </div>
          </div>
        </div>

        {/* Sync message alert if any */}
        {syncMessage && (
          <div className="p-4 rounded-xl bg-[#1A1F2A] border border-[#A3E635]/40 text-sm flex items-center justify-between text-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#A3E635] shrink-0" />
              <span>{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2A3245] pb-2">
          <button
            onClick={() => setActiveTab('games')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'games'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-accent-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#141821] border border-transparent'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>O‘yinlar Katalogi</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'games' ? 'bg-black/20 text-[#0B0D12]' : 'bg-[#1E2533] text-gray-400'
              }`}
            >
              {totalGames}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sliders')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'sliders'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-accent-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#141821] border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bosh Sahifa Slayderlari</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'sliders' ? 'bg-black/20 text-[#0B0D12]' : 'bg-[#1E2533] text-gray-400'
              }`}
            >
              Boshqaruv
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-accent-glow'
                : 'text-gray-400 hover:text-white hover:bg-[#141821] border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Foydalanuvchilar</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'users' ? 'bg-black/20 text-[#0B0D12]' : 'bg-[#1E2533] text-gray-400'
              }`}
            >
              Boshqaruv
            </span>
          </button>
        </div>

        {activeTab === 'games' ? (
          <>
        {/* Action Bar (Search, Filter, Buttons) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search & Filter */}
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="O‘yin nomi, slug yoki muallif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-gray-300 focus:outline-none focus:border-[#A3E635]"
            >
              <option value="Barchasi">Barcha holatlar</option>
              <option value="Tayyor">Tayyor</option>
              <option value="Jarayonda">Jarayonda</option>
              <option value="Tez kunda">Tez kunda</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncInitial}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1A202C] text-gray-300 hover:text-white border border-[#2A3245] text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Mavjud bo‘lmagan boshlang‘ich o‘yinlarni Firestore bazasiga yuklash (mavjudlari saqlanadi)"
            >
              <RefreshCw className={`w-4 h-4 text-[#A3E635] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Yuklanmoqda...' : 'Boshlang‘ich O‘yinlarni Yuklash'}</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-xs sm:text-sm hover:bg-[#84CC16] shadow-accent-glow transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Yangi o‘yin qo‘shish</span>
            </button>
          </div>
        </div>

        {/* Games Table */}
        <div className="bg-[#141821] rounded-2xl border border-[#2A3245] overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">O‘yinlar bazadan yuklanmoqda...</span>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">O‘yinlar topilmadi</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Bazaga yangi o‘yin qo‘shishingiz yoki yuqoridagi "O‘yinlarni Bazaga Sinxronlash" tugmasi orqali mavjud o‘yinlarni yuklashingiz mumkin.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0B0D12]/70 text-[11px] uppercase tracking-wider text-gray-400 border-b border-[#2A3245]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">O‘yin & Muallif</th>
                    <th className="py-3.5 px-4 font-bold">Holat</th>
                    <th className="py-3.5 px-4 font-bold">Launcher Maqsadi (Folder & File)</th>
                    <th className="py-3.5 px-4 font-bold">Bajariluvchi Fayl (.exe)</th>
                    <th className="py-3.5 px-4 font-bold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3245]/60">
                  {filteredGames.map((game) => (
                    <tr key={game.id} className="hover:bg-[#1A202C]/50 transition-colors">
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.cardImage || game.cover}
                            alt={game.title}
                            className="w-12 h-7 sm:w-14 sm:h-8 object-cover rounded-md border border-[#2A3245] bg-black shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/logo_doppi.png';
                            }}
                          />
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {game.title}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {game.developer} • {game.releaseYear} • <span className="font-mono text-gray-500">/{game.slug}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            game.subtitleStatus === 'Tayyor'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : game.subtitleStatus === 'Jarayonda'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {game.subtitleStatus} ({game.subtitleVersion || 'v1.0.0'})
                        </span>
                      </td>

                      {/* Launcher Target */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-amber-400">{game.targetRelativeDir || 'TRTEXT'}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-emerald-400 font-semibold">{game.targetFileName || 'tt01.pc'}</span>
                        </div>
                      </td>

                      {/* Executable */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-gray-500" />
                          <span>{game.defaultExeName || 'Game.exe'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/games/${game.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-[#0B0D12] hover:bg-[#1F2736] text-gray-400 hover:text-white transition-colors"
                            title="Saytda ko‘rish"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(game)}
                            className="p-2 rounded-lg bg-[#0B0D12] hover:bg-[#1F2736] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(game.id, game.title)}
                            className="p-2 rounded-lg bg-[#0B0D12] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        ) : activeTab === 'sliders' ? (
          <SliderManager games={games} />
        ) : (
          <UserManager />
        )}
      </main>

      {/* Add / Edit Game Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-[#141821] border border-[#2A3245] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#2A3245] flex items-center justify-between bg-[#0B0D12]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isEditing ? `"${formData.title}" o‘yinini tahrirlash` : 'Yangi o‘yin qo‘shish'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Barcha o‘zgarishlar sayt va Launcherga real vaqtda uzatiladi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A202C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Asosiy Ma'lumotlar */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#A3E635] uppercase tracking-wider flex items-center gap-2">
                  <span>1. Asosiy Ma‘lumotlar</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      O‘yin nomi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: God of War"
                      value={formData.title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title: val,
                          slug: isEditing ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Slug (URL manzili) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="masalan: god-of-war"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Ishlab chiquvchi (Developer)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Santa Monica Studio"
                      value={formData.developer || ''}
                      onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Chiqqan yili
                    </label>
                    <input
                      type="number"
                      value={formData.releaseYear || 2026}
                      onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) || 2026 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Janrlar (vergul bilan ajrating)
                    </label>
                    <input
                      type="text"
                      placeholder="Action, Sarguzasht, RPG"
                      value={genresInput}
                      onChange={(e) => setGenresInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Qisqa tavsif
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Katalog va kartochkalarda ko‘rinadigan qisqacha ta‘rif..."
                      value={formData.shortDescription || ''}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      To‘liq tavsif
                    </label>
                    <textarea
                      rows={3}
                      placeholder="O‘yin haqida to‘liq hikoya va mazmun..."
                      value={formData.fullDescription || ''}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Rasmlar va Medialar */}
              <div className="space-y-4 pt-4 border-t border-[#2A3245]">
                <h4 className="text-xs font-bold text-[#A3E635] uppercase tracking-wider">
                  2. Rasmlar va Havolalar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Header / Karta rasmi URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... yoki /images/..."
                      value={formData.cardImage || ''}
                      onChange={(e) => setFormData({ ...formData, cardImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Muqova rasmi (Cover) URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... yoki /images/..."
                      value={formData.cover || ''}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      YouTube Geympley Videosi URL (Embed)
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/..."
                      value={formData.gameplayVideoUrl || ''}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.includes('watch?v=')) {
                          val = val.replace('watch?v=', 'embed/').split('&')[0];
                        } else if (val.includes('youtu.be/')) {
                          val = val.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
                        }
                        setFormData({ ...formData, gameplayVideoUrl: val });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Torrent Igruha Yuklash Havolasi
                    </label>
                    <input
                      type="text"
                      placeholder="https://itorrents-igruha.org/..."
                      value={formData.torrentUrl || ''}
                      onChange={(e) => setFormData({ ...formData, torrentUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Katta Fon rasmi (Hero Banner 1920x1080) URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... (o‘yin sahifasining katta orqa fon rasmi)"
                      value={formData.heroImage || ''}
                      onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Skrinshotlar (Har bir qatorda bittadan rasm havolasi)
                    </label>
                    <textarea
                      rows={3}
                      placeholder={`https://...\nhttps://...`}
                      value={screenshotsInput}
                      onChange={(e) => setScreenshotsInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Subtitr va Launcher Parametrlari */}
              <div className="space-y-4 pt-4 border-t border-[#2A3245]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#A3E635] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3. Launcher & Subtitr Avtomatika Parametrlari</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    Launcher o‘rnatishda shu qiymatlarga tayanadi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Subtitr holati
                    </label>
                    <select
                      value={formData.subtitleStatus || 'Tayyor'}
                      onChange={(e) => {
                        const status = e.target.value as SubtitleStatus;
                        const isUpcoming = status === 'Jarayonda' || status === 'Tez kunda';
                        setFormData((prev) => ({
                          ...prev,
                          subtitleStatus: status,
                          price: isUpcoming ? 'Tez kunda' : (prev.price === 'Tez kunda' ? 'Tekin' : (prev.price || 'Tekin')),
                          subtitlePrice: isUpcoming ? 'Tez kunda' : (prev.subtitlePrice === 'Tez kunda' ? 'Bepul' : (prev.subtitlePrice || 'Bepul')),
                          priceNote: isUpcoming
                            ? 'O‘yin subtitrlari tayyorlanmoqda, narxi tez kunda e’lon qilinadi.'
                            : 'O‘yin va o‘zbekcha subtitr SubGame platformasida bepul taqdim etiladi.'
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                    >
                      <option value="Tayyor">Tayyor (Yuklab olish mumkin)</option>
                      <option value="Jarayonda">Jarayonda (Ishlanmoqda)</option>
                      <option value="Tez kunda">Tez kunda (Kutilmoqda)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      O‘yin va subtitr narxi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Tekin yoki Tez kunda"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                        />
                        <span className="text-[10px] text-gray-500 mt-0.5 block">Katalogdagi narx</span>
                      </div>
                      <div>
                        <select
                          value={formData.subtitlePrice || (formData.subtitleStatus === 'Tayyor' ? 'Bepul' : 'Tez kunda')}
                          onChange={(e) => setFormData({ ...formData, subtitlePrice: e.target.value as 'Bepul' | 'Pullik' | 'Tez kunda' })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                        >
                          <option value="Tez kunda">Tez kunda</option>
                          <option value="Bepul">Bepul</option>
                          <option value="Pullik">Pullik</option>
                        </select>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">Subtitr litsenziya narxi</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Subtitr versiyasi va hajmi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="v1.0.0"
                        value={formData.subtitleVersion || ''}
                        onChange={(e) => setFormData({ ...formData, subtitleVersion: e.target.value })}
                        className="px-3 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs"
                      />
                      <input
                        type="text"
                        placeholder="1.9 MB"
                        value={formData.subtitleSize || ''}
                        onChange={(e) => setFormData({ ...formData, subtitleSize: e.target.value })}
                        className="px-3 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Asosiy .exe fayl nomi (Default Exe) *
                    </label>
                    <input
                      type="text"
                      placeholder="APlagueTaleRequiem_x64.exe"
                      value={formData.defaultExeName || ''}
                      onChange={(e) => setFormData({ ...formData, defaultExeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Launcher o‘yin papkasidan avtomatik qidiradigan .exe fayli
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Joylashtirish papkasi (Target Directory) *
                    </label>
                    <input
                      type="text"
                      placeholder="TRTEXT yoki otw2_ue/Content/Paks"
                      value={formData.targetRelativeDir || ''}
                      onChange={(e) => setFormData({ ...formData, targetRelativeDir: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      O‘yin ildiz papkasiga nisbatan subtitr joylashadigan papka
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Nishon fayl nomi (Target File Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="tt01.pc yoki fayl_P.pak"
                      value={formData.targetFileName || ''}
                      onChange={(e) => setFormData({ ...formData, targetFileName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Litsenziya Prefiksi (Key Prefix)
                    </label>
                    <input
                      type="text"
                      placeholder="SUB-REQU"
                      value={formData.keyPrefix || ''}
                      onChange={(e) => setFormData({ ...formData, keyPrefix: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono text-xs focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>

                  {/* Direct File Upload to Cloud Storage */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[#0B0D12] border border-[#2A3245] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#A3E635]" />
                        <span>Subtitr / Tarjima faylini yuklash (.pak, .pc, .enc, .zip)</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Firebase Cloud Storage</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <label className="relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E2533] hover:bg-[#2A3245] border border-[#2A3245] text-xs font-bold text-white transition-all cursor-pointer">
                        <UploadCloud className="w-4 h-4 text-[#A3E635]" />
                        <span>{uploadingFile ? 'Yuklanmoqda...' : 'Faylni tanlang (.pak, .pc)'}</span>
                        <input
                          type="file"
                          accept=".pak,.pc,.enc,.zip,.rar,.json,.txt"
                          onChange={handleSubtitleFileUpload}
                          disabled={uploadingFile}
                          className="sr-only"
                        />
                      </label>

                      <div className="flex-1 min-w-0">
                        {uploadingFile ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                              <span>Fayl yuklanmoqda...</span>
                              <span className="font-bold text-[#A3E635]">{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#141821] rounded-full overflow-hidden border border-[#2A3245]">
                              <div
                                className="h-full bg-[#A3E635] transition-all duration-300"
                                style={{ width: `${uploadProgress || 0}%` }}
                              />
                            </div>
                          </div>
                        ) : uploadedFileName ? (
                          <div className="flex items-center gap-2 text-xs text-[#A3E635] font-semibold">
                            <FileCheck className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Yuklandi: {uploadedFileName} ({formData.subtitleSize})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Faylni yuklasangiz, fayl nomi, hajmi va yuklab olish havolasi avtomatik to‘ldiriladi
                          </span>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <p className="text-xs text-red-400 font-medium">{uploadError}</p>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Yuklab olish to‘g‘ridan-to‘g‘ri havolasi (subtitleDownloadUrl)
                      </label>
                      <input
                        type="text"
                        placeholder="https://... (Fayl yuklanganda avtomatik kiritiladi yoki tashqi havola)"
                        value={formData.subtitleDownloadUrl || ''}
                        onChange={(e) => setFormData({ ...formData, subtitleDownloadUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#141821] border border-[#2A3245] text-xs text-white font-mono focus:outline-none focus:border-[#A3E635]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-5 border-t border-[#2A3245] flex items-center justify-end gap-3 sticky bottom-0 bg-[#141821] pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1A1F2A] hover:bg-[#232938] text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-xs hover:bg-[#84CC16] shadow-accent-glow transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saqlanmoqda...' : isEditing ? 'O‘zgarishlarni saqlash' : 'O‘yinni qo‘shish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
