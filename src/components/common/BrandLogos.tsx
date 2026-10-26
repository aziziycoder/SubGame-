import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Official Telegram brand logo (Vector SVG)
 */
export const TelegramLogo: React.FC<LogoProps & { variant?: 'circle' | 'plane' }> = ({
  className = 'w-5 h-5',
  variant = 'circle',
  style,
  ...props
}) => {
  if (variant === 'plane') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, display: 'inline-block', ...style }}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.41 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.15-.03-.21-.02-.1.02-1.63 1.03-4.6 3.04-.44.3-.83.45-1.18.44-.39-.01-1.13-.22-1.69-.4-.68-.23-1.22-.35-1.17-.74.02-.2.3-.41.8-.62 3.14-1.37 5.24-2.28 6.28-2.72 2.99-1.25 3.61-1.46 4.02-1.47.09 0 .29.02.42.13.11.09.14.21.15.3.01.07.03.26.01.4z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, display: 'inline-block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="tg-gradient" x1="120" y1="240" x2="120" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1D93D2" />
          <stop offset="1" stopColor="#38B0E3" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tg-gradient)" />
      <path
        d="M54.3 118.8c35-15.2 58.3-25.3 70-30.2 33.3-13.9 40.3-16.3 44.8-16.4 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3s.4 3.1.2 4.7c-1.8 19-9.6 65.1-13.6 86.3-1.7 9-5 12-8.2 12.3-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-18-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.5-29.8 33.1-32.3.1-.3.1-1.5-.6-2.1-.7-.6-1.7-.4-2.5-.2-1.1.2-17.9 11.4-50.6 33.5-4.8 3.3-9.1 4.9-13 4.8-4.3-.1-12.5-2.4-18.7-4.4-7.5-2.4-13.5-3.7-13-7.9.5-4.2 3.5-6.4 9.1-8.7z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

/**
 * Official Click.uz brand logo (Vector SVG)
 */
export const ClickLogo: React.FC<LogoProps & { variant?: 'full' | 'icon' | 'badge' }> = ({
  className = 'w-5 h-5',
  variant = 'icon',
  style,
  ...props
}) => {
  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 157 40"
        fill="none"
        className={className}
        style={{ maxWidth: '100%', height: 'auto', ...style }}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M39.3739 20.1572C39.3739 27.7941 27.2594 40.0006 19.6797 40.0006C12.1 40.0006 -0.0146637 27.7941 -0.0146637 20.1572C-0.0146637 12.5203 12.1 0.313477 19.6797 0.313477C27.2594 0.313477 39.3739 12.5203 39.3739 20.1572ZM27.5573 20.1572C27.5573 23.212 22.7113 28.0945 19.6797 28.0945C16.6477 28.0945 11.8019 23.212 11.8019 20.1572C11.8019 17.1025 16.6479 12.2197 19.6797 12.2197C22.7113 12.2197 27.5573 17.1025 27.5573 20.1572Z"
          fill="#0065FF"
        />
        <path
          d="M60.8212 39.9981C68.1709 39.9981 72.7769 35.3571 74.1744 29.2556H66.1004C65.1172 31.3415 63.5644 32.906 60.8212 32.906C57.5088 32.906 55.0764 30.5073 55.0764 26.3874C55.0764 22.2678 57.5088 19.8687 60.8212 19.8687C63.5644 19.8687 65.1172 21.4332 66.1004 23.5194H74.1744C72.7769 17.4179 68.1709 12.7766 60.8212 12.7766C52.9541 12.7766 47.2093 18.826 47.2093 26.3874C47.2093 33.9491 52.9541 39.9981 60.8212 39.9981ZM76.9305 39.4246H84.7459V0.313209H76.9305V39.4246ZM93.2986 9.80409C96.0417 9.80409 98.2155 7.61389 98.2155 4.90212C98.2155 2.19056 96.0417 0.000366211 93.2986 0.000366211C90.6592 0.000366211 88.4334 2.19056 88.4334 4.90212C88.4334 7.61389 90.6592 9.80409 93.2986 9.80409ZM89.4169 39.4246H97.2323V13.3504H89.4169V39.4246ZM113.963 39.9981C121.312 39.9981 125.918 35.3571 127.316 29.2556H119.242C118.258 31.3415 116.706 32.906 113.963 32.906C110.65 32.906 108.218 30.5073 108.218 26.3874C108.218 22.2678 110.65 19.8687 113.963 19.8687C116.706 19.8687 118.258 21.4332 119.242 23.5194H127.316C125.918 17.4179 121.312 12.7766 113.963 12.7766C106.096 12.7766 100.351 18.826 100.351 26.3874C100.351 33.9491 106.096 39.9981 113.963 39.9981ZM147.514 39.4246H156.985L145.185 25.136L154.708 13.3504H145.443L137.887 22.6849V0.313209H130.072V39.4246H137.887V27.7954L147.514 39.4246Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // Official Click squircle emblem
  return (
    <svg
      viewBox="0 0 40 40"
      fill="currentColor"
      className={className}
      style={{
        width: '1.25rem',
        height: '1.25rem',
        maxWidth: '100%',
        maxHeight: '100%',
        flexShrink: 0,
        display: 'inline-block',
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M39.3739 20.1572C39.3739 27.7941 27.2594 40.0006 19.6797 40.0006C12.1 40.0006 -0.0146637 27.7941 -0.0146637 20.1572C-0.0146637 12.5203 12.1 0.313477 19.6797 0.313477C27.2594 0.313477 39.3739 12.5203 39.3739 20.1572ZM27.5573 20.1572C27.5573 23.212 22.7113 28.0945 19.6797 28.0945C16.6477 28.0945 11.8019 23.212 11.8019 20.1572C11.8019 17.1025 16.6479 12.2197 19.6797 12.2197C22.7113 12.2197 27.5573 17.1025 27.5573 20.1572Z"
      />
    </svg>
  );
};

/**
 * Click App icon badge (Squircle with official emblem)
 */
export const ClickBadge: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div
      className={`bg-[#0065FF] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 ${sizeClasses} ${className}`}
    >
      <ClickLogo
        variant="icon"
        className={`${iconSizes} text-white`}
        style={{ width: undefined, height: undefined }}
      />
    </div>
  );
};

