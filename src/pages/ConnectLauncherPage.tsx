import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ConnectLauncherPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get('code') || '';
  const [code, setCode] = useState(urlCode);
  const { user, signInWithGoogle, isAdmin, userProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode);
    }
  }, [urlCode]);

  const handleApprove = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        return;
      }
    }

    if (!code || code.trim().length !== 6) {
      setError('Iltimos, 6 xonali to‘g‘ri kodni kiriting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanCode = code.trim();
      const sessionRef = doc(db, 'device_sessions', cleanCode);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        setError('Ushbu ulanish kodi topilmadi yoki muddati tugagan. Launcherdan qayta urinib ko‘ring.');
        setLoading(false);
        return;
      }

      const sessionData = sessionSnap.data();
      if (sessionData.status !== 'pending') {
        setError('Ushbu kod allaqachon ishlatilgan.');
        setLoading(false);
        return;
      }

      // Approve session with user credentials
      const currentUser = user!;
      await updateDoc(sessionRef, {
        status: 'approved',
        userData: {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'SubGame Foydalanuvchisi',
          photoURL: currentUser.photoURL || '',
          role: userProfile?.role || (isAdmin ? 'admin' : 'user'),
          isAdmin: Boolean(isAdmin),
        },
      });

      setApproved(true);
    } catch (err: any) {
      console.error('Failed to approve device pairing:', err);
      setError(err.message || 'Launcherni ulashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center px-4 bg-[#0B0D12] text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-xl h-80 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#141821] border border-[#2A3245] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 flex items-center justify-center mx-auto shadow-inner">
          <Laptop className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">
            SubGame Launcherni Ulash
          </h1>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Kompyuteringizdagi Launcherni Google akkauntingizga bog‘lash uchun tasdiqlang.
          </p>
        </div>

        {approved ? (
          <div className="space-y-4 py-2 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Launcher muvaffaqiyatli ulandi!
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Kompyuteringizdagi <strong>SubGame Launcher</strong> avtomatik hisobingizga ulandi.
              Endi Launcherni ochib, o‘yinlaringizni to‘g‘ridan-to‘g‘ri o‘ynashingiz mumkin.
            </p>
            <div className="pt-2">
              <Link
                to="/games"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-xs hover:bg-[#84CC16] transition-all"
              >
                <span>Katalogga qaytish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Account Card */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-[#0B0D12] border border-[#2A3245] flex items-center gap-3 text-left">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-[#A3E635]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#A3E635] text-[#0B0D12] font-black text-sm flex items-center justify-center">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {user.displayName || 'Foydalanuvchi'}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  Faol
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0B0D12] border border-[#2A3245] text-xs text-gray-300 text-left space-y-2.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#A3E635]" />
                  Google hisobingiz bilan kiring
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Launcherni hisobingizga ulash uchun avval saytda Google orqali kiring.
                </p>
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 text-[#0B0D12] font-bold text-xs transition-all shadow-md cursor-pointer"
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
                  <span>Google bilan kirish</span>
                </button>
              </div>
            )}

            {/* Code Input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-300">
                Launcherdagi 6 xonali ulanish kodi:
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center font-mono text-2xl font-black tracking-widest px-4 py-3 bg-[#0B0D12] border border-[#2A3245] rounded-2xl text-[#A3E635] focus:outline-none focus:border-[#A3E635]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleApprove}
              disabled={loading || !code || code.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-[#A3E635] text-[#0B0D12] font-black text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ulanmoqda...</span>
                </>
              ) : (
                <>
                  <Laptop className="w-4 h-4" />
                  <span>Launcherni hisobga ulash</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
