import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught React render error:', error, errorInfo);

    // If this is a chunk load failure from a new deployment, auto-reload once
    const msg = error?.message || '';
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Loading chunk')
    ) {
      const key = 'subgame_chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(key) || '0', 10);
      const now = Date.now();
      if (now - lastReload > 8000) {
        sessionStorage.setItem(key, now.toString());
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-[#0B0D12] text-white">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
            Kutilmagan xatolik yuz berdi
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
            Sahifani yuklashda kichik uzilish yuz berdi. Sahifani qayta yangilash orqali muammoni darhol hal qilish mumkin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-xs sm:text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sahifani qayta yuklash</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141821] text-gray-200 border border-[#2A3245] hover:border-gray-400 font-semibold text-xs sm:text-sm hover:bg-[#1A202C] transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Bosh sahifaga</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
