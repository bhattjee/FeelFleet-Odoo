import React from 'react';

interface ChevronIconProps {
  size?: number;
  color?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const rotations: Record<string, number> = {
  up: 180,
  down: 0,
  left: 90,
  right: -90,
};

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  size = 16,
  color = 'currentColor',
  direction = 'down',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: `rotate(${rotations[direction]}deg)` }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