/**
 * Official Steam brand logo (Vector SVG)
 */
export const SteamLogo: React.FC<LogoProps & { variant?: 'official' | 'monochrome' }> = ({
  className = 'w-5 h-5',
  variant = 'official',
  style,
  ...props
}) => {
  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 65 65"
        fill="currentColor"
        className={className}
        style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, display: 'inline-block', ...style }}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d="M1.305 41.202C5.259 54.386 17.488 64 31.959 64c17.673 0 32-14.327 32-32s-14.327-32-32-32C15.001 0 1.124 13.193.028 29.874c2.074 3.477 2.879 5.628 1.275 11.328z" />
        <path d="M30.31 23.985l.003.158-7.83 11.375c-1.268-.058-2.54.165-3.748.662a8.14 8.14 0 0 0-1.498.8L.042 29.893s-.398 6.546 1.26 11.424l12.156 5.016c.6 2.728 2.48 5.12 5.242 6.27a8.88 8.88 0 0 0 11.603-4.782 8.89 8.89 0 0 0 .684-3.656L42.18 36.16l.275.005c6.705 0 12.155-5.466 12.155-12.18s-5.44-12.16-12.155-12.174c-6.702 0-12.155 5.46-12.155 12.174zm-1.88 23.05c-1.454 3.5-5.466 5.147-8.953 3.694a6.84 6.84 0 0 1-3.524-3.362l3.957 1.64a5.04 5.04 0 0 0 6.591-2.719 5.05 5.05 0 0 0-2.715-6.601l-4.1-1.695c1.578-.6 3.372-.62 5.05.077 1.7.703 3 2.027 3.696 3.72s.692 3.56-.01 5.246M42.466 32.1a8.12 8.12 0 0 1-8.098-8.113 8.12 8.12 0 0 1 8.098-8.111 8.12 8.12 0 0 1 8.1 8.111 8.12 8.12 0 0 1-8.1 8.113m-6.068-8.126a6.09 6.09 0 0 1 6.08-6.095c3.355 0 6.084 2.73 6.084 6.095a6.09 6.09 0 0 1-6.084 6.093 6.09 6.09 0 0 1-6.081-6.093z" fill="#0B0D12" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 65 65"
      className={className}
      style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, display: 'inline-block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="steam-official-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop stopColor="#111d2e" offset="0%" />
          <stop stopColor="#051839" offset="21.2%" />
          <stop stopColor="#0a1b48" offset="40.7%" />
          <stop stopColor="#132e62" offset="58.1%" />
          <stop stopColor="#144b7e" offset="73.8%" />
          <stop stopColor="#136497" offset="87.3%" />
          <stop stopColor="#1387b8" offset="100%" />
        </linearGradient>
      </defs>
      <g>
        <path
          d="M1.305 41.202C5.259 54.386 17.488 64 31.959 64c17.673 0 32-14.327 32-32s-14.327-32-32-32C15.001 0 1.124 13.193.028 29.874c2.074 3.477 2.879 5.628 1.275 11.328z"
          fill="url(#steam-official-gradient)"
        />
        <path
          d="M30.31 23.985l.003.158-7.83 11.375c-1.268-.058-2.54.165-3.748.662a8.14 8.14 0 0 0-1.498.8L.042 29.893s-.398 6.546 1.26 11.424l12.156 5.016c.6 2.728 2.48 5.12 5.242 6.27a8.88 8.88 0 0 0 11.603-4.782 8.89 8.89 0 0 0 .684-3.656L42.18 36.16l.275.005c6.705 0 12.155-5.466 12.155-12.18s-5.44-12.16-12.155-12.174c-6.702 0-12.155 5.46-12.155 12.174zm-1.88 23.05c-1.454 3.5-5.466 5.147-8.953 3.694a6.84 6.84 0 0 1-3.524-3.362l3.957 1.64a5.04 5.04 0 0 0 6.591-2.719 5.05 5.05 0 0 0-2.715-6.601l-4.1-1.695c1.578-.6 3.372-.62 5.05.077 1.7.703 3 2.027 3.696 3.72s.692 3.56-.01 5.246M42.466 32.1a8.12 8.12 0 0 1-8.098-8.113 8.12 8.12 0 0 1 8.098-8.111 8.12 8.12 0 0 1 8.1 8.111 8.12 8.12 0 0 1-8.1 8.113m-6.068-8.126a6.09 6.09 0 0 1 6.08-6.095c3.355 0 6.084 2.73 6.084 6.095a6.09 6.09 0 0 1-6.084 6.093 6.09 6.09 0 0 1-6.081-6.093z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
};

