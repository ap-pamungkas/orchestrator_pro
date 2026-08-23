import React, { useState, useEffect } from 'react';
import { CodeVariation, DifficultyLevel } from '@/types';
import { XIcon, Edit3Icon, CheckIcon } from '../icons/Icons';

interface EditCaseModalProps {
  isOpen: boolean;
  variation: CodeVariation | null;
  onClose: () => void;
  onUpdateCase: (updatedVariation: CodeVariation) => void;
}

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  variation,
  onClose,
  onUpdateCase,
}) => {
  const [title, setTitle] = useState('');
  const [command, setCommand] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [description, setDescription] = useState('');
  const [logicSummary, setLogicSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && variation) {
      setTitle(variation.title);
      setCommand(variation.command);
      setDifficulty(variation.difficulty);
      setDescription(variation.description);
      setLogicSummary(variation.logicSummary || '');
      setError(null);
    }
  }, [isOpen, variation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !variation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Case title is required.');
      return;
    }

    const updated: CodeVariation = {
      ...variation,
      title: title.trim(),
      command: command.trim() || variation.command,
      difficulty,
      description: description.trim() || variation.description,
      logicSummary: logicSummary.trim() || variation.logicSummary,
    };

    onUpdateCase(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Edit3Icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 leading-tight">
                Edit Code Case / Scenario
              </h2>
              <p className="text-[11px] text-zinc-500">
                Rename and modify the specifications of this code variation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title & Command */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">
                Case Title *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Button Hold 3s ➔ Rapid Alarm"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Command / Tag
              </label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g. HOLD_TIMER"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Difficulty Level Tabs */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5 uppercase text-[10px] tracking-wider font-mono">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'Beginner' },
                  { id: 'Intermediate' },
                  { id: 'Advanced' },
                ] as const
              ).map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? lvl.id === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-100'
                          : lvl.id === 'Intermediate'
                          ? 'bg-amber-50 text-amber-800 border-amber-400 ring-2 ring-amber-100'
                          : 'bg-purple-50 text-purple-800 border-purple-400 ring-2 ring-purple-100'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {lvl.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of this code case..."
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Logic Summary */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Logic & Execution Summary
            </label>
            <textarea
              rows={2}
              value={logicSummary}
              onChange={(e) => setLogicSummary(e.target.value)}
              placeholder="Technical logic explanation..."
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
