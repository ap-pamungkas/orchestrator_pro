import React from 'react';
import { AppLogoIcon, RefreshCwIcon } from '../icons/Icons';

interface HeaderProps {
  onReset: () => void;
  onLoadDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onLoadDemo }) => {
  return (
    <header className="h-12 border-b border-zinc-200 bg-white px-4 flex items-center justify-between select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-20">
      {/* Brand & Workspace Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <AppLogoIcon className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            Orchestrator <span className="text-blue-600 font-bold">Pro</span>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-zinc-200" />

        {/* <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/80 flex items-center gap-1.5">
            <CpuIcon className="w-3 h-3 text-blue-600" />
            ESP32 NodeMCU Kit
          </span>
          <span className="text-xs text-zinc-400 font-mono">v1.0 (Phase 1)</span>
        </div> */}
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onLoadDemo}
          title="Load Button ➔ ESP32 ➔ LED System"
          className="text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors px-2.5 py-1 rounded border border-zinc-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Load Demo Preset
        </button>

        <button
          onClick={onReset}
          title="Reset Architecture Slots"
          className="text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors px-2.5 py-1 rounded border border-zinc-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <RefreshCwIcon className="w-3 h-3" />
          Clear System
        </button>
      </div>
    </header>
  );
};
