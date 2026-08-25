import React, { useState } from 'react';
import Image from 'next/image';
import { KitComponent, CodeVariation } from '@/types';
import { CODE_VARIATIONS } from '@/data/codeVariations';
import {
  CodeIcon,
  FileCodeIcon,
  CheckIcon,
  TerminalIcon,
  CpuIcon
} from '../icons/Icons';

interface CodeVariationPanelProps {
  selectedComponent: KitComponent | null;
  selectedVariation: CodeVariation | null;
  onSelectVariation: (variation: CodeVariation) => void;
}

export const CodeVariationPanel: React.FC<CodeVariationPanelProps> = ({
  selectedComponent,
  selectedVariation,
  onSelectVariation,
}) => {
  const [activeTab, setActiveTab] = useState<'logic' | 'code'>('logic');

  // Filter variations for the currently selected component
  const availableVariations = selectedComponent
    ? CODE_VARIATIONS.filter((v) => v.componentId === selectedComponent.id)
    : [];

  const currentVariation = selectedVariation && selectedVariation.componentId === selectedComponent?.id
    ? selectedVariation
    : availableVariations[0] || null;

  return (
    <aside className="w-[380px] flex-shrink-0 bg-white border-l border-zinc-200 flex flex-col h-full select-none">
      {/* Panel Top Header */}
      <div className="p-3 border-b border-zinc-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CodeIcon className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-xs tracking-wider text-zinc-800 uppercase">
            Code Variations & Docs
          </h2>
        </div>
        {selectedComponent && (
          <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80 font-medium">
            {availableVariations.length} Variations
          </span>
        )}
      </div>

      {/* BODY CONTENT */}
      {!selectedComponent ? (
        /* EMPTY STATE (No Component Selected) */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 bg-zinc-50/50">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3">
            <CodeIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xs text-zinc-700 mb-1">
            No Component Selected
          </h3>
          <p className="text-[11px] text-zinc-500 max-w-[240px] leading-relaxed">
            Select a placed component in the architecture canvas (e.g., <strong>Tactile Button</strong> or <strong>LED</strong>) to view available code variations.
          </p>
        </div>
      ) : (
        /* ACTIVE SELECTED COMPONENT PANEL */
        <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">

          {/* Selected Component Header Card */}
          <div className="p-3.5 bg-gradient-to-b from-blue-50/50 to-white border-b border-zinc-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-blue-200/80 p-1 flex items-center justify-center shadow-xs flex-shrink-0">
                {selectedComponent.image ? (
                  <Image
                    src={selectedComponent.image}
                    alt={selectedComponent.name}
                    width={42}
                    height={42}
                    className="object-contain max-h-10 max-w-10 drop-shadow-xs"
                  />
                ) : (
                  <CpuIcon className="w-6 h-6 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-1.5 py-0.2 rounded">
                    {selectedComponent.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {selectedComponent.pinInfo}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 truncate">
                  {selectedComponent.name}
                </h3>
                <p className="text-[11px] text-zinc-500 truncate">
                  {selectedComponent.type}
                </p>
              </div>
            </div>
          </div>

          {/* VARIATIONS LIST SECTION */}
          <div className="p-3 border-b border-zinc-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                Learning Variations ({availableVariations.length})
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Click to switch code
              </span>
            </div>

            {availableVariations.length === 0 ? (
              <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-center text-xs text-zinc-500">
                No code variations mapped for this component yet.
              </div>
            ) : (
              <div className="space-y-1.5">
                {availableVariations.map((variation, index) => {
                  const isVarSelected = currentVariation?.id === variation.id;

                  return (
                    <button
                      key={variation.id}
                      onClick={() => onSelectVariation(variation)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2 ${isVarSelected
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-100'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">
                            {String(index + 1).padStart(2, '0')}.
                          </span>
                          <span className={`font-semibold text-xs truncate ${isVarSelected ? 'text-blue-900' : 'text-zinc-800'}`}>
                            {variation.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${variation.difficulty === 'Beginner'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : variation.difficulty === 'Intermediate'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                          >
                            {variation.difficulty}
                          </span>

                          <span className="text-[9px] text-zinc-400 font-mono">
                            {variation.inputCount} In ➔ {variation.outputCount} Out
                          </span>
                        </div>
                      </div>

                      {isVarSelected && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DETAIL TABS: LOGIC & DOCUMENTATION / SOURCE CODE */}
          {currentVariation && (
            <div className="p-3 flex-1 flex flex-col bg-zinc-50/50">
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 bg-zinc-200/70 p-0.5 rounded-lg mb-3">
                <button
                  onClick={() => setActiveTab('logic')}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'logic'
                      ? 'bg-white text-zinc-800 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                >
                  <FileCodeIcon className="w-3.5 h-3.5" />
                  Logic & Specs
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'code'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  C++ Source
                </button>
              </div>

              {/* TAB CONTENT: LOGIC */}
              {activeTab === 'logic' && (
                <div className="space-y-3 text-xs">
                  {/* System Pipeline Setup */}
                  <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      System Setup Pipeline
                    </span>
                    <p className="font-mono text-[11px] text-zinc-700 leading-snug">
                      {currentVariation.setupSummary}
                    </p>
                  </div>

                  {/* Logic Summary */}
                  <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Execution Logic ({currentVariation.command})
                    </span>
                    <p className="text-zinc-600 text-[11px] leading-relaxed">
                      {currentVariation.logicSummary}
                    </p>
                  </div>

                  {/* Code Explanation Symbols */}
                  <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Key API & Commands
                    </span>
                    <div className="space-y-2">
                      {currentVariation.codeExplanation.map((item, idx) => (
                        <div key={idx} className="border-l-2 border-blue-400 pl-2">
                          <code className="font-mono text-[10.5px] font-semibold text-blue-700 bg-blue-50/60 px-1 py-0.5 rounded">
                            {item.symbol}
                          </code>
                          <p className="text-[10.5px] text-zinc-500 mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SOURCE CODE */}
              {activeTab === 'code' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-zinc-400">
                      sketch.ino (ESP32 Arduino Sketch)
                    </span>
                  </div>
                  <pre className="flex-1 bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800 custom-scrollbar">
                    <code>{currentVariation.sourceCode}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
