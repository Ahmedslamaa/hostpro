const PLATFORMS: Record<string, { bg: string; color: string; label: string }> = {
  airbnb:  { bg: 'rgba(255,90,95,0.12)',  color: '#FF5A5F', label: 'Airbnb'   },
  booking: { bg: 'rgba(0,53,128,0.1)',    color: '#003580', label: 'Booking'  },
  abritel: { bg: 'rgba(255,107,53,0.12)', color: '#FF6B35', label: 'Abritel'  },
  direct:  { bg: 'rgba(107,90,96,0.1)',   color: '#6B5A60', label: 'Direct'   },
};

interface PlatformBadgeProps {
  platform: string;
  size?: 'sm' | 'md';
}

export function PlatformBadge({ platform, size = 'sm' }: PlatformBadgeProps) {
  const cfg = PLATFORMS[platform] || PLATFORMS.direct;
  const fs  = size === 'sm' ? 9 : 11;
  const px  = size === 'sm' ? '6px 9px' : '6px 12px';

  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: fs,
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontWeight: 700,
      letterSpacing: '0.06em',
      padding: px,
      borderRadius: 20,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label.toUpperCase()}
    </span>
  );
}
