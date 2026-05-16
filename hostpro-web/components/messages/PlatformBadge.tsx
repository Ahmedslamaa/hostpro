import React from 'react';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  airbnb: { bg: 'bg-red-100', text: 'text-red-700', icon: '??' },
  booking: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '??' },
  abritel: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '??' },
  direct: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '??' }
};

interface PlatformBadgeProps {
  platform: string;
  size?: 'sm' | 'md';
}

export function PlatformBadge({ platform, size = 'sm' }: PlatformBadgeProps) {
  const config = PLATFORM_COLORS[platform] || PLATFORM_COLORS.direct;
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`${config.bg} ${config.text} ${sizeClass} rounded-full font-medium inline-flex items-center gap-1`}>
      <span>{config.icon}</span>
      <span className="capitalize">{platform}</span>
    </span>
  );
}
