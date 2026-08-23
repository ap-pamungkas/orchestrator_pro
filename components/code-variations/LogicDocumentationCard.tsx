import React from 'react';
import { KitComponent, CodeVariation, ArchitectureState } from '@/types';
import { CODE_VARIATIONS } from '@/data/codeVariations';
import { FileCodeIcon, AlertTriangleIcon } from '../icons/Icons';

interface LogicDocumentationCardProps {
  architecture: ArchitectureState;
  selectedComponent: KitComponent | null;
  selectedVariation: CodeVariation | null;
}

export const LogicDocumentationCard: React.FC<LogicDocumentationCardProps> = ({
  architecture,
  selectedComponent,
  selectedVariation,
}) => {
  const hasInput = architecture.inputs.some(Boolean);
  const hasBoard = architecture.boards.some(Boolean);
  const hasOutput = architecture.outputs.some(Boolean);
  const isArchitectureComplete = hasInput && hasBoard && hasOutput;

  const availableVariations = selectedComponent
    ? CODE_VARIATIONS.filter((v) => v.componentId === selectedComponent.id)
    : [];

  const currentVariation =
    selectedVariation && selectedVariation.componentId === selectedComponent?.id
      ? selectedVariation
      : availableVariations[0] || null;

  return (
    <div className="w-[300px] lg:w-[320px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden select-none">
      {/* Card Header */}
      <div className="p-3 bg-zinc-50/70 border-b border-zinc-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCodeIcon className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-[11px] tracking-wider text-zinc-800 uppercase">
            Logic & Documentation
          </h2>
        </div>
      </div>

      {/* Card Body */}
      {!isArchitectureComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 min-h-[380px] bg-zinc-50/40">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-2.5">
            <FileCodeIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-700 mb-1">
            Pipeline Pending
          </p>
          <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed">
            Logic and pinout documentation will generate once Input, Board, and Output layers are connected.
          </p>
        </div>
      ) : !selectedComponent || !currentVariation ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 min-h-[380px]">
          <p className="text-xs font-semibold text-zinc-700 mb-1">
            No Logic Selected
          </p>
          <p className="text-[11px] text-zinc-500 max-w-[180px] leading-relaxed">
            Select a variation to read execution logic and pin documentation.
          </p>
        </div>
      ) : (
        <div className="p-4 flex-1 flex flex-col gap-3.5 overflow-y-auto custom-scrollbar text-xs">
          {/* 1. SETUP */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block mb-1">
              Setup
            </span>
            <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/80 font-mono text-[10.5px] text-zinc-700 leading-snug">
              {currentVariation.setupSummary}
            </div>
          </div>

          {/* 2. LOGIC */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block mb-1">
              Logic
            </span>
            <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
              <span className="font-bold text-xs text-blue-950 block mb-0.5">
                {currentVariation.title}
              </span>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                {currentVariation.logicSummary}
              </p>
            </div>
          </div>

          {/* 3. CODE EXPLANATION */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase block mb-1.5">
              Code Explanation
            </span>
            <div className="space-y-2">
              {currentVariation.codeExplanation.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-blue-600 font-mono font-bold text-[10.5px]">
                      {item.symbol}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
