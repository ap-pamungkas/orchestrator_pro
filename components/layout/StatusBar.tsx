import React, { useState } from 'react';
import { ArchitectureState, AppMode } from '@/types';
import { GraduationCapIcon, TerminalIcon } from '../icons/Icons';

export interface StatusBarProps {
  architecture: ArchitectureState;
  statusMessage?: string;
  isError?: boolean;
  mode?: AppMode;
  onModeChange?: (mode: AppMode) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  architecture,
  statusMessage,
  isError = false,
  mode: controlledMode,
  onModeChange
}) => {
  const [internalMode, setInternalMode] = useState<AppMode>('educator');
  const activeMode = controlledMode !== undefined ? controlledMode : internalMode;

  const handleModeSelect = (newMode: AppMode) => {
    if (controlledMode === undefined) {
      setInternalMode(newMode);
    }
    onModeChange?.(newMode);
  };

  const inputsCount = architecture.inputs.filter(Boolean).length;
  const boardsCount = architecture.boards.filter(Boolean).length;
  const outputsCount = architecture.outputs.filter(Boolean).length;
  const isComplete = inputsCount > 0 && boardsCount > 0 && outputsCount > 0;

  return (
    <footer className="h-7 border-t border-zinc-200 bg-white px-4 flex items-center justify-between text-[11px] text-zinc-500 select-none z-20">
      {/* Left status badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${isError
              ? 'bg-red-500 ring-2 ring-red-200'
              : isComplete
                ? 'bg-emerald-500 ring-2 ring-emerald-200'
                : 'bg-emerald-500'
              }`}
          />
          <span className={`font-medium ${isError ? 'text-red-600 font-semibold' : 'text-zinc-700'}`}>
            {statusMessage || (isComplete ? 'Status: Architecture Pipeline Active' : 'Status: Ready')}
          </span>
        </div>

        {/* Slot Counters (IN, BOARD, OUT) - Hidden in Educator Mode */}
        {activeMode !== 'educator' && (
          <>
            <div className="h-3 w-[1px] bg-zinc-200" />

            <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
              <span>IN: <strong className="text-zinc-700">{inputsCount}/3</strong></span>
              <span>•</span>
              <span>BOARD: <strong className="text-zinc-700">{boardsCount}/3</strong></span>
              <span>•</span>
              <span>OUT: <strong className="text-zinc-700">{outputsCount}/3</strong></span>
            </div>
          </>
        )}
      </div>

      {/* Middle: Mode Select Buttons (Educator Mode & Developer Mode) */}
      <div className="flex items-center gap-2" role="group" aria-label="Mode Selection">
        <div className="flex items-center bg-zinc-100 p-0.5 rounded border border-zinc-200 text-[10.5px]">
          <button
            type="button"
            onClick={() => handleModeSelect('educator')}
            className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer flex items-center gap-1.5 ${activeMode === 'educator'
              ? 'bg-white text-blue-600 shadow-2xs font-semibold border border-zinc-200/80'
              : 'text-zinc-600 hover:text-zinc-900 border border-transparent'
              }`}
            aria-pressed={activeMode === 'educator'}
            title="Educator Mode (Guided learning & visual explanations)"
          >
            <GraduationCapIcon className="w-3 h-3 text-blue-500" />
            <span>Educator Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect('developer')}
            className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer flex items-center gap-1.5 ${activeMode === 'developer'
              ? 'bg-white text-blue-600 shadow-2xs font-semibold border border-zinc-200/80'
              : 'text-zinc-600 hover:text-zinc-900 border border-transparent'
              }`}
            aria-pressed={activeMode === 'developer'}
            title="Developer Mode (Advanced code editor & technical tooling)"
          >
            <TerminalIcon className="w-3 h-3 text-blue-500" />
            <span>Developer Mode</span>
          </button>
        </div>
      </div>

      {/* Right Quick Links (Hidden in Educator Mode, shown in Developer Mode) */}
      {activeMode !== 'educator' && (
        <div className="flex items-center gap-4 text-zinc-500">
          <a href="#docs" onClick={(e) => e.preventDefault()} className="hover:text-zinc-800 transition-colors">
            Documentation
          </a>
          <span className="text-zinc-300">|</span>
          <a href="#shortcuts" onClick={(e) => e.preventDefault()} className="hover:text-zinc-800 transition-colors">
            Shortcuts
          </a>
          <span className="text-zinc-300">|</span>
          <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-zinc-800 transition-colors">
            Support
          </a>
        </div>
      )}
    </footer>
  );
};
