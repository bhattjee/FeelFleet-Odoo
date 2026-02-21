import React from 'react';

interface WalletIconProps {
  size?: number;
  color?: string;
}

export const WalletIcon: React.FC<WalletIconProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <path d="M17 14h.01" />
  </svg>
);
