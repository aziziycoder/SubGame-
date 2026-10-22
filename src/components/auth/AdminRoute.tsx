import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#141821] border border-[#2A3245] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2">Admin Panelga Kirish</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Admin panelidan foydalanish uchun ruxsat etilgan administrator Google hisobingiz orqali tizimga kiring.
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Google orqali kirish</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#141821] border border-red-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2">Ruxsat Cheklangan</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sizning hisobingiz (<span className="text-gray-200 font-mono">{user.email}</span>) administrator huquqiga ega emas.
            </p>
          </div>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#1A1F2A] hover:bg-[#232938] text-white font-bold text-sm border border-[#2A3245] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