/**
 * Official Epic Games brand logo (Vector SVG)
 */
export const EpicGamesLogo: React.FC<LogoProps & { variant?: 'official' | 'monochrome' }> = ({
  className = 'w-5 h-5',
  variant = 'official',
  style,
  ...props
}) => {
  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, display: 'inline-block', ...style }}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44a4.262 4.262 0 00.02.433c.031.3.037.59.316.92.027.033.311.245.311.245.153.075.258.13.43.2l8.335 3.491c.433.199.614.276.928.27h.002c.314.006.495-.071.928-.27l8.335-3.492c.172-.07.277-.124.43-.2 0 0 .284-.211.311-.243.28-.33.285-.621.316-.92a4.262 4.262 0 00.02-.433V1.879C22.34.506 21.835 0 20.463 0H3.537zm4.07 5.76h2.247v8.948H7.607V5.76zm4.35 0h8.436v2.16h-6.19v2.09h5.602v2.16h-5.602v2.447h6.19v2.16h-8.436V5.76z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, display: 'inline-block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44a4.262 4.262 0 00.02.433c.031.3.037.59.316.92.027.033.311.245.311.245.153.075.258.13.43.2l8.335 3.491c.433.199.614.276.928.27h.002c.314.006.495-.071.928-.27l8.335-3.492c.172-.07.277-.124.43-.2 0 0 .284-.211.311-.243.28-.33.285-.621.316-.92a4.262 4.262 0 00.02-.433V1.879C22.34.506 21.835 0 20.463 0H3.537z"
        fill="#141414"
        stroke="#3F3F46"
        strokeWidth="0.8"
      />
      <path
        d="M7.607 5.76h2.247v8.948H7.607V5.76zm4.35 0h8.436v2.16h-6.19v2.09h5.602v2.16h-5.602v2.447h6.19v2.16h-8.436V5.76z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

