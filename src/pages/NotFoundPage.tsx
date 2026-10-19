import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 bg-[#0B0D12] text-white">
      <div className="relative mb-6">
        <div className="text-8xl sm:text-9xl font-black font-mono text-[#1A1F2A] select-none tracking-widest">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#A3E635]/15 border border-[#A3E635]/40 text-[#A3E635] flex items-center justify-center shadow-accent-glow">
            <Gamepad2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Siz qidirgan manzil topilmadi
      </h1>
      <p className="text-sm text-gray-400 max-w-md mb-8">
        Adashib qoldingiz shekilli! Bu sahifa o‘chirilgan yoki manzili noto‘g‘ri kiritilgan bo‘lishi mumkin.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-sm hover:bg-[#84CC16] transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </Link>
        <Link
          to="/games"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#141821] text-gray-200 border border-[#2A3245] hover:border-gray-500 font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O‘yinlar katalogi</span>
        </Link>
      </div>
    </div>
  );
};
