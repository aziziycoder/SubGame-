import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
  title?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onSelectIndex,
  title,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [isOpen, onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full max-w-6xl flex items-center justify-between text-white py-2 z-10">
        <div>
          {title && <h4 className="text-base font-semibold text-gray-200">{title}</h4>}
          <p className="text-xs text-gray-400">
            Skrinshot {currentIndex + 1} / {images.length}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Yopish"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image View */}
      <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto min-h-0">
        <button
          onClick={onPrev}
          aria-label="Oldingi rasm"
          className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-full h-full flex items-center justify-center p-2">
          <img
            src={images[currentIndex]}
            alt={`Skrinshot ${currentIndex + 1}`}
            className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10 transition-all duration-300"
          />
        </div>

        <button
          onClick={onNext}
          aria-label="Keyingi rasm"
          className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="w-full max-w-2xl flex items-center justify-center gap-2 sm:gap-3 py-3 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onSelectIndex(idx)}
            className={`relative rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
              idx === currentIndex
                ? 'border-[#A3E635] scale-105 shadow-accent-glow'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={img}
              alt={`Miniatura ${idx + 1}`}
              className="w-16 h-10 sm:w-20 sm:h-12 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
