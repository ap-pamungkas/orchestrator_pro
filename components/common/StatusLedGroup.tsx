import React, { useState } from 'react';

interface StatusLedGroupProps {
  className?: string;
  defaultIndex?: number | null;
}

interface LedColorConfig {
  id: string;
  label: string;
  dimClass: string;
  activeClass: string;
}

const LED_CONFIGS: LedColorConfig[] = [
  // 1. Biru Terang (Bright Blue - Solid Glow, No Pulse)
  {
    id: 'blue',
    label: 'Blue LED',
    dimClass: 'bg-blue-950/60 border border-blue-900/50',
    activeClass: 'bg-blue-400 border-blue-300 shadow-[0_0_12px_#38bdf8,0_0_22px_rgba(56,189,248,0.95)]',
  },
  // 2. Putih (White)
  {
    id: 'white',
    label: 'White LED',
    dimClass: 'bg-zinc-600/40 border border-zinc-700/60',
    activeClass: 'bg-white border-white shadow-[0_0_10px_#ffffff,0_0_18px_rgba(255,255,255,0.9)] animate-led-pulse',
  },
  // 3. Merah (Red)
  {
    id: 'red',
    label: 'Red LED',
    dimClass: 'bg-red-950/60 border border-red-900/50',
    activeClass: 'bg-red-500 border-red-400 shadow-[0_0_12px_#ef4444,0_0_22px_rgba(239,68,68,0.95)] animate-led-pulse',
  },
  // 4. Kuning (Yellow)
  {
    id: 'yellow',
    label: 'Yellow LED',
    dimClass: 'bg-amber-950/60 border border-amber-900/50',
    activeClass: 'bg-amber-400 border-amber-300 shadow-[0_0_12px_#f59e0b,0_0_22px_rgba(245,158,11,0.95)] animate-led-pulse',
  },
  // 5. Hijau (Green)
  {
    id: 'green',
    label: 'Green LED',
    dimClass: 'bg-emerald-950/60 border border-emerald-900/50',
    activeClass: 'bg-emerald-400 border-emerald-300 shadow-[0_0_12px_#10b981,0_0_22px_rgba(16,185,129,0.95)] animate-led-pulse',
  },
];

export const StatusLedGroup: React.FC<StatusLedGroupProps> = ({
  className = '',
  defaultIndex = null,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(defaultIndex);

  const handleClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle selection or change selected LED
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 shadow-inner ring-1 ring-zinc-900/60 backdrop-blur-xs ${className}`}
      title="Hardware Status LEDs (Click to activate)"
    >
      {LED_CONFIGS.map((led, idx) => {
        const isSelected = selectedIndex === idx;

        return (
          <button
            key={led.id}
            type="button"
            onClick={(e) => handleClick(idx, e)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full cursor-pointer transition-all duration-300 focus:outline-none ${
              isSelected ? led.activeClass : `${led.dimClass} hover:opacity-75 hover:scale-110`
            }`}
            title={`${led.label} ${isSelected ? (led.id === 'blue' ? '(Active Solid Glow)' : '(Active 500ms Pulse)') : '(Click to activate)'}`}
          />
        );
      })}
    </div>
  );
};
