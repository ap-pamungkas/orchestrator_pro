import React from 'react';
import { ArchitectureState } from '@/types';

interface StatusBarProps {
  architecture: ArchitectureState;
  statusMessage?: string;
  isError?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  architecture, 
  statusMessage, 
  isError = false 
}) => {
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
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isError 
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

        <div className="h-3 w-[1px] bg-zinc-200" />

        {/* Slot Counters */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
          <span>IN: <strong className="text-zinc-700">{inputsCount}/3</strong></span>
          <span>•</span>
          <span>BOARD: <strong className="text-zinc-700">{boardsCount}/3</strong></span>
          <span>•</span>
          <span>OUT: <strong className="text-zinc-700">{outputsCount}/3</strong></span>
        </div>
      </div>

      {/* Right Quick Links */}
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
    </footer>
  );
};
