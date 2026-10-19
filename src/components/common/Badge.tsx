import React from 'react';
import type { SubtitleStatus } from '../../types/game';
import { CheckCircle2, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface SubtitleStatusBadgeProps {
  status: SubtitleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SubtitleStatusBadge: React.FC<SubtitleStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  switch (status) {
    case 'Tayyor':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/40 backdrop-blur-sm ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          <span>O‘zbekcha subtitr: Tayyor</span>
        </span>
      );
    case 'Tekshirilmoqda':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-sm ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse" />}
          <span>Tekshirilmoqda</span>
        </span>
      );
    case 'Ishlab chiqilmoqda':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 backdrop-blur-sm ${sizeClasses}`}
        >
          {showIcon && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
          <span>Ishlab chiqilmoqda</span>
        </span>
      );
    case 'Rejada':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 backdrop-blur-sm ${sizeClasses}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>Rejada</span>
        </span>
      );
    default:
      return null;
  }
};

export const GenreBadge: React.FC<{ genre: string }> = ({ genre }) => (
  <span className="text-xs px-2 py-0.5 rounded-md bg-[#141821] text-gray-300 border border-[#2A3245] hover:border-gray-500 transition-colors">
    {genre}
  </span>
);
