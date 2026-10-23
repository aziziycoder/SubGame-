import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle2,
  X,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ImageIcon
} from 'lucide-react';
import type { HeroSlide } from '../../types/slider';
import type { Game } from '../../types/game';
import {
  getSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  syncInitialSliders
} from '../../services/slidersService';
import { INITIAL_SLIDES } from '../../data/sliders';

interface SliderManagerProps {
  games: Game[];
}

export const SliderManager: React.FC<SliderManagerProps> = ({ games }) => {
  const [sliders, setSliders] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialFormState: Partial<HeroSlide> = {
    title: '',
    slug: '',
    badge: 'Yangi Premyera • v1.0.0',
    headlinePrefix: 'Har bir hikoyani ',
    headlineHighlight: 'o‘z tilingda',
    headlineSuffix: ' his qil.',
    description: '',
    bgImage: '',
    cardImage: '',
    cardTag: 'O‘ZBEKCHA SUBTITR TAYYOR',
    highlightTag: 'Premyera',
    version: 'v1.0.0 • PC',
    cardDescription: '',
    order: 1,
    isActive: true
  };

  const [formData, setFormData] = useState<Partial<HeroSlide>>(initialFormState);

  const loadSliders = async () => {
    setLoading(true);
    try {
      const data = await getSliders();
      // sort by order ascending
      const sorted = [...data].sort((a, b) => (a.order || 99) - (b.order || 99));
      setSliders(sorted);
    } catch (err) {
      console.error('Failed to load sliders:', err);
      setSliders(INITIAL_SLIDES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...initialFormState,
      order: sliders.length + 1
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setIsEditing(true);
    setEditingId(slide.id);
    setFormData({ ...slide });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Quick fill from selected game
  const handleSelectGame = (slug: string) => {
    const selected = games.find((g) => g.slug === slug || g.id === slug);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      slug: selected.slug,
      title: selected.title,
      badge: selected.subtitleStatus === 'Tayyor' ? 'Yangi Premyera • ' + selected.subtitleVersion : 'Tez kunda • Kutilmoqda',
      cardTag: selected.subtitleStatus === 'Tayyor' ? 'O‘ZBEKCHA SUBTITR TAYYOR' : 'TEZ KUNDA • O‘ZBEKCHA',
      highlightTag: selected.subtitleStatus === 'Tayyor' ? 'Tayyor o‘yin' : 'Kutilayotgan premyera',
      version: `${selected.subtitleVersion || 'v1.0.0'} • PC`,
      cardDescription: selected.shortDescription || '',
      description: selected.shortDescription || '',
      bgImage: selected.heroImage || selected.screenshots?.[0] || selected.cardImage || '',
      cardImage: selected.cardImage || selected.cover || '',
    }));
  };

  const handleSync = async () => {
    if (!window.confirm('Boshlang‘ich slayderlar (Level Devil, Requiem, Innocence) bazaga sinxronlansinmi?')) {
      return;
    }
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncInitialSliders();
      if (res.success) {
        setSyncMessage(`Muvaffaqiyatli! ${res.count} ta slayder bazaga yuklandi.`);
        await loadSliders();
      } else {
        setSyncMessage(`Xatolik: ${res.error}`);
      }
    } catch (err: any) {
      setSyncMessage(`Xatolik yuz berdi: ${err?.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Haqiqatan ham "${title}" slayderini o‘chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await deleteSlider(id);
      if (res.success) {
        await loadSliders();
      } else {
        alert(`O‘chirishda xatolik: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Xatolik: ${err?.message}`);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    const newActive = slide.isActive === false ? true : false;
    try {
      await updateSlider(slide.id, { isActive: newActive });
      setSliders((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, isActive: newActive } : s))
      );
    } catch (err: any) {
      alert(`Holatni o‘zgartirishda xatolik: ${err?.message}`);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    const currentSlide = sliders[index];
    const targetSlide = sliders[targetIndex];

    const currentOrder = targetIndex + 1;
    const targetOrder = index + 1;

    try {
      await Promise.all([
        updateSlider(currentSlide.id, { order: currentOrder }),
        updateSlider(targetSlide.id, { order: targetOrder })
      ]);
      await loadSliders();
    } catch (err: any) {
      alert(`Tartibni o‘zgartirishda xatolik: ${err?.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title || !formData.slug) {
      setFormError('Slayder nomi va bog‘langan o‘yin slug manzili kiritilishi shart!');
      return;
    }

    if (!formData.bgImage || !formData.cardImage) {
      setFormError('Orqa fon rasmi (bgImage) va karta rasmi (cardImage) URL manzillari shart!');
      return;
    }

    setSubmitting(true);

    const docId = editingId || formData.id || formData.slug!.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-');

    const payload: HeroSlide = {
      ...initialFormState,
      ...formData,
      id: docId,
      slug: formData.slug!.toLowerCase().trim(),
      order: Number(formData.order) || 1,
      isActive: formData.isActive !== false
    } as HeroSlide;

    try {
      if (isEditing && editingId) {
        const res = await updateSlider(editingId, payload);
        if (res.success) {
          setIsModalOpen(false);
          await loadSliders();
        } else {
          setFormError(res.error || 'Yangilashda xatolik yuz berdi');
        }
      } else {
        const res = await createSlider(payload);
        if (res.success) {
          setIsModalOpen(false);
          await loadSliders();
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141821] p-5 rounded-2xl border border-[#2A3245]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#A3E635]" />
            <h2 className="text-base sm:text-lg font-black text-white">
              Bosh Sahifa Slayderlari (Hero Carousel)
            </h2>
          </div>
          <p className="text-xs text-gray-400 max-w-xl">
            Bosh sahifaning eng yuqori qismida aylanuvchi o‘yinlar taqdimotini boshqaring. Tartibini o‘zgartirishingiz, yangi o‘yinlarni bannerga chiqarishingiz yoki yashirishingiz mumkin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B0D12] hover:bg-[#1A202C] text-gray-300 hover:text-white border border-[#2A3245] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Boshlang‘ich slayderlarni Firestore bazasiga ko‘chirish"
          >
            <RefreshCw className={`w-4 h-4 text-[#A3E635] ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Yuklanmoqda...' : 'Standart Slayderlarni Tiklash'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-xs sm:text-sm hover:bg-[#84CC16] shadow-accent-glow transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yangi Slayder Qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Sync alert */}
      {syncMessage && (
        <div className="p-4 rounded-xl bg-[#1A1F2A] border border-[#A3E635]/40 text-sm flex items-center justify-between text-gray-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#A3E635] shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sliders Grid / List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#141821] rounded-2xl border border-[#2A3245]">
          <div className="w-8 h-8 border-3 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Slayderlar yuklanmoqda...</span>
        </div>
      ) : sliders.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-[#141821] rounded-2xl border border-[#2A3245]">
          <Layers className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Slayderlar topilmadi</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Hozircha hech qanday slayder mavjud emas. Yuqoridagi "Standart Slayderlarni Tiklash" yoki "Yangi Slayder Qo‘shish" tugmasini bosing.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sliders.map((slide, index) => {
            const isActive = slide.isActive !== false;
            return (
              <div
                key={slide.id}
                className={`relative flex flex-col rounded-2xl bg-[#141821] border transition-all overflow-hidden ${
                  isActive ? 'border-[#2A3245] hover:border-[#A3E635]/50' : 'border-red-500/30 opacity-75'
                }`}
              >
                {/* Visual Banner Preview */}
                <div className="relative h-44 w-full overflow-hidden bg-[#0B0D12]">
                  <img
                    src={slide.bgImage || slide.cardImage}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141821] via-[#141821]/40 to-transparent" />

                  {/* Order & Status Pills */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] font-bold">
                      #{slide.order || index + 1}
                    </span>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                      }`}
                      title={isActive ? "Slayderni o‘chirish (yashirish)" : "Slayderni faollashtirish"}
                    >
                      {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isActive ? 'Faol' : 'Yashirilgan'}</span>
                    </button>
                  </div>

                  {/* Card Thumbnail Overlaid */}
                  <div className="absolute bottom-3 right-3 w-20 h-11 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                    <img
                      src={slide.cardImage}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badge */}
                  <div className="absolute bottom-3 left-3 max-w-[65%]">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A3E635] text-[#0B0D12] truncate block">
                      {slide.badge || 'Tavsiya'}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-black text-white truncate" title={slide.title}>
                        {slide.title}
                      </h3>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                        /{slide.slug}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mt-1 line-clamp-1 font-semibold">
                      {slide.headlinePrefix}
                      <span className="text-[#A3E635]">{slide.headlineHighlight}</span>
                      {slide.headlineSuffix}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>

                  {/* Reorder and Action Buttons */}
                  <div className="pt-3 border-t border-[#2A3245] flex items-center justify-between gap-2">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-[#0B0D12] text-gray-400 hover:text-white border border-[#2A3245] hover:border-[#A3E635]/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Oldinga / Yuqoriga surish"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === sliders.length - 1}
                        className="p-1.5 rounded-lg bg-[#0B0D12] text-gray-400 hover:text-white border border-[#2A3245] hover:border-[#A3E635]/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Orqaga / Pastga surish"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/games/${slide.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#0B0D12] text-gray-400 hover:text-[#A3E635] border border-[#2A3245] hover:border-[#A3E635]/40 transition-colors"
                        title="O‘yin sahifasini ochish"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(slide)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A3E635]/15 text-[#A3E635] hover:bg-[#A3E635]/25 border border-[#A3E635]/30 text-xs font-bold transition-all cursor-pointer"
                        title="Slayderni tahrirlash"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Tahrirlash</span>
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id, slide.title)}
                        className="p-1.5 rounded-lg bg-[#0B0D12] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-[#2A3245] hover:border-rose-500/40 transition-colors cursor-pointer"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Slider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-[#141821] border border-[#2A3245] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#2A3245] flex items-center justify-between bg-[#0B0D12]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isEditing ? `"${formData.title}" slayderini tahrirlash` : 'Yangi Slayder Qo‘shish'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Bosh sahifaning yuqori banneri uchun sozlamalar
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
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Fill From Game */}
              <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#A3E635]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A3E635] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mavjud o‘yindan avtomatik to‘ldirish (Tavsiya etiladi)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Bir bosishda to‘ldiradi</span>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => handleSelectGame(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141821] border border-[#2A3245] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                >
                  <option value="" disabled>
                    O‘yinni tanlang (masalan: Level Devil, Requiem, Innocence...)...
                  </option>
                  {games.map((g) => (
                    <option key={g.id} value={g.slug}>
                      {g.title} ({g.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    O‘yin nomi (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Level Devil"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Slug manzili (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="level-devil"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white font-mono focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Kichik belgi (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Yangi Premyera • v1.0.0"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tartib raqami (Order)
                  </label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-xs text-white font-mono focus:outline-none focus:border-[#A3E635]"
                  />
                </div>
              </div>

              {/* Headline (3 Parts for Gradient Highlighting) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                <label className="block text-xs font-bold text-gray-200">
                  Katta Sarlavha (3 qismdan iborat chiroyli matn):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">1. Boshlanishi</span>
                    <input
                      type="text"
                      placeholder="Har bir hikoyani "
                      value={formData.headlinePrefix || ''}
                      onChange={(e) => setFormData({ ...formData, headlinePrefix: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141821] border border-[#2A3245] text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A3E635] font-bold block mb-1">2. Yashil urg‘u</span>
                    <input
                      type="text"
                      placeholder="o‘z tilingda"
                      value={formData.headlineHighlight || ''}
                      onChange={(e) => setFormData({ ...formData, headlineHighlight: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141821] border border-[#A3E635]/50 text-xs text-[#A3E635] font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">3. Yakuni</span>
                    <input
                      type="text"
                      placeholder=" his qil."
                      value={formData.headlineSuffix || ''}
                      onChange={(e) => setFormData({ ...formData, headlineSuffix: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141821] border border-[#2A3245] text-xs text-white"
                    />
                  </div>
                </div>
                <div className="pt-1 text-[11px] text-gray-400 italic">
                  Ko‘rinishi: {formData.headlinePrefix}
                  <span className="text-[#A3E635] font-bold">{formData.headlineHighlight}</span>
                  {formData.headlineSuffix}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Bosh sahifa tavsifi
                </label>
                <textarea
                  rows={2}
                  placeholder="Slayder ostida chiqadigan 1-2 jumlali qisqa matn..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                />
              </div>

              {/* Images URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Orqa fon rasmi (bgImage - 1920x1080) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://...ss_...1920x1080.jpg"
                    value={formData.bgImage || ''}
                    onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-xs text-white font-mono focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>O‘ng tarafdagi karta rasmi (cardImage - 460x215) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://...header.jpg"
                    value={formData.cardImage || ''}
                    onChange={(e) => setFormData({ ...formData, cardImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-xs text-white font-mono focus:outline-none focus:border-[#A3E635]"
                  />
                </div>
              </div>

              {/* Card Meta Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Karta tegi (cardTag)
                  </label>
                  <input
                    type="text"
                    placeholder="O‘ZBEKCHA SUBTITR TAYYOR"
                    value={formData.cardTag || ''}
                    onChange={(e) => setFormData({ ...formData, cardTag: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Ajratilgan teg (highlightTag)
                  </label>
                  <input
                    type="text"
                    placeholder="Yangi premyera"
                    value={formData.highlightTag || ''}
                    onChange={(e) => setFormData({ ...formData, highlightTag: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Versiya va Platforma
                  </label>
                  <input
                    type="text"
                    placeholder="v1.0.0 • PC"
                    value={formData.version || ''}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs text-white"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                <input
                  type="checkbox"
                  id="isActiveSlider"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#A3E635] accent-[#A3E635] cursor-pointer"
                />
                <label htmlFor="isActiveSlider" className="text-xs text-gray-200 cursor-pointer font-medium">
                  Slayder faol bo‘lsin va bosh sahifada ko‘rsatilsin
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#2A3245] flex items-center justify-end gap-3 sticky bottom-0 bg-[#141821] pb-2">
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
                  <span>{submitting ? 'Saqlanmoqda...' : isEditing ? 'O‘zgarishlarni saqlash' : 'Slayderni qo‘shish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
